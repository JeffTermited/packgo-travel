/**
 * 飯店資料補充腳本
 * 為現有行程添加詳細的飯店資訊和圖片
 */

import { config } from 'dotenv';
config();

import mysql from 'mysql2/promise';

// 巴爾幹七國行程的實際飯店資料
const balkanHotels = [
  {
    name: "Grand Hotel & Spa Primoretz",
    stars: "五星級",
    description: "位於布爾加斯海濱的頂級五星酒店，擁有私人海灘和全方位 SPA 水療中心。酒店設有多間精緻餐廳，提供保加利亞傳統美食與國際料理。客房寬敞明亮，大部分房型可欣賞黑海壯麗景色。",
    facilities: ["wifi", "pool", "spa", "gym", "restaurant", "bar", "parking", "breakfast", "view", "roomservice"],
    location: "布加勒斯特市中心",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    imageAlt: "Grand Hotel & Spa Primoretz - 布加勒斯特五星級酒店"
  },
  {
    name: "Sofia Balkan Palace Hotel",
    stars: "五星級",
    description: "索非亞最具歷史意義的豪華酒店，位於市中心黃金地段，步行即可抵達亞歷山大·涅夫斯基大教堂。酒店融合了古典優雅與現代舒適，提供頂級的住宿體驗與無微不至的服務。",
    facilities: ["wifi", "spa", "gym", "restaurant", "bar", "parking", "breakfast", "roomservice", "concierge"],
    location: "索非亞市中心",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
    imageAlt: "Sofia Balkan Palace Hotel - 索非亞五星級酒店"
  },
  {
    name: "Hilton Garden Inn Tirana",
    stars: "四星級",
    description: "位於地拉那市中心的現代化酒店，鄰近斯坎德培廣場和國家歷史博物館。酒店設計時尚，設施齊全，是探索阿爾巴尼亞首都的理想下榻之選。",
    facilities: ["wifi", "gym", "restaurant", "bar", "parking", "breakfast"],
    location: "地拉那市中心",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    imageAlt: "Hilton Garden Inn Tirana - 地拉那四星級酒店"
  },
  {
    name: "Hotel & Spa Nena",
    stars: "四星級",
    description: "奧赫里德湖畔的精品酒店，擁有絕佳的湖景視野。酒店設有室外泳池和水療中心，是欣賞北馬其頓最美湖泊的完美住所。每間客房都經過精心設計，營造出溫馨舒適的氛圍。",
    facilities: ["wifi", "pool", "spa", "restaurant", "bar", "breakfast", "view"],
    location: "奧赫里德湖畔",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    imageAlt: "Hotel & Spa Nena - 奧赫里德湖畔四星級酒店"
  },
  {
    name: "Mercure Belgrade Excelsior",
    stars: "四星級",
    description: "貝爾格勒市中心的優質酒店，位於克涅茲米哈伊洛娃步行街附近。酒店結合了塞爾維亞傳統熱情與法式優雅服務，是探索這座多瑙河畔城市的理想基地。",
    facilities: ["wifi", "gym", "restaurant", "bar", "parking", "breakfast", "roomservice"],
    location: "貝爾格勒市中心",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
    imageAlt: "Mercure Belgrade Excelsior - 貝爾格勒四星級酒店"
  }
];

// 台灣環島行程的飯店資料
const taiwanHotels = [
  {
    name: "日月潭雲品溫泉酒店",
    stars: "五星級",
    description: "坐落於日月潭畔的頂級溫泉度假酒店，擁有絕美湖景與天然溫泉。酒店設有多種房型，每間客房都能欣賞到日月潭的晨霧美景。SPA 中心提供各式療程，讓您在山水間徹底放鬆身心。",
    facilities: ["wifi", "pool", "spa", "gym", "restaurant", "bar", "parking", "breakfast", "view"],
    location: "南投縣魚池鄉日月潭",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    imageAlt: "日月潭雲品溫泉酒店 - 日月潭五星級酒店"
  },
  {
    name: "阿里山賓館",
    stars: "四星級",
    description: "台灣海拔最高的頂級度假飯店，位於阿里山森林遊樂區內。百年歷史建築融合現代舒適設施，是觀賞阿里山日出雲海的最佳住所。清晨可步行至祝山觀日平台，欣賞壯麗的日出美景。",
    facilities: ["wifi", "restaurant", "parking", "breakfast", "view"],
    location: "嘉義縣阿里山鄉",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
    imageAlt: "阿里山賓館 - 阿里山四星級酒店"
  },
  {
    name: "台東知本老爺酒店",
    stars: "五星級",
    description: "知本溫泉區的頂級度假酒店，擁有天然碳酸氫鈉溫泉。酒店設有多個露天溫泉池和室內 SPA，讓您盡情享受溫泉療癒之旅。餐廳提供在地食材烹調的精緻料理。",
    facilities: ["wifi", "pool", "spa", "gym", "restaurant", "bar", "parking", "breakfast"],
    location: "台東縣卑南鄉知本",
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    imageAlt: "台東知本老爺酒店 - 知本溫泉五星級酒店"
  }
];

async function updateTourHotels(conn: mysql.Connection, tourId: number, hotels: any[]) {
  const hotelsJson = JSON.stringify(hotels);
  await conn.execute(
    'UPDATE tours SET hotels = ? WHERE id = ?',
    [hotelsJson, tourId]
  );
  console.log(`Updated tour ${tourId} with ${hotels.length} hotels`);
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  
  try {
    // 查詢所有行程
    const [rows] = await conn.execute('SELECT id, title FROM tours');
    
    for (const row of rows as any[]) {
      console.log(`\nProcessing tour: ${row.title} (ID: ${row.id})`);
      
      if (row.title.includes('巴爾幹')) {
        await updateTourHotels(conn, row.id, balkanHotels);
      } else if (row.title.includes('環島') || row.title.includes('台灣')) {
        await updateTourHotels(conn, row.id, taiwanHotels);
      } else {
        console.log(`  Skipped - no matching hotel data`);
      }
    }
    
    console.log('\n✅ Hotel data supplement completed!');
  } finally {
    await conn.end();
  }
}

main().catch(console.error);
