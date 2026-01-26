/**
 * Test script for ContentAnalyzerAgent title generation
 * Verify Lion Travel style keyword-dense stacking format
 */

import { ContentAnalyzerAgent } from "./contentAnalyzerAgent";

async function testTitleGeneration() {
  console.log("=".repeat(80));
  console.log("ContentAnalyzerAgent 標題生成測試");
  console.log("=".repeat(80));
  console.log();

  const agent = new ContentAnalyzerAgent();

  // Test Case 1: 日本北海道行程
  console.log("【測試案例 1】日本北海道行程");
  console.log("-".repeat(80));
  
  const testData1 = {
    location: {
      destinationCountry: "日本",
      destinationCity: "北海道",
    },
    duration: {
      days: 5,
      nights: 4,
    },
    highlights: [
      "破冰船體驗",
      "冰釣公魚",
      "丹頂鶴觀賞",
      "旭山動物園",
      "熱氣球體驗",
      "四大螃蟹美食",
      "溫泉飯店",
    ],
    accommodation: {
      hotelGrade: "四星溫泉飯店",
    },
    specialExperiences: [
      "冰上活動",
      "野生動物觀賞",
      "溫泉體驗",
    ],
  };

  try {
    const result1 = await agent.execute(testData1);
    if (result1.success && result1.data) {
      console.log("✅ 標題生成成功");
      console.log(`標題: ${result1.data.poeticTitle}`);
      console.log(`長度: ${result1.data.poeticTitle.length} 個字`);
      console.log(`亮點數量: ${result1.data.highlights.length}`);
      console.log();
      console.log("亮點列表:");
      result1.data.highlights.forEach((h, i) => {
        const text = typeof h === 'string' ? h : (h.text || h.description || JSON.stringify(h));
        console.log(`  ${i + 1}. ${text}`);
      });
      console.log();
      
      // Validate format
      const title = result1.data.poeticTitle;
      const hasDestination = title.includes("北海道") || title.includes("日本");
      const hasDots = title.includes(".");
      const hasDays = title.includes("五日") || title.includes("5日");
      const length = title.length;
      
      console.log("格式驗證:");
      console.log(`  ✓ 包含目的地: ${hasDestination ? "是" : "否"}`);
      console.log(`  ✓ 使用 . 分隔: ${hasDots ? "是" : "否"}`);
      console.log(`  ✓ 包含天數: ${hasDays ? "是" : "否"}`);
      console.log(`  ✓ 長度適中 (40-80字): ${length >= 40 && length <= 80 ? "是" : "否"} (${length}字)`);
      console.log();
    } else {
      console.log("❌ 標題生成失敗:", result1.error);
    }
  } catch (error) {
    console.error("❌ 測試失敗:", error);
  }

  console.log("=".repeat(80));
  console.log();

  // Test Case 2: 泰國清邁行程
  console.log("【測試案例 2】泰國清邁行程");
  console.log("-".repeat(80));
  
  const testData2 = {
    location: {
      destinationCountry: "泰國",
      destinationCity: "清邁",
    },
    duration: {
      days: 5,
      nights: 4,
    },
    highlights: [
      "金三角遊船",
      "天空步道",
      "白廟參觀",
      "友善象營",
      "泰服體驗",
      "米其林推薦美食",
      "渡假村住宿",
      "無購物行程",
    ],
    accommodation: {
      hotelGrade: "五星渡假村",
    },
    specialExperiences: [
      "文化體驗",
      "美食之旅",
      "自然生態",
    ],
  };

  try {
    const result2 = await agent.execute(testData2);
    if (result2.success && result2.data) {
      console.log("✅ 標題生成成功");
      console.log(`標題: ${result2.data.poeticTitle}`);
      console.log(`長度: ${result2.data.poeticTitle.length} 個字`);
      console.log(`亮點數量: ${result2.data.highlights.length}`);
      console.log();
      console.log("亮點列表:");
      result2.data.highlights.forEach((h, i) => {
        const text = typeof h === 'string' ? h : (h.text || h.description || JSON.stringify(h));
        console.log(`  ${i + 1}. ${text}`);
      });
      console.log();
      
      // Validate format
      const title = result2.data.poeticTitle;
      const hasDestination = title.includes("清邁") || title.includes("泰國");
      const hasDots = title.includes(".");
      const hasDays = title.includes("五日") || title.includes("5日");
      const length = title.length;
      
      console.log("格式驗證:");
      console.log(`  ✓ 包含目的地: ${hasDestination ? "是" : "否"}`);
      console.log(`  ✓ 使用 . 分隔: ${hasDots ? "是" : "否"}`);
      console.log(`  ✓ 包含天數: ${hasDays ? "是" : "否"}`);
      console.log(`  ✓ 長度適中 (40-80字): ${length >= 40 && length <= 80 ? "是" : "否"} (${length}字)`);
      console.log();
    } else {
      console.log("❌ 標題生成失敗:", result2.error);
    }
  } catch (error) {
    console.error("❌ 測試失敗:", error);
  }

  console.log("=".repeat(80));
  console.log("測試完成");
  console.log("=".repeat(80));
}

// Run test
testTitleGeneration().catch(console.error);
