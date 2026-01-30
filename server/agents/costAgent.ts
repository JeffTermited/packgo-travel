/**
 * Cost Agent
 * 生成費用說明
 * 
 * Claude Hybrid Architecture:
 * - Uses Claude 3 Haiku for fast, cost-effective extraction
 * - Uses native JSON Schema for guaranteed valid output
 * - No more JSON parsing errors or regex cleaning
 */

import { getHaikuAgent, JSONSchema, STRICT_DATA_FIDELITY_RULES } from "./claudeAgent";
import { getKeyInstructions } from "./skillLoader";
import { COST_SKILL } from "./skillLibrary";

export interface CostAgentResult {
  success: boolean;
  data?: {
    included: string[]; // 團費包含項目
    excluded: string[]; // 團費不包含項目
    additionalCosts: string[]; // 額外費用提醒
    notes: string; // 費用說明備註
  };
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// JSON Schema for Cost output
const COST_SCHEMA: JSONSchema = {
  type: 'object',
  properties: {
    included: {
      type: 'array',
      description: '團費包含項目，如機票、住宿、餐食、門票、交通、導遊、保險等',
      items: {
        type: 'string',
        description: '單條包含項目',
        maxLength: 50,
      },
    },
    excluded: {
      type: 'array',
      description: '團費不包含項目，如護照、簽證、小費、行李超重、個人消費等',
      items: {
        type: 'string',
        description: '單條不包含項目',
        maxLength: 50,
      },
    },
    additionalCosts: {
      type: 'array',
      description: '額外費用提醒，如單人房差、簽證費、建議攜帶現金、小費建議等',
      items: {
        type: 'string',
        description: '單條額外費用提醒',
        maxLength: 60,
      },
    },
    notes: {
      type: 'string',
      description: '費用說明備註，如報價基準、價格調整說明等',
      maxLength: 200,
    },
  },
  required: ['included', 'excluded', 'additionalCosts', 'notes'],
  additionalProperties: false,
};

// Type for the schema output
interface CostSchemaOutput {
  included: string[];
  excluded: string[];
  additionalCosts: string[];
  notes: string;
}

/**
 * Cost Agent
 * 使用 Claude 3 Haiku + JSON Schema 生成費用說明
 */
export class CostAgent {
  private skillInstructions: string;

  constructor() {
    this.skillInstructions = getKeyInstructions('CostAgent');
    console.log('[CostAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
    console.log('[CostAgent] Using Claude 3 Haiku with JSON Schema');
  }

  /**
   * Execute cost explanation generation
   */
  async execute(
    rawData: any
  ): Promise<CostAgentResult> {
    console.log("[CostAgent] Starting cost explanation generation with Claude...");
    
    try {
      // Validate input data - support multiple field names
      const pricingData = rawData?.pricing || rawData?.pricingDetails || {};
      const days = rawData?.duration?.days || 5;
      const destinationCountry = rawData?.location?.destinationCountry || "";
      const destinationCity = rawData?.location?.destinationCity || "";
      
      // If no pricing data, generate default cost explanation
      if (!pricingData || (Object.keys(pricingData).length === 0 && !pricingData.includes && !pricingData.excludes)) {
        console.log("[CostAgent] No pricing data found, generating default cost explanation...");
        const defaultCost = this.generateDefaultCostExplanation(days, destinationCountry, destinationCity);
        return {
          success: true,
          data: defaultCost,
        };
      }
      
      // Merge pricing data with context info
      const enrichedPricingData = {
        ...pricingData,
        days,
        destinationCountry,
        destinationCity,
      };
      
      const result = await this.generateCostWithClaude(enrichedPricingData);
      
      if (!result.success || !result.data) {
        console.warn("[CostAgent] Claude generation failed, using default template");
        return {
          success: true,
          data: this.generateDefaultCostExplanation(days, destinationCountry, destinationCity),
          usage: result.usage,
        };
      }
      
      console.log("[CostAgent] Cost explanation generated successfully with Claude");
      
      return {
        success: true,
        data: result.data,
        usage: result.usage,
      };
    } catch (error) {
      console.error("[CostAgent] Error:", error);
      // Final fallback: return default cost explanation
      const defaultCost = this.generateDefaultCostExplanation(5, "", "");
      return {
        success: true,
        data: defaultCost,
      };
    }
  }
  
  /**
   * Generate cost explanation using Claude 3 Haiku with JSON Schema
   * This guarantees valid JSON output - no parsing errors possible
   */
  private async generateCostWithClaude(
    pricingData: any
  ): Promise<{
    success: boolean;
    data?: CostSchemaOutput;
    usage?: { inputTokens: number; outputTokens: number };
  }> {
    console.log("[CostAgent] Calling Claude 3 Haiku with JSON Schema...");
    
    const prompt = `請根據以下定價資訊，生成費用說明。

定價資訊：
${JSON.stringify(pricingData, null, 2)}

要求：
1. 包含項目（included）：列出 5-7 項團費包含的服務
2. 不包含項目（excluded）：列出 5-6 項團費不包含的費用
3. 額外費用提醒（additionalCosts）：列出 3-4 項額外費用或建議
4. 備註（notes）：簡短說明報價基準和注意事項

注意：
- 所有內容必須基於提供的資料
- 如果某些資訊不確定，請使用通用的旅遊業標準說明
- 金額和數字必須準確，不能隨意編造

請直接提取並返回結構化的費用說明。`;

    const systemPrompt = `${COST_SKILL}

你是一位專業的旅遊業務顧問，擅長為旅客提供清晰的費用說明。
你的說明必須基於真實資訊，不能編造任何金額或服務內容。

${STRICT_DATA_FIDELITY_RULES}`;

    try {
      const claudeAgent = getHaikuAgent();
      
      const result = await claudeAgent.sendStructuredMessage<CostSchemaOutput>(
        prompt,
        COST_SCHEMA,
        {
          systemPrompt,
          maxTokens: 2048,
          temperature: 0.3, // Low temperature for consistent output
          schemaName: 'cost_output',
          schemaDescription: '費用說明結構化輸出',
          strictDataFidelity: true,
        }
      );

      if (!result.success || !result.data) {
        console.error("[CostAgent] Claude returned error:", result.error);
        return {
          success: false,
          usage: result.usage,
        };
      }

      // Validate and normalize the output
      const normalizedData = this.normalizeCost(result.data);
      
      console.log("[CostAgent] Claude response validated successfully");
      console.log(`[CostAgent] Token usage - Input: ${result.usage?.inputTokens}, Output: ${result.usage?.outputTokens}`);

      return {
        success: true,
        data: normalizedData,
        usage: result.usage,
      };
    } catch (error) {
      console.error("[CostAgent] Claude API error:", error);
      return {
        success: false,
      };
    }
  }
  
  /**
   * Normalize cost structure to ensure all fields are valid
   */
  private normalizeCost(cost: CostSchemaOutput): CostSchemaOutput {
    const toArray = (value: any): string[] => {
      if (Array.isArray(value)) {
        return value.filter(item => typeof item === 'string').slice(0, 8); // Max 8 items per category
      }
      if (typeof value === 'string') {
        return [value];
      }
      return [];
    };
    
    return {
      included: toArray(cost?.included),
      excluded: toArray(cost?.excluded),
      additionalCosts: toArray(cost?.additionalCosts),
      notes: typeof cost?.notes === 'string' ? cost.notes : '',
    };
  }
  
  /**
   * Generate default cost explanation when no pricing data is available
   */
  private generateDefaultCostExplanation(
    days: number,
    destinationCountry: string,
    destinationCity: string
  ): CostSchemaOutput {
    const destination = destinationCity || destinationCountry || "目的地";
    const nights = days - 1;
    
    return {
      included: [
        "來回經濟艙機票",
        `${nights}晚精選飯店住宿（雙人房）`,
        "每日早餐及行程中標註的午晚餐",
        "行程中所列景點門票",
        "全程遊覽車交通",
        "專業中文導遊服務",
        "旅遊責任保險"
      ],
      excluded: [
        "護照及簽證費用",
        "個人旅遊平安保險（建議自行投保）",
        "導遊、司機小費（建議每人每天 USD 10）",
        "行李超重費用",
        "個人消費（飲料、紀念品、洗衣等）",
        "行程中未標註的餐食"
      ],
      additionalCosts: [
        "單人房差價：每人加收 NTD 8,000",
        `建議攜帶現金：每人約 USD 300-500（用於小費、個人消費）`,
        "建議小費：導遊每人每天 USD 5、司機每人每天 USD 5"
      ],
      notes: `以上報價以雙人房為基準，單人報名需補單人房差價。機票及飯店價格可能因淡旺季而有所調整，實際價格以報名時確認為準。`
    };
  }
}
