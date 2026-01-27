/**
 * Puppeteer Vision 測試腳本
 * 測試使用 Puppeteer 截圖 + LLM Vision API 分析網頁
 */

import { scrapeWithPuppeteerVision } from './server/agents/puppeteerVisionAgent';
import * as fs from 'fs';

async function main() {
  const testUrl = 'https://travel.liontravel.com/detail?NormGroupID=ac60c50a-372a-4d7f-a7a4-afd4f93a5b6a&Platform=APP&GroupID=26SS326BRH-T';
  
  console.log('='.repeat(60));
  console.log('Puppeteer Vision 測試');
  console.log('='.repeat(60));
  console.log('測試 URL:', testUrl);
  console.log('');
  
  const startTime = Date.now();
  
  try {
    const result = await scrapeWithPuppeteerVision(testUrl);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    console.log('');
    console.log('='.repeat(60));
    console.log('測試結果');
    console.log('='.repeat(60));
    console.log('成功:', result.success);
    console.log('方法:', result.method);
    console.log('執行時間:', duration, '秒');
    console.log('截圖數量:', result.screenshots.length);
    
    if (result.success && result.extractedData) {
      console.log('');
      console.log('提取的資料:');
      console.log('- 標題:', result.extractedData.title);
      console.log('- 副標題:', result.extractedData.subtitle);
      console.log('- 目的地:', result.extractedData.destination);
      console.log('- 天數:', result.extractedData.duration);
      console.log('- 價格:', result.extractedData.price);
      console.log('- 亮點數量:', result.extractedData.highlights?.length || 0);
      console.log('- 每日行程數量:', result.extractedData.dailyItinerary?.length || 0);
      console.log('- 費用包含數量:', result.extractedData.includes?.length || 0);
      console.log('- 費用不包含數量:', result.extractedData.excludes?.length || 0);
      console.log('- 飯店數量:', result.extractedData.hotels?.length || 0);
      
      // 顯示每日行程
      if (result.extractedData.dailyItinerary && result.extractedData.dailyItinerary.length > 0) {
        console.log('');
        console.log('每日行程:');
        result.extractedData.dailyItinerary.forEach((day: any) => {
          console.log(`  Day ${day.day}: ${day.title}`);
        });
      }
    }
    
    if (result.error) {
      console.log('錯誤:', result.error);
    }
    
    // 儲存結果
    const resultPath = '/home/ubuntu/puppeteer-vision-test-result.json';
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    console.log('');
    console.log('結果已儲存到:', resultPath);
    
  } catch (error) {
    console.error('測試失敗:', error);
  }
}

main();
