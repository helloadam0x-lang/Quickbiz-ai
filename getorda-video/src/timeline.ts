import vo from "./vo.json";

export const FPS = 30;
// 100 BPM: 18 frames per beat, 72 per bar. The drop (12s) and final hit (38.4s) land on bars.
export const BEAT = 18;
export const BAR = 72;
export const T = 10; // overlap on each side of a cut

export const SCENES = {
  hook: { start: 0, len: 50 },
  buzz: { start: 50, len: 202 },
  lost: { start: 252, len: 108 },
  meet: { start: 360, len: 138 },
  chat: { start: 498, len: 336 },
  needs: { start: 834, len: 84 },
  store: { start: 918, len: 72 },
  broadcast: { start: 990, len: 90 },
  tagline: { start: 1080, len: 72 },
  outro: { start: 1152, len: 198 },
} as const;

// Notification pings in the buzz scene (scene-local frames); the audio script mirrors these.
export const BUZZ_PINGS = [16, 32, 44, 56, 68];

export type SceneKey = keyof typeof SCENES;
export const TOTAL = 1350;

type VoLine = { start: number; dur: number; text: string; words: { w: string; t: number }[] };
const VO = vo as unknown as Record<string, VoLine>;

// Word start frames for a VO line, relative to a scene's start.
export const voWords = (key: string, scene: SceneKey) => {
  const line = VO[key];
  const s = SCENES[scene].start;
  return line.words.map((w) => ({ w: w.w, f: Math.round((line.start + w.t) * FPS) - s }));
};

export const voAt = (key: string, scene: SceneKey) => Math.round(VO[key].start * FPS) - SCENES[scene].start;
export const voEnd = (key: string, scene: SceneKey) =>
  Math.round((VO[key].start + VO[key].dur) * FPS) - SCENES[scene].start;
