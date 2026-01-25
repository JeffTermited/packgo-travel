/**
 * 測試 AI 自動生成行程功能（快速版本）
 * 使用 quickExtractTourInfo 進行快速提取
 */

import { quickExtractTourInfo } from './server/webScraper.ts';
import dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

const testUrl = 'https://travel.liontravel.com/detail?NormGroupID=972eecc0-3da1-4b60-bb1e-f600b5d6dc78&Platform=APP&GroupID=26SK207CIT-T';

async function testAutoGenerate() {
  console.log('='.repeat(60));
  console.log('測試 AI 自動生成行程功能（快速版本）');
  console.log('='.repeat(60));
  console.log('');
  console.log('測試網址:', testUrl);
  console.log('');
  console.log('使用快速提取方式（Fetch + LLM），預計 30-60 秒');
  console.log('');
  
  console.log('開始提取行程資訊...');
  console.log('');
  
  const startTime = Date.now();
  
  try {
    const result = await quickExtractTourInfo(testUrl);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    console.log('');
    console.log('='.repeat(60));
    console.log(`✅ 提取完成！耗時: ${duration} 秒`);
    console.log('='.repeat(60));
    console.log('');
    
    console.log('📋 提取的行程資訊:');
    console.log('');
    
    // 顯示關鍵欄位
    console.log('【基本資訊】');
    console.log(`  標題: ${result.basicInfo?.title || '未提取'}`);
    console.log(`  產品代碼: ${result.basicInfo?.productCode || '未提取'}`);
    console.log(`  描述: ${(result.basicInfo?.description || '').substring(0, 100)}...`);
    console.log('');
    
    console.log('【地點資訊】');
    console.log(`  出發地: ${result.location?.departureCountry || ''} ${result.location?.departureCity || ''}`);
    console.log(`  目的地: ${result.location?.destinationCountry || ''} ${result.location?.destinationCity || ''}`);
    console.log('');
    
    console.log('【行程資訊】');
    console.log(`  天數: ${result.duration?.days || 0} 天 ${result.duration?.nights || 0} 晚`);
    console.log(`  價格: NT$ ${result.pricing?.price?.toLocaleString() || 0}`);
    console.log('');
    
    console.log('【航班資訊】');
    console.log(`  去程: ${result.flight?.outbound?.airline || ''} ${result.flight?.outbound?.flightNo || ''}`);
    console.log(`  回程: ${result.flight?.inbound?.airline || ''} ${result.flight?.inbound?.flightNo || ''}`);
    console.log('');
    
    console.log('【住宿資訊】');
    console.log(`  酒店: ${result.accommodation?.hotelName || '未提取'}`);
    console.log(`  等級: ${result.accommodation?.hotelGrade || '未提取'}`);
    console.log('');
    
    console.log('【景點數量】', (result.attractions || []).length, '個');
    console.log('【每日行程】', (result.dailyItinerary || []).length, '天');
    console.log('【行程亮點】', (result.highlights || []).length, '項');
    console.log('');
    
    // 輸出完整 JSON 到檔案
    const fs = await import('fs');
    fs.writeFileSync('/home/ubuntu/packgo-travel/extracted-tour.json', JSON.stringify(result, null, 2));
    console.log('✅ 完整 JSON 已儲存到 extracted-tour.json');
    
  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    console.log('');
    console.log('='.repeat(60));
    console.log(`❌ 提取失敗！耗時: ${duration} 秒`);
    console.log('='.repeat(60));
    console.log('');
    console.log('錯誤訊息:', error.message);
    console.log('');
    if (error.stack) {
      console.log('錯誤堆疊:');
      console.log(error.stack);
    }
  }
}

testAutoGenerate();
