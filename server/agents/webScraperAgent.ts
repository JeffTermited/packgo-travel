/**
 * Web Scraper Agent
 * Responsible for extracting tour information from URLs
 * 
 * 三階段提取策略 (3-Stage Extraction Strategy)：
 * 1. JSON-LD 中繼資料優先：從 Schema.org 提取價格和日期
 * 2. Markdown 結構化提取：使用 Readability + Turndown 提取每日行程
 * 3. 智慧視覺救援：當前兩階段失敗時，使用 Puppeteer Vision 救援
 */

import { fetchWebPage, extractTourInfoWithLLM } from "../webScraper";
import { getKeyInstructions } from "./skillLoader";
import { PrintFriendlyAgent } from "./printFriendlyAgent";
import { scrapeWithPuppeteerVision } from "./puppeteerVisionAgent";

export interface WebScraperResult {
  success: boolean;
  data?: any;
  error?: string;
  method?: 'three-stage' | 'printfriendly' | 'traditional';
  extractionDetails?: {
    jsonLdFound: boolean;
    markdownExtracted: boolean;
    visionFallbackUsed: boolean;
  };
}

export type ScraperMode = 'three-stage' | 'printfriendly' | 'traditional' | 'auto';

export class WebScraperAgent {
  private skillInstructions: string;
  private printFriendlyAgent: PrintFriendlyAgent;
  private mode: ScraperMode;

  constructor(options?: { mode?: ScraperMode }) {
    this.skillInstructions = getKeyInstructions('WebScraperAgent');
    console.log('[WebScraperAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
    
    // 預設模式：three-stage（三階段提取策略）
    this.mode = options?.mode ?? 'three-stage';
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
      case 'three-stage':
        return await this.executeThreeStage(url);
        
      case 'printfriendly':
        return await this.executeWithPrintFriendly(url);
        
      case 'traditional':
        return await this.executeTraditional(url);
        
      case 'auto':
      default:
        // Auto 模式：優先嘗試三階段策略
        return await this.executeThreeStage(url);
    }
  }
  
  /**
   * 三階段提取策略
   */
  private async executeThreeStage(url: string): Promise<WebScraperResult> {
    console.log("[WebScraperAgent] === 三階段提取策略開始 ===");
    
    const extractionDetails = {
      jsonLdFound: false,
      markdownExtracted: false,
      visionFallbackUsed: false,
    };
    
    let data: any = {
      basicInfo: {},
      location: {},
      duration: {},
      pricing: {},
      highlights: [],
      dailyItinerary: [],
      includes: [],
      excludes: [],
      accommodation: [],
      hotels: [],
      meals: [],
      flights: [],
    };
    
    // ===== 階段一：JSON-LD 中繼資料提取 =====
    console.log("[WebScraperAgent] 階段一：JSON-LD 中繼資料提取");
    const jsonLdData = await this.extractJsonLd(url);
    if (jsonLdData) {
      extractionDetails.jsonLdFound = true;
      data = { ...data, ...jsonLdData };
      console.log("[WebScraperAgent] JSON-LD 提取成功：", {
        hasPrice: !!jsonLdData.pricing?.price,
        hasDates: !!jsonLdData.dates,
      });
    } else {
      console.log("[WebScraperAgent] JSON-LD 未找到或提取失敗");
    }
    
    // ===== 階段二：Markdown 結構化提取 =====
    console.log("[WebScraperAgent] 階段二：Markdown 結構化提取");
    const markdownData = await this.extractMarkdown(url);
    if (markdownData && markdownData.dailyItinerary && markdownData.dailyItinerary.length > 0) {
      extractionDetails.markdownExtracted = true;
      data = { ...data, ...markdownData };
      console.log("[WebScraperAgent] Markdown 提取成功：", {
        itineraryDays: markdownData.dailyItinerary.length,
        hasTitle: !!markdownData.basicInfo?.title,
      });
    } else {
      console.log("[WebScraperAgent] Markdown 提取失敗或行程為空");
    }
    
    // ===== 階段三：智慧視覺救援 =====
    const needsVisionFallback = this.shouldUseVisionFallback(data, extractionDetails);
    
    if (needsVisionFallback) {
      console.log("[WebScraperAgent] 階段三：智慧視覺救援（觸發條件已滿足）");
      const visionData = await this.executeVisionFallback(url, data, extractionDetails);
      if (visionData) {
        extractionDetails.visionFallbackUsed = true;
        data = { ...data, ...visionData };
        console.log("[WebScraperAgent] Vision 救援成功");
      } else {
        console.log("[WebScraperAgent] Vision 救援失敗");
      }
    } else {
      console.log("[WebScraperAgent] 階段三：無需 Vision 救援");
    }
    
    // 驗證最終資料
    const isValid = this.validateData(data);
    
    console.log("[WebScraperAgent] === 三階段提取策略完成 ===");
    console.log("[WebScraperAgent] 提取詳情：", extractionDetails);
    console.log("[WebScraperAgent] 資料驗證：", isValid ? "通過" : "失敗");
    
    return {
      success: isValid,
      data: isValid ? data : undefined,
      error: isValid ? undefined : "資料驗證失敗：缺少必要欄位",
      method: 'three-stage',
      extractionDetails,
    };
  }
  
  /**
   * 階段一：從 JSON-LD 提取中繼資料（價格、日期）
   */
  private async extractJsonLd(url: string): Promise<any | null> {
    try {
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // 提取所有 JSON-LD 資料
      const jsonLdScripts = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        return scripts.map(script => {
          try {
            return JSON.parse(script.textContent || '');
          } catch {
            return null;
          }
        }).filter(Boolean);
      });
      
      await browser.close();
      
      if (jsonLdScripts.length === 0) {
        console.log("[WebScraperAgent] 未找到 JSON-LD 資料");
        return null;
      }
      
      console.log(`[WebScraperAgent] 找到 ${jsonLdScripts.length} 個 JSON-LD 區塊`);
      
      // 解析 JSON-LD 資料
      let extractedData: any = {};
      
      for (const jsonLd of jsonLdScripts) {
        // 處理 Product 類型
        if (jsonLd['@type'] === 'Product' || jsonLd['@type'] === 'TouristTrip') {
          if (jsonLd.offers) {
            const offers = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers;
            if (offers.price) {
              extractedData.pricing = extractedData.pricing || {};
              extractedData.pricing.price = parseFloat(offers.price);
              extractedData.pricing.currency = offers.priceCurrency || 'TWD';
            }
            if (offers.availability) {
              extractedData.dates = extractedData.dates || [];
              // 可能需要進一步解析 availability
            }
          }
          
          if (jsonLd.name) {
            extractedData.basicInfo = extractedData.basicInfo || {};
            extractedData.basicInfo.title = jsonLd.name;
          }
          
          if (jsonLd.description) {
            extractedData.basicInfo = extractedData.basicInfo || {};
            extractedData.basicInfo.description = jsonLd.description;
          }
        }
        
        // 處理 Event 類型
        if (jsonLd['@type'] === 'Event') {
          if (jsonLd.startDate) {
            extractedData.dates = extractedData.dates || [];
            extractedData.dates.push(jsonLd.startDate);
          }
          
          if (jsonLd.offers) {
            const offers = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers;
            if (offers.price) {
              extractedData.pricing = extractedData.pricing || {};
              extractedData.pricing.price = parseFloat(offers.price);
              extractedData.pricing.currency = offers.priceCurrency || 'TWD';
            }
          }
        }
      }
      
      return Object.keys(extractedData).length > 0 ? extractedData : null;
    } catch (error) {
      console.error("[WebScraperAgent] JSON-LD 提取錯誤：", error);
      return null;
    }
  }
  
  /**
   * 階段二：使用 Markdown 結構化提取（每日行程、標題/描述）
   */
  private async extractMarkdown(url: string): Promise<any | null> {
    try {
      const puppeteer = await import('puppeteer');
      const { Readability } = await import('@mozilla/readability');
      const { JSDOM } = await import('jsdom');
      const TurndownService = (await import('turndown')).default;
      
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // 取得完整 HTML
      const html = await page.content();
      await browser.close();
      
      // 使用 Readability 提取主要內容
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      
      if (!article || !article.content) {
        console.log("[WebScraperAgent] Readability 提取失敗");
        return null;
      }
      
      // 使用 Turndown 轉換為 Markdown
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
      });
      
      // 保留標題層級和列表
      turndownService.keep(['h2', 'h3', 'h4']);
      
      const markdown = turndownService.turndown(article.content);
      
      console.log("[WebScraperAgent] Markdown 轉換完成，長度：", markdown.length);
      
      // 使用 LLM 從 Markdown 提取結構化資料
      const extractedData = await this.extractFromMarkdownWithLLM(markdown, url);
      
      return extractedData;
    } catch (error) {
      console.error("[WebScraperAgent] Markdown 提取錯誤：", error);
      return null;
    }
  }
  
  /**
   * 使用 LLM 從 Markdown 提取結構化資料
   */
  private async extractFromMarkdownWithLLM(markdown: string, url: string): Promise<any | null> {
    try {
      const { invokeLLM } = await import("../_core/llm");
      
      const prompt = `你是一個專業的旅遊行程資料提取專家。請從以下 Markdown 格式的網頁內容中提取旅遊行程資訊。

重要提示：
1. 請仔細識別「每日行程」的標題層級（例如 "Day 1", "第一天", "DAY 1" 等）
2. 提取所有天數的行程，不要遺漏任何一天
3. 如果找不到明確的每日行程，請返回空陣列

Markdown 內容：
\`\`\`markdown
${markdown.substring(0, 15000)} 
\`\`\`

請以 JSON 格式返回以下資訊：
{
  "basicInfo": {
    "title": "行程標題",
    "subtitle": "副標題或促銷文字",
    "description": "行程描述"
  },
  "location": {
    "destinationCountry": "目的地國家",
    "destinationCity": "目的地城市"
  },
  "duration": {
    "days": 5,
    "nights": 4
  },
  "highlights": ["特色1", "特色2"],
  "dailyItinerary": [
    {
      "day": 1,
      "title": "第一天標題",
      "description": "第一天行程描述",
      "meals": "早餐：X / 午餐：X / 晚餐：X",
      "accommodation": "住宿飯店名稱"
    }
  ],
  "includes": ["包含項目1", "包含項目2"],
  "excludes": ["不包含項目1", "不包含項目2"]
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "你是一個專業的旅遊行程資料提取專家。" },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "tour_extraction",
            strict: true,
            schema: {
              type: "object",
              properties: {
                basicInfo: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    subtitle: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["title"],
                  additionalProperties: false,
                },
                location: {
                  type: "object",
                  properties: {
                    destinationCountry: { type: "string" },
                    destinationCity: { type: "string" },
                  },
                  required: ["destinationCountry", "destinationCity"],
                  additionalProperties: false,
                },
                duration: {
                  type: "object",
                  properties: {
                    days: { type: "number" },
                    nights: { type: "number" },
                  },
                  required: ["days", "nights"],
                  additionalProperties: false,
                },
                highlights: {
                  type: "array",
                  items: { type: "string" },
                },
                dailyItinerary: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "number" },
                      title: { type: "string" },
                      description: { type: "string" },
                      meals: { type: "string" },
                      accommodation: { type: "string" },
                    },
                    required: ["day", "title", "description"],
                    additionalProperties: false,
                  },
                },
                includes: {
                  type: "array",
                  items: { type: "string" },
                },
                excludes: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["basicInfo", "location", "duration", "dailyItinerary"],
              additionalProperties: false,
            },
          },
        },
      });
      
      const content = response.choices[0].message.content;
      if (!content) {
        console.log("[WebScraperAgent] LLM 未返回內容");
        return null;
      }
      
      // Convert content to string if it's an array
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      const extractedData = JSON.parse(contentStr);
      
      // 驗證每日行程是否有效
      if (!extractedData.dailyItinerary || extractedData.dailyItinerary.length === 0) {
        console.log("[WebScraperAgent] 未提取到每日行程");
        return null;
      }
      
      console.log("[WebScraperAgent] LLM 提取成功，每日行程天數：", extractedData.dailyItinerary.length);
      
      return extractedData;
    } catch (error) {
      console.error("[WebScraperAgent] LLM 提取錯誤：", error);
      return null;
    }
  }
  
  /**
   * 判斷是否需要使用 Vision Fallback
   */
  private shouldUseVisionFallback(data: any, details: any): boolean {
    // 條件 1：缺少價格或日期
    const missingPrice = !data.pricing?.price;
    const missingDates = !data.dates || data.dates.length === 0;
    
    // 條件 2：缺少每日行程
    const missingItinerary = !data.dailyItinerary || data.dailyItinerary.length === 0;
    
    const needsFallback = (missingPrice || missingDates) || missingItinerary;
    
    console.log("[WebScraperAgent] Vision Fallback 判斷：", {
      missingPrice,
      missingDates,
      missingItinerary,
      needsFallback,
    });
    
    return needsFallback;
  }
  
  /**
   * 階段三：智慧視覺救援
   */
  private async executeVisionFallback(url: string, existingData: any, details: any): Promise<any | null> {
    try {
      console.log("[WebScraperAgent] 啟動 Puppeteer Vision 救援");
      console.log("[WebScraperAgent] Vision Fallback URL:", url);
      
      const result = await scrapeWithPuppeteerVision(url);
      
      if (!result.success || !result.extractedData) {
        console.log("[WebScraperAgent] Vision 救援失敗");
        return null;
      }
      
      // 轉換為標準格式
      const visionData = this.convertPuppeteerVisionData(result.extractedData);
      
      // 使用 Vision 資料來填補缺失的部分，但保留 existingData 的完整結構
      const mergedData: any = { ...existingData };
      
      // 如果缺少價格，使用 Vision 的價格
      if (!mergedData.pricing?.price && visionData.pricing?.price) {
        mergedData.pricing = { ...mergedData.pricing, ...visionData.pricing };
        console.log("[WebScraperAgent] Vision 救援：補充價格資訊");
      }
      
      // 如果缺少每日行程，使用 Vision 的行程
      if ((!mergedData.dailyItinerary || mergedData.dailyItinerary.length === 0) && 
          visionData.dailyItinerary && visionData.dailyItinerary.length > 0) {
        mergedData.dailyItinerary = visionData.dailyItinerary;
        mergedData.itinerary = visionData.dailyItinerary;
        console.log("[WebScraperAgent] Vision 救援：補充每日行程");
      }
      
      // 如果缺少標題，使用 Vision 的標題
      if (!mergedData.basicInfo?.title && visionData.basicInfo?.title) {
        mergedData.basicInfo = { ...mergedData.basicInfo, ...visionData.basicInfo };
        console.log("[WebScraperAgent] Vision 救援：補充基本資訊");
      }
      
      // 如果缺少目的地，使用 Vision 的目的地
      if (!mergedData.location?.destinationCountry && visionData.location?.destinationCountry) {
        mergedData.location = { ...mergedData.location, ...visionData.location };
        console.log("[WebScraperAgent] Vision 救援：補充目的地資訊");
      }
      
      // 如果缺少天數，使用 Vision 的天數
      if (!mergedData.duration?.days && visionData.duration?.days) {
        mergedData.duration = { ...mergedData.duration, ...visionData.duration };
        console.log("[WebScraperAgent] Vision 救援：補充天數資訊");
      }
      
      // 補充其他可能缺失的資訊
      if (!existingData.highlights || existingData.highlights.length === 0) {
        mergedData.highlights = visionData.highlights || [];
      }
      
      if (!existingData.includes || existingData.includes.length === 0) {
        mergedData.includes = visionData.includes || [];
      }
      
      if (!existingData.excludes || existingData.excludes.length === 0) {
        mergedData.excludes = visionData.excludes || [];
      }
      
      return mergedData;
    } catch (error) {
      console.error("[WebScraperAgent] Vision 救援錯誤：", error);
      return null;
    }
  }
  
  /**
   * 轉換 Puppeteer Vision 資料為標準格式
   */
  private convertPuppeteerVisionData(extractedData: any): any {
    // 解析天數
    let days = 0;
    let nights = 0;
    if (extractedData.duration) {
      console.log("[WebScraperAgent] 解析 duration:", extractedData.duration);
      const durationMatch = extractedData.duration.match(/(\d+)\s*天/i);
      if (durationMatch) {
        days = parseInt(durationMatch[1]);
        console.log("[WebScraperAgent] 提取到天數:", days);
      }
      const nightsMatch = extractedData.duration.match(/(\d+)\s*夜/i);
      if (nightsMatch) {
        nights = parseInt(nightsMatch[1]);
        console.log("[WebScraperAgent] 提取到晚數:", nights);
      }
    }
    
    // 確保 days 和 nights 都有值
    if (!days || days === 0) {
      days = 5;
      console.log("[WebScraperAgent] 使用預設天數:", days);
    }
    if (!nights || nights === 0) {
      nights = days - 1;
      console.log("[WebScraperAgent] 使用預設晚數:", nights);
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
    
    // 將 hotels 轉換為 accommodation 格式
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
      itinerary: extractedData.dailyItinerary || [],
      includes: extractedData.includes || [],
      excludes: extractedData.excludes || [],
      accommodation: accommodation.length > 0 ? accommodation : extractedData.hotels || [],
      hotels: extractedData.hotels || [],
      meals: meals.length > 0 ? meals : [],
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
