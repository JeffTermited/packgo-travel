# Agent Skills 實施方案

## 概述

根據 Anthropic 的 Agent Skills 架構，本文檔提供為 PACK&GO 旅行社每個 Agent 設計和實施 Skills 的完整方案。

---

## 現有架構分析

### 目前的 Agent 清單

| Agent | 功能 | 是否有 SKILL.md | 問題 |
|-------|------|-----------------|------|
| MasterAgent | 協調所有 Agent | ✅ | 缺乏驗證機制 |
| WebScraperAgent | 網頁爬取 | ✅ | 對特定網站提取不完整 |
| ContentAnalyzerAgent | 內容分析 | ✅ | - |
| ItineraryExtractAgent | 行程提取 | ❌ | 新增，需要 SKILL |
| ItineraryPolishAgent | 行程潤飾 | ❌ | 新增，需要 SKILL |
| ColorThemeAgent | 色彩主題 | ✅ | - |
| ImagePromptAgent | 圖片提示詞 | ✅ | - |
| ImageGenerationAgent | 圖片生成 | ✅ | - |
| CostAgent | 費用說明 | ✅ | - |
| NoticeAgent | 注意事項 | ✅ | - |
| HotelAgent | 飯店介紹 | ✅ | - |
| MealAgent | 餐飲介紹 | ✅ | - |
| FlightAgent | 航班資訊 | ✅ | - |

### 識別的能力缺口

1. **ItineraryPolishAgent 過度創作**: 當原始資料不足時，AI 自行創造不存在的行程
2. **缺乏「忠於原始資料」約束**: 沒有明確規定必須保留原始資料的關鍵資訊
3. **缺乏驗證機制**: 沒有檢查生成結果是否與原始資料一致
4. **缺乏領域知識**: Agent 不知道特定行程類型（如鳴日號火車行程）的核心特徵

---

## Agent Skills 設計原則

### 1. Progressive Disclosure（漸進式揭露）

```
Level 1: name + description (載入到 system prompt)
    ↓
Level 2: SKILL.md 完整內容 (需要時載入)
    ↓
Level 3: 額外參考文件 (特定場景載入)
```

### 2. 目錄結構

```
server/agents/skills/
├── README.md                           # Skills 總覽
├── INTEGRATION_GUIDE.md                # 整合指南
│
├── MasterAgent.SKILL.md                # 主協調 Agent
├── WebScraperAgent.SKILL.md            # 網頁爬取
├── ContentAnalyzerAgent.SKILL.md       # 內容分析
├── ItineraryExtractAgent.SKILL.md      # 行程提取 (新增)
├── ItineraryPolishAgent.SKILL.md       # 行程潤飾 (新增)
├── ColorThemeAgent.SKILL.md            # 色彩主題
├── ImagePromptAgent.SKILL.md           # 圖片提示詞
├── ImageGenerationAgent.SKILL.md       # 圖片生成
├── CostAgent.SKILL.md                  # 費用說明
├── NoticeAgent.SKILL.md                # 注意事項
├── HotelAgent.SKILL.md                 # 飯店介紹
├── MealAgent.SKILL.md                  # 餐飲介紹
├── FlightAgent.SKILL.md                # 航班資訊
│
└── references/                         # 參考文件目錄
    ├── Sipincollection-Design-Guidelines.md
    ├── Destination-Color-Palette.md
    ├── Poetic-Title-Examples.md
    ├── Taiwan-Tour-Types.md            # 新增：台灣行程類型知識
    ├── Data-Fidelity-Rules.md          # 新增：資料忠實度規則
    └── Validation-Checklist.md         # 新增：驗證清單
```

### 3. SKILL.md 標準格式

```markdown
---
name: AgentName
description: 一句話描述 Agent 的功能
version: 1.0.0
dependencies: [其他 Agent 或參考文件]
---

# AgentName Skill

## 角色定義
你是一位...

## 核心職責
1. ...
2. ...

## 約束條件
- 必須...
- 禁止...

## 輸入格式
```typescript
interface Input { ... }
```

## 輸出格式
```typescript
interface Output { ... }
```

## JSON Schema
```json
{ ... }
```

## 參考文件
- [Taiwan-Tour-Types.md](./references/Taiwan-Tour-Types.md): 當處理台灣行程時載入
- [Data-Fidelity-Rules.md](./references/Data-Fidelity-Rules.md): 當需要驗證資料時載入

## 範例
### 輸入範例
...
### 輸出範例
...

## 版本歷史
- v1.0.0: 初始版本
```

---

## 新增 Skills 設計

### 1. ItineraryExtractAgent.SKILL.md

```markdown
---
name: ItineraryExtractAgent
description: 從原始行程資料中提取每日行程結構，保持資料完整性
version: 1.0.0
dependencies: [Data-Fidelity-Rules.md]
---

# ItineraryExtractAgent Skill

## 角色定義
你是一位**行程資料提取專家**，負責從原始行程資料中提取每日行程結構。

## 核心職責
1. **結構化提取**: 從原始文字中識別並提取每日行程
2. **保持原始資訊**: 不添加、不修改、不刪除原始資料中的任何資訊
3. **標記缺失資訊**: 當資訊不完整時，明確標記為「待補充」而非自行創造

## 約束條件（關鍵）
- ⛔ **禁止創造**: 絕對禁止添加原始資料中不存在的景點、活動或描述
- ⛔ **禁止修改**: 不得更改原始資料中的交通方式、住宿、餐食資訊
- ⛔ **禁止假設**: 不得假設或推測原始資料未提及的內容
- ✅ **必須保留**: 保留原始資料中的所有關鍵資訊
- ✅ **必須標記**: 對缺失的資訊標記為 null 或「待補充」

## 輸入格式
```typescript
interface ItineraryExtractInput {
  rawItinerary: string;      // 原始行程文字
  days: number;              // 行程天數
  sourceUrl: string;         // 來源 URL
}
```

## 輸出格式
```typescript
interface ExtractedDay {
  day: number;
  title: string;             // 原始標題，不得修改
  rawContent: string;        // 原始內容，完整保留
  extractedActivities: {
    time?: string;           // 時間（如有）
    location: string;        // 地點
    activity: string;        // 活動
    isFromSource: boolean;   // 是否來自原始資料
  }[];
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  accommodation?: string;
  transportation?: string;   // 交通方式（關鍵！）
  missingInfo: string[];     // 標記缺失的資訊
}
```

## 參考文件
- 當處理台灣行程時，載入 [Taiwan-Tour-Types.md](./references/Taiwan-Tour-Types.md)
- 當需要驗證資料時，載入 [Data-Fidelity-Rules.md](./references/Data-Fidelity-Rules.md)
```

### 2. ItineraryPolishAgent.SKILL.md

```markdown
---
name: ItineraryPolishAgent
description: 潤飾行程描述，提升文案品質，同時嚴格保持資料忠實度
version: 1.0.0
dependencies: [Data-Fidelity-Rules.md, Sipincollection-Design-Guidelines.md]
---

# ItineraryPolishAgent Skill

## 角色定義
你是一位**行程文案潤飾專家**，負責將提取的行程資料轉換為優美的文案，同時嚴格保持資料忠實度。

## 核心職責
1. **文案潤飾**: 提升描述的文學性和吸引力
2. **格式標準化**: 統一時間、地點、活動的呈現格式
3. **保持忠實**: 只潤飾文字表達，不改變事實內容

## 約束條件（關鍵）
- ⛔ **禁止添加景點**: 不得添加原始資料中不存在的景點
- ⛔ **禁止更改交通**: 不得更改原始資料中的交通方式（火車→飛機 ❌）
- ⛔ **禁止更改住宿**: 不得更改原始資料中的飯店名稱
- ⛔ **禁止更改餐食**: 不得更改原始資料中的餐廳或餐食安排
- ✅ **允許潤飾描述**: 可以美化景點描述的文字
- ✅ **允許添加時間**: 可以根據合理推斷添加時間點
- ✅ **允許補充細節**: 可以補充景點的背景知識（但需標記為補充）

## 潤飾規則

### 可以做的事
1. 將「太魯閣」潤飾為「太魯閣國家公園：大自然的鬼斧神工」
2. 將「午餐」潤飾為「享用當地特色風味餐」
3. 添加合理的時間點（如「09:00」）

### 不可以做的事
1. 將「鳴日號火車」改為「飛機」❌
2. 將「The GAYA Hotel」改為「娜路彎大酒店」❌
3. 添加原始資料中沒有的景點（如「鹿野高台」）❌

## 輸入格式
```typescript
interface ItineraryPolishInput {
  extractedDays: ExtractedDay[];  // 從 ItineraryExtractAgent 提取的資料
  originalData: {
    title: string;
    transportation: string;       // 關鍵：原始交通方式
    hotels: string[];             // 關鍵：原始飯店列表
    meals: string[];              // 關鍵：原始餐食列表
  };
}
```

## 輸出格式
```typescript
interface PolishedDay {
  day: number;
  title: string;                  // 潤飾後的標題
  activities: {
    time: string;
    title: string;
    description: string;
    location?: string;
    transportation?: string;
  }[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  accommodation: string;
  fidelityCheck: {
    transportationMatch: boolean;  // 交通方式是否與原始一致
    hotelMatch: boolean;           // 飯店是否與原始一致
    activitiesFromSource: number;  // 來自原始資料的活動數量
    activitiesAdded: number;       // 新增的活動數量（應為 0）
  };
}
```

## 參考文件
- [Sipincollection-Design-Guidelines.md](./references/Sipincollection-Design-Guidelines.md): 文案風格指南
- [Data-Fidelity-Rules.md](./references/Data-Fidelity-Rules.md): 資料忠實度規則
```

### 3. Data-Fidelity-Rules.md（新增參考文件）

```markdown
# 資料忠實度規則

## 核心原則

> 「寧可留白，不可造假」

當原始資料不足時，應該：
1. 標記為「待補充」
2. 使用通用描述（如「精選飯店」）
3. 明確告知使用者資訊不完整

絕對不應該：
1. 自行創造景點或活動
2. 更改交通方式
3. 更改飯店或餐廳名稱

## 關鍵資訊檢查清單

### 交通方式（最高優先級）
- [ ] 火車行程不能變成飛機行程
- [ ] 郵輪行程不能變成陸地行程
- [ ] 自駕行程不能變成團體巴士行程

### 住宿資訊
- [ ] 飯店名稱必須與原始資料一致
- [ ] 飯店等級不能隨意升降
- [ ] 房型描述必須準確

### 餐食資訊
- [ ] 餐廳名稱必須與原始資料一致
- [ ] 餐食類型（中式/西式/自助）必須準確
- [ ] 特色餐食描述必須來自原始資料

### 景點資訊
- [ ] 景點名稱必須與原始資料一致
- [ ] 不得添加原始資料中沒有的景點
- [ ] 景點順序應與原始資料一致

## 特殊行程類型

### 鳴日號火車行程
- 核心特徵：搭乘鳴日號觀光列車
- 關鍵元素：車站、車廂體驗、沿途風景
- 禁止：將火車改為飛機或巴士

### 郵輪行程
- 核心特徵：海上航行、停靠港口
- 關鍵元素：船上設施、岸上觀光
- 禁止：將郵輪改為陸地行程

### 自駕行程
- 核心特徵：租車自駕、彈性行程
- 關鍵元素：租車資訊、路線規劃
- 禁止：將自駕改為團體行程
```

### 4. Taiwan-Tour-Types.md（新增參考文件）

```markdown
# 台灣行程類型知識庫

## 鳴日號火車行程

### 基本資訊
- **列車類型**: 台鐵觀光列車
- **特色**: 美學設計、景觀車廂、車上餐飲
- **路線**: 通常為環島或東部幹線

### 識別特徵
- 標題包含「鳴日號」
- 行程包含「南港站」「花蓮站」「台東站」等車站
- 提及「車廂體驗」「緩行」「景觀」

### 關鍵資訊
- 交通方式：**火車**（絕對不是飛機）
- 集合地點：通常為南港火車站
- 特色體驗：車廂導覽、車上餐盒、緩行觀景

### 常見飯店
- The GAYA Hotel 潮渡假酒店（台東）
- 花蓮潔西艾美渡假酒店
- 理想大地渡假飯店

## 花東縱谷行程

### 基本資訊
- **區域**: 花蓮、台東
- **特色**: 自然風光、原住民文化、溫泉

### 常見景點
- 太魯閣國家公園
- 七星潭
- 池上伯朗大道
- 鹿野高台
- 三仙台

### 常見飯店
- 花蓮理想大地
- 台東娜路彎大酒店
- 知本老爺酒店

## 識別邏輯

當處理行程時，應先識別行程類型：

1. 檢查標題是否包含特定關鍵字（如「鳴日號」）
2. 檢查交通方式（火車/飛機/自駕）
3. 檢查住宿飯店是否符合該類型的常見飯店
4. 如果不符合，可能是資料提取錯誤
```

---

## 實施步驟

### Phase 1: 創建新的 SKILL 文件

1. 創建 `ItineraryExtractAgent.SKILL.md`
2. 創建 `ItineraryPolishAgent.SKILL.md`
3. 創建 `references/Data-Fidelity-Rules.md`
4. 創建 `references/Taiwan-Tour-Types.md`

### Phase 2: 修改 Agent 程式碼

1. 修改 `ItineraryExtractAgent.ts` 載入新的 SKILL
2. 修改 `ItineraryPolishAgent.ts` 載入新的 SKILL 和參考文件
3. 在 LLM prompt 中加入約束條件

### Phase 3: 添加驗證機制

1. 在 `MasterAgent` 中添加結果驗證步驟
2. 檢查交通方式是否與原始資料一致
3. 檢查飯店名稱是否與原始資料一致
4. 檢查是否添加了原始資料中沒有的景點

### Phase 4: 測試和迭代

1. 使用鳴日號行程 URL 進行測試
2. 對比生成結果與原始資料
3. 根據測試結果調整 SKILL 內容

---

## 預期效果

### 修復前
- 交通方式：飛機 ❌（應為火車）
- 住宿：娜路彎大酒店 ❌（應為 The GAYA Hotel）
- 景點：添加了鹿野高台、三仙台 ❌（原始資料沒有）

### 修復後
- 交通方式：鳴日號火車 ✅
- 住宿：The GAYA Hotel 潮渡假酒店 ✅
- 景點：普悠瑪部落、成功海光走讀、如豐琢玉工坊 ✅

---

## 下一步行動

1. 確認此方案是否符合您的需求
2. 開始創建新的 SKILL 文件
3. 修改 Agent 程式碼
4. 進行測試驗證
