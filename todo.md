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
- [x] 修復 AbortSignal 相關問題（將 BullMQ Worker 的 lockDuration 延長到 10 分鐘）
- [x] 確保異步生成 API 正常運作
- [x] 找到真正原因：BullMQ 預設 lockDuration 僅 30 秒，導致長時間任務被中止
- [ ] 測試修復後的生成功能

#### 14.3 測試
- [ ] 在管理後台提交新的生成任務
- [ ] 驗證生成進度顯示是否正常
- [ ] 驗證生成結果是否正確

### Phase 15: 縮短 AI 生成時間（2026-01-27）

#### 15.1 分析性能瓶頸
- [ ] 添加詳細的時間追蹤日誌（記錄每個 Agent 的執行時間）
- [ ] 分析哪些 Agent 耗時最長
- [ ] 識別可以優化的瓶頸點

#### 15.2 優化 LLM 調用策略
- [ ] 減少 LLM 調用次數（合併相似的 prompt）
- [ ] 使用更快的模型處理簡單任務
- [ ] 優化 prompt 長度（移除不必要的內容）
- [ ] 實作 streaming 模式（邊生成邊處理）

#### 15.3 優化圖片生成流程
- [ ] 減少生成的圖片數量（只生成必要的圖片）
- [ ] 使用 Unsplash API 替代 AI 圖片生成（更快且免費）
- [ ] 實作圖片生成的條件邏輯（根據需求決定是否生成）

#### 15.4 優化並行處理
- [ ] 確認所有可並行的 Agent 都已並行執行
- [ ] 優化 Promise.all 的使用（避免等待最慢的 Agent）
- [ ] 實作超時機制（單個 Agent 超時後使用預設值）

#### 15.5 測試與驗證
- [ ] 測試優化後的生成時間
- [ ] 驗證生成品質沒有下降
- [ ] 記錄優化前後的時間對比


---

## Phase 16: Firecrawl + Claude 整合優化（2026-01-28）

### 16.1 環境準備
- [x] 安裝 @mendable/firecrawl-js
- [x] 安裝 @anthropic-ai/sdk
- [x] 設定 FIRECRAWL_API_KEY 環境變數
- [x] 設定 ANTHROPIC_API_KEY 環境變數
- [x] 測試 Firecrawl API 連線
- [x] 測試 Claude API 連線

### 16.2 Phase 1: Firecrawl 整合
- [x] 建立 server/agents/firecrawlAgent.ts
- [x] 改寫 server/agents/webScraperAgent.ts 使用 Firecrawl
- [x] 實作 Puppeteer fallback 機制
- [x] 測試爬取雄獅旅遊頁面
- [x] 對比 Puppeteer vs Firecrawl 結果（速度、成功率）
- [x] 記錄測試結果

### 16.3 Phase 2: Claude 整合
- [x] 建立 server/agents/claudeAgent.ts
- [ ] 改寫 server/agents/contentAnalyzerAgent.ts 使用 Claude
- [ ] 設計 JSON Schema（對應資料庫 schema）
- [ ] 調整 prompt 以適應 Claude 風格
- [x] 測試結構化提取準確率
- [x] 記錄測試結果

### 16.4 Phase 3: 系統優化
- [ ] 確認 Queue + Worker 正確運作
- [ ] 修改 server/routers.ts 使用 enqueue
- [ ] 延長 SSE 超時設定
- [ ] 增加 SSE 心跳頻率
- [ ] 前端實作 SSE 自動重連
- [ ] 實作並行處理（ImageGenerator, ThemeGenerator）
- [ ] 測試完整流程

### 16.5 Phase 4: 端到端測試
- [ ] 測試 5-10 個不同旅遊網站
- [ ] 確認成功率 >90%
- [ ] 確認平均處理時間 <60 秒
- [ ] 處理邊緣案例（無價格、非標準格式）
- [ ] 撰寫測試報告
- [ ] 更新 README.md
- [ ] 儲存 checkpoint


### 16.6 Phase 3: ContentAnalyzerAgent 整合
- [x] 改寫 server/agents/contentAnalyzerAgent.ts 使用 Claude
- [x] 設計 JSON Schema（對應資料庫 schema）
- [x] 調整 prompt 以適應 Claude 風格
- [ ] 測試結構化提取準確率
- [ ] 記錄測試結果

### 16.7 Phase 4: SSE 超時修復
- [x] 延長 server/progressRouter.ts 的 SSE 超時設定
- [x] 增加 SSE 心跳頻率（從 30s 改為 15s）
- [x] 前端實作 SSE 自動重連機制
- [ ] 測試 SSE 連接穩定性

### 16.8 Phase 5: 端到端測試
- [ ] 啟動 Redis 服務
- [ ] 重新啟動開發伺服器
- [ ] 登入管理後台
- [ ] 測試完整 AI 生成流程
- [ ] 記錄生成時間、成功率、錯誤訊息
- [ ] 驗證資料是否正確儲存到資料庫


---

## Phase 17: Git Checkpoint 修復與驗收測試

### 17.1 壓縮圖片並清理 Git 歷史
- [x] 安裝 sharp 套件
- [x] 壓縮 client/public/images/ 中的所有圖片到 < 500KB
- [x] 刪除原始大型圖片檔案
- [x] 更新前端程式碼使用 WebP 圖片
- [ ] 使用 BFG Repo-Cleaner 清理 Git 歷史中的大檔案
- [ ] 驗證 .git 資料夾大小

### 17.2 更新 .gitignore 並重試 Checkpoint
- [x] 更新 .gitignore 確保 dist/ 和 node_modules/ 被忽略
- [x] 提交變更並重試 Git push
- [x] 儲存 webdev checkpoint

### 17.3 執行端到端驗收測試
- [ ] 啟動開發伺服器
- [ ] 登入管理後台
- [ ] 測試 AI 生成功能（雄獅旅遊頁面）
- [ ] 驗證生成時間 < 60 秒
- [ ] 驗證進度條順暢運行
- [ ] 驗證生成內容準確性（標題、價格、行程）

### 17.4 （可選）升級 Redis
- [ ] 從官方源安裝 Redis 7.x
- [ ] 測試 BullMQ 功能
- [ ] 更新部署文件


---

## Phase 18: Redis 升級到 7.x

### 18.1 檢查當前 Redis 版本並備份資料
- [x] 檢查當前 Redis 版本 (6.0.16)
- [x] 備份 Redis 資料（RDB dump）
- [x] 記錄當前 Redis 設定

### 18.2 從官方源安裝 Redis 8.x
- [x] 停止當前 Redis 服務
- [x] 新增 Redis 官方 APT 源
- [x] 安裝 Redis 8.4.0
- [x] 啟動 Redis 8.4.0 服務

### 18.3 測試 Redis 功能並驗證 BullMQ
- [x] 測試 Redis 基本功能（PING, SET, GET）
- [x] 測試 BullMQ Queue 功能
- [x] 驗證 Worker 初始化正常

### 18.4 更新文檔並儲存 checkpoint
- [x] 更新部署文檔記錄 Redis 版本
- [x] 儲存 checkpoint


---

## Phase 19: AI 自動生成端到端測試

### 19.1 準備測試環境
- [x] 確認 Redis 服務運行中
- [x] 確認開發伺服器運行中
- [x] 開啟管理後台並登入
- [x] 導航到行程管理頁面

### 19.2 提交 AI 生成任務
- [ ] 記錄開始時間
- [ ] 輸入測試 URL：https://travel.liontravel.com/detail?NormGroupID=972eecc0-3da1-4b60-bb1e-f600b5d6dc78
- [ ] 點擊「AI 自動生成」
- [ ] 開始監控日誌

### 19.3 監控生成進度
- [ ] 記錄每個階段的時間戳
- [ ] 觀察 devserver.log 的 Agent 執行記錄
- [ ] 觀察 browserConsole.log 的前端狀態
- [ ] 記錄進度百分比變化
- [ ] 截圖進度條狀態

### 19.4 驗證生成結果
- [ ] 記錄完成時間
- [ ] 檢查生成的行程資料
- [ ] 驗證標題、價格、天數等欄位
- [ ] 檢查每日行程內容
- [ ] 驗證圖片和配色

### 19.5 撰寫測試報告
- [ ] 整理時間記錄
- [ ] 分析效能指標
- [ ] 對比預期與實際結果
- [ ] 記錄問題和改進建議


---

## Phase 20: AI 生成系統優化 - 一次性完整解決方案（2026-01-28）

### 20.1 將 SSE 改為輪詢機制（3秒間隔）
- [x] 修改 `client/src/components/admin/ToursTab.tsx` 輪詢間隔改為 3 秒
- [x] 修改 `client/src/components/admin/GenerationProgress.tsx` 移除 SSE（EventSource）
- [x] 實作輪詢機制查詢生成狀態
- [x] `server/routers.ts` 的 `getGenerationStatus` API 已正常運作

### 20.2 優化 Agent 並行執行（目標：130s → 70s）
- [x] 分析 `server/agents/masterAgent.ts` 中的 Agent 依賴關係
- [x] 確認已實作 MEGA PARALLEL 執行（7 個 Agent 同時執行）
- [x] Phase 3: ColorTheme + ImagePrompt 並行
- [x] Phase 4: ImageGeneration + Itinerary + Cost + Notice + Hotel + Meal + Flight 並行

### 20.3 優化 Claude API 調用
- [x] 確認使用 Claude 3 Haiku（最快的模型）
- [x] ContentAnalyzerAgent 已整合 Claude API
- [x] 結構化提取使用低溫度（0.3）確保一致性

### 20.4 端到端測試驗證
- [ ] 部署最新代碼到生產環境
- [ ] 測試生成時間是否 < 100 秒
- [ ] 驗證超時問題是否解決（Cloudflare 524 錯誤）
- [ ] 驗證進度顯示是否流暢
- [ ] 驗證生成結果的準確性

### 20.5 創建 Checkpoint 並部署
- [ ] 儲存 checkpoint
- [ ] 部署到生產環境
- [ ] 驗證生產環境功能正常


---

## Phase 21: 漸進式結果顯示優化（2026-01-29）

### 21.1 後端漸進式結果實作
- [x] 更新 `server/agents/progressTracker.ts` 添加 `updatePartialResults` 方法
- [x] 更新 `server/queue.ts` 添加 `PartialResults` 類型定義
- [x] 修改 `server/agents/masterAgent.ts` 在各階段完成後更新漸進式結果
  - Phase 2 完成後：更新標題、詩意標題、目的地、亮點
  - Phase 3 完成後：更新配色方案
  - Phase 4 完成後：更新 Hero 圖片
- [x] 修改 `server/tourGenerator.ts` 傳遞 taskId 並獲取漸進式結果

### 21.2 前端漸進式結果顯示
- [x] 更新 `client/src/components/admin/GenerationProgress.tsx` 添加 `PartialResults` 類型
- [x] 實作漸進式結果預覽區域（即時預覽卡片）
  - 顯示標題和詩意標題
  - 顯示目的地
  - 顯示配色方案（色塊預覽）
  - 顯示 Hero 圖片縮圖
  - 顯示行程亮點

### 21.3 測試與驗證
- [ ] 測試漸進式結果是否正確顯示
- [ ] 驗證各階段結果的更新時機
- [ ] 確認前端 UI 動畫效果流暢
- [ ] 端到端測試完整生成流程


---

## Phase 22: AI 行程生成速度優化 Phase 1（2026-01-29）

### 22.1 Phase 1 優化項目

#### 22.1.1 減少截圖數量和等待時間
- [x] 減少頁面等待時間：8秒 → 3秒
- [x] 減少截圖數量：15張 → 3張（Hero + 行程 + 費用）
- [x] 移除標籤頁點擊邏輯（Firecrawl 已提取文字內容）

#### 22.1.2 並行上傳截圖
- [x] 將順序上傳改為 Promise.all() 並行上傳
- [x] 預期節省：~275秒 → 實際節省：99.9%

#### 22.1.3 壓縮截圖文件
- [x] 截圖格式：PNG → JPEG (quality: 80)
- [x] 視窗解析度：1920x1080 → 1280x720
- [x] 預期文件大小：2.5MB → 0.4MB

#### 22.1.4 增強 JSON 解析容錯
- [x] 實作 cleanJsonResponse() 函數處理 markdown 代碼塊
- [x] 實作 attemptJsonFix() 函數修復常見 JSON 問題
- [x] 修復 Vision API 返回格式不正確的問題

### 22.2 測試結果（2026-01-29）

**測試 URL**: https://travel.liontravel.com/detail?NormGroupID=eb339557-2a25-432d-b9db-d20f1ad1bd9f

**優化前後對比**：

| 指標 | 優化前 | 優化後 | 改善幅度 |
|------|--------|--------|----------|
| 總耗時 | 570 秒 | **122 秒** | **78%** |
| 截圖數量 | 15 張 | **3 張** | 80% |
| 截圖時間 | ~45 秒 | **~2.4 秒** | 95% |
| 上傳時間 | ~275 秒 | **180ms** | 99.9% |
| WebScraperAgent | 520 秒 | **99 秒** | 81% |

**Agent 執行報告**：
- WebScraperAgent: 99 秒（含 Vision 救援）
- ContentAnalyzerAgent: 4.7 秒
- ColorThemeAgent + ImagePromptAgent: 7.1 秒（並行）
- 7 個並行 Agent: 11 秒

**生成結果**：
- 行程標題：「台東絕景饗宴 2 日｜主廚私房菜 × 九日良田茶點」
- 目的地：台灣 台東
- 價格：NT$ 14,000
- 行程 ID：90002


---

## Phase 23: AI 行程生成速度優化 Phase 2（2026-01-29）

### 23.1 Redis 快取機制

#### 23.1.1 WebScraperAgent 快取
- [ ] 實作 URL 正規化函數（移除追蹤參數）
- [ ] 實作 Firecrawl 結果快取（TTL: 24 小時）
- [ ] 實作快取命中時直接返回結果
- [ ] 記錄快取命中率統計

#### 23.1.2 ContentAnalyzerAgent 快取
- [ ] 實作內容分析結果快取（基於 markdown hash）
- [ ] 實作快取命中時直接返回結果

#### 23.1.3 完整結果快取
- [ ] 實作完整行程生成結果快取
- [ ] 相同 URL 第二次請求直接返回快取結果
- [ ] 快取 TTL: 7 天

### 23.2 Firecrawl 提取能力優化

#### 23.2.1 雄獅旅遊專屬解析規則
- [ ] 分析雄獅旅遊網頁結構
- [ ] 實作專屬 CSS 選擇器提取規則
- [ ] 實作每日行程提取邏輯（Day 1, Day 2...）
- [ ] 實作價格和日期提取邏輯
- [ ] 實作住宿和餐食提取邏輯

#### 23.2.2 減少 Vision 救援觸發
- [ ] 優化 Markdown 結構化提取邏輯
- [ ] 增加更多 fallback 提取策略
- [ ] 記錄 Vision 救援觸發率

### 23.3 測試與驗證
- [ ] 測試相同 URL 第二次請求的快取命中
- [ ] 測試雄獅旅遊專屬解析規則
- [ ] 驗證生成時間是否達到 60-90 秒目標
- [ ] 記錄優化前後的時間對比


---

## Phase 23: AI 行程生成速度優化 Phase 2（2026-01-29）

### 23.1 Redis 快取機制確認
- [x] 確認現有快取機制已完善（LLM 快取 24h、完整結果快取 3d、爬取結果快取 1d）
- [x] 確認 Redis 服務正常運作

### 23.2 Firecrawl 提取能力優化
- [x] 創建雄獅旅遊專屬解析器 `lionTravelParser.ts`
- [x] 針對雄獅旅遊 HTML 結構實作專屬 CSS 選擇器
- [x] 在 WebScraperAgent 中優先使用專屬解析器

### 23.3 測試與驗證
- [ ] 測試雄獅旅遊專屬解析器是否正確提取資料
- [ ] 驗證是否減少 Vision 救援觸發頻率
- [ ] 記錄優化後的生成時間



---

## Phase 21: 漸進式結果顯示優化（2026-01-29）

### 21.1 後端漸進式結果追蹤
- [x] 修改 `server/agents/progressTracker.ts` 添加 `partialResults` 欄位
- [x] 修改 `server/agents/masterAgent.ts` 在各階段完成後更新漸進式結果
- [x] 修改 `server/queue.ts` 的 `TourGenerationProgress` 類型包含 `partialResults`

### 21.2 前端漸進式結果顯示
- [x] 修改 `client/src/components/admin/GenerationProgress.tsx` 添加漸進式結果預覽區域
- [x] 顯示標題、配色方案、Hero 圖片等漸進式結果
- [x] 添加動畫效果提升使用者體驗

### 21.3 測試與驗證
- [x] 測試漸進式結果是否正確顯示
- [x] 驗證各階段結果的更新時機
- [x] 確認前端 UI 動畫效果流暢
- [x] 端到端測試完整生成流程

### 21.4 測試結果（2026-01-29）
- 測試 URL：https://travel.liontravel.com/detail?NormGroupID=972eecc0-3da1-4b60-bb1e-f600b5d6dc78
- 生成時間：約 420 秒（7 分鐘）
- 生成結果：「柬埔寨神奇吳哥窟 5 日探索之旅」
- Agent 執行時間：
  - WebScraperAgent: 142 秒
  - ContentAnalyzerAgent: 8.8 秒
  - ColorThemeAgent + ImagePromptAgent: 8.4 秒（並行）
  - ImageGenerationAgent + ItineraryAgent + 其他: 36 秒（並行）
- 輪詢機制成功避免 Cloudflare 100 秒超時
- 漸進式結果顯示功能正常運作

---

## Phase 22: AI 行程生成速度優化 Phase 1（2026-01-29）

### 22.1 優化項目
- [x] 減少截圖數量：15張 → 3張（Hero + 行程 + 費用）
- [x] 並行上傳截圖：順序 → Promise.all()
- [x] 壓縮截圖格式：PNG → JPEG (quality: 80)
- [x] 視窗解析度：1920x1080 → 1280x720
- [x] 減少頁面等待時間：8秒 → 3秒
- [x] 增強 JSON 解析容錯（修復 Vision API 返回格式問題）

### 22.2 測試結果（2026-01-29）
- 測試 URL：https://travel.liontravel.com/detail?NormGroupID=eb339557-2a25-432d-b9db-d20f1ad1bd9f
- 總耗時：122 秒（優化前 570 秒，提升 78%）
- 截圖時間：~2.4 秒（優化前 ~45 秒，提升 95%）
- 上傳時間：180ms（優化前 ~275 秒，提升 99.9%）

---

## Phase 23: AI 行程生成速度優化 Phase 2（2026-01-29）

### 23.1 Redis 快取機制確認
- [x] 確認現有快取機制已完善（LLM 快取 24h、完整結果快取 3d、爬取結果快取 1d）
- [x] 確認 Redis 服務正常運作

### 23.2 Firecrawl 提取能力優化
- [x] 創建雄獅旅遊專屬解析器 `lionTravelParser.ts`
- [x] 針對雄獅旅遊 HTML 結構實作專屬 CSS 選擇器
- [x] 在 WebScraperAgent 中優先使用專屬解析器

### 23.3 天數提取邏輯修復
- [x] 優先從 `duration` 欄位提取天數
- [x] 從標題提取天數（如「台東2日」）
- [x] 從 `dailyItinerary` 長度推斷
- [x] 移除錯誤的預設值 5 天

### 23.4 測試結果（2026-01-29）
- 測試 URL：https://travel.liontravel.com/detail?NormGroupID=eb339557-2a25-432d-b9db-d20f1ad1bd9f&GroupID=26TR217CNY3-T&Platform=APP&fr=cg3972C0701C0201M01
- 總耗時：**84 秒**（目標 90 秒，達成！）
- 天數：**2 天**（正確，修復成功！）
- 行程 ID：120003
- 目的地：台灣 台東, 花蓮

### 23.5 優化效果總結
| 指標 | Phase 1 前 | Phase 1 後 | Phase 2 後 |
|------|------------|------------|------------|
| 總耗時 | 570 秒 | 122 秒 | **84 秒** |
| 天數準確度 | ❌ 5 天 | ❌ 5 天 | ✅ **2 天** |
| 改善幅度 | - | 78% | **85%** |


---

## Phase 24: Upstash Redis 設置（2026-01-29）

### 24.1 修改 Redis 連接配置
- [x] 修改 `server/redis.ts` 支援 Upstash TLS 連接
- [x] 使用 UPSTASH_REDIS_URL 環境變數
- [x] 測試本地開發環境連接

### 24.2 請求用戶提供 Upstash 憑證
- [x] 引導用戶註冊 Upstash 帳號
- [x] 引導用戶創建 Redis 資料庫
- [x] 獲取 UPSTASH_REDIS_URL

### 24.3 測試與驗證
- [x] 測試本地開發環境 Redis 連接
- [ ] 部署到生產環境
- [ ] 測試生產環境 AI 行程生成功能

### 24.4 儲存 Checkpoint
- [ ] 儲存 checkpoint
- [ ] 驗證功能正常


---

## Phase 25: React Error #31 修復（2026-01-29）

### 25.1 問題分析
- [x] 分析錯誤原因：React Error #31 表示「Objects are not valid as a React child」
- [x] 定位問題代碼：`GenerationProgress.tsx` 中的 partialResults 渲染邏輯
- [x] 識別問題欄位：highlights, title, poeticTitle, destination, colorTheme, heroImage, error

### 25.2 修復實作
- [x] 修復 highlights 渲染：確保只渲染字串，物件轉為 JSON
- [x] 修復 title/poeticTitle/destination：添加 typeof 檢查
- [x] 修復 colorTheme：確保 color 值是字串，否則使用 fallback
- [x] 修復 heroImage：添加 typeof 檢查和 onError 處理
- [x] 修復 error 訊息：支援字串和物件格式
- [x] 修復 phase.error：添加 typeof 檢查

### 25.3 測試驗證
- [x] 撰寫 26 個單元測試驗證類型安全處理邏輯
- [x] 所有測試通過（26/26）
- [x] TypeScript 編譯無錯誤

### 25.4 部署與驗證
- [ ] 保存 checkpoint
- [ ] 發佈到生產環境
- [ ] 在生產環境測試 AI 生成功能
- [ ] 驗證進度顯示不再崩潰


---

## Phase 27: ItineraryAgent 重構（2026-01-29）

### 27.1 創建 ItineraryExtractAgent
- [ ] 創建 `server/agents/itineraryExtractAgent.ts`
- [ ] 實作從原始網頁資料提取每日行程的邏輯
- [ ] 支援多種網站格式（雄獅旅遊、易遊網等）

### 27.2 創建 ItineraryPolishAgent
- [ ] 創建 `server/agents/itineraryPolishAgent.ts`
- [ ] 實作使用 LLM 美化行程措辭的邏輯
- [ ] 保持原始資訊不變，只改善表達方式

### 27.3 修改 MasterAgent
- [ ] 整合新的 Agent 流程
- [ ] 先執行 Extract，再執行 Polish
- [ ] 更新進度追蹤

### 27.4 測試與驗證
- [ ] 測試新的行程生成流程
- [ ] 確認每日行程正確生成
- [ ] 保存檢查點


---

## Phase 28: 清除快取並重新測試鳴日號行程（2026-01-29）

### 28.1 清除快取
- [ ] 清除鳴日號行程的 Redis 快取
- [ ] 確認快取已成功清除

### 28.2 重新測試生成
- [ ] 使用鳴日號 URL 重新生成行程
- [ ] 監控 Phase 1 優化的執行情況
- [ ] 驗證行程類型識別是否正確（應識別為 MINGRI_TRAIN）
- [ ] 驗證 fidelityCheck 結果

### 28.3 驗證生成結果
- [ ] 交通方式應為「鳴日號火車」而非「飛機」
- [ ] 飯店應為「The GAYA Hotel 潮渡假酒店」和「花蓮潔西艾美渡假酒店」
- [ ] 景點應包含原始資料中的景點（普悠瑪部落、如豐琢玉工坊等）


---

## Phase 29: 交通資訊 Agent 架構重構（2026-01-29）

### 29.1 創建新的交通 Agent
- [ ] 創建 TrainAgent 處理火車行程（包含鳴日號）
- [ ] 創建 CarAgent 處理自駕/租車行程
- [ ] 創建 CruiseAgent 處理郵輪行程
- [ ] 保留 FlightAgent 處理飛機行程

### 29.2 創建 TransportationAgent 主控制器
- [ ] 創建 TransportationAgent 作為統一入口
- [ ] 根據行程類型自動選擇對應的子 Agent
- [ ] 實作統一的輸出格式

### 29.3 更新 MasterAgent 整合
- [ ] 修改 MasterAgent 使用 TransportationAgent
- [ ] 傳遞行程類型參數
- [ ] 更新進度追蹤

### 29.4 更新前端顯示
- [ ] 修改行程詳情頁面支援不同交通類型
- [ ] 火車行程顯示車次資訊
- [ ] 郵輪行程顯示航線資訊
- [ ] 自駕行程顯示租車資訊

### 29.5 測試驗證
- [ ] 測試鳴日號行程（火車）
- [ ] 測試一般國外行程（飛機）
- [ ] 驗證交通資訊正確顯示


---

## Phase 27: TransportationAgent 架構優化（2026-01-29）

### 27.1 架構設計
- [x] 建立 TransportationAgent 統一交通處理架構
- [x] 建立 TrainAgent 專門處理火車行程（鳴日號等）
- [x] 保留 FlightAgent 處理飛機行程
- [x] 設計統一的 TransportationInfo 輸出格式

### 27.2 後端實作
- [x] 建立 `server/agents/transportationAgent.ts`
- [x] 建立 `server/agents/trainAgent.ts`
- [x] 修改 `server/agents/masterAgent.ts` 使用 TransportationAgent
- [x] 實作交通類型自動識別（FLIGHT, TRAIN, CRUISE, CAR, BUS）
- [x] 修復 TrainAgent JSON Schema 強制 LLM 返回正確格式

### 27.3 前端實作
- [x] 修改 `StickyNav.tsx` 支援條件顯示航班/交通資訊標籤
- [x] 修改 `TourDetailSipin.tsx` 傳遞 transportationType 到 StickyNav
- [x] 當 transportationType 為 TRAIN 時隱藏「航班資訊」標籤

### 27.4 測試驗證
- [x] 清除 Redis 快取和資料庫舊資料
- [x] 重新生成鳴日號行程
- [x] 確認資料庫中 flights 欄位正確存儲 type: "TRAIN"
- [x] 確認前端導覽列正確隱藏「航班資訊」標籤
- [x] 確認瀏覽器控制台日誌顯示正確的 transportationType

### 27.5 已知問題
- [ ] TrainAgent LLM 回應有時會返回非 JSON 格式（已添加 JSON Schema 強制）
- [ ] 部署版本需要重新部署才能生效



---

## Phase 28: 行程詳情頁面全新設計 - 現代極簡風格（2026-01-29）

### 28.1 研究現代極簡旅遊網站設計趨勢
- [x] 研究 2024-2026 現代極簡旅遊網站設計趨勢
- [x] 分析頂級旅遊網站的設計元素
- [x] 確定設計方向和關鍵元素

### 28.2 設計新版行程詳情頁面架構
- [x] 設計整體頁面結構和區塊劃分
- [x] 確定配色方案（動態調整）
- [x] 設計字體和間距系統
- [x] 繪製線框圖

### 28.3 實作 Hero 區塊與導覽列
- [x] 設計全新 Hero 區塊（現代極簡風格）
- [x] 設計固定導覽列
- [x] 實作響應式設計

### 28.4 實作每日行程展示區塊
- [x] 設計每日行程卡片
- [x] 設計時間軸或步驟展示
- [x] 實作活動詳情展開/收合

### 28.5 實作費用說明與注意事項區塊
- [x] 設計費用說明區塊
- [x] 設計注意事項區塊
- [x] 實作清晰的資訊層級

### 28.6 實作飯店與餐飲介紹區塊
- [x] 設計飯店介紹卡片
- [x] 設計餐飲介紹區塊
- [x] 實作圖片展示

### 28.7 整合測試與優化
- [x] 測試所有區塊的響應式設計
- [x] 測試動態配色功能
- [ ] 優化性能和載入速度
- [ ] 測試行程下載 PDF 功能

### 28.8 測試結果
- [x] Hero 區塊：全幅背景圖 + 大標題 + 浮動價格卡片
- [x] 極簡導覽列：概覽、行程、住宿、費用、須知、下載
- [x] 行程概覽：左右分欄、行程亮點列表
- [x] 每日行程：手風琴式展開/收合、藍色數字標籤
- [x] 精選住宿：卡片式設計
- [x] 費用說明：左右分欄（包含/不包含）
- [x] 注意事項：行前準備資訊
- [x] CTA 區塊：黑色背景 + 立即預訂/下載行程按鈕



---

## Phase 29: 行程詳情頁面進階優化（2026-01-29）

### 29.1 優化 Hero 背景圖片動態選擇
- [x] 分析現有 Hero 圖片邏輯
- [x] 實作根據行程目的地動態選擇背景圖片（使用 Unsplash API）
- [x] 優先使用行程的 heroImage，其次使用 Unsplash 搜尋
- [x] 添加預設背景圖片作為 fallback

### 29.2 完善 PDF 下載功能
- [x] 檢查現有 PDF 下載功能
- [x] 添加列印樣式優化（@media print）
- [x] 添加列印專用頁首和頁尾
- [x] 隱藏不需要列印的元素

### 29.4 管理後台顯示原始來源連結
- [x] 在行程管理頁面顯示 sourceUrl
- [x] 讓 admin 可以查看行程的原始生成連結
- [x] 點擊可開啟新分頁查看原始網頁
- [ ] 測試 PDF 內容是否完整

### 29.3 添加交通資訊區塊
- [x] 設計火車行程專屬交通資訊區塊
- [x] 設計郵輪行程專屬交通資訊區塊
- [x] 動態顯示導覽列標籤（列車/郵輪）
- [x] 隱藏飛機行程的交通區塊（使用原有航班資訊）
- [ ] 設計郵輪行程專屬交通資訊區塊
- [ ] 實作條件渲染邏輯（根據交通類型顯示不同區塊）
- [ ] 更新導覽列標籤（航班/火車/郵輪）

### 29.4 測試與驗證
- [ ] 測試動態 Hero 背景圖片
- [ ] 測試 PDF 下載功能
- [ ] 測試交通資訊區塊
- [ ] 保存檢查點

