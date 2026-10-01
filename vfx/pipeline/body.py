#!/usr/bin/env python3
"""Per-frame body analysis for wardrobe swaps.

  python3 body.py <video> <workdir>

Writes body.npz: pose (N,33,3) pixels+visibility (raw and One-Euro smoothed) and multiclass labels
(N,H,W) at native resolution (0 bg, 1 hair, 2 body skin, 3 face skin, 4 clothes, 5 other).
"""
import json
import os
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import analyze  # noqa: E402

MODELS = os.path.join(HERE, "..", "models")


def main(video, work):
    import mediapipe as mp
    from mediapipe.tasks import python as mpt
    from mediapipe.tasks.python import vision

    os.makedirs(work, exist_ok=True)
    meta = analyze.probe(video)
    fps = meta["fps"] or 30
    pose = vision.PoseLandmarker.create_from_options(
        vision.PoseLandmarkerOptions(
            base_options=mpt.BaseOptions(model_asset_path=os.path.join(MODELS, "pose_landmarker_heavy.task")),
            running_mode=vision.RunningMode.VIDEO,
            min_pose_detection_confidence=0.3,
            min_tracking_confidence=0.3,
        )
    )
    seg = vision.ImageSegmenter.create_from_options(
        vision.ImageSegmenterOptions(base_options=mpt.BaseOptions(model_asset_path=os.path.join(MODELS, "selfie_multiclass_256x256.tflite")), output_category_mask=True, output_confidence_masks=True)
    )
    P, L, C = [], [], []
    last = np.zeros((33, 3), np.float32)
    for i, img in enumerate(analyze.frames(video)):
        h, w = img.shape[:2]
        im = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)))
        r = pose.detect_for_video(im, int(i * 1000 / fps))
        if r.pose_landmarks:
            last = np.array([[q.x * w, q.y * h, q.visibility] for q in r.pose_landmarks[0]], np.float32)
        P.append(last.copy())
        s = seg.segment(im)
        L.append(np.squeeze(s.category_mask.numpy_view()).astype(np.uint8))
        # Keep the clothes confidence for soft, edge-aware masks.
        C.append((np.squeeze(s.confidence_masks[4].numpy_view()) * 255).astype(np.uint8))
        if i % 60 == 0:
            print(f"body {i}/{meta['frames']}", flush=True)
    pose.close()
    seg.close()
    P = np.stack(P)
    f = analyze.OneEuro(fps, min_cutoff=1.0, beta=0.05)
    Ps = np.stack([f(p[:, :2]) for p in P])
    Ps = np.concatenate([Ps, P[:, :, 2:]], axis=2)
    np.savez_compressed(os.path.join(work, "body.npz"), pose=P, pose_s=Ps, labels=np.stack(L), clothes_conf=np.stack(C))
    meta["frames"] = len(P)
    meta["width"], meta["height"] = int(L[0].shape[1]), int(L[0].shape[0])
    json.dump(meta, open(os.path.join(work, "meta.json"), "w"), indent=1)
    print(json.dumps(meta))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
