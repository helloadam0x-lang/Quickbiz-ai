#!/usr/bin/env python3
"""Tracked eyewear: fits a product photo of glasses onto the face on every frame.

The frame front is placed as a 3D plane on the nose bridge, sized to the temples and turned with
the head (orthographic projection of MediaPipe's 3D landmarks), arms run back toward the ears,
hair and hands occlude it, and it casts a soft contact shadow on the face.
"""
import cv2
import numpy as np

# MediaPipe face-mesh indices (subject's right side appears on the image left).
R_EYE = [33, 133, 159, 145]
L_EYE = [362, 263, 386, 374]
R_TEMPLE, L_TEMPLE = 127, 356
R_EAR, L_EAR = 234, 454
BRIDGE = 168
BROW = [105, 334]
CHIN, FOREHEAD = 152, 10


def cutout(product_bgr_or_bgra):
    """Alpha for a product photo: keep a real alpha channel, else key out the (near-white) background."""
    img = product_bgr_or_bgra
    if img.ndim == 3 and img.shape[2] == 4 and img[..., 3].min() < 250:
        return img[..., :3].copy(), img[..., 3].astype(np.float32) / 255
    bgr = img[..., :3]
    border = np.concatenate([bgr[:4].reshape(-1, 3), bgr[-4:].reshape(-1, 3), bgr[:, :4].reshape(-1, 3), bgr[:, -4:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    d = np.linalg.norm(bgr.astype(np.float32) - bg, axis=2)
    a = np.clip((d - 10) / 40, 0, 1)
    # Drop specks, keep thin frame strokes.
    n, lab, stats, _ = cv2.connectedComponentsWithStats((a > 0.3).astype(np.uint8))
    keep = np.zeros(n, bool)
    keep[1:] = stats[1:, cv2.CC_STAT_AREA] > 0.002 * a.size
    a = a * keep[lab]
    return bgr.copy(), a


def prepare(product_img, tinted=None):
    """Crop to the frame, split frame vs lens, estimate the frame colour."""
    bgr, a = cutout(product_img)
    ys, xs = np.where(a > 0.2)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    bgr, a = bgr[y0:y1, x0:x1], a[y0:y1, x0:x1]
    solid = (a > 0.5).astype(np.uint8)
    h, w = solid.shape
    # Enclosed region of the glasses (frame + whatever sits inside the rims).
    inv = np.pad(1 - solid, 1, constant_values=1)
    cv2.floodFill(inv, np.zeros((h + 4, w + 4), np.uint8), (0, 0), 0)
    holes = inv[1:-1, 1:-1].astype(bool)
    filled = solid.astype(bool) | holes
    # Frame colour from the outer rim band; lens = enclosed pixels that differ from it
    # (clear lenses come out as holes, tinted lenses as a different colour).
    k = max(3, int(h * 0.04))
    rim = filled & ~cv2.erode(filled.astype(np.uint8), np.ones((k, k), np.uint8)).astype(bool)
    frame_col = np.median(bgr[rim], axis=0) if rim.any() else np.array([30, 30, 30])
    inner = cv2.erode(filled.astype(np.uint8), np.ones((k, k), np.uint8)).astype(bool)
    diff = np.linalg.norm(bgr.astype(np.float32) - frame_col, axis=2) > 28
    lens = holes | (inner & diff)
    lens = cv2.morphologyEx(lens.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)).astype(bool)
    lens_col = np.median(bgr[lens], axis=0) if lens.any() else frame_col
    if tinted is None:  # auto: lens pixels that are not background-white mean tinted lenses
        tinted = bool(lens.any() and (lens & ~holes).sum() > 0.5 * lens.sum() and lens_col.mean() < 200)
    frame_a = np.where(lens, 0.0, np.maximum(a, filled & ~lens))
    lens_a = np.where(lens, 0.82 if tinted else 0.03, 0.0).astype(np.float32)
    return {"bgr": bgr.astype(np.float32), "frame_a": frame_a.astype(np.float32), "lens_a": lens_a, "lens_col": lens_col.astype(np.float32), "frame_col": frame_col.astype(np.float32), "tinted": bool(tinted)}


def _unit(v):
    return v / (np.linalg.norm(v) + 1e-9)


def pose(lm):
    """Glasses plane on the face: origin, x/y axes (3D, pixel units), normal, frame width."""
    eye_r = lm[R_EYE].mean(0)
    eye_l = lm[L_EYE].mean(0)
    mid = (eye_r + eye_l) / 2
    x = _unit(eye_l - eye_r)
    up = _unit(lm[FOREHEAD] - lm[CHIN])
    y = _unit(-(up - np.dot(up, x) * x))  # image-down direction
    n = _unit(np.cross(x, y))
    if n[2] > 0:  # MediaPipe z is negative toward the camera
        n = -n
    width = np.linalg.norm(lm[L_TEMPLE] - lm[R_TEMPLE]) * 0.95
    bridge_depth = np.dot(lm[BRIDGE] - mid, n)
    origin = mid + n * max(bridge_depth, 0) + n * width * 0.03
    return origin, x, y, n, width


def render(img, lm, labels, g, lens_center_y=0.48):
    """Composite the glasses onto one BGR frame. labels: multiclass mask at frame resolution."""
    h, w = img.shape[:2]
    origin, x, y, n, width = pose(lm)
    gh, gw = g["frame_a"].shape
    height = width * gh / gw
    # Product-photo corners -> 3D -> image (orthographic; landmarks already in pixels).
    top = -lens_center_y * height
    corners3 = [origin - x * width / 2 + y * top, origin + x * width / 2 + y * top, origin + x * width / 2 + y * (top + height), origin - x * width / 2 + y * (top + height)]
    dst = np.float32([[c[0], c[1]] for c in corners3])
    src = np.float32([[0, 0], [gw, 0], [gw, gh], [0, gh]])
    H = cv2.getPerspectiveTransform(src, dst)
    warp = lambda m, interp=cv2.INTER_LINEAR: cv2.warpPerspective(m, H, (w, h), flags=interp, borderValue=0)
    frame_a = warp(g["frame_a"])
    lens_a = warp(g["lens_a"])
    col = warp(g["bgr"])

    hair = labels == 1
    body = labels == 2
    face = labels == 3
    # Hands in front of the face occlude the glasses.
    face_box = cv2.dilate(face.astype(np.uint8), np.ones((25, 25), np.uint8)).astype(bool)
    occ = (body & face_box & ~face).astype(np.float32)
    occ = cv2.GaussianBlur(occ, (0, 0), 2)

    # Arms: hinge (frame's outer top corners) back toward the ears.
    arms = np.zeros((h, w), np.float32)
    thick = max(2, int(height * 0.07))
    yaw = x[2]  # >0: subject's left side (image right) is farther away
    arm_len = width * 0.95
    for side, hinge3 in ((-1, corners3[0] + y * height * 0.3), (1, corners3[1] + y * height * 0.3)):
        far = (side > 0 and yaw > 0.05) or (side < 0 and yaw < -0.05)
        # The arm runs straight back from the hinge (and dips slightly toward the ear); its projection
        # is short when facing the camera and sweeps out when the head turns.
        end3 = hinge3 - n * arm_len + y * height * 0.25
        layer = np.zeros((h, w), np.float32)
        cv2.line(layer, (int(hinge3[0]), int(hinge3[1])), (int(end3[0]), int(end3[1])), 1.0, thick, cv2.LINE_AA)
        if far:
            layer *= ~face  # behind the head on the far side
        arms = np.maximum(arms, layer)
    arms *= ~hair  # hair falls over the arms

    a_frame = np.clip(np.maximum(frame_a, arms * 0.95) * (1 - occ), 0, 1)
    a_lens = lens_a * (1 - occ)

    # Light the product like the scene: scale by local luminance around the eyes.
    lum = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    local = cv2.GaussianBlur(lum, (0, 0), max(3, width * 0.08)) / 128.0
    shade = np.clip(local, 0.45, 1.35)[..., None]
    frame_rgb = np.where(arms[..., None] > frame_a[..., None], g["frame_col"], col) * shade
    out = img.astype(np.float32)

    # Contact shadow on the face, offset down (overhead light).
    sh = cv2.GaussianBlur(a_frame, (0, 0), max(1.5, width * 0.012))
    M = np.float32([[1, 0, 0], [0, 1, max(1, height * 0.06)]])
    sh = cv2.warpAffine(sh, M, (w, h)) * face
    out *= (1 - 0.32 * sh)[..., None]

    lens_rgb = g["lens_col"] * shade if g["tinted"] else np.full_like(out, 255.0)
    out = out * (1 - a_lens[..., None]) + lens_rgb * a_lens[..., None]
    if not g["tinted"]:  # a faint diagonal reflection sells clear lenses
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        streak = np.clip(1 - np.abs(((xx - origin[0]) + (yy - origin[1]) * 0.7) / (width * 0.12)), 0, 1)
        out += (warp((g["lens_a"] > 0).astype(np.float32)) * streak * 9)[..., None] * (1 - occ)[..., None]
    out = out * (1 - a_frame[..., None]) + frame_rgb * a_frame[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)
