'use client';
import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { FireEye } from './FireEye';

// ─── Timeline constants (30 fps, 450 frames = 15 s) ───────────────────────────
const ENTER_END = 28;
const REVEAL_END = 85;
const FACE_ZOOM_START = 85;
const FACE_ZOOM_END = 118;
const FIRE_START = 118;
const FIRE_PEAK = 160;
const FIRE_END = 210;
const BEAT_DROP = 210;
const BEAT_END = 240;
const SLOWMO_END = 315;
const SECOND_ZOOM_START = 315;
const SECOND_ZOOM_END = 355;
const OUTRO_START = 390;
const TOTAL = 450;

// Eye positions as % of the image container (calibrated to the photo)
const LEFT_EYE_X = 37;
const RIGHT_EYE_X = 57;
const EYE_Y = 19.5;
const EYE_SIZE_BASE = 120; // px at 1× zoom

// ─── Sub-components ────────────────────────────────────────────────────────────

const Vignette: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill
    style={{
      background:
        'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.72) 100%)',
      opacity,
      pointerEvents: 'none',
    }}
  />
);

const ColorGrade: React.FC<{ intensity: number; warmth?: number }> = ({
  intensity,
  warmth = 1,
}) => (
  <>
    {/* Orange warmth in shadows */}
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at 50% 80%, rgba(255,110,20,0.18) 0%, transparent 65%)',
        mixBlendMode: 'overlay',
        opacity: intensity * warmth,
        pointerEvents: 'none',
      }}
    />
    {/* Teal in highlights */}
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at 50% 20%, rgba(0,200,220,0.10) 0%, transparent 55%)',
        mixBlendMode: 'screen',
        opacity: intensity,
        pointerEvents: 'none',
      }}
    />
  </>
);

const GlitchLayer: React.FC<{ intensity: number; imageSrc: string }> = ({
  intensity,
  imageSrc,
}) => {
  if (intensity < 0.02) return null;
  return (
    <>
      {/* Red channel shift right */}
      <AbsoluteFill
        style={{
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateX(${intensity * 18}px)`,
          mixBlendMode: 'screen',
          opacity: intensity * 0.45,
          filter: 'saturate(0) sepia(1) hue-rotate(-20deg) saturate(4)',
          pointerEvents: 'none',
        }}
      />
      {/* Cyan channel shift left */}
      <AbsoluteFill
        style={{
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateX(${-intensity * 18}px)`,
          mixBlendMode: 'screen',
          opacity: intensity * 0.4,
          filter: 'saturate(0) sepia(1) hue-rotate(160deg) saturate(4)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

const FlashOverlay: React.FC<{ opacity: number; color?: string }> = ({
  opacity,
  color = '#ffffff',
}) => (
  <AbsoluteFill
    style={{
      background: color,
      opacity,
      pointerEvents: 'none',
    }}
  />
);

const EnergyLines: React.FC<{ intensity: number; frame: number }> = ({
  intensity,
  frame,
}) => {
  if (intensity < 0.05) return null;
  const lines = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30 + frame * 2;
    const length = (60 + 30 * Math.sin(frame * 0.2 + i)) * intensity;
    const opacity = (0.3 + 0.4 * Math.sin(frame * 0.25 + i * 0.8)) * intensity;
    return { angle, length, opacity };
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920">
        {lines.map((l, i) => {
          const cx = 540;
          const cy = 960;
          const rad = (l.angle * Math.PI) / 180;
          const x2 = cx + Math.cos(rad) * l.length * 6;
          const y2 = cy + Math.sin(rad) * l.length * 8;
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke={`hsl(${30 + i * 15}, 100%, 70%)`}
              strokeWidth={1.5}
              opacity={l.opacity}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const TikTokCaption: React.FC<{
  text: string;
  opacity: number;
  y?: string;
  size?: number;
}> = ({ text, opacity, y = '85%', size = 68 }) => (
  <AbsoluteFill
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: y,
      pointerEvents: 'none',
      opacity,
    }}
  >
    <div
      style={{
        fontFamily:
          "'Arial Black', 'Impact', 'Franklin Gothic Heavy', sans-serif",
        fontSize: size,
        fontWeight: 900,
        color: '#ffffff',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 3,
        textShadow:
          '4px 4px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 0 6px 20px rgba(255,100,0,0.8)',
        lineHeight: 1.1,
        padding: '0 40px',
      }}
    >
      {text}
    </div>
  </AbsoluteFill>
);

// ─── Main composition ──────────────────────────────────────────────────────────

export const TikTokEdit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imageSrc = '/subject.jpg';

  // ── Phase 1: Dramatic entrance ─────────────────────────────────────────────
  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.7 },
    durationInFrames: ENTER_END,
  });
  const enterScale = interpolate(enterProgress, [0, 1], [1.85, 1.0]);
  const enterOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const enterBrightness = interpolate(frame, [0, 8], [2.8, 1], {
    extrapolateRight: 'clamp',
  });

  // ── Phase 2: Reveal subtle zoom 1.0 → 1.08 ────────────────────────────────
  const revealZoom = interpolate(frame, [ENTER_END, REVEAL_END], [1.0, 1.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // ── Phase 3: Face zoom (spring punch) ─────────────────────────────────────
  const faceZoomProgress = spring({
    frame: frame - FACE_ZOOM_START,
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.5 },
    durationInFrames: FACE_ZOOM_END - FACE_ZOOM_START,
  });
  const FACE_SCALE = 2.65;
  const faceScale = interpolate(faceZoomProgress, [0, 1], [1.08, FACE_SCALE]);

  // Translate Y to bring face into frame center when zoomed
  // Face at y=19.5% of 1920 = 374.4px from top = -585.6px from center (960px)
  // After scale(2.65): -585.6 * 2.65 = -1551.8px from center
  // Need +1551.8px translateY to center face
  const faceTranslateY = interpolate(faceZoomProgress, [0, 1], [0, 1500]);

  // ── Phase 4: Fire eyes ─────────────────────────────────────────────────────
  const fireIntensity = interpolate(
    frame,
    [FIRE_START, FIRE_PEAK, FIRE_END, FIRE_END + 20],
    [0, 1, 1, 0.55],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const firePulseScale = frame >= FIRE_START
    ? FACE_SCALE + 0.08 * Math.sin((frame - FIRE_START) * 0.12)
    : FACE_SCALE;

  const fireGlow = interpolate(
    frame,
    [FIRE_START, FIRE_PEAK],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // ── Phase 5: Beat drop (frame 210) ────────────────────────────────────────
  const beatFlash = interpolate(
    frame,
    [BEAT_DROP, BEAT_DROP + 5, BEAT_DROP + 14],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const pullBackProgress = spring({
    frame: frame - BEAT_DROP,
    fps,
    config: { damping: 11, stiffness: 260, mass: 0.4 },
    durationInFrames: 30,
  });
  const pullBackScale = frame >= BEAT_DROP
    ? interpolate(pullBackProgress, [0, 1], [firePulseScale, 1.0])
    : 1.0;
  const pullBackTranslateY = frame >= BEAT_DROP
    ? interpolate(pullBackProgress, [0, 1], [faceTranslateY, 0])
    : 0;

  const shakeIntensity = interpolate(
    frame,
    [BEAT_DROP, BEAT_DROP + 16],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const shakeX = Math.sin(frame * 41) * 14 * shakeIntensity;
  const shakeY = Math.sin(frame * 67) * 9 * shakeIntensity;

  // ── Phase 6: Full body beat sequence 1.0 → 1.22 ───────────────────────────
  const fullBodyZoom = interpolate(
    frame,
    [BEAT_END, SLOWMO_END],
    [1.0, 1.22],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  // ── Phase 7: Second close-up ───────────────────────────────────────────────
  const secondZoomProgress = spring({
    frame: frame - SECOND_ZOOM_START,
    fps,
    config: { damping: 13, stiffness: 200, mass: 0.6 },
    durationInFrames: SECOND_ZOOM_END - SECOND_ZOOM_START,
  });
  const SECOND_SCALE = 2.4;
  const secondScale = frame >= SECOND_ZOOM_START
    ? interpolate(secondZoomProgress, [0, 1], [1.22, SECOND_SCALE])
    : 1.22;
  const secondTranslateY = frame >= SECOND_ZOOM_START
    ? interpolate(secondZoomProgress, [0, 1], [0, 1350])
    : 0;

  // Fire intensity in second close-up
  const fire2Intensity = interpolate(
    frame,
    [SECOND_ZOOM_START + 10, SECOND_ZOOM_END, OUTRO_START - 20, OUTRO_START],
    [0, 0.9, 0.9, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // ── Phase 8: Outro fade ────────────────────────────────────────────────────
  const outroOpacity = interpolate(
    frame,
    [OUTRO_START, TOTAL],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const outroScale = interpolate(
    frame,
    [OUTRO_START, TOTAL],
    [0, 0.35],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // ── Chromatic aberration ───────────────────────────────────────────────────
  const chromaIntensity =
    frame >= SECOND_ZOOM_END
      ? interpolate(
          frame,
          [SECOND_ZOOM_END, SECOND_ZOOM_END + 30, OUTRO_START],
          [0, 0.9, 0.4],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        )
      : 0;

  // ── Resolve active transform ───────────────────────────────────────────────
  let activeScale: number;
  let activeTranslateY: number;
  let effectiveFireIntensity: number;

  if (frame < ENTER_END) {
    activeScale = enterScale;
    activeTranslateY = 0;
    effectiveFireIntensity = 0;
  } else if (frame < FACE_ZOOM_START) {
    activeScale = revealZoom;
    activeTranslateY = 0;
    effectiveFireIntensity = 0;
  } else if (frame < BEAT_DROP) {
    activeScale = faceScale > firePulseScale ? faceScale : firePulseScale;
    activeTranslateY = faceTranslateY;
    effectiveFireIntensity = fireIntensity;
  } else if (frame < BEAT_END) {
    activeScale = pullBackScale;
    activeTranslateY = pullBackTranslateY;
    effectiveFireIntensity = fireIntensity * 0.4;
  } else if (frame < SECOND_ZOOM_START) {
    activeScale = fullBodyZoom;
    activeTranslateY = 0;
    effectiveFireIntensity = 0;
  } else {
    activeScale = secondScale + outroScale;
    activeTranslateY = secondTranslateY;
    effectiveFireIntensity = fire2Intensity;
  }

  // ── Global filter ──────────────────────────────────────────────────────────
  const contrastBoost = interpolate(frame, [ENTER_END, REVEAL_END], [1, 1.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const saturation = frame >= BEAT_DROP && frame < SLOWMO_END
    ? interpolate(frame, [BEAT_DROP, SLOWMO_END], [0.55, 0.7], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0.88;

  const vignetteOpacity = interpolate(frame, [ENTER_END, REVEAL_END], [0, 0.88], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const colorGradeIntensity = interpolate(frame, [ENTER_END, REVEAL_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Orange fire screen tint when fire is active
  const fireTintOpacity = effectiveFireIntensity * 0.12;
  // "Slow-mo" desaturated haze
  const slowMoHaze = frame >= BEAT_DROP && frame < SLOWMO_END
    ? interpolate(frame, [BEAT_DROP, BEAT_END, SLOWMO_END - 20, SLOWMO_END], [0, 0.35, 0.35, 0])
    : 0;

  // Caption visibility
  const showCaption1 =
    frame >= REVEAL_END && frame < FACE_ZOOM_START
      ? interpolate(frame, [REVEAL_END, REVEAL_END + 12], [0, 1], {
          extrapolateRight: 'clamp',
        })
      : frame >= FACE_ZOOM_START
      ? interpolate(frame, [FACE_ZOOM_START, FACE_ZOOM_START + 8], [1, 0], {
          extrapolateRight: 'clamp',
        })
      : 0;

  const showCaption2 =
    frame >= BEAT_END + 10 && frame < SLOWMO_END
      ? interpolate(frame, [BEAT_END + 10, BEAT_END + 22], [0, 1], {
          extrapolateRight: 'clamp',
        })
      : frame >= SLOWMO_END
      ? interpolate(frame, [SLOWMO_END, SLOWMO_END + 10], [1, 0], {
          extrapolateRight: 'clamp',
        })
      : 0;

  const showCaption3 =
    frame >= OUTRO_START - 30
      ? interpolate(frame, [OUTRO_START - 30, OUTRO_START - 18], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }) * outroOpacity
      : 0;

  const energyLinesIntensity =
    frame >= BEAT_DROP && frame < BEAT_DROP + 35
      ? interpolate(frame, [BEAT_DROP, BEAT_DROP + 8, BEAT_DROP + 35], [0, 0.7, 0])
      : 0;

  return (
    <AbsoluteFill
      style={{
        background: '#000',
        overflow: 'hidden',
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* ── Image + fire eyes inside one transformed container ── */}
      <AbsoluteFill
        style={{
          transform: `translateY(${activeTranslateY}px) scale(${activeScale})`,
          transformOrigin: 'center center',
          filter: `contrast(${contrastBoost}) saturate(${saturation}) brightness(${enterBrightness})`,
          opacity: enterOpacity,
        }}
      >
        {/* Subject photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt="subject"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block',
          }}
          onError={(e) => {
            // Show styled placeholder when image is missing
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.placeholder-msg')) {
              const p = document.createElement('div');
              p.className = 'placeholder-msg';
              Object.assign(p.style, {
                width: '100%', height: '100%', background: '#111',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontFamily: 'Arial',
                fontSize: '28px', textAlign: 'center', gap: '16px',
              });
              p.innerHTML = '<div style="font-size:64px">🔥</div><div>Add your photo to</div><code style="color:#ff9900;font-size:22px">public/subject.jpg</code>';
              parent.appendChild(p);
            }
          }}
        />

        {/* Fire eyes – positioned inside container so they scale with image */}
        {effectiveFireIntensity > 0.03 && (
          <>
            <div
              style={{
                position: 'absolute',
                top: `${EYE_Y}%`,
                left: `${LEFT_EYE_X}%`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            >
              <FireEye id="L" intensity={effectiveFireIntensity} size={EYE_SIZE_BASE} />
            </div>
            <div
              style={{
                position: 'absolute',
                top: `${EYE_Y}%`,
                left: `${RIGHT_EYE_X}%`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            >
              <FireEye id="R" intensity={effectiveFireIntensity} size={EYE_SIZE_BASE} />
            </div>
          </>
        )}
      </AbsoluteFill>

      {/* ── Post-process layers (not affected by image transform) ── */}

      {/* Chromatic aberration */}
      <GlitchLayer intensity={chromaIntensity} imageSrc={imageSrc} />

      {/* Orange fire tint */}
      {fireTintOpacity > 0 && (
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(ellipse at 50% 20%, rgba(255,90,0,0.45) 0%, transparent 60%)',
            opacity: fireTintOpacity,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Slow-mo haze overlay */}
      {slowMoHaze > 0 && (
        <AbsoluteFill
          style={{
            background: 'rgba(180,210,240,0.18)',
            backdropFilter: 'blur(1px)',
            opacity: slowMoHaze,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Color grade */}
      <ColorGrade
        intensity={colorGradeIntensity}
        warmth={frame >= FIRE_START && frame < SLOWMO_END ? 1.4 : 1}
      />

      {/* Vignette */}
      <Vignette opacity={vignetteOpacity} />

      {/* Energy lines at beat drop */}
      <EnergyLines intensity={energyLinesIntensity} frame={frame} />

      {/* Beat drop white flash */}
      <FlashOverlay opacity={beatFlash} />

      {/* Fire glow edge vignette */}
      {fireGlow > 0.05 && (
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(ellipse at 50% 25%, transparent 30%, rgba(255,60,0,0.22) 65%, rgba(180,0,0,0.35) 100%)',
            opacity: fireGlow * (0.8 + 0.2 * Math.sin(frame * 0.18)),
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Cinematic bars (top + bottom) */}
      {frame >= FACE_ZOOM_START && frame < BEAT_DROP && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: interpolate(
                frame,
                [FACE_ZOOM_START, FACE_ZOOM_END],
                [0, 80],
                { extrapolateRight: 'clamp' }
              ),
              background: '#000',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: interpolate(
                frame,
                [FACE_ZOOM_START, FACE_ZOOM_END],
                [0, 80],
                { extrapolateRight: 'clamp' }
              ),
              background: '#000',
            }}
          />
        </>
      )}

      {/* ── Captions ── */}
      <TikTokCaption text="No Cap 🔥" opacity={showCaption1} y="82%" size={72} />
      <TikTokCaption
        text="🎬 Slow Mo Era"
        opacity={showCaption2}
        y="84%"
        size={64}
      />
      <TikTokCaption
        text="DRIP DETECTED 🔥🔥"
        opacity={showCaption3}
        y="80%"
        size={66}
      />

      {/* TikTok-style watermark */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          padding: '40px 32px',
          pointerEvents: 'none',
          opacity: interpolate(frame, [ENTER_END, REVEAL_END], [0, 0.6], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <div
          style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: 26,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: 2,
            textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
          }}
        >
          @QuickbizAI
        </div>
      </AbsoluteFill>

      {/* Outro fade */}
      {frame >= OUTRO_START && (
        <AbsoluteFill
          style={{
            background: '#000',
            opacity: interpolate(frame, [OUTRO_START, TOTAL], [0, 1], {
              extrapolateRight: 'clamp',
              easing: Easing.in(Easing.quad),
            }),
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  );
};
