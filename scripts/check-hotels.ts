import { config } from 'dotenv';
config();

import mysql from 'mysql2/promise';

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  const [rows] = await conn.execute('SELECT id, title, hotels FROM tours WHERE id = 600001');
  
  if ((rows as any[]).length > 0) {
    const row = (rows as any[])[0];
    console.log('Tour ID:', row.id);
    console.log('Title:', row.title);
    console.log('Hotels JSON:', row.hotels ? row.hotels.substring(0, 500) : 'NULL');
    
    if (row.hotels) {
      try {
        const hotels = JSON.parse(row.hotels);
        console.log('\nParsed Hotels:');
        console.log(JSON.stringify(hotels, null, 2));
      } catch (e: any) {
        console.log('Failed to parse hotels JSON:', e.message);
      }
    }
  }
  
  await conn.end();
}

main().catch(console.error);
