# PACK&GO AI 自動生成行程系統架構文檔

**版本**: 1.0  
**最後更新**: 2026-01-30  
**作者**: Manus AI

---

## 目錄

1. [系統概述](#1-系統概述)
2. [架構設計原則](#2-架構設計原則)
3. [Multi-Agent 協調架構](#3-multi-agent-協調架構)
4. [執行流程詳解](#4-執行流程詳解)
5. [Agent 詳細說明](#5-agent-詳細說明)
6. [資料流程圖](#6-資料流程圖)
7. [快取機制](#7-快取機制)
8. [進度追蹤系統](#8-進度追蹤系統)
9. [錯誤處理與容錯機制](#9-錯誤處理與容錯機制)
10. [檔案結構](#10-檔案結構)

---

## 1. 系統概述

PACK&GO AI 自動生成行程系統是一個基於 **Multi-Agent 協調架構** 的智慧行程生成平台。系統能夠從外部旅遊網站（如雄獅旅遊）自動爬取行程資訊，並透過多個專門化的 AI Agent 協同工作，生成完整、專業的旅遊行程內容。

### 1.1 核心功能

| 功能類別 | 說明 |
|---------|------|
| **網頁爬取** | 支援三階段提取策略（JSON-LD、Markdown、Vision Fallback） |
| **內容分析** | 自動識別目的地、天數、價格、行程亮點 |
| **詩意標題生成** | 使用 Claude Opus 4.5 生成吸引人的行銷標題 |
| **配色主題** | 根據目的地自動生成品牌配色方案 |
| **每日行程** | 提取並美化每日行程，包含活動、餐食、住宿 |
| **詳細資訊** | 自動生成費用說明、注意事項、飯店介紹、餐飲介紹 |

### 1.2 技術堆疊

- **後端框架**: Node.js + Express + tRPC
- **AI 模型**: Claude 3.5 Sonnet（提取）、Claude Opus 4.5（創意寫作）、Claude 3 Haiku（快速處理）
- **網頁爬取**: Firecrawl API、Puppeteer（Vision Fallback）
- **快取系統**: Upstash Redis
- **即時通訊**: Server-Sent Events (SSE)

---

## 2. 架構設計原則

系統架構遵循 **Anthropic Agent Skills** 概念，將複雜任務分解為模組化的專門技能。

### 2.1 設計原則

1. **單一職責原則 (SRP)**: 每個 Agent 只負責一項專門任務
2. **並行處理優化**: 獨立 Agent 並行執行，縮短總生成時間
3. **資料忠實度約束**: 確保生成內容與原始資料一致
4. **漸進式結果回報**: 透過 SSE 即時回報生成進度
5. **容錯與回退機制**: 關鍵 Agent 失敗時自動重試或使用 Fallback

### 2.2 Claude Hybrid Architecture

系統採用混合 Claude 模型策略，根據任務複雜度選擇最適合的模型：

| 模型 | 用途 | Agent |
|------|------|-------|
| **Claude Opus 4.5** | 複雜創意寫作、詩意標題生成 | ContentAnalyzerAgent |
| **Claude 3.5 Sonnet** | 結構化資料提取、行程美化 | WebScraperAgent, ItineraryPolishAgent |
| **Claude 3 Haiku** | 快速資料處理、細節提取 | DetailsSkill |

---

## 3. Multi-Agent 協調架構

### 3.1 Agent 總覽

系統包含以下 Agent，由 **MasterAgent** 統一協調：

```
┌─────────────────────────────────────────────────────────────────┐
│                        MasterAgent                              │
│                    (協調所有 Agent 執行)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│WebScraperAgent│     │ContentAnalyzer│     │ColorThemeAgent│
│  (網頁爬取)    │     │  (內容分析)    │     │  (配色主題)    │
└───────────────┘     └───────────────┘     └───────────────┘
        │                       │
        ▼                       ▼
┌───────────────┐     ┌───────────────┐
│ItineraryExtract│    │ItineraryPolish│
│  (行程提取)    │     │  (行程美化)    │
└───────────────┘     └───────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  DetailsSkill │     │Transportation │     │  FlightAgent  │
│ (費用/注意事項)│     │    Agent      │     │  (航班資訊)    │
│ (飯店/餐飲)   │     │  (交通方式)    │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```

### 3.2 Agent 職責表

| Agent 名稱 | 職責 | 輸入 | 輸出 |
|-----------|------|------|------|
| **MasterAgent** | 協調所有 Agent 執行、管理進度、組裝最終資料 | URL, userId, taskId | 完整行程資料 |
| **WebScraperAgent** | 從外部網站爬取行程資訊 | URL | rawData (結構化資料) |
| **ContentAnalyzerAgent** | 分析內容、生成詩意標題和亮點 | rawData | poeticTitle, highlights, description |
| **ColorThemeAgent** | 根據目的地生成配色方案 | destinationCountry, destinationCity | colorTheme |
| **ItineraryExtractAgent** | 從原始資料提取每日行程 | rawData | extractedItineraries |
| **ItineraryPolishAgent** | 美化行程措辭 | extractedItineraries | polishedItineraries |
| **DetailsSkill** | 整合費用、注意事項、飯店、餐飲提取 | rawData | costs, notices, hotels, meals |
| **TransportationAgent** | 識別並生成交通資訊 | rawData, tourType | transportationData |

---

## 4. 執行流程詳解

### 4.1 五階段執行流程

MasterAgent 採用優化的五階段執行流程，最大化並行處理效率：

```
Phase 0: 快取檢查
    ├── 檢查完整結果快取 (3 天 TTL)
    └── 若命中快取，直接返回結果

Phase 1: 網頁爬取 (Critical, Sequential)
    ├── 檢查爬取結果快取 (1 天 TTL)
    ├── WebScraperAgent.execute(url)
    │   ├── 偵測網站類型 (雄獅旅遊專屬解析器)
    │   ├── Firecrawl API 爬取
    │   ├── LLM 結構化提取
    │   └── Vision Fallback (若需要)
    └── 快取爬取結果

Phase 2: 內容分析 (Critical, Sequential)
    ├── ContentAnalyzerAgent.execute(rawData)
    │   ├── 生成詩意標題 (Claude Opus 4.5)
    │   ├── 重寫行銷描述
    │   ├── 提取行程亮點
    │   └── 計算原創性分數
    └── 更新漸進式結果

Phase 3: 配色主題 (Parallel Ready)
    ├── 檢查配色快取 (7 天 TTL)
    ├── ColorThemeAgent.execute(destination)
    └── 快取配色方案

Phase 4: 並行執行 (6 Agents in Parallel)
    ├── ItineraryExtractAgent → ItineraryPolishAgent (Sequential)
    ├── DetailsSkill (並行處理 4 個子技能)
    │   ├── extractCosts()
    │   ├── extractNotices()
    │   ├── extractHotels()
    │   └── extractMeals()
    └── TransportationAgent

Phase 5: 組裝最終資料
    ├── 合併所有 Agent 結果
    ├── 搜尋 Hero 圖片 (Unsplash API)
    ├── 快取完整結果
    └── 返回最終資料
```

### 4.2 時間優化

| 優化前 | 優化後 | 節省時間 |
|--------|--------|----------|
| 120-180 秒 | 60-90 秒 | ~40-60 秒 |

優化策略：
- Phase 3 和 Phase 4 的獨立 Agent 並行執行
- DetailsSkill 整合 4 個 Agent，內部並行處理
- 多層快取機制減少重複計算

---

## 5. Agent 詳細說明

### 5.1 WebScraperAgent

**檔案位置**: `server/agents/webScraperAgent.ts`

WebScraperAgent 負責從外部網站爬取行程資訊，採用 **三階段提取策略**：

#### 三階段提取策略

```
階段一：JSON-LD 中繼資料優先
    ├── 從 <script type="application/ld+json"> 提取
    ├── 支援 Schema.org/Product, TouristTrip, Event
    └── 提取價格、日期、基本資訊

階段二：Markdown 結構化提取
    ├── 使用 Readability + Turndown 轉換 HTML
    ├── 保留標題層級 (h2, h3, h4)
    ├── Claude 3.5 Sonnet 結構化提取
    └── 提取每日行程、活動、餐食

階段三：智慧視覺救援 (Vision Fallback)
    ├── 觸發條件：缺少價格/日期/行程
    ├── Puppeteer 截圖
    └── Vision API 識別
```

#### 雄獅旅遊專屬解析器

針對雄獅旅遊網站，系統提供專屬解析器 `LionTravelParser`：

```typescript
// server/agents/parsers/lionTravelParser.ts
export class LionTravelParser {
  static isLionTravelUrl(url: string): boolean;
  static parse(html: string, url: string): Promise<ParsedTourData>;
}
```

#### 資料結構

```typescript
interface WebScraperResult {
  success: boolean;
  data?: {
    basicInfo: { title, subtitle, description, productCode, tags };
    location: { destinationCountry, destinationCity, departureCity };
    duration: { days, nights };
    pricing: { price, currency, includes, excludes };
    highlights: string[];
    dailyItinerary: DailyItinerary[];
    accommodation: Hotel[];
    meals: Meal[];
    flights: Flight[];
  };
  method?: 'three-stage' | 'firecrawl' | 'traditional';
}
```

### 5.2 ContentAnalyzerAgent

**檔案位置**: `server/agents/contentAnalyzerAgent.ts`

ContentAnalyzerAgent 負責分析內容並生成詩意化的行銷文案，使用 **Claude Opus 4.5** 進行創意寫作。

#### 主要功能

1. **詩意標題生成**: 扮演「資深旅遊雜誌主編」，生成吸引人的標題
2. **行銷描述重寫**: 100-150 字的精彩行程亮點介紹
3. **Hero 副標題**: 簡潔有力的副標題
4. **行程亮點提取**: 3-5 個核心賣點
5. **原創性評分**: 0-100 分的原創性分數

#### 標題風格指南

```
✅ 推薦風格:
- "北海道二世谷雅奢6日" (強調奢華體驗)
- "秘境尋蹤 中島漫遊" (強調神秘探索)
- "京都禪意之旅 米其林懷石料理" (強調文化與美食)

❌ 禁用詞彙:
- 靈魂、洗滯、光影、呵喃、心靈、深度對話、完美融合
```

### 5.3 ItineraryExtractAgent

**檔案位置**: `server/agents/itineraryExtractAgent.ts`

ItineraryExtractAgent 負責從原始資料中提取每日行程，**不使用 LLM**，純資料解析。

#### 行程類型識別

```typescript
type TourType = 
  | 'MINGRI_TRAIN'  // 鳴日號火車行程
  | 'TRAIN'         // 一般火車行程
  | 'CRUISE'        // 郵輪行程
  | 'SELF_DRIVE'    // 自駕行程
  | 'FLIGHT'        // 飛機行程
  | 'GENERAL';      // 一般行程
```

#### 提取內容

```typescript
interface ExtractedItinerary {
  day: number;
  title: string;
  activities: {
    time: string;        // "07:40", "08:30-10:00"
    title: string;       // "阿里山森林遊樂區"
    description: string; // 50-150 字描述
    transportation: string;
    location: string;
  }[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  accommodation: string;
}
```

### 5.4 ItineraryPolishAgent

**檔案位置**: `server/agents/itineraryPolishAgent.ts`

ItineraryPolishAgent 負責美化行程措辭，使用 **Claude 3.5 Sonnet** 進行文案優化。

#### 忠實度檢查機制

```typescript
interface FidelityCheck {
  transportationMatch: boolean;  // 交通方式是否一致
  hotelMatch: boolean;           // 飯店名稱是否一致
  activitiesFromSource: number;  // 來自原始資料的活動數
  activitiesAdded: number;       // 新增的活動數
  overallScore: number;          // 0-100 分
  issues: string[];              // 問題列表
}
```

#### 自動修復功能

當忠實度分數低於 80 分時，系統會自動修復：
- 恢復原始交通方式
- 恢復原始飯店名稱
- 移除虛構的活動

### 5.5 DetailsSkill

**檔案位置**: `server/skills/details/detailsSkill.ts`

DetailsSkill 整合了 4 個子技能，使用 **Claude 3 Haiku** 進行快速處理：

| 子技能 | 功能 | 輸出 |
|--------|------|------|
| **CostSkill** | 費用說明提取 | included, excluded, additionalCosts |
| **NoticeSkill** | 注意事項提取 | preparation, culturalNotes, healthSafety |
| **HotelSkill** | 飯店資訊提取 | name, stars, description, facilities |
| **MealSkill** | 餐飲資訊提取 | name, type, description, cuisine |

#### 並行處理

```typescript
async executeAll(rawData: any): Promise<DetailsSkillResult> {
  const [costs, notices, hotels, meals] = await Promise.all([
    this.extractCosts(rawData),
    this.extractNotices(rawData),
    this.extractHotels(rawData),
    this.extractMeals(rawData),
  ]);
  return { success: true, data: { costs, notices, hotels, meals } };
}
```

### 5.6 ColorThemeAgent

**檔案位置**: `server/agents/colorThemeAgent.ts`

ColorThemeAgent 根據目的地生成品牌配色方案。

#### 配色結構

```typescript
interface ColorTheme {
  primary: string;        // 主色
  secondary: string;      // 輔色
  accent: string;         // 強調色
  text: string;           // 文字色
  textLight: string;      // 淺文字色
  background: string;     // 背景色
  backgroundDark: string; // 深背景色
}
```

#### 預設配色表

| 目的地 | 主色 | 設計靈感 |
|--------|------|----------|
| 北海道 | #4A90E2 (藍) | 雪景、天空 |
| 京都 | #E74C3C (紅) | 神社、楓葉 |
| 東京 | #9B59B6 (紫) | 現代、科技 |
| 阿里山 | #27AE60 (綠) | 森林、茶園 |
| 日月潭 | #3498DB (藍) | 湖水、山景 |

---

## 6. 資料流程圖

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              用戶輸入                                    │
│                         (旅遊網站 URL)                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           MasterAgent                                    │
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │ 快取檢查    │ → │ 進度追蹤    │ → │ 錯誤處理    │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌───────────┐   ┌───────────┐   ┌───────────┐
            │  Phase 1  │   │  Phase 2  │   │  Phase 3  │
            │ 網頁爬取  │ → │ 內容分析  │ → │ 配色主題  │
            └───────────┘   └───────────┘   └───────────┘
                    │               │               │
                    ▼               ▼               ▼
            ┌───────────────────────────────────────────┐
            │              rawData                      │
            │  ├── basicInfo (標題、描述)               │
            │  ├── location (目的地)                    │
            │  ├── duration (天數)                      │
            │  ├── pricing (價格)                       │
            │  ├── dailyItinerary (每日行程)            │
            │  └── highlights (亮點)                    │
            └───────────────────────────────────────────┘
                                    │
                                    ▼
            ┌───────────────────────────────────────────┐
            │              Phase 4 (並行)               │
            │                                           │
            │  ┌─────────────┐  ┌─────────────┐        │
            │  │ Itinerary   │  │ DetailsSkill│        │
            │  │ Extract     │  │ (4 子技能)  │        │
            │  │     ↓       │  │             │        │
            │  │ Itinerary   │  │ ┌─────────┐ │        │
            │  │ Polish      │  │ │ Costs   │ │        │
            │  └─────────────┘  │ │ Notices │ │        │
            │                   │ │ Hotels  │ │        │
            │  ┌─────────────┐  │ │ Meals   │ │        │
            │  │Transportation│ │ └─────────┘ │        │
            │  │ Agent       │  └─────────────┘        │
            │  └─────────────┘                         │
            └───────────────────────────────────────────┘
                                    │
                                    ▼
            ┌───────────────────────────────────────────┐
            │              Phase 5                      │
            │           組裝最終資料                     │
            │                                           │
            │  finalData = {                            │
            │    poeticTitle,                           │
            │    title,                                 │
            │    description,                           │
            │    colorTheme,                            │
            │    heroImage,                             │
            │    itineraryDetailed,                     │
            │    costExplanation,                       │
            │    noticeDetailed,                        │
            │    hotels,                                │
            │    meals,                                 │
            │    flights,                               │
            │    ...                                    │
            │  }                                        │
            └───────────────────────────────────────────┘
                                    │
                                    ▼
            ┌───────────────────────────────────────────┐
            │                 資料庫                     │
            │              (tours 表)                   │
            └───────────────────────────────────────────┘
```

---

## 7. 快取機制

系統採用多層快取策略，使用 **Upstash Redis** 作為快取後端。

### 7.1 快取層級

| 快取類型 | TTL | 說明 |
|---------|-----|------|
| **完整結果快取** | 3 天 | 整個行程的完整生成結果 |
| **爬取結果快取** | 1 天 | WebScraperAgent 的爬取結果 |
| **配色方案快取** | 7 天 | ColorThemeAgent 的配色結果 |

### 7.2 快取 API

```typescript
// server/cache/generation-cache.ts
class GenerationCache {
  async getFullResult(url: string): Promise<any | null>;
  async cacheFullResult(url: string, data: any): Promise<void>;
  
  async getScrapeResult(url: string): Promise<any | null>;
  async cacheScrapeResult(url: string, data: any): Promise<void>;
  
  async getColorPalette(destination: string): Promise<any | null>;
  async cacheColorPalette(destination: string, data: any): Promise<void>;
}
```

### 7.3 強制重新生成

用戶可以勾選「強制重新生成（忽略快取）」選項，跳過所有快取直接重新生成。

---

## 8. 進度追蹤系統

### 8.1 進度追蹤器

**檔案位置**: `server/agents/progressTracker.ts`

進度追蹤器使用 **Server-Sent Events (SSE)** 即時回報生成進度給前端。

### 8.2 階段定義

```typescript
const DEFAULT_PHASES = [
  { id: 'web_scraper', name: '網頁爬取', weight: 15 },
  { id: 'content_analyzer', name: '內容分析', weight: 10 },
  { id: 'color_theme', name: '配色主題', weight: 5 },
  { id: 'image_prompt', name: '圖片提示', weight: 5 },
  { id: 'image_generation', name: '圖片生成', weight: 15 },
  { id: 'itinerary', name: '行程規劃', weight: 20 },
  { id: 'cost_agent', name: '費用說明', weight: 5 },
  { id: 'notice_agent', name: '注意事項', weight: 5 },
  { id: 'hotel_agent', name: '住宿資訊', weight: 5 },
  { id: 'meal_agent', name: '餐飲資訊', weight: 5 },
  { id: 'flight_agent', name: '航班資訊', weight: 5 },
  { id: 'finalize', name: '完成組裝', weight: 5 },
];
```

### 8.3 漸進式結果

系統支援漸進式結果回報，讓用戶在生成過程中就能看到部分結果：

```typescript
interface PartialResults {
  title?: string;
  poeticTitle?: string;
  destination?: string;
  colorTheme?: any;
  heroImage?: string;
  highlights?: string[];
  itinerary?: any[];
}
```

---

## 9. 錯誤處理與容錯機制

### 9.1 重試機制

**檔案位置**: `server/agents/agentOrchestration.ts`

```typescript
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};
```

### 9.2 Fallback 配置

| Agent | Fallback 策略 |
|-------|--------------|
| WebScraperAgent | Firecrawl → Puppeteer Vision |
| ContentAnalyzerAgent | 使用原始標題和描述 |
| ColorThemeAgent | 使用預設配色方案 |
| DetailsSkill | 返回空陣列 |
| TransportationAgent | 返回空物件 |

### 9.3 Agent 監控

```typescript
class AgentMonitor {
  startAgent(name: string): void;
  completeAgent(name: string, result: any): void;
  failAgent(name: string, error: Error): void;
  generateReport(): string;
}
```

---

## 10. 檔案結構

```
server/
├── agents/
│   ├── masterAgent.ts              # 主協調 Agent
│   ├── webScraperAgent.ts          # 網頁爬取 Agent
│   ├── contentAnalyzerAgent.ts     # 內容分析 Agent
│   ├── colorThemeAgent.ts          # 配色主題 Agent
│   ├── itineraryExtractAgent.ts    # 行程提取 Agent
│   ├── itineraryPolishAgent.ts     # 行程美化 Agent
│   ├── transportationAgent.ts      # 交通資訊 Agent
│   ├── flightAgent.ts              # 航班資訊 Agent
│   ├── claudeAgent.ts              # Claude API 封裝
│   ├── firecrawlAgent.ts           # Firecrawl API 封裝
│   ├── puppeteerVisionAgent.ts     # Puppeteer Vision 救援
│   ├── agentOrchestration.ts       # 重試/監控/Fallback
│   ├── progressTracker.ts          # 進度追蹤器
│   ├── skillLoader.ts              # SKILL.md 載入器
│   └── parsers/
│       └── lionTravelParser.ts     # 雄獅旅遊專屬解析器
│
├── skills/
│   └── details/
│       └── detailsSkill.ts         # 整合 4 個子技能
│
├── cache/
│   └── generation-cache.ts         # Redis 快取管理
│
├── routers.ts                      # tRPC 路由定義
└── db.ts                           # 資料庫操作

client/
├── src/
│   └── pages/
│       └── admin/
│           └── TourManagement.tsx  # 行程管理頁面
```

---

## 附錄 A: API 端點

### 生成行程

```typescript
// tRPC Mutation
tours.generateFromUrl.useMutation({
  url: string;
  forceRegenerate?: boolean;
})
```

### 進度追蹤

```typescript
// SSE Endpoint
GET /api/generation-progress/:taskId
```

---

## 附錄 B: 環境變數

| 變數名稱 | 說明 |
|---------|------|
| `FIRECRAWL_API_KEY` | Firecrawl API 金鑰 |
| `ANTHROPIC_API_KEY` | Claude API 金鑰 |
| `UPSTASH_REDIS_URL` | Redis 連線字串 |
| `UNSPLASH_ACCESS_KEY` | Unsplash API 金鑰 |

---

**文檔結束**
