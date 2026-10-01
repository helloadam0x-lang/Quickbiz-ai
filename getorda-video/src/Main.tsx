import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { tween } from "./anim";
import { E, kf } from "./motion";
import { SCENES, SceneKey, T } from "./timeline";
import { useVertical } from "./format";
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

type Enter = { kind: "none" } | { kind: "fade" } | { kind: "blur" } | { kind: "cut"; at: number } | { kind: "iris"; x: number; y: number };

// Scenes choreograph their own exits; this only shapes how the incoming one appears.
const In: React.FC<{ e: Enter; children: React.ReactNode }> = ({ e, children }) => {
  const f = useCurrentFrame();
  if (e.kind === "none") return <AbsoluteFill>{children}</AbsoluteFill>;
  if (e.kind === "cut") return f < e.at ? null : <AbsoluteFill>{children}</AbsoluteFill>;
  if (e.kind === "iris") {
    const r = kf(f, [[0, 0], [2 * T + 4, 2300, E.inOut]]);
    return <AbsoluteFill style={{ clipPath: `circle(${r}px at ${e.x}px ${e.y}px)` }}>{children}</AbsoluteFill>;
  }
  const p = tween(f, 0, 2 * T);
  return (
    <AbsoluteFill
      style={{
        opacity: p,
        transform: e.kind === "blur" ? `scale(${0.94 + 0.06 * p})` : undefined,
        filter: e.kind === "blur" && p < 1 ? `blur(${(1 - p) * 20}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const LIST: { key: SceneKey; C: React.FC; e: Enter }[] = [
  { key: "hook", C: S01Hook, e: { kind: "none" } },
  { key: "buzz", C: S02Buzz, e: { kind: "fade" } },
  { key: "lost", C: S03Lost, e: { kind: "fade" } },
  { key: "meet", C: S04Meet, e: { kind: "none" } },
  { key: "chat", C: S05Chat, e: { kind: "iris", x: 960, y: 770 } },
  { key: "needs", C: S06Needs, e: { kind: "cut", at: 6 } },
  { key: "store", C: S07Store, e: { kind: "blur" } },
  { key: "broadcast", C: S08Broadcast, e: { kind: "blur" } },
  { key: "tagline", C: S09Tagline, e: { kind: "blur" } },
  { key: "outro", C: S10Outro, e: { kind: "none" } },
];

export const Main: React.FC = () => {
  const v = useVertical();
  return (
  <AbsoluteFill style={{ backgroundColor: "#FBFDFE" }}>
    {LIST.map(({ key, C, e: e0 }) => {
      // The chat irises open from the WhatsApp Live pill, which sits lower in the vertical cut.
      const e: Enter = v && e0.kind === "iris" ? { kind: "iris", x: 540, y: 1250 } : e0;
      const { start, len } = SCENES[key];
      return (
        <Sequence key={key} from={start - T} durationInFrames={len + 2 * T} name={key}>
          <In e={start === 0 ? { kind: "none" } : e}>
            <C />
          </In>
        </Sequence>
      );
    })}
    <Audio src={staticFile("audio/getorda-v2-mix.wav")} />
  </AbsoluteFill>
  );
};
