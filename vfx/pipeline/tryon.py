#!/usr/bin/env python3
"""Outfit swap on CPU: the original tee and jeans are replaced by reference garments, frame by frame.

  python3 tryon.py job.json

The new shirt is built from the reference (fabric colour, chest graphics, sleeve number, collar)
fitted to the tracked torso; folds and lighting come from the original garment with its print
removed, so nothing of the old shirt shows. Trousers are re-dyed keeping their folds and texture.
Face, hair, skin and background pixels are never touched. Output is the native-resolution edit
(audio copied untouched); enhance.py upscales it.
"""
import json
import os
import subprocess
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import analyze  # noqa: E402

FF = analyze.FF


def lin(x):
    return np.power(np.clip(x, 0, 255) / 255.0, 2.2)


def srgb(x):
    return np.power(np.clip(x, 0, 1), 1 / 2.2) * 255.0


def lab(img):
    return cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)


def median_color(img, box):
    x0, y0, x1, y1 = box
    return np.median(img[y0:y1, x0:x1].reshape(-1, 3), axis=0).astype(np.float32)


def rgba_from(img, box, base, lo=14, hi=34, exclude=None):
    """Cut graphics out of a garment photo: pixels that differ from the fabric colour."""
    x0, y0, x1, y1 = box
    crop = img[y0:y1, x0:x1].astype(np.float32)
    d = np.linalg.norm(lab(crop.astype(np.uint8)) - lab(np.uint8(base[None, None])), axis=2)
    a = np.clip((d - lo) / (hi - lo), 0, 1)
    if exclude is not None:
        for ex in exclude:
            ex0, ey0, ex1, ey1 = ex
            a[max(0, ey0 - y0):max(0, ey1 - y0), max(0, ex0 - x0):max(0, ex1 - x0)] = 0
    a = cv2.GaussianBlur(a, (0, 0), 0.6)
    return crop, a.astype(np.float32)


def garment_alpha(img, box, base, tol=26, exclude=None):
    """Alpha of a garment part (e.g. the collar) against the photo background: pixels near the fabric colour."""
    x0, y0, x1, y1 = box
    crop = img[y0:y1, x0:x1].astype(np.float32)
    d = np.linalg.norm(lab(crop.astype(np.uint8)) - lab(np.uint8(base[None, None])), axis=2)
    a = np.clip((tol * 1.6 - d) / (tol * 0.6), 0, 1)
    a = cv2.morphologyEx(a, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    if exclude is not None:
        for ex in exclude:
            ex0, ey0, ex1, ey1 = ex
            a[max(0, ey0 - y0):max(0, ey1 - y0), max(0, ex0 - x0):max(0, ex1 - x0)] = 0
    return crop, cv2.GaussianBlur(a, (0, 0), 0.8).astype(np.float32)


class Outfit:
    def __init__(self, spec, root):
        img = cv2.imread(os.path.join(root, spec["image"]))
        self.base = median_color(img, spec["base_box"])
        self.pants = median_color(img, spec["pants_box"])
        self.pants_smooth = spec.get("pants_smooth", 0.0)
        self.rect = spec["body"]  # [xL, xR, y_shoulder, y_hem] in the photo
        reg = fabric_region(img, self.base)
        cut = lambda box: reg[box[1]:box[3], box[0]:box[2]]
        self.decals = []
        for d in spec.get("decals", []):
            crop, a = rgba_from(img, d["box"], self.base, exclude=d.get("exclude"))
            self.decals.append((d["box"], crop, a * cut(d["box"])))
        self.sleeve = None
        if spec.get("sleeve"):
            crop, a = rgba_from(img, spec["sleeve"], self.base)
            self.sleeve = upright_number(crop, a * cut(spec["sleeve"]))
        self.collar = None
        if spec.get("collar"):
            box = spec["collar"]["box"]
            crop, a = garment_alpha(img, box, self.base, exclude=spec["collar"].get("exclude"))
            self.collar = (box, crop, a * feather_rect(*a.shape))


def upright_number(crop, a):
    """Keep the main graphic of a sleeve crop (drops seams and edges) and turn it upright."""
    n, cc, st, _ = cv2.connectedComponentsWithStats((a > 0.5).astype(np.uint8))
    if n < 2:
        return crop, a
    k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    a = a * cv2.dilate((cc == k).astype(np.uint8), np.ones((5, 5), np.uint8))
    pts = np.argwhere(cc == k)[:, ::-1].astype(np.float32)
    (cx, cy), (rw, rh), ang = cv2.minAreaRect(pts)
    best = None
    for cand in (ang, ang - 90, ang + 90, ang - 180):  # smallest turn that leaves the graphic taller than wide
        r = cv2.transform(pts[None], cv2.getRotationMatrix2D((cx, cy), cand, 1.0))[0]
        bw, bh = np.ptp(r[:, 0]), np.ptp(r[:, 1])
        if bh >= bw and (best is None or abs(cand) < abs(best)):
            best = cand
    ang = 0.0 if best is None else best
    M = cv2.getRotationMatrix2D((cx, cy), ang, 1.0)
    side = int(max(rw, rh) * 1.25) + 4
    M[:, 2] += (side / 2 - cx, side / 2 - cy)
    crop = cv2.warpAffine(crop, M, (side, side), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    a = cv2.warpAffine(a, M, (side, side), flags=cv2.INTER_LINEAR)
    return crop, a


def torso_quad(p):
    """Shirt body quad on the person (image-left shoulder, image-right shoulder, right hem, left hem)."""
    sh = sorted([p[11][:2], p[12][:2]], key=lambda q: q[0])
    hp = sorted([p[23][:2], p[24][:2]], key=lambda q: q[0])
    A, B = np.float32(sh[0]), np.float32(sh[1])
    D, C = np.float32(hp[0]), np.float32(hp[1])
    sw = np.linalg.norm(B - A)
    across = (B - A) / (sw + 1e-6)
    A, B = A - across * sw * 0.07, B + across * sw * 0.07
    down = (D + C) / 2 - (A + B) / 2
    tl = np.linalg.norm(down)
    mid_h = (D + C) / 2 + down / (tl + 1e-6) * tl * 0.12
    hw = np.linalg.norm(B - A) * 0.5
    D2, C2 = mid_h - across * hw, mid_h + across * hw
    return np.float32([A, B, C2, D2]), sw, tl


def fabric_region(img, base, tol=30):
    """Silhouette of the garment in a product photo: fabric-coloured pixels, closed, holes filled, edge trimmed."""
    d = np.linalg.norm(lab(img) - lab(np.uint8(base[None, None])), axis=2)
    reg = cv2.morphologyEx((d < tol).astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    inv = (1 - reg).astype(np.uint8)
    cv2.floodFill(inv, np.zeros((reg.shape[0] + 2, reg.shape[1] + 2), np.uint8), (0, 0), 0)
    reg = reg | inv
    return cv2.erode(reg, np.ones((5, 5), np.uint8)).astype(np.float32)


def feather_rect(h, w, f=0.18):
    """1 inside, ramping to 0 at the borders of a crop (hides the crop's rectangle)."""
    y = np.minimum(np.arange(h), np.arange(h)[::-1]) / max(1, h * f)
    x = np.minimum(np.arange(w), np.arange(w)[::-1]) / max(1, w * f)
    return np.clip(np.minimum(y[:, None], x[None, :]), 0, 1).astype(np.float32)


def norm_blur(x, m, sigma):
    """Gaussian blur of x using only pixels where m (H, W) is set (fills holes from the surroundings)."""
    m = m.astype(np.float32)
    den = cv2.GaussianBlur(m, (0, 0), sigma)
    mm, dd = (m[..., None], den[..., None]) if x.ndim == 3 else (m, den)
    return cv2.GaussianBlur(x * mm, (0, 0), sigma) / np.maximum(dd, 1e-4), den


def hem_line(Lb, clothes, x0, x1, y0, y1, thr, run):
    """Per-column top of the trousers below the tee: first run of `run` denim rows (brighter than the tee, not skin-warm)."""
    y0, y1 = int(max(0, y0)), int(min(Lb.shape[0], y1))
    if y1 - y0 < run + 2 or x1 - x0 < 10:
        return None
    sub = Lb[y0:y1, x0:x1]
    jb = ((sub[..., 0] > thr) & (sub[..., 1] < 132) & (sub[..., 2] < 135) & clothes[y0:y1, x0:x1]).astype(np.float32)
    acc = cv2.filter2D(jb, -1, np.ones((run, 1), np.float32), anchor=(0, 0), borderType=cv2.BORDER_CONSTANT)
    hit = acc >= run * 0.8
    has = hit.any(0) & clothes[y0:y1, x0:x1].any(0)
    if has.sum() < 0.25 * (x1 - x0):
        return None
    xs = np.arange(x0, x1)[has].astype(np.float32)
    ys = (np.argmax(hit, 0)[has] + y0).astype(np.float32)
    keep = np.ones(len(xs), bool)
    for _ in range(3):  # robust line fit
        b, a = np.polyfit(xs[keep], ys[keep], 1)
        r = np.abs(ys - (a + b * xs))
        keep = r < max(3.0, 2.5 * np.median(r[keep]))
        if keep.sum() < 8:
            return None
    # Sit the new hem on the lower edge of the tee so none of it is left under the trousers.
    a += max(0.0, float(np.percentile((ys - (a + b * xs))[keep], 85)))
    return a, b


def run(job_path):
    job = json.load(open(job_path))
    root = os.path.dirname(os.path.abspath(job_path))
    work = job["work"]
    meta = json.load(open(os.path.join(work, "meta.json")))
    W, H, fps = meta["width"], meta["height"], meta["fps"] or 30
    d = np.load(os.path.join(work, "body.npz"))
    P, LBL, CONF = d["pose_s"], d["labels"], d["clothes_conf"]
    outfits = [Outfit(s, root) for s in job["outfits"]]
    plan = job["plan"]  # [[start_frame, outfit_index], ...]
    preview = set(job.get("preview", []))

    enc = None
    if not preview:
        enc = subprocess.Popen(
            [FF, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-", "-i", job["source"],
             "-map", "0:v", "-map", "1:a?", "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p", "-c:a", "copy", "-map_metadata", "1", job["out"]],
            stdin=subprocess.PIPE,
        )
    prev_shirt = None
    prev_img = None
    tee_lab = jeans_lab = None
    hem = None
    hem_age = 0
    wb = None
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    for i, img in enumerate(analyze.frames(job["source"])):
        if preview and i > max(preview):
            break
        oi = [o for s, o in plan if i >= s][-1]
        of = outfits[oi]
        p = P[i]
        labels = LBL[i]
        conf = CONF[i].astype(np.float32) / 255
        clothes = (labels == 4)
        Lb = lab(img)
        quad, sw, tl = torso_quad(p)
        sh_y = (p[11][1] + p[12][1]) / 2
        hip_y = (p[23][1] + p[24][1]) / 2
        hip_x = (p[23][0] + p[24][0]) / 2

        # --- tee vs jeans colour models (robust medians, carried across frames)
        x0, x1 = int(max(0, quad[:, 0].min())), int(min(W, quad[:, 0].max()))
        band = np.zeros((H, W), bool)
        band[int(max(0, sh_y + 0.15 * tl)):int(max(0, hip_y - 0.1 * tl)), x0:x1] = True
        sel = clothes & band
        if sel.sum() > 300:
            m = np.median(Lb[sel], axis=0)
            tee_lab = m if tee_lab is None else 0.8 * tee_lab + 0.2 * m
        sel = clothes & (yy > hip_y + 0.2 * tl)
        if sel.sum() > 300:
            m = np.median(Lb[sel], axis=0)
            if m[0] > tee_lab[0] + 25:
                jeans_lab = m if jeans_lab is None else 0.8 * jeans_lab + 0.2 * m
        # Colour distance to the tee that mostly ignores lightness (shadows are not print).
        d_tee = np.sqrt(((Lb[..., 0] - tee_lab[0]) * 0.35) ** 2 + (Lb[..., 1] - tee_lab[1]) ** 2 + (Lb[..., 2] - tee_lab[2]) ** 2)

        # --- skin the segmenter called clothes (hands over the shirt, arms at the frame edge): keep it.
        # Skin-coloured clothes pixels joined to real skin, outside the area of the old shirt print.
        u0, v0, u1, v1 = job.get("print_uv", [0.0, 0.03, 1.0, 0.58])  # old print area in torso coordinates
        pq = cv2.perspectiveTransform(np.float32([[[u0, v0], [u1, v0], [u1, v1], [u0, v1]]]), cv2.getPerspectiveTransform(np.float32([[0, 0], [1, 0], [1, 1], [0, 1]]), quad))[0]
        pbox = np.zeros((H, W), np.uint8)
        cv2.fillConvexPoly(pbox, pq.astype(np.int32), 1)
        # And the reverse: around hands on the chest the segmenter calls bits of the old print/tee "skin".
        face = labels == 3
        if face.sum() > 200:
            sk = np.median(Lb[face], axis=0)
            d_sk = np.sqrt(((Lb[..., 0] - sk[0]) * 0.35) ** 2 + (Lb[..., 1] - sk[1]) ** 2 + (Lb[..., 2] - sk[2]) ** 2)
            torso = np.zeros((H, W), np.uint8)
            cv2.fillConvexPoly(torso, quad.astype(np.int32), 1)
            notskin = (labels == 2) & (torso > 0) & (d_sk > 28)
            notskin = cv2.morphologyEx(notskin.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)).astype(bool)
            clothes = clothes | notskin | ((labels == 5) & (torso > 0))  # "other" on the chest = print bits
        skinish = clothes & (Lb[..., 0] > tee_lab[0] + 18) & (Lb[..., 1] > 134) & (Lb[..., 2] > 133) & (pbox == 0)
        if skinish.any():
            n, cc = cv2.connectedComponents(skinish.astype(np.uint8))
            touch = np.unique(cc[cv2.dilate((labels == 2).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool) & skinish])
            guard = np.isin(cc, touch[touch > 0])
            guard = cv2.morphologyEx(guard.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)).astype(bool)
            clothes = clothes & ~guard

        k3 = np.ones((3, 3), np.uint8)
        # --- where the tee ends: a hem line found from the bright denim below the dark tee
        thr = (tee_lab[0] + jeans_lab[0]) / 2 if jeans_lab is not None else tee_lab[0] + 45
        h = hem_line(Lb, clothes, x0, x1, hip_y - 0.45 * tl, hip_y + 0.6 * tl, thr, max(4, int(0.05 * tl)))
        if h is not None:
            a, b = h
            # The hem runs roughly parallel to the hips.
            hs = (p[24][1] - p[23][1]) / (p[24][0] - p[23][0] + 1e-6)
            bc = float(np.clip(b, hs - 0.08, hs + 0.08))
            a, b = a + (b - bc) * hip_x, bc
            rel = np.float32([a + b * hip_x - hip_y, b])  # hem relative to the hips: follows the body between fits
            hem = rel if hem is None or plan_switch(plan, i) else 0.5 * hem + 0.5 * rel
            hem_age = 0
        elif hem is not None and hem_age < 12 and hip_y < H:
            hem_age += 1  # brief miss (hands, blur): keep the last hem, it rides on the hips
        else:
            hem = None
        if hem is not None:
            hem_y = hip_y + hem[0] + hem[1] * (xx - hip_x) + 2
            # Denim the segmenter called background (the fly, dark folds): enclosed, below the hem, denim-coloured.
            if jeans_lab is not None:
                d_jean = np.sqrt(((Lb[..., 0] - jeans_lab[0]) * 0.35) ** 2 + (Lb[..., 1] - jeans_lab[1]) ** 2 + (Lb[..., 2] - jeans_lab[2]) ** 2)
                cand = (labels == 0) & (yy >= hem_y) & (xx >= x0) & (xx < x1) & (d_jean < 18)
                cand = cv2.morphologyEx(cand.astype(np.uint8), cv2.MORPH_OPEN, k3)
                n, cc, st, _ = cv2.connectedComponentsWithStats(cand)
                big = np.zeros(n, bool)
                big[1:] = st[1:, cv2.CC_STAT_AREA] >= 30
                clothes = clothes | big[cc]
            pants = clothes & (yy >= hem_y)
        else:
            pants = np.zeros((H, W), bool)
        shirt = clothes & ~pants

        # --- one soft, edge-aware alpha for all clothing (solid inside), split into shirt / trousers
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
        k3 = np.ones((3, 3), np.uint8)
        garment = (shirt | pants).astype(np.uint8)
        # Colour guide: dark skin and the dark tee have the same brightness but not the same colour.
        guide = img.astype(np.float32) / 255
        a_all = cv2.ximgproc.guidedFilter(guide, (cv2.dilate(garment, k3) * np.maximum(conf, 0.6)).astype(np.float32), 3, 2e-3)
        a_all *= cv2.dilate(garment, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))  # at most 2 px past the mask
        if job.get("temporal", 0) and prev_shirt is not None and not plan_switch(plan, i):
            still = (np.abs(gray - prev_img) < 0.04).astype(np.float32)
            a_all = a_all * (1 - 0.35 * still) + prev_shirt * 0.35 * still
        a_all = np.clip(a_all, 0, 1)
        prev_shirt, prev_img = a_all.copy(), gray
        a_all = np.maximum(a_all, cv2.erode(garment, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))).astype(np.float32))
        # Never touch face or hair, nor skin away from the garment edge.
        keep = cv2.GaussianBlur(((labels == 1) | (labels == 3)).astype(np.float32), (0, 0), 1.0)
        a_all *= 1 - keep
        a_all *= 1 - cv2.erode(((labels == 2) & ~clothes).astype(np.uint8), k3)
        ws = cv2.GaussianBlur(shirt.astype(np.float32), (0, 0), 1.2)
        wp = cv2.GaussianBlur(pants.astype(np.float32), (0, 0), 1.2)
        w_s = np.where(ws + wp > 1e-3, ws / (ws + wp + 1e-6), 1.0 if not pants.any() else (yy < (hem_y if hem is not None else H)).astype(np.float32))
        ms = a_all * w_s
        mp_ = a_all * (1 - w_s)

        # --- scene light: white balance and exposure from the brightest background
        bg = labels == 0
        if bg.sum() > 1000:
            lum = gray[bg]
            thr_w = np.percentile(lum, 92)
            white = img[bg][lum >= thr_w].reshape(-1, 3).astype(np.float32).mean(0)
            w_now = lin(white)
            wb = w_now if wb is None else 0.9 * wb + 0.1 * w_now
        light = wb / lin(np.float32([238]))[0] * job.get("exposure", 1.0)

        I = lin(img.astype(np.float32))

        # --- shading from the original tee: large-scale light + gentle folds, print removed
        hard = shirt & (ms > 0.5)
        if hard.sum() > 200:
            print_m = (hard & (d_tee > 16)).astype(np.uint8)
            print_m = cv2.dilate(print_m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
            clean = (hard & (print_m == 0)).astype(np.float32)
            # Ratios are taken on display values: a black tee's linear contrast is mostly noise and black level.
            g = cv2.bilateralFilter(gray, 7, 0.08, 3)
            lg = np.log(g + 0.03)
            low, den = norm_blur(lg, clean, max(3.0, 0.07 * sw))
            fine, _ = norm_blur(lg, clean, max(1.0, 0.012 * sw))
            ref = np.median(low[hard])
            sure = np.clip(den * 3, 0, 1)  # far from any clean tee pixel: flat
            pf = cv2.GaussianBlur(print_m.astype(np.float32), (0, 0), 3)
            detail = np.clip(fine - low, -0.3, 0.3) * (1 - pf) * sure
            S = np.exp(np.clip((low - ref) * job.get("shade_low", 0.6) * sure + detail * job.get("shade_detail", 0.8), -0.45, 0.3))
        else:
            S = np.ones((H, W), np.float32)

        # --- shirt texture: fabric colour + graphics fitted to the torso
        xL, xR, ysh, yhem = of.rect
        Hm = cv2.getPerspectiveTransform(np.float32([[xL, ysh], [xR, ysh], [xR, yhem], [xL, yhem]]), quad)
        tex = np.empty((H, W, 3), np.float32)
        tex[:] = lin(of.base)
        for (bx0, by0, bx1, by1), crop, a in of.decals:
            T = Hm @ np.float32([[1, 0, bx0], [0, 1, by0], [0, 0, 1]])
            wa = cv2.warpPerspective(a, T, (W, H), flags=cv2.INTER_LINEAR)
            wc = cv2.warpPerspective(lin(crop), T, (W, H), flags=cv2.INTER_LINEAR)
            tex = tex * (1 - wa[..., None]) + wc * wa[..., None]
        if of.sleeve is not None:
            arms = sorted([(p[11][:2], p[13][:2]), (p[12][:2], p[14][:2])], key=lambda q: q[0][0])
            s0, e0 = np.float32(arms[0][0]), np.float32(arms[0][1])
            axis = (e0 - s0) / (np.linalg.norm(e0 - s0) + 1e-6)
            out_n = np.float32([-axis[1], axis[0]])
            if out_n[0] > 0:
                out_n = -out_n
            crop, a = of.sleeve
            ch, cw = a.shape
            wdt = sw * 0.22
            hgt = wdt * ch / cw
            c = s0 + axis * np.linalg.norm(e0 - s0) * 0.38 + out_n * sw * 0.07
            ux, uy = -out_n * wdt / 2, axis * hgt / 2
            dst = np.float32([c - ux - uy, c + ux - uy, c + ux + uy, c - ux + uy])
            T = cv2.getPerspectiveTransform(np.float32([[0, 0], [cw, 0], [cw, ch], [0, ch]]), dst)
            inside = cv2.pointPolygonTest(quad.reshape(-1, 1, 2), (float(c[0]), float(c[1])), True)  # > 0: on the chest
            fade = float(np.clip(1 - (inside + 0.02 * sw) / (0.06 * sw), 0, 1))
            fade *= float(np.clip((axis[1] - 0.45) / 0.2, 0, 1))  # arm lifted: the number turns away, drop it
            wa = cv2.warpPerspective(a, T, (W, H)) * (ms > 0.5) * fade
            wc = cv2.warpPerspective(lin(crop), T, (W, H))
            tex = tex * (1 - wa[..., None]) + wc * wa[..., None]
        F_new = tex * light * S[..., None]

        # --- collar: folded over the neckline, lit like the shirt, never over face or hair
        if of.collar is not None:
            (bx0, by0, bx1, by1), crop, a = of.collar
            T = Hm @ np.float32([[1, 0, bx0], [0, 1, by0], [0, 0, 1]])
            wa = cv2.warpPerspective(a, T, (W, H))
            wc = cv2.warpPerspective(lin(crop), T, (W, H))
            reach = cv2.dilate((ms > 0.5).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(sw * 0.06) | 1,) * 2))
            wa *= reach * (1 - keep)
            wa = cv2.GaussianBlur(wa, (0, 0), 0.7)
            sh = cv2.GaussianBlur(wa, (0, 0), 3)
            sh = cv2.warpAffine(sh, np.float32([[1, 0, 0], [0, 1, 3]]), (W, H)) * (labels == 2)
            I = I * (1 - 0.35 * sh)[..., None]
            Sc = np.exp(np.clip(cv2.GaussianBlur(np.log(S), (0, 0), 3), -0.5, 0.3))
            F_new = F_new * (1 - wa[..., None]) + (wc * light * Sc[..., None]) * wa[..., None]
            w_s = np.maximum(w_s, wa)
            a_all = np.maximum(a_all, wa)

        # --- trousers: re-dye keeping folds and weave
        if mp_.max() > 0.05:
            pm = (mp_ > 0.5)
            Yp = lin(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32))
            medp = np.median(Yp[pm]) if pm.sum() > 100 else 0.3
            Sp = Yp / (medp + 1e-6)
            if of.pants_smooth > 0:
                Sp = cv2.bilateralFilter(Sp.astype(np.float32), 9, 0.3, 6) * of.pants_smooth + Sp * (1 - of.pants_smooth)
            Sp = np.clip(Sp, 0.3, 2.0) ** job.get("pants_gamma", 0.8)
            F_new = F_new * w_s[..., None] + (lin(of.pants) * light * Sp[..., None]) * (1 - w_s[..., None])

        # Replace the garment colour with edge unmixing: out = I + alpha * (F_new - F_old),
        # F_old = the old garment colour (the pixel itself inside, its neighbours' colour on the edge).
        inner = cv2.erode((a_all > 0.95).astype(np.uint8), k3).astype(np.float32)
        F_avg, den = norm_blur(I, inner, 4)
        F_old = np.where((inner > 0)[..., None] | (den < 0.05)[..., None], I, F_avg)  # no interior nearby: plain blend
        out = I + a_all[..., None] * (F_new - F_old)

        # Snap accent: a quick glow on the new outfit for a few frames after each change.
        since = min([i - s for s, _ in plan if s > 0 and i >= s] or [99])
        if job.get("switch_glow", 0.4) > 0 and since < 4:
            g = job.get("switch_glow", 0.4) * (1 - since / 4.0) ** 2
            halo = cv2.GaussianBlur(a_all, (0, 0), max(2.0, 0.04 * sw))
            out = out + (np.maximum(a_all, halo * 0.6) * g)[..., None] * light * 0.6

        res = np.clip(srgb(out), 0, 255).astype(np.uint8)
        if preview:
            if i in preview:
                cv2.imwrite(os.path.join(job.get("preview_dir", "."), f"pv_{i:04d}.png"), res)
                if job.get("debug"):
                    dbg = np.hstack([np.clip(S / 2 * 255, 0, 255), w_s * 255, a_all * 255, pants * 255, pbox * 255, clothes * 255]).astype(np.uint8)
                    cv2.imwrite(os.path.join(job.get("preview_dir", "."), f"dbg_{i:04d}.png"), dbg)
            continue
        enc.stdin.write(res.tobytes())
        if i % 60 == 0:
            print(f"tryon {i}/{meta['frames']} outfit {oi} hem={'yes' if hem is not None else 'no'} light={np.round(light, 3)}", flush=True)
    if enc:
        enc.stdin.close()
        enc.wait()
        print("wrote", job["out"])


def plan_switch(plan, i):
    return any(s == i for s, _ in plan)


if __name__ == "__main__":
    run(sys.argv[1])
