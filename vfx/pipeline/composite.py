#!/usr/bin/env python3
"""Final composite: original video + (optional) AI wardrobe pass + tracked glasses + tracked product.

  python3 composite.py config.json

config.json keys:
  source        original video (its audio is copied untouched)
  work          analysis dir from analyze.py (face.npz, seg.npz, alpha.mkv)
  out           output .mp4
  gen           optional AI-generated video (e.g. Wan Animate character swap) for the wardrobe
  gen_offset    optional source frame index where `gen` starts (default 0)
  glasses       optional product photo of the glasses; glasses_tinted: true/false/null (auto)
  product       optional {"image": png, "track": "hand"|"surface", "box": [x, y, w, h], "frame": k}
  crf           x264 quality (default 15)

Only clothing pixels come from `gen`; the original face, hair and skin are kept pixel-for-pixel.
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
import glasses as G  # noqa: E402

FF = analyze.FF
MODELS = os.path.join(HERE, "..", "models")


def read_video(path):
    return analyze.frames(path)


def gray_frames(path, w, h):
    p = subprocess.Popen([FF, "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "gray", "-"], stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(w * h)
        if len(b) < w * h:
            break
        yield np.frombuffer(b, np.uint8).reshape(h, w)


class Upscaler:
    def __init__(self):
        self.sr = cv2.dnn_superres.DnnSuperResImpl_create()
        self.sr.readModel(os.path.join(MODELS, "ESPCN_x2.pb"))
        self.sr.setModel("espcn", 2)

    def __call__(self, img, w, h):
        up = self.sr.upsample(img)
        up = cv2.resize(up, (w, h), interpolation=cv2.INTER_LANCZOS4)
        blur = cv2.GaussianBlur(up, (0, 0), 1.2)
        return cv2.addWeighted(up, 1.35, blur, -0.35, 0)  # restore crispness lost to the AI pass


def align(gen_up, src, bg_mask):
    """Scale/translate the generated frame onto the source using the background (ECC)."""
    warp = np.eye(2, 3, dtype=np.float32)
    try:
        a = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY).astype(np.float32)
        b = cv2.cvtColor(gen_up, cv2.COLOR_BGR2GRAY).astype(np.float32)
        s = 0.25
        a, b = cv2.resize(a, None, fx=s, fy=s), cv2.resize(b, None, fx=s, fy=s)
        m = cv2.resize(bg_mask.astype(np.uint8), (a.shape[1], a.shape[0]))
        _, warp = cv2.findTransformECC(a, b, warp, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 60, 1e-5), m, 5)
        warp[:, 2] /= s
    except cv2.error:
        pass
    return warp


def noise_level(img):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    hp = g - cv2.GaussianBlur(g, (0, 0), 1.5)
    grad = cv2.Sobel(cv2.GaussianBlur(g, (0, 0), 2), cv2.CV_32F, 1, 1)
    flat = np.abs(grad) < np.percentile(np.abs(grad), 30)
    return float(hp[flat].std()) if flat.any() else 1.0


class ProductTrack:
    """Tracks a stand-in object (or a spot on a surface) and composites the product photo there."""

    def __init__(self, cfg, first_frame):
        img = cv2.imread(cfg["image"], cv2.IMREAD_UNCHANGED)
        self.bgr, self.a = G.cutout(img)
        ys, xs = np.where(self.a > 0.2)
        self.bgr, self.a = self.bgr[ys.min():ys.max() + 1, xs.min():xs.max() + 1], self.a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        x, y, w, h = cfg["box"]
        self.box = np.float32([[x, y], [x + w, y], [x + w, y + h], [x, y + h]])
        self.mode = cfg.get("track", "hand")
        self.prev = cv2.cvtColor(first_frame, cv2.COLOR_BGR2GRAY)
        self.pts = self._features(self.prev)

    def _features(self, g):
        m = np.zeros_like(g)
        if self.mode == "hand":
            cv2.fillConvexPoly(m, self.box.astype(np.int32), 255)
        else:  # surface: follow the whole scene (camera shake), not the person
            m[:] = 255
        return cv2.goodFeaturesToTrack(g, 300, 0.01, 6, mask=m)

    def step(self, frame):
        g = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        if self.pts is not None and len(self.pts) >= 6:
            nxt, st, _ = cv2.calcOpticalFlowPyrLK(self.prev, g, self.pts, None, winSize=(21, 21), maxLevel=3)
            good_old, good_new = self.pts[st[:, 0] == 1], nxt[st[:, 0] == 1]
            if len(good_new) >= 6:
                M, _ = cv2.estimateAffinePartial2D(good_old, good_new, method=cv2.RANSAC, ransacReprojThreshold=3)
                if M is not None:
                    self.box = cv2.transform(self.box[None], M)[0]
            self.pts = good_new.reshape(-1, 1, 2) if len(good_new) >= 60 else self._features(g)
        else:
            self.pts = self._features(g)
        self.prev = g
        return self.box

    def render(self, frame, labels):
        h, w = frame.shape[:2]
        ph, pw = self.a.shape
        H = cv2.getPerspectiveTransform(np.float32([[0, 0], [pw, 0], [pw, ph], [0, ph]]), self.box.astype(np.float32))
        a = cv2.warpPerspective(self.a, H, (w, h))
        col = cv2.warpPerspective(self.bgr.astype(np.float32), H, (w, h))
        if self.mode == "hand":  # fingers stay in front of the bottle
            fingers = (labels == 2).astype(np.float32)
            a *= 1 - cv2.GaussianBlur(fingers, (0, 0), 1.5)
        lum = cv2.GaussianBlur(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY).astype(np.float32), (0, 0), 25) / 128.0
        col *= np.clip(lum, 0.5, 1.3)[..., None]
        out = frame.astype(np.float32)
        if self.mode == "surface":  # soft contact shadow under the product
            sh = cv2.GaussianBlur(a, (0, 0), 6)
            sh = cv2.warpAffine(sh, np.float32([[1, 0, 4], [0, 1, 8]]), (w, h))
            out *= (1 - 0.35 * sh)[..., None]
        out = out * (1 - a[..., None]) + col * a[..., None]
        return np.clip(out, 0, 255).astype(np.uint8)


def main(cfg_path):
    cfg = json.load(open(cfg_path))
    meta = json.load(open(os.path.join(cfg["work"], "meta.json")))
    W, H, fps = meta["width"], meta["height"], meta["fps"] or 30
    face = np.load(os.path.join(cfg["work"], "face.npz"))
    labels_half = np.load(os.path.join(cfg["work"], "seg.npz"))["labels"]
    alpha_it = gray_frames(os.path.join(cfg["work"], "alpha.mkv"), W, H)

    gl = G.prepare(cv2.imread(cfg["glasses"], cv2.IMREAD_UNCHANGED), cfg.get("glasses_tinted")) if cfg.get("glasses") else None
    gen_it = read_video(cfg["gen"]) if cfg.get("gen") else None
    gen_offset = cfg.get("gen_offset", 0)
    up = Upscaler() if gen_it else None
    seg = None
    if gen_it:
        import mediapipe as mp
        from mediapipe.tasks import python as mpt
        from mediapipe.tasks.python import vision

        seg = vision.ImageSegmenter.create_from_options(
            vision.ImageSegmenterOptions(base_options=mpt.BaseOptions(model_asset_path=os.path.join(MODELS, "selfie_multiclass_256x256.tflite")), output_category_mask=True)
        )

    enc = subprocess.Popen(
        [FF, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-", "-i", cfg["source"],
         "-map", "0:v", "-map", "1:a?", "-c:v", "libx264", "-preset", "slow", "-crf", str(cfg.get("crf", 15)), "-pix_fmt", "yuv420p",
         "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-c:a", "copy", "-map_metadata", "1", "-movflags", "+faststart", cfg["out"]],
        stdin=subprocess.PIPE,
    )
    warp = None
    color_gain = None
    grain = None
    product = None
    for i, src in enumerate(read_video(cfg["source"])):
        alpha = next(alpha_it)
        labels = cv2.resize(labels_half[min(i, len(labels_half) - 1)], (W, H), interpolation=cv2.INTER_NEAREST)
        out = src
        if gen_it and i >= gen_offset:
            g = next(gen_it, None)
            if g is not None:
                gu = up(g, W, H)
                if warp is None or i % 45 == 0:  # re-check alignment every 1.5 s
                    warp = align(gu, src, alpha < 13)
                gu = cv2.warpAffine(gu, warp, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
                gl_lab = np.squeeze(seg.segment(__import__("mediapipe").Image(image_format=__import__("mediapipe").ImageFormat.SRGB, data=np.ascontiguousarray(cv2.cvtColor(gu, cv2.COLOR_BGR2RGB)))).category_mask.numpy_view())
                take = ((gl_lab == 4) | (labels == 4)).astype(np.uint8)
                take = cv2.dilate(take, np.ones((5, 5), np.uint8))
                protect = cv2.dilate(((labels == 3) | (labels == 1)).astype(np.uint8), np.ones((3, 3), np.uint8))
                hands = (labels == 2) & (gl_lab == 2)  # skin in both: keep the real hands/neck
                m = take.astype(bool) & ~protect.astype(bool) & ~hands
                m = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 2.0)
                # Colour: match the AI pass to the real frame on the shared background.
                bg = (alpha < 13) & (gl_lab == 0)
                if bg.sum() > 1000:
                    gain = (src[bg].astype(np.float32).mean(0) + 1) / (gu[bg].astype(np.float32).mean(0) + 1)
                    color_gain = gain if color_gain is None else 0.9 * color_gain + 0.1 * gain
                if color_gain is not None:
                    gu = np.clip(gu.astype(np.float32) * np.clip(color_gain, 0.85, 1.15), 0, 255)
                # Grain: give the AI pixels the camera's noise.
                if grain is None:
                    grain = noise_level(src)
                gu = gu.astype(np.float32) + np.random.normal(0, grain * 0.9, gu.shape[:2])[..., None]
                out = np.clip(src.astype(np.float32) * (1 - m[..., None]) + gu * m[..., None], 0, 255).astype(np.uint8)
        if gl is not None and face["valid"][min(i, len(face["valid"]) - 1)]:
            out = G.render(out, face["smooth"][i], labels, gl)
        if cfg.get("product"):
            pc = cfg["product"]
            if product is None and i >= pc.get("frame", 0):
                product = ProductTrack(pc, out)
            if product is not None:
                product.step(src)
                out = product.render(out, labels)
        enc.stdin.write(np.ascontiguousarray(out).tobytes())
        if i % 60 == 0:
            print(f"composited {i}/{meta['frames']}", flush=True)
    if seg is not None:
        seg.close()  # release the MediaPipe graph before interpreter shutdown
    enc.stdin.close()
    enc.wait()
    print("wrote", cfg["out"])


if __name__ == "__main__":
    main(sys.argv[1])
