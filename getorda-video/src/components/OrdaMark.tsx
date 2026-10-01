import React from "react";

// Same geometry as the product's OrdaMark: a rounded tile with an "O" that
// doubles as a chat bubble, drawn as negative space.
export const OrdaMark: React.FC<{
  size: number;
  color?: string;
  id: string;
  style?: React.CSSProperties;
}> = ({ size, color = "#0B110F", id, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={style}>
    <mask id={`orda-${id}`}>
      <rect width="100" height="100" rx="26" fill="white" />
      <circle cx="50" cy="50" r="24.5" fill="black" />
      <circle cx="50" cy="50" r="13.5" fill="white" />
      <path d="M31 61 C 28 72 23 79 16 83 C 25 81 35 76 43 66 Z" fill="black" />
    </mask>
    <rect width="100" height="100" rx="26" fill={color} mask={`url(#orda-${id})`} />
  </svg>
);
