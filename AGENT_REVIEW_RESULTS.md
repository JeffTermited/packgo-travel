# Agent Review 結果

## 測試日期
2026-01-25

## 測試 URL
https://travel.liontravel.com/detail?NormGroupID=ffaabdeb-b371-441d-9a6b-c93e65db57c4&GroupID=26EU214CI-T&TourSource=Lion&Platform=APP

## AI 旅遊顧問的回應

### 回應內容
```
您好！感謝您提供這個連結。

我看到您連結旅遊（Lion Travel）的一個行程概興趣，根據網址中的資訊，這似乎是一個歐洲的團體旅遊行程。

雖然我是 PACK&GO 旅遊公司的顧問，無法直接查詢或評論其他旅社的詳細行程內容，但我可以根據您感興趣的區域（歐洲）和旅遊類型，提供 PACK&GO 專業的建議和服務：

請問您對這個行程的哪一部分特別感興趣呢？

- 是旅遊地點嗎？（例如：義大利、法國、瑞士等）
- 是旅遊天數嗎？（例如：10天以上長天數行程）
- 是旅遊主題嗎？（例如：文化遺產、美食體驗、深度慢遊）

如果您告訴我您的需求和偏好，我可以為您推薦 PACK&GO 旅遊公司中，更符合您期望的歐洲精選行程，並提供更個人化的服務。

期待您的回覆！
```

### 問題分析

**❌ 主要問題：AI 旅遊顧問沒有自動生成行程**

AI 旅遊顧問的回應顯示：
1. ✅ 成功識別出這是一個 Lion Travel 的連結
2. ✅ 成功識別出這是一個歐洲的團體旅遊行程
3. ❌ **沒有自動解析連結並生成行程**
4. ❌ **沒有調用 WebScraperAgent**
5. ❌ **沒有調用 MasterAgent**
6. ❌ **沒有調用任何其他 Agent**

AI 旅遊顧問只是提供了一個「諮詢式」的回應，而不是「自動生成行程」的回應。

---

## Agent 運作狀態檢查

### 預期行為
當用戶輸入 Lion Travel URL 時，系統應該：
1. ✅ 識別出這是一個外部旅遊網站的連結
2. ✅ 自動調用 WebScraperAgent 解析連結
3. ✅ 自動調用 MasterAgent 協調其他 Agents
4. ✅ 自動生成行程並儲存到資料庫
5. ✅ 返回行程的連結給用戶

### 實際行為
當用戶輸入 Lion Travel URL 時，系統：
1. ✅ 識別出這是一個外部旅遊網站的連結
2. ✅ 識別出這是一個歐洲的團體旅遊行程
3. ❌ **沒有自動調用 WebScraperAgent**
4. ❌ **沒有自動生成行程**
5. ❌ **只是提供了一個諮詢式的回應**

---

## 根本原因分析

### 已確認的原因

1. **✅ AI 旅遊顧問的 Prompt 設計問題（已確認）**
   
   **現有 Prompt（server/routers.ts:225-236）：**
   ```typescript
   You are a professional travel advisor for PACK&GO Travel Agency. Your role is to:
   1. Help customers plan their trips and recommend destinations
   2. Answer questions about travel packages, visa requirements, and travel tips
   3. Provide personalized recommendations based on customer preferences
   4. Be friendly, professional, and helpful
   5. Always respond in Traditional Chinese (繁體中文)
   
   Important guidelines:
   - Focus on travel-related topics only
   - Provide specific, actionable advice
   - Ask clarifying questions when needed
   - Suggest PACK&GO's services when appropriate
   ```
   
   **問題分析：**
   - ✅ Prompt 被設計為「諮詢式」而非「自動生成式」
   - ✅ Prompt **沒有**明確指示「當用戶提供外部連結時，自動生成行程」
   - ✅ Prompt **沒有**提到 WebScraperAgent 或 MasterAgent
   - ✅ Prompt **沒有**提到「解析 URL」或「生成行程」
   
   **結論：**
   🚨 **這是主要問題！** AI 旅遊顧問的 Prompt 完全沒有指示它應該自動生成行程。

### 其他可能的原因

2. **缺少 URL 檢測邏輯（待確認）**
   - 系統可能沒有檢測到用戶輸入的是一個 URL
   - 系統可能沒有將 URL 自動路由到 WebScraperAgent
   - **需要檢查：** AI 旅遊顧問是否有 URL 檢測邏輯

3. **Agent 協調邏輯問題（待確認）**
   - MasterAgent 可能沒有被正確調用
   - WebScraperAgent 可能沒有被正確註冊或連接
   - **需要檢查：** MasterAgent 和 WebScraperAgent 的程式碼

4. **缺少自動化流程（待確認）**
   - 系統可能需要用戶明確說「生成行程」才會觸發 Agent
   - 系統可能需要用戶點擊某個按鈕才會觸發 Agent
   - **需要檢查：** tRPC 路由和前端邏輯

---

## 重要發現：已有 autoGenerate API

✅ **發現了行程生成 API！**

在 `server/routers.ts:558-710` 中，已經有一個 `autoGenerate` procedure：

```typescript
autoGenerate: protectedProcedure
  .input(z.object({ 
    url: z.string().url(),
    autoSave: z.boolean().default(true),
  }))
  .mutation(async ({ ctx, input }) => {
    // Check if user is admin
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can auto-generate tours",
      });
    }
    
    // 使用快速提取方式（fetch + LLM），約 30 秒
    const extractedData = await quickExtractTourInfo(input.url);
    
    // Transform and save to database
    // ...
  })
```

**問題分析：**
1. ✅ `autoGenerate` API 已經存在
2. ✅ `autoGenerate` API 使用 `quickExtractTourInfo` 函式
3. ✅ `autoGenerate` API 可以自動儲存行程
4. ❌ **AI 旅遊顧問沒有調用 `autoGenerate` API**
5. ❌ **AI 旅遊顧問的 Prompt 沒有提到 `autoGenerate` API**

**結論：**
🚨 **核心問題！** AI 旅遊顧問和 `autoGenerate` API 之間沒有連接！

---

## 下一步行動

### 1. ✅ 檢查 AI 旅遊顧問的 Prompt（已完成）
- [x] 讀取 AI 旅遊顧問的 system prompt
- [x] 檢查是否有「自動生成行程」的指示
- [x] 檢查是否有「URL 檢測」的邏輯

### 2. 檢查 WebScraperAgent 的註冊
- [ ] 讀取 WebScraperAgent 的程式碼
- [ ] 檢查 WebScraperAgent 是否被正確註冊
- [ ] 檢查 WebScraperAgent 是否可以被調用

### 3. 檢查 MasterAgent 的協調邏輯
- [ ] 讀取 MasterAgent 的程式碼
- [ ] 檢查 MasterAgent 是否會自動調用 WebScraperAgent
- [ ] 檢查 MasterAgent 的觸發條件

### 4. 檢查 tRPC 路由
- [ ] 讀取 tRPC 路由的程式碼
- [ ] 檢查是否有「生成行程」的 API
- [ ] 檢查 API 的觸發條件

### 5. 修復問題
- [ ] 修改 AI 旅遊顧問的 Prompt，加入「自動生成行程」的指示
- [ ] 修改 AI 旅遊顧問的邏輯，加入「URL 檢測」
- [ ] 確保 WebScraperAgent 被正確調用
- [ ] 確保 MasterAgent 被正確調用
- [ ] 測試修復後的流程

---

## 總結

**當前狀態：❌ 所有 Agent 都沒有被調用**

AI 旅遊顧問只是提供了一個諮詢式的回應，而不是自動生成行程。這表示：
- WebScraperAgent：❌ 未調用
- MasterAgent：❌ 未調用
- ColorThemeAgent：❌ 未調用
- ImagePromptAgent：❌ 未調用
- ImageGenerationAgent：❌ 未調用
- ItineraryParserAgent：❌ 未調用
- AttractionExtractorAgent：❌ 未調用
- HotelExtractorAgent：❌ 未調用
- MealExtractorAgent：❌ 未調用
- TransportExtractorAgent：❌ 未調用
- PriceExtractorAgent：❌ 未調用
- KeyFeaturesAgent：❌ 未調用
- TitleRewriterAgent：❌ 未調用

**需要立即修復的問題：**
1. AI 旅遊顧問的 Prompt 設計
2. URL 檢測邏輯
3. Agent 協調邏輯
4. 自動化流程
