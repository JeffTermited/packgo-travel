/**
 * Itinerary Agent
 * 生成每日行程詳細規劃
 */

import { invokeLLM } from "../_core/llm";
import { ITINERARY_SKILL } from "./skillLibrary";

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
  /**
   * Execute itinerary generation
   */
  async execute(
    rawData: any
  ): Promise<ItineraryAgentResult> {
    console.log("[ItineraryAgent] Starting itinerary generation...");
    
    try {
      // Validate input data
      if (!rawData || !rawData.itinerary || rawData.itinerary.length === 0) {
        console.warn("[ItineraryAgent] Insufficient itinerary data, returning null");
        return {
          success: true,
          data: {
            dailyItineraries: [],
          },
        };
      }
      
      const dailyItineraries: DailyItinerary[] = [];
      
      // Generate itinerary for each day
      for (let i = 0; i < rawData.itinerary.length; i++) {
        const dayData = rawData.itinerary[i];
        
        console.log(`[ItineraryAgent] Generating itinerary for Day ${i + 1}...`);
        
        const itinerary = await this.generateDailyItinerary(dayData, i + 1);
        
        if (itinerary) {
          dailyItineraries.push(itinerary);
        }
      }
      
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
