# 明天工作計畫（2026-01-26）

**作者：** Manus AI  
**日期：** 2026-01-25  
**預計總時間：** 9-11 小時（核心 7-9 小時 + 可選 2 小時）

---

## 📋 執行摘要

本工作計畫整合了今天所有技術討論的決策，聚焦於三大核心改進：**架構穩定性**（移除 Runtime 依賴）、**內容品質**（Skill Prompting）、**前端防禦**（CSS 防護機制）。所有改進均遵循「務實可行、避免過度工程化」的原則。

---

## 🔴 Critical Fix（必須優先處理，預計 30 分鐘）

### 任務 1：移除 DesignLearningAgent 的 Runtime 依賴

**問題分析：**
目前 Master Agent 在每次生成行程時都會調用 DesignLearningAgent 去爬取 sipincollection.com 並「重新學習」設計規範。這導致三個嚴重問題：

1. **單點故障（SPOF）**：如果 sipincollection.com 網站下線、改版或封鎖爬蟲，整個行程生成系統就會失敗
2. **效能災難**：每次生成都要等待 15-30 秒去「學習」一個不會變的設計規範
3. **風格飄移**：LLM 的非確定性會導致每次「學習」的結果略有不同，造成風格不一致

**解決方案：**
將 DesignLearningAgent 從「Runtime Agent」改為「Offline Dev Tool」，只在開發階段手動執行一次，然後將結果 Hardcode 到系統中。

**具體步驟：**

1. **保留 DesignLearningAgent 作為開發工具**（不刪除，未來可能需要重新學習）
   - 移動到 `server/tools/designLearningTool.ts`
   - 添加註解說明這是「離線工具，不應在 Runtime 調用」

2. **使用現有的 DEFAULT_DESIGN_GUIDELINES.ts**
   - 檔案位置：`server/lib/DEFAULT_DESIGN_GUIDELINES.ts`
   - 這個檔案已經包含完整的設計規範（配色、字體、間距、佈局）

3. **從 Master Agent 中移除 DesignLearningAgent 調用**
   - 編輯 `server/agents/masterAgent.ts`
   - 刪除 Step 0（Design Learning）
   - 直接使用 `DEFAULT_DESIGN_GUIDELINES`

4. **更新進度追蹤**
   - 原本 7 步驟：starting (10%) → scraping (30%) → analyzing (40%) → ...
   - 移除 Design Learning 後仍保持 7 步驟（因為 Design Learning 原本就不在進度中）

**預期效果：**
- ✅ 零延遲（省下 15-30 秒）
- ✅ 零外部依賴（不依賴 sipincollection.com）
- ✅ 風格絕對統一（使用固定的設計規範）

---

## 🟡 高優先級：Skill Prompting 應用（預計 3 小時）

### 任務 2：建立 Skill Library

**什麼是 Skill Prompting？**

Skill Prompting 是一種進階的 Prompt Engineering 技術，透過給 AI Agent 賦予「專業人設」和「技能清單」，來提升輸出品質。

**傳統 Prompting vs Skill Prompting：**

| 維度 | 傳統 Prompting | Skill Prompting |
|------|---------------|-----------------|
| 指令 | 「請生成一個行程標題」 | 「你是專業旅遊文案師，擅長用感官細節和場景化敘事...」 |
| 輸出品質 | 平淡、商品化 | 生動、有畫面感 |
| 一致性 | 不穩定 | 穩定（因為有明確的技能框架） |
| 範例 | 「北海道 5 日遊 - 雪景溫泉美食之旅」 | 「踏雪尋溫泉，北海道冬日慢行記」 |

**具體步驟：**

1. **創建 Skill Library 檔案**
   - 檔案位置：`server/agents/skillLibrary.ts`
   - 定義 5 種專業人設：Copywriter、Photographer、Poet、Editor、Storyteller

2. **Copywriter Skill（用於 ContentAnalyzerAgent）**

```typescript
export const COPYWRITER_SKILL = `
你是一位獲獎無數的旅遊文案撰寫師，擁有 10 年經驗。

你的核心技能：
1. **感官細節描寫**：用視覺、聽覺、嗅覺、觸覺、味覺來描述場景
2. **場景化敘事**：讓讀者「看見」而非「被告知」
3. **情緒共鳴**：喚起讀者對旅行的渴望
4. **避免陳腔濫調**：拒絕使用「夢幻」、「絕美」、「難忘」等空洞形容詞

寫作原則：
- 用「動詞」取代「形容詞」（「雪花旋轉著落下」而非「美麗的雪花」）
- 用「具體場景」取代「抽象概念」（「踩著雪吱吱作響」而非「體驗雪景」）
- 用「讀者視角」取代「商品視角」（「你將看見」而非「本行程提供」）

錯誤範例：「這是一趟夢幻的北海道之旅，風景絕美，令人難忘」
正確範例：「踩著雪吱吱作響，泡在露天溫泉看雪花飄落，品嚐剛捕撈的海膽」
`;
```

3. **Photographer Skill（用於 ImagePromptAgent）**

```typescript
export const PHOTOGRAPHER_SKILL = `
你是一位專業旅遊攝影師，專精於為 AI 圖片生成模型撰寫高品質提示詞。

你的核心技能：
1. **光線描述**：golden hour, blue hour, soft diffused light, dramatic side lighting
2. **構圖法則**：rule of thirds, leading lines, symmetry, negative space
3. **情緒氛圍**：serene, vibrant, intimate, dramatic, nostalgic
4. **技術細節**：camera angle, depth of field, color palette

提示詞結構（必須包含）：
1. 主體描述（20-30 字）
2. 光線和氛圍（15-20 字）
3. 構圖和視角（10-15 字）
4. 風格參考（10-15 字）

錯誤範例：「a photo of Hokkaido」
正確範例：「Snow-covered mountains in Hokkaido during golden hour, shot with rule of thirds, serene and peaceful atmosphere, soft pastel colors, Fujifilm film aesthetic, wide angle view」
`;
```

4. **Poet Skill（用於 PoeticAgent）**

```typescript
export const POET_SKILL = `
你是一位現代詩人，專精於旅行文學創作。

你的核心技能：
1. **精煉語言**：用最少的字傳達最多的意象
2. **對比張力**：用對比創造情緒（「寒冷的空氣，溫暖的溫泉」）
3. **留白藝術**：不要說滿，讓讀者有想像空間
4. **節奏感**：注意字數和韻律（中文 12-16 字最佳）

寫作原則：
- 用「動詞」取代「形容詞」
- 用「畫面」取代「說明」
- 用「暗示」取代「直述」

字數限制：嚴格 12-16 字（中文字）
風格：克制、精煉、有畫面感

錯誤範例：「在美麗的北海道，享受溫泉和美食，度過難忘的時光」（28 字，說明文）
正確範例：「雪落無聲，溫泉霧起」（8 字，詩意但太短）
正確範例：「踏雪尋溫泉，海風送來蟹香」（14 字，有畫面感）
`;
```

5. **Editor Skill（用於內容驗證）**

```typescript
export const EDITOR_SKILL = `
你是一位嚴格的編輯，負責審查內容品質。

你的核心技能：
1. **字數檢查**：嚴格執行字數限制（超過就退回重寫）
2. **原創性檢查**：檢測是否有抄襲或過度相似的內容
3. **一致性檢查**：確保風格、語氣、用詞一致
4. **事實核查**：確保地理、歷史、文化資訊正確

審查標準：
- 標題：20-30 字
- 描述：100-120 字
- 詩意文案：12-16 字
- Hero 副標題：30-40 字

如果不符合標準，回傳：{ pass: false, reason: "具體原因" }
如果符合標準，回傳：{ pass: true }
`;
```

6. **在各 Agent 中整合 Skill Prompting**

編輯以下檔案：
- `server/agents/contentAnalyzerAgent.ts`：引入 `COPYWRITER_SKILL`
- `server/agents/imagePromptAgent.ts`：引入 `PHOTOGRAPHER_SKILL`
- `server/agents/poeticAgent.ts`（新建）：引入 `POET_SKILL`

範例整合：

```typescript
// server/agents/contentAnalyzerAgent.ts
import { COPYWRITER_SKILL } from './skillLibrary';

export async function analyzeContent(scrapedData: ScrapedTourData) {
  const response = await invokeLLM({
    messages: [
      { role: "system", content: COPYWRITER_SKILL },
      { 
        role: "user", 
        content: `請改寫以下行程標題（嚴格 20-30 字）：\n\n原標題：${scrapedData.title}\n目的地：${scrapedData.destination}\n特色：${scrapedData.highlights.join(', ')}` 
      }
    ]
  });
  
  // 驗證字數
  const newTitle = response.choices[0].message.content;
  if (newTitle.length < 20 || newTitle.length > 30) {
    console.warn(`標題字數不符合要求：${newTitle.length} 字`);
    // 重試或使用 fallback
  }
  
  return newTitle;
}
```

**預期效果：**
- ✅ 內容品質提升 30-50%
- ✅ 風格一致性提升（因為有明確的技能框架）
- ✅ 原創性提升（避免 LLM 生成陳腔濫調）

---

## 🟡 高優先級：Prompt 優化與字數強限制（預計 2 小時）

### 任務 3：優化所有 Agent 的 Prompt

**問題分析：**
目前的 Prompt 只有「建議字數」（如「100-150 字」），但沒有「強制執行」。這會導致：
1. LLM 可能生成 200 字，破壞前端排版
2. 前端需要大量防禦性 CSS 來處理溢出

**解決方案：**
在 Prompt 中明確說明「嚴格限制」，並在 Agent 中加入「字數驗證」和「重試機制」。

**具體步驟：**

1. **ContentAnalyzerAgent 的 Prompt 優化**

```typescript
// 舊 Prompt
const prompt = `請改寫以下行程標題，字數約 20-30 字`;

// 新 Prompt（加入強限制）
const prompt = `
請改寫以下行程標題。

嚴格要求：
- 字數：必須在 20-30 字之間（中文字）
- 如果少於 20 字，會被退回重寫
- 如果超過 30 字，會被強制截斷
- 請在生成後自行檢查字數

原標題：${scrapedData.title}
目的地：${scrapedData.destination}
特色：${scrapedData.highlights.join(', ')}
`;
```

2. **加入字數驗證和重試機制**

```typescript
async function generateTitleWithRetry(scrapedData: ScrapedTourData, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    const title = await generateTitle(scrapedData);
    
    // 驗證字數
    if (title.length >= 20 && title.length <= 30) {
      return title;
    }
    
    console.warn(`第 ${i + 1} 次生成的標題字數不符：${title.length} 字`);
  }
  
  // 如果重試失敗，強制截斷或使用 fallback
  const title = await generateTitle(scrapedData);
  return title.length > 30 ? title.substring(0, 30) + '...' : title;
}
```

3. **所有需要優化的 Prompt 清單**

| Agent | 欄位 | 舊限制 | 新限制 | 驗證方式 |
|-------|------|--------|--------|----------|
| ContentAnalyzerAgent | 標題 | 約 20-30 字 | **嚴格** 20-30 字 | 字數檢查 + 重試 |
| ContentAnalyzerAgent | 描述 | 約 100-150 字 | **嚴格** 100-120 字 | 字數檢查 + 截斷 |
| ContentAnalyzerAgent | Hero 副標題 | 無限制 | **嚴格** 30-40 字 | 字數檢查 + 重試 |
| PoeticAgent | 詩意文案 | 約 12-16 字 | **嚴格** 12-16 字 | 字數檢查 + 重試 |
| ImagePromptAgent | 提示詞 | 無限制 | **建議** 80-120 字 | 警告（不強制） |

**預期效果：**
- ✅ 前端排版不會被破壞
- ✅ 減少防禦性 CSS 的需求
- ✅ 提升內容品質（強迫 LLM 精煉語言）

---

## 🟡 高優先級：Fallback 機制與 Partial Success（預計 2 小時）

### 任務 4：加入 Fallback 機制

**問題分析：**
目前如果 WebScraperAgent 沒有抓到某些資料（如「飯店名稱」），下游的 Agent 可能會「幻覺」（hallucinate）出假資料。這在旅遊業是嚴重的風險。

**解決方案：**
在 Prompt 中明確說明「如果資料不足，回傳 null」，並在 Agent 中加入「資料驗證」。

**具體步驟：**

1. **優化 WebScraperAgent 的 Prompt**

```typescript
// 舊 Prompt
const prompt = `請從以下網頁內容中提取行程資訊...`;

// 新 Prompt（加入 Fallback 指示）
const prompt = `
請從以下網頁內容中提取行程資訊。

重要原則：
- 只提取「明確存在」的資訊
- 如果某個欄位找不到，回傳 null（不要猜測或編造）
- 如果整個網頁都無法解析，回傳 { error: "無法解析網頁" }

網頁內容：
${webPageContent}
`;
```

2. **在 ContentAnalyzerAgent 中加入資料驗證**

```typescript
export async function analyzeContent(scrapedData: ScrapedTourData) {
  // 檢查必要欄位
  if (!scrapedData.title || !scrapedData.destination) {
    return {
      success: false,
      error: "缺少必要欄位（標題或目的地）",
      data: null
    };
  }
  
  // 如果描述為空，使用 fallback
  const description = scrapedData.description || "精彩的旅程等待您探索";
  
  // 繼續處理...
}
```

3. **實作 Partial Success 機制**

**問題：** 目前如果 ImageGenerationAgent 失敗，整個行程生成就失敗。

**解決方案：** 即使圖片生成失敗，也要能儲存行程（使用 placeholder 圖片）。

```typescript
// server/agents/masterAgent.ts
export async function orchestrateGeneration(jobData: TourGenerationJobData) {
  try {
    // Step 1: Scraping
    const scrapedData = await WebScraperAgent.execute(jobData.url);
    if (!scrapedData.success) {
      return { success: false, error: "爬蟲失敗" };
    }
    
    // Step 2: Content Analysis
    const analyzedContent = await ContentAnalyzerAgent.execute(scrapedData.data);
    if (!analyzedContent.success) {
      return { success: false, error: "內容分析失敗" };
    }
    
    // Step 3: Image Generation（允許失敗）
    let images = null;
    try {
      images = await ImageGenerationAgent.execute(analyzedContent.data);
    } catch (error) {
      console.error("圖片生成失敗，使用 placeholder", error);
      images = {
        heroImage: "https://via.placeholder.com/1920x1080",
        highlightImages: []
      };
    }
    
    // Step 4: 組裝最終資料（即使圖片失敗也能繼續）
    return {
      success: true,
      data: {
        ...analyzedContent.data,
        ...images
      }
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

**預期效果：**
- ✅ 避免幻覺（LLM 不會編造假資料）
- ✅ 提升系統穩定性（部分失敗不會導致全失敗）
- ✅ 更好的錯誤訊息（告訴用戶哪個步驟失敗）

---

## 🟢 中優先級：防禦性 CSS 排版（預計 2 小時）

### 任務 5：實作防禦性 CSS

**問題分析：**
即使我們在 Prompt 中加入字數限制，LLM 仍可能偶爾「超標」。前端需要防禦性 CSS 來處理這些邊界情況。

**解決方案：**
實作以下 CSS 防護機制：
1. 圖片：`object-fit: cover` + 固定長寬比
2. 文字：`line-clamp` 截斷
3. 手機版：橫排 + 單欄

**具體步驟：**

1. **圖片防護（固定長寬比）**

```css
/* client/src/pages/TourDetail.css */
.hero-image {
  width: 100%;
  height: 60vh; /* 固定高度 */
  object-fit: cover; /* 裁切而非變形 */
  object-position: center; /* 居中裁切 */
}

.highlight-image {
  width: 100%;
  aspect-ratio: 4 / 3; /* 固定長寬比 */
  object-fit: cover;
}
```

2. **文字截斷（line-clamp）**

```css
/* 標題：最多 2 行 */
.tour-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 描述：最多 4 行 */
.tour-description {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 詩意文案：最多 1 行 */
.poetic-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

3. **直式標題的響應式處理**

```css
/* 桌面版：直排 */
.vertical-title {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-size: 3rem;
  letter-spacing: 0.5rem;
}

/* 手機版：改回橫排 */
@media (max-width: 768px) {
  .vertical-title {
    writing-mode: horizontal-tb; /* 改回橫排 */
    font-size: 2rem;
    letter-spacing: 0.2rem;
  }
}
```

4. **Zigzag 佈局的響應式處理**

```css
/* 桌面版：左右交錯 */
.zigzag-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

.zigzag-section:nth-child(even) {
  direction: rtl; /* 偶數行反轉 */
}

/* 手機版：單欄 */
@media (max-width: 768px) {
  .zigzag-section {
    grid-template-columns: 1fr; /* 單欄 */
    gap: 2rem;
  }
  
  .zigzag-section:nth-child(even) {
    direction: ltr; /* 取消反轉 */
  }
}
```

**預期效果：**
- ✅ 即使 LLM 生成超長內容，排版也不會破壞
- ✅ 手機版體驗良好（不會出現橫向捲軸）
- ✅ 圖片不會變形（保持美觀）

---

## 🟢 中優先級：CSS @media print 支援（預計 1 小時）

### 任務 6：實作 CSS @media print

**問題分析：**
原本計畫使用 Puppeteer 生成 PDF，但這是「高成本、低回報」的方案：
- 開發時間：3-5 小時
- 伺服器負擔：每次生成 PDF 需要啟動 Headless Browser
- 維護成本：Puppeteer 版本更新、字體問題、排版問題

**解決方案：**
使用 CSS `@media print` + 瀏覽器原生列印功能，開發時間只需 1 小時。

**具體步驟：**

1. **創建 print.css**

```css
/* client/src/print.css */
@media print {
  /* 隱藏不需要列印的元素 */
  header,
  footer,
  .navbar,
  .sidebar,
  .action-buttons,
  .back-button {
    display: none !important;
  }
  
  /* 確保內容不被截斷 */
  .tour-section {
    page-break-inside: avoid;
  }
  
  /* Hero 區域佔滿第一頁 */
  .hero-section {
    page-break-after: always;
  }
  
  /* 調整字體大小（列印時通常需要小一點） */
  body {
    font-size: 12pt;
    line-height: 1.5;
  }
  
  h1 { font-size: 24pt; }
  h2 { font-size: 18pt; }
  h3 { font-size: 14pt; }
  
  /* 確保圖片不會太大 */
  img {
    max-width: 100%;
    page-break-inside: avoid;
  }
  
  /* 移除背景色（節省墨水） */
  * {
    background: white !important;
    color: black !important;
  }
  
  /* 保留重要的背景色（如 Hero 區域） */
  .hero-section {
    background: var(--hero-bg-color) !important;
  }
}
```

2. **在 TourDetail 頁面引入 print.css**

```tsx
// client/src/pages/TourDetail.tsx
import './print.css';
```

3. **添加「下載 PDF」按鈕**

```tsx
// client/src/pages/TourDetail.tsx
export default function TourDetail() {
  const handleDownloadPDF = () => {
    window.print(); // 呼叫瀏覽器原生列印對話框
  };
  
  return (
    <div>
      <button onClick={handleDownloadPDF} className="action-buttons">
        下載 PDF
      </button>
      {/* 其他內容 */}
    </div>
  );
}
```

4. **測試列印效果**
   - 在瀏覽器中打開行程詳情頁面
   - 按 Ctrl+P（或 Cmd+P）
   - 選擇「另存為 PDF」
   - 檢查排版是否正確

**預期效果：**
- ✅ 開發時間只需 1 小時（vs Puppeteer 的 3-5 小時）
- ✅ 零伺服器負擔（由用戶的瀏覽器處理）
- ✅ 零維護成本（瀏覽器自動更新）
- ✅ 90% 的使用者需求已滿足

---

## 🔵 低優先級（如果時間允許，預計 2 小時）

### 任務 7：建立專門的 Agent（可選）

目前 ContentAnalyzerAgent 負責所有內容生成（標題、描述、亮點、詩意文案等），職責過於龐大。可以考慮拆分成：

1. **AttractionAgent**：專門生成「景點介紹」
2. **HotelAgent**：專門生成「住宿介紹」
3. **MealAgent**：專門生成「餐飲介紹」
4. **FlightAgent**：專門生成「航班資訊」
5. **PoeticAgent**：專門生成「詩意文案」

**優點：**
- 每個 Agent 職責單一，更容易優化
- 可以針對不同類型的內容使用不同的 Skill Prompt

**缺點：**
- 增加系統複雜度
- 增加 LLM API 調用次數（成本上升）

**建議：** 先完成前面的核心任務，如果時間充裕再考慮實作。

---

## 📊 時間分配與優先級

| 任務 | 優先級 | 預計時間 | 累計時間 |
|------|--------|----------|----------|
| 1. 移除 DesignLearningAgent Runtime 依賴 | 🔴 Critical | 30 分鐘 | 0.5 小時 |
| 2. 建立 Skill Library | 🟡 High | 3 小時 | 3.5 小時 |
| 3. Prompt 優化與字數強限制 | 🟡 High | 2 小時 | 5.5 小時 |
| 4. Fallback 機制與 Partial Success | 🟡 High | 2 小時 | 7.5 小時 |
| 5. 防禦性 CSS 排版 | 🟢 Medium | 2 小時 | 9.5 小時 |
| 6. CSS @media print 支援 | 🟢 Medium | 1 小時 | 10.5 小時 |
| 7. 建立專門的 Agent（可選） | 🔵 Low | 2 小時 | 12.5 小時 |

**核心任務（必須完成）：** 7.5 小時  
**核心 + 前端優化：** 10.5 小時  
**全部任務：** 12.5 小時

---

## ✅ 驗收標準

### Critical Fix 驗收：
- [ ] Master Agent 不再調用 DesignLearningAgent
- [ ] 使用 DEFAULT_DESIGN_GUIDELINES.ts 作為設計規範
- [ ] 行程生成時間減少 15-30 秒

### Skill Prompting 驗收：
- [ ] skillLibrary.ts 包含 5 種 Skill Prompt
- [ ] ContentAnalyzerAgent 使用 COPYWRITER_SKILL
- [ ] ImagePromptAgent 使用 PHOTOGRAPHER_SKILL
- [ ] 生成的內容品質明顯提升（需人工評估）

### Prompt 優化驗收：
- [ ] 所有 Prompt 都有「嚴格字數限制」
- [ ] 所有 Agent 都有「字數驗證」機制
- [ ] 超過字數限制時會「重試」或「截斷」

### Fallback 機制驗收：
- [ ] WebScraperAgent 的 Prompt 包含「資料不足回傳 null」指示
- [ ] ContentAnalyzerAgent 有資料驗證機制
- [ ] Master Agent 實作 Partial Success（圖片失敗不影響行程儲存）

### 防禦性 CSS 驗收：
- [ ] 圖片使用 object-fit: cover
- [ ] 文字使用 line-clamp 截斷
- [ ] 手機版使用橫排佈局
- [ ] 測試超長內容不會破壞排版

### CSS @media print 驗收：
- [ ] print.css 已創建並引入
- [ ] 列印時隱藏 navbar、footer、按鈕
- [ ] 列印時保持排版美觀
- [ ] 「下載 PDF」按鈕正常運作

---

## 📝 開發流程建議

### 上午（9:00-12:00）：Critical Fix + Skill Prompting
1. **9:00-9:30**：移除 DesignLearningAgent Runtime 依賴
2. **9:30-12:00**：建立 Skill Library（2.5 小時）
3. **12:00-13:00**：午休

### 下午（13:00-18:00）：Prompt 優化 + Fallback 機制
4. **13:00-15:00**：Prompt 優化與字數強限制
5. **15:00-17:00**：Fallback 機制與 Partial Success
6. **17:00-18:00**：測試與驗證

### 晚上（19:00-22:00）：前端優化（可選）
7. **19:00-21:00**：防禦性 CSS 排版
8. **21:00-22:00**：CSS @media print 支援

---

## 🚀 下一步建議

完成以上任務後，建議進行以下測試：

1. **端到端測試**：使用真實的旅行社 URL（Lion Travel、KKday）生成行程
2. **壓力測試**：同時生成 5 個行程，測試 BullMQ 的並發處理
3. **品質評估**：比較「使用 Skill Prompting 前後」的內容品質
4. **效能評估**：測量「移除 DesignLearningAgent 前後」的生成時間

---

**作者：** Manus AI  
**最後更新：** 2026-01-25  
**版本：** 1.0
