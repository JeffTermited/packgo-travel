# PACK&GO 旅行社專案待辦事項

## 已完成功能
- [x] 基礎網站結構（Header、Hero、Destinations、FeaturedTours、Footer）
- [x] 黑白極簡設計風格
- [x] Logo 設計與整合
- [x] 移除 Header 頂部工具列
- [x] 移除 Footer 名片區塊
- [x] 整合雄獅旅遊風格的搜尋控制台
- [x] 全端專案升級（資料庫 + 使用者系統）
- [x] 資料庫結構同步

## 待實作功能

### 會員系統
- [ ] 黑白極簡風格登入/註冊頁面
- [ ] Header 整合會員登入按鈕
- [ ] 會員個人資料頁面
- [ ] 登出功能

### 管理員功能
- [ ] 管理員儀表板
- [ ] 行程管理介面
- [ ] 訂單管理系統

### 首頁增強
- [ ] 圓形圖示主題旅遊導航區塊
- [ ] 限時優惠倒數計時器
- [ ] 進階搜尋篩選功能

### SEO 與效能優化
- [ ] Meta 標籤優化
- [ ] Open Graph 設定
- [ ] 圖片壓縮與 lazy loading
- [ ] 網站地圖生成

### 其他功能
- [ ] 電子報訂閱功能實作
- [ ] 聯絡表單
- [ ] 多語系支援（中/英）

## 更新記錄

### 2026-01-23
- [x] 黑白極簡風格登入/註冊頁面（視覺設計完成，功能邏輯待實作）
- [x] Header 整合會員登入按鈕

### 管理員後台系統
- [x] 設計旅遊行程資料表結構（tours table）
- [x] 實作後端 tRPC API（新增、編輯、刪除、查詢行程）
- [x] 建立管理員儀表板頁面
- [x] 實作行程列表與搜尋功能
- [x] 實作新增行程表單
- [x] 實作編輯行程功能
- [x] 實作刪除行程確認對話框
- [x] 撰寫單元測試


### Bug 修復
- [x] 修復登入頁面的嵌套錨點標籤錯誤
- [x] 修復登入頁面背景圖片載入錯誤
- [x] 更新 Header 顯示已登入使用者名稱
- [x] 全站配色改為黑白極簡風格


### 新功能開發
- [x] 首頁精選行程動態載入（連接資料庫）
- [x] 首頁精選行程「查看更多」按鈕
- [x] 會員個人中心頁面（個人資訊、歷史訂單、收藏行程）
- [x] 行程詳細介紹頁面（價格、特色、報名表單）
- [x] 行程詳細頁面路由設定
- [x] 修復 Footer 圖示顏色（改為白色）


### 預訂系統開發（參考名人假期）
- [x] 設計出發日期資料表（tourDepartures）
- [x] 設計預訂資料表（bookings）
- [x] 設計參加者資料表（bookingParticipants）
- [x] 設計付款資料表（payments）
- [x] 實作出發日期管理 API
- [x] 實作預訂建立 API
- [x] 實作價格計算邏輯（成人/兒童/嬰兒/單人房差價）
- [x] 實作訂金模式（20% 訂金）
- [x] 建立行程預訂頁面（日期選擇、旅客人數配置）
- [x] 建立旅客資訊填寫表單
- [x] 建立房型選擇介面
- [x] 建立價格計算與顯示

### 付款與金流整合
- [x] 整合 Stripe Checkout
- [x] 實作 Stripe Webhook 處理
- [x] 實作付款狀態追蹤
- [ ] 建立付款成功/失敗頁面
- [ ] 實作訂單確認郵件通知

### 客戶服務系統
- [x] 設計諮詢資料表（inquiries）
- [x] 設計諮詢訊息表（inquiryMessages）
- [ ] 建立快速諮詢表單
- [ ] 建立客製旅遊規劃表單
- [ ] 建立諮詢管理後台
- [ ] 實作諮詢回覆功能
- [ ] 實作諮詢狀態管理


### 預訂詳情與付款頁面
- [x] 建立 /booking/:id 頁面
- [x] 顯示預訂資訊（行程、日期、旅客、價格）
- [x] 顯示付款狀態與歷史記錄
- [x] 整合 Stripe Checkout 按鈕（訂金/尾款支付）
- [ ] 建立付款成功/失敗頁面

### 管理後台 - 出發日期管理
- [ ] 建立出發日期管理介面
- [ ] 實作新增出發日期功能
- [ ] 實作編輯出發日期與價格
- [ ] 實作刪除出發日期功能
- [ ] 實作名額管理與狀態更新

### 管理後台 - 預訂管理
- [ ] 建立預訂管理介面
- [ ] 顯示所有預訂列表
- [ ] 實作預訂詳情查看
- [ ] 實作預訂狀態更新
- [ ] 實作旅客資訊查看

### 客戶服務表單系統
- [ ] 建立快速諮詢表單頁面
- [ ] 建立客製旅遊規劃表單頁面
- [ ] 建立簽證服務表單頁面
- [ ] 建立諮詢管理後台介面
- [ ] 實作諮詢回覆功能
- [ ] 實作諮詢狀態管理


### AI 旅遊顧問功能
- [x] 移除首頁搜尋欄中的「AI 旅遊顧問」標籤
- [x] 建立 AI 對話介面組件
- [x] 整合 LLM API 提供旅遊諮詢功能
- [x] 在首頁新增可愛的浮動 AI 顧問圖標
- [x] 實作點擊圖標開啟對話視窗


### Header 排版優化
- [x] 調整「管理後台」、「會員專區」和使用者名稱的排版，確保整齊對齊與適當間距


### 會員中心重新設計
- [x] 研究現代化會員中心設計範例
- [x] 重新設計 Profile 頁面視覺風格
- [x] 加入個人化內容與統計資訊
- [x] 建立快速操作卡片（我的預訂、收藏行程、優惠券等）
- [x] 加入互動元素提升停留時間


### 會員中心完全重新設計（第二版）
- [x] 研究更優秀的會員中心設計範例
- [x] 重新設計 Profile 頁面佈局與視覺層次
- [x] 改善統計卡片的視覺呈現
- [x] 優化快速操作區塊的設計
- [x] 改善整體配色與間距


### 會員中心圓潤設計優化
- [x] 將所有卡片改為圓角設計
- [x] 將所有按鈕改為圓角設計
- [x] 將頭像改為圓形
- [x] 將圖示背景改為圓形
- [x] 確保整體視覺風格統一圓潤


### 全站圓潤設計統一
- [x] 更新 Home 頁面所有元素為圓潤設計
- [x] 更新 Login/Register 頁面為圓潤設計
- [x] 更新 TourDetail 頁面為圓潤設計
- [x] 更新 BookingFlow 頁面為圓潤設計
- [x] 更新 BookingDetails 頁面為圓潤設計
- [x] 更新 AdminDashboard 頁面為圓潤設計
- [x] 更新所有共用組件（Header, Footer, etc.）為圓潤設計


### 修正登入頁面 TabsList 圓角設計
- [x] 修正 TabsList 組件使兩個 Tab 都完全圓角
- [x] 確保 TabTrigger 的圓角與整體設計一致


### 登入頁面表單驗證
- [ ] 設計驗證規則（電子郵件格式、密碼強度）
- [ ] 實作即時表單驗證（使用 react-hook-form + zod）
- [ ] 加入圓角的錯誤提示框
- [ ] 顯示密碼強度指示器

### 忘記密碼功能
- [ ] 設計資料庫 schema（password_reset_tokens 表）
- [ ] 實作後端 API：發送重設密碼郵件
- [ ] 實作後端 API：驗證重設密碼 token
- [ ] 實作後端 API：更新新密碼
- [ ] 建立忘記密碼頁面 UI
- [ ] 建立重設密碼頁面 UI
- [ ] 串接前後端 API


### 會員中心導航改善
- [x] 在會員中心頁面加入返回首頁按鈕
- [x] 優化頁面頂部導航區塊


### 會員個人資料編輯功能
- [x] 更新資料庫 schema（user 表加入 phone, address 欄位）
- [x] 實作後端 API：更新個人資料
- [x] 建立個人資料編輯 UI（姓名、電話、地址）
- [x] 加入表單驗證（react-hook-form + zod）
- [x] 串接前後端 API
- [x] 測試個人資料編輯功能

### 會員頭像上傳與裁切功能
- [x] 更新資料庫 schema（user 表加入 avatar 欄位）
- [x] 實作後端 API：上傳頭像至 S3
- [x] 安裝圖片裁切套件（react-image-crop 或 react-easy-crop）
- [x] 建立頭像上傳 UI 與預覽功能
- [x] 實作圖片裁切功能
- [ ] 串接前後端 API


### 整合頭像上傳至會員中心
- [x] 將 AvatarUpload 元件整合至 Profile 頁面
- [x] 串接 uploadAvatar tRPC API
- [x] 更新使用者狀態以顯示新頭像
- [x] 測試頭像上傳與裁切功能


### 頭像刪除功能
- [x] 實作後端 API：刪除頭像（設為 null）
- [x] 更新 AvatarUpload 元件，hover 時顯示刪除選項
- [x] 串接刪除 API，恢復為預設文字頭像
- [x] 測試頭像刪除功能


## 第一階段：客戶服務系統

### 快速諮詢表單
- [x] 建立快速諮詢表單 UI（姓名、電話、郵箱、諮詢內容）
- [x] 實作表單驗證（react-hook-form + zod）
- [x] 串接後端 API
- [x] 加入路由與導航連結

### 客製旅遊規劃表單
- [x] 建立客製旅遊規劃表單 UI（目的地、天數、人數、預算、出發日期、詳細需求）
- [x] 實作表單驗證
- [x] 串接後端 API
- [x] 加入路由與導航連結

### 諮詢管理後台
- [x] 建立諮詢管理頁面 UI（列表、篩選、詳情）
- [x] 實作狀態更新功能
- [x] 實作優先級管理功能
- [x] 實作回覆功能
- [x] 加入管理員路由保護


### 管理員後台導航修正
- [x] 在管理員後台頁面加入返回首頁按鈕
- [x] 優化管理員後台頂部導航區塊

### Header 聯絡我們連結
- [x] 在 Header 導航列加入「聯絡我們」選項
- [x] 連結至快速諮詢頁面（/inquiry）


### 合併管理後台入口
- [ ] 將諮詢管理整合至管理後台頁面（/admin）
- [ ] 移除獨立的諮詢管理路由（/inquiry-management）
- [ ] 更新 Header 導航，只顯示單一「管理後台」入口
- [ ] 在管理後台加入 Tab 切換（訂單管理、行程管理、諮詢管理）


## 管理後台 Tab 式整合（根據架構報告）
- [x] 重構 /admin 頁面為 Tab 式結構
- [x] 整合現有行程管理功能至「行程管理」Tab
- [x] 整合現有預訂管理功能至「預訂管理」Tab
- [x] 整合諮詢管理功能至「諮詢管理」Tab（從 /inquiry-management 移入）
- [x] 新增「儀表板」Tab（數據統計、圖表、快速操作）
- [x] 新增「評價管理」Tab（評價列表、審核、回覆、設為精選）
- [ ] 移除獨立的 /inquiry-management 路由
- [ ] 更新 Header 只顯示單一「管理後台」入口
- [x] 測試所有 Tab 功能正常運作
- [x] 儲存 checkpoint


## Header 導航優化與路由清理
- [x] 移除 App.tsx 中的 /inquiry-management 路由
- [x] 刪除 InquiryManagement.tsx 頁面檔案
- [x] 更新 Header.tsx 移除「諮詢管理」導航項目
- [x] 確保 Header 只顯示單一「管理後台」入口
- [x] 測試導航功能正常運作
- [x] 儲存 checkpoint


## 管理後台功能完善
- [x] 實作預訂管理 API（查詢所有預訂、查詢單一預訂、更新預訂狀態）
- [x] 實作管理員權限檢查（adminProcedure）
- [x] 在所有管理後台 API 加入 adminProcedure 保護
- [x] 實作儀表板統計數據 API（今日預訂、本月營收、待處理諮詢、行程總數）
- [x] 更新 DashboardTab 連接真實統計數據
- [x] 更新 BookingsTab 連接預訂管理 API
- [x] 測試管理員權限檢查功能
- [x] 測試儀表板數據顯示
- [x] 測試預訂管理功能
- [x] 儲存 checkpoint


## 首頁實用功能實作
- [x] 實作 Header 導航連結（客製旅遊、代辦簽證、包團旅遊、機票預購、機場接送、飯店預訂、聯絡我們）
- [x] 建立對應的頁面路由與基本頁面
- [x] 實作搜尋功能（團體旅遊、機票、訂房三種類別）
- [x] 實作搜尋欄位動態切換（根據選擇的類別顯示不同欄位）
- [x] 實作熱門搜尋標籤點擊功能
- [ ] 實作目的地卡片連結（連接到對應的行程列表頁）
- [ ] 實作電子報訂閱功能（API + 前端表單）
- [x] 實作 Footer 連結頁面（關於我們、服務條款、隱私權政策、常見問題、聯絡我們）
- [x] 測試所有連結與功能正常運作
- [x] 儲存 checkpoint


## 服務頁面內容完善與功能實作
- [x] 完善客製旅遊頁面（服務說明、流程介紹、價格資訊、諮詢表單）
- [ ] 完善代辦簽證頁面（服務說明、流程介紹、價格資訊、諮詢表單）
- [ ] 完善包團旅遊頁面（服務說明、流程介紹、價格資訊、諮詢表單）
- [ ] 完善機票預購頁面（服務說明、流程介紹、價格資訊、諮詢表單）
- [ ] 完善機場接送頁面（服務說明、流程介紹、價格資訊、諮詢表單）
- [ ] 完善飯店預訂頁面（服務說明、流程介紹、價格資訊、諮詢表單）
- [x] 實作目的地卡片連結（點擊卡片連接到對應的行程列表頁）
- [x] 實作電子報訂閱後端 API
- [x] 實作電子報訂閱前端表單
- [x] 測試所有功能正常運作
- [x] 儲存 checkpoint


## 行程搜尋結果頁面
- [x] 建立 SearchResults 頁面組件
- [x] 實作目的地篩選下拉選單
- [x] 實作旅遊天數範圍篩選
- [x] 實作價格區間滑桿篩選
- [x] 實作行程列表顯示（卡片式排版）
- [x] 實作後端搜尋 API（支援多條件篩選）
- [x] 整合前後端篩選功能
- [x] 加入排序功能（價格、天數、熱門度）
- [ ] 加入分頁功能
- [x] 測試所有篩選條件正常運作
- [x] 儲存 checkpoint


## 首頁搜尋欄與搜尋結果頁面整合
- [x] 更新 Hero 組件的搜尋功能，加入導航到搜尋結果頁面
- [x] 實作目的地輸入欄位與搜尋邏輯
- [x] 實作日期選擇欄位（可選）
- [x] 實作熱門搜尋標籤點擊功能，直接跳轉到搜尋結果
- [x] 測試首頁搜尋流程完整運作

## 搜尋結果分頁功能
- [ ] 更新後端 API 支援分頁參數（page, limit）
- [ ] 更新前端 SearchResults 頁面加入分頁 UI
- [ ] 實作分頁按鈕（上一頁、下一頁、頁碼）
- [ ] 測試分頁功能正常運作

## 行程詳情頁面完善
- [ ] 更新 TourDetail 頁面加入每日行程區塊
- [ ] 加入費用說明與包含項目
- [ ] 加入出發日期選擇功能
- [ ] 加入線上預訂按鈕（連接到 BookTour 頁面）
- [ ] 加入相關行程推薦
- [ ] 測試行程詳情頁面所有功能

## 整合測試與 Checkpoint
- [x] 測試完整搜尋流程（首頁 → 搜尋結果 → 行程詳情 → 預訂）
- [x] 儲存 checkpoint


## 修正包團旅遊導航連結
- [x] 更新 Header 中的「包團旅遊」連結，改為跳轉到 /search（團體旅遊搜尋結果頁面）
- [x] 測試導航連結正常運作
- [x] 儲存 checkpoint


## 修正 SearchResults 頁面 Select.Item 錯誤
- [x] 檢查 SearchResults.tsx 中的所有 Select.Item 元件
- [x] 修正空字串 value 問題（改為有意義的預設值或移除該選項）
- [x] 測試搜尋結果頁面正常運作
- [x] 儲存 checkpoint


## 參考雄獅旅遊優化搜尋結果頁面
- [x] 研究雄獅旅遊的包團旅遊頁面設計
- [x] 研究雄獅旅遊的行程卡片呈現方式
- [x] 研究雄獅旅遊的篩選器樣式與功能
- [x] 優化行程卡片設計（圖片、標題、價格、標籤等）
- [x] 優化篩選器樣式（佈局、顏色、圓角設計）
- [x] 優化篩選器功能（更多篩選條件、即時篩選等）
- [x] 測試優化後的搜尋結果頁面
- [x] 儲存 checkpoint


## 加入進階篩選條件
- [x] 在前端加入航空公司篩選選項
- [x] 在前端加入飯店等級篩選選項
- [x] 在前端加入特殊活動篩選選項
- [x] 更新資料庫 schema 支援新欄位
- [x] 更新後端 tRPC 查詢支援新篩選條件
- [x] 測試所有篩選條件正常運作
- [x] 儲存 checkpoint


## 搜尋結果和行程詳情頁面優化
- [x] 在搜尋結果頁面加入已選篩選條件標籤顯示區域
- [x] 實作標籤的快速移除功能
- [x] 實作篩選條件的 URL 參數同步（讀取和寫入）
- [x] 在行程詳情頁面顯示航空公司資訊
- [x] 在行程詳情頁面顯示飯店等級資訊
- [x] 在行程詳情頁面顯示特殊活動資訊
- [x] 測試所有優化功能正常運作
- [x] 儲存 checkpoint


## 搜尋結果頁面設計優化
- [x] 在搜尋結果頁面加入搜尋欄（參考雄獅旅遊）
- [x] 將所有卡片改為圓角設計
- [x] 將所有按鈕改為圓角設計
- [x] 將所有輸入框改為圓角設計
- [x] 將所有標籤（Badge）改為圓角設計
- [x] 測試優化後的設計
- [x] 儲存 checkpoint


## 整體視覺設計優化
### 搜尋結果頁面
- [x] 優化行程卡片的圖片展示（更大、更突出）
- [x] 改善卡片排版和視覺層次
- [x] 加入更多視覺細節（陰影、間距、對比）

### 行程詳情頁面
- [x] 加強圖片展示（大圖、圖片輪播）
- [x] 優化行程資訊的視覺設計
- [x] 改善整體排版和視覺層次

### 搜尋行程區塊
- [x] 優化搜尋欄的視覺設計
- [x] 改善搜尋欄的間距和排版
- [x] 加入更多視覺細節

### 測試與交付
- [ ] 測試所有優化後的頁面
- [x] 儲存 checkpoint


## 實作統一的日期選擇器（參考 Expedia）
- [x] 研究 Expedia 的日期選擇器設計
- [x] 安裝並配置日期選擇器套件（react-day-picker 或類似）
- [x] 建立統一的日期選擇器元件
- [ ] 更新首頁搜尋欄使用新的日期選擇器
- [ ] 更新搜尋結果頁面使用新的日期選擇器
- [ ] 測試日期選擇器功能
- [x] 儲存 checkpoint


## 修改搜尋結果頁面搜尋欄為雄獅樣式
- [x] 將搜尋欄改為橫向排列（出發地、關鍵字、日期範圍、搜尋按鈕）
- [x] 簡化標籤設計
- [x] 整合日期範圍選擇（兩個日期框，中間用 ~ 連接）
- [x] 保留下方的勾選框（只找成行、只找可報名）
- [x] 測試搜尋欄功能
- [x] 儲存 checkpoint


## 搜尋欄全面優化
- [x] 整合 DateRangePicker 元件到搜尋結果頁面
- [x] 整合 DateRangePicker 元件到首頁
- [x] 優化首頁搜尋欄為橫向排列樣式
- [x] 建立關鍵字自動完成元件
- [x] 整合自動完成功能到搜尋結果頁面
- [x] 整合自動完成功能到首頁
- [x] 測試所有搜尋欄功能
- [x] 儲存 checkpoint


## 全站圓角設計審查與修改
- [x] 審查並修改搜尋結果頁面搜尋欄所有元素
- [x] 審查並修改搜尋結果頁面篩選條件區塊所有元素
- [x] 審查並修改搜尋結果頁面行程卡片所有元素
- [x] 審查並修改首頁搜尋欄所有元素
- [x] 審查並修改首頁其他區塊所有元素
- [x] 審查並修改行程詳情頁面所有元素
- [x] 測試所有頁面的圓角設計
- [x] 儲存 checkpoint


## 參考雄獅旅遊全面優化搜尋結果頁面設計
- [x] 優化搜尋欄背景色（改為淺灰色）
- [x] 優化出發地下拉選單樣式（淺灰色背景）
- [x] 優化關鍵字輸入框樣式（白色背景、更寬敢）
- [x] 優化日期選擇器樣式（白色背景、圓角）
- [x] 優化搜尋按鈕樣式（純黑色、圓角）
- [ ] 優化篩選條件區塊的視覺設計
- [ ] 優化行程卡片的視覺設計
- [ ] 測試優化後的設計
- [ ] 儲存 checkpoint


## 搜尋結果頁面搜尋欄重新設計（根據雄獅旅遊參考圖）
- [x] 加入淺灰色背景到整個搜尋容器
- [x] 確保所有輸入框都是純白色背景
- [x] 優化標籤文字樣式（清晰、適當大小）
- [x] 優化各元素間距（不擁擠、專業外觀）
- [x] 確保圓角設計統一（rounded-2xl）
- [x] 優化搜尋按鈕樣式（黑色背景、白色文字、圓角）
- [x] 測試優化後的搜尋欄設計
- [ ] 儲存 checkpoint

## 搜尋欄佈局優化
- [x] 調整搜尋欄各欄位寬度，使其更均勻平衡
- [x] 確保所有欄位保持圓潤設計（rounded-2xl）
- [x] 優化排版，讓視覺更整齊乾淨
- [x] 測試調整後的佈局


## 參考雄獅旅遊優化整體排版
- [x] 優化搜尋欄排版（減少間距、確保高度一致、對齊整齊）
- [x] 優化篩選器區塊設計（兩欄式 checkbox 佈局）
- [x] 優化篩選器視覺層次（清晰的標題、適當的留白）
- [x] 確保所有元素對齊一致
- [x] 測試優化後的整體排版
- [ ] 儲存 checkpoint


## 篩選器區塊可折疊功能
- [x] 為每個篩選器區塊加入折疊/展開狀態管理
- [x] 加入折疊/展開圖示（向上/向下箭頭）
- [x] 實作點擊標題切換折疊狀態的功能
- [x] 確保折疊動畫流暢自然
- [x] 測試所有篩選器的折疊/展開功能
- [x] 儲存 checkpoint


## 參考雄獅旅遊網站優化搜尋欄和搜尋結果頁面
- [x] 訪問雄獅旅遊首頁，分析搜尋欄設計（標籤切換、欄位排列、勾選框位置）
- [x] 訪問雄獅搜尋結果頁面，分析排版和方便性設計
- [x] 記錄關鍵設計元素和使用者體驗優點
- [x] 應用參考設計優化我們的搜尋欄（加入標籤切換功能）
- [x] 應用參考設計優化我們的搜尋結果頁面排版
- [x] 測試優化後的設計
- [x] 儲存 checkpoint


## 調整搜尋欄出發地欄位寬度
- [x] 增加出發地欄位的寬度，使其更寬敷易讀
- [x] 測試調整後的視覺效果
- [x] 儲存 checkpoint


## 調整搜尋結果頁面搜尋欄出發地欄位和間距
- [x] 增加出發地欄位的寬度（從 w-64 增加到 w-80）
- [x] 調整搜尋欄各欄位之間的間距（從 gap-3 增加到 gap-4）
- [x] 測試調整後的視覺效果
- [ ] 儲存 checkpoint


## 調整搜尋欄為緊湊但整潔的設計
- [x] 調整搜尋欄間距為更緊湊的設計（p-6 改為 p-4，gap-4 改為 gap-3）
- [x] 確保出發地欄位寬度適中（w-80）
- [x] 保持整潔的視覺效果
- [x] 測試調整後的設計
- [x] 儲存 checkpoint


## 重新設計首頁搜尋欄（參考雄獅旅遊）
- [x] 加入出發地下拉選單
- [x] 調整搜尋欄排版（出發地、關鍵字、出發時間、搜尋按鈕）
- [x] 確保排版緊湊但整潔
- [x] 測試調整後的設計
- [x] 儲存 checkpoint


## 修正所有頁面出發地欄位寬度
- [ ] 調整首頁搜尋欄出發地欄位寬度，使其與關鍵字和出發時間一致
- [ ] 調整搜尋結果頁面搜尋欄出發地欄位寬度，使其與關鍵字和出發時間一致
- [ ] 確保所有搜尋欄位寬度平衡一致
- [ ] 測試調整後的設計
- [ ] 儲存 checkpoint


## 搜尋欄欄位寬度不一致問題修正
- [x] 修正首頁搜尋欄出發地欄位寬度（目前太小）
- [x] 修正首頁搜尋欄關鍵字欄位寬度（目前太寬）
- [x] 修正首頁搜尋欄出發時間欄位寬度（需與其他欄位一致）
- [x] 修正搜尋結果頁面出發地欄位寬度（目前太小）
- [x] 修正搜尋結果頁面關鍵字欄位寬度（目前太寬）
- [x] 修正搜尋結果頁面出發時間欄位寬度（需與其他欄位一致）
- [x] 確保三個主要欄位（出發地、關鍵字、出發時間）使用相同的固定寬度或比例（md:w-72）
- [x] 測試修正後的設計
- [ ] 儲存 checkpoint


## 搜尋欄欄位寬度一致性修正（第二次）
- [ ] 分析首頁和搜尋結果頁面的搜尋欄差異
- [ ] 修正首頁搜尋欄：出發地欄位需要與關鍵字、出發時間欄位寬度一致
- [ ] 修正搜尋結果頁面搜尋欄：三個欄位需要完全相同的寬度
- [ ] 使用 flex-1 讓三個欄位平均分配空間
- [ ] 測試修正後的設計
- [ ] 儲存 checkpoint

- [x] 修正搜尋欄三個欄位（出發地、關鍵字、出發時間）寬度一致
- [x] 使用原生 HTML select 元素取代 Radix UI Select 解決寬度問題
- [x] 使用 flexbox 與 flex: 1 1 0 讓三個欄位平均分配空間
- [x] 測試首頁和搜尋結果頁面搜尋欄寬度一致
- [x] 儲存 checkpoint


## 搜尋欄出發地和關鍵字改為輸入框
- [ ] 將首頁出發地欄位從下拉選單改為輸入框
- [ ] 在首頁出發地欄位下方加入快捷選項（台北、台中、台南、高雄等）
- [ ] 將搜尋結果頁面出發地欄位從下拉選單改為輸入框
- [ ] 在搜尋結果頁面出發地欄位下方加入快捷選項
- [ ] 確保關鍵字欄位也有快捷選項（熱門目的地）
- [ ] 測試輸入框和快捷選項功能
- [ ] 儲存 checkpoint


## 搜尋欄快捷選項根據旅遊類別動態顯示
- [ ] 修改 Hero.tsx 讓快捷選項只在選擇「團體旅遊」時顯示
- [ ] 機票和訂房類別不顯示快捷選項（或顯示不同的選項）
- [ ] 測試各類別切換時的顯示效果

## 行程批量刪除功能
- [ ] 在管理後台行程列表加入全選/取消全選功能
- [ ] 在每個行程項目加入勾選框
- [ ] 加入批量刪除按鈕
- [ ] 實作批量刪除 API
- [ ] 加入刪除確認對話框
- [ ] 測試批量刪除功能


## 移除搜尋欄快捷選項
- [x] 移除首頁搜尋欄中出發地欄位下方的「快選」標籤（台北、台中、台南、高雄、桃園）
- [x] 移除首頁搜尋欄中關鍵字欄位下方的「熱門」標籤（北海道、東京、大阪、歐洲、土耳其）
- [x] 測試移除後的搜尋欄設計
- [x] 儲存 checkpoint


## 出發地欄位 autofill 功能
- [ ] 建立 DepartureAutocomplete 組件，提供台灣主要城市選項
- [ ] 在 Hero.tsx 中使用 DepartureAutocomplete 組件
- [ ] 在 SearchResults.tsx 中使用 DepartureAutocomplete 組件
- [ ] 測試 autofill 功能
- [ ] 儲存 checkpoint


## 鎖住機票和訂房標籤
- [ ] 在 Hero.tsx 中鎖住機票和訂房標籤
- [ ] 點擊時顯示「即將推出」提示
- [ ] 測試鎖住功能
- [ ] 儲存 checkpoint


## 出發地欄位 autofill 功能
- [x] 建立 DepartureAutocomplete 元件，提供台灣主要城市選項
- [x] 在 Hero.tsx 中使用 DepartureAutocomplete 元件
- [x] 在 SearchResults.tsx 中使用 DepartureAutocomplete 元件
- [x] 測試 autofill 功能
- [x] 儲存 checkpoint

## 鎖住機票和訂房標籤
- [x] 在 Hero.tsx 中鎖住機票和訂房標籤
- [x] 點擊時顯示「即將推出」提示
- [x] 測試鎖住功能
- [x] 儲存 checkpoint


## 修正出發地 autofill 下拉選單顯示問題
- [x] 檢查 DepartureAutocomplete 元件的下拉選單高度限制
- [x] 移除 Hero.tsx 中搜尋卡片容器的 overflow-hidden 屬性
- [x] 增加下拉選單的 z-index 到 9999
- [x] 確保所有符合條件的城市都能顯示（例如輸入「台」時應顯示台北、台中、台南、台東）
- [x] 測試修正後的 autofill 功能
- [x] 儲存 checkpoint


## 自動生成行程功能
- [x] 分析現有行程管理架構與資料結構
- [x] 設計自動生成行程的 API 端點
- [x] 實作後端 API：網頁爬取功能（使用 Manus API）
- [x] 實作後端 API：使用 LLM 提取旅遊資訊（標題、價格、出發日期、行程內容等）
- [x] 實作前端 UI：新增「自動生成行程」按鈕
- [x] 實作前端 UI：輸入網址的對話框
- [x] 實作前端 UI：預覽生成結果並允許編輯
- [x] 統一行程格式（價格、出發日期、行程描述等）
- [x] 測試功能
- [ ] 儲存 checkpoint


## 自動生成行程功能（參考雄獅旅遊）
- [x] 更新資料庫結構 - 新增詳細欄位（出發/目的地國家城市、航班資訊、住宿詳情）
- [x] 實作自動生成行程 API（網頁爬取 + LLM 資訊提取）
- [x] 更新行程管理 UI - 新增自動生成功能按鈕
- [x] 建立專業行程詳細頁面（參考雄獅旅遊架構）
- [x] 實作分頁導航（行程特色、每日行程、住宿資訊、費用說明、注意事項）
- [x] 實作航班資訊區塊
- [x] 實作住宿資訊區塊
- [x] 實作推薦景點區塊
- [x] 實作費用說明區塊
- [x] 實作自費行程推薦區塊
- [x] 測試自動生成功能
- [x] 儲存 checkpoint


## 修復 Manus API 超時問題
- [x] 增加 Manus API 超時時間（從 300 秒增加到 600 秒）
- [ ] 新增前端載入狀態提示（顯示預估時間）
- [ ] 新增錯誤處理與重試機制
- [x] 測試修復後的自動生成功能
- [x] 儲存 checkpoint

## 高優先級待辦事項（來自 antigravity 分析）
- [x] 實作付款成功頁面（/payment/success）
- [x] 實作付款失敗頁面（/payment/failure）
- [ ] 實作訂單確認郵件通知
- [ ] 實作搜尋結果分頁功能
- [x] 實作出發日期管理 UI（前端）
- [x] 儲存 checkpoint


## 高優先級待辦事項（antigravity 分析）
- [x] 訂單確認郵件通知
  - [x] 整合郵件服務（使用 Manus 內建通知 API）
  - [x] 設計郵件模板（訂單確認、付款成功）
  - [x] 實作自動發送邏輯（Stripe Webhook 觸發）
  - [x] 測試郵件發送功能
- [x] 搜尋結果分頁功能
  - [x] 後端 API 新增分頁參數（page, pageSize）
  - [x] 前端實作分頁 UI 組件
  - [x] 更新搜尋結果頁面整合分頁
  - [x] 測試分頁功能
- [ ] 忘記密碼功能
  - [ ] 設計密碼重設流程（發送重設連結）
  - [ ] 實作後端 API（生成重設 token、驗證 token、更新密碼）
  - [ ] 實作前端頁面（忘記密碼表單、重設密碼頁面）
  - [ ] 測試完整流程
- [ ] 儲存 checkpoint

## 中優先級待辦事項（antigravity 分析）
- [ ] 服務頁面內容完善
  - [ ] 代辦簽證服務詳細說明
  - [ ] 包團旅遊服務詳細說明
  - [ ] 客製旅遊規劃流程說明
  - [ ] 新增服務價格參考
- [ ] 行程詳情頁面增強
  - [ ] 每日行程展示優化（時間軸設計）
  - [ ] 相關推薦行程區塊
  - [ ] 行程圖片輪播優化
  - [ ] 新增行程評價區塊
- [ ] 會員中心功能擴充
  - [ ] 收藏行程功能（前後端）
  - [ ] 歷史訂單查詢頁面
  - [ ] 個人資料編輯增強
  - [ ] 會員等級顯示
- [ ] 儲存 checkpoint


## 移除 Manus OAuth 並實作傳統登入系統
- [x] 更新資料庫結構
  - [x] 新增 password 欄位（加密儲存）
  - [x] 新增 resetPasswordToken 欄位
  - [x] 新增 resetPasswordExpires 欄位
  - [x] 將 openId 改為可選，email 改為必填且唯一
- [ ] 實作後端認證 API
  - [ ] 安裝 bcrypt 套件
  - [ ] 實作註冊 API（email + password）
  - [ ] 實作登入 API（email + password，返回 JWT token）
  - [ ] 實作忘記密碼 API（發送重設連結）
  - [ ] 實作重設密碼 API（驗證 token 並更新密碼）
  - [ ] 更新 auth middleware 使用 JWT 而非 Manus OAuth
- [ ] 移除 Manus OAuth 相關程式碼
  - [ ] 移除 server/_core/oauth.ts
  - [ ] 移除 OAuth callback route
  - [ ] 更新 server/_core/context.ts 使用 JWT 驗證
  - [ ] 移除前端 OAuth 相關環境變數
- [ ] 實作前端認證頁面
  - [ ] 建立登入頁面（/login）
  - [ ] 建立註冊頁面（/register）
  - [ ] 建立忘記密碼頁面（/forgot-password）
  - [ ] 建立重設密碼頁面（/reset-password/:token）
  - [ ] 更新 Header 移除 OAuth 登入按鈕
  - [ ] 更新 useAuth hook 使用新的認證 API
- [ ] 測試新的認證系統
  - [ ] 測試註冊流程
  - [ ] 測試登入流程
  - [ ] 測試忘記密碼流程
  - [ ] 測試重設密碼流程
  - [ ] 測試登出功能
- [ ] 儲存 checkpoint


## 實作 Google OAuth + Email/Password 雙軌登入系統
- [ ] 更新資料庫結構
  - [ ] 新增 password 欄位（bcrypt 加密）
  - [ ] 新增 googleId 欄位（儲存 Google OAuth ID）
  - [ ] 新增 resetPasswordToken 和 resetPasswordExpires 欄位
  - [ ] 將 openId 改為可選，email 改為必填且唯一
  - [ ] 執行資料庫遷移
- [ ] 安裝必要套件
  - [ ] 安裝 bcrypt 或 bcryptjs
  - [ ] 安裝 passport 和 passport-google-oauth20
  - [ ] 安裝 jsonwebtoken（JWT）
  - [ ] 安裝 nodemailer（發送重設密碼郵件）
- [ ] 實作後端認證 API
  - [ ] 實作 Email/Password 註冊 API
  - [ ] 實作 Email/Password 登入 API
  - [ ] 實作 Google OAuth 登入流程
  - [ ] 實作忘記密碼 API（發送重設連結）
  - [ ] 實作重設密碼 API
  - [ ] 更新 JWT token 生成與驗證邏輯
  - [ ] 更新 auth middleware 支援雙軌登入
- [ ] 實作前端登入註冊頁面
  - [ ] 建立統一登入頁面（支援 Email/Password 和 Google OAuth）
  - [ ] 建立註冊頁面
  - [ ] 建立忘記密碼頁面
  - [ ] 建立重設密碼頁面
  - [ ] 整合 Google OAuth 按鈕
  - [ ] 更新 useAuth hook
- [ ] 移除 Manus OAuth 相關程式碼
  - [ ] 移除 server/_core/oauth.ts 中的 Manus OAuth 邏輯
  - [ ] 移除 OAuth callback route
  - [ ] 移除前端 Manus OAuth 相關環境變數引用
  - [ ] 清理不再使用的程式碼
- [ ] 測試完整認證流程
  - [ ] 測試 Email/Password 註冊與登入
  - [ ] 測試 Google OAuth 登入
  - [ ] 測試忘記密碼與重設密碼
  - [ ] 測試登出功能
  - [ ] 測試 JWT token 過期處理
- [ ] 儲存 c## 實作 Google OAuth + Email/Password 雙軌登入系統
- [x] 更新資料庫 schema（新增 googleId, password, resetPasswordToken, resetPasswordExpires）
- [x] 安裝必要套件（bcryptjs, passport, passport-google-oauth20, etc.）
- [x] 建立完整的認證系統

---

## 🚀 明天待辦事項（2026-01-26）- AI 自動生成行程系統優化

**總預計時間：** 7.5-10.5 小時（核心任務 7.5 小時 + 可選任務 3 小時）

### 🔴 Critical Fix（必須優先處理，預計 30 分鐘）

#### 任務 1：移除 DesignLearningAgent 的 Runtime 依賴
- [ ] 將 DesignLearningAgent 移動到 `server/tools/designLearningTool.ts`（保留作為開發工具）
- [ ] 從 Master Agent 中移除 DesignLearningAgent 調用
- [ ] 直接使用 `server/lib/DEFAULT_DESIGN_GUIDELINES.ts`
- [ ] 測試行程生成流程（確認不再調用 DesignLearningAgent）
- [ ] 驗證生成時間減少 15-30 秒

**預期效果：** 零延遲、零外部依賴、風格絕對統一

---

### 🟡 高優先級：Skill Prompting 應用（預計 3 小時）

#### 任務 2：建立 Skill Library
- [ ] 創建 `server/agents/skillLibrary.ts`
- [ ] 定義 COPYWRITER_SKILL（用於 ContentAnalyzerAgent）
- [ ] 定義 PHOTOGRAPHER_SKILL（用於 ImagePromptAgent）
- [ ] 定義 POET_SKILL（用於 PoeticAgent）
- [ ] 定義 EDITOR_SKILL（用於內容驗證）
- [ ] 定義 STORYTELLER_SKILL（備用）

#### 任務 2.1：整合 Skill Prompting 到各 Agent
- [ ] 在 ContentAnalyzerAgent 中引入 COPYWRITER_SKILL
- [ ] 在 ImagePromptAgent 中引入 PHOTOGRAPHER_SKILL
- [ ] 創建 PoeticAgent 並引入 POET_SKILL
- [ ] 測試生成品質（比較使用前後的差異）

**預期效果：** 內容品質提升 30-50%、風格一致性提升、原創性提升

---

### 🟡 高優先級：Prompt 優化與字數強限制（預計 2 小時）

#### 任務 3：優化所有 Agent 的 Prompt
- [ ] ContentAnalyzerAgent - 標題：嚴格 20-30 字
- [ ] ContentAnalyzerAgent - 描述：嚴格 100-120 字
- [ ] ContentAnalyzerAgent - Hero 副標題：嚴格 30-40 字
- [ ] PoeticAgent - 詩意文案：嚴格 12-16 字
- [ ] ImagePromptAgent - 提示詞：建議 80-120 字（警告不強制）

#### 任務 3.1：加入字數驗證和重試機制
- [ ] 實作 `generateTitleWithRetry` 函數（最多重試 2 次）
- [ ] 實作字數驗證邏輯（檢查生成內容是否符合字數限制）
- [ ] 實作強制截斷邏輯（重試失敗時使用）
- [ ] 在所有 Agent 中加入字數驗證

**預期效果：** 前端排版不會被破壞、減少防禦性 CSS 需求、提升內容品質

---

### 🟡 高優先級：Fallback 機制與 Partial Success（預計 2 小時）

#### 任務 4：加入 Fallback 機制
- [ ] 優化 WebScraperAgent 的 Prompt（加入「資料不足回傳 null」指示）
- [ ] 在 ContentAnalyzerAgent 中加入資料驗證（檢查必要欄位）
- [ ] 實作 Fallback 邏輯（資料不足時使用預設值）

#### 任務 4.1：實作 Partial Success 機制
- [ ] 修改 Master Agent 的錯誤處理邏輯
- [ ] 圖片生成失敗時使用 placeholder 圖片
- [ ] 確保部分失敗不會導致整個行程生成失敗
- [ ] 測試各種失敗情境（爬蟲失敗、圖片生成失敗、LLM 超時）

**預期效果：** 避免幻覺、提升系統穩定性、更好的錯誤訊息

---

### 🟢 中優先級：防禦性 CSS 排版（預計 2 小時）

#### 任務 5：實作防禦性 CSS
- [ ] 圖片防護：object-fit: cover + 固定長寬比
- [ ] 文字截斷：line-clamp（標題 2 行、描述 4 行、詩意文案 1 行）
- [ ] 直式標題的響應式處理（手機版改回橫排）
- [ ] Zigzag 佈局的響應式處理（手機版改為單欄）
- [ ] 測試超長內容不會破壞排版

**預期效果：** 即使 LLM 生成超長內容，排版也不會破壞

---

### 🟢 中優先級：CSS @media print 支援（預計 1 小時）

#### 任務 6：實作 CSS @media print
- [ ] 創建 `client/src/print.css`
- [ ] 隱藏不需要列印的元素（navbar、footer、按鈕）
- [ ] 設定分頁規則（page-break-inside: avoid）
- [ ] 調整字體大小和行高
- [ ] 在 TourDetail 頁面引入 print.css
- [ ] 添加「下載 PDF」按鈕（呼叫 window.print()）
- [ ] 測試列印效果（Ctrl+P → 另存為 PDF）

**預期效果：** 開發時間只需 1 小時、零伺服器負擔、零維護成本

---

### 🔵 低優先級（如果時間允許，預計 2 小時）

#### 任務 7：建立專門的 Agent（可選）
- [ ] 創建 AttractionAgent（景點介紹）
- [ ] 創建 HotelAgent（住宿介紹）
- [ ] 創建 MealAgent（餐飲介紹）
- [ ] 創建 FlightAgent（航班資訊）
- [ ] 在 Master Agent 中整合這些新 Agent

**注意：** 先完成前面的核心任務，如果時間充裕再考慮實作

---

### ✅ 驗收標準

**Critical Fix 驗收：**
- [ ] Master Agent 不再調用 DesignLearningAgent
- [ ] 使用 DEFAULT_DESIGN_GUIDELINES.ts 作為設計規範
- [ ] 行程生成時間減少 15-30 秒

**Skill Prompting 驗收：**
- [ ] skillLibrary.ts 包含 5 種 Skill Prompt
- [ ] ContentAnalyzerAgent 使用 COPYWRITER_SKILL
- [ ] ImagePromptAgent 使用 PHOTOGRAPHER_SKILL
- [ ] 生成的內容品質明顯提升（需人工評估）

**Prompt 優化驗收：**
- [ ] 所有 Prompt 都有「嚴格字數限制」
- [ ] 所有 Agent 都有「字數驗證」機制
- [ ] 超過字數限制時會「重試」或「截斷」

**Fallback 機制驗收：**
- [ ] WebScraperAgent 的 Prompt 包含「資料不足回傳 null」指示
- [ ] ContentAnalyzerAgent 有資料驗證機制
- [ ] Master Agent 實作 Partial Success（圖片失敗不影響行程儲存）

**防禦性 CSS 驗收：**
- [ ] 圖片使用 object-fit: cover
- [ ] 文字使用 line-clamp 截斷
- [ ] 手機版使用橫排佈局
- [ ] 測試超長內容不會破壞排版

**CSS @media print 驗收：**
- [ ] print.css 已創建並引入
- [ ] 列印時隱藏 navbar、footer、按鈕
- [ ] 列印時保持排版美觀
- [ ] 「下載 PDF」按鈕正常運作

---

### 📋 時間分配

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

### 🕐 開發流程建議

**上午（9:00-12:00）：Critical Fix + Skill Prompting**
1. **9:00-9:30**：移除 DesignLearningAgent Runtime 依賴
2. **9:30-12:00**：建立 Skill Library（2.5 小時）

**下午（13:00-18:00）：Prompt 優化 + Fallback 機制**
3. **13:00-15:00**：Prompt 優化與字數強限制
4. **15:00-17:00**：Fallback 機制與 Partial Success
5. **17:00-18:00**：測試與驗證

**晚上（19:00-22:00）：前端優化（可選）**
6. **19:00-21:00**：防禦性 CSS 排版
7. **21:00-22:00**：CSS @media print 支援

---

### 📚 參考文件

- `/home/ubuntu/packgo-travel/TOMORROW_FINAL_PLAN.md`：完整的明天工作計畫（包含詳細說明和範例程式碼）
- `/home/ubuntu/packgo-travel/AI_ARCHITECTURE_SUMMARY.md`：系統架構說明和 AI Prompt
- `/home/ubuntu/packgo-travel/DESIGN_LEARNING_AGENT_PROPOSAL.md`：DesignLearningAgent 技術提案
- `/home/ubuntu/packgo-travel/server/lib/DEFAULT_DESIGN_GUIDELINES.ts`：預設設計規範h.ts 認證邏輯
- [x] 建立 server/db.ts 資料庫輔助函數
- [x] 實作 Email/Password 註冊 API
- [x] 實作 Email/Password 登入 API
- [x] 實作忘記密碼 API
- [x] 實作重設密碼 API
- [x] 實作 Google OAuth 策略
- [x] 建立 Google OAuth callback route
- [x] 更新 server/_core/index.ts 整合 Google Auth
- [x] 建立前端登入頁面（Login.tsx）
- [x] 建立前端註冊表單
- [x] 建立忘記密碼頁面（ForgotPassword.tsx）
- [x] 建立重設密碼頁面（ResetPassword.tsx）
- [x] 移除 Manus OAuth 相關程式碼
- [x] 測試完整認證流程
- [ ] 儲存 checkpoint


## 修正 Google OAuth 403 錯誤
- [ ] 檢查 Google OAuth callback URL 設定
- [ ] 更新 Google Cloud Console 授權重新導向 URI
- [ ] 測試 Google 登入功能
- [ ] 確認 admin 帳號轉換成功

## 實作郵件服務整合
- [ ] 選擇郵件服務提供商（SendGrid / AWS SES / Resend）
- [ ] 設定 SMTP 憑證
- [ ] 實作密碼重設郵件發送功能
- [ ] 測試郵件發送

## 優化登入體驗
- [ ] 新增「記住我」功能
- [ ] 優化社交登入按鈕樣式
- [ ] 考慮加入 Facebook/Apple 登入選項（可選）
- [ ] 儲存 checkpoint

## 登入頁面改進
- [x] 新增「返回首頁」按鈕或連結


## 修正 Header 顯示已登入使用者資訊
- [ ] 檢查 Header 元件是否正確使用 useAuth hook
- [ ] 確認登入後 Header 顯示使用者名稱/頭像
- [ ] 測試登出功能
- [ ] 確認 Google ID 已成功綁定到現有帳號
- [ ] 儲存 checkpoint


## 認證系統增強功能
- [x] 實作郵件服務整合（Nodemailer + Gmail SMTP）
- [x] 實作密碼重設郵件發送功能
- [x] 實作「記住我」功能（延長登入狀態）
- [x] 測試郵件發送功能
- [x] 測試「記住我」功能
- [x] 儲存 checkpoint


## 郵件服務與登入安全增強
- [x] 設定郵件服務環境變數（EMAIL_USER, EMAIL_PASSWORD, BASE_URL）
- [x] 整合 SendGrid 專業郵件服務（已實作，可選用）
- [x] 實作登入嘗試次數限制（5 次失敗後鎖定 15 分鐘）
- [x] 實作帳號鎖定功能
- [x] 更新資料庫 schema 加入鎖定相關欄位
- [x] 測試郵件發送功能（Gmail SMTP + SendGrid）
- [x] 測試登入安全機制
- [x] 儲存 checkpoint


## 忘記密碼功能優化（高優先級）
- [x] 優化忘記密碼頁面 UI/UX
- [x] 優化重設密碼頁面 UI/UX
- [x] 測試完整忘記密碼流程
- [x] 測試郵件發送功能
- [x] 測試 token 驗證功能
- [x] 測試密碼更新功能
- [ ] 儲存 checkpoint


## Header 登入狀態顯示修復
- [x] 診斷 Header 元件登入狀態檢查邏輯
- [x] 修復 Cookie 設定（sameSite: lax）
- [x] 測試登入後會員名稱顯示（已通過 - 2026-01-25）
- [x] 測試登出功能（已通過 - 2026-01-25）
- [x] 儲存 checkpoint


## 刪除並重新創建測試帳號
- [x] 刪除 jeffhsieh09@gmail.com 帳號
- [ ] 重新部署最新版本
- [ ] 使用 Google 登入創建新帳號
- [ ] 驗證會員名稱正確顯示
- [ ] 測試登出功能


## Google 登入 Cookie 問題診斷與修復
- [x] 診斷 Cookie 未設定的根本原因（開發環境端口衝突、Cookie 名稱為 app_session_id）
- [x] 添加詳細調試日誌到 Google OAuth callback
- [x] 嘗試清理殭屍進程（端口 3000 被殭屍進程佔用，無法釋放）
- [x] 修改伺服器啟動邏輯使用 SO_REUSEADDR（部分緩解問題）
- [ ] 在生產環境測試 Google 登入功能（推薦）
- [ ] 驗證 Cookie 正確設定（app_session_id）
- [ ] 確認用戶資訊正確顯示在 Header


## 自動檢查發現的問題（2026-01-25）

### 高優先級修復
- [x] 修復 tours.test.ts：加入 destinationCountry 和 destinationCity 必填欄位
- [x] 修復 auth.logout.test.ts：更新 cookie 清除邏輯測試
- [x] 修復 auth.test.ts：在測試環境中返回 password reset token
- [x] 修復 Google OAuth 登入後 Header 顯示問題（添加 cookie-parser 中間件）

### 中優先級修復
- [ ] 完善代辦簽證頁面內容
- [ ] 完善包團旅遊頁面內容
- [ ] 完善機票預購頁面內容
- [ ] 完善機場接送頁面內容
- [ ] 完善飯店預訂頁面內容

### 低優先級修復
- [ ] 更新 baseline-browser-mapping 套件


## 會員功能全面測試（2026-01-25）
- [x] 會員註冊功能測試（成功註冊新用戶，顯示歡迎訊息）
- [x] 登入狀態顯示測試（Header 正確顯示用戶名稱「測試用戶」）
- [x] 會員中心頁面測試（正確顯示用戶資料、會員編號、統計數據）
- [x] 登出功能測試（成功登出並跳轉回登入頁面）
- [x] 重新登入功能測試（使用已註冊帳號成功登入）
- [x] Cookie 設定驗證（app_session_id cookie 正確設定）
- [x] 建立網站需求分析報告（WEBSITE_NEEDS_ANALYSIS.md）


## AI 自動生成行程自動儲存功能
- [ ] 修改 tours.autoGenerate API，提取後自動儲存到資料庫
- [ ] 測試自動儲存功能
- [ ] 驗證行程已出現在行程管理列表中


## AI 自動生成行程優化（2026-01-25）
- [x] 建立快速提取模組（webScraper.ts）
- [x] 優化提取速度：從 5 分鐘加快到 13.5 秒
- [x] 修改 autoGenerate API 支援自動儲存到資料庫
- [x] 更新前端支援自動儲存後的回饋訊息
- [x] 測試快速提取功能（成功）
- [ ] 驗證行程已出現在行程管理列表中


## AI 自動生成行程優化（2026-01-25）
- [x] 建立快速提取模組（webScraper.ts）
- [x] 優化提取速度：從 5 分鐘加快到 15-30 秒
- [x] 修改 autoGenerate API 支援自動儲存到資料庫
- [x] 更新前端支援自動儲存後的回饋訊息
- [x] 測試快速提取功能（成功）
- [x] 驗證行程已出現在行程管理列表中（已新增柬埔寨行程）


## AI 自動生成錯誤修復（2026-01-25）
- [ ] 診斷 JSON 解析錯誤原因（LLM API 返回 HTML 而非 JSON）
- [ ] 修復 LLM API 呼叫和錯誤處理
- [ ] 測試修復結果


## AI 自動生成功能優化
- [ ] 測試 AI 自動生成功能（使用具體的雄獅旅遊行程網址）
- [x] 添加進度指示器（顯示提取步驟：抓取網頁 → 解析內容 → AI 分析 → 儲存資料庫）
- [x] 優化提取過程的用戶體驗
- [x] 添加行程快速切換按鈕（上架/下架、熱門/非熱門）
- [x] 自動生成的行程預設為「下架」狀態



## 行程管理列表篩選器功能
- [x] 添加上架狀態篩選器（全部/已上架/未上架）
- [x] 添加熱門狀態篩選器（全部/熱門/非熱門）
- [x] 實作篩選邏輯
- [x] 測試篩選功能
- [x] 儲存 checkpoint



## 行程管理列表搜尋和排序功能
- [x] 添加關鍵字搜尋框（可依行程名稱或目的地搜尋）
- [x] 添加排序功能（價格、天數、建立日期）
- [x] 實作搜尋邏輯
- [x] 實作排序邏輯
- [x] 測試搜尋和排序功能
- [x] 儲存 checkpoint



## 行程管理列表排版優化和編輯功能增強
- [x] 優化表格排版（增加間距、改善對齊、統一樣式）
- [x] 增強編輯對話框的細節（分組欄位、更清晰的標籤、驗證提示）
- [x] 改善操作按鈕的視覺層次和間距
- [x] 測試優化後的排版和編輯功能
- [x] 儲存 checkpoint



## 行程管理頁面篩選器排版優化
- [x] 重新設計篩選器區域的佈局（搜尋框、排序、狀態篩選器整合）
- [x] 添加分類篩選器（按行程類別篩選）
- [x] 改善視覺層次和間距
- [x] 測試優化後的排版
- [x] 儲存 checkpoint



## 重新設計行程管理頁面
- [x] 簡化篩選器區域，減少視覺雜亂
- [x] 改善整體佈局和間距，增加留白
- [x] 統一設計風格，讓頁面更乾淨整潔
- [x] 測試重新設計後的頁面
- [x] 儲存 checkpoint



## 行程詳情頁面設計（基於璽品旅遊風格）
- [ ] 設計行程詳情頁面風格草稿
- [ ] 更新資料庫 schema（新增 Hero 和配色欄位）
- [ ] 實作 Hero 區域（全屏大圖 + 置中標題）
- [ ] 實作動態配色系統（CSS 變數）
- [ ] 實作浮動導航條
- [ ] 實作關鍵特色區塊（大字直式排版）
- [ ] 實作行程亮點卡片
- [ ] 測試並儲存 checkpoint



## 璽品風格行程詳情頁面實作計劃
### 階段一：資料庫擴充和 AI 生成器整合（MVP）
- [ ] 擴充資料庫 Schema（新增 heroImage、colorTheme 等欄位）
- [ ] 執行 `pnpm db:push` 同步資料庫
- [ ] 建立圖片生成輔助函數（imageHelper.ts）
- [ ] 實作 LLM 優化 Prompt 生成
- [ ] 實作圖片生成並上傳到 S3
- [ ] 實作配色主題生成
- [ ] 修改 autoGenerate mutation 整合圖片生成
- [ ] 測試 AI 自動生成功能

### 階段二：Hero 區域和配色系統實作
- [ ] 建立配色主題 Hook（useColorTheme.ts）
- [ ] 建立 Hero 區域組件（TourHero.tsx）
- [ ] 重構行程詳情頁面（TourDetail.tsx）
- [ ] 應用動態配色到頁面各區塊
- [ ] 測試 Hero 區域和配色效果

### 階段三：完整版本（後續優化）
- [ ] 生成行程亮點圖片
- [ ] 生成每日行程圖片
- [ ] 實作圖文交錯佈局
- [ ] 實作浮動導航條
- [ ] 完整的響應式設計
- [ ] 測試並儲存 checkpoint



## 璽品風格行程詳情頁面 - 最終實作計劃

### 階段一：基礎架構（今天，4-5 小時）
- [ ] 安裝依賴（BullMQ、Redis、Unsplash API）
- [ ] 配置 Redis（開發環境 + 生產環境）
- [ ] 資料庫擴充（heroImage、colorTheme、styleGuide、autoGenerated、originalSource）
- [ ] 執行 `pnpm db:push`
- [ ] 建立任務隊列（tourGenerationQueue）
- [ ] 建立 Worker（tourGenerationWorker，包含進度更新和日誌）
- [ ] 實作 tRPC API（autoGenerate、getTaskStatus）
- [ ] 實作速率限制
- [ ] 測試任務執行和重試機制
- [ ] 儲存 checkpoint

### 階段二：多 Agent 系統（明天，4-5 小時）
- [ ] 建立 Web Scraper Agent（Skills）
- [ ] 建立 Content Analyzer Agent（含版權清洗和原創性驗證）
- [ ] 建立 Image Prompt Agent（含全域 Style Guide）
- [ ] 建立 Image Generation Agent
- [ ] 建立 Color Theme Agent
- [ ] 實作 Master Agent 協調邏輯
- [ ] 整合 Unsplash API（含備用圖片輪替）
- [ ] 實作錯誤處理和重試機制
- [ ] 測試各個 Agent
- [ ] 儲存 checkpoint

### 階段三：前端重構（第三天，3-4 小時）
- [ ] 實作進度顯示（即時進度條 + 日誌）
- [ ] 實作分頁式編輯器（6 個 Tab）
- [ ] 實作即時預覽（左編輯右預覽）
- [ ] 實作圖片上傳功能
- [ ] 實作配色選擇器
- [ ] 實作審核機制（待審核列表 + 比對原始內容）
- [ ] 實作重新生成按鈕
- [ ] 實作 upgradeToAIImages 功能
- [ ] 測試前端功能
- [ ] 儲存 checkpoint

### 階段四：測試與優化（第四天，2-3 小時）
- [ ] 功能測試（各個 Agent + 任務隊列 + 錯誤處理）
- [ ] 效能優化（並行處理 + 快取機制 + 圖片壓縮）
- [ ] 調整 validateStyleConsistency 為 console.warn（避免過於嚴格）
- [ ] 準備 5-10 張通用旅遊風景圖作為備案
- [ ] 撰寫 API 文件
- [ ] 撰寫使用說明
- [ ] 撰寫故障排除文件
- [ ] 最終測試
- [ ] 儲存 checkpoint

### 重要提醒
- [ ] 確保開發環境和生產環境都配置好 Redis
- [ ] validateStyleConsistency 先設為 console.warn
- [ ] 準備通用旅遊風景圖作為 Unsplash 備案
- [ ] 預留 Buffer 時間處理環境配置問題



## AI 自動生成行程系統 - 階段一：基礎架構（2026-01-25）
- [x] 安裝 BullMQ、ioredis、unsplash-js 依賴
- [x] 安裝並啟動 Redis server
- [x] 資料庫擴充（新增 heroImage, heroImageAlt, heroSubtitle, colorTheme, keyFeatures, poeticContent 欄位）
- [x] 執行資料庫 migration（0011_gorgeous_valkyrie.sql）
- [x] 建立 Redis 連線配置（server/redis.ts）
- [x] 建立 BullMQ 任務佇列（server/queue.ts）
  - 任務資料結構定義
  - 進度追蹤結構
  - 重試機制（最多 3 次，指數退避）
  - 任務清理策略
- [x] 建立 BullMQ Worker（server/worker.ts）
  - 並發處理（2 個任務同時執行）
  - 速率限制（每分鐘最多 10 個任務）
  - 詳細進度更新（7 個步驟）
- [x] 建立 tourGenerator 模組骨架（server/tourGenerator.ts）
- [x] 新增 tRPC API
  - generateFromUrl mutation（async 處理）
  - getGenerationStatus query（查詢任務狀態）
  - getMyGenerationJobs query（查詢用戶所有任務）
- [x] 實作速率限制（server/rateLimit.ts）
  - 使用 Redis sliding window 演算法
  - 行程生成：每小時 5 次
  - 圖片生成：每小時 20 次
- [x] 建立共享型別定義（shared/tourTypes.ts）
- [x] 在 server 啟動時初始化 Worker
- [x] 測試所有現有功能（70 個測試全部通過）

## AI 自動生成行程系統 - 待實作（階段二至四）
- [ ] 實作 Web Scraper Agent（快速提取行程資訊）
- [ ] 實作 Content Analyzer Agent（內容分析 + 版權清洗）
- [ ] 實作 Image Prompt Agent（LLM 優化圖片提示詞）
- [ ] 實作 Image Generation Agent（Manus API + Unsplash fallback）
- [ ] 實作 Color Theme Agent（根據目的地生成配色）
- [ ] 實作 Master Agent（多代理協調）
- [ ] 建立全域 Style Guide（風格一致性驗證）
- [ ] 實作前端進度顯示介面
- [ ] 實作行程詳情頁面重新設計（Hero、浮動導航、特色區塊）
- [ ] 實作進階編輯介面（分頁、即時預覽）
- [ ] 實作 upgradeToAIImages mutation（可選升級）
- [ ] 整合測試與優化


## AI 自動生成行程系統 - 階段二：多代理系統（2026-01-25）
- [x] 建立 Web Scraper Agent（server/agents/webScraperAgent.ts）
  - 快速提取行程資訊
  - 錯誤處理和重試機制
- [x] 建立 Content Analyzer Agent（server/agents/contentAnalyzerAgent.ts）
  - 內容分析和結構化
  - 版權清洗（LLM 主動改寫）
  - 原創性驗證
- [x] 建立 Image Prompt Agent（server/agents/imagePromptAgent.ts）
  - LLM 優化圖片提示詞
  - 根據目的地和行程主題生成提示詞
  - 整合全域 Style Guide
- [x] 建立 Image Generation Agent（server/agents/imageGenerationAgent.ts）
  - Manus API 生成 Hero 圖片
  - Unsplash API 生成亮點圖片（fallback）
  - 圖片上傳至 S3
  - 風格一致性驗證
- [x] 建立 Color Theme Agent（server/agents/colorThemeAgent.ts）
  - 根據目的地生成配色主題
  - 預設配色方案
- [x] 建立 Master Agent（server/agents/masterAgent.ts）
  - 協調所有 Agent
  - 錯誤處理和回滾
  - 進度追蹤
- [x] 建立全域 Style Guide 配置（server/styleGuide.ts）
- [x] 整合所有 Agent 到 tourGenerator.ts
- [x] 測試完整生成流程
- [x] 儲存 checkpoint


## AI 自動生成行程系統 - 階段一：基礎架構（2026-01-25）
- [x] 安裝 BullMQ、ioredis、unsplash-js
- [x] 安裝並啟動 Redis server
- [x] 擴充資料庫 schema（heroImage, heroImageAlt, heroSubtitle, colorTheme, keyFeatures, poeticContent）
- [x] 建立 Redis 連線配置（server/redis.ts）
- [x] 建立 BullMQ 任務佇列（server/queue.ts）
- [x] 建立 BullMQ Worker（server/worker.ts）
- [x] 建立 tourGenerator 模組骨架（server/tourGenerator.ts）
- [x] 建立 tRPC API（generateFromUrl, getGenerationStatus, getMyGenerationJobs）
- [x] 建立速率限制中間件（server/rateLimit.ts）
- [x] 建立共享型別定義（shared/tourTypes.ts）
- [x] 測試完整生成流程
- [x] 儲存 checkpoint

## AI 自動生成行程系統 - 階段二：多代理系統（2026-01-25）
- [x] 建立 Web Scraper Agent（server/agents/webScraperAgent.ts）
  - 快速提取行程資訊
  - 錯誤處理和重試機制
- [x] 建立 Content Analyzer Agent（server/agents/contentAnalyzerAgent.ts）
  - 內容分析和結構化
  - 版權清洗（LLM 主動改寫）
  - 原創性驗證
- [x] 建立 Image Prompt Agent（server/agents/imagePromptAgent.ts）
  - LLM 優化圖片提示詞
  - 根據目的地和行程主題生成提示詞
  - 整合全域 Style Guide
- [x] 建立 Image Generation Agent（server/agents/imageGenerationAgent.ts）
  - Manus API 生成 Hero 圖片
  - Unsplash API 生成亮點圖片（fallback）
  - 圖片上傳至 S3
  - 風格一致性驗證
- [x] 建立 Color Theme Agent（server/agents/colorThemeAgent.ts）
  - 根據目的地生成配色主題
  - 預設配色方案
- [x] 建立 Master Agent（server/agents/masterAgent.ts）
  - 協調所有 Agent
  - 錯誤處理和回滾
  - 進度追蹤
- [x] 建立全域 Style Guide 配置（server/styleGuide.ts）
- [x] 整合所有 Agent 到 tourGenerator.ts
- [x] 測試完整生成流程
- [x] 儲存 checkpoint

## 新功能：顯示原始來源和原創性評分（2026-01-25）
- [x] 資料庫擴充：新增 sourceUrl 和 originalityScore 欄位
- [x] 更新 Master Agent 儲存 sourceUrl 和 originalityScore
- [x] 更新 tourGenerator 傳遞這些欄位
- [x] 建立驗證報告生成功能（Markdown 格式）
- [x] 測試並儲存 checkpoint


## Admin 後台顯示來源 URL 和原創性評分（2026-01-25）
- [x] 檢查現有 Admin 後台結構
- [x] 更新 tRPC API 返回 sourceUrl 和 originalityScore
- [x] 在行程列表頁面顯示這兩個欄位（僅 admin 可見）
- [x] 在行程詳情頁面顯示這兩個欄位（僅 admin 可見）
- [x] 實作原創性評分顏色標示（90+ 綠色、70-89 黃色、60-69 橙色、<60 紅色）
- [x] 測試並儲存 checkpoint


## 重新設計行程詳情頁面（參考 sipincollection.com）（2026-01-25）
- [ ] 瀏覽並分析 sipincollection.com 的設計
- [ ] 記錄設計特點（Hero、導航、排版、配色、互動）
- [ ] 重新設計 TourDetail 頁面的 Hero Section
- [ ] 重新設計行程內容區塊（日程、亮點、包含項目）
- [ ] 重新設計預訂區塊（價格、日期、CTA）
- [ ] 確保符合黑白配色和極簡風格
- [ ] 測試並儲存 checkpoint


## AI Agent 生成詳細行程內容（參考 sipincollection.com）（2026-01-25）
- [x] 更新資料庫 schema 新增景點 (attractions) 和飯店 (hotels) 欄位
- [x] 分析 sipincollection.com 的設計特點
- [x] 記錄完整的架構流程說明
- [ ] 建立 AttractionAgent 生成景點介紹（100-200 字 + 圖片）
- [ ] 建立 HotelAgent 生成飯店介紹（星級 + 特色 + 體驗 + 圖片）
- [ ] 建立 MealAgent 生成餐食介紹（名稱 + 描述 + 圖片）
- [ ] 建立 FlightAgent 生成航班資訊（航空公司 + 時間 + 特色）
- [ ] 建立 PoeticAgent 生成詩意副標題和文案
- [ ] 更新 Master Agent 協調所有 Agent
- [ ] 更新 TourDetail 頁面使用交錯式左右分欄佈局
- [ ] 更新 TourDetail 頁面新增直式標題
- [ ] 更新 TourDetail 頁面使用不同背景顏色區分區塊
- [ ] 測試並儲存 checkpoint


## 行程下載功能（2026-01-25）
- [ ] 實作行程下載為 PDF 功能（包含完整行程資訊、景點介紹、飯店資訊、航班資訊）
- [ ] 在行程詳情頁面新增「行程下載」按鈕
- [ ] PDF 格式參考 sipincollection.com 的設計（包含大量圖片）
- [ ] 測試並儲存 checkpoint


## 明天待辦事項（2026-01-26）

### 🔴 高優先級

#### 1. 建立專門的 Agent（預計 2-3 小時）
- [ ] **AttractionAgent**（server/agents/attractionAgent.ts）
  - 生成景點深度介紹（100-200 字）
  - 生成詩意副標題（例如：「火山灰封、時光凝結的歷史見證—龐貝古城」）
  - 為每個景點生成圖片
  - 返回格式：`{name, nameEn, poeticSubtitle, description, image, imageAlt, tags}`

- [ ] **HotelAgent**（server/agents/hotelAgent.ts）
  - 生成飯店介紹（100-150 字）
  - 包含星級、特色、體驗描述
  - 為每個飯店生成圖片
  - 返回格式：`{name, stars, description, image, imageAlt}`

- [ ] **MealAgent**（server/agents/mealAgent.ts）
  - 生成餐食介紹
  - 為每個餐食生成圖片
  - 返回格式：`{breakfast, lunch, dinner}`

- [ ] **FlightAgent**（server/agents/flightAgent.ts）
  - 生成航班資訊
  - 包含航空公司、航班號、時間、飛行時數
  - 返回格式：`{outbound: [...], inbound: [...]}`

- [ ] **PoeticAgent**（server/agents/poeticAgent.ts）
  - 生成詩意副標題（例如：「越獅境踏野原魂，追遷徙逐天地心」）
  - 生成每日行程的詩意開場白
  - 返回格式：`{poeticSubtitle, dailyIntros: [...]}`

- [ ] **更新 Master Agent**（server/agents/masterAgent.ts）
  - 協調所有新的 Agent（Attraction, Hotel, Meal, Flight, Poetic）
  - 更新進度追蹤（增加新的步驟）
  - 更新錯誤處理機制

#### 2. 重新設計行程詳情頁面（預計 3-4 小時）
- [ ] **Hero 區域**
  - 全螢幕 Hero 圖片
  - 右側資訊卡片（米色背景）
  - 標題、副標題、天數、價格、按鈕

- [ ] **航班資訊區塊**
  - 清晰的表格設計
  - 去程/回程分開顯示
  - 景點距離參考

- [ ] **每日行程區塊**
  - 左側天數導航（固定在左側，可快速跳轉）
  - 每日標題 + 詩意文案
  - 景點區塊（左右交錯佈局）：
    - 左圖右文 → 右圖左文 → 左圖右文
    - 圖片佔 50% 寬度
    - 文字佔 50% 寬度
    - 景點標題 + 詩意副標題 + 深度介紹（100-200 字）
  - 美食資訊（圖示 + 文字）
  - 住宿資訊（圖示 + 文字）

- [ ] **配色主題**
  - 使用 AI 生成的配色主題
  - 不同區塊使用不同背景顏色

- [ ] **直式標題**
  - 增加藝術感

#### 3. Agent 自動學習排版和風格（新需求）
- [ ] **建立 DesignLearningAgent**（server/agents/designLearningAgent.ts）
  - 從參考網站（sipincollection.com）抓取排版結構
  - 分析配色方案、字體大小、間距、佈局
  - 學習圖片與文字的比例和排列方式
  - 生成設計規範（Design Guidelines）並儲存至資料庫或配置檔案

- [ ] **整合到 Master Agent**
  - 在生成行程前，先調用 DesignLearningAgent 學習參考網站
  - 將學習到的設計規範傳遞給其他 Agent
  - 確保生成的內容符合學習到的風格

- [ ] **建立設計規範資料表**（design_guidelines）
  - 儲存學習到的排版規則
  - 儲存配色方案
  - 儲存字體和間距設定
  - 可供未來生成時參考

### 🟡 中優先級

#### 4. 測試和優化（預計 1-2 小時）
- [ ] 測試完整生成流程（使用真實的旅遊網站 URL）
- [ ] 調整 LLM prompt 優化內容品質
- [ ] 修復 bug 和儲存 checkpoint

#### 5. 行程下載功能（如果時間允許）
- [ ] 實作行程下載為 PDF 功能
- [ ] 設計 PDF 模板（參考 sipincollection.com）
- [ ] 新增下載按鈕和測試


---

## 明天待辦事項（修訂版，2026-01-26）

### 🔴 Critical Fix（必須優先處理）
- [ ] 移除 DesignLearningAgent 的 Runtime 依賴（改為離線工具）
- [ ] 從 Master Agent 中移除 DesignLearningAgent 的調用
- [ ] 使用 Hardcoded 設計規範（server/defaultDesignGuideline.ts）

### 🟡 高優先級（核心功能）
- [ ] 優化所有 Agent 的 Prompt 加入字數強限制
  - PoeticAgent：12-16 字
  - AttractionAgent：100-120 字
  - HotelAgent：80-100 字
  - ContentAnalyzerAgent：標題 20-30 字，描述 100-120 字
- [ ] 加入 Fallback 機制（資料不足時回傳 null）
- [ ] 實作 Master Agent 的 Partial Success 機制

### 🟢 中優先級（前端實作）
- [ ] 實作防禦性 CSS 排版
  - 圖片：object-fit: cover + 固定長寬比
  - 文字：line-clamp 截斷
  - 手機版：橫排 + 單欄
- [ ] 實作 CSS @media print 支援（取代 Puppeteer）

### 🔵 低優先級（如果時間允許）
- [ ] 建立專門的 Agent（Attraction、Hotel、Meal、Flight）
- [ ] 重新設計行程詳情頁面（參考 sipincollection.com）
- [ ] 實作行程下載功能（使用 CSS @media print）

**預計時間：** 7-9 小時（核心）+ 5-7 小時（可選）

**參考文件：** `/home/ubuntu/packgo-travel/TOMORROW_TODO_REVISED.md`

- [x] 優化搜尋按鈕樣式（橘紅色背景、白色文字、圓角）
- [x] 優化勾選框樣式（更大、更清晰）
- [x] 測試所有優化後的搜尋欄樣式
- [x] 儲存 checkpoint


## 實作 Google OAuth + Email/Password 雙軌登入系統
- [x] 更新資料庫 schema（新增 googleId, password, resetPasswordToken, resetPasswordExpires）
- [x] 安裝必要套件（bcryptjs, passport, passport-google-oauth20, etc.）
- [x] 建立完整的認證系統

---

## 🚀 今天執行的三大優化任務（2026-01-25）

### 任務 1：Critical Fix - 移除 DesignLearningAgent Runtime 依賴（30 分鐘）
- [ ] 手動執行一次 DesignLearningAgent 爬蟲，抓取設計參數
- [ ] 將設計參數存成 `server/lib/DEFAULT_DESIGN_GUIDELINES.ts` 靜態配置檔
- [ ] 從 MasterAgent 的執行流程中移除 DesignLearningAgent 調用
- [ ] 修改 MasterAgent 直接讀取 DEFAULT_DESIGN_GUIDELINES.ts
- [ ] 將 DesignLearningAgent 移動到 `server/tools/designLearningTool.ts`（保留作為開發工具）
- [ ] 測試行程生成流程（確認不再調用 DesignLearningAgent）
- [ ] 驗證生成時間減少 15-30 秒

### 任務 2：導入 Skill Prompting（3-4 小時）
- [ ] 創建 `server/agents/skillLibrary.ts`
- [ ] 定義 COPYWRITER_SKILL（用於 ContentAnalyzerAgent）
- [ ] 定義 PHOTOGRAPHER_SKILL（用於 ImagePromptAgent）
- [ ] 定義 POET_SKILL（用於 PoeticAgent）
- [ ] 定義 ATTRACTION_SKILL（用於 AttractionAgent）
- [ ] 定義 HOTEL_SKILL（用於 HotelAgent）
- [ ] 定義 MEAL_SKILL（用於 MealAgent）
- [ ] 在每個 Skill Prompt 中加入「嚴格字數限制」指令
- [ ] 在每個 Skill Prompt 中加入「資料不足回傳 null」指令
- [ ] 在 ContentAnalyzerAgent 中引入 COPYWRITER_SKILL
- [ ] 在 ImagePromptAgent 中引入 PHOTOGRAPHER_SKILL
- [ ] 創建 PoeticAgent 並引入 POET_SKILL
- [ ] 測試生成品質（比較使用前後的差異）

### 任務 3：穩定性與防禦機制（3-4 小時）

#### 3.1 後端 Partial Success 機制
- [ ] 修改 MasterAgent 的錯誤處理邏輯
- [ ] 實作圖片生成失敗時的 Partial Success 標記
- [ ] 圖片生成失敗時使用 placeholder 圖片
- [ ] 確保部分失敗不會導致整個行程生成失敗
- [ ] 測試各種失敗情境（爬蟲失敗、圖片生成失敗、LLM 超時）

#### 3.2 前端防禦性 CSS
- [ ] 圖片防護：object-fit: cover + 固定長寬比
- [ ] 文字截斷：line-clamp（標題 2 行、描述 4 行、詩意文案 1 行）
- [ ] 直式標題的響應式處理（手機版改回橫排）
- [ ] Zigzag 佈局的響應式處理（手機版改為單欄）
- [ ] 測試超長內容不會破壞排版

#### 3.3 CSS Print 樣式
- [ ] 創建 `client/src/print.css`
- [ ] 隱藏不需要列印的元素（navbar、footer、按鈕）
- [ ] 設定分頁規則（page-break-inside: avoid）
- [ ] 調整字體大小和行高
- [ ] 在 TourDetail 頁面引入 print.css
- [ ] 添加「下載 PDF」按鈕（呼叫 window.print()）
- [ ] 測試列印效果（Ctrl+P → 另存為 PDF）

### ✅ 驗收標準

**Critical Fix 驗收：**
- [ ] MasterAgent 不再調用 DesignLearningAgent
- [ ] 使用 DEFAULT_DESIGN_GUIDELINES.ts 作為設計規範
- [ ] 行程生成時間減少 15-30 秒

**Skill Prompting 驗收：**
- [ ] skillLibrary.ts 包含 6 種 Skill Prompt
- [ ] 每個 Skill Prompt 都有「嚴格字數限制」和「資料不足回傳 null」
- [ ] ContentAnalyzerAgent 使用 COPYWRITER_SKILL
- [ ] ImagePromptAgent 使用 PHOTOGRAPHER_SKILL
- [ ] 生成的內容品質明顯提升（需人工評估）

**穩定性與防禦驗收：**
- [ ] Master Agent 實作 Partial Success（圖片失敗不影響行程儲存）
- [ ] 圖片使用 object-fit: cover
- [ ] 文字使用 line-clamp 截斷
- [ ] 手機版使用橫排佈局
- [ ] 測試超長內容不會破壞排版
- [ ] print.css 已創建並引入
- [ ] 列印時隱藏 navbar、footer、按鈕
- [ ] 列印時保持排版美觀
- [ ] 「下載 PDF」按鈕正常運作


---

## 🚀 AI 自動生成行程系統優化（2026-01-26）

### 1. Critical Fix：移除 DesignLearningAgent Runtime 依賴
- [x] 確認系統中不存在 DesignLearningAgent
- [x] 確認 Master Agent 不調用外部設計學習功能
- [x] 確認系統使用靜態配置（ColorThemeAgent）
- [x] 驗證架構無單點故障風險

### 2. Skill Prompting 導入
- [x] 創建 `server/agents/skillLibrary.ts`
- [x] 定義 COPYWRITER_SKILL（文案師）
- [x] 定義 PHOTOGRAPHER_SKILL（攝影師）
- [x] 定義 POET_SKILL（詩人）
- [x] 定義 ATTRACTION_SKILL（領隊）
- [x] 定義 HOTEL_SKILL（飯店評鑑師）
- [x] 定義 MEAL_SKILL（美食評論家）
- [x] 在 ContentAnalyzerAgent 中整合 COPYWRITER_SKILL
- [x] 在 ImagePromptAgent 中整合 PHOTOGRAPHER_SKILL
- [x] 加入字數驗證和重試機制（標題 20-30 字、描述 100-120 字、Hero 副標題 30-40 字）
- [x] 加入資料不足回傳 fallback 的機制

### 3. 穩定性與防禦
- [x] 在 MasterAgent 實作 Partial Success 機制（圖片生成失敗使用 placeholder）
- [x] 創建 `client/src/defensive.css`（圖片防護、文字截斷、響應式處理）
- [x] 創建 `client/src/print.css`（列印優化、PDF 導出支援）
- [x] 在 TourDetail.tsx 中引入防禦性 CSS 和 Print CSS

### 驗收成果
- ✅ 系統無 Runtime 外部依賴
- ✅ 所有 Agent 都有專業人設和字數限制
- ✅ 圖片生成失敗不會導致行程生成失敗
- ✅ 前端排版不會被超長內容破壞
- ✅ 支援 Ctrl+P 列印導出 PDF


## 🐛 首頁 Bug 修復（2026-01-26）
- [x] 檢查開發伺服器日誌（無錯誤）
- [x] 檢查瀏覽器控制台錯誤（無錯誤）
- [x] 定位首頁 bug 的具體位置（未發現 bug）
- [x] 修復首頁 bug（無需修復）
- [x] 測試首頁功能正常運作（正常）

## 📝 AI 系統優化開發報告（2026-01-26）
- [x] 撰寫完整的開發報告（AI_SYSTEM_OPTIMIZATION_REPORT.md）


## 🎨 補充專門 Agent 和重新設計 TourDetail 頁面（2026-01-26）

### 檢查當前 Agent 架構
- [ ] 檢查 MasterAgent 的行程生成流程
- [ ] 確認是否有處理「行程特色」、「每日行程」、「費用說明」、「注意事項」的 Agent
- [ ] 列出缺失的 Agent

### 創建缺失的專門 Agent
- [x] 創建 ItineraryAgent（每日行程詳細規劃）- 使用 ITINERARY_SKILL
- [x] 創建 CostAgent（費用說明）- 使用 COST_SKILL
- [x] 創建 NoticeAgent（注意事項）- 使用 NOTICE_SKILL
- [x] 在 skillLibrary.ts 中加入 ITINERARY_SKILL、COST_SKILL 和 NOTICE_SKILL

### 在 MasterAgent 中整合新的 Agent
- [ ] 在 MasterAgent 中調用 ItineraryAgent
- [ ] 在 MasterAgent 中調用 CostAgent
- [ ] 在 MasterAgent 中調用 NoticeAgent
- [ ] 更新資料庫 schema（如需要）

### 重新設計 TourDetail 頁面的視覺風格
- [ ] 參考 sipincollection.com 的風格（明亮、圖片豐富、Zigzag 佈局）
- [ ] 改變配色（根據目的地調整，而非固定的深色背景）
- [ ] 實作大量圖片與文字交錯分佈（像 PDF 那樣）
- [ ] 實作 Zigzag 佈局（圖文交錯）
- [ ] 加入詩意的文案
- [ ] 保留當前的功能（行程特色、每日行程、費用說明、注意事項）
- [ ] 測試響應式設計（手機版、平板版、桌面版）


### 在 MasterAgent 中整合新的 Agent
- [x] 在 MasterAgent 中調用 ItineraryAgent
- [x] 在 MasterAgent 中調用 CostAgent
- [x] 在 MasterAgent 中調用 NoticeAgent
- [x] 更新 MasterAgentResult 介面（加入 itineraryDetailed, costExplanation, noticeDetailed 欄位）

### 更新資料庫 Schema
- [x] 在 tours 表格中加入 itineraryDetailed 欄位
- [x] 在 tours 表格中加入 costExplanation 欄位
- [x] 在 tours 表格中加入 noticeDetailed 欄位
- [x] 執行 pnpm db:push 同步資料庫


## 🎨 重新設計 TourDetail 頁面（2026-01-26）

### 目標
參考 sipincollection.com 風格，創建圖文交錯的 Zigzag 佈局，根據目的地自動調整配色

### 創建新的 Agent
- [x] 創建 HotelAgent（飯店介紹）- 使用 HOTEL_SKILL
- [x] 創建 MealAgent（餐飲介紹）- 使用 MEAL_SKILL  
- [x] 創建 FlightAgent（航班資訊）- 使用 FLIGHT_SKILL
- [x] 在 skillLibrary.ts 中加入 FLIGHT_SKILL

### 整合新的 Agent
- [x] 在 MasterAgent 中調用 HotelAgent
- [x] 在 MasterAgent 中調用 MealAgent
- [x] 在 MasterAgent 中調用 FlightAgent
- [x] 更新 MasterAgentResult 介面（加入 hotels, meals, flights 欄位）

### 更新資料庫 Schema
- [x] 確認 tours 表格中已有 hotels 欄位
- [x] 確認 tours 表格中已有 meals 欄位
- [x] 確認 tours 表格中已有 flights 欄位
- [x] 如需要則執行 pnpm db:push（不需要，資料庫已有這些欄位）

### 重新設計 TourDetail 頁面
- [ ] 設計 Hero Section（全螢幕背景圖 + 標題）
- [ ] 設計行程特色區塊（圖文交錯）
- [ ] 設計每日行程區塊（時間軸 + 圖片）
- [ ] 設計飯店介紹區塊（Zigzag 佈局）
- [ ] 設計餐飲介紹區塊（Zigzag 佈局）
- [ ] 設計航班資訊區塊
- [ ] 設計費用說明區塊
- [ ] 設計注意事項區塊
- [ ] 實作根據目的地自動調整配色的邏輯
- [ ] 加入「行程下載」功能（參考 CSS Print）

### 測試與驗證
- [ ] 使用 Lion Travel 行程測試生成
- [ ] 驗證所有 Agent 正常運作
- [ ] 驗證頁面排版美觀
- [ ] 驗證配色根據目的地調整
- [ ] 驗證響應式設計


## 🎨 重新設計 TourDetail 頁面（2026-01-26）

### 準備工作
- [ ] 備份當前 TourDetail.tsx 檔案
- [ ] 分析 sipincollection.com 的設計風格
- [ ] 規劃頁面結構和區塊順序

### Hero Section
- [ ] 設計全螢幕背景圖（使用 heroImage）
- [ ] 加入標題和副標題（使用 title 和 heroSubtitle）
- [ ] 加入基本資訊（天數、價格、出發地、目的地）
- [ ] 加入預訂按鈕

### 行程特色區塊（Highlights）
- [ ] 設計 Zigzag 佈局（圖文交錯）
- [ ] 左右交替排列（第 1 個圖片在左、第 2 個圖片在右）
- [ ] 使用 highlights 資料（從資料庫讀取）
- [ ] 加入圖片和描述文字

### 每日行程區塊（Daily Itinerary）
- [ ] 設計時間軸樣式
- [ ] 每日行程卡片（包含日期、標題、描述、圖片）
- [ ] 使用 itineraryDetailed 資料（從資料庫讀取）
- [ ] Zigzag 佈局（圖文交錯）

### 飯店介紹區塊（Hotels）
- [ ] 設計飯店卡片（包含名稱、星級、描述、圖片）
- [ ] 使用 hotels 資料（從資料庫讀取）
- [ ] Zigzag 佈局（圖文交錯）

### 餐飲介紹區塊（Meals）
- [ ] 設計餐飲卡片（包含名稱、描述、圖片）
- [ ] 使用 meals 資料（從資料庫讀取）
- [ ] Zigzag 佈局（圖文交錯）

### 航班資訊區塊（Flights）
- [ ] 設計航班資訊卡片（包含航空公司、航班時間、航班號）
- [ ] 使用 flights 資料（從資料庫讀取）
- [ ] 清晰的資訊層次

### 費用說明區塊（Cost）
- [ ] 設計費用說明清單（包含項目、不包含項目、額外費用）
- [ ] 使用 costExplanation 資料（從資料庫讀取）
- [ ] 清晰的分類和排版

### 注意事項區塊（Notice）
- [ ] 設計注意事項清單（包含行前準備、文化禁忌、健康安全、緊急應對）
- [ ] 使用 noticeDetailed 資料（從資料庫讀取）
- [ ] 清晰的分類和排版

### 根據目的地自動調整配色
- [ ] 實作配色邏輯（根據 destinationCountry 或 destinationCity）
- [ ] 定義不同目的地的配色方案（例如：日本櫻花粉、沖繩海洋藍）
- [ ] 應用配色到頁面元素（背景色、強調色、按鈕顏色）

### 響應式設計
- [ ] 手機版佈局（單欄）
- [ ] 平板版佈局（雙欄）
- [ ] 桌面版佈局（Zigzag）

### 測試與驗證
- [ ] 測試所有區塊是否正確顯示
- [ ] 測試響應式設計
- [ ] 測試配色是否根據目的地自動調整
- [ ] 使用 Lion Travel 行程測試

- [x] 優化搜尋按鈕樣式（橘紅色背景、白色文字、圓角）
- [x] 優化勾選框樣式（對齊、間距）
- [x] 測試所有優化後的樣式
- [x] 儲存 checkpoint


## 重新設計 TourDetail 頁面（2026-01-26）
### 創建新的 Agent
- [x] 創建 HotelAgent（飯店介紹）- 使用 HOTEL_SKILL
- [x] 創建 MealAgent（餐飲介紹）- 使用 MEAL_SKILL  
- [x] 創建 FlightAgent（航班資訊）- 使用 FLIGHT_SKILL
- [x] 在 skillLibrary.ts 中加入 FLIGHT_SKILL

### 整合新的 Agent
- [x] 在 MasterAgent 中調用 HotelAgent
- [x] 在 MasterAgent 中調用 MealAgent
- [x] 在 MasterAgent 中調用 FlightAgent
- [x] 更新 MasterAgentResult 介面（加入 hotels, meals, flights 欄位）

### 更新資料庫 Schema
- [x] 確認 tours 表格中已有 hotels 欄位
- [x] 確認 tours 表格中已有 meals 欄位
- [x] 確認 tours 表格中已有 flights 欄位
- [x] 如需要則執行 pnpm db:push（不需要，資料庫已有這些欄位）

### 重寫 TourDetail 頁面
- [x] 備份當前 TourDetail.tsx
- [x] 創建 TourDetailNew.tsx（Hero + 行程特色 + 每日行程）
- [x] 加入飯店、餐飲、航班、費用、注意事項區塊
- [x] 實作根據目的地自動調整配色的邏輯
- [ ] 測試 TourDetailNew.tsx
- [ ] 更新路由使用 TourDetailNew.tsx
- [ ] 撰寫行程生成流程報告


## 🔍 研究 sipincollection.com 網站（2026-01-26）
- [ ] 訪問 sipincollection.com 首頁，了解網站結構
- [ ] 查看所有行程分類（義大利、日本、歐洲等）
- [ ] 分析至少 5 個不同目的地的行程詳情頁面
- [ ] 記錄每個行程的配色方案
- [ ] 記錄圖文交錯的具體實作方式
- [ ] 記錄內容區塊的組織方式
- [ ] 記錄視覺層次的建立方法
- [ ] 整理設計原則和一致性規律
- [ ] 根據研究結果調整 TourDetailNew.tsx


## Sipincollection 風格行程詳情頁面重新設計（Phase 1）

### 規格書補強（Tech Lead 審查意見）
- [x] 補強 ColorThemeAgent 的 Default Fallback（Pack&Go 品牌標準色）
- [x] 補強錯誤日誌的可視化（資料庫加入 warning_flags 欄位）
- [x] 補強直式標題的 Mobile RWD（Media Query 處理）

### 後端開發
- [x] 實作 ColorThemeAgent 的 Default Fallback 邏輯
- [x] 更新資料庫 Schema，加入 warning_flags 欄位
- [x] 執行資料庫遷移（pnpm db:push）
- [ ] 實作 HeroContentAgent（生成副標題和關鍵詞）
- [ ] 實作 FeaturesExtractorAgent（提取 3 個核心特色）
- [ ] 修改 ImagePromptAgent（增加封面圖、特色圖片提示詞）
- [ ] 修改 MasterAgent（整合新 Agents）
- [ ] 測試 Partial Success 策略

### 前端開發
- [x] 在 client/src/index.css 加入直式標題的 RWD CSS
- [x] 實作 StickyNav 組件（固定導航列）
- [x] 實作 HeroSection 組件（左側直式標題 + 右側大圖）
- [x] 實作 FeaturesSection 組件（三圖並排 + 金色標籤）
- [x] 實作 ImageTextBlock 組件（圖文交錯區塊 - 左大右小 + 重疊）
- [x] 實作 FullWidthSection 組件（全寬背景區塊）
- [x] 創建 TourDetailSipin.tsx，整合所有新組件
- [x] 在 App.tsx 加入 /tours-sipin/:id 路由
- [x] 測試桌面版響應式設計（已驗證）
- [ ] 測試平板版響應式設計
- [ ] 測試手機版響應式設計

### 測試與驗證
- [x] 使用現有行程測試 Sipincollection 風格頁面
- [x] 驗證所有組件正常顯示
- [ ] 使用 Lion Travel URL 測試完整流程
- [ ] 檢查配色方案是否正確應用
- [ ] 檢查圖片是否正確顯示
- [ ] 檢查響應式設計是否正常
- [ ] 檢查直式標題在手機版是否正常（橫排）
- [ ] 檢查 warning_flags 是否正確記錄

### 文檔與部署
- [ ] 撰寫「行程生成流程完整報告」
- [ ] 更新 README.md
- [ ] 創建 checkpoint


## Lion Travel URL 測試與 Agent Review
- [x] 重啟開發伺服器
- [x] 使用 Lion Travel URL 測試行程生成
- [x] Review AI 旅遊顧問的 Prompt
- [x] Review autoGenerate API
- [x] 發現核心問題：AI 旅遊顧問和 autoGenerate API 之間沒有連接
- [x] 記錄每個 Agent 的問題和修復建議
- [ ] 實作修復方案（方案 3 - 混合方案）
- [ ] 測試修復後的完整流程
- [ ] 向用戶報告測試結果

### Agent 運作狀態（所有 Agent 都未被調用）
- [ ] WebScraperAgent：未調用
- [ ] MasterAgent：未調用
- [ ] ColorThemeAgent：未調用
- [ ] ImagePromptAgent：未調用
- [ ] ImageGenerationAgent：未調用
- [ ] ItineraryAgent：未調用
- [ ] CostAgent：未調用
- [ ] NoticeAgent：未調用
- [ ] HotelAgent：未調用
- [ ] MealAgent：未調用
- [ ] FlightAgent：未調用


## 後台管理 AI 自動生成測試（正確的測試流程）
- [ ] 登入後台管理系統（Admin 帳號）
- [ ] 進入「行程管理」頁面
- [ ] 使用「AI 自動生成」功能
- [ ] 輸入 Lion Travel URL
- [ ] 等待行程生成完成
- [ ] 檢查生成的行程是否成功儲存到資料庫
- [ ] 訪問生成的行程詳細頁面
- [ ] 檢查行程詳細頁面是否有 Sipincollection 風格的排版
- [ ] 檢查是否有 StickyNav、HeroSection、FeaturesSection 等組件
- [ ] 檢查配色方案是否根據目的地自動調整
- [ ] Review 每個 Agent 是否正常運作
- [ ] 記錄測試結果和問題


## Sipincollection 風格行程詳情頁面重新設計（Phase 1 完成）

### 規格書補強（Tech Lead 審查意見）
- [x] 補強 ColorThemeAgent 的 Default Fallback（Pack&Go 品牌標準色）
- [x] 補強錯誤日誌的可視化（資料庫加入 warning_flags 欄位）
- [x] 補強直式標題的 Mobile RWD（Media Query 處理）

### 後端開發
- [x] 實作 ColorThemeAgent 的 Default Fallback 邏輯
- [x] 更新資料庫 Schema，加入 warning_flags 欄位
- [x] 執行資料庫遷移（pnpm db:push）

### 前端開發
- [x] 在 client/src/index.css 加入直式標題的 RWD CSS
- [x] 實作 StickyNav 組件（固定導航列）
- [x] 實作 HeroSection 組件（左側直式標題 + 右側大圖）
- [x] 實作 FeaturesSection 組件（三圖並排 + 金色標籤）
- [x] 實作 ImageTextBlock 組件（圖文交錯區塊 - 左大右小 + 重疊）
- [x] 實作 FullWidthSection 組件（全寬背景區塊）
- [x] 創建 TourDetailSipin.tsx，整合所有新組件
- [x] 在 App.tsx 加入 /tours-sipin/:id 路由
- [x] 修正 TourDetailSipin.tsx 的 useParams 錯誤

### 測試與驗證
- [x] 測試桌面版響應式設計（已驗證）
- [ ] 測試平板版響應式設計
- [ ] 測試手機版響應式設計

## 後台管理 AI 自動生成測試（正確的測試流程）
- [x] 登入後台管理系統
- [x] 使用 Lion Travel URL 測試 AI 自動生成功能
- [x] 檢查生成的行程詳細頁面的排版（原始頁面）
- [x] 檢查生成的行程詳細頁面的排版（Sipincollection 風格頁面 - 開發環境）
- [x] 記錄測試結果和發現的問題
- [x] 創建完整的測試結果報告（BACKEND_TEST_RESULTS.md）
- [ ] 創建 checkpoint 並部署到生產環境
- [ ] 測試生產環境的 Sipincollection 風格頁面

### Agent 運作狀態（所有基礎 Agent 都正常運作）
- [x] WebScraperAgent：正常運作
- [x] MasterAgent：正常運作
- [x] ItineraryAgent：正常運作
- [x] CostAgent：正常運作
- [x] NoticeAgent：正常運作
- [x] HotelAgent：正常運作
- [x] MealAgent：正常運作
- [x] FlightAgent：正常運作
- [ ] ColorThemeAgent：需驗證（已加入 Default Fallback）
- [ ] ImagePromptAgent：需驗證
- [ ] ImageGenerationAgent：需驗證
- [ ] HeroContentAgent：尚未實作
- [ ] FeaturesExtractorAgent：尚未實作

## Phase 2: AI Agents 整合（待實作）
- [ ] 實作 HeroContentAgent（生成副標題和關鍵詞）
- [ ] 實作 FeaturesExtractorAgent（提取 3 個核心特色）
- [ ] 修改 ColorThemeAgent（增加更多目的地的配色方案）
- [ ] 修改 ImagePromptAgent（增加封面圖、特色圖片提示詞）
- [ ] 修改 MasterAgent（整合新 Agents）
- [ ] 測試完整的 Sipincollection 風格行程生成流程


## 開發環境清理（用戶反饋：很混亂）
- [x] 修復首頁巨大 Logo 圖片擋住左半邊畫面的問題
- [ ] 檢查並修復其他頁面的視覺問題
- [ ] 清理不必要的測試檔案
- [ ] 驗證修復後的環境狀態


## Logo 過大問題修復
- [x] 診斷 Logo 過大問題的原因
- [x] 修復 Logo 顯示問題（將 logo-bag-black-v3.png 從 788x1106 縮小到 99x140 像素）
- [x] 測試修復結果


## Logo 圖片同步更新
- [x] 縮小白色版本 Logo 圖片（logo-bag-white-v3.png 從 788x1106 縮小到 99x140）
- [x] 修復 Header Logo 尺寸（h-14 改為 h-10 w-10）
- [x] 修復 Footer Logo 尺寸（h-16 改為 h-10 w-10）
- [x] 測試 Header 和 Footer 顯示效果


## AI Agents 測試
- [x] 使用雄獅旅遊連結測試所有 Agents 自動建立行程功能
- [x] 檢視測試結果並報告


## 價格抓取問題修復
- [ ] 分析雄獅旅遊網頁結構
- [ ] 找出價格資訊的正確抓取方式
- [ ] 修復 WebScraperAgent 的價格抓取邏輯
- [ ] 測試修復結果


## 「查看原始行程」按鈕權限修復
- [x] 找到「查看原始行程」按鈕的程式碼位置（TourDetail.tsx 第 774 行）
- [x] 修復權限控制，只讓 admin 看到（加入 isAdmin && 條件）
- [x] 同步修復 TourDetail.backup.tsx



## 完整測試「自動生成行程」功能
- [x] 使用管理員帳號登入網站
- [x] 從管理後台測試自動生成行程功能
- [x] 監控所有 agents 的運作情況
- [x] 回報測試結果

### 測試結果（2026-01-26）
- 測試 URL: https://travel.liontravel.com/detail?NormGroupID=ffaabdeb-b371-441d-9a6b-c93e65db57c4&GroupID=26EU214CI-T&TourSource=Lion&Platform=APP
- 總耗時: 15.6 秒
- 生成行程 ID: 300002
- 行程標題: 【旗艦德瑞】冰雪奇緣！少女峰、馬特宏峰、冰河列車、黃金快線奢華鐵道之旅10日｜冬季限定．一晚五星．免小費
- 目的地: 德國、瑞士 法蘭克福 (預估入境點)
- 天數: 10 天
- 狀態: 已下架（需手動上架）


## 行程詳情頁面改用 Sipincollection 風格
- [ ] 檢查目前的路由設定和頁面導向
- [ ] 修改預設行程詳情頁面為 Sipincollection 風格
- [ ] 測試並報告結果


## TourDetailSipin 路由問題修復
- [x] 修復 TourDetailSipin 組件的路由參數解析（支援 /tours/:id 和 /tours-sipin/:id）

## 價格抓取問題修復
- [x] 分析雄獅旅遊網頁結構（價格在日曆中動態載入）
- [x] 安裝 Puppeteer 依賴
- [x] 創建 PriceAgent 使用 Puppeteer 抓取動態價格
- [x] 更新 WebScraperAgent 整合 PriceAgent
- [x] 測試價格抓取功能（成功抓取到 NT$ 144,900，耗時 12.1 秒）

## 啟用完整 Multi-Agent 流程
- [ ] 啟用 ContentAnalyzer Agent
- [ ] 啟用 ImageGeneration Agent
- [ ] 啟用 ColorTheme Agent

## 設定 Unsplash API Key
- [x] 設定 Unsplash API Key
- [x] 驗證 Unsplash API 憑證（成功搜尋到 10,000 張圖片）
- [ ] 測試圖片獲取功能


## 啟用完整 Multi-Agent 流程
- [ ] 分析現有的管理後台和 API 結構
- [ ] 創建使用 MasterAgent 的新 API 端點
- [ ] 更新管理後台 UI 加入「完整生成」選項
- [ ] 測試完整生成功能並報告結果


## AI 自動生成行程系統優化
- [x] 創建 autoGenerateComplete API 端點（使用 MasterAgent）
- [x] 在管理後台加入「完整生成」選項
- [x] 實作生成模式選擇 UI（快速提取 vs 完整生成）
- [ ] 測試完整生成功能（使用 Lion Travel URL）
- [ ] 驗證生成的行程包含所有豐富內容（Hero 圖片、配色主題、Unsplash 圖片等）
- [ ] 優化完整生成的進度追蹤
- [ ] 儲存 checkpoint


## 行程展示視覺升級 (參考 Sipincollection 高端設計)
### 高優先級 (立即實作) - ✅ 已完成
- [x] 分析現有 TourDetail 頁面結構
- [x] 超大型 Hero 圖片 (全寬 100vh 高度,文字疊加)
- [x] 詩意化標題顯示 (使用 poeticTitle 欄位)
- [x] 配色主題適應 (根據 colorTheme 欄位調整頁面配色)
- [x] 實作特色區塊與圖片疊加效果
- [x] 實作每日行程區塊 (直排標題 + 金色標籤)
- [x] 加入路由設定 (/tours-v2/:id)

### 中優先級 (2-4 週內實作)
- [ ] 圖片疊加效果 (大圖 + 小圖疊加排版)
- [ ] 直排標題設計 (增加視覺變化和藝術感)
- [ ] 金色標籤元素 (為重點資訊增添奢華感)
- [ ] 留白優化 (增加區塊間距,提升閱讀舒適度)

### 低優先級 (未來功能)
- [ ] 滾動動畫效果 (淡入淡出)
- [ ] 圖片 Hover 效果 (縮放)
- [ ] 背景任務處理 (優化生成時間)
- [ ] 圖片快取系統 (降低成本)

### 技術債務
- [ ] 資料庫新增欄位 (poeticTitle, sectionImages, layoutConfig)
- [ ] 圖片優化 (響應式圖片、懶加載、WebP 格式)
- [ ] 性能優化 (並行生成、CDN)


## AI 自動生成系統升級執行計劃 (10 天)

### Phase 1: 資料庫與基礎架構 (Day 1-2) - ✅ 已完成
- [x] Day 1: 新增 `poeticTitle` 和 `featureImages` 欄位到資料庫
- [x] Day 1: 擴充 `dailyItinerary` 結構 (加入 `images` 欄位)
- [x] Day 1: 執行 `pnpm db:push` 同步資料庫
- [x] Day 2: 測試 TourDetailV2 頁面能正確顯示所有新欄位
- [x] Day 2: 驗證 tRPC API 回傳所有必要欄位

### Phase 2: Agents 優化 (Day 3-7)
- [ ] Day 3: ContentAnalyzerAgent - 實作詩意化標題生成
- [ ] Day 3: ContentAnalyzerAgent - 使用 JSON Schema 確保輸出格式
- [ ] Day 3: ContentAnalyzerAgent - 撰寫單元測試
- [ ] Day 4: ImageGenerationAgent - 實作 Hero 圖片生成
- [ ] Day 4: ImageGenerationAgent - 加入圖片品質驗證
- [ ] Day 5: ImageGenerationAgent - 實作特色圖片生成 (3-6 張)
- [ ] Day 5: ImageGenerationAgent - 整合 Unsplash Fallback
- [ ] Day 6: ItineraryAgent - 實作關鍵字提取邏輯
- [ ] Day 6: ItineraryAgent - 實作每日圖片生成 (1-2 張)
- [ ] Day 7: ItineraryAgent - 撰寫單元測試
- [ ] Day 7: MasterAgent - 更新協調邏輯整合所有 Agent

### Phase 3: 測試與優化 (Day 8-10)
- [ ] Day 8: MasterAgent 整合測試
- [ ] Day 8: 加入錯誤處理與 Fallback 機制
- [ ] Day 9: 使用真實雄獅旅遊 URL 端到端測試
- [ ] Day 9: 多目的地測試 (北海道、京都、義大利、摩洛哥)
- [ ] Day 9: 檢查所有視覺元素是否正確顯示
- [ ] Day 10: 測量各步驟耗時,分析瓶頸
- [ ] Day 10: 實作圖片並行生成優化
- [ ] Day 10: 實作圖片快取機制
- [ ] Day 10: 確保總生成時間 < 70 秒

### 後續優化 (Optional)
- [ ] 實作背景任務處理 (Redis + Bull Queue)
- [ ] 實作生成歷史記錄追蹤
- [ ] 實作 A/B 測試系統


## AI 自動生成系統升級執行計劃 (10 天)

### Phase 1: 資料庫與基礎架構 (Day 1-2) - ✅ 已完成
- [x] Day 1: 新增 `poeticTitle` 和 `featureImages` 欄位到資料庫
- [x] Day 1: 擴充 `dailyItinerary` 結構 (加入 `images` 欄位)
- [x] Day 1: 執行 `pnpm db:push` 同步資料庫
- [x] Day 2: 測試 TourDetailV2 頁面能正確顯示所有新欄位
- [x] Day 2: 驗證 tRPC API 回傳所有必要欄位

### Phase 2: Agents 優化 (Day 3-7) - 🚧 進行中
- [x] Day 3: 優化 ContentAnalyzerAgent (詩意化標題生成)
- [x] Day 3: 使用 JSON Schema 確保輸出格式
- [x] Day 3: 更新 MasterAgent 使用新的 poeticTitle 欄位
- [ ] Day 3: 撰寫 ContentAnalyzerAgent 單元測試
- [ ] Day 4-5: 優化 ImageGenerationAgent (Hero 圖片 + 特色圖片 3-6 張)
- [ ] Day 4-5: 整合 Unsplash API 作為 Fallback
- [ ] Day 6-7: 優化 ItineraryAgent (每日行程加入 1-2 張圖片)
- [ ] Day 6-7: 更新 MasterAgent 協調邏輯

### Phase 3: 測試與優化 (Day 8-10)
- [ ] Day 8: MasterAgent 整合測試
- [ ] Day 8: 錯誤處理與 Fallback 機制測試
- [ ] Day 9: 端到端測試 (使用真實雄獅旅遊 URL)
- [ ] Day 9: 多目的地測試 (北海道、京都、義大利、摩洛哥)
- [ ] Day 10: 性能優化 (測量各步驟耗時)
- [ ] Day 10: 實作圖片並行生成與快取機制


## 前端頁面無法顯示問題分析與解決 (緊急) 🔴
- [ ] 檢查開發伺服器日誌找出錯誤訊息
- [ ] 分析 TourDetailV2 程式碼找出潛在問題
- [ ] 檢查資料庫中的實際資料格式
- [ ] 撰寫技術根本原因分析文檔
- [ ] 設計三種可行的解決方案
- [ ] 實作最優解決方案
- [ ] 測試修復後的頁面顯示效果


## 方案 3: Agents 輸出格式重構 (1-2 天) 🔧
- [ ] Step 1: 定義標準輸出格式 (shared/types.ts)
- [ ] Step 2: 更新 ContentAnalyzerAgent (加入 JSON Schema)
- [ ] Step 3: 更新 ColorThemeAgent (加入 JSON Schema)
- [ ] Step 4: 更新 ImageGenerationAgent
- [ ] Step 5: 更新 ItineraryAgent
- [ ] Step 6: 更新 MasterAgent 組裝邏輯
- [ ] Step 7: 測試完整生成流程
- [ ] Step 8: 驗證前端頁面正常顯示


## AI 自動生成系統架構報告與測試
- [x] 創建 AI 自動生成系統架構報告
- [x] 加入系統架構圖和流程圖
- [x] 加入實際案例展示
- [x] 加入性能分析章節
- [x] 加入錯誤處理流程圖
- [x] 加入測試策略章節
- [x] 加入部署與監控章節
- [x] 加入成本分析章節

## AI 自動生成系統優化執行計劃 (10 天)

### Phase 1: 資料庫與基礎架構 (Day 1-2) - ✅ 已完成
- [x] Day 1: 新增 `poeticTitle` 和 `featureImages` 欄位到資料庫
- [x] Day 1: 擴充 `dailyItinerary` 結構 (加入 `images` 欄位)
- [x] Day 1: 執行 `pnpm db:push` 同步資料庫
- [x] Day 2: 測試 TourDetailV2 頁面能正確顯示所有新欄位
- [x] Day 2: 驗證 tRPC API 回傳所有必要欄位

### Phase 2: Agents 優化 (Day 3-7) - 🚧 進行中
- [x] Day 3: 優化 ContentAnalyzerAgent (詩意化標題生成)
- [x] Day 3: 使用 JSON Schema 確保輸出格式
- [x] Day 3: 更新 MasterAgent 使用新的 poeticTitle 欄位
- [ ] Day 3: 撰寫 ContentAnalyzerAgent 單元測試
- [ ] Day 4-5: 優化 ImageGenerationAgent (Hero 圖片 + 3-6 張特色圖片)
- [ ] Day 4-5: 整合 Unsplash API 作為 Fallback
- [ ] Day 6-7: 優化 ItineraryAgent (每日行程加入 1-2 張圖片)
- [ ] Day 6-7: 更新 MasterAgent 協調邏輯

### Phase 3: 測試與優化 (Day 8-10)
- [ ] Day 8: 整合測試 (MasterAgent + 所有 Agents)
- [ ] Day 9: 端到端測試 (真實 URL 生成)
- [ ] Day 10: 性能優化 (圖片並行生成、快取機制)

## 行程展示視覺升級 (參考 Sipincollection 高端設計)
### 高優先級 (立即實作) - ✅ 已完成
- [x] 分析現有 TourDetail 頁面結構
- [x] 超大型 Hero 圖片 (全寬 100vh 高度,文字疊加)
- [x] 詩意化標題顯示 (使用 poeticTitle 欄位)
- [x] 配色主題適應 (根據 colorTheme 欄位調整頁面配色)
- [x] 實作特色區塊與圖片疊加效果
- [x] 實作每日行程區塊 (直排標題 + 金色標籤)
- [x] 加入路由設定 (/tours-v2/:id)

### 中優先級 (本週完成)
- [ ] 大幅增加圖片數量 (從 5-8 張增加到 20-30 張)
- [ ] 實作圖片疊加效果 (大圖 + 小圖組合)
- [ ] 實作直排標題 (writing-mode: vertical-rl)
- [ ] 實作金色標籤 (金色邊框 + 透明背景)

### 低優先級 (下週完成)
- [ ] 實作圖片懸停效果 (放大、陰影)
- [ ] 實作滾動動畫 (淡入、滑入)
- [ ] 實作響應式設計 (手機、平板、桌面)

## 前端頁面無法顯示問題分析與解決 (緊急) 🔴
- [x] 檢查開發伺服器日誌找出錯誤訊息
- [x] 分析 TourDetailV2 程式碼找出潛在問題
- [ ] 檢查資料庫中的實際資料格式
- [x] 撰寫技術根本原因分析文檔
- [x] 設計三種可行的解決方案
- [x] 選擇方案 3: Agents 輸出格式重構
- [ ] 實作方案 3
- [ ] 測試修復後的頁面顯示效果

## 方案 3: Agents 輸出格式重構 (1-2 天) 🚧 進行中
- [x] 定義標準輸出格式 (shared/agentTypes.ts)
- [x] 更新 ContentAnalyzerAgent (加入 JSON Schema 確保 highlights 是字串陣列)
- [x] 更新 ColorThemeAgent (已確認格式正確,不需修改)
- [x] 更新 ImageGenerationAgent (在 MasterAgent 中轉換為 featureImages 字串陣列)
- [x] 更新 ItineraryAgent (格式正確,圖片功能待後續優化)
- [x] 更新 MasterAgent 組裝邏輯 (將 highlights 和 featureImages 儲存為字串陣列)
- [ ] 測試完整生成流程
- [ ] 驗證前端頁面能正常顯示


## Agent Skills 架構整合完成 (2026-01-26)
- [x] 創建 skillLoader.ts 統一載入器和快取機制
- [x] 整合 MasterAgent SKILL.md
- [x] 整合 WebScraperAgent SKILL.md
- [x] 整合 ContentAnalyzerAgent SKILL.md
- [x] 整合 ColorThemeAgent SKILL.md
- [x] 整合 ImagePromptAgent SKILL.md
- [x] 整合 ImageGenerationAgent SKILL.md
- [x] 整合 ItineraryAgent SKILL.md
- [x] 整合 CostAgent SKILL.md
- [x] 整合 NoticeAgent SKILL.md
- [x] 整合 HotelAgent SKILL.md
- [x] 整合 MealAgent SKILL.md
- [x] 整合 FlightAgent SKILL.md
- [x] 創建整合測試腳本
- [x] 驗證所有 Agents 成功載入 SKILL 文檔


## Reference 文件庫建立 (2026-01-26)
- [ ] 建立 references/ 目錄架構
- [ ] 創建 Sipincollection 設計規範參考文件
- [ ] 創建目的地色彩對照表參考文件
- [ ] 創建詩意化標題範例庫參考文件
- [ ] 更新 skillLoader.ts 支援 Reference 載入
- [ ] 更新相關 Agents 的 SKILL.md 引用 Reference
- [ ] 測試 Reference 載入功能
- [ ] 儲存 checkpoint


## Reference 文件庫建立完成 (2026-01-26)
- [x] 研究 Sipincollection 設計風格
- [x] 創建 Sipincollection-Design-Guidelines.md (5.1KB, 完整設計規範)
- [x] 創建 Destination-Color-Palette.md (6.1KB, 全球目的地色彩對照表)
- [x] 創建 Poetic-Title-Examples.md (4.0KB, 詩意化標題範例庫)
- [x] 擴展 skillLoader 支援 Reference 載入和快取
- [x] 更新 ContentAnalyzerAgent SKILL.md 引用 Reference
- [x] 更新 ColorThemeAgent SKILL.md 引用 Reference
- [x] 更新 ImagePromptAgent SKILL.md 引用 Reference
- [x] 測試 Reference 整合功能 (11項測試全部通過)


## MasterAgent 優化 (2026-01-26)
- [x] 分析現有 MasterAgent 實作和 SKILL.md 指引
- [x] 設計優化方案（任務分配、錯誤處理、重試機制）
- [x] 實作任務佇列管理器 (agentOrchestration.ts)
- [x] 實作錯誤處理和重試機制 (RetryManager, FallbackManager)
- [x] 實作 Agent 協作狀態監控 (AgentMonitor)
- [x] 實作並行執行優化 (Phase 1 和 Phase 3)
- [x] 測試優化後的 MasterAgent (所有測試通過, 效能提升 66.9%)
- [x] 儲存 checkpoint


## 設計風格切換 - 從 Sipincollection 改為雄獅旅遊 (2026-01-26)
- [x] 研究雄獅旅遊的設計風格(配色、字體、排版、圖片風格)
- [x] 創建 LionTravel-Design-Guidelines.md 參考文件
- [x] 停用 Sipincollection 引用但保留文件
- [x] 更新 ContentAnalyzerAgent.SKILL.md (移除詩意化標題要求,改為關鍵字密集)
- [x] 更新 ColorThemeAgent.SKILL.md (改用雄獅配色策略)
- [x] 更新 ImagePromptAgent.SKILL.md (改用雄獅圖片風格)
- [x] 更新 skillLoader.ts (新增 getLionTravelGuidelines 函數)
- [x] 測試並儲存 checkpoint


## 真實行程測試 - 雄獅旅遊 URL (2026-01-26)
- [x] 執行 MasterAgent 測試並記錄執行過程 (70.31 秒, 8/11 Agents 成功)
- [x] 分析生成結果的品質和風格符合度 (標題風格不符合雄獅風格)
- [x] 識別問題並提出改善建議 (5 個優先級方案)
- [x] 儲存測試報告和 checkpoint (REAL_TOUR_TEST_REPORT.md)


## React 渲染錯誤修復 - /tours/330001 (2026-01-26)
- [x] 分析錯誤來源並定位問題程式碼 (HeroSection.tsx 第 64 行)
- [x] 修復物件渲染問題 (添加 typeof 檢查並提取 keyword 字串)
- [x] 測試並儲存 checkpoint
