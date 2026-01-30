/**
 * PuppeteerVisionAgent
 * 使用 Puppeteer 截取網頁截圖，然後使用 LLM Vision API 分析內容
 * 
 * Phase 1 優化：
 * - 減少截圖數量：15張 → 3張
 * - 並行上傳截圖
 * - 使用 JPEG 格式 (quality: 80)
 * - 視窗解析度：1920x1080 → 1280x720
 * - 減少頁面等待時間：8秒 → 3秒
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
 * 自動滾動頁面以載入所有懶載入內容
 */
async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 500; // 每次滾動 500px
      const maxScrolls = 50; // 最多滾動 50 次，防止無限滾動
      let scrollCount = 0;
      
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrollCount++;

        if (totalHeight >= scrollHeight || scrollCount >= maxScrolls) {
          clearInterval(timer);
          // 滾動回頂部
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });
}

/**
 * 使用 Puppeteer 截取網頁截圖 - 整頁截圖版本
 * 使用 fullPage: true 截取整頁，然後自動分割成多張圖片
 */
async function captureScreenshots(url: string): Promise<{ screenshots: Buffer[]; error?: string }> {
  let browser: Browser | null = null;
  
  console.log('[PuppeteerVision] Using fullPage screenshot mode with auto-split');
  
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
        '--window-size=1280,720', // 優化：降低解析度
      ],
    });

    const page: Page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 }); // 優化：降低解析度
    
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
    
    // 使用 domcontentloaded 而不是 networkidle2
    // Phase 1 優化：增加超時時間到 90 秒
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    
    // 等待頁面內容載入（增加等待時間以確保動態內容載入）
    console.log('[PuppeteerVision] Waiting for page content to load (5s)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 嘗試關閉 Cookie 同意橫幅和其他彈窗
    try {
      await page.evaluate(() => {
        // 關閉 Cookie 同意橫幅
        const cookieButtons = document.querySelectorAll(
          'button[class*="cookie"], button[class*="consent"], button[class*="agree"], ' +
          'button[class*="accept"], a[class*="agree"], a[class*="accept"], ' +
          '[class*="cookie"] button, [class*="consent"] button, ' +
          'button:contains("同意"), button:contains("接受"), button:contains("我知道了")'
        );
        cookieButtons.forEach((btn: any) => {
          if (btn.textContent?.includes('同意') || btn.textContent?.includes('接受') || 
              btn.textContent?.includes('我知道了') || btn.textContent?.includes('OK') ||
              btn.textContent?.includes('Accept') || btn.textContent?.includes('Agree')) {
            btn.click?.();
          }
        });
        
        // 關閉其他彈窗
        const closeButtons = document.querySelectorAll('[class*="close"], [class*="dismiss"], [aria-label="Close"]');
        closeButtons.forEach((btn: any) => btn.click?.());
      });
      
      // 等待彈窗關閉動畫
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      // 忽略彈窗關閉錯誤
    }
    
    // 嘗試點擊「同意」按鈕（針對雄獅旅遊的 Cookie 橫幅）
    try {
      const agreeButton = await page.$('button.btn-primary, button.agree-btn, button:has-text("同意")');
      if (agreeButton) {
        await agreeButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (e) {
      // 忽略
    }
    
    // 等待主要內容區域載入
    try {
      await page.waitForSelector('[class*="tour"], [class*="product"], [class*="detail"], main, article', { timeout: 5000 });
    } catch (e) {
      console.log('[PuppeteerVision] Main content selector not found, continuing anyway...');
    }
    
    // 再等待一下確保圖片載入
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 先滾動到頁面底部，確保所有懶載入內容都已載入
    console.log('[PuppeteerVision] Scrolling to load all lazy content...');
    await autoScroll(page);
    
    // 等待所有圖片載入
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 獲取頁面總高度
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`[PuppeteerVision] Page total height: ${pageHeight}px`);
    
    // 截取整頁截圖
    console.log('[PuppeteerVision] Capturing full page screenshot...');
    const fullPageScreenshot = await page.screenshot({ 
      type: 'jpeg',
      quality: 85,
      fullPage: true,
    }) as Buffer;
    
    console.log(`[PuppeteerVision] Full page screenshot size: ${(fullPageScreenshot.length / 1024 / 1024).toFixed(2)} MB`);
    
    // 如果截圖太大（超過 10MB），需要分割
    // Claude Vision API 建議單張圖片不超過 20MB，但為了效率我們設定 5MB 為閾值
    const MAX_SIZE_MB = 5;
    const screenshots: Buffer[] = [];
    
    if (fullPageScreenshot.length > MAX_SIZE_MB * 1024 * 1024) {
      console.log(`[PuppeteerVision] Screenshot too large, splitting into segments...`);
      
      // 計算需要分割成幾段
      const viewportHeight = 720;
      const numSegments = Math.ceil(pageHeight / viewportHeight);
      const maxSegments = 10; // 最多 10 張截圖
      const actualSegments = Math.min(numSegments, maxSegments);
      
      console.log(`[PuppeteerVision] Splitting into ${actualSegments} segments...`);
      
      // 滾動並截取每個段落
      for (let i = 0; i < actualSegments; i++) {
        const scrollY = i * viewportHeight;
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const segmentScreenshot = await page.screenshot({ 
          type: 'jpeg',
          quality: 80,
        }) as Buffer;
        screenshots.push(segmentScreenshot);
        console.log(`[PuppeteerVision] Captured segment ${i + 1}/${actualSegments}`);
      }
    } else {
      // 截圖大小可接受，直接使用整頁截圖
      screenshots.push(fullPageScreenshot);
    }

    console.log(`[PuppeteerVision] Captured ${screenshots.length} screenshot(s) (fullPage mode)`);
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
 * 將截圖並行上傳到 S3 並獲取 URL - 優化版本
 */
async function uploadScreenshots(screenshots: Buffer[]): Promise<string[]> {
  console.log(`[PuppeteerVision] Uploading ${screenshots.length} screenshots in parallel...`);
  
  const uploadStart = Date.now();
  
  // 優化：並行上傳所有截圖
  const uploadPromises = screenshots.map(async (screenshot, i) => {
    const timestamp = Date.now();
    const key = `screenshots/tour-scrape-${timestamp}-${i}.jpg`; // 使用 .jpg 擴展名
    
    try {
      const result = await storagePut(key, screenshot, 'image/jpeg');
      console.log(`[PuppeteerVision] Uploaded screenshot ${i + 1}: ${result.url}`);
      return result.url;
    } catch (error: any) {
      console.error(`[PuppeteerVision] Failed to upload screenshot ${i + 1}:`, error.message);
      return null;
    }
  });
  
  const results = await Promise.all(uploadPromises);
  const urls = results.filter((url): url is string => url !== null);
  
  const uploadDuration = Date.now() - uploadStart;
  console.log(`[PuppeteerVision] Parallel upload completed in ${uploadDuration}ms`);
  
  return urls;
}

/**
 * 使用 LLM Vision API 分析截圖 - 增強 JSON 解析容錯
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

**重要規則：**
1. 你必須只回傳有效的 JSON 格式
2. 不要包含任何其他文字、說明或 markdown 格式
3. 不要使用 \`\`\`json 或 \`\`\` 包裹
4. 直接以 { 開始，以 } 結束

**最重要：天數提取**
- 必須從標題或頁面中提取正確的天數（例如：「台東2日」表示 2 天，「5日4夜」表示 5 天）
- 如果標題顯示「2日」，則 duration 必須是「2天1夜」，並且 dailyItinerary 只能有 2 天
- 絕對不要自行擴充天數，必須嚴格按照原始資料

🚨 **關鍵提取要求（資料忠實度）**：
1. **交通方式識別**（最高優先級）：
   - 如果看到「鳴日號」「觀光列車」「火車」→ 記錄 transportation 為「火車」
   - 如果看到「郵輪」「遊輪」→ 記錄 transportation 為「郵輪」
   - 如果看到飛機、航班 → 記錄 transportation 為「飛機」
   - ⚠️ 鳴日號是火車行程，絕對不是飛機！

2. **飯店名稱**：
   - 必須保留完整名稱，例如：「The GAYA Hotel 潮渡假酒店」
   - 不要簡化或更改飯店名稱
   - 每天的住宿飯店必須準確記錄在 accommodation 欄位

3. **景點名稱**：
   - 保持原始名稱，例如：「普悠瑪部落」「成功海光走讀」
   - 不要替換為其他景點
   - 必須提取每一天的詳細行程，包括時間點和活動描述

4. **每日行程**：必須提取每一天的詳細行程，包括：
   - 時間點（如果有顯示）
   - 景點名稱（保持原始名稱，不要更改）
   - 活動描述
   - 餐食安排（早餐、午餐、晚餐）
   - 住宿飯店（保持完整名稱，包含飯店級別）

請提取：
1. 行程標題（完整名稱）- title
2. 副標題 - subtitle
3. 目的地（國家和城市）- destination
4. 行程天數（必須從標題提取，例如「台東2日」就是 2 天）- duration
5. 價格 - price
6. 行程亮點 - highlights
7. 每日行程（天數必須與 duration 一致）- dailyItinerary
8. 費用包含項目 - includes
9. 費用不包含項目 - excludes
10. 住宿資訊 - hotels
11. 交通方式 - transportation（火車/飛機/郵輪/巴士）

JSON 格式範例（直接回傳這種格式）：
{"title":"鳴日號台東縱谷雲海漫遊3日","subtitle":"描述","destination":"台灣,台東","duration":"3天2夜","price":"NT$14000","transportation":"火車","highlights":["亮點1","亮點2"],"dailyItinerary":[{"day":1,"title":"第一天","description":"描述","activities":["普悠瑪部落","成功海光走讀"],"meals":"早/午/晚","accommodation":"The GAYA Hotel 潮渡假酒店"},{"day":2,"title":"第二天","description":"描述","activities":["如豐琢玉工坊"],"meals":"早/午/晚","accommodation":"花蓮潔西艾美渡假酒店"},{"day":3,"title":"第三天","description":"描述","activities":["返程"],"meals":"早/午","accommodation":""}],"includes":["包含1"],"excludes":["不包含1"],"hotels":[{"name":"The GAYA Hotel 潮渡假酒店","description":"描述","rating":"5星"},{"name":"花蓮潔西艾美渡假酒店","description":"描述","rating":"5星"}]}`;

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
    let jsonStr = typeof content === 'string' ? content : JSON.stringify(content);
    console.log('[PuppeteerVision] Raw LLM response length:', jsonStr.length);
    
    // 增強 JSON 解析容錯
    jsonStr = cleanJsonResponse(jsonStr);
    
    console.log('[PuppeteerVision] Cleaned JSON string (first 300 chars):', jsonStr.substring(0, 300));
    
    try {
      const extractedData = JSON.parse(jsonStr);
      console.log('[PuppeteerVision] Successfully extracted data from screenshots');
      console.log('[PuppeteerVision] Title:', extractedData.title);
      return extractedData;
    } catch (parseError: any) {
      console.error('[PuppeteerVision] JSON parse error:', parseError.message);
      
      // 嘗試修復常見的 JSON 問題
      const fixedJson = attemptJsonFix(jsonStr);
      if (fixedJson) {
        console.log('[PuppeteerVision] Successfully fixed JSON');
        return fixedJson;
      }
      
      throw parseError;
    }

  } catch (error: any) {
    console.error('[PuppeteerVision] Error analyzing with Vision API:', error.message);
    return {
      title: '',
      rawText: `Vision API analysis failed: ${error.message}`,
    };
  }
}

/**
 * 清理 LLM 返回的 JSON 字串
 */
function cleanJsonResponse(jsonStr: string): string {
  // 移除 markdown 代碼塊
  if (jsonStr.includes('```json')) {
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (jsonStr.includes('```')) {
    jsonStr = jsonStr.replace(/```\n?/g, '');
  }
  
  // 移除開頭的非 JSON 文字
  const jsonStartIndex = jsonStr.indexOf('{');
  if (jsonStartIndex > 0) {
    jsonStr = jsonStr.substring(jsonStartIndex);
  }
  
  // 找到最後一個完整的 JSON 對象結束位置
  let braceCount = 0;
  let jsonEndIndex = -1;
  
  for (let i = 0; i < jsonStr.length; i++) {
    if (jsonStr[i] === '{') {
      braceCount++;
    } else if (jsonStr[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        jsonEndIndex = i;
        break;
      }
    }
  }
  
  if (jsonEndIndex !== -1) {
    jsonStr = jsonStr.substring(0, jsonEndIndex + 1);
  }
  
  return jsonStr.trim();
}

/**
 * 嘗試修復常見的 JSON 問題
 */
function attemptJsonFix(jsonStr: string): any | null {
  try {
    // 嘗試 1：移除尾部的非 JSON 內容
    const lastBrace = jsonStr.lastIndexOf('}');
    if (lastBrace !== -1) {
      const trimmed = jsonStr.substring(0, lastBrace + 1);
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        // 繼續嘗試其他修復方法
      }
    }
    
    // 嘗試 2：修復未閉合的字串
    let fixed = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    try {
      return JSON.parse(fixed);
    } catch (e) {
      // 繼續嘗試
    }
    
    // 嘗試 3：提取第一個有效的 JSON 對象
    const match = jsonStr.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        // 放棄
      }
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * 主函數：截圖並分析網頁
 */
export async function scrapeWithPuppeteerVision(url: string): Promise<PuppeteerVisionResult> {
  console.log('[PuppeteerVision] Starting scrape with Puppeteer + Vision...');
  console.log('[PuppeteerVision] URL:', url);

  const startTime = Date.now();

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

  // 步驟 2：並行上傳截圖到 S3
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

  const totalDuration = Date.now() - startTime;
  console.log(`[PuppeteerVision] Total duration: ${totalDuration}ms`);

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
