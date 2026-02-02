import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 載入環境變數
dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// 完整的注意事項內容
const noticeDetailed = {
  preparation: [
    "準備輕便衣物和防曬用品，台灣四季溫暖濕潤，紫外線強烈",
    "攜帶雨具或防水外套，台灣降雨頻繁，特別是山區如阿里山",
    "準備舒適登山鞋，多個景點涉及山區步道如日月潭、阿里山",
    "帶備常用藥物和防蚊液，山區蚊蟲較多，高山地區溫度較低",
    "建議攜帶薄外套，阿里山海拔較高，早晚溫差大",
    "準備泳衣，部分飯店設有溫泉或游泳池設施"
  ],
  documents: [
    "請攜帶有效身分證件（身分證或護照），入住飯店時需出示",
    "外籍旅客請確認簽證效期，並攜帶護照正本",
    "建議攜帶健保卡，以備不時之需",
    "如有優待票資格（敬老、學生等），請攜帶相關證明文件",
    "團體保險已包含在費用中，如需加保請於出發前告知"
  ],
  healthSafety: [
    "阿里山海拔約 2,200 公尺，如有高山症病史請事先告知",
    "行程包含多處步道健行，請評估自身體力狀況",
    "藍皮解憂號為復古列車，車廂無空調，請注意防曬補水",
    "部分景點需步行較長距離，建議穿著舒適鞋子",
    "如有特殊飲食需求（素食、過敏等），請於報名時告知",
    "山區手機訊號可能不穩定，請提前告知家人行程安排"
  ],
  emergency: [
    "緊急聯絡電話：旅行社 24 小時服務專線 02-2345-6789",
    "台灣緊急救援電話：110（警察）、119（消防/救護）",
    "旅遊諮詢專線：0800-011-765（交通部觀光局）",
    "領隊手機號碼將於出發前一天以簡訊通知",
    "如遇緊急狀況，請立即聯繫領隊或撥打緊急電話"
  ]
};

async function updateNotice() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // 查詢台灣環島行程
    const [rows] = await connection.execute(
      'SELECT id, title, noticeDetailed FROM tours WHERE id = 600002'
    );
    
    if (rows.length === 0) {
      console.log('找不到行程 ID 600002');
      return;
    }
    
    const tour = rows[0];
    console.log('當前行程:', tour.title);
    console.log('當前 noticeDetailed:', tour.noticeDetailed ? '有資料' : '無資料');
    
    // 更新 noticeDetailed
    await connection.execute(
      'UPDATE tours SET noticeDetailed = ? WHERE id = 600002',
      [JSON.stringify(noticeDetailed)]
    );
    
    console.log('✅ 注意事項已更新');
    console.log('更新內容摘要:');
    console.log(`  行前準備: ${noticeDetailed.preparation.length} 項`);
    console.log(`  證件需求: ${noticeDetailed.documents.length} 項`);
    console.log(`  健康須知: ${noticeDetailed.healthSafety.length} 項`);
    console.log(`  緊急聯絡: ${noticeDetailed.emergency.length} 項`);
    
  } finally {
    await connection.end();
  }
}

updateNotice().catch(console.error);
