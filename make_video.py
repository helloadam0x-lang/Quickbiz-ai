"""
Character Video Creator
Combines 5 images into a cinematic short film with Ken Burns effect,
crossfade transitions, letterboxing, and story captions.

Usage:
  1. Save your 5 images as: image1.jpg, image2.jpg, image3.jpg, image4.jpg, image5.jpg
  2. Run: python make_video.py
"""

import os
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
from moviepy import (
    ImageClip, VideoClip, VideoFileClip, CompositeVideoClip,
    concatenate_videoclips, ColorClip, TextClip
)
from moviepy.video.fx import CrossFadeIn, CrossFadeOut

# ── CONFIG ────────────────────────────────────────────────────────────────────
IMAGE_FILES = [
    "image1.jpg",   # Delivery worker in hotel lobby
    "image2.jpg",   # Night street, black hoodie
    "image3.jpg",   # Rodeo Drive, coffee cup
    "image4.jpg",   # Dark room, studying blueprints
    "image5.jpg",   # Rainy neon street portrait
]

CAPTIONS = [
    "Everyone has a role to play...",
    "But some roles are just a cover.",
    "He'd been watching. Waiting.",
    "The plan was perfect.",
    "Now all he had to do was pull it off.",
]

OUTPUT_FILE  = "character_video.mp4"
CLIP_DURATION = 4.0       # seconds each image is shown
FADE_DURATION = 1.0       # crossfade length
OUTPUT_SIZE   = (1080, 1920)  # portrait 9:16 (matches phone images)
FPS           = 24
# ─────────────────────────────────────────────────────────────────────────────


def check_images():
    missing = [f for f in IMAGE_FILES if not os.path.exists(f)]
    if missing:
        print("ERROR: Missing image files:")
        for f in missing:
            print(f"  • {f}")
        print("\nSave your 5 images with those exact filenames and run again.")
        sys.exit(1)


def fit_and_crop(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """Scale image to fill target size, then center-crop."""
    iw, ih = img.size
    scale = max(target_w / iw, target_h / ih)
    new_w, new_h = int(iw * scale), int(ih * scale)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - target_w) // 2
    top  = (new_h - target_h) // 2
    return img.crop((left, top, left + target_w, top + target_h))


def ken_burns(img_path: str, duration: float, output_size: tuple,
              zoom_in: bool = True) -> ImageClip:
    """Create a slow zoom / pan effect on a still image."""
    W, H = output_size
    ZOOM = 1.15   # how much to zoom over the clip

    img = Image.open(img_path).convert("RGB")
    # Work on a slightly larger canvas so zoom never shows borders
    pad_w, pad_h = int(W * ZOOM) + 4, int(H * ZOOM) + 4
    base = fit_and_crop(img, pad_w, pad_h)
    base_np = np.array(base)

    def make_frame(t: float):
        progress = t / duration                        # 0 → 1
        factor = (1 + (ZOOM - 1) * progress) if zoom_in else (ZOOM - (ZOOM - 1) * progress)
        cw = int(W / factor)
        ch = int(H / factor)
        cx = (pad_w - cw) // 2
        cy = (pad_h - ch) // 2
        crop = base_np[cy:cy + ch, cx:cx + cw]
        frame = np.array(Image.fromarray(crop).resize((W, H), Image.LANCZOS))
        return frame

    return VideoClip(make_frame, duration=duration).with_fps(FPS)


def add_caption(clip: ImageClip, text: str, duration: float) -> CompositeVideoClip:
    """Overlay a cinematic caption with fade in/out."""
    W, H = clip.size

    # Semi-transparent black bar at bottom
    bar_h = 160
    bar = ColorClip(size=(W, bar_h), color=(0, 0, 0), duration=duration)
    bar = bar.with_opacity(0.55).with_position(("center", H - bar_h))

    txt = TextClip(
        text=text,
        font_size=44,
        color="white",
        font="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        method="label",
        size=(W - 80, None),
        text_align="center",
    ).with_duration(duration).with_position(("center", H - bar_h + 30))

    txt = txt.with_effects([CrossFadeIn(0.5), CrossFadeOut(0.5)])

    return CompositeVideoClip([clip, bar, txt])


def letterbox(clip, W, H):
    """Add top & bottom black bars (cinematic 2.35:1 style)."""
    bar_h = 80
    bar_top = ColorClip(size=(W, bar_h), color=(0, 0, 0), duration=clip.duration)
    bar_bot = ColorClip(size=(W, bar_h), color=(0, 0, 0), duration=clip.duration)
    bar_top = bar_top.with_position(("center", "top"))
    bar_bot = bar_bot.with_position(("center", "bottom"))
    return CompositeVideoClip([clip, bar_top, bar_bot])


def main():
    check_images()
    W, H = OUTPUT_SIZE
    clips = []

    for i, (img_file, caption) in enumerate(zip(IMAGE_FILES, CAPTIONS)):
        print(f"  Processing [{i+1}/{len(IMAGE_FILES)}]: {img_file}")
        zoom_in = (i % 2 == 0)   # alternate zoom direction for variety
        kb = ken_burns(img_file, CLIP_DURATION, (W, H), zoom_in=zoom_in)
        with_cap = add_caption(kb, caption, CLIP_DURATION)
        final    = letterbox(with_cap, W, H)
        clips.append(final)

    print("\nAssembling video with crossfade transitions...")
    # Apply fade-in on all but first, fade-out on all but last
    faded = [clips[0].with_effects([CrossFadeOut(FADE_DURATION)])]
    for clip in clips[1:-1]:
        faded.append(clip.with_effects([CrossFadeIn(FADE_DURATION), CrossFadeOut(FADE_DURATION)]))
    faded.append(clips[-1].with_effects([CrossFadeIn(FADE_DURATION)]))

    final_video = concatenate_videoclips(faded, method="compose", padding=-FADE_DURATION)

    print(f"Rendering → {OUTPUT_FILE}  (this may take a minute...)")
    final_video.write_videofile(
        OUTPUT_FILE,
        fps=FPS,
        codec="libx264",
        audio=False,
        preset="medium",
        ffmpeg_params=["-crf", "20"],
    )
    print(f"\nDone!  Video saved as: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
