# 第一階段：核心功能完善 — 詳細執行計劃

> **基於程式碼掃描結果（2026-02-28）**，本計劃反映專案的真實現狀，而非假設。

---

## 現狀總覽

| 功能模組 | 現狀 | 問題嚴重度 |
|---------|------|-----------|
| 搜尋與篩選 | 後端 `searchTours` 已實作，但前端 `Tours.tsx` 仍做記憶體過濾 | 🟡 中等 |
| 多語言（i18n） | 框架已建立（1,194 個翻譯鍵），但 14 個頁面尚未接入 | 🟡 中等 |
| 備份頁面清理 | 6 個備份/測試版頁面仍在路由中（TourDetailV2 等） | 🟠 偏高 |
| 匯率備用機制 | 已有備用匯率，但使用記憶體快取（重啟後遺失） | 🟡 中等 |
| SEO 基礎建設 | sitemap.xml、robots.txt、OG 標籤均缺失 | 🟠 偏高 |
| console.log 清理 | 全專案 1,366 處 console.* 輸出 | 🟢 低（不影響功能） |

---

## 任務一：搜尋功能後端篩選完善

**預估工時：6 小時**

### 現狀分析

後端 `server/db.ts` 的 `searchTours()` 函數已實作完整的資料庫層篩選（目的地、天數、價格、航空公司、飯店星級），但前端 `client/src/pages/Tours.tsx` 第 116–138 行仍使用 `trpc.tours.list` 取回**全部資料**後，再在記憶體中過濾。這導致兩個問題：一是無法正確分頁（分頁基於全量資料），二是大型資料集時效能低落。

### 執行步驟

**步驟 1.1：前端改用 `trpc.tours.search` 並傳遞篩選參數（2 小時）**

修改 `client/src/pages/Tours.tsx`，將 `trpc.tours.list.useQuery` 替換為 `trpc.tours.search.useQuery`，並將所有篩選狀態（searchQuery、selectedCountry、sortBy 等）直接傳入查詢參數，移除第 121–139 行的前端記憶體過濾邏輯。

```tsx
// 修改前（前端過濾）
const { data: tours } = trpc.tours.list.useQuery({ status: selectedStatus });
const filteredTours = tours.filter(tour => /* 記憶體過濾 */);

// 修改後（後端篩選）
const { data: result } = trpc.tours.search.useQuery({
  destination: searchQuery || undefined,
  sortBy: selectedSortBy,
  page: currentPage,
  pageSize: 12,
});
const tours = result?.tours || [];
const total = result?.pagination.total || 0;
```

**步驟 1.2：後端 `tours.search` 補充缺少的篩選欄位（2 小時）**

目前 `server/routers.ts` 的 `tours.search` 輸入 Schema 已支援 destination、minDays、maxDays、minPrice、maxPrice、sortBy，但缺少 `departureDate`（出發日期）和 `themes`（旅遊主題）。需在 Schema 中補充這兩個欄位，並在 `db.searchTours()` 中實作對應的資料庫查詢條件。

**步驟 1.3：前端加入分頁元件（2 小時）**

在 `Tours.tsx` 加入分頁元件，使用 `result.pagination.total` 和 `result.pagination.totalPages` 顯示分頁導航。

### 驗收標準

- 輸入「日本」後，資料庫層直接過濾，不再取回全部行程
- 選擇「價格低到高」排序後，結果正確排序
- 第 2 頁顯示第 13–24 筆資料

---

## 任務二：備份頁面清理

**預估工時：2 小時**

### 現狀分析

`client/src/App.tsx` 中有 6 個備份/測試版路由仍在使用：

| 路由 | 元件 | 狀態 |
|------|------|------|
| `/tours/:id` | `TourDetailPeony` | ✅ 正式使用（保留） |
| `/tours-v2/:id` | `TourDetailV2` | ❌ 測試版（刪除） |
| `/tours-sipin-test/:id` | `TourDetailSipinTest` | ❌ 測試版（刪除） |
| `/sipin/:id` | `TourDetailSipin` | ❌ 測試版（刪除） |
| `/tours-sipin/:id` | `TourDetailSipin` | ❌ 測試版（刪除） |
| `/tours-minimal/:id` | `TourDetailMinimal` | ❌ 測試版（刪除） |

另有 `TourDetail.backup.tsx`、`TourDetailNew.tsx` 等檔案存在但未被路由引用，應一併刪除。

### 執行步驟

**步驟 2.1：確認哪個是正式版（0.5 小時）**

確認 `/tours/:id` 使用 `TourDetailPeony` 是正確的正式版本，並確認其功能完整（多語言、價格顯示、行程詳情等）。

**步驟 2.2：移除備份路由和檔案（1 小時）**

從 `App.tsx` 移除 5 個測試版路由的 import 和 Route 宣告，然後刪除對應的 `.tsx` 檔案。

**步驟 2.3：驗證（0.5 小時）**

確認 `/tours/:id` 仍正常運作，TypeScript 零錯誤。

### 驗收標準

- `App.tsx` 中無備份路由
- 刪除 6 個備份/測試版頁面檔案
- TypeScript 零錯誤

---

## 任務三：多語言覆蓋率補全

**預估工時：12 小時**

### 現狀分析

多語言框架已建立完善：`LocaleContext.tsx` 提供 `t()` 函數，`client/src/i18n/` 目錄下有 zh-TW、en、es 三個語言包，各含 1,194 個翻譯鍵。然而，39 個頁面中有 14 個尚未接入 `useLocale()`，仍使用硬編碼中文字串。

**需要補全的頁面（按優先級排序）：**

| 頁面 | 重要性 | 估計工時 |
|------|--------|---------|
| `TourDetailPeony.tsx`（正式行程詳情頁） | 🔴 高 | 3 小時 |
| `BookingDetail.tsx`（訂單詳情） | 🔴 高 | 2 小時 |
| `CustomTourRequest.tsx`（客製行程申請） | 🔴 高 | 2 小時 |
| `GroupPackages.tsx`（包團旅遊） | 🟡 中 | 1.5 小時 |
| `TourPrintView.tsx`（行程列印） | 🟡 中 | 1 小時 |
| `ForgotPassword.tsx` / `ResetPassword.tsx` | 🟢 低 | 1.5 小時 |
| `TourDetailNew.tsx`（若保留） | 🟢 低 | 1 小時 |

### 執行步驟

**步驟 3.1：補全 TourDetailPeony.tsx（3 小時）**

這是最重要的頁面，是用戶購買旅程的核心路徑。需要：
1. 在元件頂部加入 `const { t, formatPrice, language } = useLocale();`
2. 將所有硬編碼中文字串替換為 `t('tourDetail.xxx')` 呼叫
3. 確認 zh-TW.ts、en.ts、es.ts 中都有對應的翻譯鍵（若缺少則補充）

**步驟 3.2：補全 BookingDetail.tsx 和 CustomTourRequest.tsx（4 小時）**

這兩個頁面是用戶完成預訂的關鍵路徑，需要優先處理。

**步驟 3.3：補全其餘頁面（5 小時）**

依優先級逐一補全 GroupPackages.tsx、TourPrintView.tsx、ForgotPassword.tsx、ResetPassword.tsx。

### 驗收標準

- 切換語言至 English 後，所有頁面的 UI 文字均顯示英文
- 切換語言至 Español 後，所有頁面的 UI 文字均顯示西班牙文
- 無硬編碼中文字串殘留在已處理的頁面中

---

## 任務四：匯率快取強化（Redis）

**預估工時：3 小時**

### 現狀分析

`server/agents/exchangeRateAgent.ts` 目前使用**記憶體快取**（第 30 行 `let memoryCache`），TTL 為 1 小時。問題在於：伺服器重啟後快取遺失，導致重啟後第一次請求必須呼叫外部 API；若 API 不可用，則使用硬編碼的備用匯率（TWD: 32.5），可能已過時。

### 執行步驟

**步驟 4.1：將匯率快取遷移至 Redis（2 小時）**

修改 `exchangeRateAgent.ts`，在成功取得匯率後，將結果存入 Redis（TTL 2 小時）；讀取時優先從 Redis 讀取，降級順序為：Redis → 記憶體 → 備用匯率。

```typescript
// 修改後的快取邏輯
const REDIS_KEY = 'exchange:rates';
const REDIS_TTL = 7200; // 2 小時

export async function getExchangeRates(): Promise<ExchangeRateData> {
  // 1. 嘗試從 Redis 讀取
  try {
    const cached = await redis.get(REDIS_KEY);
    if (cached) return JSON.parse(cached);
  } catch { /* Redis 不可用，繼續 */ }

  // 2. 嘗試從記憶體讀取
  if (memoryCache && (Date.now() - memoryCache.lastUpdated) < CACHE_TTL) {
    return memoryCache;
  }

  // 3. 從 API 取得最新匯率
  const rates = await fetchExchangeRates();
  memoryCache = rates;
  
  // 4. 寫入 Redis
  try {
    await redis.setex(REDIS_KEY, REDIS_TTL, JSON.stringify(rates));
  } catch { /* Redis 不可用，僅使用記憶體快取 */ }
  
  return rates;
}
```

**步驟 4.2：撰寫測試（1 小時）**

撰寫 vitest 測試確認三層降級機制正常運作。

### 驗收標準

- 伺服器重啟後，第一次請求能從 Redis 讀取匯率（不需呼叫外部 API）
- Redis 不可用時，自動降級到記憶體快取
- 記憶體快取也不可用時，使用備用匯率

---

## 任務五：SEO 基礎建設

**預估工時：5 小時**

### 現狀分析

目前 `client/index.html` 缺少所有 SEO 相關標籤（OG、Twitter Card、canonical URL、description）。`client/public/` 目錄下也沒有 `sitemap.xml` 和 `robots.txt`。這對搜尋引擎排名影響重大。

### 執行步驟

**步驟 5.1：建立 robots.txt（0.5 小時）**

在 `client/public/robots.txt` 建立基本的爬蟲規則，允許所有搜尋引擎爬取，並指向 sitemap。

**步驟 5.2：建立動態 sitemap.xml（2 小時）**

在 `server/routers.ts` 新增一個公開的 `/sitemap.xml` 路由，動態生成包含所有行程頁面的 sitemap。

```typescript
// 在 Express 中添加 sitemap 路由
app.get('/sitemap.xml', async (req, res) => {
  const tours = await db.getAllActiveTours();
  const urls = [
    { loc: 'https://packgo-d3xjbq67.manus.space/', changefreq: 'daily' },
    { loc: 'https://packgo-d3xjbq67.manus.space/tours', changefreq: 'daily' },
    ...tours.map(t => ({
      loc: `https://packgo-d3xjbq67.manus.space/tours/${t.id}`,
      changefreq: 'weekly',
      lastmod: new Date(t.updatedAt).toISOString(),
    })),
  ];
  // 生成 XML 並回傳
});
```

**步驟 5.3：加入動態 meta 標籤（2.5 小時）**

在 `TourDetailPeony.tsx` 中使用 `react-helmet-async` 動態設定每個行程頁面的 title、description、og:image 等標籤。

### 驗收標準

- `https://packgo-d3xjbq67.manus.space/sitemap.xml` 可正常訪問並列出所有行程 URL
- `https://packgo-d3xjbq67.manus.space/robots.txt` 可正常訪問
- 行程詳情頁的 `<title>` 包含行程名稱
- 行程詳情頁有 `og:image` 標籤（使用行程封面圖）

---

## 整體時間規劃

| 任務 | 預估工時 | 建議執行順序 | 依賴關係 |
|------|---------|------------|---------|
| 任務二：備份頁面清理 | 2 小時 | **第一** | 無 |
| 任務一：搜尋後端篩選 | 6 小時 | **第二** | 無 |
| 任務四：匯率快取強化 | 3 小時 | **第三** | 無 |
| 任務三：多語言覆蓋率 | 12 小時 | **第四** | 任務二（確認正式頁面） |
| 任務五：SEO 基礎建設 | 5 小時 | **第五** | 任務三（頁面 title 需要正確語言） |
| **合計** | **28 小時** | | |

> **注意**：原改進報告估計 40 小時，經過程式碼掃描後，由於後端 `searchTours` 已實作完善、i18n 框架已建立，實際工時縮短至 **28 小時**（約 3.5 個工作天）。

---

## 風險評估

| 風險 | 可能性 | 影響 | 緩解措施 |
|------|--------|------|---------|
| 多語言翻譯鍵缺失 | 中 | 低 | 先掃描缺失的鍵，批次補充後再接入 |
| 搜尋功能改動影響現有行為 | 低 | 中 | 保留 `tours.list` 路由，僅在 Tours.tsx 切換 |
| SEO 動態 sitemap 效能問題 | 低 | 低 | 加入 Redis 快取，TTL 1 小時 |
| 備份頁面刪除後發現有用 | 低 | 中 | 先在 Git 中保留，確認無問題後再刪除 |

---

*本計劃基於 2026-02-28 程式碼掃描結果，如有程式碼變更請重新評估工時。*
