import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 載入環境變數
dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// 台灣環島六日行程的詳細每日行程
const detailedItinerary = [
  {
    day: 1,
    title: "台北→日月潭",
    description: "從台北出發，沿途欣賞台灣中部山巒起伏的壯麗景色。抵達埔里後享用國宴級料理，品嚐在地食材的精緻美味。下午前往日月潭，入住湖畔飯店，傍晚可漫步湖邊步道，欣賞夕陽餘暉灑落湖面的絕美景致。",
    accommodation: "力麗哲園飯店-日潭館/月潭館 或 日月潭大飯店 或同級",
    meals: { breakfast: "自理", lunch: "埔里國宴級料理", dinner: "飯店內用" },
    activities: [
      { time: "08:00", location: "台北車站", title: "集合出發", description: "於台北車站東三門集合，搭乘豪華遊覽車出發", transportation: "遊覽車" },
      { time: "12:00", location: "埔里", title: "國宴級午餐", description: "品嚐埔里在地食材烹調的精緻料理，包含筊白筍、紹興酒蛋等特色菜餚", transportation: "遊覽車" },
      { time: "14:30", location: "日月潭", title: "抵達日月潭", description: "入住湖畔飯店，自由活動時間可漫步環湖步道或騎乘自行車", transportation: "遊覽車" },
      { time: "18:00", location: "飯店", title: "晚餐", description: "於飯店內享用精緻晚餐", transportation: "步行" }
    ]
  },
  {
    day: 2,
    title: "日月潭→阿里山",
    description: "清晨搭乘遊船悠遊日月潭，聆聽船長私房導覽，探訪拉魯島與玄光寺。隨後品茗日月潭紅玉紅茶，感受台茶18號的馥郁滋味。午後驅車前往阿里山，途經玉山觀峰景點與塔塔加夫妻神木，感受高山森林的清新氣息。",
    accommodation: "阿里山高峰大飯店 或 阿里山高山青大飯店 或同級",
    meals: { breakfast: "飯店內用", lunch: "日月潭風味餐", dinner: "阿里山風味餐" },
    activities: [
      { time: "07:00", location: "日月潭", title: "遊船體驗", description: "搭乘遊船環湖，船長導覽日月潭的歷史傳說與邵族文化", transportation: "遊船" },
      { time: "09:30", location: "日月潭", title: "紅茶品茗", description: "參觀紅茶莊園，品嚐台茶18號紅玉紅茶的獨特風味", transportation: "遊覽車" },
      { time: "12:00", location: "日月潭", title: "午餐", description: "享用日月潭在地風味餐", transportation: "步行" },
      { time: "13:30", location: "新中橫公路", title: "前往阿里山", description: "沿途欣賞玉山觀峰景點、塔塔加夫妻神木等高山美景", transportation: "遊覽車" },
      { time: "17:00", location: "阿里山", title: "抵達阿里山", description: "入住森林遊樂區內飯店，享受芬多精森林浴", transportation: "遊覽車" }
    ]
  },
  {
    day: 3,
    title: "阿里山→台南→高雄",
    description: "凌晨自行搭乘祝山小火車觀賞日出，欣賞雲海翻騰的壯麗景象。早餐後漫步森林步道，與千年神木來場跨時空邂逅。午後前往台南，品嚐國宴級台南小吃，漫步安平古堡感受百年歷史風華。傍晚抵達高雄，入住港都飯店。",
    accommodation: "城市商旅高雄真愛館 或 城市商旅高雄駁二館 或同級",
    meals: { breakfast: "飯店內用", lunch: "台南小吃國宴餐", dinner: "高雄海鮮餐" },
    activities: [
      { time: "04:30", location: "阿里山", title: "祝山日出", description: "自行搭乘祝山小火車前往觀日平台，欣賞阿里山日出雲海", transportation: "小火車" },
      { time: "07:30", location: "阿里山", title: "森林步道", description: "漫步巨木群棧道，近距離欣賞千年紅檜神木", transportation: "步行" },
      { time: "10:00", location: "阿里山", title: "出發前往台南", description: "告別阿里山，驅車前往府城台南", transportation: "遊覽車" },
      { time: "12:30", location: "台南", title: "國宴級午餐", description: "品嚐度小月擔仔麵、阿霞飯店紅蟳米糕等經典台南美食", transportation: "遊覽車" },
      { time: "14:30", location: "台南", title: "安平古堡", description: "參觀荷蘭時期建造的熱蘭遮城遺址，了解台灣四百年歷史", transportation: "遊覽車" },
      { time: "17:00", location: "高雄", title: "抵達高雄", description: "入住港都飯店，自由活動時間可前往駁二藝術特區", transportation: "遊覽車" }
    ]
  },
  {
    day: 4,
    title: "高雄→藍皮解憂號→太麻里→台東",
    description: "上午前往枋寮車站，搭乘藍皮解憂號觀光列車，穿越南迴鐵路秘境。車窗外太平洋的湛藍緩緩流動，途經加祿站聆聽導覽解說。抵達太麻里後，登上金針山欣賞金針花海在陽光下閃耀的美景。傍晚入住台東市區飯店。",
    accommodation: "台東南豐鐵花棧 或 鮪魚家族飯店 - 台東館 或同級",
    meals: { breakfast: "飯店內用", lunch: "藍皮解憂號便當", dinner: "台東原住民風味餐" },
    activities: [
      { time: "08:00", location: "高雄", title: "出發前往枋寮", description: "搭乘遊覽車前往枋寮火車站", transportation: "遊覽車" },
      { time: "10:00", location: "枋寮", title: "搭乘藍皮解憂號", description: "登上復古藍皮普快車，開啟南迴鐵路秘境之旅", transportation: "火車" },
      { time: "11:00", location: "加祿站", title: "導覽解說", description: "在加祿站短暫停靠，聆聽車長講述南迴鐵路的故事", transportation: "火車" },
      { time: "13:00", location: "太麻里", title: "抵達太麻里", description: "下車後轉乘遊覽車前往金針山", transportation: "遊覽車" },
      { time: "14:00", location: "太麻里", title: "金針山", description: "欣賞滿山遍野的金針花海，拍攝絕美風景照", transportation: "遊覽車" },
      { time: "17:00", location: "台東", title: "入住飯店", description: "抵達台東市區，入住飯店後可自由探索鐵花村夜市", transportation: "遊覽車" }
    ]
  },
  {
    day: 5,
    title: "台東→花蓮",
    description: "上午前往池上，騎乘自行車穿梭伯朗大道，在金黃稻浪間感受東台灣的純粹之美。參觀池上飯包博物館，了解台灣便當文化。午後沿花東縱谷北上，抵達花蓮後入住市區飯店，晚間可自由探索東大門夜市。",
    accommodation: "福容大飯店花蓮 或同級",
    meals: { breakfast: "飯店內用", lunch: "池上便當", dinner: "花蓮海鮮餐" },
    activities: [
      { time: "08:30", location: "台東", title: "出發前往池上", description: "沿台9線北上前往池上鄉", transportation: "遊覽車" },
      { time: "10:00", location: "池上", title: "伯朗大道騎行", description: "租借自行車，穿梭在金城武樹與稻田之間，感受田園風光", transportation: "自行車" },
      { time: "12:00", location: "池上", title: "池上便當", description: "品嚐正宗池上便當，參觀飯包博物館了解便當歷史", transportation: "步行" },
      { time: "13:30", location: "花東縱谷", title: "北上花蓮", description: "沿途欣賞花東縱谷的壯麗山景與田園風光", transportation: "遊覽車" },
      { time: "16:30", location: "花蓮", title: "抵達花蓮", description: "入住市區飯店，自由活動時間可前往東大門夜市", transportation: "遊覽車" }
    ]
  },
  {
    day: 6,
    title: "花蓮→台北",
    description: "上午前往鯉魚潭，欣賞湖光山色的寧靜之美。隨後參觀立川漁場，體驗摸蜆仔的樂趣。午餐後搭乘遊覽車經蘇花改返回台北，沿途欣賞太平洋壯闘的海岸線。傍晚抵達台北車站，結束六天五夜的環島之旅，帶著滿滿回憶返回溫暖的家。",
    accommodation: "溫暖的家",
    meals: { breakfast: "飯店內用", lunch: "花蓮風味餐", dinner: "自理" },
    activities: [
      { time: "08:30", location: "花蓮", title: "鯉魚潭", description: "漫步湖畔步道，欣賞群山環繞的湖光山色", transportation: "遊覽車" },
      { time: "10:00", location: "花蓮", title: "立川漁場", description: "體驗摸蜆仔的樂趣，了解黃金蜆的養殖過程", transportation: "遊覽車" },
      { time: "12:00", location: "花蓮", title: "午餐", description: "享用花蓮在地風味餐", transportation: "步行" },
      { time: "13:30", location: "花蓮", title: "返回台北", description: "搭乘遊覽車經蘇花改返回台北，沿途欣賞太平洋海岸", transportation: "遊覽車" },
      { time: "18:00", location: "台北", title: "抵達台北", description: "抵達台北車站，結束精彩的環島之旅", transportation: "遊覽車" }
    ]
  }
];

async function updateItinerary() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // 查詢台灣環島行程
    const [rows] = await connection.execute(
      'SELECT id, title, itineraryDetailed FROM tours WHERE id = 600002'
    );
    
    if (rows.length === 0) {
      console.log('找不到行程 ID 600002');
      return;
    }
    
    const tour = rows[0];
    console.log('當前行程:', tour.title);
    
    // 更新 itinerary
    await connection.execute(
      'UPDATE tours SET itineraryDetailed = ? WHERE id = 600002',
      [JSON.stringify(detailedItinerary)]
    );
    
    console.log('✅ 每日行程描述已更新');
    console.log('更新內容摘要:');
    detailedItinerary.forEach(day => {
      console.log(`  Day ${day.day}: ${day.title}`);
      console.log(`    描述: ${day.description.substring(0, 50)}...`);
      console.log(`    活動數: ${day.activities.length}`);
    });
    
  } finally {
    await connection.end();
  }
}

updateItinerary().catch(console.error);
