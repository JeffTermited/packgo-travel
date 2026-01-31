import { storagePut } from "./server/storage";
import { addTourGenerationJob, getTourGenerationJobStatus } from "./server/queue";
import fs from "fs";

async function testPdfGeneration() {
  console.log("=== PDF 並行化測試 ===\n");
  
  // 1. 上傳 PDF
  const pdfPath = "/home/ubuntu/upload/travel.liontravel.com-縱谷旬味山嵐號x夢幻車身世界冠軍主廚料理九日良田茶點桂田喜來登酒店台東日-團體行程雄獅旅遊-fpscreenshot.pdf";
  
  if (!fs.existsSync(pdfPath)) {
    console.error("❌ PDF 檔案不存在:", pdfPath);
    return;
  }
  
  console.log("📤 上傳 PDF 到 S3...");
  const pdfBuffer = fs.readFileSync(pdfPath);
  const { url: pdfUrl } = await storagePut(
    `pdf-uploads/test-parallel-${Date.now()}.pdf`,
    pdfBuffer,
    "application/pdf"
  );
  console.log("✅ PDF 上傳成功:", pdfUrl);
  
  // 2. 提交生成任務
  console.log("\n📝 提交生成任務...");
  const jobId = await addTourGenerationJob({
    url: pdfUrl,
    userId: 630001,
    forceRegenerate: true,
    isPdf: true, // ⭐ 關鍵：告訴系統這是 PDF
  });
  console.log("✅ Job 提交成功:", jobId);
  
  // 3. 監控進度
  console.log("\n⏳ 監控生成進度...\n");
  const startTime = Date.now();
  
  while (true) {
    const status = await getTourGenerationJobStatus(jobId);
    
    if (!status) {
      console.log("❌ 無法獲取任務狀態");
      break;
    }
    
    console.log(`進度: ${status.progress}% - ${status.message || "處理中..."}`);
    
    if (status.status === "completed") {
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`\n✅ 生成完成！總時間: ${totalTime} 秒`);
      console.log("行程 ID:", status.result?.tourId);
      break;
    }
    
    if (status.status === "failed") {
      console.log("\n❌ 生成失敗:", status.error);
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

testPdfGeneration().catch(console.error);
