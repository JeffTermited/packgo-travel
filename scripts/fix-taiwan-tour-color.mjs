import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 載入環境變數
dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function fixColorTheme() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // 查詢台灣環島行程的 colorTheme
    const [rows] = await connection.execute(
      'SELECT id, title, colorTheme FROM tours WHERE id = 600002'
    );
    
    if (rows.length === 0) {
      console.log('找不到行程 ID 600002');
      return;
    }
    
    const tour = rows[0];
    console.log('當前行程:', tour.title);
    console.log('當前 colorTheme:', tour.colorTheme);
    
    // 解析 colorTheme
    let colorTheme;
    try {
      colorTheme = JSON.parse(tour.colorTheme);
    } catch (e) {
      console.log('colorTheme 解析失敗，使用預設值');
      colorTheme = {
        primary: '#C5D82D',
        secondary: '#F5F5F5',
        accent: '#1A1A1A',
        background: '#FFFFFF'
      };
    }
    
    console.log('解析後的 colorTheme:', colorTheme);
    
    // 修復 secondary 顏色（從灰色改為藍色）
    colorTheme.secondary = '#2563EB';
    
    console.log('修復後的 colorTheme:', colorTheme);
    
    // 更新資料庫
    await connection.execute(
      'UPDATE tours SET colorTheme = ? WHERE id = 600002',
      [JSON.stringify(colorTheme)]
    );
    
    console.log('✅ colorTheme.secondary 已修復為 #2563EB');
    
  } finally {
    await connection.end();
  }
}

fixColorTheme().catch(console.error);
