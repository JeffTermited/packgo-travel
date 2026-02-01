import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  const [rows] = await connection.execute(
    'SELECT flights, category FROM tours WHERE id = 600001'
  );
  
  console.log("flights:", rows[0].flights);
  console.log("category:", rows[0].category);
  
  await connection.end();
}

main().catch(console.error);
