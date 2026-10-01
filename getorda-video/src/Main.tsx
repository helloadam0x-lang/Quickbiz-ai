import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { tween } from "./anim";
import { SCENES, SceneKey, T } from "./timeline";
import { S01Hook } from "./scenes/S01Hook";
import { S02Buzz } from "./scenes/S02Buzz";
import { S03Lost } from "./scenes/S03Lost";
import { S04Meet } from "./scenes/S04Meet";
import { S05Chat } from "./scenes/S05Chat";
import { S06Needs } from "./scenes/S06Needs";
import { S07Store } from "./scenes/S07Store";
import { S08Broadcast } from "./scenes/S08Broadcast";
import { S09Tagline } from "./scenes/S09Tagline";
import { S10Outro } from "./scenes/S10Outro";

type Enter = "blur" | "fade" | "none";

// Scenes animate their own exits; the incoming one settles in from slightly small and soft.
const Enter: React.FC<{ kind: Enter; children: React.ReactNode }> = ({ kind, children }) => {
  const f = useCurrentFrame();
  if (kind === "none") return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = tween(f, 0, 2 * T);
  return (
    <AbsoluteFill
      style={{
        opacity: p,
        transform: kind === "blur" ? `scale(${0.94 + 0.06 * p})` : undefined,
        filter: kind === "blur" && p < 1 ? `blur(${(1 - p) * 20}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const LIST: { key: SceneKey; C: React.FC; enter: Enter }[] = [
  { key: "hook", C: S01Hook, enter: "none" },
  { key: "buzz", C: S02Buzz, enter: "fade" },
  { key: "lost", C: S03Lost, enter: "blur" },
  { key: "meet", C: S04Meet, enter: "fade" },
  { key: "chat", C: S05Chat, enter: "blur" },
  { key: "needs", C: S06Needs, enter: "blur" },
  { key: "store", C: S07Store, enter: "blur" },
  { key: "broadcast", C: S08Broadcast, enter: "blur" },
  { key: "tagline", C: S09Tagline, enter: "blur" },
  { key: "outro", C: S10Outro, enter: "fade" },
];

export const Main: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#FBFDFE" }}>
    {LIST.map(({ key, C, enter }) => {
      const { start, len } = SCENES[key];
      return (
        <Sequence key={key} from={start - T} durationInFrames={len + 2 * T} name={key}>
          <Enter kind={start === 0 ? "none" : enter}>
            <C />
          </Enter>
        </Sequence>
      );
    })}
    <Audio src={staticFile("audio/getorda-v2-mix.wav")} />
  </AbsoluteFill>
);
