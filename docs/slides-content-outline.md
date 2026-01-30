# AI Agent Skills 升級提案簡報內容大綱

## 簡報資訊
- **標題**: PACK&GO AI Agent Skills 升級提案
- **頁數**: 5 頁
- **目標受眾**: 技術決策者
- **重點**: 8 個 Skills 架構和預期效益

---

## 第 1 頁：封面

**標題**: PACK&GO AI Agent Skills 升級提案

**副標題**: 從 16 個 Agent 精簡至 8 個 Skills，提升 50% 效率

**日期**: 2026 年 1 月

---

## 第 2 頁：現狀問題與升級動機

**標題**: 現有 16 個 Agent 架構面臨三大挑戰

**核心訊息**: 過度細分導致維護困難、Token 消耗高、擴展性差

**關鍵數據**:
- 16 個功能性 Agent
- 5,000+ 行程式碼
- 每次生成載入全部 System Prompt
- 新增功能需 2-3 天

**三大問題**:
1. **過度細分**: 8 個 Agent 只做簡單提取（Meal/Hotel/Flight/Train/Cost/Notice 等）
2. **缺乏 Progressive Disclosure**: 所有指令一次性載入，浪費 Token
3. **功能重疊**: LionTitleGenerator 與 ContentAnalyzer 重複

---

## 第 3 頁：Agent Skills 架構介紹

**標題**: Anthropic Agent Skills 架構實現漸進式揭露

**核心訊息**: 採用 Anthropic 官方推薦的 Skills 架構，按需載入上下文

**三層漸進式揭露**:
| 層級 | 內容 | 載入時機 |
|------|------|---------|
| 第一層 | name + description | 啟動時預載 |
| 第二層 | SKILL.md 完整內容 | 任務相關時載入 |
| 第三層 | 額外參考檔案 | 需要詳細指令時 |

**Skills 目錄結構範例**:
```
skills/details/
├── SKILL.md          # 核心指令
├── meals.md          # 餐食提取
├── hotels.md         # 飯店提取
└── schemas/          # JSON Schema
```

---

## 第 4 頁：升級後的 8 個 Skills

**標題**: 8 個核心 Skills 取代 16 個分散 Agent

**核心訊息**: 按功能領域整合，每個 Skill 使用最適合的 Claude 模型

**Skills 清單**:

| Skill | 功能 | 模型 | 合併的 Agent |
|-------|------|------|-------------|
| **web-scraper** | 網頁抓取 | Sonnet 4.5 | WebScraperAgent, FirecrawlAgent |
| **content** | 內容創作 | Opus 4.5 | ContentAnalyzerAgent, LionTitleGenerator |
| **itinerary** | 行程處理 | Sonnet 4.5 | ItineraryAgent, ItineraryPolishAgent, ItineraryExtractAgent |
| **details** | 細節提取 | Haiku 4.5 | MealAgent, HotelAgent, CostAgent, NoticeAgent |
| **transport** | 交通處理 | Haiku 4.5 | FlightAgent, TrainAgent, TransportationAgent |
| **visual** | 視覺生成 | Haiku 4.5 | ImagePromptAgent, ImageGenerationAgent, ColorThemeAgent |
| **vision** | 視覺分析 | invokeLLM | PuppeteerVisionAgent, ScreenshotAgent |
| **data-fidelity** | 資料忠實度 | 通用 | 新增（防止幻覺） |

**捨棄的 Agent**: PrintFriendlyAgent, PriceAgent（功能重疊或使用率極低）

---

## 第 5 頁：預期效益與下一步

**標題**: 升級帶來 50% 效率提升和 60% Token 節省

**核心訊息**: 量化效益顯著，建議優先實施 details Skill

**量化效益**:

| 指標 | 升級前 | 升級後 | 改善 |
|------|--------|--------|------|
| Agent 數量 | 16 個 | 8 個 | -50% |
| 程式碼行數 | ~5,000 行 | ~3,000 行 | -40% |
| Token 消耗 | 全部載入 | 按需載入 | -60% |
| 新增功能時間 | 2-3 天 | 0.5-1 天 | -70% |

**實施計畫**:
- Phase 1: 創建 Skills 目錄結構（2 天）
- Phase 2: 重構 MasterAgent（3 天）
- Phase 3: 遷移 Agent 邏輯（5 天）
- Phase 4: 刪除冗餘程式碼（1 天）
- Phase 5: 測試與優化（2 天）
- **總計**: 13 天

**建議優先實施**: `details` Skill（合併 4 個 Agent，效益最大）
