import { invokeLLM } from "../_core/llm";
import { MEAL_SKILL } from "./skillLibrary";
import { getKeyInstructions } from "./skillLoader";

export interface MealAgentResult {
  success: boolean;
  data?: {
    title: string;           // 餐飲標題 (例如: "餐食介紹")
    description: string;     // 簡單描述 (50-100字)
    mealPlan: {
      breakfast: string;     // 早餐安排
      lunch: string;         // 午餐安排
      dinner: string;        // 晚餐安排
    };
    highlights: string[];    // 餐飲亮點 (例如: "當地特色海鮮料理")
    details: Array<{
      day: number;           // 第幾天
      meals: Array<{
        type: string;        // breakfast, lunch, dinner
        name: string;        // 餐點名稱
        description: string; // 餐點描述 (50-100字)
        restaurant?: string; // 餐廳名稱
        image?: string;      // 餐點圖片
      }>;
    }>;
    notes: string[];         // 注意事項
  };
  error?: string;
}

export class MealAgent {
  private skillInstructions: string;

  constructor() {
    this.skillInstructions = getKeyInstructions('MealAgent');
    console.log('[MealAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
  }

  async execute(rawData: any): Promise<MealAgentResult> {
    try {
      console.log("[MealAgent] Starting meal information generation...");

      // 嘗試從多種資料來源提取餐飲資訊
      const mealData = this.extractMealData(rawData);
      
      if (!mealData) {
        console.warn("[MealAgent] No meal data available from any source");
        return {
          success: false,
          error: "No meal data available",
        };
      }
      
      console.log("[MealAgent] Extracted meal data:", JSON.stringify(mealData).substring(0, 200));

      // Build prompt for LLM (Lion Travel style)
      const prompt = `
請根據以下餐飲資訊，生成符合雄獅旅遊風格的餐飲介紹：

餐飲資訊：
${JSON.stringify(mealData, null, 2)}

請以 JSON 格式回傳，包含以下欄位：
{
  "title": "餐食介紹",
  "description": "簡單描述（50-100字，介紹整體餐飲安排的特色）",
  "mealPlan": {
    "breakfast": "早餐安排（例如：飯店自助式早餐）",
    "lunch": "午餐安排（例如：當地特色料理）",
    "dinner": "晚餐安排（例如：海鮮自助餐）"
  },
  "highlights": [
    "餐飲亮雞1（例如：當地特色海鮮料理）",
    "餐飲亮雞2（例如：米其林推薦餐廳）"
  ],
  "details": [
    {
      "day": 1,
      "meals": [
        {
          "type": "breakfast",
          "name": "餐點名稱",
          "description": "餐點描述（50-100字）",
          "restaurant": "餐廳名稱（如有）",
          "image": "placeholder-meal.jpg"
        }
      ]
    }
  ],
  "notes": [
    "注意事項1（例如：特殊飲食需求請事先告知）",
    "注意事項2"
  ]
}

**風格要求：**
- 描述應詳細且資訊完整
- mealPlan 應清晰說明每餐的安排
- highlights 應列出 2-4 個餐飲亮點
- details 應按天數組織，每天包含多餐
- notes 應包含重要的注意事項

**重要：如果提供的餐飲資訊不足以生成完整的餐飲介紹，請回傳 null。**
`;

      // Call LLM with MEAL_SKILL
      const response = await invokeLLM({
        messages: [
          { role: "system", content: MEAL_SKILL },
          { role: "user", content: prompt },
        ],
      });

      const content = typeof response.choices[0].message.content === 'string' 
        ? response.choices[0].message.content.trim() 
        : null;

      if (!content || content === "null") {
        console.warn("[MealAgent] LLM returned null (insufficient data)");
        return {
          success: false,
          error: "Insufficient data to generate meal information",
        };
      }

      // Parse JSON response
      let parsedMealData;
      try {
        parsedMealData = JSON.parse(content);
      } catch (parseError) {
        console.error("[MealAgent] Failed to parse LLM response:", parseError);
        return {
          success: false,
          error: "Failed to parse meal information",
        };
      }

      // Validate word count for description
      if (parsedMealData.description) {
        const wordCount = parsedMealData.description.length;
        if (wordCount < 50 || wordCount > 100) {
          console.warn(
            `[MealAgent] Description word count out of range: ${wordCount} (expected 50-100)`
          );
          // Truncate if too long
          if (wordCount > 100) {
            parsedMealData.description = parsedMealData.description.substring(0, 100) + "...";
          }
        }
      }

      // Validate word count for each meal detail description
      if (parsedMealData.details) {
        for (const dayDetail of parsedMealData.details) {
          for (const meal of dayDetail.meals) {
            const wordCount = meal.description.length;
            if (wordCount < 50 || wordCount > 100) {
              console.warn(
                `[MealAgent] Meal description word count out of range: ${wordCount} (expected 50-100)`
              );
              // Truncate if too long
              if (wordCount > 100) {
                meal.description = meal.description.substring(0, 100) + "...";
              }
            }
          }
        }
      }

      console.log("[MealAgent] Meal information generated successfully");
      return {
        success: true,
        data: parsedMealData,
      };
    } catch (error) {
      console.error("[MealAgent] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * 從多種資料來源提取餐飲資訊
   */
  private extractMealData(rawData: any): any | null {
    if (!rawData) return null;
    
    // 1. 直接使用 meals 欄位
    if (rawData.meals && (Array.isArray(rawData.meals) ? rawData.meals.length > 0 : Object.keys(rawData.meals).length > 0)) {
      console.log("[MealAgent] Using meals field directly");
      return rawData.meals;
    }
    
    // 2. 從 itinerary 或 dailyItinerary 提取餐飲資訊
    const itineraryData = rawData.itinerary || rawData.dailyItinerary || [];
    if (itineraryData.length > 0) {
      const extractedMeals: any[] = [];
      
      for (const day of itineraryData) {
        if (day.meals) {
          extractedMeals.push({
            day: day.day || extractedMeals.length + 1,
            ...day.meals
          });
        }
      }
      
      if (extractedMeals.length > 0) {
        console.log(`[MealAgent] Extracted meals from itinerary: ${extractedMeals.length} days`);
        return extractedMeals;
      }
    }
    
    // 3. 從 highlights 提取餐飲相關資訊
    const highlights = rawData.highlights || [];
    const mealRelatedHighlights = highlights.filter((h: string) => 
      h.includes('餐') || h.includes('料理') || h.includes('美食') || 
      h.includes('下午茶') || h.includes('早餐') || h.includes('午餐') || h.includes('晚餐')
    );
    
    if (mealRelatedHighlights.length > 0) {
      console.log(`[MealAgent] Extracted meal highlights: ${mealRelatedHighlights.length}`);
      return {
        highlights: mealRelatedHighlights,
        description: mealRelatedHighlights.join('、')
      };
    }
    
    // 4. 從 attractions 提取餐飲相關景點
    const attractions = rawData.attractions || [];
    const mealRelatedAttractions = attractions.filter((a: any) => {
      const name = a.name || a;
      return name.includes('餐') || name.includes('料理') || name.includes('美食');
    });
    
    if (mealRelatedAttractions.length > 0) {
      console.log(`[MealAgent] Extracted meal attractions: ${mealRelatedAttractions.length}`);
      return {
        attractions: mealRelatedAttractions
      };
    }
    
    return null;
  }
}
