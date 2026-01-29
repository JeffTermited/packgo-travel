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
 */

import Firecrawl from '@mendable/firecrawl-js';

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
  };
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
    console.log('[FirecrawlAgent] Initialized with API key');
  }

  /**
   * Scrape a single URL
   */
  async scrape(url: string): Promise<FirecrawlResult> {
    console.log('[FirecrawlAgent] Starting scrape for URL:', url);
    const startTime = Date.now();

    try {
      const result = await this.client.scrape(url, {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        timeout: 30000, // 30 seconds
      });

      const duration = Date.now() - startTime;
      console.log(`[FirecrawlAgent] Scrape completed in ${duration}ms`);

      return {
        success: true,
        markdown: result.markdown,
        html: result.html,
        metadata: result.metadata ? {
          title: result.metadata.title,
          description: result.metadata.description,
          language: result.metadata.language,
          sourceURL: result.metadata.sourceURL,
          statusCode: result.metadata.statusCode,
        } : undefined,
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
        onlyMainContent: true,
        timeout: 30000,
      });

      const duration = Date.now() - startTime;
      console.log(`[FirecrawlAgent] Scrape with schema completed in ${duration}ms`);

      return {
        success: true,
        markdown: result.markdown,
        html: result.html,
        json: result.json,
        metadata: result.metadata ? {
          title: result.metadata.title,
          description: result.metadata.description,
          language: result.metadata.language,
          sourceURL: result.metadata.sourceURL,
          statusCode: result.metadata.statusCode,
        } : undefined,
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
        timeout: 30000,
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
