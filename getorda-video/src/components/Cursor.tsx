import React from "react";
import { interpolate } from "remotion";
import { CLAMP, EASE_IN_OUT, tween } from "../anim";

export type Key = { f: number; x: number; y: number };

const pos = (keys: Key[], f: number) => {
  if (f <= keys[0].f) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f <= b.f) {
      const t = interpolate(f, [a.f, b.f], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
      // Slight arc so motion reads as a hand, not a robot.
      const arc = Math.sin(t * Math.PI) * Math.min(60, Math.hypot(b.x - a.x, b.y - a.y) * 0.12);
      return { f, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - arc };
    }
  }
  return keys[keys.length - 1];
};

export const Cursor: React.FC<{
  f: number;
  keys: Key[];
  clicks?: number[];
  show?: [number, number];
  variant?: "arrow" | "touch";
  scale?: number;
}> = ({ f, keys, clicks = [], show, variant = "arrow", scale = 1.6 }) => {
  const p = pos(keys, f);
  let press = 1;
  let ripple: { r: number; o: number } | null = null;
  for (const c of clicks) {
    const d = f - c;
    if (d >= -3 && d < 9) press = Math.min(press, 1 - 0.2 * Math.sin((Math.PI * (d + 3)) / 12));
    if (d >= 0 && d < 18) ripple = { r: tween(f, c, c + 18, 6, 46), o: tween(f, c, c + 18, 0.55, 0) };
  }
  const vis = show
    ? tween(f, show[0], show[0] + 8) * (1 - tween(f, show[1] - 8, show[1]))
    : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: p.x,
        top: p.y,
        opacity: vis,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      {ripple && (
        <div
          style={{
            position: "absolute",
            left: -ripple.r,
            top: -ripple.r,
            width: ripple.r * 2,
            height: ripple.r * 2,
            borderRadius: "50%",
            border: `3px solid rgba(20,178,107,${ripple.o})`,
            background: `rgba(20,178,107,${ripple.o * 0.25})`,
          }}
        />
      )}
      {variant === "arrow" ? (
        <svg
          width={22 * scale}
          height={32 * scale}
          viewBox="0 0 22 32"
          style={{
            transform: `scale(${press})`,
            transformOrigin: "2px 2px",
            filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.28))",
            marginLeft: -2 * scale,
            marginTop: -2 * scale,
          }}
        >
          <path
            d="M2 2 L2 26 L8.2 20.4 L12.4 29.6 L16.4 27.9 L12.3 18.9 L20.2 18.9 Z"
            fill="#0B110F"
            stroke="white"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <div
          style={{
            width: 64,
            height: 64,
            marginLeft: -32,
            marginTop: -32,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.55)",
            border: "2px solid rgba(255,255,255,0.95)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            transform: `scale(${press})`,
          }}
        />
      )}
    </div>
  );
};
