/**
 * Cost Agent
 * 生成費用說明
 */

import { invokeLLM } from "../_core/llm";
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
}

/**
 * Cost Agent
 * 使用 COST_SKILL 生成費用說明
 */
export class CostAgent {
  private skillInstructions: string;

  constructor() {
    this.skillInstructions = getKeyInstructions('CostAgent');
    console.log('[CostAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
  }

  /**
   * Execute cost explanation generation
   */
  async execute(
    rawData: any
  ): Promise<CostAgentResult> {
    console.log("[CostAgent] Starting cost explanation generation...");
    
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
      
      let costExplanation;
      try {
        costExplanation = await this.generateCostExplanation(enrichedPricingData);
      } catch (genError) {
        console.warn("[CostAgent] generateCostExplanation failed, using default:", genError);
        costExplanation = null;
      }
      
      if (!costExplanation) {
        console.log("[CostAgent] Using default cost explanation");
        const defaultCost = this.generateDefaultCostExplanation(days, destinationCountry, destinationCity);
        return {
          success: true,
          data: defaultCost,
        };
      }
      
      console.log("[CostAgent] Cost explanation generated successfully");
      
      return {
        success: true,
        data: costExplanation,
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
   * Generate cost explanation with retry mechanism
   */
  private async generateCostExplanation(
    pricingData: any,
    retryCount: number = 0
  ): Promise<{
    included: string[];
    excluded: string[];
    additionalCosts: string[];
    notes: string;
  } | null> {
    const MAX_RETRIES = 2;
    
    try {
      const prompt = `請根據以下資料生成費用說明：

原始資料：
${JSON.stringify(pricingData, null, 2)}

請以 JSON 格式回傳，包含以下欄位：
{
  "included": [
    "來回經濟艙機票",
    "4晚5星級飯店住宿（雙人房）",
    "每日早餐及行程中標註的午晚餐",
    "行程中所列景點門票",
    "全程遊覽車交通",
    "專業中文導遊服務",
    "旅遊責任保險"
  ],
  "excluded": [
    "護照及簽證費用",
    "個人旅遊平安保險（建議自行投保）",
    "導遊、司機小費（建議每人每天 USD 10）",
    "行李超重費用",
    "個人消費（飲料、紀念品、洗衣等）",
    "行程中未標註的餐食",
    "因天氣、罷工等不可抗力因素產生的額外費用"
  ],
  "additionalCosts": [
    "單人房差價：每人加收 NTD 8,000",
    "簽證費用：約 NTD 1,200（代辦服務另計）",
    "建議攜帶現金：每人約 USD 300-500（用於小費、個人消費）",
    "建議小費：導遊每人每天 USD 5、司機每人每天 USD 5"
  ],
  "notes": "以上報價以雙人房為基準，單人報名需補單人房差價。機票及飯店價格可能因淡旺季而有所調整，實際價格以報名時確認為準。"
}

注意：
1. 費用說明總字數控制在 200-300 字之間（寬容檢查：±30% 誤差，即 140-390 字）
2. 包含項目不超過 100 字（寬容檢查：±30% 誤差，即不超過 130 字）
3. 不包含項目不超過 100 字（寬容檢查：±30% 誤差，即不超過 130 字）
4. 額外費用提醒不超過 100 字（寬容檢查：±30% 誤差，即不超過 130 字）
5. 如果資料不足，請回傳 null`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: COST_SKILL },
          { role: "user", content: prompt },
        ],
      });
      
      const content = response.choices[0].message.content;
      
      // Handle content type (string or array)
      let contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      
      if (!contentStr || contentStr.trim().toLowerCase() === "null") {
        console.warn("[CostAgent] Insufficient data, returning null");
        return null;
      }
      
      // Remove markdown code blocks if present
      contentStr = contentStr.trim();
      if (contentStr.startsWith("```json")) {
        contentStr = contentStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (contentStr.startsWith("```")) {
        contentStr = contentStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      
      // Parse JSON response
      const costExplanation = JSON.parse(contentStr);
      
      // Validate word count (total should be 200-300 characters)
      const totalWords = this.calculateTotalWords(costExplanation);
      
      if (totalWords < 200 || totalWords > 300) {
        console.warn(`[CostAgent] Cost explanation word count (${totalWords}) out of range, retrying...`);
        
        if (retryCount < MAX_RETRIES) {
          return this.generateCostExplanation(pricingData, retryCount + 1);
        } else {
          console.warn(`[CostAgent] Cost explanation word count still out of range after ${MAX_RETRIES} retries, using truncation`);
          return this.truncateCostExplanation(costExplanation, 300);
        }
      }
      
      return costExplanation;
    } catch (error) {
      console.error("[CostAgent] Error generating cost explanation:", error);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`[CostAgent] Retrying cost explanation generation (${retryCount + 1}/${MAX_RETRIES})...`);
        return this.generateCostExplanation(pricingData, retryCount + 1);
      }
      
      return null;
    }
  }
  
  /**
   * Calculate total word count of cost explanation
   */
  private calculateTotalWords(costExplanation: any): number {
    let total = 0;
    
    // Included items (with null check)
    if (Array.isArray(costExplanation?.included)) {
      costExplanation.included.forEach((item: string) => {
        total += (item || '').length;
      });
    }
    
    // Excluded items (with null check)
    if (Array.isArray(costExplanation?.excluded)) {
      costExplanation.excluded.forEach((item: string) => {
        total += (item || '').length;
      });
    }
    
    // Additional costs (with null check)
    if (Array.isArray(costExplanation?.additionalCosts)) {
      costExplanation.additionalCosts.forEach((item: string) => {
        total += (item || '').length;
      });
    }
    
    // Notes (with null check)
    total += (costExplanation?.notes || '').length;
    
    return total;
  }
  
  /**
   * Truncate cost explanation to fit word count limit
   */
  private truncateCostExplanation(costExplanation: any, maxWords: number): any {
    // Ensure all required fields exist
    const result = {
      included: Array.isArray(costExplanation?.included) ? costExplanation.included : [],
      excluded: Array.isArray(costExplanation?.excluded) ? costExplanation.excluded : [],
      additionalCosts: Array.isArray(costExplanation?.additionalCosts) ? costExplanation.additionalCosts : [],
      notes: costExplanation?.notes || '',
    };
    
    // Simple truncation strategy: truncate notes
    const currentWords = this.calculateTotalWords(result);
    
    if (currentWords <= maxWords) {
      return result;
    }
    
    const excessWords = currentWords - maxWords;
    
    if (result.notes.length > excessWords) {
      result.notes = result.notes.slice(0, result.notes.length - excessWords) + "...";
    }
    
    return result;
  }
  
  /**
   * Generate default cost explanation when no pricing data is available
   */
  private generateDefaultCostExplanation(
    days: number,
    destinationCountry: string,
    destinationCity: string
  ): {
    included: string[];
    excluded: string[];
    additionalCosts: string[];
    notes: string;
  } {
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
