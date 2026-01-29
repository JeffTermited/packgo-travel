import { db } from "./server/db";
import { tours } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  const tour = await db.select({
    id: tours.id,
    costExplanation: tours.costExplanation
  }).from(tours).where(eq(tours.id, 210009)).limit(1);
  
  if (tour.length > 0) {
    console.log("costExplanation:", tour[0].costExplanation);
    if (tour[0].costExplanation) {
      try {
        const parsed = JSON.parse(tour[0].costExplanation);
        console.log("\nParsed:", JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log("Parse error:", e);
      }
    }
  }
  process.exit(0);
}
main();
