import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

type Blob = { x: number; y: number; r: number; c: string; sx: number; sy: number; v: number; p: number };

const BLOBS: Blob[] = [
  { x: 8, y: 12, r: 760, c: "rgba(109,212,241,0.38)", sx: 6, sy: 5, v: 0.25, p: 0 },
  { x: 92, y: 8, r: 680, c: "rgba(150,222,246,0.34)", sx: 5, sy: 6, v: 0.21, p: 1.4 },
  { x: 88, y: 96, r: 820, c: "rgba(109,212,241,0.30)", sx: 7, sy: 4, v: 0.23, p: 2.3 },
  { x: 6, y: 92, r: 700, c: "rgba(185,233,248,0.40)", sx: 6, sy: 6, v: 0.19, p: 3.2 },
  { x: 50, y: 48, r: 900, c: "rgba(255,255,255,0.92)", sx: 4, sy: 3, v: 0.17, p: 0.7 },
];

// The airy white-and-cyan field from the Dropbox/Prospection references, in GetOrda's cyan.
export const Haze: React.FC<{ intensity?: number; tint?: string }> = ({ intensity = 1, tint }) => {
  const t = useCurrentFrame() / 30;
  const bg = BLOBS.map((b) => {
    const x = b.x + Math.sin(t * b.v + b.p) * b.sx;
    const y = b.y + Math.cos(t * b.v * 0.8 + b.p) * b.sy;
    return `radial-gradient(circle ${b.r}px at ${x}% ${y}%, ${b.c} 0%, transparent 100%)`;
  }).join(", ");
  return (
    <AbsoluteFill style={{ backgroundColor: tint ?? "#FBFDFE" }}>
      <AbsoluteFill style={{ backgroundImage: bg, opacity: intensity }} />
      <Grain />
    </AbsoluteFill>
  );
};

// A real photo, heavily blurred and washed out, so low-res stock reads as depth.
export const PhotoBg: React.FC<{ src: string; blur?: number; wash?: number; scale?: number; y?: number }> = ({
  src,
  blur = 28,
  wash = 0.35,
  scale = 1.15,
  y = 0,
}) => (
  <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#EEF4F6" }}>
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        inset: -80,
        width: "calc(100% + 160px)",
        height: "calc(100% + 160px)",
        objectFit: "cover",
        filter: `blur(${blur}px) saturate(1.05)`,
        transform: `scale(${scale}) translateY(${y}px)`,
      }}
    />
    <AbsoluteFill style={{ background: `rgba(251,253,254,${wash})` }} />
    <AbsoluteFill
      style={{ background: "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(255,255,255,0) 0%, rgba(235,246,250,0.55) 100%)" }}
    />
    <Grain />
  </AbsoluteFill>
);

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.035 }) => {
  const seed = useCurrentFrame() % 5;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "multiply", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
