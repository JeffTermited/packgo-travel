# Agent 學習系統設計文檔

## 一、系統概述

Agent 學習系統是一個讓 AI Agent 能夠從外部資料（如 PDF 行程表）中學習新知識，並將這些知識存入資料庫，以便在未來生成行程時自動應用的系統。

### 核心目標
1. **自我學習能力**：Agent 能夠從 PDF 原件中識別和學習新的行程結構、特色分類、標籤規則
2. **知識持久化**：將學習到的知識存入資料庫，形成可擴展的技能庫
3. **智能應用**：在生成新行程時，自動匹配並應用相關的知識和規則

---

## 二、技能類型定義

### 2.1 特色分類技能 (Feature Classification)
用於識別和分類行程的特色主題。

| 技能名稱 | 關鍵字 | 分類標籤 | 描述 |
|---------|-------|---------|------|
| ESG 永續旅遊 | ESG, 永續, 環保, 低碳, CarboNZero | 環境保護, 社會責任, 永續經濟 | 識別 ESG 相關行程並分類 |
| 美食主題 | 美食, 料理, 餐廳, 米其林 | 美食之旅 | 識別美食主題行程 |
| 文化探索 | 文化, 遺產, 歷史, 博物館 | 文化探索 | 識別文化主題行程 |
| 自然生態 | 生態, 國家公園, 野生動物 | 自然生態 | 識別自然生態行程 |
| 鐵道旅遊 | 鐵道, 火車, 列車, 觀光列車 | 鐵道之旅 | 識別鐵道主題行程 |
| 郵輪旅遊 | 郵輪, 遊船, 峽灣遊船 | 郵輪之旅 | 識別郵輪主題行程 |

### 2.2 標籤規則技能 (Tag Rules)
用於根據行程屬性自動生成標籤。

| 規則名稱 | 條件 | 生成標籤 |
|---------|------|---------|
| 深度旅遊 | 天數 >= 10 | 深度旅遊 |
| 經典行程 | 7 <= 天數 <= 9 | 經典行程 |
| 輕旅行 | 天數 <= 4 | 輕旅行 |
| 精緻行程 | 價格 >= 80000 | 精緻行程 |
| 超值優惠 | 價格 <= 30000 | 超值優惠 |

### 2.3 行程結構技能 (Itinerary Structure)
用於識別和提取特定類型行程的結構。

| 技能名稱 | 適用場景 | 提取規則 |
|---------|---------|---------|
| 標準團體行程 | 一般旅行社團體行程 | 每日行程、餐食、住宿 |
| 自由行行程 | 機加酒自由行 | 航班、飯店、推薦景點 |
| 主題行程 | 特定主題（美食、文化等） | 主題活動、特色體驗 |

### 2.4 亮點識別技能 (Highlight Detection)
用於識別行程中的亮點活動。

| 關鍵字 | 亮點類型 | 顯示方式 |
|-------|---------|---------|
| 特別安排 | 特殊體驗 | 星標標記 |
| 入內參觀 | 深度體驗 | 突出顯示 |
| 獨家 | 獨家行程 | 專屬標籤 |
| 升等 | 升級服務 | 升級標記 |

---

## 三、資料庫結構設計

### 3.1 agentSkills 表

```sql
CREATE TABLE agent_skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  skill_type ENUM('feature_classification', 'tag_rule', 'itinerary_structure', 'highlight_detection') NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  keywords JSON NOT NULL,           -- 觸發關鍵字列表
  rules JSON NOT NULL,              -- 規則定義（條件、動作）
  output_labels JSON,               -- 輸出標籤列表
  description TEXT,                 -- 技能描述
  source VARCHAR(255),              -- 學習來源（如 PDF 檔名）
  confidence DECIMAL(3,2) DEFAULT 1.00,  -- 信心度（0-1）
  usage_count INT DEFAULT 0,        -- 使用次數
  last_used_at TIMESTAMP,           -- 最後使用時間
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);
```

### 3.2 skillApplicationLogs 表（記錄技能應用歷史）

```sql
CREATE TABLE skill_application_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  skill_id INT NOT NULL,
  tour_id INT NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  result JSON,                      -- 應用結果
  success BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (skill_id) REFERENCES agent_skills(id),
  FOREIGN KEY (tour_id) REFERENCES tours(id)
);
```

---

## 四、學習流程設計

### 4.1 從 PDF 學習新知識

```
[PDF 上傳] 
    ↓
[PDF 解析 Agent] → 提取文字和結構
    ↓
[Learning Agent] → 分析內容，識別新模式
    ↓
    ├─ 識別特色分類（ESG、主題等）
    ├─ 識別標籤規則
    ├─ 識別行程結構模式
    └─ 識別亮點關鍵字
    ↓
[知識驗證] → 與現有技能比對，避免重複
    ↓
[存入資料庫] → 新增或更新 agent_skills 表
```

### 4.2 Learning Agent Prompt 設計

```
你是一個旅遊行程分析專家。請分析以下 PDF 內容，識別並提取：

1. **特色分類**：這個行程有什麼特殊主題或特色？（如 ESG 永續、美食、文化等）
   - 識別關鍵字
   - 定義分類標籤

2. **標籤規則**：根據行程屬性，應該生成什麼標籤？
   - 天數相關標籤
   - 價格相關標籤
   - 交通相關標籤
   - 特色相關標籤

3. **亮點活動**：哪些活動是行程的亮點？
   - 識別「特別安排」、「獨家」等關鍵字
   - 標記亮點類型

4. **行程結構**：這個行程的結構有什麼特點？
   - 每日行程格式
   - 餐食標記方式
   - 住宿標記方式

請以 JSON 格式輸出分析結果。
```

---

## 五、知識應用流程設計

### 5.1 生成時自動套用知識

```
[開始生成行程]
    ↓
[查詢相關技能] → 根據行程內容關鍵字匹配技能
    ↓
[套用特色分類技能] → 識別行程特色，生成分類標籤
    ↓
[套用標籤規則技能] → 根據天數、價格等生成標籤
    ↓
[套用亮點識別技能] → 標記亮點活動
    ↓
[套用行程結構技能] → 使用對應的提取策略
    ↓
[生成完成] → 記錄技能應用日誌
```

### 5.2 技能匹配算法

```typescript
async function matchSkills(content: string): Promise<AgentSkill[]> {
  // 1. 獲取所有啟用的技能
  const allSkills = await db.select().from(agentSkills).where(eq(agentSkills.isActive, true));
  
  // 2. 計算每個技能的匹配分數
  const scoredSkills = allSkills.map(skill => {
    const keywords = skill.keywords as string[];
    const matchCount = keywords.filter(kw => content.includes(kw)).length;
    const score = matchCount / keywords.length;
    return { skill, score };
  });
  
  // 3. 過濾並排序（分數 > 0.3 的技能）
  return scoredSkills
    .filter(s => s.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .map(s => s.skill);
}
```

---

## 六、API 設計

### 6.1 技能管理 API

| 端點 | 方法 | 描述 |
|-----|------|------|
| `skills.list` | Query | 列出所有技能 |
| `skills.get` | Query | 獲取單個技能詳情 |
| `skills.create` | Mutation | 創建新技能 |
| `skills.update` | Mutation | 更新技能 |
| `skills.delete` | Mutation | 刪除技能 |
| `skills.search` | Query | 搜尋匹配的技能 |

### 6.2 學習 API

| 端點 | 方法 | 描述 |
|-----|------|------|
| `learning.analyzePdf` | Mutation | 分析 PDF 並提取新知識 |
| `learning.previewSkills` | Query | 預覽將要學習的技能 |
| `learning.confirmLearn` | Mutation | 確認並存入新技能 |

---

## 七、前端管理界面設計

### 7.1 技能管理頁面

- 技能列表（按類型分組）
- 技能詳情編輯
- 技能啟用/停用
- 技能使用統計

### 7.2 學習界面

- PDF 上傳區域
- 學習結果預覽
- 確認/修改/取消按鈕
- 學習歷史記錄

---

## 八、初始技能種子資料

系統啟動時，應預載入以下基礎技能：

1. **ESG 永續旅遊識別**
2. **美食主題識別**
3. **文化探索識別**
4. **鐵道旅遊識別**
5. **郵輪旅遊識別**
6. **天數標籤規則**
7. **價格標籤規則**
8. **亮點關鍵字識別**

---

*文檔版本：1.0*
*最後更新：2026-02-02*
