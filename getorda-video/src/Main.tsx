import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { tween, EASE_IN } from "./anim";
import { SCENES, T } from "./timeline";
import { Hook } from "./scenes/Hook";
import { Never } from "./scenes/Never";
import { Meet } from "./scenes/Meet";
import { Chat } from "./scenes/Chat";
import { Approve } from "./scenes/Approve";
import { Store } from "./scenes/Store";
import { Broadcast } from "./scenes/Broadcast";
import { Analytics } from "./scenes/Analytics";
import { Outro } from "./scenes/Outro";

type Cut = "blur" | "none";

// Cross-cut: outgoing scene zooms up and blurs away while the next one
// settles in from slightly smaller, the move the reference reels use.
const Wrap: React.FC<{ len: number; enter: Cut; exit: Cut; children: React.ReactNode }> = ({
  len,
  enter,
  exit,
  children,
}) => {
  const f = useCurrentFrame();
  const inP = enter === "blur" ? tween(f, 0, 2 * T) : 1;
  const outP = exit === "blur" ? tween(f, len, len + 2 * T, 0, 1, EASE_IN) : 0;
  const scale = (0.9 + 0.1 * inP) * (1 + 0.1 * outP);
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(inP, 1 - outP),
        transform: `scale(${scale})`,
        filter: inP < 1 || outP > 0 ? `blur(${(1 - inP) * 22 + outP * 26}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const SCENE_LIST: { key: keyof typeof SCENES; C: React.FC; enter: Cut; exit: Cut }[] = [
  { key: "hook", C: Hook, enter: "none", exit: "none" },
  { key: "never", C: Never, enter: "blur", exit: "none" },
  { key: "meet", C: Meet, enter: "none", exit: "none" },
  { key: "chat", C: Chat, enter: "blur", exit: "blur" },
  { key: "approve", C: Approve, enter: "blur", exit: "blur" },
  { key: "store", C: Store, enter: "blur", exit: "blur" },
  { key: "broadcast", C: Broadcast, enter: "blur", exit: "blur" },
  { key: "analytics", C: Analytics, enter: "blur", exit: "blur" },
  { key: "outro", C: Outro, enter: "blur", exit: "none" },
];

export const Main: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#030605" }}>
      {SCENE_LIST.map(({ key, C, enter, exit }) => {
        const { start, len } = SCENES[key];
        return (
          <Sequence key={key} from={start - T} durationInFrames={len + 2 * T} name={key}>
            <Wrap len={len} enter={enter} exit={exit}>
              <C />
            </Wrap>
          </Sequence>
        );
      })}
      <Audio src={staticFile("audio/getorda-mix.wav")} />
    </AbsoluteFill>
  );
};
