import { Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { T } from "./timeline";

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 0.9, 0.3);

export const tween = (
  f: number,
  a: number,
  b: number,
  from = 0,
  to = 1,
  easing: (t: number) => number = EASE_OUT,
) => interpolate(f, [a, b], [from, to], { ...CLAMP, easing });

export const pop = (
  f: number,
  at: number,
  cfg: { damping?: number; stiffness?: number; mass?: number } = {},
) =>
  spring({
    frame: f - at,
    fps: 30,
    config: { damping: 14, stiffness: 160, mass: 0.8, ...cfg },
  });

// Scenes are mounted T frames early so they can overlap the previous cut.
export const useSceneFrame = () => useCurrentFrame() - T;

// Standard "blur-rise" entrance used throughout, matching the reference reels.
export const rise = (
  f: number,
  at: number,
  dur = 18,
  dist = 40,
  blur = 14,
) => {
  const p = tween(f, at, at + dur);
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * dist}px)`,
    filter: blur ? `blur(${(1 - p) * blur}px)` : undefined,
  } as const;
};

export const typed = (text: string, f: number, at: number, cps = 1.6) => {
  const n = Math.max(0, Math.floor((f - at) * cps));
  return Array.from(text).slice(0, n).join("");
};

export const caretOn = (f: number) => Math.floor(f / 8) % 2 === 0;

export const fmt = (n: number) =>
  Math.round(n).toLocaleString("en-US");
