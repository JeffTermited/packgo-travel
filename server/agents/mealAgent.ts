import { invokeLLM } from "../_core/llm";
import { MEAL_SKILL } from "./skillLibrary";
import { getKeyInstructions } from "./skillLoader";

export interface MealAgentResult {
  success: boolean;
  data?: {
    meals: Array<{
      name: string;
      type: string; // breakfast, lunch, dinner
      description: string;
      cuisine: string;
      restaurant?: string;
    }>;
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

      // Validate input data
      if (!rawData || !rawData.meals) {
        console.warn("[MealAgent] No meal data provided");
        return {
          success: false,
          error: "No meal data available",
        };
      }

      // Build prompt for LLM
      const prompt = `
請根據以下餐飲資訊，生成專業的餐飲介紹：

餐飲資訊：
${JSON.stringify(rawData.meals, null, 2)}

請以 JSON 格式回傳，包含以下欄位：
{
  "meals": [
    {
      "name": "餐點名稱",
      "type": "餐點類型（breakfast/lunch/dinner）",
      "description": "餐點描述（100-150字，包含菜餚特色、食材來源、烹飪方式、用餐體驗）",
      "cuisine": "料理類型（例如：日式料理、法式料理、當地特色料理）",
      "restaurant": "餐廳名稱（如有）"
    }
  ]
}

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
      let mealData;
      try {
        mealData = JSON.parse(content);
      } catch (parseError) {
        console.error("[MealAgent] Failed to parse LLM response:", parseError);
        return {
          success: false,
          error: "Failed to parse meal information",
        };
      }

      // Validate word count for each meal description
      if (mealData.meals) {
        for (const meal of mealData.meals) {
          const wordCount = meal.description.length;
          if (wordCount < 100 || wordCount > 150) {
            console.warn(
              `[MealAgent] Meal description word count out of range: ${wordCount} (expected 100-150)`
            );
            // Truncate if too long
            if (wordCount > 150) {
              meal.description = meal.description.substring(0, 150) + "...";
            }
          }
        }
      }

      console.log("[MealAgent] Meal information generated successfully");
      return {
        success: true,
        data: mealData,
      };
    } catch (error) {
      console.error("[MealAgent] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
