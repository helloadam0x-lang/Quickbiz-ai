import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { TOTAL } from "./timeline";

// Authored at 1920x1080 (and 1080x1920 for the vertical cut) and rendered with --scale=2 for native 4K.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="GetOrda" component={Main} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
    <Composition id="GetOrdaVertical" component={Main} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
  </>
);
