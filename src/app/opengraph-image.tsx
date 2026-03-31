import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Explore Community Apps — Playlab';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          Explore Community Apps
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            marginTop: 20,
            textAlign: 'center',
          }}
        >
          AI-powered tools built by educators, for their own classrooms and communities
        </div>
        <div
          style={{
            fontSize: 22,
            color: '#f59e0b',
            marginTop: 40,
            fontWeight: 600,
          }}
        >
          playlab.ai
        </div>
      </div>
    ),
    { ...size }
  );
}
