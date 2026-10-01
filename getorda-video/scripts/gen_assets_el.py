#!/usr/bin/env python3
"""Generate customer voices, sound effects and the music bed with ElevenLabs.

Usage:  EL_KEY=... python3 scripts/gen_assets_el.py [customers] [sfx] [music]
        (no args = all three)
Writes  public/el/{customers,sfx,music}/... and public/el/report.json.
The key is read from the environment only; never commit it.
"""
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.elevenlabs.io"
KEY = os.environ.get("EL_KEY", "").strip()
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "el")

CUSTOMERS = [
    # key, text, voice name, voice id
    ("c1", "Hey, how much is this one?", "Will", "bIHbv24MWmeRgasZH58o"),
    ("c2", "Is it still available?", "Lily", "pFZP5JQG7iQjIQuC4Bku"),
    ("c3", "Can you deliver today?", "Chris", "iP95p4xoKVk53GoZ742B"),
    ("c4", "Hello? Are you there?", "Laura", "FGY2WhTYpPnrIDTdsKH5"),
]
CUST_SETTINGS = {"stability": 0.38, "similarity_boost": 0.75, "style": 0.3, "use_speaker_boost": True}

# name, prompt, seconds, takes. Clean, minimal, premium tech-ad sound design.
SFX = [
    ("whoosh_soft", "Soft airy cinematic whoosh transition, clean and modern, premium tech product video, no music", 1.2, 2),
    ("whoosh_whip", "Very fast crisp whip pan swish transition, short and clean", 0.6, 2),
    ("riser_rush", "Rising airy whoosh riser accelerating into a bright soft impact, cinematic, clean", 1.8, 2),
    ("logo_impact", "Deep cinematic logo reveal impact with a soft sub boom and a shimmering glassy sparkle tail, premium technology brand", 3.0, 2),
    ("notif", "Modern smartphone message notification chime, short, soft, glassy and pleasant", 0.6, 3),
    ("pop", "Soft bubbly pop, chat message bubble appearing, subtle UI sound", 0.4, 2),
    ("click", "Soft crisp trackpad click, minimal UI", 0.3, 2),
    ("tick", "Delicate glassy UI tick, confirmation, subtle", 0.4, 2),
    ("success", "Bright positive two-note success chime, payment confirmed, modern app, clean", 1.2, 2),
    ("stamp", "Heavy rubber stamp thud on paper, dramatic, tight", 0.7, 2),
    ("clock", "Fast ticking clock, time passing quickly, clean", 1.6, 1),
    ("card_flip", "Quick light card flip swoosh", 0.5, 2),
    ("ui_build", "A quick sequence of soft digital pops and ticks as interface elements appear one by one, modern, airy", 1.5, 2),
    ("burst", "Magical airy swoosh bursting outward with many tiny soft sparkling pings, uplifting", 1.8, 2),
    ("swell", "Airy reverse cymbal swell rising into a soft bright shimmer, cinematic", 2.2, 2),
    ("confetti", "Light celebratory sparkle and soft confetti pop, short and joyful", 1.2, 2),
    ("typing", "Soft phone keyboard typing taps, light and quick", 1.0, 1),
    ("sub_drop", "Deep clean sub bass drop boom, cinematic, short tail", 1.6, 2),
]

MUSIC_PLAN = {
    "positive_global_styles": [
        "premium modern technology brand film score", "Apple keynote style", "optimistic", "warm and polished",
        "felt piano", "soft analog synth pads", "airy plucks", "clean minimal production", "100 BPM", "instrumental",
    ],
    "negative_global_styles": ["vocals", "singing", "rap", "afrobeat", "amapiano", "dubstep", "aggressive", "lo-fi hiss", "cheesy corporate"],
    "sections": [
        {"section_name": "Intro", "positive_local_styles": ["intimate felt piano", "soft pads", "curious and slightly tense", "sparse", "no drums"], "negative_local_styles": ["drums", "bass drop"], "duration_ms": 12000, "lines": []},
        {"section_name": "Lift", "positive_local_styles": ["confident lift", "tight minimal kick and claps", "warm sub bass", "glassy plucked arpeggio", "bright and modern", "driving but elegant"], "negative_local_styles": ["heavy distortion"], "duration_ms": 14400, "lines": []},
        {"section_name": "Build", "positive_local_styles": ["fuller arrangement", "shimmering synths", "rising energy", "uplifting chords"], "negative_local_styles": ["chaotic"], "duration_ms": 12000, "lines": []},
        {"section_name": "Finale", "positive_local_styles": ["big warm resolving chord", "piano and pads", "triumphant but calm", "long reverb tail", "fade to silence"], "negative_local_styles": ["drums continuing"], "duration_ms": 6600, "lines": []},
    ],
}
MUSIC_PROMPT = (
    "Premium modern technology brand film score, instrumental, 100 BPM, Apple keynote style. 0-12s: intimate felt piano and soft pads, curious, no drums. "
    "At 12s a confident elegant lift with minimal kick, claps, warm sub bass and glassy plucked arpeggios. Builds with shimmering synths and uplifting chords. "
    "At 38.4s a big warm resolving chord with piano and pads, long reverb tail to silence at 45s. No vocals, not afrobeat, not cheesy."
)

report = {"customers": {}, "sfx": {}, "music": {}, "errors": []}


def call(method, path, body=None, query=None, want_json=True):
    url = API + path + ("?" + urllib.parse.urlencode(query) if query else "")
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    r.add_header("xi-api-key", KEY)
    if data is not None:
        r.add_header("content-type", "application/json")
    for attempt in range(4):
        try:
            with urllib.request.urlopen(r, timeout=300) as resp:
                raw = resp.read()
                return json.loads(raw.decode()) if want_json else raw
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")[:500]
            if e.code in (429, 500, 502, 503) and attempt < 3:
                time.sleep(2 ** (attempt + 2))
                continue
            raise RuntimeError(f"HTTP {e.code} {path}: {msg}")
        except urllib.error.URLError as e:
            if attempt < 3:
                time.sleep(2 ** (attempt + 1))
                continue
            raise RuntimeError(f"URL error {path}: {e}")


def first_ok(fn, formats):
    last = None
    for fmt in formats:
        try:
            return fmt, fn(fmt)
        except RuntimeError as e:
            last = e
            if "HTTP 4" in str(e) and "HTTP 422" not in str(e):
                continue
            raise
    raise last


def customers():
    d = os.path.join(OUT, "customers")
    os.makedirs(d, exist_ok=True)
    for key, text, name, vid in CUSTOMERS:
        try:
            fmt, res = first_ok(
                lambda fmt: call("POST", f"/v1/text-to-speech/{vid}/with-timestamps", {"text": text, "model_id": "eleven_multilingual_v2", "voice_settings": CUST_SETTINGS}, {"output_format": fmt}),
                ["mp3_44100_192", "mp3_44100_128"],
            )
            with open(os.path.join(d, key + ".mp3"), "wb") as fh:
                fh.write(base64.b64decode(res["audio_base64"]))
            with open(os.path.join(d, key + ".json"), "w") as fh:
                json.dump({"text": text, "voice": name, "alignment": res.get("alignment")}, fh)
            report["customers"][key] = {"voice": name, "format": fmt}
            print("customer", key, name, flush=True)
        except RuntimeError as e:
            report["errors"].append(f"customer {key}: {e}")
            print("customer failed", key, e, flush=True)


def sfx():
    d = os.path.join(OUT, "sfx")
    os.makedirs(d, exist_ok=True)
    for name, prompt, secs, takes in SFX:
        for t in range(takes):
            path = os.path.join(d, f"{name}_{t + 1}.mp3")
            try:
                body = {"text": prompt, "duration_seconds": secs, "prompt_influence": 0.6}
                try:
                    fmt, raw = first_ok(lambda fmt: call("POST", "/v1/sound-generation", dict(body, model_id="eleven_text_to_sound_v2"), {"output_format": fmt}, want_json=False), ["mp3_44100_192", "mp3_44100_128"])
                except RuntimeError as e:
                    if "422" not in str(e) and "model" not in str(e).lower():
                        raise
                    fmt, raw = first_ok(lambda fmt: call("POST", "/v1/sound-generation", body, {"output_format": fmt}, want_json=False), ["mp3_44100_192", "mp3_44100_128"])
                with open(path, "wb") as fh:
                    fh.write(raw)
                report["sfx"].setdefault(name, []).append(os.path.basename(path))
                print("sfx", name, t + 1, flush=True)
            except RuntimeError as e:
                report["errors"].append(f"sfx {name}: {e}")
                print("sfx failed", name, e, flush=True)


def music():
    d = os.path.join(OUT, "music")
    os.makedirs(d, exist_ok=True)
    attempts = [
        ("plan", {"composition_plan": MUSIC_PLAN, "respect_sections_durations": True}),
        ("plan", {"composition_plan": MUSIC_PLAN}),
        ("prompt", {"prompt": MUSIC_PROMPT, "music_length_ms": 45000}),
    ]
    made = 0
    for take in range(2):
        for kind, body in attempts:
            try:
                fmt, raw = first_ok(lambda fmt: call("POST", "/v1/music", dict(body, model_id="music_v1"), {"output_format": fmt}, want_json=False), ["mp3_44100_192", "mp3_44100_128"])
                path = os.path.join(d, f"music_{kind}_{take + 1}.mp3")
                with open(path, "wb") as fh:
                    fh.write(raw)
                report["music"][os.path.basename(path)] = {"kind": kind, "format": fmt}
                print("music", kind, take + 1, flush=True)
                made += 1
                break
            except RuntimeError as e:
                report["errors"].append(f"music {kind}: {e}")
                print("music failed", kind, e, flush=True)
    return made


def main():
    if not KEY:
        sys.exit("EL_KEY is not set")
    os.makedirs(OUT, exist_ok=True)
    which = set(sys.argv[1:]) or {"customers", "sfx", "music"}
    try:
        sub = call("GET", "/v1/user/subscription")
        report["tier"] = sub.get("tier")
        report["chars_left_before"] = sub.get("character_limit", 0) - sub.get("character_count", 0)
    except RuntimeError as e:
        report["errors"].append(str(e))
    if "customers" in which:
        customers()
    if "sfx" in which:
        sfx()
    if "music" in which:
        music()
    with open(os.path.join(OUT, "report.json"), "w") as fh:
        json.dump(report, fh, indent=2)
    print("DONE", flush=True)


if __name__ == "__main__":
    main()
