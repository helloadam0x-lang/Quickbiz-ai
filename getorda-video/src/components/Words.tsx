import React from "react";
import { tween, EASE_IN } from "../anim";
import { FONT } from "../theme";

type Props = {
  text: string;
  f: number;
  at: number;
  stagger?: number;
  dur?: number;
  size: number;
  weight?: number;
  color?: string;
  gradient?: string;
  tracking?: string;
  out?: number;
  outDur?: number;
  align?: "left" | "center";
  style?: React.CSSProperties;
};

// Word-by-word blur/rise reveal, the core kinetic-type move from the references.
export const Words: React.FC<Props> = ({
  text,
  f,
  at,
  stagger = 4,
  dur = 16,
  size,
  weight = 700,
  color = "#0B110F",
  gradient,
  tracking = "-0.045em",
  out,
  outDur = 10,
  align = "left",
  style,
}) => {
  const words = text.split(" ");
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: tracking,
        lineHeight: 1.04,
        color,
        textAlign: align,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = tween(f, at + i * stagger, at + i * stagger + dur);
        const o = out === undefined ? 0 : tween(f, out + i * 2, out + i * 2 + outDur, 0, 1, EASE_IN);
        const opacity = p * (1 - o);
        const y = (1 - p) * 0.42 - o * 0.25;
        const blur = (1 - p) * 0.14 + o * 0.12;
        const scale = 0.94 + 0.06 * p;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity,
              transform: `translateY(${y}em) scale(${scale})`,
              filter: `blur(${blur * size * 0.6}px)`,
              marginRight: i < words.length - 1 ? "0.24em" : 0,
              ...(gradient
                ? {
                    backgroundImage: gradient,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    paddingBottom: "0.08em",
                  }
                : {}),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
