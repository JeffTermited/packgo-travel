import dotenv from 'dotenv';
dotenv.config();

import { getDb } from './server/db.ts';
import { sql } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  const result = await db.execute(sql`
    SELECT fieldName, targetLanguage, LEFT(translatedText, 100) as value_preview 
    FROM translations 
    WHERE entityType = 'tour' AND entityId = 1260001 AND targetLanguage = 'en'
    ORDER BY fieldName
  `);
  console.log('Translation fields for tour 1260001 (en):');
  console.log(JSON.stringify(result[0], null, 2));
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
