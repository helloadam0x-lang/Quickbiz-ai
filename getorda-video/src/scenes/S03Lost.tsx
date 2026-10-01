import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, tween, useSceneFrame, EASE_IN, EASE_IN_OUT } from "../anim";
import { Haze } from "../components/Haze";
import { Kinetic } from "../components/Kinetic";
import { Photo, Pill } from "../components/AppUI";
import { Avatar, Ticks } from "../components/WA";
import { C, FONT, SH } from "../theme";
import { voWords } from "../timeline";

export const S03Lost: React.FC = () => {
  const f = useSceneFrame();
  const w = voWords("l03", "lost").map((x) => x.f);
  // l03: And every message you miss... is a sale you just lost.
  const lostAt = w[10];
  const gray = tween(f, lostAt - 4, lostAt + 10);
  const stamp = pop(f, lostAt, { damping: 9, stiffness: 260 });
  const card = pop(f, -6, { damping: 17, stiffness: 120 });
  const exit = tween(f, 94, 116, 0, 1, EASE_IN);
  const drift = tween(f, 0, 110, 0, 1, EASE_IN_OUT);

  return (
    <AbsoluteFill>
      <Haze />
      <AbsoluteFill
        style={{
          transform: `scale(${1.02 + drift * 0.05 + exit * 0.5})`,
          filter: exit > 0 ? `blur(${exit * 22}px)` : undefined,
          opacity: 1 - exit * 0.6,
        }}
      >
        <div style={{ position: "absolute", left: 170, top: 150, perspective: 2200 }}>
          <div
            style={{
              width: 600,
              borderRadius: 34,
              background: C.waBg,
              boxShadow: SH.float,
              overflow: "hidden",
              transform: `translateY(${(1 - card) * 80}px) rotateY(${12 - 4 * drift}deg) rotateX(4deg) scale(${0.92 + 0.08 * card})`,
              opacity: Math.min(1, card * 1.4),
              fontFamily: FONT,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 24px", background: "#fff" }}>
              <Avatar src="stock/av-w1.jpg" size={56} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 650, color: "#111" }}>Amina</div>
                <div style={{ fontSize: 15, color: "#667781" }}>last seen 3 hours ago</div>
              </div>
            </div>
            <div style={{ padding: "26px 24px 30px" }}>
              <div
                style={{
                  width: 400,
                  padding: 8,
                  borderRadius: 18,
                  borderBottomLeftRadius: 6,
                  background: "#fff",
                  boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)",
                  position: "relative",
                }}
              >
                <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
                  <Photo src="products/polo-madrid.jpg" style={{ width: 384, height: 384, filter: `grayscale(${gray}) contrast(${1 - gray * 0.1})` }} />
                  <div style={{ position: "absolute", inset: 0, background: `rgba(255,255,255,${gray * 0.35})` }} />
                </div>
                <div style={{ padding: "10px 6px 2px", fontSize: 21, color: "#111B21" }}>Is it still available? 🙏</div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, fontSize: 13, color: "#667781", padding: "0 6px" }}>08:14</div>
                <div
                  style={{
                    position: "absolute",
                    right: -40,
                    top: 40,
                    transform: `rotate(${-12 + (1 - stamp) * 20}deg) scale(${stamp})`,
                    opacity: Math.min(1, stamp),
                    padding: "12px 22px",
                    borderRadius: 16,
                    border: `3px solid ${C.red}`,
                    color: C.red,
                    background: "rgba(255,255,255,0.92)",
                    fontSize: 30,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  Sale lost
                </div>
              </div>
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 16, color: "#667781" }}>
                <Ticks read={false} size={16} /> No reply · 3h 12m
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", left: 900, top: 330 }}>
          <Kinetic text="Every message you *miss…*" f={f} times={w.slice(1, 5)} size={74} weight={600} />
          <div style={{ height: 18 }} />
          <Kinetic text="is a sale you just *lost.*" f={f} times={w.slice(5, 11)} size={74} weight={600} />
          <div style={{ marginTop: 36, display: "flex", gap: 12, opacity: tween(f, lostAt + 4, lostAt + 16), transform: `translateY(${(1 - tween(f, lostAt + 4, lostAt + 16)) * 16}px)` }}>
            <Pill tone="grey" size={22}>
              <span style={{ textDecoration: "line-through", color: C.mute }}>UGX 100,000</span>
            </Pill>
            <Pill tone="amber" size={22} dot>
              Customer went elsewhere
            </Pill>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
