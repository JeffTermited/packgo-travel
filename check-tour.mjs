import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  const [rows] = await connection.execute(
    'SELECT id, title, keyFeatures, noticeDetailed, destinationCity FROM tours WHERE id = 600001'
  );
  
  const tour = rows[0];
  console.log("=== Tour Data ===");
  console.log("ID:", tour?.id);
  console.log("Title:", tour?.title);
  console.log("\n=== keyFeatures ===");
  console.log(tour?.keyFeatures);
  console.log("\n=== noticeDetailed ===");
  console.log(tour?.noticeDetailed);
  console.log("\n=== destinationCity ===");
  console.log(tour?.destinationCity);
  
  await connection.end();
}

main().catch(console.error);
