'use client';
import React, { useRef, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { TikTokEdit } from '@/remotion/TikTokEdit';

const DURATION = 450;
const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

export default function TikTokPlayer() {
  const playerRef = useRef<PlayerRef>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlayPause = () => {
    const ref = playerRef.current;
    if (!ref) return;
    if (playing) {
      ref.pause();
      setPlaying(false);
    } else {
      ref.play();
      setPlaying(true);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      {/* TikTok phone frame */}
      <div
        style={{
          position: 'relative',
          width: 320,
          height: 568,
          borderRadius: 32,
          overflow: 'hidden',
          boxShadow:
            '0 0 0 3px #222, 0 0 0 5px #444, 0 20px 80px rgba(255,100,0,0.3), 0 0 120px rgba(255,60,0,0.15)',
        }}
      >
        <Player
          ref={playerRef}
          component={TikTokEdit}
          durationInFrames={DURATION}
          fps={FPS}
          compositionWidth={WIDTH}
          compositionHeight={HEIGHT}
          style={{
            width: '100%',
            height: '100%',
          }}
          controls={false}
          loop
          autoPlay
          clickToPlay={false}
        />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={handlePlayPause}
          style={{
            padding: '10px 32px',
            borderRadius: 24,
            border: 'none',
            background: 'linear-gradient(135deg, #ff6600, #ff2200)',
            color: '#fff',
            fontFamily: "'Arial Black', sans-serif",
            fontWeight: 900,
            fontSize: 14,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: 2,
            boxShadow: '0 4px 20px rgba(255,80,0,0.5)',
          }}
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          onClick={() => {
            playerRef.current?.seekTo(0);
            playerRef.current?.play();
            setPlaying(true);
          }}
          style={{
            padding: '10px 24px',
            borderRadius: 24,
            border: '2px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: '#fff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          ↺ Replay
        </button>
      </div>

      {/* Progress scrubber */}
      <input
        type="range"
        min={0}
        max={DURATION - 1}
        defaultValue={0}
        style={{ width: 320, accentColor: '#ff6600' }}
        onChange={(e) => {
          playerRef.current?.seekTo(Number(e.target.value));
        }}
      />
    </div>
  );
}
