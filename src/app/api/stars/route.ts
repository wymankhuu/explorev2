import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { success } = await rateLimit(`stars-get:${ip}`, 60, 60);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const ids = request.nextUrl.searchParams.get('ids');
    if (!ids) return NextResponse.json({});

    const appIds = ids.split(',').slice(0, 100);
    const pipeline = redis.pipeline();
    for (const id of appIds) {
      pipeline.get(`stars:${id}`);
    }
    const results = await pipeline.exec();

    const counts: Record<string, number> = {};
    appIds.forEach((id, i) => {
      counts[id] = parseInt(results[i] as string) || 0;
    });

    return NextResponse.json(counts);
  } catch (err) {
    console.error('Stars error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { success } = await rateLimit(`stars-post:${ip}`, 30, 60);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { appId, action } = body || {};

    if (!appId || typeof appId !== 'string') {
      return NextResponse.json({ error: 'appId required' }, { status: 400 });
    }

    const key = `stars:${appId}`;
    let count: number;

    if (action === 'unstar') {
      count = await redis.decr(key);
      if (count < 0) {
        await redis.set(key, 0);
        count = 0;
      }
    } else {
      count = await redis.incr(key);
    }

    return NextResponse.json({ appId, count });
  } catch (err) {
    console.error('Star error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
