# PACK&GO API 清單報告

**生成日期**：2026-01-29

---

## 一、API 總覽

| Router | 端點數量 | 說明 |
|--------|---------|------|
| `auth` | 10 | 認證相關（登入、註冊、密碼重設） |
| `ai` | 1 | AI 聊天助手 |
| `tours` | 15 | 行程管理（CRUD、AI 生成） |
| `bookings` | 7 | 訂單管理 |
| `departures` | 5 | 出發日期管理 |
| `inquiries` | 6 | 客戶諮詢管理 |
| `newsletter` | 1 | 電子報訂閱 |
| `admin` | 1 | 管理員統計 |
| `system` | 2 | 系統功能（通知） |
| **總計** | **48** | |

---

## 二、需要保留的 API（核心功能）

### 2.1 認證 Router (`auth`)

| 端點 | 類型 | 說明 | 狀態 |
|------|------|------|------|
| `me` | public | 獲取當前用戶 | ✅ 需要 |
| `register` | public | 註冊新用戶 | ✅ 需要 |
| `login` | public | 登入 | ✅ 需要 |
| `logout` | public | 登出 | ✅ 需要 |
| `requestPasswordReset` | public | 請求密碼重設 | ✅ 需要 |
| `resetPassword` | public | 重設密碼 | ✅ 需要 |
| `updateProfile` | protected | 更新個人資料 | ✅ 需要 |
| `uploadAvatar` | protected | 上傳頭像 | ✅ 需要 |
| `deleteAvatar` | protected | 刪除頭像 | ✅ 需要 |

### 2.2 行程 Router (`tours`)

| 端點 | 類型 | 說明 | 狀態 |
|------|------|------|------|
| `list` | public | 列出所有行程 | ✅ 需要 |
| `getById` | public | 獲取單一行程 | ✅ 需要 |
| `search` | public | 搜尋行程 | ✅ 需要 |
| `create` | protected | 創建行程 | ✅ 需要 |
| `update` | protected | 更新行程 | ✅ 需要 |
| `delete` | protected | 刪除行程 | ✅ 需要 |
| `batchDelete` | protected | 批量刪除 | ✅ 需要 |
| `toggleStatus` | protected | 切換狀態 | ✅ 需要 |
| `toggleFeatured` | admin | 切換精選 | ✅ 需要 |
| `submitAsyncGeneration` | protected | 提交 AI 生成任務 | ✅ 需要 |
| `getGenerationStatus` | protected | 獲取生成狀態 | ✅ 需要 |
| `getMyGenerationJobs` | protected | 獲取我的生成任務 | ✅ 需要 |
| `saveFromPreview` | protected | 從預覽保存 | ✅ 需要 |

### 2.3 訂單 Router (`bookings`)

| 端點 | 類型 | 說明 | 狀態 |
|------|------|------|------|
| `create` | protected | 創建訂單 | ✅ 需要 |
| `list` | protected | 列出我的訂單 | ✅ 需要 |
| `getById` | protected | 獲取訂單詳情 | ✅ 需要 |
| `createCheckoutSession` | protected | 創建 Stripe 結帳 | ✅ 需要 |
| `cancel` | protected | 取消訂單 | ✅ 需要 |
| `adminList` | protected | 管理員訂單列表 | ✅ 需要 |
| `adminUpdateStatus` | protected | 管理員更新狀態 | ✅ 需要 |

### 2.4 出發日期 Router (`departures`)

| 端點 | 類型 | 說明 | 狀態 |
|------|------|------|------|
| `list` | public | 列出所有出發日期 | ✅ 需要 |
| `listByTour` | public | 按行程列出 | ✅ 需要 |
| `getById` | public | 獲取單一出發日期 | ✅ 需要 |
| `create` | admin | 創建出發日期 | ✅ 需要 |
| `update` | admin | 更新出發日期 | ✅ 需要 |
| `delete` | admin | 刪除出發日期 | ✅ 需要 |

### 2.5 客戶諮詢 Router (`inquiries`)

| 端點 | 類型 | 說明 | 狀態 |
|------|------|------|------|
| `list` | admin | 列出所有諮詢 | ✅ 需要 |
| `getById` | protected | 獲取諮詢詳情 | ✅ 需要 |
| `create` | public | 創建諮詢 | ✅ 需要 |
| `updateStatus` | admin | 更新狀態 | ✅ 需要 |
| `update` | admin | 更新諮詢 | ✅ 需要 |
| `getMessages` | protected | 獲取訊息 | ✅ 需要 |
| `addMessage` | protected | 添加訊息 | ✅ 需要 |

### 2.6 其他 Router

| Router | 端點 | 類型 | 說明 | 狀態 |
|--------|------|------|------|------|
| `ai` | `chat` | public | AI 聊天助手 | ✅ 需要 |
| `newsletter` | `subscribe` | public | 訂閱電子報 | ✅ 需要 |
| `admin` | `getStats` | admin | 獲取統計數據 | ✅ 需要 |
| `system` | `notifyOwner` | protected | 通知擁有者 | ✅ 需要 |

---

## 三、建議移除或優化的 API

### 3.1 可能冗餘的端點

| 端點 | 說明 | 建議 |
|------|------|------|
| `tours.autoGenerate` | 同步 AI 生成（會阻塞） | ⚠️ 考慮移除，改用 `submitAsyncGeneration` |
| `tours.autoGenerateComplete` | 完整同步生成 | ⚠️ 考慮移除，改用 `submitAsyncGeneration` |

### 3.2 分析

**`autoGenerate` vs `submitAsyncGeneration`**：
- `autoGenerate`：同步執行，會阻塞請求直到完成（可能超時）
- `submitAsyncGeneration`：非同步執行，立即返回 jobId，透過 `getGenerationStatus` 查詢進度

**建議**：保留 `submitAsyncGeneration`，移除 `autoGenerate` 和 `autoGenerateComplete`，因為：
1. 非同步處理更穩定，不會超時
2. 用戶體驗更好（可以看到進度）
3. 減少程式碼複雜度

---

## 四、已刪除的測試檔案

| 檔案 | 原因 |
|------|------|
| `server/email-service-validation.test.ts` | 會實際發送郵件到真實信箱 |

---

## 五、建議的下一步

1. **移除同步 AI 生成 API**：刪除 `autoGenerate` 和 `autoGenerateComplete`
2. **清理測試檔案**：確保所有測試使用 mock 而非真實服務
3. **API 文檔**：生成 OpenAPI/Swagger 文檔供前端參考
4. **Rate Limiting**：為公開 API 添加速率限制

---

## 六、API 端點完整清單

```
auth.me                      - GET  - 獲取當前用戶
auth.register                - POST - 註冊
auth.login                   - POST - 登入
auth.logout                  - POST - 登出
auth.requestPasswordReset    - POST - 請求密碼重設
auth.resetPassword           - POST - 重設密碼
auth.updateProfile           - POST - 更新個人資料
auth.uploadAvatar            - POST - 上傳頭像
auth.deleteAvatar            - POST - 刪除頭像

ai.chat                      - POST - AI 聊天

tours.list                   - GET  - 列出行程
tours.getById                - GET  - 獲取行程
tours.search                 - GET  - 搜尋行程
tours.create                 - POST - 創建行程
tours.update                 - POST - 更新行程
tours.delete                 - POST - 刪除行程
tours.batchDelete            - POST - 批量刪除
tours.toggleStatus           - POST - 切換狀態
tours.toggleFeatured         - POST - 切換精選
tours.getMyGenerationJobs    - GET  - 獲取我的生成任務
tours.submitAsyncGeneration  - POST - 提交 AI 生成
tours.getGenerationStatus    - GET  - 獲取生成狀態
tours.autoGenerateComplete   - POST - 同步完整生成 ⚠️ 建議移除
tours.autoGenerate           - POST - 同步生成 ⚠️ 建議移除
tours.saveFromPreview        - POST - 從預覽保存

bookings.create              - POST - 創建訂單
bookings.list                - GET  - 列出訂單
bookings.getById             - GET  - 獲取訂單
bookings.createCheckoutSession - POST - 創建結帳
bookings.cancel              - POST - 取消訂單
bookings.adminList           - GET  - 管理員訂單列表
bookings.adminUpdateStatus   - POST - 管理員更新狀態

departures.list              - GET  - 列出出發日期
departures.listByTour        - GET  - 按行程列出
departures.getById           - GET  - 獲取出發日期
departures.create            - POST - 創建出發日期
departures.update            - POST - 更新出發日期
departures.delete            - POST - 刪除出發日期

inquiries.list               - GET  - 列出諮詢
inquiries.getById            - GET  - 獲取諮詢
inquiries.create             - POST - 創建諮詢
inquiries.updateStatus       - POST - 更新狀態
inquiries.update             - POST - 更新諮詢
inquiries.getMessages        - GET  - 獲取訊息
inquiries.addMessage         - POST - 添加訊息

newsletter.subscribe         - POST - 訂閱電子報

admin.getStats               - GET  - 獲取統計

system.notifyOwner           - POST - 通知擁有者
```
