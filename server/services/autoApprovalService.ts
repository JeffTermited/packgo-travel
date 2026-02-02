/**
 * Auto Approval Rules Service
 * 
 * Manages automated skill review rules that can automatically
 * approve, reject, or flag skill suggestions based on defined conditions.
 */

import { getDb } from "../db";
import { 
  autoApprovalRules, 
  skillReviewQueue,
  agentSkills,
  type InsertAutoApprovalRule,
  type AutoApprovalRule,
  type SkillReviewQueue
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Types
export type RuleType = "confidence_threshold" | "source_type" | "keyword_count" | "skill_category" | "combined";
export type RuleAction = "auto_approve" | "auto_reject" | "flag_priority" | "notify_admin";

export interface RuleCondition {
  field: string;
  operator: ">" | ">=" | "<" | "<=" | "==" | "!=" | "in" | "not_in";
  value: string | number | string[];
}

export interface CreateRuleInput {
  ruleName: string;
  description?: string;
  ruleType: RuleType;
  conditions: RuleCondition[];
  action: RuleAction;
  priority?: number;
  createdBy: number;
}

export interface UpdateRuleInput {
  ruleName?: string;
  description?: string;
  conditions?: RuleCondition[];
  action?: RuleAction;
  priority?: number;
  isActive?: boolean;
}

export interface RuleEvaluationResult {
  ruleId: number;
  ruleName: string;
  action: RuleAction;
  matched: boolean;
}

/**
 * Create a new auto approval rule
 */
export async function createRule(input: CreateRuleInput): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(autoApprovalRules).values({
    ruleName: input.ruleName,
    description: input.description,
    ruleType: input.ruleType,
    conditions: JSON.stringify(input.conditions),
    action: input.action,
    priority: input.priority ?? 0,
    createdBy: input.createdBy,
    isActive: true,
  });
  
  const insertId = (result as any)[0]?.insertId || 0;
  return insertId;
}

/**
 * Update an existing rule
 */
export async function updateRule(ruleId: number, input: UpdateRuleInput): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = {};
  
  if (input.ruleName !== undefined) updateData.ruleName = input.ruleName;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.conditions !== undefined) updateData.conditions = JSON.stringify(input.conditions);
  if (input.action !== undefined) updateData.action = input.action;
  if (input.priority !== undefined) updateData.priority = input.priority;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;
  
  if (Object.keys(updateData).length > 0) {
    await db.update(autoApprovalRules)
      .set(updateData)
      .where(eq(autoApprovalRules.id, ruleId));
  }
}

/**
 * Delete a rule
 */
export async function deleteRule(ruleId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(autoApprovalRules)
    .where(eq(autoApprovalRules.id, ruleId));
}

/**
 * Get all rules
 */
export async function getAllRules(): Promise<AutoApprovalRule[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(autoApprovalRules)
    .orderBy(desc(autoApprovalRules.priority));
}

/**
 * Get active rules sorted by priority
 */
export async function getActiveRules(): Promise<AutoApprovalRule[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(autoApprovalRules)
    .where(eq(autoApprovalRules.isActive, true))
    .orderBy(desc(autoApprovalRules.priority));
}

/**
 * Evaluate a skill suggestion against all active rules
 */
export async function evaluateSkillSuggestion(suggestion: {
  confidence: number;
  sourceType: string;
  keywords: string[];
  skillCategory?: string;
}): Promise<RuleEvaluationResult | null> {
  const rules = await getActiveRules();
  
  for (const rule of rules) {
    const conditions: RuleCondition[] = JSON.parse(rule.conditions);
    const matched = evaluateConditions(conditions, suggestion);
    
    if (matched) {
      // Update rule statistics
      await incrementRuleTriggerCount(rule.id);
      
      return {
        ruleId: rule.id,
        ruleName: rule.ruleName,
        action: rule.action as RuleAction,
        matched: true,
      };
    }
  }
  
  return null;
}

/**
 * Evaluate conditions against a skill suggestion
 */
function evaluateConditions(
  conditions: RuleCondition[], 
  suggestion: {
    confidence: number;
    sourceType: string;
    keywords: string[];
    skillCategory?: string;
  }
): boolean {
  for (const condition of conditions) {
    const fieldValue = getFieldValue(condition.field, suggestion);
    if (!evaluateCondition(condition, fieldValue)) {
      return false;
    }
  }
  return true;
}

/**
 * Get field value from suggestion
 */
function getFieldValue(field: string, suggestion: any): any {
  switch (field) {
    case "confidence":
      return suggestion.confidence;
    case "sourceType":
      return suggestion.sourceType;
    case "keywordCount":
      return suggestion.keywords?.length || 0;
    case "skillCategory":
      return suggestion.skillCategory;
    default:
      return undefined;
  }
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(condition: RuleCondition, fieldValue: any): boolean {
  const { operator, value } = condition;
  
  switch (operator) {
    case ">":
      return fieldValue > value;
    case ">=":
      return fieldValue >= value;
    case "<":
      return fieldValue < value;
    case "<=":
      return fieldValue <= value;
    case "==":
      return fieldValue === value;
    case "!=":
      return fieldValue !== value;
    case "in":
      return Array.isArray(value) && value.includes(fieldValue);
    case "not_in":
      return Array.isArray(value) && !value.includes(fieldValue);
    default:
      return false;
  }
}

/**
 * Increment rule trigger count
 */
async function incrementRuleTriggerCount(ruleId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(autoApprovalRules)
    .set({
      timesTriggered: sql`${autoApprovalRules.timesTriggered} + 1`,
      lastTriggeredAt: new Date(),
    })
    .where(eq(autoApprovalRules.id, ruleId));
}

/**
 * Apply auto approval rules to a skill in the review queue
 */
export async function applyAutoApprovalRules(reviewQueueId: number): Promise<{
  applied: boolean;
  action?: RuleAction;
  ruleName?: string;
}> {
  const db = await getDb();
  if (!db) return { applied: false };
  
  // Get the skill from review queue
  const [queueItem] = await db.select()
    .from(skillReviewQueue)
    .where(eq(skillReviewQueue.id, reviewQueueId));
  
  if (!queueItem || queueItem.status !== "pending") {
    return { applied: false };
  }
  
  // Parse keywords
  const keywords = JSON.parse(queueItem.keywords || "[]");
  
  // Evaluate against rules
  const result = await evaluateSkillSuggestion({
    confidence: Number(queueItem.confidence || 0),
    sourceType: queueItem.sourceType,
    keywords,
    skillCategory: queueItem.category,
  });
  
  if (!result) {
    return { applied: false };
  }
  
  // Apply the action
  switch (result.action) {
    case "auto_approve":
      await autoApproveSkill(reviewQueueId);
      break;
    case "auto_reject":
      await autoRejectSkill(reviewQueueId, result.ruleName);
      break;
    case "flag_priority":
      await flagHighPriority(reviewQueueId);
      break;
    case "notify_admin":
      // TODO: Implement admin notification
      break;
  }
  
  return {
    applied: true,
    action: result.action,
    ruleName: result.ruleName,
  };
}

/**
 * Auto approve a skill
 */
async function autoApproveSkill(reviewQueueId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // Get the queue item
  const [queueItem] = await db.select()
    .from(skillReviewQueue)
    .where(eq(skillReviewQueue.id, reviewQueueId));
  
  if (!queueItem) return;
  
  // Create the skill
  const skillResult = await db.insert(agentSkills).values({
    skillType: queueItem.skillType as any,
    skillCategory: "technique",
    skillName: queueItem.skillName,
    keywords: queueItem.keywords,
    rules: queueItem.rules,
    description: queueItem.description,
    isActive: true,
    usageCount: 0,
    successCount: 0,
    lastUsedAt: null,
    confidence: queueItem.confidence,
  });
  
  const createdSkillId = (skillResult as any)[0]?.insertId || 0;
  
  // Update queue item status
  await db.update(skillReviewQueue)
    .set({
      status: "approved",
      reviewNotes: "Auto-approved by rule",
      reviewedAt: new Date(),
      createdSkillId,
    })
    .where(eq(skillReviewQueue.id, reviewQueueId));
}

/**
 * Auto reject a skill
 */
async function autoRejectSkill(reviewQueueId: number, ruleName: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(skillReviewQueue)
    .set({
      status: "rejected",
      reviewNotes: `Auto-rejected by rule: ${ruleName}`,
      reviewedAt: new Date(),
    })
    .where(eq(skillReviewQueue.id, reviewQueueId));
}

/**
 * Flag a skill as high priority
 */
async function flagHighPriority(reviewQueueId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(skillReviewQueue)
    .set({
      priority: "high",
    })
    .where(eq(skillReviewQueue.id, reviewQueueId));
}

/**
 * Get rule statistics
 */
export async function getRuleStatistics(): Promise<{
  totalRules: number;
  activeRules: number;
  totalTriggered: number;
  rulesByType: Record<string, number>;
  rulesByAction: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) return {
    totalRules: 0,
    activeRules: 0,
    totalTriggered: 0,
    rulesByType: {},
    rulesByAction: {},
  };
  
  const rules = await db.select().from(autoApprovalRules);
  
  const stats = {
    totalRules: rules.length,
    activeRules: rules.filter(r => r.isActive).length,
    totalTriggered: rules.reduce((sum, r) => sum + r.timesTriggered, 0),
    rulesByType: {} as Record<string, number>,
    rulesByAction: {} as Record<string, number>,
  };
  
  for (const rule of rules) {
    stats.rulesByType[rule.ruleType] = (stats.rulesByType[rule.ruleType] || 0) + 1;
    stats.rulesByAction[rule.action] = (stats.rulesByAction[rule.action] || 0) + 1;
  }
  
  return stats;
}

/**
 * Initialize default rules
 */
export async function initializeDefaultRules(adminId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // Check if rules already exist
  const existingRules = await db.select().from(autoApprovalRules);
  if (existingRules.length > 0) return;
  
  // Create default rules
  const defaultRules: CreateRuleInput[] = [
    {
      ruleName: "高信心度自動批准",
      description: "信心度 >= 90% 的技能建議自動批准",
      ruleType: "confidence_threshold",
      conditions: [
        { field: "confidence", operator: ">=", value: 0.9 }
      ],
      action: "auto_approve",
      priority: 100,
      createdBy: adminId,
    },
    {
      ruleName: "低信心度自動拒絕",
      description: "信心度 < 50% 的技能建議自動拒絕",
      ruleType: "confidence_threshold",
      conditions: [
        { field: "confidence", operator: "<", value: 0.5 }
      ],
      action: "auto_reject",
      priority: 90,
      createdBy: adminId,
    },
    {
      ruleName: "排程學習高優先級",
      description: "來自排程學習的建議標記為高優先級",
      ruleType: "source_type",
      conditions: [
        { field: "sourceType", operator: "==", value: "scheduled" }
      ],
      action: "flag_priority",
      priority: 50,
      createdBy: adminId,
    },
  ];
  
  for (const rule of defaultRules) {
    await createRule(rule);
  }
}
