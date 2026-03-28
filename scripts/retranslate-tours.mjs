/**
 * Script to re-translate all tours to English
 * Run: node scripts/retranslate-tours.mjs
 */
import { config } from 'dotenv';
config();

// Dynamic import to use the server-side translation module
const { translateTour } = await import('../server/translation.ts');

const TOUR_IDS = [1410001]; // Add more tour IDs as needed
const TARGET_LANGUAGES = ['en'];
const ADMIN_USER_ID = 630001; // Jeff's admin ID

console.log('🌐 Starting re-translation of tours...');
console.log(`Tours: ${TOUR_IDS.join(', ')}`);
console.log(`Languages: ${TARGET_LANGUAGES.join(', ')}`);

for (const tourId of TOUR_IDS) {
  console.log(`\n📝 Translating tour #${tourId}...`);
  try {
    const result = await translateTour(tourId, TARGET_LANGUAGES, 'zh-TW', ADMIN_USER_ID);
    if (result.success) {
      console.log(`✅ Tour #${tourId} translated to: ${result.translatedLanguages.join(', ')}`);
    } else {
      console.log(`❌ Tour #${tourId} translation failed:`, result.errors);
    }
  } catch (error) {
    console.error(`❌ Error translating tour #${tourId}:`, error.message);
  }
}

console.log('\n✅ Re-translation complete!');
process.exit(0);
