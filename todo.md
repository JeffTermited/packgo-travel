# PACK&GO 旅行社專案待辦事項

## AI 自動行程生成系統優化（2026-01-27）

### Phase 1: 用詞策略驗收 - 固化 System Prompt
- [x] 修改 ContentAnalyzerAgent persona 為「資深旅遊雜誌主編」
- [x] 加入 Negative Constraints（禁用：靈魂、洗滌、光影、呢喃、心靈、深度對話、完美融合）
- [x] 保留感官細節、場景化敘事、情緒共鳴
- [x] 避免過度哲學化和抽象化

### Phase 2: 解決生成超時 - 修改字數檢查邏輯
- [x] 修改 ContentAnalyzerAgent 字數檢查為寬容模式（±30% 誤差）
- [x] 修改 ItineraryAgent 字數檢查為寬容模式（±30% 誤差）
- [x] 修改 CostAgent 字數檢查為寬容模式（±30% 誤差）
- [x] 修改 HotelAgent 字數檢查為寬容模式（±30% 誤差）
- [x] 修改 MealAgent 字數檢查為寬容模式（±30% 誤差）
- [x] 修改 FlightAgent 字數檢查為寬容模式（±30% 誤差）
- [x] 修改 NoticeAgent 字數檢查為寬容模式（±30% 誤差）
- [x] 目標：將生成時間從 215 秒縮短到 90 秒以內

### Phase 3: 修復 NoticeAgent 與航班資訊
- [x] 確保 NoticeAgent JSON 格式合法，若 LLM 失敗直接使用預設 Template
- [x] 加入 FlightAgent Regex 補強，針對 Markdown 中的 HH:MM 格式進行提取

### Phase 4: 解決排版混亂與照片不足
- [x] 實作 Unsplash API 後端整合（搜尋旅遊相關圖片）
- [x] 在 tourGenerator.ts 中加入圖片補齊邏輯（當圖片 < 6 時自動調用 Unsplash）
- [x] 修改 TourDetailSipin.tsx Hero Section 強制執行 16:9 Aspect Ratio
- [x] 修改 Feature Cards 強制執行 4:3 Aspect Ratio
- [x] 使用 object-fit: cover 確保圖片填滿容器
- [x] 使用 line-clamp-3 和 Grid layout 確保卡片高度一致
- [x] 修復圖片對齊問題

### Phase 5: 導航與互動
- [x] 實作 Sticky Navigation（滾動時固定在頂部）
- [x] 實作 Back to Top 浮動按鈕（右下角，滾動超過 500px 時顯示）
- [x] 手機版檢查（vertical text 改為 horizontal）
- [x] 測試所有互動功能

### Phase 6: 測試所有優化並儲存 checkpoint
- [ ] 在管理後台生成新行程測試生成時間是否 < 90 秒
- [ ] 驗證用詞品質是否符合「資深旅遊雜誌主編」風格
- [ ] 檢查所有區塊是否正確渲染
- [ ] 檢查圖片數量是否 >= 6 張
- [ ] 檢查 Aspect Ratio 是否正確
- [ ] 檢查 Sticky Navigation 和 Back to Top 是否正常運作
- [ ] 儲存 checkpoint

---

## 已完成功能
- [x] 基礎網站結構（Header、Hero、Destinations、FeaturedTours、Footer）
- [x] 黑白極簡設計風格
- [x] Logo 設計與整合
- [x] 移除 Header 頂部工具列
- [x] 移除 Footer 名片區塊
- [x] 整合雄獅旅遊風格的搜尋控制台
- [x] 全端專案升級（資料庫 + 使用者系統）
- [x] 資料庫結構同步
- [x] AI 自動行程生成功能（包含所有 8 個詳細欄位）
- [x] 行程詳情頁面（每日行程、費用說明、航班資訊、注意事項）
- [x] 行程下載 PDF 功能
- [x] Sticky Navigation 優化
- [x] 視覺優化（減少間距 26-37%、字體大小減少 25%）

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
