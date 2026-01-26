/**
 * Puppeteer 網頁抓取模組
 * 使用 Puppeteer 進行完整的網頁抓取,支援 JavaScript 渲染和懶加載
 */

import puppeteer, { Browser, Page } from 'puppeteer';

interface ScrapedContent {
  html: string;
  text: string;
  title: string;
  images: string[];
}

let browser: Browser | null = null;

/**
 * 獲取或創建 Puppeteer Browser 實例
 * 重用 Browser 實例以提高性能
 */
async function getBrowser(): Promise<Browser> {
  if (!browser) {
    console.log('[PuppeteerScraper] Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
    });
    console.log('[PuppeteerScraper] Browser launched successfully');
  }
  return browser;
}

/**
 * 關閉 Puppeteer Browser
 * 應在應用程式關閉時調用
 */
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
    console.log('[PuppeteerScraper] Browser closed');
  }
}

/**
 * 使用 Puppeteer 抓取網頁內容
 * 支援 JavaScript 渲染、等待頁面載入、滾動觸發懶加載
 */
export async function fetchWebPageWithPuppeteer(url: string): Promise<ScrapedContent> {
  console.log('[PuppeteerScraper] Fetching URL:', url);
  
  const browserInstance = await getBrowser();
  const page: Page = await browserInstance.newPage();
  
  try {
    // 設定 User-Agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    // 設定 Viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // 導航到 URL
    console.log('[PuppeteerScraper] Navigating to URL...');
    await page.goto(url, {
      waitUntil: 'networkidle2', // 等待網路閒置
      timeout: 60000, // 60 秒超時
    });
    
    console.log('[PuppeteerScraper] Page loaded, waiting for content...');
    
    // 等待主要內容容器出現 (針對雄獅旅遊網站)
    try {
      await page.waitForSelector('#pb-render-root', { timeout: 10000 });
      console.log('[PuppeteerScraper] Main content container found');
    } catch (error) {
      console.log('[PuppeteerScraper] Main content container not found, continuing...');
    }
    
    // 滾動頁面以觸發懶加載
    console.log('[PuppeteerScraper] Scrolling page to trigger lazy loading...');
    await autoScroll(page);
    
    // 再等待一下,確保所有內容都已載入
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 獲取頁面標題
    const title = await page.title();
    console.log('[PuppeteerScraper] Page title:', title);
    
    // 獲取 HTML 內容
    const html = await page.content();
    console.log('[PuppeteerScraper] HTML length:', html.length);
    
    // 提取文字內容
    const text = await page.evaluate(() => {
      // 移除 script, style, noscript 標籤
      const scripts = document.querySelectorAll('script, style, noscript');
      scripts.forEach(script => script.remove());
      
      // 獲取 body 的文字內容
      return document.body.innerText || '';
    });
    
    console.log('[PuppeteerScraper] Text length:', text.length);
    
    // 提取圖片 URLs
    const images = await page.evaluate(() => {
      const imgElements = Array.from(document.querySelectorAll('img'));
      return imgElements
        .map(img => img.src)
        .filter(src => src && !src.startsWith('data:') && !src.includes('svg'));
    });
    
    console.log('[PuppeteerScraper] Images found:', images.length);
    
    return {
      html,
      text: text.trim(),
      title,
      images,
    };
    
  } catch (error) {
    console.error('[PuppeteerScraper] Error:', error);
    throw error;
  } finally {
    // 關閉頁面
    await page.close();
    console.log('[PuppeteerScraper] Page closed');
  }
}

/**
 * 自動滾動頁面以觸發懶加載
 */
async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 500; // 每次滾動 500px
      const maxScrolls = 20; // 最多滾動 20 次
      let scrollCount = 0;
      
      const timer = setInterval(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrollCount++;
        
        // 如果已經滾動到底部,或達到最大滾動次數,停止滾動
        if (totalHeight >= scrollHeight || scrollCount >= maxScrolls) {
          clearInterval(timer);
          // 滾動回頂部
          window.scrollTo(0, 0);
          resolve();
        }
      }, 200); // 每 200ms 滾動一次
    });
  });
  
  console.log('[PuppeteerScraper] Auto-scroll completed');
}

/**
 * 攔截網路請求 (可選功能,用於未來優化)
 * 可以用來捕獲 API 請求並直接獲取結構化資料
 */
export async function interceptNetworkRequests(url: string): Promise<any[]> {
  console.log('[PuppeteerScraper] Intercepting network requests for URL:', url);
  
  const browserInstance = await getBrowser();
  const page: Page = await browserInstance.newPage();
  
  const requests: any[] = [];
  
  try {
    // 啟用請求攔截
    await page.setRequestInterception(true);
    
    // 監聽請求
    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
      });
      request.continue();
    });
    
    // 監聽回應
    page.on('response', async (response) => {
      const request = response.request();
      const url = request.url();
      
      // 只記錄 API 請求
      if (url.includes('/api/') || url.includes('.json')) {
        try {
          const data = await response.json();
          console.log('[PuppeteerScraper] API Response:', url);
          requests.push({
            type: 'response',
            url,
            status: response.status(),
            data,
          });
        } catch (error) {
          // 不是 JSON 回應,忽略
        }
      }
    });
    
    // 導航到 URL
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    
    return requests;
    
  } catch (error) {
    console.error('[PuppeteerScraper] Error intercepting requests:', error);
    throw error;
  } finally {
    await page.close();
  }
}
