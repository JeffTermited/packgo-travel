import { db } from './server/db.js';
import { tours } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

async function main() {
  const result = await db.select({ flights: tours.flights }).from(tours).where(eq(tours.id, 270001));
  console.log('Flights:', result[0]?.flights);
  process.exit(0);
}
main();
