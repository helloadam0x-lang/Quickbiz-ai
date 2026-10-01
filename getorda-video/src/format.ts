import { useVideoConfig } from "remotion";

// The same scenes render landscape (1920x1080) and vertical (1080x1920); scenes branch on this.
export const useVertical = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

// Pick the landscape or vertical value.
export const pick = <T,>(v: boolean, landscape: T, vertical: T): T => (v ? vertical : landscape);
