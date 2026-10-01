import React from "react";
import { AbsoluteFill } from "remotion";
import { ArrowRight } from "lucide-react";
import { pop, useSceneFrame } from "../anim";
import { Flare, Flash, Layer, World } from "../components/Cam";
import { Haze } from "../components/Haze";
import { Cursor } from "../components/Cursor";
import { OrdaMark } from "../components/OrdaMark";
import { Photo } from "../components/AppUI";
import { cam, CamKeys, E, kf, rand } from "../motion";
import { C, FONT } from "../theme";
import { P } from "../products";
import { voWords } from "../timeline";
import { useVertical } from "../format";

const BACK = [P.madrid, P.supreme, P.asics, P.london, P.cerave, P.paris, P.nivea, P.perfume];

export const S10Outro: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l12", "outro").map((x) => x.f);
  const V = useVertical();
  // Vertical: the stack moves to the frame's center line and the product ring becomes a tall ellipse.
  const X = V ? 540 : 960;
  const Y = V ? { logo: 860, tag: 1040, cta: 1170, foot: 1290 } : { logo: 430, tag: 612, cta: 735, foot: 850 };
  // l12: GetOrda. Start free, at getorda dot app.
  const K: CamKeys = { z: [[0, -60], [198, 130, E.inOut]], ry: [[0, -7], [198, 5, E.inOut]], rx: [[0, 5], [198, -1, E.inOut]] };
  const c = cam(f, K);
  const shake = f >= 0 && f < 12 ? Math.sin(f * 2.9) * (12 - f) * 1.8 : 0;
  const land = kf(f, [[-4, 0], [7, 1, E.out]]);
  const settle = pop(f, 6, { damping: 9, stiffness: 220 });
  const ring = kf(f, [[5, 0], [50, 1, E.out]]);
  const name = kf(f, [[w[0] - 4, 0], [w[0] + 14, 1, E.inOut]]);
  const tag = kf(f, [[w[0] + 12, 0], [w[0] + 30, 1, E.out]]);
  const cta = pop(f, w[1] - 4, { damping: 14, stiffness: 160 });
  const click = w[4] + 2;
  const press = Math.sin(Math.PI * kf(f, [[click - 3, 0], [click + 7, 1, E.lin]]));
  const ripple = kf(f, [[click, 0], [click + 26, 1, E.out]]);
  const shine = kf(f, [[click + 2, -30], [click + 26, 130, E.lin]]);
  const foot = kf(f, [[w[6] + 4, 0], [w[6] + 20, 1, E.out]]);
  const backIn = kf(f, [[4, 0], [40, 1, E.out]]);

  return (
    <AbsoluteFill>
      <Haze intensity={1.1} />
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
        <World c={c}>
          {BACK.map((p, i) => {
            const ang = (i / BACK.length) * Math.PI * 2 + 0.4;
            return (
              <Layer
                key={p.name}
                x={V ? 540 + Math.cos(ang) * 800 : 960 + Math.cos(ang) * 1500}
                y={(V ? 900 + Math.sin(ang) * 1500 : 520 + Math.sin(ang) * 800) + Math.sin((f + i * 30) / 22) * 14}
                z={-900 - rand(i) * 500}
                rz={(rand(i + 4) - 0.5) * 16}
                o={backIn * 0.85}
                focus={0}
                dof={0.008}
              >
                <div style={{ width: 300, height: 300, borderRadius: 32, overflow: "hidden", background: "#fff", boxShadow: "0 24px 60px rgba(11,60,90,0.16)" }}>
                  <Photo src={p.src} fit={p.fit} style={{ width: "100%", height: "100%" }} />
                </div>
              </Layer>
            );
          })}
          <Layer x={X} y={Y.logo - 10} z={-300} o={0.9}>
            <div style={{ width: 1100, height: 1100, borderRadius: "50%", background: "radial-gradient(circle, rgba(109,212,241,0.42) 0%, rgba(109,212,241,0) 62%)" }} />
          </Layer>
          <Layer x={X} y={Y.logo} z={0}>
            <div style={{ display: "flex", alignItems: "center", fontFamily: FONT, transformStyle: "preserve-3d" }}>
              <div
                style={{
                  transform: `translateZ(${(1 - land) * 1400}px) rotateX(${(1 - land) * 80}deg) rotateZ(${(1 - land) * 30}deg) scale(${0.85 + 0.15 * settle})`,
                  filter: `drop-shadow(0 ${30 * land}px ${44 * land}px rgba(11,110,146,0.3))`,
                }}
              >
                <OrdaMark size={180} id="outro" color="#12120F" />
              </div>
              <div style={{ width: 680 * name, overflow: "hidden" }}>
                <span style={{ display: "inline-block", paddingLeft: 40, fontSize: 160, fontWeight: 700, letterSpacing: "-0.05em", color: C.ink, opacity: name, filter: `blur(${(1 - name) * 14}px)`, transform: `translateX(${(1 - name) * -120}px)` }}>
                  GetOrda
                </span>
              </div>
            </div>
          </Layer>
          <Layer x={X} y={Y.tag} z={30} o={tag}>
            <div style={{ fontFamily: FONT, fontSize: 42, fontWeight: 500, color: C.sub, letterSpacing: "-0.02em", whiteSpace: "nowrap", filter: `blur(${(1 - tag) * 10}px)` }}>
              The AI employee for your WhatsApp business.
            </div>
          </Layer>
          <Layer x={X} y={Y.cta} z={70} s={cta * (1 - 0.05 * press)} o={Math.min(1, cta)}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 600 + ripple * 500,
                  height: 110 + ripple * 260,
                  marginLeft: -(600 + ripple * 500) / 2,
                  marginTop: -(110 + ripple * 260) / 2,
                  borderRadius: 999,
                  border: `3px solid rgba(109,212,241,${0.8 * (1 - ripple)})`,
                  opacity: ripple > 0 ? 1 : 0,
                }}
              />
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "26px 48px",
                  borderRadius: 999,
                  background: C.cyan,
                  color: "#06323F",
                  fontFamily: FONT,
                  fontSize: 40,
                  fontWeight: 750,
                  letterSpacing: "-0.02em",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  boxShadow: "0 22px 60px rgba(109,212,241,0.6), inset 0 -3px 0 rgba(6,50,63,0.12)",
                }}
              >
                Start free at getorda.app
                <ArrowRight size={38} strokeWidth={2.6} />
                <div style={{ position: "absolute", top: 0, bottom: 0, left: `${shine}%`, width: 150, background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.8), transparent)", transform: "skewX(-20deg)" }} />
              </div>
            </div>
          </Layer>
          <Layer x={X} y={Y.foot} z={40} o={foot}>
            <div style={{ fontFamily: FONT, fontSize: 27, color: C.mute, fontWeight: 500, whiteSpace: "nowrap" }}>No card needed · Live on your WhatsApp in minutes</div>
          </Layer>
          <Layer x={0} y={0} z={90} center={false}>
            <div style={{ position: "relative", width: V ? 1080 : 1920, height: V ? 1920 : 1080 }}>
              <Cursor
                f={f}
                keys={
                  V
                    ? [
                        { f: w[2], x: 900, y: 1820 },
                        { f: click - 6, x: 700, y: 1200 },
                        { f: click + 20, x: 710, y: 1208 },
                        { f: 190, x: 820, y: 1500 },
                      ]
                    : [
                        { f: w[2], x: 1520, y: 1080 },
                        { f: click - 6, x: 1180, y: 770 },
                        { f: click + 20, x: 1190, y: 778 },
                        { f: 190, x: 1320, y: 920 },
                      ]
                }
                clicks={[click]}
                show={[w[2], 150]}
              />
            </div>
          </Layer>
        </World>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div
            style={{
              width: 200 + ring * 1600,
              height: 200 + ring * 1600,
              marginTop: V ? -200 : -220,
              borderRadius: "50%",
              border: `3px solid rgba(109,212,241,${0.8 * (1 - ring)})`,
              boxShadow: `0 0 160px rgba(109,212,241,${0.45 * (1 - ring)})`,
            }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
      <Flare p={kf(f, [[0, 0], [5, 0.95, E.out], [42, 0, E.out]])} y={V ? 45 : 40} />
      <Flash p={kf(f, [[-10, 1], [14, 0, E.out]])} />
    </AbsoluteFill>
  );
};
