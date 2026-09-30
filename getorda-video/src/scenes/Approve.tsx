import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, tween, useSceneFrame } from "../anim";
import { LightMesh } from "../components/Backgrounds";
import { Cursor } from "../components/Cursor";
import { OrdaMark } from "../components/OrdaMark";
import { Product } from "../components/Product";
import { Avatar, Check, Chip, Dot } from "../components/UI";
import { Words } from "../components/Words";
import { C, FONT, GREEN_GRAD, SHADOW_CARD } from "../theme";

export const CLICK = 62;

const Burst: React.FC<{ f: number; at: number; x: number; y: number }> = ({ f, at, x, y }) => {
  if (f < at) return null;
  const n = 18;
  const colors = [C.green2, "#7CF0A8", C.amber, "#34B7F1", "#0B110F"];
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + (i % 2) * 0.15;
        const dist = tween(f, at, at + 26, 0, 150 + (i % 3) * 50);
        const o = 1 - tween(f, at + 12, at + 30);
        const s = i % 3 === 0 ? 16 : 11;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(a) * dist - s / 2,
              top: y + Math.sin(a) * dist * 0.75 - s / 2 + tween(f, at, at + 30, 0, 40),
              width: s,
              height: i % 4 === 0 ? s * 0.45 : s,
              borderRadius: i % 4 === 0 ? 3 : "50%",
              background: colors[i % colors.length],
              opacity: o,
              transform: `rotate(${a * 57 + f * 8}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

export const Approve: React.FC = () => {
  const f = useSceneFrame();
  const card = pop(f, -2, { damping: 16, stiffness: 150 });
  const done = tween(f, CLICK, CLICK + 8);
  const toast = pop(f, CLICK + 16, { damping: 15, stiffness: 170 });
  const float = Math.sin(f / 22) * 6;

  // Approve button centre, measured from the card layout below.
  const btnX = 1195;
  const btnY = 705;

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <LightMesh />
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 26 }}>
        <Words text="You approve." f={f} at={2} size={92} />
        <Words text="You get paid." f={f} at={12} size={92} gradient={GREEN_GRAD} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 960 - 420,
          top: 250 + float,
          width: 840,
          borderRadius: 40,
          background: "#fff",
          boxShadow: done > 0 ? `${SHADOW_CARD}, 0 0 0 ${6 * done}px rgba(20,178,107,${0.18 * done})` : SHADOW_CARD,
          transform: `translateY(${(1 - card) * 120}px) scale(${0.9 + 0.1 * card})`,
          opacity: Math.min(1, card * 1.3),
          filter: `blur(${(1 - Math.min(1, card)) * 12}px)`,
          padding: 36,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <OrdaMark size={40} id="approve" />
          <span style={{ fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>New order</span>
          <span style={{ fontSize: 22, color: C.mute }}>#1042 · just now</span>
          <span style={{ flex: 1 }} />
          {done < 0.5 ? (
            <Chip tone="amber" size={18}><Dot size={9} color={C.amber} /> Awaiting your approval</Chip>
          ) : (
            <Chip tone="green" size={18} style={{ transform: `scale(${pop(f, CLICK + 4, { damping: 10 })})` }}>
              <Dot size={9} /> Approved
            </Chip>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 30 }}>
          <Avatar name="A" size={60} hue={20} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>Amani K.</div>
            <div style={{ fontSize: 20, color: C.sub }}>Kololo, Kampala · via WhatsApp</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 26, padding: 18, borderRadius: 24, background: "#F6F8F7" }}>
          <div style={{ width: 92, height: 92, borderRadius: 18, background: "linear-gradient(160deg,#FFF1DE,#FBDDB8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Product kind="serum" size={60} id="approve-serum" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.ink }}>Glow Serum × 1</div>
            <div style={{ fontSize: 20, color: C.sub, marginTop: 4 }}>+ Delivery to Kololo</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, color: C.mute }}>Total</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>UGX 95,000</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20, fontSize: 21, color: C.ink2 }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: "#FFCC00", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#0B110F" }}>MoMo</span>
          <span>Payment from <b>0772 ••• 418</b> · Ref 8841 2207</span>
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 30, justifyContent: "flex-end" }}>
          <div style={{ padding: "22px 34px", borderRadius: 18, border: `1.5px solid ${C.line2}`, fontSize: 24, fontWeight: 600, color: C.sub, opacity: 1 - done * 0.6 }}>
            Decline
          </div>
          <div
            style={{
              padding: "22px 40px",
              borderRadius: 18,
              fontSize: 24,
              fontWeight: 700,
              color: "#fff",
              background: done > 0 ? `color-mix(in srgb, ${C.green2} ${done * 100}%, ${C.ink})` : C.ink,
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 250,
              justifyContent: "center",
              transform: `scale(${1 + 0.06 * Math.sin(Math.PI * tween(f, CLICK, CLICK + 10))})`,
            }}
          >
            {done < 0.5 ? "Approve & ship" : (<><Check size={28} bg="rgba(255,255,255,0.25)" /> Approved</>)}
          </div>
        </div>
      </div>

      <Burst f={f} at={CLICK + 2} x={btnX} y={btnY} />

      <div
        style={{
          position: "absolute",
          left: 960 - 330,
          top: 840,
          width: 660,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "20px 28px",
          borderRadius: 999,
          background: C.ink,
          color: "#fff",
          fontSize: 23,
          fontWeight: 600,
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          transform: `translateY(${(1 - toast) * 80}px)`,
          opacity: Math.min(1, toast),
        }}
      >
        <Check size={32} />
        Receipt sent to Amani on WhatsApp
      </div>

      <Cursor
        f={f}
        keys={[
          { f: 18, x: 1700, y: 1120 },
          { f: 54, x: btnX + 20, y: btnY + 8 },
          { f: 80, x: btnX + 30, y: btnY + 14 },
          { f: 110, x: 1500, y: 1010 },
        ]}
        clicks={[CLICK]}
        show={[18, 118]}
      />
    </AbsoluteFill>
  );
};
