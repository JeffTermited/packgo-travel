import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// 為行程 600002 的 keyFeatures 添加圖片
const [tours] = await connection.execute('SELECT id, keyFeatures FROM tours WHERE id = 600002');

if (tours.length > 0) {
  const tour = tours[0];
  let keyFeatures = [];
  
  try {
    keyFeatures = JSON.parse(tour.keyFeatures || '[]');
  } catch (e) {
    console.log('無法解析 keyFeatures');
  }
  
  // 為每個 feature 添加圖片 URL
  const featureImages = [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', // 日月潭遊船
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', // 阿里山森林
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800', // 森林浴
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800', // 紅茶
    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800', // 南迴鐵路
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', // 池上稻田
    'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800', // 台南古蹟
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', // 太魯閣
  ];
  
  const updatedFeatures = keyFeatures.map((feature, index) => {
    if (typeof feature === 'string') {
      return {
        title: feature,
        image: featureImages[index % featureImages.length]
      };
    } else {
      return {
        ...feature,
        image: feature.image || featureImages[index % featureImages.length]
      };
    }
  });
  
  await connection.execute(
    'UPDATE tours SET keyFeatures = ? WHERE id = 600002',
    [JSON.stringify(updatedFeatures)]
  );
  
  console.log('已更新 keyFeatures:', JSON.stringify(updatedFeatures, null, 2));
}

await connection.end();
