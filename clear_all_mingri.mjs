import Redis from "ioredis";
import crypto from "crypto";

// 鳴日號行程 URL
const url = 'https://travel.liontravel.com/detail?NormGroupID=7e1c5937-ac2d-412a-b4ae-edf62f992f27&Platform=APP&GroupID=26TR213FU2-T';

// 計算 URL hash
const hash = crypto.createHash('md5').update(url).digest('hex');
console.log('URL:', url);
console.log('Hash:', hash);

// 連接 Upstash Redis
const upstashUrl = process.env.UPSTASH_REDIS_URL;
if (!upstashUrl) {
  console.error('UPSTASH_REDIS_URL not set');
  process.exit(1);
}

console.log('Connecting to Upstash Redis...');
const redis = new Redis(upstashUrl, {
  maxRetriesPerRequest: 3,
  tls: {
    rejectUnauthorized: false,
  },
});

// 等待連接
await new Promise(resolve => setTimeout(resolve, 1000));

// 列出所有 packgo: 開頭的 key
console.log('\nListing all packgo:* keys...');
const allKeys = await redis.keys('packgo:*');
console.log(`Found ${allKeys.length} keys:`);
for (const key of allKeys) {
  console.log(`  - ${key}`);
}

// 清除所有包含 hash 的 key
console.log('\nClearing keys containing hash...');
for (const key of allKeys) {
  if (key.includes(hash)) {
    const result = await redis.del(key);
    console.log(`  DELETED: ${key}`);
  }
}

// 再次確認
console.log('\nVerifying deletion...');
const remainingKeys = await redis.keys(`*${hash}*`);
console.log(`Remaining keys with hash: ${remainingKeys.length}`);

console.log('\nCache cleared!');
await redis.quit();
process.exit(0);
