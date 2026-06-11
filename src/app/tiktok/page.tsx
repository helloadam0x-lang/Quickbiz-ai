'use client';
import dynamic from 'next/dynamic';

const TikTokPlayer = dynamic(() => import('@/components/TikTokPlayer'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
      }}
    >
      Loading TikTok Edit...
    </div>
  ),
});

export default function TikTokPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        gap: '24px',
      }}
    >
      <div
        style={{
          fontFamily: "'Arial Black', Impact, sans-serif",
          fontSize: 28,
          fontWeight: 900,
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: 4,
          textShadow: '0 0 30px rgba(255,100,0,0.7)',
        }}
      >
        🔥 TikTok Viral Edit
      </div>

      <TikTokPlayer />

      <div
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: 13,
          color: 'rgba(255,255,255,0.45)',
          textAlign: 'center',
          maxWidth: 380,
          lineHeight: 1.6,
        }}
      >
        Built with Remotion · 1080×1920 · 30fps · 15s
        <br />
        Place your photo at <code style={{ color: '#ff9900' }}>public/subject.jpg</code> to use your own image
      </div>
    </main>
  );
}
