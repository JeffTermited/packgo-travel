/**
 * 端到端測試腳本：驗證優化後的 AI 自動生成功能
 * 測試項目：
 * 1. 並行處理速度優化
 * 2. 預覽模式功能
 */

import { MasterAgent } from "./server/agents/masterAgent";
import * as fs from "fs";

const TEST_URL = "https://travel.liontravel.com/detail?NormGroupID=c684d4d8-4860-47a3-94e3-debb05bce5b2&Origin=LION&Platform=APP";

async function runTest() {
  console.log("=".repeat(60));
  console.log("AI 自動生成功能優化測試");
  console.log("=".repeat(60));
  console.log(`測試 URL: ${TEST_URL}`);
  console.log(`開始時間: ${new Date().toISOString()}`);
  console.log("-".repeat(60));

  const startTime = Date.now();
  
  try {
    // 創建 MasterAgent 實例
    const masterAgent = new MasterAgent();
    
    // 執行完整生成流程
    console.log("\n[Phase 1] 開始執行 MasterAgent.execute()...\n");
    
    const result = await masterAgent.execute(TEST_URL);
    
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    
    console.log("\n" + "=".repeat(60));
    console.log("測試結果");
    console.log("=".repeat(60));
    
    if (result.success) {
      console.log("✅ 生成成功！");
      console.log(`⏱️  總執行時間: ${totalTime.toFixed(2)} 秒`);
      
      // 顯示生成的資料摘要
      const data = result.data;
      console.log("\n📋 生成資料摘要:");
      console.log(`   - 標題: ${data.title?.substring(0, 50)}...`);
      console.log(`   - 天數: ${data.duration} 天`);
      console.log(`   - 價格: NT$ ${data.price?.toLocaleString()}`);
      console.log(`   - 目的地: ${data.destinationCountry} / ${data.destinationCity}`);
      console.log(`   - Hero 圖片: ${data.heroImage ? "✅ 已生成" : "❌ 未生成"}`);
      console.log(`   - 配色方案: ${data.colorScheme ? "✅ 已生成" : "❌ 未生成"}`);
      console.log(`   - 每日行程: ${data.itineraryDetailed ? "✅ 已生成" : "❌ 未生成"}`);
      console.log(`   - 費用說明: ${data.costExplanation ? "✅ 已生成" : "❌ 未生成"}`);
      
      // 檢查並行處理效果
      console.log("\n🚀 並行處理效果:");
      if (totalTime < 90) {
        console.log(`   ✅ 優化成功！執行時間 ${totalTime.toFixed(2)} 秒 (目標 < 90 秒)`);
      } else if (totalTime < 120) {
        console.log(`   ⚠️  部分優化！執行時間 ${totalTime.toFixed(2)} 秒 (目標 < 90 秒)`);
      } else {
        console.log(`   ❌ 需要進一步優化！執行時間 ${totalTime.toFixed(2)} 秒`);
      }
      
      // 保存測試結果
      const testResult = {
        success: true,
        totalTime,
        timestamp: new Date().toISOString(),
        url: TEST_URL,
        dataPreview: {
          title: data.title,
          duration: data.duration,
          price: data.price,
          destinationCountry: data.destinationCountry,
          destinationCity: data.destinationCity,
          hasHeroImage: !!data.heroImage,
          hasColorScheme: !!data.colorScheme,
          hasItinerary: !!data.itineraryDetailed,
          hasCostExplanation: !!data.costExplanation,
        },
        fullData: data,
      };
      
      fs.writeFileSync(
        "/home/ubuntu/optimized-test-result.json",
        JSON.stringify(testResult, null, 2)
      );
      console.log("\n📁 完整結果已保存至: /home/ubuntu/optimized-test-result.json");
      
    } else {
      console.log("❌ 生成失敗！");
      console.log(`錯誤: ${result.error}`);
      console.log(`執行時間: ${totalTime.toFixed(2)} 秒`);
    }
    
  } catch (error: any) {
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    
    console.log("\n❌ 測試過程中發生錯誤:");
    console.log(error.message);
    console.log(`執行時間: ${totalTime.toFixed(2)} 秒`);
    
    // 保存錯誤結果
    fs.writeFileSync(
      "/home/ubuntu/optimized-test-result.json",
      JSON.stringify({
        success: false,
        error: error.message,
        totalTime,
        timestamp: new Date().toISOString(),
        url: TEST_URL,
      }, null, 2)
    );
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("測試完成");
  console.log("=".repeat(60));
}

// 執行測試
runTest();
