# PACK&GO 旅行社網站 — 產品需求文件（PRD）

**版本：** 1.0  
**撰寫日期：** 2026-03-26  
**負責人：** Jeff Hsieh（旅行社業主）  
**技術棧：** React 19 + Tailwind 4 + tRPC 11 + Drizzle ORM + MySQL  
**部署網域：** packgo09.manus.space

---

## 一、產品概述

PACK&GO 旅行社是一個面向**繁體中文、英文、西班牙文**三語市場的旅遊預訂與行程展示平台，主要服務對象為台灣及海外華人旅客。平台核心差異化在於：

1. **AI 自動行程生成**：透過多 Agent 協同，從旅遊網站 URL 自動爬取並生成完整行程頁面
2. **Inline 編輯系統**：行程詳情頁面支援直接點擊編輯，無需進入後台
3. **AI 旅遊顧問**：企鵝吉祥物驅動的 AI 聊天助手，可回答旅遊問題

---

## 二、目標用戶

| 用戶類型 | 描述 | 核心需求 |
|----------|------|----------|
| **一般旅客** | 尋找旅遊行程的消費者 | 瀏覽行程、查詢價格、聯絡詢問 |
| **會員用戶** | 已登入的旅客 | 收藏行程、查看預訂、個人資料管理 |
| **旅行社業主（Admin）** | Jeff 及授權員工 | 管理行程、生成 AI 行程、查看訂單 |

---

## 三、核心用戶流程

### 3.1 旅客瀏覽行程流程

```
首頁 → 搜尋（出發地 / 關鍵字 / 日期）→ 搜尋結果列表
  → 點擊行程卡片 → 行程詳情頁（TourDetailPeony）
  → 詢問 / 預訂 → 聯絡我們 / BookTour 頁面
```

### 3.2 AI 行程生成流程（Admin）

```
管理後台 → 行程管理 → 「AI 自動生成」
  → 輸入旅遊網站 URL（如雄獅旅遊）
  → 系統爬取 + 多 Agent 分析（目標 < 120 秒）
  → 預覽生成結果 → 確認 / 編輯 → 儲存發布
```

### 3.3 用戶認證流程

```
點擊「登入 / 註冊」→ Manus OAuth 頁面
  → 授權完成 → 跳回網站 → 會員專區
```

### 3.4 支付流程

```
選擇行程 → 填寫出發日期 / 人數 → 確認訂單
  → Stripe Checkout（新分頁）→ 支付完成
  → 跳回 /payment-success → 顯示訂單詳情
```

---

## 四、頁面清單與功能規格

### 4.1 公開頁面

| 頁面 | 路由 | 核心功能 | 狀態 |
|------|------|----------|------|
| 首頁 | `/` | Hero 搜尋框、目的地卡片、精選行程、電子報訂閱 | ✅ 完成 |
| 行程列表 | `/tours` | 搜尋篩選、行程卡片網格 | ✅ 完成 |
| 行程詳情 | `/tours/:id` | 完整行程資訊、Inline 編輯、PDF 下載 | ✅ 完成 |
| 搜尋結果 | `/search` | 篩選條件、結果列表 | ✅ 完成 |
| 目的地 | `/destinations/:country` | 國家/地區行程列表 | ✅ 完成 |
| 地區頁面 | `/regions/:region` | 地區行程列表 | ✅ 完成 |
| 郵輪頁面 | `/cruise` | 郵輪行程專區 | ✅ 完成 |
| 客製旅遊 | `/custom-tours` | 客製行程說明 + 詢問表單 | ✅ 完成 |
| 代辦簽證 | `/visa-services` | 簽證服務說明 | ✅ 完成 |
| 包團旅遊 | `/group-packages` | 包團服務說明 | ✅ 完成 |
| 機票預購 | `/flight-booking` | **佔位頁面**，待改為服務說明 | ⚠️ 待改進 |
| 機場接送 | `/airport-transfer` | **佔位頁面**，待改為服務說明 | ⚠️ 待改進 |
| 飯店預訂 | `/hotel-booking` | **佔位頁面**，待改為服務說明 | ⚠️ 待改進 |
| 聯絡我們 | `/contact-us` | 聯絡表單 + 地圖 | ✅ 完成 |
| 關於我們 | `/about-us` | 公司介紹 | ✅ 完成 |
| 常見問題 | `/faq` | FAQ 列表 | ✅ 完成 |
| 服務條款 | `/terms-of-service` | 法律條款 | ✅ 完成 |
| 隱私權政策 | `/privacy-policy` | 隱私聲明 | ✅ 完成 |

### 4.2 會員頁面（需登入）

| 頁面 | 路由 | 核心功能 | 狀態 |
|------|------|----------|------|
| 個人資料 | `/profile` | 頭像、姓名、Email 編輯 | ✅ 完成 |
| 預訂詳情 | `/bookings/:id` | 訂單詳情、支付狀態 | ✅ 完成 |
| 支付成功 | `/payment-success` | 訂單確認頁 | ✅ 完成 |
| 支付失敗 | `/payment-failure` | 失敗提示 + 重試 | ✅ 完成 |

### 4.3 管理後台（需 Admin 角色）

| 頁面 | 路由 | 核心功能 | 狀態 |
|------|------|----------|------|
| 管理後台 | `/admin` | 行程管理、訂單管理、首頁編輯 | ✅ 完成 |
| AI 行程生成 | `/admin` → 行程管理 | URL 輸入、進度追蹤、預覽確認 | ✅ 完成 |

---

## 五、設計規範

### 5.1 視覺風格

**主題：** 黑白極簡 + 翠綠品牌色（旅行社專業感）

| 元素 | 規格 |
|------|------|
| 主色 | `#0D9488`（Teal-600，品牌翠綠） |
| 背景色 | `#FFFFFF`（白）|
| 文字色 | `#111827`（Gray-900） |
| 輔助色 | `#F9FAFB`（Gray-50，卡片背景） |
| 字體 | Noto Serif TC（標題）+ Inter（內文） |

### 5.2 圓角規範（**嚴格執行**）

> **禁止出現任何直角元素（border-radius: 0）**，除非是全寬 Hero 背景圖片。

| 元素類型 | 圓角值 | Tailwind Class |
|----------|--------|----------------|
| 卡片（行程、目的地） | 12px | `rounded-xl` |
| 輸入框（input, select） | 8px | `rounded-lg` |
| 按鈕（一般） | 8px | `rounded-lg` |
| 頭像 | 50% | `rounded-full` |
| 搜尋框容器 | 24px | `rounded-3xl` |
| 對話框（Dialog） | 12px | `rounded-xl` |
| 圖片（卡片內） | 12px | `rounded-xl` |
| 標籤（Badge） | 6px | `rounded-md` |

### 5.3 間距規範

搜尋欄排版應**極度寬敞**，各欄位之間保持充足間距（`gap-4` 以上），絕對不擁擠。

### 5.4 禁止事項

- **禁止**在任何可見 UI 元素上使用 `rounded-none` 或 `rounded-0`
- **禁止**在搜尋框按鈕使用 `rounded-full`（應使用 `rounded-lg`）
- **禁止**在卡片圖片使用無圓角的 `<img>` 標籤
- **禁止**在非全寬背景的圖片容器省略 `overflow-hidden`

---

## 六、多語言規範

支援三種語言，語言切換透過 Header 的 `LocaleSwitcher` 元件：

| 語言 | 代碼 | 檔案 |
|------|------|------|
| 繁體中文（預設） | `zh-TW` | `client/src/locales/zh-TW.ts` |
| 英文 | `en` | `client/src/locales/en.ts` |
| 西班牙文 | `es` | `client/src/locales/es.ts` |

**規範：** 所有面向用戶的文字字串**必須**使用 `t('key')` 函數，**禁止**在 JSX 中直接寫中文字串（除非是動態資料庫內容）。

---

## 七、資料模型

### 7.1 核心資料表

| 資料表 | 用途 | 關鍵欄位 |
|--------|------|----------|
| `users` | 用戶帳號 | id, email, name, role, stripeCustomerId |
| `tours` | 行程資料 | id, title, destination, price, dailyItinerary, isPublished |
| `tourDepartures` | 出發日期 | tourId, departureDate, availableSeats, price |
| `bookings` | 訂單 | userId, tourId, departureId, status, totalAmount |
| `payments` | 支付記錄 | bookingId, stripePaymentIntentId, status |
| `inquiries` | 詢問單 | userId, tourId, status, messages |
| `destinations` | 目的地 | name, country, region, imageUrl |
| `homepageContent` | 首頁可編輯內容 | heroTitle, heroSubtitle, heroImageUrl |

### 7.2 行程資料結構（tours 表關鍵 JSON 欄位）

```typescript
// dailyItinerary: JSON 陣列
[{
  day: number,
  title: string,
  accommodation: string,
  meals: { breakfast: boolean, lunch: boolean, dinner: boolean },
  activities: [{
    time: string,
    location: string,
    title: string,
    description: string,
    transportation: string
  }]
}]

// costDetails: JSON 物件
{
  included: string[],
  excluded: string[],
  extras: string[],
  notes: string
}
```

---

## 八、AI 行程生成系統規格

### 8.1 多 Agent 架構

```
輸入 URL
  → WebScraperAgent（Firecrawl + Puppeteer fallback）
  → ContentAnalyzerAgent（Claude 3 Haiku，結構化提取）
  → 並行執行：
      ColorThemeAgent + ImagePromptAgent
  → 並行執行：
      ImageGenerationAgent + ItineraryAgent + CostAgent
      + NoticeAgent + HotelAgent + MealAgent + FlightAgent
  → 儲存到資料庫
```

### 8.2 性能目標

| 指標 | 目標值 | 目前狀態 |
|------|--------|----------|
| 總生成時間 | < 120 秒 | ~122 秒（接近目標） |
| WebScraperAgent | < 60 秒 | ~99 秒（待優化） |
| 成功率 | > 90% | 待測量 |

### 8.3 進度追蹤

前端使用**輪詢機制**（每 3 秒）查詢 `trpc.tours.getGenerationStatus`，顯示即時進度條和漸進式結果預覽。

---

## 九、支付系統規格

使用 **Stripe Checkout** 處理支付，支援促銷碼。

| 環境 | 說明 |
|------|------|
| 測試卡號 | `4242 4242 4242 4242` |
| Webhook 端點 | `/api/stripe/webhook` |
| 成功跳轉 | `/payment-success` |
| 取消跳轉 | `/payment-failure` |

---

## 十、待辦事項（按優先級）

### P0 — 立即修復

- [ ] 修復所有 i18n 硬編碼字串（DepartureDatePicker、HotelDetailDialog 等 6 個元件）
- [ ] 佔位頁面改造（FlightBooking、AirportTransfer、HotelBooking）

### P1 — 近期改進

- [ ] Open Graph 標籤（每個行程頁面加入 og:title、og:image、og:description）
- [ ] 客戶評價系統
- [ ] 行程收藏 / 願望清單
- [ ] 電子郵件通知（預訂確認）

### P2 — 中期功能

- [ ] 完整線上預訂流程
- [ ] 行程客製化工具
- [ ] 旅遊部落格 / 內容行銷
- [ ] 合作夥伴管理後台

---

## 十一、版本歷史

| 版本 | 日期 | 主要變更 |
|------|------|----------|
| 1.0 | 2026-03-26 | 初版 PRD，基於現有程式碼逆向整理 |
