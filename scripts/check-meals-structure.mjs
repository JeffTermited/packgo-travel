import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute(
  "SELECT itineraryDetailed FROM tours WHERE id = 600002"
);
const itinerary = JSON.parse(rows[0].itineraryDetailed);
console.log("Day 1 meals structure:", JSON.stringify(itinerary[0]?.meals, null, 2));
console.log("Day 2 meals structure:", JSON.stringify(itinerary[1]?.meals, null, 2));
await conn.end();
