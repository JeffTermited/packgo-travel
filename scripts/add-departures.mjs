import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 載入環境變數
dotenv.config({ path: join(__dirname, '..', '.env') });

async function addDepartures() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    const tourId = 600002; // 台灣環島行程
    const basePrice = 37800;
    
    // 定義出發日期資料 - 2026年2月至4月
    const departures = [
      // 2026年2月
      { departureDate: '2026-02-15', returnDate: '2026-02-20', price: 39800, slots: 25, note: '春節後首發團' },
      { departureDate: '2026-02-22', returnDate: '2026-02-27', price: 37800, slots: 20, note: '平日優惠價' },
      { departureDate: '2026-02-28', returnDate: '2026-03-05', price: 38800, slots: 22, note: '228連假團' },
      
      // 2026年3月
      { departureDate: '2026-03-07', returnDate: '2026-03-12', price: 36800, slots: 25, note: '早鳥優惠' },
      { departureDate: '2026-03-14', returnDate: '2026-03-19', price: 37800, slots: 20, note: null },
      { departureDate: '2026-03-21', returnDate: '2026-03-26', price: 37800, slots: 22, note: null },
      { departureDate: '2026-03-28', returnDate: '2026-04-02', price: 39800, slots: 25, note: '清明連假團' },
      
      // 2026年4月
      { departureDate: '2026-04-04', returnDate: '2026-04-09', price: 42800, slots: 25, note: '清明連假熱門團' },
      { departureDate: '2026-04-11', returnDate: '2026-04-16', price: 37800, slots: 20, note: null },
      { departureDate: '2026-04-18', returnDate: '2026-04-23', price: 37800, slots: 22, note: null },
      { departureDate: '2026-04-25', returnDate: '2026-04-30', price: 38800, slots: 25, note: '勞動節連假團' },
    ];
    
    console.log(`準備為行程 ${tourId} 新增 ${departures.length} 筆出發日期...`);
    
    // 先清除現有的出發日期（如果有的話）
    await connection.execute('DELETE FROM tourDepartures WHERE tourId = ?', [tourId]);
    console.log('已清除現有出發日期資料');
    
    // 新增出發日期
    for (const dep of departures) {
      await connection.execute(
        `INSERT INTO tourDepartures 
         (tourId, departureDate, returnDate, adultPrice, childPriceWithBed, childPriceNoBed, infantPrice, singleRoomSupplement, totalSlots, bookedSlots, status, currency, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tourId,
          dep.departureDate,
          dep.returnDate,
          dep.price,
          Math.round(dep.price * 0.9), // 兒童佔床 9折
          Math.round(dep.price * 0.7), // 兒童不佔床 7折
          Math.round(dep.price * 0.3), // 嬰兒 3折
          8000, // 單人房差
          dep.slots,
          Math.floor(Math.random() * 5), // 模擬已預訂人數 0-4
          'open',
          'TWD',
          dep.note
        ]
      );
      console.log(`✅ 已新增出發日期: ${dep.departureDate} - NT$${dep.price.toLocaleString()}`);
    }
    
    console.log(`\n🎉 成功新增 ${departures.length} 筆出發日期資料！`);
    
    // 查詢確認
    const [rows] = await connection.execute(
      'SELECT id, departureDate, returnDate, adultPrice, totalSlots, bookedSlots, status FROM tourDepartures WHERE tourId = ? ORDER BY departureDate',
      [tourId]
    );
    
    console.log('\n📅 出發日期列表:');
    rows.forEach(row => {
      const depDate = new Date(row.departureDate);
      const retDate = new Date(row.returnDate);
      console.log(`  ${depDate.toLocaleDateString('zh-TW')} ~ ${retDate.toLocaleDateString('zh-TW')} | NT$${row.adultPrice.toLocaleString()} | 剩餘 ${row.totalSlots - row.bookedSlots} 位`);
    });
    
  } catch (error) {
    console.error('錯誤:', error);
  } finally {
    await connection.end();
  }
}

addDepartures();
