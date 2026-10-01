import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, tween, useSceneFrame, EASE_IN, EASE_IN_OUT } from "../anim";
import { Haze } from "../components/Haze";
import { Kinetic } from "../components/Kinetic";
import { OrdaMark } from "../components/OrdaMark";
import { WAIcon } from "../components/WA";
import { C, FONT } from "../theme";
import { voWords } from "../timeline";

export const S04Meet: React.FC = () => {
  const f = useSceneFrame();
  const w4 = voWords("l04", "meet").map((x) => x.f);
  const w5 = voWords("l05", "meet").map((x) => x.f);
  const flash = 1 - tween(f, -2, 16);
  const mark = pop(f, 0, { damping: 11, stiffness: 150 });
  const meet = tween(f, w4[0] - 3, w4[0] + 12, 0, 1, EASE_IN_OUT);
  const name = tween(f, w4[1] - 3, w4[1] + 14, 0, 1, EASE_IN_OUT);
  const up = tween(f, w5[0] - 12, w5[0] + 8, 0, 1, EASE_IN_OUT);
  const ring = tween(f, 0, 40);
  const live = pop(f, w5[5] + 4, { damping: 13, stiffness: 170 });
  const exit = tween(f, 126, 148, 0, 1, EASE_IN);

  return (
    <AbsoluteFill>
      <Haze />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${1 + tween(f, 0, 140, 0, 0.04) + exit * 0.3})`,
          filter: exit > 0 ? `blur(${exit * 20}px)` : undefined,
          opacity: 1 - exit * 0.5,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 200 + ring * 1100,
            height: 200 + ring * 1100,
            borderRadius: "50%",
            border: `2px solid rgba(109,212,241,${0.7 * (1 - ring)})`,
            boxShadow: `0 0 120px rgba(109,212,241,${0.35 * (1 - ring)})`,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 150,
            letterSpacing: "-0.05em",
            color: C.ink,
            transform: `translateY(${-up * 120}px) scale(${1 - up * 0.22})`,
          }}
        >
          <div style={{ width: 430 * meet, overflow: "hidden", display: "flex", justifyContent: "flex-end" }}>
            <span style={{ paddingRight: 34, opacity: meet, filter: `blur(${(1 - meet) * 14}px)`, transform: `translateX(${(1 - meet) * 100}px)`, fontWeight: 600 }}>
              Meet
            </span>
          </div>
          <div style={{ transform: `scale(${mark}) rotate(${(1 - mark) * -30}deg)`, filter: `drop-shadow(0 26px 40px rgba(11,110,146,${0.22 * Math.min(1, mark)}))` }}>
            <OrdaMark size={168} id="meet" color="#12120F" />
          </div>
          <div style={{ width: 620 * name, overflow: "hidden" }}>
            <span style={{ display: "inline-block", paddingLeft: 34, opacity: name, filter: `blur(${(1 - name) * 14}px)`, transform: `translateX(${(1 - name) * -120}px)` }}>
              GetOrda
            </span>
          </div>
        </div>

        <div style={{ position: "absolute", top: 600, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Kinetic text="Your AI employee, right inside *WhatsApp.*" f={f} times={w5} size={66} weight={550} align="center" color={C.ink2} />
          <div
            style={{
              marginTop: 40,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 22px 12px 12px",
              borderRadius: 999,
              background: "#fff",
              border: "1px solid #CBE5D6",
              boxShadow: "0 12px 30px rgba(17,17,16,0.08)",
              transform: `scale(${live})`,
              opacity: Math.min(1, live),
              fontFamily: FONT,
              fontSize: 24,
              fontWeight: 650,
              color: C.ok,
            }}
          >
            <WAIcon size={38} />
            <span style={{ width: 10, height: 10, borderRadius: 5, background: "#22A559", boxShadow: `0 0 0 ${4 + 3 * Math.sin(f / 5)}px rgba(34,165,89,0.18)` }} />
            WhatsApp Live · replying 24/7
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};
