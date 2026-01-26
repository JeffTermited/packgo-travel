/**
 * 測試 Puppeteer WebScraper
 * 驗證是否能成功抓取雄獅旅遊網頁的完整內容
 */

import { fetchWebPageWithPuppeteer, closeBrowser } from './server/webScraperPuppeteer';

const TEST_URL = 'https://travel.liontravel.com/detail?NormGroupID=ac60c50a-372a-4d7f-a7a4-afd4f93a5b6a&Platform=APP&GroupID=26SS326BRH-T';

async function main() {
  console.log('='.repeat(80));
  console.log('測試 Puppeteer WebScraper');
  console.log('='.repeat(80));
  console.log('');
  
  const startTime = Date.now();
  
  try {
    console.log('📡 開始抓取網頁...');
    console.log('URL:', TEST_URL);
    console.log('');
    
    const content = await fetchWebPageWithPuppeteer(TEST_URL);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    console.log('');
    console.log('='.repeat(80));
    console.log('✅ 抓取成功!');
    console.log('='.repeat(80));
    console.log('');
    console.log('📊 統計資訊:');
    console.log('  - 執行時間:', duration, '秒');
    console.log('  - 標題:', content.title);
    console.log('  - HTML 長度:', content.html.length, '字元');
    console.log('  - 文字長度:', content.text.length, '字元');
    console.log('  - 圖片數量:', content.images.length);
    console.log('');
    
    // 檢查內容完整性
    console.log('🔍 內容完整性檢查:');
    
    const checks = [
      { name: '標題包含「新馬旅遊」', pass: content.title.includes('新馬旅遊') },
      { name: '標題包含「紫竹谷」', pass: content.title.includes('紫竹谷') },
      { name: '標題包含「馬六甲」', pass: content.title.includes('馬六甲') },
      { name: '文字長度 > 10,000 字元', pass: content.text.length > 10000 },
      { name: '文字包含「行程特色」', pass: content.text.includes('行程特色') || content.text.includes('行程2') },
      { name: '文字包含「航班」', pass: content.text.includes('航班') || content.text.includes('長榮航空') },
      { name: '文字包含「飯店」', pass: content.text.includes('飯店') || content.text.includes('渡假村') },
      { name: '文字包含「價格」', pass: content.text.includes('TWD') || content.text.includes('26,999') },
      { name: '圖片數量 > 5', pass: content.images.length > 5 },
    ];
    
    let passCount = 0;
    checks.forEach(check => {
      const status = check.pass ? '✅' : '❌';
      console.log(`  ${status} ${check.name}`);
      if (check.pass) passCount++;
    });
    
    console.log('');
    console.log(`  通過率: ${passCount}/${checks.length} (${((passCount / checks.length) * 100).toFixed(0)}%)`);
    console.log('');
    
    // 顯示文字內容的前 500 字元
    console.log('📝 文字內容預覽 (前 500 字元):');
    console.log('-'.repeat(80));
    console.log(content.text.substring(0, 500));
    console.log('-'.repeat(80));
    console.log('');
    
    // 顯示圖片 URLs (前 10 個)
    console.log('🖼️  圖片 URLs (前 10 個):');
    content.images.slice(0, 10).forEach((img, index) => {
      console.log(`  ${index + 1}. ${img}`);
    });
    console.log('');
    
    // 判斷測試結果
    if (passCount >= 7) {
      console.log('🎉 測試通過! WebScraper 成功抓取完整內容');
    } else {
      console.log('⚠️  測試部分通過,但內容可能不完整');
    }
    
  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('❌ 抓取失敗!');
    console.error('='.repeat(80));
    console.error('');
    console.error('錯誤訊息:', error);
  } finally {
    // 關閉瀏覽器
    await closeBrowser();
    console.log('');
    console.log('🔒 瀏覽器已關閉');
  }
}

main();
