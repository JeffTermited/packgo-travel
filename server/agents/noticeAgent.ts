/**
 * Notice Agent
 * 生成注意事項
 * 
 * Claude Hybrid Architecture:
 * - Uses Claude 3 Haiku for fast, cost-effective extraction
 * - Uses native JSON Schema for guaranteed valid output
 * - No more JSON parsing errors or regex cleaning
 */

import { getHaikuAgent, JSONSchema, STRICT_DATA_FIDELITY_RULES } from "./claudeAgent";
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
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// JSON Schema for Notice output
const NOTICE_SCHEMA: JSONSchema = {
  type: 'object',
  properties: {
    preparation: {
      type: 'array',
      description: '行前準備提醒，如護照、簽證、貨幣、藥品等',
      items: {
        type: 'string',
        description: '單條行前準備提醒',
        maxLength: 50,
      },
    },
    culturalNotes: {
      type: 'array',
      description: '當地文化禁忌與習俗，如宗教、禮儀、穿著等',
      items: {
        type: 'string',
        description: '單條文化注意事項',
        maxLength: 50,
      },
    },
    healthSafety: {
      type: 'array',
      description: '健康安全注意事項，如飲食、保險、衛生等',
      items: {
        type: 'string',
        description: '單條健康安全提醒',
        maxLength: 50,
      },
    },
    emergency: {
      type: 'array',
      description: '緊急應對措施，如緊急電話、駐外單位、遺失護照處理等',
      items: {
        type: 'string',
        description: '單條緊急聯絡資訊',
        maxLength: 50,
      },
    },
  },
  required: ['preparation', 'culturalNotes', 'healthSafety', 'emergency'],
  additionalProperties: false,
};

// Type for the schema output
interface NoticeSchemaOutput {
  preparation: string[];
  culturalNotes: string[];
  healthSafety: string[];
  emergency: string[];
}

/**
 * Notice Agent
 * 使用 Claude 3 Haiku + JSON Schema 生成注意事項
 */
export class NoticeAgent {
  private skillInstructions: string;

  constructor() {
    this.skillInstructions = getKeyInstructions('NoticeAgent');
    console.log('[NoticeAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
    console.log('[NoticeAgent] Using Claude 3 Haiku with JSON Schema');
  }

  /**
   * Execute notice generation
   */
  async execute(
    rawData: any
  ): Promise<NoticeAgentResult> {
    console.log("[NoticeAgent] Starting notice generation with Claude...");
    
    try {
      // Validate input data
      if (!rawData || !rawData.location) {
        console.warn("[NoticeAgent] Insufficient location data, returning empty");
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
      
      const result = await this.generateNoticeWithClaude(rawData.location);
      
      if (!result.success || !result.data) {
        console.warn("[NoticeAgent] Claude generation failed, using default template");
        return {
          success: true,
          data: this.getDefaultNotice(rawData.location),
          usage: result.usage,
        };
      }
      
      console.log("[NoticeAgent] Notice generated successfully with Claude");
      
      return {
        success: true,
        data: result.data,
        usage: result.usage,
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
   * Generate notice using Claude 3 Haiku with JSON Schema
   * This guarantees valid JSON output - no parsing errors possible
   */
  private async generateNoticeWithClaude(
    locationData: any
  ): Promise<{
    success: boolean;
    data?: NoticeSchemaOutput;
    usage?: { inputTokens: number; outputTokens: number };
  }> {
    console.log("[NoticeAgent] Calling Claude 3 Haiku with JSON Schema...");
    
    const prompt = `請根據以下目的地資訊，生成旅遊注意事項。

目的地資訊：
${JSON.stringify(locationData, null, 2)}

要求：
1. 每個類別提供 3-4 條實用的注意事項
2. 每條注意事項控制在 50 字以內
3. 內容必須與目的地相關且實用
4. 如果某些資訊不確定，請標記為「請查詢最新資訊」
5. 緊急聯絡電話請使用真實的官方號碼

請直接提取並返回結構化的注意事項。`;

    const systemPrompt = `${NOTICE_SKILL}

你是一位專業的旅遊顧問，擅長為旅客提供實用的旅遊注意事項。
你的建議必須基於真實資訊，不能編造任何內容。

${STRICT_DATA_FIDELITY_RULES}`;

    try {
      const claudeAgent = getHaikuAgent();

      claudeAgent.setContext('NoticeAgent', 'notice_generation');
      
      const result = await claudeAgent.sendStructuredMessage<NoticeSchemaOutput>(
        prompt,
        NOTICE_SCHEMA,
        {
          systemPrompt,
          maxTokens: 2048,
          temperature: 0.3, // Low temperature for consistent output
          schemaName: 'notice_output',
          schemaDescription: '旅遊注意事項結構化輸出',
          strictDataFidelity: true,
        }
      );

      if (!result.success || !result.data) {
        console.error("[NoticeAgent] Claude returned error:", result.error);
        return {
          success: false,
          usage: result.usage,
        };
      }

      // Validate and normalize the output
      const normalizedData = this.normalizeNotice(result.data);
      
      console.log("[NoticeAgent] Claude response validated successfully");
      console.log(`[NoticeAgent] Token usage - Input: ${result.usage?.inputTokens}, Output: ${result.usage?.outputTokens}`);

      return {
        success: true,
        data: normalizedData,
        usage: result.usage,
      };
    } catch (error) {
      console.error("[NoticeAgent] Claude API error:", error);
      return {
        success: false,
      };
    }
  }
  
  /**
   * Normalize notice structure to ensure all fields are arrays
   */
  private normalizeNotice(notice: NoticeSchemaOutput): NoticeSchemaOutput {
    const toArray = (value: any): string[] => {
      if (Array.isArray(value)) {
        return value.filter(item => typeof item === 'string').slice(0, 5); // Max 5 items per category
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

  /**
   * Get default notice template when Claude fails
   */
  private getDefaultNotice(locationData: any): NoticeSchemaOutput {
    const country = locationData?.country || "目的地";
    
    return {
      preparation: [
        "請確認護照效期至少6個月以上",
        "建議提前兌換當地貨幣或準備信用卡",
        "攜帶常用藥品及個人用品",
        "確認簽證要求並提前辦理"
      ],
      culturalNotes: [
        "尊重當地文化習俗與宗教信仰",
        "進入宗教場所請著裝得體",
        "拍照前請先詢問是否允許",
        "遵守當地法律規定"
      ],
      healthSafety: [
        "建議購買旅遊保險",
        "注意飲食衛生，避免生食",
        "隨身攜帶緊急聯絡資訊",
        "保管好個人財物"
      ],
      emergency: [
        `${country}緊急電話：請查詢當地緊急服務號碼`,
        "駐外館處24小時急難救助電話：請查詢外交部網站",
        "遺失護照請立即聯絡領隊及駐外單位",
        "如遇緊急狀況請保持冷靜並尋求協助"
      ]
    };
  }
}
