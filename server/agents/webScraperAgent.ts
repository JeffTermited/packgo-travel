/**
 * Web Scraper Agent
 * Responsible for extracting tour information from URLs
 * 
 * 支援兩種模式：
 * 1. PrintFriendly 模式（推薦）：將網頁轉換為 PDF 後分析
 * 2. 傳統模式：直接爬取網頁 HTML 並用 LLM 分析
 */

import { fetchWebPage, extractTourInfoWithLLM } from "../webScraper";
import { getKeyInstructions } from "./skillLoader";
import { PrintFriendlyAgent } from "./printFriendlyAgent";

export interface WebScraperResult {
  success: boolean;
  data?: any;
  error?: string;
  method?: 'printfriendly' | 'traditional';
}

/**
 * Web Scraper Agent
 * Extracts tour information from a given URL
 */
export class WebScraperAgent {
  private skillInstructions: string;
  private printFriendlyAgent: PrintFriendlyAgent;
  private usePrintFriendly: boolean;

  constructor(options?: { usePrintFriendly?: boolean }) {
    this.skillInstructions = getKeyInstructions('WebScraperAgent');
    console.log('[WebScraperAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
    
    // 預設使用 PrintFriendly（如果有配置 API Key）
    this.usePrintFriendly = options?.usePrintFriendly ?? !!process.env.PRINTFRIENDLY_API_KEY;
    this.printFriendlyAgent = new PrintFriendlyAgent();
    
    console.log(`[WebScraperAgent] Mode: ${this.usePrintFriendly ? 'PrintFriendly' : 'Traditional'}`);
  }
  
  /**
   * Execute web scraping
   */
  async execute(url: string): Promise<WebScraperResult> {
    console.log("[WebScraperAgent] Starting web scraping for URL:", url);
    
    // 優先使用 PrintFriendly 模式
    if (this.usePrintFriendly) {
      const result = await this.executeWithPrintFriendly(url);
      
      // 如果 PrintFriendly 成功，直接返回
      if (result.success) {
        return result;
      }
      
      // 如果 PrintFriendly 失敗，fallback 到傳統模式
      console.log("[WebScraperAgent] PrintFriendly failed, falling back to traditional mode");
    }
    
    // 傳統模式
    return await this.executeTraditional(url);
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
