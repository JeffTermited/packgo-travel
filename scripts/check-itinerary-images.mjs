import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [rows] = await connection.execute(
  'SELECT itineraryDetailed FROM tours WHERE id = 600002'
);

if (rows.length > 0) {
  const itinerary = JSON.parse(rows[0].itineraryDetailed || '[]');
  console.log('每日行程數量:', itinerary.length);
  itinerary.forEach((day, index) => {
    console.log(`\nDAY ${index + 1}: ${day.title}`);
    console.log('  圖片:', day.image || '無');
  });
}

await connection.end();
