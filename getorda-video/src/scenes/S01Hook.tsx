import React from "react";
import { AbsoluteFill } from "remotion";
import { tween, useSceneFrame, EASE_IN } from "../anim";
import { Haze } from "../components/Haze";
import { Kinetic } from "../components/Kinetic";
import { voWords } from "../timeline";

export const S01Hook: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l01", "hook").map((x) => x.f);
  const out = tween(f, 50, 70, 0, 1, EASE_IN);
  return (
    <AbsoluteFill>
      <Haze />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${1 + tween(f, 0, 70, 0, 0.06) + out * 0.25}) translateY(${-out * 60}px)`,
          filter: `blur(${out * 18}px)`,
          opacity: 1 - out,
        }}
      >
        <Kinetic text="Let me *guess…*" f={f} times={w} size={150} weight={600} align="center" dur={16} lead={4} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
