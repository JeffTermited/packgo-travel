import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 載入環境變數
dotenv.config({ path: join(__dirname, '..', '.env') });

async function fixTrainName() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // 查詢台灣環島行程的 flights 欄位
    const [rows] = await connection.execute(
      'SELECT id, title, flights FROM tours WHERE id = 600002'
    );
    
    if (rows.length === 0) {
      console.log('找不到行程 600002');
      return;
    }
    
    const tour = rows[0];
    console.log('當前 flights 資料:', tour.flights);
    
    // 解析 flights JSON - 可能是物件或陣列
    let flights = JSON.parse(tour.flights || '{}');
    
    // 修正火車名稱為藍皮解憂號
    if (Array.isArray(flights)) {
      flights = flights.map(f => ({
        ...f,
        typeName: '藍皮解憂號'
      }));
    } else {
      // 如果是物件，直接修改
      flights = {
        ...flights,
        typeName: '藍皮解憂號'
      };
    }
    
    // 更新資料庫
    await connection.execute(
      'UPDATE tours SET flights = ? WHERE id = 600002',
      [JSON.stringify(flights)]
    );
    
    console.log('✅ 火車名稱已修正為「藍皮解憂號」');
    console.log('更新後的 flights:', JSON.stringify(flights, null, 2));
    
  } catch (error) {
    console.error('錯誤:', error);
  } finally {
    await connection.end();
  }
}

fixTrainName();
