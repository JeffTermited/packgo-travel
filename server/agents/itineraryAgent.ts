/**
 * Itinerary Agent
 * 生成每日行程詳細規劃
 * 
 * Claude Hybrid Architecture:
 * - Uses Claude 3.5 Sonnet for complex logic and reasoning
 * - Uses native JSON Schema for guaranteed valid output
 * - Includes STRICT_DATA_FIDELITY_RULES to prevent hallucinations
 */

import { getSonnetAgent, JSONSchema, STRICT_DATA_FIDELITY_RULES } from "./claudeAgent";
import { ITINERARY_SKILL } from "./skillLibrary";
import { getKeyInstructions } from "./skillLoader";

export interface ItineraryAgentResult {
  success: boolean;
  data?: {
    dailyItineraries: DailyItinerary[];
  };
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface DailyItinerary {
  day: number;
  title: string; // 例如：「Day 1：抵達東京，淺草寺巡禮」
  activities: Activity[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  accommodation: string;
}

export interface Activity {
  time: string; // 例如：「09:00-12:00」
  title: string; // 例如：「參觀淺草寺」
  description: string; // 例如：「探索東京最古老的寺廟，欣賞雷門和五重塔」
  transportation: string; // 例如：「搭乘地鐵銀座線」
  location: string; // 例如：「淺草寺」
}

// JSON Schema for Daily Itinerary
const DAILY_ITINERARY_SCHEMA: JSONSchema = {
  type: 'object',
  properties: {
    day: { 
      type: 'integer', 
      description: '天數編號',
      minimum: 1,
    },
    title: { 
      type: 'string', 
      description: '當日行程標題，例如「Day 1：抵達東京，淺草寺巡禮」',
      maxLength: 50,
    },
    activities: {
      type: 'array',
      description: '當日活動列表',
      items: {
        type: 'object',
        properties: {
          time: { 
            type: 'string', 
            description: '活動時間，例如「09:00-12:00」',
            maxLength: 20,
          },
          title: { 
            type: 'string', 
            description: '活動標題',
            maxLength: 30,
          },
          description: { 
            type: 'string', 
            description: '活動描述（50-80字）',
            maxLength: 100,
          },
          transportation: { 
            type: 'string', 
            description: '交通方式',
            maxLength: 30,
          },
          location: { 
            type: 'string', 
            description: '活動地點',
            maxLength: 30,
          },
        },
        required: ['time', 'title', 'description', 'transportation', 'location'],
        additionalProperties: false,
      },
    },
    meals: {
      type: 'object',
      description: '當日餐食安排',
      properties: {
        breakfast: { type: 'string', description: '早餐安排', maxLength: 50 },
        lunch: { type: 'string', description: '午餐安排', maxLength: 50 },
        dinner: { type: 'string', description: '晚餐安排', maxLength: 50 },
      },
      required: ['breakfast', 'lunch', 'dinner'],
      additionalProperties: false,
    },
    accommodation: { 
      type: 'string', 
      description: '住宿安排',
      maxLength: 50,
    },
  },
  required: ['day', 'title', 'activities', 'meals', 'accommodation'],
  additionalProperties: false,
};

// JSON Schema for multiple days itinerary
const ITINERARIES_SCHEMA: JSONSchema = {
  type: 'object',
  properties: {
    dailyItineraries: {
      type: 'array',
      description: '每日行程列表',
      items: DAILY_ITINERARY_SCHEMA,
    },
  },
  required: ['dailyItineraries'],
  additionalProperties: false,
};

// Type for the schema output
interface ItinerariesSchemaOutput {
  dailyItineraries: DailyItinerary[];
}

/**
 * Itinerary Agent
 * 使用 Claude 3.5 Sonnet + JSON Schema 生成每日行程詳細規劃
 */
export class ItineraryAgent {
  private skillInstructions: string;

  constructor() {
    this.skillInstructions = getKeyInstructions('ItineraryAgent');
    console.log('[ItineraryAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
    console.log('[ItineraryAgent] Using Claude 3.5 Sonnet with JSON Schema');
  }

  /**
   * Execute itinerary generation
   */
  async execute(
    rawData: any
  ): Promise<ItineraryAgentResult> {
    console.log("[ItineraryAgent] Starting itinerary generation with Claude...");
    
    try {
      // Validate input data - support both 'itinerary' and 'dailyItinerary' field names
      const itineraryData = rawData?.itinerary || rawData?.dailyItinerary || [];
      const days = rawData?.duration?.days || 5;
      
      console.log(`[ItineraryAgent] Found ${itineraryData.length} days of itinerary data`);
      
      // Generate all days at once using Claude 3.5 Sonnet
      const result = await this.generateAllDaysWithClaude(rawData, itineraryData, days);
      
      if (!result.success || !result.data) {
        console.warn("[ItineraryAgent] Claude generation failed, using fallback");
        return {
          success: true,
          data: {
            dailyItineraries: this.createFallbackItinerary(rawData, days),
          },
          usage: result.usage,
        };
      }
      
      console.log(`[ItineraryAgent] Generated ${result.data.dailyItineraries.length} daily itineraries with Claude`);
      
      return {
        success: true,
        data: result.data,
        usage: result.usage,
      };
    } catch (error) {
      console.error("[ItineraryAgent] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
  /**
   * Generate all days itinerary using Claude 3.5 Sonnet with JSON Schema
   */
  private async generateAllDaysWithClaude(
    rawData: any,
    itineraryData: any[],
    days: number
  ): Promise<{
    success: boolean;
    data?: ItinerariesSchemaOutput;
    usage?: { inputTokens: number; outputTokens: number };
  }> {
    console.log("[ItineraryAgent] Calling Claude 3.5 Sonnet with JSON Schema...");
    
    const destinationCountry = rawData?.location?.destinationCountry || "";
    const destinationCity = rawData?.location?.destinationCity || "";
    const highlights = rawData?.highlights || [];
    const attractions = rawData?.attractions || [];
    const hotelName = rawData?.accommodation?.hotelName || "";
    const tourTitle = rawData?.title || rawData?.basicInfo?.title || "";
    
    // Build context from existing itinerary data
    let existingDataContext = "";
    if (itineraryData.length > 0) {
      existingDataContext = `
已有的行程資料（請基於此資料生成詳細行程）：
${JSON.stringify(itineraryData, null, 2)}
`;
    }
    
    const prompt = `請為以下旅遊行程生成 ${days} 天的詳細每日行程。

行程標題: ${tourTitle}
目的地國家: ${destinationCountry}
目的地城市: ${destinationCity}
行程亮點: ${highlights.slice(0, 8).map((h: any) => typeof h === 'string' ? h : h.title || h.name || '').filter(Boolean).join("、")}
景點: ${attractions.slice(0, 8).map((a: any) => typeof a === 'string' ? a : a.name || a.title || '').filter(Boolean).join("、")}
住宿: ${hotelName}
${existingDataContext}

要求：
1. 每天安排 3-5 個活動
2. 時間安排要合理（考慮交通、用餐、休息）
3. 景點串聯要有邏輯（按照地理位置安排順序）
4. 第一天通常是抵達和初步遊覽
5. 最後一天通常是自由活動和返程
6. 每個活動描述控制在 50-80 字
7. 所有內容必須基於提供的資料，不能編造不存在的景點或活動

請直接返回結構化的每日行程。`;

    const systemPrompt = `${ITINERARY_SKILL}

你是一位資深旅遊行程規劃師，專門為高端旅遊品牌設計詳細的每日行程。

你的行程規劃特點：
1. 時間安排合理，考慮交通、用餐、休息
2. 景點串聯有邏輯，按照地理位置安排順序
3. 每日行程豐富但不過於緊湊
4. 包含當地特色餐食和住宿安排

${STRICT_DATA_FIDELITY_RULES}

重要提醒（Sonnet 專用）：
- Do not output any conversational filler（不要輸出閒聊填充詞）
- 直接返回結構化數據，不要解釋或說明
- 所有景點和活動必須基於提供的資料`;

    try {
      const claudeAgent = getSonnetAgent();

      claudeAgent.setContext('ItineraryAgent', 'tour_generation');
      
      const result = await claudeAgent.sendStructuredMessage<ItinerariesSchemaOutput>(
        prompt,
        ITINERARIES_SCHEMA,
        {
          systemPrompt,
          maxTokens: 8192, // Sonnet can handle larger outputs
          temperature: 0.5, // Slightly higher for creative itinerary planning
          schemaName: 'itineraries_output',
          schemaDescription: '每日行程結構化輸出',
          strictDataFidelity: true,
        }
      );

      if (!result.success || !result.data) {
        console.error("[ItineraryAgent] Claude returned error:", result.error);
        return {
          success: false,
          usage: result.usage,
        };
      }

      // Validate and normalize the output
      const normalizedData = this.normalizeItineraries(result.data, days);
      
      console.log("[ItineraryAgent] Claude response validated successfully");
      console.log(`[ItineraryAgent] Token usage - Input: ${result.usage?.inputTokens}, Output: ${result.usage?.outputTokens}`);

      return {
        success: true,
        data: normalizedData,
        usage: result.usage,
      };
    } catch (error) {
      console.error("[ItineraryAgent] Claude API error:", error);
      return {
        success: false,
      };
    }
  }
  
  /**
   * Normalize itineraries to ensure all fields are valid
   */
  private normalizeItineraries(data: ItinerariesSchemaOutput, expectedDays: number): ItinerariesSchemaOutput {
    const itineraries = data?.dailyItineraries || [];
    
    return {
      dailyItineraries: itineraries.map((itinerary, index) => ({
        day: itinerary?.day || index + 1,
        title: itinerary?.title || `Day ${index + 1}`,
        activities: Array.isArray(itinerary?.activities) 
          ? itinerary.activities.map(activity => ({
              time: activity?.time || '',
              title: activity?.title || '',
              description: activity?.description || '',
              transportation: activity?.transportation || '',
              location: activity?.location || '',
            }))
          : [],
        meals: {
          breakfast: itinerary?.meals?.breakfast || '',
          lunch: itinerary?.meals?.lunch || '',
          dinner: itinerary?.meals?.dinner || '',
        },
        accommodation: itinerary?.accommodation || '',
      })),
    };
  }
  
  /**
   * Create fallback itinerary when Claude fails
   */
  private createFallbackItinerary(rawData: any, days: number): DailyItinerary[] {
    const destinationCity = rawData?.location?.destinationCity || "目的地";
    const hotelName = rawData?.accommodation?.hotelName || "精選飯店";
    const highlights = rawData?.highlights || [];
    
    const result: DailyItinerary[] = [];
    
    for (let i = 0; i < days; i++) {
      const dayHighlight = highlights[i] 
        ? (typeof highlights[i] === 'string' ? highlights[i] : highlights[i].title || highlights[i].name || '')
        : '';
      
      let title = `Day ${i + 1}`;
      if (i === 0) {
        title += `：抵達${destinationCity}`;
      } else if (i === days - 1) {
        title += `：返程`;
      } else if (dayHighlight) {
        title += `：${dayHighlight}`;
      }
      
      result.push({
        day: i + 1,
        title,
        activities: [
          {
            time: '09:00-12:00',
            title: dayHighlight || `${destinationCity}遊覽`,
            description: `探索${destinationCity}的精彩景點`,
            transportation: '專車接送',
            location: destinationCity,
          },
          {
            time: '14:00-17:00',
            title: '自由活動',
            description: '自由探索當地特色',
            transportation: '步行',
            location: destinationCity,
          },
        ],
        meals: {
          breakfast: '飯店早餐',
          lunch: '當地特色餐廳',
          dinner: '精選餐廳',
        },
        accommodation: hotelName,
      });
    }
    
    return result;
  }
}
