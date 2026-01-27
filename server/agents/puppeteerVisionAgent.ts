/**
 * PuppeteerVisionAgent
 * 使用 Puppeteer 截取網頁截圖，然後使用 LLM Vision API 分析內容
 * 這是 PrintFriendly API 的替代方案
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { invokeLLM } from '../_core/llm';
import { storagePut } from '../storage';
import * as fs from 'fs';
import * as path from 'path';

export interface PuppeteerVisionResult {
  success: boolean;
  screenshots: string[];
  extractedData: {
    title: string;
    subtitle?: string;
    destination?: string;
    duration?: string;
    price?: string;
    highlights?: string[];
    dailyItinerary?: Array<{
      day: number;
      title: string;
      description: string;
      activities?: string[];
      meals?: string;
      accommodation?: string;
    }>;
    includes?: string[];
    excludes?: string[];
    hotels?: Array<{
      name: string;
      description?: string;
      rating?: string;
    }>;
    rawText?: string;
  };
  error?: string;
  method: 'puppeteer-vision';
}

/**
 * 使用 Puppeteer 截取網頁截圖
 */
async function captureScreenshots(url: string): Promise<{ screenshots: Buffer[]; error?: string }> {
  let browser: Browser | null = null;
  
  try {
    console.log('[PuppeteerVision] Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1920,1080',
      ],
    });

    const page: Page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // 設置 User-Agent 模擬真實瀏覽器
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    // 設置額外的 headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });

    console.log('[PuppeteerVision] Navigating to URL:', url);
    
    // 使用 domcontentloaded 而不是 networkidle2，因為雄獅網站有很多動態資源
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    
    // 等待頁面內容載入
    console.log('[PuppeteerVision] Waiting for page content to load...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    // 嘗試關閉可能的彈窗
    try {
      await page.evaluate(() => {
        // 關閉常見的彈窗
        const closeButtons = document.querySelectorAll('[class*="close"], [class*="dismiss"], [aria-label="Close"]');
        closeButtons.forEach((btn: any) => btn.click?.());
      });
    } catch (e) {
      // 忽略彈窗關閉錯誤
    }

    const screenshots: Buffer[] = [];

    // 截取第一屏（Hero 區域）
    console.log('[PuppeteerVision] Capturing screenshot 1 (Hero)...');
    const screenshot1 = await page.screenshot({ type: 'png' }) as Buffer;
    screenshots.push(screenshot1);

    // 滾動並截取更多內容
    const scrollPositions = [1000, 2000, 3000, 4000];
    
    for (let i = 0; i < scrollPositions.length; i++) {
      await page.evaluate((scrollY) => {
        window.scrollTo(0, scrollY);
      }, scrollPositions[i]);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`[PuppeteerVision] Capturing screenshot ${i + 2}...`);
      const screenshot = await page.screenshot({ type: 'png' }) as Buffer;
      screenshots.push(screenshot);
    }

    // 嘗試點擊標籤頁並截圖（針對雄獅旅遊）
    const tabNames = ['每日行程', '飯店介紹', '費用說明', '出發日期'];
    
    for (const tabName of tabNames) {
      try {
        console.log(`[PuppeteerVision] Trying to click tab: ${tabName}...`);
        
        // 滾動到頁面頂部
        await page.evaluate(() => window.scrollTo(0, 0));
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 嘗試多種選擇器來找到標籤頁
        const clicked = await page.evaluate((name) => {
          // 方法 1: 查找包含文字的按鈕或連結
          const elements = Array.from(document.querySelectorAll('button, a, div[role="tab"], li'));
          const targetElement = elements.find(el => 
            el.textContent?.trim() === name || 
            el.textContent?.includes(name)
          ) as HTMLElement;
          
          if (targetElement) {
            targetElement.click();
            return true;
          }
          
          return false;
        }, tabName);
        
        if (clicked) {
          console.log(`[PuppeteerVision] Successfully clicked tab: ${tabName}`);
          
          // 等待內容載入
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // 截取標籤頁內容
          const tabScreenshot = await page.screenshot({ type: 'png' }) as Buffer;
          screenshots.push(tabScreenshot);
          
          // 滾動標籤頁內容並截取更多截圖
          for (let i = 0; i < 2; i++) {
            await page.evaluate((scrollY) => {
              window.scrollBy(0, scrollY);
            }, 1000);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const scrollScreenshot = await page.screenshot({ type: 'png' }) as Buffer;
            screenshots.push(scrollScreenshot);
          }
        } else {
          console.log(`[PuppeteerVision] Could not find tab: ${tabName}`);
        }
      } catch (error: any) {
        console.error(`[PuppeteerVision] Error clicking tab ${tabName}:`, error.message);
      }
    }

    console.log(`[PuppeteerVision] Captured ${screenshots.length} screenshots`);
    return { screenshots };

  } catch (error: any) {
    console.error('[PuppeteerVision] Error capturing screenshots:', error.message);
    return { screenshots: [], error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * 將截圖上傳到 S3 並獲取 URL
 */
async function uploadScreenshots(screenshots: Buffer[]): Promise<string[]> {
  const urls: string[] = [];
  
  for (let i = 0; i < screenshots.length; i++) {
    const timestamp = Date.now();
    const key = `screenshots/tour-scrape-${timestamp}-${i}.png`;
    
    try {
      const result = await storagePut(key, screenshots[i], 'image/png');
      urls.push(result.url);
      console.log(`[PuppeteerVision] Uploaded screenshot ${i + 1}: ${result.url}`);
    } catch (error: any) {
      console.error(`[PuppeteerVision] Failed to upload screenshot ${i + 1}:`, error.message);
    }
  }
  
  return urls;
}

/**
 * 使用 LLM Vision API 分析截圖
 */
async function analyzeWithVision(screenshotUrls: string[]): Promise<PuppeteerVisionResult['extractedData']> {
  console.log('[PuppeteerVision] Analyzing screenshots with Vision API...');
  
  // 構建包含圖片的消息
  const imageContents = screenshotUrls.map(url => ({
    type: 'image_url' as const,
    image_url: {
      url: url,
      detail: 'high' as const,
    },
  }));

  const prompt = `你是一個專業的旅遊行程分析專家。請仔細分析這些旅遊網頁截圖，提取以下資訊。

重要：你必須只回傳有效的 JSON 格式，不要包含任何其他文字、說明或 markdown 格式。

請提取：
1. 行程標題（完整名稱）
2. 副標題
3. 目的地（國家和城市）
4. 行程天數
5. 價格
6. 行程亮點
7. 每日行程
8. 費用包含項目
9. 費用不包含項目
10. 住宿資訊

JSON 格式範例：
{"title":"新馬旅遊5日","subtitle":"描述","destination":"新加坡,馬來西亞","duration":"5天4夜","price":"NT$26999","highlights":["亮點1","亮點2"],"dailyItinerary":[{"day":1,"title":"第一天","description":"描述","activities":["活動1"],"meals":"早/午/晚","accommodation":"飯店"}],"includes":["包含1"],"excludes":["不包含1"],"hotels":[{"name":"飯店名","description":"描述","rating":"4星"}]}

請直接回傳 JSON，不要用 \`\`\`json 包裹。`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...imageContents,
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content || '';
    // Convert content to string if it's an array
    let jsonStr = typeof content === 'string' ? content : JSON.stringify(content);
    console.log('[PuppeteerVision] Raw LLM response length:', jsonStr.length);
    
    // 移除 markdown 代碼塊
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '');
    }
    
    // 嘗試找到 JSON 的開始和結束
    const jsonStartIndex = jsonStr.indexOf('{');
    const jsonEndIndex = jsonStr.lastIndexOf('}');
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
      jsonStr = jsonStr.substring(jsonStartIndex, jsonEndIndex + 1);
    }
    
    jsonStr = jsonStr.trim();
    
    console.log('[PuppeteerVision] Cleaned JSON string (first 200 chars):', jsonStr.substring(0, 200));
    
    const extractedData = JSON.parse(jsonStr);
    console.log('[PuppeteerVision] Successfully extracted data from screenshots');
    console.log('[PuppeteerVision] Title:', extractedData.title);
    
    return extractedData;

  } catch (error: any) {
    console.error('[PuppeteerVision] Error analyzing with Vision API:', error.message);
    return {
      title: '',
      rawText: `Vision API analysis failed: ${error.message}`,
    };
  }
}

/**
 * 主函數：截圖並分析網頁
 */
export async function scrapeWithPuppeteerVision(url: string): Promise<PuppeteerVisionResult> {
  console.log('[PuppeteerVision] Starting scrape with Puppeteer + Vision...');
  console.log('[PuppeteerVision] URL:', url);

  // 步驟 1：截取截圖
  const { screenshots, error: captureError } = await captureScreenshots(url);
  
  if (captureError || screenshots.length === 0) {
    return {
      success: false,
      screenshots: [],
      extractedData: { title: '' },
      error: captureError || 'No screenshots captured',
      method: 'puppeteer-vision',
    };
  }

  // 步驟 2：上傳截圖到 S3
  const screenshotUrls = await uploadScreenshots(screenshots);
  
  if (screenshotUrls.length === 0) {
    return {
      success: false,
      screenshots: [],
      extractedData: { title: '' },
      error: 'Failed to upload screenshots',
      method: 'puppeteer-vision',
    };
  }

  // 步驟 3：使用 Vision API 分析截圖
  const extractedData = await analyzeWithVision(screenshotUrls);

  return {
    success: true,
    screenshots: screenshotUrls,
    extractedData,
    method: 'puppeteer-vision',
  };
}

export default {
  scrapeWithPuppeteerVision,
};
