/**
 * Notice Agent
 * 生成注意事項
 */

import { invokeLLM } from "../_core/llm";
import { getKeyInstructions } from "./skillLoader";
import { NOTICE_SKILL } from "./skillLibrary";

export interface NoticeAgentResult {
  success: boolean;
  data?: {
    preparation: string[]; // 行前準備提醒
    culturalNotes: string[]; // 當地文化禁忌
    healthSafety: string[]; // 健康安全注意
    emergency: string[]; // 緊急應對措施
  };
  error?: string;
}

/**
 * Notice Agent
 * 使用 NOTICE_SKILL 生成注意事項
 */
export class NoticeAgent {
  private skillInstructions: string;

  constructor() {
    this.skillInstructions = getKeyInstructions('NoticeAgent');
    console.log('[NoticeAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
  }

  /**
   * Execute notice generation
   */
  async execute(
    rawData: any
  ): Promise<NoticeAgentResult> {
    console.log("[NoticeAgent] Starting notice generation...");
    
    try {
      // Validate input data
      if (!rawData || !rawData.location) {
        console.warn("[NoticeAgent] Insufficient location data, returning null");
        return {
          success: true,
          data: {
            preparation: [],
            culturalNotes: [],
            healthSafety: [],
            emergency: [],
          },
        };
      }
      
      const notice = await this.generateNotice(rawData.location);
      
      if (!notice) {
        return {
          success: true,
          data: {
            preparation: [],
            culturalNotes: [],
            healthSafety: [],
            emergency: [],
          },
        };
      }
      
      console.log("[NoticeAgent] Notice generated successfully");
      
      return {
        success: true,
        data: notice,
      };
    } catch (error) {
      console.error("[NoticeAgent] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
  /**
   * Generate notice with retry mechanism
   */
  private async generateNotice(
    locationData: any,
    retryCount: number = 0
  ): Promise<{
    preparation: string[];
    culturalNotes: string[];
    healthSafety: string[];
    emergency: string[];
  } | null> {
    const MAX_RETRIES = 2;
    
    try {
      const prompt = `請根據以下資料生成注意事項：

原始資料：
${JSON.stringify(locationData, null, 2)}

請以 JSON 格式回傳，包含以下欄位：
{
  "preparation": [
    "請確認護照有效期限至少6個月以上",
    "建議攜帶輕便保暖外套（當地早晚溫差大）",
    "請攜帶個人常用藥品及暈車藥",
    "建議攜帶萬用轉接頭（電壓 100V）"
  ],
  "culturalNotes": [
    "進入寺廟請脫鞋，並保持安靜",
    "用餐時請勿大聲喧嘩",
    "搭乘大眾運輸工具請將手機調為靜音",
    "泡溫泉前請先淋浴，並將毛巾放在頭上"
  ],
  "healthSafety": [
    "當地氣候乾燥，請多補充水分",
    "建議攜帶口罩（花粉季節）",
    "請注意飲食衛生，避免生食",
    "建議投保旅遊平安保險及醫療保險"
  ],
  "emergency": [
    "緊急聯絡電話：領隊 +81-90-xxxx-xxxx",
    "台灣駐日代表處：+81-3-3280-7811",
    "日本報警電話：110，救護車：119",
    "遺失護照請立即聯絡領隊及駐外單位"
  ]
}

注意：
1. 注意事項總字數必須控制在 200-300 字之間
2. 每個類別不超過 80 字
3. 重點放在最重要和最實用的提醒
4. 如果資料不足，請回傳 null`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: NOTICE_SKILL },
          { role: "user", content: prompt },
        ],
      });
      
      const content = response.choices[0].message.content;
      
      // Handle content type (string or array)
      let contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      
      if (!contentStr || contentStr.trim().toLowerCase() === "null") {
        console.warn("[NoticeAgent] Insufficient data, returning null");
        return null;
      }
      
      // Remove markdown code blocks if present
      contentStr = contentStr.trim();
      if (contentStr.startsWith("```json")) {
        contentStr = contentStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (contentStr.startsWith("```")) {
        contentStr = contentStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      
      // Parse JSON response
      const notice = JSON.parse(contentStr);
      
      // Validate and normalize notice structure
      const normalizedNotice = this.normalizeNotice(notice);
      
      // Validate word count (total should be 200-300 characters)
      const totalWords = this.calculateTotalWords(normalizedNotice);
      
      if (totalWords < 200 || totalWords > 300) {
        console.warn(`[NoticeAgent] Notice word count (${totalWords}) out of range, retrying...`);
        
        if (retryCount < MAX_RETRIES) {
          return this.generateNotice(locationData, retryCount + 1);
        } else {
          console.warn(`[NoticeAgent] Notice word count still out of range after ${MAX_RETRIES} retries, using truncation`);
          return this.truncateNotice(normalizedNotice, 300);
        }
      }
      
      return normalizedNotice;
    } catch (error) {
      console.error("[NoticeAgent] Error generating notice:", error);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`[NoticeAgent] Retrying notice generation (${retryCount + 1}/${MAX_RETRIES})...`);
        return this.generateNotice(locationData, retryCount + 1);
      }
      
      return null;
    }
  }
  
  /**
   * Calculate total word count of notice
   */
  private calculateTotalWords(notice: any): number {
    let total = 0;
    
    // Preparation
    notice.preparation.forEach((item: string) => {
      total += item.length;
    });
    
    // Cultural notes
    notice.culturalNotes.forEach((item: string) => {
      total += item.length;
    });
    
    // Health & safety
    notice.healthSafety.forEach((item: string) => {
      total += item.length;
    });
    
    // Emergency
    notice.emergency.forEach((item: string) => {
      total += item.length;
    });
    
    return total;
  }
  
  /**
   * Truncate notice to fit word count limit
   */
  private truncateNotice(notice: any, maxWords: number): any {
    // Simple truncation strategy: truncate last item in each category
    const currentWords = this.calculateTotalWords(notice);
    
    if (currentWords <= maxWords) {
      return notice;
    }
    
    const excessWords = currentWords - maxWords;
    const wordsPerCategory = Math.ceil(excessWords / 4);
    
    // Truncate last item in each category
    if (notice.preparation.length > 0) {
      const lastIndex = notice.preparation.length - 1;
      notice.preparation[lastIndex] = notice.preparation[lastIndex].slice(0, notice.preparation[lastIndex].length - wordsPerCategory) + "...";
    }
    
    if (notice.culturalNotes.length > 0) {
      const lastIndex = notice.culturalNotes.length - 1;
      notice.culturalNotes[lastIndex] = notice.culturalNotes[lastIndex].slice(0, notice.culturalNotes[lastIndex].length - wordsPerCategory) + "...";
    }
    
    if (notice.healthSafety.length > 0) {
      const lastIndex = notice.healthSafety.length - 1;
      notice.healthSafety[lastIndex] = notice.healthSafety[lastIndex].slice(0, notice.healthSafety[lastIndex].length - wordsPerCategory) + "...";
    }
    
    if (notice.emergency.length > 0) {
      const lastIndex = notice.emergency.length - 1;
      notice.emergency[lastIndex] = notice.emergency[lastIndex].slice(0, notice.emergency[lastIndex].length - wordsPerCategory) + "...";
    }
    
    return notice;
  }
  
  /**
   * Normalize notice structure to ensure all fields are arrays
   */
  private normalizeNotice(notice: any): {
    preparation: string[];
    culturalNotes: string[];
    healthSafety: string[];
    emergency: string[];
  } {
    const toArray = (value: any): string[] => {
      if (Array.isArray(value)) {
        return value.filter(item => typeof item === 'string');
      }
      if (typeof value === 'string') {
        return [value];
      }
      return [];
    };
    
    return {
      preparation: toArray(notice?.preparation),
      culturalNotes: toArray(notice?.culturalNotes),
      healthSafety: toArray(notice?.healthSafety),
      emergency: toArray(notice?.emergency),
    };
  }
}
