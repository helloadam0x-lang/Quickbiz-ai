import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { TOTAL } from "./timeline";

// Authored at 1920x1080 and rendered with --scale=2 for a native 3840x2160 master.
export const RemotionRoot: React.FC = () => (
  <Composition id="GetOrda" component={Main} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
);
