# GitHub 開源工具研究報告

## 目標
尋找能 100% 解決 AI 自動生成行程問題的開源方案

---

## 1. Crawl4AI (⭐59.2k) - 強烈推薦
**GitHub**: https://github.com/unclecode/crawl4ai

### 核心優勢
- **LLM 友好輸出**: 自動生成乾淨的 Markdown，包含標題、表格、程式碼、引用提示
- **結構化資料提取**: 支援 LLM 驅動的結構化資料提取
- **CSS/XPath 提取**: 快速的 schema-based 資料提取
- **動態內容支援**: 執行 JavaScript，等待異步內容載入
- **瀏覽器整合**: 支援 Chromium, Firefox, WebKit
- **Session 管理**: 保存瀏覽器狀態，支援多步驟爬取

### 與 Firecrawl 比較
- **免費開源**: 無需 API 金鑰
- **本地部署**: 可完全控制
- **更靈活**: 支援自定義 Markdown 生成策略

### 安裝方式
```bash
pip install -U crawl4ai
crawl4ai-setup
```

### 使用範例
```python
import asyncio
from crawl4ai import *

async def main():
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url="https://travel.liontravel.com/...",
        )
        print(result.markdown)

asyncio.run(main())
```

---

## 2. ScrapeGraphAI (⭐27k+)
**GitHub**: https://github.com/ScrapeGraphAI/Scrapegraph-ai

### 核心優勢
- **AI 驅動**: 使用 LLM 和圖形邏輯建立爬取管道
- **智能提取**: 自動理解網頁結構
- **多種 LLM 支援**: OpenAI, Ollama, 本地模型

---

## 3. LLM Scraper
**GitHub**: https://github.com/mishushakov/llm-scraper

### 核心優勢
- **TypeScript 原生**: 適合 Node.js 專案
- **結構化輸出**: 使用 LLM 提取結構化資料
- **Zod Schema**: 類型安全的資料提取

---

## 4. Outlines (結構化輸出)
**GitHub**: https://github.com/dottxt-ai/outlines

### 核心優勢
- **保證結構化輸出**: 在生成過程中強制 JSON Schema
- **跨模型相容**: OpenAI, Ollama, vLLM 等

---

## 5. AI Trip Planner 專案
**GitHub Topics**: https://github.com/topics/ai-trip-planner

### 參考專案
- WanderPathAI: AI 驅動的行程規劃器
- JourneyJolt: 個人化行程生成
- Travel-Itinerary-Generator-Using-AI

---

## 建議整合方案

### 方案 A: 替換 Firecrawl 為 Crawl4AI
**優點**:
- 免費、開源、無 API 限制
- 更好的 LLM 友好輸出
- 本地部署，完全控制

**實作步驟**:
1. 安裝 Crawl4AI
2. 建立 Python 服務包裝 Crawl4AI
3. 透過 API 或直接呼叫整合到 Node.js 後端

### 方案 B: 使用 ScrapeGraphAI 進行智能提取
**優點**:
- AI 自動理解網頁結構
- 無需手動定義 CSS 選擇器

### 方案 C: 結合 Crawl4AI + Outlines
**優點**:
- Crawl4AI 負責爬取
- Outlines 保證 LLM 輸出符合 JSON Schema
- 解決 TrainAgent JSON 解析失敗的問題

---

## 結論

**最佳推薦**: Crawl4AI

理由:
1. 59.2k 星，社群活躍
2. 專為 LLM 設計的輸出格式
3. 免費開源，無 API 限制
4. 支援動態內容和 JavaScript 執行
5. 可本地部署，完全控制
