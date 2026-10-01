import React from "react";
import { AbsoluteFill } from "remotion";
import { CamState } from "../motion";

export const W = 1920;
export const H = 1080;
const PERSP = 1600;

// A 3D world viewed by a moving camera. Children are <Layer>s placed in world space.
export const World: React.FC<{ c: CamState; children: React.ReactNode; persp?: number }> = ({ c, children, persp = PERSP }) => (
  <AbsoluteFill style={{ perspective: persp, perspectiveOrigin: "50% 50%", overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: W,
        height: H,
        transformStyle: "preserve-3d",
        transformOrigin: `${W / 2}px ${H / 2}px`,
        transform: `translateZ(${c.z}px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) rotateZ(${c.rz}deg) translate3d(${-c.x}px, ${-c.y}px, 0px)`,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

// A flat element at a world position. Depth-of-field blur grows with distance from the focus plane.
export const Layer: React.FC<{
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  s?: number;
  o?: number;
  focus?: number;
  dof?: number;
  blur?: number;
  center?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1, o = 1, focus, dof = 0.012, blur = 0, center = true, style, children }) => {
  const d = focus === undefined ? 0 : Math.abs(z - focus) * dof;
  const b = d + blur;
  if (o <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transformStyle: "preserve-3d",
        transform: `translate3d(${center ? "-50%, -50%" : "0, 0"}, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`,
        opacity: o,
        filter: b > 0.15 ? `blur(${b}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Directional (motion) blur via an inline SVG filter, so fast moves smear along their path.
export const MotionBlur: React.FC<{ vx: number; vy: number; amount?: number; children: React.ReactNode }> = ({ vx, vy, amount = 0.35, children }) => {
  const id = "mb" + React.useId().replace(/:/g, "");
  const sx = Math.min(60, Math.abs(vx) * amount);
  const sy = Math.min(60, Math.abs(vy) * amount);
  if (sx < 0.6 && sy < 0.6) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={`${sx} ${sy}`} />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: `url(#${id})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// Soft anamorphic flare / light leak in brand cyan with a warm edge, drawn with gradients.
export const Flare: React.FC<{ p: number; x?: number; y?: number; hue?: "cyan" | "warm" }> = ({ p, x = 50, y = 50, hue = "cyan" }) => {
  if (p <= 0.001) return null;
  const c = hue === "cyan" ? "109,212,241" : "255,214,170";
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: p }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 40% at ${x}% ${y}%, rgba(${c},0.85) 0%, rgba(${c},0.25) 35%, rgba(${c},0) 70%)` }} />
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(${c},0.0) 20%, rgba(${c},0.55) 50%, rgba(${c},0) 80%, rgba(255,255,255,0) 100%)`,
          transform: `translateY(${(y - 50) * 10.8}px) scaleY(0.06)`,
        }}
      />
    </AbsoluteFill>
  );
};

// White-out used for cuts that land on a hit.
export const Flash: React.FC<{ p: number; color?: string }> = ({ p, color = "#FFFFFF" }) =>
  p > 0.001 ? <AbsoluteFill style={{ background: color, opacity: p, pointerEvents: "none" }} /> : null;
