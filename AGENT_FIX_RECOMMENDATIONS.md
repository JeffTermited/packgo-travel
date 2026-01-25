# Agent 修復建議

## 日期
2026-01-25

## 問題總結

經過測試和程式碼審查，發現以下核心問題：

### 🚨 核心問題：AI 旅遊顧問和 autoGenerate API 之間沒有連接

**現狀：**
1. ✅ `autoGenerate` API 已經存在（`server/routers.ts:558-710`）
2. ✅ `autoGenerate` API 可以解析 Lion Travel URL 並生成行程
3. ✅ `autoGenerate` API 使用 `quickExtractTourInfo` 函式
4. ❌ **AI 旅遊顧問沒有調用 `autoGenerate` API**
5. ❌ **AI 旅遊顧問的 Prompt 沒有提到 `autoGenerate` API**

**結果：**
- 當用戶在 AI 旅遊顧問中輸入 Lion Travel URL 時，AI 只會提供諮詢式的回應
- AI 不會自動調用 `autoGenerate` API 來生成行程
- 所有 Agents（WebScraperAgent、MasterAgent、ColorThemeAgent 等）都不會被調用

---

## 修復方案

### 方案 1：修改 AI 旅遊顧問的 Prompt（推薦）

**優點：**
- 簡單快速
- 不需要修改前端程式碼
- 用戶體驗流暢（直接在聊天框中完成）

**缺點：**
- AI 旅遊顧問需要有權限調用 `autoGenerate` API
- 需要處理 Admin 權限檢查

**實作步驟：**

1. **修改 AI 旅遊顧問的 Prompt**（`server/routers.ts:225-236`）

```typescript
{
  role: "system" as const,
  content: `You are a professional travel advisor for PACK&GO Travel Agency. Your role is to:
1. Help customers plan their trips and recommend destinations
2. Answer questions about travel packages, visa requirements, and travel tips
3. Provide personalized recommendations based on customer preferences
4. **When users provide a travel website URL (e.g., Lion Travel, KKday), automatically generate a tour itinerary**
5. Be friendly, professional, and helpful
6. Always respond in Traditional Chinese (繁體中文)

Important guidelines:
- Focus on travel-related topics only
- Provide specific, actionable advice
- Ask clarifying questions when needed
- Suggest PACK&GO's services when appropriate

**URL Detection and Tour Generation:**
- When a user provides a URL from travel websites (e.g., https://travel.liontravel.com/...), detect it immediately
- Inform the user that you are generating the tour itinerary
- Call the tour generation API to extract and structure the tour information
- Return the generated tour link to the user
- Supported websites: Lion Travel, KKday, Klook, and other major travel platforms`,
}
```

2. **在 AI 旅遊顧問的邏輯中加入 URL 檢測**

```typescript
// 在 server/routers.ts 的 chat procedure 中加入 URL 檢測
const urlRegex = /(https?:\/\/[^\s]+)/g;
const urls = message.match(urlRegex);

if (urls && urls.length > 0) {
  // 檢測到 URL，嘗試生成行程
  const url = urls[0];
  
  // 檢查是否為支援的旅遊網站
  const supportedDomains = ['liontravel.com', 'kkday.com', 'klook.com'];
  const isSupportedSite = supportedDomains.some(domain => url.includes(domain));
  
  if (isSupportedSite) {
    try {
      // 調用 autoGenerate API
      const result = await quickExtractTourInfo(url);
      
      // 儲存行程到資料庫
      const savedTour = await db.createTour({
        ...result,
        createdBy: ctx.user?.id || 1, // 如果沒有登入，使用預設 ID
      });
      
      // 返回生成的行程連結
      return {
        response: `太好了！我已經成功為您生成了這個行程。\n\n您可以在這裡查看詳細資訊：\n${process.env.BASE_URL}/tours/${savedTour.id}\n\n這個行程包含了完整的每日行程、飯店資訊、費用說明等。如果您有任何問題或需要調整，請隨時告訴我！`,
      };
    } catch (error) {
      console.error("[AI Chat] Tour generation error:", error);
      // 如果生成失敗，繼續正常的聊天流程
    }
  }
}
```

3. **處理 Admin 權限問題**

由於 `autoGenerate` API 需要 Admin 權限，我們有兩個選擇：

**選擇 A：移除 Admin 權限檢查**（推薦）
```typescript
// 在 server/routers.ts 的 autoGenerate procedure 中
// 移除或修改這段程式碼：
// if (ctx.user.role !== "admin") {
//   throw new TRPCError({
//     code: "FORBIDDEN",
//     message: "Only admins can auto-generate tours",
//   });
// }

// 改為：
if (!ctx.user) {
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "Please login to generate tours",
  });
}
```

**選擇 B：創建一個新的 publicAutoGenerate API**
```typescript
publicAutoGenerate: publicProcedure
  .input(z.object({ 
    url: z.string().url(),
  }))
  .mutation(async ({ ctx, input }) => {
    // 不檢查 Admin 權限
    // 使用相同的 quickExtractTourInfo 邏輯
    // ...
  })
```

---

### 方案 2：在前端加入「生成行程」按鈕

**優點：**
- 更明確的用戶操作
- 更容易控制權限
- 更容易顯示進度

**缺點：**
- 需要修改前端程式碼
- 用戶體驗較為複雜（需要兩個步驟）

**實作步驟：**

1. **在 AI 旅遊顧問的聊天框中加入「生成行程」按鈕**

```tsx
// 在 client/src/components/AIChatBox.tsx 中
{urls && urls.length > 0 && (
  <Button 
    onClick={() => handleGenerateTour(urls[0])}
    className="mt-2"
  >
    🚀 生成行程
  </Button>
)}
```

2. **實作 handleGenerateTour 函式**

```tsx
const handleGenerateTour = async (url: string) => {
  setIsGenerating(true);
  try {
    const result = await trpc.tour.autoGenerate.mutate({ url, autoSave: true });
    // 顯示成功訊息和行程連結
    toast.success(`行程生成成功！`);
    // 導航到行程詳情頁面
    navigate(`/tours/${result.savedTour.id}`);
  } catch (error) {
    toast.error('行程生成失敗，請稍後再試');
  } finally {
    setIsGenerating(false);
  }
};
```

---

### 方案 3：混合方案（最推薦）

結合方案 1 和方案 2 的優點：

1. **AI 旅遊顧問自動檢測 URL**
2. **AI 旅遊顧問詢問用戶是否要生成行程**
3. **用戶確認後，AI 旅遊顧問調用 autoGenerate API**

**實作步驟：**

1. **修改 AI 旅遊顧問的 Prompt**

```typescript
{
  role: "system" as const,
  content: `You are a professional travel advisor for PACK&GO Travel Agency. Your role is to:
1. Help customers plan their trips and recommend destinations
2. Answer questions about travel packages, visa requirements, and travel tips
3. Provide personalized recommendations based on customer preferences
4. **When users provide a travel website URL, ask if they want to generate a tour itinerary**
5. Be friendly, professional, and helpful
6. Always respond in Traditional Chinese (繁體中文)

Important guidelines:
- Focus on travel-related topics only
- Provide specific, actionable advice
- Ask clarifying questions when needed
- Suggest PACK&GO's services when appropriate

**URL Detection:**
- When a user provides a URL from travel websites (e.g., https://travel.liontravel.com/...), detect it immediately
- Ask the user: "我看到您提供了一個行程連結，是否要我為您自動生成這個行程的詳細資訊？"
- If the user confirms, proceed with tour generation
- Supported websites: Lion Travel, KKday, Klook, and other major travel platforms`,
}
```

2. **在 AI 旅遊顧問的邏輯中加入 URL 檢測和確認流程**

```typescript
// 檢測 URL
const urlRegex = /(https?:\/\/[^\s]+)/g;
const urls = message.match(urlRegex);

if (urls && urls.length > 0) {
  const url = urls[0];
  const supportedDomains = ['liontravel.com', 'kkday.com', 'klook.com'];
  const isSupportedSite = supportedDomains.some(domain => url.includes(domain));
  
  if (isSupportedSite) {
    // 檢查用戶是否確認生成行程
    const confirmKeywords = ['是', '好', '可以', '生成', '幫我', '麻煩'];
    const isConfirmed = confirmKeywords.some(keyword => message.includes(keyword));
    
    if (isConfirmed && conversationHistory.some(msg => 
      msg.role === 'assistant' && msg.content.includes('是否要我為您自動生成')
    )) {
      // 用戶已確認，生成行程
      try {
        const result = await quickExtractTourInfo(url);
        const savedTour = await db.createTour({
          ...result,
          createdBy: ctx.user?.id || 1,
        });
        
        return {
          response: `太好了！我已經成功為您生成了這個行程。\n\n您可以在這裡查看詳細資訊：\n${process.env.BASE_URL}/tours/${savedTour.id}\n\n這個行程包含了完整的每日行程、飯店資訊、費用說明等。如果您有任何問題或需要調整，請隨時告訴我！`,
        };
      } catch (error) {
        console.error("[AI Chat] Tour generation error:", error);
        return {
          response: `抱歉，行程生成過程中遇到了一些問題。請稍後再試，或者直接聯繫我們的客服團隊。`,
        };
      }
    } else {
      // 詢問用戶是否要生成行程
      return {
        response: `我看到您提供了一個 ${isSupportedSite ? '旅遊' : ''} 網站的連結。\n\n是否要我為您自動生成這個行程的詳細資訊？這樣您就可以在 PACK&GO 平台上查看完整的行程內容、每日行程、飯店資訊等。\n\n請回覆「是」或「好」來確認。`,
      };
    }
  }
}
```

---

## 實作優先級

### 🔥 高優先級（立即實作）

1. **修改 AI 旅遊顧問的 Prompt**（方案 1 的步驟 1）
   - 時間：5 分鐘
   - 影響：立即改善用戶體驗

2. **在 AI 旅遊顧問中加入 URL 檢測**（方案 3 的步驟 2）
   - 時間：30 分鐘
   - 影響：實現自動生成行程的核心功能

3. **移除或修改 Admin 權限檢查**（方案 1 的步驟 3）
   - 時間：5 分鐘
   - 影響：讓所有用戶都可以使用行程生成功能

### 📊 中優先級（本週完成）

4. **測試完整流程**
   - 使用 Lion Travel URL 測試
   - 使用 KKday URL 測試
   - 使用 Klook URL 測試

5. **優化錯誤處理**
   - 當 URL 無法解析時，提供友善的錯誤訊息
   - 當行程生成失敗時，提供重試選項

6. **加入進度顯示**
   - 顯示「正在生成行程...」的載入動畫
   - 顯示預估時間（約 30 秒）

### 🎨 低優先級（未來優化）

7. **在前端加入「生成行程」按鈕**（方案 2）
   - 提供更明確的用戶操作
   - 顯示生成進度

8. **加入行程預覽**
   - 在生成完成後，顯示行程的簡短預覽
   - 讓用戶可以快速瀏覽行程內容

9. **加入行程編輯功能**
   - 讓用戶可以在生成後立即編輯行程
   - 提供「另存新檔」功能

---

## 測試計畫

### 測試案例 1：Lion Travel URL

**輸入：**
```
https://travel.liontravel.com/detail?NormGroupID=ffaabdeb-b371-441d-9a6b-c93e65db57c4&GroupID=26EU214CI-T&TourSource=Lion&Platform=APP
```

**預期輸出：**
1. AI 旅遊顧問檢測到 URL
2. AI 旅遊顧問詢問用戶是否要生成行程
3. 用戶確認後，AI 旅遊顧問調用 autoGenerate API
4. 行程生成成功，返回行程連結
5. 用戶可以點擊連結查看行程詳情

### 測試案例 2：不支援的網站 URL

**輸入：**
```
https://www.google.com
```

**預期輸出：**
1. AI 旅遊顧問檢測到 URL
2. AI 旅遊顧問告知用戶這不是支援的旅遊網站
3. AI 旅遊顧問詢問用戶是否有其他問題

### 測試案例 3：沒有 URL 的一般問題

**輸入：**
```
我想去日本旅遊，有什麼推薦的行程嗎？
```

**預期輸出：**
1. AI 旅遊顧問提供日本旅遊的建議
2. AI 旅遊顧問推薦 PACK&GO 的日本行程
3. AI 旅遊顧問詢問用戶的偏好（天數、預算、主題等）

---

## 總結

**核心問題：** AI 旅遊顧問和 autoGenerate API 之間沒有連接

**推薦方案：** 方案 3（混合方案）

**實作時間：** 約 1-2 小時

**預期效果：**
- 用戶可以直接在 AI 旅遊顧問中輸入 Lion Travel URL
- AI 旅遊顧問會自動檢測 URL 並詢問用戶是否要生成行程
- 用戶確認後，AI 旅遊顧問會調用 autoGenerate API 生成行程
- 行程生成成功後，用戶可以點擊連結查看行程詳情

**下一步：** 立即開始實作方案 3
