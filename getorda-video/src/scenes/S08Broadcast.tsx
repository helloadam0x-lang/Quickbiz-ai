import React from "react";
import { AbsoluteFill } from "remotion";
import { Check, Crown, PenLine, Send, Users } from "lucide-react";
import { fmt, pop, useSceneFrame } from "../anim";
import { Layer, MotionBlur, World } from "../components/Cam";
import { Haze } from "../components/Haze";
import { Cursor } from "../components/Cursor";
import { Kinetic } from "../components/Kinetic";
import { PageTitle, Photo } from "../components/AppUI";
import { Avatar, Ticks } from "../components/WA";
import { cam, camVel, CamKeys, E, kf, rand } from "../motion";
import { C, FONT, SH } from "../theme";
import { voWords } from "../timeline";
import { useVertical } from "../format";

const PHOTOS = ["stock/av-w1.jpg", "stock/av-m1.jpg", "stock/av-w2.jpg", "stock/av-m2.jpg", "stock/av-w3.jpg", "stock/av-m3.jpg"];
const INITIALS = "AKMNJSRPLTEHWOFCYQUVIZBDGXAKMNJSRPLTEHWOF";

export const S08Broadcast: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l10", "broadcast").map((x) => x.f);
  // l10: Your best customers, back in one tap.
  const tap = w[6];
  const V = useVertical();
  // Vertical: the composer stacks above the customer preview.
  const CARD = V ? { x: 540, y: 1090, w: 980, h: 1260 } : { x: 960, y: 590, w: 1480, h: 660 };
  const BTN = V ? { x: 540, y: 1025 } : { x: CARD.x - CARD.w / 2 + 48 + 340, y: 742 };
  const KV: CamKeys = {
    x: [[-10, 0], [36, 0]],
    y: [[-10, -120], [8, -110], [36, 60], [tap + 30, 80]],
    z: [[-10, 260], [8, 250], [36, 20], [tap - 4, 60, E.inOut], [tap + 30, -260, E.out], [100, -300]],
    ry: [[-10, 0], [36, 0], [tap + 30, -4], [100, -6]],
    rx: [[-10, 4], [36, 0], [tap + 30, 5]],
  };
  const KL: CamKeys = {
    x: [[-10, -330], [8, -330], [36, 0], [tap, 0], [tap + 30, 0]],
    y: [[-10, -60], [8, -50], [36, 0], [tap + 30, 20]],
    z: [[-10, 400], [8, 380], [36, 20], [tap - 4, 60, E.inOut], [tap + 30, -260, E.out], [100, -300]],
    ry: [[-10, 8], [36, 0], [tap + 30, -6], [100, -8]],
    rx: [[-10, 4], [36, 0], [tap + 30, 6]],
  };
  const K = V ? KV : KL;
  const c = cam(f, K);
  const v = camVel(f, K);
  const sent = f >= tap + 2;
  const count = kf(f, [[tap + 2, 1], [tap + 26, 43, E.out]]);

  return (
    <AbsoluteFill>
      <Haze />
      <MotionBlur vx={v.vx} vy={v.vy} amount={0.25}>
        <World c={c}>
          <Layer x={V ? 540 : 960} y={V ? 270 : 150} z={90}>
            <div style={{ whiteSpace: "nowrap" }}>
              {V ? (
                <>
                  <Kinetic text="Your best customers," f={f} times={w.slice(0, 3)} size={76} align="center" />
                  <Kinetic text="back in *one tap.*" f={f} times={w.slice(3)} size={76} align="center" />
                </>
              ) : (
                <Kinetic text="Your best customers, back in *one tap.*" f={f} times={w} size={76} align="center" />
              )}
            </div>
          </Layer>
          <Layer x={CARD.x} y={CARD.y} z={0}>
            <div style={{ width: CARD.w, height: CARD.h, borderRadius: 30, background: "#fff", border: `1px solid ${C.line}`, boxShadow: SH.card, padding: "40px 48px", display: "flex", flexDirection: V ? "column" : "row", gap: V ? 30 : 48, fontFamily: FONT }}>
              <div style={{ flex: V ? "none" : 1.15 }}>
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
                      transform: `scale(${1 - 0.05 * Math.sin(Math.PI * kf(f, [[tap - 3, 0], [tap + 7, 1, E.lin]]))})`,
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
                  <div style={{ width: 330, marginTop: 16, background: "#fff", borderRadius: 14, borderBottomLeftRadius: 4, padding: 6, boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)" }}>
                    <Photo src="products/jersey-supreme.jpg" fit="contain" style={{ width: 318, height: 236, borderRadius: 10, background: "#fff" }} />
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
          </Layer>

          {/* 43 customers light up around the card in depth. */}
          {Array.from({ length: 43 }).map((_, i) => {
            const at = tap + 2 + i * 0.55;
            if (f < at) return null;
            const s = pop(f, at, { damping: 13, stiffness: 120 });
            const ang = rand(i) * Math.PI * 2;
            const rr = 0.75 + rand(i + 50) * 0.5;
            const tx = V ? 540 + Math.cos(ang) * 620 * rr : 960 + Math.cos(ang) * 1100 * rr;
            // Keep the burst out of the headline band so no avatar lands on "one tap".
            const ty0 = V ? 1050 + Math.sin(ang) * 1000 * rr : 560 + Math.sin(ang) * 620 * rr;
            const band = V ? 440 : 300;
            const ty = ty0 < band ? (V ? 1500 : 620) + (band - ty0) * (V ? 0.5 : 0.9) : ty0;
            const tz = -500 + rand(i + 99) * 900;
            const k = Math.min(1, s);
            const photo = i < PHOTOS.length * 3 && i % 2 === 0;
            return (
              <Layer key={i} x={BTN.x + (tx - BTN.x) * s} y={BTN.y + (ty - BTN.y) * s} z={20 + (tz - 20) * k} s={0.4 + 0.6 * k} o={k} focus={-100} dof={0.006}>
                <div style={{ position: "relative" }}>
                  {photo ? <Avatar src={PHOTOS[(i / 2) % PHOTOS.length]} size={72} ring="#fff" /> : <Avatar name={INITIALS[i]} size={72} ring="#fff" />}
                  <div style={{ position: "absolute", right: -8, bottom: -6, padding: "2px 5px", borderRadius: 8, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.12)", transform: `scale(${pop(f, at + 8, { damping: 10, stiffness: 240 })})` }}>
                    <Ticks size={13} />
                  </div>
                </div>
              </Layer>
            );
          })}

          <Layer x={0} y={0} z={30} center={false}>
            <div style={{ position: "relative", width: V ? 1080 : 1920, height: V ? 1920 : 1080 }}>
              <Cursor
                f={f}
                keys={[
                  { f: 10, x: V ? 820 : 1200, y: V ? 1880 : 1060 },
                  { f: tap - 8, x: BTN.x + 30, y: BTN.y + 6 },
                  { f: tap + 14, x: BTN.x + 40, y: BTN.y + 12 },
                  { f: 96, x: V ? 660 : 1000, y: V ? 1860 : 1040 },
                ]}
                clicks={[tap]}
                show={[12, 84]}
              />
            </div>
          </Layer>
        </World>
      </MotionBlur>
    </AbsoluteFill>
  );
};
