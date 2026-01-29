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
  });
} else {
  // Local Redis connection (development)
  console.log("🔗 Connecting to local Redis...");
  redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false, // Required for BullMQ
  });
}

redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

redis.on("ready", () => {
  console.log("✅ Redis is ready to accept commands");
});

export { redis };
export default redis;
