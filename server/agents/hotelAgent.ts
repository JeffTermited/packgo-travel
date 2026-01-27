import { invokeLLM } from "../_core/llm";
import { HOTEL_SKILL } from "./skillLibrary";
import { getKeyInstructions } from "./skillLoader";

export interface HotelAgentResult {
  success: boolean;
  data?: {
    hotels: Array<{
      name: string;
      stars: string;
      description: string;
      facilities: string[];
      location: string;
    }>;
  };
  error?: string;
}

export class HotelAgent {
  private skillInstructions: string;

  constructor() {
    this.skillInstructions = getKeyInstructions('HotelAgent');
    console.log('[HotelAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
  }

  async execute(rawData: any): Promise<HotelAgentResult> {
    try {
      console.log("[HotelAgent] Starting hotel information generation...");

      // Validate input data
      if (!rawData || !rawData.accommodation) {
        console.warn("[HotelAgent] No accommodation data provided");
        return {
          success: false,
          error: "No accommodation data available",
        };
      }

      // Build prompt for LLM
      const prompt = `
請根據以下住宿資訊，生成專業的飯店介紹：

住宿資訊：
${JSON.stringify(rawData.accommodation, null, 2)}

請以 JSON 格式回傳，包含以下欄位：
{
  "hotels": [
    {
      "name": "飯店名稱",
      "stars": "星級（例如：五星級）",
      "description": "飯店描述（150-200字，包含設施、房型、地理位置、服務品質）",
      "facilities": ["設施1", "設施2", "設施3"],
      "location": "地理位置描述"
    }
  ]
}

**重要：如果提供的住宿資訊不足以生成完整的飯店介紹，請回傳 null。**
`;

      // Call LLM with HOTEL_SKILL
      const response = await invokeLLM({
        messages: [
          { role: "system", content: HOTEL_SKILL },
          { role: "user", content: prompt },
        ],
      });

      const content = typeof response.choices[0].message.content === 'string' 
        ? response.choices[0].message.content.trim() 
        : null;

      if (!content || content === "null") {
        console.warn("[HotelAgent] LLM returned null (insufficient data)");
        return {
          success: false,
          error: "Insufficient data to generate hotel information",
        };
      }

      // Parse JSON response
      let hotelData;
      try {
        hotelData = JSON.parse(content);
      } catch (parseError) {
        console.error("[HotelAgent] Failed to parse LLM response:", parseError);
        return {
          success: false,
          error: "Failed to parse hotel information",
        };
      }

      // Validate word count for each hotel description
      if (hotelData.hotels) {
        for (const hotel of hotelData.hotels) {
          const wordCount = hotel.description.length;
          if (wordCount < 150 || wordCount > 200) {
            console.warn(
              `[HotelAgent] Hotel description word count out of range: ${wordCount} (expected 150-200)`
            );
            // Truncate if too long
            if (wordCount > 200) {
              hotel.description = hotel.description.substring(0, 200) + "...";
            }
          }
        }
      }

      console.log("[HotelAgent] Hotel information generated successfully");
      return {
        success: true,
        data: hotelData,
      };
    } catch (error) {
      console.error("[HotelAgent] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
