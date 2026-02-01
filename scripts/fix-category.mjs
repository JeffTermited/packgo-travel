import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  // 更新類別標籤為 "group"（團體旅遊）
  await connection.execute(
    'UPDATE tours SET category = ? WHERE id = 600001',
    ['group']
  );
  
  console.log("✅ 已修正類別標籤為 'group'（團體旅遊）");
  
  // 驗證更新
  const [rows] = await connection.execute(
    'SELECT category FROM tours WHERE id = 600001'
  );
  console.log("更新後的 category:", rows[0].category);
  
  await connection.end();
}

main().catch(console.error);
