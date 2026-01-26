/**
 * 完整的 AI 自動生成測試
 * 測試使用雄獅旅遊真實 URL 進行完整的 MasterAgent 執行
 */

async function testCompleteGeneration() {
  console.log("=== 完整 AI 自動生成測試 ===\n");

  const testUrl = "https://travel.liontravel.com/detail?NormGroupID=ac60c50a-372a-4d7f-a7a4-afd4f93a5b6a&Platform=APP&GroupID=26SS326BRH-T";
  
  console.log(`測試 URL: ${testUrl}\n`);
  console.log("開始執行 MasterAgent...\n");

  const startTime = Date.now();

  try {
    // Import MasterAgent
    const { MasterAgent } = await import("./server/agents/masterAgent");
    const masterAgent = new MasterAgent();
    
    // Execute complete tour generation with all AI agents
    const result = await masterAgent.execute(
      testUrl,
      1, // userId (假設為管理員)
      (step, percentage) => {
        console.log(`[進度] ${step} (${percentage}%)`);
      }
    );
    
    const executionTime = (Date.now() - startTime) / 1000;
    
    console.log("\n=== 執行結果 ===");
    console.log(`執行時間: ${executionTime.toFixed(1)} 秒`);
    console.log(`成功: ${result.success}`);
    
    if (result.success && result.data) {
      console.log("\n=== 生成的行程資料 ===");
      console.log(`標題: ${result.data.title}`);
      console.log(`目的地: ${result.data.destinationCountry} ${result.data.destinationCity}`);
      console.log(`天數: ${result.data.days} 天 ${result.data.nights} 夜`);
      console.log(`價格: ${result.data.price}`);
      console.log(`產品代碼: ${result.data.productCode}`);
      
      // 檢查各個 Agent 的輸出
      console.log("\n=== Agent 輸出檢查 ===");
      console.log(`✓ 標題生成: ${result.data.title ? '成功' : '失敗'}`);
      console.log(`✓ 色彩主題: ${result.data.colorTheme ? '成功' : '失敗'}`);
      console.log(`✓ Hero 圖片: ${result.data.heroImage ? '成功' : '失敗'}`);
      console.log(`✓ 行程詳情: ${result.data.itineraryDetailed ? '成功' : '失敗'}`);
      console.log(`✓ 費用說明: ${result.data.costExplanation ? '成功' : '失敗'}`);
      console.log(`✓ 注意事項: ${result.data.noticeDetailed ? '成功' : '失敗'}`);
      console.log(`✓ 飯店資訊: ${result.data.hotels ? '成功' : '失敗'}`);
      console.log(`✓ 餐飲資訊: ${result.data.meals ? '成功' : '失敗'}`);
      console.log(`✓ 航班資訊: ${result.data.flights ? '成功' : '失敗'}`);
      
      // 計算成功率
      const agentResults = [
        result.data.title,
        result.data.colorTheme,
        result.data.heroImage,
        result.data.itineraryDetailed,
        result.data.costExplanation,
        result.data.noticeDetailed,
        result.data.hotels,
        result.data.meals,
        result.data.flights,
      ];
      const successCount = agentResults.filter(r => r).length;
      const successRate = (successCount / agentResults.length * 100).toFixed(1);
      
      console.log(`\n成功率: ${successCount}/${agentResults.length} (${successRate}%)`);
      
      // 檢查標題格式
      if (result.data.title) {
        const titleLength = result.data.title.length;
        const hasDots = result.data.title.includes('.');
        const hasPipe = result.data.title.includes('｜');
        
        console.log("\n=== 標題格式檢查 ===");
        console.log(`標題: ${result.data.title}`);
        console.log(`長度: ${titleLength} 字 (建議 40-80 字)`);
        console.log(`包含「.」分隔符: ${hasDots ? '是' : '否'}`);
        console.log(`包含「｜」分隔符: ${hasPipe ? '是' : '否'}`);
        console.log(`格式符合雄獅風格: ${hasDots && hasPipe && titleLength >= 40 && titleLength <= 80 ? '✓ 是' : '✗ 否'}`);
      }
      
      console.log("\n✅ 測試成功!");
    } else {
      console.log(`\n❌ 測試失敗: ${result.error}`);
      process.exit(1);
    }
  } catch (error: any) {
    const executionTime = (Date.now() - startTime) / 1000;
    console.error(`\n❌ 測試失敗 (${executionTime.toFixed(1)} 秒):`);
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testCompleteGeneration();
