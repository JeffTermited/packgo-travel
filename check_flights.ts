import { getDb } from "./server/db";
import { tours } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function checkFlights() {
  const db = await getDb();
  if (!db) {
    console.log("Database not available");
    process.exit(1);
  }
  const tour = await db.select({ flights: tours.flights }).from(tours).where(eq(tours.id, 210009));
  console.log("Flights field content:");
  const flightsData = tour[0]?.flights;
  if (flightsData) {
    console.log(JSON.stringify(JSON.parse(flightsData), null, 2));
  } else {
    console.log("No flights data");
  }
  process.exit(0);
}

checkFlights();
