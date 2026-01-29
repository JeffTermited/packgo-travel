import { getDb } from "./server/db";
import { tours } from "./drizzle/schema";

async function main() {
  const db = await getDb();
  if (!db) {
    console.log("Database not connected");
    process.exit(1);
  }
  
  const allTours = await db.select({
    id: tours.id,
    title: tours.title,
    heroImage: tours.heroImage,
    imageUrl: tours.imageUrl,
  }).from(tours).limit(5);
  
  console.log("Tours with hero images:");
  allTours.forEach(tour => {
    console.log(`\nID: ${tour.id}`);
    console.log(`Title: ${tour.title}`);
    console.log(`heroImage: ${tour.heroImage || 'NULL'}`);
    console.log(`imageUrl: ${tour.imageUrl || 'NULL'}`);
  });
  
  process.exit(0);
}

main();
