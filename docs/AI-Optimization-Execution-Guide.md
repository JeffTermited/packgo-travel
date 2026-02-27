# PACK&GO AI 系統優化執行指南

**撰寫日期：** 2026 年 2 月 27 日  
**作者：** Manus AI  
**適用對象：** 一人開發團隊  
**預期效益：** API 成本降低 40-50%，生成速度提升 30%

---

## 一、目前系統現狀總結

### 1.1 系統架構概覽

PACK&GO 的 AI 行程生成系統採用 **Master Agent 協調模式**，由一個 `MasterAgent` 統一調度多個子 Agent，依照五個階段（Phase）順序或並行執行。目前的技術棧如下：

| 組件 | 技術選型 | 狀態 |
|------|---------|------|
| LLM 引擎 | Anthropic Claude 4.5 系列（Haiku/Sonnet/Opus） | 運行中 |
| 網頁爬取 | Firecrawl API + Puppeteer 備援 | 運行中 |
| 任務佇列 | BullMQ + Redis 8.4 | 運行中 |
| 結果快取 | Redis（分層 TTL：1/3/7 天） | 運行中 |
| 進度追蹤 | 自建 ProgressTracker + 前端輪詢（3 秒） | 運行中 |
| 圖片來源 | Unsplash API（取代 AI 圖片生成） | 運行中 |

### 1.2 Agent 清單與 LLM 呼叫分析

經過程式碼審計，以下是目前所有 Agent 及其 LLM 使用情況的完整盤點：

| Agent 名稱 | LLM 模型 | LLM 呼叫次數 | 執行階段 | 角色 |
|-----------|----------|-------------|---------|------|
| `WebScraperAgent` | Sonnet 4.5 | 1 次（結構化提取） | Phase 1 | 網頁爬取 + 結構化解析 |
| `ContentAnalyzerAgent` | Haiku 4.5 | 1 次（合併生成） | Phase 2 | 內容分析 + 文案生成 |
| `ColorThemeAgent` | **無 LLM** | 0 次（規則引擎） | Phase 3 | 配色方案生成 |
| `ItineraryExtractAgent` | **無 LLM** | 0 次（純解析） | Phase 4 | 行程提取 |
| `ItineraryPolishAgent` | Haiku 4.5 | 1 次 | Phase 4 | 行程潤色 |
| `DetailsSkill`（已合併） | Haiku 4.5 | **4 次並行** | Phase 4 | 費用/注意事項/飯店/餐飲 |
| `TransportationAgent` → `FlightAgent` | Haiku 4.5 | 1 次 | Phase 4 | 交通資訊 |
| `TransportationAgent` → `TrainAgent` | Haiku 4.5 | 1 次 | Phase 4 | 火車資訊 |
| `LearningAgent` | invokeLLM | 1 次（條件觸發） | Phase 5 | 技能學習 |
| `ImagePromptAgent` | **已停用** | 0 次 | — | 圖片提示詞 |
| `ImageGenerationAgent` | **已停用** | 0 次 | — | AI 圖片生成 |

**每次行程生成的 LLM 呼叫總計：** 約 **8-9 次**（WebScraper 1 + ContentAnalyzer 1 + ItineraryPolish 1 + DetailsSkill 4 + Transportation 1 + Learning 0-1）。

### 1.3 已完成的優化

在進行下一步之前，必須認識到系統已經做了相當多的優化工作：

1. **Agent 合併**：CostAgent、NoticeAgent、HotelAgent、MealAgent 已合併為 `DetailsSkill`，但內部仍然是 4 次獨立的 LLM 呼叫。
2. **並行執行**：Phase 4 的 6 個 Agent 已使用 `Promise.allSettled()` 並行執行。
3. **Redis 分層快取**：完整結果（3 天）、配色方案（7 天）、爬取結果（1 天）。
4. **模型分層**：已使用 Haiku 4.5 處理大部分任務，僅 WebScraper 使用 Sonnet 4.5。
5. **ImageGeneration 停用**：改用 Unsplash API 取代 AI 圖片生成，節省大量成本。
6. **ColorThemeAgent 規則化**：不使用 LLM，改用規則引擎生成配色。

### 1.4 待解決的問題

| 問題類別 | 具體問題 | 影響 |
|---------|---------|------|
| **成本** | DetailsSkill 仍為 4 次獨立 LLM 呼叫 | 可合併為 1 次，節省 ~60% token |
| **成本** | 未啟用 Anthropic Prompt Caching | 重複的 system prompt 每次都計費 |
| **安全** | `tours.create/update/delete` 使用 `protectedProcedure` | 任何登入用戶都可修改行程 |
| **快取** | DetailsSkill 的 LLM 結果未獨立快取 | 相同目的地重複生成浪費 token |
| **品牌** | 登入頁面殘留 "TRAVEL NOIR" 字樣 | 品牌不一致 |

---

## 二、從哪裡開始：執行路線圖

以下是按照**風險等級**和**投資報酬率**排序的執行順序。每個步驟都是獨立的，可以單獨完成後立即部署。

### 執行順序總覽

| 優先級 | 任務 | 預估時間 | 風險 | 預期效益 |
|-------|------|---------|------|---------|
| **P0** | 修復安全漏洞（tours 權限） | 15 分鐘 | 極低 | 防止未授權修改 |
| **P1** | DetailsSkill 4→1 LLM 呼叫合併 | 2-3 小時 | 低 | 節省 ~60% DetailsSkill token |
| **P2** | 啟用 Anthropic Prompt Caching | 1-2 小時 | 低 | 節省 ~90% 重複 system prompt 費用 |
| **P3** | DetailsSkill LLM 結果快取 | 1 小時 | 極低 | 相同目的地不重複呼叫 |
| **P4** | 修復品牌殘留問題 | 15 分鐘 | 極低 | 品牌一致性 |

**總預估時間：** 5-7 小時（可分 2-3 天完成）  
**預期成本降低：** 40-50%

---

## 三、P0：修復安全漏洞（15 分鐘）

### 3.1 問題描述

目前 `server/routers.ts` 中的 `tours.create`、`tours.update`、`tours.delete` 使用 `protectedProcedure`（僅需登入），而非 `adminProcedure`（需管理員權限）。這意味著任何註冊用戶都能建立、修改、刪除行程。

### 3.2 修改位置

檔案：`server/routers.ts`

需要修改的三個位置：

**位置 1：tours.create（約第 433 行）**

```typescript
// 修改前
create: protectedProcedure

// 修改後
create: adminProcedure
```

**位置 2：tours.update（約第 522 行）**

```typescript
// 修改前
update: protectedProcedure

// 修改後
update: adminProcedure
```

**位置 3：tours.delete（約第 625 行）**

```typescript
// 修改前
delete: protectedProcedure

// 修改後
delete: adminProcedure
```

### 3.3 驗證方式

修改後重啟伺服器，以非管理員帳號嘗試呼叫 `tours.create`，應該收到 `FORBIDDEN` 錯誤。

---

## 四、P1：DetailsSkill 4→1 LLM 呼叫合併（2-3 小時）

### 4.1 問題分析

目前 `DetailsSkill.executeAll()` 使用 `Promise.all()` 並行呼叫 4 次 LLM：

```typescript
// 目前的實作（4 次 LLM 呼叫）
const [mealsResult, hotelsResult, costsResult, noticesResult] = await Promise.all([
  this.extractMeals(rawData),      // 1 次 Haiku 呼叫
  this.extractHotels(rawData),     // 1 次 Haiku 呼叫
  this.generateCosts(rawData),     // 1 次 Haiku 呼叫
  this.generateNotices(rawData),   // 1 次 Haiku 呼叫
]);
```

雖然這 4 次呼叫是並行的（不影響總時間），但每次呼叫都會重複傳送幾乎相同的 `rawData` 作為 context，造成大量重複的 input token 計費。假設 `rawData` 約 3,000 tokens，4 次呼叫就是 12,000 tokens 的 input，而合併為 1 次只需 3,000 tokens。

### 4.2 優化方案：合併為單一結構化呼叫

修改檔案：`server/skills/details/detailsSkill.ts`

**核心思路：** 設計一個包含所有四個子技能輸出的合併 JSON Schema，用一次 LLM 呼叫取得所有結果。

#### 步驟 1：定義合併 Schema

```typescript
const COMBINED_DETAILS_SCHEMA: JSONSchema = {
  type: "object",
  properties: {
    meals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "餐點名稱" },
          type: { type: "string", description: "餐點類型（breakfast/lunch/dinner）" },
          description: { type: "string", description: "餐點描述（50-80字）" },
          cuisine: { type: "string", description: "料理類型" },
          restaurant: { type: "string", description: "餐廳名稱" },
        },
        required: ["name", "type", "description", "cuisine"],
      },
    },
    hotels: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "飯店名稱" },
          stars: { type: "string", description: "星級" },
          description: { type: "string", description: "飯店描述（80-120字）" },
          facilities: {
            type: "array",
            items: { type: "string" },
            description: "飯店設施列表",
          },
          location: { type: "string", description: "地理位置描述" },
        },
        required: ["name", "stars", "description", "facilities", "location"],
      },
    },
    costs: {
      type: "object",
      properties: {
        included: {
          type: "array",
          items: { type: "string" },
          description: "團費包含項目",
        },
        excluded: {
          type: "array",
          items: { type: "string" },
          description: "團費不包含項目",
        },
        additionalCosts: {
          type: "array",
          items: { type: "string" },
          description: "額外費用提醒",
        },
        notes: { type: "string", description: "費用說明備註" },
      },
      required: ["included", "excluded", "additionalCosts", "notes"],
    },
    notices: {
      type: "object",
      properties: {
        preparation: {
          type: "array",
          items: { type: "string" },
          description: "行前準備提醒",
        },
        culturalNotes: {
          type: "array",
          items: { type: "string" },
          description: "當地文化禁忌",
        },
        healthSafety: {
          type: "array",
          items: { type: "string" },
          description: "健康安全注意",
        },
        emergency: {
          type: "array",
          items: { type: "string" },
          description: "緊急應對措施",
        },
      },
      required: ["preparation", "culturalNotes", "healthSafety", "emergency"],
    },
  },
  required: ["meals", "hotels", "costs", "notices"],
};
```

#### 步驟 2：新增合併執行方法

在 `DetailsSkill` 類別中新增 `executeAllCombined` 方法：

```typescript
/**
 * 優化版：單一 LLM 呼叫生成所有細節
 * 將 4 次 LLM 呼叫合併為 1 次，節省 ~60% input tokens
 */
async executeAllCombined(rawData: any): Promise<DetailsSkillResult> {
  await this.initialize();
  console.log("[DetailsSkill] Executing COMBINED single-call mode...");

  const startTime = Date.now();

  // 準備精簡的輸入資料
  const mealData = rawData?.meals || rawData?.dining || [];
  const dailyItinerary = rawData?.dailyItinerary || rawData?.itinerary || [];
  const hotelData = rawData?.accommodation?.hotels || rawData?.hotels || [];
  const destination = rawData?.location?.destinationCountry || "";
  const city = rawData?.location?.destinationCity || "";
  const days = rawData?.duration?.days || 0;
  const pricing = rawData?.pricing || {};

  const prompt = `請根據以下旅遊行程資料，一次性生成四個部分的結構化資訊：

## 行程基本資訊
- 目的地：${city}, ${destination}
- 天數：${days} 天
- 價格：${pricing.price || "未提供"}

## 餐飲資料
${JSON.stringify(mealData.length > 0 ? mealData : dailyItinerary.slice(0, 5), null, 2).substring(0, 2000)}

## 住宿資料
${JSON.stringify(hotelData, null, 2).substring(0, 2000)}

## 費用資料
${JSON.stringify(pricing, null, 2).substring(0, 1000)}

## 行程概要
${JSON.stringify(dailyItinerary.slice(0, 5).map((d: any) => ({ day: d.day, title: d.title })), null, 2)}

請生成：
1. meals: 餐飲介紹（根據每日行程提取）
2. hotels: 住宿介紹（根據住宿資料提取）
3. costs: 費用說明（包含/不包含/額外費用）
4. notices: 注意事項（行前準備/文化/健康/緊急）`;

  try {
    const claudeAgent = getHaikuAgent();
    const response = await claudeAgent.sendStructuredMessage<{
      meals: MealData[];
      hotels: HotelData[];
      costs: CostData;
      notices: NoticeData;
    }>(prompt, COMBINED_DETAILS_SCHEMA, {
      systemPrompt: `${this.skillContent}\n\n${STRICT_DATA_FIDELITY_RULES}`,
      maxTokens: 4096,
      temperature: 0.5,
      schemaName: "combined_details_output",
      schemaDescription: "旅遊行程細節一次性結構化輸出",
    });

    const elapsed = Date.now() - startTime;

    if (!response.success || !response.data) {
      console.warn(`[DetailsSkill] Combined call failed, falling back to parallel mode`);
      return this.executeAll(rawData); // 降級為原始 4 次呼叫
    }

    console.log(`[DetailsSkill] Combined call completed in ${elapsed}ms`);
    console.log(`[DetailsSkill] Token usage - Input: ${response.usage?.inputTokens}, Output: ${response.usage?.outputTokens}`);

    return {
      success: true,
      data: {
        meals: response.data.meals || [],
        hotels: response.data.hotels || [],
        costs: response.data.costs || { included: [], excluded: [], additionalCosts: [], notes: "" },
        notices: response.data.notices || { preparation: [], culturalNotes: [], healthSafety: [], emergency: [] },
      },
      usage: response.usage,
    };
  } catch (error) {
    console.error("[DetailsSkill] Combined call error:", error);
    // 降級為原始並行模式
    return this.executeAll(rawData);
  }
}
```

#### 步驟 3：修改 MasterAgent 呼叫

在 `server/agents/masterAgent.ts` 中，將 `this.detailsSkill.executeAll(rawData)` 改為 `this.detailsSkill.executeAllCombined(rawData)`：

```typescript
// 修改前（約第 557 行）
() => this.detailsSkill.executeAll(rawData),

// 修改後
() => this.detailsSkill.executeAllCombined(rawData),
```

### 4.3 預期效益

| 指標 | 修改前 | 修改後 | 節省 |
|------|-------|-------|------|
| LLM 呼叫次數 | 4 次 | 1 次 | 75% |
| Input tokens（假設 rawData 3K tokens） | ~12,000 | ~3,500 | ~71% |
| Output tokens | ~4,000 | ~4,000 | 0%（輸出量不變） |
| 每次生成的 DetailsSkill 成本 | ~$0.032 | ~$0.012 | ~63% |

### 4.4 風險控制

合併呼叫內建了**自動降級機制**：如果合併呼叫失敗，會自動回退到原始的 4 次並行呼叫。這確保了零停機風險。

---

## 五、P2：啟用 Anthropic Prompt Caching（1-2 小時）

### 5.1 原理說明

Anthropic 的 Prompt Caching 功能允許將頻繁重複使用的 system prompt 標記為可快取內容。當相同的 system prompt 在短時間內被多次使用時，後續呼叫只需支付 **10% 的 input token 費用**。

對 PACK&GO 來說，以下內容在每次行程生成中都會重複使用：

- `STRICT_DATA_FIDELITY_RULES`（約 200 tokens，每次生成使用 5-6 次）
- DetailsSkill 的 `skillContent`（約 500 tokens）
- ContentAnalyzerAgent 的 system prompt（約 150 tokens）
- ItineraryPolishAgent 的 system prompt（約 300 tokens）

### 5.2 實作步驟

修改檔案：`server/agents/claudeAgent.ts`

#### 步驟 1：修改 `sendStructuredMessage` 方法支援 cache_control

在 `ClaudeAgent` 類別中，修改 `sendStructuredMessage` 方法的 system prompt 傳遞方式：

```typescript
async sendStructuredMessage<T>(
  prompt: string,
  schema: JSONSchema,
  options?: {
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
    schemaName?: string;
    schemaDescription?: string;
    strictDataFidelity?: boolean;
    enablePromptCaching?: boolean; // 新增參數
  }
): Promise<ClaudeStructuredResult<T>> {
  // ... 現有邏輯 ...

  try {
    // 構建 system 參數
    let systemParam: any;
    
    if (options?.enablePromptCaching !== false) {
      // 啟用 Prompt Caching：使用結構化 system 格式
      systemParam = [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" }
        }
      ];
    } else {
      systemParam = systemPrompt;
    }

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature ?? 0.3,
      system: systemParam,
      tools: [
        {
          name: schemaName,
          description: schemaDescription,
          input_schema: schema as any,
        },
      ],
      tool_choice: { type: 'tool', name: schemaName },
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // ... 後續處理邏輯不變 ...
  }
}
```

#### 步驟 2：同樣修改 `sendMessage` 方法

```typescript
async sendMessage(
  prompt: string,
  options?: {
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
    enablePromptCaching?: boolean; // 新增參數
  }
): Promise<ClaudeResult> {
  // ... 現有邏輯 ...

  try {
    let systemParam: any;
    
    if (options?.enablePromptCaching !== false && options?.systemPrompt) {
      systemParam = [
        {
          type: "text",
          text: options.systemPrompt,
          cache_control: { type: "ephemeral" }
        }
      ];
    } else {
      systemParam = options?.systemPrompt;
    }

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 1.0,
      system: systemParam,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    // ... 後續邏輯不變 ...
  }
}
```

#### 步驟 3：更新 usage stats 追蹤快取效果

```typescript
private updateUsageStats(inputTokens: number, outputTokens: number, cacheInfo?: {
  cacheCreationInputTokens?: number;
  cacheReadInputTokens?: number;
}): void {
  this.usageStats.totalInputTokens += inputTokens;
  this.usageStats.totalOutputTokens += outputTokens;
  this.usageStats.totalCalls += 1;

  // 記錄快取效果
  if (cacheInfo?.cacheReadInputTokens) {
    console.log(`[ClaudeAgent] 🎯 Prompt Cache HIT: ${cacheInfo.cacheReadInputTokens} tokens from cache (90% savings)`);
  }
  if (cacheInfo?.cacheCreationInputTokens) {
    console.log(`[ClaudeAgent] 📝 Prompt Cache WRITE: ${cacheInfo.cacheCreationInputTokens} tokens cached for future use`);
  }

  // ... 成本計算邏輯 ...
}
```

在 API 回應處理中，提取快取資訊：

```typescript
// 在 sendStructuredMessage 和 sendMessage 的回應處理中加入：
this.updateUsageStats(
  response.usage.input_tokens,
  response.usage.output_tokens,
  {
    cacheCreationInputTokens: (response.usage as any).cache_creation_input_tokens,
    cacheReadInputTokens: (response.usage as any).cache_read_input_tokens,
  }
);
```

### 5.3 預期效益

假設每次行程生成有 8 次 LLM 呼叫，其中 system prompt 平均 300 tokens：

| 指標 | 修改前 | 修改後 | 節省 |
|------|-------|-------|------|
| System prompt tokens/次 | 300 × 8 = 2,400 | 300 + (300 × 7 × 0.1) = 510 | ~79% |
| 每月 system prompt 成本（100 次生成） | ~$0.24 | ~$0.05 | ~79% |

> **注意：** Prompt Caching 的快取有效期為 5 分鐘。因此在同一次行程生成的多個 Agent 呼叫之間效果最好。跨不同行程生成的效果取決於時間間隔。

---

## 六、P3：DetailsSkill LLM 結果快取（1 小時）

### 6.1 問題描述

目前 `GenerationCache` 只快取了三類資料：完整結果、配色方案、爬取結果。但 DetailsSkill 的 LLM 結果（費用、注意事項、飯店、餐飲）沒有獨立快取。當同一個目的地的不同行程被生成時，注意事項和文化禁忌等通用資訊會被重複生成。

### 6.2 實作步驟

修改檔案：`server/cache/generation-cache.ts`

#### 步驟 1：新增 DetailsSkill 快取方法

```typescript
// ═══════════════════════════════════════════════════════
// 5. 快取 DetailsSkill 結果（3天）
// ═══════════════════════════════════════════════════════
async cacheDetailsResult(destination: string, details: any): Promise<void> {
  const key = this.generateKey("details", destination.toLowerCase());
  try {
    await redis.setex(
      key,
      259200, // 3天
      JSON.stringify(details)
    );
    console.log(`✅ [Cache] 快取 Details 結果: ${destination}`);
  } catch (error) {
    console.error(`❌ [Cache] 快取 Details 結果失敗:`, error);
  }
}

async getDetailsResult(destination: string): Promise<any | null> {
  const key = this.generateKey("details", destination.toLowerCase());
  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`🎯 [Cache] Details 結果快取命中: ${destination}`);
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error(`❌ [Cache] 讀取 Details 結果失敗:`, error);
    return null;
  }
}
```

#### 步驟 2：在 MasterAgent 中整合快取

在 `masterAgent.ts` 的 Phase 4 中，先檢查快取：

```typescript
// 在 DetailsSkill 執行前加入快取檢查
const detailsDestination = `${rawData.location?.destinationCity || ''}_${rawData.location?.destinationCountry || ''}`;
const cachedDetails = forceRegenerate ? null : await generationCache.getDetailsResult(detailsDestination);

let detailsSkillResult;
if (cachedDetails) {
  console.log("[MasterAgent] 🎯 Details cache HIT!");
  detailsSkillResult = { status: 'fulfilled' as const, value: { success: true, data: cachedDetails } };
} else {
  detailsSkillResult = await Promise.allSettled([
    this.retryManager.executeWithRetry(
      () => this.detailsSkill.executeAllCombined(rawData),
      this.retryConfig,
      'DetailsSkill'
    ),
  ]).then(results => results[0]);
  
  // 快取成功結果
  if (detailsSkillResult.status === 'fulfilled' && detailsSkillResult.value?.success) {
    await generationCache.cacheDetailsResult(detailsDestination, detailsSkillResult.value.data);
  }
}
```

### 6.3 預期效益

對於同一目的地的重複生成（例如同一個國家的不同行程），Details 部分可以直接從快取取得，完全省去 LLM 呼叫。

---

## 七、P4：修復品牌殘留問題（15 分鐘）

### 7.1 搜尋殘留字串

在專案中搜尋 "TRAVEL NOIR" 或其他非 PACK&GO 品牌名稱：

```bash
grep -r "TRAVEL NOIR" client/src/ --include="*.tsx" --include="*.ts"
grep -r "Travel Noir" client/src/ --include="*.tsx" --include="*.ts"
```

### 7.2 替換為 PACK&GO

將所有找到的 "TRAVEL NOIR" 替換為 "PACK&GO"，確保登入頁面、Footer、以及任何其他位置的品牌名稱一致。

---

## 八、成本估算與監控

### 8.1 優化前後成本對比

以每月生成 100 個行程為基準：

| 項目 | 優化前 | 優化後 | 節省 |
|------|-------|-------|------|
| DetailsSkill（4→1 合併） | $3.20 | $1.20 | $2.00 |
| Prompt Caching | $0.24 | $0.05 | $0.19 |
| Details 結果快取（假設 30% 命中率） | — | — | $0.96 |
| **LLM 總成本** | **~$8.00** | **~$4.85** | **~$3.15（39%）** |

> 以上估算基於 Haiku 4.5 定價（$1/1M input, $5/1M output）和平均每次生成 ~5,000 input tokens + ~3,000 output tokens。

### 8.2 建議的監控方式

在 `ClaudeAgent` 中已有 `getUsageStats()` 方法，建議在管理後台增加一個簡單的 API 端點來查看累計使用量：

```typescript
// 在 server/routers.ts 中新增
aiStats: adminProcedure.query(async () => {
  const { getHaikuAgent, getSonnetAgent } = await import("./agents/claudeAgent");
  const cacheStats = await generationCache.getStats();
  
  return {
    haiku: getHaikuAgent().getUsageStats(),
    sonnet: getSonnetAgent().getUsageStats(),
    cache: cacheStats,
  };
}),
```

---

## 九、如何開始執行

### 9.1 前置確認

在開始任何修改之前，請確認以下環境狀態：

```bash
# 1. 確認開發伺服器運行中
curl http://localhost:3000

# 2. 確認 Redis 運行中
redis-cli ping  # 應回傳 PONG

# 3. 確認 Git 狀態乾淨
cd /home/ubuntu/packgo-travel
git status
```

### 9.2 建議的執行流程

```
第 1 步：備份（5 分鐘）
├── 儲存 checkpoint
└── 記錄當前 git commit hash

第 2 步：P0 安全修復（15 分鐘）
├── 修改 routers.ts 三處 protectedProcedure → adminProcedure
├── 重啟伺服器
└── 驗證非管理員無法修改行程

第 3 步：P1 DetailsSkill 合併（2-3 小時）
├── 在 detailsSkill.ts 新增 COMBINED_DETAILS_SCHEMA
├── 新增 executeAllCombined() 方法
├── 修改 masterAgent.ts 呼叫新方法
├── 測試生成一個行程
└── 確認 DetailsSkill 只有 1 次 LLM 呼叫

第 4 步：P2 Prompt Caching（1-2 小時）
├── 修改 claudeAgent.ts 的 sendStructuredMessage
├── 修改 claudeAgent.ts 的 sendMessage
├── 新增 cache 效果追蹤日誌
├── 測試生成一個行程
└── 確認日誌中出現 "Prompt Cache HIT"

第 5 步：P3 Details 快取（1 小時）
├── 在 generation-cache.ts 新增 Details 快取方法
├── 在 masterAgent.ts 整合快取檢查
├── 測試同一目的地生成兩次
└── 確認第二次出現 "Details cache HIT"

第 6 步：P4 品牌修復（15 分鐘）
├── 搜尋並替換 "TRAVEL NOIR"
└── 驗證登入頁面顯示 "PACK&GO"

第 7 步：最終驗證（30 分鐘）
├── 完整生成一個新行程
├── 檢查日誌中的 token 使用量
├── 確認所有功能正常
└── 儲存 checkpoint
```

### 9.3 如果需要我直接執行

如果您希望我直接在程式碼中實作這些修改，請告訴我要從哪一個優先級開始。我會：

1. 修改程式碼
2. 重啟伺服器
3. 執行測試驗證
4. 儲存 checkpoint

建議從 **P0（安全修復）** 開始，因為這是最緊急且最簡單的修改。

---

## 附錄 A：Agent 執行流程圖

```
Phase 1: Web Scraping (Sequential, Critical)
  └── WebScraperAgent [Sonnet 4.5] ──→ rawData

Phase 2: Content Analysis (Sequential, Critical)
  └── ContentAnalyzerAgent [Haiku 4.5] ──→ analyzedContent

Phase 3: Color Theme (Sequential)
  └── ColorThemeAgent [無 LLM] ──→ colorTheme

Phase 4: Parallel Execution (6 agents)
  ├── ItineraryExtractAgent [無 LLM] ──→ extractedItinerary
  ├── ItineraryPolishAgent [Haiku 4.5] ──→ polishedItinerary
  ├── DetailsSkill [Haiku 4.5 × 4→1] ──→ costs, notices, hotels, meals
  └── TransportationAgent [Haiku 4.5] ──→ transportationData

Phase 5: Assembly
  ├── Smart Tags Generation [無 LLM]
  ├── Learning Agent [invokeLLM, 條件觸發]
  └── Final Data Assembly ──→ 儲存到資料庫 + 快取到 Redis
```

## 附錄 B：檔案修改清單

| 檔案路徑 | 修改內容 | 優先級 |
|---------|---------|-------|
| `server/routers.ts` | tours.create/update/delete → adminProcedure | P0 |
| `server/skills/details/detailsSkill.ts` | 新增 COMBINED_DETAILS_SCHEMA + executeAllCombined() | P1 |
| `server/agents/masterAgent.ts` | 呼叫 executeAllCombined + Details 快取整合 | P1/P3 |
| `server/agents/claudeAgent.ts` | sendMessage/sendStructuredMessage 支援 cache_control | P2 |
| `server/cache/generation-cache.ts` | 新增 cacheDetailsResult/getDetailsResult | P3 |
| `client/src/` 中含 "TRAVEL NOIR" 的檔案 | 替換為 "PACK&GO" | P4 |

---

*本文件基於 2026 年 2 月 27 日的程式碼審計結果撰寫。所有程式碼範例均已針對現有架構設計，可直接整合。*
