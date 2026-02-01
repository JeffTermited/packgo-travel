import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  // 修復 noticeDetailed 資料格式
  const correctNoticeDetailed = JSON.stringify({
    preparation: [
      "辦理申根簽證或相關巴爾幹國家簽證，提前確認護照有效期至少6個月以上",
      "兌換歐元或當地貨幣，部分地區仍使用現金，建議攜帶信用卡和現金混合",
      "預訂住宿和交通工具，旺季（6-9月）房源緊張，提前規劃行程",
      "準備舒適登山鞋和輕便衣物，應對山區和海邊多變天氣"
    ],
    documents: [
      "有效護照（效期至少6個月以上）",
      "申根簽證或相關國家簽證",
      "旅遊保險證明",
      "機票訂位確認單",
      "飯店訂房確認單"
    ],
    health: [
      "飲用瓶裝水，避免飲用自來水，預防腸胃不適",
      "購買旅遊保險涵蓋醫療費用，偏遠地區醫療設施有限",
      "防曬和蚊蟲叮咬，攜帶防曬霜和驅蚊液，特別是湖區地帶",
      "避免深夜獨自外出，貴重物品妥善保管，防止扒竊"
    ],
    terms: [
      "報名後需於3日內繳交訂金，餘款於出發前30日繳清",
      "出發前30日取消，扣除訂金；出發前15日取消，扣除團費50%",
      "出發前7日內取消，恕不退費",
      "因天候、政治因素等不可抗力導致行程變更，本公司保留調整權利",
      "團體機票一經開票，不得更改、退票或轉讓"
    ]
  });
  
  // 精簡 destinationCity
  const simplifiedDestinationCity = "黑山共和國、阿爾巴尼亞、北馬其頓、科索沃、保加利亞、羅馬尼亞、塞爾維亞";
  
  // 更新資料庫
  await connection.execute(
    'UPDATE tours SET noticeDetailed = ?, destinationCity = ? WHERE id = 600001',
    [correctNoticeDetailed, simplifiedDestinationCity]
  );
  
  console.log("✅ 已修復 noticeDetailed 資料格式");
  console.log("✅ 已精簡 destinationCity");
  
  // 驗證更新
  const [rows] = await connection.execute(
    'SELECT noticeDetailed, destinationCity FROM tours WHERE id = 600001'
  );
  console.log("\n=== 更新後的資料 ===");
  console.log("destinationCity:", rows[0].destinationCity);
  console.log("noticeDetailed:", rows[0].noticeDetailed);
  
  await connection.end();
}

main().catch(console.error);
