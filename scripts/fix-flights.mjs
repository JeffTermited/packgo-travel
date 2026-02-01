import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  // 更新 flights 欄位，改為飛機交通
  const correctFlights = JSON.stringify({
    type: "FLIGHT",
    typeName: "飛機",
    airline: "土耳其航空",
    outbound: {
      time: "22:55",
      duration: "約12小時"
    },
    inbound: {
      time: "21:30",
      duration: "約12小時"
    },
    features: ["經濟艙", "含行李托運", "機上餐食"]
  });
  
  await connection.execute(
    'UPDATE tours SET flights = ? WHERE id = 600001',
    [correctFlights]
  );
  
  console.log("✅ 已修正 flights 為飛機交通");
  
  // 驗證更新
  const [rows] = await connection.execute(
    'SELECT flights FROM tours WHERE id = 600001'
  );
  console.log("更新後的 flights:", rows[0].flights);
  
  await connection.end();
}

main().catch(console.error);
