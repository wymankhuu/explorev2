import { ImageResponse } from 'next/og';
import { getAllData } from '@/lib/notion';
import { getCollectionDisplayName } from '@/lib/utils';

export const runtime = 'edge';
export const alt = 'Collection — Playlab Explore';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { collections } = await getAllData();
  const collection = collections.find((c) => c.id === id);

  const name = collection ? getCollectionDisplayName(collection.name) : 'Collection';
  const count = collection?.appCount || 0;
  const desc = collection?.description?.slice(0, 120) || '';

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
        }}
      >
        <div style={{ fontSize: 20, color: '#f59e0b', fontWeight: 600, marginBottom: 16 }}>
          Playlab Explore
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 12 }}>
          {name}
        </div>
        <div style={{ fontSize: 24, color: '#64748b', marginBottom: 16 }}>
          {count} {count === 1 ? 'app' : 'apps'}
        </div>
        {desc && (
          <div style={{ fontSize: 22, color: '#94a3b8', lineHeight: 1.5, maxWidth: 900 }}>
            {desc}{desc.length >= 120 ? '...' : ''}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
