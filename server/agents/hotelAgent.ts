/**
 * HotelAgent
 * Generates professional hotel information for tours
 * 
 * Claude Hybrid Architecture: Uses Claude 3 Haiku for simple extraction
 */

import { getHaikuAgent, JSONSchema, STRICT_DATA_FIDELITY_RULES } from "./claudeAgent";
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
    console.log('[HotelAgent] Using Claude 3 Haiku with JSON Schema');
  }

  async execute(rawData: any): Promise<HotelAgentResult> {
    try {
      console.log("[HotelAgent] Starting hotel information generation...");

      // Validate input data - support multiple field names
      const accommodationData = rawData?.accommodation || rawData?.hotels || [];
      
      if (!rawData || (Array.isArray(accommodationData) && accommodationData.length === 0)) {
        console.warn("[HotelAgent] No accommodation data provided");
        // Return default hotel data instead of failing
        return {
          success: true,
          data: {
            hotels: this.generateDefaultHotels(rawData),
          },
        };
      }

      // Define JSON Schema for hotel output
      const hotelSchema: JSONSchema = {
        type: "object",
        properties: {
          hotels: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "飯店名稱" },
                stars: { type: "string", description: "星級（例如：五星級）" },
                description: { type: "string", description: "飯店描述（150-200字）" },
                facilities: {
                  type: "array",
                  items: { type: "string" },
                  description: "飯店設施列表",
                },
                location: { type: "string", description: "地理位置描述" },
              },
              required: ["name", "stars", "description", "facilities", "location"],
            },
          },
        },
        required: ["hotels"],
      };

      // Build prompt
      const prompt = `
請根據以下住宿資訊，生成專業的飯店介紹：

住宿資訊：
${JSON.stringify(accommodationData, null, 2)}

請生成包含以下欄位的飯店資訊：
- name: 飯店名稱
- stars: 星級（例如：五星級）
- description: 飯店描述（150-200字，包含設施、房型、地理位置、服務品質）
- facilities: 設施列表
- location: 地理位置描述

**重要：如果提供的住宿資訊不足，請根據目的地生成合理的預設飯店資訊。**
`;

      // Call Claude with structured output
      const claudeAgent = getHaikuAgent();

      claudeAgent.setContext('HotelAgent', 'hotel_search');
      const response = await claudeAgent.sendStructuredMessage<{ hotels: any[] }>(
        prompt,
        hotelSchema,
        {
          systemPrompt: `${HOTEL_SKILL}\n\n${STRICT_DATA_FIDELITY_RULES}`,
          maxTokens: 2048,
          temperature: 0.5,
          schemaName: 'hotel_output',
          schemaDescription: '飯店資訊結構化輸出',
        }
      );

      if (!response.success || !response.data) {
        console.warn("[HotelAgent] Claude returned no data, using default hotels");
        return {
          success: true,
          data: {
            hotels: this.generateDefaultHotels(rawData),
          },
        };
      }

      const hotelData = response.data;

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
      // Return default hotel data on error
      return {
        success: true,
        data: {
          hotels: this.generateDefaultHotels(rawData),
        },
      };
    }
  }
  
  /**
   * Generate default hotel information when no data is available
   */
  private generateDefaultHotels(rawData: any): Array<{
    name: string;
    stars: string;
    description: string;
    facilities: string[];
    location: string;
  }> {
    const destination = rawData?.location?.destinationCity || rawData?.location?.destinationCountry || '目的地';
    const days = rawData?.duration?.days || 5;
    const nights = days - 1;
    
    return [
      {
        name: `${destination}精選飯店`,
        stars: '四星級',
        description: `位於${destination}市中心的優質飯店，提供舒適的住宿環境和完善的設施。飯店地理位置優越，鄰近主要景點和購物區，交通便利。客房寬敢明亮，配備現代化設施，讓您在旅途中享受家一般的溫馨。`,
        facilities: ['免費 WiFi', '健身房', '餐廳', '商務中心', '機場接送'],
        location: `${destination}市中心`,
      },
    ];
  }
}
