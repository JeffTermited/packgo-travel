import Redis from "ioredis";

/**
 * Redis client for BullMQ queue management
 * Supports both local Redis and Upstash Redis (cloud)
 *
 * For Upstash: Set UPSTASH_REDIS_URL environment variable
 * Format: rediss://default:PASSWORD@ENDPOINT:PORT
 */

// Check if Upstash URL is provided (production)
const upstashUrl = process.env.UPSTASH_REDIS_URL;

// Exponential backoff retry: 500ms, 1s, 1.5s ... up to 5s, stop after 10 attempts
const RETRY_STRATEGY = (times: number) => {
  if (times > 10) return null; // Stop retrying after 10 attempts
  return Math.min(times * 500, 5000);
};

// Reconnect on transient network errors
const RECONNECT_ON_ERROR = (err: Error) => {
  const transientErrors = ["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED", "EPIPE"];
  return transientErrors.some((e) => err.message.includes(e));
};

let redis: Redis;

if (upstashUrl) {
  // Upstash Redis connection (TLS enabled)
  console.log("🔗 Connecting to Upstash Redis...");
  redis = new Redis(upstashUrl, {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false, // Required for BullMQ
    tls: {
      rejectUnauthorized: false, // Required for Upstash
    },
    retryStrategy: RETRY_STRATEGY,
    reconnectOnError: RECONNECT_ON_ERROR,
    connectTimeout: 10000,
    commandTimeout: 30000,
    lazyConnect: false,
  });
} else {
  // Local Redis connection (development)
  console.log("🔗 Connecting to local Redis...");
  redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false, // Required for BullMQ
    retryStrategy: RETRY_STRATEGY,
    reconnectOnError: RECONNECT_ON_ERROR,
  });
}

redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  // Only log non-transient errors to reduce noise
  const isTransient = ["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED"].some((e) =>
    err.message.includes(e)
  );
  if (!isTransient) {
    console.error("❌ Redis connection error:", err);
  } else {
    console.warn("⚠️ Redis transient error (will retry):", err.message);
  }
});

redis.on("ready", () => {
  console.log("✅ Redis is ready to accept commands");
});

redis.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

export { redis };
export default redis;
