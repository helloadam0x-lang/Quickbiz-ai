import React from "react";
import { FONT } from "../theme";

export const PHONE_W = 430;
export const PHONE_H = 900;

export const Phone: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  dark?: boolean;
}> = ({ children, style, dark = false }) => (
  <div
    style={{
      width: PHONE_W,
      height: PHONE_H,
      borderRadius: 72,
      padding: 13,
      background: "linear-gradient(145deg,#2B2F2E 0%,#0A0C0B 40%,#1C1F1E 100%)",
      boxShadow:
        "0 0 0 2px #3A3F3D, 0 50px 100px rgba(8,30,20,0.35), 0 20px 40px rgba(0,0,0,0.25), inset 0 0 0 2px #000",
      position: "relative",
      ...style,
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 60,
        overflow: "hidden",
        position: "relative",
        background: dark ? "#0B110F" : "#FFFFFF",
        fontFamily: FONT,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 58,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 38px 0 44px",
          fontSize: 17,
          fontWeight: 600,
          color: dark ? "#fff" : "#0B110F",
          zIndex: 10,
        }}
      >
        <span>9:41</span>
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <svg width="20" height="12" viewBox="0 0 20 12">
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={i * 5} y={9 - i * 3} width="3.4" height={3 + i * 3} rx="1" fill="currentColor" />
            ))}
          </svg>
          <svg width="26" height="12" viewBox="0 0 26 12">
            <rect x="0.5" y="0.5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity="0.4" />
            <rect x="2.5" y="2.5" width="16" height="7" rx="2" fill="currentColor" />
            <rect x="23.5" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.4" />
          </svg>
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          width: 124,
          height: 36,
          marginLeft: -62,
          borderRadius: 20,
          background: "#000",
          zIndex: 11,
        }}
      />
    </div>
  </div>
);
