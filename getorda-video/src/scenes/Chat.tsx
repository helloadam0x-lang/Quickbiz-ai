import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, tween, useSceneFrame } from "../anim";
import { LightMesh } from "../components/Backgrounds";
import { Product } from "../components/Product";
import { Avatar, Check, Chip, Dot, Eyebrow } from "../components/UI";
import { Words } from "../components/Words";
import { C, FONT, GREEN_GRAD, SHADOW_CARD } from "../theme";

type Item = { at: number; h: number; until?: number; side: "in" | "out"; node: React.ReactNode };

const Meta: React.FC<{ t: string; ai?: boolean }> = ({ t, ai }) => (
  <div style={{ fontSize: 17, color: C.mute, marginTop: 8, display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
    {ai && <span style={{ color: C.green, fontWeight: 700 }}>GetOrda AI</span>}
    <span>{t}</span>
    {ai && <span style={{ color: "#34B7F1", fontWeight: 700, letterSpacing: "-0.2em" }}>✓✓</span>}
  </div>
);

const TypingDots: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ display: "flex", gap: 9, padding: "6px 4px" }}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: 13,
          height: 13,
          borderRadius: "50%",
          background: C.green,
          opacity: 0.35 + 0.65 * Math.max(0, Math.sin((f / 30) * 9 - i * 0.9)),
          transform: `translateY(${-5 * Math.max(0, Math.sin((f / 30) * 9 - i * 0.9))}px)`,
        }}
      />
    ))}
  </div>
);

const VoiceNote: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const prog = tween(f, at + 6, at + 44, 0, 1, (t) => t);
  const bars = 34;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, width: 470 }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.green2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {prog > 0 && prog < 1 ? (
          <svg width="20" height="22" viewBox="0 0 20 22"><rect x="2" y="2" width="5" height="18" rx="2" fill="#fff" /><rect x="13" y="2" width="5" height="18" rx="2" fill="#fff" /></svg>
        ) : (
          <svg width="22" height="24" viewBox="0 0 22 24"><path d="M4 2 L20 12 L4 22 Z" fill="#fff" /></svg>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, height: 44, flex: 1 }}>
        {Array.from({ length: bars }).map((_, i) => {
          const h = 8 + Math.abs(Math.sin(i * 1.7) * 22 + Math.sin(i * 0.6) * 10);
          const played = i / bars < prog;
          const live = played && i / bars > prog - 0.08 ? 1.25 : 1;
          return <span key={i} style={{ width: 5, height: h * live, borderRadius: 3, background: played ? C.green : "rgba(11,17,15,0.18)" }} />;
        })}
      </div>
      <span style={{ fontSize: 19, color: C.sub, fontWeight: 600 }}>0:0{Math.min(7, Math.floor(prog * 7) + 1)}</span>
    </div>
  );
};

export const Chat: React.FC = () => {
  const f = useSceneFrame();

  const items: Item[] = [
    { at: 8, h: 104, side: "in", node: <VoiceNote f={f} at={8} /> },
    {
      at: 50,
      h: 92,
      side: "in",
      node: (
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", maxWidth: 560, color: C.ink2, fontSize: 23, fontStyle: "italic" }}>
          <Chip tone="green" size={15} style={{ fontStyle: "normal", marginTop: 2 }}>Transcribed</Chip>
          <span>“Hi! Do you still have the Vitamin C serum? How much?”</span>
        </div>
      ),
    },
    { at: 66, until: 96, h: 86, side: "out", node: <TypingDots f={f} /> },
    {
      at: 96,
      h: 300,
      side: "out",
      node: (
        <div style={{ width: 520 }}>
          <div style={{ fontSize: 26, lineHeight: 1.35, color: C.ink }}>
            Hi Amani! 👋 Yes, the <b>Glow Serum</b> is in stock. It's <b>UGX 85,000</b>.
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "center", marginTop: 16, padding: 14, borderRadius: 20, background: "#fff" }}>
            <div style={{ width: 96, height: 96, borderRadius: 16, background: "linear-gradient(160deg,#FFF1DE,#FBDDB8)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Product kind="serum" size={62} id="chat-serum" />
            </div>
            <div>
              <div style={{ fontSize: 23, fontWeight: 700, color: C.ink }}>Nia Glow Serum</div>
              <div style={{ fontSize: 19, color: C.sub, marginTop: 2 }}>Vitamin C 15% · 30ml</div>
              <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center" }}>
                <span style={{ fontSize: 21, fontWeight: 800, color: C.ink }}>UGX 85,000</span>
                <Chip tone="green" size={14}><Dot size={7} glow={false} /> In stock</Chip>
              </div>
            </div>
          </div>
          <Meta t="11:48 PM" ai />
        </div>
      ),
    },
    {
      at: 138,
      h: 90,
      side: "in",
      node: <div style={{ fontSize: 26, color: C.ink }}>Perfect, I'll take it! Deliver to Kololo 🙏</div>,
    },
    { at: 150, until: 172, h: 86, side: "out", node: <TypingDots f={f} /> },
    {
      at: 172,
      h: 350,
      side: "out",
      node: (
        <div style={{ width: 520 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 25, fontWeight: 800, color: C.ink }}>
            <Check size={30} /> Order #1042 confirmed
          </div>
          <div style={{ marginTop: 14, background: "#fff", borderRadius: 18, padding: "14px 20px", fontSize: 21, color: C.ink2 }}>
            {[
              ["Glow Serum × 1", "85,000"],
              ["Delivery · Kololo", "10,000"],
            ].map(([a, b]) => (
              <div key={a} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span>{a}</span>
                <span style={{ fontWeight: 600 }}>{b}</span>
              </div>
            ))}
            <div style={{ height: 1, background: C.line, margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: C.ink, fontSize: 23 }}>
              <span>Total</span>
              <span>UGX 95,000</span>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 21, color: C.ink2, lineHeight: 1.4 }}>
            Pay with <b>MTN MoMo</b> · 0772 ••• 131 (Nia Skin). I'll confirm as soon as it lands.
          </div>
          <Meta t="11:49 PM" ai />
        </div>
      ),
    },
  ];

  const typing = items.some((it) => it.until && f >= it.at && f < it.until);

  const enter = tween(f, -8, 26);
  const rotY = -18 * (1 - enter) - 5 + tween(f, 0, 240, 0, 3);
  const scale = 0.92 + 0.08 * enter + tween(f, 0, 240, 0, 0.03);

  return (
    <AbsoluteFill>
      <LightMesh />
      {/* Left: kinetic captions, one idea at a time. */}
      <div style={{ position: "absolute", left: 130, top: 0, bottom: 0, width: 760, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Eyebrow style={{ opacity: tween(f, 0, 14), marginBottom: 30 }}>AI sales assistant</Eyebrow>
        <div style={{ position: "relative", height: 330 }}>
          <div style={{ position: "absolute", top: 0 }}>
            <Words text="Understands" f={f} at={2} size={104} out={72} />
            <Words text="voice notes." f={f} at={8} size={104} gradient={GREEN_GRAD} out={72} />
          </div>
          <div style={{ position: "absolute", top: 0 }}>
            <Words text="Replies in seconds," f={f} at={82} size={86} out={156} />
            <Words text="in any language." f={f} at={90} size={86} gradient={GREEN_GRAD} out={156} />
            <div style={{ display: "flex", gap: 14, marginTop: 34 }}>
              {["Habari 👋", "Oli otya?", "Bonjour", "مرحبا", "Hello"].map((g, i) => {
                const s = pop(f, 104 + i * 8, { damping: 12, stiffness: 200 });
                const o = 1 - tween(f, 154 + i, 162 + i);
                return (
                  <Chip key={g} tone={i === 4 ? "dark" : "grey"} size={24} style={{ transform: `scale(${s})`, opacity: Math.min(1, s) * o, background: i === 4 ? C.ink : "#fff" }}>
                    {g}
                  </Chip>
                );
              })}
            </div>
          </div>
          <div style={{ position: "absolute", top: 0 }}>
            <Words text="Takes the" f={f} at={166} size={104} />
            <Words text="whole order." f={f} at={172} size={104} gradient={GREEN_GRAD} />
          </div>
        </div>
      </div>

      {/* Right: the live conversation, styled after GetOrda's own inbox. */}
      <div style={{ position: "absolute", left: 960, top: 70, width: 830, height: 940, perspective: 2400 }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 40,
            background: "rgba(255,255,255,0.92)",
            boxShadow: SHADOW_CARD,
            border: "1px solid rgba(255,255,255,0.9)",
            transform: `translateX(${(1 - enter) * 260}px) rotateY(${rotY}deg) scale(${scale})`,
            transformOrigin: "0% 50%",
            opacity: enter,
            filter: `blur(${(1 - enter) * 18}px)`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: FONT,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "26px 30px", borderBottom: `1px solid ${C.line}` }}>
            <Avatar name="A" size={62} hue={20} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.ink, display: "flex", alignItems: "center", gap: 12 }}>
                Amani K. <Chip tone="green" size={15}>WhatsApp</Chip>
              </div>
              <div style={{ fontSize: 19, color: C.mute, marginTop: 2 }}>+256 772 ••• 418 · Kampala</div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 20px",
                borderRadius: 16,
                background: typing ? "rgba(20,178,107,0.14)" : "rgba(11,17,15,0.04)",
                border: `1.5px solid ${typing ? "rgba(20,178,107,0.4)" : C.line}`,
                fontSize: 20,
                fontWeight: 700,
                color: typing ? C.green : C.sub,
              }}
            >
              <Dot size={10} color={typing ? C.green2 : "#9AA5A1"} glow={typing} />
              {typing ? "AI is replying" : "AI on"}
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 30px", overflow: "hidden", background: "linear-gradient(180deg,#F6F8F7 0%,#EEF3F0 100%)" }}>
            {items.map((it, i) => {
              if (f < it.at) return null;
              const grow = tween(f, it.at, it.at + 12) * (it.until ? 1 - tween(f, it.until - 2, it.until + 8) : 1);
              const s = pop(f, it.at, { damping: 15, stiffness: 210 });
              const isOut = it.side === "out";
              return (
                <div key={i} style={{ height: it.h * grow, flexShrink: 0, display: "flex", justifyContent: isOut ? "flex-end" : "flex-start", alignItems: "flex-end" }}>
                  <div
                    style={{
                      marginBottom: 18,
                      padding: "16px 22px",
                      borderRadius: 26,
                      borderBottomLeftRadius: isOut ? 26 : 8,
                      borderBottomRightRadius: isOut ? 8 : 26,
                      background: isOut ? C.bubble : "#fff",
                      boxShadow: "0 1px 2px rgba(11,17,15,0.06), 0 6px 18px rgba(11,17,15,0.05)",
                      transform: `scale(${0.7 + 0.3 * s})`,
                      transformOrigin: isOut ? "100% 100%" : "0% 100%",
                      opacity: Math.min(1, s * 1.5) * grow,
                      filter: `blur(${(1 - Math.min(1, s)) * 8}px)`,
                    }}
                  >
                    {it.node}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: "20px 26px", borderTop: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1, padding: "18px 24px", borderRadius: 20, background: "#F3F6F4", fontSize: 21, color: C.mute }}>
              Reply on WhatsApp… AI is handling this chat
            </div>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="26" height="26" viewBox="0 0 24 24"><path d="M3 11.5 L21 3 L13.5 21 L11 13 Z" fill="#fff" /></svg>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
