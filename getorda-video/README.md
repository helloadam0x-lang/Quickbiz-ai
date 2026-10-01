# GetOrda promo video

45-second, 3840×2160 launch film for getorda.app, built in code with Remotion. The UI is a faithful replica of the live GetOrda dashboard and WhatsApp, and the products are real catalog photos. A 3D camera rig (`src/motion.ts`, `src/components/Cam.tsx`) gives every scene multi-shot camera moves with depth of field, motion blur and light flares. The voiceover and sound effects come from ElevenLabs, and the score is written in code around a sampled grand piano. There's no watermark and no stock music.

## Render

```bash
npm i
pip install soundfile numpy scipy pyloudnorm
# 1. ElevenLabs takes (needs api.elevenlabs.io reachable; the key comes from the environment only)
EL_KEY=... python3 scripts/gen_vo_el.py          # narrator takes with word timestamps -> public/vo-el/
EL_KEY=... python3 scripts/gen_assets_el.py      # customer voices + sound effects -> public/el/
# 2. Pick the narrator take, tighten pauses, schedule lines, write public/vo/*.wav + src/vo.json
VO_VARIANT=sarah-v2 python3 scripts/build_vo_el.py
# 3. Score (Salamander grand piano samples are fetched into .cache/) + SFX + VO mix
python3 scripts/make_audio.py        # -> public/audio/getorda-v2-mix.wav (-14 LUFS)
npx remotion render GetOrda out/GetOrda-Promo-v3-4K.mp4 --scale=2 --crf=14 --x264-preset=slow --audio-bitrate=320k
npx remotion render GetOrdaVertical out/GetOrda-Promo-v3-9x16-4K.mp4 --scale=2 --crf=14 --x264-preset=slow --audio-bitrate=320k   # 9:16, 2160x3840
```

`build_vo_el.py` prints the scene keys that depend on word timing (the stamp on "lost", the chat camera keys, the tap) so a re-take can be checked before rendering. The older Kokoro path (`gen_vo.py`, `align_vo.py`) still works offline.

`GetOrda` is authored at 1920x1080 and `GetOrdaVertical` at 1080x1920; the scenes share code and branch on `useVertical()` (`src/format.ts`) for the portrait layouts and camera moves. `--scale=2` renders a native 4K master. Preview with `npm run dev`.

## Assets kept out of git

`public/products/` (catalog and product photos) and `public/stock/` (Unsplash avatars and backgrounds) are gitignored because this repo is public. Put them back before rendering.

## Structure

- `src/vo.json`: voiceover line start times and per-word timings (from `scripts/build_vo_el.py`); captions and camera moves sync to it
- `src/timeline.ts`: scene boundaries (100 BPM: the drop lands at 12.0s, the final hit at 38.4s)
- `src/scenes/`: S01 Hook → S10 Outro
- `scripts/make_audio.py`: music, sound effects and VO mix; its cues are computed from the same scene starts and word times as the picture
