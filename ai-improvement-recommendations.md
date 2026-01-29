# AI 自動生成系統改進建議報告

## 一、開源工具建議 (github-gem-seeker)

### 推薦替換/整合的工具

| 工具 | 用途 | 優勢 | GitHub Stars |
|------|------|------|-------------|
| **Crawl4AI** | 網頁爬取 | 免費、開源、LLM 優化、支援動態網站 | 59k+ |
| **Firecrawl** | 網頁爬取 | 快速、LLM-ready markdown | 26k+ |
| **Instructor** | LLM 結構化輸出 | 強制 JSON Schema、減少解析錯誤 | 10k+ |
| **LangGraph** | Agent 協調 | 狀態管理、錯誤恢復、可視化 | 8k+ |

### 具體改進方案

#### 1. 替換 Firecrawl 為 Crawl4AI（節省成本）

```python
# 安裝
pip install crawl4ai

# 使用範例
from crawl4ai import AsyncWebCrawler

async def extract_tour(url: str):
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url=url,
            extraction_strategy=LLMExtractionStrategy(
                schema=TourDataSchema
            )
        )
        return result.extracted_content
```

#### 2. 使用 Instructor 強制 LLM 輸出結構化 JSON

```python
import instructor
from pydantic import BaseModel

client = instructor.patch(openai_client)

class TrainInfo(BaseModel):
    type: str  # TRAIN, FLIGHT, etc.
    name: str  # 山嵐號, 鳴日號
    route: str | None
    features: list[str]

# 強制返回結構化數據，不再有 JSON 解析錯誤
result = client.chat.completions.create(
    model="gpt-4",
    response_model=TrainInfo,
    messages=[...]
)
```

---

## 二、Agent Skills 搜尋結果 (internet-skill-finder)

### 可用的相關技能

1. **subagent-driven-development** (obra/superpowers)
   - 子代理驅動開發模式
   - 適用於複雜的多 Agent 協調

2. **systematic-debugging** (obra/superpowers)
   - 系統化除錯方法
   - 適用於 Agent 錯誤追蹤

3. **web-design-guidelines** (vercel-labs/agent-skills)
   - 網頁設計指南
   - 適用於 UI/UX 優化

### 建議整合

目前沒有專門針對旅遊行程生成的公開 Skills，這正是我們建立自定義 Skills 的原因。

---

## 三、新建專業 Skills (skill-creator)

### 已建立的 Skills

#### 1. travel-expert
- **位置**: `/home/ubuntu/skills/travel-expert/`
- **用途**: AI 旅遊行程生成專家
- **內容**:
  - Multi-Agent 架構設計
  - 三階段內容提取策略
  - 交通類型自動檢測
  - 台灣觀光列車識別（鳴日號、山嵐號等）
  - 管理後台編輯功能需求

#### 2. web-design-expert
- **位置**: `/home/ubuntu/skills/web-design-expert/`
- **用途**: 現代極簡網頁設計專家
- **內容**:
  - 設計原則（留白、層級、對比）
  - 組件模式（Hero、導覽、價格卡片）
  - 響應式佈局
  - 列印樣式
  - 無障礙設計

---

## 四、具體改進行動計劃

### 短期（1-2 週）

1. **整合 Instructor 庫**
   - 解決 TrainAgent JSON 解析錯誤
   - 強制 LLM 輸出符合 Schema 的結構化數據

2. **優化交通類型識別**
   - 不再硬編碼列車名稱
   - 讓 LLM 從內容中提取實際列車名稱

3. **完善後台編輯功能**
   - 交通資訊可手動修改
   - 每日行程可編輯
   - 照片可上傳/管理

### 中期（1 個月）

1. **評估 Crawl4AI 替換 Firecrawl**
   - 測試爬取成功率
   - 比較成本效益

2. **建立行程模板系統**
   - 預設行程模板
   - 快速生成常見目的地行程

3. **改進圖片搜尋邏輯**
   - 多關鍵字搜尋策略
   - 本地圖片庫緩存

### 長期（3 個月）

1. **引入 LangGraph 進行 Agent 協調**
   - 狀態管理
   - 錯誤恢復
   - 執行可視化

2. **建立行程品質評估系統**
   - 自動檢測內容完整性
   - 標記需要人工審核的項目

---

## 五、技術債務清理

### 需要修復的問題

1. **TrainAgent JSON 解析**
   - 問題：LLM 偶爾返回非 JSON 格式
   - 解決：使用 Instructor 或 JSON Schema 強制

2. **Hero 圖片搜尋**
   - 問題：Unsplash 搜尋關鍵字過於具體
   - 解決：多層次搜尋策略（城市 → 國家 → 類別）

3. **快取管理**
   - 問題：Redis 快取清除邏輯複雜
   - 解決：統一快取 key 命名規範

---

## 六、結論

通過整合開源工具（Crawl4AI、Instructor）和建立專業 Skills（travel-expert、web-design-expert），可以顯著提升 AI 自動生成系統的可靠性和品質。

最關鍵的改進是使用 **Instructor** 庫來強制 LLM 輸出結構化數據，這將徹底解決 JSON 解析錯誤的問題。
