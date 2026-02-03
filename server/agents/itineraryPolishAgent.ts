/**
 * Itinerary Polish Agent
 * 美化行程措辭，保持原始資訊不變
 * 
 * Claude Hybrid Architecture: Uses Claude 3 Haiku for fast polishing
 * 
 * Phase 1 優化：
 * - 加入 fidelityCheck 機制
 * - 加入自動修復功能
 * - 強化資料忠實度約束
 * 
 * Phase 2 優化（2026-02-01）：
 * - 並行處理每日行程（批次大小 5 天）
 * - 使用 Claude 3 Haiku 加速處理
 * - 簡化 prompt 減少 token 使用
 */

import { getHaikuAgent, getSonnetAgent, JSONSchema, STRICT_DATA_FIDELITY_RULES } from "./claudeAgent";
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
  // Phase 2 新增：每日行程圖片
  image?: string;
  imageAlt?: string;
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

// Phase 2 優化：批次大小
const BATCH_SIZE = 5;

/**
 * ItineraryPolishAgent
 * 專門美化行程措辭，讓文字更專業、更吸引人
 * 保持原始資訊不變，只改善表達方式
 * 
 * Phase 2 優化：
 * - 並行處理每日行程（每批 5 天）
 * - 使用 Claude 3 Haiku 加速
 */
export class ItineraryPolishAgent {
  private dataFidelityRules: string = '';
  
  constructor() {
    console.log('[ItineraryPolishAgent] Initialized with Claude 3 Haiku (Phase 2 parallel optimization)');
    
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
   * Phase 2 優化：並行處理每日行程
   */
  async execute(
    extractedItineraries: ExtractedItinerary[],
    destinationInfo: { country?: string; city?: string },
    originalDataSnapshot?: OriginalDataSnapshot
  ): Promise<ItineraryPolishResult> {
    const startTime = Date.now();
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
      // Phase 2 優化：並行批次處理
      let polishedItineraries = await this.polishAllDaysParallel(
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
      
      const elapsed = Date.now() - startTime;
      console.log(`[ItineraryPolishAgent] Successfully polished ${polishedItineraries.length} days in ${elapsed}ms`);
      
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
   * Phase 2 優化：並行批次處理所有天數的行程
   * 將行程分成多個批次，每批 5 天，並行處理
   */
  private async polishAllDaysParallel(
    itineraries: ExtractedItinerary[],
    destinationInfo: { country?: string; city?: string },
    originalDataSnapshot?: OriginalDataSnapshot
  ): Promise<PolishedItinerary[]> {
    const totalDays = itineraries.length;
    const batches: ExtractedItinerary[][] = [];
    
    // 將行程分成批次
    for (let i = 0; i < totalDays; i += BATCH_SIZE) {
      batches.push(itineraries.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`[ItineraryPolishAgent] Processing ${totalDays} days in ${batches.length} batches (batch size: ${BATCH_SIZE})`);
    
    // 並行處理所有批次
    const batchPromises = batches.map((batch, batchIndex) => 
      this.polishBatch(batch, destinationInfo, batchIndex + 1, batches.length, originalDataSnapshot)
    );
    
    const batchResults = await Promise.all(batchPromises);
    
    // 合併所有批次結果
    const allPolished: PolishedItinerary[] = [];
    for (let i = 0; i < batchResults.length; i++) {
      const result = batchResults[i];
      console.log(`[ItineraryPolishAgent] Batch ${i + 1} result: ${result.length} days`);
      if (result.length === 0) {
        console.warn(`[ItineraryPolishAgent] WARNING: Batch ${i + 1} returned 0 days!`);
      }
      allPolished.push(...result);
    }
    
    console.log(`[ItineraryPolishAgent] Total merged: ${allPolished.length} days from ${batchResults.length} batches`);
    
    return allPolished;
  }

  /**
   * Phase 2 優化：處理單一批次的行程
   */
  private async polishBatch(
    batch: ExtractedItinerary[],
    destinationInfo: { country?: string; city?: string },
    batchNumber: number,
    totalBatches: number,
    originalDataSnapshot?: OriginalDataSnapshot
  ): Promise<PolishedItinerary[]> {
    const startTime = Date.now();
    console.log(`[ItineraryPolishAgent] Processing batch ${batchNumber}/${totalBatches} (${batch.length} days)...`);
    
    // 簡化的 prompt，減少 token 使用
    const systemPrompt = `你是旅遊文案編輯。美化行程描述，保持原始資訊不變。
規則：
1. 保留所有景點名稱、時間、飯店名稱
2. 每個活動描述 40-60 字
3. 使用生動但簡潔的描述
4. 禁止更改交通方式或飯店名稱
${originalDataSnapshot?.originalTransportation ? `原始交通：${originalDataSnapshot.originalTransportation}` : ''}`;

    const userPrompt = `美化以下行程（${destinationInfo.city || ''}, ${destinationInfo.country || ''}）：
${JSON.stringify(batch, null, 2)}

回傳 JSON 格式的美化行程。`;

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
      // Phase 2 優化：使用 Haiku 加速處理
      const claudeAgent = getHaikuAgent();
      const response = await claudeAgent.sendStructuredMessage<{ itineraries: PolishedItinerary[] }>(
        userPrompt,
        polishedSchema,
        {
          systemPrompt,
          maxTokens: 4096,
          temperature: 0.5,
          schemaName: 'polished_itineraries_batch',
          schemaDescription: '美化後的行程批次輸出',
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Empty response from Claude");
      }

      const polishedItineraries = response.data.itineraries || [];
      
      // 新增詳細日誌
      console.log(`[ItineraryPolishAgent] Batch ${batchNumber} Claude response:`);
      console.log(`  - response.success: ${response.success}`);
      console.log(`  - response.data exists: ${!!response.data}`);
      console.log(`  - response.data.itineraries exists: ${!!response.data?.itineraries}`);
      console.log(`  - itineraries count: ${polishedItineraries.length}`);
      if (polishedItineraries.length > 0) {
        console.log(`  - First day: Day ${polishedItineraries[0]?.day}, Title: ${polishedItineraries[0]?.title?.substring(0, 30)}...`);
      }

      if (!Array.isArray(polishedItineraries)) {
        throw new Error("Invalid response format");
      }
      
      // 檢查是否返回的天數與輸入不符
      if (polishedItineraries.length !== batch.length) {
        console.warn(`[ItineraryPolishAgent] WARNING: Batch ${batchNumber} input ${batch.length} days but got ${polishedItineraries.length} days!`);
        console.warn(`  - Input days: ${batch.map(d => d.day).join(', ')}`);
        console.warn(`  - Output days: ${polishedItineraries.map(d => d.day).join(', ')}`);
      }

      const elapsed = Date.now() - startTime;
      console.log(`[ItineraryPolishAgent] Batch ${batchNumber}/${totalBatches} completed in ${elapsed}ms`);

      return polishedItineraries;
    } catch (error) {
      console.error(`[ItineraryPolishAgent] Batch ${batchNumber} error:`, error);
      
      // 返回原始資料作為 fallback
      return batch.map(itinerary => ({
        ...itinerary,
        activities: itinerary.activities.map(activity => ({
          ...activity,
        })),
      }));
    }
  }
}
