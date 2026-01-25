import { invokeLLM } from "../_core/llm";
import { FLIGHT_SKILL } from "./skillLibrary";

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
  async execute(rawData: any): Promise<FlightAgentResult> {
    try {
      console.log("[FlightAgent] Starting flight information generation...");

      // Validate input data
      if (!rawData || !rawData.flight) {
        console.warn("[FlightAgent] No flight data provided");
        return {
          success: false,
          error: "No flight data available",
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
        console.warn("[FlightAgent] LLM returned null (insufficient data)");
        return {
          success: false,
          error: "Insufficient data to generate flight information",
        };
      }

      // Parse JSON response
      let flightData;
      try {
        flightData = JSON.parse(content);
      } catch (parseError) {
        console.error("[FlightAgent] Failed to parse LLM response:", parseError);
        return {
          success: false,
          error: "Failed to parse flight information",
        };
      }

      // Validate word count for description
      if (flightData.description) {
        const wordCount = flightData.description.length;
        if (wordCount < 150 || wordCount > 200) {
          console.warn(
            `[FlightAgent] Flight description word count out of range: ${wordCount} (expected 150-200)`
          );
          // Truncate if too long
          if (wordCount > 200) {
            flightData.description = flightData.description.substring(0, 200) + "...";
          }
        }
      }

      console.log("[FlightAgent] Flight information generated successfully");
      return {
        success: true,
        data: flightData,
      };
    } catch (error) {
      console.error("[FlightAgent] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
