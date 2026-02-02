/**
 * AI Chat Skill Integration Service
 * 
 * Integrates skill matching and triggering into AI customer service conversations.
 * Uses Claude for intelligent skill matching and response generation.
 */

import { getDb } from "../db";
import { agentSkills } from "../../drizzle/schema";
import { eq, and, like, or, sql } from "drizzle-orm";
import { recordSkillTrigger, type ContextType } from "./skillPerformanceService";
import { getHaikuAgent, ClaudeAgent } from "../agents/claudeAgent";

// Types
export interface SkillMatch {
  skillId: number;
  skillName: string;
  skillType: string;
  keywords: string[];
  matchedKeywords: string[];
  confidence: number;
  responseTemplate?: string;
  metadata?: Record<string, any>;
}

export interface ChatContext {
  message: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  userId?: number;
  sessionId?: string;
}

export interface SkillEnhancedResponse {
  response: string;
  triggeredSkills: SkillMatch[];
  usageLogIds: number[];
}

/**
 * Get all active skills from the database
 */
export async function getActiveSkills(): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  
  const skills = await db.select()
    .from(agentSkills)
    .where(eq(agentSkills.isActive, true));
  
  return skills;
}

/**
 * Match user message against available skills
 * Uses keyword matching and Claude for intelligent matching
 */
export async function matchSkills(
  message: string,
  skills: any[]
): Promise<SkillMatch[]> {
  const matches: SkillMatch[] = [];
  const messageLower = message.toLowerCase();
  
  for (const skill of skills) {
    const keywords = skill.keywords ? JSON.parse(skill.keywords) : [];
    const matchedKeywords: string[] = [];
    
    // Check keyword matches
    for (const keyword of keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    }
    
    if (matchedKeywords.length > 0) {
      // Calculate confidence based on matched keywords ratio
      const confidence = matchedKeywords.length / Math.max(keywords.length, 1);
      
      matches.push({
        skillId: skill.id,
        skillName: skill.skillName,
        skillType: skill.skillType,
        keywords,
        matchedKeywords,
        confidence: Math.min(confidence * 1.5, 1), // Boost confidence slightly
        responseTemplate: skill.responseTemplate,
        metadata: skill.metadata ? JSON.parse(skill.metadata) : undefined,
      });
    }
  }
  
  // Sort by confidence (highest first)
  matches.sort((a, b) => b.confidence - a.confidence);
  
  return matches;
}

/**
 * Use Claude to intelligently match skills based on semantic understanding
 */
export async function intelligentSkillMatch(
  message: string,
  skills: any[]
): Promise<SkillMatch[]> {
  if (skills.length === 0) return [];
  
  const agent = getHaikuAgent();
  
  // Prepare skill descriptions for Claude
  const skillDescriptions = skills.map(s => ({
    id: s.id,
    name: s.skillName,
    type: s.skillType,
    keywords: s.keywords ? JSON.parse(s.keywords) : [],
    description: s.description || "",
  }));
  
  const prompt = `分析以下用戶訊息，並判斷哪些技能應該被觸發。

用戶訊息：
"${message}"

可用技能列表：
${JSON.stringify(skillDescriptions, null, 2)}

請返回一個 JSON 陣列，包含應該觸發的技能 ID 和信心度（0-1）。
只返回信心度 > 0.5 的技能。
格式：[{"skillId": 1, "confidence": 0.8, "reason": "匹配原因"}]

如果沒有匹配的技能，返回空陣列 []。`;

  try {
    const result = await agent.sendMessage(prompt, {
      systemPrompt: "你是一個技能匹配專家。根據用戶訊息的語義，判斷哪些技能應該被觸發。只返回 JSON 格式的結果。",
      temperature: 0.3,
    });
    
    if (!result.success || !result.content) {
      return [];
    }
    
    // Parse Claude's response
    const jsonMatch = result.content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    
    const matchedSkillIds = JSON.parse(jsonMatch[0]) as Array<{
      skillId: number;
      confidence: number;
      reason: string;
    }>;
    
    // Convert to SkillMatch format
    const matches: SkillMatch[] = [];
    for (const match of matchedSkillIds) {
      const skill = skills.find(s => s.id === match.skillId);
      if (skill && match.confidence > 0.5) {
        matches.push({
          skillId: skill.id,
          skillName: skill.skillName,
          skillType: skill.skillType,
          keywords: skill.keywords ? JSON.parse(skill.keywords) : [],
          matchedKeywords: [], // Claude-based matching doesn't use keyword matching
          confidence: match.confidence,
          responseTemplate: skill.responseTemplate,
          metadata: skill.metadata ? JSON.parse(skill.metadata) : undefined,
        });
      }
    }
    
    return matches;
  } catch (error) {
    console.error("[AIChatSkillService] Intelligent skill match error:", error);
    return [];
  }
}

/**
 * Generate skill-enhanced response using Claude
 */
export async function generateSkillEnhancedResponse(
  context: ChatContext,
  matchedSkills: SkillMatch[]
): Promise<string> {
  const agent = getHaikuAgent();
  
  // Build skill context for Claude
  let skillContext = "";
  if (matchedSkills.length > 0) {
    skillContext = `
你已識別到以下相關技能可以幫助回答用戶問題：
${matchedSkills.map(s => `- ${s.skillName} (${s.skillType}): 關鍵字 ${s.matchedKeywords.join(", ")}`).join("\n")}

請根據這些技能的專業知識來增強你的回答。`;
  }
  
  const systemPrompt = `你是 PACK&GO 旅行社的專業旅遊顧問 AI。你的職責是：
1. 幫助客戶規劃旅程並推薦目的地
2. 回答關於旅遊套餐、簽證要求和旅遊小貼士的問題
3. 根據客戶偏好提供個性化建議
4. 友善、專業、樂於助人
5. 始終使用繁體中文回答

${skillContext}

重要指南：
- 只專注於旅遊相關話題
- 提供具體、可行的建議
- 需要時詢問澄清問題
- 適當時推薦 PACK&GO 的服務`;

  // Build conversation messages
  const messages = [
    ...(context.conversationHistory || []).slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    {
      role: "user" as const,
      content: context.message,
    },
  ];
  
  try {
    const result = await agent.sendConversation(
      messages.map(m => ({ role: m.role, content: m.content })),
      {
        systemPrompt,
        temperature: 0.7,
      }
    );
    
    if (result.success && result.content) {
      return result.content;
    }
    
    return "抱歉，我無法處理您的請求。請稍後再試。";
  } catch (error) {
    console.error("[AIChatSkillService] Generate response error:", error);
    return "抱歉，我無法處理您的請求。請稍後再試。";
  }
}

/**
 * Process a chat message with skill integration
 * Main entry point for skill-enhanced AI chat
 */
export async function processMessageWithSkills(
  context: ChatContext
): Promise<SkillEnhancedResponse> {
  const startTime = Date.now();
  const usageLogIds: number[] = [];
  
  try {
    // 1. Get all active skills
    const skills = await getActiveSkills();
    
    // 2. Match skills using both keyword and intelligent matching
    const keywordMatches = await matchSkills(context.message, skills);
    const intelligentMatches = await intelligentSkillMatch(context.message, skills);
    
    // 3. Merge and deduplicate matches
    const allMatches = [...keywordMatches];
    for (const match of intelligentMatches) {
      if (!allMatches.find(m => m.skillId === match.skillId)) {
        allMatches.push(match);
      } else {
        // Update confidence if intelligent match has higher confidence
        const existing = allMatches.find(m => m.skillId === match.skillId);
        if (existing && match.confidence > existing.confidence) {
          existing.confidence = match.confidence;
        }
      }
    }
    
    // 4. Sort by confidence and take top 3
    const topMatches = allMatches
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
    
    // 5. Record skill triggers
    for (const match of topMatches) {
      const processingTime = Date.now() - startTime;
      const logId = await recordSkillTrigger({
        skillId: match.skillId,
        skillName: match.skillName,
        skillType: match.skillType,
        contextType: "chat" as ContextType,
        contextId: context.sessionId,
        inputText: context.message,
        matchedKeywords: match.matchedKeywords,
        userId: context.userId,
        sessionId: context.sessionId,
        wasSuccessful: true,
        processingTimeMs: processingTime,
      });
      usageLogIds.push(logId);
    }
    
    // 6. Generate skill-enhanced response
    const response = await generateSkillEnhancedResponse(context, topMatches);
    
    return {
      response,
      triggeredSkills: topMatches,
      usageLogIds,
    };
  } catch (error) {
    console.error("[AIChatSkillService] Process message error:", error);
    
    // Fallback to basic response
    return {
      response: "抱歉，我無法處理您的請求。請稍後再試。",
      triggeredSkills: [],
      usageLogIds: [],
    };
  }
}

/**
 * Record user feedback for a chat response
 */
export async function recordChatFeedback(
  usageLogIds: number[],
  feedback: "positive" | "negative",
  comment?: string
): Promise<void> {
  const { recordUserFeedback } = await import("./skillPerformanceService");
  
  for (const logId of usageLogIds) {
    await recordUserFeedback({
      usageLogId: logId,
      feedback,
      comment,
    });
  }
}

/**
 * Record conversion from a chat session
 */
export async function recordChatConversion(
  usageLogIds: number[],
  conversionType: "booking" | "inquiry" | "favorite" | "share",
  conversionId?: number
): Promise<void> {
  const { recordConversion } = await import("./skillPerformanceService");
  
  for (const logId of usageLogIds) {
    await recordConversion({
      usageLogId: logId,
      conversionType,
      conversionId,
    });
  }
}
