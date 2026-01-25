import { Queue, Worker, Job } from "bullmq";
import redis from "./redis";

/**
 * Job data structure for tour generation
 */
export interface TourGenerationJobData {
  url: string;
  userId: number;
  requestId: string; // Unique identifier for tracking
}

/**
 * Job progress structure
 */
export interface TourGenerationProgress {
  step: string;
  progress: number; // 0-100
  message: string;
  timestamp: number;
}

/**
 * Job result structure
 */
export interface TourGenerationResult {
  success: boolean;
  tourId?: number;
  error?: string;
  details?: {
    title: string;
    destination: string;
    price: number;
    duration: number;
  };
}

/**
 * Queue for tour generation tasks
 */
export const tourGenerationQueue = new Queue<TourGenerationJobData, TourGenerationResult>("tour-generation", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3, // Retry up to 3 times on failure
    backoff: {
      type: "exponential",
      delay: 5000, // Start with 5 second delay
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
      count: 1000, // Keep last 1000 failed jobs
    },
  },
});

/**
 * Add a tour generation job to the queue
 */
export async function addTourGenerationJob(data: TourGenerationJobData) {
  const job = await tourGenerationQueue.add("generate-tour", data, {
    jobId: data.requestId, // Use requestId as jobId for easy tracking
  });
  
  console.log(`✅ Tour generation job added: ${job.id}`);
  return job;
}

/**
 * Get job status and progress
 */
export async function getTourGenerationJobStatus(jobId: string) {
  const job = await tourGenerationQueue.getJob(jobId);
  
  if (!job) {
    return { status: "not_found" };
  }
  
  const state = await job.getState();
  const progress = job.progress as TourGenerationProgress | number;
  
  return {
    status: state,
    progress: typeof progress === "number" ? progress : progress?.progress || 0,
    data: job.data,
    result: job.returnvalue,
    failedReason: job.failedReason,
    progressDetails: typeof progress === "object" ? progress : null,
  };
}

/**
 * Get all jobs for a user
 */
export async function getUserTourGenerationJobs(userId: number) {
  const jobs = await tourGenerationQueue.getJobs(["waiting", "active", "completed", "failed"]);
  
  return jobs
    .filter((job) => job.data.userId === userId)
    .map((job) => ({
      id: job.id,
      status: job.getState(),
      data: job.data,
      progress: job.progress,
      result: job.returnvalue,
      createdAt: job.timestamp,
    }));
}

console.log("✅ Tour generation queue initialized");
