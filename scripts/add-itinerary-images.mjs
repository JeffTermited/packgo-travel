import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// 台灣景點圖片 - 使用 Unsplash 高品質圖片
const dayImages = [
  // DAY 1: 台北→日月潭
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80', // 日月潭
  // DAY 2: 日月潭→阿里山
  'https://images.unsplash.com/photo-1544627053-4a0b5c1e6f2a?w=800&q=80', // 阿里山雲海
  // DAY 3: 阿里山→台南→高雄
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', // 台南古蹟
  // DAY 4: 高雄→藍皮解憂號→太麻里→台東
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', // 太平洋海岸
  // DAY 5: 台東→花蓮
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80', // 花東縱谷
  // DAY 6: 花蓮→台北
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80', // 山景
];

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// 查詢現有的 itineraryDetailed
const [rows] = await connection.execute(
  'SELECT itineraryDetailed FROM tours WHERE id = 600002'
);

if (rows.length > 0) {
  const itinerary = JSON.parse(rows[0].itineraryDetailed || '[]');
  
  // 為每天添加圖片
  itinerary.forEach((day, index) => {
    if (index < dayImages.length) {
      day.image = dayImages[index];
    }
  });
  
  // 更新資料庫
  await connection.execute(
    'UPDATE tours SET itineraryDetailed = ? WHERE id = 600002',
    [JSON.stringify(itinerary)]
  );
  
  console.log('✅ 已為 6 天行程添加圖片');
  
  // 驗證更新
  itinerary.forEach((day, index) => {
    console.log(`DAY ${index + 1}: ${day.title}`);
    console.log(`  圖片: ${day.image ? '✓' : '✗'}`);
  });
}

await connection.end();
