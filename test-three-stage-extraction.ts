/**
 * 測試 WebScraperAgent 三階段提取策略
 */

import { WebScraperAgent } from './server/agents/webScraperAgent';

async function testThreeStageExtraction() {
  console.log("=== 測試 WebScraperAgent 三階段提取策略 ===\n");
  
  // 測試 URL：雄獅旅遊的新馬行程
  const testUrl = "https://travel.liontravel.com/detail?NormGroupID=ac60c50a-372a-4d7f-a7a4-afd4f93a5b6a&Platform=APP&GroupID=26SS326BRH-T";
  
  console.log("測試 URL:", testUrl);
  console.log("開始時間:", new Date().toLocaleString());
  console.log();
  
  const startTime = Date.now();
  
  // 創建 WebScraperAgent 實例（使用三階段策略）
  const agent = new WebScraperAgent({ mode: 'three-stage' });
  
  // 執行提取
  const result = await agent.execute(testUrl);
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log("\n=== 測試結果 ===");
  console.log("成功:", result.success);
  console.log("方法:", result.method);
  console.log("耗時:", duration, "秒");
  
  if (result.extractionDetails) {
    console.log("\n提取詳情:");
    console.log("  - JSON-LD 找到:", result.extractionDetails.jsonLdFound);
    console.log("  - Markdown 提取:", result.extractionDetails.markdownExtracted);
    console.log("  - Vision 救援:", result.extractionDetails.visionFallbackUsed);
  }
  
  if (result.success && result.data) {
    console.log("\n提取的資料:");
    console.log("  - 標題:", result.data.basicInfo?.title || "未提取");
    console.log("  - 目的地:", `${result.data.location?.destinationCountry || "未提取"} / ${result.data.location?.destinationCity || "未提取"}`);
    console.log("  - 天數:", `${result.data.duration?.days || 0} 天 ${result.data.duration?.nights || 0} 夜`);
    console.log("  - 價格:", result.data.pricing?.price || 0, result.data.pricing?.currency || "TWD");
    console.log("  - 每日行程天數:", result.data.dailyItinerary?.length || 0);
    console.log("  - 特色數量:", result.data.highlights?.length || 0);
    console.log("  - 包含項目:", result.data.includes?.length || 0);
    console.log("  - 不包含項目:", result.data.excludes?.length || 0);
    
    // 顯示每日行程標題
    if (result.data.dailyItinerary && result.data.dailyItinerary.length > 0) {
      console.log("\n每日行程標題:");
      result.data.dailyItinerary.forEach((day: any, index: number) => {
        console.log(`  Day ${day.day || index + 1}: ${day.title || "未提取"}`);
      });
    }
  } else {
    console.log("\n錯誤:", result.error);
  }
  
  console.log("\n結束時間:", new Date().toLocaleString());
  console.log("=== 測試完成 ===");
  
  // 將結果寫入檔案
  const fs = await import('fs');
  fs.writeFileSync(
    '/home/ubuntu/three-stage-test-result.json',
    JSON.stringify({
      success: result.success,
      method: result.method,
      duration: `${duration}s`,
      extractionDetails: result.extractionDetails,
      data: result.data,
      error: result.error,
    }, null, 2)
  );
  
  console.log("\n測試結果已寫入: /home/ubuntu/three-stage-test-result.json");
}

testThreeStageExtraction().catch(console.error);
