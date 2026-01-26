import { invokeLLM } from "../_core/llm";
import { FLIGHT_SKILL } from "./skillLibrary";
import { getKeyInstructions } from "./skillLoader";

export interface FlightAgentResult {
  success: boolean;
  data?: {
    airline: string;
    outbound: {
      flightNo: string;
      departureTime: string;
      arrivalTime: string;
      duration: string;
      departureAirport: string;
      arrivalAirport: string;
    };
    inbound: {
      flightNo: string;
      departureTime: string;
      arrivalTime: string;
      duration: string;
      departureAirport: string;
      arrivalAirport: string;
    };
    description: string;
    features: string[];
  };
  error?: string;
}

export class FlightAgent {
  private skillInstructions: string;

  constructor() {
    this.skillInstructions = getKeyInstructions('FlightAgent');
    console.log('[FlightAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
  }

  async execute(rawData: any): Promise<FlightAgentResult> {
    try {
      console.log("[FlightAgent] Starting flight information generation...");

      // 嘗試從多種資料來源提取航班資訊
      const flightData = this.extractFlightData(rawData);
      
      if (!flightData) {
        console.warn("[FlightAgent] No flight data available from any source");
        return {
          success: false,
          error: "No flight data available",
        };
      }
      
      console.log("[FlightAgent] Extracted flight data:", JSON.stringify(flightData).substring(0, 200));

      // Build prompt for LLM
      const prompt = `
請根據以下航班資訊，生成專業的航班介紹：

航班資訊：
${JSON.stringify(flightData, null, 2)}

請以 JSON 格式回傳，包含以下欄位：
{
  "airline": "航空公司名稱",
  "outbound": {
    "flightNo": "去程航班號",
    "departureTime": "去程出發時間",
    "arrivalTime": "去程抵達時間",
    "duration": "去程飛行時長",
    "departureAirport": "出發機場",
    "arrivalAirport": "抵達機場"
  },
  "inbound": {
    "flightNo": "回程航班號",
    "departureTime": "回程出發時間",
    "arrivalTime": "回程抵達時間",
    "duration": "回程飛行時長",
    "departureAirport": "出發機場",
    "arrivalAirport": "抵達機場"
  },
  "description": "航班描述（150-200字，包含航空公司、航班時間、飛行時長、機上服務）",
  "features": ["特色1", "特色2", "特色3"]
}

**重要：如果提供的航班資訊不足以生成完整的航班介紹，請回傳 null。**
`;

      // Call LLM with FLIGHT_SKILL
      const response = await invokeLLM({
        messages: [
          { role: "system", content: FLIGHT_SKILL },
          { role: "user", content: prompt },
        ],
      });

      const content = typeof response.choices[0].message.content === 'string' 
        ? response.choices[0].message.content.trim() 
        : null;

      if (!content || content === "null") {
        console.warn("[FlightAgent] LLM returned null (insufficient data)");
        return {
          success: false,
          error: "Insufficient data to generate flight information",
        };
      }

      // Parse JSON response
      let parsedFlightData;
      try {
        parsedFlightData = JSON.parse(content);
      } catch (parseError) {
        console.error("[FlightAgent] Failed to parse LLM response:", parseError);
        return {
          success: false,
          error: "Failed to parse flight information",
        };
      }

      // Validate word count for description
      if (parsedFlightData.description) {
        const wordCount = parsedFlightData.description.length;
        if (wordCount < 150 || wordCount > 200) {
          console.warn(
            `[FlightAgent] Flight description word count out of range: ${wordCount} (expected 150-200)`
          );
          // Truncate if too long
          if (wordCount > 200) {
            parsedFlightData.description = parsedFlightData.description.substring(0, 200) + "...";
          }
        }
      }

      console.log("[FlightAgent] Flight information generated successfully");
      return {
        success: true,
        data: parsedFlightData,
      };
    } catch (error) {
      console.error("[FlightAgent] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * 從多種資料來源提取航班資訊
   */
  private extractFlightData(rawData: any): any | null {
    if (!rawData) return null;
    
    // 1. 直接使用 flight 欄位
    if (rawData.flight && Object.keys(rawData.flight).length > 0) {
      console.log("[FlightAgent] Using flight field directly");
      return rawData.flight;
    }
    
    // 2. 從 itinerary 提取航班資訊 (第一天和最後一天)
    const itineraryData = rawData.itinerary || rawData.dailyItinerary || [];
    if (itineraryData.length > 0) {
      const firstDay = itineraryData[0];
      const lastDay = itineraryData[itineraryData.length - 1];
      
      // 檢查第一天是否有航班資訊
      if (firstDay.flight || firstDay.transportation?.includes('航班') || firstDay.transportation?.includes('飛機')) {
        console.log("[FlightAgent] Extracted flight from first day itinerary");
        return {
          outbound: firstDay.flight || { description: firstDay.transportation },
          inbound: lastDay.flight || { description: lastDay.transportation }
        };
      }
    }
    
    // 3. 從 highlights 提取航班相關資訊
    const highlights = rawData.highlights || [];
    const flightRelatedHighlights = highlights.filter((h: string) => 
      h.includes('航班') || h.includes('飛機') || h.includes('航空') || 
      h.includes('直飛') || h.includes('轉機')
    );
    
    if (flightRelatedHighlights.length > 0) {
      console.log(`[FlightAgent] Extracted flight highlights: ${flightRelatedHighlights.length}`);
      return {
        description: flightRelatedHighlights.join('、'),
        features: flightRelatedHighlights
      };
    }
    
    // 4. 從 location 提取出發地和目的地
    if (rawData.location) {
      const { departureCity, destinationCity } = rawData.location;
      if (departureCity && destinationCity) {
        console.log(`[FlightAgent] Generating flight info from location: ${departureCity} -> ${destinationCity}`);
        return {
          departureCity,
          destinationCity,
          description: `從${departureCity}出發前往${destinationCity}`
        };
      }
    }
    
    return null;
  }
}
