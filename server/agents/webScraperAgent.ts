/**
 * Web Scraper Agent
 * Responsible for extracting tour information from URLs
 * 
 * 支援三種模式：
 * 1. Puppeteer Vision 模式（推薦）：使用 Puppeteer 截圖 + LLM Vision API 分析
 * 2. PrintFriendly 模式：將網頁轉換為 PDF 後分析
 * 3. 傳統模式：直接爬取網頁 HTML 並用 LLM 分析
 */

import { fetchWebPage, extractTourInfoWithLLM } from "../webScraper";
import { getKeyInstructions } from "./skillLoader";
import { PrintFriendlyAgent } from "./printFriendlyAgent";
import { scrapeWithPuppeteerVision } from "./puppeteerVisionAgent";

export interface WebScraperResult {
  success: boolean;
  data?: any;
  error?: string;
  method?: 'puppeteer-vision' | 'printfriendly' | 'traditional';
}

/**
 * Web Scraper Agent
 * Extracts tour information from a given URL
 */
export type ScraperMode = 'puppeteer-vision' | 'printfriendly' | 'traditional' | 'auto';

export class WebScraperAgent {
  private skillInstructions: string;
  private printFriendlyAgent: PrintFriendlyAgent;
  private mode: ScraperMode;

  constructor(options?: { mode?: ScraperMode }) {
    this.skillInstructions = getKeyInstructions('WebScraperAgent');
    console.log('[WebScraperAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
    
    // 預設模式：auto（自動選擇最佳方案）
    this.mode = options?.mode ?? 'auto';
    this.printFriendlyAgent = new PrintFriendlyAgent();
    
    console.log(`[WebScraperAgent] Mode: ${this.mode}`);
  }
  
  /**
   * Execute web scraping
   */
  async execute(url: string): Promise<WebScraperResult> {
    console.log("[WebScraperAgent] Starting web scraping for URL:", url);
    console.log("[WebScraperAgent] Mode:", this.mode);
    
    // 根據模式執行
    switch (this.mode) {
      case 'puppeteer-vision':
        return await this.executeWithPuppeteerVision(url);
        
      case 'printfriendly':
        return await this.executeWithPrintFriendly(url);
        
      case 'traditional':
        return await this.executeTraditional(url);
        
      case 'auto':
      default:
        // Auto 模式：優先嘗試 Puppeteer Vision，失敗後嘗試 PrintFriendly，最後 fallback 到傳統模式
        return await this.executeAuto(url);
    }
  }
  
  /**
   * Auto 模式：自動選擇最佳方案
   */
  private async executeAuto(url: string): Promise<WebScraperResult> {
    console.log("[WebScraperAgent] Auto mode: trying Puppeteer Vision first...");
    
    // 嘗試 1: Puppeteer Vision
    try {
      const puppeteerResult = await this.executeWithPuppeteerVision(url);
      if (puppeteerResult.success && puppeteerResult.data?.title) {
        console.log("[WebScraperAgent] Puppeteer Vision succeeded");
        return puppeteerResult;
      }
    } catch (error) {
      console.log("[WebScraperAgent] Puppeteer Vision failed:", error);
    }
    
    // 嘗試 2: PrintFriendly
    if (process.env.PRINTFRIENDLY_API_KEY) {
      console.log("[WebScraperAgent] Trying PrintFriendly...");
      try {
        const printFriendlyResult = await this.executeWithPrintFriendly(url);
        if (printFriendlyResult.success) {
          console.log("[WebScraperAgent] PrintFriendly succeeded");
          return printFriendlyResult;
        }
      } catch (error) {
        console.log("[WebScraperAgent] PrintFriendly failed:", error);
      }
    }
    
    // 嘗試 3: 傳統模式
    console.log("[WebScraperAgent] Falling back to traditional mode...");
    return await this.executeTraditional(url);
  }
  
  /**
   * 使用 Puppeteer Vision 執行爬取
   */
  private async executeWithPuppeteerVision(url: string): Promise<WebScraperResult> {
    console.log("[WebScraperAgent] Using Puppeteer Vision mode");
    
    try {
      const result = await scrapeWithPuppeteerVision(url);
      
      if (!result.success || !result.extractedData) {
        return {
          success: false,
          error: result.error || "Puppeteer Vision extraction failed",
          method: 'puppeteer-vision',
        };
      }
      
      // 轉換為標準格式
      const data = this.convertPuppeteerVisionData(result.extractedData);
      
      console.log("[WebScraperAgent] Puppeteer Vision extraction successful");
      
      return {
        success: true,
        data,
        method: 'puppeteer-vision',
      };
    } catch (error) {
      console.error("[WebScraperAgent] Puppeteer Vision error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        method: 'puppeteer-vision',
      };
    }
  }
  
  /**
   * 轉換 Puppeteer Vision 資料為標準格式
   */
  private convertPuppeteerVisionData(extractedData: any): any {
    // 解析天數
    let days = 5;
    let nights = 4;
    if (extractedData.duration) {
      const durationMatch = extractedData.duration.match(/(\d+)\s*天/i);
      if (durationMatch) days = parseInt(durationMatch[1]);
      const nightsMatch = extractedData.duration.match(/(\d+)\s*夜/i);
      if (nightsMatch) nights = parseInt(nightsMatch[1]);
    }
    
    // 解析價格
    let price = 0;
    if (extractedData.price) {
      const priceMatch = extractedData.price.replace(/,/g, '').match(/(\d+)/);
      if (priceMatch) price = parseInt(priceMatch[1]);
    }
    
    // 解析目的地
    let destinationCountry = '';
    let destinationCity = '';
    if (extractedData.destination) {
      const parts = extractedData.destination.split(/[,，\s]+/);
      destinationCountry = parts[0] || '';
      destinationCity = parts.slice(1).join(' ') || parts[0] || '';
    }
    
    // 將 hotels 轉換為 accommodation 格式（HotelAgent 期望的格式）
    const accommodation = (extractedData.hotels || []).map((hotel: any) => ({
      name: hotel.name || '',
      stars: hotel.rating || hotel.stars || '',
      description: hotel.description || '',
      location: hotel.location || '',
    }));
    
    // 從 dailyItinerary 提取餐食資訊
    const meals = (extractedData.dailyItinerary || []).map((day: any) => ({
      day: day.day || 0,
      breakfast: day.meals?.includes('早') || day.meals?.includes('breakfast'),
      lunch: day.meals?.includes('午') || day.meals?.includes('lunch'),
      dinner: day.meals?.includes('晚') || day.meals?.includes('dinner'),
      description: day.meals || '',
    }));
    
    return {
      basicInfo: {
        title: extractedData.title || '',
        subtitle: extractedData.subtitle || '',
        description: extractedData.subtitle || '',
      },
      location: {
        destinationCountry,
        destinationCity,
      },
      duration: {
        days,
        nights,
      },
      pricing: {
        price,
        basePrice: price,
        currency: 'TWD',
        includes: extractedData.includes || [],
        excludes: extractedData.excludes || [],
      },
      highlights: extractedData.highlights || [],
      dailyItinerary: extractedData.dailyItinerary || [],
      itinerary: extractedData.dailyItinerary || [], // ItineraryAgent 期望的欄位名
      includes: extractedData.includes || [],
      excludes: extractedData.excludes || [],
      // HotelAgent 期望的欄位
      accommodation: accommodation.length > 0 ? accommodation : extractedData.hotels || [],
      hotels: extractedData.hotels || [],
      // MealAgent 期望的欄位
      meals: meals.length > 0 ? meals : [],
      // FlightAgent 期望的欄位（從截圖中通常無法提取航班資訊）
      flights: [],
    };
  }
  
  /**
   * 使用 PrintFriendly API 執行爬取
   */
  private async executeWithPrintFriendly(url: string): Promise<WebScraperResult> {
    console.log("[WebScraperAgent] Using PrintFriendly mode");
    
    try {
      const result = await this.printFriendlyAgent.execute(url);
      
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || "PrintFriendly extraction failed",
          method: 'printfriendly',
        };
      }
      
      console.log("[WebScraperAgent] PrintFriendly extraction successful");
      
      return {
        success: true,
        data: result.data,
        method: 'printfriendly',
      };
    } catch (error) {
      console.error("[WebScraperAgent] PrintFriendly error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        method: 'printfriendly',
      };
    }
  }
  
  /**
   * 使用傳統模式執行爬取
   */
  private async executeTraditional(url: string): Promise<WebScraperResult> {
    console.log("[WebScraperAgent] Using traditional mode");
    
    try {
      // Step 1: Fetch web page content
      const content = await fetchWebPage(url);
      
      if (!content || !content.text) {
        throw new Error("Failed to fetch web page content");
      }
      
      console.log("[WebScraperAgent] Content fetched successfully");
      
      // Step 2: Extract tour info with LLM
      const tourInfo = await extractTourInfoWithLLM(content, url);
      
      if (!tourInfo) {
        throw new Error("Failed to extract tour information");
      }
      
      console.log("[WebScraperAgent] Tour info extracted successfully");
      
      return {
        success: true,
        data: tourInfo,
        method: 'traditional',
      };
    } catch (error) {
      console.error("[WebScraperAgent] Traditional mode error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        method: 'traditional',
      };
    }
  }
  
  /**
   * Validate extracted data
   */
  validateData(data: any): boolean {
    // Check required fields
    if (!data.basicInfo || !data.basicInfo.title) {
      console.error("[WebScraperAgent] Missing required field: basicInfo.title");
      return false;
    }
    
    if (!data.location || !data.location.destinationCountry || !data.location.destinationCity) {
      console.error("[WebScraperAgent] Missing required fields: location.destinationCountry or location.destinationCity");
      return false;
    }
    
    if (!data.duration || !data.duration.days) {
      console.error("[WebScraperAgent] Missing required field: duration.days");
      return false;
    }
    
    // pricing.price 或 pricing.basePrice 都可以
    if (!data.pricing || (!data.pricing.price && !data.pricing.basePrice)) {
      console.error("[WebScraperAgent] Missing required field: pricing.price or pricing.basePrice");
      return false;
    }
    
    return true;
  }
}
