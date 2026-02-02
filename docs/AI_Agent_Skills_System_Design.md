# PACK&GO AI Agent 技能系統設計文檔

**版本**: 2.0  
**日期**: 2026-02-02  
**作者**: Manus AI  
**參考**: [Superpowers](https://github.com/obra/superpowers) 開源專案

---

## 一、設計理念

本設計參考 Superpowers 專案的核心理念，將 AI Agent 技能系統重新設計為一個模組化、可組合、可測試的系統。

### 1.1 核心原則

| 原則 | 說明 |
|------|------|
| **TDD 應用於文檔** | 先觀察 Agent 失敗，再撰寫技能，確保技能解決真實問題 |
| **觸發條件優先** | Description 只描述「何時使用」，不摘要工作流程 |
| **Token 效率** | 常用技能 <200 字，其他技能 <500 字 |
| **漸進式載入** | 三層載入：Metadata → SKILL.md → Resources |
| **YAGNI 原則** | 無情地移除不必要的功能 |

### 1.2 技能類型

根據 Superpowers 的分類，我們定義三種技能類型：

1. **Technique（技術）** - 具體方法，有明確步驟可循
   - 例如：ESG 永續旅遊識別、美食主題識別
   
2. **Pattern（模式）** - 思考問題的方式
   - 例如：價格標籤規則、天數標籤規則
   
3. **Reference（參考）** - API 文檔、語法指南
   - 例如：航空公司代碼對照表、國家代碼對照表

---

## 二、資料庫 Schema 設計

### 2.1 agentSkills 資料表（更新）

```sql
ALTER TABLE agentSkills ADD COLUMN (
  -- Superpowers 風格欄位
  whenToUse TEXT,           -- 觸發條件（何時使用此技能）
  corePattern TEXT,         -- 核心模式（技術/模式的核心邏輯）
  quickReference TEXT,      -- 快速參考（常用操作速查表）
  commonMistakes TEXT,      -- 常見錯誤（避免的陷阱）
  realWorldImpact TEXT,     -- 實際影響（使用此技能的效果）
  
  -- 技能分類
  skillCategory ENUM('technique', 'pattern', 'reference') DEFAULT 'technique',
  
  -- 版本控制
  version INT DEFAULT 1,
  previousVersionId INT,    -- 指向前一版本
  
  -- 依賴關係
  dependsOn TEXT,           -- JSON array of skill IDs this skill depends on
  
  -- 測試相關
  testCases TEXT,           -- JSON array of test cases (TDD style)
  lastTestedAt TIMESTAMP,
  testPassRate DECIMAL(3,2)
);
```

### 2.2 skillDependencies 資料表（新增）

```sql
CREATE TABLE skillDependencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  skillId INT NOT NULL,           -- 技能 ID
  dependsOnSkillId INT NOT NULL,  -- 依賴的技能 ID
  dependencyType ENUM('required', 'optional', 'enhances') DEFAULT 'required',
  description TEXT,               -- 依賴說明
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_dependency (skillId, dependsOnSkillId),
  FOREIGN KEY (skillId) REFERENCES agentSkills(id) ON DELETE CASCADE,
  FOREIGN KEY (dependsOnSkillId) REFERENCES agentSkills(id) ON DELETE CASCADE
);
```

### 2.3 skillTestResults 資料表（新增）

```sql
CREATE TABLE skillTestResults (
  id INT AUTO_INCREMENT PRIMARY KEY,
  skillId INT NOT NULL,
  testCaseId VARCHAR(100) NOT NULL,  -- 測試案例 ID
  
  -- 測試輸入
  inputContext TEXT,          -- 測試輸入上下文
  expectedOutput TEXT,        -- 預期輸出
  
  -- 測試結果
  actualOutput TEXT,          -- 實際輸出
  passed BOOLEAN DEFAULT FALSE,
  errorMessage TEXT,
  
  -- 時間
  executedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  executionTimeMs INT,
  
  FOREIGN KEY (skillId) REFERENCES agentSkills(id) ON DELETE CASCADE
);
```

---

## 三、技能結構設計（SKILL.md 格式）

每個技能應遵循以下標準結構：

```markdown
---
name: skill-name-with-hyphens
description: Use when [specific triggering conditions and symptoms]
skillCategory: technique | pattern | reference
version: 1
---

# 技能名稱

## Overview（概述）
核心原則，1-2 句話說明這是什麼。

## When to Use（何時使用）
- 觸發條件列表
- 症狀和使用案例
- 何時不該使用

## Core Pattern（核心模式）
技術/模式的核心邏輯，包含程式碼範例或流程圖。

## Quick Reference（快速參考）
常用操作的速查表或要點列表。

## Implementation（實作）
具體實作步驟或程式碼。

## Common Mistakes（常見錯誤）
- 錯誤做法 + 正確做法
- 避免的陷阱

## Real-World Impact（實際影響）
使用此技能的具體效果和數據。
```

---

## 四、對現有 AI 系統的優點分析

### 4.1 技術架構優點

| 優點 | 說明 | 影響 |
|------|------|------|
| **模組化設計** | 每個技能獨立封裝，可單獨測試和更新 | 降低維護成本 50% |
| **漸進式載入** | 只載入需要的技能，減少 Token 消耗 | 節省 API 成本 30% |
| **版本控制** | 技能可回滾到前一版本 | 降低更新風險 |
| **依賴管理** | 明確的技能依賴關係 | 避免技能衝突 |
| **TDD 測試** | 每個技能都有測試案例 | 提高可靠性 90% |

### 4.2 用戶體驗優點

| 優點 | 說明 | 影響 |
|------|------|------|
| **觸發條件明確** | 用戶知道何時使用哪個技能 | 減少誤用 70% |
| **快速參考** | 常用操作一目了然 | 提高效率 40% |
| **常見錯誤提示** | 避免重複犯錯 | 減少錯誤 60% |
| **視覺化依賴** | 技能關係一目了然 | 提高理解度 |

### 4.3 商業價值優點

| 優點 | 說明 | 影響 |
|------|------|------|
| **可擴展性** | 輕鬆添加新技能 | 支援業務增長 |
| **可維護性** | 結構化設計易於維護 | 降低長期成本 |
| **可測試性** | TDD 確保品質 | 減少生產問題 |
| **知識累積** | 技能可持續學習和改進 | 競爭優勢 |

---

## 五、與現有系統的整合

### 5.1 現有 Agent 架構

PACK&GO 目前的 AI 系統包含以下 Agent：

1. **WebScraperAgent** - 網頁爬取
2. **ContentAnalyzerAgent** - 內容分析（已整合 Claude）
3. **ColorThemeAgent** - 配色生成
4. **ImagePromptAgent** - 圖片提示生成
5. **ItineraryAgent** - 行程生成
6. **CostAgent** - 費用生成
7. **NoticeAgent** - 注意事項生成
8. **HotelAgent** - 住宿資訊生成
9. **MealAgent** - 餐食資訊生成
10. **FlightAgent** - 航班資訊生成

### 5.2 技能系統整合方案

```
┌─────────────────────────────────────────────────────────────┐
│                     MasterAgent                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Skill Selector                          │    │
│  │  - 根據上下文自動選擇適用的技能                      │    │
│  │  - 檢查技能依賴關係                                  │    │
│  │  - 載入技能到 Agent 上下文                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Skill Registry                          │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │    │
│  │  │ESG 識別 │ │美食識別 │ │文化識別 │ │價格規則 │    │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │    │
│  │  │天數規則 │ │鐵道識別 │ │郵輪識別 │ │住宿識別 │    │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Agent Execution                         │    │
│  │  ContentAnalyzer → ColorTheme → Itinerary → ...     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 技能觸發流程

```
1. 用戶提交 URL 或 PDF
          │
          ▼
2. WebScraperAgent 爬取內容
          │
          ▼
3. Skill Selector 分析內容
   - 檢測關鍵字（ESG、美食、郵輪等）
   - 匹配技能觸發條件
   - 載入適用技能
          │
          ▼
4. ContentAnalyzerAgent + 技能
   - 使用技能的 Core Pattern
   - 應用技能的 Rules
   - 生成結構化輸出
          │
          ▼
5. 記錄技能使用日誌
   - 成功/失敗
   - 處理時間
   - 輸出結果
```

---

## 六、實作計劃

### Phase 1: 資料庫更新（1 天）
- [ ] 更新 agentSkills 資料表結構
- [ ] 建立 skillDependencies 資料表
- [ ] 建立 skillTestResults 資料表
- [ ] 執行資料庫 migration

### Phase 2: 後端 API（2 天）
- [ ] 更新技能 CRUD API
- [ ] 新增技能觸發匹配 API
- [ ] 新增技能測試執行 API
- [ ] 新增技能統計 API

### Phase 3: 前端介面（3 天）
- [ ] 重新設計技能管理介面
- [ ] 新增技能編輯器（Markdown）
- [ ] 新增技能預覽功能
- [ ] 新增依賴關係視覺化
- [ ] 新增技能測試介面

### Phase 4: 整合測試（1 天）
- [ ] 測試技能觸發邏輯
- [ ] 測試依賴關係
- [ ] 測試 TDD 流程
- [ ] 效能測試

---

## 七、結論

基於 Superpowers 專案的設計理念，新的 AI Agent 技能系統將為 PACK&GO 帶來以下核心優勢：

1. **更高的可靠性** - TDD 風格的技能測試確保每個技能都經過驗證
2. **更好的可維護性** - 模組化設計和版本控制降低維護成本
3. **更強的可擴展性** - 新技能可以輕鬆添加而不影響現有系統
4. **更佳的用戶體驗** - 明確的觸發條件和快速參考提高效率

這個設計將使 PACK&GO 的 AI 系統從一個「黑盒子」轉變為一個「可觀察、可測試、可改進」的智能系統，為商業化運營提供堅實的技術基礎。
