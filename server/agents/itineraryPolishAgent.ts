/**
 * Itinerary Polish Agent
 * 美化行程措辭，保持原始資訊不變
 * 
 * Claude Hybrid Architecture: Uses Claude 3.5 Sonnet for complex reasoning
 * 
 * Phase 1 優化：
 * - 加入 fidelityCheck 機制
 * - 加入自動修復功能
 * - 強化資料忠實度約束
 */

import { getSonnetAgent, JSONSchema, STRICT_DATA_FIDELITY_RULES } from "./claudeAgent";
import { ExtractedItinerary, ExtractedActivity, TourType } from "./itineraryExtractAgent";
import { loadReference } from "./skillLoader";

export interface PolishedItinerary {
  day: number;
  title: string;
  activities: PolishedActivity[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  accommodation: string;
}

export interface PolishedActivity {
  time: string;
  title: string;
  description: string;
  transportation: string;
  location: string;
}

// Phase 1 新增：忠實度檢查結果
export interface FidelityCheck {
  transportationMatch: boolean;
  hotelMatch: boolean;
  activitiesFromSource: number;
  activitiesAdded: number;
  overallScore: number; // 0-100
  issues: string[];
}

export interface ItineraryPolishResult {
  success: boolean;
  data?: {
    polishedItineraries: PolishedItinerary[];
    fidelityCheck: FidelityCheck;
  };
  error?: string;
}

// Phase 1 新增：原始資料快照介面
export interface OriginalDataSnapshot {
  tourType: TourType;
  originalTransportation: string;
  originalHotels: string[];
  originalAttractions: string[];
}

/**
 * ItineraryPolishAgent
 * 專門美化行程措辭，讓文字更專業、更吸引人
 * 保持原始資訊不變，只改善表達方式
 * 
 * Phase 1 新增功能：
 * - fidelityCheck 機制：驗證生成結果與原始資料的一致性
 * - 自動修復功能：當忠實度檢查失敗時自動修復
 * - 強化約束條件：在 prompt 中加入嚴格的資料忠實度要求
 */
export class ItineraryPolishAgent {
  private dataFidelityRules: string = '';
  
  constructor() {
    console.log('[ItineraryPolishAgent] Initialized with Claude 3.5 Sonnet (Phase 2 optimization)');
    
    // 載入資料忠實度規則
    try {
      this.dataFidelityRules = loadReference('Data-Fidelity-Rules');
      console.log(`[ItineraryPolishAgent] Loaded Data-Fidelity-Rules (${this.dataFidelityRules.length} chars)`);
    } catch (error) {
      console.warn('[ItineraryPolishAgent] Failed to load Data-Fidelity-Rules:', error);
    }
  }

  /**
   * 執行行程美化
   * Phase 1 優化：加入原始資料快照和忠實度檢查
   */
  async execute(
    extractedItineraries: ExtractedItinerary[],
    destinationInfo: { country?: string; city?: string },
    originalDataSnapshot?: OriginalDataSnapshot
  ): Promise<ItineraryPolishResult> {
    console.log(`[ItineraryPolishAgent] Starting to polish ${extractedItineraries.length} days of itinerary...`);
    
    if (originalDataSnapshot) {
      console.log(`[ItineraryPolishAgent] Original data snapshot provided:`);
      console.log(`  - Tour Type: ${originalDataSnapshot.tourType}`);
      console.log(`  - Transportation: ${originalDataSnapshot.originalTransportation}`);
      console.log(`  - Hotels: ${originalDataSnapshot.originalHotels.length} found`);
      console.log(`  - Attractions: ${originalDataSnapshot.originalAttractions.length} found`);
    }
    
    if (extractedItineraries.length === 0) {
      return {
        success: true,
        data: {
          polishedItineraries: [],
          fidelityCheck: {
            transportationMatch: true,
            hotelMatch: true,
            activitiesFromSource: 0,
            activitiesAdded: 0,
            overallScore: 100,
            issues: [],
          },
        },
      };
    }
    
    try {
      // 批次處理所有天數的行程（一次 LLM 調用）
      let polishedItineraries = await this.polishAllDays(
        extractedItineraries, 
        destinationInfo,
        originalDataSnapshot
      );
      
      // Phase 1 新增：執行忠實度檢查
      let fidelityCheck = this.performFidelityCheck(
        polishedItineraries,
        extractedItineraries,
        originalDataSnapshot
      );
      
      console.log(`[ItineraryPolishAgent] Fidelity check result:`);
      console.log(`  - Transportation Match: ${fidelityCheck.transportationMatch}`);
      console.log(`  - Hotel Match: ${fidelityCheck.hotelMatch}`);
      console.log(`  - Activities from Source: ${fidelityCheck.activitiesFromSource}`);
      console.log(`  - Activities Added: ${fidelityCheck.activitiesAdded}`);
      console.log(`  - Overall Score: ${fidelityCheck.overallScore}`);
      
      // Phase 1 新增：如果忠實度分數過低，嘗試自動修復
      if (fidelityCheck.overallScore < 80 && originalDataSnapshot) {
        console.log(`[ItineraryPolishAgent] Fidelity score too low (${fidelityCheck.overallScore}), attempting auto-repair...`);
        polishedItineraries = this.autoRepairItineraries(
          polishedItineraries,
          extractedItineraries,
          originalDataSnapshot
        );
        
        // 重新檢查
        fidelityCheck = this.performFidelityCheck(
          polishedItineraries,
          extractedItineraries,
          originalDataSnapshot
        );
        console.log(`[ItineraryPolishAgent] After auto-repair, fidelity score: ${fidelityCheck.overallScore}`);
      }
      
      console.log(`[ItineraryPolishAgent] Successfully polished ${polishedItineraries.length} days`);
      
      return {
        success: true,
        data: {
          polishedItineraries,
          fidelityCheck,
        },
      };
    } catch (error) {
      console.error("[ItineraryPolishAgent] Error:", error);
      
      // 如果美化失敗，返回原始資料（轉換格式）
      const fallbackItineraries = extractedItineraries.map(itinerary => ({
        ...itinerary,
        activities: itinerary.activities.map(activity => ({
          ...activity,
        })),
      }));
      
      return {
        success: true,
        data: {
          polishedItineraries: fallbackItineraries,
          fidelityCheck: {
            transportationMatch: true,
            hotelMatch: true,
            activitiesFromSource: fallbackItineraries.reduce((sum, day) => sum + day.activities.length, 0),
            activitiesAdded: 0,
            overallScore: 100,
            issues: ['使用原始資料作為 fallback'],
          },
        },
      };
    }
  }

  /**
   * Phase 1 新增：執行忠實度檢查
   */
  private performFidelityCheck(
    polishedItineraries: PolishedItinerary[],
    originalItineraries: ExtractedItinerary[],
    originalDataSnapshot?: OriginalDataSnapshot
  ): FidelityCheck {
    const issues: string[] = [];
    let score = 100;
    
    // 檢查交通方式
    let transportationMatch = true;
    if (originalDataSnapshot?.originalTransportation) {
      const originalTransport = originalDataSnapshot.originalTransportation.toLowerCase();
      
      // 檢查是否有錯誤的交通方式
      for (const day of polishedItineraries) {
        for (const activity of day.activities) {
          const activityText = (activity.title + ' ' + activity.description + ' ' + activity.transportation).toLowerCase();
          
          // 如果原始是火車，但生成了飛機
          if (originalTransport.includes('火車') || originalTransport.includes('鳴日')) {
            if (activityText.includes('飛機') || activityText.includes('航班') || activityText.includes('機場')) {
              transportationMatch = false;
              issues.push(`Day ${day.day}: 交通方式錯誤 - 原始為火車，但生成了飛機相關內容`);
              score -= 30;
            }
          }
          
          // 如果原始是郵輪，但生成了飛機
          if (originalTransport.includes('郵輪') || originalTransport.includes('遊輪')) {
            if (activityText.includes('飛機') || activityText.includes('航班') || activityText.includes('機場')) {
              transportationMatch = false;
              issues.push(`Day ${day.day}: 交通方式錯誤 - 原始為郵輪，但生成了飛機相關內容`);
              score -= 30;
            }
          }
        }
      }
    }
    
    // 檢查飯店名稱
    let hotelMatch = true;
    if (originalDataSnapshot?.originalHotels && originalDataSnapshot.originalHotels.length > 0) {
      for (const day of polishedItineraries) {
        if (day.accommodation) {
          // 檢查是否使用了原始飯店名稱
          const accommodationLower = day.accommodation.toLowerCase();
          const matchedHotel = originalDataSnapshot.originalHotels.find(hotel => 
            accommodationLower.includes(hotel.toLowerCase()) ||
            hotel.toLowerCase().includes(accommodationLower)
          );
          
          if (!matchedHotel && day.accommodation !== '敬請期待' && day.accommodation !== '待確認') {
            // 檢查是否是完全不同的飯店名稱
            const isGenericName = ['飯店', '酒店', 'hotel', '旅館'].some(term => 
              accommodationLower === term || accommodationLower.length < 5
            );
            
            if (!isGenericName) {
              hotelMatch = false;
              issues.push(`Day ${day.day}: 飯店名稱可能被更改 - ${day.accommodation}`);
              score -= 10;
            }
          }
        }
      }
    }
    
    // 計算活動來源
    const originalActivitiesCount = originalItineraries.reduce((sum, day) => sum + day.activities.length, 0);
    const polishedActivitiesCount = polishedItineraries.reduce((sum, day) => sum + day.activities.length, 0);
    const activitiesAdded = Math.max(0, polishedActivitiesCount - originalActivitiesCount);
    
    if (activitiesAdded > originalActivitiesCount * 0.2) {
      issues.push(`新增了過多活動：${activitiesAdded} 個（原始 ${originalActivitiesCount} 個）`);
      score -= 20;
    }
    
    return {
      transportationMatch,
      hotelMatch,
      activitiesFromSource: originalActivitiesCount,
      activitiesAdded,
      overallScore: Math.max(0, score),
      issues,
    };
  }

  /**
   * Phase 1 新增：自動修復行程
   */
  private autoRepairItineraries(
    polishedItineraries: PolishedItinerary[],
    originalItineraries: ExtractedItinerary[],
    originalDataSnapshot: OriginalDataSnapshot
  ): PolishedItinerary[] {
    console.log('[ItineraryPolishAgent] Auto-repairing itineraries...');
    
    const repaired = polishedItineraries.map((day, index) => {
      const originalDay = originalItineraries[index];
      
      // 修復飯店名稱
      let accommodation = day.accommodation;
      if (originalDay?.accommodation) {
        accommodation = originalDay.accommodation;
      } else if (originalDataSnapshot.originalHotels[index]) {
        accommodation = originalDataSnapshot.originalHotels[index];
      }
      
      // 修復交通方式
      const activities = day.activities.map(activity => {
        let transportation = activity.transportation;
        let description = activity.description;
        let title = activity.title;
        
        // 如果是火車行程，移除飛機相關描述
        if (originalDataSnapshot.tourType === 'MINGRI_TRAIN' || 
            originalDataSnapshot.tourType === 'TRAIN' ||
            originalDataSnapshot.originalTransportation.includes('火車')) {
          if (transportation.includes('飛機') || transportation.includes('航班')) {
            transportation = '火車';
          }
          // 修復描述中的錯誤
          description = description.replace(/飛機/g, '火車').replace(/航班/g, '列車').replace(/機場/g, '車站');
          title = title.replace(/飛機/g, '火車').replace(/航班/g, '列車').replace(/機場/g, '車站');
        }
        
        return {
          ...activity,
          transportation,
          description,
          title,
        };
      });
      
      return {
        ...day,
        accommodation,
        activities,
      };
    });
    
    return repaired;
  }

  /**
   * 批次美化所有天數的行程
   * Phase 2 優化：使用 Claude 3.5 Sonnet 進行複雜推理
   */
  private async polishAllDays(
    itineraries: ExtractedItinerary[],
    destinationInfo: { country?: string; city?: string },
    originalDataSnapshot?: OriginalDataSnapshot
  ): Promise<PolishedItinerary[]> {
    // Phase 1 優化：加入資料忠實度約束
    const fidelityConstraints = originalDataSnapshot ? `
🚨 **資料忠實度約束（最高優先級）**：

1. **交通方式**：原始交通方式為「${originalDataSnapshot.originalTransportation}」
   - 絕對禁止更改交通方式
   - 如果原始是火車，絕對不能出現「飛機」「航班」「機場」
   - 如果原始是郵輪，絕對不能出現「飛機」「航班」「機場」

2. **飯店名稱**：原始飯店列表為：
${originalDataSnapshot.originalHotels.map((h, i) => `   - Day ${i + 1}: ${h}`).join('\n')}
   - 必須使用原始飯店名稱，不可替換
   - 不可簡化或更改飯店名稱

3. **景點名稱**：原始景點列表為：
${originalDataSnapshot.originalAttractions.slice(0, 10).map(a => `   - ${a}`).join('\n')}
   - 必須保留原始景點名稱
   - 禁止添加不在原始資料中的景點
` : '';

    const systemPrompt = `你是一位資深旅遊雜誌主編，專門為高端旅遊品牌撰寫行程文案。

你的任務是「美化」行程措辭，讓文字更專業、更吸引人。

${fidelityConstraints}

${STRICT_DATA_FIDELITY_RULES}

重要規則：
1. **保持原始資訊不變**：景點名稱、時間、地點、飯店名稱等資訊必須完全保留
2. **只改善表達方式**：讓描述更生動、更有畫面感
3. **使用感官細節**：加入視覺、聽覺、味覺、觸覺的描述
4. **避免過度修飾**：不要使用「靈魂」「洗滌」「光影」「呢喃」「心靈」「深度對話」「完美融合」等詞彙
5. **保持專業簡潔**：每個活動描述控制在 50-80 字

⛔ 禁止事項：
- 禁止創造原始資料中不存在的景點
- 禁止更改交通方式（火車不能變飛機）
- 禁止替換飯店名稱
- 禁止添加虛構的活動`;

    const userPrompt = `請美化以下行程的措辭：

目的地：${destinationInfo.city || ''}, ${destinationInfo.country || ''}

原始行程資料：
${JSON.stringify(itineraries, null, 2)}

請以 JSON 格式回傳美化後的行程，確保：
1. 保持所有原始資訊（時間、地點、景點名稱、飯店名稱）不變
2. 只改善文字表達方式
3. 每個活動描述控制在 50-80 字
4. 絕對不要更改交通方式或飯店名稱`;

    // Define JSON Schema for polished itineraries
    const polishedSchema: JSONSchema = {
      type: "object",
      properties: {
        itineraries: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "integer" },
              title: { type: "string" },
              activities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    time: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    transportation: { type: "string" },
                    location: { type: "string" },
                  },
                  required: ["time", "title", "description", "transportation", "location"],
                },
              },
              meals: {
                type: "object",
                properties: {
                  breakfast: { type: "string" },
                  lunch: { type: "string" },
                  dinner: { type: "string" },
                },
                required: ["breakfast", "lunch", "dinner"],
              },
              accommodation: { type: "string" },
            },
            required: ["day", "title", "activities", "meals", "accommodation"],
          },
        },
      },
      required: ["itineraries"],
    };

    try {
      const claudeAgent = getSonnetAgent();
      const response = await claudeAgent.sendStructuredMessage<{ itineraries: PolishedItinerary[] }>(
        userPrompt,
        polishedSchema,
        {
          systemPrompt,
          maxTokens: 8192,
          temperature: 0.5,
          schemaName: 'polished_itineraries_output',
          schemaDescription: '美化後的行程結構化輸出',
          strictDataFidelity: true,
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Empty response from Claude");
      }

      const polishedItineraries = response.data.itineraries || [];

      if (!Array.isArray(polishedItineraries)) {
        throw new Error("Invalid response format");
      }

      return polishedItineraries;
    } catch (error) {
      console.error("[ItineraryPolishAgent] Claude error:", error);
      throw error;
    }
  }
}
