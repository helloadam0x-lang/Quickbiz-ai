"""Score, sound design and voiceover mix for the GetOrda promo (v2).

100 BPM (beat 0.6s, bar 2.4s). The drop lands at 12.0s (bar 5), the final
hit at 38.4s (bar 16). Cue frames (30fps) mirror src/timeline.ts and the
scene files. VO lines are read from public/vo/*.wav at the start times in
src/vo.json.
Run: python3 scripts/make_audio.py  ->  public/audio/getorda-v2-mix.wav
"""
import json
import os
import wave

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

ROOT = os.path.join(os.path.dirname(__file__), "..")
SR = 48000
DUR = 45.0
N = int(SR * DUR)
FPS = 30
BEAT = 0.6
BAR = 2.4
STEP = BEAT / 4
rng = np.random.default_rng(11)


def fr(frame):
    return frame / FPS


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def t_(d):
    return np.arange(int(d * SR)) / SR


def flt(x, kind, f, order=2):
    return sosfilt(butter(order, f, btype=kind, fs=SR, output="sos"), x)


def peak_eq(x, f0, gain_db, q=1.0):
    a = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * f0 / SR
    al = np.sin(w0) / (2 * q)
    b = np.array([1 + al * a, -2 * np.cos(w0), 1 - al * a])
    aa = np.array([1 + al / a, -2 * np.cos(w0), 1 - al / a])
    from scipy.signal import lfilter

    return lfilter(b / aa[0], aa / aa[0], x)


def shelf(x, f0, gain_db, high=True):
    a = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * f0 / SR
    al = np.sin(w0) / 2 * np.sqrt(2)
    cw = np.cos(w0)
    from scipy.signal import lfilter

    if high:
        b = [a * ((a + 1) + (a - 1) * cw + 2 * np.sqrt(a) * al), -2 * a * ((a - 1) + (a + 1) * cw), a * ((a + 1) + (a - 1) * cw - 2 * np.sqrt(a) * al)]
        aa = [(a + 1) - (a - 1) * cw + 2 * np.sqrt(a) * al, 2 * ((a - 1) - (a + 1) * cw), (a + 1) - (a - 1) * cw - 2 * np.sqrt(a) * al]
    else:
        b = [a * ((a + 1) - (a - 1) * cw + 2 * np.sqrt(a) * al), 2 * a * ((a - 1) - (a + 1) * cw), a * ((a + 1) - (a - 1) * cw - 2 * np.sqrt(a) * al)]
        aa = [(a + 1) + (a - 1) * cw + 2 * np.sqrt(a) * al, -2 * ((a - 1) + (a + 1) * cw), (a + 1) + (a - 1) * cw - 2 * np.sqrt(a) * al]
    b = np.array(b) / aa[0]
    aa = np.array(aa) / aa[0]
    return lfilter(b, aa, x)


class Bus:
    def __init__(self):
        self.b = np.zeros((2, N))

    def add(self, sig, t, gain=1.0, pan=0.0):
        if sig.ndim == 1:
            sig = np.vstack([sig * np.sqrt(1 - pan), sig * np.sqrt(1 + pan)])
        i = int(round(t * SR))
        if i >= N:
            return
        if i < 0:
            sig = sig[:, -i:]
            i = 0
        n = min(sig.shape[1], N - i)
        self.b[:, i : i + n] += sig[:, :n] * gain


def ir(seconds, damp, decay):
    t = t_(seconds)
    e = np.exp(-t * decay)
    r = np.vstack([flt(rng.standard_normal(len(t)), "low", damp) * e, flt(rng.standard_normal(len(t)), "low", damp) * e])
    r[:, : int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))
    return r / np.sqrt(np.sum(r**2, axis=1, keepdims=True))


IR_HALL = ir(3.2, 4200, 1.6)
IR_ROOM = ir(0.6, 6000, 9)


def verb(x, r, wet):
    return np.vstack([fftconvolve(x[0], r[0])[:N], fftconvolve(x[1], r[1])[:N]]) * wet


def env(n, a, r):
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na) ** 1.5
    if nr < n:
        e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e


# ------------------------------------------------------------------ instruments
def saw(f, t, cents=0.0):
    f = f * 2 ** (cents / 1200)
    out = np.zeros_like(t)
    k = 1
    while f * k < 8000:
        out += np.sin(2 * np.pi * f * k * t + k * 1.3) / k
        k += 1
    return out


def pad(notes, dur, cutoff=1800, gain=0.035):
    t = t_(dur)
    L = np.zeros(len(t))
    R = np.zeros(len(t))
    for n in notes:
        f = midi(n)
        L += saw(f, t, -9) + 0.5 * saw(f, t, 5)
        R += saw(f, t, 9) + 0.5 * saw(f, t, -4)
    e = env(len(t), min(0.8, dur * 0.35), min(0.9, dur * 0.4))
    return np.vstack([flt(L, "low", cutoff), flt(R, "low", cutoff)]) * e * gain


def hat(open_=False):
    t = t_(0.3 if open_ else 0.06)
    n = flt(rng.standard_normal(len(t)), "high", 8000, 3)
    return n * np.exp(-t * (12 if open_ else 80)) * (0.16 if open_ else 0.12)


def bell(f, dur=1.0, g=0.15, idx=2.0, decay=4.0, ratio=3.5):
    t = t_(dur)
    s = np.sin(2 * np.pi * f * t + idx * np.exp(-t * 6) * np.sin(2 * np.pi * f * ratio * t)) * np.exp(-t * decay)
    return s * np.minimum(t / 0.002, 1) * g


def pluck(n, dur=0.5, g=0.12, bright=1.4):
    t = t_(dur)
    f = midi(n)
    s = np.sin(2 * np.pi * f * t + bright * np.exp(-t * 16) * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 7)
    return s * np.minimum(t / 0.002, 1) * g


# ---------------------------------------------------------------------- sfx
def svf_sweep(x, f0, f1, q=1.6, curve=None):
    n = len(x)
    curve = np.linspace(0, 1, n) if curve is None else curve
    fc = f0 * (f1 / f0) ** curve
    g = np.tan(np.pi * np.clip(fc, 20, SR * 0.45) / SR)
    k = 1 / q
    ic1 = ic2 = 0.0
    out = np.zeros(n)
    for i in range(n):
        gi = g[i]
        a1 = 1 / (1 + gi * (gi + k))
        v3 = x[i] - ic2
        v1 = a1 * ic1 + gi * a1 * v3
        v2 = ic2 + gi * v1
        ic1 = 2 * v1 - ic1
        ic2 = 2 * v2 - ic2
        out[i] = v1
    return out


def whoosh(d=0.5, f0=300, f1=4500, g=0.4, pan_from=-0.6, pan_to=0.6):
    n = int(d * SR)
    y = svf_sweep(rng.standard_normal(n), f0, f1, 1.5, np.linspace(0, 1, n) ** 0.8) * np.sin(np.linspace(0, np.pi, n)) ** 1.6
    p = np.linspace(pan_from, pan_to, n)
    return np.vstack([y * np.sqrt(1 - p), y * np.sqrt(1 + p)]) * g


def riser(d, g=0.35):
    n = int(d * SR)
    t = np.arange(n) / SR
    ramp = (t / d) ** 2.3
    y = svf_sweep(rng.standard_normal(n), 300, 9500, 2.6, (t / d) ** 1.3) * ramp
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2.5 * t / d)) / SR) * ramp * 0.12
    return (y + tone) * g


def impact(g=1.0):
    t = t_(2.6)
    f = 34 + 70 * np.exp(-t * 5)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6) * 0.8
    air = flt(rng.standard_normal(len(t)), "low", 6000) * np.exp(-t * 3) * 0.28
    return np.tanh((boom + air) * 1.25) * 0.75 * g


def ping(f1=784, f2=1175, g=0.22):
    s = np.zeros(int(0.5 * SR))
    a = bell(f1, 0.35, g, 1.2, 14, 2.0)
    b = bell(f2, 0.4, g * 0.9, 1.2, 12, 2.0)
    s[: len(a)] += a
    o = int(0.07 * SR)
    s[o : o + len(b)] += b[: len(s) - o]
    return s


def vibrate(d=0.32, g=0.16):
    t = t_(d)
    sq = np.sign(np.sin(2 * np.pi * 155 * t)) * 0.5 + np.sin(2 * np.pi * 155 * t) * 0.5
    am = (np.sin(2 * np.pi * 26 * t) > -0.2).astype(float)
    return flt(sq * am, "band", [90, 700]) * env(len(t), 0.01, 0.05) * g


def blip(f=900, d=0.09, g=0.18):
    t = t_(d)
    ff = f * (0.6 + 0.4 * np.exp(-t * 55))
    return np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t * 42) * g


def bubble_in(g=0.22):
    t = t_(0.14)
    f = 520 * (1 + 0.7 * (1 - np.exp(-t * 40)))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30) * g


def sent(g=0.22):
    w = whoosh(0.18, 800, 6000, 0.12, 0, 0)
    b = blip(1180, 0.1, g)
    out = np.zeros((2, int(0.3 * SR)))
    out[:, : w.shape[1]] += w
    o = int(0.12 * SR)
    out[:, o : o + len(b)] += b
    return out


def click(g=1.0):
    t = t_(0.012)
    a = flt(rng.standard_normal(len(t)), "high", 2500) * np.exp(-t * 700)
    b = np.sin(2 * np.pi * 3100 * t) * np.exp(-t * 900) * 0.4
    out = np.zeros(int(0.09 * SR))
    out[: len(t)] += (a + b) * 0.45
    out[int(0.06 * SR) : int(0.06 * SR) + len(t)] += (a + b) * 0.28
    return out * g


def key(g=1.0):
    t = t_(0.03)
    n = flt(rng.standard_normal(len(t)), "band", [1800, 6500]) * np.exp(-t * 300)
    return (n + np.sin(2 * np.pi * 180 * t) * np.exp(-t * 220) * 0.3) * rng.uniform(0.07, 0.12) * g


def chime(notes=(84, 88, 91, 96), g=0.11, step=0.05):
    s = np.zeros(int(1.6 * SR))
    for i, n in enumerate(notes):
        b = bell(midi(n), 1.3, g, 1.0, 3.5)
        o = int(i * step * SR)
        s[o : o + len(b)] += b[: len(s) - o]
    return s


def sparkle(d=0.5, count=14, g=0.045):
    s = np.zeros(int((d + 0.3) * SR))
    for _ in range(count):
        b = bell(rng.uniform(3200, 7600), 0.22, g * rng.uniform(0.5, 1), 0.5, 20)
        o = int(rng.uniform(0, d) * SR)
        s[o : o + len(b)] += b[: len(s) - o]
    return s


def thud(g=0.6):
    t = t_(0.5)
    f = 70 + 60 * np.exp(-t * 20)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * g


# ------------------------------------------------------- premium instruments
# Real grand piano: the Salamander Grand (Yamaha C5, CC-BY 3.0, Alexander Holm), sampled every
# minor third; notes in between are resampled from the nearest sample.
SAL_DIR = os.path.join(ROOT, ".cache", "salamander")
SAL_URL = "https://raw.githubusercontent.com/Tonejs/audio/master/salamander/{}.mp3"
_SAL = {}


def _decode(path):
    import subprocess
    ff = os.environ.get("FFMPEG", "ffmpeg")
    raw = subprocess.run([ff, "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def _salamander():
    if _SAL:
        return _SAL
    import urllib.request
    os.makedirs(SAL_DIR, exist_ok=True)
    for octave in range(2, 8):
        for name, pc in (("C", 0), ("Ds", 3), ("Fs", 6), ("A", 9)):
            f = os.path.join(SAL_DIR, f"{name}{octave}.mp3")
            if not os.path.exists(f):
                urllib.request.urlretrieve(SAL_URL.format(f"{name}{octave}"), f)
            x = _decode(f)
            on = np.argmax(np.abs(x) > 0.01 * np.abs(x).max())
            x = x[max(0, on - 48):]
            _SAL[12 * (octave + 1) + pc] = x / np.abs(x).max()
    return _SAL


def felt_piano(n, dur=2.5, vel=0.8):
    """Sampled grand, voiced soft: darker and quieter as velocity drops, damped at `dur`."""
    bank = _salamander()
    m = min(bank, key=lambda k: abs(k - n))
    x = bank[m]
    r = 2 ** ((n - m) / 12)
    need = int((dur + 0.35) * SR)
    pos = np.arange(0, min(len(x) - 1, need * r), r)
    y = np.interp(pos, np.arange(len(x)), x)
    if len(y) < need:
        y = np.pad(y, (0, need - len(y)))
    rel = int(0.35 * SR)
    y[-rel:] *= np.linspace(1, 0, rel) ** 2
    y = flt(y, "low", 1400 + 6500 * vel)
    return y * 0.13 * vel**1.3


def piano_chord(notes, dur=3.0, vel=0.75, roll=0.025):
    L = np.zeros(int((dur + 0.2) * SR))
    R = np.zeros_like(L)
    for i, n in enumerate(notes):
        x = felt_piano(n, dur, vel * (0.85 + 0.3 * rng.random()))
        o = int(i * roll * SR)
        p = (i / max(1, len(notes) - 1) - 0.5) * 0.6
        L[o : o + len(x)] += x[: len(L) - o] * np.sqrt(1 - p)
        R[o : o + len(x)] += x[: len(R) - o] * np.sqrt(1 + p)
    return np.vstack([L, R])


def glass_pluck(n, dur=0.55, g=0.07, cutoff=5200):
    """Glassy synth pluck for the arpeggio: two detuned saws through a decaying filter."""
    t = t_(dur)
    f = midi(n)
    x = saw(f, t, -6) + saw(f, t, 6) + 0.4 * np.sin(2 * np.pi * 2 * f * t)
    y = svf_sweep(x, cutoff, 380, 0.9, curve=1 - np.exp(-t * 9))
    return y * np.exp(-t * 6.5) * np.minimum(t / 0.003, 1) * g


def soft_kick(g=1.0):
    t = t_(0.5)
    f = 42 + 85 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.0)
    return np.tanh(body * 1.2) * 0.42 * g


def soft_clap(g=1.0):
    t = t_(0.4)
    n = rng.standard_normal(len(t))
    e = np.zeros(len(t))
    for k, off in enumerate([0, 0.01, 0.021]):
        i = int(off * SR)
        e[i:] += np.exp(-t[: len(t) - i] * (240 if k < 2 else 16))
    return flt(n, "band", [900, 5500]) * e * 0.26 * g


def warm_sub(n, dur):
    t = t_(dur)
    f = midi(n)
    s = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(4 * np.pi * f * t)
    return np.tanh(s * 1.1) * env(len(t), 0.02, 0.12) * 0.13


def air(dur, g=0.02):
    n = int(dur * SR)
    x = np.vstack([flt(rng.standard_normal(n), "band", [6000, 14000]), flt(rng.standard_normal(n), "band", [6000, 14000])])
    return x * env(n, dur * 0.4, dur * 0.4) * g


def pingpong(bus, sig, t, gain, delay=STEP * 3, fb=0.42, taps=4):
    for k in range(taps):
        bus.add(sig, t + k * delay, gain=gain * fb**k, pan=0.55 if k % 2 else -0.55)


# ------------------------------------------------------------------- arrangement
music, drums, sfx, send = Bus(), Bus(), Bus(), Bus()

CMAJ9 = (36, [52, 55, 59, 62])
G6B = (35, [50, 55, 59, 64])
AM9 = (33, [52, 55, 59, 60])
FMAJ9 = (41, [53, 57, 60, 64])
PROG = [CMAJ9, G6B, AM9, FMAJ9]

DROP = 12.0
BREAK = 36.0
FINAL = 38.4

# Intro (0-12s): felt piano, airy pad, lots of space for the VO and pings.
INTRO = [FMAJ9, CMAJ9, FMAJ9, AM9, FMAJ9]
for bar, (root, notes) in enumerate(INTRO):
    t0 = bar * BAR
    music.add(pad(notes, BAR + 0.4, cutoff=1200 + bar * 260, gain=0.026), t0)
    send.add(pad(notes, BAR + 0.4, cutoff=1500, gain=0.018), t0)
    music.add(piano_chord([n + 12 for n in notes], 2.6, 0.55), t0, gain=0.9)
    send.add(piano_chord([n + 12 for n in notes], 2.6, 0.55), t0, gain=0.45)
    melody = [notes[3] + 12, notes[2] + 12, notes[1] + 24]
    for k, n in enumerate(melody):
        if bar in (1, 3):
            music.add(felt_piano(n, 1.6, 0.45), t0 + (6 + k * 3) * STEP, pan=0.2)
            send.add(felt_piano(n, 1.6, 0.45), t0 + (6 + k * 3) * STEP, gain=0.5)
    music.add(warm_sub(root, BAR), t0, gain=0.35 + 0.1 * bar)
music.add(air(5.0, 0.012), 7.0)
# Build: a filtered arpeggio rises out of the intro into the drop.
for i in range(16):
    n = [64, 67, 71, 72][i % 4] + (12 if i >= 8 else 0)
    music.add(glass_pluck(n, 0.4, 0.035 + 0.04 * i / 16, cutoff=1500 + 250 * i), DROP - 2.4 + i * STEP, pan=-0.3 if i % 2 else 0.3)

# Main section (12-36s): clean, uplifting, sidechained four-on-the-floor.
ARP = [0, 2, 1, 3, 2, 1, 3, 2]
for bar in range(5, 15):
    t0 = bar * BAR
    root, notes = PROG[(bar - 5) % 4]
    music.add(pad(notes + [notes[1] + 12], BAR + 0.3, cutoff=2600, gain=0.024), t0)
    send.add(pad(notes, BAR + 0.3, cutoff=2600, gain=0.016), t0)
    music.add(piano_chord([n + 12 for n in notes], 2.4, 0.5, roll=0.012), t0, gain=0.55)
    for s16 in range(16):
        n = notes[ARP[s16 % 8]] + 12 + (12 if s16 in (6, 14) else 0)
        acc = 1.0 if s16 % 4 == 0 else 0.7
        music.add(glass_pluck(n, 0.45, 0.05 * acc, cutoff=4200), t0 + s16 * STEP, pan=-0.25 if s16 % 2 else 0.25)
        if s16 % 4 == 2:
            pingpong(send, glass_pluck(n, 0.45, 0.03), t0 + s16 * STEP, 0.7)
    for b4 in range(4):
        drums.add(soft_kick(), t0 + b4 * BEAT)
        drums.add(hat(), t0 + b4 * BEAT + BEAT / 2, gain=0.55, pan=0.2)
    for b4 in (1, 3):
        drums.add(soft_clap(), t0 + b4 * BEAT, pan=0.05)
        send.add(soft_clap(), t0 + b4 * BEAT, gain=0.5)
    for st, d in [(0, 0.55), (6, 0.32), (8, 0.55), (14, 0.28)]:
        music.add(warm_sub(root, d), t0 + st * STEP)
    if bar % 4 == 0:
        music.add(air(BAR, 0.01), t0)

# Breakdown (36-38.4s): piano alone under "Every customer. Always answered."
music.add(pad(FMAJ9[1] + [72], 2.6, cutoff=3200, gain=0.034), BREAK)
send.add(pad(FMAJ9[1] + [72], 2.6, cutoff=3200, gain=0.026), BREAK)
music.add(piano_chord([n + 12 for n in FMAJ9[1]], 2.4, 0.7), BREAK, gain=1.0)
send.add(piano_chord([n + 12 for n in FMAJ9[1]], 2.4, 0.7), BREAK, gain=0.6)
for k, n in enumerate([72, 74, 76, 79]):
    music.add(felt_piano(n, 1.4, 0.5), BREAK + 1.2 + k * STEP * 2, pan=0.15)

# Final (38.4s-end): one big warm Cmaj9 bloom, gentle pulse under the CTA.
final = [48, 55, 59, 62, 64, 71]
music.add(pad(final, DUR - FINAL, cutoff=3400, gain=0.04), FINAL)
send.add(pad(final, DUR - FINAL, cutoff=3400, gain=0.032), FINAL)
music.add(piano_chord([n + 12 for n in final], 4.5, 0.85, roll=0.03), FINAL, gain=1.0)
send.add(piano_chord([n + 12 for n in final], 4.5, 0.85, roll=0.03), FINAL, gain=0.7)
music.add(warm_sub(36, 3.5) * np.linspace(1, 0, int(3.5 * SR)), FINAL, gain=1.5)
drums.add(soft_kick(1.2), FINAL)
for s16 in range(32):
    t = FINAL + BAR + s16 * STEP
    if t > DUR - 1.2:
        break
    n = final[1:][ARP[s16 % 8] % 5] + 12
    music.add(glass_pluck(n, 0.4, 0.03), t, pan=-0.25 if s16 % 2 else 0.25)
for i, n in enumerate([72, 76, 79, 83, 86, 88]):
    music.add(bell(midi(n), 2.4, 0.05, 0.8, 1.5), FINAL + 0.35 + i * 0.08, pan=(i - 2.5) / 4)
    send.add(bell(midi(n), 2.4, 0.05, 0.8, 1.5), FINAL + 0.35 + i * 0.08, gain=0.8)

# ----------------------------------------------------------------------- cues
# Cue times follow the picture: scene starts are fixed, word times come from vo.json, so the
# same events the scenes key off (stamp on "lost", the tap, the click) land here too.
VOJ = json.load(open(os.path.join(ROOT, "src", "vo.json")))
SC = {"hook": 0, "buzz": 50, "lost": 252, "meet": 360, "chat": 498, "needs": 834, "store": 918, "broadcast": 990, "tagline": 1080, "outro": 1152}


def wf(key, i):
    """Global frame of word i of a VO line (same rounding as timeline.ts)."""
    line = VOJ[key]
    return int(round((line["start"] + line["words"][i]["t"]) * FPS))


def vat(key):
    return int(round(VOJ[key]["start"] * FPS))


# ElevenLabs one-shots, when present, replace the synthesized versions name by name.
EL_SFX = os.path.join(ROOT, "public", "el", "sfx")
_el_cache, _el_rr = {}, {}


def el_sample(name):
    files = sorted(f for f in os.listdir(EL_SFX) if f.startswith(name + "_")) if os.path.isdir(EL_SFX) else []
    if not files:
        return None
    k = _el_rr.get(name, 0)
    _el_rr[name] = k + 1
    f = files[k % len(files)]
    if f not in _el_cache:
        _el_cache[f] = decode(os.path.join(EL_SFX, f))
    return _el_cache[f]


def decode(path):
    import subprocess
    ff = os.environ.get("FFMPEG", "ffmpeg")
    raw = subprocess.run([ff, "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).copy()
    fade = min(len(x), int(0.004 * SR))
    x[-fade:] *= np.linspace(1, 0, fade)
    return x


SYNTH = {
    "whoosh_soft": lambda: whoosh(0.6, 200, 3200, 0.22, -0.4, 0.4),
    "whoosh_whip": lambda: whoosh(0.32, 600, 7000, 0.3, -0.6, 0.6),
    "riser_rush": lambda: riser(1.2, 0.3),
    "swell": lambda: riser(1.6, 0.22),
    "logo_impact": lambda: impact(1.0) + 0,
    "sub_drop": lambda: impact(0.6),
    "notif": lambda: ping(g=0.18),
    "pop": lambda: bubble_in(0.2),
    "click": lambda: click(1.2),
    "tick": lambda: blip(1175, 0.08, 0.14),
    "success": lambda: chime((79, 84, 88, 91), 0.09, 0.045),
    "stamp": lambda: thud(0.6),
    "card_flip": lambda: whoosh(0.25, 900, 6000, 0.12, 0.2, 0.6),
    "burst": lambda: sparkle(0.8, 22, 0.05),
    "confetti": lambda: sparkle(0.6, 16, 0.05),
}
# Relative levels so EL one-shots sit like the synthesized ones (EL files come in hot).
EL_GAIN = {"whoosh_soft": 0.32, "whoosh_whip": 0.34, "riser_rush": 0.4, "swell": 0.36, "logo_impact": 0.6, "sub_drop": 0.45,
           "notif": 0.3, "pop": 0.26, "click": 0.4, "tick": 0.26, "success": 0.3, "stamp": 0.5, "card_flip": 0.3,
           "burst": 0.34, "confetti": 0.3, "clock": 0.2, "ui_build": 0.26, "typing": 0.22}


def play(name, frame, g=1.0, pan=0.0, end=None, bus=None):
    """Place a named one-shot at a (fractional) frame; `end` aligns the sample's END to that frame."""
    x = el_sample(name)
    if x is not None:
        x = x * EL_GAIN.get(name, 0.3)
    elif name in SYNTH:
        x = SYNTH[name]()
    else:
        return
    t = fr(frame) if end is None else fr(end) - len(x) / SR
    (bus or sfx).add(x * g, max(0.0, t), pan=pan)


def clock_ticks(f0, f1, step=3):
    if el_sample("clock") is not None:
        play("clock", f0, 0.9)
        return
    for k in range(f0, f1, step):
        sfx.add(blip(1600, 0.025, 0.05), fr(k), pan=0.2)


def typing(f0, n, pan=-0.3):
    if el_sample("typing") is not None:
        play("typing", f0, 1.0, pan)
        return
    for k in range(n):
        sfx.add(key(0.8), fr(f0 + k * 1.1), pan=pan)


def ui_build(f0, n=4, step=4, pan=0.0):
    if el_sample("ui_build") is not None:
        play("ui_build", f0, 1.0, pan)
        return
    for i in range(n):
        sfx.add(blip(880 + i * 140, 0.07, 0.11), fr(f0 + i * step), pan=pan + i * 0.1)


# S01 hook: ellipsis becomes a typing bubble, camera dives in.
play("pop", 36, 0.8, 0.1)
play("riser_rush", 0, 0.9, end=58)

# S02 buzz: ambient pings, then the camera snaps to each customer, burst, rush into Amina.
B = SC["buzz"]
for p in [16, 32, 44, 56, 68]:
    play("notif", B + p, 0.55, 0.35)
    sfx.add(vibrate(0.3, 0.1), fr(B + p) + 0.02, pan=0.35)
for k, pan in [("c1", -0.35), ("c2", 0.15), ("c3", -0.35), ("c4", 0.45)]:
    play("notif", vat(k) - 2, 0.9, pan)
    sfx.add(vibrate(0.28, 0.1), fr(vat(k)), pan=pan)
for at in [B + 79, B + 106, B + 130, B + 163]:
    play("whoosh_soft", at, 0.55, 0.0)
for i in range(8):
    play("notif", B + 176 + i * 2.5, 0.32, -0.7 + i * 0.2)
play("riser_rush", 0, 1.0, end=B + 210)

# S03 lost: clock rolls, the stamp lands on "lost", the card falls away.
L = SC["lost"]
clock_ticks(L + 6, L + 54)
lost = wf("l03", 10)
play("stamp", lost, 1.0, -0.15)
play("sub_drop", lost, 0.5)
play("whoosh_soft", lost + 8, 0.45, -0.2)
play("swell", 0, 0.9, end=SC["meet"] - 1)

# S04 meet: the logo slam on the drop, words, the Live pill.
M = SC["meet"]
play("logo_impact", M - 1, 1.0)
send.add(impact(0.35), DROP)
play("whoosh_soft", wf("l04", 1) - 3, 0.4, 0.3)
play("whoosh_soft", wf("l05", 0) - 12, 0.3, -0.2)
play("pop", wf("l05", 5) + 4, 0.7, 0.1)

# S05 chat: iris in, conversation, orbit, catalog, whip, order, MoMo, tracker.
C = SC["chat"]
a = [wf("l06", i) - C for i in range(14)]
b = [wf("l07", i) - C for i in range(18)]
play("whoosh_soft", C - 8, 0.6, -0.3)
play("pop", C + 4, 0.8, -0.4)
typing(C + 20, 12, -0.4)
play("pop", C + 40, 0.8, -0.3)
play("whoosh_soft", C + 24, 0.4, 0.2)
for i in range(5):
    play("tick", C + a[7] - 4 + i * 3, 0.6, -0.5 + i * 0.25)
play("whoosh_soft", C + a[4], 0.4, -0.3)
play("whoosh_soft", C + a[8], 0.5, 0.5)
for i in range(4):
    play("card_flip", C + a[10] - 10 + i * 4, 0.45, 0.2 + i * 0.15)
play("pop", C + a[10], 0.6, -0.3)
play("tick", C + a[13], 0.9, 0.3)
play("whoosh_whip", C + 162, 0.9, -0.5)
play("pop", C + b[0] - 4, 0.7, -0.4)
typing(C + b[0] + 8, 8, -0.4)
play("pop", C + b[3], 0.8, -0.3)
play("success", C + b[3] + 2, 0.45, -0.2)
play("whoosh_soft", C + b[4] - 6, 0.45, 0.2)
play("pop", C + b[4], 0.7, -0.3)
play("card_flip", C + b[6] - 4, 0.9, 0.4)
play("pop", C + b[9] - 14, 0.6, -0.4)
play("success", C + b[9], 0.9, 0.4)
play("whoosh_soft", C + b[9] - 2, 0.5, 0.5)
step_at = [b[9], b[9] + 5, b[10] + 2, b[14], b[17]]
for i, s_ in enumerate(step_at):
    play("tick", C + s_, 0.55 + 0.1 * i, 0.3 + i * 0.08)
play("confetti", C + step_at[4], 0.9, 0.4)
play("whoosh_whip", C + 326, 1.0, 0.5)

# S06 needs: whip-in, the scroll, the flag, the push.
N_ = SC["needs"]
needs_at = wf("l08", 8) - 2
for k in range(N_ + 2, needs_at - 6, 4):
    sfx.add(blip(1500, 0.022, 0.035), fr(k), pan=0.1)
play("tick", needs_at, 0.9, 0.1)
play("notif", needs_at + 6, 0.9, 0.5)
play("whoosh_soft", needs_at + 4, 0.3, 0.6)
play("whoosh_soft", SC["store"] - 8, 0.5, 0.0)

# S07 store: URL typed, storefront builds, Live.
S_ = SC["store"]
typing(S_ - 4, 18, -0.4)
ui_build(S_ + 14, 4, 4, 0.3)
play("pop", wf("l09", 3) - 2, 0.8, -0.3)
play("success", wf("l09", 3), 0.4, -0.3)
play("whoosh_soft", SC["broadcast"] - 8, 0.5, 0.0)

# S08 broadcast: the one tap and 43 customers lighting up.
tap = wf("l10", 6)
play("whoosh_soft", SC["broadcast"] + 8, 0.4, -0.3)
play("click", tap, 1.0, -0.3)
play("burst", tap + 1, 1.0, 0.0)
for i in range(6):
    sfx.add(pluck(76 + [0, 3, 5, 7, 10, 12][i], 0.3, 0.05), fr(tap + 3 + i * 3), pan=-0.6 + i * 0.24)
play("success", tap + 22, 0.5, 0.1)

# S09 tagline: fly-through, then the swell into the final hit.
T_ = SC["tagline"]
play("whoosh_soft", T_ - 6, 0.5, 0.0)
play("whoosh_soft", T_ + 30, 0.3, -0.4)
play("swell", 0, 1.0, end=SC["outro"] - 1)

# S10 outro: logo slam, wordmark, CTA, the click.
O = SC["outro"]
play("logo_impact", O - 1, 1.05)
send.add(impact(0.4), FINAL)
play("whoosh_soft", wf("l12", 0) - 4, 0.4, 0.3)
play("pop", wf("l12", 1) - 4, 0.7, 0.0)
cta_click = wf("l12", 4) + 2
play("click", cta_click, 1.0, 0.2)
play("confetti", cta_click + 2, 0.5, 0.2)

# ------------------------------------------------------------------------- VO
vo = Bus()
vo_cust = Bus()
meta = json.load(open(os.path.join(ROOT, "src", "vo.json")))


def load(key):
    a, sr = sf.read(os.path.join(ROOT, "public", "vo", key + ".wav"))
    return resample_poly(a, SR, sr)


def narrator_chain(x):
    # ElevenLabs reads arrive clean and already bright: a light polish, not a rebuild.
    x = flt(x, "high", 70)
    x = shelf(x, 200, 1.0, high=False)
    x = peak_eq(x, 3500, 1.2, 0.9)
    x = shelf(x, 11000, 1.2, high=True)
    # De-esser: duck the 5.5-9k band when it spikes.
    s = flt(x, "band", [5500, 9000])
    lvl = np.sqrt(flt(s**2, "low", 40, 1).clip(1e-12))
    thr = np.percentile(lvl, 92)
    g = np.minimum(1, (thr / np.maximum(lvl, 1e-9)) ** 0.5)
    x = x - s + s * g
    # Gentle 2.2:1 compression to sit forward in the mix.
    lv = np.sqrt(flt(x**2, "low", 18, 1).clip(1e-12))
    db = 20 * np.log10(lv / lv.max())
    gr = np.minimum(0, -(db + 16) * (1 - 1 / 2.2))
    x = x * 10 ** (gr / 20)
    return x / np.max(np.abs(x)) * 0.89


def phone_chain(x):
    x = flt(x, "band", [380, 3300], 3)
    x = np.tanh(x * 2.4) / 2.4
    return x / np.max(np.abs(x)) * 0.5


for key, m in meta.items():
    a = load(key)
    if key.startswith("c"):
        vo_cust.add(phone_chain(a), m["start"], pan=m.get("pan", 0))
    else:
        vo.add(narrator_chain(a), m["start"])

vo_mix = vo.b + vo_cust.b * 0.85
vo_mix = vo_mix + verb(vo.b, IR_ROOM, 0.07)

# Duck the score under the voice: smooth envelope of narrator energy.
ve = np.sqrt(flt(np.mean(vo.b**2 + (vo_cust.b * 0.7) ** 2, axis=0), "low", 8, 1).clip(0))
ve = ve / ve.max()
duck = 1 - 0.6 * np.clip(ve * 6, 0, 1)
duck = flt(duck, "low", 6, 1)

wet = verb(send.b + 0.12 * music.b, IR_HALL, 0.5) + verb(sfx.b * 0.18 + drums.b * 0.05, IR_ROOM, 0.35)
bed = (music.b * 0.95 + drums.b * 0.85 + wet) * duck
mix = bed + sfx.b * 0.9 + vo_mix * 1.0
mix = flt(mix, "high", 28)

fade = np.ones(N)
fn = int(1.6 * SR)
fade[-fn:] = np.linspace(1, 0, fn) ** 1.6
mix *= fade

# Loudness: -14 LUFS integrated, peaks held under -1 dBFS by a soft limiter.
meter = pyln.Meter(SR)
for _ in range(3):
    lufs = meter.integrated_loudness(mix.T)
    mix *= 10 ** ((-14.0 - lufs) / 20)
    mix = np.tanh(mix / 0.89) * 0.89

lufs = meter.integrated_loudness(mix.T)
pk = 20 * np.log10(np.max(np.abs(mix)))
out = os.path.join(ROOT, "public", "audio", "getorda-v2-mix.wav")
pcm = np.clip(mix.T + rng.uniform(-1, 1, mix.T.shape) / 32768, -1, 1)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((pcm * 32767).astype("<i2").tobytes())
print(f"wrote {out}  LUFS={lufs:.1f}  peak={pk:.2f} dBFS")
