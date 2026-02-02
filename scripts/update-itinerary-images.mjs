import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// 更符合台灣環島行程主題的圖片
const dayImages = [
  // DAY 1: 台北→日月潭 - 日月潭湖景
  'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&q=80',
  // DAY 2: 日月潭→阿里山 - 阿里山雲海/森林
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  // DAY 3: 阿里山→台南→高雄 - 台南古蹟/廟宇
  'https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=800&q=80',
  // DAY 4: 高雄→藍皮解憂號→太麻里→台東 - 太平洋海岸/火車
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  // DAY 5: 台東→花蓮 - 花東縱谷/稻田
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  // DAY 6: 花蓮→台北 - 太魯閣峽谷/山景
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
];

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// 查詢現有的 itineraryDetailed
const [rows] = await connection.execute(
  'SELECT itineraryDetailed FROM tours WHERE id = 600002'
);

if (rows.length > 0) {
  const itinerary = JSON.parse(rows[0].itineraryDetailed || '[]');
  
  // 更新每天的圖片
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
  
  console.log('✅ 已更新 6 天行程圖片為更符合主題的圖片');
  
  // 驗證更新
  itinerary.forEach((day, index) => {
    console.log(`DAY ${index + 1}: ${day.title}`);
    console.log(`  圖片: ${day.image.substring(0, 50)}...`);
  });
}

await connection.end();
