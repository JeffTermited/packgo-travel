import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  const [rows] = await connection.execute(
    'SELECT id, title, colorTheme, destinationCountry FROM tours WHERE id = 600001'
  );
  
  const tour = rows[0];
  console.log("=== Tour Color Theme ===");
  console.log("colorTheme:", tour?.colorTheme);
  console.log("destinationCountry:", tour?.destinationCountry);
  
  await connection.end();
}

main().catch(console.error);
