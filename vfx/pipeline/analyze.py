#!/usr/bin/env python3
"""Per-frame analysis of a source video.

  python3 analyze.py <video> <workdir>

Writes to <workdir>:
  meta.json        fps, size, frame count, audio presence
  face.npz         landmarks (N,478,3) in pixels (x, y, z*width), raw + One-Euro smoothed, valid flags,
                   4x4 facial transformation matrices
  seg.npz          multiclass labels per frame at half resolution
                   (0 bg, 1 hair, 2 body skin, 3 face skin, 4 clothes, 5 other/accessories)
  alpha.mkv        person alpha (Robust Video Matting), lossless 8-bit gray, full resolution
"""
import json
import os
import subprocess
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(HERE, "..", "models")
FF = os.environ.get("FFMPEG", "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2")


def probe(path):
    out = subprocess.run([FF, "-hide_banner", "-i", path], capture_output=True, text=True).stderr
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()
    return {"fps": fps, "frames": n, "width": w, "height": h, "audio": "Audio:" in out, "rotation_note": "rotate" in out or "displaymatrix" in out}


def frames(path):
    """Decode with ffmpeg so phone rotation metadata is applied the same way everywhere."""
    meta = probe(path)
    # ffmpeg auto-rotates; read the rotated size from a first frame.
    p = subprocess.Popen([FF, "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
    w, h = meta["width"], meta["height"]
    probe_frame = subprocess.run([FF, "-v", "error", "-i", path, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True).stdout
    img = cv2.imdecode(np.frombuffer(probe_frame, np.uint8), cv2.IMREAD_COLOR)
    h, w = img.shape[:2]
    size = w * h * 3
    while True:
        buf = p.stdout.read(size)
        if len(buf) < size:
            break
        yield np.frombuffer(buf, np.uint8).reshape(h, w, 3)
    p.wait()


class OneEuro:
    """One-Euro filter: smooth when still, responsive when moving (kills landmark jitter)."""

    def __init__(self, fps, min_cutoff=1.2, beta=0.02, d_cutoff=1.0):
        self.fps, self.mc, self.beta, self.dc = fps, min_cutoff, beta, d_cutoff
        self.x = None
        self.dx = None

    @staticmethod
    def _alpha(cutoff, fps):
        tau = 1.0 / (2 * np.pi * cutoff)
        return 1.0 / (1.0 + tau * fps)

    def __call__(self, x):
        if self.x is None:
            self.x, self.dx = x.copy(), np.zeros_like(x)
            return x
        dx = (x - self.x) * self.fps
        a_d = self._alpha(self.dc, self.fps)
        self.dx = a_d * dx + (1 - a_d) * self.dx
        cutoff = self.mc + self.beta * np.abs(self.dx)
        a = self._alpha(cutoff, self.fps)
        self.x = a * x + (1 - a) * self.x
        return self.x


def main(video, work):
    import mediapipe as mp
    import onnxruntime as ort
    from mediapipe.tasks import python as mpt
    from mediapipe.tasks.python import vision

    os.makedirs(work, exist_ok=True)
    meta = probe(video)
    fl = vision.FaceLandmarker.create_from_options(
        vision.FaceLandmarkerOptions(
            base_options=mpt.BaseOptions(model_asset_path=os.path.join(MODELS, "face_landmarker.task")),
            running_mode=vision.RunningMode.VIDEO,
            output_facial_transformation_matrixes=True,
            num_faces=1,
            min_face_detection_confidence=0.3,
            min_tracking_confidence=0.3,
        )
    )
    seg = vision.ImageSegmenter.create_from_options(
        vision.ImageSegmenterOptions(base_options=mpt.BaseOptions(model_asset_path=os.path.join(MODELS, "selfie_multiclass_256x256.tflite")), output_category_mask=True)
    )
    rvm = ort.InferenceSession(os.path.join(MODELS, "rvm_mobilenetv3_fp32.onnx"), providers=["CPUExecutionProvider"])
    rec = [np.zeros([1, 1, 1, 1], np.float32)] * 4

    lm_raw, mats, valid, labels = [], [], [], []
    alpha_proc = None
    fps = meta["fps"] or 30
    for i, img in enumerate(frames(video)):
        h, w = img.shape[:2]
        if alpha_proc is None:
            meta["width"], meta["height"] = w, h
            alpha_proc = subprocess.Popen(
                [FF, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{w}x{h}", "-r", str(fps), "-i", "-", "-c:v", "ffv1", os.path.join(work, "alpha.mkv")],
                stdin=subprocess.PIPE,
            )
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        mpimg = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb))
        r = fl.detect_for_video(mpimg, int(i * 1000 / fps))
        if r.face_landmarks:
            lm_raw.append(np.array([[p.x * w, p.y * h, p.z * w] for p in r.face_landmarks[0]], np.float32))
            mats.append(np.array(r.facial_transformation_matrixes[0], np.float32))
            valid.append(True)
        else:
            lm_raw.append(np.zeros((478, 3), np.float32))
            mats.append(np.eye(4, dtype=np.float32))
            valid.append(False)
        m = np.squeeze(seg.segment(mpimg).category_mask.numpy_view()).astype(np.uint8)
        labels.append(cv2.resize(m, (w // 2, h // 2), interpolation=cv2.INTER_NEAREST))
        src = rgb.astype(np.float32).transpose(2, 0, 1)[None] / 255
        ds = min(1.0, 512 / max(h, w))
        fgr, pha, *rec = rvm.run(None, {"src": src, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": np.array([ds], np.float32)})
        alpha_proc.stdin.write((np.clip(pha[0, 0], 0, 1) * 255).astype(np.uint8).tobytes())
        if i % 30 == 0:
            print(f"frame {i}/{meta['frames']} face={'yes' if valid[-1] else 'no'}", flush=True)
    fl.close()  # release the MediaPipe graphs before interpreter shutdown
    seg.close()
    alpha_proc.stdin.close()
    alpha_proc.wait()

    lm_raw = np.stack(lm_raw)
    valid = np.array(valid)
    # Fill gaps (blinks of detection) by holding the nearest valid frame, then smooth.
    idx = np.where(valid)[0]
    lm_fill = lm_raw.copy()
    if len(idx):
        for i in range(len(lm_fill)):
            if not valid[i]:
                lm_fill[i] = lm_raw[idx[np.argmin(np.abs(idx - i))]]
    f = OneEuro(fps)
    lm_s = np.stack([f(x) for x in lm_fill])
    np.savez_compressed(os.path.join(work, "face.npz"), raw=lm_raw, smooth=lm_s, valid=valid, mats=np.stack(mats))
    np.savez_compressed(os.path.join(work, "seg.npz"), labels=np.stack(labels))
    meta["frames"] = len(lm_raw)
    meta["face_found_ratio"] = float(valid.mean()) if len(valid) else 0.0
    json.dump(meta, open(os.path.join(work, "meta.json"), "w"), indent=1)
    print(json.dumps(meta, indent=1))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
