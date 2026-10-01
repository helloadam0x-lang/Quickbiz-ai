import React from "react";
import { Img, staticFile } from "remotion";
import { pop, tween } from "../anim";
import { C, FONT } from "../theme";

export const Avatar: React.FC<{ src?: string; name?: string; size?: number; ring?: string }> = ({
  src,
  name = "?",
  size = 44,
  ring,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      overflow: "hidden",
      flexShrink: 0,
      background: "linear-gradient(145deg,#BFE9F7,#6DD4F1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 700,
      fontSize: size * 0.4,
      boxShadow: ring ? `0 0 0 3px ${ring}` : undefined,
    }}
  >
    {src ? <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : name}
  </div>
);

export const WAIcon: React.FC<{ size?: number; bg?: string }> = ({ size = 40, bg = C.wa }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.26,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
      <path
        d="M12 2.2a9.7 9.7 0 0 0-8.4 14.6L2.3 21.7l5-1.3A9.7 9.7 0 1 0 12 2.2z"
        fill="none"
        stroke="#fff"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="M8.6 7.3c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.5.7c-.1.2-.2.3 0 .6.5.9 1.7 2.2 3.1 2.8.3.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.4.4 0 .4-.1 1.1-.6 1.6-.5.5-1.4.8-2.2.7-2.2-.3-5.4-2.5-6.6-5.2-.6-1.4-.4-2.6.1-3.1z"
        fill="#fff"
      />
    </svg>
  </div>
);

export const Ticks: React.FC<{ read?: boolean; size?: number }> = ({ read = true, size = 16 }) => (
  <svg width={size * 1.15} height={size * 0.75} viewBox="0 0 18 11" style={{ flexShrink: 0 }}>
    <path d="M1 6l3 3 6-7.5" stroke={read ? C.waBlue : "#8696A0"} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.5 8.6l.9.9 6-7.5" stroke={read ? C.waBlue : "#8696A0"} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// WhatsApp light-theme chat header.
export const WAHeader: React.FC<{ name: string; avatar?: string; status?: string; badge?: number }> = ({
  name,
  avatar,
  status = "online",
  badge,
}) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 118,
      paddingTop: 54,
      background: "rgba(255,255,255,0.97)",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
      display: "flex",
      alignItems: "center",
      gap: 10,
      paddingLeft: 12,
      paddingRight: 16,
      zIndex: 10,
      fontFamily: FONT,
    }}
  >
    <svg width="14" height="22" viewBox="0 0 14 22">
      <path d="M11 2 L3 11 L11 20" stroke="#0A84FF" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {badge !== undefined && (
      <span style={{ fontSize: 15, color: "#0A84FF", fontWeight: 500, marginLeft: -4, minWidth: 22 }}>{badge}</span>
    )}
    <Avatar src={avatar} name={name[0]} size={40} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 17, fontWeight: 650, color: "#111", whiteSpace: "nowrap" }}>{name}</div>
      <div style={{ fontSize: 12.5, color: "#667781" }}>{status}</div>
    </div>
    <svg width="24" height="18" viewBox="0 0 24 18">
      <rect x="1" y="3" width="15" height="12" rx="3" fill="none" stroke="#0A84FF" strokeWidth="1.8" />
      <path d="M16 8l6-3.5v9L16 10z" fill="none" stroke="#0A84FF" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginLeft: 14 }}>
      <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill="none" stroke="#0A84FF" strokeWidth="1.8" />
    </svg>
  </div>
);

export const WAWallpaper: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: C.waBg }}>
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
      <defs>
        <pattern id="wap" width="64" height="64" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="12" r="3" fill="none" stroke="#C9C1B5" strokeWidth="1.2" />
          <path d="M40 8 l6 6 M46 8 l-6 6" stroke="#C9C1B5" strokeWidth="1.2" />
          <rect x="22" y="38" width="10" height="8" rx="2" fill="none" stroke="#C9C1B5" strokeWidth="1.2" />
          <path d="M50 42 q5 -6 10 0" fill="none" stroke="#C9C1B5" strokeWidth="1.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wap)" />
    </svg>
  </div>
);

export const WAInput: React.FC<{ text?: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 86,
      paddingBottom: 22,
      background: "rgba(246,246,246,0.98)",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "0 12px 22px",
      zIndex: 10,
    }}
  >
    <span style={{ fontSize: 26, color: "#0A84FF", fontWeight: 300 }}>+</span>
    <div
      style={{
        flex: 1,
        height: 36,
        borderRadius: 18,
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        fontSize: 15,
        color: text ? "#111" : "#9AA1A3",
      }}
    >
      {text ?? ""}
    </div>
    <div style={{ width: 34, height: 34, borderRadius: 17, background: C.waDark, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="14" height="18" viewBox="0 0 14 18">
        <rect x="4" y="1" width="6" height="11" rx="3" fill="#fff" />
        <path d="M1.5 8.5a5.5 5.5 0 0 0 11 0M7 14v3" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  </div>
);

export type Msg = {
  at: number;
  side: "in" | "out";
  h: number;
  until?: number;
  node: React.ReactNode;
  time?: string;
  ai?: boolean;
};

// A message thread that grows from the bottom, pushing older bubbles up.
export const Thread: React.FC<{ f: number; msgs: Msg[]; bottom?: number; top?: number; width?: number }> = ({
  f,
  msgs,
  bottom = 92,
  top = 122,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top,
      bottom,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      padding: "0 10px",
      overflow: "hidden",
    }}
  >
    {msgs.map((m, i) => {
      if (f < m.at) return null;
      const grow = tween(f, m.at, m.at + 10) * (m.until ? 1 - tween(f, m.until - 2, m.until + 6) : 1);
      const s = pop(f, m.at, { damping: 15, stiffness: 220 });
      const out = m.side === "out";
      return (
        <div key={i} style={{ height: m.h * grow, flexShrink: 0, display: "flex", justifyContent: out ? "flex-end" : "flex-start", alignItems: "flex-end" }}>
          <div
            style={{
              marginBottom: 8,
              maxWidth: "82%",
              padding: "8px 10px 6px 11px",
              borderRadius: 14,
              borderBottomRightRadius: out ? 4 : 14,
              borderBottomLeftRadius: out ? 14 : 4,
              background: out ? C.waBubble : "#FFFFFF",
              boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)",
              transform: `scale(${0.75 + 0.25 * s})`,
              transformOrigin: out ? "100% 100%" : "0% 100%",
              opacity: Math.min(1, s * 1.6) * grow,
              fontSize: 15,
              lineHeight: 1.36,
              color: "#111B21",
              fontFamily: FONT,
            }}
          >
            {m.node}
            {m.time && (
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, fontSize: 11, color: "#667781", marginTop: 2 }}>
                {m.ai && <span style={{ color: C.cyanInk, fontWeight: 700 }}>GetOrda AI ·</span>}
                <span>{m.time}</span>
                {out && <Ticks size={13} />}
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

export const TypingDots: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ display: "flex", gap: 5, padding: "4px 2px" }}>
    {[0, 1, 2].map((i) => {
      const k = Math.max(0, Math.sin((f / 30) * 10 - i * 0.9));
      return <span key={i} style={{ width: 8, height: 8, borderRadius: 4, background: "#8696A0", opacity: 0.4 + 0.6 * k, transform: `translateY(${-3 * k}px)` }} />;
    })}
  </div>
);

// iOS-style notification banner.
export const Notif: React.FC<{
  avatar?: string;
  name: string;
  msg: React.ReactNode;
  app?: string;
  width?: number;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ avatar, name, msg, app = "WhatsApp", width = 470, icon, style }) => (
  <div
    style={{
      width,
      display: "flex",
      gap: 14,
      alignItems: "center",
      padding: "14px 18px 14px 14px",
      borderRadius: 26,
      background: "rgba(255,255,255,0.86)",
      border: "1px solid rgba(255,255,255,0.9)",
      boxShadow: "0 2px 6px rgba(17,17,16,0.05), 0 18px 44px rgba(11,60,90,0.16)",
      fontFamily: FONT,
      ...style,
    }}
  >
    <div style={{ position: "relative" }}>
      <Avatar src={avatar} name={name[0]} size={48} />
      <div style={{ position: "absolute", right: -5, bottom: -5 }}>{icon ?? <WAIcon size={22} />}</div>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 17, fontWeight: 650, color: "#111" }}>{name}</span>
        <span style={{ fontSize: 13, color: "#8A8F92" }}>{app} · now</span>
      </div>
      <div style={{ fontSize: 16, color: "#2A2D2F", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{msg}</div>
    </div>
  </div>
);

export const Wave: React.FC<{ f: number; at: number; dur?: number; bars?: number; color?: string }> = ({
  f,
  at,
  dur = 40,
  bars = 26,
  color = C.waDark,
}) => {
  const prog = tween(f, at, at + dur, 0, 1, (t) => t);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: 26 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const h = 5 + Math.abs(Math.sin(i * 1.7) * 13 + Math.sin(i * 0.6) * 6);
        const on = i / bars < prog;
        return <span key={i} style={{ width: 3, height: h, borderRadius: 2, background: on ? color : "rgba(17,17,16,0.22)" }} />;
      })}
    </div>
  );
};
