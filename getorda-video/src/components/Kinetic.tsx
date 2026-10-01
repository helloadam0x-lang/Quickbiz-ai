import React from "react";
import { EASE_IN, tween } from "../anim";
import { ACCENT_GRAD, C, FONT, SERIF } from "../theme";

export type Timed = { w: string; f: number };

type Props = {
  // Words wrapped in *asterisks* render in the brand's italic serif, cyan.
  text: string;
  f: number;
  // Either a start frame + stagger, or per-word frames from the VO alignment.
  at?: number;
  stagger?: number;
  times?: number[];
  size: number;
  weight?: number;
  color?: string;
  align?: "left" | "center" | "right";
  out?: number;
  dur?: number;
  lead?: number;
  style?: React.CSSProperties;
  accentColor?: string;
};

export const Kinetic: React.FC<Props> = ({
  text,
  f,
  at = 0,
  stagger = 3,
  times,
  size,
  weight = 600,
  color = C.ink,
  align = "left",
  out,
  dur = 14,
  lead = 3,
  style,
  accentColor,
}) => {
  const words = text.split(" ");
  let open = false;
  const accents = words.map((raw) => {
    const starts = raw.startsWith("*");
    const isAccent = open || starts;
    open = isAccent && !/\*[.,…!?]*$/.test(raw.slice(starts ? 1 : 0));
    return isAccent;
  });
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: "-0.045em",
        lineHeight: 1.06,
        color,
        textAlign: align,
        ...style,
      }}
    >
      {words.map((raw, i) => {
        const accent = accents[i];
        const w = raw.replace(/\*/g, "");
        const start = (times ? times[Math.min(i, times.length - 1)] - lead : at + i * stagger);
        const p = tween(f, start, start + dur);
        const o = out === undefined ? 0 : tween(f, out + i * 1.5, out + i * 1.5 + 10, 0, 1, EASE_IN);
        const vis = p * (1 - o);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              opacity: vis,
              transform: `translateY(${(1 - p) * 0.38 - o * 0.2}em) scale(${0.96 + 0.04 * p})`,
              filter: `blur(${((1 - p) * 0.12 + o * 0.1) * size * 0.5}px)`,
              ...(accent
                ? {
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                    fontSize: "1.12em",
                    lineHeight: 0.9,
                    paddingRight: "0.06em",
                    ...(accentColor
                      ? { color: accentColor }
                      : {
                          backgroundImage: ACCENT_GRAD,
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent",
                        }),
                  }
                : {}),
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
};
