// 120 BPM at 30fps: 15 frames per beat, 60 per bar. Every scene starts on a bar.
export const BEAT = 15;
export const BAR = 60;
export const T = 8; // transition overlap on each side of a cut

export const SCENES = {
  hook: { start: 0, len: 120 },
  never: { start: 120, len: 60 },
  meet: { start: 180, len: 120 },
  chat: { start: 300, len: 240 },
  approve: { start: 540, len: 120 },
  store: { start: 660, len: 180 },
  broadcast: { start: 840, len: 120 },
  analytics: { start: 960, len: 120 },
  outro: { start: 1080, len: 180 },
} as const;

export const TOTAL = 1260;
