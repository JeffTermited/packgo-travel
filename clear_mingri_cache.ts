import Redis from 'ioredis';
import * as dotenv from 'dotenv';
dotenv.config();

const upstashUrl = process.env.UPSTASH_REDIS_URL;

let redis: Redis;

if (upstashUrl) {
  console.log("🔗 Connecting to Upstash Redis...");
  redis = new Redis(upstashUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: {
      rejectUnauthorized: false,
    },
  });
} else {
  console.log("🔗 Connecting to local Redis...");
  redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

async function clearMingriCache() {
  // Wait for connection
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const urlHash = 'eb1b0a9618118d7aacd3b5336f05af94'; // MD5 hash of mingri URL
  
  // Try different key patterns
  const patterns = [
    `packgo:full:${urlHash}`,
    `packgo:scrape:${urlHash}`,
    `tour:full:${urlHash}`,
    `tour:scrape:${urlHash}`,
  ];
  
  // Also search for any keys containing the hash
  const allKeys = await redis.keys('*');
  console.log(`Found ${allKeys.length} total keys in Redis`);
  
  // Find and delete keys related to mingri
  const mingriKeys = allKeys.filter(key => 
    key.includes(urlHash) || 
    key.includes('7e1c5937-ac2d-412a-b4ae-edf62f992f27')
  );
  
  console.log(`Found ${mingriKeys.length} keys related to mingri:`);
  for (const key of mingriKeys) {
    console.log(`  - ${key}`);
    await redis.del(key);
    console.log(`    DELETED`);
  }
  
  // Also try to delete by patterns
  for (const pattern of patterns) {
    const result = await redis.del(pattern);
    if (result > 0) {
      console.log(`Deleted: ${pattern}`);
    }
  }
  
  await redis.quit();
  console.log('Done!');
}

clearMingriCache().catch(console.error);
