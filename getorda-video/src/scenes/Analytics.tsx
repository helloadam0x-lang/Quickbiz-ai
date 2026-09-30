import React from "react";
import { AbsoluteFill } from "remotion";
import { fmt, pop, tween, useSceneFrame, EASE_IN_OUT, EASE_OUT } from "../anim";
import { LightMesh } from "../components/Backgrounds";
import { OrdaMark } from "../components/OrdaMark";
import { CATALOG, Product, ProductKind } from "../components/Product";
import { Chip, Dot } from "../components/UI";
import { Words } from "../components/Words";
import { C, FONT, GREEN_GRAD, SHADOW_CARD } from "../theme";

const DAYS = 30;
const pts = Array.from({ length: DAYS }, (_, i) => {
  const trend = 40 + i * 4.2;
  const wobble = Math.sin(i * 1.3) * 14 + Math.sin(i * 0.47) * 10 + (i % 7 === 5 ? 26 : 0);
  return trend + wobble;
});
const W = 760;
const H = 330;
const max = Math.max(...pts) * 1.08;
const xy = pts.map((v, i) => [(i / (DAYS - 1)) * W, H - (v / max) * H] as const);
const line = xy
  .map(([x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = xy[i - 1];
    const cx = (px + x) / 2;
    return `C ${cx} ${py} ${cx} ${y} ${x} ${y}`;
  })
  .join(" ");
const area = `${line} L ${W} ${H} L 0 ${H} Z`;

const NAV = ["Home", "Conversations", "Orders", "Contacts", "Analytics", "Broadcasts", "Products", "Storefront"];
const TOP: { kind: ProductKind; v: number }[] = [
  { kind: "serum", v: 1 },
  { kind: "cream", v: 0.72 },
  { kind: "spf", v: 0.51 },
  { kind: "lip", v: 0.34 },
];

export const Analytics: React.FC = () => {
  const f = useSceneFrame();
  const enter = tween(f, -8, 36, 0, 1, EASE_OUT);
  const rx = 22 * (1 - enter) + 8 - tween(f, 36, 120, 0, 3);
  const draw = tween(f, 18, 70, 0, 1, EASE_IN_OUT);
  const kpi = tween(f, 10, 60, 0, 1, EASE_OUT);
  const insight = pop(f, 72, { damping: 13, stiffness: 150 });

  const tiles = [
    { label: "Revenue", value: `UGX ${fmt(4860000 * kpi)}`, delta: "+32%" },
    { label: "Orders", value: fmt(128 * kpi), delta: "+18%" },
    { label: "Conversations", value: fmt(1204 * kpi), delta: "+41%" },
    { label: "Answered by AI", value: `${Math.round(94 * kpi)}%`, delta: "24/7" },
  ];

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <LightMesh />
      <div style={{ position: "absolute", top: 64, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 26 }}>
        <Words text="Know exactly" f={f} at={2} size={92} />
        <Words text="what sells." f={f} at={10} size={92} gradient={GREEN_GRAD} />
      </div>

      <div style={{ position: "absolute", left: 180, top: 230, width: 1560, height: 790, perspective: 2600 }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `translateY(${(1 - enter) * 260}px) rotateX(${rx}deg) scale(${0.9 + 0.1 * enter})`,
            transformOrigin: "50% 0%",
            opacity: enter,
            filter: `blur(${(1 - enter) * 16}px)`,
            borderRadius: 36,
            background: "#fff",
            boxShadow: SHADOW_CARD,
            display: "flex",
            overflow: "hidden",
          }}
        >
          <div style={{ width: 280, background: "#FAFBFA", borderRight: `1px solid ${C.line}`, padding: "30px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <OrdaMark size={42} id="dash" />
              <span style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: "-0.04em" }}>GetOrda</span>
            </div>
            <div style={{ marginTop: 24, padding: "12px 16px", borderRadius: 14, background: "rgba(20,178,107,0.10)", border: "1.5px solid rgba(20,178,107,0.3)", color: C.green, fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
              <Dot size={9} /> WhatsApp Live
            </div>
            <div style={{ marginTop: 20 }}>
              {NAV.map((n) => (
                <div key={n} style={{ padding: "13px 16px", borderRadius: 12, fontSize: 19, fontWeight: n === "Analytics" ? 700 : 500, color: n === "Analytics" ? C.ink : C.sub, background: n === "Analytics" ? "rgba(11,17,15,0.06)" : "transparent", marginBottom: 2 }}>
                  {n}
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, padding: "30px 36px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: C.ink, letterSpacing: "-0.03em" }}>Analytics</span>
              <span style={{ fontSize: 20, color: C.mute }}>Nia Skin · Last 30 days</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr 1fr 1fr", gap: 16, marginTop: 24 }}>
              {tiles.map((t) => (
                <div key={t.label} style={{ padding: "20px 22px", borderRadius: 20, border: `1px solid ${C.line}`, background: "#fff" }}>
                  <div style={{ fontSize: 17, color: C.sub, fontWeight: 600 }}>{t.label}</div>
                  <div style={{ fontSize: 34, fontWeight: 800, color: C.ink, letterSpacing: "-0.03em", marginTop: 8, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{t.value}</div>
                  <div style={{ marginTop: 8 }}><Chip tone="green" size={14}>{t.delta}</Chip></div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
              <div style={{ flex: 1.45, padding: "22px 24px", borderRadius: 22, border: `1px solid ${C.line}` }}>
                <div style={{ fontSize: 19, fontWeight: 700, color: C.ink }}>Revenue</div>
                <svg width={W} height={H + 20} viewBox={`0 -10 ${W} ${H + 20}`} style={{ marginTop: 14, overflow: "visible" }}>
                  <defs>
                    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(20,178,107,0.30)" />
                      <stop offset="100%" stopColor="rgba(20,178,107,0)" />
                    </linearGradient>
                    <clipPath id="reveal">
                      <rect x="0" y="-20" width={W * draw} height={H + 40} />
                    </clipPath>
                  </defs>
                  {[0.25, 0.5, 0.75].map((g) => (
                    <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgba(11,17,15,0.06)" strokeDasharray="6 8" />
                  ))}
                  <path d={area} fill="url(#area)" clipPath="url(#reveal)" />
                  <path d={line} fill="none" stroke={C.green2} strokeWidth="4.5" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
                  {draw > 0.02 && (() => {
                    const i = Math.min(DAYS - 1, Math.floor(draw * (DAYS - 1)));
                    const [x, y] = xy[i];
                    return <circle cx={x} cy={y} r="9" fill="#fff" stroke={C.green2} strokeWidth="4" />;
                  })()}
                </svg>
              </div>
              <div style={{ flex: 1, padding: "22px 24px", borderRadius: 22, border: `1px solid ${C.line}` }}>
                <div style={{ fontSize: 19, fontWeight: 700, color: C.ink }}>Top products</div>
                {TOP.map((t, i) => {
                  const g = tween(f, 26 + i * 6, 60 + i * 6, 0, 1, EASE_OUT);
                  return (
                    <div key={t.kind} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 12, background: CATALOG[t.kind].tile, display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
                        <Product kind={t.kind} size={34} id={`top-${t.kind}`} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 600, color: C.ink }}>
                          <span>{CATALOG[t.kind].name}</span>
                          <span style={{ color: C.sub }}>{Math.round(t.v * 42 * g)} sold</span>
                        </div>
                        <div style={{ height: 9, borderRadius: 5, background: "#EEF2F0", marginTop: 8 }}>
                          <div style={{ width: `${t.v * 100 * g}%`, height: "100%", borderRadius: 5, background: GREEN_GRAD }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 130,
          top: 186,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "20px 28px",
          borderRadius: 22,
          background: C.ink,
          color: "#fff",
          fontSize: 25,
          fontWeight: 600,
          boxShadow: "0 30px 60px rgba(0,0,0,0.28)",
          transform: `translateY(${(1 - insight) * 40}px) scale(${0.8 + 0.2 * insight})`,
          opacity: Math.min(1, insight),
        }}
      >
        <span style={{ fontSize: 28 }}>✨</span> Saturday was your best day: 23 orders
      </div>
    </AbsoluteFill>
  );
};
