# GetOrda promo video

42-second launch reel for getorda.app, built in code with Remotion. Every visual (UI, products, logo) and every sound (music + SFX) is generated here, so there is no stock footage, no licensed music and no watermark.

## Render

```bash
npm i
python3 scripts/make_audio.py        # needs numpy + scipy; writes public/audio/getorda-mix.wav
npx remotion render GetOrda out/GetOrda-Promo-4K.mp4 --scale=2 --crf=14 --x264-preset=slow --audio-bitrate=320k
```

The composition is authored at 1920x1080 and `--scale=2` renders a native 3840x2160 master. Preview with `npm run dev`.

## Structure

- `src/timeline.ts`: scene start frames (120 BPM, so every cut lands on a bar)
- `src/scenes/`: Hook, Never, Meet, Chat, Approve, Store, Broadcast, Analytics, Outro
- `scripts/make_audio.py`: original score and sound design; its cue frames mirror the scene timings
