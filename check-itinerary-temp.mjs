import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await conn.execute('SELECT itineraryDetailed FROM tours WHERE id = 600001');
  if (rows[0] && rows[0].itineraryDetailed) {
    const data = JSON.parse(rows[0].itineraryDetailed);
    console.log('Total days:', data.length);
    if (data[0]) {
      console.log('Day 1 keys:', Object.keys(data[0]));
      console.log('Has image:', !!data[0].image);
    }
  } else {
    console.log('No itineraryDetailed found');
  }
  await conn.end();
}
main().catch(console.error);
