/**
 * PrintFriendly 整合測試腳本
 * 
 * 測試使用 PrintFriendly API 從雄獅旅遊網頁提取行程資訊
 */

import { PrintFriendlyAgent } from './server/agents/printFriendlyAgent';
import { WebScraperAgent } from './server/agents/webScraperAgent';
import * as fs from 'fs';

// 測試 URL
const TEST_URL = 'https://travel.liontravel.com/detail?NormGroupID=ac60c50a-372a-4d7f-a7a4-afd4f93a5b6a&Platform=APP&GroupID=26SS326BRH-T';

async function testPrintFriendlyAgent() {
  console.log('='.repeat(80));
  console.log('PrintFriendly Agent 測試');
  console.log('='.repeat(80));
  console.log(`測試 URL: ${TEST_URL}`);
  console.log('');
  
  const agent = new PrintFriendlyAgent();
  
  // 測試 1: 轉換 PDF
  console.log('步驟 1: 轉換網頁為 PDF...');
  const startTime = Date.now();
  
  const pdfResult = await agent.convertToPdf(TEST_URL);
  
  if (!pdfResult.success) {
    console.error('❌ PDF 轉換失敗:', pdfResult.error);
    return;
  }
  
  console.log(`✅ PDF 轉換成功 (${Date.now() - startTime}ms)`);
  console.log(`   PDF URL: ${pdfResult.pdfUrl}`);
  console.log('');
  
  // 測試 2: 提取文字
  console.log('步驟 2: 提取 PDF 文字內容...');
  const textStartTime = Date.now();
  
  const textContent = await agent.extractTextFromPdf(pdfResult.pdfUrl!);
  
  console.log(`✅ 文字提取完成 (${Date.now() - textStartTime}ms)`);
  console.log(`   文字長度: ${textContent.length} 字元`);
  console.log(`   預覽: ${textContent.substring(0, 200)}...`);
  console.log('');
  
  // 測試 3: 分析內容
  console.log('步驟 3: 分析行程內容...');
  const analysisStartTime = Date.now();
  
  let analysisResult;
  if (textContent && textContent.length > 500) {
    console.log('   使用文字分析模式...');
    analysisResult = await agent.analyzeTextContent(textContent, TEST_URL);
  } else {
    console.log('   使用 Vision API 分析模式...');
    analysisResult = await agent.analyzePdfWithVision(pdfResult.pdfUrl!, TEST_URL);
  }
  
  console.log(`✅ 分析完成 (${Date.now() - analysisStartTime}ms)`);
  console.log('');
  
  if (analysisResult.success && analysisResult.data) {
    console.log('='.repeat(80));
    console.log('分析結果');
    console.log('='.repeat(80));
    
    const data = analysisResult.data;
    
    console.log(`標題: ${data.basicInfo?.title || 'N/A'}`);
    console.log(`產品代碼: ${data.basicInfo?.productCode || 'N/A'}`);
    console.log(`描述: ${data.basicInfo?.description?.substring(0, 100) || 'N/A'}...`);
    console.log('');
    
    console.log(`目的地國家: ${data.location?.destinationCountry || 'N/A'}`);
    console.log(`目的地城市: ${data.location?.destinationCity || 'N/A'}`);
    console.log(`出發城市: ${data.location?.departureCity || 'N/A'}`);
    console.log('');
    
    console.log(`行程天數: ${data.duration?.days || 'N/A'} 天 ${data.duration?.nights || 'N/A'} 夜`);
    console.log(`基本價格: ${data.pricing?.currency || 'TWD'} ${data.pricing?.basePrice || 'N/A'}`);
    console.log('');
    
    console.log(`每日行程數量: ${data.dailyItinerary?.length || 0}`);
    if (data.dailyItinerary && data.dailyItinerary.length > 0) {
      data.dailyItinerary.forEach((day: any, index: number) => {
        console.log(`  Day ${day.day || index + 1}: ${day.title || 'N/A'}`);
        if (day.highlights && day.highlights.length > 0) {
          console.log(`    景點: ${day.highlights.join(', ')}`);
        }
      });
    }
    console.log('');
    
    console.log(`行程亮點: ${data.highlights?.length || 0} 項`);
    if (data.highlights && data.highlights.length > 0) {
      data.highlights.forEach((h: string, i: number) => {
        console.log(`  ${i + 1}. ${h}`);
      });
    }
    console.log('');
    
    console.log(`飯店數量: ${data.hotels?.length || 0}`);
    console.log(`注意事項: ${data.notices?.length || 0} 項`);
    
    // 保存結果
    const resultPath = '/home/ubuntu/printfriendly-test-result.json';
    fs.writeFileSync(resultPath, JSON.stringify({
      url: TEST_URL,
      pdfUrl: pdfResult.pdfUrl,
      textLength: textContent.length,
      analysisResult: data,
      timestamp: new Date().toISOString(),
    }, null, 2));
    console.log('');
    console.log(`結果已保存到: ${resultPath}`);
  } else {
    console.error('❌ 分析失敗:', analysisResult.error);
  }
  
  console.log('');
  console.log(`總執行時間: ${Date.now() - startTime}ms`);
}

async function testWebScraperWithPrintFriendly() {
  console.log('');
  console.log('='.repeat(80));
  console.log('WebScraperAgent (PrintFriendly 模式) 測試');
  console.log('='.repeat(80));
  
  const agent = new WebScraperAgent({ usePrintFriendly: true });
  
  const startTime = Date.now();
  const result = await agent.execute(TEST_URL);
  
  console.log(`執行時間: ${Date.now() - startTime}ms`);
  console.log(`使用方法: ${result.method}`);
  console.log(`成功: ${result.success}`);
  
  if (result.success && result.data) {
    console.log(`標題: ${result.data.basicInfo?.title || 'N/A'}`);
    console.log(`每日行程: ${result.data.dailyItinerary?.length || 0} 天`);
  } else {
    console.error(`錯誤: ${result.error}`);
  }
}

// 執行測試
async function main() {
  try {
    await testPrintFriendlyAgent();
    await testWebScraperWithPrintFriendly();
  } catch (error) {
    console.error('測試失敗:', error);
  }
}

main();
