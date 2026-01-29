import { db } from './server/db.js';
import { tours } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

const result = await db.select({ flights: tours.flights }).from(tours).where(eq(tours.id, 270001));
console.log('Flights:', JSON.stringify(JSON.parse(result[0]?.flights || '{}'), null, 2));
process.exit(0);
