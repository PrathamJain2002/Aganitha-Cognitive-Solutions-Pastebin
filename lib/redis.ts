import { Redis } from '@upstash/redis';

// Initialize Redis client
// In production, these will come from environment variables
// For local development, you can use Upstash Redis or a local Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export default redis;

