/**
 * Firecrawl Agent
 * Uses Firecrawl API for professional web scraping
 * 
 * Advantages over Puppeteer:
 * - Professional anti-bot bypass
 * - Structured extraction (Markdown / JSON)
 * - Faster speed (2-5s vs 10-20s)
 * - No Chrome instance maintenance
 * - Distributed architecture
 * 
 * 優化版本 (2026-01-29):
 * - onlyMainContent: false - 獲取完整頁面內容
 * - waitFor: 15000 - 等待動態內容載入
 * - timeout: 60000 - 增加總超時時間
 * - 新增 QuickInfo 從 metadata 快速提取關鍵資訊
 */

import Firecrawl from '@mendable/firecrawl-js';

/**
 * 快速提取的關鍵資訊（從 metadata title 提取）
 */
export interface QuickInfo {
  trainName?: string | null;
  days?: number | null;
  destination?: string | null;
  price?: number | null;
}

export interface FirecrawlResult {
  success: boolean;
  markdown?: string;
  html?: string;
  metadata?: {
    title?: string;
    description?: string;
    language?: string;
    sourceURL?: string;
    statusCode?: number;
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
  };
  quickInfo?: QuickInfo;
  error?: string;
}

export class FirecrawlAgent {
  private client: Firecrawl;

  constructor() {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY is not set');
    }

    this.client = new Firecrawl({ apiKey });
    console.log('[FirecrawlAgent] Initialized with optimized config');
    console.log('[FirecrawlAgent] Config: onlyMainContent=false, waitFor=15s, timeout=60s');
  }

  /**
   * Scrape a single URL with optimized configuration
   */
  async scrape(url: string): Promise<FirecrawlResult> {
    console.log('[FirecrawlAgent] Starting scrape for URL:', url);
    const startTime = Date.now();

    try {
      const result = await this.client.scrape(url, {
        formats: ['markdown', 'html'] as ('markdown' | 'html')[],
        waitFor: 15000,        // 15 秒等待動態內容
        timeout: 60000,        // 60 秒總超時
        onlyMainContent: false // 關鍵：獲取完整頁面內容
      });

      const duration = Date.now() - startTime;
      const markdownLength = result.markdown?.length || 0;
      const htmlLength = result.html?.length || 0;
      
      console.log(`[FirecrawlAgent] Scrape completed in ${duration}ms`);
      console.log(`[FirecrawlAgent] Content: ${markdownLength} chars (markdown), ${htmlLength} chars (html)`);

      // 從 metadata 提取 quickInfo
      const metadata = result.metadata;
      let quickInfo: QuickInfo | undefined;
      
      if (metadata?.title) {
        quickInfo = this.extractQuickInfo(metadata.title, metadata.description);
        console.log('[FirecrawlAgent] QuickInfo extracted from metadata:');
        console.log(`  - Train: ${quickInfo.trainName || 'N/A'}`);
        console.log(`  - Days: ${quickInfo.days || 'N/A'}`);
        console.log(`  - Destination: ${quickInfo.destination || 'N/A'}`);
        console.log(`  - Price: ${quickInfo.price || 'N/A'}`);
      }

      return {
        success: true,
        markdown: result.markdown,
        html: result.html,
        metadata: metadata ? {
          title: metadata.title,
          description: metadata.description,
          language: metadata.language,
          sourceURL: metadata.sourceURL,
          statusCode: metadata.statusCode,
          ogImage: (metadata as any).ogImage || (metadata as any)['og:image'],
          ogTitle: (metadata as any).ogTitle || (metadata as any)['og:title'],
          ogDescription: (metadata as any).ogDescription || (metadata as any)['og:description'],
        } : undefined,
        quickInfo,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[FirecrawlAgent] Scrape failed after ${duration}ms:`, error.message);

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * 從 metadata title 和 description 快速提取關鍵資訊
   */
  private extractQuickInfo(title: string, description?: string): QuickInfo {
    const content = `${title} ${description || ''}`;
    
    return {
      trainName: this.extractTrainName(content),
      days: this.extractDays(content),
      destination: this.extractDestination(content),
      price: this.extractPrice(content),
    };
  }

  /**
   * 提取列車名稱
   */
  private extractTrainName(content: string): string | null {
    // 台灣觀光列車名稱列表（按優先級排序）
    const trainPatterns = [
      '山嵐號',
      '鳴日號',
      '藍皮解憂號',
      '環島之星',
      'EMU3000',
      '觀光列車',
      '郵輪式列車',
      '仲夏寶島號',
      '兩鐵列車',
    ];
    
    for (const train of trainPatterns) {
      if (content.includes(train)) {
        console.log(`[FirecrawlAgent] Detected train: ${train}`);
        return train;
      }
    }
    return null;
  }

  /**
   * 提取天數
   */
  private extractDays(content: string): number | null {
    // 匹配多種格式：「2日」「3天」「5天4夜」「台東2日」等
    const patterns = [
      /(\d+)\s*[日天](?:\d*夜)?/,
      /(\d+)\s*Days?/i,
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const days = parseInt(match[1]);
        if (days > 0 && days <= 30) { // 合理範圍檢查
          console.log(`[FirecrawlAgent] Detected days: ${days}`);
          return days;
        }
      }
    }
    return null;
  }

  /**
   * 提取目的地
   */
  private extractDestination(content: string): string | null {
    // 台灣主要旅遊目的地
    const destinations = [
      // 東部
      '台東', '花蓮', '宜蘭',
      // 北部
      '台北', '新北', '基隆', '桃園', '新竹',
      // 中部
      '台中', '南投', '彰化', '雲林', '苗栗',
      // 南部
      '台南', '高雄', '嘉義', '屏東', '墾丁',
      // 離島
      '澎湖', '金門', '馬祖', '蘭嶼', '綠島', '小琉球',
      // 景點
      '日月潭', '阿里山', '太魯閣', '墾丁', '清境',
    ];
    
    for (const dest of destinations) {
      if (content.includes(dest)) {
        console.log(`[FirecrawlAgent] Detected destination: ${dest}`);
        return dest;
      }
    }
    return null;
  }

  /**
   * 提取價格
   */
  private extractPrice(content: string): number | null {
    // 匹配多種價格格式
    const patterns = [
      /TWD\s*([\d,]+)/i,
      /NT\$?\s*([\d,]+)/i,
      /([\d,]+)\s*元/,
      /價格[：:]\s*([\d,]+)/,
      /([\d]{1,3}(?:,\d{3})+)\s*人/,
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const price = parseInt(match[1].replace(/,/g, ''));
        if (price >= 1000 && price <= 500000) { // 合理範圍檢查
          console.log(`[FirecrawlAgent] Detected price: ${price}`);
          return price;
        }
      }
    }
    return null;
  }

  /**
   * Scrape with JSON schema extraction
   */
  async scrapeWithSchema(url: string, schema: Record<string, unknown>): Promise<FirecrawlResult & { json?: any }> {
    console.log('[FirecrawlAgent] Starting scrape with schema for URL:', url);
    const startTime = Date.now();

    try {
      const result = await this.client.scrape(url, {
        formats: [
          'markdown',
          {
            type: 'json',
            schema,
          },
        ],
        onlyMainContent: false, // 優化：獲取完整內容
        timeout: 60000,
        waitFor: 15000,
      });

      const duration = Date.now() - startTime;
      console.log(`[FirecrawlAgent] Scrape with schema completed in ${duration}ms`);

      // 從 metadata 提取 quickInfo
      const metadata = result.metadata;
      let quickInfo: QuickInfo | undefined;
      
      if (metadata?.title) {
        quickInfo = this.extractQuickInfo(metadata.title, metadata.description);
      }

      return {
        success: true,
        markdown: result.markdown,
        html: result.html,
        json: result.json,
        metadata: metadata ? {
          title: metadata.title,
          description: metadata.description,
          language: metadata.language,
          sourceURL: metadata.sourceURL,
          statusCode: metadata.statusCode,
        } : undefined,
        quickInfo,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[FirecrawlAgent] Scrape with schema failed after ${duration}ms:`, error.message);

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Extract JSON-LD metadata from URL
   */
  async extractJsonLd(url: string): Promise<any | null> {
    console.log('[FirecrawlAgent] Extracting JSON-LD from URL:', url);

    try {
      const result = await this.client.scrape(url, {
        formats: ['html'],
        onlyMainContent: false, // Need full HTML for JSON-LD
        timeout: 60000,
        waitFor: 15000,
      });

      if (!result.html) {
        console.log('[FirecrawlAgent] No HTML content returned');
        return null;
      }

      // Parse JSON-LD from HTML
      const jsonLdRegex = /<script type="application\/ld\+json">(.*?)<\/script>/g;
      const matches = Array.from(result.html.matchAll(jsonLdRegex));

      if (matches.length === 0) {
        console.log('[FirecrawlAgent] No JSON-LD found');
        return null;
      }

      console.log(`[FirecrawlAgent] Found ${matches.length} JSON-LD blocks`);

      const jsonLdData = matches.map(match => {
        try {
          return JSON.parse(match[1]);
        } catch {
          return null;
        }
      }).filter(Boolean);

      return jsonLdData.length > 0 ? jsonLdData : null;
    } catch (error: any) {
      console.error('[FirecrawlAgent] JSON-LD extraction failed:', error.message);
      return null;
    }
  }
}
