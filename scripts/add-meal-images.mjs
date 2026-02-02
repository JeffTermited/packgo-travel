import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// 查詢現有的 itineraryDetailed
const [rows] = await conn.execute(
  "SELECT itineraryDetailed FROM tours WHERE id = 600002"
);

const itinerary = JSON.parse(rows[0].itineraryDetailed);

// 為每日行程添加餐廳圖片
const mealImages = {
  // Day 1
  "埔里國宴級料理": [
    "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=400", // 台灣料理
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400", // 精緻餐點
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400"  // 美食擺盤
  ],
  // Day 2
  "日月潭風味餐": [
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400", // 湖畔餐廳
    "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400"  // 風味料理
  ],
  "阿里山風味餐": [
    "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400", // 山產料理
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400"  // 在地美食
  ],
  // Day 3
  "奮起湖便當": [
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400", // 鐵路便當
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"  // 便當美食
  ],
  "台南小吃巡禮": [
    "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400", // 台南小吃
    "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400", // 夜市美食
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400"  // 街頭小吃
  ],
  // Day 4
  "墾丁海鮮大餐": [
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400", // 海鮮料理
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400", // 新鮮海產
    "https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=400"  // 海鮮拼盤
  ],
  // Day 5
  "池上便當": [
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400", // 池上米飯
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400"  // 便當料理
  ],
  "原住民風味餐": [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400", // 原民料理
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400"  // 特色美食
  ],
  // Day 6
  "九份芋圓": [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", // 芋圓甜品
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400"  // 台灣甜點
  ]
};

// 更新每日行程的餐食圖片
itinerary.forEach((day, index) => {
  if (day.meals) {
    // 午餐圖片
    if (day.meals.lunch && mealImages[day.meals.lunch]) {
      day.meals.lunchImages = mealImages[day.meals.lunch];
    }
    // 晚餐圖片
    if (day.meals.dinner && mealImages[day.meals.dinner]) {
      day.meals.dinnerImages = mealImages[day.meals.dinner];
    }
    // 早餐通常是飯店內用或自理，不需要圖片
  }
});

// 更新資料庫
await conn.execute(
  "UPDATE tours SET itineraryDetailed = ? WHERE id = 600002",
  [JSON.stringify(itinerary)]
);

console.log("餐廳圖片資料已添加完成！");
console.log("Day 1 meals:", JSON.stringify(itinerary[0]?.meals, null, 2));
console.log("Day 2 meals:", JSON.stringify(itinerary[1]?.meals, null, 2));

await conn.end();
