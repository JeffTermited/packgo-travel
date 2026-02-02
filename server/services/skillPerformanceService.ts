/**
 * Skill Performance Tracking Service
 * 
 * Tracks skill usage, user feedback, and conversion metrics
 * to help optimize skill configuration.
 */

import { getDb } from "../db";
import { 
  skillUsageLog, 
  skillPerformanceMetrics,
  agentSkills,
  type InsertSkillUsageLog 
} from "../../drizzle/schema";
import { eq, and, gte, lte, sql, desc, count, sum, avg } from "drizzle-orm";

// Types
export type ContextType = "chat" | "search" | "itinerary" | "content" | "classification";
export type FeedbackType = "positive" | "negative" | "none";
export type ConversionType = "booking" | "inquiry" | "favorite" | "share" | "none";

export interface SkillTriggerInput {
  skillId: number;
  skillName: string;
  skillType: string;
  contextType: ContextType;
  contextId?: string;
  inputText?: string;
  matchedKeywords?: string[];
  outputResult?: string;
  userId?: number;
  sessionId?: string;
  wasSuccessful?: boolean;
  errorMessage?: string;
  processingTimeMs?: number;
}

export interface UserFeedbackInput {
  usageLogId: number;
  feedback: FeedbackType;
  comment?: string;
}

export interface ConversionInput {
  usageLogId: number;
  conversionType: ConversionType;
  conversionId?: number;
}

export interface SkillPerformanceSummary {
  skillId: number;
  skillName: string;
  totalTriggers: number;
  successRate: number;
  satisfactionRate: number;
  conversionRate: number;
  avgProcessingTimeMs: number;
  positiveCount: number;
  negativeCount: number;
  conversionCount: number;
}

export interface PerformanceTrend {
  date: string;
  triggerCount: number;
  successRate: number;
  satisfactionRate: number;
  conversionRate: number;
}

/**
 * Record a skill trigger event
 */
export async function recordSkillTrigger(input: SkillTriggerInput): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(skillUsageLog).values({
    skillId: input.skillId,
    skillName: input.skillName,
    skillType: input.skillType,
    contextType: input.contextType,
    contextId: input.contextId,
    inputText: input.inputText,
    matchedKeywords: input.matchedKeywords ? JSON.stringify(input.matchedKeywords) : null,
    outputResult: input.outputResult,
    userId: input.userId,
    sessionId: input.sessionId,
    wasSuccessful: input.wasSuccessful ?? true,
    errorMessage: input.errorMessage,
    processingTimeMs: input.processingTimeMs,
    triggeredAt: new Date(),
  });
  
  // Update daily metrics
  await updateDailyMetrics(input.skillId, input.wasSuccessful ?? true);
  
  // Get the inserted ID from the result
  const insertId = (result as any)[0]?.insertId || 0;
  return insertId;
}

/**
 * Record user feedback for a skill usage
 */
export async function recordUserFeedback(input: UserFeedbackInput): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(skillUsageLog)
    .set({
      userFeedback: input.feedback,
      feedbackComment: input.comment,
      feedbackAt: new Date(),
    })
    .where(eq(skillUsageLog.id, input.usageLogId));
  
  // Get the skill ID from the usage log
  const [log] = await db.select({ skillId: skillUsageLog.skillId })
    .from(skillUsageLog)
    .where(eq(skillUsageLog.id, input.usageLogId));
  
  if (log) {
    await updateFeedbackMetrics(log.skillId, input.feedback);
  }
}

/**
 * Record a conversion event linked to a skill usage
 */
export async function recordConversion(input: ConversionInput): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(skillUsageLog)
    .set({
      ledToConversion: true,
      conversionType: input.conversionType,
      conversionId: input.conversionId,
      conversionAt: new Date(),
    })
    .where(eq(skillUsageLog.id, input.usageLogId));
  
  // Get the skill ID from the usage log
  const [log] = await db.select({ skillId: skillUsageLog.skillId })
    .from(skillUsageLog)
    .where(eq(skillUsageLog.id, input.usageLogId));
  
  if (log) {
    await updateConversionMetrics(log.skillId);
  }
}

/**
 * Update daily metrics for a skill
 */
async function updateDailyMetrics(skillId: number, wasSuccessful: boolean): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if metrics exist for today
  const [existing] = await db.select()
    .from(skillPerformanceMetrics)
    .where(and(
      eq(skillPerformanceMetrics.skillId, skillId),
      eq(skillPerformanceMetrics.date, today)
    ));
  
  if (existing) {
    // Update existing metrics
    await db.update(skillPerformanceMetrics)
      .set({
        triggerCount: sql`${skillPerformanceMetrics.triggerCount} + 1`,
      })
      .where(eq(skillPerformanceMetrics.id, existing.id));
    
    // Update success or failure count separately
    if (wasSuccessful) {
      await db.update(skillPerformanceMetrics)
        .set({
          successCount: sql`${skillPerformanceMetrics.successCount} + 1`,
        })
        .where(eq(skillPerformanceMetrics.id, existing.id));
    } else {
      await db.update(skillPerformanceMetrics)
        .set({
          failureCount: sql`${skillPerformanceMetrics.failureCount} + 1`,
        })
        .where(eq(skillPerformanceMetrics.id, existing.id));
    }
  } else {
    // Create new metrics for today
    await db.insert(skillPerformanceMetrics).values({
      skillId,
      date: today,
      triggerCount: 1,
      successCount: wasSuccessful ? 1 : 0,
      failureCount: wasSuccessful ? 0 : 1,
    });
  }
  
  // Recalculate success rate
  await recalculateSuccessRate(skillId, today);
}

/**
 * Update feedback metrics for a skill
 */
async function updateFeedbackMetrics(skillId: number, feedback: FeedbackType): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [existing] = await db.select()
    .from(skillPerformanceMetrics)
    .where(and(
      eq(skillPerformanceMetrics.skillId, skillId),
      eq(skillPerformanceMetrics.date, today)
    ));
  
  if (existing) {
    if (feedback === "positive") {
      await db.update(skillPerformanceMetrics)
        .set({
          positiveCount: sql`${skillPerformanceMetrics.positiveCount} + 1`,
        })
        .where(eq(skillPerformanceMetrics.id, existing.id));
    } else if (feedback === "negative") {
      await db.update(skillPerformanceMetrics)
        .set({
          negativeCount: sql`${skillPerformanceMetrics.negativeCount} + 1`,
        })
        .where(eq(skillPerformanceMetrics.id, existing.id));
    }
    
    // Recalculate satisfaction rate
    await recalculateSatisfactionRate(skillId, today);
  }
}

/**
 * Update conversion metrics for a skill
 */
async function updateConversionMetrics(skillId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [existing] = await db.select()
    .from(skillPerformanceMetrics)
    .where(and(
      eq(skillPerformanceMetrics.skillId, skillId),
      eq(skillPerformanceMetrics.date, today)
    ));
  
  if (existing) {
    await db.update(skillPerformanceMetrics)
      .set({
        conversionCount: sql`${skillPerformanceMetrics.conversionCount} + 1`,
      })
      .where(eq(skillPerformanceMetrics.id, existing.id));
    
    // Recalculate conversion rate
    await recalculateConversionRate(skillId, today);
  }
}

/**
 * Recalculate success rate for a skill on a given date
 */
async function recalculateSuccessRate(skillId: number, date: Date): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const [metrics] = await db.select()
    .from(skillPerformanceMetrics)
    .where(and(
      eq(skillPerformanceMetrics.skillId, skillId),
      eq(skillPerformanceMetrics.date, date)
    ));
  
  if (metrics && metrics.triggerCount > 0) {
    const successRate = metrics.successCount / metrics.triggerCount;
    await db.update(skillPerformanceMetrics)
      .set({ successRate: successRate.toFixed(4) })
      .where(eq(skillPerformanceMetrics.id, metrics.id));
  }
}

/**
 * Recalculate satisfaction rate for a skill on a given date
 */
async function recalculateSatisfactionRate(skillId: number, date: Date): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const [metrics] = await db.select()
    .from(skillPerformanceMetrics)
    .where(and(
      eq(skillPerformanceMetrics.skillId, skillId),
      eq(skillPerformanceMetrics.date, date)
    ));
  
  if (metrics) {
    const totalFeedback = metrics.positiveCount + metrics.negativeCount;
    if (totalFeedback > 0) {
      const satisfactionRate = metrics.positiveCount / totalFeedback;
      await db.update(skillPerformanceMetrics)
        .set({ satisfactionRate: satisfactionRate.toFixed(4) })
        .where(eq(skillPerformanceMetrics.id, metrics.id));
    }
  }
}

/**
 * Recalculate conversion rate for a skill on a given date
 */
async function recalculateConversionRate(skillId: number, date: Date): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const [metrics] = await db.select()
    .from(skillPerformanceMetrics)
    .where(and(
      eq(skillPerformanceMetrics.skillId, skillId),
      eq(skillPerformanceMetrics.date, date)
    ));
  
  if (metrics && metrics.triggerCount > 0) {
    const conversionRate = metrics.conversionCount / metrics.triggerCount;
    await db.update(skillPerformanceMetrics)
      .set({ conversionRate: conversionRate.toFixed(4) })
      .where(eq(skillPerformanceMetrics.id, metrics.id));
  }
}

/**
 * Get performance summary for all skills
 */
export async function getSkillPerformanceSummary(days: number = 30): Promise<SkillPerformanceSummary[]> {
  const db = await getDb();
  if (!db) return [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  // Get all skills
  const skills = await db.select().from(agentSkills);
  
  const summaries: SkillPerformanceSummary[] = [];
  
  for (const skill of skills) {
    // Get aggregated metrics for this skill
    const [metrics] = await db.select({
      totalTriggers: sum(skillPerformanceMetrics.triggerCount),
      totalSuccess: sum(skillPerformanceMetrics.successCount),
      totalFailure: sum(skillPerformanceMetrics.failureCount),
      totalPositive: sum(skillPerformanceMetrics.positiveCount),
      totalNegative: sum(skillPerformanceMetrics.negativeCount),
      totalConversions: sum(skillPerformanceMetrics.conversionCount),
      avgProcessingTime: avg(skillPerformanceMetrics.avgProcessingTimeMs),
    })
      .from(skillPerformanceMetrics)
      .where(and(
        eq(skillPerformanceMetrics.skillId, skill.id),
        gte(skillPerformanceMetrics.date, startDate)
      ));
    
    const totalTriggers = Number(metrics?.totalTriggers || 0);
    const totalSuccess = Number(metrics?.totalSuccess || 0);
    const totalPositive = Number(metrics?.totalPositive || 0);
    const totalNegative = Number(metrics?.totalNegative || 0);
    const totalConversions = Number(metrics?.totalConversions || 0);
    
    const totalFeedback = totalPositive + totalNegative;
    
    summaries.push({
      skillId: skill.id,
      skillName: skill.skillName,
      totalTriggers,
      successRate: totalTriggers > 0 ? totalSuccess / totalTriggers : 0,
      satisfactionRate: totalFeedback > 0 ? totalPositive / totalFeedback : 0,
      conversionRate: totalTriggers > 0 ? totalConversions / totalTriggers : 0,
      avgProcessingTimeMs: Number(metrics?.avgProcessingTime || 0),
      positiveCount: totalPositive,
      negativeCount: totalNegative,
      conversionCount: totalConversions,
    });
  }
  
  // Sort by total triggers descending
  return summaries.sort((a, b) => b.totalTriggers - a.totalTriggers);
}

/**
 * Get performance trend for a specific skill
 */
export async function getSkillPerformanceTrend(
  skillId: number, 
  days: number = 30
): Promise<PerformanceTrend[]> {
  const db = await getDb();
  if (!db) return [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  const metrics = await db.select()
    .from(skillPerformanceMetrics)
    .where(and(
      eq(skillPerformanceMetrics.skillId, skillId),
      gte(skillPerformanceMetrics.date, startDate)
    ))
    .orderBy(skillPerformanceMetrics.date);
  
  return metrics.map(m => ({
    date: m.date.toISOString().split('T')[0],
    triggerCount: m.triggerCount,
    successRate: Number(m.successRate || 0),
    satisfactionRate: Number(m.satisfactionRate || 0),
    conversionRate: Number(m.conversionRate || 0),
  }));
}

/**
 * Get overall performance dashboard data
 */
export async function getPerformanceDashboard(days: number = 30) {
  const db = await getDb();
  if (!db) return { summary: {}, dailyTrend: [], topSkills: [], recentLogs: [] };
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  // Get aggregated metrics
  const [totals] = await db.select({
    totalTriggers: sum(skillPerformanceMetrics.triggerCount),
    totalSuccess: sum(skillPerformanceMetrics.successCount),
    totalPositive: sum(skillPerformanceMetrics.positiveCount),
    totalNegative: sum(skillPerformanceMetrics.negativeCount),
    totalConversions: sum(skillPerformanceMetrics.conversionCount),
  })
    .from(skillPerformanceMetrics)
    .where(gte(skillPerformanceMetrics.date, startDate));
  
  const totalTriggers = Number(totals?.totalTriggers || 0);
  const totalSuccess = Number(totals?.totalSuccess || 0);
  const totalPositive = Number(totals?.totalPositive || 0);
  const totalNegative = Number(totals?.totalNegative || 0);
  const totalConversions = Number(totals?.totalConversions || 0);
  const totalFeedback = totalPositive + totalNegative;
  
  // Get daily trend
  const dailyTrend = await db.select({
    date: skillPerformanceMetrics.date,
    triggers: sum(skillPerformanceMetrics.triggerCount),
    conversions: sum(skillPerformanceMetrics.conversionCount),
  })
    .from(skillPerformanceMetrics)
    .where(gte(skillPerformanceMetrics.date, startDate))
    .groupBy(skillPerformanceMetrics.date)
    .orderBy(skillPerformanceMetrics.date);
  
  // Get top performing skills
  const topSkills = await getSkillPerformanceSummary(days);
  
  // Get recent usage logs
  const recentLogs = await db.select()
    .from(skillUsageLog)
    .orderBy(desc(skillUsageLog.triggeredAt))
    .limit(10);
  
  return {
    summary: {
      totalTriggers,
      overallSuccessRate: totalTriggers > 0 ? totalSuccess / totalTriggers : 0,
      overallSatisfactionRate: totalFeedback > 0 ? totalPositive / totalFeedback : 0,
      overallConversionRate: totalTriggers > 0 ? totalConversions / totalTriggers : 0,
      totalPositiveFeedback: totalPositive,
      totalNegativeFeedback: totalNegative,
      totalConversions,
    },
    dailyTrend: dailyTrend.map(d => ({
      date: d.date.toISOString().split('T')[0],
      triggers: Number(d.triggers || 0),
      conversions: Number(d.conversions || 0),
    })),
    topSkills: topSkills.slice(0, 5),
    recentLogs: recentLogs.map(log => ({
      id: log.id,
      skillName: log.skillName,
      contextType: log.contextType,
      wasSuccessful: log.wasSuccessful,
      userFeedback: log.userFeedback,
      ledToConversion: log.ledToConversion,
      triggeredAt: log.triggeredAt,
    })),
  };
}

/**
 * Get usage logs with filtering
 */
export async function getUsageLogs(options: {
  skillId?: number;
  contextType?: ContextType;
  feedback?: FeedbackType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { logs: [], total: 0 };
  const { skillId, contextType, feedback, startDate, endDate, limit = 50, offset = 0 } = options;
  
  let query = db.select().from(skillUsageLog);
  
  const conditions = [];
  
  if (skillId) {
    conditions.push(eq(skillUsageLog.skillId, skillId));
  }
  if (contextType) {
    conditions.push(eq(skillUsageLog.contextType, contextType));
  }
  if (feedback && feedback !== "none") {
    conditions.push(eq(skillUsageLog.userFeedback, feedback));
  }
  if (startDate) {
    conditions.push(gte(skillUsageLog.triggeredAt, startDate));
  }
  if (endDate) {
    conditions.push(lte(skillUsageLog.triggeredAt, endDate));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const logs = await query
    .orderBy(desc(skillUsageLog.triggeredAt))
    .limit(limit)
    .offset(offset);
  
  // Get total count
  const [countResult] = await db.select({ count: count() })
    .from(skillUsageLog)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  
  return {
    logs,
    total: countResult?.count || 0,
  };
}
