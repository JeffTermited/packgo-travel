/**
 * Itinerary Agent
 * 生成每日行程詳細規劃
 */

import { invokeLLM } from "../_core/llm";
import { ITINERARY_SKILL } from "./skillLibrary";
import { getKeyInstructions } from "./skillLoader";

export interface ItineraryAgentResult {
  success: boolean;
  data?: {
    dailyItineraries: DailyItinerary[];
  };
  error?: string;
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

/**
 * Itinerary Agent
 * 使用 ITINERARY_SKILL 生成每日行程詳細規劃
 */
export class ItineraryAgent {
  private skillInstructions: string;

  constructor() {
    this.skillInstructions = getKeyInstructions('ItineraryAgent');
    console.log('[ItineraryAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
  }
  /**
   * Execute itinerary generation
   */
  async execute(
    rawData: any
  ): Promise<ItineraryAgentResult> {
    console.log("[ItineraryAgent] Starting itinerary generation...");
    
    try {
      // Validate input data - support both 'itinerary' and 'dailyItinerary' field names
      const itineraryData = rawData?.itinerary || rawData?.dailyItinerary || [];
      const days = rawData?.duration?.days || 5;
      
      console.log(`[ItineraryAgent] Found ${itineraryData.length} days of itinerary data`);
      
      // If no itinerary data but we have days, generate based on available info
      if (itineraryData.length === 0) {
        console.log("[ItineraryAgent] No itinerary data found, generating from scratch...");
        
        // Try to generate itinerary from highlights and attractions
        const generatedItineraries = await this.generateItineraryFromScratch(rawData, days);
        
        if (generatedItineraries.length > 0) {
          return {
            success: true,
            data: {
              dailyItineraries: generatedItineraries,
            },
          };
        }
        
        console.warn("[ItineraryAgent] Could not generate itinerary, returning empty");
        return {
          success: true,
          data: {
            dailyItineraries: [],
          },
        };
      }
      
      const dailyItineraries: DailyItinerary[] = [];
      let failedDays = 0;
      
      // Generate itinerary for each day
      for (let i = 0; i < itineraryData.length; i++) {
        const dayData = itineraryData[i];
        
        console.log(`[ItineraryAgent] Generating itinerary for Day ${i + 1}...`);
        
        const itinerary = await this.generateDailyItinerary(dayData, i + 1);
        
        if (itinerary) {
          dailyItineraries.push(itinerary);
        } else {
          failedDays++;
        }
      }
      
      console.log(`[ItineraryAgent] Generated ${dailyItineraries.length} daily itineraries (${failedDays} failed)`);
      
      // If most days failed, try generating from scratch as fallback
      if (dailyItineraries.length === 0 || failedDays > dailyItineraries.length) {
        console.log("[ItineraryAgent] Most days failed, trying fallback generation from scratch...");
        const fallbackItineraries = await this.generateItineraryFromScratch(rawData, days);
        
        if (fallbackItineraries.length > 0) {
          console.log(`[ItineraryAgent] Fallback generated ${fallbackItineraries.length} daily itineraries`);
          return {
            success: true,
            data: {
              dailyItineraries: fallbackItineraries,
            },
          };
        }
      }
      
      return {
        success: true,
        data: {
          dailyItineraries,
        },
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
   * Generate daily itinerary with retry mechanism
   */
  private async generateDailyItinerary(
    dayData: any,
    dayNumber: number,
    retryCount: number = 0
  ): Promise<DailyItinerary | null> {
    const MAX_RETRIES = 2;
    
    try {
      const prompt = `請根據以下資料生成 Day ${dayNumber} 的詳細行程規劃：

原始資料：
${JSON.stringify(dayData, null, 2)}

請以 JSON 格式回傳，包含以下欄位：
{
  "day": ${dayNumber},
  "title": "Day ${dayNumber}：[簡短標題，例如「抵達東京，淺草寺巡禮」]",
  "activities": [
    {
      "time": "09:00-12:00",
      "title": "參觀淺草寺",
      "description": "探索東京最古老的寺廟，欣賞雷門和五重塔",
      "transportation": "搭乘地鐵銀座線",
      "location": "淺草寺"
    }
  ],
  "meals": {
    "breakfast": "飯店內享用自助式早餐",
    "lunch": "淺草地區品嚐天婦羅定食",
    "dinner": "新宿居酒屋體驗日式料理"
  },
  "accommodation": "東京新宿王子飯店（5星級）"
}

注意：
1. 每日行程總字數控制在 300-400 字之間（寬容檢查：±30% 誤差，即 210-520 字）
2. 每個活動描述不超過 80 字（寬容檢查：±30% 誤差，即不超過 104 字）
3. 時間安排要合理（考慮交通、用餐、休息）
4. 景點串聯要有邏輯（按照地理位置安排順序）
5. 即使資料不完整，也請根據目的地和行程主題，發揮創意生成合理的行程安排
6. 絕對不要回傳 null，必須生成有效的 JSON`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: ITINERARY_SKILL + "\n\n重要：你必須只返回有效的 JSON 格式，不要包含任何解釋性文字。" },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "daily_itinerary",
            strict: true,
            schema: {
              type: "object",
              properties: {
                day: { type: "integer", description: "Day number" },
                title: { type: "string", description: "Day title" },
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
        }
      });
      
      const content = response.choices[0].message.content;
      
      // Handle content type (string or array)
      let contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      
      if (!contentStr || contentStr.trim().toLowerCase() === "null") {
        console.warn(`[ItineraryAgent] LLM returned null for Day ${dayNumber}, will use fallback generation`);
        // Don't return null here - throw error to trigger fallback
        throw new Error(`Insufficient data for Day ${dayNumber}`);
      }
      
      // Remove markdown code blocks if present
      contentStr = contentStr.trim();
      if (contentStr.startsWith("```json")) {
        contentStr = contentStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (contentStr.startsWith("```")) {
        contentStr = contentStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      
      // Parse JSON response
      const itinerary = JSON.parse(contentStr);
      
      // Validate word count (total should be 300-400 characters)
      const totalWords = this.calculateTotalWords(itinerary);
      
      if (totalWords < 300 || totalWords > 400) {
        console.warn(`[ItineraryAgent] Day ${dayNumber} itinerary word count (${totalWords}) out of range, retrying...`);
        
        if (retryCount < MAX_RETRIES) {
          return this.generateDailyItinerary(dayData, dayNumber, retryCount + 1);
        } else {
          console.warn(`[ItineraryAgent] Day ${dayNumber} itinerary word count still out of range after ${MAX_RETRIES} retries, using truncation`);
          return this.truncateItinerary(itinerary, 400);
        }
      }
      
      return itinerary;
    } catch (error) {
      console.error(`[ItineraryAgent] Error generating Day ${dayNumber} itinerary:`, error);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`[ItineraryAgent] Retrying Day ${dayNumber} itinerary generation (${retryCount + 1}/${MAX_RETRIES})...`);
        return this.generateDailyItinerary(dayData, dayNumber, retryCount + 1);
      }
      
      return null;
    }
  }
  
  /**
   * Calculate total word count of itinerary
   */
  private calculateTotalWords(itinerary: DailyItinerary | null): number {
    if (!itinerary) return 0;
    
    let total = 0;
    
    // Title (with null check)
    total += (itinerary.title || '').length;
    
    // Activities (with null check)
    if (Array.isArray(itinerary.activities)) {
      itinerary.activities.forEach(activity => {
        if (activity) {
          total += (activity.title || '').length;
          total += (activity.description || '').length;
          total += (activity.transportation || '').length;
        }
      });
    }
    
    // Meals (with null check)
    if (itinerary.meals) {
      total += (itinerary.meals.breakfast || '').length;
      total += (itinerary.meals.lunch || '').length;
      total += (itinerary.meals.dinner || '').length;
    }
    
    // Accommodation (with null check)
    total += (itinerary.accommodation || '').length;
    
    return total;
  }
  
  /**
   * Truncate itinerary to fit word count limit
   */
  private truncateItinerary(itinerary: DailyItinerary | null, maxWords: number): DailyItinerary | null {
    if (!itinerary) return null;
    
    // Ensure all required fields exist
    const result: DailyItinerary = {
      day: itinerary.day || 1,
      title: itinerary.title || '',
      activities: Array.isArray(itinerary.activities) ? itinerary.activities : [],
      meals: itinerary.meals || { breakfast: '', lunch: '', dinner: '' },
      accommodation: itinerary.accommodation || '',
    };
    
    // Simple truncation strategy: truncate activity descriptions
    const currentWords = this.calculateTotalWords(result);
    
    if (currentWords <= maxWords) {
      return result;
    }
    
    if (result.activities.length === 0) {
      return result;
    }
    
    const excessWords = currentWords - maxWords;
    const wordsPerActivity = Math.ceil(excessWords / result.activities.length);
    
    result.activities = result.activities.map(activity => {
      if (!activity) return activity;
      const desc = activity.description || '';
      return {
        ...activity,
        description: desc.length > wordsPerActivity ? desc.slice(0, desc.length - wordsPerActivity) + "..." : desc,
      };
    });
    
    return result;
  }
  
  /**
   * Generate itinerary from scratch when no itinerary data is available
   */
  private async generateItineraryFromScratch(
    rawData: any,
    days: number
  ): Promise<DailyItinerary[]> {
    const destinationCountry = rawData.location?.destinationCountry || "";
    const destinationCity = rawData.location?.destinationCity || "";
    const highlights = rawData.highlights || [];
    const attractions = rawData.attractions || [];
    const hotelName = rawData.accommodation?.hotelName || "";
    
    if (!destinationCity && !destinationCountry) {
      console.warn("[ItineraryAgent] Insufficient data for scratch generation");
      return [];
    }
    
    const systemPrompt = `你是一位資深旅遊行程規劃師，專門為高端旅遊品牌設計詳細的每日行程。

你的行程規劃特點：
1. 時間安排合理，考慮交通、用餐、休息
2. 景點串聯有邏輯，按照地理位置安排順序
3. 每日行程豐富但不過於緊湊
4. 包含當地特色餐食和住宿安排`;
    
    const userPrompt = `請為以下旅遊行程生成 ${days} 天的詳細每日行程：

目的地國家: ${destinationCountry}
目的地城市: ${destinationCity}
行程亮點: ${highlights.slice(0, 5).join("、")}
景點: ${attractions.map((a: any) => a.name || a).slice(0, 5).join("、")}
住宿: ${hotelName}

請以 JSON 陣列格式回傳，每天的格式如下：
[
  {
    "day": 1,
    "title": "Day 1：抵達目的地，初探城市風光",
    "activities": [
      {
        "time": "09:00-12:00",
        "title": "活動名稱",
        "description": "活動描述（50-80字）",
        "transportation": "交通方式",
        "location": "地點"
      }
    ],
    "meals": {
      "breakfast": "早餐安排",
      "lunch": "午餐安排",
      "dinner": "晚餐安排"
    },
    "accommodation": "住宿安排"
  }
]

注意：
1. 每天安排 3-5 個活動
2. 第一天通常是抵達和初步遊覽
3. 最後一天通常是自由活動和返程
4. 中間幾天安排主要景點和體驗`;
    
    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
      });
      
      const content = response.choices[0]?.message?.content;
      let contentStr = typeof content === "string" ? content : JSON.stringify(content);
      
      if (!contentStr) {
        console.warn("[ItineraryAgent] Empty response from LLM");
        return [];
      }
      
      // Remove markdown code blocks if present
      contentStr = contentStr.trim();
      if (contentStr.startsWith("```json")) {
        contentStr = contentStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (contentStr.startsWith("```")) {
        contentStr = contentStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      
      const parsed = JSON.parse(contentStr);
      
      // Handle both array and object with itinerary key
      const itineraries = Array.isArray(parsed) ? parsed : (parsed.itinerary || parsed.dailyItineraries || []);
      
      console.log(`[ItineraryAgent] Generated ${itineraries.length} days from scratch`);
      return itineraries;
      
    } catch (error) {
      console.error("[ItineraryAgent] Error generating from scratch:", error);
      return [];
    }
  }
}
