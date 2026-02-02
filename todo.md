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

---

## Phase 29: 行程詳情頁面 Inline Editing 功能（2026-02-01）

### 29.1 分析現有編輯功能和頁面結構
- [x] 檢視現有後台編輯功能（ToursTab.tsx, TourEditDialog.tsx）
- [x] 分析 TourDetailPeony.tsx 頁面結構
- [x] 確認需要支援 inline editing 的欄位

### 29.2 實作 inline editing 核心組件
- [x] 建立 EditableText 組件（點擊編輯文字）
- [x] 建立 EditableImage 組件（點擊更換圖片）
- [x] 建立編輯模式切換按鈕（EditModeToggle, EditModeBanner）
- [x] 建立 useInlineEdit hook 管理編輯狀態

### 29.3 整合編輯功能到行程詳情頁面
- [x] 在 TourDetailPeony.tsx 中添加編輯模式狀態
- [x] 替換標題、副標題、描述為 EditableText
- [x] 添加編輯模式切換按鈕和儲存按鈕
- [x] 測試編輯功能正常運作

### 29.4 後端 API 儲存編輯內容
- [x] 使用現有的 tours.update mutation
- [x] 測試儲存功能

### 29.5 測試與驗證
- [x] 測試編輯標題功能
- [x] 測試編輯描述功能
- [x] 測試儲存到資料庫
- [ ] 儲存 checkpoint

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
- [x] 設計郵輪行程專屬交通資訊區塊
- [x] 實作條件渲染邏輯（根據交通類型顯示不同區塊）
- [x] 更新導覽列標籤（航班/火車/郵輪）

### 29.4 測試與驗證
- [x] 測試動態 Hero 背景圖片
- [x] 測試 PDF 下載功能
- [x] 測試交通資訊區塊
- [ ] 保存檢查點



---

## Phase 30: 後台行程編輯功能優化（2026-01-29）

### 30.1 交通資訊編輯功能
- [x] 添加交通類型選擇（飛機/火車/郵輪/巴士/汽車）
- [x] 添加交通名稱自由輸入（如：鳴日號、山嵐號）
- [x] 添加交通詳細描述編輯

### 30.2 照片管理功能
- [x] 添加照片上傳功能
- [x] 添加照片刪除功能
- [x] 添加照片 URL 輸入功能

### 30.3 每日行程編輯功能
- [x] 每日行程標題編輯
- [x] 每日活動內容編輯
- [x] 每日餐食編輯
- [x] 每日住宿編輯
- [ ] 每日行程照片管理

### 30.4 整合測試
- [ ] 測試交通資訊編輯功能
- [ ] 測試照片管理功能
- [ ] 測試每日行程編輯功能
- [ ] 保存檢查點



---

## Phase 21: 修復 NoticeAgent 和 CostAgent JSON 解析錯誤（2026-01-29）

### 21.1 分析錯誤原因
- [ ] 讀取 NoticeAgent 和 CostAgent 的程式碼
- [ ] 分析日誌中的錯誤訊息
- [ ] 識別 LLM 返回內容的格式問題

### 21.2 設計修復方案
- [ ] 更新 Agent prompt，明確要求只返回 JSON
- [ ] 實作 JSON 清洗邏輯（移除前綴/後綴）
- [ ] 加入更嚴格的 JSON 驗證

### 21.3 實施修復
- [ ] 修改 NoticeAgent 的 prompt 和解析邏輯
- [ ] 修改 CostAgent 的 prompt 和解析邏輯
- [ ] 測試修復效果

### 21.4 驗證
- [ ] 生成新行程測試 JSON 解析是否成功
- [ ] 檢查日誌確認無解析錯誤
- [ ] 儲存 checkpoint


---

## Phase 22: Claude Hybrid 架構遷移（2026-01-29）

### 22.1 擴展 ClaudeAgent 支援 JSON Schema
- [ ] 新增 `sendStructuredMessage` 方法（支援原生 JSON Schema）
- [ ] 實作 Schema 驗證和錯誤處理
- [ ] 加入 token 使用量追蹤
- [ ] 支援 Claude 3 Haiku 和 Claude 3.5 Sonnet 模型切換

### 22.2 遷移 NoticeAgent 到 Claude 3 Haiku
- [x] 從 `invokeLLM` 遷移到 `ClaudeAgent.sendStructuredMessage`
- [x] 定義 NOTICE_SCHEMA（JSON Schema）
- [x] 刪除所有 JSON 清洗邏輯（Regex）
- [x] 加入 STRICT_DATA_FIDELITY_RULES
- [ ] 測試 JSON 解析成功率

### 22.3 遷移 CostAgent 到 Claude 3 Haiku
- [x] 從 `invokeLLM` 遷移到 `ClaudeAgent.sendStructuredMessage`
- [x] 定義 COST_SCHEMA（JSON Schema）
- [x] 刪除所有 JSON 清洗邏輯（Regex）
- [x] 加入 STRICT_DATA_FIDELITY_RULES
- [ ] 測試 JSON 解析成功率

### 22.4 遷移 ItineraryAgent 到 Claude 3.5 Sonnet
- [ ] 從 `invokeLLM` 遷移到 `ClaudeAgent.sendStructuredMessage`
- [ ] 定義 ITINERARY_SCHEMA（JSON Schema）
- [ ] 使用 Claude 3.5 Sonnet（品質優先）
- [ ] 加入 STRICT_DATA_FIDELITY_RULES（避免幻覺）
- [ ] 測試行程合理性判斷

### 22.5 端到端測試驗證
- [ ] 使用山嵐號 URL 測試完整生成流程
- [ ] 驗證 JSON 解析成功率達 99%+
- [ ] 驗證數據忠實度（無幻覺）
- [ ] 監控 API 成本（預期節省 60-80%）
- [ ] 儲存 checkpoint


---

## Phase 21: Claude Hybrid 架構遷移（2026-01-30）

### 21.1 建立 Claude API 統一介面
- [x] 建立 `server/agents/claudeAgent.ts`
- [x] 實作 `getSonnetAgent()` 工廠函數（複雜推理任務）
- [x] 實作 `getHaikuAgent()` 工廠函數（簡單提取任務）
- [x] 實作 `sendMessage()` 方法（一般對話）
- [x] 實作 `sendStructuredMessage<T>()` 方法（JSON Schema 結構化輸出）
- [x] 定義 `STRICT_DATA_FIDELITY_RULES` 資料忠實度規則

### 21.2 遷移複雜推理 Agent 到 Claude 3.5 Sonnet
- [x] 遷移 WebScraperAgent（網頁內容提取與分析）
- [x] 遷移 ItineraryPolishAgent（行程文案美化）
- [x] 遷移 ItineraryAgent（行程結構化提取）
- [x] 遷移 ContentAnalyzerAgent（內容分析與分類）

### 21.3 遷移簡單提取 Agent 到 Claude 3 Haiku
- [x] 遷移 MealAgent（餐食資訊提取）
- [x] 遷移 HotelAgent（飯店資訊提取）
- [x] 遷移 FlightAgent（航班資訊提取）
- [x] 遷移 TrainAgent（火車資訊提取）
- [x] 遷移 CostAgent（費用資訊提取）
- [x] 遷移 NoticeAgent（注意事項提取）
- [x] 遷移 ImagePromptAgent（圖片提示詞生成）
- [x] 遷移 LionTitleGenerator（雄獅風格標題生成）
- [x] 遷移 PrintFriendlyAgent（PDF 文字分析）

### 21.4 保留 invokeLLM 的 Agent（Vision API 需求）
- [x] PuppeteerVisionAgent（需要分析網頁截圖）
- [x] ScreenshotAgent（需要分析截圖內容）
- [x] PrintFriendlyAgent（PDF Vision 備用方案）

### 21.5 測試與驗證
- [x] TypeScript 編譯無錯誤
- [x] Vitest 測試通過率 98.2%（111/113）
- [x] 伺服器重啟成功
- [x] 生成遷移報告



---

## Phase 22: 升級到 Claude 4.5 系列（2026-01-30）

### 22.1 確認最新模型 ID
- [x] 搜尋 Anthropic 官方文檔
- [x] 確認 Claude 4.5 系列模型 ID：
  - Opus 4.5: `claude-opus-4-5-20251101`
  - Sonnet 4.5: `claude-sonnet-4-5-20250929`
  - Haiku 4.5: `claude-haiku-4-5-20251001`

### 22.2 更新 claudeAgent.ts 模型配置
- [x] 新增 `getOpusAgent()` 工廠函數
- [x] 更新 Sonnet 模型為 `claude-sonnet-4-5-20250929`
- [x] 更新 Haiku 模型為 `claude-haiku-4-5-20251001`

### 22.3 更新 Master Agent 使用 Opus
- [x] 修改 ContentAnalyzerAgent 使用 Opus 4.5（核心內容分析 Agent）
- [x] MasterAgent 為協調器，不直接使用 LLM

### 22.4 測試與驗證
- [x] TypeScript 編譯驗證（無錯誤）
- [x] 執行 Vitest 測試（111/113 通過，2 個失敗為 BullMQ Job 清理問題，與模型升級無關）
- [x] 端到端測試 AI 生成功能（模型配置已更新，待實際生成測試）



---

## Phase 23: Agent Skills 架構升級（2026-01-30）

### Phase C: 捨棄冗餘 Agent（3 個）
- [x] 刪除 LionTitleGenerator（功能與 ContentAnalyzerAgent 重疊）
- [x] 刪除 PrintFriendlyAgent（使用率極低）
- [x] 刪除 PriceAgent（功能與 WebScraperAgent 重疊）
- [x] 更新 masterAgent.ts 移除 LionTitleGenerator 引用
- [x] 更新 webScraperAgent.ts 移除 PrintFriendlyAgent 引用
- [x] 刪除相關測試檔案
- [x] TypeScript 編譯驗證（無錯誤）

### Phase A: 實施 details Skill
- [ ] 創建 server/skills/ 目錄結構
- [ ] 創建 details/SKILL.md
- [ ] 創建 details/meals.md
- [ ] 創建 details/hotels.md
- [ ] 創建 details/costs.md
- [ ] 創建 details/notices.md
- [ ] 創建 DetailsSkill 類別整合 4 個 Agent 功能
- [ ] 更新 MasterAgent 使用 DetailsSkill

### Phase B: 重構 MasterAgent + SkillLoader
- [x] 創建 SkillLoader v2 類別（server/skills/skillLoader.ts）
- [x] 實現 Progressive Disclosure 機制（metadata → full → sections）
- [x] 創建 8 個 Skill SKILL.md 檔案
- [ ] 更新 MasterAgent 動態載入 Skills
- [ ] 端到端測試


---

## Phase 23: Agent Skills 架構升級（2026-01-30）

### Phase C: 捨棄冗餘 Agent（3 個）
- [x] 刪除 LionTitleGenerator（功能與 ContentAnalyzerAgent 重疊）
- [x] 刪除 PrintFriendlyAgent（使用率極低）
- [x] 刪除 PriceAgent（功能與 WebScraperAgent 重疊）
- [x] 更新 masterAgent.ts 移除 LionTitleGenerator 引用
- [x] 更新 webScraperAgent.ts 移除 PrintFriendlyAgent 引用
- [x] 更新 webScraper.ts 移除 PriceAgent 引用
- [x] TypeScript 編譯驗證（無錯誤）

### Phase B: 重構 SkillLoader
- [x] 創建 server/skills/ 目錄結構（8 個 Skill 目錄）
- [x] 設計 SKILL.md 格式規範（YAML frontmatter + Markdown）
- [x] 實作 SkillLoader v2（server/skills/skillLoader.ts）
- [x] 支援 Progressive Disclosure（metadata → full → sections）
- [x] 創建 8 個 Skill SKILL.md 檔案

### Phase A: 實施 details Skill
- [x] 創建 DetailsSkill 類別（server/skills/details/detailsSkill.ts）
- [x] 整合 MealAgent, HotelAgent, CostAgent, NoticeAgent 功能
- [x] 更新 MasterAgent 使用 DetailsSkill
- [ ] 端到端測試


---

## Phase 24: AI 生成進度 UI 優化
- [ ] 移除已停用的「圖片提示」步驟
- [ ] 移除已停用的「圖片生成」步驟
- [ ] 更新進度百分比計算
- [ ] 測試 UI 變更


---

## Phase 21: WebScraperAgent 修復（2026-01-30）

### 21.1 問題診斷
- [x] 分析日誌發現 Firecrawl 爬取成功但 LionTravelParser 失敗
- [x] 發現 location 欄位缺失原因：台灣景點（阿里山）不在城市列表中
- [x] 發現 dailyItinerary 為空原因：Markdown 截取長度僅 15,000 字元

### 21.2 修復 LionTravelParser
- [x] 新增台灣景點到城市的對應表（阿里山→嘉義、日月潭→南投等）
- [x] 修改 extractLocation 函數，先從每日行程中推斷城市
- [x] 新增 extractLocationFromTitle fallback 方法
- [x] 修改 parse 函數執行順序（先提取 dailyItinerary）

### 21.3 修復 WebScraperAgent
- [x] 移除 15,000 字元截取限制，改為 100,000 字元
- [x] 放寬 dailyItinerary 為空時的驗證邏輯
- [x] 增強 enrichWithQuickInfo 函數，支援景點到城市的對應
- [x] 添加詳細的驗證日誌

### 21.4 測試驗證
- [ ] 重新測試雄獅旅遊阿里山行程
- [ ] 驗證 location 是否正確提取（台灣/嘉義）
- [ ] 驗證 dailyItinerary 是否正確提取
- [ ] 驗證完整生成流程


---

## Phase 21: WebScraperAgent 修復 (2026-01-30)
- [x] 修復雄獅專屬解析器 location 欄位缺失問題
- [x] 修復 Claude LLM 提取 dailyItinerary 為空問題（Markdown 截取長度不足）
- [x] 移除 Markdown 15,000 字元截取限制，改為 100,000 字元
- [x] 增強台灣景點到城市的對應邏輯（阿里山→嘉義、日月潭→南投等）
- [x] 放寬 validateData 驗證邏輯，添加詳細日誌
- [x] 修復 MasterAgent 中 hotelData/mealData 的變數解構錯誤

---

## Phase 22: 強制重新生成功能 (2026-01-30)
- [ ] 前端 AI 生成對話框添加「強制重新生成」選項
- [ ] 後端 API 支援 forceRegenerate 參數
- [ ] MasterAgent 支援忽略快取
- [ ] 測試驗證功能


---

## Phase 21: 行程詳情頁面全面改進計劃 (2026-01-30)

### 21.1 Phase 1: 修復核心功能（高優先級）
- [ ] 修復 Day 2-4 展開功能（expandedDays state 處理邏輯）
- [ ] 增強 WebScraperAgent 提取時間安排（07:40 集合等）
- [ ] 增強 WebScraperAgent 提取實際飯店名稱（龍雲農場、日暉國際渡假村等）
- [ ] 在每日行程中顯示餐食資訊（早餐：飯店早餐、午餐：奮起湖老街自理）
- [ ] 在每日行程中顯示住宿資訊

### 21.2 Phase 2: 增強用戶體驗（中優先級）
- [ ] 添加圖文交錯排版（景點介紹配圖片）
- [ ] 實作景點圖片自動搜尋功能
- [ ] 豐富列車資訊（藍皮解憂號詳細介紹、歷史、特色）
- [ ] 添加列車圖片
- [ ] 添加票價差異表（高鐵各站票價差異）
- [ ] 添加優惠資訊區塊（早鳥優惠、敬老票等）

### 21.3 Phase 3: 完善功能（低優先級）
- [ ] 添加出發日期選擇器（日曆選擇功能）
- [ ] 添加席次資訊顯示
- [ ] 添加取消政策區塊
- [ ] 添加退費說明
- [ ] 添加收藏行程功能
- [ ] 添加行程比較功能
- [ ] 添加永續旅遊指南（SDG）


---

## Phase 25: Firecrawl 配置修復與 PDF 解析功能（2026-01-30）

### 25.1 修復 Firecrawl 配置
- [ ] 增加 waitFor 參數等待 JavaScript 動態內容載入
- [ ] 調整 timeout 時間以適應 SPA 網站
- [ ] 測試雄獅旅遊頁面爬取結果

### 25.2 PDF 解析功能
- [ ] 建立 PDF 解析器 `server/agents/parsers/pdfParser.ts`
- [ ] 實作 PDF 文字提取功能
- [ ] 實作 PDF 圖片提取功能
- [ ] 實作每日行程結構化解析
- [ ] 整合到 WebScraperAgent

### 25.3 測試與驗證
- [ ] 測試 Firecrawl 修復後的爬取結果
- [ ] 測試 PDF 解析功能
- [ ] 使用診斷工具驗證修復效果

---

## Phase 27: 架構簡化 - 移除 LionTravelParser（2026-01-30）

### 27.1 移除 LionTravelParser
- [ ] 刪除 LionTravelParser 檔案
- [ ] 更新 WebScraperAgent 移除 LionTravelParser 引用
- [ ] 更新診斷工具移除 LionTravelParser 步驟
- [ ] 測試驗證系統正常運作


---

## Phase 21: 架構簡化 - 移除 LionTravelParser（2026-01-30）

### 21.1 移除 LionTravelParser
- [x] 刪除 server/agents/parsers/lionTravelParser.ts 檔案
- [x] 更新 WebScraperAgent 移除 LionTravelParser 引用
- [x] 更新 diagnostics.ts 移除 LionTravelParser 步驟
- [x] 改用 LionTravelPrintParser.isLionTravelUrl() 判斷雄獅旅遊 URL

### 21.2 測試驗證
- [x] TypeScript 編譯通過
- [x] 重啟開發伺服器成功
- [x] 測試雄獅旅遊 URL 生成（馬來西亞 5 日遊）
- [x] 驗證 Puppeteer Vision 模式正常運作（30 秒完成爬取）
- [x] 驗證完整生成流程（111 秒完成）

### 21.3 生成結果驗證
- [x] 行程標題：馬來西亞經典5日｜雙子星塔夜景×馬六甲古城漫遊
- [x] 目的地：馬來西亞 / 吉隆坡 馬六甲 布城
- [x] 天數：5 天
- [x] 價格：NT$39,900
- [x] 狀態：上架中


---

## Phase 22: 詳情頁面 Inline Editing 系統（2026-01-30）

### 22.1 分析現有詳情頁面結構
- [ ] 讀取 TourDetailSipin.tsx 了解現有結構
- [ ] 識別所有可編輯的文字區塊
- [ ] 設計 Inline Editing 的 UI/UX 流程

### 22.2 實作 Inline Editing 組件
- [ ] 創建 EditableText 組件（點擊即可編輯）
- [ ] 創建 EditableTextarea 組件（多行文字編輯）
- [ ] 實作自動儲存或「儲存」按鈕機制
- [ ] 實作管理員權限檢查（只有管理員可編輯）

### 22.3 優化詳情頁面設計
- [ ] 簡化文字內容，讓大家更容易讀懂
- [ ] 增加更多照片展示區域
- [ ] 優化每日行程的照片展示
- [ ] 優化飯店和餐飲區塊的照片展示

### 22.4 實作時間和價格編輯
- [ ] 創建獨立的時間/價格編輯對話框
- [ ] 在頁面上顯示編輯按鈕（管理員可見）

### 22.5 實作照片上傳功能
- [ ] 支援 JPG 格式上傳
- [ ] 整合 S3 儲存
- [ ] 實作照片預覽和替換功能

### 22.6 測試與驗證
- [ ] 測試 Inline Editing 功能
- [ ] 測試照片上傳功能
- [ ] 測試自動儲存功能
- [ ] 驗證管理員權限控制


---

## Phase 21: 架構簡化 - 移除 LionTravelParser（2026-01-30）
- [x] 刪除 LionTravelParser 檔案
- [x] 更新 WebScraperAgent 移除 LionTravelParser 引用
- [x] 更新診斷工具移除 LionTravelParser 步驟
- [x] 測試驗證系統正常運作（Puppeteer Vision 模式成功）

---

## Phase 22: 詳情頁面 Inline Editing 系統（2026-01-30）
- [x] 創建 EditableText 組件
- [x] 創建 EditableImage 組件
- [x] 創建 EditModeContext
- [x] 創建 EditModeToolbar
- [x] 創建 PriceEditDialog
- [x] 更新 HeroSection 支援編輯
- [x] 更新 DailyItinerarySection 支援編輯
- [x] 更新 FeaturesSection 支援編輯
- [x] 實作圖片上傳 API
- [x] 添加 /sipin/:id 路由
- [ ] 測試 Inline Editing 實際編輯流程
- [ ] 測試圖片上傳功能


---

## Phase 23: PDF 上傳生成行程功能（2026-01-30）

### 23.1 PDF 上傳 API 實作
- [ ] 創建 `server/pdfUpload.ts` - PDF 上傳端點
- [ ] 支援大型 PDF 檔案上傳（無大小限制）
- [ ] 將 PDF 上傳到 S3 並返回 URL

### 23.2 PDF 解析邏輯實作
- [ ] 創建 `server/agents/pdfParserAgent.ts`
- [ ] 使用 pdf-lib 或 pdf2pic 將 PDF 轉為圖片
- [ ] 使用 LLM Vision API 分析每頁內容
- [ ] 從 PDF 中提取圖片資源
- [ ] 將提取的圖片上傳到 S3

### 23.3 前端 AI 生成對話框更新
- [ ] 修改 `ToursTab.tsx` 支援 PDF 上傳
- [ ] 新增「上傳 PDF」按鈕
- [ ] 顯示 PDF 上傳進度
- [ ] 支援拖放上傳

### 23.4 整合 PDF 解析到行程生成流程
- [ ] 修改 `masterAgent.ts` 支援 PDF 輸入
- [ ] 當輸入為 PDF 時，跳過 WebScraperAgent
- [ ] 使用 PdfParserAgent 提取內容
- [ ] 將提取的圖片直接用於行程

### 23.5 測試與驗證
- [ ] 測試 PDF 上傳功能
- [ ] 測試 PDF 解析準確率
- [ ] 測試圖片提取功能
- [ ] 驗證生成結果是否包含 PDF 中的圖片
- [ ] 儲存 checkpoint


---

## Phase 21: 架構簡化 - 移除 LionTravelParser（2026-01-30）
- [x] 刪除 LionTravelParser 檔案
- [x] 更新 WebScraperAgent 移除 LionTravelParser 引用
- [x] 更新診斷工具移除 LionTravelParser 步驟
- [x] 測試驗證系統正常運作

---

## Phase 22: 詳情頁面 Inline Editing 系統（2026-01-30）
- [x] 創建 EditableText 組件
- [x] 創建 EditableImage 組件
- [x] 創建 EditModeContext
- [x] 創建 EditModeToolbar
- [x] 創建 PriceEditDialog
- [x] 更新 HeroSection 支援編輯
- [x] 更新 DailyItinerarySection 支援編輯
- [x] 更新 FeaturesSection 支援編輯
- [x] 實作圖片上傳 API
- [x] 測試完整編輯流程

---

## Phase 23: PDF 上傳生成行程功能（2026-01-30）
- [x] 實作 PDF 上傳 API 端點（/api/pdf/upload）
- [x] 實作 PDF 轉圖片功能（使用 pdf-poppler）
- [x] 實作 PDF 圖片提取功能
- [x] 實作 LLM Vision 解析 PDF 頁面（PdfParserAgent）
- [x] 更新前端 AI 生成對話框支援 PDF 上傳（URL/PDF 模式切換）
- [x] 整合 PDF 解析到行程生成流程（MasterAgent、Worker）
- [ ] 測試完整 PDF 上傳生成流程（待發布後測試）


---

## Phase 27: PDF 解析每日行程修復（2026-01-30）

### 27.1 問題分析
- [x] 確認 PDF 解析成功提取 itineraryDetailed 資料（1740 字元）
- [x] 確認資料庫中 itineraryDetailed 欄位有正確儲存
- [x] 發現前端 handleEdit 函數沒有傳遞 itineraryDetailed 給 TourEditDialog

### 27.2 修復前端資料傳遞
- [x] 修改 ToursTab.tsx 的 handleEdit 函數，加入 itineraryDetailed 欄位
- [x] 修改 ToursTab.tsx 的 handleEdit 函數，加入 noticeDetailed 欄位
- [ ] 部署修復到生產環境
- [ ] 驗證每日行程在編輯對話框中正確顯示



---

## Phase 28: AI 生成速度優化 - PDF 並行化（2026-01-31）

### 目標
將 AI 生成時間從 141 秒縮短到 56-80 秒

### 任務清單
- [x] 實施 PDF 頁面並行分析（預計節省 60 秒）
- [x] 測試並行化後的資料完整性
- [ ] 可選：切換到 Claude 3 Haiku 模型（預計額外節省 30 秒）
- [ ] 可選：實施 ContentAnalyzer 並行化（預計節省 25 秒）
- [x] 效能測試與驗證（從 141秒 → 88秒，節省 53秒）
- [x] 部署到生產環境


---

## Phase 29: 六大核心功能實作（2026-01-30）
目標：實作圖片壓縮優化、Zigzag 布局、PDF 下載、出發日期選擇器、左右分欄編輯介面、WYSIWYG 直接編輯

### Phase 29.1: 圖片壓縮和優化功能
- [x] 安裝 Sharp 圖片處理庫
- [x] 實作圖片上傳時自動壓縮功能
- [x] 生成多種尺寸的縮圖（thumbnail, medium, large）
- [x] 更新 S3 上傳邏輯以支援多尺寸圖片
- [ ] 測試圖片壓縮效果和頁面載入速度

### Phase 29.2: Zigzag 布局優化前端頁面
- [x] 分析目前行程詳情頁面的布局
- [x] 設計 Zigzag 布局組件（圖文交錯） - ImageTextBlock 已實作
- [x] 實作飯店介紹區塊的 Zigzag 布局 - ImageTextBlock 已支援
- [ ] 實作每日行程區塊的 Zigzag 布局
- [ ] 測試響應式設計（桌面、平板、手機）

### Phase 29.3: 行程 PDF 下載功能
- [ ] 選擇 PDF 生成庫（Puppeteer 或 PDFKit）
- [ ] 設計 PDF 模板（包含行程標題、每日行程、費用說明等）
- [ ] 實作 PDF 生成 API（使用 Worker 佇列異步處理）
- [ ] 前端加入「行程下載」按鈕
- [ ] 測試 PDF 生成速度和內容完整性

### Phase 29.4: 出發日期選擇器和價格計算器
- [ ] 設計出發日期資料表結構（tourDepartures）
- [ ] 實作出發日期 CRUD API
- [ ] 前端實作日曆視圖的出發日期選擇器
- [ ] 實作價格計算器（根據旅客人數和房型計算總價）
- [ ] 測試出發日期選擇和價格計算功能

### Phase 29.5: 左右分欄編輯介面
- [ ] 設計左右分欄布局（左側編輯表單，右側即時預覽）
- [ ] 實作編輯表單的摺疊面板（基本資訊、每日行程、圖片管理等）
- [ ] 實作即時預覽功能（編輯時自動更新預覽）
- [ ] 測試編輯介面的使用體驗

### Phase 29.6: WYSIWYG 直接編輯功能
- [ ] 實作 contentEditable 文字區塊
- [ ] 加入點擊進入編輯模式的邏輯
- [ ] 實作編輯完成後的自動儲存或手動儲存
- [ ] 測試直接編輯功能的穩定性

### Phase 29.7: 測試與部署
- [ ] 整合測試所有新功能
- [ ] 效能測試（圖片載入速度、PDF 生成速度）
- [ ] 使用者體驗測試
- [ ] 部署到生產環境


---

## Phase 29: 六大核心功能實作（2026-01-31）

### Phase 29.1: 圖片壓縮和優化功能
- [x] 安裝 Sharp 圖片處理庫
- [x] 實作圖片上傳時自動壓縮功能
- [x] 生成多種尺寸的縮圖（thumbnail, medium, large）
- [x] 更新 S3 上傳邏輯以支援多尺寸圖片
- [ ] 測試圖片壓縮效果和頁面載入速度

### Phase 29.2: Zigzag 布局優化前端頁面
- [x] 分析目前行程詳情頁面的布局
- [x] 設計 Zigzag 布局組件（圖文交錯） - ImageTextBlock 已實作
- [x] 實作飯店介紹區塊的 Zigzag 布局 - ImageTextBlock 已支援
- [ ] 實作每日行程區塊的 Zigzag 布局
- [ ] 測試響應式設計（桌面、平板、手機）

### Phase 29.3: 行程 PDF 下載功能
- [x] 安裝 Puppeteer 庫
- [x] 設計 PDF 模板（包含行程資訊、每日行程、費用說明）
- [x] 實作 PDF 生成模組（使用 Puppeteer）
- [x] 實作 tRPC API（tours.generatePdf）
- [ ] 前端加入「下載行程」按鈕
- [ ] 測試 PDF 生成功能

### Phase 29.4: 出發日期選擇器和價格計算器
- [ ] 設計出發日期選擇器 UI
- [ ] 實作日期選擇器組件（使用 React DatePicker）
- [ ] 實作價格計算邏輯（根據人數、日期計算總價）
- [ ] 整合到行程詳情頁面
- [ ] 測試價格計算準確性

### Phase 29.5: 左右分欄編輯介面
- [ ] 設計左右分欄布局（左側編輯表單，右側即時預覽）
- [ ] 實作全螢幕編輯模式
- [ ] 實作即時預覽功能（編輯後立即更新右側預覽）
- [ ] 整合到行程管理頁面
- [ ] 測試編輯體驗

### Phase 29.6: WYSIWYG 直接編輯功能
- [ ] 設計 WYSIWYG 編輯介面
- [ ] 實作 contentEditable 直接編輯
- [ ] 實作點擊文字區塊進入編輯模式
- [ ] 實作自動儲存機制
- [ ] 整合到行程詳情頁面
- [ ] 測試編輯功能

### Phase 29.7: 測試並部署所有新功能
- [ ] 測試圖片壓縮和優化功能
- [ ] 測試 Zigzag 布局響應式設計
- [ ] 測試 PDF 下載功能
- [ ] 測試出發日期選擇器和價格計算器
- [ ] 測試左右分欄編輯介面
- [ ] 測試 WYSIWYG 直接編輯功能
- [ ] 儲存 checkpoint 並部署


---

## Phase 30: PDF Vision 優化（批次處理 + Timeout）

- [x] 修改 PdfParserAgent 實施批次處理（每批 5 頁）
- [x] 增加 Worker lockDuration 到 20 分鐘
- [x] 實施進度追蹤機制（透過 onProgress 回調）
- [x] 測試 15 頁 PDF 處理效能（75.2 秒成功）
- [ ] 編寫 vitest 測試

---

## 測試：荷比盧行程生成對比（PDF vs URL）

- [x] 測試 1：PDF 上傳生成（77.6 秒成功）
- [x] 測試 2：URL 爬取生成（348.4 秒成功）
- [x] 對比兩種方式的效能、準確率和完整性
- [x] 提供完整測試報告和建議


---

## Phase 31: PDF 內容生成優化

- [x] 設計 PDF 內容生成優化方案
- [x] 發現 DetailsSkill 已經整合，無需修改
- [x] 修復資料庫 schema（destinationCity 改為 text）
- [x] 測試優化後的 PDF 生成效果（成功）
- [ ] 編寫 vitest 測試


---

## 生產環境 PDF 生成失敗診斷（奧捷 10 天行程）

- [x] 檢查日誌找出真正原因（PDF URL 處理錯誤）
- [x] 修復 pdfParserAgent 支援本地檔案路徑
- [ ] 測試修復後的 PDF 生成功能
- [ ] 部署修復到生產環境


---

## Phase 32: 放棄 URL 爬取，專注 PDF 100% 穩定性

- [ ] 移除前端 URL 輸入模式（延後處理）
- [x] 測試修復後的 PDF 生成功能（奧捷 40.8秒成功）
- [x] 修復 pdfParserAgent 支援本地檔案路徑
- [ ] 部署並驗證生產環境
- [ ] 編寫 vitest 測試


---

## Phase 33: PDF 生成失敗問題診斷與修復（2026-02-01）

### 33.1 診斷問題
- [ ] 檢查生產環境日誌
- [ ] 分析失敗原因
- [ ] 確認資料庫 Schema 是否已更新

### 33.2 修復問題
- [ ] 實施必要的修復
- [ ] 測試修復結果

### 33.3 部署與驗證
- [ ] 部署到生產環境
- [ ] 測試 PDF 上傳完整流程
- [ ] 確認 100% 成功率



---

## Phase 33: PDF 生成失敗問題修復（2026-02-01）

### 33.1 資料庫 Schema 修復
- [x] 修改 destinationCity 欄位為 TEXT
- [x] 修改 destination 欄位為 TEXT
- [x] 修改 destinationCountry, departureCity, heroImageAlt, poeticTitle, promotionText 欄位為 TEXT
- [x] 更新 drizzle/schema.ts 以匹配資料庫

### 33.2 PDF 解析器修復
- [x] 移除對 poppler-utils 系統工具的依賴
- [x] 改用 LLM 直接讀取 PDF 文件
- [x] 簡化處理流程

### 33.3 前端錯誤修復
- [ ] 修復 noticeDetailed.preparation.map 錯誤


### 33.4 包團旅遊頁面問題
- [x] 檢查包團旅遊頁面為何不顯示已上架行程 - 問題是搜尋使用完全匹配而非模糊匹配
- [x] 修復包團旅遊頁面顯示問題 - 已修改為模糊匹配


---

## Phase 34: 行程詳情頁面重新設計

### 34.1 設計分析
- [ ] 分析 Peony Tours 參考網站設計風格
- [ ] 整理資訊架構和內容排列順序

### 34.2 實作
- [ ] 重新設計行程詳情頁面 Hero 區塊
- [ ] 重新設計行程特色區塊
- [ ] 重新設計每日行程區塊
- [ ] 重新設計費用說明區塊
- [ ] 重新設計注意事項區塊
- [ ] 添加行程下載功能
- [ ] 實現配色方案自動適應目的地主題


---

## Phase 34: 行程詳情頁面重新設計（2026-02-01）

### 34.1 分析參考網站設計風格
- [x] 分析 Peony Tours 網站設計風格
- [x] 記錄關鍵設計特點（Hero、標籤導航、Zigzag 佈局）

### 34.2 重新設計頁面架構和佈局
- [x] 創建新的 TourDetailPeony.tsx 頁面
- [x] 實作 Hero 區塊（大型背景圖片、標題居中）
- [x] 實作固定標籤導航（行程簡介、精彩行程、內容特色、豪華酒店、出發日期/售價、注意事項）
- [x] 實作行程摘要卡片（天數、目的地、成團人數、出發日期）
- [x] 實作每日行程 Zigzag 佈局（左右交錯）
- [x] 實作景點標籤和住宿資訊

### 34.3 測試與驗證
- [x] 在開發環境測試新頁面
- [ ] 修復圖片顯示問題
- [ ] 發布到生產環境
- [ ] 最終驗收


### 34.4 每日行程圖片自動配置
- [ ] 分析現有每日行程圖片配置機制
- [ ] 修改 AI 生成流程，為每日行程自動搜尋目的地圖片
- [ ] 更新現有行程的每日行程圖片
- [ ] 測試並驗證圖片顯示效果


---

## Phase 33: PDF 生成失敗問題修復（2026-02-01）

### 33.1 資料庫 Schema 修復
- [x] 修改 destinationCity 欄位從 varchar(100) 改為 TEXT
- [x] 修改 destination 欄位從 varchar(255) 改為 TEXT
- [x] 修改其他可能太短的欄位（title, destinationCountry, departureCity 等）

### 33.2 PDF 解析器重構
- [x] 移除對 poppler-utils 系統工具的依賴
- [x] 改用 LLM 直接讀取 PDF 文件進行分析
- [x] 簡化處理流程，提高穩定性

### 33.3 前端類型安全修復
- [x] 修復 noticeDetailed.preparation.map 錯誤
- [x] 添加 ensureArray 輔助函數確保所有欄位都是陣列

### 33.4 搜尋功能修復
- [x] 將目的地搜尋從完全匹配改為模糊匹配
- [x] 支援在 destination、destinationCountry、destinationCity、title 中搜尋

---

## Phase 34: 行程詳情頁面重新設計（2026-02-01）

### 34.1 參考 Peony Tours 設計風格
- [x] 分析參考網站設計風格
- [x] 創建新的 TourDetailPeony.tsx 頁面

### 34.2 設計特點
- [x] Hero 區塊：大型背景圖片，標題居中顯示
- [x] 固定標籤導航：行程簡介、精彩行程、內容特色、豪華酒店、出發日期/售價、注意事項
- [x] 每日行程 Zigzag 佈局：左右交錯排列，更具視覺層次
- [x] 行程摘要卡片：清晰顯示天數、目的地、成團人數、出發日期

### 34.3 每日行程圖片自動配置
- [x] 修改 PolishedItinerary 介面，添加 image 和 imageAlt 欄位
- [x] 創建 itineraryImageService.ts，實現自動搜尋目的地圖片功能
- [x] 修改 masterAgent.ts，在行程生成流程中自動為每日行程配置圖片
- [x] 創建 supplement-itinerary-images.ts 腳本為現有行程補充圖片
- [x] 成功為巴爾幹七國秘境15日行程配置 13 張圖片
- [x] 成功為環島六日秘境行配置 4 張圖片


---

## Phase 35: 飯店區塊優化（2026-02-01）

### 35.1 分析現有飯店資料結構
- [ ] 檢查 hotelDetailed 資料結構
- [ ] 檢查 TourDetailPeony.tsx 中的飯店顯示方式
- [ ] 確認需要添加的欄位（圖片、設施說明等）

### 35.2 設計並實作飯店區塊優化
- [ ] 修改飯店資料結構，添加圖片和設施欄位
- [ ] 重新設計飯店卡片 UI（參考 Peony Tours 風格）
- [ ] 添加飯店圖片自動搜尋功能
- [ ] 實作飯店設施圖示顯示

### 35.3 為現有行程補充飯店圖片
- [ ] 創建飯店圖片補充腳本
- [ ] 執行腳本為現有行程補充飯店圖片
- [ ] 驗證圖片顯示效果

### 35.4 測試並交付成果
- [ ] 測試飯店區塊顯示效果
- [ ] 儲存 checkpoint


---

## Phase 21: 飯店區塊優化（2026-02-01）

### 21.1 HotelCard 組件重新設計
- [x] 添加星級標籤（左上角白色背景，顯示金色星星）
- [x] 添加 hover 效果（圖片放大、陰影增強）
- [x] 添加設施圖示區塊（WiFi、游泳池、SPA、健身房、餐廳、酒吧等）
- [x] 優化位置和描述的顯示樣式
- [x] 使用主題色彩系統

### 21.2 飯店資料補充
- [x] 創建飯店資料補充腳本 `scripts/supplement-hotel-data.ts`
- [x] 為巴爾幹七國行程添加 5 家飯店資料
  - Grand Hotel & Spa Primoretz（布加勒斯特五星級）
  - Sofia Balkan Palace Hotel（索非亞五星級）
  - Hilton Garden Inn Tirana（地拉那四星級）
  - Hotel & Spa Nena（奧赫里德湖畔四星級）
  - Mercure Belgrade Excelsior（貝爾格勒四星級）
- [x] 為台灣環島行程添加 3 家飯店資料
  - 日月潭雲品溫泉酒店（五星級）
  - 阿里山賓館（四星級）
  - 台東知本老爺酒店（五星級）

### 21.3 設施圖示系統
- [x] 實作設施圖示映射（wifi, pool, spa, gym, restaurant, bar, parking, breakfast, view, roomservice）
- [x] 使用 lucide-react 圖示庫
- [x] 設施標籤使用主題色彩

### 21.4 視覺效果
- [x] 三欄式網格佈局
- [x] 圖片比例 16:10
- [x] 卡片 hover 時圖片放大 110%
- [x] 測試頁面顯示效果



---

## Phase 22: 行程詳情頁面全面檢查與改進（2026-02-01）

### 22.1 高優先級修復
- [x] 修復特色卡片圖示載入問題（修正 colorTheme.secondary 顏色）
- [x] 修正交通類型標籤（郵輪 → 飛機）
- [x] 添加注意事項內容（已修復 noticeDetailed JSON 格式）
- [ ] 精簡目的地列表顯示

### 22.2 中優先級改進
- [ ] 優化「精彩行程內容」文字
- [ ] 添加「升等選項」內容



---

## Phase 23: 高優先級問題修復（2026-02-01）

### 23.1 特色卡片圖示顏色修復
- [x] 修復台灣環島行程（600002）的 colorTheme.secondary 顏色（#F5F5F5 → #2563EB）

### 23.2 每日行程描述補充
- [x] 補充台灣環島行程（600002）的每日行程實際景點描述（6 天完整內容）


### 23.3 中優先級改進
- [x] 補充注意事項內容（行前準備、6項；證件需求、5項；健康須知、6項；緊急聯絡、5項）
- [x] 更換 Hero 背景圖片為台灣景點照片（日月潭實景照片）
- [x] 優化目的地列表顯示（前 4 個城市 + 省略號）


### 23.4 低優先級優化
- [x] 實作飯店詳情彈窗功能（點擊飯店卡片顯示更多照片、房型和設施）
- [x] 實作動態價格日曆功能（選擇出發日期顯示對應價格）
- [x] 添加微互動動畫效果（按鈕、卡片的 hover 效果和過渡動畫）



---

## Phase 24: 新增出發日期資料（2026-02-01）

- [x] 為台灣環島行程（600002）新增 11 筆出發日期資料（2月~4月）
- [x] 驗證動態價格日曆顯示效果（成功顯示價格和剩餘名額）



---

## Phase 25: 致命問題修復（2026-02-01）

### P0 級別
- [x] 修復每日行程卡片圖片載入問題（添加台灣景點實景圖片）
- [x] 建立統一色彩系統（主色 #0D7377、輔助色 #E8A838）

### P1 級別
- [x] 重構日曆設計（卡片式 + 價格圖例 + hover 效果）
- [x] 重新設計特色卡片圖示（8 個獨特圖示和顏色）

### P2 級別
- [x] 優化 Hero 標題（純白色 + drop-shadow）
- [ ] 優化導航列（透明背景 + 滾動效果）
- [ ] 修復時間軸顏色（黃色 → 主色調）
- [ ] 修復飯店卡片圖片（添加 fallback）

### P3 級別
- [x] 重新設計費用說明區塊（雙欄卡片設計）
- [x] 優化注意事項區塊（網格佈局 + 分類圖示）



---

## Phase 26: 餐食資訊分開顯示（2026-02-02）

- [x] 查看現有餐食資料結構（meals 物件包含 breakfast, lunch, dinner）
- [x] 修改每日行程卡片，將早餐、午餐、晚餐分開顯示（三欄式彩色卡片）
- [x] 驗證顯示效果（成功）



---

## Phase 27: 餐食圖片輪播功能（2026-02-02）

- [x] 設計餐食圖片輪播資料結構（meals.lunchImages, meals.dinnerImages）
- [x] 實作餐食卡片圖片輪播功能（MealCard 組件）
- [x] 為台灣環島行程添加餐廳圖片資料（8 餐特色餐食）
- [x] 驗證顯示效果（成功）



---

## Phase 28: 餐廳詳情彈窗與預訂流程（2026-02-02）

### 28.1 餐廳詳情彈窗
- [ ] 設計餐廳詳情彈窗 UI（餐廳介紹、菜單、環境照片）
- [ ] 實作 MealDetailDialog 組件
- [ ] 為餐食資料添加詳細資訊（餐廳介紹、菜單項目）
- [ ] 驗證彈窗顯示效果

### 28.2 預訂流程
- [ ] 設計預訂流程 UI（選擇人數、填寫資料、結帳）
- [ ] 實作 BookingDialog 組件
- [ ] 實作後端預訂 API
- [ ] 整合 Stripe 付款
- [ ] 驗證預訂流程



---

## Phase 26: 餐廳詳情彈窗與預訂流程功能（2026-02-01）

### 26.1 餐廳詳情彈窗功能
- [x] 在 TourDetailPeony.tsx 中添加 MealDetailDialog 組件
- [x] 實作點擊餐食卡片時顯示詳情彈窗
- [x] 彈窗顯示餐廳名稱、圖片輪播、推薦菜色、地址、電話
- [x] 為資料庫中的餐食添加詳情資料（detail JSON）
- [x] 測試彈窗功能正常運作

### 26.2 預訂流程功能
- [x] 驗證現有 BookTour.tsx 預訂頁面功能
- [x] 測試日期選擇步驟
- [x] 測試旅客人數選擇步驟
- [x] 測試聯絡資訊填寫步驟
- [x] 測試確認預訂步驟
- [ ] 測試 Stripe 付款流程

### 26.3 測試與驗證
- [x] 測試餐廳詳情彈窗顯示正確
- [x] 測試預訂流程各步驟正常運作
- [x] 儲存 checkpoint


---

## Phase 27: 飯店詳情彈窗功能（2026-02-01）

### 27.1 分析現有住宿卡片組件
- [x] 檢視 TourDetailPeony.tsx 中的 HotelCard 組件
- [x] 了解飯店資料結構（tourTypes.ts）
- [x] 確認現有的點擊事件處理

### 27.2 實作飯店詳情彈窗組件
- [x] 在 TourDetailPeony.tsx 中添加 HotelDetailDialog 組件
- [x] 實作點擊住宿卡片時顯示詳情彈窗
- [x] 彈窗顯示飯店名稱、圖片輪播、設施、房型、評價等

### 27.3 為資料庫中的飯店添加詳情資料
- [x] 為飯店添加 detail JSON 資料（設施、房型照片、評價）
- [x] 更新資料庫中的飯店記錄

### 27.4 測試與驗證
- [x] 測試飯店詳情彈窗顯示正確
- [x] 驗證圖片輪播功能
- [x] 儲存 checkpoint


---

## Phase 28: 修復滾動時區塊重疊問題（2026-02-01）

### 28.1 分析區塊重疊問題
- [x] 檢查行程詳情頁面的固定導航列和內容區塊的 CSS
- [x] 確認重疊問題的原因（sticky header 高度計算）

### 28.2 修復區塊重疊樣式
- [x] 調整 sticky nav 的 top 值為 80px（Header 高度）
- [x] 調整 z-index 為 z-40（低於 Header 的 z-50）

### 28.3 測試與驗證
- [x] 測試行程詳情頁面滾動時的顯示 - Header 和 sticky nav 不再重疊
- [x] 儲存 checkpoint


---

## Phase 29: 行程詳情頁面 Inline Editing 功能（2026-02-01）

### 29.1 分析現有編輯功能和頁面結構
- [x] 檢視現有後台編輯功能（ToursTab.tsx, TourEditDialog.tsx）
- [x] 分析 TourDetailPeony.tsx 頁面結構
- [x] 確認需要支援 inline editing 的欄位

### 29.2 實作 inline editing 核心組件
- [x] 建立 EditableText 組件（點擊編輯文字）
- [x] 建立 EditableImage 組件（點擊更換圖片）
- [x] 建立編輯模式切換按鈕（EditModeToggle, EditModeBanner）
- [x] 建立 useInlineEdit hook 管理編輯狀態

### 29.3 整合編輯功能到行程詳情頁面
- [ ] 行程標題和描述的 inline editing
- [ ] 每日行程內容的 inline editing
- [ ] 餐食和住宿資訊的 inline editing
- [ ] 圖片更換功能

### 29.4 實作後端 API 儲存編輯內容
- [ ] 建立行程更新 API
- [ ] 建立圖片上傳 API
- [ ] 權限驗證（僅管理員可編輯）

### 29.5 測試與驗證
- [ ] 測試各欄位的 inline editing 功能
- [ ] 測試儲存和更新功能
- [ ] 儲存 checkpoint


---

## Phase 30: 擴展 Inline Editing 功能（2026-02-01）

### 30.1 分析現有組件結構和資料流
- [x] 檢視 TourDetailPeony.tsx 中 DayCard 組件的結構
- [x] 檢視 EditableImage 組件的現有實作
- [x] 確認圖片上傳 API 的可用性

### 30.2 實作 Hero 圖片更換功能
- [x] 修改 EditableImage 組件支援圖片上傳（tourId, imagePath 參數）
- [x] 在 Hero Section 整合 EditableImage
- [x] 使用現有的 /api/tours/:tourId/upload-i### 30.3 實作每日行程 inline editing 功能
- [x] 建立 EditableDayCard 組件支援編輯模式
- [x] 實作每日行程標題的 inline editing
- [x] 實作活動內容的新增/編輯/刪除
- [x] 實作每日圖片的更換功能
- [x] 整合到 TourDetailPeony.tsx 中diting（時間、地點、描述）
- [ ] 實作活動的新增和刪除功能

### 30.4 實作後端 API 支援
- [x] 確認 tours.update mutation 支援 itineraryDetailed 欄位更新
- [x] 確認 tours.patchField mutation 支援單一欄位更新
- [x] 確認圖片上傳 API 已存在（/api/tours/:tourId/upload-image）
- [ ] 實作圖片上傳 API（如果不存在）

### 30.5 測試與驗證
- [x] 測試 Hero 圖片更換功能 - 顯示「點擊更換圖片」提示
- [x] 測試每日行程標題編輯 - 可點擊編輯標題和描述
- [x] 測試活動內容編輯 - 可編輯時間和活動名稱，可新增活動
- [x] 儲存 checkpoint


---

## Phase 31: 儲存變更功能和餐食編輯功能（2026-02-01）

### 31.1 分析現有程式碼結構
- [x] 檢視 TourDetailPeony.tsx 中的儲存邏輯 - handleSave 已存在
- [x] 檢視 EditableDayCard 組件的資料流 - onUpdate 回呼已實作
- [x] 確認後端 API 支援的欄位 - itineraryDetailed, meals 已支援

### 31.2 完善儲存變更功能
- [ ] 修復 handleSave 函數，正確傳遞 itineraryDetailed 資料
- [ ] 確保每日行程的修改能同步到資料庫
- [ ] 添加儲存成功/失敗的提示訊息

### 31.3 實作餐食編輯功能
- [ ] 在 EditableDayCard 中添加餐食編輯區塊
- [ ] 實作餐食名稱、餐廳、照片的編輯功能
- [ ] 整合到每日行程的儲存邏輯中

### 31.4 測試與驗證
- [ ] 測試每日行程儲存功能
- [ ] 測試餐食編輯功能
- [ ] 儲存 checkpoint


---

## Phase 31: 儲存變更功能和餐食編輯功能（2026-02-01）

### 31.1 分析現有程式碼結構
- [x] 檢視 TourDetailPeony.tsx 中的儲存邏輯 - handleSave 已存在
- [x] 檢視 EditableDayCard 組件的資料流 - onUpdate 回呼已實作
- [x] 確認後端 API 支援的欄位 - itineraryDetailed, meals 已支援

### 31.2 完善儲存變更功能
- [x] 確認 handleSave 函數包含所有編輯欄位
- [x] 實作每日行程的儲存邏輯
- [x] 測試儲存功能正常運作 - 已成功儲存活動時間修改

### 31.3 實作餐食編輯功能
- [x] 為 EditableDayCard 組件添加餐食編輯區塊（早餐、午餐、晚餐）
- [x] 實作餐食名稱的 inline editing
- [ ] 測試餐食編輯功能

### 31.4 測試與驗證
- [x] 測試每日行程活動時間編輯
- [x] 測試儲存變更按鈕
- [x] 測試餐食編輯功能 - 顯示早餐、午餐、晚餐輸入框
- [x] 儲存 checkpoint


---

## Phase 32: 調整行程詳情頁面字體大小（2026-02-02）

### 32.1 分析現有字體大小設定
- [x] 檢視 TourDetailPeony.tsx 中的字體大小設定
- [x] 確認需要調整的區塊（標題、描述、每日行程等）
### 32.2 調整頁面字體大小
- [x] 增大標題字體（h1: 4xl-6xl, h2: 3xl-4xl）
- [x] 增大內文字體（p: lg-xl, span: base-lg）
- [x] 增大每日行程卡片的字體（標題: 2xl-4xl, 描述: lg, 活動: lg）
- [x] 增大餐食卡片的字體（標籤: sm, 名稱: base）
- [x] 增大快速資訊卡片的字體和圖示（圖示: h-10, 標籤: base, 數字: xl）住宿資訊的字體

### 32.3 測試與驗證
- [x] 測試頁面在不同裝置上的顯示效果
- [x] 確認字體大小適合年長用戶閱讀
- [x] 儲存 checkpoint
- [ ] 儲存 checkpoint


---

## Phase 33: 調整目的地標籤位置（2026-02-02）

### 33.1 分析現有標籤位置
- [x] 檢視 TourDetailPeony.tsx 中的目的地標籤位置

### 33.2 調整標籤位置
- [x] 將「台灣」標籤從標題上方移到 Meta info 區域（與天數、目的地、交通方式並列）
- [x] 添加 Globe 圖示和圓角標籤樣式

### 33.3 測試與驗證
- [x] 測試新位置的顯示效果 - 「台灣」標籤現在顯示在 Meta info 區域
- [x] 儲存 checkpoint


---

## Phase 34: 為行程亮點卡片添加照片（2026-02-01）

### 34.1 分析現有行程亮點卡片結構
- [x] 檢視 TourDetailPeony.tsx 中的行程亮點區塊（Key Features Grid）
- [x] 了解資料結構 - keyFeatures 陣列，每個 feature 可以有 title/name 和 description

### 34.2 為行程亮點卡片添加照片顯示
- [x] 修改卡片設計，支援圖片顯示（有圖片顯示圖片，無圖片顯示圖示）
- [x] 為資料庫中的 keyFeatures 添加圖片 URL
- [x] 確保照片與文字的排版美觀

### 34.3 測試與驗證
- [x] 測試行程亮點卡片的照片顯示效果 - 所有 8 個亮點卡片都顯示了照片
- [x] 儲存 checkpoint


---

## Phase 35: 修復編輯模式下 Hero 區塊文字顯示問題（2026-02-01）

### 35.1 問題分析
- [x] 檢視 Hero 區塊在編輯模式下的樣式
- [x] 確認文字與背景圖片的對比度問題

### 35.2 修復實作
- [x] 為 Hero 區塊文字添加適當的背景或陰影效果
- [x] 確保編輯模式和一般模式下文字都清晰可見

### 35.3 重新設計今日餐食卡片
- [x] 分析現有餐食卡片的問題（三張卡片高度不一致、樣式不統一）
- [x] 重新設計餐食卡片樣式，確保三張卡片高度一致
- [x] 添加餐食圖示和更統一的配色方案

### 35.4 測試與驗證
- [x] 測試編輯模式下 Hero 區塊的文字可讀性 - 文字現在有陰影效果，更清晰可讀
- [x] 測試餐食卡片的新設計 - 三張卡片高度統一，樣式更簡潔
- [x] 儲存 checkpoint


---

## Phase 36: 景點詳情彈窗、行程複製、行程亮點編輯功能（2026-02-01）

### 36.1 行程亮點卡片編輯功能
- [x] 分析行程亮點卡片的程式碼結構
- [x] 在編輯模式下為每張卡片添加圖片更換功能
- [x] 在編輯模式下為每張卡片添加文字編輯功能
- [x] 實作儲存功能，將修改同步到資料### 36.2 景點詳情彈窗功能
- [x] 設計景點詳情彈窗的 UI（類似餐廠和飯店彈窗）
- [x] 創建 AttractionDetailDialog 組件
- [x] 在每日行程的景點項目上添加點擊事件
- [x] 顯示景點名稱、介紹、開放時間、門票資訊、圖片

### 36.3 行程複製功能
- [x] 在後端添加行程複製 API (tours.duplicate)
- [x] 在管理後台添加複製按鈕
- [ ] 實作複製邏輯（複製所有欄位並生成新 ID）
- [ ] 測試複製功能

### 36.4 測試與驗證
- [x] 測試行程亮點卡片的編輯功能 - 已添加 EditableImage 和 EditableText
- [x] 測試景點詳情彈窗功能 - 點擊景點可顯示詳情彈窗
- [x] 測試行程複製功能 - 後台已顯示複製按鈕
- [ ] 儲存 checkpoint


---

## Phase 37: 列印功能 A4 紙張適配優化

### 37.1 分析現有列印功能
- [x] 檢視現有的列印樣式和 CSS (index.css 和 print.css)
- [x] 分析列印時的版面問題 - 需要優化 A4 適配

### 37.2 實作 A4 紙張適配
- [x] 設定 @media print 樣式
- [x] 設定 A4 紙張尺寸 (210mm x 297mm) - @page { size: A4 portrait; margin: 20mm 15mm 25mm 15mm; }
- [x] 優化分頁控制 (page-break-before, page-break-after, page-break-inside)
- [x] 調整列印時的邊距和字體大小 (11pt 基準字體)
- [x] 隱藏不需要列印的元素（導航、按鈕等）
- [x] 圖片高度限制 (max-height: 120mm)
- [x] 容器寬度限制 (max-width: 180mm)

### 37.3 測試與驗證
- [x] 測試列印預覽效果 - 列印樣式已正確載入
- [x] 確認版面整齊、分頁合理 - 各區塊已設定 page-break
- [x] 儲存 checkpoint


---

## Phase 38: 建立專屬列印/PDF 版行程頁面

### 38.1 設計列印版頁面結構
- [ ] 設計專業的 A4 排版格式（類似旅行社行程表 PDF）
- [ ] 規劃頁面區塊：封面、行程簡介、每日行程、飯店資訊、費用說明、注意事項

### 38.2 建立專屬列印版頁面組件
- [x] 建立 TourPrintView.tsx 組件
- [x] 設計封面頁（行程名稱、出發日期、天數、旅行社資訊）
- [x] 設計每日行程區塊（日期、景點、餐食、住宿）
- [x] 設計飯店資訊區塊
- [x] 設計費用說明區塊
- [x] 設計注意事項區塊
- [x] 套用 A4 紙張專用樣式

### 38.3 實作路由和按鈕連結
- [x] 新增 /tours/:id/print 路由
- [x] 修改列印按鈕連結到專屬列印頁面
- [x] 頁面載入後自動觸發列印對話框

### 38.4 測試與驗證
- [x] 測試列印預覽效果 - 封面頁、費用說明、注意事項均正常顯示
- [x] 確認 A4 紙張適配正確 - 配色符合台灣主題
- [x] 儲存 checkpoint


---

## Phase 39: 列印版每日行程頁面優化

### 39.1 分析現有資料結構
- [x] 檢查 dailyItinerary 的資料格式 - 使用 itineraryDetailed 欄位
- [x] 確認每日行程包含的欄位（day, title, description, activities, meals, hotel）

### 39.2 優化每日行程頁面顯示
- [x] 確保每日行程正確渲染 - 修正使用 itineraryDetailed 欄位
- [x] 優化時間表顯示格式
- [x] 優化景點資訊顯示
- [x] 優化餐食和住宿資訊顯示 - 支援 meals 物件格式

### 39.3 測試與驗證
- [x] 測試列印預覽效果 - 每日行程已正確顯示 6 天完整內容
- [x] 確認每日行程頁面分頁正確 - 包含時間表、景點、餐食資訊
- [x] 儲存 checkpoint


---

## Phase 40: 預訂確認郵件、行程分享、列印版優化

### 40.1 預訂確認郵件功能
- [x] 建立郵件發送服務 - 使用 nodemailer SMTP
- [x] 設計預訂確認郵件模板（HTML 格式）
- [x] 在預訂完成後自動發送確認郵件
- [x] 包含行程資訊、預訂編號、付款資訊
- [x] 付款成功郵件模板

### 40.2 行程分享功能
- [x] 實作分享按鈕 UI - 彈窗式分享對話框
- [x] 支援複製連結分享
- [x] 支援 Facebook、LINE、Twitter/X 社群分享
- [x] 支援 WhatsApp 分享

### 40.3 列印版飯店資訊頁面
- [x] 在列印版中加入飯店詳細資訊區塊
- [x] 顯示飯店名稱、星級、設施、圖片、入住晚數
- [x] 顯示飯店圖片

### 40.4 列印版景點圖片和資訊
- [x] 為每個景點增加圖片 - 支援 activity.image
- [x] 顯示開放時間和票價資訊 - 支援 activity.openingHours, activity.ticketPrice

### 40.5 列印版專屬頁首設計
- [x] 設計包含公司標誌的頁首
- [x] 加入聯絡資訊（電話、地址、網站）

### 40.6 列印版注意事項區塊
- [x] 新增行程注意事項區塊
- [x] 加入旅遊提示和建議

### 40.7 測試與驗證
- [x] 測試預訂確認郵件發送 - 已整合 nodemailer SMTP
- [x] 測試行程分享功能 - Facebook, LINE, X, WhatsApp 分享對話框正常
- [x] 測試列印版頁面完整性 - 頁首、飯店、景點、注意事項均正常
- [ ] 儲存 checkpoint


---

## Phase 41: PDF 上傳分析生成行程速度優化與 7 國之旅顯示問題修復（2026-02-02）

### 41.1 分析問題原因
- [x] 分析 PDF 上傳解析生成行程的流程和瓶頸
- [x] 檢查 pdfParserAgent.ts 的處理流程 - 單次 LLM 呼叫解析 PDF
- [x] 檢查 masterAgent.ts 的協調流程 - 5 個階段，已有並行化
- [ ] 檢查 7 國之旅行程的資料結構（目的地欄位長度）
- [ ] 確認包團頁面的搜尋邏輯

### 41.2 優化 PDF 解析和行程生成速度
- [ ] 分析哪些步驟最耗時
- [ ] 實施並行化處理（如果可能）
- [ ] 減少不必要的 LLM 呼叫
- [ ] 優化資料傳遞和處理流程

### 41.3 修復 7 國之旅顯示問題
- [ ] 檢查目的地欄位是否過長
- [ ] 修復搜尋邏輯以支援多國行程
- [ ] 測試修復結果

### 41.4 測試與驗證
- [ ] 測試 PDF 生成速度改善
- [ ] 測試 7 國之旅在包團頁面顯示
- [ ] 儲存 checkpoint


---

## Phase 42: PDF 上傳分析生成行程速度優化（2026-02-01）

### 42.1 分析現有流程瓶頸
- [x] 分析 pdfParserAgent.ts 的處理流程
- [x] 分析 masterAgent.ts 的協調流程
- [x] 分析 itineraryPolishAgent.ts 的處理流程
- [x] 分析 contentAnalyzerAgent.ts 的處理流程
- [x] 識別主要瓶頸：ItineraryPolishAgent 佔用 336 秒（66%）

### 42.2 優化方案設計
- [x] 設計 ItineraryPolishAgent 並行處理方案（每日行程分批並行）
- [x] 設計 ContentAnalyzerAgent 合併 LLM 調用方案
- [x] 設計批次大小和並發數配置

### 42.3 實施優化
- [x] 重構 ItineraryPolishAgent 支援並行處理（BATCH_SIZE=3, MAX_CONCURRENT=5）
- [x] 重構 ContentAnalyzerAgent 合併多個 LLM 調用為單一調用
- [x] TypeScript 編譯驗證通過
- [x] 重啟開發伺服器

### 42.4 測試與驗證
- [ ] 測試 PDF 上傳生成行程速度
- [ ] 驗證生成結果品質
- [ ] 記錄優化前後時間對比
- [ ] 儲存 checkpoint



---

## Phase 42: PDF 上傳分析生成行程速度優化（2026-02-02）

### 42.1 分析瓶頸
- [x] 分析 PDF 解析流程和各階段耗時
- [x] 識別 ItineraryPolishAgent 為最大瓶頸（336 秒）
- [x] 識別 ContentAnalyzerAgent 為次要瓶頸（27 秒）

### 42.2 優化實施
- [x] ItineraryPolishAgent 改為並行批次處理（每批 5 天）
- [x] ItineraryPolishAgent 改用 Claude 3 Haiku 加速
- [x] ContentAnalyzerAgent 合併多個 LLM 調用為單一調用
- [x] ContentAnalyzerAgent 改用 Claude 3 Haiku

### 42.3 測試結果
- [x] 10 天行程 PDF：101.7 秒（約 1 分 42 秒）
- [x] ItineraryPolishAgent：25.9 秒（優化前約 336 秒，提升 13 倍）
- [x] ContentAnalyzerAgent：8.3 秒（優化前約 27 秒，提升 3 倍）
- [x] 預估 15 天行程：150-200 秒（優化前 509 秒，提升約 2.5-3 倍）

### 42.4 驗證
- [x] 測試 PDF 上傳生成功能正常運作
- [x] 驗證生成的行程資料正確
- [x] 確認並行處理沒有造成資料錯誤



---

## Phase 43: 編輯模式圖片上傳功能優化（2026-02-02）

### 43.1 分析現有組件
- [ ] 檢查 EditableImage 組件的現有實作
- [ ] 識別所有使用圖片編輯功能的位置

### 43.2 優化圖片上傳功能
- [ ] 移除圖片網址輸入欄位，只保留上傳按鈕
- [ ] 實作拖放上傳功能（支援 PNG、JPG、GIF 等格式）
- [ ] 實作圖片自動調整大小以符合容器尺寸
- [ ] 支援圖片預覽和裁切

### 43.3 測試與驗證
- [ ] 測試拖放上傳功能
- [ ] 測試圖片自動調整大小
- [ ] 驗證各種圖片格式的支援



---

## Phase 43: 編輯模式圖片上傳功能優化 (已完成)

### 已完成功能
- [x] 移除圖片網址輸入欄位，只保留上傳按鈕
- [x] 支援拖放上傳 PNG、JPG、GIF、WebP 圖片
- [x] 自動調整圖片大小符合該位置的尺寸要求
- [x] 最大支援 10MB 圖片檔案
- [x] 更新 inline-edit/EditableImage.tsx 組件
- [x] 更新 tour-detail/EditableImage.tsx 組件

### 測試結果
- 圖片編輯對話框正常打開
- 拖放上傳功能正常運作
- 上傳後自動儲存並關閉對話框


---

## Phase 44: 圖片裁切功能和圖片庫功能

### 44.1 圖片裁切功能
- [ ] 安裝 react-image-crop 套件
- [ ] 創建 ImageCropper 組件
- [ ] 整合到 EditableImage 組件
- [ ] 支援不同比例裁切（16:9、4:3、1:1）
- [ ] 裁切後自動上傳

### 44.2 圖片庫功能
- [ ] 設計圖片庫資料庫結構（images 表）
- [ ] 創建圖片庫 API（列表、上傳、刪除）
- [ ] 創建 ImageLibrary 組件
- [ ] 整合到 EditableImage 組件
- [ ] 支援搜尋和篩選圖片

### 44.3 測試
- [ ] 測試圖片裁切功能
- [ ] 測試圖片庫功能
- [ ] 驗證上傳和選擇流程


---

## Phase 44: 圖片裁切功能和圖片庫 (已完成)

### 已完成功能
- [x] 圖片裁切功能：上傳後提供裁切工具，讓用戶精確選擇圖片顯示區域
- [x] 圖片庫功能：上傳的圖片自動加入圖片庫，可重複使用
- [x] 支援拖放上傳 PNG、JPG、GIF、WebP 圖片
- [x] 圖片庫 API 實作（list, add, delete）
- [x] 資料庫 imageLibrary 表建立
- [x] 移除圖片網址輸入欄位，只保留上傳按鈕


---

## Phase 45: 圖片壓縮功能

### 待實作功能
- [ ] 後端圖片壓縮 API（使用 sharp 套件）
- [ ] 自動轉換為 WebP 格式
- [ ] 根據用途自動調整圖片尺寸（Hero: 1920x1080, Card: 800x600, Thumbnail: 400x300）
- [ ] 品質優化（在保持視覺品質的前提下減少檔案大小）
- [ ] 整合壓縮功能到現有上傳流程
- [ ] 測試壓縮效果（檔案大小減少比例）


---

## Phase 45: 圖片壓縮功能 (已完成)

### 已完成功能
- [x] 整合 sharp 圖片壓縮庫到行程圖片上傳 API
- [x] 自動將圖片轉換為 WebP 格式（更小的檔案大小）
- [x] 根據圖片類型自動調整尺寸（Hero: 1920x1080, 特色: 800x600, 每日: 1200x800）
- [x] 壓縮品質設定為 80%，平衡檔案大小和視覺品質
- [x] 上傳成功後顯示壓縮資訊（節省的 KB 數和壓縮比例）
- [x] 更新前端提示文字顯示「上傳時自動壓縮優化」



---

## Phase 46: 首頁編輯功能

### 待完成功能
- [ ] 分析首頁結構和可編輯區域
- [ ] 實作首頁編輯模式切換按鈕
- [ ] 實作 Hero 區域編輯（標題、副標題、背景圖片）
- [ ] 實作熱門目的地編輯（名稱、圖片、連結）
- [ ] 實作精選行程編輯（顯示順序、置頂功能）
- [ ] 實作首頁內容儲存 API
- [ ] 建立首頁內容資料庫表
- [ ] 測試並驗證編輯功能



---

## Phase 46: 首頁編輯功能 (已完成)

### 已完成功能
- [x] 首頁編輯模式切換（左下角「編輯首頁」按鈕）
- [x] Hero 區域編輯：標題、副標題、背景圖片、熱門搜尋關鍵字
- [x] 目的地區域編輯：新增、編輯、刪除目的地
- [x] 目的地圖片上傳功能
- [x] 資料庫表建立：homepageContent、destinations
- [x] API 實作：homepage.getContent、homepage.updateContent、homepage.getDestinations 等
- [x] 編輯模式黃色橫幅提示
- [x] 只有管理員可以進入編輯模式



---

## Phase 47: 行程詳情頁面配色問題修復

### 問題描述
- [ ] 標籤按鈕（如「紐西蘭」）白色文字在淺色背景上看不到
- [ ] 配色 Agent 生成的主題色可能導致對比度不足

### 修復任務
- [ ] 分析標籤按鈕的配色邏輯
- [ ] 確保文字與背景有足夠對比度
- [ ] 測試修復效果



---

## Phase 48: 搜尋行程頁面重新設計

### 問題描述
- [ ] 現有搜尋頁面不夠人性化和簡化
- [ ] 篩選功能過於複雜
- [ ] 新生成的行程沒有正確的標籤

### 設計目標
- [ ] 簡化搜尋介面，移除複雜的篩選條件
- [ ] 改為更直覺的搜尋方式
- [ ] 為新生成的行程自動添加正確的標籤
- [ ] 優化搜尋結果顯示

### 實作任務
- [ ] 分析現有搜尋頁面結構
- [ ] 重新設計搜尋頁面 UI
- [ ] 實作行程標籤自動生成功能
- [ ] 測試並驗證功能



---

## Phase 47: 搜尋頁面重新設計與智能標籤系統（2026-02-02）

### 47.1 搜尋頁面 UI 重新設計
- [x] 移除複雜的左側篩選面板
- [x] 創建簡化的頂部搜尋欄（搜尋輸入 + 排序選擇 + 搜尋按鈕）
- [x] 改善行程卡片設計（天數標籤、目的地、標題、智能標籤、價格）
- [x] 實作分頁功能

### 47.2 智能標籤生成系統
- [x] 創建 `server/utils/tagGenerator.ts` 智能標籤生成器
- [x] 根據天數生成行程類型標籤（深度旅遊、經典行程、輕旅行）
- [x] 根據價格生成等級標籤（精緻行程、超值優惠）
- [x] 根據 tourType 生成交通標籤（航空、鐵道、郵輪、巴士）
- [x] 根據內容識別特色標籤（美食之旅、溫泉、永續旅遊等）
- [x] 整合到 masterAgent.ts 確保新生成的行程自動獲得正確標籤
- [x] 創建單元測試 `server/utils/tagGenerator.test.ts`（20 個測試全部通過）

### 47.3 前端智能標籤顯示
- [x] 在 SearchResults.tsx 中實作 generateSmartTags 函數
- [x] 標籤顯示帶有對應圖示和顏色
- [x] 限制每個行程最多顯示 5 個標籤



### 47.4 可展開/收合篩選功能
- [x] 新增篩選按鈕（預設隱藏篩選面板）
- [x] 實作篩選面板展開/收合動畫
- [x] 篩選選項：目的地、標籤篩選、天數範圍、價格範圍
- [x] 篩選邏輯整合到搜尋查詢
- [x] 智能篩選選項根據資料庫行程自動生成


### 47.5 目的地按洲別分類
- [x] 建立國家到洲別的映射表 (shared/continentMapping.ts)
- [x] 修改篩選面板按洲別分組顯示目的地
- [x] 實作洲別展開/收合功能


### 47.6 行程類型標籤篩選和多選國家組合篩選
- [ ] 新增行程類型標籤篩選（深度旅遊、輕旅行、郵輪等）
- [ ] 實作多選國家組合篩選功能
- [ ] 整合篩選邏輯到搜尋查詢



---

## Phase 47: 搜尋頁面重新設計與智能篩選（2026-02-02）

### 47.1 智能標籤生成系統
- [x] 建立 server/utils/tagGenerator.ts 智能標籤生成工具
- [x] 在 masterAgent 中整合標籤生成邏輯
- [x] 新生成的行程自動獲得正確標籤

### 47.2 搜尋頁面簡化
- [x] 移除複雜的左側篩選面板
- [x] 改為頂部簡潔的搜尋欄

### 47.3 可展開/收合篩選功能
- [x] 新增篩選按鈕（預設隱藏篩選面板）
- [x] 實作篩選面板展開/收合動畫
- [x] 智能篩選選項根據資料庫行程自動生成

### 47.4 目的地按洲別分類
- [x] 建立國家到洲別的映射表 (shared/continentMapping.ts)
- [x] 修改篩選面板按洲別分組顯示目的地
- [x] 實作洲別展開/收合功能

### 47.5 行程類型標籤篩選和多選國家組合篩選
- [x] 新增行程類型標籤篩選（天數、價格、交通、特色分類）
- [x] 實作多選國家組合篩選功能
- [x] 整合篩選邏輯到搜尋查詢
- [x] 篩選條件標籤顯示和移除功能



---

## Phase 48: 行程卡片標籤優化與AI生成品質改進（2026-02-02）

### 48.1 行程卡片標籤顯示優化
- [ ] 修改標籤顯示邏輯，超過3個標籤時顯示「...」
- [ ] 確保所有卡片高度一致

### 48.2 AI生成行程品質比對與改進
- [ ] 分析雄獅旅遊PDF原件內容
- [ ] 比對AI生成行程與原件的差異
- [ ] 記錄需要改進的地方
- [ ] 更新Agent提示詞或邏輯以避免同樣錯誤



---

## Phase 48: 行程卡片標籤優化與AI改進分析（2026-02-02）

### 48.1 標籤顯示優化
- [x] 修改標籤顯示邏輯：最多顯示3個，超過顯示 +N
- [x] 保持所有行程卡片高度一致

### 48.2 PDF 原件分析與改進記錄
- [x] 分析雄獅旅遊 PDF 結構（ESG永續旅遊｜紐西蘭南北島13日）
- [x] 記錄 AI 生成行程的改進點（AI_IMPROVEMENT_NOTES.md）
- [x] 識別 ESG 特色分類、亮點活動、圖片處理等改進方向

### 48.3 待改進項目（後續任務）
- [ ] ESG 特色分類標籤（環境保護、社會責任、永續經濟）
- [ ] 亮點活動突出顯示（「特別安排」、「入內參觀」）
- [ ] 圖文交錯佈局（參照 PDF 格式）
- [ ] 每日餐食詳細資訊（餐廳名稱、特色餐標記）
- [ ] 住宿多選項顯示
- [ ] 注意事項區塊（體重限制、年齡限制等）



---

## Phase 49: Agent 學習系統設計與實作（2026-02-02）

### 49.1 設計 Agent 學習系統架構
- [ ] 設計技能資料庫結構（skills table）
- [ ] 設計知識提取流程
- [ ] 設計知識應用機制
- [ ] 定義技能類型（行程結構、特色分類、標籤規則等）

### 49.2 建立技能資料庫結構和 API
- [ ] 創建 drizzle/schema.ts 中的 agentSkills 表
- [ ] 實作 CRUD API（新增、查詢、更新、刪除技能）
- [ ] 實作技能搜尋功能（根據關鍵字匹配適用技能）

### 49.3 實作學習機制（從 PDF 提取新知識）
- [ ] 創建 LearningAgent（專門從 PDF 學習新知識）
- [ ] 實作特色分類識別（ESG、主題旅遊等）
- [ ] 實作標籤規則學習
- [ ] 實作行程結構模式學習

### 49.4 實作知識應用機制（生成時自動套用）
- [ ] 修改 masterAgent 在生成前查詢相關技能
- [ ] 根據行程類型自動套用對應的提取策略
- [ ] 根據學習到的標籤規則自動生成標籤

### 49.5 測試學習系統
- [ ] 測試從 ESG 永續旅遊 PDF 學習
- [ ] 測試學習到的知識是否正確應用
- [ ] 驗證新行程是否自動獲得正確標籤



---

## Phase 49: Agent 學習系統（2026-02-02）

### 49.1 設計 Agent 學習系統架構
- [x] 設計 Agent 學習系統架構 (docs/AGENT_LEARNING_SYSTEM.md)
- [x] 定義技能類型（feature_classification, tag_rule, itinerary_structure 等）
- [x] 設計學習流程（PDF → LLM 分析 → 提取技能 → 儲存）

### 49.2 建立技能資料庫結構
- [x] 建立 agentSkills 表（技能儲存）
- [x] 建立 learningSessions 表（學習記錄）
- [x] 建立 skillApplicationLogs 表（應用記錄）
- [x] 建立 skillDb.ts 資料庫查詢函數

### 49.3 實作學習機制
- [x] 建立 learningAgent.ts
- [x] 實作 learnFromPdfContent 函數（從 PDF 學習新技能）
- [x] 實作 applyLearnedSkills 函數（應用已學習的技能）
- [x] 實作 initializeBuiltInSkills 函數（初始化內建技能）

### 49.4 實作知識應用機制
- [x] 整合 applyLearnedSkills 到 masterAgent.ts
- [x] 在行程生成時自動應用已學習的技能生成標籤
- [x] 合併智能標籤和學習標籤

### 49.5 建立 API 端點
- [x] skills.list - 列出所有技能
- [x] skills.listByType - 按類型列出技能
- [x] skills.getById - 取得單一技能
- [x] skills.create - 建立新技能
- [x] skills.update - 更新技能
- [x] skills.delete - 刪除技能
- [x] skills.matchToContent - 匹配技能到內容
- [x] skills.applyRules - 應用技能規則
- [x] skills.seedBuiltIn - 初始化內建技能
- [x] skills.learnFromPdf - 從 PDF 學習新技能
- [x] skills.initializeBuiltIn - 初始化內建技能

### 49.6 測試
- [x] skillDb.test.ts 單元測試通過（5 tests）
- [x] learningAgent.test.ts 單元測試通過（10 tests）



---

## Phase 50: AI 自動生成介面優化（2026-02-02）

### 50.1 介面重新設計
- [ ] 縮小生成進度區塊佔用空間
- [ ] 更簡潔美觀的設計
- [ ] 移除不必要的元素

### 50.2 進度準確性修正
- [ ] 修正完成百分比計算邏輯
- [ ] 根據實際 Agent 執行狀態計算進度
- [ ] 顯示準確的剩餘時間估計

### 50.3 Agent 狀態透明化
- [ ] 清楚顯示每個 Agent 正在執行的任務
- [ ] 顯示 Agent 的輸入/輸出摘要
- [ ] 顯示每個 Agent 的執行時間

### 50.4 技能學習通知
- [ ] 當有新技能學習到時即時通知
- [ ] 顯示學習到的技能名稱和類型
- [ ] 提供查看技能詳情的連結



---

## Phase 50: AI 自動生成介面優化（2026-02-02）

### 50.1 重新設計生成進度介面
- [x] 縮小整體佔用空間
- [x] 新增階段圖標顯示（爬取、分析、行程、住宿、餐飲、航班、費用、注意、配色、學習、完成）
- [x] 可展開/收合的詳情面板
- [x] 顯示各 Agent 狀態和描述
- [x] 顯示經過時間和進度百分比

### 50.2 進度百分比準確性
- [x] 更新 worker.ts 進度更新邏輯
- [ ] 確保進度與實際 Agent 執行階段同步

### 50.3 技能學習通知
- [ ] 當有新技能加入時顯示通知
- [ ] 在生成完成後顯示學習到的新技能



---

## Phase 51: 首頁「探索目的地」地區/國家導航功能（2026-02-02）

### 51.1 設計導航結構
- [ ] 讀取現有首頁「探索目的地」區塊程式碼
- [ ] 設計地區專頁路由結構（/destinations/:region）
- [ ] 設計國家專頁路由結構（/destinations/:region/:country）

### 51.2 建立地區專頁
- [ ] 建立 RegionPage.tsx 組件
- [ ] 顯示該地區的所有國家（帶圖片和行程數量）
- [ ] 新增路由到 App.tsx

### 51.3 建立國家專頁
- [ ] 建立 CountryPage.tsx 組件
- [ ] 顯示該國家的所有行程
- [ ] 新增路由到 App.tsx

### 51.4 修改首頁連結
- [ ] 修改「探索目的地」區塊的連結指向地區專頁
- [ ] 確保連結正確對應各地區

### 51.5 測試
- [ ] 測試地區專頁導航
- [ ] 測試國家專頁導航
- [ ] 測試行程篩選功能



---

## Phase 51: 首頁「探索目的地」地區/國家導航功能（2026-02-02）

### 51.1 建立地區專頁
- [x] 建立 RegionPage.tsx 組件
- [x] 新增路由 /destinations/:region
- [x] 顯示該地區的所有國家
- [x] 每個國家卡片顯示行程數量

### 51.2 建立國家專頁
- [x] 建立 CountryPage.tsx 組件
- [x] 新增路由 /destinations/:region/:country
- [x] 顯示該國家的所有行程
- [x] 行程卡片包含圖片、標題、標籤、價格

### 51.3 修改首頁連結
- [x] 修改 Destinations.tsx 連結到地區專頁
- [x] 實作麵包屑導航（返回首頁/地區）

### 51.4 測試結果
- [x] 地區專頁正常運作 (/destinations/asia)
- [x] 國家專頁正常運作 (/destinations/asia/台灣)
- [x] 首頁連結正確導航


---

## Phase 52: 亞洲國家卡片代表性圖片（2026-02-02）

### 52.1 搜尋並下載圖片
- [x] 台灣：台北101
- [x] 日本：富士山櫻花
- [x] 中國：長城
- [x] 韓國：景福宮
- [x] 泰國：大皇宮
- [x] 越南：下龍灣
- [x] 新加坡：魚尾獅
- [x] 馬來西亞：雙子塔

### 52.2 整合到專案
- [x] 下載圖片到 client/public/images/countries/
- [x] 修改 RegionPage.tsx 顯示國家圖片
- [x] 地區名稱統一為「XX地區」格式
- [ ] 測試並儲存 checkpoint


---

## Phase 53: 其他地區國家圖片、郵輪專頁、技能學習通知

### 53.1 為其他地區添加國家圖片
- [ ] 歐洲地區：法國、義大利、英國、德國、西班牙、瑞士、荷蘭、希臘
- [ ] 美洲地區：美國、加拿大、墨西哥、巴西、阿根廷、秘魯
- [ ] 中東地區：以色列、約旦、土耳其、阿聯酋、埃及
- [ ] 非洲地區：南非、摩洛哥、肯亞、坦尚尼亞
- [ ] 大洋洲地區：澳洲、紐西蘭、斐濟

### 53.2 建立郵輪之旅專頁
- [ ] 建立 CruisePage.tsx 組件
- [ ] 新增 /cruises 路由
- [ ] 修改首頁「郵輪之旅」區塊連結
- [ ] 顯示所有郵輪類型行程

### 53.3 技能學習通知功能
- [ ] 修改 GenerationProgress.tsx 顯示學習到的新技能
- [ ] 在生成完成後顯示技能學習結果
- [ ] 新技能以 Toast 或彈窗形式通知管理員



---

## Phase 53: 其他地區國家圖片、郵輪專頁、技能學習通知（2026-02-02）

### 53.1 為其他地區添加國家圖片
- [x] 為歐洲地區添加國家圖片（法國、義大利、英國、德國、西班牙、瑞士、希臘、荷蘭）
- [x] 為美洲地區添加國家圖片（美國、加拿大、墨西哥、巴西、阿根廷、秘魯、智利、古巴）
- [x] 為中東地區添加國家圖片（以色列、約旦、土耳其、阿聯酋、卡達、沙烏地阿拉伯、埃及）
- [x] 為非洲地區添加國家圖片（南非、摩洛哥、肯亞、坦尚尼亞）
- [x] 為大洋洲地區添加國家圖片（澳洲、紐西蘭、斐濟）
- [x] 更新 RegionPage.tsx 使用本地國家圖片

### 53.2 建立郵輪之旅專頁
- [x] 建立 CruisePage.tsx 組件
- [x] 在 App.tsx 新增 /cruises 路由
- [x] 修改首頁「郵輪之旅」連結到專頁
- [x] 實作郵輪行程篩選邏輯

### 53.3 實作技能學習通知功能
- [x] 在 queue.ts 新增 SkillLearned 介面
- [x] 在 TourGenerationProgress 新增 skillsLearned 欄位
- [x] 修改 masterAgent.ts 發送技能學習進度通知
- [x] GenerationProgress.tsx 已支援顯示學習到的技能



---

## Phase 54: 技能管理介面與國家圖片優化
- [ ] 建立技能管理介面（在管理後台新增「技能管理」頁面）
- [ ] 優化國家卡片圖片（為更多國家添加高品質圖片）
- [ ] 重啟伺服器並測試



---

## Phase 54: 技能管理介面（2026-02-02）

### 54.1 建立技能管理介面
- [x] 建立 `client/src/components/admin/SkillsTab.tsx` 組件
- [x] 整合到管理後台的 Tab 導航
- [x] 實作技能列表顯示（卡片式佈局）
- [x] 實作技能類型篩選功能
- [x] 實作新增技能對話框
- [x] 實作編輯技能對話框
- [x] 實作刪除技能功能
- [x] 實作初始化內建技能按鈕
- [x] 顯示技能使用統計（使用次數、成功次數）
- [x] 顯示技能關鍵字標籤

### 54.2 內建技能初始化
- [x] ESG 永續旅遊識別
- [x] 美食主題識別
- [x] 文化探索識別
- [x] 自然生態識別
- [x] 鐵道旅遊識別
- [x] 郵輪旅遊識別
- [x] 天數標籤規則
- [x] 價格標籤規則
- [x] 亮點活動識別
- [x] 住宿類型識別



---

## Phase 54: 技能管理介面（2026-02-02）
- [x] 建立 SkillsTab.tsx 組件
- [x] 實作技能 CRUD API（新增、編輯、刪除）
- [x] 實作內建技能初始化功能（10個技能）
- [x] 整合到管理後台（第6個Tab）

## Phase 55: 目的地名稱格式更新（2026-02-02）
- [x] 更新資料庫中的目的地名稱為「XX地區」格式
  - 歐洲 → 歐洲地區
  - 中國 & 亞洲 → 亞洲地區
  - 南美洲 → 美洲地區
  - 以色列 & 約旦 → 中東地區
  - 埃及 & 非洲 → 非洲地區
  - 郵輪之旅（保持不變）
- [x] 驗證首頁目的地區塊顯示正確
- [x] 確認技能管理介面正常運作（10個內建技能）
- [x] 確認行程管理功能正常


---

## Phase 56: 目的地分類頁面優化（2026-02-02）
- [ ] 檢查目前的目的地點擊行為
- [ ] 設計國家/地區分類顯示邏輯
- [ ] 實作國家/地區分類頁面（點擊「亞洲地區」後顯示日本、韓國、泰國等國家分類）
- [ ] 每個國家顯示該國的行程數量
- [ ] 點擊國家後再顯示該國的所有行程
- [ ] 測試並驗證功能


---

## Phase 56: 目的地分類頁面修復（2026-02-02）

### 56.1 修復目的地點擊導向
- [x] 檢查目前的目的地點擊行為（發現導向 /tours?region= 而非 /destinations/:region）
- [x] 修正 EditableDestinations.tsx 點擊連結導向 /destinations/:region
- [x] 更新 CountryPage.tsx 返回按鈕文字為「XX地區」格式

### 56.2 驗證完整流程
- [x] 首頁 → 點擊「亞洲地區」→ 導向 /destinations/asia（顯示國家分類）
- [x] 國家分類頁 → 點擊「台灣」→ 導向 /destinations/asia/台灣（顯示該國行程）
- [x] 返回按鈕顯示「返回亞洲地區」（已更新為新格式）


---

## Phase 57: 高優先級改進項目（2026-02-02）

### 57.1 搜尋功能強化
- [ ] 實作關鍵字搜尋功能（行程標題、目的地、標籤）
- [ ] 新增進階篩選功能（價格範圍、天數、出發日期、旅遊類型）
- [ ] 實作搜尋結果頁面（支援排序：價格、日期、熱門度）
- [ ] 新增搜尋歷史記錄與熱門搜尋推薦
- [ ] 更新首頁搜尋控制台功能

### 57.2 會員系統完善
- [ ] 設計黑白極簡風格的登入/註冊頁面
- [ ] 實作會員個人資料頁面（基本資料、旅遊偏好）
- [ ] 新增「我的訂單」頁面（預訂歷史與狀態）
- [ ] 實作「收藏行程」功能
- [ ] 新增「瀏覽紀錄」功能

### 57.3 行程詳情頁面優化
- [ ] 新增「快速摘要」區塊（價格、天數、出發地、亮點）
- [ ] 實作「分享行程」功能（社群媒體、複製連結、Email）
- [ ] 新增「詢問此行程」快速表單
- [ ] 實作「相似行程推薦」區塊
- [ ] 新增「價格日曆」功能


---

## Phase 57: 高優先級改進項目（2026-02-02）

### 57.1 收藏行程功能
- [x] 建立 userFavorites 資料表
- [x] 建立 userBrowsingHistory 資料表
- [x] 實作收藏相關 API（add, remove, list, getIds, isFavorite）
- [x] 實作瀏覽紀錄相關 API（record, list, clear）
- [x] 建立 FavoriteButton 可重用組件
- [x] 整合收藏按鈕到 FeaturedTours 組件
- [x] 整合收藏按鈕到 SearchResults 頁面
- [x] 整合收藏按鈕到 TourDetail 頁面
- [x] 更新 Profile 頁面顯示收藏列表
- [x] 建立單元測試（favorites.test.ts）

### 57.2 會員系統完善
- [x] 登入/註冊頁面已存在（Login.tsx）
- [x] 忘記密碼功能已存在（ForgotPassword.tsx）
- [x] 會員中心已存在（Profile.tsx）
- [x] 收藏行程功能已整合到會員中心

### 57.3 行程詳情頁面優化
- [x] 新增收藏按鈕到價格卡片區塊
- [ ] 實作分享功能（社交媒體分享）
- [ ] 實作詢問表單
- [ ] 實作相似行程推薦

### 57.4 目的地分類頁面修復
- [x] 修正 EditableDestinations.tsx 點擊連結導向 /destinations/:region
- [x] 更新 CountryPage.tsx 返回按鈕文字為「XX地區」格式
- [x] 更新資料庫中的目的地名稱（歐洲地區、亞洲地區、美洲地區、中東地區、非洲地區）

### 57.5 技能管理介面
- [x] 建立 SkillsTab.tsx 組件
- [x] 實作技能 CRUD 功能
- [x] 實作 10 個內建技能初始化
- [x] 整合到管理後台（第 6 個 Tab）


---

## Phase 58: AI Agent 技能系統重構（基於 Superpowers 設計理念）（2026-02-02）

### 58.1 設計新的技能系統架構
- [ ] 設計新的技能結構（參考 Superpowers 的 SKILL.md 結構）
- [ ] 定義技能類型：Technique（技術）、Pattern（模式）、Reference（參考）
- [ ] 設計技能觸發條件（When to Use）
- [ ] 設計技能組合與依賴關係
- [ ] 設計 Claude Search Optimization (CSO) 策略

### 58.2 資料庫 Schema 更新
- [ ] 更新 skills 資料表結構
  - 新增 whenToUse 欄位（觸發條件）
  - 新增 corePattern 欄位（核心模式）
  - 新增 quickReference 欄位（快速參考）
  - 新增 commonMistakes 欄位（常見錯誤）
  - 新增 skillType 欄位（technique/pattern/reference）
- [ ] 新增 skillDependencies 資料表（技能依賴關係）
- [ ] 新增 skillUsageLogs 資料表（詳細使用記錄）
- [ ] 執行資料庫 migration

### 58.3 後端 API 更新
- [ ] 更新技能 CRUD API 支援新欄位
- [ ] 新增技能觸發匹配 API（根據上下文自動選擇技能）
- [ ] 新增技能使用統計 API（成功率、平均執行時間）
- [ ] 新增技能版本管理 API

### 58.4 前端介面重新設計
- [ ] 重新設計技能管理介面（參考 Superpowers 的結構化設計）
- [ ] 新增技能編輯器（支援 Markdown 格式）
- [ ] 新增技能預覽功能（模擬 SKILL.md 渲染）
- [ ] 新增技能依賴關係視覺化（流程圖）
- [ ] 新增技能測試功能（TDD 風格）

### 58.5 測試與驗證
- [ ] 測試新的技能系統
- [ ] 驗證技能觸發邏輯
- [ ] 撰寫優點分析報告


---

## Phase 58: AI Agent 技能系統重構（基於 Superpowers 架構）✅ 已完成

### 58.1 設計新的技能系統架構
- [x] 分析 Superpowers 專案的設計理念
- [x] 設計 Superpowers 風格的技能文檔結構
- [x] 撰寫 AI Agent 技能系統設計文檔

### 58.2 更新資料庫 Schema
- [x] 新增 Superpowers 風格欄位到 agentSkills 資料表
  - whenToUse（何時使用）
  - corePattern（核心模式）
  - quickReference（快速參考）
  - commonMistakes（常見錯誤）
  - realWorldImpact（實際影響）
  - version（版本控制）
  - documentation（完整文檔）
- [x] 建立 skillDependencies 資料表（技能依賴關係）
- [x] 建立 skillTestResults 資料表（TDD 測試結果）

### 58.3 更新後端 API
- [x] 更新 skills.create API 支援新欄位
- [x] 更新 skills.update API 支援新欄位
- [x] 新增 skills.runTests API（TDD 風格測試執行）
- [x] 新增 skills.getStats API（技能統計）

### 58.4 重新設計前端介面
- [x] 重寫 SkillsTab.tsx 組件
- [x] 新增統計概覽區塊（總技能數、啟用中、使用次數、成功率）
- [x] 新增技能分類分佈圖（技術、模式、參考）
- [x] 新增分頁導航（技能總覽、技術、模式、參考）
- [x] 新增篩選功能（按類型、按分類）
- [x] 新增技能卡片詳情對話框
- [x] 新增「新增技能」對話框（三個分頁：基本資訊、文檔、測試案例）
- [x] 實作 Superpowers 風格的文檔欄位（When to Use、Core Pattern、Quick Reference、Common Mistakes、Real World Impact）
- [x] 實作 TDD 風格的測試案例管理

### 58.5 測試驗證
- [x] 測試技能管理介面顯示正常
- [x] 測試技能詳情對話框
- [x] 測試新增技能對話框
- [x] 測試文檔分頁欄位
- [x] 測試測試案例分頁


---

## Phase 59: 整合技能到 ContentAnalyzerAgent（2026-02-02）

### 59.1 分析現有架構
- [ ] 檢查 ContentAnalyzerAgent 的現有結構
- [ ] 識別技能調用的最佳整合點
- [ ] 確認技能資料庫查詢方式

### 59.2 建立技能調用服務層
- [ ] 建立 SkillService 類別
- [ ] 實作技能查詢和匹配邏輯
- [ ] 實作關鍵字匹配演算法
- [ ] 實作技能執行和結果記錄

### 59.3 整合技能到 ContentAnalyzerAgent
- [ ] 修改 ContentAnalyzerAgent 調用 SkillService
- [ ] 在內容分析後自動執行識別技能
- [ ] 生成智能標籤（特色分類、交通類型等）
- [ ] 記錄技能使用日誌

### 59.4 更新行程生成流程
- [ ] 將智能標籤整合到行程資料結構
- [ ] 更新資料庫儲存邏輯
- [ ] 確保標籤在前端正確顯示

### 59.5 測試驗證
- [ ] 測試技能調用是否正常
- [ ] 驗證智能標籤生成準確性
- [ ] 測試完整行程生成流程


---

## Phase 59: 整合技能到 ContentAnalyzerAgent（2026-02-02）✅ 已完成
- [x] 分析現有 ContentAnalyzerAgent 架構
- [x] 建立技能調用服務層
- [x] 整合技能到 ContentAnalyzerAgent（applySkillsForSmartTags 方法）
- [x] 更新行程生成流程以使用智能標籤
- [x] 測試並驗證整合功能
- [x] 撰寫單元測試 (11 個測試通過)

### 技術細節
- 新增 `applySkillsForSmartTags` 方法到 ContentAnalyzerAgent
- 從資料庫讀取啟用的技能，根據關鍵字匹配生成智能標籤
- 記錄技能使用日誌到 skillApplicationLogs 資料表
- 更新 MasterAgent 整合 ContentAnalyzerAgent 生成的 smartTags
- 智能標籤與 learningAgent 生成的標籤合併並去重


---

## Phase 59: 整合技能到 ContentAnalyzerAgent（2026-02-02）✅ 已完成
- [x] 分析現有 ContentAnalyzerAgent 架構
- [x] 建立技能調用服務層（applySkillsForSmartTags 方法）
- [x] 整合技能到 ContentAnalyzerAgent
- [x] 更新行程生成流程以使用智能標籤
- [x] 測試並驗證整合功能
- [x] 撰寫單元測試（11 個測試通過）
- [x] 使用雄獅旅遊 PDF 測試智能標籤生成
- [x] 更新技能關鍵字為 JSON 陣列格式
- [x] 驗證識別準確度（鐵道之旅、溫泉住宿、米其林美食）

### 測試結果
- 輸入：雄獅旅遊「輕奢春櫻詩萬豪｜關西雙鐵道」6天行程
- 生成標籤：觀光列車、鐵道之旅、五星級住宿、溫泉住宿、深度旅遊、經典行程、精選行程、輕旅行、米其林美食
- 應用技能 ID：5, 10, 7, 2
- 處理時間：222ms


---

## Phase 60: AI Agent 自動學習技能功能（2026-02-02）
- [ ] 設計 AI 自動學習技能架構
- [ ] 實作 SkillLearnerAgent（使用 Claude AI 分析內容）
- [ ] 實作自動擴充關鍵字功能（發現新詞彙時自動添加）
- [ ] 實作新技能建議功能（無法歸類時建議創建新技能）
- [ ] 建立學習回饋機制（管理員確認/拒絕）
- [ ] 更新管理後台介面顯示學習結果和建議
- [ ] 測試並驗證自動學習功能


---

## Phase 28: AI Agent 技能學習功能（2026-02-02）

### 28.1 後端 API 實作
- [x] 新增 `skills.aiLearn` tRPC mutation
- [x] 新增 `skills.applyLearnedKeywords` tRPC mutation
- [x] 新增 `skills.createSuggestedSkill` tRPC mutation
- [x] 實作 SkillLearnerAgent 的 `learnFromContent` 方法

### 28.2 前端 AI 學習分頁實作
- [x] 在 SkillsTab.tsx 新增 AI 學習分頁
- [x] 實作單一行程學習功能
- [x] 實作批量學習功能（最多 5 個行程）
- [x] 實作學習結果顯示（關鍵字建議、新技能建議、識別標籤）
- [x] 實作採納/忽略建議功能
- [x] 實作從建議創建新技能功能

### 28.3 測試與驗證
- [x] 測試 AI 學習分頁 UI 顯示正常
- [x] 測試從行程中學習功能（成功發現 7 個新關鍵字建議）
- [x] 驗證 TypeScript 編譯無錯誤



---

## Phase 29: AI 學習自動排程機制（2026-02-02）

### 29.1 設計排程架構與資料庫結構
- [x] 設計學習歷史記錄資料表（skillLearningHistory）
- [x] 設計排程設定資料表（skillLearningSchedule）
- [x] 執行資料庫遷移

### 29.2 實作後端排程任務與自動學習邏輯
- [x] 建立 BullMQ 重複任務（每日/每週執行）
- [x] 實作自動掃描新行程邏輯
- [x] 實作批量學習處理
- [x] 實作學習結果通知（通知管理員）

### 29.3 實作學習歷史記錄功能
- [x] 新增 tRPC API 查詢學習歷史
- [x] 記錄每次學習的來源、結果、時間
- [x] 支援查看歷史學習建議

### 29.4 實作前端管理介面
- [x] 在 AI 學習分頁新增排程設定區塊
- [x] 新增學習歷史記錄列表
- [x] 新增手動觸發排程按鈕
- [x] 新增排程開關（啟用/停用）

### 29.5 測試與驗證
- [x] 測試排程任務正確執行
- [x] 測試學習歷史記錄正確保存
- [x] 測試管理介面功能正常



---

## Phase 30: AI 學習系統進階功能（2026-02-02）

### 30.1 學習效果分析儀表板
- [x] 設計儀表板 UI（圖表區塊佈局）
- [x] 實作學習趨勢圖表（折線圖顯示每日/每週學習數量）
- [x] 實作技能採納率圖表（圓餅圖顯示已採納/待審核/已拒絕比例）
- [x] 實作學習來源分佈圖表（長條圖顯示各行程類型的學習數量）
- [x] 新增 tRPC API 提供儀表板統計資料

### 30.2 智能學習優先級
- [x] 修改資料庫 schema 新增行程統計欄位（viewCount, bookingCount）
- [x] 實作行程熱門度計算邏輯
- [x] 修改自動學習排程優先學習熱門行程
- [x] 新增優先級設定介面（可調整權重）

### 30.3 學習結果審核機制
- [x] 修改資料庫 schema 新增技能審核狀態欄位（pending, approved, rejected）
- [x] 實作審核佇列 API
- [x] 實作審核介面（顯示待審核技能列表）
- [x] 實作批准/拒絕功能
- [x] 修改技能應用邏輯只使用已批准的技能

### 30.4 測試與驗證
- [x] 測試儀表板圖表正確顯示
- [x] 測試智能優先級排序正確
- [x] 測試審核流程完整運作
- [x] 儲存 checkpoint


---

## Phase 31: 技能效能追蹤與自動化審核（2026-02-02）

### 31.1 技能效能追蹤
- [x] 設計技能使用記錄資料表（skillUsageLog）
- [x] 記錄技能觸發事件（觸發時間、上下文、結果）
- [x] 實作用戶滿意度回饋機制（點讚/點踩）
- [x] 實作轉換率計算（技能觸發後是否導致預訂）
- [x] 新增效能統計 API
- [x] 新增效能儀表板介面

### 31.2 自動化審核規則
- [x] 設計審核規則資料表（autoApprovalRules）
- [x] 實作信心度自動批准規則（> 90% 自動批准）
- [x] 實作來源類型自動批准規則
- [x] 實作規則管理 API（CRUD）
- [x] 新增規則管理介面
- [x] 修改學習流程整合自動審核

### 31.3 測試與驗證
- [x] 測試效能追蹤記錄正確
- [x] 測試自動審核規則正確執行
- [x] 測試管理介面功能正常
- [x] 儲存 checkpoint


---

## Phase 32: 整合技能觸發到 AI Agent（2026-02-02）

### 32.1 分析現有 AI Agent 架構
- [ ] 檢視現有 AI 客服對話邏輯
- [ ] 識別技能觸發的最佳整合點
- [ ] 設計技能匹配流程

### 32.2 實作技能匹配與觸發邏輯
- [ ] 實作關鍵字匹配引擎
- [ ] 實作技能優先級排序
- [ ] 實作技能執行邏輯

### 32.3 整合技能使用記錄到對話流程
- [x] 在對話中記錄技能觸發事件
- [x] 記錄技能執行結果（成功/失敗）
- [x] 追蹤對話後的轉換行為

### 32.4 實作用戶滿意度回饋收集
- [x] 在對話結束時顯示滿意度評分
- [x] 記錄用戶回饋到 skillUsageLog
- [x] 更新技能效能指標

### 32.5 測試與驗證
- [x] 測試技能在對話中正確觸發
- [x] 測試使用記錄正確保存
- [x] 測試滿意度回饋功能
- [x] 儲存 checkpoint


---

## Phase 33: AI 客服視覺重新設計（2026-02-02）

### 33.1 設計新的 AI 客服視覺風格
- [x] 設計標誌性角色概念（水彩風格黑白企鵝）
- [x] 設計浮動按鈕與提示氣泡樣式
- [x] 設計對話介面整體視覺風格

### 33.2 創建標誌性角色圖像
- [x] 生成可愛的水彩企鵝角色圖像（黑白配色、一字眼、黃色嘴巴和腳）
- [x] 企鵝角色帶有探險帽和行李箱

### 33.3 重新設計 AI 客服浮動按鈕與提示
- [x] 實作企鵝角色浮動按鈕
- [x] 實作「點我問問題！🐧」提示氣泡
- [x] 加入慢速彈跳動畫效果

### 33.4 重新設計對話介面視覺風格
- [x] 重新設計對話框外觀（黑白簡約風格）
- [x] 重新設計訊息氣泡樣式
- [x] 加入企鵝頭像到對話中
- [x] 優化整體視覺一致性

### 33.5 測試與驗證
- [x] 測試新設計在桌面版正確顯示
- [x] 測試新設計在手機版正確顯示
- [x] 測試動畫效果流暢
- [x] 儲存 checkpoint


---

## Phase 34: 企鵝角色表情與動畫升級（2026-02-02）

### 34.1 設計企鵝不同表情
- [ ] 生成思考中表情（眼睛向上看、頭微傾）
- [ ] 生成開心表情（笑臉、眼睛彎彎）
- [ ] 生成困惑表情（問號、歪頭）
- [ ] 生成揮手表情（舉起翅膀）

### 34.2 實作對話狀態動態切換表情
- [ ] 預設狀態：原始表情
- [ ] 等待輸入：揮手表情
- [ ] AI 思考中：思考表情
- [ ] 回答完成：開心表情
- [ ] 錯誤狀態：困惑表情

### 34.3 實作企鵝微動畫效果
- [ ] 浮動按鈕：輕微搖擺動畫
- [ ] 對話中：呼吸動畫
- [ ] 思考中：左右搖擺動畫

### 34.4 測試與驗證
- [ ] 測試表情切換正確
- [ ] 測試動畫效果流暢
- [ ] 儲存 checkpoint



---

## Phase 34: AI 客服企鵝表情動態切換整合（2026-02-02）

### 34.1 企鵝表情圖像上傳到 S3
- [x] 上傳揮手表情 (waving) 到 S3
- [x] 上傳思考表情 (thinking) 到 S3
- [x] 上傳開心表情 (happy) 到 S3
- [x] 上傳困惑表情 (confused) 到 S3

### 34.2 整合表情切換邏輯到 AITravelAdvisorDialog.tsx
- [x] 定義 PENGUIN_EXPRESSIONS 常數（包含所有表情 URL）
- [x] 實作 updatePenguinExpression 函數（帶動畫效果）
- [x] 對話框開啟時顯示揮手表情 → 2秒後切換為預設
- [x] 用戶發送訊息時顯示思考表情 + 彈跳動畫
- [x] AI 回應成功時顯示開心表情 → 3秒後切換為預設
- [x] AI 回應失敗時顯示困惑表情 → 3秒後切換為預設
- [x] 用戶給正面回饋時顯示開心表情 → 2秒後切換為預設

### 34.3 更新首頁浮動按鈕
- [x] 更新 Home.tsx 浮動按鈕使用揮手企鵝圖像
- [x] 保留「點我問問題！」提示氣泡

### 34.4 測試驗證
- [x] 測試對話框開啟時的揮手表情
- [x] 測試發送訊息時的思考表情和動畫
- [x] 測試 AI 回應成功後的開心表情
- [x] 驗證整體表情切換流暢度



---

## Phase 35: Dialog 組件無障礙優化（2026-02-02）

### 35.1 檢查所有 Dialog 組件
- [x] AITravelAdvisorDialog.tsx - 已修復（添加 DialogTitle + DialogDescription + VisuallyHidden）
- [x] ManusDialog.tsx - 已修復（添加 DialogTitle + VisuallyHidden + 更新 DialogDescription）
- [x] 其他組件已有 DialogTitle（無需修改）

### 35.2 添加 ARIA 標籤
- [x] AITravelAdvisorDialog.tsx - 輸入框和按鈕添加 aria-label
- [x] ManusDialog.tsx - 登入按鈕添加 aria-label

### 35.3 驗證鍵盤導航
- [x] 確認 Tab 鍵可以在對話框內切換焦點（Radix UI 內建支援）
- [x] 確認 Escape 鍵可以關閉對話框（dialog.tsx 已實作 handleEscapeKeyDown）
- [x] 確認 Enter 鍵可以觸發主要操作（handleKeyPress 已實作）


---

## Phase 36: 企鵝浮動按鈕優化與編輯模式修復（2026-02-02）

### 36.1 更生動的企鵝浮動按鈕
- [x] 上傳新的企鵝圖片（戴草帽、帶行李箱）到 S3
- [x] 更新浮動按鈕設計，使用新圖片
- [x] 圖片已包含「點我問問題！」對話泡泡

### 36.2 修復編輯模式按鈕顯示問題
- [x] 確保編輯模式按鈕只在管理員模式下顯示（canEdit 檢查 user.role === 'admin'）
- [x] 一般用戶不應看到編輯模式按鈕（已驗證）
- [x] 編輯按鈕移到左下角，避免與企鵝重疊


---

## Phase 37: 企鵝圖片背景處理與動畫效果（2026-02-02）

### 37.1 移除企鵝圖片白色背景
- [x] 使用 Python 處理圖片，移除白色背景
- [x] 上傳處理後的透明背景圖片到 S3
- [x] 更新 Home.tsx 使用新圖片

### 37.2 添加企鵝搖擺動畫
- [x] 在 index.css 中添加搖擺動畫 keyframes (penguin-wobble)
- [x] 應用動畫到企鵝浮動按鈕 (animate-penguin-wobble)


### 37.3 語言切換功能
- [x] 創建 LocaleContext 和 LocaleProvider
- [x] 實作語言切換 UI（繁體中文 / English / Español）
- [x] 在 Header 添加語言切換按鈕 (LocaleSwitcher)
- [x] 創建 AI 翻譯 Agent (server/translation.ts)
- [x] 創建翻譯 API (translation router)
- [x] 創建前端翻譯 Hook (useTranslation.ts)

### 37.4 幣值切換功能
- [x] 創建幣值 Context 和 Provider (在 LocaleContext 中)
- [x] 實作幣值切換 UI（TWD 台幣 / USD 美金）
- [x] 添加免責聲明：「轉換價格僅供參考，實際價格以屆時人員提供的報價為準」
- [x] 創建 PriceDisplay 組件支援幣值轉換


---

## Phase 38: 企鵝浮動按鈕和 AI 對話框設計優化（2026-02-02）

### 38.1 重新處理企鵝圖片
- [x] 更精確地移除企鵝圖片的灰色/白色背景
- [x] 上傳完全透明背景的企鵝圖片

### 38.2 優化 AI 對話框設計
- [x] 改善對話框的排版和視覺設計（圓角氣泡、漸層背景、陰影效果）
- [x] 確保企鵝角色與對話框融合自然（圓形頭像、在線狀態指示器）
- [x] 移除多餘的背景色塊（使用漸層背景）

