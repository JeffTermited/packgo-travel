/**
 * Learning Analytics Service
 * Provides analytics data for the learning dashboard including:
 * - Learning trends over time
 * - Skill adoption rates
 * - Source distribution
 * - Tour popularity metrics
 */

import { getDb } from "../db";
import {
  skillLearningHistory,
  skillReviewQueue,
  tourStatistics,
  learningAnalytics,
  agentSkills,
  tours,
} from "../../drizzle/schema";
import { eq, sql, desc, and, gte, lte, count } from "drizzle-orm";

export interface LearningTrendData {
  date: string;
  learningCount: number;
  keywordsSuggested: number;
  skillsSuggested: number;
  keywordsAccepted: number;
  skillsApproved: number;
}

export interface AdoptionRateData {
  category: string;
  count: number;
  percentage: number;
}

export interface SourceDistributionData {
  source: string;
  count: number;
  percentage: number;
}

export interface DashboardStats {
  totalLearnings: number;
  totalKeywordsSuggested: number;
  totalSkillsSuggested: number;
  overallAdoptionRate: number;
  pendingReviews: number;
  activeSkills: number;
}

/**
 * Get learning trends for the specified period
 */
export async function getLearningTrends(
  days: number = 30
): Promise<LearningTrendData[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Get learning history grouped by date
  const results = await db
    .select({
      date: sql<string>`DATE(${skillLearningHistory.createdAt})`.as("date"),
      learningCount: count().as("learningCount"),
      keywordsSuggested: sql<number>`SUM(${skillLearningHistory.totalKeywordsFound})`.as("keywordsSuggested"),
      skillsSuggested: sql<number>`COUNT(CASE WHEN ${skillLearningHistory.newSkillSuggestions} IS NOT NULL AND ${skillLearningHistory.newSkillSuggestions} != '[]' THEN 1 END)`.as("skillsSuggested"),
      keywordsAccepted: sql<number>`SUM(${skillLearningHistory.suggestionsAccepted})`.as("keywordsAccepted"),
      skillsApproved: sql<number>`SUM(${skillLearningHistory.skillsCreated})`.as("skillsApproved"),
    })
    .from(skillLearningHistory)
    .where(gte(skillLearningHistory.createdAt, startDate))
    .groupBy(sql`DATE(${skillLearningHistory.createdAt})`)
    .orderBy(sql`DATE(${skillLearningHistory.createdAt})`);

  // Fill in missing dates with zeros
  const trendMap = new Map<string, LearningTrendData>();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    trendMap.set(dateStr, {
      date: dateStr,
      learningCount: 0,
      keywordsSuggested: 0,
      skillsSuggested: 0,
      keywordsAccepted: 0,
      skillsApproved: 0,
    });
  }

  for (const row of results) {
    const dateStr = row.date;
    if (trendMap.has(dateStr)) {
      trendMap.set(dateStr, {
        date: dateStr,
        learningCount: Number(row.learningCount) || 0,
        keywordsSuggested: Number(row.keywordsSuggested) || 0,
        skillsSuggested: Number(row.skillsSuggested) || 0,
        keywordsAccepted: Number(row.keywordsAccepted) || 0,
        skillsApproved: Number(row.skillsApproved) || 0,
      });
    }
  }

  return Array.from(trendMap.values());
}

/**
 * Get skill adoption rates (approved, rejected, pending)
 */
export async function getSkillAdoptionRates(): Promise<AdoptionRateData[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const results = await db
    .select({
      status: skillReviewQueue.status,
      count: count().as("count"),
    })
    .from(skillReviewQueue)
    .groupBy(skillReviewQueue.status);

  const total = results.reduce((sum: number, r: { status: string; count: number }) => sum + Number(r.count), 0);

  const statusLabels: Record<string, string> = {
    pending: "待審核",
    approved: "已批准",
    rejected: "已拒絕",
    merged: "已合併",
  };

  return results.map((r: { status: string; count: number }) => ({
    category: statusLabels[r.status] || r.status,
    count: Number(r.count),
    percentage: total > 0 ? (Number(r.count) / total) * 100 : 0,
  }));
}

/**
 * Get learning source distribution
 */
export async function getSourceDistribution(): Promise<SourceDistributionData[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const results = await db
    .select({
      sourceType: skillLearningHistory.sourceType,
      count: count().as("count"),
    })
    .from(skillLearningHistory)
    .groupBy(skillLearningHistory.sourceType);

  const total = results.reduce((sum: number, r: { sourceType: string; count: number }) => sum + Number(r.count), 0);

  const sourceLabels: Record<string, string> = {
    tour: "單一行程",
    batch: "批量學習",
    scheduled: "排程學習",
    manual: "手動輸入",
  };

  return results.map((r: { sourceType: string; count: number }) => ({
    source: sourceLabels[r.sourceType] || r.sourceType,
    count: Number(r.count),
    percentage: total > 0 ? (Number(r.count) / total) * 100 : 0,
  }));
}

/**
 * Get dashboard summary statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDb();
  if (!db) {
    return {
      totalLearnings: 0,
      totalKeywordsSuggested: 0,
      totalSkillsSuggested: 0,
      overallAdoptionRate: 0,
      pendingReviews: 0,
      activeSkills: 0,
    };
  }

  // Total learnings
  const [learningCountResult] = await db
    .select({ count: count() })
    .from(skillLearningHistory);

  // Total keywords and skills suggested
  const [suggestionsResult] = await db
    .select({
      totalKeywords: sql<number>`SUM(${skillLearningHistory.totalKeywordsFound})`,
      totalSkills: sql<number>`COUNT(CASE WHEN ${skillLearningHistory.newSkillSuggestions} IS NOT NULL AND ${skillLearningHistory.newSkillSuggestions} != '[]' THEN 1 END)`,
      totalAccepted: sql<number>`SUM(${skillLearningHistory.suggestionsAccepted})`,
    })
    .from(skillLearningHistory);

  // Pending reviews
  const [pendingResult] = await db
    .select({ count: count() })
    .from(skillReviewQueue)
    .where(eq(skillReviewQueue.status, "pending"));

  // Active skills
  const [activeSkillsResult] = await db
    .select({ count: count() })
    .from(agentSkills)
    .where(eq(agentSkills.isActive, true));

  const totalKeywords = Number(suggestionsResult?.totalKeywords) || 0;
  const totalAccepted = Number(suggestionsResult?.totalAccepted) || 0;
  const adoptionRate = totalKeywords > 0 ? (totalAccepted / totalKeywords) * 100 : 0;

  return {
    totalLearnings: Number(learningCountResult?.count) || 0,
    totalKeywordsSuggested: totalKeywords,
    totalSkillsSuggested: Number(suggestionsResult?.totalSkills) || 0,
    overallAdoptionRate: Math.round(adoptionRate * 100) / 100,
    pendingReviews: Number(pendingResult?.count) || 0,
    activeSkills: Number(activeSkillsResult?.count) || 0,
  };
}

/**
 * Get top performing tours by popularity for learning prioritization
 */
export async function getTopToursByPopularity(limit: number = 10) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const results = await db
    .select({
      tourId: tourStatistics.tourId,
      viewCount: tourStatistics.viewCount,
      bookingCount: tourStatistics.bookingCount,
      popularityScore: tourStatistics.popularityScore,
      hasBeenLearned: tourStatistics.hasBeenLearned,
      learningPriority: tourStatistics.learningPriority,
    })
    .from(tourStatistics)
    .orderBy(desc(tourStatistics.popularityScore))
    .limit(limit);

  return results;
}

/**
 * Calculate and update popularity scores for all tours
 */
export async function updatePopularityScores() {
  const db = await getDb();
  if (!db) {
    return;
  }

  // Get all tour statistics
  const stats = await db.select().from(tourStatistics);

  for (const stat of stats) {
    // Calculate popularity score based on weighted metrics
    // Formula: (views * 1) + (bookings * 10) + (favorites * 5) + (inquiries * 3)
    const score =
      stat.viewCount * 1 +
      stat.bookingCount * 10 +
      stat.favoriteCount * 5 +
      stat.inquiryCount * 3;

    // Update the popularity score
    await db
      .update(tourStatistics)
      .set({
        popularityScore: score.toFixed(4),
        learningPriority: Math.floor(score / 100), // Normalize to priority level
      })
      .where(eq(tourStatistics.id, stat.id));
  }
}

/**
 * Get tours prioritized for learning (high popularity, not yet learned)
 */
export async function getPrioritizedToursForLearning(limit: number = 5) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const results = await db
    .select({
      tourId: tourStatistics.tourId,
      title: tours.title,
      destination: tours.destination,
      viewCount: tourStatistics.viewCount,
      bookingCount: tourStatistics.bookingCount,
      popularityScore: tourStatistics.popularityScore,
      hasBeenLearned: tourStatistics.hasBeenLearned,
    })
    .from(tourStatistics)
    .innerJoin(tours, eq(tourStatistics.tourId, tours.id))
    .where(eq(tourStatistics.hasBeenLearned, false))
    .orderBy(desc(tourStatistics.popularityScore))
    .limit(limit);

  return results;
}

/**
 * Record a tour view and update statistics
 */
export async function recordTourView(tourId: number) {
  const db = await getDb();
  if (!db) {
    return;
  }

  // Check if statistics record exists
  const [existing] = await db
    .select()
    .from(tourStatistics)
    .where(eq(tourStatistics.tourId, tourId));

  if (existing) {
    await db
      .update(tourStatistics)
      .set({
        viewCount: existing.viewCount + 1,
        lastViewedAt: new Date(),
      })
      .where(eq(tourStatistics.tourId, tourId));
  } else {
    await db.insert(tourStatistics).values({
      tourId,
      viewCount: 1,
      lastViewedAt: new Date(),
    });
  }
}

/**
 * Record a tour booking and update statistics
 */
export async function recordTourBooking(tourId: number, revenue: number = 0) {
  const db = await getDb();
  if (!db) {
    return;
  }

  const [existing] = await db
    .select()
    .from(tourStatistics)
    .where(eq(tourStatistics.tourId, tourId));

  if (existing) {
    const newBookingCount = existing.bookingCount + 1;
    const newRevenue = existing.totalRevenue + revenue;
    const conversionRate = existing.viewCount > 0 
      ? newBookingCount / existing.viewCount 
      : 0;

    await db
      .update(tourStatistics)
      .set({
        bookingCount: newBookingCount,
        totalRevenue: newRevenue,
        conversionRate: conversionRate.toFixed(4),
      })
      .where(eq(tourStatistics.tourId, tourId));
  } else {
    await db.insert(tourStatistics).values({
      tourId,
      bookingCount: 1,
      totalRevenue: revenue,
    });
  }
}

/**
 * Mark a tour as learned
 */
export async function markTourAsLearned(tourId: number) {
  const db = await getDb();
  if (!db) {
    return;
  }

  const [existing] = await db
    .select()
    .from(tourStatistics)
    .where(eq(tourStatistics.tourId, tourId));

  if (existing) {
    await db
      .update(tourStatistics)
      .set({
        hasBeenLearned: true,
        lastLearnedAt: new Date(),
      })
      .where(eq(tourStatistics.tourId, tourId));
  } else {
    await db.insert(tourStatistics).values({
      tourId,
      hasBeenLearned: true,
      lastLearnedAt: new Date(),
    });
  }
}
