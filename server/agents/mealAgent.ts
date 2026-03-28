/**
 * MealAgent
 * Generates professional meal information for tours
 * 
 * Claude Hybrid Architecture: Uses Claude 3 Haiku for simple extraction
 */

import { getHaikuAgent, JSONSchema, STRICT_DATA_FIDELITY_RULES } from "./claudeAgent";
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
    console.log('[MealAgent] Using Claude 3 Haiku with JSON Schema');
  }

  async execute(rawData: any): Promise<MealAgentResult> {
    try {
      console.log("[MealAgent] Starting meal information generation...");

      // Validate input data - support multiple field names
      const mealData = rawData?.meals || rawData?.dining || [];
      const dailyItinerary = rawData?.dailyItinerary || rawData?.itinerary || [];
      
      // Extract meal info from daily itinerary if no direct meal data
      let extractedMeals = mealData;
      if ((!mealData || mealData.length === 0) && dailyItinerary.length > 0) {
        extractedMeals = dailyItinerary.map((day: any) => ({
          day: day.day,
          meals: day.meals || '',
          accommodation: day.accommodation || '',
        }));
      }
      
      if (!rawData || (Array.isArray(extractedMeals) && extractedMeals.length === 0)) {
        console.warn("[MealAgent] No meal data provided");
        // Return default meal data instead of failing
        return {
          success: true,
          data: {
            meals: this.generateDefaultMeals(rawData),
          },
        };
      }

      // Define JSON Schema for meal output
      const mealSchema: JSONSchema = {
        type: "object",
        properties: {
          meals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "餐點名稱" },
                type: { type: "string", description: "餐點類型（breakfast/lunch/dinner）" },
                description: { type: "string", description: "餐點描述（100-150字）" },
                cuisine: { type: "string", description: "料理類型" },
                restaurant: { type: "string", description: "餐廳名稱" },
              },
              required: ["name", "type", "description", "cuisine"],
            },
          },
        },
        required: ["meals"],
      };

      // Build prompt
      const prompt = `
請根據以下餐飲資訊，生成專業的餐飲介紹：

餐飲資訊：
${JSON.stringify(rawData.meals, null, 2)}

請生成包含以下欄位的餐飲資訊：
- name: 餐點名稱
- type: 餐點類型（breakfast/lunch/dinner）
- description: 餐點描述（100-150字，包含菜餚特色、食材來源、烹飪方式、用餐體驗）
- cuisine: 料理類型（例如：日式料理、法式料理、當地特色料理）
- restaurant: 餐廳名稱（如有）

**重要：如果提供的餐飲資訊不足，請根據目的地生成合理的預設餐飲資訊。**
`;

      // Call Claude with structured output
      const claudeAgent = getHaikuAgent();

      claudeAgent.setContext('MealAgent', 'meal_planning');
      const response = await claudeAgent.sendStructuredMessage<{ meals: any[] }>(
        prompt,
        mealSchema,
        {
          systemPrompt: `${MEAL_SKILL}\n\n${STRICT_DATA_FIDELITY_RULES}`,
          maxTokens: 2048,
          temperature: 0.5,
          schemaName: 'meal_output',
          schemaDescription: '餐飲資訊結構化輸出',
        }
      );

      if (!response.success || !response.data) {
        console.warn("[MealAgent] Claude returned no data, using default meals");
        return {
          success: true,
          data: {
            meals: this.generateDefaultMeals(rawData),
          },
        };
      }

      const parsedMealData = response.data;

      // Validate word count for each meal description
      if (parsedMealData.meals) {
        for (const meal of parsedMealData.meals) {
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
        data: parsedMealData,
      };
    } catch (error) {
      console.error("[MealAgent] Error:", error);
      // Return default meal data on error
      return {
        success: true,
        data: {
          meals: this.generateDefaultMeals(rawData),
        },
      };
    }
  }
  
  /**
   * Generate default meal information when no data is available
   */
  private generateDefaultMeals(rawData: any): Array<{
    name: string;
    type: string;
    description: string;
    cuisine: string;
    restaurant?: string;
  }> {
    const destination = rawData?.location?.destinationCity || rawData?.location?.destinationCountry || '目的地';
    
    return [
      {
        name: `${destination}特色早餐`,
        type: 'breakfast',
        description: `在飯店享用豐盛的自助早餐，提供當地特色料理和國際美食，讓您充滿活力地開始新的一天。`,
        cuisine: '國際自助餐',
        restaurant: '飯店餐廳',
      },
      {
        name: `${destination}特色午餐`,
        type: 'lunch',
        description: `品嚐當地特色料理，選用新鮮食材，由當地名廚精心烹調，讓您體驗最道地的美食文化。`,
        cuisine: '當地特色料理',
      },
      {
        name: `${destination}精緻晚餐`,
        type: 'dinner',
        description: `在精心挑選的餐廳享用精緻晚餐，品嚐當地特色菜色，配以優雅的用餐環境，為一天的行程畫上完美句點。`,
        cuisine: '當地精緻料理',
      },
    ];
  }
}
