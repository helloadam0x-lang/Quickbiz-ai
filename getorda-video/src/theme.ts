import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are bundled locally: the render browser can't reach Google Fonts through the proxy.
loadFont({ family: "InterVar", url: staticFile("fonts/Inter-Variable.woff2"), weight: "100 900" });
loadFont({
  family: "InterVar",
  url: staticFile("fonts/Inter-Variable-ext.woff2"),
  weight: "100 900",
  unicodeRange:
    "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
});
loadFont({ family: "InstrumentSerif", url: staticFile("fonts/InstrumentSerif-Italic.woff2"), style: "italic", weight: "400" });
loadFont({ family: "InstrumentSerif", url: staticFile("fonts/InstrumentSerif-Regular.woff2"), weight: "400" });
loadFont({ family: "NotoArabic", url: staticFile("fonts/NotoSansArabic-Variable.woff2"), weight: "100 900" });

export const FONT = `InterVar, NotoArabic, "Noto Color Emoji", sans-serif`;
export const SERIF = `InstrumentSerif, Georgia, serif`;

// Sampled from the live GetOrda dashboard recordings.
export const C = {
  ink: "#111110",
  ink2: "#2A2A28",
  sub: "#6A6F70",
  mute: "#9AA1A3",
  line: "rgba(17,17,16,0.08)",
  line2: "rgba(17,17,16,0.13)",
  bg: "#FBFDFE",
  white: "#FFFFFF",
  cyan: "#6DD4F1",
  cyanDeep: "#1AA5D6",
  cyanInk: "#0B6E92",
  cyanPale: "#E9F8FD",
  cyanLine: "rgba(109,212,241,0.55)",
  okBg: "#E8F7EB",
  ok: "#197640",
  amberBg: "#F7EEDB",
  amber: "#89621D",
  red: "#EF4444",
  wa: "#25D366",
  waDark: "#128C7E",
  waBubble: "#D9FDD3",
  waBg: "#EFEAE2",
  waBlue: "#53BDEB",
};

export const ACCENT_GRAD = "linear-gradient(100deg, #0E93C6 0%, #2BB6E3 45%, #6DD4F1 100%)";

export const SH = {
  card: "0 1px 2px rgba(17,17,16,0.04), 0 10px 30px rgba(17,17,16,0.06), 0 40px 90px rgba(11,110,146,0.12)",
  soft: "0 1px 2px rgba(17,17,16,0.04), 0 8px 24px rgba(17,17,16,0.07)",
  float: "0 2px 6px rgba(17,17,16,0.05), 0 24px 60px rgba(11,60,90,0.16)",
};
