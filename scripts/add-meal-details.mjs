import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// 餐廳詳情資料
const mealDetails = {
  "埔里國宴級料理": {
    name: "埔里國宴級料理",
    description: "位於埔里鎮的知名餐廳，以在地食材烹調精緻台菜聞名。主廚曾多次為國宴掌廚，將埔里特產如紹興酒、香菇、筊白筍等融入創意料理中，呈現台灣中部山城的獨特風味。",
    address: "南投縣埔里鎮中山路三段123號",
    phone: "049-298-1234",
    menu: ["紹興醉雞", "香菇燉雞", "筊白筍沙拉", "埔里米粉", "百香果鮮蝦"],
    rating: 4.7,
    priceRange: "NT$500-800/人"
  },
  "日月潭風味餐": {
    name: "日月潭風味餐",
    description: "坐落於日月潭畔的景觀餐廳，可一邊用餐一邊欣賞湖光山色。餐廳主打邵族傳統料理與創意台菜，使用當地新鮮食材，特別推薦總統魚和山豬肉料理。",
    address: "南投縣魚池鄉水社村中山路599號",
    phone: "049-285-5678",
    menu: ["總統魚", "山豬肉香腸", "紅茶茶葉蛋", "日月潭蝦", "原住民風味野菜"],
    rating: 4.5,
    priceRange: "NT$400-700/人"
  },
  "阿里山風味餐": {
    name: "阿里山風味餐",
    description: "位於阿里山森林遊樂區內的特色餐廳，提供鄒族原住民風味料理。使用高山蔬菜和在地食材，搭配獨特的原住民烹調方式，讓您品嚐最道地的山林美食。",
    address: "嘉義縣阿里山鄉中正村59號",
    phone: "05-267-9012",
    menu: ["竹筒飯", "烤山豬肉", "高山野菜", "愛玉凍", "小米酒"],
    rating: 4.3,
    priceRange: "NT$350-600/人"
  },
  "池上便當": {
    name: "池上飯包博物館",
    description: "池上便當的發源地，傳承超過60年的便當文化。使用池上米煮成的飯粒粒分明、香Q彈牙，搭配滷肉、滷蛋、酸菜等傳統配菜，是台灣鐵路便當的經典代表。",
    address: "台東縣池上鄉忠孝路259號",
    phone: "089-862-326",
    menu: ["招牌池上便當", "素食便當", "升級版便當", "池上米冰淇淋"],
    rating: 4.6,
    priceRange: "NT$80-150/份"
  }
};

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // 獲取現有行程資料
  const [rows] = await conn.query('SELECT id, itineraryDetailed FROM tours WHERE id = 600002');
  if (rows.length === 0) {
    console.log('Tour not found');
    await conn.end();
    return;
  }
  
  const itinerary = JSON.parse(rows[0].itineraryDetailed || '[]');
  
  // 為每天的餐食添加詳情
  itinerary.forEach((day, index) => {
    if (day.meals) {
      // 午餐詳情
      if (day.meals.lunch && mealDetails[day.meals.lunch]) {
        day.meals.lunchDetail = {
          ...mealDetails[day.meals.lunch],
          images: day.meals.lunchImages || []
        };
      }
      // 晚餐詳情
      if (day.meals.dinner && mealDetails[day.meals.dinner]) {
        day.meals.dinnerDetail = {
          ...mealDetails[day.meals.dinner],
          images: day.meals.dinnerImages || []
        };
      }
      // 早餐詳情（如果有特色早餐）
      if (day.meals.breakfast && mealDetails[day.meals.breakfast]) {
        day.meals.breakfastDetail = {
          ...mealDetails[day.meals.breakfast],
          images: day.meals.breakfastImages || []
        };
      }
    }
  });
  
  // 更新資料庫
  await conn.query(
    'UPDATE tours SET itineraryDetailed = ? WHERE id = 600002',
    [JSON.stringify(itinerary)]
  );
  
  console.log('Meal details added successfully!');
  console.log('Updated itinerary day 1 meals:', JSON.stringify(itinerary[0].meals, null, 2));
  
  await conn.end();
}

main().catch(console.error);
