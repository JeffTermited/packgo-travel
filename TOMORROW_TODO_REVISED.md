# 明天待辦事項（修訂版，2026-01-26）

## 🔴 Critical Fix（必須優先處理）

### 1. 移除 DesignLearningAgent 的 Runtime 依賴（30 分鐘）
**問題：** 目前計畫在 Master Agent 的 Step 0 每次都調用 DesignLearningAgent，會導致：
- 單點故障風險（外部網站掛了整個服務掛）
- 效能災難（每次多等 15-30 秒）
- 風格飄移（LLM 不確定性導致風格不一致）

**修正方案：**
- [ ] 將 DesignLearningAgent 定義為「離線開發工具」
- [ ] 手動跑一次 DesignLearningAgent，生成 `design_guidelines.json`
- [ ] 將設計規範 Hardcode 在 `server/defaultDesignGuideline.ts` 中
- [ ] 從 Master Agent 中移除 DesignLearningAgent 的調用
- [ ] 優點：零延遲、零外部依賴、風格絕對統一

**實作步驟：**
```typescript
// server/agents/masterAgent.ts

// ❌ 錯誤：每次都調用
// const designGuideline = await this.designLearningAgent.learn('https://...');

// ✅ 正確：使用預設值
import { DEFAULT_DESIGN_GUIDELINE, adjustColorSchemeByDestination } from '../defaultDesignGuideline';

async execute(data: TourGenerationData, updateProgress: UpdateProgressFn): Promise<TourGenerationResult> {
  // 根據目的地調整配色
  const colorAdjustments = adjustColorSchemeByDestination(scrapedData.destination);
  const designGuideline = mergeDesignGuideline(DEFAULT_DESIGN_GUIDELINE, { colorScheme: colorAdjustments });
  
  // 繼續其他步驟...
}
```

---

## 🟡 高優先級（核心功能）

### 2. 優化 Agent Prompt 加入字數強限制（1 小時）
**問題：** 動態內容長度不一致會破壞前端排版

**修正方案：**
- [ ] **PoeticAgent**：詩意副標題嚴格限制在 12-16 字
- [ ] **AttractionAgent**：景點描述嚴格限制在 100-120 字
- [ ] **HotelAgent**：飯店描述嚴格限制在 80-100 字
- [ ] **ContentAnalyzerAgent**：標題限制在 20-30 字，描述限制在 100-120 字

**Prompt 範例：**
```typescript
const prompt = `
你是一位專業的旅遊文案撰寫師。請為以下景點撰寫詩意副標題。

**嚴格要求：**
- 字數：必須在 12-16 字之間（不可多也不可少）
- 風格：詩意、文學性、引人入勝
- 禁止：使用「最」、「非常」、「一定」等絕對詞彙

景點名稱：${attraction.name}
景點描述：${attraction.description}

請直接返回副標題，不要有任何前綴或後綴。
`;
```

### 3. 加入 Fallback 機制和外部知識庫（1.5 小時）
**問題：** WebScraperAgent 可能無法完美提取所有資訊，導致下游 Agent 產生幻覺

**修正方案：**
- [ ] 在 Prompt 中明確指示：「如果資料不足，請回傳 null」
- [ ] 前端對 null 值做隱藏處理
- [ ] （可選）整合 Google Search API 或 Google Maps API 補全資訊

**Prompt 範例：**
```typescript
const prompt = `
你是一位專業的飯店介紹撰寫師。請根據以下資訊撰寫飯店介紹。

**嚴格要求：**
- 字數：80-100 字
- 如果飯店名稱為空或資訊不足，請回傳 null
- 禁止編造任何資訊

飯店名稱：${hotel.name || '未提供'}
飯店星級：${hotel.rating || '未提供'}
飯店特色：${hotel.features || '未提供'}

請以 JSON 格式返回：
{
  "description": "飯店介紹（80-100字）" | null
}
`;
```

### 4. 實作 Master Agent 的 Partial Success 機制（1 小時）
**問題：** 一個子 Agent 失敗會導致整個行程生成失敗

**修正方案：**
- [ ] 在 Master Agent 中加入 Checkpoint 機制
- [ ] 每個 Agent 執行完後儲存中間結果
- [ ] 如果某個 Agent 失敗，使用預設值或跳過該步驟
- [ ] 最終返回 Partial Success 狀態

**實作範例：**
```typescript
async execute(data: TourGenerationData, updateProgress: UpdateProgressFn): Promise<TourGenerationResult> {
  const result: Partial<TourGenerationResult> = {};
  const errors: string[] = [];

  // Step 1: Web Scraper
  try {
    result.scrapedData = await WebScraperAgent.scrape(data.url);
  } catch (error) {
    errors.push(`WebScraper failed: ${error.message}`);
    throw error; // 這個步驟失敗必須中止
  }

  // Step 2: Content Analyzer
  try {
    result.analyzedContent = await ContentAnalyzerAgent.analyze(result.scrapedData);
  } catch (error) {
    errors.push(`ContentAnalyzer failed: ${error.message}`);
    result.analyzedContent = getDefaultAnalyzedContent(); // 使用預設值
  }

  // Step 3: Attraction Agent
  try {
    result.attractions = await AttractionAgent.generate(result.scrapedData.attractions);
  } catch (error) {
    errors.push(`AttractionAgent failed: ${error.message}`);
    result.attractions = []; // 空陣列
  }

  // ... 其他 Agent

  return {
    ...result,
    status: errors.length > 0 ? 'partial_success' : 'success',
    errors
  };
}
```

---

## 🟢 中優先級（前端實作）

### 5. 實作防禦性 CSS 排版（2 小時）
**問題：** 動態內容長度不一致會破壞雜誌級排版

**修正方案：**
- [ ] 所有圖片使用 `object-fit: cover` 和固定長寬比（3:4 直圖）
- [ ] 所有文字使用 `line-clamp` 截斷過長內容
- [ ] 手機版 (<768px) 切換回橫排 + 單欄佈局
- [ ] 直式標題僅在桌面版 (>1024px) 顯示

**CSS 範例：**
```css
/* 圖片防禦性編程 */
.attraction-image {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 8px;
}

/* 文字截斷 */
.attraction-description {
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.8;
}

/* 直式標題（僅桌面版） */
@media (min-width: 1024px) {
  .vertical-title {
    writing-mode: vertical-rl;
    text-orientation: upright;
    letter-spacing: 0.1em;
  }
}

/* 手機版：橫排 + 單欄 */
@media (max-width: 768px) {
  .attraction-block {
    flex-direction: column !important;
  }
  
  .attraction-image,
  .attraction-text {
    width: 100% !important;
  }
  
  .vertical-title {
    writing-mode: horizontal-tb; /* 恢復橫排 */
  }
}
```

### 6. 實作 CSS @media print 支援（1 小時）
**問題：** Puppeteer 生成 PDF 成本高、除錯難

**修正方案：**
- [ ] 使用 CSS `@media print` 讓用戶直接用瀏覽器「列印 -> 另存 PDF」
- [ ] 隱藏 Navbar、Footer、按鈕
- [ ] 設定 `page-break-inside: avoid` 防止圖片被切斷
- [ ] 優點：開發時間 1 小時，不佔用 Server 資源

**CSS 範例：**
```css
@media print {
  /* 隱藏不需要的元素 */
  nav, footer, button, .admin-info-card {
    display: none !important;
  }

  /* 防止圖片被切斷 */
  .attraction-block, .hotel-block {
    page-break-inside: avoid;
  }

  /* 調整間距 */
  section {
    padding: 1rem !important;
    margin-bottom: 2rem !important;
  }

  /* 確保圖片適合列印 */
  img {
    max-width: 100%;
    page-break-inside: avoid;
  }
}
```

---

## 🔵 低優先級（如果時間允許）

### 7. 建立專門的 Agent（2-3 小時）
- [ ] AttractionAgent：生成景點深度介紹（100-120 字 + 12-16 字詩意副標題）
- [ ] HotelAgent：生成飯店介紹（80-100 字 + 星級 + 特色）
- [ ] MealAgent：生成餐食介紹（50-80 字）
- [ ] FlightAgent：整理航班資訊（不需要 LLM，直接結構化）

### 8. 重新設計行程詳情頁面（3-4 小時）
- [ ] 全螢幕 Hero 區域（100vh）+ 右下角資訊卡片
- [ ] 航班資訊表格（參考 sipincollection.com）
- [ ] 景點區塊（左右交錯佈局）
- [ ] 直式標題（僅桌面版）
- [ ] 配色主題應用（CSS Variables）

---

## 📊 時間預估（修訂版）

| 優先級 | 任務 | 預計時間 |
|--------|------|----------|
| 🔴 Critical | 移除 DesignLearningAgent Runtime 依賴 | 30 分鐘 |
| 🟡 高 | 優化 Prompt 字數限制 | 1 小時 |
| 🟡 高 | 加入 Fallback 機制 | 1.5 小時 |
| 🟡 高 | Partial Success 機制 | 1 小時 |
| 🟢 中 | 防禦性 CSS 排版 | 2 小時 |
| 🟢 中 | CSS @media print | 1 小時 |
| 🔵 低 | 建立專門 Agent | 2-3 小時 |
| 🔵 低 | 重新設計詳情頁面 | 3-4 小時 |
| **總計** | | **7-9 小時（核心）+ 5-7 小時（可選）** |

---

## 🎯 明天的執行順序

1. **上午 9:00-9:30**：移除 DesignLearningAgent Runtime 依賴
2. **上午 9:30-10:30**：優化所有 Agent 的 Prompt（字數限制）
3. **上午 10:30-12:00**：加入 Fallback 機制和 Partial Success
4. **下午 1:00-3:00**：實作防禦性 CSS 排版
5. **下午 3:00-4:00**：實作 CSS @media print
6. **下午 4:00-6:00**：（可選）建立專門 Agent
7. **下午 6:00-9:00**：（可選）重新設計詳情頁面

---

## 🚀 關鍵改進

### 原計畫 vs. 修訂版

| 項目 | 原計畫 | 修訂版 | 改進原因 |
|------|--------|--------|----------|
| DesignLearningAgent | Runtime 每次調用 | 離線工具，Hardcode 設計規範 | 避免單點故障、效能災難、風格飄移 |
| Prompt 設計 | 「100-150 字」 | 「嚴格 100-120 字」 | 配合前端排版，避免佈局崩壞 |
| 錯誤處理 | 一個 Agent 失敗全失敗 | Partial Success 機制 | 提高系統穩定性 |
| PDF 下載 | Puppeteer Server 端渲染 | CSS @media print | 降低成本，1 小時完成 |
| 外部依賴 | 完全依賴 WebScraperAgent | 加入 Fallback 和外部 API | 避免幻覺，提高資料品質 |

---

## 📝 總結

修訂版的核心思想：
1. **避免過度工程化**：DesignLearningAgent 改為離線工具
2. **提高系統穩定性**：Partial Success + Fallback 機制
3. **配合前端排版**：Prompt 字數強限制 + 防禦性 CSS
4. **降低開發成本**：CSS @media print 取代 Puppeteer

這樣的方案更務實、更穩定、更易維護。
