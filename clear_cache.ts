import Redis from "ioredis";

const redis = new Redis(process.env.UPSTASH_REDIS_URL || "");

async function clearCache() {
  try {
    // 獲取所有 packgo: 開頭的快取鍵
    const keys = await redis.keys("packgo:*");
    console.log(`Found ${keys.length} cache keys`);
    
    if (keys.length > 0) {
      for (const key of keys) {
        await redis.del(key);
        console.log(`Deleted: ${key}`);
      }
    }
    
    // 也清除 LLM 快取
    const llmKeys = await redis.keys("llm:cache:*");
    console.log(`Found ${llmKeys.length} LLM cache keys`);
    
    // 只清除前 10 個 LLM 快取以避免太久
    const keysToDelete = llmKeys.slice(0, 10);
    for (const key of keysToDelete) {
      await redis.del(key);
      console.log(`Deleted LLM cache: ${key.substring(0, 50)}...`);
    }
    
    console.log("Cache cleared successfully!");
  } catch (error) {
    console.error("Error clearing cache:", error);
  } finally {
    await redis.quit();
    process.exit(0);
  }
}

clearCache();
