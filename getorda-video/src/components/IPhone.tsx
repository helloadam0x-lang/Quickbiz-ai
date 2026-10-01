import React from "react";
import { FONT } from "../theme";

export const PW = 410;
export const PH = 860;

export const IPhone: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  time?: string;
  dark?: boolean;
  scale?: number;
}> = ({ children, style, time = "9:41", dark = false, scale = 1 }) => (
  <div
    style={{
      width: PW,
      height: PH,
      borderRadius: 68,
      padding: 11,
      background: "linear-gradient(140deg,#E7E9EA 0%,#B9BEC1 18%,#F4F5F6 40%,#A9AEB2 70%,#DADDDF 100%)",
      boxShadow:
        "inset 0 0 0 1.5px rgba(255,255,255,0.7), 0 2px 4px rgba(0,0,0,0.08), 0 40px 80px rgba(11,60,90,0.22), 0 18px 30px rgba(0,0,0,0.10)",
      position: "relative",
      transform: `scale(${scale})`,
      ...style,
    }}
  >
    <div style={{ width: "100%", height: "100%", borderRadius: 58, background: "#0A0A0A", padding: 5 }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 53,
          overflow: "hidden",
          position: "relative",
          background: dark ? "#0B0B0B" : "#FFFFFF",
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
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 30px 0 40px",
            fontSize: 16,
            fontWeight: 650,
            color: dark ? "#fff" : "#0B0B0B",
            zIndex: 20,
          }}
        >
          <span>{time}</span>
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <svg width="18" height="11" viewBox="0 0 18 11">
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x={i * 4.6} y={8 - i * 2.6} width="3.2" height={3 + i * 2.6} rx="0.9" fill="currentColor" />
              ))}
            </svg>
            <svg width="16" height="11" viewBox="0 0 16 11">
              <path d="M8 10.5 L5.6 8.1 a3.4 3.4 0 0 1 4.8 0 Z M8 1.2 a10 10 0 0 1 7 2.9 l-1.6 1.6 a7.7 7.7 0 0 0-10.8 0 L1 4.1 A10 10 0 0 1 8 1.2Z" fill="currentColor" />
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.4" fill="none" stroke="currentColor" opacity="0.4" />
              <rect x="2.2" y="2.2" width="16" height="7.6" rx="2" fill="currentColor" />
              <rect x="22.6" y="4" width="1.8" height="4" rx="0.9" fill="currentColor" opacity="0.45" />
            </svg>
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 11,
            left: "50%",
            width: 118,
            height: 34,
            marginLeft: -59,
            borderRadius: 20,
            background: "#000",
            zIndex: 21,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            width: 130,
            height: 5,
            marginLeft: -65,
            borderRadius: 3,
            background: dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.75)",
            zIndex: 21,
          }}
        />
      </div>
    </div>
  </div>
);
