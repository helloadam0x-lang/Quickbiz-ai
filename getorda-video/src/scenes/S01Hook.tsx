import React from "react";
import { AbsoluteFill } from "remotion";
import { useSceneFrame } from "../anim";
import { Flash, Layer, MotionBlur, World } from "../components/Cam";
import { Haze } from "../components/Haze";
import { Kinetic } from "../components/Kinetic";
import { cam, camVel, CamKeys, E, kf } from "../motion";
import { C } from "../theme";
import { voWords } from "../timeline";

// "Let me guess…" — the ellipsis turns into a WhatsApp typing bubble and the camera dives into it.
const K: CamKeys = {
  z: [[-10, -380], [30, 0], [38, 20, E.inOut], [60, 1350, E.in]],
  x: [[30, 0], [60, 330, E.in]],
  y: [[30, 0], [60, 8, E.in]],
  ry: [[-10, -10], [34, 0]],
  rx: [[-10, 6], [34, 0]],
};

export const S01Hook: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l01", "hook").map((x) => x.f);
  const c = cam(f, K);
  const v = camVel(f, K);
  const bubble = kf(f, [[34, 0], [44, 1, E.out]]);
  const textOut = kf(f, [[40, 0], [54, 1, E.in]]);
  const white = kf(f, [[50, 0], [60, 1, E.in]]);
  const bounce = (i: number) => (f > 36 ? Math.max(0, Math.sin(f / 3.2 - i * 0.9)) : 0);

  return (
    <AbsoluteFill>
      <Haze />
      <MotionBlur vx={v.vx} vy={v.vy + v.vz * 0.05} amount={0.25}>
        <World c={c}>
          <Layer x={960} y={540} z={0}>
            <div style={{ display: "flex", alignItems: "baseline", whiteSpace: "nowrap" }}>
              <div style={{ opacity: 1 - textOut, filter: textOut > 0 ? `blur(${textOut * 16}px)` : undefined }}>
                <Kinetic text="Let me *guess*" f={f} times={w} size={156} weight={600} dur={16} lead={4} />
              </div>
              <div
                style={{
                  position: "relative",
                  marginLeft: 10,
                  width: 150,
                  height: 92,
                  transform: `translateY(${-14 * bubble}px)`,
                  opacity: kf(f, [[w[2] - 2, 0], [w[2] + 10, 1, E.out]]),
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 46,
                    borderBottomLeftRadius: 12 + 34 * (1 - bubble),
                    background: "#FFFFFF",
                    boxShadow: `0 14px 40px rgba(11,60,90,${0.16 * bubble})`,
                    transform: `scale(${0.4 + 0.6 * bubble})`,
                    opacity: bubble,
                  }}
                />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        background: bubble > 0.5 ? "#8696A0" : C.cyanDeep,
                        transform: `translateY(${(1 - bubble) * 30 - 8 * bounce(i)}px)`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Layer>
        </World>
      </MotionBlur>
      <Flash p={white} />
    </AbsoluteFill>
  );
};
