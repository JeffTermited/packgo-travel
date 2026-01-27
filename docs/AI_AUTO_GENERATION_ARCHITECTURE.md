# AI 自動生成行程功能 - 完整架構文檔

## 概述

AI 自動生成行程功能是 PACK&GO 旅行社的核心功能之一，能夠從旅行社網站（如雄獅旅遊、可樂旅遊等）自動提取行程資訊，並使用 AI 生成完整的行程內容。

## 系統架構圖

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              前端 (ToursTab.tsx)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  URL 輸入   │→│  開始生成   │→│  進度追蹤   │→│  預覽對話框        │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  │  - 確認儲存        │ │
│                                                      │  - 重新生成        │ │
│                                                      │  - 取消            │ │
│                                                      └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           後端 API (routers.ts)                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  tours.autoGenerateComplete                                          │   │
│  │  - 接收 URL 和 previewOnly 參數                                      │   │
│  │  - 調用 MasterAgent.execute()                                        │   │
│  │  - 返回生成結果或儲存到資料庫                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  tours.saveFromPreview                                               │   │
│  │  - 接收預覽資料                                                      │   │
│  │  - 儲存到資料庫                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MasterAgent (masterAgent.ts)                        │
│                              協調所有 Agent 的執行                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    Phase 1      │         │    Phase 2      │         │    Phase 3      │
│   Web Scraping  │    →    │ Content Analysis│    →    │  ColorTheme +   │
│   (串行執行)    │         │   (串行執行)    │         │  ImagePrompt    │
│                 │         │                 │         │   (並行執行)    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                                                  │
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Phase 4: MEGA PARALLEL                          │
│                              (7 個 Agent 並行執行)                           │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐   │
│  │ImageGeneration│ │  Itinerary    │ │    Cost       │ │   Notice      │   │
│  │    Agent      │ │    Agent      │ │    Agent      │ │    Agent      │   │
│  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘   │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                     │
│  │    Hotel      │ │    Meal       │ │   Flight      │                     │
│  │    Agent      │ │    Agent      │ │    Agent      │                     │
│  └───────────────┘ └───────────────┘ └───────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Phase 5: 組裝最終資料                           │
│                              返回完整的行程資訊                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Agent 詳細說明

### 1. WebScraperAgent (webScraperAgent.ts)
**功能**：從旅行社網站提取原始行程資料

**執行流程**：
1. 使用 PuppeteerVisionAgent 截取網頁截圖
2. 使用 PrintFriendlyAgent 提取網頁文字內容
3. 使用 LLM 分析截圖和文字，提取結構化資料

**輸出資料結構**：
```typescript
{
  basicInfo: {
    title: string;           // 行程標題
    productCode: string;     // 產品代碼
    promotionalText: string; // 促銷文字
    tags: string[];          // 標籤
  };
  location: {
    departureCountry: string;    // 出發國家
    departureCity: string;       // 出發城市
    departureAirport: string;    // 出發機場
    destinationCountry: string;  // 目的地國家
    destinationCity: string;     // 目的地城市
    destinationAirport: string;  // 目的地機場
  };
  duration: {
    days: number;    // 天數
    nights: number;  // 夜數
  };
  pricing: {
    price: number;       // 價格
    currency: string;    // 貨幣
    priceNote: string;   // 價格說明
  };
  itinerary: {
    day: number;
    title: string;
    description: string;
    meals: { breakfast: string; lunch: string; dinner: string; };
    accommodation: string;
  }[];
  inclusions: string[];      // 費用包含
  exclusions: string[];      // 費用不包含
  notices: string[];         // 注意事項
  flights: { ... }[];        // 航班資訊
  hotels: { ... }[];         // 飯店資訊
}
```

### 2. ContentAnalyzerAgent (contentAnalyzerAgent.ts)
**功能**：分析原始資料，生成詩意化內容和亮點

**輸出**：
- `title`: 詩意化標題
- `description`: 行程描述
- `heroSubtitle`: Hero 區塊副標題
- `highlights`: 行程亮點（3-5 個）
- `keyFeatures`: 關鍵特色（3-5 個）
- `poeticContent`: 詩意化內容
- `originalityScore`: 原創性分數 (0-100)

### 3. ColorThemeAgent (colorThemeAgent.ts)
**功能**：根據目的地生成配色方案

**輸出**：
```typescript
{
  primary: string;      // 主色
  secondary: string;    // 次色
  accent: string;       // 強調色
  background: string;   // 背景色
  text: string;         // 文字色
}
```

### 4. ImagePromptAgent (imagePromptAgent.ts)
**功能**：生成圖片搜尋關鍵字

**輸出**：
- `heroPrompt`: Hero 圖片搜尋關鍵字
- `highlightPrompts`: 亮點圖片搜尋關鍵字
- `featurePrompts`: 特色圖片搜尋關鍵字
- `styleGuide`: 圖片風格指南

### 5. ImageGenerationAgent (imageGenerationAgent.ts)
**功能**：搜尋並上傳行程圖片

**執行流程**：
1. 使用 Unsplash API 搜尋圖片
2. 下載圖片並上傳到 S3
3. 返回圖片 URL

**輸出**：
- `heroImage`: Hero 圖片 URL
- `highlightImages`: 亮點圖片 URL 陣列
- `featureImages`: 特色圖片 URL 陣列

### 6. ItineraryAgent (itineraryAgent.ts)
**功能**：生成詳細每日行程

**輸出**：
```typescript
{
  dailyItineraries: {
    day: number;
    title: string;           // 當日標題
    description: string;     // 當日描述 (300-400 字)
    activities: {
      time: string;
      title: string;
      description: string;
    }[];
  }[];
}
```

### 7. CostAgent (costAgent.ts)
**功能**：生成費用說明

**輸出**：
```typescript
{
  inclusions: {
    category: string;
    items: string[];
  }[];
  exclusions: {
    category: string;
    items: string[];
  }[];
}
```

### 8. NoticeAgent (noticeAgent.ts)
**功能**：生成旅遊注意事項

**輸出**：
```typescript
{
  notices: {
    category: string;
    items: string[];
  }[];
}
```

### 9. HotelAgent (hotelAgent.ts)
**功能**：生成飯店介紹

**輸出**：
```typescript
{
  hotels: {
    name: string;
    location: string;
    description: string;
    amenities: string[];
    checkIn: string;
    checkOut: string;
  }[];
}
```

### 10. MealAgent (mealAgent.ts)
**功能**：生成餐飲介紹

**輸出**：
```typescript
{
  meals: {
    day: number;
    breakfast: { name: string; description: string; };
    lunch: { name: string; description: string; };
    dinner: { name: string; description: string; };
  }[];
}
```

### 11. FlightAgent (flightAgent.ts)
**功能**：生成航班資訊

**輸出**：
```typescript
{
  outbound: {
    airline: string;
    flightNumber: string;
    departure: { airport: string; time: string; };
    arrival: { airport: string; time: string; };
  };
  inbound: {
    airline: string;
    flightNumber: string;
    departure: { airport: string; time: string; };
    arrival: { airport: string; time: string; };
  };
}
```

### 12. LionTitleGenerator (lionTitleGenerator.ts)
**功能**：生成雄獅旅遊風格的標題

**格式要求**：
- 長度：40-80 字
- 格式：`{目的地}旅遊｜{特色1}.{特色2}.{特色3}.{天數}日`
- 使用「｜」分隔目的地和特色
- 使用「.」分隔各特色

## 執行流程

### Phase 1: Web Scraping (串行執行)
- **Agent**: WebScraperAgent
- **耗時**: 約 30-50 秒
- **說明**: 必須先完成，因為所有其他 Agent 都依賴 rawData

### Phase 2: Content Analysis (串行執行)
- **Agent**: ContentAnalyzerAgent + LionTitleGenerator
- **耗時**: 約 10-20 秒
- **說明**: 依賴 Phase 1 的 rawData

### Phase 3: ColorTheme + ImagePrompt (並行執行)
- **Agent**: ColorThemeAgent, ImagePromptAgent
- **耗時**: 約 5-10 秒
- **說明**: 兩個 Agent 可以並行執行

### Phase 4: MEGA PARALLEL (7 個 Agent 並行執行)
- **Agent**: ImageGenerationAgent, ItineraryAgent, CostAgent, NoticeAgent, HotelAgent, MealAgent, FlightAgent
- **耗時**: 約 40-60 秒
- **說明**: 這是最關鍵的優化，7 個 Agent 同時執行

### Phase 5: 組裝最終資料
- **耗時**: < 1 秒
- **說明**: 組裝所有 Agent 的結果

## 進度追蹤系統

### Server-Sent Events (SSE)
- **端點**: `/api/generation-progress/:taskId`
- **事件類型**: `progress`
- **資料格式**:
```typescript
{
  taskId: string;
  phases: {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    error?: string;
  }[];
  overallProgress: number;
  status: 'running' | 'completed' | 'failed';
}
```

### 進度階段
1. `web_scraper` - 網頁爬取
2. `content_analyzer` - 內容分析
3. `color_theme` - 配色主題
4. `image_prompt` - 圖片提示
5. `image_generation` - 圖片生成
6. `itinerary` - 行程規劃
7. `cost_agent` - 費用說明
8. `notice_agent` - 注意事項
9. `hotel_agent` - 住宿資訊
10. `meal_agent` - 餐飲資訊
11. `flight_agent` - 航班資訊
12. `finalize` - 完成組裝

## 錯誤處理

### 重試機制
- **最大重試次數**: 3 次
- **重試延遲**: 指數退避 (1s, 2s, 4s)
- **可重試錯誤**: 網路錯誤、API 超時、LLM 錯誤

### Fallback 機制
- **非關鍵 Agent**: CostAgent, NoticeAgent, HotelAgent, MealAgent, FlightAgent
- **Fallback 行為**: 使用預設資料或空資料
- **關鍵 Agent**: WebScraperAgent, ContentAnalyzerAgent
- **關鍵 Agent 失敗**: 整個生成流程失敗

## 檔案結構

```
server/agents/
├── masterAgent.ts           # 主控 Agent，協調所有 Agent
├── webScraperAgent.ts       # 網頁爬取 Agent
├── contentAnalyzerAgent.ts  # 內容分析 Agent
├── colorThemeAgent.ts       # 配色主題 Agent
├── imagePromptAgent.ts      # 圖片提示 Agent
├── imageGenerationAgent.ts  # 圖片生成 Agent
├── itineraryAgent.ts        # 行程規劃 Agent
├── costAgent.ts             # 費用說明 Agent
├── noticeAgent.ts           # 注意事項 Agent
├── hotelAgent.ts            # 住宿資訊 Agent
├── mealAgent.ts             # 餐飲資訊 Agent
├── flightAgent.ts           # 航班資訊 Agent
├── lionTitleGenerator.ts    # 雄獅標題生成器
├── agentOrchestration.ts    # Agent 協調工具
├── progressTracker.ts       # 進度追蹤器
├── puppeteerVisionAgent.ts  # Puppeteer 截圖 Agent
├── printFriendlyAgent.ts    # 網頁文字提取 Agent
├── screenshotAgent.ts       # 截圖 Agent
├── skillLibrary.ts          # 技能庫
├── skillLoader.ts           # 技能載入器
└── skills/                  # 技能定義目錄
    └── SKILL.md             # 技能說明文件
```

## 效能指標

| 指標 | 目標值 | 實際值 |
|------|--------|--------|
| 總執行時間 | < 120 秒 | 約 120-170 秒 |
| 並行優化節省時間 | 40-60 秒 | 約 40-60 秒 |
| 成功率 | > 95% | 約 90% |
| 重試次數 | < 3 次 | 平均 1-2 次 |

## 已知問題

1. **進度條沒有即時更新** - SSE 事件沒有正確發送到前端
2. **CostAgent 有 TypeError 錯誤** - `Cannot read properties of undefined (reading 'forEach')`
3. **部分天數行程缺失** - 有時只生成部分天數的行程

## 未來優化方向

1. **快取機制** - 快取常用的目的地配色和圖片
2. **批次生成** - 支援一次生成多個行程
3. **模板系統** - 支援自訂行程模板
4. **AI 模型優化** - 使用更快的 AI 模型或並行呼叫
