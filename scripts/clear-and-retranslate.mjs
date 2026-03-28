/**
 * Script to clear Redis translation cache for JSON fields and re-translate
 * Run: npx tsx scripts/clear-and-retranslate.mjs
 */
import { config } from 'dotenv';
config();

// Import redis and translation modules
const { redis } = await import('../server/redis.ts');
const { getDb } = await import('../server/db.ts');
const { tours } = await import('../drizzle/schema.ts');

// Wait for Redis to be ready
await new Promise(resolve => setTimeout(resolve, 2000));

console.log('🔑 Clearing Redis translation cache for JSON fields...');

// Get all Redis keys matching translation pattern
const TRANSLATION_CACHE_PREFIX = 'translate:';
let cursor = '0';
let deletedCount = 0;

do {
  const result = await redis.scan(cursor, 'MATCH', `${TRANSLATION_CACHE_PREFIX}zh-TW:en:*`, 'COUNT', 100);
  cursor = result[0];
  const keys = result[1];
  
  if (keys.length > 0) {
    // Check each key to see if it contains JSON (starts with [ or {)
    for (const key of keys) {
      const value = await redis.get(key);
      if (value && (value.includes('```json') || value.includes('```\n'))) {
        await redis.del(key);
        deletedCount++;
        console.log(`  🗑️  Deleted corrupted cache key: ${key.substring(0, 60)}...`);
      }
    }
  }
} while (cursor !== '0');

console.log(`\n✅ Cleared ${deletedCount} corrupted cache entries`);

// Also delete from DB the corrupted entries
const db = await getDb();
if (db) {
  const { translations } = await import('../drizzle/schema.ts');
  const { eq, and, like } = await import('drizzle-orm');
  
  // Delete translations that start with ```json
  const jsonFields = ['keyFeatures', 'itineraryDetailed', 'highlights', 'noticeDetailed'];
  for (const field of jsonFields) {
    const existing = await db.select().from(translations).where(
      and(
        eq(translations.entityType, 'tour'),
        eq(translations.entityId, 1410001),
        eq(translations.fieldName, field),
        eq(translations.targetLanguage, 'en')
      )
    );
    
    for (const row of existing) {
      if (row.translatedText && row.translatedText.startsWith('```')) {
        await db.delete(translations).where(eq(translations.id, row.id));
        console.log(`  🗑️  Deleted corrupted DB translation: ${field}`);
      }
    }
  }
}

console.log('\n🌐 Now re-translating tour 1410001...');

// Re-import translateTour after cache is cleared
const { translateTour } = await import('../server/translation.ts');

const result = await translateTour(1410001, ['en'], 'zh-TW', 630001);
if (result.success) {
  console.log(`✅ Tour #1410001 re-translated to: ${result.translatedLanguages.join(', ')}`);
} else {
  console.log(`❌ Translation failed:`, result.errors);
}

redis.disconnect();
console.log('\n✅ Done!');
process.exit(0);
