import React from "react";
import { AbsoluteFill } from "remotion";
import { Check, MapPin, MessageCircle } from "lucide-react";
import { pop, useSceneFrame } from "../anim";
import { Layer, MotionBlur, World } from "../components/Cam";
import { Haze } from "../components/Haze";
import { IPhone } from "../components/IPhone";
import { Kinetic } from "../components/Kinetic";
import { Photo, Pill, ProductCard } from "../components/AppUI";
import { Avatar, Msg, Thread, TypingDots, WAHeader, WAInput, WAWallpaper } from "../components/WA";
import { cam, camVel, CamKeys, E, kf, rand } from "../motion";
import { C, FONT, SH } from "../theme";
import { P } from "../products";
import { voWords } from "../timeline";
import { useVertical } from "../format";

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
const CHIPS = ["English · Hello", "Kiswahili · Habari", "Español · Hola", "العربية · مرحبا", "Français · Bonjour"];

export const S05Chat: React.FC = () => {
  const f = useSceneFrame();
  const a = voWords("l06", "chat").map((x) => x.f);
  const b = voWords("l07", "chat").map((x) => x.f);
  // l06: It answers every customer, in their own language, from your real products and prices.
  // l07: It takes the order, shares your mobile money details, and tracks it all the way to their door.

  // Six shots: close on the chat, pull back to the line, orbit the language ring, pan to the
  // catalog wall, whip back to the order, then travel to the tracker.
  const V = useVertical();
  const PHONE = V ? { x: 540, y: 1250 } : { x: 430, y: 560 };
  // Vertical stacks everything: copy on top, phone below, cards and the tracker float in front of it.
  const KV: CamKeys = {
    x: [[-10, 0], [22, 0], [48, 0], [a[4] - 2, 0], [a[7] + 6, -30], [a[8] - 2, -30], [a[11] + 4, 0], [158, 0], [178, 0, E.snap], [b[4] - 8, 0], [b[4] + 14, 0], [b[9] - 4, 0], [b[11], 0], [324, 0], [334, 1700, E.in]],
    y: [[-10, PHONE.y - 920], [22, PHONE.y - 910], [48, 60], [a[8] - 2, 160], [a[11] + 4, 120], [158, 120], [178, PHONE.y - 920, E.snap], [b[4] - 8, PHONE.y - 930], [b[4] + 14, 60], [b[11], 80], [346, 80]],
    z: [[-10, 540], [22, 500], [48, -40], [a[7] + 6, 100], [a[11] + 4, 60], [158, 70], [178, 420, E.snap], [b[4] - 8, 400], [b[4] + 14, 60], [b[11], 80], [322, 100], [346, 140]],
    ry: [[-10, 4], [48, 2], [a[7] + 6, 12], [a[8] - 2, 12], [a[11] + 4, 5], [158, 6], [178, 0, E.snap], [b[4] + 14, -6], [b[11], 4], [346, 10]],
    rx: [[-10, 2], [a[7] + 6, 6], [a[11] + 4, 2], [346, 0]],
  };
  const KL: CamKeys = {
    x: [[-10, -530], [22, -520], [48, -40], [a[4] - 2, -40], [a[7] + 6, -150], [a[8] - 2, -150], [a[11] + 4, 330], [158, 340], [178, -440, E.snap], [b[4] - 8, -440], [b[4] + 14, -130], [b[9] - 4, -110], [b[11], 380], [324, 400], [334, 1700, E.in]],
    y: [[-10, 60], [22, 70], [48, 0], [a[8] - 2, 0], [a[11] + 4, 100], [158, 110], [178, 230, E.snap], [b[4] - 8, 220], [b[4] + 14, 70], [b[11], 30], [346, 30]],
    z: [[-10, 540], [22, 500], [48, 80], [a[7] + 6, 150], [a[11] + 4, 60], [158, 70], [178, 420, E.snap], [b[4] - 8, 400], [b[4] + 14, 130], [b[11], 70], [322, 100], [346, 140]],
    ry: [[-10, 6], [48, 4], [a[7] + 6, 14], [a[8] - 2, 14], [a[11] + 4, 7], [158, 8], [178, 0, E.snap], [b[4] + 14, -9], [b[11], 6], [346, 14]],
    rx: [[-10, 2], [a[7] + 6, 6], [a[11] + 4, 2], [346, 0]],
  };
  const K = V ? KV : KL;
  const c = cam(f, K);
  const v = camVel(f, K);

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
    { at: 20, until: 40, side: "out", h: 44, node: <TypingDots f={f} /> },
    {
      at: 40,
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
    { at: b[0] - 4, side: "in", h: 62, time: "23:48", node: <span>Perfect 😍 Size L please. Deliver today? 🙏</span> },
    { at: b[0] + 8, until: b[3], side: "out", h: 44, node: <TypingDots f={f} /> },
    {
      at: b[3],
      side: "out",
      h: 168,
      time: "23:48",
      ai: true,
      node: (
        <div style={{ width: 262 }}>
          <div style={{ fontWeight: 750 }}>✅ Order ORD-1042 confirmed</div>
          <div style={{ marginTop: 6, fontSize: 14, color: "#2A3236" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Madrid Polo (L) × 1</span><span>100,000</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Same-day delivery</span><span>5,000</span></div>
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

  const phaseA = 1 - kf(f, [[156, 0], [170, 1, E.in]]);
  const match = kf(f, [[a[13] - 4, 0], [a[13] + 10, 1, E.out]]);
  const orbit = kf(f, [[a[6] - 10, -40], [a[8] + 20, 70, E.inOut]]);
  const order = pop(f, b[9] - 2, { damping: 16, stiffness: 140 });
  const stepAt = [b[9], b[9] + 5, b[10] + 2, b[14], b[17]];
  const done = stepAt.filter((s) => f >= s).length;
  const status = done >= 5 ? "Delivered" : done >= 3 ? "On the way" : "Paid";
  // Bike position along the tracker (0..1), riding from Preparing to Delivered.
  const bike = kf(f, [[stepAt[2], 0.5], [stepAt[3], 0.75, E.inOut], [stepAt[4], 1, E.inOut]]);
  const momo = kf(f, [[b[6] - 4, 0], [b[6] + 12, 1, E.out]]);
  const paid = kf(f, [[b[9] - 10, 0], [b[9] + 2, 1, E.out]]);
  const confetti = kf(f, [[stepAt[4], 0], [stepAt[4] + 30, 1, E.out]]);
  const momoOut = kf(f, [[b[10] - 4, 0], [b[10] + 10, 1, E.in]]);

  return (
    <AbsoluteFill>
      <Haze />
      <MotionBlur vx={v.vx} vy={v.vy} amount={0.3}>
        <World c={c}>
          {/* Language ring orbiting the phone */}
          {CHIPS.map((t, i) => {
            const th = ((orbit + i * 72) * Math.PI) / 180;
            const s = pop(f, a[7] - 4 + i * 3, { damping: 14, stiffness: 160 });
            const on = i === 3;
            return (
              <Layer
                key={t}
                x={PHONE.x + Math.sin(th) * (V ? 300 : 280)}
                y={V ? PHONE.y - 300 + i * 130 : PHONE.y - 140 + i * 105}
                z={Math.cos(th) * 420 - 40}
                ry={-c.ry}
                s={0.6 + 0.4 * s}
                o={Math.min(1, s) * kf(f, [[a[8] - 4, 1], [a[8] + 8, 0, E.in]])}
                focus={150}
                dof={0.006}
              >
                <Pill tone={on ? "cyan" : "grey"} size={34} style={{ background: on ? C.cyanPale : "rgba(255,255,255,0.95)", boxShadow: on ? `0 0 0 3px ${C.cyan}, ${SH.soft}` : SH.soft }}>
                  {t}
                </Pill>
              </Layer>
            );
          })}

          <Layer x={PHONE.x} y={PHONE.y} z={0} ry={V ? -3 : -6} focus={V && order > 0.05 ? 180 : 0} dof={0.012}>
            <IPhone time="23:47">
              <WAWallpaper />
              <WAHeader name="Amina" avatar="stock/av-w1.jpg" status={f >= 20 && f < 40 ? "GetOrda AI is typing…" : "online"} badge={49} />
              <Thread f={f} msgs={msgs} />
              <WAInput />
            </IPhone>
          </Layer>

          {/* Phase A copy and the catalog wall */}
          <Layer x={V ? 90 : 840} y={215} z={0} center={false} o={phaseA}>
            <div style={{ whiteSpace: "nowrap" }}>
              <Kinetic text="Answers every *customer,*" f={f} times={a.slice(1, 4)} size={V ? 70 : 76} />
              <Kinetic text="in their own *language.*" f={f} times={a.slice(4, 8)} size={V ? 70 : 76} />
            </div>
          </Layer>
          <Layer x={V ? 90 : 1010} y={V ? 420 : 480} z={20} center={false} o={phaseA}>
            <div style={{ whiteSpace: "nowrap" }}>
              <Kinetic text="from your real *products* and *prices.*" f={f} times={a.slice(8, 14)} size={V ? 50 : 56} weight={550} color={C.ink2} />
            </div>
          </Layer>
          {[P.madrid, P.supreme, P.asics, P.cerave].map((p, i) => {
            const s = kf(f, [[a[10] - 10 + i * 4, 0], [a[10] + 10 + i * 4, 1, E.out]]);
            const hl = i === 0 ? match : 0;
            return (
              <Layer
                key={p.name}
                x={V ? 210 + i * 220 : 1130 + i * 270}
                y={(V ? 1120 : 800) + (1 - s) * 220}
                z={-520 * (1 - s) + hl * 90 + (V ? 140 : 0)}
                s={V ? 0.78 : 1}
                rx={(1 - s) * 55}
                o={Math.min(1, s * 1.5) * phaseA}
              >
                <div style={{ position: "relative" }}>
                  <ProductCard src={p.src} name={p.name} price={p.price} fit={p.fit} w={246} style={{ boxShadow: hl ? `0 0 0 ${3 * hl}px ${C.cyan}, 0 0 ${60 * hl}px rgba(109,212,241,0.55), ${SH.float}` : SH.soft }} />
                  {i === 0 && (
                    <div style={{ position: "absolute", top: -20, right: -14, transform: `scale(${pop(f, a[13], { damping: 11, stiffness: 220 })})` }}>
                      <Pill tone="dark" size={17}>
                        <Check size={15} strokeWidth={3} /> Quoted in chat
                      </Pill>
                    </div>
                  )}
                </div>
              </Layer>
            );
          })}

          {/* Phase B copy */}
          <Layer x={V ? 540 : 680} y={V ? 740 : 600} z={60} center={V}>
            <div style={{ whiteSpace: "nowrap" }}>
              <Kinetic text="Takes the *order.*" f={f} times={b.slice(1, 4)} size={V ? 64 : 58} out={b[4] - 16} dur={12} align={V ? "center" : undefined} />
            </div>
          </Layer>
          <Layer x={V ? 90 : 680} y={V ? 300 : 250} z={40} center={false}>
            <div style={{ whiteSpace: "nowrap" }}>
              <Kinetic text="Shares your *mobile money* details." f={f} times={b.slice(4, 9)} size={V ? 52 : 56} out={b[10] - 14} lead={-2} dur={12} />
            </div>
          </Layer>
          <Layer x={V ? 90 : 850} y={V ? 300 : 150} z={20} center={false}>
            <div style={{ whiteSpace: "nowrap" }}>
              <Kinetic text="Tracks it to their *door.*" f={f} times={[b[10], b[11], b[15], b[16], b[17]]} size={V ? 72 : 84} lead={-2} dur={12} />
            </div>
          </Layer>

          {/* MoMo payment card flips in next to the phone */}
          <Layer x={V ? 540 : 1060} y={V ? 640 : 500} z={120 + momoOut * 320} ry={(1 - momo) * 180} o={(momo > 0 ? 1 : 0) * (1 - momoOut)} s={0.9 + 0.1 * momo}>
            <div
              style={{
                width: 580,
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "26px 30px",
                borderRadius: 26,
                background: "#fff",
                boxShadow: SH.float,
                border: `1px solid ${C.line}`,
                fontFamily: FONT,
                backfaceVisibility: "hidden",
              }}
            >
              <MoMo size={70} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>{paid > 0.5 ? "Payment received" : "MTN Mobile Money"}</div>
                <div style={{ fontSize: 19, color: C.sub, marginTop: 3 }}>{paid > 0.5 ? "UGX 105,000 · Ref 8841 2207" : "0772 ••• 418 · Drip Avenue"}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: C.ok, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${paid})` }}>
                <Check size={24} color="#fff" strokeWidth={3} />
              </div>
            </div>
          </Layer>

          {/* Orders card with the delivery bike riding the tracker */}
          <Layer x={V ? 540 : 1370} y={V ? 1060 : 600} z={V ? 180 : 0} s={(0.94 + 0.06 * order) * (V ? 0.78 : 1)} o={Math.min(1, order * 1.4)} ry={V ? 0 : -4}>
            <div style={{ width: 1000, borderRadius: 28, background: "#fff", border: `1px solid ${C.line}`, boxShadow: SH.card, padding: "28px 32px", fontFamily: FONT, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Avatar src="stock/av-w1.jpg" size={60} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 25, fontWeight: 700, color: C.ink }}>Amina K.</div>
                  <div style={{ fontSize: 16, color: C.mute, marginTop: 2 }}>Oct 5 · ORD-20261005-1042 · Madrid Polo (L)</div>
                </div>
                <div style={{ fontSize: 29, fontWeight: 750, color: C.ink, marginRight: 14 }}>UGX 105,000</div>
                <Pill tone="ok" size={17} dot>
                  {status}
                </Pill>
              </div>
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", margin: "58px 26px 14px" }}>
                <div style={{ position: "absolute", left: 22, right: 22, top: 20, height: 4, borderRadius: 2, background: "#E9EEF0" }} />
                <div style={{ position: "absolute", left: 22, top: 20, height: 4, borderRadius: 2, width: `calc((100% - 44px) * ${done >= 3 ? bike : Math.max(0, done - 1) / 4})`, background: C.ok }} />
                {done >= 3 && done < 5 && (
                  // A glowing courier marker rides the line between Preparing and Delivered.
                  <div style={{ position: "absolute", top: 22 - 15, left: `calc(22px + (100% - 44px) * ${bike} - 15px)`, width: 30, height: 30, borderRadius: 15, background: "#fff", boxShadow: `0 0 0 ${6 + 4 * Math.sin(f / 4)}px rgba(109,212,241,0.28), 0 6px 16px rgba(11,110,146,0.35)`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 7, background: C.cyanDeep }} />
                  </div>
                )}
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
                          boxShadow: on && last ? `0 0 0 ${10 * (1 - confetti)}px rgba(25,118,64,0.18)` : undefined,
                        }}
                      >
                        {on && (last ? <Check size={22} color="#fff" strokeWidth={3.2} /> : <Check size={22} color="#fff" strokeWidth={3.2} />)}
                      </div>
                      <span style={{ fontSize: 15.5, marginTop: 10, color: on ? C.ink : C.mute, fontWeight: on ? 650 : 500, whiteSpace: "nowrap" }}>{s}</span>
                    </div>
                  );
                })}
                {confetti > 0 &&
                  Array.from({ length: 22 }).map((_, i) => {
                    const ang = rand(i) * Math.PI * 2;
                    const d = confetti * (60 + rand(i + 7) * 140);
                    return (
                      <span
                        key={i}
                        style={{
                          position: "absolute",
                          right: 22 + Math.cos(ang) * d,
                          top: 22 + Math.sin(ang) * d * 0.7 + confetti * 30,
                          width: 9,
                          height: i % 3 ? 9 : 4,
                          borderRadius: i % 3 ? 5 : 1,
                          background: [C.cyan, C.ok, "#FFCB05", C.ink][i % 4],
                          opacity: 1 - confetti,
                          transform: `rotate(${i * 40 + confetti * 300}deg)`,
                        }}
                      />
                    );
                  })}
              </div>
              <div style={{ marginTop: 18, padding: "16px 20px", borderRadius: 16, background: "#F7F9FA", fontSize: 17, color: C.ink2 }}>
                {[
                  ["Madrid Polo (L) × 1", "UGX 100,000"],
                  ["Same-day delivery", "UGX 5,000"],
                ].map(([k2, v2]) => (
                  <div key={k2} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                    <span>{k2}</span>
                    <span>{v2}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0", fontWeight: 750, color: C.ink }}>
                  <span>Total</span>
                  <span>UGX 105,000</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, fontSize: 16, color: C.sub }}>
                <MapPin size={18} /> 2.4 km away · arriving 14:30
                <span style={{ flex: 1 }} />
                <Pill tone="grey" size={15}>
                  <MessageCircle size={15} /> Message
                </Pill>
              </div>
            </div>
          </Layer>
        </World>
      </MotionBlur>
    </AbsoluteFill>
  );
};
