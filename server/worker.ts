import { Worker, Job } from "bullmq";
import redis from "./redis";
import {
  TourGenerationJobData,
  TourGenerationProgress,
  TourGenerationResult,
} from "./queue";
import { generateTourFromUrlInternal } from "./tourGenerator";

/**
 * Worker for processing tour generation jobs
 */
export const tourGenerationWorker = new Worker<TourGenerationJobData, TourGenerationResult>(
  "tour-generation",
  async (job: Job<TourGenerationJobData, TourGenerationResult>) => {
    console.log(`🚀 Processing tour generation job: ${job.id}`);
    
    try {
      // Update progress: Starting
      await updateProgress(job, {
        step: "starting",
        progress: 0,
        message: "開始生成行程...",
        timestamp: Date.now(),
      });
      
      // Step 1: Web scraping
      await updateProgress(job, {
        step: "scraping",
        progress: 10,
        message: "正在抓取網頁內容...",
        timestamp: Date.now(),
      });
      
      // Step 2: Content analysis
      await updateProgress(job, {
        step: "analyzing",
        progress: 30,
        message: "正在分析行程內容...",
        timestamp: Date.now(),
      });
      
      // Step 3: Generate hero image
      await updateProgress(job, {
        step: "generating_hero_image",
        progress: 50,
        message: "正在生成 Hero 圖片...",
        timestamp: Date.now(),
      });
      
      // Step 4: Generate highlight images
      await updateProgress(job, {
        step: "generating_highlight_images",
        progress: 70,
        message: "正在生成亮點圖片...",
        timestamp: Date.now(),
      });
      
      // Step 5: Generate color theme
      await updateProgress(job, {
        step: "generating_color_theme",
        progress: 85,
        message: "正在生成配色主題...",
        timestamp: Date.now(),
      });
      
      // Step 6: Save to database
      await updateProgress(job, {
        step: "saving",
        progress: 95,
        message: "正在儲存到資料庫...",
        timestamp: Date.now(),
      });
      
      // Call the actual tour generation function
      const result = await generateTourFromUrlInternal(job.data.url, job.data.userId, job);
      
      // Complete
      await updateProgress(job, {
        step: "completed",
        progress: 100,
        message: "行程生成完成！",
        timestamp: Date.now(),
      });
      
      console.log(`✅ Tour generation job completed: ${job.id}`);
      
      return result;
    } catch (error) {
      console.error(`❌ Tour generation job failed: ${job.id}`, error);
      
      await updateProgress(job, {
        step: "failed",
        progress: 0,
        message: error instanceof Error ? error.message : "生成失敗",
        timestamp: Date.now(),
      });
      
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 2, // Process 2 jobs concurrently
    limiter: {
      max: 10, // Max 10 jobs
      duration: 60000, // per 60 seconds
    },
  }
);

/**
 * Helper function to update job progress
 */
async function updateProgress(
  job: Job<TourGenerationJobData, TourGenerationResult>,
  progress: TourGenerationProgress
) {
  await job.updateProgress(progress);
  console.log(`📊 Job ${job.id} progress: ${progress.progress}% - ${progress.message}`);
}

// Event listeners
tourGenerationWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

tourGenerationWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

tourGenerationWorker.on("error", (err) => {
  console.error("❌ Worker error:", err);
});

console.log("✅ Tour generation worker initialized");

export default tourGenerationWorker;
