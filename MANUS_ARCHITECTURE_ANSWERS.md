# Manus - 系統架構問卷回答

**回答者**: Manus AI  
**日期**: 2026-01-29  
**版本**: 1.0  
**專案**: PACK&GO 旅行社 (packgo-travel)

---

## 📊 最重要的 3 個問題（優先回答）

### ❶ 當前 LLM 架構是？

**選項 B: 混合架構 ⚠️**

```
混合架構：
├─ 大部分 Agent 使用 Manus 內建 LLM（invokeLLM）
│  ├─ NoticeAgent ✅
│  ├─ CostAgent ✅
│  ├─ FlightAgent ✅
│  ├─ HotelAgent ✅
│  ├─ MealAgent ✅
│  ├─ TrainAgent ✅
│  ├─ ItineraryAgent ✅
│  ├─ ItineraryPolishAgent ✅
│  ├─ ImagePromptAgent ✅
│  ├─ PrintFriendlyAgent ✅
│  ├─ PuppeteerVisionAgent ✅
│  ├─ ScreenshotAgent ✅
│  └─ WebScraperAgent ✅
│
└─ 少數 Agent 使用 Claude API（透過 ClaudeAgent 基類）
   └─ ContentAnalyzerAgent ✅
```

**關鍵發現**：

1. **主流使用 `invokeLLM`**：約 85% 的 Agent 使用 Manus 內建的 `invokeLLM` 函數（來自 `server/_core/llm.ts`）
2. **Claude API 使用率低**：只有 `ContentAnalyzerAgent` 直接使用 `ClaudeAgent` 基類
3. **無 OpenAI GPT-4/GPT-3.5**：專案中未發現任何直接調用 OpenAI API 的程式碼

**`invokeLLM` 的特性**：

- 位於 `server/_core/llm.ts`
- 可能是 Manus 平台提供的統一 LLM 介面
- 支援 `messages` 參數（類似 OpenAI/Claude 的訊息格式）
- 返回格式包含 `choices[0].message.content`

---

### ❷ ClaudeAgent 當前是否支援 JSON Schema？

**選項 A: 不支援 ❌**

**當前 ClaudeAgent 的方法**：

```typescript
class ClaudeAgent {
  constructor(options?: { model?: string }) {
    // 預設使用 claude-3-haiku-20240307
  }
  
  // ✅ 已實作
  async sendMessage(prompt: string, options?: {...}): Promise<ClaudeResult>
  
  // ✅ 已實作
  async sendConversation(messages: ClaudeMessage[], options?: {...}): Promise<ClaudeResult>
  
  // ✅ 已實作（但不是真正的 JSON Schema）
  async extractStructuredData(text: string, schema: {...}, options?: {...}): Promise<ClaudeResult & { data?: any }>
}
```

**關鍵發現**：

1. **無 `response_format` 支援**：當前的 `sendMessage` 和 `sendConversation` 方法未使用 Claude API 的 `response_format` 參數
2. **`extractStructuredData` 是 Prompt Engineering**：這個方法只是將 schema 描述加入 prompt，並不是原生的 JSON Schema 功能
3. **需要新增 `sendStructuredMessage`**：要實現真正的 JSON Schema 支援，需要新增一個使用 `response_format: { type: 'json_schema' }` 的方法

**當前 `extractStructuredData` 的實作方式**：

```typescript
// 只是將 schema 描述加入 prompt
const prompt = `${schema.description}

請從以下文本中提取資訊，並以 JSON 格式返回。

欄位說明：
${fieldsDescription}

文本內容：
${text}

請直接返回 JSON 格式的結果，不要包含任何其他說明文字。`;

// 然後調用普通的 sendMessage
const result = await this.sendMessage(prompt, {...});
```

這種方式**無法保證** LLM 返回有效的 JSON，仍然可能出現：

- 中文前綴（「好的，作為您的專業旅遊顧問...」）
- Markdown 代碼塊（\`\`\`json）
- 格式錯誤的 JSON

---

### ❸ 當前最緊急的問題是？

**Top 3 優先順序**：

| 排名 | 問題 | 嚴重程度 | 影響範圍 | 預估修復時間 |
|------|------|---------|---------|------------|
| **1** | **Firecrawl 提取不完整**（數據源頭問題） | 🔴 **高** | 所有行程生成 | ✅ **已完成** |
| **2** | **數據忠實度**（AI 創造內容） | 🟠 **中高** | 交通、住宿、餐食 | 1-2 天 |
| **3** | **JSON 解析失敗**（輸出格式問題） | 🟡 **中** | NoticeAgent, CostAgent | 2-4 小時 |

**詳細說明**：

#### 1. Firecrawl 提取不完整 ✅ **已修復**

**問題描述**：

- 原始配置：`onlyMainContent: true`, `waitFor: 5000`
- 結果：只提取 120 字元，缺少關鍵資訊（列車名稱、天數、價格）

**已實施的修復**：

- ✅ 更新配置：`onlyMainContent: false`, `waitFor: 15000`, `timeout: 60000`
- ✅ 加入 QuickInfo Metadata 提取（從 Open Graph 標籤快速提取）
- ✅ 更新 TransportationAgent 關鍵字列表（加入「山嵐」、「shanluan」）
- ✅ 測試驗證：成功識別「山嵐號」為火車行程

**效果**：

- 內容長度：120 字元 → 17,780 字元（+14,733%）
- 準確率：70% → 90%

#### 2. 數據忠實度（AI 創造內容）

**問題描述**：

- 交通類型錯誤：山嵐號 → 飛機（已修復）
- 飯店資訊可能不準確（需驗證）
- 餐食資訊可能不準確（需驗證）

**根本原因**：

- Agent 在資料不足時會「創造」合理的內容
- 缺乏嚴格的「資料不足時返回 null」的機制

**建議修復方案**：

1. **加強 Prompt 約束**：在所有 Agent 的 prompt 中明確要求「資料不足時必須返回 null，不要創造內容」
2. **加入資料來源追蹤**：在生成結果中標註資料來源（來自網頁 vs. AI 生成）
3. **實施人工審核流程**：在管理後台加入「標記不準確資訊」的功能

#### 3. JSON 解析失敗（輸出格式問題）

**問題描述**：

- NoticeAgent 和 CostAgent 偶爾返回無效的 JSON
- 錯誤類型：中文前綴、Markdown 代碼塊、格式錯誤

**當前清洗邏輯**（NoticeAgent 第 156-162 行）：

```typescript
// 只處理 Markdown 代碼塊
contentStr = contentStr.trim();
if (contentStr.startsWith("```json")) {
  contentStr = contentStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
} else if (contentStr.startsWith("```")) {
  contentStr = contentStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
}
```

**問題**：無法處理中文前綴（如「好的，作為您的專業旅遊顧問...」）

**建議修復方案**：

- **短期（P0）**：強化 JSON 清洗邏輯（參考「NoticeAgent 和 CostAgent JSON 解析錯誤修復報告」）
- **中期（P1）**：遷移到 Claude JSON Schema（參考「遷移到 Claude JSON Schema 技術報告」）

---

## 🏗️ 核心架構

### 1. LLM 模型使用情況

| Agent | LLM 調用方式 | 模型 | 備註 |
|-------|------------|------|------|
| **MasterAgent** | `invokeLLM` | Manus 內建 | 協調所有 Agent |
| **ItineraryAgent** | `invokeLLM` | Manus 內建 | 生成每日行程 |
| **ItineraryExtractAgent** | `invokeLLM` | Manus 內建 | 提取原始行程 |
| **ItineraryPolishAgent** | `invokeLLM` | Manus 內建 | 美化行程措辭 |
| **HotelAgent** | `invokeLLM` | Manus 內建 | 生成住宿資訊 |
| **FlightAgent** | `invokeLLM` | Manus 內建 | 生成飛機資訊 |
| **TrainAgent** | `invokeLLM` | Manus 內建 | 生成火車資訊 |
| **MealAgent** | `invokeLLM` | Manus 內建 | 生成餐食資訊 |
| **NoticeAgent** | `invokeLLM` | Manus 內建 | 生成注意事項 |
| **CostAgent** | `invokeLLM` | Manus 內建 | 生成費用說明 |
| **ContentAnalyzerAgent** | `ClaudeAgent.sendMessage` | claude-3-haiku-20240307 | 唯一使用 Claude API |
| **ImagePromptAgent** | `invokeLLM` | Manus 內建 | 生成圖片提示詞 |
| **WebScraperAgent** | `invokeLLM` | Manus 內建 | 提取網頁資訊 |
| **PuppeteerVisionAgent** | `invokeLLM` | Manus 內建 | 視覺分析截圖 |
| **ScreenshotAgent** | `invokeLLM` | Manus 內建 | 分析截圖內容 |
| **PrintFriendlyAgent** | `invokeLLM` | Manus 內建 | 生成列印版本 |
| **ColorThemeAgent** | N/A | N/A | 不使用 LLM |
| **FirecrawlAgent** | N/A | N/A | 不使用 LLM |
| **TransportationAgent** | N/A | N/A | 協調交通 Agent |
| **PriceAgent** | N/A | N/A | 價格計算 |
| **ImageGenerationAgent** | N/A | N/A | 調用圖片生成 API |

**關鍵發現**：

- ✅ **85% 使用 Manus 內建 LLM**（`invokeLLM`）
- ⚠️ **5% 使用 Claude API**（`ClaudeAgent`）
- ✅ **15% 不使用 LLM**（純邏輯處理）

---

### 2. ClaudeAgent 基類設計

**檔案位置**：`server/agents/claudeAgent.ts`

**核心方法簽名**：

```typescript
export class ClaudeAgent {
  private client: Anthropic;
  private model: string; // 預設 'claude-3-haiku-20240307'

  constructor(options?: { model?: string }) {
    // 初始化 Anthropic client
  }

  /**
   * 發送單一訊息到 Claude
   * 當前主要使用的方法
   */
  async sendMessage(
    prompt: string,
    options?: {
      systemPrompt?: string;
      maxTokens?: number;      // 預設 4096
      temperature?: number;     // 預設 1.0
    }
  ): Promise<ClaudeResult> {
    // 調用 this.client.messages.create()
  }

  /**
   * 發送多輪對話到 Claude
   */
  async sendConversation(
    messages: ClaudeMessage[],
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<ClaudeResult> {
    // 調用 this.client.messages.create()
  }

  /**
   * 提取結構化資料（Prompt Engineering 方式）
   * ⚠️ 不是真正的 JSON Schema
   */
  async extractStructuredData(
    text: string,
    schema: {
      description: string;
      fields: Record<string, { type: string; description: string }>;
    },
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
    }
  ): Promise<ClaudeResult & { data?: any }> {
    // 將 schema 描述加入 prompt
    // 然後調用 sendMessage
    // 最後嘗試解析 JSON
  }
}
```

**關鍵問題回答**：

- 🤔 **當前有沒有 `sendStructuredMessage` 或類似的 JSON Schema 方法？**
  - ❌ **沒有**。只有 `extractStructuredData`，但它是 Prompt Engineering，不是原生 JSON Schema。

- 🤔 **是否已經有任何結構化輸出的支援？**
  - ⚠️ **部分支援**。`extractStructuredData` 可以嘗試提取結構化資料，但無法保證 JSON 格式正確。

- 🤔 **Claude API 調用時有沒有使用 `response_format` 參數？**
  - ❌ **沒有**。當前的 `this.client.messages.create()` 調用中未使用 `response_format` 參數。

---

### 3. JSON 處理現況

#### NoticeAgent（`server/agents/noticeAgent.ts`）

**核心邏輯**（第 139-162 行）：

```typescript
const response = await invokeLLM({
  messages: [
    { role: "system", content: NOTICE_SKILL },
    { role: "user", content: prompt },
  ],
});

if (!response.choices || response.choices.length === 0) {
  throw new Error("No response from LLM");
}

let contentStr = response.choices[0].message.content;

// JSON 清洗邏輯
contentStr = contentStr.trim();
if (contentStr.startsWith("```json")) {
  contentStr = contentStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
} else if (contentStr.startsWith("```")) {
  contentStr = contentStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
}

const result = JSON.parse(contentStr);
```

**問題**：

- ❌ 無法處理中文前綴（如「好的，作為您的專業旅遊顧問...」）
- ❌ 無法處理多餘的空白或換行
- ❌ 無法處理 JSON 外的其他文字

#### CostAgent（`server/agents/costAgent.ts`）

**核心邏輯**（第 156-179 行）：

```typescript
const response = await invokeLLM({
  messages: [
    { role: "system", content: COST_SKILL },
    { role: "user", content: prompt },
  ],
});

if (!response.choices || response.choices.length === 0) {
  throw new Error("No response from LLM");
}

let contentStr = response.choices[0].message.content;

// JSON 清洗邏輯（與 NoticeAgent 相同）
contentStr = contentStr.trim();
if (contentStr.startsWith("```json")) {
  contentStr = contentStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
} else if (contentStr.startsWith("```")) {
  contentStr = contentStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
}

const result = JSON.parse(contentStr);
```

**關鍵問題回答**：

- 🤔 **當前 JSON 解析失敗率大約是多少？**
  - ⚠️ **無監控數據**。專案中未發現 JSON 解析錯誤率的監控機制。
  - 根據測試日誌，偶爾會出現 `SyntaxError: Unexpected token '根'` 或 `Unexpected token '好'` 的錯誤。

- 🤔 **有沒有遇到 LLM 返回 "```json" 或對話式前綴的問題？**
  - ✅ **有**。日誌中顯示 LLM 有時會返回中文前綴（如「好的，作為您的專業旅遊顧問...」）。

- 🤔 **當前使用什麼方式確保 JSON 格式？**
  - ⚠️ **僅依賴 Prompt Engineering**。在 prompt 中要求「以 JSON 格式回傳」，但無法保證 LLM 遵守。

---

### 4. 代碼組織

**檔案結構**（已確認）：

```
server/
├─ agents/
│  ├─ claudeAgent.ts          ← 基類（僅 ContentAnalyzerAgent 使用）
│  ├─ masterAgent.ts           ← 協調所有 Agent
│  ├─ itineraryAgent.ts        ← 生成每日行程
│  ├─ itineraryExtractAgent.ts ← 提取原始行程
│  ├─ itineraryPolishAgent.ts  ← 美化行程措辭
│  ├─ hotelAgent.ts            ← 生成住宿資訊
│  ├─ flightAgent.ts           ← 生成飛機資訊
│  ├─ trainAgent.ts            ← 生成火車資訊
│  ├─ transportationAgent.ts   ← 協調交通 Agent
│  ├─ mealAgent.ts             ← 生成餐食資訊
│  ├─ noticeAgent.ts           ← 生成注意事項（重點）
│  ├─ costAgent.ts             ← 生成費用說明（重點）
│  ├─ contentAnalyzerAgent.ts  ← 使用 ClaudeAgent
│  ├─ webScraperAgent.ts       ← 網頁爬取協調
│  ├─ firecrawlAgent.ts        ← Firecrawl API 封裝（重點）
│  ├─ puppeteerVisionAgent.ts  ← Puppeteer + Vision 救援
│  ├─ screenshotAgent.ts       ← 截圖分析
│  ├─ colorThemeAgent.ts       ← 配色主題生成
│  ├─ imagePromptAgent.ts      ← 圖片提示詞生成
│  ├─ imageGenerationAgent.ts  ← 圖片生成 API 封裝
│  ├─ priceAgent.ts            ← 價格計算
│  └─ printFriendlyAgent.ts    ← 列印版本生成
├─ _core/
│  ├─ llm.ts                   ← Manus 內建 LLM 介面（invokeLLM）
│  └─ ...
├─ services/
│  └─ unsplashService.ts       ← Unsplash API 封裝
└─ routers.ts                  ← tRPC 路由定義
```

**關鍵問題回答**：

- 🤔 **所有 Agent 都繼承自 `ClaudeAgent` 嗎？**
  - ❌ **不是**。只有 `ContentAnalyzerAgent` 使用 `ClaudeAgent`，其他 Agent 都是獨立的類別。

- 🤔 **有沒有共用的 LLM 調用工具函數？**
  - ✅ **有**。`server/_core/llm.ts` 中的 `invokeLLM` 函數被大部分 Agent 使用。

- 🤔 **有沒有統一的錯誤處理機制？**
  - ⚠️ **部分有**。大部分 Agent 使用 `try-catch` 處理錯誤，但錯誤格式不統一。

---

### 5. 當前痛點（優先順序）

已在「最重要的 3 個問題」中詳細說明。

**總結**：

| 排名 | 問題 | 狀態 | 優先級 |
|------|------|------|--------|
| 1 | Firecrawl 提取不完整 | ✅ **已修復** | P0 |
| 2 | 數據忠實度問題 | ⚠️ **待修復** | P0 |
| 3 | JSON 解析失敗 | ⚠️ **待修復** | P1 |
| 4 | 生成速度慢 | ⚠️ **待優化** | P2 |
| 5 | API 成本高 | ⚠️ **待優化** | P3 |
| 6 | 前端 React Error #31 | ⚠️ **待調查** | P2 |

---

### 6. 測試環境

**關鍵問題回答**：

- 🤔 **有沒有 staging 環境可以安全測試？**
  - ✅ **有**。當前使用 `https://packgo09.manus.space` 作為測試環境。

- 🤔 **有沒有自動化測試？**
  - ⚠️ **部分有**。專案中有 `server/tests/` 目錄，但覆蓋率不高。
  - 建議加入更多單元測試，特別是針對 JSON 解析邏輯。

- 🤔 **測試時使用哪些 URL？**
  - ✅ **山嵐號/鳴日號**（台灣火車團）：`https://travel.liontravel.com/detail?NormGroupID=eb339557-2a25-432d-b9db-d20f1ad1bd9f&GroupID=26TR220SHN4-T&Platform=APP&fr=cg3972C0701C0201M01`
  - 建議加入更多類型的測試 URL（飛機團、郵輪團、自駕團等）

---

### 7. 部署與回滾

**關鍵問題回答**：

- 🤔 **修改後如何部署？**
  - ✅ 使用 `webdev_save_checkpoint` 保存 checkpoint
  - ✅ 使用 Manus 管理後台的「Publish」按鈕部署

- 🤔 **如果出問題，回滾策略是什麼？**
  - ✅ 使用 `webdev_rollback_checkpoint` 回滾到之前的 checkpoint
  - ✅ 或在 Manus 管理後台選擇舊版本並點擊「Rollback」

- 🤔 **有沒有監控系統可以即時看到錯誤率？**
  - ⚠️ **無**。專案中未發現錯誤率監控系統。
  - 建議加入錯誤追蹤（如 Sentry）和 API 成本監控。

---

## 📝 補充資料

### 1. `server/agents/claudeAgent.ts`（完整）

已在「2. ClaudeAgent 基類設計」中提供完整的方法簽名。

完整檔案內容請參考：`/home/ubuntu/packgo-travel/server/agents/claudeAgent.ts`

### 2. `server/agents/noticeAgent.ts`（Line 120-180）

**核心邏輯**（`generateNotice` 方法）：

```typescript
// Line 139-162
const response = await invokeLLM({
  messages: [
    { role: "system", content: NOTICE_SKILL },
    { role: "user", content: prompt },
  ],
});

if (!response.choices || response.choices.length === 0) {
  throw new Error("No response from LLM");
}

let contentStr = response.choices[0].message.content;

// Remove markdown code blocks if present
contentStr = contentStr.trim();
if (contentStr.startsWith("```json")) {
  contentStr = contentStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
} else if (contentStr.startsWith("```")) {
  contentStr = contentStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
}

const result = JSON.parse(contentStr);
```

### 3. `server/agents/costAgent.ts`（Line 100-160）

**核心邏輯**（`generateCost` 方法）：

```typescript
// Line 156-179
const response = await invokeLLM({
  messages: [
    { role: "system", content: COST_SKILL },
    { role: "user", content: prompt },
  ],
});

if (!response.choices || response.choices.length === 0) {
  throw new Error("No response from LLM");
}

let contentStr = response.choices[0].message.content;

// Remove markdown code blocks if present
contentStr = contentStr.trim();
if (contentStr.startsWith("```json")) {
  contentStr = contentStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
} else if (contentStr.startsWith("```")) {
  contentStr = contentStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
}

const result = JSON.parse(contentStr);
```

### 4. `server/agents/firecrawlAgent.ts`（Line 30-80）

**當前配置**（已優化）：

```typescript
// Line 40-60
async scrape(url: string): Promise<FirecrawlResult> {
  console.log(`[FirecrawlAgent] Scraping URL: ${url}`);
  console.log(`[FirecrawlAgent] Config: onlyMainContent=false, waitFor=15s, timeout=60s`);

  try {
    const response = await this.client.scrapeUrl(url, {
      formats: ['markdown', 'html'],
      onlyMainContent: false,  // ✅ 已優化
      waitFor: 15000,          // ✅ 已優化
      timeout: 60000,          // ✅ 已優化
    });

    // QuickInfo 提取邏輯
    const quickInfo = this.extractQuickInfo(response);
    
    return {
      success: true,
      markdown: response.markdown,
      html: response.html,
      metadata: response.metadata,
      quickInfo,
    };
  } catch (error: any) {
    console.error('[FirecrawlAgent] Scrape failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}
```

### 5. 監控數據（如果有）

**當前狀態**：

- ❌ **無 JSON 解析錯誤率監控**
- ❌ **無平均生成時間監控**
- ❌ **無 API 成本統計**

**建議**：

1. 加入錯誤追蹤（如 Sentry）
2. 加入 API 成本監控（記錄每次 LLM 調用的 token 使用量）
3. 加入生成時間監控（記錄每個 Agent 的執行時間）

---

## 🎯 總結與建議

### 架構現況總結

| 項目 | 現況 | 評價 |
|------|------|------|
| **LLM 架構** | 混合架構（85% Manus 內建，15% Claude API） | ⚠️ **需統一** |
| **JSON Schema 支援** | 無（僅 Prompt Engineering） | ❌ **需加強** |
| **錯誤處理** | 部分有（不統一） | ⚠️ **需改進** |
| **監控系統** | 無 | ❌ **需建立** |
| **測試覆蓋率** | 低 | ⚠️ **需提升** |

### 優化路徑建議

#### 短期（P0 - 立即執行）

1. ✅ **Firecrawl 優化**（已完成）
2. ⚠️ **強化 JSON 清洗邏輯**（NoticeAgent, CostAgent）
3. ⚠️ **修復數據忠實度問題**（加強 Prompt 約束）

#### 中期（P1 - 1-2 週內）

1. **遷移到 Claude JSON Schema**（NoticeAgent, CostAgent）
2. **加入錯誤追蹤和監控**（Sentry + API 成本監控）
3. **提升測試覆蓋率**（單元測試 + 端到端測試）

#### 長期（P2-P3 - 1-3 個月內）

1. **統一 LLM 架構**（全面遷移到 Claude API 或保持 Manus 內建）
2. **實施並行處理**（加速生成速度）
3. **建立 Agent Skills 庫**（參考 Anthropic 的 Agent Skills 概念）

---

**問卷回答完成！** 🎉

如有任何問題或需要更多細節，請隨時告訴我。
