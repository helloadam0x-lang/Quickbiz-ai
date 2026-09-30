import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, tween, useSceneFrame, EASE_IN_OUT } from "../anim";
import { DarkAurora } from "../components/Backgrounds";
import { OrdaMark } from "../components/OrdaMark";
import { Words } from "../components/Words";
import { FONT, GREEN_GRAD_DARK } from "../theme";

export const LOGO_HIT = 60;

export const Outro: React.FC = () => {
  const f = useSceneFrame();
  const m = pop(f, LOGO_HIT, { damping: 12, stiffness: 150 });
  const open = tween(f, LOGO_HIT + 8, LOGO_HIT + 28, 0, 1, EASE_IN_OUT);
  const tag = tween(f, LOGO_HIT + 26, LOGO_HIT + 44);
  const cta = pop(f, LOGO_HIT + 38, { damping: 14, stiffness: 160 });
  const shine = tween(f, LOGO_HIT + 58, LOGO_HIT + 84, -30, 130, (t) => t);
  const ring = tween(f, LOGO_HIT, LOGO_HIT + 36);
  const push = tween(f, 0, 180, 1, 1.05);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <DarkAurora intensity={0.8 + 0.2 * tween(f, LOGO_HIT, LOGO_HIT + 20)} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Words text="Every customer." f={f} at={0} size={140} color="#fff" align="center" out={50} />
          <Words text="Always answered." f={f} at={14} size={140} gradient={GREEN_GRAD_DARK} align="center" out={52} />
        </AbsoluteFill>

        {f >= LOGO_HIT - 1 && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                position: "absolute",
                width: 220 + ring * 900,
                height: 220 + ring * 900,
                borderRadius: "50%",
                border: `2px solid rgba(124,240,168,${0.5 * (1 - ring)})`,
                boxShadow: `0 0 80px rgba(43,212,131,${0.35 * (1 - ring)})`,
                marginTop: -110,
              }}
            />
            <div style={{ display: "flex", alignItems: "center", marginTop: -110 }}>
              <div style={{ transform: `scale(${m})`, filter: `drop-shadow(0 0 60px rgba(43,212,131,${0.45 * Math.min(1, m)}))` }}>
                <OrdaMark size={170} color="#FFFFFF" id="outro" />
              </div>
              <div style={{ width: 680 * open, overflow: "hidden" }}>
                <span
                  style={{
                    display: "inline-block",
                    paddingLeft: 40,
                    fontSize: 150,
                    fontWeight: 700,
                    letterSpacing: "-0.05em",
                    color: "#fff",
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
                position: "absolute",
                top: 640,
                fontSize: 42,
                fontWeight: 500,
                color: "rgba(255,255,255,0.78)",
                letterSpacing: "-0.02em",
                opacity: tag,
                filter: `blur(${(1 - tag) * 10}px)`,
                transform: `translateY(${(1 - tag) * 20}px)`,
              }}
            >
              The AI employee for your WhatsApp business.
            </div>
            <div
              style={{
                position: "absolute",
                top: 740,
                padding: "26px 48px",
                borderRadius: 999,
                background: "#fff",
                color: "#0B110F",
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                display: "flex",
                alignItems: "center",
                gap: 16,
                overflow: "hidden",
                transform: `scale(${cta})`,
                opacity: Math.min(1, cta),
                boxShadow: "0 20px 60px rgba(43,212,131,0.35)",
              }}
            >
              Start free at getorda.app
              <svg width="30" height="30" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" stroke="#0B110F" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${shine}%`,
                  width: 120,
                  background: "linear-gradient(100deg, transparent, rgba(124,240,168,0.55), transparent)",
                  transform: "skewX(-20deg)",
                }}
              />
            </div>
            <div style={{ position: "absolute", top: 860, fontSize: 26, color: "rgba(255,255,255,0.5)", fontWeight: 500, opacity: tween(f, LOGO_HIT + 50, LOGO_HIT + 66) }}>
              No card needed · Set up in minutes
            </div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
