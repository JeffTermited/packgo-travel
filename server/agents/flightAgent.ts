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

      // Validate input data - support multiple field names
      const flightData = rawData?.flight || rawData?.flights || rawData?.flightInfo || null;
      
      if (!rawData || !flightData) {
        console.warn("[FlightAgent] No flight data provided");
        // Return default flight data instead of failing
        return {
          success: true,
          data: this.generateDefaultFlight(rawData),
        };
      }

      // Build prompt for LLM
      const prompt = `
請根據以下航班資訊，生成專業的航班介紹：

航班資訊：
${JSON.stringify(rawData.flight, null, 2)}

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
        console.warn("[FlightAgent] LLM returned null (insufficient data), using default flight");
        return {
          success: true,
          data: this.generateDefaultFlight(rawData),
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
      // Return default flight data on error
      return {
        success: true,
        data: this.generateDefaultFlight(rawData),
      };
    }
  }
  
  /**
   * Generate default flight information when no data is available
   */
  private generateDefaultFlight(rawData: any): FlightAgentResult['data'] {
    const destination = rawData?.location?.destinationCity || rawData?.location?.destinationCountry || '目的地';
    
    return {
      airline: '請依實際訂位為準',
      outbound: {
        flightNo: 'TBA',
        departureTime: '請依實際訂位為準',
        arrivalTime: '請依實際訂位為準',
        duration: '約 3-5 小時',
        departureAirport: '台北桃園國際機場 (TPE)',
        arrivalAirport: `${destination}國際機場`,
      },
      inbound: {
        flightNo: 'TBA',
        departureTime: '請依實際訂位為準',
        arrivalTime: '請依實際訂位為準',
        duration: '約 3-5 小時',
        departureAirport: `${destination}國際機場`,
        arrivalAirport: '台北桃園國際機場 (TPE)',
      },
      description: `從台北桃園國際機場出發，搭乘舒適的國際航班前往${destination}。航班提供貼心的機上服務，讓您在旅途中享受舒適的飛行體驗。具體航班資訊將於訂位確認後提供。`,
      features: ['國際航班', '貼心服務', '舒適座位'],
    };
  }
}
