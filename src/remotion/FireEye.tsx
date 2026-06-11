import React from 'react';
import { useCurrentFrame } from 'remotion';

interface FireEyeProps {
  id: string;
  intensity: number;
  size?: number;
}

export const FireEye: React.FC<FireEyeProps> = ({ id, intensity, size = 110 }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.18;

  const gradId = `fg-${id}`;
  const coreId = `fc-${id}`;
  const glowId = `glow-${id}`;
  const blurId = `fb-${id}`;

  const numFlames = 9;
  const flames = Array.from({ length: numFlames }, (_, i) => {
    const phase = t + i * 0.72;
    const flickX = Math.sin(phase * 1.4 + i) * 8;
    const heightMult = 0.6 + 0.4 * Math.abs(Math.sin(phase * 0.8 + i * 0.5));
    const flameH = (22 + 18 * heightMult) * intensity;
    const flameW = 7 + 4 * Math.sin(phase * 0.6 + i);
    const opacity = (0.55 + 0.45 * Math.sin(phase * 0.6)) * intensity;
    const cx = -20 + (i / (numFlames - 1)) * 40 + flickX;
    return { cx, flameH, flameW, opacity };
  });

  const outerGlowR = (size * 0.65) * (0.85 + 0.15 * Math.sin(t * 0.5)) * intensity;
  const pulseOp = (0.7 + 0.3 * Math.sin(t * 0.9)) * intensity;

  const sparks = Array.from({ length: 10 }, (_, i) => {
    const life = ((frame * 0.12 + i * 0.63) % 1.0);
    const angle = i * 36 + frame * 3;
    const rad = 28 * life;
    const sx = Math.cos((angle * Math.PI) / 180) * rad;
    const sy = -35 * life - Math.abs(Math.sin((angle * Math.PI) / 180)) * 15 * life;
    const sOp = (1 - life) * intensity;
    const sColor = life < 0.3 ? '#ffffff' : life < 0.6 ? '#ffee44' : '#ff6600';
    return { sx, sy, sOp, sColor };
  });

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      {/* Outer glow halo */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: outerGlowR * 2,
          height: outerGlowR * 2,
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(ellipse at 50% 65%, rgba(255,200,30,0.35) 0%, rgba(255,80,0,0.25) 35%, rgba(200,0,0,0.1) 60%, transparent 75%)',
          borderRadius: '50%',
          filter: `blur(${size * 0.08}px)`,
          opacity: pulseOp,
        }}
      />

      <svg
        viewBox="-55 -80 110 90"
        width={size}
        height={size * 0.9}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -55%)',
          overflow: 'visible',
        }}
      >
        <defs>
          <radialGradient id={gradId} cx="50%" cy="75%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="18%" stopColor="#ffffaa" stopOpacity="1" />
            <stop offset="38%" stopColor="#ffcc00" stopOpacity="0.92" />
            <stop offset="62%" stopColor="#ff6600" stopOpacity="0.7" />
            <stop offset="82%" stopColor="#dd1100" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#660000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={coreId} cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#ffff88" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffaa00" stopOpacity="0" />
          </radialGradient>
          <filter id={blurId}>
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Flames layer – blurred */}
        <g filter={`url(#${blurId})`}>
          {flames.map((f, i) => (
            <ellipse
              key={i}
              cx={f.cx}
              cy={-f.flameH * 0.3}
              rx={f.flameW}
              ry={f.flameH}
              fill={`url(#${gradId})`}
              opacity={f.opacity}
            />
          ))}
        </g>

        {/* Core lens glow */}
        <ellipse
          cx="0"
          cy="0"
          rx="22"
          ry="10"
          fill={`url(#${coreId})`}
          opacity={intensity * (0.85 + 0.15 * Math.sin(t * 1.1))}
          filter={`url(#${glowId})`}
        />
      </svg>

      {/* Spark particles */}
      {sparks.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 3.5,
            height: 3.5,
            borderRadius: '50%',
            background: s.sColor,
            transform: `translate(calc(-50% + ${s.sx}px), calc(-50% + ${s.sy}px))`,
            opacity: s.sOp,
            boxShadow: `0 0 5px 2px ${s.sColor}`,
          }}
        />
      ))}
    </div>
  );
};
