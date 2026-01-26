/**
 * Test script for all AI Agents
 * Tests the complete tour generation pipeline
 */

import { MasterAgent } from "./server/agents/masterAgent";

const TEST_URL = "https://travel.liontravel.com/detail?NormGroupID=ffaabdeb-b371-441d-9a6b-c93e65db57c4&GroupID=26EU214CI-T&TourSource=Lion&Platform=APP";

async function testAgents() {
  console.log("=".repeat(60));
  console.log("AI Agents 測試開始");
  console.log("=".repeat(60));
  console.log("測試 URL:", TEST_URL);
  console.log("");

  const startTime = Date.now();
  
  try {
    // Create Master Agent
    const masterAgent = new MasterAgent();
    
    // Execute tour generation with progress tracking
    console.log("[Test] 開始執行 MasterAgent...");
    
    const result = await masterAgent.execute(TEST_URL, 1, (step, percentage) => {
      console.log(`[Progress] ${step}: ${percentage}%`);
    });
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log("");
    console.log("=".repeat(60));
    console.log("測試結果");
    console.log("=".repeat(60));
    
    if (result.success && result.data) {
      console.log("✅ 測試成功！");
      console.log(`⏱️ 總耗時: ${totalTime} 秒`);
      console.log("");
      console.log("生成的行程資料:");
      console.log("-".repeat(40));
      console.log("標題:", result.data.title);
      console.log("描述:", result.data.description?.substring(0, 100) + "...");
      console.log("目的地:", result.data.destination);
      console.log("天數:", result.data.duration, "天");
      console.log("價格:", result.data.price);
      console.log("Hero 圖片:", result.data.heroImage);
      console.log("亮點數量:", result.data.highlights?.length || 0);
      console.log("特色數量:", result.data.keyFeatures?.length || 0);
      console.log("原創性分數:", result.data.originalityScore);
      console.log("-".repeat(40));
      
      // Output full data to file
      const fs = await import("fs");
      fs.writeFileSync(
        "/home/ubuntu/packgo-travel/test-agents-result.json",
        JSON.stringify(result.data, null, 2)
      );
      console.log("");
      console.log("完整結果已儲存至: test-agents-result.json");
    } else {
      console.log("❌ 測試失敗！");
      console.log("錯誤:", result.error);
    }
    
  } catch (error) {
    console.error("❌ 測試發生錯誤:", error);
  }
  
  console.log("");
  console.log("=".repeat(60));
  console.log("測試結束");
  console.log("=".repeat(60));
}

testAgents();
