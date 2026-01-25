# 資料庫擴充計劃 - 行程詳情頁面設計風格

## 概述

為了實現類似璽品旅遊網站的高端行程詳情頁面，我們需要在現有的 `tours` 表中新增以下欄位，以支援動態配色、Hero 圖片、行程亮點和關鍵特色等功能。

## 新增欄位定義

### 1. Hero 區域相關欄位

```typescript
// Hero 圖片 - 全屏大圖背景
heroImage: varchar("heroImage", { length: 512 }),
// Hero 圖片的替代文字（用於 SEO 和無障礙）
heroImageAlt: varchar("heroImageAlt", { length: 255 }),
// Hero 副標題 - 行程亮點摘要（用點號分隔）
heroSubtitle: text("heroSubtitle"),
```

**資料範例：**
```json
{
  "heroImage": "https://storage.packgo.com/tours/hokkaido-niseko-hero.jpg",
  "heroImageAlt": "北海道二世谷雅奢酒店全景",
  "heroSubtitle": "保證入住米其林一星鑰旅宿２晚．北海道三大溫泉鄉．洞爺湖心中島探索．二世谷深度漫遊．札幌市區全日自由行"
}
```

### 2. 配色主題欄位

```typescript
// 配色主題 - JSON 格式儲存主色、輔助色、點綴色等
colorTheme: text("colorTheme"),
```

**資料結構：**
```json
{
  "primary": "#4A90E2",        // 主色（深藍色）
  "secondary": "#7FB3D5",      // 輔助色（天空藍）
  "accent": "#F39C12",         // 點綴色（金色）
  "text": "#2C3E50",           // 文字色（深灰）
  "textLight": "#ECF0F1",      // 淺色文字（用於深色背景）
  "background": "#F5F5F5",     // 背景色（淺灰）
  "backgroundDark": "#2C3E50"  // 深色背景
}
```

**配色方案範例：**

| 目的地類型 | 主色 | 輔助色 | 點綴色 | 適用行程 |
|---------|------|--------|--------|---------|
| 日本 | #FFB6C1 (櫻花粉) | #4A90E2 (富士藍) | #F39C12 (金色) | 日本各地行程 |
| 歐洲 | #D4AF37 (古典金) | #9B59B6 (優雅紫) | #E74C3C (酒紅) | 歐洲各國行程 |
| 東南亞 | #27AE60 (熱帶綠) | #F39C12 (陽光橙) | #3498DB (海洋藍) | 泰國、峇里島等 |
| 北美 | #E74C3C (楓葉紅) | #3498DB (天空藍) | #F39C12 (金色) | 美國、加拿大 |
| 澳洲 | #2980B9 (海洋藍) | #E67E22 (沙漠橙) | #27AE60 (綠色) | 澳洲、紐西蘭 |
| 北海道 | #4A90E2 (深藍) | #7FB3D5 (天空藍) | #F39C12 (金色) | 北海道行程 |

### 3. 行程亮點欄位（已存在，需調整資料結構）

現有欄位：`highlights: text("highlights")`

**新的資料結構（JSON 陣列）：**
```json
[
  {
    "id": 1,
    "image": "https://storage.packgo.com/tours/hokkaido-onsen.jpg",
    "imageAlt": "北海道溫泉",
    "title": "米其林一星鑰旅宿",
    "subtitle": "ONSEN",
    "description": "保證入住２晚，享受頂級奢華體驗",
    "labelColor": "#F39C12",
    "labelPosition": "bottom-right"
  },
  {
    "id": 2,
    "image": "https://storage.packgo.com/tours/hokkaido-lake.jpg",
    "imageAlt": "洞爺湖心中島",
    "title": "洞爺湖心中島探秘",
    "subtitle": "LAKE",
    "description": "搭乘遊船探索神秘中島，欣賞湖光山色",
    "labelColor": "#F39C12",
    "labelPosition": "bottom-right"
  },
  {
    "id": 3,
    "image": "https://storage.packgo.com/tours/hokkaido-stay.jpg",
    "imageAlt": "豪華住宿",
    "title": "國際連鎖五星飯店",
    "subtitle": "STAY",
    "description": "４晚五星級住宿，盡享舒適與便利",
    "labelColor": "#F39C12",
    "labelPosition": "bottom-right"
  }
]
```

### 4. 關鍵特色欄位（新增）

```typescript
// 關鍵特色 - 用於大字直式排版的詩意內容
keyFeatures: text("keyFeatures"),
```

**資料結構（JSON 陣列）：**
```json
[
  {
    "id": 1,
    "keyword": "雅奢旅宿",
    "keywordStyle": "vertical",
    "image": "https://storage.packgo.com/tours/hokkaido-hotel-wide.jpg",
    "imageAlt": "北海道雅奢旅宿",
    "phrases": [
      "覽秘境無邊風月",
      "品其國美饌名湯",
      "享星鑰洞迴匠心"
    ],
    "description": "現代設計與傳統美學的完美融合，打造極致奢華的住宿體驗。來自Park Hyatt Niseko Hanazono深邃提供。"
  },
  {
    "id": 2,
    "keyword": "遊",
    "keywordStyle": "vertical",
    "image": null,
    "phrases": [
      "理想星鏡",
      "極致歡待"
    ],
    "description": "深度探索北海道的自然美景與人文風情。"
  },
  {
    "id": 3,
    "keyword": "特別安排",
    "keywordStyle": "vertical",
    "image": null,
    "phrases": [
      "秘境尋蹤",
      "中島漫遊"
    ],
    "description": "獨家安排的特色行程，帶您體驗不一樣的北海道。"
  }
]
```

### 5. 圖片畫廊欄位（已存在，需調整資料結構）

現有欄位：`galleryImages: text("galleryImages")`

**新的資料結構（JSON 陣列）：**
```json
[
  {
    "id": 1,
    "url": "https://storage.packgo.com/tours/hokkaido-1.jpg",
    "alt": "北海道雪景",
    "caption": "二世谷滑雪場",
    "category": "景點",
    "order": 1
  },
  {
    "id": 2,
    "url": "https://storage.packgo.com/tours/hokkaido-2.jpg",
    "alt": "溫泉旅館",
    "caption": "米其林一星鑰旅宿",
    "category": "住宿",
    "order": 2
  },
  {
    "id": 3,
    "url": "https://storage.packgo.com/tours/hokkaido-3.jpg",
    "alt": "北海道美食",
    "caption": "新鮮海鮮料理",
    "category": "美食",
    "order": 3
  }
]
```

### 6. 詩意文案欄位（新增）

```typescript
// 詩意文案 - 用於頁面各區塊的優雅描述
poeticContent: text("poeticContent"),
```

**資料結構（JSON 物件）：**
```json
{
  "intro": "在北海道的雪白世界中，尋找心靈的寧靜與感動",
  "accommodation": "入住米其林一星鑰旅宿，感受極致奢華與日式美學的完美融合",
  "dining": "品嚐北海道的山珍海味，每一口都是大自然的恩賜",
  "experience": "深度探索二世谷的秘境，讓旅程成為一生難忘的回憶",
  "closing": "這不僅是一趟旅行，更是一場心靈的洗禮"
}
```

## 完整的 Schema 更新

```typescript
export const tours = mysqlTable("tours", {
  // ... 現有欄位 ...
  
  // === 新增欄位：Hero 區域 ===
  heroImage: varchar("heroImage", { length: 512 }),
  heroImageAlt: varchar("heroImageAlt", { length: 255 }),
  heroSubtitle: text("heroSubtitle"),
  
  // === 新增欄位：配色主題 ===
  colorTheme: text("colorTheme"), // JSON format
  
  // === 調整欄位：行程亮點（已存在，調整資料結構）===
  // highlights: text("highlights"), // 已存在，改為新的 JSON 結構
  
  // === 新增欄位：關鍵特色 ===
  keyFeatures: text("keyFeatures"), // JSON format
  
  // === 調整欄位：圖片畫廊（已存在，調整資料結構）===
  // galleryImages: text("galleryImages"), // 已存在，改為新的 JSON 結構
  
  // === 新增欄位：詩意文案 ===
  poeticContent: text("poeticContent"), // JSON format
  
  // ... 其他現有欄位 ...
});
```

## 資料庫遷移步驟

### 步驟 1：更新 schema.ts

在 `drizzle/schema.ts` 中的 `tours` 表定義中新增上述欄位。

### 步驟 2：生成遷移檔案

```bash
pnpm db:push
```

這會自動生成遷移檔案並執行資料庫更新。

### 步驟 3：更新現有資料（可選）

如果需要為現有行程補充新欄位的資料，可以執行以下 SQL：

```sql
-- 為現有行程設定預設配色主題（日本行程範例）
UPDATE tours 
SET colorTheme = '{"primary":"#FFB6C1","secondary":"#4A90E2","accent":"#F39C12","text":"#2C3E50","textLight":"#ECF0F1","background":"#F5F5F5","backgroundDark":"#2C3E50"}'
WHERE destinationCountry = '日本' AND colorTheme IS NULL;

-- 為現有行程設定預設 Hero 副標題
UPDATE tours 
SET heroSubtitle = CONCAT(
  IFNULL(hotelGrade, ''), 
  '．', 
  IFNULL(destinationCity, ''), 
  '深度遊．', 
  duration, 
  '天', 
  nights, 
  '夜'
)
WHERE heroSubtitle IS NULL;
```

## TypeScript 型別定義

```typescript
// 配色主題型別
export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textLight: string;
  background: string;
  backgroundDark: string;
}

// 行程亮點型別
export interface TourHighlight {
  id: number;
  image: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  description: string;
  labelColor: string;
  labelPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// 關鍵特色型別
export interface KeyFeature {
  id: number;
  keyword: string;
  keywordStyle: 'vertical' | 'horizontal';
  image: string | null;
  imageAlt?: string;
  phrases: string[];
  description: string;
}

// 圖片畫廊項目型別
export interface GalleryImage {
  id: number;
  url: string;
  alt: string;
  caption: string;
  category: string;
  order: number;
}

// 詩意文案型別
export interface PoeticContent {
  intro: string;
  accommodation: string;
  dining: string;
  experience: string;
  closing: string;
}
```

## 後續步驟

1. **確認欄位定義**：請確認上述欄位定義是否符合需求
2. **執行資料庫遷移**：確認後執行 `pnpm db:push`
3. **更新 tRPC procedures**：新增或修改相關的 API endpoints
4. **實作前端頁面**：開始重構行程詳情頁面
5. **整合圖片生成**：整合 Manus 圖片生成 API
6. **整合 AI 文案生成**：使用 LLM 生成詩意文案和關鍵詞

## 注意事項

- 所有 JSON 欄位在儲存前都需要進行 `JSON.stringify()`
- 讀取時需要使用 `JSON.parse()`
- 建議在 `server/db.ts` 中建立 helper functions 來處理 JSON 欄位的序列化和反序列化
- 圖片 URL 都應該是 S3 的完整路徑
- 配色主題應該根據目的地自動生成，但也允許手動覆蓋
