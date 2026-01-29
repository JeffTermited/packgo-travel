/**
 * Itinerary Extract Agent
 * 從原始網頁資料中提取每日行程（不使用 LLM，純資料解析）
 */

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
  };
  error?: string;
}

/**
 * ItineraryExtractAgent
 * 專門從原始網頁資料中提取每日行程
 * 不修改內容，只做資料結構化
 */
export class ItineraryExtractAgent {
  constructor() {
    console.log('[ItineraryExtractAgent] Initialized');
  }

  /**
   * 執行行程提取
   */
  async execute(rawData: any): Promise<ItineraryExtractResult> {
    console.log("[ItineraryExtractAgent] Starting itinerary extraction...");
    
    try {
      // 嘗試多種提取方式
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
        const fallbackResult = this.createFallbackItinerary(rawData);
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
          activities.push({
            time: activity.time || activity.timeSlot || '',
            title: activity.title || activity.name || activity.activity || '',
            description: activity.description || activity.details || activity.content || '',
            transportation: activity.transportation || activity.transport || '',
            location: activity.location || activity.place || activity.venue || '',
          });
        }
      }
      
      // 提取餐食
      const meals = {
        breakfast: dayData.meals?.breakfast || dayData.breakfast || '',
        lunch: dayData.meals?.lunch || dayData.lunch || '',
        dinner: dayData.meals?.dinner || dayData.dinner || '',
      };
      
      // 提取住宿
      const accommodation = dayData.accommodation || dayData.hotel || dayData.stay || '';
      
      // 提取標題
      let title = dayData.title || dayData.name || '';
      if (!title) {
        // 嘗試從活動中生成標題
        const firstActivity = activities[0]?.title || '';
        title = `Day ${i + 1}${firstActivity ? `：${firstActivity}` : ''}`;
      }
      
      result.push({
        day: i + 1,
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
   */
  private createFallbackItinerary(rawData: any): ExtractedItinerary[] {
    const days = rawData?.duration?.days || 5;
    const highlights = rawData?.highlights || [];
    const attractions = rawData?.attractions || [];
    const destinationCity = rawData?.location?.destinationCity || '';
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
        transportation: '',
        location: point,
      }));
      
      // 設定標題
      let title = `Day ${i + 1}`;
      if (i === 0) {
        title += `：抵達${destinationCity}`;
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
