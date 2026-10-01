import React from "react";
import { AbsoluteFill } from "remotion";
import { Check, MapPin, MessageCircle } from "lucide-react";
import { pop, tween, useSceneFrame, EASE_IN, EASE_IN_OUT } from "../anim";
import { Haze } from "../components/Haze";
import { IPhone } from "../components/IPhone";
import { Kinetic } from "../components/Kinetic";
import { Photo, Pill, ProductCard } from "../components/AppUI";
import { Avatar, Msg, Thread, TypingDots, WAHeader, WAInput, WAWallpaper } from "../components/WA";
import { C, FONT, SH } from "../theme";
import { P } from "../products";
import { voWords } from "../timeline";

const MoMo: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: "#FFCB05",
      color: "#0B1F3A",
      fontSize: size * 0.3,
      fontWeight: 900,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      letterSpacing: "-0.02em",
    }}
  >
    MoMo
  </span>
);

const STEPS = ["Placed", "Confirmed", "Preparing", "Shipped", "Delivered"];

export const S05Chat: React.FC = () => {
  const f = useSceneFrame();
  const a = voWords("l06", "chat").map((x) => x.f);
  const b = voWords("l07", "chat").map((x) => x.f);
  // l06: It answers every customer, in their own language, from your real products and prices.
  // l07: It takes the order, shares your mobile money details, and tracks it all the way to their door.

  const msgs: Msg[] = [
    {
      at: 4,
      side: "in",
      h: 330,
      time: "23:47",
      node: (
        <div>
          <Photo src={P.madrid.src} style={{ width: 236, height: 236, borderRadius: 9, marginBottom: 6 }} />
          <div dir="rtl" style={{ fontSize: 16 }}>السلام عليكم 👋 بكم قميص مدريد؟</div>
        </div>
      ),
    },
    { at: 22, until: 44, side: "out", h: 44, node: <TypingDots f={f} /> },
    {
      at: 44,
      side: "out",
      h: 112,
      time: "23:47",
      ai: true,
      node: <div dir="rtl" style={{ fontSize: 16 }}>وعليكم السلام! 😊 قميص مدريد متوفر بسعر 100,000 شلن. ما المقاس الذي تريده؟</div>,
    },
    {
      at: a[10],
      side: "out",
      h: 116,
      time: "23:47",
      ai: true,
      node: (
        <div style={{ display: "flex", gap: 10, alignItems: "center", background: "#fff", borderRadius: 10, padding: 6, width: 268 }}>
          <Photo src={P.madrid.src} style={{ width: 70, height: 70, borderRadius: 8 }} />
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 650 }}>Madrid Polo</div>
            <div style={{ fontSize: 13, color: "#667781" }}>M · L · XL</div>
            <div style={{ fontSize: 14.5, fontWeight: 750, marginTop: 2 }}>UGX 100,000</div>
          </div>
        </div>
      ),
    },
    { at: b[0] - 4, side: "in", h: 62, time: "23:48", node: <span>Perfect 😍 Size L. Deliver to Kololo 🙏</span> },
    { at: b[0] + 8, until: b[3], side: "out", h: 44, node: <TypingDots f={f} /> },
    {
      at: b[3],
      side: "out",
      h: 168,
      time: "23:48",
      ai: true,
      node: (
        <div style={{ width: 262 }}>
          <div style={{ fontWeight: 750, display: "flex", alignItems: "center", gap: 6 }}>✅ Order ORD-1042 confirmed</div>
          <div style={{ marginTop: 6, fontSize: 14, color: "#2A3236" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Madrid Polo (L) × 1</span><span>100,000</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Delivery · Kololo</span><span>5,000</span></div>
            <div style={{ height: 1, background: "rgba(0,0,0,0.1)", margin: "5px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 750 }}><span>Total</span><span>UGX 105,000</span></div>
          </div>
        </div>
      ),
    },
    {
      at: b[4],
      side: "out",
      h: 104,
      time: "23:48",
      ai: true,
      node: (
        <div style={{ display: "flex", gap: 10, width: 268 }}>
          <MoMo size={40} />
          <span style={{ fontSize: 14.5 }}>
            Pay <b>105,000</b> to <b>0772 ••• 418</b> (Drip Avenue). Send the screenshot here ✅
          </span>
        </div>
      ),
    },
    { at: b[9] - 14, side: "in", h: 58, time: "23:49", node: <span>Sent! ✅ Ref 8841 2207</span> },
  ];

  const phone = pop(f, -10, { damping: 17, stiffness: 90, mass: 1.1 });
  const phaseA = 1 - tween(f, 150, 166, 0, 1, EASE_IN);
  const chips = ["English · Hello", "Kiswahili · Habari", "Luganda · Oli otya", "العربية · مرحبا", "Français · Bonjour"];
  const cards = [P.madrid, P.supreme, P.asics, P.cerave];
  const match = tween(f, a[13] - 4, a[13] + 10);
  const link = tween(f, a[11], a[13] + 6, 0, 1, EASE_IN_OUT);

  const order = pop(f, b[3] - 2, { damping: 16, stiffness: 140 });
  const stepAt = [b[3] + 4, b[3] + 14, b[10], b[14], b[17]];
  const done = stepAt.filter((s) => f >= s).length;
  const status = done >= 5 ? "Delivered" : done >= 3 ? "On the way" : f >= b[9] - 12 ? "Paid" : "Confirmed";
  const momo = pop(f, b[6] - 2, { damping: 15, stiffness: 170 });
  const paid = tween(f, b[9] - 10, b[9] + 4);
  const exit = tween(f, 322, 346, 0, 1, EASE_IN);

  return (
    <AbsoluteFill>
      <Haze />
      <AbsoluteFill style={{ transform: `scale(${1 + tween(f, 0, 340, 0, 0.035) + exit * 0.1})`, filter: exit > 0 ? `blur(${exit * 18}px)` : undefined }}>
        <div style={{ position: "absolute", left: 150, top: 108, perspective: 2400 }}>
          <div style={{ transform: `translateY(${(1 - phone) * 900}px) rotateY(${11 - 3 * tween(f, 0, 330)}deg) rotateX(3deg)`, transformOrigin: "50% 50%" }}>
            <IPhone time="23:47">
              <WAWallpaper />
              <WAHeader name="Amina" avatar="stock/av-w1.jpg" status={f >= 22 && f < 44 ? "GetOrda AI is typing…" : "online"} badge={49} />
              <Thread f={f} msgs={msgs} />
              <WAInput />
            </IPhone>
          </div>
        </div>

        {/* Phase A: answers in their language, from your real catalog */}
        <div style={{ opacity: phaseA, filter: phaseA < 1 ? `blur(${(1 - phaseA) * 14}px)` : undefined }}>
          <div style={{ position: "absolute", left: 720, top: 132 }}>
            <Kinetic text="Answers every *customer,*" f={f} times={a.slice(1, 4)} size={76} />
            <Kinetic text="in their own *language.*" f={f} times={a.slice(4, 8)} size={76} />
          </div>
          <div style={{ position: "absolute", left: 720, top: 330, display: "flex", gap: 10, flexWrap: "wrap", width: 1100 }}>
            {chips.map((c, i) => {
              const s = pop(f, a[7] + i * 4, { damping: 13, stiffness: 210 });
              const on = i === 3;
              return (
                <Pill
                  key={c}
                  tone={on ? "cyan" : "grey"}
                  size={21}
                  style={{
                    transform: `scale(${s})`,
                    opacity: Math.min(1, s),
                    background: on ? C.cyanPale : "rgba(255,255,255,0.92)",
                    boxShadow: on ? `0 0 0 2px ${C.cyan}` : "0 4px 14px rgba(17,17,16,0.06)",
                  }}
                >
                  {c}
                </Pill>
              );
            })}
          </div>
          <div style={{ position: "absolute", left: 720, top: 420 }}>
            <Kinetic text="from your real *products* and *prices.*" f={f} times={a.slice(8, 14)} size={50} weight={550} color={C.ink2} />
          </div>
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <path
              d="M 830 548 C 760 470, 700 650, 590 640"
              fill="none"
              stroke={C.cyan}
              strokeWidth="3"
              strokeDasharray="8 8"
              pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: 1 - link }}
              opacity={link > 0 ? 1 : 0}
            />
          </svg>
          <div style={{ position: "absolute", left: 720, top: 548, display: "flex", gap: 22 }}>
            {cards.map((p, i) => {
              const s = pop(f, a[10] - 6 + i * 4, { damping: 15, stiffness: 150 });
              const hl = i === 0 ? match : 0;
              return (
                <div key={p.name} style={{ position: "relative", transform: `translateY(${(1 - s) * 70}px) scale(${0.9 + 0.1 * s + hl * 0.03})`, opacity: Math.min(1, s * 1.3) }}>
                  <ProductCard src={p.src} name={p.name} price={p.price} fit={p.fit} w={236} style={{ boxShadow: hl ? `0 0 0 ${3 * hl}px ${C.cyan}, ${SH.float}` : SH.soft }} />
                  {i === 0 && (
                    <div style={{ position: "absolute", top: -18, right: -10, transform: `scale(${pop(f, a[13], { damping: 11, stiffness: 220 })})` }}>
                      <Pill tone="dark" size={16}>
                        <Check size={15} strokeWidth={3} /> Quoted in chat
                      </Pill>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase B: takes the order, MoMo details, tracks to the door */}
        <div style={{ position: "absolute", left: 720, top: 132 }}>
          <Kinetic text="Takes the *order.*" f={f} times={b.slice(1, 4)} size={76} out={b[4] - 16} dur={12} />
        </div>
        <div style={{ position: "absolute", left: 720, top: 132 }}>
          <Kinetic text="Shares your *mobile money* details." f={f} times={b.slice(4, 9)} size={76} out={b[10] - 16} lead={-2} dur={12} />
        </div>
        <div style={{ position: "absolute", left: 720, top: 132 }}>
          <Kinetic text="Tracks it to their *door.*" f={f} times={[b[10], b[11], b[15], b[16], b[17]]} size={76} lead={-2} dur={12} />
        </div>

        <div
          style={{
            position: "absolute",
            left: 720,
            top: 278,
            width: 1060,
            borderRadius: 26,
            background: "#fff",
            border: `1px solid ${C.line}`,
            boxShadow: SH.card,
            padding: "26px 30px",
            fontFamily: FONT,
            transform: `translateY(${(1 - order) * 60}px) scale(${0.94 + 0.06 * order})`,
            opacity: Math.min(1, order * 1.4),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar src="stock/av-w1.jpg" size={58} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.ink }}>Amina K.</div>
              <div style={{ fontSize: 16, color: C.mute, marginTop: 2 }}>Oct 5 · ORD-20261005-1042 · Madrid Polo (L)</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 750, color: C.ink, marginRight: 14 }}>UGX 105,000</div>
            <Pill tone={status === "Confirmed" ? "cyan" : "ok"} size={17} dot>
              {status}
            </Pill>
          </div>
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", margin: "34px 24px 14px" }}>
            <div style={{ position: "absolute", left: 22, right: 22, top: 20, height: 3, background: "#E9EEF0" }} />
            <div
              style={{
                position: "absolute",
                left: 22,
                top: 20,
                height: 3,
                width: `calc((100% - 44px) * ${Math.max(0, done - 1) / 4 + (done > 0 && done < 5 ? tween(f, stepAt[done - 1], stepAt[Math.min(4, done)], 0, 0.25) : 0)})`,
                background: C.ok,
              }}
            />
            {STEPS.map((s, i) => {
              const on = f >= stepAt[i];
              const k = pop(f, stepAt[i], { damping: 10, stiffness: 240 });
              const last = i === 4;
              return (
                <div key={s} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", width: 44 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      background: on ? (last ? C.ink : C.ok) : "#fff",
                      border: on ? "none" : "3px solid #E1E7EA",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: `scale(${on ? 0.6 + 0.4 * k : 1})`,
                      boxShadow: on && last ? `0 0 0 ${8 * (1 - tween(f, stepAt[4], stepAt[4] + 20))}px rgba(17,17,16,0.12)` : undefined,
                    }}
                  >
                    {on && (last ? <span style={{ width: 14, height: 14, borderRadius: 7, background: "#fff" }} /> : <Check size={22} color="#fff" strokeWidth={3.2} />)}
                  </div>
                  <span style={{ fontSize: 15, marginTop: 10, color: on ? C.ink : C.mute, fontWeight: on ? 650 : 500, whiteSpace: "nowrap" }}>{s}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 18, padding: "16px 20px", borderRadius: 16, background: "#F7F9FA", fontSize: 17, color: C.ink2 }}>
            {[
              ["Madrid Polo (L) × 1", "UGX 100,000"],
              ["Delivery & fees · Kololo", "UGX 5,000"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <span>{k}</span>
                <span>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0", fontWeight: 750, color: C.ink }}>
              <span>Total</span>
              <span>UGX 105,000</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, fontSize: 16, color: C.sub }}>
            <MapPin size={18} /> Kololo, Kampala
            <span style={{ flex: 1 }} />
            <Pill tone="grey" size={15}>
              <MessageCircle size={15} /> Message
            </Pill>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 1300,
            top: 830,
            width: 480,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "18px 22px",
            borderRadius: 22,
            background: "#fff",
            boxShadow: SH.float,
            border: `1px solid ${C.line}`,
            fontFamily: FONT,
            transform: `translateY(${(1 - momo) * 40}px) scale(${0.9 + 0.1 * momo})`,
            opacity: Math.min(1, momo),
          }}
        >
          <MoMo size={52} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: C.ink }}>{paid > 0.5 ? "Payment received" : "MTN Mobile Money"}</div>
            <div style={{ fontSize: 15, color: C.sub, marginTop: 2 }}>{paid > 0.5 ? "UGX 105,000 · Ref 8841 2207" : "0772 ••• 418 · Drip Avenue"}</div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: C.ok, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${paid})` }}>
            <Check size={20} color="#fff" strokeWidth={3} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
