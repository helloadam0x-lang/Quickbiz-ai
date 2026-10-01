import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, useSceneFrame } from "../anim";
import { Haze } from "../components/Haze";
import { IPhone } from "../components/IPhone";
import { Kinetic } from "../components/Kinetic";
import { Flash, Layer, MotionBlur, World } from "../components/Cam";
import { cam, camVel, CamKeys, E, kf, rand } from "../motion";
import { Photo } from "../components/AppUI";
import { Avatar, Notif, Wave } from "../components/WA";
import { C, FONT } from "../theme";
import { BUZZ_PINGS, voAt, voWords } from "../timeline";

type Row = { at: number; av?: string; name: string; msg: string; n: number };

const ROWS: Row[] = [
  { at: -100, av: "stock/av-m3.jpg", name: "Daniel", msg: "Do you have the black one?", n: 2 },
  { at: -100, name: "Mohamed A.", msg: "كم السعر؟", n: 1 },
  { at: -100, av: "stock/av-w2.jpg", name: "Sarah N.", msg: "Morning! Is CeraVe back?", n: 3 },
  { at: BUZZ_PINGS[0], name: "Leila M.", msg: "Bonjour ! Quel prix ? 🙏", n: 1 },
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

const PHONE = { x: 1300, y: 545 };
const AMINA = { x: 1170, y: 150 };
const BRIAN = { x: 600, y: 650 };
const KATO = { x: 640, y: 880 };
const GRACE = { x: 1540, y: 860 };

// Opens inside the phone screen, pulls back, then the camera snaps to each customer as they
// message (Brian, Amina, Kevin, Grace) before rushing into Amina's banner.
const K: CamKeys = {
  z: [[-10, 760], [40, 0], [77, 40], [93, 170], [104, 185], [120, 160], [128, 170], [144, 190], [161, 205], [177, 220], [212, 1100, E.in]],
  x: [[-10, PHONE.x - 960], [40, 30], [77, -10], [93, BRIAN.x - 800], [104, BRIAN.x - 780], [120, AMINA.x - 1040], [128, AMINA.x - 1030], [144, KATO.x - 800], [161, KATO.x - 780], [177, GRACE.x - 1160], [212, AMINA.x - 900, E.in]],
  y: [[-10, -150], [40, 0], [77, 0], [93, BRIAN.y - 580], [104, BRIAN.y - 584], [120, AMINA.y - 370], [128, AMINA.y - 364], [144, KATO.y - 620], [161, KATO.y - 630], [177, GRACE.y - 600], [212, AMINA.y - 540, E.in]],
  ry: [[-10, 0], [40, -16], [77, -10], [93, -4], [120, -9], [144, -2], [177, -10], [212, 0, E.in]],
  rx: [[-10, 0], [40, 4], [93, 2], [120, 4], [144, 0], [177, 2], [212, 0, E.in]],
};
// Rack focus onto whichever customer just messaged.
const FOCUS: [number, number][] = [[77, 0], [93, 140], [104, 140], [120, 60], [128, 60], [144, 190], [161, 190], [177, 250]];

const BURST_NAMES = ["Sofia", "Lucas", "Ivan", "Nadia", "Marco", "Zainab", "Ethan", "Joy"];
const BURST_MSG = ["Price?", "Still there? 🙏", "¿Precio?", "I want 3", "Hello??", "كم؟", "Delivery today?", "Reply pls"];

export const S02Buzz: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l02", "buzz").map((x) => x.f);
  const c = cam(f, K);
  const v = camVel(f, K);
  const pings = [...BUZZ_PINGS, voAt("c1", "buzz"), voAt("c2", "buzz"), voAt("c3", "buzz"), voAt("c4", "buzz")];
  let jitter = 0;
  for (const p of pings) {
    const d = f - p;
    if (d >= 0 && d < 9) jitter += Math.sin(d * 2.6) * (9 - d);
  }
  const headOut = kf(f, [[70, 0], [86, 1, E.in]]);
  const focus = kf(f, FOCUS);
  const white = kf(f, [[200, 0], [212, 1, E.in]]);

  const banners: Banner[] = [
    {
      at: voAt("c1", "buzz"),
      x: BRIAN.x,
      y: BRIAN.y,
      z: 140,
      el: (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Notif avatar="stock/av-m1.jpg" name="Brian K." msg="Hey, how much is this one? 👕" width={560} />
          <Photo src="products/polo-london.jpg" style={{ width: 100, height: 100, borderRadius: 20, boxShadow: "0 12px 30px rgba(11,60,90,0.18)" }} />
        </div>
      ),
    },
    { at: voAt("c2", "buzz"), x: AMINA.x, y: AMINA.y, z: 60, el: <Notif avatar="stock/av-w1.jpg" name="Amina" msg="Is it still available?" width={500} /> },
    {
      at: voAt("c3", "buzz"),
      x: KATO.x,
      y: KATO.y,
      z: 190,
      el: (
        <Notif
          avatar="stock/av-m2.jpg"
          name="Kevin O."
          width={580}
          msg={
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              🎤 <Wave f={f} at={voAt("c3", "buzz")} dur={56} bars={22} /> 0:02 · Delivery today?
            </span>
          }
        />
      ),
    },
    { at: voAt("c4", "buzz"), x: GRACE.x, y: GRACE.y, z: 250, el: <Notif avatar="stock/av-w3.jpg" name="Grace" msg="Hello?? Are you there? 👀" width={500} /> },
    ...BUZZ_PINGS.map((p, i) => ({
      at: p,
      x: [1650, 820, 1700, 860, 1640][i],
      y: [300, 140, 620, 420, 180][i],
      z: [-260, -320, -200, -380, -150][i],
      el: <Notif name={["Leila M.", "Grace", "Akram", "Brian K.", "Amina"][i]} msg={["Quel prix ? 🙏", "Hello??", "2 pieces please", "How much?", "Available?"][i]} width={420} />,
    })),
    ...BURST_NAMES.map((n, i) => ({
      at: 176 + i * 2.5,
      x: 300 + rand(i) * 1500,
      y: 120 + rand(i + 9) * 860,
      z: -300 + rand(i + 3) * 700,
      el: <Notif name={n} msg={BURST_MSG[i]} width={400} />,
    })),
  ];

  return (
    <AbsoluteFill>
      <Haze />
      <MotionBlur vx={v.vx} vy={v.vy} amount={0.22}>
        <World c={c}>
          <Layer x={60} y={230} z={-340} center={false} focus={c.z > 300 ? 600 : 0} dof={0.01} o={1 - headOut}>
            <div style={{ whiteSpace: "nowrap" }}>
              <Kinetic text="Your phone hasn't" f={f} times={w.slice(0, 3)} size={104} weight={600} />
              <Kinetic text="stopped *buzzing.*" f={f} times={w.slice(3, 5)} size={104} weight={600} />
              <div style={{ marginTop: 26, opacity: kf(f, [[w[5] - 2, 0], [w[6] + 6, 1, E.out]]), fontFamily: FONT, fontSize: 34, color: C.sub, fontWeight: 500 }}>
                since 6:00 AM <span style={{ color: C.mute }}>· 49 chats · 290 unread</span>
              </div>
            </div>
          </Layer>

          <Layer x={PHONE.x} y={PHONE.y} z={0} ry={-8} rz={2 + jitter * 0.1} focus={focus} dof={0.008} style={{ marginLeft: jitter }}>
            <IPhone time="23:47">
              <ChatList f={f} />
            </IPhone>
          </Layer>

          {banners.map((b, i) => {
            if (f < b.at - 1) return null;
            const s = pop(f, b.at, { damping: 15, stiffness: 170 });
            const age = f - b.at;
            const recede = Math.min(1, Math.max(0, (age - 40) / 70));
            return (
              <Layer
                key={i}
                x={b.x}
                y={b.y + (1 - s) * 50}
                z={b.z - recede * 120 + (1 - Math.min(1, s)) * 160}
                s={(b.z > 100 ? 1.12 : 1) * (0.82 + 0.18 * s)}
                o={Math.min(1, s * 1.6) * (1 - recede * 0.3)}
                focus={c.z > 300 ? 300 : focus}
                dof={b.z > 0 ? 0.01 : 0.018}
              >
                {b.el}
              </Layer>
            );
          })}
        </World>
      </MotionBlur>
      <Flash p={white} />
    </AbsoluteFill>
  );
};
