import React from "react";
import { Img, staticFile } from "remotion";
import {
  BarChart3,
  Bell,
  Box,
  CreditCard,
  LayoutGrid,
  Megaphone,
  MessageCircle,
  Settings,
  ShoppingBag,
  Store,
  Users,
  Wifi,
} from "lucide-react";
import { C, FONT, SERIF } from "../theme";
import { OrdaMark } from "./OrdaMark";

export const NAV = [
  { k: "Home", I: LayoutGrid },
  { k: "Conversations", I: MessageCircle },
  { k: "Orders", I: ShoppingBag },
  { k: "Contacts", I: Users },
  { k: "Analytics", I: BarChart3 },
  { k: "Broadcasts", I: Megaphone },
  { k: "Products", I: Box },
  { k: "Storefront", I: Store },
  { k: "Billing", I: CreditCard },
  { k: "Settings", I: Settings },
];

// Replica of the GetOrda dashboard sidebar.
export const Sidebar: React.FC<{ active: string; w?: number }> = ({ active, w = 250 }) => (
  <div style={{ width: w, flexShrink: 0, borderRight: `1px solid ${C.line}`, background: "#FCFEFD", padding: "22px 14px", fontFamily: FONT }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px" }}>
      <OrdaMark size={36} id={`sb-${active}`} color="#12120F" />
      <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em", color: C.ink }}>GetOrda</span>
    </div>
    <div style={{ height: 1, background: C.line, margin: "18px -14px 14px" }} />
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 12px",
        borderRadius: 10,
        background: "#E1EFE8",
        border: "1px solid #CBE5D6",
        color: C.ok,
        fontSize: 13.5,
        fontWeight: 650,
      }}
    >
      <Wifi size={15} strokeWidth={2.2} />
      <span style={{ width: 7, height: 7, borderRadius: 4, background: "#22A559" }} />
      WhatsApp Live
    </div>
    <div style={{ marginTop: 14 }}>
      {NAV.map(({ k, I }) => {
        const on = k === active;
        return (
          <div
            key={k}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 10,
              marginBottom: 2,
              fontSize: 15.5,
              fontWeight: on ? 650 : 450,
              color: on ? C.cyanInk : "#3B3F40",
              background: on ? C.cyanPale : "transparent",
              boxShadow: on ? `inset 3px 0 0 ${C.cyan}` : undefined,
            }}
          >
            <I size={18} strokeWidth={1.8} />
            {k}
          </div>
        );
      })}
    </div>
  </div>
);

export const TopBar: React.FC<{ bell?: number }> = ({ bell = 29 }) => (
  <div style={{ height: 64, borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "0 26px" }}>
    <div style={{ position: "relative", width: 42, height: 42, borderRadius: 12, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#3B3F40" }}>
      <Bell size={19} strokeWidth={1.8} />
      <span
        style={{
          position: "absolute",
          top: -6,
          right: -7,
          minWidth: 22,
          height: 18,
          borderRadius: 9,
          background: C.red,
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 5px",
          border: "2px solid #fff",
        }}
      >
        {bell}
      </span>
    </div>
  </div>
);

// "What you *sell*." style page heading.
export const PageTitle: React.FC<{ pre: string; accent: string; post?: string; size?: number; eyebrow?: string }> = ({
  pre,
  accent,
  post = ".",
  size = 44,
  eyebrow,
}) => (
  <div style={{ fontFamily: FONT }}>
    {eyebrow && <div style={{ fontSize: 13, color: C.sub, fontWeight: 550, marginBottom: 6 }}>{eyebrow}</div>}
    <div style={{ fontSize: size, fontWeight: 750, letterSpacing: "-0.04em", color: C.ink, lineHeight: 1.05 }}>
      {pre}
      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.01em", fontSize: "1.08em" }}>{accent}</span>
      {post}
    </div>
  </div>
);

export const Pill: React.FC<{ tone?: "cyan" | "ok" | "amber" | "grey" | "dark"; children: React.ReactNode; size?: number; style?: React.CSSProperties; dot?: boolean }> = ({
  tone = "grey",
  children,
  size = 13,
  style,
  dot,
}) => {
  const t = {
    cyan: { bg: C.cyanPale, fg: C.cyanInk, bd: "rgba(109,212,241,0.6)" },
    ok: { bg: C.okBg, fg: C.ok, bd: "rgba(25,118,64,0.15)" },
    amber: { bg: C.amberBg, fg: C.amber, bd: "rgba(137,98,29,0.18)" },
    grey: { bg: "#F4F6F6", fg: "#4A4F50", bd: C.line },
    dark: { bg: C.ink, fg: "#fff", bd: C.ink },
  }[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.45,
        padding: `${size * 0.32}px ${size * 0.75}px`,
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        fontSize: size,
        fontWeight: 650,
        whiteSpace: "nowrap",
        fontFamily: FONT,
        ...style,
      }}
    >
      {dot && <span style={{ width: size * 0.5, height: size * 0.5, borderRadius: "50%", background: "currentColor" }} />}
      {children}
    </span>
  );
};

export const ProductCard: React.FC<{
  src: string;
  name: string;
  price: string;
  was?: string;
  w?: number;
  sale?: string;
  style?: React.CSSProperties;
  fit?: "cover" | "contain";
}> = ({ src, name, price, was, w = 220, sale, style, fit = "cover" }) => (
  <div
    style={{
      width: w,
      borderRadius: 18,
      background: "#fff",
      border: `1px solid ${C.line}`,
      boxShadow: "0 1px 2px rgba(17,17,16,0.04), 0 10px 28px rgba(17,17,16,0.07)",
      overflow: "hidden",
      fontFamily: FONT,
      position: "relative",
      ...style,
    }}
  >
    <div style={{ width: "100%", height: w * 0.96, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: fit }} />
    </div>
    {sale && (
      <span style={{ position: "absolute", top: 10, left: 10, padding: "3px 9px", borderRadius: 999, background: C.cyan, color: "#06323F", fontSize: 12, fontWeight: 750 }}>
        {sale}
      </span>
    )}
    <div style={{ padding: `${w * 0.06}px ${w * 0.075}px ${w * 0.07}px` }}>
      <div style={{ fontSize: w * 0.075, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
        <span style={{ fontSize: w * 0.078, fontWeight: 750, color: C.ink }}>{price}</span>
        {was && <span style={{ fontSize: w * 0.058, color: C.mute, textDecoration: "line-through" }}>{was}</span>}
      </div>
      <div style={{ marginTop: w * 0.05 }}>
        <Pill tone="ok" size={w * 0.055} dot>
          In stock
        </Pill>
      </div>
    </div>
  </div>
);

export const Photo: React.FC<{ src: string; style?: React.CSSProperties; fit?: "cover" | "contain" }> = ({ src, style, fit = "cover" }) => (
  <Img src={staticFile(src)} style={{ display: "block", objectFit: fit, ...style }} />
);
