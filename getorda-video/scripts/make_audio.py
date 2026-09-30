"""Original score + sound design for the GetOrda promo, synthesized from scratch.

120 BPM, 30fps video: 1 beat = 15 frames, 1 bar = 60 frames. All cue frames
below are absolute video frames and mirror src/timeline.ts + scene timings.
Run: python3 scripts/make_audio.py  ->  public/audio/getorda-mix.wav
"""
import os
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
DUR = 42.0
N = int(SR * DUR)
FPS = 30
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
rng = np.random.default_rng(7)


def fr(frame):
    return frame / FPS


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def t_(d):
    return np.arange(int(d * SR)) / SR


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


class Bus:
    def __init__(self):
        self.b = np.zeros((2, N))

    def add(self, sig, t, gain=1.0, pan=0.0):
        if sig.ndim == 1:
            l = sig * np.sqrt(0.5 * (1 - pan))
            r = sig * np.sqrt(0.5 * (1 + pan))
            sig = np.vstack([l, r]) * np.sqrt(2)
        i = int(t * SR)
        if i >= N:
            return
        if i < 0:
            sig = sig[:, -i:]
            i = 0
        n = min(sig.shape[1], N - i)
        self.b[:, i : i + n] += sig[:, :n] * gain


def reverb_ir(seconds=2.4, damp=5000, decay=2.6):
    t = t_(seconds)
    env = np.exp(-t * decay)
    ir = np.vstack([lp(rng.standard_normal(len(t)), damp) * env, lp(rng.standard_normal(len(t)), damp) * env])
    ir[:, : int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    return ir / np.sqrt(np.sum(ir**2, axis=1, keepdims=True))


IR = reverb_ir()
IR_BIG = reverb_ir(4.0, 3500, 1.3)


def reverb(bus, ir, wet):
    out = np.vstack([fftconvolve(bus[0], ir[0])[:N], fftconvolve(bus[1], ir[1])[:N]])
    return out * wet


def env_ar(n, a, r):
    e = np.ones(n)
    na = max(1, int(a * SR))
    nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    if nr < n:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


# ---------------------------------------------------------------- instruments
def kick():
    t = t_(0.5)
    f = 44 + 120 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 9)
    click = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 400) * 0.25
    return np.tanh((body + click * 1.6) * 1.6) * 0.5


def clap():
    t = t_(0.35)
    n = rng.standard_normal(len(t))
    e = np.zeros(len(t))
    for k, off in enumerate([0, 0.011, 0.022]):
        i = int(off * SR)
        e[i:] += np.exp(-(t[: len(t) - i]) * (220 if k < 2 else 16))
    return bp(n, 900, 5200) * e * 0.9


def hat(open_=False):
    t = t_(0.28 if open_ else 0.07)
    n = hp(rng.standard_normal(len(t)), 7500, 3)
    return n * np.exp(-t * (13 if open_ else 70)) * (0.42 if open_ else 0.34)


def shaker():
    t = t_(0.08)
    n = bp(rng.standard_normal(len(t)), 5000, 11000)
    e = np.minimum(t / 0.006, 1) * np.exp(-t * 45)
    return n * e * 0.2


def saw(f, t, detune_cents=0.0):
    f = f * 2 ** (detune_cents / 1200)
    out = np.zeros_like(t)
    k = 1
    while f * k < 9000:
        out += np.sin(2 * np.pi * f * k * t + k * 0.7) / k
        k += 1
    return out


def pad_chord(notes, dur, cutoff=2400, gain=0.05):
    t = t_(dur)
    L = np.zeros(len(t))
    R = np.zeros(len(t))
    for i, n in enumerate(notes):
        f = midi(n)
        L += saw(f, t, -8) + 0.6 * saw(f, t, 4)
        R += saw(f, t, 8) + 0.6 * saw(f, t, -3)
    e = env_ar(len(t), min(0.5, dur * 0.3), min(0.7, dur * 0.35))
    L = lp(L, cutoff, 2) * e
    R = lp(R, cutoff, 2) * e
    return np.vstack([L, R]) * gain


def pluck(n, dur=0.6, bright=1.6, gain=0.18):
    t = t_(dur)
    f = midi(n)
    mod = bright * np.exp(-t * 14) * np.sin(2 * np.pi * 2 * f * t)
    s = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 7.5)
    s *= np.minimum(t / 0.002, 1)
    return s * gain


def bell(f, dur=0.9, gain=0.2, idx=2.2, decay=5.0):
    t = t_(dur)
    mod = idx * np.exp(-t * 6) * np.sin(2 * np.pi * f * 3.5 * t)
    s = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * decay)
    s *= np.minimum(t / 0.0015, 1)
    return s * gain


def bass_note(n, dur):
    t = t_(dur)
    f = midi(n)
    s = np.sin(2 * np.pi * f * t) + 0.28 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * saw(f, t)
    s = np.tanh(s * 1.4) * env_ar(len(t), 0.004, 0.05)
    return hp(lp(s, 900), 45) * 0.2


# ---------------------------------------------------------------------- sfx
def svf_sweep(x, f0, f1, q=2.0, curve=None):
    """Band-pass state-variable filter with a moving centre frequency."""
    n = len(x)
    if curve is None:
        curve = np.linspace(0, 1, n)
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


def whoosh(d=0.5, f0=350, f1=4200, gain=0.5):
    n = int(d * SR)
    x = rng.standard_normal(n)
    c = np.sin(np.linspace(0, np.pi, n))
    y = svf_sweep(x, f0, f1, 1.6, curve=np.linspace(0, 1, n) ** 0.8) * c**1.6
    pan = np.linspace(-0.7, 0.7, n)
    return np.vstack([y * np.sqrt(0.5 * (1 - pan)), y * np.sqrt(0.5 * (1 + pan))]) * np.sqrt(2) * gain


def riser(d, gain=0.45):
    n = int(d * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    ramp = (t / d) ** 2.2
    y = svf_sweep(x, 250, 9000, 2.5, curve=(t / d) ** 1.4) * ramp
    tone = np.sin(2 * np.pi * np.cumsum(180 * 2 ** (3 * t / d)) / SR) * ramp * 0.18
    return (y + tone) * gain


def impact(gain=1.0):
    t = t_(2.2)
    f = 36 + 60 * np.exp(-t * 5)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    crash = lp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 3.5) * 0.35
    return np.tanh((sub + crash) * 1.3) * 0.8 * gain


def pop(f0=880, gain=0.22):
    t = t_(0.09)
    f = f0 * (0.55 + 0.45 * np.exp(-t * 60))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 45)
    return s * gain


def click():
    t = t_(0.012)
    a = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 700)
    b = np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 900) * 0.4
    out = np.zeros(int(0.09 * SR))
    out[: len(t)] += (a + b) * 0.5
    out[int(0.065 * SR) : int(0.065 * SR) + len(t)] += (a + b) * 0.3
    return out


def tap():
    t = t_(0.08)
    s = np.sin(2 * np.pi * np.cumsum(260 * (0.7 + 0.3 * np.exp(-t * 50))) / SR) * np.exp(-t * 60)
    return (s * 0.4 + hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 500) * 0.15)


def key():
    t = t_(0.03)
    n = bp(rng.standard_normal(len(t)), 1800, 6000) * np.exp(-t * 300)
    th = np.sin(2 * np.pi * 170 * t) * np.exp(-t * 200) * 0.3
    return (n + th) * rng.uniform(0.09, 0.15)


def notif(i):
    base = [76, 79, 81, 84, 86, 88][i % 6]
    s = np.zeros(int(0.7 * SR))
    a = bell(midi(base), 0.6, 0.16, 1.4, 7)
    b = bell(midi(base + 5), 0.6, 0.14, 1.4, 7)
    s[: len(a)] += a
    o = int(0.075 * SR)
    s[o : o + len(b)] += b[: len(s) - o]
    return s


def chime():
    s = np.zeros(int(1.4 * SR))
    for i, n in enumerate([84, 88, 91, 96]):
        b = bell(midi(n), 1.2, 0.13, 1.2, 4)
        o = int(i * 0.055 * SR)
        s[o : o + len(b)] += b[: len(s) - o]
    return s


def sparkle(d=0.5, count=16, gain=0.06):
    s = np.zeros(int((d + 0.3) * SR))
    for _ in range(count):
        f = rng.uniform(3000, 7500)
        b = bell(f, 0.25, gain * rng.uniform(0.5, 1), 0.5, 18)
        o = int(rng.uniform(0, d) * SR)
        s[o : o + len(b)] += b[: len(s) - o]
    return s


# -------------------------------------------------------------------- music
music = Bus()
drums = Bus()
sfx = Bus()
send = Bus()  # reverb send

AM9 = (45, [57, 60, 64, 67, 71])
FMAJ9 = (41, [53, 57, 60, 64, 67])
CMAJ9 = (48, [52, 55, 59, 62, 64])
G6 = (43, [55, 59, 62, 64, 67])
PROG = [AM9, FMAJ9, CMAJ9, G6]

DROP = fr(180)
BREAK = fr(1080)
FINAL = fr(1140)

# Intro: filtered pad and a ticking clock under the notifications.
music.add(pad_chord(AM9[1], BAR * 2 + 0.3, cutoff=1100, gain=0.085), 0)
for i in range(32):
    drums.add(hat(), i * BEAT / 4, gain=0.45 if i % 4 else 0.75)
for b in range(4):
    drums.add(lp(kick(), 180) * 0.6, b * BEAT * 2, gain=0.55)

# Build: "Your customers never sleep."
music.add(pad_chord(FMAJ9[1], BAR + 0.1, cutoff=2200, gain=0.085), BAR * 2)
sfx.add(riser(BAR), BAR * 2, gain=0.55)
# Snare roll: 8ths for the first half-bar, 16ths into the drop.
roll = [BAR * 2 + k * BEAT / 2 for k in range(4)] + [BAR * 2 + BAR / 2 + k * BEAT / 4 for k in range(8)]
for i, tt in enumerate(roll):
    drums.add(clap(), tt, gain=0.12 + 0.4 * (i / len(roll)) ** 2)

# Groove: bars 3..17 (6s to 36s).
for bar in range(3, 18):
    t0 = bar * BAR
    root, notes = PROG[(bar - 3) % 4]
    full = bar >= 5
    music.add(pad_chord(notes, BAR + 0.25, cutoff=3200 if full else 2400, gain=0.075), t0)
    send.add(pad_chord(notes, BAR + 0.25, cutoff=2600, gain=0.02), t0)
    for beat in range(4):
        tb = t0 + beat * BEAT
        drums.add(kick(), tb, gain=0.95)
        if full and beat in (1, 3):
            drums.add(clap(), tb, gain=0.55)
            send.add(clap(), tb, gain=0.25)
        drums.add(hat(open_=True), tb + BEAT / 2, gain=0.8 if full else 0.5)
        for s16 in range(4):
            drums.add(shaker(), tb + s16 * BEAT / 4, gain=1.0 if s16 % 2 else 0.6)
        # Offbeat bass, octave jump on the last beat.
        music.add(bass_note(root + (12 if beat == 3 else 0), BEAT / 2 - 0.02), tb + BEAT / 2, gain=1.0)
    arp = [notes[i % len(notes)] + 12 for i in [0, 2, 1, 3, 2, 4, 3, 1]]
    for s16 in range(16):
        n = arp[s16 % 8]
        t = t0 + s16 * BEAT / 4
        g = 0.55 if s16 % 4 == 0 else 0.38
        music.add(pluck(n, 0.5, 1.4, 0.21), t, gain=g, pan=-0.35 if s16 % 2 else 0.35)
        send.add(pluck(n, 0.5, 1.4, 0.13), t + 0.375, gain=g * 0.5, pan=0.4 if s16 % 2 else -0.4)

# Breakdown for "Every customer. Always answered." then the final hit.
music.add(pad_chord(FMAJ9[1], BAR + 0.2, cutoff=3600, gain=0.09), BREAK)
send.add(pad_chord(FMAJ9[1], BAR + 0.2, cutoff=3200, gain=0.03), BREAK)
for s8 in range(8):
    n = [65, 69, 72, 76, 79, 76, 72, 69][s8]
    music.add(pluck(n, 0.8, 1.0, 0.24), BREAK + s8 * BEAT / 2, pan=-0.3 if s8 % 2 else 0.3)
    send.add(pluck(n, 0.8, 1.0, 0.14), BREAK + s8 * BEAT / 2 + 0.375, gain=0.6)
sfx.add(riser(BAR * 0.95), BREAK + BAR * 0.05, gain=0.4)

final = CMAJ9[1] + [72]
music.add(pad_chord(final, DUR - FINAL, cutoff=3400, gain=0.09), FINAL)
send.add(pad_chord(final, DUR - FINAL, cutoff=3000, gain=0.05), FINAL)
music.add(bass_note(36, 2.5) * np.linspace(1, 0, int(2.5 * SR)), FINAL, gain=1.2)
drums.add(kick(), FINAL, gain=1.1)
for i, n in enumerate([72, 76, 79, 83, 86, 88]):
    music.add(bell(midi(n), 2.0, 0.09, 1.0, 1.8), FINAL + 0.35 + i * 0.09, pan=(i - 2.5) / 4)
    send.add(bell(midi(n), 2.0, 0.09, 1.0, 1.8), FINAL + 0.35 + i * 0.09, gain=0.8)

# ---------------------------------------------------------------------- cues
# Hook notifications land on every beat.
for i, f in enumerate([14, 29, 44, 59, 74, 89]):
    sfx.add(notif(i), fr(f), gain=1.6, pan=0.1 * (i % 3 - 1))
    send.add(notif(i), fr(f), gain=0.35)
sfx.add(whoosh(0.55, 300, 2500, 0.35), fr(98))
# Kinetic words.
for f in [118, 132, 138]:
    sfx.add(pop(520, 0.1), fr(f))

sfx.add(impact(), DROP, gain=0.95)
send.add(impact(0.4), DROP)
sfx.add(whoosh(0.4, 500, 5000, 0.3), fr(198))
sfx.add(whoosh(0.7, 200, 6000, 0.45), fr(280))

# Chat scene (starts 300).
C0 = 300
sfx.add(pop(700, 0.2), fr(C0 + 8))
sfx.add(pop(900, 0.14), fr(C0 + 50))
for k in range(0, 30, 5):
    sfx.add(key() * 0.6, fr(C0 + 66 + k))
sfx.add(pop(1100, 0.22), fr(C0 + 96))
sfx.add(sparkle(0.25, 6, 0.04), fr(C0 + 97))
for i in range(5):
    sfx.add(pluck(81 + [0, 2, 4, 7, 9][i], 0.35, 0.8, 0.12), fr(C0 + 104 + i * 8), pan=-0.5 + i * 0.25)
sfx.add(pop(760, 0.2), fr(C0 + 138))
for k in range(0, 20, 5):
    sfx.add(key() * 0.6, fr(C0 + 150 + k))
sfx.add(pop(1100, 0.22), fr(C0 + 172))
sfx.add(chime(), fr(C0 + 176), gain=0.7)
send.add(chime(), fr(C0 + 176), gain=0.3)

# Scene cuts.
for cut in [540, 660, 840, 960, 1080]:
    sfx.add(whoosh(0.5, 300, 4500, 0.4), fr(cut - 9))

# Approve (540): click at +62.
A0 = 540
sfx.add(pop(620, 0.16), fr(A0 + 2))
sfx.add(click(), fr(A0 + 62), gain=1.3)
sfx.add(chime(), fr(A0 + 64), gain=0.95)
send.add(chime(), fr(A0 + 64), gain=0.4)
sfx.add(sparkle(0.5, 18, 0.06), fr(A0 + 64))
sfx.add(pop(820, 0.2), fr(A0 + 78))

# Store (660).
S0 = 660
sfx.add(whoosh(0.6, 150, 1800, 0.35), fr(S0 - 4))
url = "getorda.app/store/nia-skin"
for i in range(len(url)):
    sfx.add(key(), fr(S0 + 12 + i / 0.85), pan=0.4)
for f in [26, 40, 114, 148]:
    sfx.add(pop(880 + f, 0.16), fr(S0 + f))
sfx.add(tap(), fr(S0 + 100), gain=1.3)
sfx.add(pop(1300, 0.18), fr(S0 + 104))
sfx.add(tap(), fr(S0 + 140), gain=1.3)
sfx.add(chime(), fr(S0 + 143), gain=0.7)

# Broadcast (840): typing then send at +64.
B0 = 840
msg_len = 88
for i in range(0, msg_len, 2):
    tf = B0 + 12 + i / 1.95
    if tf < B0 + 60:
        sfx.add(key(), fr(tf), pan=-0.2 + 0.4 * rng.random())
sfx.add(click(), fr(B0 + 64), gain=1.3)
sfx.add(whoosh(0.45, 600, 7000, 0.45), fr(B0 + 64))
penta = [69, 72, 74, 76, 79, 81, 84, 86, 88, 91]
for i in range(27):
    n = penta[i % len(penta)] + (12 if i >= len(penta) * 2 else 0)
    sfx.add(pluck(n, 0.3, 0.9, 0.08), fr(B0 + 70 + i * 1.1 + 10), pan=np.cos(i / 27 * 2 * np.pi) * 0.8)
sfx.add(pop(900, 0.2), fr(B0 + 68))

# Analytics (960).
N0 = 960
sfx.add(whoosh(0.7, 120, 1500, 0.35), fr(N0 - 6))
for i in range(0, 48, 3):
    sfx.add(bell(2400 + i * 40, 0.05, 0.035 * (1 - i / 60), 0.2, 60), fr(N0 + 12 + i))
sfx.add(sparkle(1.4, 14, 0.035), fr(N0 + 20))
sfx.add(pop(1000, 0.2), fr(N0 + 72))
sfx.add(sparkle(0.3, 6, 0.05), fr(N0 + 73))

# Outro (1080).
for f in [1080, 1094]:
    sfx.add(pop(480, 0.08), fr(f))
sfx.add(impact(1.1), FINAL, gain=1.0)
send.add(impact(0.5), FINAL)
sfx.add(whoosh(0.5, 400, 4000, 0.3), fr(1148))
sfx.add(pop(700, 0.2), fr(1178))
sfx.add(sparkle(0.5, 12, 0.05), fr(1198))

# --------------------------------------------------------------------- mix
# Sidechain: duck music under each groove kick.
duck = np.ones(N)
dk = 1 - 0.55 * np.exp(-t_(0.3) * 12)
for bar in range(3, 18):
    for beat in range(4):
        i = int((bar * BAR + beat * BEAT) * SR)
        n = min(len(dk), N - i)
        duck[i : i + n] = np.minimum(duck[i : i + n], dk[:n])

wet = reverb(send.b + 0.15 * music.b, IR_BIG, 0.55) + reverb(sfx.b * 0.25 + drums.b * 0.08, IR, 0.5)
mix = music.b * duck * 1.0 + drums.b * 0.85 + sfx.b * 1.0 + wet * duck

# Bus compressor evens out intro, groove and breakdown levels.
mix = hp(mix, 30)
lvl = np.sqrt(lp(np.mean(mix**2, axis=0), 6, 1).clip(1e-9))
db = 20 * np.log10(lvl / np.max(lvl))
over = np.maximum(db + 14, 0)
gain_db = -over * (1 - 1 / 3.0)
mix = mix * 10 ** (gain_db / 20)
# Soft limiter.
peak = np.max(np.abs(mix))
mix = mix / peak * 1.25
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
fade = np.ones(N)
fn = int(1.4 * SR)
fade[-fn:] = np.linspace(1, 0, fn) ** 1.5
fi = int(0.02 * SR)
fade[:fi] = np.linspace(0, 1, fi)
mix *= fade
mix = mix / np.max(np.abs(mix)) * 0.93

out = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "getorda-mix.wav")
pcm = np.clip(mix.T + rng.uniform(-1, 1, mix.T.shape) / 32768, -1, 1)
pcm = (pcm * 32767).astype("<i2")
import wave

with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
rms = 20 * np.log10(np.sqrt(np.mean(mix**2)))
print(f"wrote {out}  dur={N / SR:.2f}s  rms={rms:.1f} dBFS")
