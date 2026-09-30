import React from "react";
import { FONT } from "../theme";

export type ProductKind = "serum" | "cream" | "spf" | "lip";

export const CATALOG: Record<
  ProductKind,
  { name: string; price: string; tile: string; short: string }
> = {
  serum: { name: "Glow Serum", short: "Vitamin C 15%", price: "UGX 85,000", tile: "linear-gradient(160deg,#FFF1DE 0%,#FBDDB8 100%)" },
  cream: { name: "Shea Cloud Cream", short: "Whipped shea", price: "UGX 65,000", tile: "linear-gradient(160deg,#F3F0EA 0%,#E4DDD0 100%)" },
  spf: { name: "Daily SPF 50", short: "No white cast", price: "UGX 55,000", tile: "linear-gradient(160deg,#FFE7E0 0%,#FBC9BB 100%)" },
  lip: { name: "Rose Lip Oil", short: "Tinted shine", price: "UGX 35,000", tile: "linear-gradient(160deg,#FCE6EE 0%,#F4C4D6 100%)" },
};

// Studio-style product renders drawn in SVG so no stock photography is needed.
export const Product: React.FC<{ kind: ProductKind; size: number; id: string }> = ({
  kind,
  size,
  id,
}) => {
  const g = (n: string) => `${id}-${n}`;
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 200 260" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={g("shadow")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(40,20,0,0.35)" />
          <stop offset="100%" stopColor="rgba(40,20,0,0)" />
        </radialGradient>
        <linearGradient id={g("amber")} x1="0" x2="1">
          <stop offset="0%" stopColor="#7A3A0C" />
          <stop offset="35%" stopColor="#C8741E" />
          <stop offset="60%" stopColor="#E39A45" />
          <stop offset="100%" stopColor="#8A4410" />
        </linearGradient>
        <linearGradient id={g("gold")} x1="0" x2="1">
          <stop offset="0%" stopColor="#9C7430" />
          <stop offset="40%" stopColor="#E9C77E" />
          <stop offset="70%" stopColor="#C9A057" />
          <stop offset="100%" stopColor="#8E6827" />
        </linearGradient>
        <linearGradient id={g("cream")} x1="0" x2="1">
          <stop offset="0%" stopColor="#DCD5C9" />
          <stop offset="40%" stopColor="#FFFDF8" />
          <stop offset="100%" stopColor="#D2CABD" />
        </linearGradient>
        <linearGradient id={g("coral")} x1="0" x2="1">
          <stop offset="0%" stopColor="#E0674E" />
          <stop offset="45%" stopColor="#FF9A7E" />
          <stop offset="100%" stopColor="#D35A42" />
        </linearGradient>
        <linearGradient id={g("rose")} x1="0" x2="1">
          <stop offset="0%" stopColor="#B8406A" />
          <stop offset="45%" stopColor="#F07FA5" />
          <stop offset="100%" stopColor="#A83660" />
        </linearGradient>
        <linearGradient id={g("black")} x1="0" x2="1">
          <stop offset="0%" stopColor="#0E0E0E" />
          <stop offset="45%" stopColor="#3A3A3A" />
          <stop offset="100%" stopColor="#0A0A0A" />
        </linearGradient>
        <linearGradient id={g("shine")} x1="0" x2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="246" rx="70" ry="10" fill={`url(#${g("shadow")})`} />
      {kind === "serum" && (
        <g>
          <rect x="84" y="18" width="32" height="58" rx="15" fill={`url(#${g("black")})`} />
          <rect x="74" y="70" width="52" height="26" rx="6" fill={`url(#${g("gold")})`} />
          <rect x="54" y="92" width="92" height="152" rx="22" fill={`url(#${g("amber")})`} />
          <rect x="64" y="100" width="10" height="130" rx="5" fill={`url(#${g("shine")})`} opacity="0.9" />
          <rect x="62" y="138" width="76" height="70" rx="6" fill="#FFF7EC" />
          <text x="100" y="164" textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize="17" fill="#2A160A" letterSpacing="2">NIA</text>
          <text x="100" y="184" textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize="10" fill="#8A4410" letterSpacing="1.5">GLOW SERUM</text>
          <text x="100" y="199" textAnchor="middle" fontFamily={FONT} fontWeight={500} fontSize="8" fill="#8A4410">VITAMIN C 15%</text>
        </g>
      )}
      {kind === "cream" && (
        <g>
          <rect x="34" y="120" width="132" height="120" rx="26" fill={`url(#${g("cream")})`} />
          <rect x="30" y="92" width="140" height="44" rx="16" fill={`url(#${g("gold")})`} />
          <rect x="30" y="126" width="140" height="6" fill="rgba(0,0,0,0.12)" />
          <rect x="44" y="140" width="10" height="90" rx="5" fill={`url(#${g("shine")})`} />
          <text x="100" y="186" textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize="20" fill="#2B2418" letterSpacing="2.5">NIA</text>
          <text x="100" y="206" textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize="10" fill="#8C7B5E" letterSpacing="1.5">SHEA CLOUD</text>
        </g>
      )}
      {kind === "spf" && (
        <g>
          <path d="M60 30 L140 30 L150 188 Q100 200 50 188 Z" fill={`url(#${g("coral")})`} />
          <rect x="56" y="22" width="88" height="14" rx="4" fill="#C9543D" />
          <rect x="54" y="186" width="92" height="58" rx="12" fill="#FFF7F3" />
          <rect x="70" y="40" width="9" height="140" rx="4" fill={`url(#${g("shine")})`} />
          <text x="100" y="98" textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize="18" fill="#FFF3EE" letterSpacing="2">NIA</text>
          <text x="100" y="126" textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize="26" fill="#FFFFFF">SPF 50</text>
          <text x="100" y="146" textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize="9" fill="#FFE3DA" letterSpacing="1.2">DAILY SHIELD</text>
        </g>
      )}
      {kind === "lip" && (
        <g>
          <rect x="80" y="28" width="40" height="80" rx="10" fill={`url(#${g("black")})`} />
          <rect x="72" y="100" width="56" height="144" rx="18" fill={`url(#${g("rose")})`} />
          <rect x="80" y="110" width="8" height="120" rx="4" fill={`url(#${g("shine")})`} />
          <text x="100" y="170" textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize="14" fill="#FFF0F5" letterSpacing="2">NIA</text>
          <text x="100" y="188" textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize="8" fill="#FFD6E4" letterSpacing="1.2">LIP OIL</text>
        </g>
      )}
    </svg>
  );
};
