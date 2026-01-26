import { invokeLLM } from "../_core/llm";
import { HOTEL_SKILL } from "./skillLibrary";
import { getKeyInstructions } from "./skillLoader";

export interface HotelAgentResult {
  success: boolean;
  data?: {
    title: string;           // 飯店名稱
    subtitle?: string;       // 副標題 (例如: "海上水上屋")
    badge?: string;          // 保證標籤 (例如: "保證入住")
    description: string;     // 詳細描述 (段落文字, 100-200字)
    roomTypes: string[];     // 房型說明
    policies: string[];      // 政策和注意事項
    facilities: {
      free: string[];        // 免費設施/活動
      paid: string[];        // 付費設施/活動
    };
    images: Array<{
      url: string;
      caption: string;       // 圖片說明 (例如: "飯店外觀")
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

      // Build prompt for LLM (Lion Travel style)
      const prompt = `
請根據以下住宿資訊，生成符合雄獅旅遊風格的飯店介紹：

住宿資訊：
${JSON.stringify(rawData.accommodation, null, 2)}

請以 JSON 格式回傳，包含以下欄位：
{
  "title": "飯店名稱",
  "subtitle": "副標題（例如：海上水上屋、五星級度假村）",
  "badge": "保證標籤（例如：保證入住、獨家安排）",
  "description": "詳細描述（100-200字，包含飯店位置、特色、房間數量、設計理念、風格描述，使用具體數字增加可信度）",
  "roomTypes": ["房型說明1", "房型說明2"],
  "policies": ["政策和注意事項1", "政策和注意事項2"],
  "facilities": {
    "free": ["免費設施/活動1", "免費設施/活動2", "免費設施/活動3"],
    "paid": ["付費設施/活動1", "付費設施/活動2"]
  },
  "images": [
    {"url": "placeholder-hotel-exterior.jpg", "caption": "飯店外觀"},
    {"url": "placeholder-hotel-room.jpg", "caption": "飯店房型"},
    {"url": "placeholder-hotel-activity.jpg", "caption": "飯店活動"}
  ]
}

**風格要求：**
- 描述應詳細且資訊完整，使用具體數字（例如：393間海上渡假屋）
- 設施列表應明確區分免費和付費項目
- 房型說明應包含房型名稱和特點
- 政策說明應清晰易懂

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

      // Validate word count for description
      if (hotelData.description) {
        const wordCount = hotelData.description.length;
        if (wordCount < 100 || wordCount > 200) {
          console.warn(
            `[HotelAgent] Hotel description word count out of range: ${wordCount} (expected 100-200)`
          );
          // Truncate if too long
          if (wordCount > 200) {
            hotelData.description = hotelData.description.substring(0, 200) + "...";
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
