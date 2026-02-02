import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 載入環境變數
dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function updateHeroImage() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // 查詢台灣環島行程
    const [rows] = await connection.execute(
      'SELECT id, title, heroImage FROM tours WHERE id = 600002'
    );
    
    if (rows.length === 0) {
      console.log('找不到行程 ID 600002');
      return;
    }
    
    const tour = rows[0];
    console.log('當前行程:', tour.title);
    console.log('當前 heroImage:', tour.heroImage);
    
    // 更新 heroImage 為台灣日月潭照片
    const newHeroImage = '/images/taiwan-sun-moon-lake-hero.jpg';
    
    await connection.execute(
      'UPDATE tours SET heroImage = ?, heroImageAlt = ? WHERE id = 600002',
      [newHeroImage, '日月潭湖光山色，翠綠山巒環繞碧藍湖水']
    );
    
    console.log('✅ Hero 背景圖片已更新');
    console.log('新圖片路徑:', newHeroImage);
    
  } finally {
    await connection.end();
  }
}

updateHeroImage().catch(console.error);
