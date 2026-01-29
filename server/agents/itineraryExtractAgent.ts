/**
 * Itinerary Extract Agent
 * 從原始網頁資料中提取每日行程（不使用 LLM，純資料解析）
 * 
 * Phase 1 優化：
 * - 加入行程類型識別（鳴日號、郵輪、自駕等）
 * - 動態載入參考文件
 * - 強化資料忠實度約束
 */

import { loadReference, loadReferenceSections } from './skillLoader';

// 行程類型枚舉
export type TourType = 'MINGRI_TRAIN' | 'TRAIN' | 'CRUISE' | 'SELF_DRIVE' | 'FLIGHT' | 'GENERAL';

export interface ExtractedItinerary {
  day: number;
  title: string;
  activities: ExtractedActivity[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  accommodation: string;
}

export interface ExtractedActivity {
  time: string;
  title: string;
  description: string;
  transportation: string;
  location: string;
}

export interface ItineraryExtractResult {
  success: boolean;
  data?: {
    extractedItineraries: ExtractedItinerary[];
    extractionMethod: 'structured' | 'markdown' | 'fallback';
    tourType: TourType;
    originalTransportation: string;
    originalHotels: string[];
    originalAttractions: string[];
  };
  error?: string;
}

/**
 * ItineraryExtractAgent
 * 專門從原始網頁資料中提取每日行程
 * 不修改內容，只做資料結構化
 * 
 * Phase 1 新增功能：
 * - 識別行程類型（鳴日號、郵輪、自駕等）
 * - 提取原始資料快照（用於後續驗證）
 * - 動態載入相關參考文件
 */
export class ItineraryExtractAgent {
  private dataFidelityRules: string = '';
  private tourTypesKnowledge: string = '';
  
  constructor() {
    console.log('[ItineraryExtractAgent] Initialized with Phase 1 optimizations');
    
    // 載入參考文件
    this.loadReferenceDocuments();
  }

  /**
   * 載入參考文件
   */
  private loadReferenceDocuments(): void {
    try {
      // 總是載入資料忠實度規則
      this.dataFidelityRules = loadReference('Data-Fidelity-Rules');
      console.log(`[ItineraryExtractAgent] Loaded Data-Fidelity-Rules (${this.dataFidelityRules.length} chars)`);
    } catch (error) {
      console.warn('[ItineraryExtractAgent] Failed to load Data-Fidelity-Rules:', error);
    }
  }

  /**
   * 識別行程類型
   */
  private identifyTourType(rawData: any): TourType {
    const title = rawData?.title || rawData?.basicInfo?.title || '';
    const content = JSON.stringify(rawData).toLowerCase();
    const searchText = (title + ' ' + content).toLowerCase();
    
    // 鳴日號火車行程（最高優先級）
    if (searchText.includes('鳴日號') || searchText.includes('鳴日') || 
        (searchText.includes('觀光列車') && (searchText.includes('台東') || searchText.includes('花蓮')))) {
      console.log('[ItineraryExtractAgent] Identified tour type: MINGRI_TRAIN');
      
      // 動態載入台灣行程類型知識
      try {
        this.tourTypesKnowledge = loadReferenceSections('Taiwan-Tour-Types', ['鳴日號火車行程']);
        console.log(`[ItineraryExtractAgent] Loaded Taiwan-Tour-Types (鳴日號) (${this.tourTypesKnowledge.length} chars)`);
      } catch (error) {
        console.warn('[ItineraryExtractAgent] Failed to load Taiwan-Tour-Types:', error);
      }
      
      return 'MINGRI_TRAIN';
    }
    
    // 郵輪行程
    if (searchText.includes('郵輪') || searchText.includes('遊輪') || searchText.includes('cruise')) {
      console.log('[ItineraryExtractAgent] Identified tour type: CRUISE');
      return 'CRUISE';
    }
    
    // 自駕行程
    if (searchText.includes('自駕') || searchText.includes('租車') || searchText.includes('開車')) {
      console.log('[ItineraryExtractAgent] Identified tour type: SELF_DRIVE');
      return 'SELF_DRIVE';
    }
    
    // 一般火車行程
    if (searchText.includes('火車') || searchText.includes('鐵路') || searchText.includes('高鐵') || searchText.includes('台鐵')) {
      console.log('[ItineraryExtractAgent] Identified tour type: TRAIN');
      return 'TRAIN';
    }
    
    // 飛機行程
    if (searchText.includes('飛機') || searchText.includes('航班') || searchText.includes('機票')) {
      console.log('[ItineraryExtractAgent] Identified tour type: FLIGHT');
      return 'FLIGHT';
    }
    
    console.log('[ItineraryExtractAgent] Identified tour type: GENERAL');
    return 'GENERAL';
  }

  /**
   * 提取原始交通方式
   */
  private extractOriginalTransportation(rawData: any, tourType: TourType): string {
    // 從 rawData 中提取交通方式
    const transportation = rawData?.transportation || rawData?.basicInfo?.transportation || '';
    
    if (transportation) {
      return transportation;
    }
    
    // 根據行程類型推斷
    switch (tourType) {
      case 'MINGRI_TRAIN':
        return '火車（鳴日號觀光列車）';
      case 'TRAIN':
        return '火車';
      case 'CRUISE':
        return '郵輪';
      case 'SELF_DRIVE':
        return '自駕';
      case 'FLIGHT':
        return '飛機';
      default:
        return '';
    }
  }

  /**
   * 提取原始飯店列表
   */
  private extractOriginalHotels(rawData: any): string[] {
    const hotels: string[] = [];
    
    // 從 hotels 欄位提取
    const hotelData = rawData?.hotels || rawData?.accommodation?.hotels || [];
    if (Array.isArray(hotelData)) {
      for (const hotel of hotelData) {
        const name = typeof hotel === 'string' ? hotel : (hotel.name || hotel.hotelName || '');
        if (name) {
          hotels.push(name);
        }
      }
    }
    
    // 從 dailyItinerary 提取
    const itinerary = rawData?.itinerary || rawData?.dailyItinerary || [];
    if (Array.isArray(itinerary)) {
      for (const day of itinerary) {
        const accommodation = day.accommodation || day.hotel || '';
        if (accommodation && !hotels.includes(accommodation)) {
          hotels.push(accommodation);
        }
      }
    }
    
    // 從單一住宿欄位提取
    const singleHotel = rawData?.accommodation?.hotelName || rawData?.hotelName || '';
    if (singleHotel && !hotels.includes(singleHotel)) {
      hotels.push(singleHotel);
    }
    
    console.log(`[ItineraryExtractAgent] Extracted ${hotels.length} original hotels:`, hotels);
    return hotels;
  }

  /**
   * 提取原始景點列表
   */
  private extractOriginalAttractions(rawData: any): string[] {
    const attractions: string[] = [];
    
    // 從 highlights 提取
    const highlights = rawData?.highlights || [];
    if (Array.isArray(highlights)) {
      for (const h of highlights) {
        const name = typeof h === 'string' ? h : (h.title || h.name || '');
        if (name) {
          attractions.push(name);
        }
      }
    }
    
    // 從 attractions 提取
    const attractionData = rawData?.attractions || [];
    if (Array.isArray(attractionData)) {
      for (const a of attractionData) {
        const name = typeof a === 'string' ? a : (a.name || a.title || '');
        if (name && !attractions.includes(name)) {
          attractions.push(name);
        }
      }
    }
    
    // 從 dailyItinerary 的 activities 提取
    const itinerary = rawData?.itinerary || rawData?.dailyItinerary || [];
    if (Array.isArray(itinerary)) {
      for (const day of itinerary) {
        const activities = day.activities || day.schedule || [];
        if (Array.isArray(activities)) {
          for (const activity of activities) {
            const name = typeof activity === 'string' ? activity : (activity.title || activity.name || '');
            if (name && !attractions.includes(name)) {
              attractions.push(name);
            }
          }
        }
      }
    }
    
    console.log(`[ItineraryExtractAgent] Extracted ${attractions.length} original attractions`);
    return attractions;
  }

  /**
   * 執行行程提取
   */
  async execute(rawData: any): Promise<ItineraryExtractResult> {
    console.log("[ItineraryExtractAgent] Starting itinerary extraction with Phase 1 optimizations...");
    
    try {
      // Step 1: 識別行程類型
      const tourType = this.identifyTourType(rawData);
      
      // Step 2: 提取原始資料快照（用於後續驗證）
      const originalTransportation = this.extractOriginalTransportation(rawData, tourType);
      const originalHotels = this.extractOriginalHotels(rawData);
      const originalAttractions = this.extractOriginalAttractions(rawData);
      
      console.log(`[ItineraryExtractAgent] Original data snapshot:`);
      console.log(`  - Tour Type: ${tourType}`);
      console.log(`  - Transportation: ${originalTransportation}`);
      console.log(`  - Hotels: ${originalHotels.length} found`);
      console.log(`  - Attractions: ${originalAttractions.length} found`);
      
      // Step 3: 嘗試多種提取方式
      let extractedItineraries: ExtractedItinerary[] = [];
      let extractionMethod: 'structured' | 'markdown' | 'fallback' = 'fallback';
      
      // 方法 1: 從結構化資料提取（itinerary 或 dailyItinerary 欄位）
      const structuredResult = this.extractFromStructuredData(rawData);
      if (structuredResult.length > 0) {
        console.log(`[ItineraryExtractAgent] Extracted ${structuredResult.length} days from structured data`);
        extractedItineraries = structuredResult;
        extractionMethod = 'structured';
      }
      
      // 方法 2: 從 Markdown 內容提取（如果結構化資料不足）
      if (extractedItineraries.length === 0 && rawData?.markdown) {
        const markdownResult = this.extractFromMarkdown(rawData.markdown, rawData?.duration?.days || 5);
        if (markdownResult.length > 0) {
          console.log(`[ItineraryExtractAgent] Extracted ${markdownResult.length} days from markdown`);
          extractedItineraries = markdownResult;
          extractionMethod = 'markdown';
        }
      }
      
      // 方法 3: 從 highlights 和 attractions 建立基本框架
      if (extractedItineraries.length === 0) {
        const fallbackResult = this.createFallbackItinerary(rawData, tourType, originalTransportation);
        if (fallbackResult.length > 0) {
          console.log(`[ItineraryExtractAgent] Created ${fallbackResult.length} days from fallback`);
          extractedItineraries = fallbackResult;
          extractionMethod = 'fallback';
        }
      }
      
      console.log(`[ItineraryExtractAgent] Extraction complete: ${extractedItineraries.length} days, method: ${extractionMethod}`);
      
      return {
        success: true,
        data: {
          extractedItineraries,
          extractionMethod,
          tourType,
          originalTransportation,
          originalHotels,
          originalAttractions,
        },
      };
    } catch (error) {
      console.error("[ItineraryExtractAgent] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * 從結構化資料提取行程
   */
  private extractFromStructuredData(rawData: any): ExtractedItinerary[] {
    const itineraryData = rawData?.itinerary || rawData?.dailyItinerary || [];
    
    if (!Array.isArray(itineraryData) || itineraryData.length === 0) {
      return [];
    }
    
    const result: ExtractedItinerary[] = [];
    
    for (let i = 0; i < itineraryData.length; i++) {
      const dayData = itineraryData[i];
      
      // 提取活動
      const activities: ExtractedActivity[] = [];
      const rawActivities = dayData.activities || dayData.schedule || dayData.items || [];
      
      if (Array.isArray(rawActivities)) {
        for (const activity of rawActivities) {
          // 如果 activity 是字串，直接使用
          if (typeof activity === 'string') {
            activities.push({
              time: '',
              title: activity,
              description: activity,
              transportation: '',
              location: '',
            });
          } else {
            activities.push({
              time: activity.time || activity.timeSlot || '',
              title: activity.title || activity.name || activity.activity || '',
              description: activity.description || activity.details || activity.content || '',
              transportation: activity.transportation || activity.transport || '',
              location: activity.location || activity.place || activity.venue || '',
            });
          }
        }
      }
      
      // 提取餐食
      const meals = {
        breakfast: dayData.meals?.breakfast || dayData.breakfast || '',
        lunch: dayData.meals?.lunch || dayData.lunch || '',
        dinner: dayData.meals?.dinner || dayData.dinner || '',
      };
      
      // 處理 meals 字串格式（如 "早/午/晚"）
      if (dayData.meals && typeof dayData.meals === 'string') {
        const mealStr = dayData.meals;
        meals.breakfast = mealStr.includes('早') ? '飯店早餐' : '';
        meals.lunch = mealStr.includes('午') ? '當地特色餐' : '';
        meals.dinner = mealStr.includes('晚') ? '精選餐廳' : '';
      }
      
      // 提取住宿（保持原始名稱）
      const accommodation = dayData.accommodation || dayData.hotel || dayData.stay || '';
      
      // 提取標題
      let title = dayData.title || dayData.name || '';
      if (!title) {
        // 嘗試從活動中生成標題
        const firstActivity = activities[0]?.title || '';
        title = `Day ${i + 1}${firstActivity ? `：${firstActivity}` : ''}`;
      }
      
      result.push({
        day: dayData.day || i + 1,
        title,
        activities,
        meals,
        accommodation,
      });
    }
    
    return result;
  }

  /**
   * 從 Markdown 內容提取行程
   */
  private extractFromMarkdown(markdown: string, expectedDays: number): ExtractedItinerary[] {
    const result: ExtractedItinerary[] = [];
    
    // 匹配 Day X 或 第X天 的模式
    const dayPatterns = [
      /(?:^|\n)#+\s*(?:Day\s*(\d+)|第\s*(\d+)\s*天)[：:.]?\s*(.+)?/gi,
      /(?:^|\n)\*\*(?:Day\s*(\d+)|第\s*(\d+)\s*天)[：:.]?\s*(.+)?\*\*/gi,
    ];
    
    let matches: { day: number; title: string; startIndex: number; endIndex?: number }[] = [];
    
    for (const pattern of dayPatterns) {
      let match;
      while ((match = pattern.exec(markdown)) !== null) {
        const dayNum = parseInt(match[1] || match[2]);
        const title = match[3]?.trim() || '';
        matches.push({
          day: dayNum,
          title: title || `Day ${dayNum}`,
          startIndex: match.index,
        });
      }
    }
    
    // 按位置排序
    matches.sort((a, b) => a.startIndex - b.startIndex);
    
    // 去重（相同天數只保留第一個）
    const uniqueMatches: typeof matches = [];
    const seenDays = new Set<number>();
    for (const match of matches) {
      if (!seenDays.has(match.day)) {
        seenDays.add(match.day);
        uniqueMatches.push(match);
      }
    }
    matches = uniqueMatches;
    
    // 設定結束位置
    for (let i = 0; i < matches.length; i++) {
      matches[i].endIndex = i < matches.length - 1 ? matches[i + 1].startIndex : markdown.length;
    }
    
    // 提取每天的內容
    for (const match of matches) {
      const dayContent = markdown.slice(match.startIndex, match.endIndex);
      
      // 提取活動（尋找時間格式）
      const activities: ExtractedActivity[] = [];
      const timePattern = /(\d{1,2}[：:]\d{2})\s*[-~～]\s*(\d{1,2}[：:]\d{2})?\s*[：:]?\s*(.+)/g;
      let activityMatch;
      
      while ((activityMatch = timePattern.exec(dayContent)) !== null) {
        const startTime = activityMatch[1].replace('：', ':');
        const endTime = activityMatch[2]?.replace('：', ':') || '';
        const content = activityMatch[3].trim();
        
        activities.push({
          time: endTime ? `${startTime}-${endTime}` : startTime,
          title: content.split(/[，,。.]/)[0] || content,
          description: content,
          transportation: '',
          location: '',
        });
      }
      
      // 提取餐食
      const meals = {
        breakfast: this.extractMealFromContent(dayContent, ['早餐', 'breakfast', '早']),
        lunch: this.extractMealFromContent(dayContent, ['午餐', 'lunch', '中餐']),
        dinner: this.extractMealFromContent(dayContent, ['晚餐', 'dinner', '晚']),
      };
      
      // 提取住宿
      const accommodation = this.extractAccommodationFromContent(dayContent);
      
      result.push({
        day: match.day,
        title: match.title,
        activities,
        meals,
        accommodation,
      });
    }
    
    return result;
  }

  /**
   * 從內容中提取餐食資訊
   */
  private extractMealFromContent(content: string, keywords: string[]): string {
    for (const keyword of keywords) {
      const pattern = new RegExp(`${keyword}[：:]\\s*(.+?)(?:\\n|$)`, 'i');
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return '';
  }

  /**
   * 從內容中提取住宿資訊
   */
  private extractAccommodationFromContent(content: string): string {
    const keywords = ['住宿', '飯店', '酒店', 'hotel', 'accommodation', '入住'];
    for (const keyword of keywords) {
      const pattern = new RegExp(`${keyword}[：:]\\s*(.+?)(?:\\n|$)`, 'i');
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return '';
  }

  /**
   * 建立 Fallback 行程框架
   * Phase 1 優化：根據行程類型調整內容
   */
  private createFallbackItinerary(rawData: any, tourType: TourType, transportation: string): ExtractedItinerary[] {
    const days = rawData?.duration?.days || 5;
    const highlights = rawData?.highlights || [];
    const attractions = rawData?.attractions || [];
    const destinationCity = rawData?.location?.destinationCity || rawData?.destination || '';
    const hotelName = rawData?.accommodation?.hotelName || '';
    
    if (!destinationCity && highlights.length === 0 && attractions.length === 0) {
      return [];
    }
    
    const result: ExtractedItinerary[] = [];
    
    // 合併所有可用的景點/亮點
    const allPoints: string[] = [
      ...highlights.map((h: any) => typeof h === 'string' ? h : h.title || h.name || ''),
      ...attractions.map((a: any) => typeof a === 'string' ? a : a.name || a.title || ''),
    ].filter(Boolean);
    
    // 分配到每天
    const pointsPerDay = Math.ceil(allPoints.length / days);
    
    for (let i = 0; i < days; i++) {
      const dayPoints = allPoints.slice(i * pointsPerDay, (i + 1) * pointsPerDay);
      
      // 建立活動
      const activities: ExtractedActivity[] = dayPoints.map((point, idx) => ({
        time: `${9 + idx * 3}:00-${12 + idx * 3}:00`,
        title: point,
        description: `探索${point}`,
        transportation: transportation, // 使用識別出的交通方式
        location: point,
      }));
      
      // 設定標題（根據行程類型調整）
      let title = `Day ${i + 1}`;
      if (i === 0) {
        if (tourType === 'MINGRI_TRAIN') {
          title += `：搭乘鳴日號出發`;
        } else if (tourType === 'CRUISE') {
          title += `：登船出發`;
        } else {
          title += `：抵達${destinationCity}`;
        }
      } else if (i === days - 1) {
        title += `：返程`;
      } else if (dayPoints.length > 0) {
        title += `：${dayPoints[0]}`;
      }
      
      result.push({
        day: i + 1,
        title,
        activities,
        meals: {
          breakfast: '飯店早餐',
          lunch: '當地特色餐廳',
          dinner: '精選餐廳',
        },
        accommodation: hotelName || '當地精選飯店',
      });
    }
    
    return result;
  }
}
