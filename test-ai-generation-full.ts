/**
 * 完整的 AI 自動生成測試
 * 測試所有 Agents 的互動關係並記錄詳細資訊
 */

import { MasterAgent } from './server/agents/masterAgent';
import fs from 'fs';
import path from 'path';

const TEST_URL = 'https://travel.liontravel.com/detail?NormGroupID=ac60c50a-372a-4d7f-a7a4-afd4f93a5b6a&Platform=APP&GroupID=26SS326BRH-T';
const TEST_USER_ID = 1;
const OUTPUT_DIR = '/home/ubuntu/ai-generation-test-results';

async function testAIGeneration() {
  console.log('='.repeat(80));
  console.log('AI 自動生成完整測試');
  console.log('='.repeat(80));
  console.log('');
  console.log('測試 URL:', TEST_URL);
  console.log('測試時間:', new Date().toISOString());
  console.log('');
  
  // 創建輸出目錄
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const startTime = Date.now();
  const testLog: any[] = [];
  
  try {
    console.log('📡 開始 AI 自動生成...');
    console.log('');
    
    const masterAgent = new MasterAgent();
    
    // 執行生成
    const result = await masterAgent.execute(TEST_URL, TEST_USER_ID);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    console.log('');
    console.log('='.repeat(80));
    console.log('✅ 生成完成!');
    console.log('='.repeat(80));
    console.log('');
    console.log('📊 執行統計:');
    console.log(`  - 總執行時間: ${duration} 秒`);
    console.log(`  - 生成成功: ${result.success ? '是' : '否'}`);
    console.log('');
    
    // 保存完整結果到 JSON 文件
    const resultPath = path.join(OUTPUT_DIR, 'generation-result.json');
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    console.log(`✓ 完整結果已保存到: ${resultPath}`);
    console.log('');
    
    // 顯示生成的行程資料
    if (result.tourData) {
      console.log('📝 生成的行程資料:');
      console.log(`  - 標題: ${result.tourData.title}`);
      console.log(`  - 目的地: ${result.tourData.destination}`);
      console.log(`  - 天數: ${result.tourData.days}`);
      console.log(`  - 價格: ${result.tourData.price}`);
      console.log(`  - 產品代碼: ${result.tourData.productCode}`);
      console.log('');
      
      // 檢查標題格式
      console.log('🔍 標題格式檢查:');
      const title = result.tourData.title || '';
      console.log(`  - 標題: ${title}`);
      console.log(`  - 長度: ${title.length} 字 (建議 40-80 字)`);
      console.log(`  - 包含「.」分隔符: ${title.includes('.') ? '是' : '否'}`);
      console.log(`  - 包含「｜」分隔符: ${title.includes('｜') ? '是' : '否'}`);
      
      const isLionStyle = title.length >= 40 && title.length <= 80 && 
                          (title.includes('.') || title.includes('｜'));
      console.log(`  - 符合雄獅風格: ${isLionStyle ? '✓ 是' : '✗ 否'}`);
      console.log('');
      
      // 檢查各個 Agent 的輸出
      console.log('🤖 Agent 輸出檢查:');
      const agentChecks = [
        { name: 'colorTheme', label: '色彩主題', data: result.tourData.colorTheme },
        { name: 'mainImage', label: 'Hero 圖片', data: result.tourData.mainImage },
        { name: 'itinerary', label: '行程詳情', data: result.tourData.itinerary },
        { name: 'costExplanation', label: '費用說明', data: result.tourData.costExplanation },
        { name: 'notice', label: '注意事項', data: result.tourData.notice },
        { name: 'hotel', label: '飯店資訊', data: result.tourData.hotel },
        { name: 'meal', label: '餐飲資訊', data: result.tourData.meal },
        { name: 'flight', label: '航班資訊', data: result.tourData.flight },
      ];
      
      let successCount = 0;
      agentChecks.forEach(check => {
        const hasData = check.data && Object.keys(check.data).length > 0;
        const status = hasData ? '✓' : '✗';
        console.log(`  ${status} ${check.label}: ${hasData ? '成功' : '失敗'}`);
        if (hasData) successCount++;
      });
      
      console.log('');
      console.log(`  成功率: ${successCount}/${agentChecks.length} (${((successCount / agentChecks.length) * 100).toFixed(1)}%)`);
      console.log('');
    }
    
    // 保存測試報告
    const report = {
      testTime: new Date().toISOString(),
      testUrl: TEST_URL,
      duration: parseFloat(duration),
      success: result.success,
      tourData: result.tourData,
      agentStatuses: result.agentStatuses || {},
    };
    
    const reportPath = path.join(OUTPUT_DIR, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✓ 測試報告已保存到: ${reportPath}`);
    console.log('');
    
    return report;
    
  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('❌ 生成失敗!');
    console.error('='.repeat(80));
    console.error('');
    console.error('錯誤訊息:', error);
    
    const errorLog = {
      testTime: new Date().toISOString(),
      testUrl: TEST_URL,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
    
    const errorPath = path.join(OUTPUT_DIR, 'error-log.json');
    fs.writeFileSync(errorPath, JSON.stringify(errorLog, null, 2));
    console.error(`✓ 錯誤日誌已保存到: ${errorPath}`);
    
    throw error;
  }
}

// 執行測試
testAIGeneration()
  .then(() => {
    console.log('🎉 測試完成!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 測試失敗:', error);
    process.exit(1);
  });
