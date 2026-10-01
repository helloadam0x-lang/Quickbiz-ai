#!/usr/bin/env python3
"""Turn the ElevenLabs takes into the voiceover the video uses.

Reads  public/vo-el/<variant>/*.mp3|json and public/el/customers/*.mp3|json
Writes public/vo/<key>.wav (48 kHz mono) and src/vo.json (line starts + word times).

Long pauses are tightened from the audio's own energy (the alignment folds pauses into the
preceding word), word times are remapped through the cuts, and lines are scheduled so the
moments the scenes key off (the stamp on "lost", the tracker, the tap) stay in order.
"""
import json
import os
import subprocess
import wave

import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), "..")
FF = os.environ.get("FFMPEG", "ffmpeg")
SR = 48000
FPS = 30
VARIANT = os.environ.get("VO_VARIANT", "sarah-v2")
NARR = os.path.join(ROOT, "public", "vo-el", VARIANT)
CUST = os.path.join(ROOT, "public", "el", "customers")
OUT = os.path.join(ROOT, "public", "vo")

# Longest pause kept inside each line (seconds); the "miss..." beat is deliberate.
MAX_PAUSE = {"l03": 0.42, "l06": 0.16, "l07": 0.16, "l11": 0.34}
DEFAULT_PAUSE = 0.24
CUSTOMER_PAN = {"c1": -0.35, "c2": 0.15, "c3": -0.35, "c4": 0.45}
CUSTOMER_START = {"c1": 4.35, "c2": 5.25, "c3": 6.05, "c4": 7.15}
# Earliest start for each narrator line; a line also waits for the previous one to finish.
NARR_START = {"l01": 0.55, "l02": 1.65, "l03": 8.55, "l04": 12.25, "l05": 13.7, "l06": 16.85, "l07": 22.1,
              "l08": 27.95, "l09": 30.9, "l10": 33.2, "l11": 36.15, "l12": 39.15}
GAP = 0.12


def decode(path):
    raw = subprocess.run([FF, "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def words_from(path):
    j = json.load(open(path))
    al = j.get("alignment") or j.get("normalized_alignment")
    out, cur = [], None
    for c, s in zip(al["characters"], al["character_start_times_seconds"]):
        if c == " ":
            if cur:
                out.append(cur)
            cur = None
            continue
        if cur is None:
            cur = [c, s]
        else:
            cur[0] += c
    if cur:
        out.append(cur)
    return j["text"], out


def tighten(x, max_pause):
    """Shorten silent runs longer than max_pause; returns audio and the removed spans (seconds)."""
    hop = int(0.01 * SR)
    rms = np.sqrt(np.convolve(x**2, np.ones(hop) / hop, mode="same"))[::hop]
    # Pauses in these takes sit around -30 dB (breath and room tone), so pause detection uses a
    # higher threshold than the tail trim, which must not clip word endings.
    quiet = rms < rms.max() * 10 ** (-27 / 20)
    loud = np.where(rms >= rms.max() * 10 ** (-33 / 20))[0]
    end = min(len(x), (loud[-1] + 7) * hop) if len(loud) else len(x)
    x = x[:end].copy()
    fade = int(0.03 * SR)
    x[-fade:] *= np.linspace(1, 0, fade)
    quiet = quiet[: end // hop]
    cuts = []
    i = loud[0] if len(loud) else 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            run = (j - i) * hop / SR
            if j < len(quiet) and run > max_pause:
                keep = max_pause / 2
                a = i * hop / SR + keep
                b = j * hop / SR - keep
                cuts.append((a, b))
            i = j
        else:
            i += 1
    if not cuts:
        return x, []
    pieces, last, xf = [], 0, int(0.008 * SR)
    for a, b in cuts:
        ia, ib = int(a * SR), int(b * SR)
        seg = x[last:ia].copy()
        if pieces:
            seg[:xf] *= np.linspace(0, 1, xf)
        seg[-xf:] *= np.linspace(1, 0, xf)
        pieces.append(seg)
        last = ib
    tail = x[last:].copy()
    tail[:xf] *= np.linspace(0, 1, xf)
    pieces.append(tail)
    return np.concatenate(pieces), cuts


def remap(t, cuts):
    shift = 0.0
    for a, b in cuts:
        if t >= b:
            shift += b - a
        elif t > a:
            return a - shift
    return t - shift


def write_wav(path, x):
    pcm = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((pcm * 32767).astype("<i2").tobytes())


def clean(s):
    return s.replace("Get-Orda", "GetOrda").replace("get-orda", "getorda")


def main():
    vo = {}
    prev_end = 0.0
    for key in ["l01", "l02", "l03", "l04", "l05", "l06", "l07", "l08", "l09", "l10", "l11", "l12"]:
        x = decode(os.path.join(NARR, key + ".mp3"))
        text, ws = words_from(os.path.join(NARR, key + ".json"))
        x, cuts = tighten(x, MAX_PAUSE.get(key, DEFAULT_PAUSE))
        dur = len(x) / SR
        start = max(NARR_START[key], prev_end + GAP if key not in ("l03",) else 0)
        prev_end = start + dur
        write_wav(os.path.join(OUT, key + ".wav"), x)
        vo[key] = {"start": round(start, 3), "dur": round(dur, 3), "text": clean(text), "voice": VARIANT, "pan": 0,
                   "words": [{"w": clean(w), "t": round(remap(t, cuts), 3)} for w, t in ws]}
        print(f"{key} start={start:6.2f} dur={dur:5.2f} end={start + dur:6.2f} cuts={len(cuts)}")
    for key in ["c1", "c2", "c3", "c4"]:
        x = decode(os.path.join(CUST, key + ".mp3"))
        text, ws = words_from(os.path.join(CUST, key + ".json"))
        x, cuts = tighten(x, 0.2)
        write_wav(os.path.join(OUT, key + ".wav"), x)
        vo[key] = {"start": CUSTOMER_START[key], "dur": round(len(x) / SR, 3), "text": text, "voice": "el-customer", "pan": CUSTOMER_PAN[key],
                   "words": [{"w": w, "t": round(remap(t, cuts), 3)} for w, t in ws]}
    order = ["l01", "l02", "c1", "c2", "c3", "c4", "l03", "l04", "l05", "l06", "l07", "l08", "l09", "l10", "l11", "l12"]
    json.dump({k: vo[k] for k in order}, open(os.path.join(ROOT, "src", "vo.json"), "w"), indent=1, ensure_ascii=False)

    # Sanity: the scene keys that depend on word times must stay ordered and inside their scenes.
    def wf(k, i):
        return round((vo[k]["start"] + vo[k]["words"][i]["t"]) * FPS)
    chat, a, b = 498, None, None
    a = [wf("l06", i) - chat for i in range(14)]
    b = [wf("l07", i) - chat for i in range(18)]
    checks = {
        "lost stamp (lost local, < 96)": wf("l03", 10) - 252,
        "chat a[11]+4 (< 158)": a[11] + 4,
        "chat b[4]-8 (> 178)": b[4] - 8,
        "chat b[11] (< 324)": b[11],
        "chat door b[17] (< 318)": b[17],
        "needsAt local (< 74)": wf("l08", 8) - 2 - 834,
        "store live local": wf("l09", 3) - 918,
        "broadcast tap local (< 70)": wf("l10", 6) - 990,
        "tagline answered local (< 62)": wf("l11", 3) - 1080,
        "outro click word local": wf("l12", 4) - 1152,
    }
    for k, v in checks.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
