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
 * 
 * 進度更新說明：
 * - 實際進度由 MasterAgent 內部的 onProgress 回調控制
 * - Worker 只負責初始化和錯誤處理
 * - 進度百分比由 MasterAgent 根據實際執行階段計算
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
        message: "初始化生成任務...",
        timestamp: Date.now(),
      });
      
      // Call the actual tour generation function
      // MasterAgent 會透過 onProgress 回調更新進度
      const result = await generateTourFromUrlInternal(
        job.data.url, 
        job.data.userId, 
        job,
        job.data.forceRegenerate || false,
        job.data.isPdf || false
      );
      
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
    lockDuration: 1200000, // 20 minutes lock duration for long-running tasks (e.g., large PDF processing)
    lockRenewTime: 600000, // Renew lock every 10 minutes
    maxStalledCount: 3, // Allow up to 3 stalled attempts before failing
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
