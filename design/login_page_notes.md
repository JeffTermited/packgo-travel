# 登入頁面實作筆記

## 設計實現狀況

### 成功實現的元素
1. **黑白極簡風格**：整體配色符合設計稿，使用純黑、深灰與白色
2. **左右分割布局**：左側為黑白濾鏡的巴黎鐵塔旅遊意象，右側為登入表單
3. **TRAVEL NOIR 品牌標語**：左側顯示高端品牌形象
4. **雙標籤切換**：Sign In / Register 標籤切換功能正常
5. **表單元素**：Email、Password 輸入框帶有圖示，視覺清晰
6. **社群登入按鈕**：LINE 與 Google 按鈕已整合，點擊會觸發 Manus OAuth
7. **返回首頁連結**：底部提供返回首頁的導航

### 視覺細節
- 輸入框使用 2px 黑色邊框，聚焦時有黑色 ring 效果
- 按鈕採用全黑背景配白色文字，hover 時變為深灰
- 社群登入按鈕為白底黑框，hover 時反轉為黑底白字
- "Forgot Password?" 連結使用下劃線樣式
- 表單標題 "Member Login." 使用大字體與粗體

### 響應式設計
- 桌面版：左右分割（左側圖片 50%，右側表單 50%）
- 移動版：左側圖片隱藏，僅顯示表單，並在頂部顯示 PACK&GO logo

## 功能整合狀況

### 已完成
- ✅ 路由設定：`/login` 路徑已加入 App.tsx
- ✅ Header 整合：「登入 / 註冊」按鈕已連結至 `/login`
- ✅ OAuth 整合：LINE 與 Google 按鈕已連接 `getLoginUrl()`

### 待實作
- ⏳ 實際的登入表單提交邏輯（目前僅為視覺展示）
- ⏳ 註冊表單提交邏輯
- ⏳ 密碼找回功能
- ⏳ 表單驗證與錯誤提示
- ⏳ 登入成功後的重定向邏輯

## 技術實現

### 使用的組件
- shadcn/ui Tabs（標籤切換）
- shadcn/ui Input（輸入框）
- shadcn/ui Label（標籤）
- shadcn/ui Button（按鈕）
- lucide-react 圖示（Mail, Lock, User）
- wouter Link（路由導航）

### 圖片資源
- 左側背景圖：使用 Unsplash 的巴黎鐵塔圖片（已套用 grayscale 濾鏡）
- Logo：引用 `/logo.png`（移動版顯示）

## 下一步建議

1. **實作真實登入邏輯**：連接 tRPC 後端 API
2. **表單驗證**：使用 react-hook-form + zod
3. **錯誤處理**：顯示登入失敗訊息
4. **載入狀態**：按鈕點擊後顯示 loading spinner
5. **會員個人頁面**：登入成功後跳轉至會員中心
