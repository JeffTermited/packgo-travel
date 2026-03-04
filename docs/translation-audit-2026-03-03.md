# PACK&GO 翻譯系統完整診斷報告

**日期**：2026-03-03  
**版本**：Checkpoint 72ac7d99  
**範圍**：資料庫層、後端 API 層、前端顯示層

---

## 一、資料庫層（translations 表）

### 1.1 總體統計

| 指標 | 數值 |
|------|------|
| translations 表總筆數 | 260 筆 |
| 涵蓋行程數 | 13 筆（共 17 筆，4 筆無翻譯） |
| 語系分布 | EN：130 筆，ES：130 筆 |
| 翻譯欄位種類 | title、description、highlights、includes、excludes、notes、heroSubtitle、keyFeatures、itineraryDetailed、costExplanation、noticeDetailed |

### 1.2 行程翻譯覆蓋率

| 狀態 | 行程數 |
|------|--------|
| EN + ES 均有翻譯 | 13 筆 |
| 完全無翻譯 | 4 筆 |

**無翻譯的 4 筆行程**需在管理後台「多語言翻譯」Tab 手動觸發翻譯。

### 1.3 欄位覆蓋情況

每筆有翻譯的行程平均翻譯 **10 個欄位**（EN 10 + ES 10 = 20 筆/行程）。TranslationsTab 顯示的 `x/N` 中，N 為後端動態計算（根據行程實際有值的欄位數），已修正為正確邏輯。

---

## 二、後端 API 層

### 2.1 translateTour 函數

**翻譯欄位清單**（已統一，涵蓋兩類行程）：

| 欄位 | 適用類型 | 說明 |
|------|---------|------|
| `title` | 全部 | 行程標題 |
| `description` | 全部 | 行程描述 |
| `highlights` | 一般行程 | 精彩亮點 |
| `includes` | 一般行程 | 費用包含 |
| `excludes` | 一般行程 | 費用不含 |
| `notes` | 一般行程 | 注意事項 |
| `heroSubtitle` | AI 生成行程 | Hero 副標題 |
| `keyFeatures` | AI 生成行程 | 精選特色（JSON） |
| `itineraryDetailed` | AI 生成行程 | 詳細行程（JSON） |
| `costExplanation` | AI 生成行程 | 費用說明（JSON） |
| `noticeDetailed` | AI 生成行程 | 注意事項（JSON） |

**狀態**：✅ 正常，空欄位自動跳過，不浪費 API 呼叫。

### 2.2 getTourTranslations 端點

- **輸入**：`{ tourId: number, targetLanguage: 'en' | 'es' | ... }`
- **回傳**：`Record<string, string>`（例如 `{ title: "Swiss Alps...", description: "..." }`）
- **狀態**：✅ 正常，格式為物件而非陣列（前端已修正對應邏輯）

### 2.3 getBatchTourTranslations 端點

- **輸入**：`{ tourIds: number[], targetLanguage: string }`
- **回傳**：`Record<number, Record<string, string>>`（以 tourId 為 key 的巢狀物件）
- **狀態**：✅ 正常，一次查詢多筆行程，避免 N+1 問題

### 2.4 getAllTranslationsSummary 端點

- **回傳**：每筆行程的 `{ tourId, hasEn, hasEs, enFieldCount, esFieldCount, totalFields }`
- **totalFields 計算**：根據行程實際有值的欄位動態計算（已修正）
- **狀態**：✅ 正常

### 2.5 非同步翻譯觸發

三個行程建立入口均已加入非同步翻譯觸發：

| 入口 | 觸發方式 | 狀態 |
|------|---------|------|
| `tourGenerator.ts`（AI 生成） | 行程儲存後 `setImmediate` | ✅ |
| `routers.ts createTour`（手動建立） | return 後 `setImmediate` | ✅ |
| `routers.ts saveFromPreview`（從預覽儲存） | return 後 `setImmediate` | ✅ |

---

## 三、前端顯示層

### 3.1 TourDetailPeony.tsx（行程詳情頁）

**getTranslated 函數**：

```typescript
const getTranslated = (fieldName: string, fallback: string | null | undefined) => {
  if (language === 'zh-TW' || !tourTranslations) return fallback;
  const translationMap = tourTranslations as Record<string, string>;
  const translated = translationMap[fieldName];
  return translated ?? fallback;
};
```

- **狀態**：✅ 已修正（原本錯誤地用 `Array.isArray()` 處理物件格式）
- **降級策略**：找不到翻譯時回退到中文原文，不顯示空白

**已套用翻譯的欄位**：

| 變數 | 對應欄位 |
|------|---------|
| `displayTitle` | `title` |
| `displayDescription` | `description` |
| `displayHeroSubtitle` | `heroSubtitle` |
| `keyFeatures` | `keyFeatures`（JSON） |
| `itineraryDetailed` | `itineraryDetailed`（JSON） |
| `costExplanation` | `costExplanation`（JSON） |
| `noticeDetailed` | `noticeDetailed`（JSON） |

**UI 文字 i18n 狀態**：

- 主要 UI 文字（按鈕、標籤、Tab 名稱）：✅ 已接入 `useLocale`
- `MealDetailDialog`、`DayCard` 子元件：✅ 已加入 `useLocale` hook
- `AttractionDetailDialog`：✅ 已有 `useLocale`

**仍有硬編碼中文的區域**（次要，不影響核心翻譯功能）：

| 區域 | 行數 | 類型 | 優先級 |
|------|------|------|--------|
| 日曆元件（weekDays、年月顯示） | 161、205 | 子元件（`DepartureDatePicker`）無 useLocale | 中 |
| 剩餘名額文字（「剩 X 位」） | 299、332 | 子元件 | 中 |
| 飯店詳情對話框（飯店介紹、設施、房型） | 1317、1325、1347 | `HotelDetailDialog` 子元件 | 低 |
| 分享對話框（分享文字） | 2571 | 已有 `displayTitle`，但分享文字仍為中文 | 低 |
| 資料 fallback 字串（「自理」、「多日行程」） | 1098、1950 | 資料預設值 | 低 |

### 3.2 SearchResults.tsx（搜尋結果頁）

- **批次翻譯查詢**：✅ 使用 `getBatchTourTranslations`，一次查詢所有行程
- **行程卡片標題**：✅ 使用 `getTranslatedTitle()` 隨語系切換
- **行程卡片描述**：⚠️ 搜尋結果頁卡片**不顯示描述**（只顯示標題、標籤、價格），無需翻譯

### 3.3 i18n 語系檔案（tourDetail 區塊）

| 語系 | key 數量 | 狀態 |
|------|---------|------|
| zh-TW | 125 個 | ✅ 完整 |
| en | 125 個 | ✅ 與 zh-TW 完全對齊 |
| es | 125 個 | ✅ 與 zh-TW 完全對齊 |

---

## 四、問題彙整與建議

### 4.1 已修復的問題

| 問題 | 修復方式 |
|------|---------|
| `getTranslated` 用陣列方式讀取物件 | 改為 `Record<string, string>` 直接存取 |
| `translateTour` 缺少 AI 生成行程欄位 | 加入 heroSubtitle、keyFeatures 等 5 個欄位 |
| TranslationsTab 顯示固定 7 個欄位 | 改為後端動態計算 totalFields |
| `tourDetail.multipleDates` key 缺失 | 三語系均已補充 |
| `tourDetail.tabs.features` key 缺失 | 三語系均已補充 |
| 搜尋結果頁行程卡片標題未翻譯 | 新增 getBatchTourTranslations，卡片套用翻譯 |
| TourDetailPeony.tsx 44 處硬編碼中文 | 接入 useLocale，補充 10 個 i18n key |

### 4.2 待處理的問題（依優先順序）

| 優先 | 問題 | 建議做法 |
|------|------|---------|
| **高** | 4 筆行程無翻譯資料 | 管理後台「翻譯所有行程」批次觸發 |
| **中** | `DepartureDatePicker` 子元件日曆文字（年月、星期）硬編碼中文 | 在子元件加入 `useLocale`，或傳入 locale 參數 |
| **中** | 剩餘名額文字（「剩 X 位」）硬編碼中文 | 加入 i18n key `tourDetail.remainingSeats` |
| **低** | `HotelDetailDialog` 飯店介紹/設施/房型文字 | 加入 useLocale，補充對應 key |
| **低** | 分享對話框的推薦文字（「推薦這個行程給你：」） | 加入 i18n key `tourDetail.shareText` |
| **低** | `TourPrintView.tsx` 列印頁面未 i18n | 接入 useLocale |

### 4.3 架構評估

整體翻譯架構健全，資料流向清晰：

```
行程建立 → setImmediate 非同步觸發 translateTour
         → LLM 翻譯 11 個欄位
         → 寫入 translations 表（entityType='tour'）

前端請求 → getTourTranslations（單筆）
         → getTranslated(fieldName, fallback)
         → 顯示翻譯內容，無翻譯時降級到中文

搜尋頁面 → getBatchTourTranslations（批次）
         → getTranslatedTitle(tour)
         → 卡片標題隨語系切換
```

**降級策略**完整：語系為 zh-TW 時直接回傳原文；非 zh-TW 但無翻譯時也回傳原文，不顯示空白。

---

*報告生成時間：2026-03-03 | 版本：Checkpoint 72ac7d99*
