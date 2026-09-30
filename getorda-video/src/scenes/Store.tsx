import React from "react";
import { AbsoluteFill } from "remotion";
import { caretOn, pop, tween, typed, useSceneFrame, EASE_IN_OUT } from "../anim";
import { LightMesh } from "../components/Backgrounds";
import { Cursor } from "../components/Cursor";
import { Phone } from "../components/Phone";
import { CATALOG, Product, ProductKind } from "../components/Product";
import { Check, Chip, Dot, Eyebrow } from "../components/UI";
import { Words } from "../components/Words";
import { C, FONT, GREEN_GRAD, SHADOW_CARD, SHADOW_SOFT } from "../theme";

const ADD = 100;
const CHECKOUT = 140;
const URL = "getorda.app/store/nia-skin";

const Floating: React.FC<{
  f: number;
  at: number;
  x: number;
  y: number;
  w: number;
  depth?: number;
  children: React.ReactNode;
}> = ({ f, at, x, y, w, depth = 1, children }) => {
  const s = pop(f, at, { damping: 14, stiffness: 150 });
  const drift = Math.sin((f + at * 3) / 26) * 8 * depth;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + drift,
        width: w,
        padding: 22,
        borderRadius: 28,
        background: "rgba(255,255,255,0.96)",
        boxShadow: SHADOW_CARD,
        transform: `translateY(${(1 - s) * 60}px) scale(${0.85 + 0.15 * s})`,
        opacity: Math.min(1, s * 1.4),
        filter: `blur(${(1 - Math.min(1, s)) * 12}px)`,
        fontFamily: FONT,
        zIndex: 20,
      }}
    >
      {children}
    </div>
  );
};

const ProductCard: React.FC<{ kind: ProductKind; f: number; added?: boolean; plusPress?: number }> = ({ kind, added, plusPress = 0 }) => {
  const p = CATALOG[kind];
  return (
    <div style={{ width: 180, borderRadius: 22, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.05), 0 6px 16px rgba(0,0,0,0.05)", overflow: "hidden", position: "relative" }}>
      <div style={{ height: 160, background: p.tile, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <Product kind={kind} size={96} id={`store-${kind}`} />
      </div>
      <div style={{ padding: "12px 14px 16px" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: "-0.01em" }}>{p.name}</div>
        <div style={{ fontSize: 14, color: C.sub, marginTop: 2 }}>{p.short}</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginTop: 8 }}>{p.price}</div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 12,
          bottom: 14,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: added ? C.green2 : C.ink,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          fontWeight: 500,
          transform: `scale(${1 - 0.18 * plusPress})`,
        }}
      >
        {added ? <Check size={26} bg="transparent" /> : "+"}
      </div>
    </div>
  );
};

export const Store: React.FC = () => {
  const f = useSceneFrame();
  const phone = pop(f, -6, { damping: 16, stiffness: 110, mass: 1 });
  const scroll = tween(f, 52, 86, 0, 1, EASE_IN_OUT);
  const added = f >= ADD + 3;
  const plusPress = Math.max(0, Math.sin(Math.PI * tween(f, ADD - 3, ADD + 7, 0, 1, (t) => t)));
  const bar = pop(f, ADD + 6, { damping: 15, stiffness: 180 });
  const sent = f >= CHECKOUT + 3;
  const badge = pop(f, ADD + 4, { damping: 9, stiffness: 260 });
  const url = typed(URL, f, 12, 0.85);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <LightMesh />

      {/* Phone with the storefront */}
      <div style={{ position: "absolute", left: 380, top: 90, perspective: 2600 }}>
        <div
          style={{
            transform: `translateY(${(1 - phone) * 900}px) rotateY(${14 - 6 * phone + tween(f, 0, 180, 0, -4)}deg) rotateZ(${(1 - phone) * 10}deg)`,
            transformOrigin: "50% 60%",
          }}
        >
          <Phone>
            <div style={{ position: "absolute", inset: 0, transform: `translateY(${-scroll * 200}px)` }}>
              <div style={{ height: 250, background: "linear-gradient(160deg,#FCE8D0 0%,#F4C9A6 100%)", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 0, paddingBottom: 30 }}>
                <div style={{ transform: "rotate(-8deg) translateY(10px)" }}><Product kind="cream" size={120} id="hero-cream" /></div>
                <div style={{ marginLeft: -30 }}><Product kind="serum" size={120} id="hero-serum" /></div>
              </div>
              <div style={{ margin: "-34px 16px 0", position: "relative", background: "#fff", borderRadius: 24, padding: "18px 20px", boxShadow: SHADOW_SOFT, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: C.ink, color: "#F4C9A6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24 }}>N</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 23, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>Nia Skin</div>
                  <div style={{ fontSize: 14, color: C.sub }}>Kampala · Delivers today</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>★ 4.9</div>
              </div>
              <div style={{ display: "flex", gap: 8, padding: "18px 16px 14px" }}>
                {["All", "Serums", "Creams", "SPF"].map((c, i) => (
                  <span key={c} style={{ padding: "8px 16px", borderRadius: 999, fontSize: 15, fontWeight: 600, background: i === 0 ? C.ink : "#F1F4F2", color: i === 0 ? "#fff" : C.sub }}>{c}</span>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "180px 180px", gap: 12, padding: "0 16px" }}>
                <ProductCard kind="serum" f={f} added={added} plusPress={plusPress} />
                <ProductCard kind="cream" f={f} />
                <ProductCard kind="spf" f={f} />
                <ProductCard kind="lip" f={f} />
              </div>
            </div>

            {/* Sticky checkout bar */}
            <div
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                bottom: 30,
                height: 76,
                borderRadius: 24,
                background: sent ? C.green2 : C.ink,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 22px",
                transform: `translateY(${(1 - bar) * 140}px) scale(${1 - 0.04 * Math.sin(Math.PI * tween(f, CHECKOUT - 3, CHECKOUT + 7, 0, 1, (t) => t))})`,
                boxShadow: "0 16px 30px rgba(0,0,0,0.25)",
                fontSize: 19,
                fontWeight: 700,
                zIndex: 5,
              }}
            >
              {sent ? (
                <span style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", justifyContent: "center" }}>
                  <Check size={30} bg="rgba(255,255,255,0.25)" /> Order sent on WhatsApp
                </span>
              ) : (
                <>
                  <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 32, height: 32, borderRadius: "50%", background: C.green2, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 17, transform: `scale(${badge})` }}>1</span>
                    Checkout
                  </span>
                  <span>UGX 85,000</span>
                </>
              )}
            </div>

            <div style={{ position: "absolute", inset: 0, zIndex: 30 }}>
              <Cursor
                f={f}
                variant="touch"
                keys={[
                  { f: 70, x: 330, y: 700 },
                  { f: 96, x: 164, y: 395 },
                  { f: 116, x: 180, y: 520 },
                  { f: 136, x: 204, y: 806 },
                  { f: 160, x: 230, y: 760 },
                ]}
                clicks={[ADD, CHECKOUT]}
                show={[72, 160]}
              />
            </div>
          </Phone>
        </div>
      </div>

      {/* Floating proof cards around the phone */}
      <Floating f={f} at={26} x={70} y={230} w={330} depth={1.2}>
        <div style={{ fontSize: 15, color: C.mute, fontWeight: 600, marginBottom: 10 }}>AI chat on every product</div>
        <div style={{ fontSize: 18, background: "#F1F4F2", borderRadius: 16, padding: "10px 14px", color: C.ink }}>Is this good for oily skin?</div>
        <div style={{ fontSize: 18, background: C.bubble, borderRadius: 16, padding: "10px 14px", color: C.ink, marginTop: 8, marginLeft: 30, opacity: tween(f, 40, 48) }}>
          Yes! Light and non-greasy ✨
        </div>
      </Floating>
      <Floating f={f} at={ADD + 14} x={60} y={700} w={350} depth={0.8}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>Order #1042</span>
          <Chip tone="green" size={13}><Dot size={7} /> Live</Chip>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, marginTop: 10 }}>🛵 Out for delivery</div>
        <div style={{ height: 8, borderRadius: 4, background: "#EDF1EF", marginTop: 14, overflow: "hidden" }}>
          <div style={{ width: `${tween(f, ADD + 20, ADD + 60, 20, 72)}%`, height: "100%", background: GREEN_GRAD }} />
        </div>
        <div style={{ fontSize: 15, color: C.sub, marginTop: 10 }}>getorda.app/track · 12 min away</div>
      </Floating>
      <Floating f={f} at={CHECKOUT + 8} x={770} y={150} w={290} depth={1}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Check size={30} />
          <span style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>Receipt sent</span>
        </div>
        <div style={{ fontSize: 15, color: C.sub, marginTop: 8 }}>Itemized · Nia Skin</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, marginTop: 4 }}>UGX 85,000</div>
      </Floating>

      {/* Right: captions */}
      <div style={{ position: "absolute", left: 1110, top: 0, bottom: 0, width: 760, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Eyebrow style={{ opacity: tween(f, 0, 14), marginBottom: 30 }}>Your online store</Eyebrow>
        <div
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            alignItems: "center",
            gap: 14,
            padding: "18px 28px",
            borderRadius: 999,
            background: "#fff",
            boxShadow: SHADOW_SOFT,
            fontSize: 30,
            fontWeight: 600,
            color: C.ink,
            marginBottom: 40,
            opacity: tween(f, 4, 14),
            transform: `translateY(${(1 - tween(f, 4, 16)) * 20}px)`,
          }}
        >
          <svg width="22" height="26" viewBox="0 0 22 26"><rect x="2" y="11" width="18" height="13" rx="3" fill={C.green} /><path d="M6 11 V7 a5 5 0 0 1 10 0 V11" stroke={C.green} strokeWidth="3" fill="none" /></svg>
          <span>{url}<span style={{ opacity: url.length < URL.length && caretOn(f) ? 1 : 0, color: C.green }}>|</span></span>
        </div>
        <Words text="Your own store." f={f} at={30} size={100} />
        <Words text="Live in a minute." f={f} at={38} size={100} gradient={GREEN_GRAD} />
        <div style={{ fontSize: 32, color: C.sub, marginTop: 30, lineHeight: 1.4, maxWidth: 640, opacity: tween(f, 60, 76), filter: `blur(${(1 - tween(f, 60, 76)) * 8}px)` }}>
          Share one link. Orders land straight in WhatsApp, and customers track delivery themselves.
        </div>
      </div>
    </AbsoluteFill>
  );
};
