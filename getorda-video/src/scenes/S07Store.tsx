import React from "react";
import { AbsoluteFill } from "remotion";
import { Lock } from "lucide-react";
import { caretOn, pop, typed, useSceneFrame } from "../anim";
import { Layer, MotionBlur, World } from "../components/Cam";
import { Haze } from "../components/Haze";
import { IPhone } from "../components/IPhone";
import { Kinetic } from "../components/Kinetic";
import { Photo, Pill } from "../components/AppUI";
import { WAIcon } from "../components/WA";
import { cam, camVel, CamKeys, E, kf } from "../motion";
import { C, FONT, SH } from "../theme";
import { P } from "../products";
import { voWords } from "../timeline";
import { useVertical } from "../format";

const URL = "dripavenue.getorda.app";

// The storefront assembles itself section by section, like it's being generated.
const Storefront: React.FC<{ f: number }> = ({ f }) => {
  const hero = kf(f, [[0, 0], [12, 1, E.out]]);
  const scroll = kf(f, [[34, 0], [84, 1, E.inOut]]);
  const items = [P.london, P.asics, P.nivea, P.perfume];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: FONT }}>
      <div style={{ transform: `translateY(${-scroll * 220}px)` }}>
        <div style={{ height: 380, position: "relative", background: "linear-gradient(165deg,#DDF5FD 0%,#9FE3F6 60%,#6DD4F1 100%)", overflow: "hidden", transform: `translateY(${(1 - hero) * -380}px)` }}>
          <Photo src="products/jersey-supreme-cut.png" fit="contain" style={{ position: "absolute", width: 300, height: 300, right: -18, top: 70, transform: `rotate(${-8 + scroll * 4}deg) scale(${0.8 + 0.2 * hero})`, filter: "drop-shadow(0 20px 26px rgba(11,60,90,0.3))" }} />
          <div style={{ position: "absolute", left: 22, top: 74 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.cyanInk, letterSpacing: "0.12em" }}>NEW DROP</div>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.04em", color: C.ink, lineHeight: 1, marginTop: 6 }}>
              Drip
              <br />
              Avenue
            </div>
            <div style={{ fontSize: 13.5, color: C.ink2, marginTop: 8 }}>Same-day delivery</div>
          </div>
          <div style={{ position: "absolute", left: 22, bottom: 24, display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 999, background: C.wa, color: "#fff", fontSize: 14.5, fontWeight: 700 }}>
            <WAIcon size={22} bg="transparent" /> Order on WhatsApp
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "16px 16px 10px", opacity: kf(f, [[10, 0], [18, 1]]) }}>
          {["All", "Polos", "Sneakers", "Beauty"].map((t, i) => (
            <span key={t} style={{ padding: "7px 14px", borderRadius: 999, fontSize: 13.5, fontWeight: 600, background: i === 0 ? C.ink : "#F1F4F5", color: i === 0 ? "#fff" : C.sub }}>
              {t}
            </span>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 14px" }}>
          {items.map((p, i) => {
            const s = pop(f, 14 + i * 4, { damping: 14, stiffness: 200 });
            return (
              <div key={p.name} style={{ borderRadius: 14, border: `1px solid ${C.line}`, overflow: "hidden", transform: `scale(${0.7 + 0.3 * s})`, opacity: Math.min(1, s) }}>
                <Photo src={p.src} fit={p.fit} style={{ width: "100%", height: 150, background: "#fff" }} />
                <div style={{ padding: "8px 10px 10px" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 750, color: C.ink, marginTop: 2 }}>{p.price}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const S07Store: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l09", "store").map((x) => x.f);
  // l09: Your own store, live in a minute.
  const V = useVertical();
  const PHONE = V ? { x: 540, y: 1250 } : { x: 1360, y: 560 };
  const KV: CamKeys = {
    ry: [[-10, -6], [82, 5, E.inOut]],
    z: [[-10, 240], [82, 40, E.inOut]],
    x: [[-10, -70], [82, -25, E.inOut]],
    y: [[-10, 60], [82, 120, E.inOut]],
    rx: [[-10, 4], [82, 0, E.inOut]],
  };
  const KL: CamKeys = {
    ry: [[-10, -12], [82, 6, E.inOut]],
    z: [[-10, 240], [82, 40, E.inOut]],
    x: [[-10, 40], [82, -30, E.inOut]],
    rx: [[-10, 5], [82, 0, E.inOut]],
  };
  const K = V ? KV : KL;
  const c = cam(f, K);
  const v = camVel(f, K);
  const url = typed(URL, f, -4, 1.1);
  const live = pop(f, w[3] - 2, { damping: 12, stiffness: 220 });
  const float = (i: number) => Math.sin((f + i * 20) / 16) * 10;

  return (
    <AbsoluteFill>
      <Haze />
      <MotionBlur vx={v.vx} vy={v.vy} amount={0.25}>
        <World c={c}>
          <Layer x={V ? 900 : 1690} y={(V ? 820 : 260) + float(1)} z={-260} rz={10} focus={0} dof={0.01}>
            <Photo src="products/nivea-rollon-cut.png" fit="contain" style={{ width: 170, height: 250, filter: "drop-shadow(0 20px 30px rgba(11,60,90,0.25))" }} />
          </Layer>
          <Layer x={V ? 220 : 980} y={(V ? 1620 : 880) + float(2)} z={260} rz={-12} focus={0} dof={0.008}>
            <Photo src="products/jersey-supreme-cut.png" fit="contain" style={{ width: 300, height: 300, filter: "drop-shadow(0 24px 36px rgba(11,60,90,0.28))" }} />
          </Layer>
          <Layer x={V ? 110 : 200} y={V ? 270 : 250} z={140} center={false}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                padding: "18px 28px",
                borderRadius: 999,
                background: "#fff",
                border: `1px solid ${C.line}`,
                boxShadow: SH.float,
                fontFamily: FONT,
                fontSize: 36,
                fontWeight: 550,
                color: C.ink,
                whiteSpace: "nowrap",
              }}
            >
              <Lock size={28} color={C.ok} strokeWidth={2.4} />
              <span>
                {url}
                <span style={{ color: C.cyanDeep, opacity: url.length < URL.length && caretOn(f) ? 1 : 0 }}>|</span>
              </span>
              <span style={{ transform: `scale(${live})`, display: "inline-flex", marginLeft: 6 }}>
                <Pill tone="ok" size={21} dot>
                  Live
                </Pill>
              </span>
            </div>
          </Layer>
          <Layer x={V ? 110 : 200} y={V ? 450 : 430} z={40} center={false}>
            <div style={{ whiteSpace: "nowrap" }}>
              <Kinetic text="Your own *store,*" f={f} times={w.slice(0, 3)} size={V ? 96 : 112} />
              <Kinetic text="live in a *minute.*" f={f} times={w.slice(3, 7)} size={V ? 96 : 112} />
            </div>
          </Layer>
          <Layer x={PHONE.x} y={PHONE.y} z={0} ry={-10}>
            <IPhone time="09:12">
              <Storefront f={f} />
            </IPhone>
          </Layer>
        </World>
      </MotionBlur>
    </AbsoluteFill>
  );
};
