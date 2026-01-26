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
      // Support both 'itinerary' and 'dailyItinerary' field names (for compatibility)
      const itineraryData = rawData?.itinerary || rawData?.dailyItinerary || [];
      
      // Log available data for debugging
      console.log("[ItineraryAgent] Available fields:", Object.keys(rawData || {}));
      console.log("[ItineraryAgent] Itinerary data length:", itineraryData.length);
      
      // Validate input data
      if (!rawData || itineraryData.length === 0) {
        console.warn("[ItineraryAgent] Insufficient itinerary data, attempting to generate from attractions/highlights...");
        
        // Try to generate itinerary from attractions or highlights
        const generatedItinerary = await this.generateFromAlternativeData(rawData);
        if (generatedItinerary && generatedItinerary.length > 0) {
          return {
            success: true,
            data: {
              dailyItineraries: generatedItinerary,
            },
          };
        }
        
        return {
          success: true,
          data: {
            dailyItineraries: [],
          },
        };
      }
      
      // 優化: 使用批量生成方案，一次 LLM 調用生成所有天數的行程
      console.log(`[ItineraryAgent] Using batch generation for ${itineraryData.length} days...`);
      
      const dailyItineraries = await this.generateAllDaysAtOnce(itineraryData);
      
      console.log(`[ItineraryAgent] Generated ${dailyItineraries.length} daily itineraries`);
      
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
   * 批量生成所有天數的行程 (優化: 一次 LLM 調用)
   */
  private async generateAllDaysAtOnce(itineraryData: any[]): Promise<DailyItinerary[]> {
    const totalDays = itineraryData.length;
    
    const prompt = `請根據以下資料生成 ${totalDays} 天的詳細行程規劃：

原始資料：
${JSON.stringify(itineraryData, null, 2)}

請以 JSON 格式回傳，包含一個 dailyItineraries 陣列，每個元素包含：
{
  "dailyItineraries": [
    {
      "day": 1,
      "title": "Day 1：[簡短標題，例如「抵達東京，淺草寺巡禮」]",
      "activities": [
        {
          "time": "09:00-12:00",
          "title": "活動名稱",
          "description": "活動描述 (不超過 50 字)",
          "transportation": "交通方式",
          "location": "地點"
        }
      ],
      "meals": {
        "breakfast": "早餐",
        "lunch": "午餐",
        "dinner": "晚餐"
      },
      "accommodation": "住宿"
    }
  ]
}

注意：
1. 每天安排 3-5 個活動
2. 時間安排要合理
3. 景點串聯要有邏輯
4. 第一天通常是抵達，最後一天通常是返程
5. 每個活動描述不超過 50 字`;
    
    try {
      console.log(`[ItineraryAgent] Batch generating ${totalDays} days of itinerary...`);
      
      const response = await invokeLLM({
        messages: [
          { role: "system", content: ITINERARY_SKILL + "\n\n重要：你必須只回傳有效的 JSON 格式，不要包含任何其他文字。" },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });
      
      const content = response.choices[0].message.content;
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      
      // Clean JSON response
      let cleanedContent = contentStr.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to extract JSON
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }
      
      const result = JSON.parse(cleanedContent);
      const itineraries = result.dailyItineraries || [];
      
      console.log(`[ItineraryAgent] Batch generation completed: ${itineraries.length} days`);
      
      return itineraries;
    } catch (error) {
      console.error("[ItineraryAgent] Batch generation failed:", error);
      
      // Fallback: 使用並行處理每日行程
      console.log("[ItineraryAgent] Falling back to parallel generation...");
      
      const promises = itineraryData.map((dayData, index) => 
        this.generateDailyItinerary(dayData, index + 1)
      );
      
      const results = await Promise.all(promises);
      return results.filter((r): r is DailyItinerary => r !== null);
    }
  }
  
  /**
   * Generate itinerary from alternative data (attractions, highlights, etc.)
   */
  private async generateFromAlternativeData(rawData: any): Promise<DailyItinerary[] | null> {
    if (!rawData) return null;
    
    const days = rawData.duration?.days || 5;
    const attractions = rawData.attractions || [];
    const highlights = rawData.highlights || [];
    const destinationCity = rawData.location?.destinationCity || '';
    const hotelName = rawData.accommodation?.hotelName || '精選飯店';
    
    // If we have attractions or highlights, generate itinerary
    if (attractions.length === 0 && highlights.length === 0) {
      console.warn("[ItineraryAgent] No attractions or highlights available for alternative generation");
      return null;
    }
    
    console.log(`[ItineraryAgent] Generating itinerary from ${attractions.length} attractions and ${highlights.length} highlights for ${days} days`);
    
    const prompt = `請根據以下資料生成 ${days} 天的詳細行程規劃：

目的地：${destinationCity}
景點：${attractions.map((a: any) => a.name || a).join('、')}
行程亮點：${highlights.join('、')}
住宿：${hotelName}

請以 JSON 格式回傳，包含一個 dailyItineraries 陣列，每個元素包含：
{
  "dailyItineraries": [
    {
      "day": 1,
      "title": "Day 1：[簡短標題]",
      "activities": [
        {
          "time": "09:00-12:00",
          "title": "活動名稱",
          "description": "活動描述",
          "transportation": "交通方式",
          "location": "地點"
        }
      ],
      "meals": {
        "breakfast": "早餐",
        "lunch": "午餐",
        "dinner": "晚餐"
      },
      "accommodation": "住宿"
    }
  ]
}

注意：
1. 每天安排 2-4 個活動
2. 時間安排要合理
3. 景點串聯要有邏輯
4. 第一天通常是抵達，最後一天通常是返程`;
    
    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: ITINERARY_SKILL },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });
      
      const content = response.choices[0].message.content;
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      
      // Clean JSON response (remove markdown code blocks if present)
      let cleanedContent = contentStr.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const result = JSON.parse(cleanedContent);
      return result.dailyItineraries || [];
    } catch (error) {
      console.error("[ItineraryAgent] Alternative generation failed:", error);
      return null;
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
1. 每日行程總字數必須控制在 300-400 字之間
2. 每個活動描述不超過 80 字
3. 時間安排要合理（考慮交通、用餐、休息）
4. 景點串聯要有邏輯（按照地理位置安排順序）
5. 如果資料不足，請回傳 null`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: ITINERARY_SKILL },
          { role: "user", content: prompt },
        ],
      });
      
      const content = response.choices[0].message.content;
      
      // Handle content type (string or array)
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      
      if (!contentStr || contentStr.trim().toLowerCase() === "null") {
        console.warn(`[ItineraryAgent] Insufficient data for Day ${dayNumber}, returning null`);
        return null;
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
  private calculateTotalWords(itinerary: DailyItinerary): number {
    let total = 0;
    
    // Title
    total += itinerary.title.length;
    
    // Activities
    itinerary.activities.forEach(activity => {
      total += activity.title.length;
      total += activity.description.length;
      total += activity.transportation.length;
    });
    
    // Meals
    total += itinerary.meals.breakfast.length;
    total += itinerary.meals.lunch.length;
    total += itinerary.meals.dinner.length;
    
    // Accommodation
    total += itinerary.accommodation.length;
    
    return total;
  }
  
  /**
   * Truncate itinerary to fit word count limit
   */
  private truncateItinerary(itinerary: DailyItinerary, maxWords: number): DailyItinerary {
    // Simple truncation strategy: truncate activity descriptions
    const currentWords = this.calculateTotalWords(itinerary);
    
    if (currentWords <= maxWords) {
      return itinerary;
    }
    
    const excessWords = currentWords - maxWords;
    const wordsPerActivity = Math.ceil(excessWords / itinerary.activities.length);
    
    itinerary.activities = itinerary.activities.map(activity => ({
      ...activity,
      description: activity.description.slice(0, activity.description.length - wordsPerActivity) + "...",
    }));
    
    return itinerary;
  }
}
