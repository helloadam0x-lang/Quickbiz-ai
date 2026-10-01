#!/usr/bin/env python3
"""Generate the GetOrda voiceover with ElevenLabs, with per-character timestamps.

Usage:  EL_KEY=... python3 scripts/gen_vo_el.py
Writes  public/vo-el/<variant>/<line>.{wav|mp3,json} and public/vo-el/report.json.
The key is read from the environment only; never commit it.
"""
import base64
import json
import os
import struct
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.elevenlabs.io"
KEY = os.environ.get("EL_KEY", "").strip()
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "vo-el")

# Words are split on spaces downstream, so hyphenated brand words stay one caption word.
NARRATOR = [
    ("l01", "Let me guess."),
    ("l02", "Your phone hasn't stopped buzzing since morning."),
    ("l03", "And every message you miss... is a sale you just lost."),
    ("l04", "Meet Get-Orda."),
    ("l05", "Your AI employee, right inside WhatsApp."),
    ("l06", "It answers every customer, in their own language, from your real products and prices."),
    ("l07", "It takes the order, shares your mobile money details, and tracks it all the way to their door."),
    ("l08", "And it only calls you when it truly needs you."),
    ("l09", "Your own store, live in a minute."),
    ("l10", "Your best customers, back in one tap."),
    ("l11", "Every customer. Always answered."),
    ("l12", "Get-Orda. Start free, at get-orda dot app."),
]
CUSTOMERS = [
    ("c1", "Hey, how much is this one?", "male"),
    ("c2", "Is it still available?", "female"),
    ("c3", "Can you deliver to Ntinda today?", "male"),
    ("c4", "Hello? Are you there?", "female"),
]
PREMADE = {
    "Jessica": "cgSgspJ2msm6clMCkdW9",
    "Sarah": "EXAVITQu4vr4xnSDxMaL",
    "Matilda": "XrExE9yKIg1WjnnlVkGX",
    "Will": "bIHbv24MWmeRgasZH58o",
    "Chris": "iP95p4xoKVk53GoZ742B",
    "Lily": "pFZP5JQG7iQjIQuC4Bku",
    "Charlotte": "XB0fDUnXU5powFXDhCwa",
}
# Narrator takes to compare: (variant name, voice, model, settings)
NARR_SETTINGS = {"stability": 0.42, "similarity_boost": 0.8, "style": 0.28, "use_speaker_boost": True, "speed": 1.0}
VARIANTS = [
    ("jessica-v2", "Jessica", "eleven_multilingual_v2", NARR_SETTINGS),
    ("sarah-v2", "Sarah", "eleven_multilingual_v2", NARR_SETTINGS),
    ("jessica-v3", "Jessica", "eleven_v3", {"stability": 0.5, "similarity_boost": 0.8, "use_speaker_boost": True}),
]
CUST_SETTINGS = {"stability": 0.35, "similarity_boost": 0.75, "style": 0.35, "use_speaker_boost": True}
FORMATS = ["pcm_44100", "mp3_44100_192", "mp3_44100_128"]

report = {"variants": {}, "customers": {}, "errors": [], "format": None}


def req(method, path, body=None, query=None):
    url = API + path + ("?" + urllib.parse.urlencode(query) if query else "")
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    r.add_header("xi-api-key", KEY)
    r.add_header("accept", "application/json")
    if data is not None:
        r.add_header("content-type", "application/json")
    for attempt in range(4):
        try:
            with urllib.request.urlopen(r, timeout=120) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")[:400]
            if e.code in (429, 500, 502, 503) and attempt < 3:
                time.sleep(2 ** (attempt + 1))
                continue
            raise RuntimeError(f"HTTP {e.code} {path}: {msg}")
        except urllib.error.URLError as e:
            if attempt < 3:
                time.sleep(2 ** (attempt + 1))
                continue
            raise RuntimeError(f"URL error {path}: {e}")


def write_audio(path_noext, b64, fmt):
    raw = base64.b64decode(b64)
    if fmt.startswith("pcm_"):
        sr = int(fmt.split("_")[1])
        with open(path_noext + ".wav", "wb") as fh:
            fh.write(b"RIFF" + struct.pack("<I", 36 + len(raw)) + b"WAVEfmt ")
            fh.write(struct.pack("<IHHIIHH", 16, 1, 1, sr, sr * 2, 2, 16))
            fh.write(b"data" + struct.pack("<I", len(raw)) + raw)
        return path_noext + ".wav"
    with open(path_noext + ".mp3", "wb") as fh:
        fh.write(raw)
    return path_noext + ".mp3"


def tts(voice_id, model, text, settings, out_noext, prev_text=None, next_text=None):
    body = {"text": text, "model_id": model, "voice_settings": settings}
    if model != "eleven_v3":
        if prev_text:
            body["previous_text"] = prev_text
        if next_text:
            body["next_text"] = next_text
    last = None
    for fmt in ([report["format"]] if report["format"] else FORMATS):
        try:
            res = req("POST", f"/v1/text-to-speech/{voice_id}/with-timestamps", body, {"output_format": fmt})
        except RuntimeError as e:
            last = e
            if "HTTP 4" in str(e) and ("output_format" in str(e) or "tier" in str(e).lower() or "subscription" in str(e).lower() or "403" in str(e)):
                continue
            raise
        report["format"] = fmt
        audio = write_audio(out_noext, res["audio_base64"], fmt)
        align = res.get("normalized_alignment") or res.get("alignment")
        with open(out_noext + ".json", "w") as fh:
            json.dump({"text": text, "model": model, "voice_id": voice_id, "format": fmt, "alignment": res.get("alignment"), "normalized_alignment": res.get("normalized_alignment")}, fh)
        end = align["character_end_times_seconds"][-1] if align else None
        return audio, end
    raise last


def find_shared(gender):
    """Try to find an East/West African-accented library voice for the customer lines."""
    for accent in ("kenyan", "ugandan", "nigerian", "african", "ghanaian", "south african"):
        try:
            res = req("GET", "/v1/shared-voices", query={"page_size": 10, "accent": accent, "gender": gender, "language": "en", "sort": "usage_character_count_7d"})
        except RuntimeError as e:
            report["errors"].append(str(e))
            continue
        for v in res.get("voices", []):
            try:
                added = req("POST", f"/v1/voices/add/{v['public_owner_id']}/{v['voice_id']}", {"new_name": f"GetOrda {accent} {gender} {v['name']}"[:40]})
                return added.get("voice_id", v["voice_id"]), f"{v['name']} ({accent})"
            except RuntimeError as e:
                report["errors"].append(str(e))
                if "voice_limit" in str(e) or "limit" in str(e).lower():
                    return None, None
    return None, None


def main():
    if not KEY:
        sys.exit("EL_KEY is not set")
    os.makedirs(OUT, exist_ok=True)
    try:
        sub = req("GET", "/v1/user/subscription")
        report["tier"] = sub.get("tier")
        report["chars_left"] = sub.get("character_limit", 0) - sub.get("character_count", 0)
    except RuntimeError as e:
        report["errors"].append(str(e))

    for name, voice, model, settings in VARIANTS:
        d = os.path.join(OUT, name)
        os.makedirs(d, exist_ok=True)
        info = {"voice": voice, "model": model, "lines": {}}
        try:
            for i, (key, text) in enumerate(NARRATOR):
                prev = NARRATOR[i - 1][1] if i else None
                nxt = NARRATOR[i + 1][1] if i + 1 < len(NARRATOR) else None
                audio, end = tts(PREMADE[voice], model, text, settings, os.path.join(d, key), prev, nxt)
                info["lines"][key] = {"file": os.path.relpath(audio, OUT), "speech_end": end}
                print(name, key, end, flush=True)
        except RuntimeError as e:
            info["error"] = str(e)
            print("variant failed", name, e, flush=True)
        report["variants"][name] = info

    d = os.path.join(OUT, "customers")
    os.makedirs(d, exist_ok=True)
    shared = {}
    for g in ("male", "female"):
        vid, label = find_shared(g)
        shared[g] = (vid, label)
    fallback = {"c1": "Will", "c2": "Lily", "c3": "Chris", "c4": "Charlotte"}
    for key, text, g in CUSTOMERS:
        vid, label = shared[g]
        if not vid:
            vid, label = PREMADE[fallback[key]], fallback[key]
        try:
            audio, end = tts(vid, "eleven_multilingual_v2", text, CUST_SETTINGS, os.path.join(d, key))
            report["customers"][key] = {"voice": label, "file": os.path.relpath(audio, OUT), "speech_end": end}
            print("customer", key, label, end, flush=True)
        except RuntimeError as e:
            report["errors"].append(f"{key}: {e}")

    with open(os.path.join(OUT, "report.json"), "w") as fh:
        json.dump(report, fh, indent=2)
    ok = any(v.get("lines") and not v.get("error") for v in report["variants"].values())
    print("DONE" if ok else "FAILED", flush=True)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
