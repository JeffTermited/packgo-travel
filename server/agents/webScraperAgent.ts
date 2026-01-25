/**
 * Web Scraper Agent
 * Responsible for extracting tour information from URLs
 */

import { fetchWebPage, extractTourInfoWithLLM } from "../webScraper";

export interface WebScraperResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Web Scraper Agent
 * Extracts tour information from a given URL
 */
export class WebScraperAgent {
  /**
   * Execute web scraping
   */
  async execute(url: string): Promise<WebScraperResult> {
    console.log("[WebScraperAgent] Starting web scraping for URL:", url);
    
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
      };
    } catch (error) {
      console.error("[WebScraperAgent] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
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
    
    if (!data.pricing || !data.pricing.price) {
      console.error("[WebScraperAgent] Missing required field: pricing.price");
      return false;
    }
    
    return true;
  }
}
