import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";

type Blob = {
  x: number;
  y: number;
  r: number;
  color: string;
  sx: number;
  sy: number;
  speed: number;
  phase: number;
};

const blobLayer = (blobs: Blob[], t: number) =>
  blobs
    .map((b) => {
      const x = b.x + Math.sin(t * b.speed + b.phase) * b.sx;
      const y = b.y + Math.cos(t * b.speed * 0.8 + b.phase) * b.sy;
      return `radial-gradient(circle ${b.r}px at ${x}% ${y}%, ${b.color} 0%, transparent 100%)`;
    })
    .join(", ");

const LIGHT: Blob[] = [
  { x: 12, y: 18, r: 900, color: "rgba(126,221,168,0.55)", sx: 8, sy: 6, speed: 0.35, phase: 0 },
  { x: 88, y: 12, r: 800, color: "rgba(186,228,247,0.60)", sx: 6, sy: 8, speed: 0.28, phase: 1.3 },
  { x: 80, y: 90, r: 950, color: "rgba(214,245,170,0.55)", sx: 9, sy: 5, speed: 0.31, phase: 2.2 },
  { x: 18, y: 95, r: 800, color: "rgba(160,232,210,0.50)", sx: 7, sy: 7, speed: 0.26, phase: 3.1 },
  { x: 50, y: 50, r: 700, color: "rgba(255,255,255,0.85)", sx: 5, sy: 4, speed: 0.22, phase: 0.6 },
];

export const LightMesh: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <AbsoluteFill style={{ backgroundImage: blobLayer(LIGHT, t), opacity: intensity }} />
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

const DARK: Blob[] = [
  { x: -5, y: 110, r: 1100, color: "rgba(20,178,107,0.55)", sx: 8, sy: 6, speed: 0.3, phase: 0 },
  { x: 105, y: -10, r: 1000, color: "rgba(40,90,220,0.50)", sx: 7, sy: 8, speed: 0.25, phase: 1.1 },
  { x: 110, y: 105, r: 800, color: "rgba(12,140,140,0.40)", sx: 6, sy: 6, speed: 0.28, phase: 2.4 },
  { x: 30, y: -20, r: 700, color: "rgba(124,240,168,0.18)", sx: 10, sy: 5, speed: 0.2, phase: 3.3 },
];

export const DarkAurora: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  return (
    <AbsoluteFill style={{ backgroundColor: "#030605" }}>
      <AbsoluteFill style={{ backgroundImage: blobLayer(DARK, t), opacity: intensity }} />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(3,6,5,0.85) 0%, rgba(3,6,5,0) 100%)",
        }}
      />
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};

// Film grain keeps big gradients from banding once the 4K file is compressed.
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const f = useCurrentFrame();
  const seed = f % 6;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
