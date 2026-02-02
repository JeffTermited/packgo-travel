import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  const [rows] = await connection.execute(
    'SELECT id, title FROM tours LIMIT 10'
  );
  
  console.log("現有行程：");
  rows.forEach(row => {
    console.log(`  ID: ${row.id} - ${row.title}`);
  });
  
  await connection.end();
}

main().catch(console.error);
