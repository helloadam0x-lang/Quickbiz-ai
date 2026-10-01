import React from "react";
import { AbsoluteFill } from "remotion";
import { tween, useSceneFrame, EASE_IN } from "../anim";
import { Haze } from "../components/Haze";
import { Kinetic } from "../components/Kinetic";
import { Ticks } from "../components/WA";
import { FONT } from "../theme";
import { voWords } from "../timeline";

const BUBBLES = [
  "How much?", "Is it available?", "Bei gani?", "Do you deliver?", "كم السعر؟", "Size L please", "Oli otya!", "Paid ✅",
  "Thank you 🙏", "2 pieces", "Still open?", "Bonjour!", "Habari", "Delivered 🎉", "Can I pay MoMo?", "Perfect 😍",
];

export const S09Tagline: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l11", "tagline").map((x) => x.f);
  const exit = tween(f, 62, 76, 0, 1, EASE_IN);
  return (
    <AbsoluteFill>
      <Haze />
      <AbsoluteFill style={{ opacity: 0.55 }}>
        {BUBBLES.map((b, i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          const x = 60 + col * 235 + (row % 2) * 110;
          const y0 = 140 + row * 640 + ((i * 97) % 180);
          const y = y0 - f * (0.6 + (i % 3) * 0.25);
          const depth = (i % 3) / 2;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 14px",
                borderRadius: 16,
                background: i % 2 ? "#D9FDD3" : "#fff",
                boxShadow: "0 6px 18px rgba(17,17,16,0.06)",
                fontFamily: FONT,
                fontSize: 20,
                color: "#2A2D2F",
                filter: `blur(${3 + depth * 5}px)`,
                transform: `scale(${0.85 + depth * 0.3})`,
              }}
            >
              {b} <Ticks size={13} />
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 48% 36% at 50% 50%, rgba(251,253,254,0.96) 0%, rgba(251,253,254,0) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${1 + tween(f, 0, 80, 0, 0.05) + exit * 0.4})`,
          filter: exit > 0 ? `blur(${exit * 20}px)` : undefined,
          opacity: 1 - exit,
        }}
      >
        <Kinetic text="Every customer." f={f} times={w.slice(0, 2)} size={150} align="center" dur={16} />
        <Kinetic text="Always *answered.*" f={f} times={w.slice(2, 4)} size={150} align="center" dur={16} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
