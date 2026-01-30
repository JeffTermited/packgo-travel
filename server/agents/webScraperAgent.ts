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
// PrintFriendlyAgent removed - using Firecrawl as primary scraping method
import { scrapeWithPuppeteerVision } from "./puppeteerVisionAgent";
import { FirecrawlAgent } from "./firecrawlAgent";
import { LionTravelParser, parseLionTravel } from "./parsers/lionTravelParser";

export interface WebScraperResult {
  success: boolean;
  data?: any;
  error?: string;
  method?: 'three-stage' | 'firecrawl' | 'traditional';
  extractionDetails?: {
    jsonLdFound: boolean;
    markdownExtracted: boolean;
    visionFallbackUsed: boolean;
  };
}

export type ScraperMode = 'three-stage' | 'firecrawl' | 'traditional' | 'auto';

export class WebScraperAgent {
  private skillInstructions: string;
  // PrintFriendlyAgent removed
  private firecrawlAgent: FirecrawlAgent | null;
  private mode: ScraperMode;

  constructor(options?: { mode?: ScraperMode }) {
    this.skillInstructions = getKeyInstructions('WebScraperAgent');
    console.log('[WebScraperAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
    
    // 預設模式：firecrawl（使用 Firecrawl API）
    this.mode = options?.mode ?? 'firecrawl';
    // PrintFriendlyAgent removed - Firecrawl is now the primary method
    
    // 初始化 Firecrawl Agent（如果 API Key 存在）
    try {
      this.firecrawlAgent = new FirecrawlAgent();
      console.log('[WebScraperAgent] Firecrawl Agent initialized');
    } catch (error) {
      console.warn('[WebScraperAgent] Firecrawl Agent initialization failed, will use Puppeteer fallback');
      this.firecrawlAgent = null;
    }
    
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
      case 'firecrawl':
        return await this.executeWithFirecrawl(url);
        
      case 'three-stage':
        return await this.executeThreeStage(url);
        
      // 'printfriendly' mode removed - use 'firecrawl' instead
        
      case 'traditional':
        return await this.executeTraditional(url);
        
      case 'auto':
      default:
        // Auto 模式：優先嘗試 Firecrawl
        if (this.firecrawlAgent) {
          return await this.executeWithFirecrawl(url);
        } else {
          return await this.executeThreeStage(url);
        }
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
   * 使用 Claude 從 Markdown 提取結構化資料
   * Claude Hybrid Architecture: Uses Claude 3.5 Sonnet for complex extraction
   */
  private async extractFromMarkdownWithLLM(markdown: string, url: string): Promise<any | null> {
    try {
      const { getSonnetAgent, STRICT_DATA_FIDELITY_RULES } = await import("./claudeAgent");
      type JSONSchema = import("./claudeAgent").JSONSchema;
      
      // 2026-01-30: 移除 15000 字元截取限制，使用完整 Markdown 內容
      // Claude 3.5 Sonnet 支援 200K context window，可以處理完整內容
      // 如果內容超過 100K，才進行截取（保留安全邊界）
      const MAX_MARKDOWN_LENGTH = 100000;
      const truncatedMarkdown = markdown.length > MAX_MARKDOWN_LENGTH 
        ? markdown.substring(0, MAX_MARKDOWN_LENGTH) + '\n\n[內容已截取，原始長度: ' + markdown.length + ' 字元]'
        : markdown;
      
      console.log(`[WebScraperAgent] Markdown 長度: ${markdown.length} 字元，截取後: ${truncatedMarkdown.length} 字元`);
      
      const prompt = `你是一個專業的旅遊行程資料提取專家。請從以下 Markdown 格式的網頁內容中提取旅遊行程資訊。

🔴 **最重要的任務**：提取每日行程的「詳細活動內容」

每日行程必須包含：
1. **activities 陣列**：每天的所有活動，包括：
   - time: 活動時間（如 "07:40", "08:30-10:00", "上午", "下午"）
   - title: 活動名稱（如 "阿里山森林遊樂區", "奮起湖老街"）
   - description: 活動描述（50-150字，包含景點特色、體驗內容）
   - location: 地點（如 "嘉義縣阿里山鄉"）
   - transportation: 交通方式（如 "遊覽車", "步行", "火車"）

2. **meals 物件**：
   - breakfast: 早餐安排（如 "飯店自助早餐", "X" 表示不含）
   - lunch: 午餐安排（如 "奮起湖便當", "阿里山風味餐"）
   - dinner: 晚餐安排（如 "飯店晚餐", "中式合菜"）

3. **accommodation**: 住宿飯店名稱（如 "阿里山賓館", "嘉義耐斯王子大飯店"）

重要提示：
1. 請仔細識別「每日行程」的標題層級（例如 "Day 1", "第一天", "DAY 1", "第1天" 等）
2. 提取所有天數的行程，不要遺漏任何一天
3. 每天至少要有 2-5 個 activities
4. 如果原文有時間資訊，必須提取（如 "07:40 集合"）
5. 對於台灣國內行程，請正確識別目的地（如阿里山→嘉義、日月潭→南投）

Markdown 內容：
\`\`\`markdown
${truncatedMarkdown}
\`\`\`

請提取以下資訊：
- basicInfo: 行程基本資訊（標題、副標題、描述）
- location: 目的地資訊（國家、城市）
- duration: 行程天數（天數、夜數）
- highlights: 行程亮點
- dailyItinerary: 每日行程（天數、標題、activities 陣列、meals 物件、住宿）
- includes: 包含項目
- excludes: 不包含項目`;

      // Define JSON Schema for tour extraction
      const tourSchema: JSONSchema = {
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
          },
          location: {
            type: "object",
            properties: {
              destinationCountry: { type: "string" },
              destinationCity: { type: "string" },
            },
            required: ["destinationCountry", "destinationCity"],
          },
          duration: {
            type: "object",
            properties: {
              days: { type: "number" },
              nights: { type: "number" },
            },
            required: ["days", "nights"],
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
                activities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      time: { type: "string" },
                      title: { type: "string" },
                      description: { type: "string" },
                      location: { type: "string" },
                      transportation: { type: "string" },
                    },
                    required: ["title", "description"],
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
      };

      const systemPrompt = `你是一個專業的旅遊行程資料提取專家。

${STRICT_DATA_FIDELITY_RULES}`;

      const claudeAgent = getSonnetAgent();
      const response = await claudeAgent.sendStructuredMessage<any>(
        prompt,
        tourSchema,
        {
          systemPrompt,
          maxTokens: 8192,
          temperature: 0.3,
          schemaName: 'tour_extraction_output',
          schemaDescription: '旅遊行程提取結構化輸出',
          strictDataFidelity: true,
        }
      );
      
      if (!response.success || !response.data) {
        console.log("[WebScraperAgent] Claude 未返回內容");
        return null;
      }
      
      const extractedData = response.data;
      
      // 2026-01-30: 放寬驗證邏輯，即使沒有每日行程也返回其他資料
      // 讓後續的 enrichWithQuickInfo 和 validateData 來決定是否有效
      if (!extractedData.dailyItinerary || extractedData.dailyItinerary.length === 0) {
        console.log("[WebScraperAgent] 未提取到每日行程，但仍返回其他資料");
        // 確保 dailyItinerary 是空陣列而非 undefined
        extractedData.dailyItinerary = [];
      } else {
        console.log("[WebScraperAgent] Claude 提取成功，每日行程天數：", extractedData.dailyItinerary.length);
      }
      
      // 記錄提取到的資料摘要
      console.log("[WebScraperAgent] Claude 提取資料摘要：", {
        title: extractedData.basicInfo?.title || 'N/A',
        country: extractedData.location?.destinationCountry || 'N/A',
        city: extractedData.location?.destinationCity || 'N/A',
        days: extractedData.duration?.days || 'N/A',
        itineraryDays: extractedData.dailyItinerary?.length || 0,
      });
      
      return extractedData;
    } catch (error) {
      console.error("[WebScraperAgent] Claude 提取錯誤：", error);
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
    // 解析天數 - 優先從 duration 欄位提取，然後從標題提取
    let days = 0;
    let nights = 0;
    
    // 嘗試從 duration 欄位提取
    if (extractedData.duration) {
      console.log("[WebScraperAgent] 解析 duration:", extractedData.duration);
      // 支援多種格式："2天", "2日", "2天1夜", "2日1夜"
      const durationMatch = extractedData.duration.match(/(\d+)\s*[天日]/i);
      if (durationMatch) {
        days = parseInt(durationMatch[1]);
        console.log("[WebScraperAgent] 從 duration 提取到天數:", days);
      }
      const nightsMatch = extractedData.duration.match(/(\d+)\s*夜/i);
      if (nightsMatch) {
        nights = parseInt(nightsMatch[1]);
        console.log("[WebScraperAgent] 從 duration 提取到晚數:", nights);
      }
    }
    
    // 如果還沒有天數，嘗試從標題提取
    if (!days && extractedData.title) {
      console.log("[WebScraperAgent] 嘗試從標題提取天數:", extractedData.title);
      // 支援多種格式："台東2日", "台東5天", "5日4夜"
      const titleDaysMatch = extractedData.title.match(/(\d+)\s*[天日]/i);
      if (titleDaysMatch) {
        days = parseInt(titleDaysMatch[1]);
        console.log("[WebScraperAgent] 從標題提取到天數:", days);
      }
    }
    
    // 如果還沒有晚數，嘗試從標題提取
    if (!nights && extractedData.title) {
      const titleNightsMatch = extractedData.title.match(/(\d+)\s*夜/i);
      if (titleNightsMatch) {
        nights = parseInt(titleNightsMatch[1]);
        console.log("[WebScraperAgent] 從標題提取到晚數:", nights);
      }
    }
    
    // 如果有天數但沒有晚數，計算晚數
    if (days > 0 && !nights) {
      nights = days - 1;
      console.log("[WebScraperAgent] 計算晚數:", nights);
    }
    
    // 如果還是沒有天數，嘗試從 dailyItinerary 的長度推斷
    if (!days && extractedData.dailyItinerary && extractedData.dailyItinerary.length > 0) {
      days = extractedData.dailyItinerary.length;
      nights = days - 1;
      console.log("[WebScraperAgent] 從 dailyItinerary 長度推斷天數:", days);
    }
    
    // 最後才使用預設值（但使用 3 天而非 5 天，更合理）
    if (!days || days === 0) {
      days = 3;
      console.log("[WebScraperAgent] 無法提取天數，使用預設值:", days);
    }
    if (!nights || nights === 0) {
      nights = days - 1;
      console.log("[WebScraperAgent] 計算預設晚數:", nights);
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
   * Firecrawl 模式（優先使用 Firecrawl API，失敗時 fallback 到 Puppeteer）
   * 
   * 優化版本 (2026-01-29):
   * - 優先使用 QuickInfo 從 metadata 快速提取關鍵資訊
   * - 使用 onlyMainContent: false 獲取完整頁面內容
   */
  private async executeWithFirecrawl(url: string): Promise<WebScraperResult> {
    console.log("[WebScraperAgent] === Firecrawl 模式開始 ===");
    
    // 檢查是否為雄獅旅遊網站，優先使用專屬解析器
    const isLionTravel = LionTravelParser.isLionTravelUrl(url);
    if (isLionTravel) {
      console.log("[WebScraperAgent] 偵測到雄獅旅遊網站，優先使用專屬解析器");
    }
    
    // 嘗試使用 Firecrawl
    if (this.firecrawlAgent) {
      try {
        console.log("[WebScraperAgent] 使用 Firecrawl API 爬取（優化配置）...");
        const firecrawlResult = await this.firecrawlAgent.scrape(url);
        
        if (firecrawlResult.success && firecrawlResult.html) {
          console.log("[WebScraperAgent] Firecrawl 爬取成功");
          console.log(`[WebScraperAgent] 內容長度: ${firecrawlResult.markdown?.length || 0} chars (markdown)`);
          
          // 🆕 優先使用 QuickInfo（從 metadata 快速提取）
          const quickInfo = firecrawlResult.quickInfo;
          if (quickInfo) {
            console.log("[WebScraperAgent] 使用 QuickInfo 快速提取:");
            console.log(`  - 列車名稱: ${quickInfo.trainName || 'N/A'}`);
            console.log(`  - 天數: ${quickInfo.days || 'N/A'}`);
            console.log(`  - 目的地: ${quickInfo.destination || 'N/A'}`);
            console.log(`  - 價格: ${quickInfo.price || 'N/A'}`);
          }
          
          // 如果是雄獅旅遊，優先使用專屬解析器
          if (isLionTravel) {
            console.log("[WebScraperAgent] 使用雄獅旅遊專屬解析器...");
            let lionTravelData = await parseLionTravel(firecrawlResult.html, url);
            
            if (lionTravelData) {
              // 🆕 使用 QuickInfo 補充缺失資訊
              if (quickInfo) {
                lionTravelData = this.enrichWithQuickInfo(lionTravelData, quickInfo);
              }
              
              // 🆕 檢查 dailyItinerary 是否有內容，如果沒有則使用 LLM 補充
              const hasDailyItinerary = lionTravelData?.dailyItinerary && 
                                        Array.isArray(lionTravelData?.dailyItinerary) && 
                                        lionTravelData?.dailyItinerary.length > 0;
              
              if (!hasDailyItinerary && firecrawlResult.markdown && lionTravelData) {
                console.log("[WebScraperAgent] 雄獅專屬解析器未提取到每日行程，使用 LLM 補充...");
                const llmData = await this.extractFromMarkdownWithLLM(firecrawlResult.markdown, url);
                if (llmData?.dailyItinerary && llmData.dailyItinerary.length > 0) {
                  console.log(`[WebScraperAgent] LLM 成功提取 ${llmData.dailyItinerary.length} 天每日行程`);
                  (lionTravelData as any).dailyItinerary = llmData.dailyItinerary;
                }
              }
              
              if (this.validateData(lionTravelData)) {
                console.log("[WebScraperAgent] 雄獅旅遊專屬解析器成功！");
                console.log("[WebScraperAgent] === Firecrawl 模式完成（雄獅專屬解析）===");
                return {
                  success: true,
                  data: lionTravelData,
                  method: 'three-stage',
                  extractionDetails: {
                    jsonLdFound: false,
                    markdownExtracted: true,
                    visionFallbackUsed: false,
                  },
                };
              } else {
                console.log("[WebScraperAgent] 雄獅旅遊專屬解析器未能提取完整資料，fallback 到 LLM");
              }
            } else {
              console.log("[WebScraperAgent] 雄獅旅遊專屬解析器未能提取完整資料，fallback 到 LLM");
            }
          }
          
          // 使用 LLM 從 Markdown 提取結構化資料
          if (firecrawlResult.markdown) {
            let extractedData = await this.extractFromMarkdownWithLLM(firecrawlResult.markdown, url);
            
            if (extractedData) {
              // 🆕 使用 QuickInfo 補充缺失資訊
              if (quickInfo) {
                extractedData = this.enrichWithQuickInfo(extractedData, quickInfo);
              }
              
              if (this.validateData(extractedData)) {
                console.log("[WebScraperAgent] === Firecrawl 模式完成（成功）===");
                return {
                  success: true,
                  data: extractedData,
                  method: 'three-stage',
                  extractionDetails: {
                    jsonLdFound: false,
                    markdownExtracted: true,
                    visionFallbackUsed: false,
                  },
                };
              }
            }
          }
        }
        
        console.warn("[WebScraperAgent] Firecrawl 提取失敗，fallback 到 Puppeteer");
      } catch (error) {
        console.error("[WebScraperAgent] Firecrawl 錯誤：", error);
        console.warn("[WebScraperAgent] Fallback 到 Puppeteer");
      }
    }
    
    // Fallback: 使用三階段策略（Puppeteer）
    console.log("[WebScraperAgent] 使用 Puppeteer 三階段策略作為 fallback");
    return await this.executeThreeStage(url);
  }
  
  /**
   * 🆕 使用 QuickInfo 補充缺失資訊
   * 優先使用 QuickInfo 的資料（從 metadata 提取，更準確）
   * 2026-01-30: 增強台灣景點到城市的對應邏輯
   */
  private enrichWithQuickInfo(data: any, quickInfo: any): any {
    const enriched = { ...data };
    
    // 台灣景點到城市的對應表
    const TAIWAN_ATTRACTIONS_TO_CITY: Record<string, string> = {
      '阿里山': '嘉義', '奮起湖': '嘉義', '達娜伊谷': '嘉義',
      '日月潭': '南投', '清境': '南投', '合歡山': '南投', '溪頭': '南投', '杉林溪': '南投',
      '墾丁': '屏東', '小琉球': '屏東',
      '太魯閣': '花蓮', '七星潭': '花蓮', '瑞穗': '花蓮',
      '知本': '台東', '綠島': '台東', '蘭喼': '台東', '池上': '台東', '鹿野': '台東',
      '礁溪': '宜蘭', '羅東': '宜蘭', '太平山': '宜蘭',
      '三義': '苗栗', '南莊': '苗栗',
      '內灣': '新竹', '司馬庫斯': '新竹',
      '鹿港': '彰化',
      '古坑': '雲林',
      '澎湖': '澎湖', '馬公': '澎湖',
      '金門': '金門',
      '馬祖': '馬祖', '北竿': '馬祖', '南竿': '馬祖',
    };
    
    // 補充列車名稱（火車行程專用）
    if (quickInfo.trainName) {
      if (!enriched.transportation) {
        enriched.transportation = { type: '火車', trainName: quickInfo.trainName };
      } else if (!enriched.transportation.trainName) {
        enriched.transportation.trainName = quickInfo.trainName;
      }
      console.log(`[WebScraperAgent] QuickInfo 補充列車名稱: ${quickInfo.trainName}`);
    }
    
    // 補充天數
    if (quickInfo.days && (!enriched.duration || !enriched.duration.days)) {
      enriched.duration = enriched.duration || {};
      enriched.duration.days = quickInfo.days;
      enriched.duration.nights = quickInfo.days - 1;
      console.log(`[WebScraperAgent] QuickInfo 補充天數: ${quickInfo.days}`);
    }
    
    // 補充目的地（增強版：支援景點到城市的對應）
    if (quickInfo.destination && (!enriched.location || !enriched.location.destinationCity)) {
      enriched.location = enriched.location || {};
      enriched.location.destinationCountry = '台灣';
      
      // 檢查是否為台灣景點，如果是則轉換為對應的城市
      const mappedCity = TAIWAN_ATTRACTIONS_TO_CITY[quickInfo.destination];
      if (mappedCity) {
        enriched.location.destinationCity = mappedCity;
        console.log(`[WebScraperAgent] QuickInfo 補充目的地: ${quickInfo.destination} → ${mappedCity}`);
      } else {
        // 如果不是景點，直接使用原始值
        enriched.location.destinationCity = quickInfo.destination;
        console.log(`[WebScraperAgent] QuickInfo 補充目的地: ${quickInfo.destination}`);
      }
    }
    
    // 補充價格
    if (quickInfo.price && (!enriched.pricing || (!enriched.pricing.price && !enriched.pricing.basePrice))) {
      enriched.pricing = enriched.pricing || {};
      enriched.pricing.price = quickInfo.price;
      enriched.pricing.basePrice = quickInfo.price;
      enriched.pricing.currency = 'TWD';
      console.log(`[WebScraperAgent] QuickInfo 補充價格: ${quickInfo.price}`);
    }
    
    return enriched;
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
    // 2026-01-30: 添加詳細日誌，幫助調試
    console.log("[WebScraperAgent] 驗證資料：", {
      hasBasicInfo: !!data.basicInfo,
      hasTitle: !!data.basicInfo?.title,
      hasLocation: !!data.location,
      hasCountry: !!data.location?.destinationCountry,
      hasCity: !!data.location?.destinationCity,
      hasDuration: !!data.duration,
      hasDays: !!data.duration?.days,
      hasPricing: !!data.pricing,
      hasPrice: !!(data.pricing?.price || data.pricing?.basePrice),
    });
    
    // Check required fields
    if (!data.basicInfo || !data.basicInfo.title) {
      console.error("[WebScraperAgent] Missing required field: basicInfo.title");
      return false;
    }
    
    if (!data.location || !data.location.destinationCountry || !data.location.destinationCity) {
      console.error("[WebScraperAgent] Missing required fields: location.destinationCountry or location.destinationCity");
      console.error("[WebScraperAgent] Current location data:", data.location);
      return false;
    }
    
    if (!data.duration || !data.duration.days) {
      console.error("[WebScraperAgent] Missing required field: duration.days");
      console.error("[WebScraperAgent] Current duration data:", data.duration);
      return false;
    }
    
    // pricing.price 或 pricing.basePrice 都可以
    if (!data.pricing || (!data.pricing.price && !data.pricing.basePrice)) {
      console.error("[WebScraperAgent] Missing required field: pricing.price or pricing.basePrice");
      console.error("[WebScraperAgent] Current pricing data:", data.pricing);
      return false;
    }
    
    console.log("[WebScraperAgent] 資料驗證通過！");
    return true;
  }
}
