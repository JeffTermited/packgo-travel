import redis from "./redis";

/**
 * Rate limiter using Redis
 * Implements sliding window algorithm
 */
export interface RateLimitConfig {
  key: string; // Unique identifier (e.g., userId, IP)
  limit: number; // Max requests
  window: number; // Time window in seconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp
}

/**
 * Check if request is within rate limit
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const { key, limit, window } = config;
  const now = Date.now();
  const windowStart = now - window * 1000;
  
  // Redis key for this rate limit
  const redisKey = `ratelimit:${key}`;
  
  // Remove old entries outside the window
  await redis.zremrangebyscore(redisKey, 0, windowStart);
  
  // Count requests in current window
  const count = await redis.zcard(redisKey);
  
  if (count >= limit) {
    // Rate limit exceeded
    const oldestEntry = await redis.zrange(redisKey, 0, 0, "WITHSCORES");
    const resetAt = oldestEntry.length > 1 
      ? parseInt(oldestEntry[1]) + window * 1000 
      : now + window * 1000;
    
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }
  
  // Add current request
  await redis.zadd(redisKey, now, `${now}-${Math.random()}`);
  
  // Set expiry to clean up old keys
  await redis.expire(redisKey, window);
  
  return {
    allowed: true,
    remaining: limit - count - 1,
    resetAt: now + window * 1000,
  };
}

/**
 * Rate limit middleware for tour generation
 * Limit: 5 requests per hour per user
 */
export async function checkTourGenerationRateLimit(userId: number): Promise<RateLimitResult> {
  return checkRateLimit({
    key: `tour-generation:user:${userId}`,
    limit: 5, // 5 requests
    window: 3600, // per hour
  });
}

/**
 * Rate limit middleware for image generation
 * Limit: 20 requests per hour per user
 */
export async function checkImageGenerationRateLimit(userId: number): Promise<RateLimitResult> {
  return checkRateLimit({
    key: `image-generation:user:${userId}`,
    limit: 20, // 20 requests
    window: 3600, // per hour
  });
}
