import React from "react";
import { C, FONT } from "../theme";

export const Avatar: React.FC<{ name: string; size?: number; hue?: number }> = ({
  name,
  size = 56,
  hue = 150,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `linear-gradient(145deg, hsl(${hue},55%,62%) 0%, hsl(${hue + 30},60%,42%) 100%)`,
      color: "#fff",
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: size * 0.4,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxShadow: "inset 0 -2px 6px rgba(0,0,0,0.15)",
    }}
  >
    {name}
  </div>
);

export const Chip: React.FC<{
  children: React.ReactNode;
  tone?: "green" | "grey" | "dark" | "amber";
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, tone = "grey", size = 18, style }) => {
  const tones = {
    green: { bg: "rgba(20,178,107,0.12)", fg: C.green, bd: "rgba(20,178,107,0.28)" },
    grey: { bg: "rgba(11,17,15,0.05)", fg: C.sub, bd: "rgba(11,17,15,0.08)" },
    dark: { bg: C.ink, fg: "#fff", bd: C.ink },
    amber: { bg: "rgba(245,165,36,0.14)", fg: "#A96700", bd: "rgba(245,165,36,0.35)" },
  }[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.45,
        padding: `${size * 0.38}px ${size * 0.8}px`,
        borderRadius: 999,
        background: tones.bg,
        color: tones.fg,
        border: `1.5px solid ${tones.bd}`,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export const Dot: React.FC<{ color?: string; size?: number; glow?: boolean }> = ({
  color = C.green2,
  size = 10,
  glow = true,
}) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      display: "inline-block",
      boxShadow: glow ? `0 0 0 ${size * 0.45}px ${color}33` : undefined,
    }}
  />
);

export const Check: React.FC<{ size?: number; color?: string; bg?: string }> = ({
  size = 22,
  color = "#fff",
  bg = C.green2,
}) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: bg,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

export const Eyebrow: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; dark?: boolean }> = ({
  children,
  style,
  dark,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: dark ? "#7CF0A8" : C.green,
      display: "flex",
      alignItems: "center",
      gap: 12,
      ...style,
    }}
  >
    <span style={{ width: 28, height: 2, background: "currentColor", display: "inline-block" }} />
    {children}
  </div>
);
