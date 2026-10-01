import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, useSceneFrame } from "../anim";
import { Flash, Layer, MotionBlur, World } from "../components/Cam";
import { Haze } from "../components/Haze";
import { Kinetic } from "../components/Kinetic";
import { Photo, Pill } from "../components/AppUI";
import { Avatar, Ticks } from "../components/WA";
import { cam, camVel, CamKeys, E, kf } from "../motion";
import { C, FONT, SH } from "../theme";
import { voWords } from "../timeline";

const CARD = { x: 480, y: 540 };

export const S03Lost: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l03", "lost").map((x) => x.f);
  // l03: And every message you miss... is a sale you just lost.
  const lostAt = w[10];
  const K: CamKeys = {
    z: [[-10, 560], [30, 40], [lostAt - 2, 90, E.inOut], [lostAt + 4, 130, E.out], [118, 60, E.inOut]],
    x: [[-10, CARD.x - 960], [30, -40], [lostAt, 0, E.inOut], [118, 30]],
    y: [[-10, -40], [30, 0]],
    ry: [[-10, 12], [40, 5], [118, -3]],
  };
  const c = cam(f, K);
  const v = camVel(f, K);
  const shake = f >= lostAt && f < lostAt + 10 ? Math.sin((f - lostAt) * 3.1) * (10 - (f - lostAt)) * 1.4 : 0;
  const gray = kf(f, [[lostAt - 3, 0], [lostAt + 8, 1, E.out]]);
  const stamp = pop(f, lostAt, { damping: 9, stiffness: 260 });
  const fall = kf(f, [[lostAt + 6, 0], [lostAt + 26, 1, E.in]]);
  const mins = Math.round(kf(f, [[6, 8 * 60 + 14], [54, 11 * 60 + 26, E.inOut]]));
  const clock = `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  const white = kf(f, [[100, 0], [110, 1, E.in]]);

  return (
    <AbsoluteFill>
      <Haze />
      <MotionBlur vx={v.vx} vy={v.vy} amount={0.2}>
        <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
          <World c={c}>
            <Layer x={CARD.x} y={CARD.y} z={-fall * 280} rx={fall * 32} ry={8} o={1 - fall * 0.45}>
              <div style={{ width: 620, borderRadius: 34, background: C.waBg, boxShadow: SH.float, overflow: "hidden", fontFamily: FONT }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 24px", background: "#fff" }}>
                  <Avatar src="stock/av-w1.jpg" size={58} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 23, fontWeight: 650, color: "#111" }}>Amina</div>
                    <div style={{ fontSize: 15.5, color: "#667781" }}>last seen today at 08:14</div>
                  </div>
                </div>
                <div style={{ padding: "26px 24px 30px" }}>
                  <div style={{ width: 420, padding: 8, borderRadius: 18, borderBottomLeftRadius: 6, background: "#fff", boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)", position: "relative" }}>
                    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
                      <Photo src="products/polo-madrid.jpg" style={{ width: 404, height: 404, filter: `grayscale(${gray})` }} />
                      <div style={{ position: "absolute", inset: 0, background: `rgba(255,255,255,${gray * 0.35})` }} />
                    </div>
                    <div style={{ padding: "10px 6px 2px", fontSize: 22, color: "#111B21" }}>Is it still available? 🙏</div>
                    <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 13, color: "#667781", padding: "0 6px" }}>08:14</div>
                    <div
                      style={{
                        position: "absolute",
                        right: -56,
                        top: 46,
                        transform: `rotate(${-12 + (1 - stamp) * 24}deg) scale(${0.4 + 0.6 * stamp + (1 - Math.min(1, stamp)) * 1.2})`,
                        opacity: Math.min(1, stamp * 1.4),
                        padding: "14px 26px",
                        borderRadius: 18,
                        border: `4px solid ${C.red}`,
                        color: C.red,
                        background: "rgba(255,255,255,0.94)",
                        fontSize: 34,
                        fontWeight: 850,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        boxShadow: "0 18px 40px rgba(239,68,68,0.22)",
                      }}
                    >
                      Sale lost
                    </div>
                  </div>
                  <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12, fontSize: 17, color: "#667781" }}>
                    <Ticks read={false} size={17} /> No reply
                    <span style={{ fontVariantNumeric: "tabular-nums", padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.8)", color: C.ink2, fontWeight: 650 }}>
                      now {clock}
                    </span>
                  </div>
                </div>
              </div>
            </Layer>

            <Layer x={860} y={370} z={60} center={false}>
              <div style={{ whiteSpace: "nowrap" }}>
                <Kinetic text="Every message you *miss…*" f={f} times={w.slice(1, 5)} size={70} weight={600} />
                <div style={{ height: 14 }} />
                <Kinetic text="is a sale you just *lost.*" f={f} times={w.slice(5, 11)} size={70} weight={600} />
                <div style={{ marginTop: 34, display: "flex", gap: 12, opacity: kf(f, [[lostAt + 4, 0], [lostAt + 16, 1, E.out]]) }}>
                  <Pill tone="grey" size={22}>
                    <span style={{ textDecoration: "line-through", color: C.mute }}>UGX 100,000</span>
                  </Pill>
                  <Pill tone="amber" size={22} dot>
                    Customer went elsewhere
                  </Pill>
                </div>
              </div>
            </Layer>
          </World>
        </AbsoluteFill>
      </MotionBlur>
      <Flash p={white} />
    </AbsoluteFill>
  );
};
