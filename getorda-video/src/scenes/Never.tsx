import React from "react";
import { AbsoluteFill } from "remotion";
import { tween, useSceneFrame, EASE_IN } from "../anim";
import { DarkAurora } from "../components/Backgrounds";
import { Words } from "../components/Words";
import { GREEN_GRAD_DARK } from "../theme";

export const Never: React.FC = () => {
  const f = useSceneFrame();
  // Slow zoom into the words while the riser builds toward the drop.
  const zoom = tween(f, 0, 60, 1, 1.08) + tween(f, 48, 62, 0, 0.5, EASE_IN);
  const out = tween(f, 50, 62, 0, 1, EASE_IN);
  return (
    <AbsoluteFill>
      <DarkAurora intensity={0.9} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${zoom})`,
          filter: `blur(${out * 30}px)`,
          opacity: 1 - out * 0.9,
        }}
      >
        <Words text="Your customers" f={f} at={-2} size={150} color="#fff" align="center" stagger={5} />
        <div style={{ display: "flex", gap: "0.24em", fontSize: 150 }}>
          <Words text="never" f={f} at={12} size={150} color="#fff" />
          <Words text="sleep." f={f} at={18} size={150} gradient={GREEN_GRAD_DARK} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
