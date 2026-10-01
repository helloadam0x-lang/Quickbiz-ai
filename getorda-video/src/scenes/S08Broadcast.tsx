import React from "react";
import { AbsoluteFill } from "remotion";
import { Check, Crown, PenLine, Send, Users } from "lucide-react";
import { fmt, pop, tween, useSceneFrame, EASE_IN } from "../anim";
import { Haze } from "../components/Haze";
import { Cursor } from "../components/Cursor";
import { Kinetic } from "../components/Kinetic";
import { PageTitle, Photo } from "../components/AppUI";
import { Avatar, Ticks } from "../components/WA";
import { C, FONT, SH } from "../theme";
import { voWords } from "../timeline";

const AVS = ["stock/av-w1.jpg", "stock/av-m1.jpg", "stock/av-w2.jpg", "stock/av-m2.jpg", "stock/av-w3.jpg", "stock/av-m3.jpg"];

export const S08Broadcast: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l10", "broadcast").map((x) => x.f);
  // l10: Your best customers, back in one tap.
  const tap = w[6];
  const card = pop(f, -8, { damping: 17, stiffness: 120 });
  const sent = f >= tap + 2;
  const count = tween(f, tap + 2, tap + 22, 1, 43);
  const exit = tween(f, 80, 100, 0, 1, EASE_IN);

  // Send button centre in canvas space, measured from the layout below.
  const btn = { x: 640, y: 724 };

  return (
    <AbsoluteFill>
      <Haze />
      <AbsoluteFill style={{ transform: `scale(${1 + tween(f, 0, 100, 0, 0.04) + exit * 0.1})`, filter: exit > 0 ? `blur(${exit * 18}px)` : undefined }}>
        <div style={{ position: "absolute", top: 64, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Kinetic text="Your best customers, back in *one tap.*" f={f} times={w} size={72} align="center" />
        </div>

        <div
          style={{
            position: "absolute",
            left: 220,
            top: 232,
            width: 1480,
            height: 660,
            borderRadius: 30,
            background: "#fff",
            border: `1px solid ${C.line}`,
            boxShadow: SH.card,
            padding: "40px 48px",
            display: "flex",
            gap: 48,
            fontFamily: FONT,
            transform: `translateY(${(1 - card) * 90}px) scale(${0.94 + 0.06 * card})`,
            opacity: Math.min(1, card * 1.3),
          }}
        >
          <div style={{ flex: 1.15 }}>
            <PageTitle pre="Message all your " accent="customers" size={46} eyebrow="Broadcasts" />
            <div style={{ fontSize: 16, color: C.sub, marginTop: 8 }}>
              <b style={{ color: C.ink }}>2</b> broadcasts sent, <b style={{ color: C.ink }}>18</b> messages delivered. <b style={{ color: C.ink }}>43</b> customers can receive the next one.
            </div>
            <div style={{ marginTop: 26, border: `1px solid ${C.line}`, borderRadius: 20, padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 650, color: C.ink }}>
                <PenLine size={18} /> Write it
              </div>
              <div style={{ fontSize: 14, color: C.sub, marginTop: 14, fontWeight: 600 }}>Message</div>
              <div style={{ marginTop: 8, minHeight: 96, borderRadius: 14, border: `1px solid ${C.line2}`, padding: "14px 16px", fontSize: 18, color: C.ink, lineHeight: 1.45 }}>
                Hi {"{name}"}! 🔥 The new Supreme jerseys just landed. Reply <b>ORDER</b> to grab yours before they’re gone.
              </div>
              <div style={{ fontSize: 14, color: C.sub, marginTop: 18, fontWeight: 600 }}>Who gets it</div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                {[
                  { I: Users, t: "Everyone", n: 43, d: "Every customer who has not opted out", on: true },
                  { I: Crown, t: "VIP", n: 3, d: "Your best customers", on: false },
                ].map(({ I, t, n, d, on }) => (
                  <div key={t} style={{ flex: 1, padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${on ? C.cyan : C.line2}`, background: on ? C.cyanPale : "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 650, color: C.ink }}>
                      <I size={16} /> {t} <span style={{ color: C.mute, fontWeight: 500 }}>{n}</span>
                    </div>
                    <div style={{ fontSize: 13.5, color: on ? C.cyanInk : C.sub, marginTop: 4 }}>{d}</div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 20,
                  height: 58,
                  borderRadius: 14,
                  background: sent ? C.ok : C.cyan,
                  color: sent ? "#fff" : "#06323F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  fontSize: 19,
                  fontWeight: 700,
                  transform: `scale(${1 - 0.05 * Math.sin(Math.PI * tween(f, tap - 3, tap + 7, 0, 1, (t) => t))})`,
                  boxShadow: sent ? "0 10px 26px rgba(25,118,64,0.25)" : "0 10px 26px rgba(109,212,241,0.45)",
                }}
              >
                {sent ? (
                  <>
                    <Check size={20} strokeWidth={3} /> Delivered to {fmt(count)} customers
                  </>
                ) : (
                  <>
                    <Send size={19} /> Send to 43 customers
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ flex: 0.85, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 15, fontWeight: 650, color: C.ink, marginBottom: 12 }}>What customers see</div>
            <div style={{ flex: 1, borderRadius: 24, background: C.waBg, padding: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fff", borderRadius: 14 }}>
                <Avatar name="D" size={38} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 650 }}>Drip Avenue</div>
                  <div style={{ fontSize: 12, color: "#667781" }}>business account</div>
                </div>
              </div>
              <div style={{ margin: "18px auto 12px", width: 64, textAlign: "center", fontSize: 12, padding: "3px 8px", borderRadius: 8, background: "#fff", color: "#667781" }}>Today</div>
              <div style={{ width: 330, background: "#fff", borderRadius: 14, borderBottomLeftRadius: 4, padding: 6, boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)" }}>
                <Photo src="products/jersey-supreme.jpg" fit="contain" style={{ width: 318, height: 250, borderRadius: 10, background: "#fff" }} />
                <div style={{ padding: "8px 6px 2px", fontSize: 15.5, lineHeight: 1.4 }}>
                  Hi Amina! 🔥 The new Supreme jerseys just landed. Reply <b>ORDER</b> to grab yours.
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, fontSize: 11, color: "#667781", padding: "0 6px" }}>
                  09:30 {sent && <Ticks size={13} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {AVS.map((src, i) => {
          const at = tap + 2 + i * 2;
          if (f < at) return null;
          const s = pop(f, at, { damping: 12, stiffness: 150 });
          const ang = -Math.PI * 0.95 + (i / (AVS.length - 1)) * Math.PI * 0.9;
          const r = 210 * s;
          const x = btn.x + Math.cos(ang) * r * 1.6;
          const y = btn.y - 40 + Math.sin(ang) * r * 0.9;
          return (
            <div key={i} style={{ position: "absolute", left: x - 32, top: y - 32, transform: `scale(${0.4 + 0.6 * Math.min(1, s)})`, opacity: Math.min(1, s * 2) * (1 - tween(f, at + 34, at + 46)) }}>
              <Avatar src={src} size={64} ring="#fff" />
              <div style={{ position: "absolute", right: -8, bottom: -6, padding: "2px 5px", borderRadius: 8, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}>
                <Ticks size={13} />
              </div>
            </div>
          );
        })}

        <Cursor
          f={f}
          keys={[
            { f: 6, x: 1100, y: 1060 },
            { f: tap - 8, x: btn.x + 30, y: btn.y + 6 },
            { f: tap + 14, x: btn.x + 40, y: btn.y + 12 },
            { f: 96, x: 980, y: 1040 },
          ]}
          clicks={[tap]}
          show={[8, 90]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
