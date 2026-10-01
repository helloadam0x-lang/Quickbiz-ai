import React from "react";
import { AbsoluteFill } from "remotion";
import { useSceneFrame } from "../anim";
import { Flash, Layer, World } from "../components/Cam";
import { Haze } from "../components/Haze";
import { Kinetic } from "../components/Kinetic";
import { Ticks } from "../components/WA";
import { cam, CamKeys, E, kf, rand } from "../motion";
import { FONT } from "../theme";
import { voWords } from "../timeline";

const BUBBLES = [
  "How much?", "Is it available?", "Bei gani?", "Do you deliver?", "كم السعر؟", "Size L please", "Hola! 👋", "Paid ✅",
  "Thank you 🙏", "2 pieces", "Still open?", "Bonjour!", "Habari", "Delivered 🎉", "Can I pay MoMo?", "Perfect 😍",
  "Order confirmed", "On its way 📦", "Love it!", "Gracias!", "Merci!", "Coming today?", "XL please", "Sent ✅",
  "Shukran 🙏", "Is it original?", "Tomorrow?", "Reserved for you", "Got it!", "Asante!",
];

// The camera flies forward through a tunnel of answered messages.
export const S09Tagline: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l11", "tagline").map((x) => x.f);
  const K: CamKeys = { z: [[-10, -200], [82, 1150, E.lin]], rz: [[-10, -2], [82, 2, E.lin]] };
  const c = cam(f, K);
  const white = kf(f, [[64, 0], [74, 1, E.in]]);
  const textIn = kf(f, [[-10, 0.94], [82, 1.06, E.lin]]);

  return (
    <AbsoluteFill>
      <Haze />
      <World c={c}>
        {BUBBLES.map((b, i) => {
          const z = -2600 + rand(i) * 2800;
          const ang = rand(i + 40) * Math.PI * 2;
          const r = 420 + rand(i + 80) * 520;
          const dist = 1600 - (z + c.z);
          const o = Math.min(1, Math.max(0, (dist - 120) / 400)) * Math.min(1, Math.max(0, (3400 - dist) / 800));
          return (
            <Layer key={i} x={960 + Math.cos(ang) * r * 1.5} y={540 + Math.sin(ang) * r} z={z} o={o} focus={-c.z + 200} dof={0.006}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "14px 20px",
                  borderRadius: 20,
                  borderBottomLeftRadius: i % 2 ? 20 : 6,
                  borderBottomRightRadius: i % 2 ? 6 : 20,
                  background: i % 2 ? "#D9FDD3" : "#fff",
                  boxShadow: "0 10px 30px rgba(17,17,16,0.08)",
                  fontFamily: FONT,
                  fontSize: 30,
                  color: "#2A2D2F",
                  whiteSpace: "nowrap",
                }}
              >
                {b} <Ticks size={18} />
              </div>
            </Layer>
          );
        })}
      </World>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 46% 34% at 50% 50%, rgba(251,253,254,0.97) 0%, rgba(251,253,254,0) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${textIn})` }}>
        <Kinetic text="Every customer." f={f} times={w.slice(0, 2)} size={156} align="center" dur={16} />
        <Kinetic text="Always *answered.*" f={f} times={w.slice(2, 4)} size={156} align="center" dur={16} />
      </AbsoluteFill>
      <Flash p={white} />
    </AbsoluteFill>
  );
};
