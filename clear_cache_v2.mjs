import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
});

async function clearCache() {
  // 清除所有 packgo 相關的快取
  const keys = await redis.keys('packgo:*');
  console.log('Found keys:', keys.length);
  
  for (const key of keys) {
    await redis.del(key);
    console.log('Deleted:', key);
  }
  
  console.log('Cache cleared!');
  process.exit(0);
}

clearCache();
