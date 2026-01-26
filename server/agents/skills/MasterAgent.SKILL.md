# MasterAgent Skill

## 角色定義

你是一位**總協調者**,負責編排和協調 PACK&GO 旅遊網站的 12 個專門 Agents,確保它們按照正確的順序執行,並將所有結果組裝成完整的行程資料。

## 核心職責

1. **Agent 編排**: 決定 Agents 的執行順序和依賴關係
2. **資料流轉**: 將上游 Agent 的輸出傳遞給下游 Agent
3. **結果組裝**: 將所有 Agents 的輸出組裝成最終的行程資料
4. **錯誤處理**: 處理 Agent 執行失敗的情況
5. **進度追蹤**: 回報執行進度給使用者

## Agent 執行順序

### Phase 1: 資料抓取與基礎分析 (必要)

```
1. WebScraperAgent (網頁內容抓取)
   ↓
2. ContentAnalyzerAgent (內容分析與詩意化)
   ↓ (並行)
3a. ColorThemeAgent (色彩主題生成)
3b. ImagePromptAgent (圖片提示詞生成)
```

**依賴關係**:
- ContentAnalyzerAgent 依賴 WebScraperAgent 的輸出
- ColorThemeAgent 和 ImagePromptAgent 可以並行執行,都依賴 ContentAnalyzerAgent

### Phase 2: 視覺內容生成 (必要)

```
4. ImageGenerationAgent (圖片生成與搜尋)
   - 輸入: ImagePromptAgent 的 prompts
   - 輸出: heroImage + featureImages (3-6張)
```

**依賴關係**:
- 依賴 ImagePromptAgent 的輸出

### Phase 3: 詳細資訊提取 (必要)

```
5. ItineraryAgent (每日行程結構化)
   ↓ (並行)
6a. CostAgent (費用說明提取)
6b. NoticeAgent (注意事項提取)
6c. HotelAgent (住宿資訊提取)
6d. MealAgent (餐食資訊提取)
6e. FlightAgent (航班資訊提取)
```

**依賴關係**:
- ItineraryAgent 依賴 WebScraperAgent 的原始資料
- 其他 5 個 Agents 可以並行執行,都依賴 WebScraperAgent

### Phase 4: 最終組裝 (必要)

```
7. MasterAgent (組裝所有結果)
   - 將所有 Agents 的輸出組裝成最終資料
   - 轉換資料格式 (物件 → JSON 字串)
   - 驗證資料完整性
```

## 輸入格式

```typescript
interface MasterAgentInput {
  url: string;              // 外部行程 URL
  mode: 'quick' | 'complete'; // 生成模式
}
```

## 輸出格式

```typescript
interface MasterAgentResult {
  success: boolean;
  data?: {
    // Basic info
    poeticTitle: string;        // 詩意化標題
    title: string;              // 行銷標題
    description: string;        // 行銷描述
    productCode: string;        // 產品代碼
    tags: string[];             // 標籤
    
    // Location
    destinationCountry: string; // 目的地國家
    destinationCity: string;    // 目的地城市
    departureCity: string;      // 出發城市
    
    // Duration
    days: number;               // 天數
    nights: number;             // 夜數
    
    // Pricing
    price: number;              // 價格
    
    // Hero section
    heroImage: string;          // Hero 圖片 URL
    heroImageAlt: string;       // Hero 圖片 alt
    heroSubtitle: string;       // Hero 副標題
    
    // Color theme
    colorTheme: any;            // 色彩主題
    
    // Highlights (字串陣列,已轉為 JSON 字串)
    highlights: string;         // JSON.stringify(string[])
    
    // Feature Images (字串陣列,已轉為 JSON 字串)
    featureImages: string;      // JSON.stringify(string[])
    
    // Key features
    keyFeatures: string;        // JSON string
    
    // Poetic content
    poeticContent: string;      // JSON string
    
    // Detailed Itinerary
    itineraryDetailed: string;  // JSON string
    
    // Cost Explanation
    costExplanation: string;    // JSON string
    
    // Detailed Notice
    noticeDetailed: string;     // JSON string
    
    // Hotels
    hotels: string;             // JSON string
    
    // Meals
    meals: string;              // JSON string
    
    // Flights
    flights: string;            // JSON string
    
    // Metadata
    originalityScore: number;   // 原創性分數
    sourceUrl: string;          // 來源 URL
  };
  error?: string;
  progress?: {
    current: number;            // 當前步驟
    total: number;              // 總步驟數
    message: string;            // 進度訊息
  };
}
```

## 執行流程

### Step 1: 初始化

```typescript
console.log("[MasterAgent] Starting complete generation...");
console.log("[MasterAgent] Source URL:", url);

const progress = {
  current: 0,
  total: 12,
  message: "初始化..."
};
```

### Step 2: Phase 1 - 資料抓取與基礎分析

#### 2.1 執行 WebScraperAgent

```typescript
progress.current = 1;
progress.message = "抓取網頁內容...";

const webScraperAgent = new WebScraperAgent();
const scrapedData = await webScraperAgent.execute(url);

if (!scrapedData.success) {
  throw new Error("WebScraperAgent failed: " + scrapedData.error);
}

console.log("[MasterAgent] WebScraperAgent completed");
```

**錯誤處理**:
- 如果 WebScraperAgent 失敗,整個流程終止
- 回傳錯誤訊息給使用者

#### 2.2 執行 ContentAnalyzerAgent

```typescript
progress.current = 2;
progress.message = "分析內容並生成詩意化標題...";

const contentAnalyzerAgent = new ContentAnalyzerAgent();
const analyzedContent = await contentAnalyzerAgent.execute(scrapedData.data);

if (!analyzedContent.success) {
  throw new Error("ContentAnalyzerAgent failed: " + analyzedContent.error);
}

console.log("[MasterAgent] ContentAnalyzerAgent completed");
console.log("[MasterAgent] Poetic title:", analyzedContent.data.poeticTitle);
```

**關鍵資料**:
- `poeticTitle`: 詩意化標題
- `highlights`: 行程亮點 (字串陣列)
- `title`: 行銷標題
- `description`: 行銷描述

#### 2.3 並行執行 ColorThemeAgent 和 ImagePromptAgent

```typescript
progress.current = 3;
progress.message = "生成色彩主題和圖片提示詞...";

const [colorThemeResult, imagePromptResult] = await Promise.all([
  new ColorThemeAgent().execute({
    country: scrapedData.data.country,
    city: scrapedData.data.city,
    title: analyzedContent.data.poeticTitle
  }),
  new ImagePromptAgent().execute({
    title: analyzedContent.data.poeticTitle,
    description: analyzedContent.data.description,
    country: scrapedData.data.country,
    city: scrapedData.data.city
  })
]);

console.log("[MasterAgent] ColorThemeAgent and ImagePromptAgent completed");
```

**並行執行優勢**:
- 節省時間 (約 5-10 秒)
- 兩個 Agents 互不依賴

### Step 3: Phase 2 - 視覺內容生成

#### 3.1 執行 ImageGenerationAgent

```typescript
progress.current = 4;
progress.message = "生成圖片...";

const imageGenerationAgent = new ImageGenerationAgent();
const imageResult = await imageGenerationAgent.execute({
  prompts: imagePromptResult.data.prompts,
  country: scrapedData.data.country,
  city: scrapedData.data.city
});

if (!imageResult.success) {
  throw new Error("ImageGenerationAgent failed: " + imageResult.error);
}

console.log("[MasterAgent] ImageGenerationAgent completed");
console.log("[MasterAgent] Generated images:", imageResult.data.images.length);
```

**關鍵資料**:
- `images`: 圖片陣列 (包含 URL 和 alt)
- 第一張作為 heroImage
- 其餘作為 featureImages

**資料轉換**:
```typescript
// 將 ImageGenerationResult[] 轉換為字串陣列
const featureImages: string[] = imageResult.data.images
  .slice(1, 7) // 取 2-7 張作為 feature images
  .map(img => img.url);

// 儲存為 JSON 字串
const featureImagesJson = JSON.stringify(featureImages);
```

### Step 4: Phase 3 - 詳細資訊提取

#### 4.1 執行 ItineraryAgent

```typescript
progress.current = 5;
progress.message = "提取每日行程...";

const itineraryAgent = new ItineraryAgent();
const itineraryResult = await itineraryAgent.execute(scrapedData.data);

console.log("[MasterAgent] ItineraryAgent completed");
```

#### 4.2 並行執行其他 5 個 Agents

```typescript
progress.current = 6;
progress.message = "提取費用、注意事項、住宿、餐食、航班資訊...";

const [
  costResult,
  noticeResult,
  hotelResult,
  mealResult,
  flightResult
] = await Promise.all([
  new CostAgent().execute(scrapedData.data),
  new NoticeAgent().execute(scrapedData.data),
  new HotelAgent().execute(scrapedData.data),
  new MealAgent().execute(scrapedData.data),
  new FlightAgent().execute(scrapedData.data)
]);

console.log("[MasterAgent] All detail agents completed");
```

**並行執行優勢**:
- 節省時間 (約 10-20 秒)
- 5 個 Agents 互不依賴

**錯誤處理**:
- 如果某個 Agent 失敗,不影響其他 Agents
- 使用空資料作為 fallback

```typescript
const costData = costResult.success ? costResult.data : null;
const noticeData = noticeResult.success ? noticeResult.data : null;
// ... 其他 Agents 同理
```

### Step 5: Phase 4 - 最終組裝

#### 5.1 組裝基本資訊

```typescript
const finalData = {
  // 使用 ContentAnalyzerAgent 的詩意化標題
  poeticTitle: analyzedContent.data.poeticTitle,
  title: analyzedContent.data.title,
  description: analyzedContent.data.description,
  
  // 使用 WebScraperAgent 的基本資訊
  productCode: scrapedData.data.productCode || "",
  tags: scrapedData.data.tags || [],
  destinationCountry: scrapedData.data.country || "",
  destinationCity: scrapedData.data.city || "",
  departureCity: scrapedData.data.departureCity || "",
  days: scrapedData.data.duration || 0,
  nights: (scrapedData.data.duration || 0) - 1,
  price: scrapedData.data.price || 0,
  
  // Hero section
  heroImage: imageResult.data.images[0]?.url || "",
  heroImageAlt: imageResult.data.images[0]?.alt || "",
  heroSubtitle: analyzedContent.data.heroSubtitle,
  
  // Color theme
  colorTheme: colorThemeResult.data,
  
  // Metadata
  originalityScore: analyzedContent.data.originalityScore,
  sourceUrl: url
};
```

#### 5.2 轉換陣列為 JSON 字串

**關鍵**: highlights 和 featureImages 必須是字串陣列,然後轉為 JSON 字串儲存

```typescript
// highlights: 確保是字串陣列
const highlights: string[] = Array.isArray(analyzedContent.data.highlights)
  ? analyzedContent.data.highlights
  : [];

// featureImages: 從 ImageGenerationAgent 的輸出提取 URL
const featureImages: string[] = imageResult.data.images
  .slice(1, 7) // 取 2-7 張
  .map(img => img.url);

// 轉為 JSON 字串儲存
finalData.highlights = JSON.stringify(highlights);
finalData.featureImages = JSON.stringify(featureImages);
```

**為什麼要轉為 JSON 字串?**
- 資料庫欄位是 TEXT 類型
- 前端會用 `JSON.parse()` 解析

#### 5.3 轉換其他物件為 JSON 字串

```typescript
finalData.keyFeatures = JSON.stringify(analyzedContent.data.keyFeatures || []);
finalData.poeticContent = JSON.stringify(analyzedContent.data.poeticContent || {});
finalData.itineraryDetailed = JSON.stringify(itineraryResult.data || []);
finalData.costExplanation = JSON.stringify(costData || {});
finalData.noticeDetailed = JSON.stringify(noticeData || {});
finalData.hotels = JSON.stringify(hotelResult.data || []);
finalData.meals = JSON.stringify(mealResult.data || []);
finalData.flights = JSON.stringify(flightResult.data || {});
```

### Step 6: 驗證資料完整性

```typescript
// 驗證必要欄位
const requiredFields = [
  'poeticTitle',
  'title',
  'description',
  'destinationCountry',
  'heroImage'
];

for (const field of requiredFields) {
  if (!finalData[field]) {
    console.warn(`[MasterAgent] Missing required field: ${field}`);
  }
}

// 驗證 JSON 字串格式
try {
  JSON.parse(finalData.highlights);
  JSON.parse(finalData.featureImages);
} catch (error) {
  console.error("[MasterAgent] Invalid JSON format:", error);
  throw new Error("Data validation failed");
}
```

### Step 7: 回傳結果

```typescript
progress.current = 12;
progress.message = "完成!";

console.log("[MasterAgent] Complete generation finished");
console.log("[MasterAgent] Total time:", Date.now() - startTime, "ms");

return {
  success: true,
  data: finalData,
  progress
};
```

## 錯誤處理策略

### 1. 必要 Agents 失敗 → 終止流程

```typescript
const criticalAgents = [
  'WebScraperAgent',
  'ContentAnalyzerAgent',
  'ImageGenerationAgent'
];

// 如果這些 Agents 失敗,直接終止
if (!result.success) {
  return {
    success: false,
    error: `${agentName} failed: ${result.error}`,
    progress
  };
}
```

### 2. 非必要 Agents 失敗 → 使用 Fallback

```typescript
const optionalAgents = [
  'CostAgent',
  'NoticeAgent',
  'HotelAgent',
  'MealAgent',
  'FlightAgent'
];

// 如果這些 Agents 失敗,使用空資料
const costData = costResult.success ? costResult.data : {
  included: [],
  excluded: [],
  notes: []
};
```

### 3. 部分資料缺失 → 警告但繼續

```typescript
if (!scrapedData.data.price) {
  console.warn("[MasterAgent] Price not found, using 0 as default");
  finalData.price = 0;
}
```

### 4. JSON 解析失敗 → 使用空陣列/物件

```typescript
try {
  const highlights = JSON.parse(finalData.highlights);
} catch (error) {
  console.error("[MasterAgent] Failed to parse highlights, using empty array");
  finalData.highlights = JSON.stringify([]);
}
```

## 效能優化

### 1. 並行執行

將互不依賴的 Agents 並行執行:

```typescript
// Phase 1: 並行執行 ColorThemeAgent 和 ImagePromptAgent
const [colorTheme, imagePrompt] = await Promise.all([
  colorThemeAgent.execute(...),
  imagePromptAgent.execute(...)
]);

// Phase 3: 並行執行 5 個細節 Agents
const [cost, notice, hotel, meal, flight] = await Promise.all([
  costAgent.execute(...),
  noticeAgent.execute(...),
  hotelAgent.execute(...),
  mealAgent.execute(...),
  flightAgent.execute(...)
]);
```

**預期效能提升**:
- 原本: 約 90-120 秒
- 優化後: 約 60-90 秒

### 2. 快取機制

對於相同的 URL,可以快取結果:

```typescript
const cache = new Map<string, MasterAgentResult>();

async function executeWithCache(url: string): Promise<MasterAgentResult> {
  if (cache.has(url)) {
    console.log("[MasterAgent] Using cached result");
    return cache.get(url)!;
  }
  
  const result = await this.execute(url);
  cache.set(url, result);
  return result;
}
```

### 3. 進度回報

定期回報進度給使用者:

```typescript
// 使用 callback 回報進度
interface ProgressCallback {
  (progress: { current: number; total: number; message: string }): void;
}

async function execute(
  url: string,
  onProgress?: ProgressCallback
): Promise<MasterAgentResult> {
  // ...
  onProgress?.({ current: 1, total: 12, message: "抓取網頁內容..." });
  // ...
}
```

## 測試範例

### 輸入範例

```json
{
  "url": "https://travel.liontravel.com/detail?NormGroupID=c684d4d8-4860-47a3-94e3-debb05bce5b2",
  "mode": "complete"
}
```

### 預期輸出

```json
{
  "success": true,
  "data": {
    "poeticTitle": "新馬五日**奢華微醺**：棕櫚水上VILLA私享，探尋馬六甲古城遺韻",
    "title": "新加坡馬來西亞奢華度假 5 日",
    "description": "入住新加坡聖淘沙名勝世界,體驗棕櫚水上VILLA私人泳池。探訪馬六甲世界文化遺產,品嚐道地娘惹料理。漫步濱海灣花園,欣賞超級樹燈光秀。這是一趟結合奢華住宿、文化探索與美食饗宴的完美旅程。",
    "productCode": "SGMY5D",
    "tags": ["新加坡", "馬來西亞", "奢華", "度假"],
    "destinationCountry": "新加坡/馬來西亞",
    "destinationCity": "新加坡/馬六甲",
    "departureCity": "台北",
    "days": 5,
    "nights": 4,
    "price": 144900,
    "heroImage": "https://example.com/hero.jpg",
    "heroImageAlt": "新加坡聖淘沙海灘度假村",
    "heroSubtitle": "探索獅城魅力,享受水上VILLA奢華體驗",
    "colorTheme": {
      "primary": "#C19A6B",
      "secondary": "#8B4513",
      "accent": "#FFD700"
    },
    "highlights": "[\"入住聖淘沙名勝世界海景套房\",\"體驗棕櫚水上VILLA私人泳池\",\"探訪馬六甲世界文化遺產\",\"品嚐道地娘惹料理\",\"漫步濱海灣花園超級樹\",\"專業中文導遊全程陪同\"]",
    "featureImages": "[\"https://example.com/feature1.jpg\",\"https://example.com/feature2.jpg\",\"https://example.com/feature3.jpg\"]",
    "originalityScore": 92,
    "sourceUrl": "https://travel.liontravel.com/detail?NormGroupID=..."
  },
  "progress": {
    "current": 12,
    "total": 12,
    "message": "完成!"
  }
}
```

## 參考資料

### Agent 協調模式

載入條件: 當需要了解多代理系統協調模式時

參考文件: `references/multi-agent-coordination.md`

## 版本歷史

- **v1.0** (2026-01-26): 初始版本,定義 12 個 Agents 的執行順序和資料流轉
- **v1.1** (待定): 加入快取機制
- **v1.2** (待定): 加入進度回報 callback
