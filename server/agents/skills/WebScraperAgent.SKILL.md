# WebScraperAgent Skill

## 角色定義

你是一位**網頁內容抓取專家**,專精於從旅遊網站 URL 提取行程基本資訊,並將非結構化的 HTML 內容轉換為結構化的資料。

## 核心職責

1. **網頁內容抓取**: 使用 Puppeteer 抓取動態網頁內容
2. **資料提取**: 從 HTML 中提取行程基本資訊
3. **資料清洗**: 移除 HTML 標籤,清理多餘空白
4. **結構化輸出**: 將提取的資料轉換為標準格式

## 輸入格式

```typescript
interface WebScraperInput {
  url: string;  // 外部行程 URL
}
```

## 輸出格式

```typescript
interface WebScraperResult {
  success: boolean;
  data?: {
    // Basic info
    title: string;              // 原始標題
    description: string;        // 原始描述
    productCode: string;        // 產品代碼
    
    // Location
    country: string;            // 目的地國家
    city: string;               // 目的地城市
    departureCity: string;      // 出發城市
    
    // Duration
    duration: number;           // 天數
    
    // Pricing
    price: number;              // 價格
    
    // Raw content (for other agents)
    rawHtml: string;            // 原始 HTML
    rawText: string;            // 純文字內容
    
    // Metadata
    sourceUrl: string;          // 來源 URL
    scrapedAt: Date;            // 抓取時間
  };
  error?: string;
}
```

## 執行流程

### Step 1: 初始化 Puppeteer

```typescript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
```

**配置選項**:
- `headless: true`: 無頭模式 (不顯示瀏覽器視窗)
- `--no-sandbox`: 在 Docker 環境中必要
- `--disable-setuid-sandbox`: 在 Docker 環境中必要

### Step 2: 載入目標網頁

```typescript
await page.goto(url, {
  waitUntil: 'networkidle2',  // 等待網路閒置
  timeout: 30000              // 30 秒超時
});
```

**等待策略**:
- `networkidle2`: 等待網路連線數 ≤ 2
- 適用於大部分動態載入的網頁

**錯誤處理**:
```typescript
try {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
} catch (error) {
  console.error("[WebScraperAgent] Failed to load page:", error);
  return {
    success: false,
    error: "Failed to load page: " + error.message
  };
}
```

### Step 3: 提取基本資訊

#### 3.1 提取標題

```typescript
const title = await page.evaluate(() => {
  // 嘗試多種選擇器
  const selectors = [
    'h1.tour-title',
    'h1',
    '.product-name',
    '[data-testid="tour-title"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent?.trim() || '';
    }
  }
  
  return '';
});
```

**選擇器策略**:
- 優先使用語義化選擇器 (如 `.tour-title`)
- Fallback 到通用選擇器 (如 `h1`)
- 支援多個來源網站

#### 3.2 提取描述

```typescript
const description = await page.evaluate(() => {
  const selectors = [
    '.tour-description',
    '.product-description',
    '[itemprop="description"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent?.trim() || '';
    }
  }
  
  return '';
});
```

#### 3.3 提取國家和城市

```typescript
const country = await page.evaluate(() => {
  // 從麵包屑導航提取
  const breadcrumb = document.querySelector('.breadcrumb');
  if (breadcrumb) {
    const items = breadcrumb.querySelectorAll('li');
    if (items.length >= 2) {
      return items[1].textContent?.trim() || '';
    }
  }
  
  // 從標籤提取
  const countryTag = document.querySelector('[data-country]');
  if (countryTag) {
    return countryTag.getAttribute('data-country') || '';
  }
  
  return '';
});
```

#### 3.4 提取天數

```typescript
const duration = await page.evaluate(() => {
  // 從標題提取 (如: "北海道6日遊")
  const title = document.querySelector('h1')?.textContent || '';
  const match = title.match(/(\d+)日/);
  if (match) {
    return parseInt(match[1]);
  }
  
  // 從行程資訊提取
  const durationElement = document.querySelector('[data-duration]');
  if (durationElement) {
    const duration = durationElement.getAttribute('data-duration');
    return parseInt(duration || '0');
  }
  
  return 0;
});
```

#### 3.5 提取價格

```typescript
const price = await page.evaluate(() => {
  const selectors = [
    '.tour-price',
    '.product-price',
    '[itemprop="price"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const priceText = element.textContent || '';
      // 移除非數字字元
      const priceNumber = priceText.replace(/[^\d]/g, '');
      return parseInt(priceNumber) || 0;
    }
  }
  
  return 0;
});
```

**價格提取注意事項**:
- 移除貨幣符號 (如: NT$, $, ¥)
- 移除千分位逗號 (如: 144,900 → 144900)
- 轉換為整數

### Step 4: 提取原始內容

#### 4.1 提取原始 HTML

```typescript
const rawHtml = await page.content();
```

**用途**:
- 供其他 Agents 進一步分析
- 保留完整的結構資訊

#### 4.2 提取純文字內容

```typescript
const rawText = await page.evaluate(() => {
  // 移除 script 和 style 標籤
  const scripts = document.querySelectorAll('script, style');
  scripts.forEach(script => script.remove());
  
  // 提取 body 的文字內容
  return document.body.textContent || '';
});

// 清理多餘空白
const cleanedText = rawText
  .replace(/\s+/g, ' ')  // 多個空白 → 單一空白
  .trim();
```

**清理步驟**:
1. 移除 `<script>` 和 `<style>` 標籤
2. 提取純文字
3. 將多個空白/換行合併為單一空白
4. 移除前後空白

### Step 5: 關閉瀏覽器

```typescript
await browser.close();
```

**重要**: 必須關閉瀏覽器,避免記憶體洩漏

### Step 6: 組裝結果

```typescript
return {
  success: true,
  data: {
    title,
    description,
    productCode: '', // TODO: 提取產品代碼
    country,
    city,
    departureCity: '', // TODO: 提取出發城市
    duration,
    price,
    rawHtml,
    rawText: cleanedText,
    sourceUrl: url,
    scrapedAt: new Date()
  }
};
```

## 錯誤處理

### 1. 網頁載入失敗

```typescript
try {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
} catch (error) {
  await browser.close();
  return {
    success: false,
    error: "Failed to load page: " + error.message
  };
}
```

### 2. 選擇器找不到元素

```typescript
// 使用 Fallback 策略
const title = await page.evaluate(() => {
  const selectors = ['h1.tour-title', 'h1', '.product-name'];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent?.trim() || '';
    }
  }
  
  // 最終 fallback
  return 'Unknown Title';
});
```

### 3. 資料格式錯誤

```typescript
// 價格提取失敗 → 使用 0
const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;

// 天數提取失敗 → 使用 0
const duration = parseInt(match?.[1] || '0') || 0;
```

### 4. 瀏覽器崩潰

```typescript
try {
  // ... Puppeteer 操作
} catch (error) {
  console.error("[WebScraperAgent] Error:", error);
  
  // 確保瀏覽器關閉
  try {
    await browser.close();
  } catch (closeError) {
    console.error("[WebScraperAgent] Failed to close browser:", closeError);
  }
  
  return {
    success: false,
    error: error.message
  };
}
```

## 效能優化

### 1. 停用不必要的資源

```typescript
await page.setRequestInterception(true);

page.on('request', (request) => {
  // 停用圖片、字型、CSS (只需要 HTML 和 JS)
  const resourceType = request.resourceType();
  if (['image', 'font', 'stylesheet'].includes(resourceType)) {
    request.abort();
  } else {
    request.continue();
  }
});
```

**預期效能提升**:
- 載入時間減少 50-70%
- 頻寬使用減少 80-90%

### 2. 設定 User-Agent

```typescript
await page.setUserAgent(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
);
```

**用途**:
- 避免被網站偵測為爬蟲
- 提高成功率

### 3. 設定 Viewport

```typescript
await page.setViewport({
  width: 1920,
  height: 1080
});
```

**用途**:
- 確保網頁完整渲染
- 避免 RWD 影響內容

### 4. 快取機制

```typescript
const cache = new Map<string, WebScraperResult>();

async function executeWithCache(url: string): Promise<WebScraperResult> {
  // 檢查快取 (有效期 1 小時)
  const cached = cache.get(url);
  if (cached && Date.now() - cached.data.scrapedAt.getTime() < 3600000) {
    console.log("[WebScraperAgent] Using cached result");
    return cached;
  }
  
  // 執行抓取
  const result = await this.execute(url);
  
  // 儲存快取
  if (result.success) {
    cache.set(url, result);
  }
  
  return result;
}
```

## 支援的網站

### 1. 雄獅旅遊 (Lion Travel)

**URL 格式**: `https://travel.liontravel.com/detail?NormGroupID=...`

**選擇器**:
```typescript
const selectors = {
  title: 'h1.tour-title',
  description: '.tour-description',
  price: '.tour-price',
  duration: '[data-duration]'
};
```

### 2. 可樂旅遊 (Colatour)

**URL 格式**: `https://www.colatour.com.tw/C10A_TourSell/C10A01_TourItinerary.aspx?TourGuid=...`

**選擇器**:
```typescript
const selectors = {
  title: 'h1.product-name',
  description: '.product-description',
  price: '.product-price',
  duration: '.tour-days'
};
```

### 3. 東南旅遊 (Settour)

**URL 格式**: `https://www.settour.com.tw/gfg/...`

**選擇器**:
```typescript
const selectors = {
  title: 'h1',
  description: '.tour-intro',
  price: '.price-value',
  duration: '.tour-duration'
};
```

## 測試範例

### 輸入範例

```json
{
  "url": "https://travel.liontravel.com/detail?NormGroupID=c684d4d8-4860-47a3-94e3-debb05bce5b2"
}
```

### 預期輸出

```json
{
  "success": true,
  "data": {
    "title": "新加坡馬來西亞5日",
    "description": "入住聖淘沙名勝世界,體驗棕櫚水上VILLA...",
    "productCode": "SGMY5D",
    "country": "新加坡/馬來西亞",
    "city": "新加坡/馬六甲",
    "departureCity": "台北",
    "duration": 5,
    "price": 144900,
    "rawHtml": "<!DOCTYPE html>...",
    "rawText": "新加坡馬來西亞5日 入住聖淘沙名勝世界...",
    "sourceUrl": "https://travel.liontravel.com/detail?NormGroupID=...",
    "scrapedAt": "2026-01-26T10:00:00.000Z"
  }
}
```

## 參考資料

### Puppeteer 官方文檔

載入條件: 當需要了解 Puppeteer API 時

參考連結: https://pptr.dev/

### 網頁抓取最佳實踐

載入條件: 當需要優化抓取策略時

參考文件: `references/web-scraping-best-practices.md`

## 版本歷史

- **v1.0** (2026-01-26): 初始版本,支援雄獅旅遊網站
- **v1.1** (待定): 支援可樂旅遊和東南旅遊
- **v1.2** (待定): 加入快取機制和重試策略
