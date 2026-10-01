# GetOrda promo video

45-second, 3840×2160 launch film for getorda.app, built in code with Remotion. The UI is a faithful replica of the live GetOrda dashboard and WhatsApp, the products are real catalog photos, and the music, sound design and voiceover are all generated here. There's no watermark and no stock music.

## Render

```bash
npm i
pip install kokoro-onnx soundfile numpy scipy pyloudnorm
# Voiceover (Kokoro neural TTS, voice af_heart). Model files from the kokoro-onnx GitHub releases.
KOKORO_DIR=/path/to/kokoro python3 scripts/gen_vo.py && KOKORO_DIR=/path/to/kokoro python3 scripts/align_vo.py
python3 scripts/make_audio.py        # score + SFX + VO mix -> public/audio/getorda-v2-mix.wav (-14 LUFS)
npx remotion render GetOrda out/GetOrda-Promo-4K.mp4 --scale=2 --crf=14 --x264-preset=slow --audio-bitrate=320k
```

The composition is authored at 1920x1080; `--scale=2` renders a native 4K master. Preview with `npm run dev`.

## Assets kept out of git

`public/products/` (catalog and product photos) and `public/stock/` (Unsplash avatars and backgrounds) are gitignored because this repo is public. Put them back before rendering.

## Structure

- `src/vo.json`: voiceover line start times and per-word timings (from `scripts/align_vo.py`); captions sync to it
- `src/timeline.ts`: scene boundaries (100 BPM: the drop lands at 12.0s, the final hit at 38.4s)
- `src/scenes/`: S01 Hook → S10 Outro
- `scripts/make_audio.py`: music, sound effects and VO mix; its cue frames mirror the scenes
