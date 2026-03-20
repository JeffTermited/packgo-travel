/**
 * LLM 用量監控服務
 * 記錄每次 Claude API 呼叫的 token 用量與費用估算
 *
 * 費用參考（2025 年 Anthropic 定價，USD per 1M tokens）：
 *   claude-3-5-haiku-20241022:  input $0.80, output $4.00, cache_write $1.00, cache_read $0.08
 *   claude-3-5-sonnet-20241022: input $3.00, output $15.00, cache_write $3.75, cache_read $0.30
 *   claude-opus-4-5:            input $15.00, output $75.00, cache_write $18.75, cache_read $1.50
 */
import { getDb } from "./db";
import { llmUsageLogs } from "../drizzle/schema";

// 費用定價表（USD per 1M tokens）
const PRICING: Record<string, {
  input: number;
  output: number;
  cacheWrite: number;
  cacheRead: number;
}> = {
  "claude-3-5-haiku-20241022": {
    input: 0.80,
    output: 4.00,
    cacheWrite: 1.00,
    cacheRead: 0.08,
  },
  "claude-3-5-sonnet-20241022": {
    input: 3.00,
    output: 15.00,
    cacheWrite: 3.75,
    cacheRead: 0.30,
  },
  "claude-opus-4-5": {
    input: 15.00,
    output: 75.00,
    cacheWrite: 18.75,
    cacheRead: 1.50,
  },
  // Gemini fallback（透過 invokeLLM）
  "gemini-2.5-flash": {
    input: 0.075,
    output: 0.30,
    cacheWrite: 0,
    cacheRead: 0,
  },
};

/**
 * 估算費用（USD）
 */
function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheCreationTokens: number,
  cacheReadTokens: number
): string {
  const pricing = PRICING[model] ?? PRICING["claude-3-5-haiku-20241022"];
  const cost =
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output +
    (cacheCreationTokens / 1_000_000) * pricing.cacheWrite +
    (cacheReadTokens / 1_000_000) * pricing.cacheRead;
  return cost.toFixed(6);
}

export interface LogLlmUsageParams {
  agentName: string;
  taskType?: string;
  taskId?: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens?: number;
  cacheReadInputTokens?: number;
  processingTimeMs?: number;
  wasFromCache?: boolean;
  userId?: number;
}

/**
 * 記錄 LLM 用量（非阻塞，失敗不影響主流程）
 */
export async function logLlmUsage(params: LogLlmUsageParams): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const cacheCreate = params.cacheCreationInputTokens ?? 0;
    const cacheRead = params.cacheReadInputTokens ?? 0;
    const totalTokens = params.inputTokens + params.outputTokens + cacheCreate + cacheRead;
    const estimatedCostUsd = estimateCost(
      params.model,
      params.inputTokens,
      params.outputTokens,
      cacheCreate,
      cacheRead
    );

    await db.insert(llmUsageLogs).values({
      agentName: params.agentName,
      taskType: params.taskType,
      taskId: params.taskId,
      model: params.model,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      cacheCreationInputTokens: cacheCreate,
      cacheReadInputTokens: cacheRead,
      totalTokens,
      estimatedCostUsd,
      processingTimeMs: params.processingTimeMs,
      wasFromCache: params.wasFromCache ?? false,
      userId: params.userId,
      createdAt: new Date(),
    });

    // 只在 debug 模式下輸出
    if (process.env.LLM_USAGE_DEBUG === 'true') {
      console.log(`[LlmUsage] ${params.agentName} | ${params.model} | in:${params.inputTokens} out:${params.outputTokens} cache_r:${cacheRead} | $${estimatedCostUsd}`);
    }
  } catch (error) {
    // 靜默失敗，不影響主流程
    console.warn('[LlmUsage] Failed to log usage:', error);
  }
}

/**
 * 查詢用量統計（供管理後台使用）
 */
export async function getLlmUsageStats(options?: {
  startDate?: Date;
  endDate?: Date;
  agentName?: string;
  taskType?: string;
}): Promise<{
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalTokens: number;
  totalCostUsd: string;
  cacheHitRate: number;
  byAgent: Record<string, { calls: number; tokens: number; costUsd: string }>;
}> {
  try {
    const db = await getDb();
    if (!db) return getEmptyStats();

    const { gte, lte, eq, and: drizzleAnd } = await import("drizzle-orm");
    const conditions = [];

    if (options?.startDate) conditions.push(gte(llmUsageLogs.createdAt, options.startDate));
    if (options?.endDate) conditions.push(lte(llmUsageLogs.createdAt, options.endDate));
    if (options?.agentName) conditions.push(eq(llmUsageLogs.agentName, options.agentName));
    if (options?.taskType) conditions.push(eq(llmUsageLogs.taskType, options.taskType));

    const rows = conditions.length > 0
      ? await db.select().from(llmUsageLogs).where(drizzleAnd(...conditions))
      : await db.select().from(llmUsageLogs);

    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCacheReadTokens = 0;
    let totalTokens = 0;
    let totalCostUsd = 0;
    let cacheHits = 0;
    const byAgent: Record<string, { calls: number; tokens: number; costUsd: number }> = {};

    for (const row of rows) {
      totalInputTokens += row.inputTokens;
      totalOutputTokens += row.outputTokens;
      totalCacheReadTokens += row.cacheReadInputTokens;
      totalTokens += row.totalTokens;
      totalCostUsd += parseFloat(row.estimatedCostUsd ?? '0');
      if (row.wasFromCache) cacheHits++;

      if (!byAgent[row.agentName]) {
        byAgent[row.agentName] = { calls: 0, tokens: 0, costUsd: 0 };
      }
      byAgent[row.agentName].calls++;
      byAgent[row.agentName].tokens += row.totalTokens;
      byAgent[row.agentName].costUsd += parseFloat(row.estimatedCostUsd ?? '0');
    }

    const byAgentFormatted: Record<string, { calls: number; tokens: number; costUsd: string }> = {};
    for (const [agent, stats] of Object.entries(byAgent)) {
      byAgentFormatted[agent] = {
        calls: stats.calls,
        tokens: stats.tokens,
        costUsd: stats.costUsd.toFixed(6),
      };
    }

    return {
      totalCalls: rows.length,
      totalInputTokens,
      totalOutputTokens,
      totalCacheReadTokens,
      totalTokens,
      totalCostUsd: totalCostUsd.toFixed(6),
      cacheHitRate: rows.length > 0 ? (cacheHits / rows.length) : 0,
      byAgent: byAgentFormatted,
    };
  } catch (error) {
    console.error('[LlmUsage] Failed to get stats:', error);
    return getEmptyStats();
  }
}

function getEmptyStats() {
  return {
    totalCalls: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCacheReadTokens: 0,
    totalTokens: 0,
    totalCostUsd: '0.000000',
    cacheHitRate: 0,
    byAgent: {},
  };
}
