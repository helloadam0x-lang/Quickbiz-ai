import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, tween, useSceneFrame, EASE_IN } from "../anim";
import { DarkAurora } from "../components/Backgrounds";
import { FONT } from "../theme";

const NOTES = [
  { who: "Amani K.", msg: "Hi! Is the Vitamin C serum still available?" },
  { who: "Brian O.", msg: "How much for two? 🙏" },
  { who: "Grace N.", msg: "Do you deliver to Ntinda today?" },
  { who: "+256 701 ••• 552", msg: "Hello?? 👀" },
  { who: "Aisha M.", msg: "Are you open tomorrow morning?" },
  { who: "Daniel K.", msg: "Sent the payment, please confirm" },
];
// One notification per beat, so every ping lands on the music.
const AT = [14, 29, 44, 59, 74, 89];

const AppIcon: React.FC = () => (
  <div
    style={{
      width: 54,
      height: 54,
      borderRadius: 14,
      background: "linear-gradient(160deg,#35D98A 0%,#0E9C5E 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width="30" height="30" viewBox="0 0 24 24">
      <path
        d="M12 3C7 3 3 6.6 3 11c0 2.3 1.1 4.4 2.9 5.9L5 21l4.3-2.2c.9.2 1.8.3 2.7.3 5 0 9-3.6 9-8S17 3 12 3z"
        fill="#fff"
      />
    </svg>
  </div>
);

export const Hook: React.FC = () => {
  const f = useSceneFrame();
  const timeIn = tween(f, -4, 16);
  const push = tween(f, 0, 120, 1, 1.06);
  const outro = tween(f, 100, 118, 0, 1, EASE_IN);
  const visibleCount = AT.filter((a) => f >= a).length;

  return (
    <AbsoluteFill>
      <DarkAurora intensity={0.55 + 0.45 * tween(f, 0, 60)} />
      <AbsoluteFill
        style={{
          transform: `scale(${push + outro * 0.12})`,
          filter: `blur(${outro * 24}px)`,
          opacity: 1 - outro,
          fontFamily: FONT,
          color: "#fff",
          alignItems: "center",
        }}
      >
        <div
          style={{
            marginTop: 70,
            textAlign: "center",
            opacity: timeIn,
            filter: `blur(${(1 - timeIn) * 20}px)`,
            transform: `translateY(${(1 - timeIn) * 30}px)`,
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 500, opacity: 0.75, letterSpacing: "-0.01em" }}>
            Tuesday, 11:47 PM
          </div>
          <div
            style={{
              fontSize: 190,
              fontWeight: 300,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              marginTop: 6,
              backgroundImage: "linear-gradient(180deg,#FFFFFF 30%,rgba(255,255,255,0.55) 100%)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            11:47
          </div>
        </div>
        <div style={{ position: "relative", width: 900, marginTop: 34, height: 560 }}>
          {NOTES.map((n, i) => {
            if (f < AT[i] - 1) return null;
            const s = pop(f, AT[i], { damping: 15, stiffness: 190 });
            // Newest sits on top; older ones slide down and recede.
            const depth = visibleCount - 1 - i;
            const y = depth * 118 + (1 - s) * -60;
            const scale = (1 - depth * 0.035) * (0.88 + 0.12 * s);
            const fade = Math.max(0, 1 - Math.max(0, depth - 2) * 0.45);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: y,
                  transform: `scale(${scale})`,
                  opacity: Math.min(1, s * 1.4) * fade,
                  filter: `blur(${Math.max(0, depth - 1) * 1.6 + (1 - s) * 10}px)`,
                  zIndex: 100 - depth,
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  padding: "22px 28px",
                  borderRadius: 30,
                  background: "rgba(38,46,43,0.78)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
                }}
              >
                <AppIcon />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 25, fontWeight: 700 }}>
                    <span>{n.who}</span>
                    <span style={{ fontSize: 21, fontWeight: 500, opacity: 0.55 }}>now</span>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 400, opacity: 0.88, marginTop: 4, whiteSpace: "nowrap" }}>
                    {n.msg}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 80,
          fontFamily: FONT,
          padding: "12px 22px",
          borderRadius: 999,
          background: "rgba(255,70,70,0.92)",
          color: "#fff",
          fontSize: 26,
          fontWeight: 700,
          opacity: tween(f, 16, 24) * (1 - outro),
          transform: `scale(${1 + 0.15 * Math.max(0, 1 - (f - (AT[visibleCount - 1] ?? 0)) / 6)})`,
        }}
      >
        {[1, 3, 6, 11, 19, 27][Math.max(0, visibleCount - 1)]} unread
      </div>
    </AbsoluteFill>
  );
};
