import { nanoid } from 'nanoid';
import redis from './redis';
import type { Paste, GetPasteResponse } from './types';

const PASTE_PREFIX = 'paste:';
const PASTE_TTL_PREFIX = 'paste_ttl:';

/**
 * Get current time in milliseconds, respecting TEST_MODE
 */
export function getCurrentTimeMs(headers: Headers): number {
  const testMode = process.env.TEST_MODE === '1';
  if (testMode) {
    const testNowMs = headers.get('x-test-now-ms');
    if (testNowMs) {
      return parseInt(testNowMs, 10);
    }
  }
  return Date.now();
}

/**
 * Create a new paste
 */
export async function createPaste(
  content: string,
  ttlSeconds?: number,
  maxViews?: number
): Promise<string> {
  const id = nanoid(12);
  const now = Date.now();
  
  const paste: Paste = {
    id,
    content,
    createdAt: now,
    ttlSeconds,
    maxViews,
    currentViews: 0,
  };

  const key = `${PASTE_PREFIX}${id}`;
  
  // Store the paste
  await redis.set(key, JSON.stringify(paste));
  
  // If TTL is set, also store a TTL key for quick expiry checks
  if (ttlSeconds) {
    const expiresAt = now + ttlSeconds * 1000;
    await redis.set(`${PASTE_TTL_PREFIX}${id}`, expiresAt.toString());
  }

  return id;
}

/**
 * Get a paste by ID, checking constraints
 */
export async function getPaste(
  id: string,
  headers: Headers
): Promise<GetPasteResponse | null> {
  const key = `${PASTE_PREFIX}${id}`;
  const pasteData = await redis.get(key);

  if (!pasteData) {
    return null;
  }

  // Handle both string and object responses from Redis
  const paste: Paste = typeof pasteData === 'string' 
    ? JSON.parse(pasteData) 
    : pasteData as Paste;
  const now = getCurrentTimeMs(headers);

  // Check TTL expiry
  if (paste.ttlSeconds) {
    const expiresAt = paste.createdAt + paste.ttlSeconds * 1000;
    if (now >= expiresAt) {
      // Paste has expired, delete it
      await redis.del(key);
      await redis.del(`${PASTE_TTL_PREFIX}${id}`);
      return null;
    }
  }

  // Check view limit
  if (paste.maxViews !== undefined && paste.currentViews >= paste.maxViews) {
    // View limit exceeded, delete the paste
    await redis.del(key);
    await redis.del(`${PASTE_TTL_PREFIX}${id}`);
    return null;
  }

  // Increment view count
  paste.currentViews += 1;
  await redis.set(key, JSON.stringify(paste));

  // Check again after incrementing (in case we just hit the limit)
  if (paste.maxViews !== undefined && paste.currentViews > paste.maxViews) {
    await redis.del(key);
    await redis.del(`${PASTE_TTL_PREFIX}${id}`);
    return null;
  }

  // Calculate remaining views
  const remainingViews =
    paste.maxViews !== undefined
      ? Math.max(0, paste.maxViews - paste.currentViews)
      : null;

  // Calculate expires_at
  const expiresAt = paste.ttlSeconds
    ? new Date(paste.createdAt + paste.ttlSeconds * 1000).toISOString()
    : null;

  return {
    content: paste.content,
    remaining_views: remainingViews,
    expires_at: expiresAt,
  };
}

/**
 * Get paste content only (for HTML view, also increments views)
 */
export async function getPasteContent(
  id: string,
  headers: Headers
): Promise<string | null> {
  const key = `${PASTE_PREFIX}${id}`;
  const pasteData = await redis.get(key);

  if (!pasteData) {
    return null;
  }

  // Handle both string and object responses from Redis
  const paste: Paste = typeof pasteData === 'string' 
    ? JSON.parse(pasteData) 
    : pasteData as Paste;
  const now = getCurrentTimeMs(headers);

  // Check TTL expiry
  if (paste.ttlSeconds) {
    const expiresAt = paste.createdAt + paste.ttlSeconds * 1000;
    if (now >= expiresAt) {
      await redis.del(key);
      await redis.del(`${PASTE_TTL_PREFIX}${id}`);
      return null;
    }
  }

  // Check view limit
  if (paste.maxViews !== undefined && paste.currentViews >= paste.maxViews) {
    await redis.del(key);
    await redis.del(`${PASTE_TTL_PREFIX}${id}`);
    return null;
  }

  // Increment view count (HTML views also count)
  paste.currentViews += 1;
  await redis.set(key, JSON.stringify(paste));

  // Check again after incrementing (in case we just hit the limit)
  if (paste.maxViews !== undefined && paste.currentViews > paste.maxViews) {
    await redis.del(key);
    await redis.del(`${PASTE_TTL_PREFIX}${id}`);
    return null;
  }

  return paste.content;
}

