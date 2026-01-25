# 明天待辦事項（2026-01-26）

## 📋 工作清單

### 🔴 第一優先：建立專門的 Agent（預計 2-3 小時）

#### 1. AttractionAgent（30 分鐘）
**檔案位置：** `server/agents/attractionAgent.ts`

**功能：**
- 生成景點深度介紹（100-200 字）
- 生成詩意副標題（例如：「火山灰封、時光凝結的歷史見證—龐貝古城」）
- 為每個景點生成圖片

**返回格式：**
```json
{
  "name": "龐貝古城",
  "nameEn": "Pompei",
  "poeticSubtitle": "火山灰封、時光凝結的歷史見證—龐貝古城，千年火山巨瞳下的羅馬繁華，訴說維蘇威火山下的永恆一瞬與滄桑。",
  "description": "沒有任何地方能像龐貝一樣，將時光瞬間凝固。西元79年，維蘇威火山的驟然噴發，將這座繁華的羅馬城市封存於火山灰下...",
  "image": "https://...",
  "imageAlt": "龐貝古城",
  "tags": ["入內參觀"]
}
```

---

#### 2. HotelAgent（30 分鐘）
**檔案位置：** `server/agents/hotelAgent.ts`

**功能：**
- 生成飯店介紹（100-150 字）
- 包含星級、特色、體驗描述
- 為每個飯店生成圖片

**返回格式：**
```json
{
  "name": "Royal Continental Hotel",
  "stars": 4,
  "description": "位於拿坡里市中心，享有維蘇威火山和那不勒斯灣的壯麗景色...",
  "image": "https://...",
  "imageAlt": "Royal Continental Hotel"
}
```

---

#### 3. MealAgent（20 分鐘）
**檔案位置：** `server/agents/mealAgent.ts`

**功能：**
- 生成餐食介紹
- 為每個餐食生成圖片

**返回格式：**
```json
{
  "breakfast": "飯店內享用早餐",
  "lunch": "龐貝地方料理",
  "dinner": "拿坡里地方料理"
}
```

---

#### 4. FlightAgent（20 分鐘）
**檔案位置：** `server/agents/flightAgent.ts`

**功能：**
- 生成航班資訊
- 包含航空公司、航班號、時間、飛行時數

**返回格式：**
```json
{
  "outbound": [
    {
      "airline": "土耳其航空",
      "flightNumber": "TK025",
      "departure": {"airport": "台北 TPE", "date": "2026/03/15", "time": "22:10"},
      "arrival": {"airport": "伊斯坦堡 IST", "date": "2026/03/16", "time": "05:50"},
      "duration": "12:40"
    }
  ],
  "inbound": [...]
}
```

---

#### 5. PoeticAgent（30 分鐘）
**檔案位置：** `server/agents/poeticAgent.ts`

**功能：**
- 生成詩意副標題（例如：「越獅境踏野原魂，追遷徙逐天地心」）
- 生成每日行程的詩意開場白

**返回格式：**
```json
{
  "poeticSubtitle": "越獅境踏野原魂，追遷徙逐天地心",
  "dailyIntros": [
    {
      "day": 1,
      "intro": "乘著雪白的羽翼伴隨悸動期待的心情，啟程。童話中想像的一切在心底盤旋，遙想歐洲國度的萬種風情..."
    }
  ]
}
```

---

#### 6. 更新 Master Agent（30 分鐘）
**檔案位置：** `server/agents/masterAgent.ts`

**功能：**
- 協調所有新的 Agent（Attraction, Hotel, Meal, Flight, Poetic）
- 更新進度追蹤（增加新的步驟）
- 更新錯誤處理機制

**新的執行流程：**
```
Step 1: Web Scraper Agent（10%）
Step 2: Content Analyzer Agent（20%）
Step 3: Poetic Agent（30%）
Step 4: Attraction Agent（40%）
Step 5: Hotel Agent（50%）
Step 6: Meal Agent（55%）
Step 7: Flight Agent（60%）
Step 8: Color Theme Agent（65%）
Step 9: Image Prompt Agent（70%）
Step 10: Image Generation Agent（85%）
Step 11: 最終資料組裝（95%）
Step 12: 儲存至資料庫（100%）
```

---

### 🔴 第二優先：Agent 自動學習排版和風格（預計 1-2 小時）

#### 7. DesignLearningAgent（新需求）
**檔案位置：** `server/agents/designLearningAgent.ts`

**功能：**
- 從參考網站（sipincollection.com）抓取排版結構
- 分析配色方案、字體大小、間距、佈局
- 學習圖片與文字的比例和排列方式
- 生成設計規範（Design Guidelines）並儲存至資料庫或配置檔案

**實作步驟：**
1. 使用 Puppeteer 或 Playwright 抓取參考網站的 HTML 和 CSS
2. 使用 LLM 分析排版結構和設計規範
3. 提取關鍵設計元素：
   - 配色方案（主色、輔助色、強調色）
   - 字體大小和行高
   - 間距和留白
   - 圖片與文字的比例
   - 區塊排列方式（左右交錯、上下堆疊）
4. 生成設計規範 JSON 並儲存至配置檔案或資料庫

**返回格式：**
```json
{
  "colorScheme": {
    "primary": "#C9B8A8",
    "secondary": "#FFFFFF",
    "accent": "#8B7355",
    "text": "#333333",
    "background": "#F5F5F5"
  },
  "typography": {
    "titleSize": "2.5rem",
    "subtitleSize": "1.5rem",
    "bodySize": "1rem",
    "lineHeight": 1.8
  },
  "layout": {
    "heroImageHeight": "100vh",
    "contentMaxWidth": "1200px",
    "sectionPadding": "4rem",
    "imageTextRatio": "50:50",
    "alternatingLayout": true
  },
  "spacing": {
    "sectionGap": "6rem",
    "paragraphGap": "1.5rem",
    "imageMargin": "2rem"
  }
}
```

---

#### 8. 整合到 Master Agent
**檔案位置：** `server/agents/masterAgent.ts`

**功能：**
- 在生成行程前，先調用 DesignLearningAgent 學習參考網站
- 將學習到的設計規範傳遞給其他 Agent
- 確保生成的內容符合學習到的風格

**新的執行流程：**
```
Step 0: Design Learning Agent（5%）← 新增
Step 1: Web Scraper Agent（10%）
Step 2: Content Analyzer Agent（20%）
...
```

---

#### 9. 建立設計規範資料表
**資料表名稱：** `design_guidelines`

**欄位：**
```sql
CREATE TABLE design_guidelines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  referenceUrl VARCHAR(512), -- 參考網站 URL
  colorScheme TEXT, -- JSON: 配色方案
  typography TEXT, -- JSON: 字體設定
  layout TEXT, -- JSON: 佈局規則
  spacing TEXT, -- JSON: 間距設定
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 🔴 第三優先：重新設計行程詳情頁面（預計 3-4 小時）

#### 10. Hero 區域（1 小時）
**檔案位置：** `client/src/pages/TourDetail.tsx`

**功能：**
- 全螢幕 Hero 圖片
- 右側資訊卡片（米色背景）
- 標題、副標題、天數、價格、按鈕

**參考設計：**
```jsx
<section className="relative h-screen">
  {/* Hero 圖片 */}
  <img src={tour.heroImage} className="w-full h-full object-cover" />
  
  {/* 右側資訊卡片 */}
  <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-[#C9B8A8] p-8 rounded-lg">
    <h1 className="text-3xl font-serif">{tour.title}</h1>
    <p className="text-xl mt-2">{tour.heroSubtitle}</p>
    <div className="text-4xl font-bold mt-4">{tour.duration} Days</div>
    <div className="text-2xl mt-4">${tour.price}</div>
    <button className="mt-6 bg-white px-8 py-3">立即報名</button>
  </div>
</section>
```

---

#### 11. 航班資訊區塊（30 分鐘）
**檔案位置：** `client/src/pages/TourDetail.tsx`

**功能：**
- 清晰的表格設計
- 去程/回程分開顯示
- 景點距離參考

**參考設計：**
```jsx
<section className="py-16 bg-white">
  <h2 className="text-3xl font-serif text-center mb-8">航班資訊</h2>
  <table className="w-full max-w-6xl mx-auto">
    <thead>
      <tr>
        <th>搭乘班機</th>
        <th>出發</th>
        <th>日期</th>
        <th>時間</th>
        <th>飛行時數</th>
        <th>抵達</th>
        <th>日期</th>
        <th>時間</th>
      </tr>
    </thead>
    <tbody>
      {/* 去程 */}
      {/* 回程 */}
    </tbody>
  </table>
</section>
```

---

#### 12. 每日行程區塊（2 小時）
**檔案位置：** `client/src/pages/TourDetail.tsx`

**功能：**
- 左側天數導航（固定在左側，可快速跳轉）
- 每日標題 + 詩意文案
- 景點區塊（左右交錯佈局）

**參考設計：**
```jsx
<section className="py-16 bg-gray-50">
  {/* 左側天數導航 */}
  <div className="fixed left-8 top-1/2 -translate-y-1/2">
    {[1, 2, 3, ...].map(day => (
      <button key={day} className="block mb-4 px-4 py-2 bg-white">
        Day {day}
      </button>
    ))}
  </div>
  
  {/* 每日行程內容 */}
  <div className="max-w-6xl mx-auto ml-32">
    {dailyItinerary.map((day, index) => (
      <div key={day.day} id={`day-${day.day}`}>
        {/* 每日標題 */}
        <h2 className="text-4xl font-serif">{day.title}</h2>
        <p className="text-xl mt-4 text-gray-600">{day.intro}</p>
        
        {/* 景點區塊（左右交錯） */}
        {day.attractions.map((attraction, i) => (
          <div key={i} className={`flex gap-8 mt-16 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}>
            {/* 圖片 */}
            <img src={attraction.image} className="w-1/2 h-96 object-cover" />
            
            {/* 文字 */}
            <div className="w-1/2">
              <h3 className="text-2xl font-serif">{attraction.name}</h3>
              <p className="text-lg text-gray-600 mt-2">{attraction.poeticSubtitle}</p>
              <p className="mt-4 leading-relaxed">{attraction.description}</p>
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
</section>
```

---

#### 13. 配色主題和直式標題（30 分鐘）
**檔案位置：** `client/src/pages/TourDetail.tsx`

**功能：**
- 使用 AI 生成的配色主題
- 不同區塊使用不同背景顏色
- 增加直式標題

**參考設計：**
```jsx
{/* 使用 AI 生成的配色主題 */}
<section style={{ backgroundColor: colorTheme.background }}>
  {/* 直式標題 */}
  <h2 className="writing-mode-vertical text-4xl font-serif">
    景點介紹
  </h2>
</section>

{/* CSS */}
<style>
  .writing-mode-vertical {
    writing-mode: vertical-rl;
    text-orientation: upright;
  }
</style>
```

---

### 🟡 第四優先：測試和優化（預計 1-2 小時）

#### 14. 測試完整生成流程
- 使用真實的旅遊網站 URL（雄獅旅遊、KKday）
- 驗證所有 Agent 是否正常運作
- 檢查生成的內容品質

#### 15. 調整 LLM prompt 優化內容品質
- 根據測試結果調整 prompt
- 加強標題的吸引力
- 優化描述的結構
- 改善關鍵特色的排版

#### 16. 修復 bug 和儲存 checkpoint
- 修復測試中發現的 bug
- 儲存 checkpoint

---

### 🟢 第五優先：行程下載功能（如果時間允許）

#### 17. 實作行程下載為 PDF 功能
- 使用 Puppeteer 或 WeasyPrint 生成 PDF
- 包含完整行程資訊、景點介紹、飯店資訊、航班資訊
- PDF 格式參考 sipincollection.com 的設計（包含大量圖片）

#### 18. 新增下載按鈕和測試
- 在行程詳情頁面新增「行程下載」按鈕
- 測試 PDF 生成功能

---

## 📊 預計時間分配

| 任務 | 預計時間 | 優先級 |
|------|---------|--------|
| 建立 5 個專門的 Agent | 2-3 小時 | 🔴 高 |
| Agent 自動學習排版和風格 | 1-2 小時 | 🔴 高 |
| 重新設計行程詳情頁面 | 3-4 小時 | 🔴 高 |
| 測試和優化 | 1-2 小時 | 🟡 中 |
| 行程下載功能 | 2-3 小時 | 🟢 低 |

**總計：** 9-14 小時

---

## 🎯 成功標準

1. ✅ 所有 5 個專門的 Agent 都能正常運作
2. ✅ DesignLearningAgent 能成功學習參考網站的排版和風格
3. ✅ 行程詳情頁面的設計符合 sipincollection.com 的風格
4. ✅ 測試生成的行程內容品質達到 90 分以上
5. ✅ 所有 TypeScript 錯誤已修復
6. ✅ 儲存 checkpoint

---

## 📝 備註

- 如果時間不夠，可以先完成前 3 個高優先級任務
- 行程下載功能可以延後到下次實作
- 重點是確保 Agent 的品質和行程詳情頁面的設計


---

## 🆕 新增需求（根據用戶反饋）

### 需求 1：重新設計行程詳情頁面的具體設計稿或流程圖

**目標：** 在開始實作前，先建立完整的設計稿和流程圖，確保實作方向正確。

**待辦項目：**
- [ ] 建立完整的設計稿（Figma 或 Markdown + 截圖）
  - Hero 區域的佈局和元素配置
  - 航班資訊表格的樣式
  - 每日行程區塊的交錯式佈局
  - 配色主題和直式標題的應用
- [ ] 繪製流程圖（如何從資料庫讀取資料 → 如何渲染到頁面）
- [ ] 標註關鍵尺寸、間距、字體大小

**預計時間：** 1-2 小時

---

### 需求 2：行程下載功能的檔案格式和內容說明

**目標：** 明確定義行程下載功能支援的檔案格式和包含的內容。

**支援的檔案格式：**
1. **PDF**（主要格式）
   - 包含完整行程資訊、景點介紹、飯店資訊、航班資訊、大量圖片
   - 參考 sipincollection.com 的 PDF 設計
   - 使用 Puppeteer 或 WeasyPrint 生成

2. **Word**（可編輯格式，如果時間允許）
   - 使用 docx 庫生成
   - 包含相同的內容，但格式較簡單

**PDF 內容包含：**
- **封面**：Hero 圖片 + 標題 + 副標題 + 天數 + 價格
- **航班資訊表格**：去程/回程的航班詳情
- **每日行程**：
  - 每日標題 + 詩意開場白
  - 景點介紹（名稱 + 詩意副標題 + 深度介紹 + 圖片）
  - 飯店資訊（名稱 + 星級 + 描述 + 圖片）
  - 餐食資訊（早餐 + 午餐 + 晚餐）
- **配色主題**：應用到 PDF 的背景和文字顏色

**技術實作方式：**
- 使用 Puppeteer 從 HTML 渲染 PDF
- 或使用 WeasyPrint 從 HTML + CSS 生成 PDF
- 確保圖片高解析度和排版美觀

**預計時間：** 2-3 小時

---

### 需求 3：DesignLearningAgent 的技術細節和學習步驟

**目標：** 詳細說明 DesignLearningAgent 如何從 sipincollection.com 學習排版和風格。

**學習步驟：**

#### 步驟 1：抓取網頁內容（15 分鐘）
- 使用 Puppeteer 或 Playwright 打開參考網站
- 截取網頁截圖（用於視覺分析）
- 提取 HTML 結構和 CSS 樣式

```typescript
async function scrapeDesign(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  // 截取網頁截圖
  const screenshot = await page.screenshot({ fullPage: true });
  
  // 提取 HTML
  const html = await page.content();
  
  // 提取 CSS
  const styles = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    return sheets.map(sheet => {
      try {
        return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
      } catch (e) {
        return '';
      }
    }).join('\n');
  });
  
  await browser.close();
  return { screenshot, html, styles };
}
```

#### 步驟 2：分析設計元素（30 分鐘）
- 使用 LLM 分析網頁截圖，識別：
  - **配色方案**：主色、輔助色、強調色
  - **字體大小和行高**：標題、副標題、正文
  - **間距和留白**：section padding、paragraph gap
  - **圖片與文字的比例**：50:50、60:40 等
  - **區塊排列方式**：左右交錯、上下堆疊

```typescript
async function analyzeDesign(screenshot: Buffer, html: string, styles: string) {
  const prompt = `
    分析這個網頁的設計元素，並提取以下資訊：
    1. 配色方案（主色、輔助色、強調色、文字顏色、背景顏色）
    2. 字體大小和行高（標題、副標題、正文）
    3. 間距和留白（section padding、paragraph gap、image margin）
    4. 圖片與文字的比例（例如：50:50、60:40）
    5. 區塊排列方式（左右交錯、上下堆疊）
    
    請以 JSON 格式返回結果。
  `;
  
  const result = await invokeLLM({
    messages: [
      { role: 'system', content: 'You are a design analysis expert.' },
      { role: 'user', content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${screenshot.toString('base64')}` } }
      ]}
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'design_analysis',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            colorScheme: { type: 'object' },
            typography: { type: 'object' },
            spacing: { type: 'object' },
            layout: { type: 'object' }
          }
        }
      }
    }
  });
  
  return JSON.parse(result.choices[0].message.content);
}
```

#### 步驟 3：生成設計規範（15 分鐘）
- 將分析結果整理成 JSON 格式
- 儲存至資料庫或配置檔案
- 供其他 Agent 和前端頁面使用

```typescript
interface DesignGuideline {
  referenceUrl: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textLight: string;
    background: string;
    backgroundDark: string;
  };
  typography: {
    titleSize: string;
    subtitleSize: string;
    bodySize: string;
    lineHeight: number;
  };
  layout: {
    heroImageHeight: string;
    contentMaxWidth: string;
    sectionPadding: string;
    imageTextRatio: string;
    alternatingLayout: boolean;
  };
  spacing: {
    sectionGap: string;
    paragraphGap: string;
    imageMargin: string;
  };
}

async function saveDesignGuideline(guideline: DesignGuideline) {
  await db.insert(designGuidelines).values({
    referenceUrl: guideline.referenceUrl,
    colorScheme: JSON.stringify(guideline.colorScheme),
    typography: JSON.stringify(guideline.typography),
    layout: JSON.stringify(guideline.layout),
    spacing: JSON.stringify(guideline.spacing)
  });
}
```

#### 步驟 4：應用設計規範（30 分鐘）
- 在生成行程時，先調用 DesignLearningAgent
- 將學習到的設計規範傳遞給 Master Agent
- Master Agent 將設計規範傳遞給其他 Agent（Attraction, Hotel, etc.）
- 前端頁面根據設計規範渲染內容

```typescript
// 在 Master Agent 中
async function execute(data: TourGenerationData) {
  // Step 0: 學習設計規範
  const designGuideline = await DesignLearningAgent.learn('https://sipincollection.com/...');
  
  // Step 1-11: 其他 Agent 執行
  // ...
  
  // 將設計規範傳遞給前端
  return {
    ...tourData,
    designGuideline
  };
}
```

```tsx
// 在前端頁面中
function TourDetail() {
  const { data: tour } = trpc.tours.getById.useQuery({ id });
  const designGuideline = tour.designGuideline;
  
  return (
    <div style={{
      '--primary-color': designGuideline.colorScheme.primary,
      '--secondary-color': designGuideline.colorScheme.secondary,
      '--title-size': designGuideline.typography.titleSize,
      '--section-padding': designGuideline.spacing.sectionPadding
    }}>
      {/* 使用 CSS 變數應用設計規範 */}
    </div>
  );
}
```

**資料庫 Schema：**
```sql
CREATE TABLE design_guidelines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  referenceUrl VARCHAR(512),
  colorScheme TEXT,
  typography TEXT,
  layout TEXT,
  spacing TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**預計時間：** 1.5-2 小時

---

## 📊 更新後的時間分配

| 任務 | 預計時間 | 優先級 |
|------|---------|--------|
| 重新設計行程詳情頁面的設計稿 | 1-2 小時 | 🔴 高 |
| DesignLearningAgent 技術實作 | 1.5-2 小時 | 🔴 高 |
| 建立 5 個專門的 Agent | 2-3 小時 | 🔴 高 |
| 重新設計行程詳情頁面（前端實作） | 3-4 小時 | 🔴 高 |
| 行程下載功能（PDF） | 2-3 小時 | 🟡 中 |
| 測試和優化 | 1-2 小時 | 🟡 中 |

**總計：** 11-16 小時

---

## 🎯 更新後的成功標準

1. ✅ 完成行程詳情頁面的設計稿和流程圖
2. ✅ DesignLearningAgent 能成功學習參考網站的排版和風格
3. ✅ 所有 5 個專門的 Agent 都能正常運作
4. ✅ 行程詳情頁面的設計符合 sipincollection.com 的風格
5. ✅ 行程下載功能（PDF）能正常運作
6. ✅ 測試生成的行程內容品質達到 90 分以上
7. ✅ 所有 TypeScript 錯誤已修復
8. ✅ 儲存 checkpoint
