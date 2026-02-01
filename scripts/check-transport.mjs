import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  const [rows] = await connection.execute(
    'SELECT transportation, category FROM tours WHERE id = 600001'
  );
  
  console.log("transportation:", rows[0].transportation);
  console.log("category:", rows[0].category);
  
  await connection.end();
}

main().catch(console.error);
