import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 飯店詳情資料
const hotelDetails = {
  "日月潭雲品溫泉酒店": {
    description: "坐落於日月潭畔的頂級溫泉度假酒店，擁有絕美湖景與天然溫泉。酒店設有多種房型，每間客房都能欣賞到日月潭的晨霧美景。SPA 中心提供各式療程，讓您在山水間徹底放鬆身心。",
    address: "南投縣魚池鄉中正路23號",
    phone: "049-285-6788",
    website: "https://www.fleurdechinehotel.com",
    checkIn: "15:00",
    checkOut: "11:00",
    rating: 4.7,
    totalReviews: 2847,
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"
    ],
    roomTypes: [
      {
        name: "經典湖景雙人房",
        description: "32坪，一大床或兩小床，含早餐，可欣賞日月潭湖景",
        price: "已含在團費",
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400"
      },
      {
        name: "豪華湖景套房",
        description: "45坪，獨立客廳、私人陽台、景觀浴缸",
        price: "+NT$3,500/晚",
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400"
      },
      {
        name: "總統套房",
        description: "80坪，獨立起居室、私人溫泉池、專屬管家服務",
        price: "+NT$12,000/晚",
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400"
      }
    ],
    amenities: ["wifi", "pool", "spa", "gym", "restaurant", "bar", "parking", "breakfast", "view", "concierge", "laundry"],
    reviews: [
      {
        author: "王小明",
        rating: 5,
        comment: "房間超大，湖景美到不行！早餐種類豐富，服務人員態度親切。溫泉設施很棒，推薦一定要去體驗。",
        date: "2025-12-15"
      },
      {
        author: "陳美玲",
        rating: 5,
        comment: "第三次入住了，每次都很滿意。清晨在陽台看日月潭晨霧，真的太美了。SPA 療程也很舒服。",
        date: "2025-11-28"
      },
      {
        author: "林志偉",
        rating: 4,
        comment: "整體很棒，唯一缺點是假日人比較多。建議平日來比較能享受寧靜的氛圍。",
        date: "2025-10-20"
      }
    ]
  },
  "阿里山賓館": {
    description: "台灣海拔最高的頂級度假飯店，位於阿里山森林遊樂區內。百年歷史建築融合現代舒適設施，是觀賞阿里山日出雲海的最佳住所。清晨可步行至祝山觀日平台，欣賞壯麗的日出美景。",
    address: "嘉義縣阿里山鄉香林村16號",
    phone: "05-267-9811",
    website: "https://www.alishanhouse.com.tw",
    checkIn: "15:00",
    checkOut: "10:30",
    rating: 4.5,
    totalReviews: 1523,
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"
    ],
    roomTypes: [
      {
        name: "標準山景雙人房",
        description: "28坪，一大床或兩小床，含早餐，山林景觀",
        price: "已含在團費",
        image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=400"
      },
      {
        name: "檜木套房",
        description: "35坪，全檜木裝潢、獨立客廳、森林景觀",
        price: "+NT$2,500/晚",
        image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400"
      }
    ],
    amenities: ["wifi", "restaurant", "parking", "breakfast", "view", "concierge"],
    reviews: [
      {
        author: "張雅婷",
        rating: 5,
        comment: "住在這裡看日出超方便！走路5分鐘就到觀日平台。房間雖然不大但很溫馨，有暖氣很重要。",
        date: "2025-12-01"
      },
      {
        author: "李建宏",
        rating: 4,
        comment: "歷史悠久的飯店，很有味道。早餐不錯，位置絕佳。就是設施比較老舊一些。",
        date: "2025-11-15"
      }
    ]
  },
  "台東知本老爺酒店": {
    description: "知本溫泉區的頂級度假酒店，擁有天然碳酸氫鈉溫泉。酒店設有多個露天溫泉池和室內 SPA，讓您盡情享受溫泉療癒之旅。餐廳提供在地食材烹調的精緻料理。",
    address: "台東縣卑南鄉龍泉路113巷23號",
    phone: "089-510-666",
    website: "https://www.hotelroyal.com.tw/zhiben",
    checkIn: "15:00",
    checkOut: "11:00",
    rating: 4.6,
    totalReviews: 1892,
    images: [
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800"
    ],
    roomTypes: [
      {
        name: "精緻雙人房",
        description: "30坪，一大床或兩小床，含早餐、溫泉設施使用",
        price: "已含在團費",
        image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400"
      },
      {
        name: "溫泉套房",
        description: "42坪，房內私人溫泉池、獨立客廳",
        price: "+NT$4,000/晚",
        image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400"
      },
      {
        name: "Villa 獨棟別墅",
        description: "100坪，獨立庭院、私人溫泉池、專屬管家",
        price: "+NT$15,000/晚",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400"
      }
    ],
    amenities: ["wifi", "pool", "spa", "gym", "restaurant", "bar", "parking", "breakfast", "laundry"],
    reviews: [
      {
        author: "黃淑芬",
        rating: 5,
        comment: "溫泉超讚！泡完皮膚滑溜溜的。露天溫泉池很多種，可以泡一整天。早餐也很豐盛。",
        date: "2025-12-10"
      },
      {
        author: "吳明德",
        rating: 5,
        comment: "環境清幽，服務一流。SPA 按摩很專業，整個人都放鬆了。下次還會再來。",
        date: "2025-11-22"
      },
      {
        author: "蔡佳琪",
        rating: 4,
        comment: "很棒的度假酒店，就是離市區比較遠。不過酒店內設施很完善，不出門也沒問題。",
        date: "2025-10-30"
      }
    ]
  }
};

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  // 查詢現有行程的飯店資料
  const [rows] = await connection.execute(
    'SELECT id, hotels FROM tours WHERE id = 600002'
  );
  
  if (rows.length === 0) {
    console.log('找不到行程 600002');
    await connection.end();
    return;
  }
  
  const tour = rows[0];
  let hotels = [];
  
  try {
    hotels = JSON.parse(tour.hotels || '[]');
  } catch (e) {
    console.log('解析飯店資料失敗:', e);
    await connection.end();
    return;
  }
  
  // 為每個飯店添加詳情資料
  const updatedHotels = hotels.map(hotel => {
    const detail = hotelDetails[hotel.name];
    if (detail) {
      return {
        ...hotel,
        detail: detail
      };
    }
    return hotel;
  });
  
  // 更新資料庫
  await connection.execute(
    'UPDATE tours SET hotels = ? WHERE id = ?',
    [JSON.stringify(updatedHotels), tour.id]
  );
  
  console.log('已更新飯店詳情資料');
  console.log('更新的飯店數量:', updatedHotels.filter(h => h.detail).length);
  
  await connection.end();
}

main().catch(console.error);
