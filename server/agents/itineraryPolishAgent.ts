/**
 * Itinerary Polish Agent
 * 美化行程措辭，保持原始資訊不變
 */

import { invokeLLM } from "../_core/llm";
import { ExtractedItinerary, ExtractedActivity } from "./itineraryExtractAgent";

export interface PolishedItinerary {
  day: number;
  title: string;
  activities: PolishedActivity[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  accommodation: string;
}

export interface PolishedActivity {
  time: string;
  title: string;
  description: string;
  transportation: string;
  location: string;
}

export interface ItineraryPolishResult {
  success: boolean;
  data?: {
    polishedItineraries: PolishedItinerary[];
  };
  error?: string;
}

/**
 * ItineraryPolishAgent
 * 專門美化行程措辭，讓文字更專業、更吸引人
 * 保持原始資訊不變，只改善表達方式
 */
export class ItineraryPolishAgent {
  constructor() {
    console.log('[ItineraryPolishAgent] Initialized');
  }

  /**
   * 執行行程美化
   */
  async execute(
    extractedItineraries: ExtractedItinerary[],
    destinationInfo: { country?: string; city?: string }
  ): Promise<ItineraryPolishResult> {
    console.log(`[ItineraryPolishAgent] Starting to polish ${extractedItineraries.length} days of itinerary...`);
    
    if (extractedItineraries.length === 0) {
      return {
        success: true,
        data: {
          polishedItineraries: [],
        },
      };
    }
    
    try {
      // 批次處理所有天數的行程（一次 LLM 調用）
      const polishedItineraries = await this.polishAllDays(extractedItineraries, destinationInfo);
      
      console.log(`[ItineraryPolishAgent] Successfully polished ${polishedItineraries.length} days`);
      
      return {
        success: true,
        data: {
          polishedItineraries,
        },
      };
    } catch (error) {
      console.error("[ItineraryPolishAgent] Error:", error);
      
      // 如果美化失敗，返回原始資料（轉換格式）
      const fallbackItineraries = extractedItineraries.map(itinerary => ({
        ...itinerary,
        activities: itinerary.activities.map(activity => ({
          ...activity,
        })),
      }));
      
      return {
        success: true,
        data: {
          polishedItineraries: fallbackItineraries,
        },
      };
    }
  }

  /**
   * 批次美化所有天數的行程
   */
  private async polishAllDays(
    itineraries: ExtractedItinerary[],
    destinationInfo: { country?: string; city?: string }
  ): Promise<PolishedItinerary[]> {
    const systemPrompt = `你是一位資深旅遊雜誌主編，專門為高端旅遊品牌撰寫行程文案。

你的任務是「美化」行程措辭，讓文字更專業、更吸引人。

重要規則：
1. **保持原始資訊不變**：景點名稱、時間、地點等資訊必須完全保留
2. **只改善表達方式**：讓描述更生動、更有畫面感
3. **使用感官細節**：加入視覺、聽覺、味覺、觸覺的描述
4. **避免過度修飾**：不要使用「靈魂」「洗滌」「光影」「呢喃」「心靈」「深度對話」「完美融合」等詞彙
5. **保持專業簡潔**：每個活動描述控制在 50-80 字

輸出格式：JSON 陣列，每天的格式如下：
{
  "day": 1,
  "title": "Day 1：[美化後的標題]",
  "activities": [
    {
      "time": "[保持原始時間]",
      "title": "[美化後的活動標題]",
      "description": "[美化後的描述，50-80字]",
      "transportation": "[保持原始交通方式]",
      "location": "[保持原始地點]"
    }
  ],
  "meals": {
    "breakfast": "[美化後的早餐描述]",
    "lunch": "[美化後的午餐描述]",
    "dinner": "[美化後的晚餐描述]"
  },
  "accommodation": "[美化後的住宿描述]"
}`;

    const userPrompt = `請美化以下行程的措辭：

目的地：${destinationInfo.city || ''}, ${destinationInfo.country || ''}

原始行程資料：
${JSON.stringify(itineraries, null, 2)}

請以 JSON 陣列格式回傳美化後的行程，確保：
1. 保持所有原始資訊（時間、地點、景點名稱）不變
2. 只改善文字表達方式
3. 每個活動描述控制在 50-80 字`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "polished_itineraries",
            strict: true,
            schema: {
              type: "object",
              properties: {
                itineraries: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "integer" },
                      title: { type: "string" },
                      activities: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            time: { type: "string" },
                            title: { type: "string" },
                            description: { type: "string" },
                            transportation: { type: "string" },
                            location: { type: "string" }
                          },
                          required: ["time", "title", "description", "transportation", "location"],
                          additionalProperties: false
                        }
                      },
                      meals: {
                        type: "object",
                        properties: {
                          breakfast: { type: "string" },
                          lunch: { type: "string" },
                          dinner: { type: "string" }
                        },
                        required: ["breakfast", "lunch", "dinner"],
                        additionalProperties: false
                      },
                      accommodation: { type: "string" }
                    },
                    required: ["day", "title", "activities", "meals", "accommodation"],
                    additionalProperties: false
                  }
                }
              },
              required: ["itineraries"],
              additionalProperties: false
            }
          }
        }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from LLM");
      }

      const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
      const polishedItineraries = parsed.itineraries || parsed;

      if (!Array.isArray(polishedItineraries)) {
        throw new Error("Invalid response format");
      }

      return polishedItineraries;
    } catch (error) {
      console.error("[ItineraryPolishAgent] LLM error:", error);
      throw error;
    }
  }
}
