import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Bundled locally: the render browser can't reach Google Fonts through the proxy.
loadFont({ family: "InterVar", url: staticFile("fonts/Inter-Variable.woff2"), weight: "100 900" });
loadFont({
  family: "InterVar",
  url: staticFile("fonts/Inter-Variable-ext.woff2"),
  weight: "100 900",
  unicodeRange: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
});

export const FONT = `InterVar, "Noto Color Emoji", "Noto Sans Arabic", sans-serif`;

export const C = {
  ink: "#0B110F",
  ink2: "#1E2926",
  sub: "#5A6763",
  mute: "#98A39F",
  line: "rgba(11,17,15,0.08)",
  line2: "rgba(11,17,15,0.12)",
  paper: "#F2F5F3",
  white: "#FFFFFF",
  green: "#0E8C5B",
  green2: "#14B26B",
  lime: "#9BE15D",
  mint: "#E3F7EC",
  bubble: "#DCF6E4",
  amber: "#F5A524",
};

export const GREEN_GRAD =
  "linear-gradient(100deg, #0E8C5B 0%, #14B26B 45%, #7DDB8F 100%)";
export const GREEN_GRAD_DARK =
  "linear-gradient(100deg, #2BD483 0%, #7CF0A8 50%, #C8F77A 100%)";

export const SHADOW_CARD =
  "0 1px 2px rgba(11,17,15,0.04), 0 8px 24px rgba(11,17,15,0.06), 0 40px 90px rgba(14,60,40,0.14)";
export const SHADOW_SOFT =
  "0 1px 2px rgba(11,17,15,0.04), 0 12px 32px rgba(14,60,40,0.10)";
