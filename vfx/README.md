# VFX pipeline: wardrobe, glasses and product swaps that keep the real face, voice and motion

CPU-only tools for editing a person's own video: new clothes (from an AI pass), tracked glasses and a
tracked product, while the original face, hair, hands and audio are kept exactly.

```bash
./setup.sh                                   # libs + models (MediaPipe, Robust Video Matting, ESPCN)
python3 pipeline/analyze.py in.mp4 work/     # face mesh (One-Euro smoothed), body-part masks, person alpha
python3 pipeline/composite.py job.json       # composite + encode, original audio stream copied untouched
```

`job.json`: `source`, `work`, `out`, optional `gen` (AI wardrobe pass, e.g. Wan 2.2 Animate character
swap at 480p; only clothing pixels are used, upscaled with ESPCN, colour- and grain-matched), optional
`glasses` (product photo; `glasses_tinted` true/false/null) and optional `product`
(`{"image", "track": "hand"|"surface", "box": [x, y, w, h], "frame"}`).

Outfit swap without a GPU (reference product photos, one outfit per section, switched on cues):

```bash
python3 pipeline/body.py in.mp4 work/        # pose (One-Euro smoothed) + multiclass body/clothes masks
python3 pipeline/tryon.py job.json           # rebuilds shirt + re-dyes trousers, face/hair/skin untouched
python3 pipeline/enhance.py out.mp4 hd.mp4 1072 1920 in.mp4   # temporal denoise, ESPCN x2, sharpen, grain
```

`tryon` job: `source`, `work`, `out`, `plan` (`[[start_frame, outfit], ...]`), `exposure`, `switch_glow`
and `outfits`, each with the photo `image`, `body` (`[xL, xR, y_shoulder, y_hem]` of the shirt in the
photo), `base_box` (plain fabric), `decals`, optional `sleeve` and `collar` boxes, and `pants_box`.

`bridge/gpu_job.py` runs a Hugging Face Space job (upload inputs, run on the free ZeroGPU quota,
download outputs) from a machine whose network policy allows huggingface.co.

Media files and model weights are not committed.
