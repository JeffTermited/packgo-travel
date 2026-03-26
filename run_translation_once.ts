import dotenv from 'dotenv';
dotenv.config();
process.env.NODE_ENV = 'development';

async function main() {
  const { translateTour } = await import('./server/translation.ts');
  console.log('[Script] Starting re-translation of tour 1260001...');
  try {
    const result = await translateTour(1260001, ['en'], 'zh-TW', 1);
    console.log('[Script] Result:', JSON.stringify(result, null, 2));
  } catch (e: any) {
    console.error('[Script] Error:', e.message);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
