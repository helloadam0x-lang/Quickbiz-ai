import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, useSceneFrame } from "../anim";
import { Flare, Flash, Layer, World } from "../components/Cam";
import { Haze } from "../components/Haze";
import { Kinetic } from "../components/Kinetic";
import { OrdaMark } from "../components/OrdaMark";
import { WAIcon } from "../components/WA";
import { cam, CamKeys, E, kf, rand } from "../motion";
import { C, FONT } from "../theme";
import { voWords } from "../timeline";
import { useVertical } from "../format";

export const S04Meet: React.FC = () => {
  const f = useSceneFrame();
  const w4 = voWords("l04", "meet").map((x) => x.f);
  const w5 = voWords("l05", "meet").map((x) => x.f);
  const V = useVertical();
  // Vertical: the logo row is scaled to fit and the line below wraps onto two lines.
  const ROW = V ? { x: 540, y: 860, s: 0.68, up: 0.12 } : { x: 960, y: 470, s: 1, up: 0.2 };
  const K: CamKeys = {
    z: [[0, 0], [50, 90], [138, 190, E.inOut]],
    x: V ? [[0, -30], [138, 30, E.inOut]] : [[0, -50], [138, 50, E.inOut]],
    ry: [[0, -9], [138, 7, E.inOut]],
    rx: [[0, 5], [138, -2, E.inOut]],
  };
  const c = cam(f, K);
  const shake = f >= 0 && f < 12 ? Math.sin(f * 2.9) * (12 - f) * 1.6 : 0;
  // The mark drops out of the camera and flips flat onto the stage.
  const land = kf(f, [[-4, 0], [7, 1, E.out]]);
  const settle = pop(f, 6, { damping: 9, stiffness: 220 });
  const ring = kf(f, [[5, 0], [46, 1, E.out]]);
  const meet = kf(f, [[w4[0] - 3, 0], [w4[0] + 12, 1, E.inOut]]);
  const name = kf(f, [[w4[1] - 3, 0], [w4[1] + 14, 1, E.inOut]]);
  const up = kf(f, [[w5[0] - 12, 0], [w5[0] + 8, 1, E.inOut]]);
  const live = pop(f, w5[5] + 4, { damping: 13, stiffness: 170 });

  return (
    <AbsoluteFill>
      <Haze />
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
        <World c={c}>
          <Layer x={ROW.x} y={ROW.y} z={-420} o={0.9}>
            <div style={{ width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(109,212,241,0.45) 0%, rgba(109,212,241,0) 65%)" }} />
          </Layer>
          {/* Soft cyan bokeh drifting in depth gives the hold parallax. */}
          {Array.from({ length: 14 }).map((_, i) => {
            const r = 30 + rand(i + 60) * 90;
            return (
              <Layer
                key={i}
                x={V ? 540 + (rand(i + 20) - 0.5) * 1700 : 960 + (rand(i + 20) - 0.5) * 2700}
                y={(V ? 960 + (rand(i + 40) - 0.5) * 2600 : 540 + (rand(i + 40) - 0.5) * 1500) + Math.sin((f + i * 17) / 30) * 24}
                z={-1500 + rand(i) * 1600}
                o={0.55 * kf(f, [[4, 0], [36, 1, E.out]])}
                focus={0}
                dof={0.016}
              >
                <div style={{ width: r * 2, height: r * 2, borderRadius: "50%", background: "radial-gradient(circle, rgba(109,212,241,0.6) 0%, rgba(109,212,241,0) 70%)" }} />
              </Layer>
            );
          })}
          <Layer x={ROW.x} y={ROW.y - up * 110 * ROW.s} z={0} s={(1 - up * ROW.up) * ROW.s}>
            <div style={{ display: "flex", alignItems: "center", fontFamily: FONT, fontWeight: 700, fontSize: 156, letterSpacing: "-0.05em", color: C.ink, whiteSpace: "nowrap", transformStyle: "preserve-3d" }}>
              <div style={{ width: 440 * meet, overflow: "hidden", display: "flex", justifyContent: "flex-end" }}>
                <span style={{ paddingRight: 36, opacity: meet, filter: `blur(${(1 - meet) * 14}px)`, transform: `translateX(${(1 - meet) * 100}px)`, fontWeight: 600 }}>Meet</span>
              </div>
              <div
                style={{
                  transform: `translateZ(${(1 - land) * 1300}px) rotateX(${(1 - land) * 75}deg) rotateZ(${(1 - land) * -28}deg) scale(${0.85 + 0.15 * settle})`,
                  filter: `drop-shadow(0 ${30 * land}px ${44 * land}px rgba(11,110,146,0.28))`,
                }}
              >
                <OrdaMark size={176} id="meet" color="#12120F" />
              </div>
              <div style={{ width: 640 * name, overflow: "hidden" }}>
                <span style={{ display: "inline-block", paddingLeft: 36, opacity: name, filter: `blur(${(1 - name) * 14}px)`, transform: `translateX(${(1 - name) * -120}px)` }}>GetOrda</span>
              </div>
            </div>
          </Layer>
          <Layer x={ROW.x} y={V ? 1070 : 655} z={50}>
            <div style={{ whiteSpace: "nowrap" }}>
              {V ? (
                <>
                  <Kinetic text="Your AI employee," f={f} times={w5.slice(0, 3)} size={74} weight={550} align="center" color={C.ink2} />
                  <Kinetic text="right inside *WhatsApp.*" f={f} times={w5.slice(3)} size={74} weight={550} align="center" color={C.ink2} />
                </>
              ) : (
                <Kinetic text="Your AI employee, right inside *WhatsApp.*" f={f} times={w5} size={68} weight={550} align="center" color={C.ink2} />
              )}
            </div>
          </Layer>
          <Layer x={ROW.x} y={V ? 1250 : 770} z={90} s={live} o={Math.min(1, live)}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 24px 12px 12px",
                borderRadius: 999,
                background: "#fff",
                border: "1px solid #CBE5D6",
                boxShadow: "0 16px 36px rgba(17,17,16,0.10)",
                fontFamily: FONT,
                fontSize: 25,
                fontWeight: 650,
                color: C.ok,
                whiteSpace: "nowrap",
              }}
            >
              <WAIcon size={40} />
              <span style={{ width: 11, height: 11, borderRadius: 6, background: "#22A559", boxShadow: `0 0 0 ${5 + 3 * Math.sin(f / 5)}px rgba(34,165,89,0.18)` }} />
              WhatsApp Live · replying 24/7
            </div>
          </Layer>
        </World>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div
            style={{
              width: 180 + ring * 1500,
              height: 180 + ring * 1500,
              marginTop: V ? -200 : -140,
              borderRadius: "50%",
              border: `3px solid rgba(109,212,241,${0.8 * (1 - ring)})`,
              boxShadow: `0 0 160px rgba(109,212,241,${0.45 * (1 - ring)}), inset 0 0 80px rgba(109,212,241,${0.3 * (1 - ring)})`,
            }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
      <Flare p={kf(f, [[0, 0], [5, 0.9, E.out], [40, 0, E.out]])} y={44} />
      <Flash p={kf(f, [[-10, 1], [14, 0, E.out]])} />
    </AbsoluteFill>
  );
};
