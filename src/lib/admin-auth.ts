import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from './rate-limit';
import redis from './redis';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/**
 * Verify admin password with brute-force protection.
 * Returns null if auth succeeds, or a NextResponse error to return early.
 */
export async function verifyAdmin(
  request: NextRequest,
  password: string | undefined
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const failKey = `admin-fail:${ip}`;

  // Check if IP is locked out (5 failed attempts in 15 minutes)
  const failCount = parseInt((await redis.get(failKey)) as string) || 0;
  if (failCount >= 5) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again later.' },
      { status: 429 }
    );
  }

  if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
    // Increment failure counter
    const newCount = await redis.incr(failKey);
    if (newCount === 1) {
      await redis.expire(failKey, 900); // 15 minute window
    }
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  // Auth succeeded — reset failure counter for this IP
  await redis.del(failKey);
  return null;
}
