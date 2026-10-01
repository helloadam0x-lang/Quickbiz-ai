import { Easing } from "remotion";

export type Ease = (t: number) => number;

export const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  // Long, silky camera moves: fast-ish start, very soft landing.
  cam: Easing.bezier(0.45, 0, 0.15, 1),
  in: Easing.bezier(0.55, 0, 0.9, 0.3),
  snap: Easing.bezier(0.85, 0, 0.15, 1),
  lin: (t: number) => t,
};

// Keyframes: [frame, value, easing-into-this-key?]. Holds the ends.
export type Key = [number, number, Ease?];

export const kf = (f: number, keys: Key[]): number => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1, e] = keys[i];
    const [f0, v0] = keys[i - 1];
    if (f <= f1) {
      const t = f1 === f0 ? 1 : (f - f0) / (f1 - f0);
      return v0 + (v1 - v0) * (e ?? E.cam)(Math.min(1, Math.max(0, t)));
    }
  }
  return keys[keys.length - 1][1];
};

export type CamState = { x: number; y: number; z: number; rx: number; ry: number; rz: number };
export type CamKeys = Partial<Record<keyof CamState, Key[]>>;

export const cam = (f: number, k: CamKeys): CamState => ({
  x: k.x ? kf(f, k.x) : 0,
  y: k.y ? kf(f, k.y) : 0,
  z: k.z ? kf(f, k.z) : 0,
  rx: k.rx ? kf(f, k.rx) : 0,
  ry: k.ry ? kf(f, k.ry) : 0,
  rz: k.rz ? kf(f, k.rz) : 0,
});

// Screen-space speed of the camera, used to drive motion blur.
export const camVel = (f: number, k: CamKeys) => {
  const a = cam(f - 0.5, k);
  const b = cam(f + 0.5, k);
  return {
    vx: b.x - a.x + (b.ry - a.ry) * 14,
    vy: b.y - a.y - (b.rx - a.rx) * 14,
    vz: b.z - a.z,
  };
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Deterministic pseudo-random in [0,1).
export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
