/**
 * 端到端 AI 自動生成測試腳本
 * 使用雄獅旅遊 URL 進行完整測試
 */

import { MasterAgent } from "./server/agents/masterAgent";
import * as db from "./server/db";
import * as fs from "fs";

const TEST_URL = "https://travel.liontravel.com/detail?NormGroupID=ac60c50a-372a-4d7f-a7a4-afd4f93a5b6a&Platform=APP&GroupID=26SS326BRH-T";

async function runE2ETest() {
  console.log("=".repeat(80));
  console.log("端到端 AI 自動生成測試");
  console.log("=".repeat(80));
  console.log(`測試 URL: ${TEST_URL}`);
  console.log(`開始時間: ${new Date().toISOString()}`);
  console.log("");

  const startTime = Date.now();

  try {
    // 步驟 1: 執行 MasterAgent
    console.log("步驟 1: 執行 MasterAgent...");
    const masterAgent = new MasterAgent();
    const masterResult = await masterAgent.execute(TEST_URL);
    
    const executionTime = (Date.now() - startTime) / 1000;
    console.log(`MasterAgent 執行完成，耗時: ${executionTime.toFixed(1)} 秒`);
    console.log("");

    // 從 MasterAgent 結果中提取資料
    const result = masterResult.data || {};
    
    // 步驟 2: 分析結果
    console.log("步驟 2: 分析生成結果...");
    console.log("-".repeat(40));
    
    // 標題 (使用 poeticTitle 作為主要標題)
    const title = result.poeticTitle || result.title || "未生成標題";
    console.log(`標題: ${title}`);
    console.log(`標題長度: ${title.length} 字`);
    console.log(`標題格式檢查:`);
    console.log(`  - 包含「｜」: ${title.includes("｜") ? "✓" : "✗"}`);
    console.log(`  - 包含「.」: ${title.includes(".") ? "✓" : "✗"}`);
    console.log(`  - 長度 40-80 字: ${title.length >= 40 && title.length <= 80 ? "✓" : "✗"}`);
    console.log("");

    // 目的地
    console.log(`目的地國家: ${result.destinationCountry || "未設定"}`);
    console.log(`目的地城市: ${result.destinationCity || "未設定"}`);
    console.log(`出發城市: ${result.departureCity || "未設定"}`);
    console.log("");

    // 行程
    console.log(`行程天數: ${result.days || 0} 天 ${result.nights || 0} 夜`);
    
    // 解析 itineraryDetailed
    let itinerary: any[] = [];
    if (result.itineraryDetailed) {
      try {
        itinerary = typeof result.itineraryDetailed === 'string' 
          ? JSON.parse(result.itineraryDetailed) 
          : result.itineraryDetailed;
      } catch (e) {
        console.warn("無法解析 itineraryDetailed");
      }
    }
    console.log(`每日行程數量: ${itinerary.length}`);
    if (itinerary.length > 0) {
      console.log("每日行程預覽:");
      itinerary.slice(0, 3).forEach((day: any, index: number) => {
        console.log(`  Day ${index + 1}: ${day.title || day.dayTitle || "無標題"} (${day.activities?.length || 0} 個活動)`);
      });
    }
    console.log("");

    // 圖片
    console.log(`Hero 圖片: ${result.heroImage ? "✓" : "✗"}`);
    
    // 解析 featureImages
    let featureImages: any[] = [];
    if (result.featureImages) {
      try {
        featureImages = typeof result.featureImages === 'string' 
          ? JSON.parse(result.featureImages) 
          : result.featureImages;
      } catch (e) {
        console.warn("無法解析 featureImages");
      }
    }
    console.log(`景點圖片數量: ${featureImages.length}`);
    console.log("");

    // 配色
    let colorTheme: any = {};
    if (result.colorTheme) {
      try {
        colorTheme = typeof result.colorTheme === 'string' 
          ? JSON.parse(result.colorTheme) 
          : result.colorTheme;
      } catch (e) {
        console.warn("無法解析 colorTheme");
      }
    }
    console.log(`配色方案:`);
    console.log(`  - 主色: ${colorTheme.primary || "未設定"}`);
    console.log(`  - 次色: ${colorTheme.secondary || "未設定"}`);
    console.log(`  - 強調色: ${colorTheme.accent || "未設定"}`);
    console.log("");

    // 費用說明
    let costExplanation: any = {};
    if (result.costExplanation) {
      try {
        costExplanation = typeof result.costExplanation === 'string' 
          ? JSON.parse(result.costExplanation) 
          : result.costExplanation;
      } catch (e) {
        console.warn("無法解析 costExplanation");
      }
    }
    console.log(`費用說明:`);
    console.log(`  - 包含項目: ${costExplanation.included?.length || 0} 項`);
    console.log(`  - 不包含項目: ${costExplanation.excluded?.length || 0} 項`);
    console.log("");

    // 注意事項
    let noticeDetailed: any = {};
    if (result.noticeDetailed) {
      try {
        noticeDetailed = typeof result.noticeDetailed === 'string' 
          ? JSON.parse(result.noticeDetailed) 
          : result.noticeDetailed;
      } catch (e) {
        console.warn("無法解析 noticeDetailed");
      }
    }
    const noticeCount = noticeDetailed.categories?.length || noticeDetailed.notices?.length || 0;
    console.log(`注意事項分類: ${noticeCount} 項`);
    console.log("");

    // 解析 highlights
    let highlights: any[] = [];
    if (result.highlights) {
      try {
        highlights = typeof result.highlights === 'string' 
          ? JSON.parse(result.highlights) 
          : result.highlights;
      } catch (e) {
        console.warn("無法解析 highlights");
      }
    }
    console.log(`行程亮點: ${highlights.length} 項`);
    console.log("");

    // 步驟 3: 儲存到資料庫
    console.log("步驟 3: 儲存到資料庫...");
    
    // 準備資料庫資料
    const tourData = {
      title: title,
      destination: result.destinationCity || result.destinationCountry || "未設定",
      destinationCountry: result.destinationCountry || "",
      destinationCity: result.destinationCity || "",
      description: result.description || "",
      duration: result.days || 5,
      price: result.price || 26999,
      imageUrl: result.heroImage || "",
      heroImage: result.heroImage || "",
      heroImageAlt: result.heroImageAlt || "",
      heroSubtitle: result.heroSubtitle || "",
      poeticTitle: result.poeticTitle || "",
      itineraryDetailed: typeof result.itineraryDetailed === "string" ? result.itineraryDetailed : JSON.stringify(itinerary),
      costExplanation: typeof result.costExplanation === "string" ? result.costExplanation : JSON.stringify(costExplanation),
      category: "group" as const,
      status: "active" as const,
      highlights: JSON.stringify(highlights),
      dailyItinerary: JSON.stringify(itinerary),
      includes: JSON.stringify(costExplanation.included || []),
      excludes: JSON.stringify(costExplanation.excluded || []),
      noticeDetailed: typeof result.noticeDetailed === "string" ? result.noticeDetailed : JSON.stringify(noticeDetailed),
      colorTheme: typeof result.colorTheme === "string" ? result.colorTheme : JSON.stringify(colorTheme),
      featureImages: typeof result.featureImages === "string" ? result.featureImages : JSON.stringify(featureImages),
      hotels: typeof result.hotels === 'string' ? result.hotels : JSON.stringify(result.hotels || []),
      meals: typeof result.meals === 'string' ? result.meals : JSON.stringify(result.meals || []),
      flights: typeof result.flights === 'string' ? result.flights : JSON.stringify(result.flights || {}),
      sourceUrl: TEST_URL,
      isAutoGenerated: 1,
      createdBy: 1,
      originalityScore: result.originalityScore?.toString() || "80.00",
    };

    const savedTour = await db.createTour(tourData);
    console.log(`行程已儲存，ID: ${savedTour.id}`);
    console.log("");

    // 步驟 4: 總結
    console.log("=".repeat(80));
    console.log("測試結果總結");
    console.log("=".repeat(80));
    console.log(`總執行時間: ${executionTime.toFixed(1)} 秒`);
    console.log(`行程 ID: ${savedTour.id}`);
    console.log(`行程標題: ${savedTour.title}`);
    console.log(`詳情頁面: https://packgo-d3xjbq67.manus.space/tours/${savedTour.id}`);
    console.log("");

    // 顯示 Agent 執行報告
    if (masterResult.report) {
      console.log("=".repeat(80));
      console.log("Agent 執行報告");
      console.log("=".repeat(80));
      console.log(`成功率: ${masterResult.report.successRate || "N/A"}`);
      console.log(`總執行時間: ${masterResult.report.totalDuration || executionTime} 秒`);
      
      if (masterResult.report.agentResults) {
        console.log("\nAgent 詳細結果:");
        for (const [agentName, agentResult] of Object.entries(masterResult.report.agentResults as Record<string, any>)) {
          const status = agentResult.success ? "✓" : "✗";
          const duration = agentResult.duration ? `${agentResult.duration.toFixed(1)}s` : "N/A";
          console.log(`  ${status} ${agentName}: ${duration}`);
        }
      }
    }
    console.log("");

    // 儲存結果到檔案
    const resultFile = "/home/ubuntu/e2e-test-result.json";
    fs.writeFileSync(resultFile, JSON.stringify({
      success: true,
      executionTime,
      tourId: savedTour.id,
      tourTitle: savedTour.title,
      detailUrl: `https://packgo-d3xjbq67.manus.space/tours/${savedTour.id}`,
      result: result,
      report: masterResult.report,
    }, null, 2));
    console.log(`結果已儲存到: ${resultFile}`);

    return {
      success: true,
      tourId: savedTour.id,
      executionTime,
    };

  } catch (error) {
    console.error("測試失敗:", error);
    const executionTime = (Date.now() - startTime) / 1000;
    
    // 儲存錯誤結果
    const resultFile = "/home/ubuntu/e2e-test-result.json";
    fs.writeFileSync(resultFile, JSON.stringify({
      success: false,
      executionTime,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, null, 2));

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      executionTime,
    };
  }
}

// 執行測試
runE2ETest()
  .then((result) => {
    console.log("");
    console.log("測試完成:", result.success ? "成功" : "失敗");
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("測試執行錯誤:", error);
    process.exit(1);
  });
