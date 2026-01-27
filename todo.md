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

### Phase 7: 測試與驗證（2026-01-27）
- [ ] 在管理後台生成新行程測試生成時間是否 < 90 秒
- [ ] 驗證 Unsplash 圖片補齊功能是否正常運作
- [ ] 檢查行程詳情頁面 Hero Section 的 16:9 Aspect Ratio
- [ ] 檢查行程詳情頁面 Feature Cards 的 4:3 Aspect Ratio
- [ ] 測試 Sticky Navigation 是否固定在頂部
- [ ] 測試 Back to Top 按鈕是否在滾動超過 500px 時顯示

### Phase 8: 優化行程列表頁面
- [x] 將 Aspect Ratio 規範應用到首頁行程卡片
- [x] 確保首頁行程卡片使用 object-cover
- [x] 確保整體視覺一致性

### Phase 9: 測試 AI 行程生成功能（2026-01-27）
- [ ] 檢查或創建管理員帳號
- [ ] 登入管理後台並導航到行程生成頁面
- [ ] 生成新行程並監控生成時間（目標 < 90 秒）
- [ ] 驗證 Unsplash 圖片補齊功能（當圖片 < 6 張時自動補齊）
- [ ] 檢查生成的行程是否符合「資深旅遊雜誌主編」風格
- [ ] 報告測試結果

### Phase 10: 長期架構優化 - 異步生成模式（2026-01-27）

#### 10.1 架構設計
- [ ] 設計異步生成流程圖
- [ ] 定義 Bull Queue 任務結構
- [ ] 設計進度追蹤機制（使用 Redis）
- [ ] 設計 WebSocket 或 SSE 進度推送機制

#### 10.2 後端實作
- [x] 檢查 Bull Queue 相關依賴是否已安裝
- [x] 發現已有 `server/queue.ts` 和 `server/worker.ts` 實作
- [x] 修改 `server/routers.ts` 添加異步生成 API
  - `tours.submitAsyncGeneration` - 提交生成任務並返回 jobId
  - `tours.getGenerationStatus` - 查詢生成進度
- [x] 修改 `server/tourGenerator.ts` 支援進度回報
  - 在每個 Agent 執行前後更新進度到 Redis
  - 記錄當前執行的 Agent 名稱和完成百分比
- [x] 實作錯誤處理和重試機制
  - 生成失敗時保存錯誤訊息
  - 支援手動重試失敗的任務

#### 10.3 前端實作
- [x] 修改 `client/src/components/admin/ToursTab.tsx`
  - 點擊「開始生成」後立即返回，顯示進度追蹤界面
  - 使用 `trpc.tours.getGenerationStatus.useQuery` 輪詢進度（每 2 秒）
- [x] 保留現有的 `GenerationProgress.tsx` 組件
  - 顯示當前執行的步驟
  - 顯示整體進度百分比
- [x] 實作生成完成通知
  - 使用 Toast 通知管理員生成完成
  - 自動刷新行程列表

#### 10.4 並行處理優化
- [ ] 分析各 Agent 的依賴關係
- [ ] 將獨立的 Agent 改為並行執行
  - HotelAgent 和 RestaurantAgent 可並行
  - ItineraryAgent 和 NoticeAgent 可並行
- [ ] 使用 `Promise.all()` 同時執行多個 Agent
- [ ] 測試並行執行的正確性

#### 10.5 測試與驗證
- [ ] 測試異步生成流程
  - 提交生成任務
  - 監控進度更新
  - 驗證生成結果
- [ ] 測試錯誤處理
  - 模擬生成失敗
  - 驗證錯誤訊息顯示
  - 測試重試機制
- [ ] 測試並行處理
  - 驗證生成時間是否縮短
  - 驗證生成結果的正確性
- [ ] 壓力測試
  - 同時提交多個生成任務
  - 驗證佇列管理是否正常

#### 10.6 文檔與部署
- [ ] 更新 README.md 說明異步生成架構
- [ ] 記錄性能改進數據（生成時間對比）
- [ ] 儲存 checkpoint

### Phase 11: 並行處理優化與 LLM 快取（2026-01-27）

#### 11.1 分析 Agent 依賴關係
- [x] 繪製 Agent 執行流程圖
- [x] 識別可並行執行的 Agent 組合
- [x] 設計並行執行策略
- [x] 發現已完成並行處理優化（Phase 3: 2個 Agent，Phase 4: 7個 Agent）

#### 11.2 實作並行處理
- [x] 修改 `server/tourGenerator.ts` 支援並行執行
- [x] 將 HotelAgent 和 RestaurantAgent 改為並行執行
- [x] 更新進度追蹤機制以支援並行任務
- [x] 實作錯誤處理（部分失敗時的降級策略）

#### 11.3 測試異步生成功能
- [x] 登入管理後台
- [x] 提交新的行程生成任務
- [x] 驗證進度條顯示是否正確
- [x] 測試生成時間是否縮短（已實作異步機制，但生成時間仍需優化）

#### 11.4 實作 LLM 快取機制
- [x] 設計快取鍵值結構（prompt hash + model）
- [x] 實作內存快取層（使用 Map，最多 1000 個條目）
- [x] 修改 `server/_core/llm.ts` 支援快取
- [x] 設定快取過期時間（24 小時）
- [x] 實作快取統計功能（getCacheStats）

### Phase 12: AI 生成行程預覽與編輯功能（2026-01-27）

#### 12.1 設計預覽與編輯流程
- [x] 設計預覽界面（使用行程詳情頁面的樣式）
- [x] 設計編輯界面（表單式編輯，支援所有欄位）
- [x] 設計操作流程（生成 → 預覽 → 編輯 → 確認 → 儲存）

#### 12.2 後端 API 實作
- [x] 發現已有 `autoGenerateComplete` API 支援預覽模式（previewOnly: true）
- [x] 發現已有 `saveFromPreview` API 儲存預覽後的行程
- [x] 後端 API 已完整支援預覽與編輯功能

#### 12.3 前端界面實作
- [x] 發現 `ToursTab.tsx` 已有預覽對話框
- [x] 創建 `TourEditDialog.tsx` 編輯對話框組件
- [x] 修改 `ToursTab.tsx` 新增「編輯」按鈕
- [x] 實作預覽 → 編輯 → 儲存的完整流程

#### 12.4 測試
- [ ] 測試生成後預覽功能
- [ ] 測試編輯功能（修改標題、描述、價格等）
- [ ] 測試儲存功能
- [ ] 驗證儲存後的行程是否正確顯示

### Phase 13: 擴展編輯對話框進階欄位（2026-01-27）

#### 13.1 設計進階欄位編輯界面
- [x] 設計每日行程編輯界面（支援新增、刪除、排序）
- [x] 設計費用說明編輯界面（支援多個費用項目）
- [x] 設計注意事項編輯界面（支援多個注意事項）
- [x] 使用 Tabs 分類組織不同類型的欄位

#### 13.2 實作每日行程編輯功能
- [x] 修改 `TourEditDialog.tsx` 新增每日行程編輯區塊
- [x] 實作每日行程的新增、刪除功能
- [x] 支援編輯每日行程的標題、住宿、餐食
- [x] 支援編輯每日活動（時間、地點、標題、描述、交通）

#### 13.3 實作費用說明編輯功能
- [x] 修改 `TourEditDialog.tsx` 新增費用說明編輯區塊
- [x] 實作費用包含項目的編輯
- [x] 實作費用不包含項目的編輯
- [x] 實作額外費用項目的編輯
- [x] 實作費用備註的編輯

#### 13.4 實作注意事項編輯功能
- [x] 修改 `TourEditDialog.tsx` 新增注意事項編輯區塊
- [x] 實作行前準備、文化注意、健康安全、緊急聯絡的編輯
- [x] 支援每個類型的新增、刪除功能

#### 13.5 實作其他進階欄位
- [ ] 實作飯店資訊編輯功能
- [ ] 實作餐飲資訊編輯功能
- [ ] 實作航班資訊編輯功能

#### 13.6 測試
- [ ] 測試每日行程編輯功能
- [ ] 測試費用說明編輯功能
- [ ] 測試注意事項編輯功能
- [ ] 驗證儲存後的行程是否正確顯示所有進階欄位

### Phase 14: 修復 AI 生成失敗問題（2026-01-27）

#### 14.1 調查錯誤原因
- [x] 檢查後端日誌（devserver.log, browserConsole.log）
- [x] 檢查前端錯誤訊息
- [x] 分析 AbortSignal 錯誤的觸發原因（發現是 5 分鐘超時設定）

#### 14.2 修復錯誤
- [x] 修復 AbortSignal 相關問題（將超時時間延長到 10 分鐘）
- [x] 確保異步生成 API 正常運作
- [ ] 測試修復後的生成功能

#### 14.3 測試
- [ ] 在管理後台提交新的生成任務
- [ ] 驗證生成進度顯示是否正常
- [ ] 驗證生成結果是否正確
