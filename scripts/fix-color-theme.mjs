import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  // 修復 colorTheme - secondary 應該是強調色而不是淺灰色
  const correctColorTheme = JSON.stringify({
    primary: "#1E3A5F",      // 深藍（歐洲主題）
    secondary: "#2563EB",    // 亮藍（強調色）
    accent: "#3B82F6",       // 藍色
    light: "#EFF6FF",        // 淺藍背景
    text: "#2C3E50",
    textLight: "#7F8C8D",
    background: "#F8F9FA",
    backgroundDark: "#E9ECEF"
  });
  
  // 更新資料庫
  await connection.execute(
    'UPDATE tours SET colorTheme = ? WHERE id = 600001',
    [correctColorTheme]
  );
  
  console.log("✅ 已修復 colorTheme");
  
  // 驗證更新
  const [rows] = await connection.execute(
    'SELECT colorTheme FROM tours WHERE id = 600001'
  );
  console.log("\n=== 更新後的 colorTheme ===");
  console.log(rows[0].colorTheme);
  
  await connection.end();
}

main().catch(console.error);
