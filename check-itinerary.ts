import { drizzle } from 'drizzle-orm/mysql2';
import { tours } from './drizzle/schema';
import { desc } from 'drizzle-orm';

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  const result = await db.select({
    id: tours.id,
    title: tours.title,
    itineraryDetailed: tours.itineraryDetailed,
    dailyItinerary: tours.dailyItinerary
  }).from(tours).orderBy(desc(tours.id)).limit(1);
  
  if (result.length > 0) {
    console.log('ID:', result[0].id);
    console.log('Title:', result[0].title);
    console.log('itineraryDetailed length:', result[0].itineraryDetailed?.length || 0);
    console.log('dailyItinerary length:', result[0].dailyItinerary?.length || 0);
    console.log('itineraryDetailed preview:', result[0].itineraryDetailed?.substring(0, 800));
  }
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
