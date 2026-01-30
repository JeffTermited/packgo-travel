# PACK&GO AI Agent 盤點與升級提案

**專案名稱**：PACK&GO 旅行社 AI 行程生成系統  
**報告日期**：2026 年 1 月 30 日  
**作者**：Manus AI

---

## 一、執行摘要

本報告對 PACK&GO 旅行社 AI 行程生成系統的所有 Agent 進行完整盤點，並根據 Anthropic 的 **Agent Skills** 架構 [1] 提出升級建議。目前系統共有 **16 個功能性 Agent**，經分析後建議：

- **保留**：5 個核心 Agent
- **合併**：8 個 Agent 合併為 3 個 Skills
- **捨棄**：3 個冗餘或過時的 Agent

透過此次升級，預計可將 Agent 數量從 16 個精簡至 **8 個核心 Skills**，同時提升系統的可維護性和擴展性。

---

## 二、現有 Agent 完整盤點

### 2.1 Agent 清單總覽

以下表格列出所有現有 Agent 及其功能：

| # | Agent 名稱 | 功能描述 | 使用模型 | 使用頻率 | 建議 |
|---|-----------|---------|---------|---------|------|
| 1 | **MasterAgent** | 協調所有 Agent 執行完整行程生成 | 無（協調器） | 每次生成 | ✅ 保留 |
| 2 | **WebScraperAgent** | 從 URL 提取行程資訊（三階段策略） | Sonnet 4.5 | 每次生成 | ✅ 保留 |
| 3 | **ContentAnalyzerAgent** | 生成詩意標題、行銷文案 | Opus 4.5 | 每次生成 | ✅ 保留 |
| 4 | **ItineraryAgent** | 從 Markdown 提取行程結構 | Sonnet 4.5 | 每次生成 | 🔄 合併 |
| 5 | **ItineraryPolishAgent** | 美化行程文案 | Sonnet 4.5 | 每次生成 | 🔄 合併 |
| 6 | **ItineraryExtractAgent** | 提取行程元數據 | Haiku 4.5 | 每次生成 | 🔄 合併 |
| 7 | **MealAgent** | 提取餐食資訊 | Haiku 4.5 | 每次生成 | 🔄 合併 |
| 8 | **HotelAgent** | 提取飯店資訊 | Haiku 4.5 | 每次生成 | 🔄 合併 |
| 9 | **FlightAgent** | 提取航班資訊 | Haiku 4.5 | 條件觸發 | 🔄 合併 |
| 10 | **TrainAgent** | 提取火車資訊 | Haiku 4.5 | 條件觸發 | 🔄 合併 |
| 11 | **CostAgent** | 提取費用資訊 | Haiku 4.5 | 每次生成 | 🔄 合併 |
| 12 | **NoticeAgent** | 提取注意事項 | Haiku 4.5 | 每次生成 | 🔄 合併 |
| 13 | **ImagePromptAgent** | 生成圖片提示詞 | Haiku 4.5 | 每次生成 | ✅ 保留 |
| 14 | **ImageGenerationAgent** | 調用 AI 生成圖片 | 無（API 調用） | 每次生成 | ✅ 保留 |
| 15 | **ColorThemeAgent** | 生成配色方案 | Haiku 4.5 | 每次生成 | 🔄 合併 |
| 16 | **LionTitleGenerator** | 生成雄獅風格標題 | Haiku 4.5 | 條件觸發 | ❌ 捨棄 |

### 2.2 輔助 Agent 清單

| # | Agent 名稱 | 功能描述 | 使用頻率 | 建議 |
|---|-----------|---------|---------|------|
| 17 | **FirecrawlAgent** | Firecrawl API 封裝 | 每次生成 | ✅ 保留（工具） |
| 18 | **PrintFriendlyAgent** | 網頁轉 PDF 並分析 | 備用方案 | ❌ 捨棄 |
| 19 | **PuppeteerVisionAgent** | 網頁截圖 + Vision 分析 | 備用方案 | ❌ 捨棄 |
| 20 | **ScreenshotAgent** | 截圖分析 | 備用方案 | 🔄 合併 |
| 21 | **PriceAgent** | 動態價格抓取 | 備用方案 | ❌ 捨棄 |
| 22 | **TransportationAgent** | 統一交通資訊處理 | 未使用 | ❌ 捨棄 |

### 2.3 基礎設施 Agent

| # | Agent 名稱 | 功能描述 | 建議 |
|---|-----------|---------|------|
| 23 | **ClaudeAgent** | Claude API 統一介面 | ✅ 保留（核心） |
| 24 | **ProgressTracker** | 進度追蹤管理器 | ✅ 保留（核心） |
| 25 | **SkillLibrary** | Skill Prompts 庫 | 🔄 升級為 Skills |
| 26 | **SkillLoader** | SKILL.md 載入器 | ✅ 保留（核心） |
| 27 | **AgentOrchestration** | Agent 協調工具 | ✅ 保留（核心） |

---

## 三、問題分析

### 3.1 現有架構問題

根據 Anthropic 的 Agent Skills 架構最佳實踐 [1]，目前系統存在以下問題：

**1. 過度細分（Over-fragmentation）**

目前系統將行程資訊提取拆分為 8 個獨立 Agent（Meal、Hotel、Flight、Train、Cost、Notice、Itinerary、ItineraryPolish），這導致：
- 協調複雜度高
- 重複的 System Prompt 和 JSON Schema 定義
- 難以維護和擴展

**2. 缺乏 Progressive Disclosure**

> "Progressive disclosure is the core design principle that makes Agent Skills flexible and scalable." [1]

目前所有 Agent 的完整邏輯都硬編碼在 TypeScript 中，沒有實現漸進式揭露。每次執行都載入完整的 System Prompt，即使某些指令與當前任務無關。

**3. 冗餘的備用方案**

系統中有多個「備用方案」Agent（PrintFriendlyAgent、PuppeteerVisionAgent、PriceAgent），這些 Agent 很少被使用，但增加了程式碼複雜度。

**4. 功能重疊**

- `LionTitleGenerator` 與 `ContentAnalyzerAgent` 功能重疊
- `TransportationAgent` 與 `FlightAgent`/`TrainAgent` 功能重疊
- `ItineraryExtractAgent` 與 `ItineraryAgent` 功能重疊

### 3.2 與 Agent Skills 架構的差距

| 特性 | Agent Skills 架構 | 目前系統 | 差距 |
|------|------------------|---------|------|
| 結構化文檔 | SKILL.md + 參考檔案 | TypeScript 硬編碼 | ❌ 需重構 |
| Progressive Disclosure | 三層漸進式載入 | 一次性全部載入 | ❌ 需實現 |
| 可組合性 | Skills 可自由組合 | Agent 固定流程 | ⚠️ 部分支援 |
| 可擴展性 | 新增 SKILL.md 即可 | 需修改程式碼 | ❌ 需重構 |

---

## 四、升級提案

### 4.1 新架構設計

根據 Agent Skills 架構，建議將現有 16+ 個 Agent 重組為 **8 個核心 Skills**：

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PACK&GO Agent Skills 架構                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    MasterAgent (協調器)                       │   │
│  │              根據任務動態載入所需 Skills                        │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│  ┌──────────────────────────┼──────────────────────────────────┐   │
│  │                          ▼                                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │   │
│  │  │ web-scraper │  │  content    │  │  itinerary  │          │   │
│  │  │   SKILL     │  │   SKILL     │  │    SKILL    │          │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │   │
│  │                                                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │   │
│  │  │  details    │  │   visual    │  │   vision    │          │   │
│  │  │   SKILL     │  │   SKILL     │  │   SKILL     │          │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │   │
│  │                                                              │   │
│  │  ┌─────────────┐  ┌─────────────┐                           │   │
│  │  │ transport   │  │   data      │                           │   │
│  │  │   SKILL     │  │ fidelity    │                           │   │
│  │  └─────────────┘  └─────────────┘                           │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Skills 定義

#### Skill 1: web-scraper（網頁抓取）

**合併 Agent**: WebScraperAgent, FirecrawlAgent

```
skills/web-scraper/
├── SKILL.md              # 三階段提取策略說明
├── json-ld-extraction.md # JSON-LD 提取指南
├── markdown-parsing.md   # Markdown 解析指南
└── scripts/
    └── firecrawl.ts      # Firecrawl API 封裝
```

**SKILL.md 範例**:
```yaml
---
name: web-scraper
description: 從旅行社網頁提取行程資訊，採用三階段提取策略（JSON-LD → Markdown → Vision）
model: claude-sonnet-4-5-20250929
---
```

---

#### Skill 2: content（內容創作）

**合併 Agent**: ContentAnalyzerAgent, LionTitleGenerator

```
skills/content/
├── SKILL.md              # 內容創作核心指令
├── poetic-titles.md      # 詩意標題生成指南
├── marketing-copy.md     # 行銷文案指南
└── brand-styles/
    ├── packgo.md         # PACK&GO 風格
    └── lion.md           # 雄獅風格（可選）
```

**SKILL.md 範例**:
```yaml
---
name: content
description: 生成高品質的旅遊內容，包括詩意標題、行銷文案和品牌風格文案
model: claude-opus-4-5-20251101
---
```

---

#### Skill 3: itinerary（行程處理）

**合併 Agent**: ItineraryAgent, ItineraryPolishAgent, ItineraryExtractAgent

```
skills/itinerary/
├── SKILL.md              # 行程處理核心指令
├── extraction.md         # 結構化提取指南
├── polishing.md          # 文案美化指南
└── schemas/
    └── tour-schema.json  # 行程 JSON Schema
```

**SKILL.md 範例**:
```yaml
---
name: itinerary
description: 處理旅遊行程的提取、結構化和美化，確保資料完整性和文案品質
model: claude-sonnet-4-5-20250929
---
```

---

#### Skill 4: details（細節提取）

**合併 Agent**: MealAgent, HotelAgent, CostAgent, NoticeAgent

```
skills/details/
├── SKILL.md              # 細節提取核心指令
├── meals.md              # 餐食提取指南
├── hotels.md             # 飯店提取指南
├── costs.md              # 費用提取指南
├── notices.md            # 注意事項提取指南
└── schemas/
    ├── meal-schema.json
    ├── hotel-schema.json
    ├── cost-schema.json
    └── notice-schema.json
```

**SKILL.md 範例**:
```yaml
---
name: details
description: 從行程資料中提取餐食、飯店、費用、注意事項等細節資訊
model: claude-haiku-4-5-20251001
---
```

---

#### Skill 5: transport（交通處理）

**合併 Agent**: FlightAgent, TrainAgent, TransportationAgent

```
skills/transport/
├── SKILL.md              # 交通處理核心指令
├── flights.md            # 航班提取指南
├── trains.md             # 火車提取指南
├── cruise.md             # 郵輪提取指南
└── schemas/
    └── transport-schema.json
```

**SKILL.md 範例**:
```yaml
---
name: transport
description: 處理各類交通資訊（航班、火車、郵輪、自駕等）的提取和格式化
model: claude-haiku-4-5-20251001
---
```

---

#### Skill 6: visual（視覺生成）

**合併 Agent**: ImagePromptAgent, ImageGenerationAgent, ColorThemeAgent

```
skills/visual/
├── SKILL.md              # 視覺生成核心指令
├── image-prompts.md      # 圖片提示詞指南
├── color-themes.md       # 配色方案指南
└── scripts/
    └── image-generation.ts
```

**SKILL.md 範例**:
```yaml
---
name: visual
description: 生成旅遊行程的視覺元素，包括封面圖片、配色方案和視覺風格
model: claude-haiku-4-5-20251001
---
```

---

#### Skill 7: vision（視覺分析）

**合併 Agent**: PuppeteerVisionAgent, ScreenshotAgent

```
skills/vision/
├── SKILL.md              # 視覺分析核心指令
├── screenshot-analysis.md # 截圖分析指南
└── scripts/
    └── puppeteer.ts
```

**SKILL.md 範例**:
```yaml
---
name: vision
description: 使用 Vision API 分析網頁截圖，作為文字提取失敗時的備用方案
model: invokeLLM (Vision API)
---
```

---

#### Skill 8: data-fidelity（資料忠實度）

**新增 Skill**: 從 ClaudeAgent 中提取

```
skills/data-fidelity/
├── SKILL.md              # 資料忠實度核心規則
├── anti-hallucination.md # 防止幻覺指南
└── validation.md         # 資料驗證指南
```

**SKILL.md 範例**:
```yaml
---
name: data-fidelity
description: 確保 AI 輸出的資料忠實度，防止幻覺和虛構資訊
model: all
---
```

---

### 4.3 捨棄的 Agent

以下 Agent 建議捨棄：

| Agent | 捨棄原因 |
|-------|---------|
| **LionTitleGenerator** | 功能已合併至 `content` Skill |
| **PrintFriendlyAgent** | 使用率極低，Firecrawl 已足夠 |
| **PriceAgent** | 功能與 WebScraperAgent 重疊 |
| **TransportationAgent** | 未被使用，功能已合併至 `transport` Skill |

---

## 五、實施計畫

### 5.1 實施階段

| 階段 | 內容 | 預估時間 |
|------|------|---------|
| **Phase 1** | 創建 Skills 目錄結構和 SKILL.md 檔案 | 2 天 |
| **Phase 2** | 重構 MasterAgent 以支援動態 Skill 載入 | 3 天 |
| **Phase 3** | 將現有 Agent 邏輯遷移至 Skills | 5 天 |
| **Phase 4** | 刪除冗餘 Agent 和程式碼 | 1 天 |
| **Phase 5** | 端到端測試和優化 | 2 天 |
| **總計** | | **13 天** |

### 5.2 風險評估

| 風險 | 影響 | 緩解措施 |
|------|------|---------|
| 遷移過程中功能中斷 | 高 | 逐步遷移，保留舊 Agent 作為備用 |
| Progressive Disclosure 實現複雜 | 中 | 先實現基本版本，再逐步優化 |
| 測試覆蓋不足 | 中 | 增加單元測試和整合測試 |

---

## 六、預期效益

### 6.1 量化效益

| 指標 | 升級前 | 升級後 | 改善 |
|------|--------|--------|------|
| Agent 數量 | 16 個 | 8 個 Skills | -50% |
| 程式碼行數 | ~5,000 行 | ~3,000 行 | -40% |
| System Prompt 載入量 | 全部載入 | 按需載入 | -60% |
| 新增功能所需時間 | 2-3 天 | 0.5-1 天 | -70% |

### 6.2 質化效益

1. **更好的可維護性**：SKILL.md 格式更易於閱讀和修改
2. **更高的可擴展性**：新增功能只需創建新的 SKILL.md
3. **更低的 Token 消耗**：Progressive Disclosure 減少不必要的上下文
4. **更符合業界標準**：遵循 Anthropic 官方推薦的架構

---

## 七、結論與建議

### 7.1 結論

目前 PACK&GO AI 行程生成系統的 Agent 架構存在過度細分、缺乏 Progressive Disclosure 等問題。透過採用 Anthropic 的 Agent Skills 架構，可以將 16 個 Agent 精簡為 8 個核心 Skills，同時提升系統的可維護性和擴展性。

### 7.2 建議的下一步

1. **確認捨棄清單**：請確認是否同意捨棄 LionTitleGenerator、PrintFriendlyAgent、PriceAgent、TransportationAgent
2. **確認合併方案**：請確認 Skills 的分組是否符合業務需求
3. **決定實施優先級**：建議優先實施 `details` Skill（合併 8 個 Agent），效益最大

---

## 參考資料

[1] Anthropic. "Equipping agents for the real world with Agent Skills." https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills (October 16, 2025)

---

*報告結束*
