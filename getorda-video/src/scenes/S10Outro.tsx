import React from "react";
import { AbsoluteFill } from "remotion";
import { ArrowRight } from "lucide-react";
import { pop, tween, useSceneFrame, EASE_IN_OUT } from "../anim";
import { Haze } from "../components/Haze";
import { Cursor } from "../components/Cursor";
import { OrdaMark } from "../components/OrdaMark";
import { C, FONT } from "../theme";
import { voWords } from "../timeline";

export const S10Outro: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l12", "outro").map((x) => x.f);
  // l12: GetOrda. Start free, at getorda dot app.
  const flash = 1 - tween(f, -2, 14);
  const mark = pop(f, 0, { damping: 11, stiffness: 150 });
  const ring = tween(f, 0, 44);
  const name = tween(f, w[0] - 4, w[0] + 14, 0, 1, EASE_IN_OUT);
  const tag = tween(f, w[0] + 12, w[0] + 30);
  const cta = pop(f, w[1] - 4, { damping: 14, stiffness: 160 });
  const click = w[4] + 2;
  const shine = tween(f, click + 2, click + 26, -30, 130, (t) => t);
  const foot = tween(f, w[6] + 4, w[6] + 20);
  const lockY = -60;

  return (
    <AbsoluteFill>
      <Haze intensity={1.1} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${1 + tween(f, 0, 200, 0, 0.05)})` }}>
        <div
          style={{
            position: "absolute",
            width: 200 + ring * 1300,
            height: 200 + ring * 1300,
            borderRadius: "50%",
            border: `2px solid rgba(109,212,241,${0.75 * (1 - ring)})`,
            boxShadow: `0 0 140px rgba(109,212,241,${0.4 * (1 - ring)})`,
            marginTop: lockY * 2,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", marginTop: lockY * 2, fontFamily: FONT }}>
          <div style={{ transform: `scale(${mark}) rotate(${(1 - mark) * -30}deg)`, filter: `drop-shadow(0 26px 40px rgba(11,110,146,${0.25 * Math.min(1, mark)}))` }}>
            <OrdaMark size={176} id="outro" color="#12120F" />
          </div>
          <div style={{ width: 660 * name, overflow: "hidden" }}>
            <span
              style={{
                display: "inline-block",
                paddingLeft: 38,
                fontSize: 156,
                fontWeight: 700,
                letterSpacing: "-0.05em",
                color: C.ink,
                opacity: name,
                filter: `blur(${(1 - name) * 14}px)`,
                transform: `translateX(${(1 - name) * -120}px)`,
              }}
            >
              GetOrda
            </span>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 610,
            fontFamily: FONT,
            fontSize: 40,
            fontWeight: 500,
            color: C.sub,
            letterSpacing: "-0.02em",
            opacity: tag,
            filter: `blur(${(1 - tag) * 10}px)`,
            transform: `translateY(${(1 - tag) * 16}px)`,
          }}
        >
          The AI employee for your WhatsApp business.
        </div>
        <div
          style={{
            position: "absolute",
            top: 700,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "24px 44px",
            borderRadius: 999,
            background: C.cyan,
            color: "#06323F",
            fontFamily: FONT,
            fontSize: 38,
            fontWeight: 750,
            letterSpacing: "-0.02em",
            overflow: "hidden",
            transform: `scale(${cta * (1 - 0.04 * Math.sin(Math.PI * tween(f, click - 3, click + 7, 0, 1, (t) => t)))})`,
            opacity: Math.min(1, cta),
            boxShadow: "0 18px 50px rgba(109,212,241,0.55), inset 0 -3px 0 rgba(6,50,63,0.12)",
          }}
        >
          Start free at getorda.app
          <ArrowRight size={36} strokeWidth={2.6} />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${shine}%`,
              width: 140,
              background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.75), transparent)",
              transform: "skewX(-20deg)",
            }}
          />
        </div>
        <div style={{ position: "absolute", top: 830, fontFamily: FONT, fontSize: 26, color: C.mute, fontWeight: 500, opacity: foot }}>
          No card needed · Live on your WhatsApp in minutes
        </div>
      </AbsoluteFill>
      <Cursor
        f={f}
        keys={[
          { f: w[2], x: 1500, y: 1060 },
          { f: click - 6, x: 1170, y: 760 },
          { f: click + 20, x: 1180, y: 768 },
          { f: 190, x: 1300, y: 900 },
        ]}
        clicks={[click]}
        show={[w[2], 150]}
      />
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};
