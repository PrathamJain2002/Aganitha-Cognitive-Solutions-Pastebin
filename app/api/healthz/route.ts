import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // Test Redis connection
    await redis.ping();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    // If Redis is not accessible, return ok: false
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

