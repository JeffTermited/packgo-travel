/**
 * ScreenshotAgent - 網頁截圖與視覺分析代理
 * 
 * 使用 Puppeteer 截取網頁截圖，然後使用 LLM Vision 分析圖片內容
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { invokeLLM } from '../_core/llm';
import { storagePut } from '../storage';
import * as fs from 'fs';
import * as path from 'path';

interface ScreenshotResult {
  success: boolean;
  screenshots?: string[]; // S3 URLs
  localPaths?: string[]; // Local file paths
  error?: string;
}

interface AnalysisResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class ScreenshotAgent {
  private browser: Browser | null = null;
  
  constructor() {
    console.log("[ScreenshotAgent] Initialized");
  }
  
  /**
   * 初始化瀏覽器
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      console.log("[ScreenshotAgent] Launching browser...");
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--window-size=1920,1080',
        ],
      });
    }
    return this.browser;
  }
  
  /**
   * 關閉瀏覽器
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log("[ScreenshotAgent] Browser closed");
    }
  }
  
  /**
   * 截取網頁截圖（分段截取長頁面）
   */
  async captureScreenshots(url: string, maxScreenshots: number = 5): Promise<ScreenshotResult> {
    console.log(`[ScreenshotAgent] Capturing screenshots for: ${url}`);
    
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // 設置視窗大小
      await page.setViewport({ width: 1920, height: 1080 });
      
      // 設置 User-Agent 模擬真實瀏覽器
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      
      // 導航到頁面
      console.log("[ScreenshotAgent] Navigating to page...");
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000,
      });
      
      // 等待頁面完全載入
      await this.waitForPageLoad(page);
      
      // 獲取頁面總高度
      const totalHeight = await page.evaluate(() => document.body.scrollHeight);
      const viewportHeight = 1080;
      const numScreenshots = Math.min(Math.ceil(totalHeight / viewportHeight), maxScreenshots);
      
      console.log(`[ScreenshotAgent] Page height: ${totalHeight}px, taking ${numScreenshots} screenshots`);
      
      const screenshots: string[] = [];
      const localPaths: string[] = [];
      const timestamp = Date.now();
      
      for (let i = 0; i < numScreenshots; i++) {
        const scrollPosition = i * viewportHeight;
        
        // 滾動到指定位置
        await page.evaluate((y) => window.scrollTo(0, y), scrollPosition);
        await new Promise(resolve => setTimeout(resolve, 500)); // 等待渲染
        
        // 截圖
        const screenshotBuffer = await page.screenshot({
          type: 'png',
          clip: {
            x: 0,
            y: 0,
            width: 1920,
            height: viewportHeight,
          },
        });
        
        // 保存到本地
        const localPath = `/tmp/screenshot_${timestamp}_${i}.png`;
        fs.writeFileSync(localPath, screenshotBuffer);
        localPaths.push(localPath);
        
        // 上傳到 S3
        const s3Key = `screenshots/${timestamp}_${i}.png`;
        const { url: s3Url } = await storagePut(s3Key, screenshotBuffer, 'image/png');
        screenshots.push(s3Url);
        
        console.log(`[ScreenshotAgent] Screenshot ${i + 1}/${numScreenshots} captured`);
      }
      
      await page.close();
      
      return {
        success: true,
        screenshots,
        localPaths,
      };
    } catch (error) {
      console.error("[ScreenshotAgent] Error capturing screenshots:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
  /**
   * 等待頁面完全載入
   */
  private async waitForPageLoad(page: Page): Promise<void> {
    // 等待主要內容載入
    try {
      await page.waitForSelector('body', { timeout: 10000 });
      
      // 嘗試等待常見的內容容器
      const selectors = [
        '.tour-detail',
        '.product-detail',
        '.itinerary',
        '[class*="detail"]',
        '[class*="content"]',
      ];
      
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          console.log(`[ScreenshotAgent] Found selector: ${selector}`);
          break;
        } catch {
          // 繼續嘗試下一個選擇器
        }
      }
      
      // 額外等待確保動態內容載入
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.warn("[ScreenshotAgent] Timeout waiting for page load, proceeding anyway");
    }
  }
  
  /**
   * 使用 LLM Vision 分析截圖
   */
  async analyzeScreenshots(screenshotUrls: string[]): Promise<AnalysisResult> {
    console.log(`[ScreenshotAgent] Analyzing ${screenshotUrls.length} screenshots...`);
    
    try {
      // 構建圖片內容
      const imageContents = screenshotUrls.map(url => ({
        type: "image_url" as const,
        image_url: {
          url,
          detail: "high" as const,
        },
      }));
      
      const systemPrompt = `你是一位專業的旅遊行程分析師。請仔細分析這些旅遊行程網頁的截圖，提取所有重要資訊。

請以 JSON 格式回傳以下資訊：

{
  "basicInfo": {
    "title": "行程標題",
    "productCode": "產品代碼",
    "description": "行程描述（100-200字）"
  },
  "location": {
    "destinationCountry": "目的地國家（用逗號分隔多個國家）",
    "destinationCity": "目的地城市（用逗號分隔多個城市）",
    "departureCity": "出發城市"
  },
  "duration": {
    "days": 天數（數字）,
    "nights": 夜數（數字）
  },
  "pricing": {
    "basePrice": 基本價格（數字，無貨幣符號）,
    "currency": "貨幣（TWD/USD等）",
    "includes": ["包含項目1", "包含項目2"],
    "excludes": ["不包含項目1", "不包含項目2"]
  },
  "dailyItinerary": [
    {
      "day": 1,
      "title": "Day 1 標題",
      "description": "當日行程描述",
      "highlights": ["景點1", "景點2"],
      "meals": {
        "breakfast": "早餐安排",
        "lunch": "午餐安排",
        "dinner": "晚餐安排"
      },
      "accommodation": "住宿飯店名稱"
    }
  ],
  "highlights": ["行程亮點1", "行程亮點2", "行程亮點3"],
  "hotels": [
    {
      "name": "飯店名稱",
      "rating": "星級（5星/4星等）",
      "location": "位置"
    }
  ],
  "flights": {
    "airline": "航空公司",
    "departureTime": "出發時間",
    "returnTime": "回程時間"
  },
  "notices": ["注意事項1", "注意事項2"]
}

注意：
1. 請仔細閱讀每張截圖中的所有文字內容
2. 如果某些資訊在截圖中找不到，請填入 null 或空陣列
3. 每日行程請盡量詳細，包含所有景點和活動
4. 價格請只填數字，不要包含貨幣符號或逗號`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "請分析以下旅遊行程網頁截圖，提取所有行程資訊：" },
              ...imageContents,
            ],
          },
        ],
      });
      
      const content = response.choices[0]?.message?.content;
      let contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      
      // 移除 markdown 格式
      contentStr = contentStr.trim();
      if (contentStr.startsWith("```json")) {
        contentStr = contentStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (contentStr.startsWith("```")) {
        contentStr = contentStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      
      const analysisResult = JSON.parse(contentStr);
      
      console.log("[ScreenshotAgent] Analysis completed successfully");
      
      return {
        success: true,
        data: analysisResult,
      };
    } catch (error) {
      console.error("[ScreenshotAgent] Error analyzing screenshots:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
  /**
   * 完整流程：截圖 + 分析
   */
  async execute(url: string): Promise<AnalysisResult> {
    console.log(`[ScreenshotAgent] Starting full execution for: ${url}`);
    
    try {
      // 步驟 1: 截圖
      const screenshotResult = await this.captureScreenshots(url);
      
      if (!screenshotResult.success || !screenshotResult.screenshots) {
        return {
          success: false,
          error: screenshotResult.error || "Failed to capture screenshots",
        };
      }
      
      // 步驟 2: 分析
      const analysisResult = await this.analyzeScreenshots(screenshotResult.screenshots);
      
      // 清理本地檔案
      if (screenshotResult.localPaths) {
        for (const localPath of screenshotResult.localPaths) {
          try {
            fs.unlinkSync(localPath);
          } catch {
            // 忽略清理錯誤
          }
        }
      }
      
      // 關閉瀏覽器
      await this.closeBrowser();
      
      return analysisResult;
    } catch (error) {
      console.error("[ScreenshotAgent] Error in execution:", error);
      await this.closeBrowser();
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// 導出單例
export const screenshotAgent = new ScreenshotAgent();
