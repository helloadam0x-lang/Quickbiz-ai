import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, tween, useSceneFrame, EASE_IN, EASE_IN_OUT } from "../anim";
import { LightMesh } from "../components/Backgrounds";
import { OrdaMark } from "../components/OrdaMark";
import { C, FONT } from "../theme";

export const Meet: React.FC = () => {
  const f = useSceneFrame();
  const flash = 1 - tween(f, 0, 14);
  const m = pop(f, 0, { damping: 11, stiffness: 140 });
  // The mark lands alone, then the words open out from behind it.
  const open = tween(f, 22, 44, 0, 1, EASE_IN_OUT);
  const sub = tween(f, 50, 68);
  const fly = tween(f, 100, 126, 0, 1, EASE_IN);
  const size = 170;
  const meetW = 450;
  const nameW = 700;

  return (
    <AbsoluteFill>
      <LightMesh />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${1 + tween(f, 0, 110, 0, 0.05) + fly * 7})`,
          opacity: 1 - tween(f, 112, 126),
          filter: `blur(${fly * 14}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 150,
            letterSpacing: "-0.05em",
            color: C.ink,
          }}
        >
          <div style={{ width: meetW * open, overflow: "hidden", display: "flex", justifyContent: "flex-end" }}>
            <span
              style={{
                paddingRight: 36,
                opacity: open,
                filter: `blur(${(1 - open) * 16}px)`,
                transform: `translateX(${(1 - open) * 120}px)`,
              }}
            >
              Meet
            </span>
          </div>
          <div
            style={{
              transform: `scale(${m}) rotate(${(1 - m) * -40}deg)`,
              filter: `drop-shadow(0 30px 40px rgba(14,90,60,${0.25 * m}))`,
            }}
          >
            <OrdaMark size={size} id="meet" />
          </div>
          <div style={{ width: nameW * open, overflow: "hidden" }}>
            <span
              style={{
                display: "inline-block",
                paddingLeft: 36,
                opacity: open,
                filter: `blur(${(1 - open) * 16}px)`,
                transform: `translateX(${(1 - open) * -140}px)`,
              }}
            >
              GetOrda
            </span>
          </div>
        </div>
        <div
          style={{
            marginTop: 44,
            fontFamily: FONT,
            fontSize: 44,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: C.sub,
            opacity: sub,
            filter: `blur(${(1 - sub) * 10}px)`,
            transform: `translateY(${(1 - sub) * 20}px)`,
          }}
        >
          Your AI employee on <span style={{ color: C.green, fontWeight: 700 }}>WhatsApp</span>.
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};
