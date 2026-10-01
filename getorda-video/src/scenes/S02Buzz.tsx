import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, tween, useSceneFrame, EASE_IN } from "../anim";
import { Haze } from "../components/Haze";
import { IPhone } from "../components/IPhone";
import { Kinetic } from "../components/Kinetic";
import { Photo } from "../components/AppUI";
import { Avatar, Notif, Wave } from "../components/WA";
import { C, FONT } from "../theme";
import { BUZZ_PINGS, voAt, voWords } from "../timeline";

type Row = { at: number; av?: string; name: string; msg: string; n: number };

const ROWS: Row[] = [
  { at: -100, av: "stock/av-m3.jpg", name: "Daniel", msg: "Do you have the black one?", n: 2 },
  { at: -100, name: "Mohamed A.", msg: "كم السعر؟", n: 1 },
  { at: -100, av: "stock/av-w2.jpg", name: "Sarah N.", msg: "Morning! Is CeraVe back?", n: 3 },
  { at: BUZZ_PINGS[0], name: "+256 701 ••• 552", msg: "Bei gani? 🙏", n: 1 },
  { at: BUZZ_PINGS[1], av: "stock/av-w3.jpg", name: "Grace", msg: "Hello??", n: 4 },
  { at: BUZZ_PINGS[2], name: "Akram", msg: "2 pieces please", n: 2 },
  { at: BUZZ_PINGS[3], av: "stock/av-m1.jpg", name: "Brian K.", msg: "How much is this one?", n: 1 },
  { at: BUZZ_PINGS[4], av: "stock/av-w1.jpg", name: "Amina", msg: "Is it still available?", n: 2 },
];

const ChatList: React.FC<{ f: number }> = ({ f }) => {
  const shown = ROWS.filter((r) => f >= r.at).reverse();
  const unread = 12 + ROWS.filter((r) => r.at > 0 && f >= r.at).length * 7 + Math.max(0, Math.floor((f - 80) / 9));
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: FONT }}>
      <div style={{ position: "absolute", top: 58, left: 18, right: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 15, color: "#0A84FF", fontWeight: 500 }}>Edit</span>
        <span style={{ display: "flex", gap: 16, color: "#0A84FF", fontSize: 20 }}>◎ ✎</span>
      </div>
      <div style={{ position: "absolute", top: 86, left: 18, fontSize: 32, fontWeight: 750, letterSpacing: "-0.03em", color: "#111" }}>Chats</div>
      <div style={{ position: "absolute", top: 92, right: 18, padding: "3px 10px", borderRadius: 999, background: C.wa, color: "#fff", fontSize: 13, fontWeight: 700 }}>
        {unread} unread
      </div>
      <div style={{ position: "absolute", top: 134, left: 16, right: 16, height: 34, borderRadius: 10, background: "#F0F2F3", color: "#8A9093", fontSize: 15, display: "flex", alignItems: "center", padding: "0 12px" }}>
        Search
      </div>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0 }}>
        {shown.map((r) => {
          const s = r.at < 0 ? 1 : pop(f, r.at, { damping: 16, stiffness: 200 });
          return (
            <div
              key={r.name}
              style={{
                height: 76 * Math.min(1, s),
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 16px",
                background: r.at > 0 && f - r.at < 14 ? `rgba(37,211,102,${0.12 * (1 - (f - r.at) / 14)})` : "transparent",
              }}
            >
              <Avatar src={r.av} name={r.name.replace("+", "")[0]} size={52} />
              <div style={{ flex: 1, minWidth: 0, borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: 12, paddingTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 16.5, fontWeight: 650, color: "#111" }}>{r.name}</span>
                  <span style={{ fontSize: 13, color: C.wa, fontWeight: 600 }}>now</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 3 }}>
                  <span style={{ fontSize: 14.5, color: "#667781", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 240 }}>{r.msg}</span>
                  <span style={{ minWidth: 22, height: 22, borderRadius: 11, background: C.wa, color: "#fff", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>
                    {r.n}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

type Banner = { at: number; x: number; y: number; z: number; el: React.ReactNode };

export const S02Buzz: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l02", "buzz").map((x) => x.f);
  const rise = pop(f, -4, { damping: 17, stiffness: 90, mass: 1.1 });
  const pings = [...BUZZ_PINGS, voAt("c1", "buzz"), voAt("c2", "buzz"), voAt("c3", "buzz"), voAt("c4", "buzz")];
  let jitter = 0;
  for (const p of pings) {
    const d = f - p;
    if (d >= 0 && d < 9) jitter += Math.sin(d * 2.6) * (9 - d) * 0.9;
  }
  const textOut = tween(f, 118, 132, 0, 1, EASE_IN);
  const exit = tween(f, 186, 208, 0, 1, EASE_IN);

  const banners: Banner[] = [
    {
      at: voAt("c1", "buzz"),
      x: 120,
      y: 520,
      z: 1,
      el: (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Notif avatar="stock/av-m1.jpg" name="Brian K." msg="Hey, how much is this one? 👕" width={520} />
          <Photo src="products/polo-london.jpg" style={{ width: 92, height: 92, borderRadius: 18, boxShadow: "0 12px 30px rgba(11,60,90,0.18)" }} />
        </div>
      ),
    },
    { at: voAt("c2", "buzz"), x: 560, y: 80, z: 0.92, el: <Notif avatar="stock/av-w1.jpg" name="Amina" msg="Is it still available?" width={460} /> },
    {
      at: voAt("c3", "buzz"),
      x: 170,
      y: 740,
      z: 1.04,
      el: (
        <Notif
          avatar="stock/av-m2.jpg"
          name="Kato J."
          width={540}
          msg={
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              🎤 <Wave f={f} at={voAt("c3", "buzz")} dur={56} bars={22} /> 0:02 · Ntinda delivery?
            </span>
          }
        />
      ),
    },
    { at: voAt("c4", "buzz"), x: 1170, y: 800, z: 1.08, el: <Notif avatar="stock/av-w3.jpg" name="Grace" msg="Hello?? Are you there? 👀" width={470} /> },
  ];

  return (
    <AbsoluteFill>
      <Haze />
      <AbsoluteFill
        style={{
          transform: `scale(${1 + tween(f, 0, 200, 0, 0.05) + exit * 0.12})`,
          filter: exit > 0 ? `blur(${exit * 16}px)` : undefined,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 140,
            top: 190,
            opacity: 1 - textOut,
            filter: `blur(${textOut * 14}px)`,
            transform: `translateY(${-textOut * 30}px)`,
          }}
        >
          <Kinetic text="Your phone hasn't" f={f} times={w.slice(0, 3)} size={92} weight={600} />
          <Kinetic text="stopped *buzzing.*" f={f} times={w.slice(3, 5)} size={92} weight={600} />
          <div style={{ marginTop: 22, opacity: tween(f, w[5] - 2, w[6] + 6) }}>
            <span style={{ fontFamily: FONT, fontSize: 30, color: C.sub, fontWeight: 500 }}>
              since 6:00 AM <span style={{ color: C.mute }}>· 49 chats · 290 unread</span>
            </span>
          </div>
        </div>

        <div style={{ position: "absolute", left: 1090, top: 120, perspective: 2400 }}>
          <div
            style={{
              transform: `translateY(${(1 - rise) * 980}px) rotateY(${-16 + 4 * rise}deg) rotateX(${5}deg) rotateZ(${2.5 + jitter * 0.12}deg) translateX(${jitter}px)`,
              transformOrigin: "50% 60%",
            }}
          >
            <IPhone time="23:47">
              <ChatList f={f} />
            </IPhone>
          </div>
        </div>

        {banners.map((b, i) => {
          if (f < b.at - 2) return null;
          const s = pop(f, b.at, { damping: 15, stiffness: 170 });
          const age = f - b.at;
          const recede = Math.min(1, Math.max(0, (age - 30) / 60));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: b.x,
                top: b.y,
                transform: `translateY(${(1 - s) * 40 - recede * 10}px) scale(${1.22 * b.z * (0.85 + 0.15 * s) * (1 - recede * 0.06)})`,
                transformOrigin: "0% 0%",
                opacity: Math.min(1, s * 1.5) * (1 - recede * 0.25),
                filter: `blur(${(1 - Math.min(1, s)) * 10 + recede * 1.5}px)`,
                zIndex: 10 + i,
              }}
            >
              {b.el}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
