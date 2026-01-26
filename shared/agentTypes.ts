/**
 * 標準 Agent 輸出格式定義
 * 
 * 此檔案定義所有 Agents 的標準輸出格式,確保資料格式統一,
 * 避免前端渲染錯誤 (例如: "Objects are not valid as a React child")
 */

// ============================================================================
// ContentAnalyzerAgent 輸出格式
// ============================================================================

export interface ContentAnalyzerResult {
  /** 標準標題 (簡潔版) */
  title: string;
  
  /** 詩意化標題 (Sipincollection 風格) */
  poeticTitle: string;
  
  /** 行程描述 (100-150 字) */
  description: string;
  
  /** 行程亮點 (6-10 個,純字串陣列) */
  highlights: string[];  // ← 必須是字串陣列,不是物件陣列
}

// ============================================================================
// ColorThemeAgent 輸出格式
// ============================================================================

export interface ColorTheme {
  /** 主色 (例如: #1A1A1A) */
  primary: string;
  
  /** 次要色 (例如: #FFD700) */
  secondary: string;
  
  /** 強調色 (例如: #FF6B6B) */
  accent: string;
  
  /** 背景色 (例如: #FFFFFF) */
  background?: string;
  
  /** 文字色 (例如: #333333) */
  text?: string;
}

export interface ColorThemeResult {
  /** 配色主題 (JSON 物件,儲存時需轉為字串) */
  colorTheme: ColorTheme;
}

// ============================================================================
// ImageGenerationAgent 輸出格式
// ============================================================================

export interface ImageGenerationResult {
  /** Hero 圖片 URL (1 張超大型圖片) */
  heroImage: string;
  
  /** 特色圖片 URLs (3-6 張) */
  featureImages: string[];  // ← 必須是字串陣列 (URLs)
}

// ============================================================================
// ItineraryAgent 輸出格式
// ============================================================================

export interface DailyItineraryDay {
  /** 第幾天 (1, 2, 3, ...) */
  day: number;
  
  /** 當天標題 (例如: "抵達東京 - 淺草寺巡禮") */
  title: string;
  
  /** 當天詳細描述 (200-300 字) */
  description: string;
  
  /** 當天圖片 URLs (1-3 張) */
  images: string[];  // ← 必須是字串陣列 (URLs)
  
  /** 當天餐食 (可選) */
  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  
  /** 當天住宿 (可選) */
  accommodation?: string;
}

export interface ItineraryResult {
  /** 每日行程 (JSON 陣列,儲存時需轉為字串) */
  dailyItinerary: DailyItineraryDay[];
}

// ============================================================================
// CostAgent 輸出格式
// ============================================================================

export interface CostResult {
  /** 費用說明 (純文字) */
  costExplanation: string;
}

// ============================================================================
// NoticeAgent 輸出格式
// ============================================================================

export interface NoticeItem {
  /** 注意事項類別 (例如: "簽證", "氣候", "健康") */
  category: string;
  
  /** 注意事項內容 */
  content: string;
}

export interface NoticeResult {
  /** 注意事項列表 (JSON 陣列,儲存時需轉為字串) */
  notices: NoticeItem[];
}

// ============================================================================
// HotelAgent 輸出格式
// ============================================================================

export interface HotelResult {
  /** 飯店資訊 (純文字) */
  hotelInfo: string;
}

// ============================================================================
// MealAgent 輸出格式
// ============================================================================

export interface MealResult {
  /** 餐食資訊 (純文字) */
  mealInfo: string;
}

// ============================================================================
// FlightAgent 輸出格式
// ============================================================================

export interface FlightResult {
  /** 航班資訊 (純文字) */
  flightInfo: string;
}

// ============================================================================
// MasterAgent 輸出格式 (整合所有 Agents 的結果)
// ============================================================================

export interface MasterAgentResult {
  // ContentAnalyzerAgent
  title: string;
  poeticTitle: string;
  description: string;
  highlights: string[];  // ← 字串陣列
  
  // ColorThemeAgent
  colorTheme: string;  // ← JSON 字串 (ColorTheme 物件)
  
  // ImageGenerationAgent
  heroImage: string;
  featureImages: string;  // ← JSON 字串 (string[] 陣列)
  
  // ItineraryAgent
  dailyItinerary: string;  // ← JSON 字串 (DailyItineraryDay[] 陣列)
  
  // CostAgent
  costExplanation: string;
  
  // NoticeAgent
  notices: string;  // ← JSON 字串 (NoticeItem[] 陣列)
  
  // HotelAgent
  hotelInfo: string;
  
  // MealAgent
  mealInfo: string;
  
  // FlightAgent
  flightInfo: string;
  
  // 其他欄位
  country: string;
  city: string;
  days: number;
  nights: number;
  tourType: string;
  originalityScore: number;
}

// ============================================================================
// 資料驗證 Helper 函數
// ============================================================================

/**
 * 驗證 highlights 是否為字串陣列
 */
export function validateHighlights(highlights: any): string[] {
  if (!Array.isArray(highlights)) {
    console.warn('[validateHighlights] Not an array, converting to array');
    return [];
  }
  
  return highlights.map((h: any) => {
    if (typeof h === 'string') return h;
    if (typeof h === 'object' && h !== null) {
      // 如果是物件,提取 keyword 或 text 或 description
      return h.keyword || h.text || h.description || JSON.stringify(h);
    }
    return String(h);
  });
}

/**
 * 驗證 featureImages 是否為字串陣列
 */
export function validateFeatureImages(images: any): string[] {
  if (!Array.isArray(images)) {
    console.warn('[validateFeatureImages] Not an array, converting to array');
    return [];
  }
  
  return images.filter((img: any) => typeof img === 'string' && img.length > 0);
}

/**
 * 安全解析 JSON 字串
 */
export function safeParseJSON<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('[safeParseJSON] Parse error:', error);
    return fallback;
  }
}
