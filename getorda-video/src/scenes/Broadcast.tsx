import React from "react";
import { AbsoluteFill } from "remotion";
import { caretOn, fmt, pop, tween, typed, useSceneFrame, EASE_IN, EASE_OUT } from "../anim";
import { LightMesh } from "../components/Backgrounds";
import { Cursor } from "../components/Cursor";
import { Avatar, Check, Chip, Dot } from "../components/UI";
import { Words } from "../components/Words";
import { C, FONT, GREEN_GRAD, SHADOW_CARD } from "../theme";

export const SEND = 64;
const MSG = "Weekend glow sale ✨ 20% off all serums until Sunday. Reply YES and we'll deliver today.";
const INITIALS = "AGBDKMNJSRPLTEHWOFCYQUVIZXA".split("");

export const Broadcast: React.FC = () => {
  const f = useSceneFrame();
  const card = pop(f, -2, { damping: 16, stiffness: 150 });
  const text = typed(MSG, f, 12, 1.95);
  const fly = tween(f, SEND + 2, SEND + 20, 0, 1, EASE_IN);
  const count = tween(f, SEND + 6, SEND + 40, 0, 248, EASE_OUT);
  const pill = pop(f, SEND + 4, { damping: 13, stiffness: 170 });
  const n = INITIALS.length;

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <LightMesh />
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 26 }}>
        <Words text="Bring them back." f={f} at={2} size={92} />
        <Words text="In one tap." f={f} at={12} size={92} gradient={GREEN_GRAD} />
      </div>

      {/* Customers light up as the broadcast lands. */}
      {INITIALS.map((ch, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const tx = 960 + Math.cos(a) * 760;
        const ty = 610 + Math.sin(a) * 330;
        const at = SEND + 6 + (i % n) * 1.1;
        const s = pop(f, at, { damping: 13, stiffness: 120 });
        if (f < at) return null;
        const x = 960 + (tx - 960) * s;
        const y = 610 + (ty - 610) * s;
        const chk = pop(f, at + 10, { damping: 10, stiffness: 240 });
        return (
          <div key={i} style={{ position: "absolute", left: x - 34, top: y - 34, transform: `scale(${0.4 + 0.6 * Math.min(1, s)})`, opacity: Math.min(1, s * 2) }}>
            <Avatar name={ch} size={68} hue={(i * 47) % 360} />
            <div style={{ position: "absolute", right: -6, bottom: -6, transform: `scale(${chk})` }}>
              <Check size={28} />
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 960 - 440,
          top: 250,
          width: 880,
          borderRadius: 40,
          background: "#fff",
          boxShadow: SHADOW_CARD,
          padding: 36,
          transform: `translateY(${(1 - card) * 120 - fly * 260}px) scale(${(0.9 + 0.1 * card) * (1 - 0.55 * fly)})`,
          opacity: Math.min(1, card * 1.3) * (1 - fly),
          filter: `blur(${(1 - Math.min(1, card)) * 12 + fly * 20}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(20,178,107,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="28" height="28" viewBox="0 0 24 24"><path d="M3 10v4h3l6 5V5L6 10H3zm13.5 2A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" fill={C.green} /></svg>
          </div>
          <span style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>New broadcast</span>
          <span style={{ flex: 1 }} />
          <Chip tone="green" size={19}><Dot size={9} /> All customers · 248</Chip>
        </div>
        <div style={{ marginTop: 26, minHeight: 170, padding: "24px 28px", borderRadius: 24, background: "#F4F7F5", fontSize: 32, lineHeight: 1.42, color: C.ink, letterSpacing: "-0.01em" }}>
          {text}
          <span style={{ color: C.green, opacity: caretOn(f) && f < SEND ? 1 : 0 }}>|</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 24 }}>
          <span style={{ fontSize: 20, color: C.mute }}>Sends from your WhatsApp · opt-outs respected</span>
          <span style={{ flex: 1 }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "20px 34px",
              borderRadius: 18,
              background: f >= SEND ? C.green2 : C.ink,
              color: "#fff",
              fontSize: 24,
              fontWeight: 700,
              transform: `scale(${1 - 0.07 * Math.sin(Math.PI * tween(f, SEND - 3, SEND + 7, 0, 1, (t) => t))})`,
            }}
          >
            Send to 248
            <svg width="22" height="22" viewBox="0 0 24 24"><path d="M3 11.5 L21 3 L13.5 21 L11 13 Z" fill="#fff" /></svg>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 960,
          top: 610,
          transform: `translate(-50%,-50%) scale(${pill})`,
          opacity: Math.min(1, pill),
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "26px 40px",
          borderRadius: 999,
          background: C.ink,
          color: "#fff",
          boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
          whiteSpace: "nowrap",
        }}
      >
        <Check size={44} />
        <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Delivered to <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(count)}</span> customers
        </span>
      </div>

      <Cursor
        f={f}
        keys={[
          { f: 20, x: 1650, y: 1100 },
          { f: 56, x: 1245, y: 614 },
          { f: 76, x: 1255, y: 620 },
          { f: 100, x: 1560, y: 1000 },
        ]}
        clicks={[SEND]}
        show={[26, 92]}
      />
    </AbsoluteFill>
  );
};
