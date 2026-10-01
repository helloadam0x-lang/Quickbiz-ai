#!/usr/bin/env python3
"""Clean up and upscale a phone video: temporal denoise, ESPCN x2 + Lanczos, gentle sharpening, fine grain.

  python3 enhance.py <in.mp4> <out.mp4> [width height] [audio_source]

Audio is copied untouched (from audio_source when given, else from the input).
"""
import os
import subprocess
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import analyze  # noqa: E402

FF = analyze.FF
MODELS = os.path.join(HERE, "..", "models")


FR = []
CFG = {}


def _work(k):
    """Denoise frame k against its neighbours (temporal NL-means), upscale, sharpen, add fine grain."""
    cv2.setNumThreads(1)
    sr = CFG.get("sr")
    if sr is None:
        sr = cv2.dnn_superres.DnnSuperResImpl_create()
        sr.readModel(os.path.join(MODELS, "ESPCN_x2.pb"))
        sr.setModel("espcn", 2)
        CFG["sr"] = sr
    W, H = CFG["size"]
    if 0 < k < len(FR) - 1:
        den = cv2.fastNlMeansDenoisingColoredMulti(FR[k - 1:k + 2], 1, 3, 3, 4, 5, 15)
    else:
        den = cv2.fastNlMeansDenoisingColored(FR[k], None, 3, 4, 5, 15)
    up = sr.upsample(den)
    up = cv2.resize(up, (W, H), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
    up = up + 0.45 * (up - cv2.GaussianBlur(up, (0, 0), 1.4))  # unsharp
    up = up + 0.25 * (up - cv2.GaussianBlur(up, (0, 0), 0.6))  # micro detail
    rng = np.random.default_rng(1000 + k)
    up += cv2.GaussianBlur(rng.normal(0, 2.2, (H, W)).astype(np.float32), (0, 0), 0.7)[..., None]
    return np.clip(up, 0, 255).astype(np.uint8).tobytes()


def main(src, dst, W=1072, H=1920, audio=None):
    from multiprocessing import Pool

    meta = analyze.probe(src)
    fps = meta["fps"] or 30
    FR.extend(analyze.frames(src))
    CFG["size"] = (W, H)
    enc = subprocess.Popen(
        [FF, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-", "-i", audio or src,
         "-map", "0:v", "-map", "1:a?", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-tune", "film", "-pix_fmt", "yuv420p",
         "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-c:a", "copy", "-movflags", "+faststart", dst],
        stdin=subprocess.PIPE,
    )
    with Pool(os.cpu_count() or 4) as pool:
        for n, buf in enumerate(pool.imap(_work, range(len(FR)), chunksize=2)):
            enc.stdin.write(buf)
            if n % 60 == 0:
                print(f"enhance {n}/{len(FR)}", flush=True)
    enc.stdin.close()
    enc.wait()
    print("wrote", dst)


if __name__ == "__main__":
    a = sys.argv[1:]
    main(a[0], a[1], *(int(x) for x in a[2:4]), *(a[4:5]))
