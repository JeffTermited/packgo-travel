# 璽品風格行程詳情頁面實作 - 問題解答

## 問題 1：如何加入到網站自動生成一條龍到出現在行程裡面？

### 現有流程分析

**目前的 AI 自動生成流程：**
```
用戶在管理後台輸入網址
  ↓
點擊「AI 自動生成」按鈕
  ↓
webScraper.ts 抓取網頁內容（5-10 秒）
  ↓
LLM 解析並結構化資料（10-15 秒）
  ↓
儲存到資料庫（tours 表）
  ↓
返回結果給前端
  ↓
行程出現在管理後台列表（狀態：已下架）
```

### 整合璽品風格的完整流程

**新的一條龍流程：**
```
用戶在管理後台輸入網址
  ↓
點擊「AI 自動生成」按鈕
  ↓
【階段 1】抓取網頁內容（5-10 秒）
  ├─ webScraper.ts 抓取 HTML
  └─ 顯示進度：「正在抓取網頁...」
  ↓
【階段 2】LLM 解析並結構化（10-15 秒）
  ├─ 提取標題、描述、每日行程、費用等
  ├─ 自動生成行銷標題和亮點介紹
  └─ 顯示進度：「正在分析行程內容...」
  ↓
【階段 3】生成配色主題（1-2 秒）
  ├─ 根據目的地選擇配色方案
  └─ 顯示進度：「正在生成配色主題...」
  ↓
【階段 4】生成圖片 Prompt（5-10 秒）
  ├─ LLM 生成 Hero 圖片 Prompt
  ├─ LLM 生成行程亮點圖片 Prompt（可選）
  └─ 顯示進度：「正在準備圖片生成...」
  ↓
【階段 5】生成並上傳圖片（15-30 秒）
  ├─ 調用 Manus 圖片生成 API
  ├─ 下載臨時圖片
  ├─ 上傳到 S3
  └─ 顯示進度：「正在生成圖片... (1/3)」
  ↓
【階段 6】儲存到資料庫（1-2 秒）
  ├─ 儲存所有資料（包含 heroImage、colorTheme）
  └─ 顯示進度：「正在儲存...」
  ↓
【階段 7】返回結果給前端（即時）
  ├─ 顯示成功訊息
  ├─ 行程出現在管理後台列表
  └─ 狀態：已下架（可預覽）
```

### 具體實作方案

#### 方案 A：同步處理（簡單但較慢）

**優點：**
- 實作簡單
- 錯誤處理容易
- 用戶可以看到完整進度

**缺點：**
- 總時間較長（約 40-70 秒）
- 用戶需要等待

**適用場景：**
- MVP 版本
- 管理員手動生成行程

#### 方案 B：非同步處理（推薦）

**優點：**
- 用戶體驗更好
- 可以同時處理多個行程
- 不阻塞前端

**缺點：**
- 實作較複雜
- 需要任務隊列系統

**適用場景：**
- 生產環境
- 批量生成行程

**實作方式：**

```typescript
// server/routers.ts
tours: {
  autoGenerate: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input, ctx }) => {
      const { url } = input;
      
      // 1. 立即返回任務 ID
      const taskId = `task_${Date.now()}`;
      
      // 2. 非同步執行生成流程
      generateTourAsync(taskId, url, ctx.user.id).catch(err => {
        console.error(`[任務 ${taskId}] 失敗:`, err);
      });
      
      // 3. 返回任務 ID 給前端
      return { taskId, status: 'processing' };
    }),
  
  // 查詢任務狀態
  getTaskStatus: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }) => {
      // 從快取或資料庫查詢任務狀態
      const status = await getTaskStatus(input.taskId);
      return status;
    })
}

// 非同步生成函數
async function generateTourAsync(taskId: string, url: string, userId: number) {
  try {
    // 更新狀態：抓取中
    await updateTaskStatus(taskId, { stage: 'scraping', progress: 10 });
    const htmlContent = await scrapeWebPage(url);
    
    // 更新狀態：解析中
    await updateTaskStatus(taskId, { stage: 'parsing', progress: 30 });
    const tourData = await extractTourData(htmlContent, url);
    
    // 更新狀態：生成配色
    await updateTaskStatus(taskId, { stage: 'color_theme', progress: 50 });
    const colorTheme = generateColorTheme(tourData.destinationCity);
    
    // 更新狀態：生成圖片
    await updateTaskStatus(taskId, { stage: 'image_generation', progress: 60 });
    const heroPrompt = await generateOptimizedPrompt('hero', tourData);
    const heroImage = await generateAndUploadImage(heroPrompt, `tours/${taskId}/hero.jpg`);
    
    // 更新狀態：儲存中
    await updateTaskStatus(taskId, { stage: 'saving', progress: 90 });
    const [tour] = await db.insert(tours).values({
      ...tourData,
      heroImage,
      colorTheme,
      status: 'inactive'
    }).returning();
    
    // 更新狀態：完成
    await updateTaskStatus(taskId, { 
      stage: 'completed', 
      progress: 100, 
      tourId: tour.id 
    });
    
  } catch (error) {
    // 更新狀態：失敗
    await updateTaskStatus(taskId, { 
      stage: 'failed', 
      progress: 0, 
      error: error.message 
    });
  }
}
```

**前端輪詢實作：**

```typescript
// client/src/components/admin/ToursTab.tsx
const handleAutoGenerate = async () => {
  try {
    // 1. 啟動生成任務
    const { taskId } = await autoGenerateMutation.mutateAsync({ url: autoGenUrl });
    
    // 2. 開始輪詢任務狀態
    const pollInterval = setInterval(async () => {
      const status = await trpc.tours.getTaskStatus.query({ taskId });
      
      // 更新進度
      setProgress({
        stage: status.stage,
        progress: status.progress
      });
      
      // 檢查是否完成
      if (status.stage === 'completed') {
        clearInterval(pollInterval);
        toast.success('行程生成成功！');
        refetch(); // 重新載入行程列表
      } else if (status.stage === 'failed') {
        clearInterval(pollInterval);
        toast.error(`生成失敗：${status.error}`);
      }
    }, 2000); // 每 2 秒輪詢一次
    
  } catch (error) {
    toast.error('啟動生成任務失敗');
  }
};
```

### 建議實作順序

**第一步（MVP）：同步處理**
- 實作簡單，快速驗證
- 總時間約 40-70 秒
- 用戶可以看到完整進度

**第二步（優化）：非同步處理**
- 用戶體驗更好
- 支援批量生成
- 可以同時處理多個任務

---

## 問題 2：排版和 AI 生成圖片需要多久？如何縮短時間？

### 時間分析

#### 各階段耗時（同步處理）

| 階段 | 操作 | 預估時間 | 可優化空間 |
|------|------|---------|-----------|
| 1 | 抓取網頁 | 5-10 秒 | ⭐ 中 |
| 2 | LLM 解析 | 10-15 秒 | ⭐⭐ 高 |
| 3 | 生成配色 | 1-2 秒 | ❌ 低 |
| 4 | 生成 Prompt | 5-10 秒 | ⭐⭐ 高 |
| 5 | 生成圖片 | 15-30 秒 | ⭐ 中 |
| 6 | 下載圖片 | 2-5 秒 | ⭐ 中 |
| 7 | 上傳 S3 | 2-5 秒 | ⭐ 中 |
| 8 | 儲存資料庫 | 1-2 秒 | ❌ 低 |
| **總計** | - | **41-79 秒** | - |

#### MVP 版本（僅生成 Hero 圖片）

| 階段 | 操作 | 預估時間 |
|------|------|---------|
| 1-4 | 抓取 + 解析 + 配色 + Prompt | 21-37 秒 |
| 5-7 | 生成 + 下載 + 上傳 Hero 圖片 | 19-40 秒 |
| 8 | 儲存資料庫 | 1-2 秒 |
| **總計** | - | **41-79 秒** |

#### 完整版本（生成 Hero + 3 張亮點圖片）

| 階段 | 操作 | 預估時間 |
|------|------|---------|
| 1-4 | 抓取 + 解析 + 配色 + Prompt | 21-37 秒 |
| 5-7 | 生成 Hero 圖片 | 19-40 秒 |
| 5-7 | 生成亮點圖片 1 | 19-40 秒 |
| 5-7 | 生成亮點圖片 2 | 19-40 秒 |
| 5-7 | 生成亮點圖片 3 | 19-40 秒 |
| 8 | 儲存資料庫 | 1-2 秒 |
| **總計** | - | **98-199 秒（1.6-3.3 分鐘）** |

### 優化策略

#### 策略 1：並行處理圖片生成（推薦）

**原理：**
同時生成多張圖片，而不是依序生成。

**實作：**
```typescript
// 並行生成多張圖片
const [heroImage, highlight1, highlight2, highlight3] = await Promise.all([
  generateAndUploadImage(heroPrompt, `tours/${taskId}/hero.jpg`),
  generateAndUploadImage(highlight1Prompt, `tours/${taskId}/highlight-1.jpg`),
  generateAndUploadImage(highlight2Prompt, `tours/${taskId}/highlight-2.jpg`),
  generateAndUploadImage(highlight3Prompt, `tours/${taskId}/highlight-3.jpg`)
]);
```

**效果：**
- 原本：4 張圖片 × 30 秒 = 120 秒
- 優化後：4 張圖片並行 = 30 秒
- **節省時間：90 秒（75%）**

#### 策略 2：快取 LLM 結果

**原理：**
相同的輸入不重複調用 LLM。

**實作：**
```typescript
const promptCache = new Map<string, string>();

async function generateOptimizedPrompt(type: string, context: any): Promise<string> {
  const cacheKey = `${type}_${context.title}_${context.destination}`;
  
  if (promptCache.has(cacheKey)) {
    return promptCache.get(cacheKey)!;
  }
  
  const prompt = await invokeLLM({ ... });
  promptCache.set(cacheKey, prompt);
  return prompt;
}
```

**效果：**
- 相同行程重複生成時，節省 5-10 秒

#### 策略 3：預先生成 Prompt（批次處理）

**原理：**
一次 LLM 調用生成所有圖片的 Prompt。

**實作：**
```typescript
const systemPrompt = `你是專業的旅遊攝影指導專家。請為以下行程生成 4 個圖片 Prompt：
1. Hero 主視覺圖片
2. 行程亮點圖片 1
3. 行程亮點圖片 2
4. 行程亮點圖片 3

請以 JSON 格式輸出。`;

const response = await invokeLLM({
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: `行程資訊：${JSON.stringify(tourData)}` }
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "image_prompts",
      schema: {
        type: "object",
        properties: {
          hero: { type: "string" },
          highlight1: { type: "string" },
          highlight2: { type: "string" },
          highlight3: { type: "string" }
        }
      }
    }
  }
});

const prompts = JSON.parse(response.choices[0].message.content);
```

**效果：**
- 原本：4 次 LLM 調用 × 10 秒 = 40 秒
- 優化後：1 次 LLM 調用 = 10 秒
- **節省時間：30 秒（75%）**

#### 策略 4：圖片壓縮與優化

**原理：**
壓縮圖片大小，減少上傳時間。

**實作：**
```typescript
import sharp from 'sharp';

async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize(1920, 1080, { fit: 'cover' }) // 限制最大尺寸
    .jpeg({ quality: 85 }) // 壓縮品質
    .toBuffer();
}
```

**效果：**
- 減少上傳時間 30-50%
- 節省 S3 儲存空間

#### 策略 5：非同步處理（最佳化）

**原理：**
立即返回結果，背景生成圖片。

**流程：**
```
用戶點擊生成
  ↓
立即儲存基本資料（無圖片）
  ↓
返回結果給前端（5-10 秒）
  ↓
背景生成圖片（30-60 秒）
  ↓
自動更新資料庫
```

**效果：**
- 用戶感知時間：5-10 秒
- 實際總時間：35-70 秒
- **用戶體驗提升 80%**

### 綜合優化方案

#### 方案 A：MVP 快速版本

**優化措施：**
- ✅ 僅生成 Hero 圖片
- ✅ 批次生成 Prompt
- ✅ 圖片壓縮

**預估時間：**
- 原本：41-79 秒
- 優化後：25-40 秒
- **節省：16-39 秒（39-49%）**

#### 方案 B：完整版本 + 並行處理

**優化措施：**
- ✅ 並行生成 4 張圖片
- ✅ 批次生成 Prompt
- ✅ 圖片壓縮

**預估時間：**
- 原本：98-199 秒
- 優化後：40-70 秒
- **節省：58-129 秒（59-65%）**

#### 方案 C：非同步處理（推薦）

**優化措施：**
- ✅ 立即返回基本資料
- ✅ 背景生成圖片
- ✅ 並行處理
- ✅ 批次生成 Prompt

**預估時間：**
- 用戶感知時間：5-10 秒
- 背景處理時間：40-70 秒
- **用戶體驗提升 80-90%**

---

## 問題 3：確保系統架構沒有問題，不會導致同時運行導致 crash

### 潛在風險分析

#### 風險 1：並發請求過多

**場景：**
- 多個管理員同時生成行程
- 單一管理員快速點擊多次

**問題：**
- API 限制（Manus 圖片生成 API 可能有速率限制）
- 記憶體不足（同時處理多個大型圖片）
- 資料庫連接池耗盡

#### 風險 2：長時間運行的請求

**場景：**
- 圖片生成時間過長（15-30 秒）
- LLM 調用時間過長（10-15 秒）

**問題：**
- HTTP 請求超時（預設 30 秒）
- 前端連接中斷
- 資源無法釋放

#### 風險 3：錯誤處理不當

**場景：**
- 圖片生成失敗
- S3 上傳失敗
- LLM 調用失敗

**問題：**
- 資料不一致（部分資料已儲存）
- 資源洩漏（臨時檔案未清理）
- 用戶看到錯誤但不知道原因

### 解決方案

#### 解決方案 1：任務隊列系統

**實作：**
```typescript
// server/taskQueue.ts
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
});

// 建立任務隊列
export const tourGenerationQueue = new Queue('tour-generation', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3, // 失敗後重試 3 次
    backoff: {
      type: 'exponential',
      delay: 2000 // 指數退避
    },
    removeOnComplete: 100, // 保留最近 100 個完成的任務
    removeOnFail: 500 // 保留最近 500 個失敗的任務
  }
});

// 建立 Worker 處理任務
export const tourGenerationWorker = new Worker(
  'tour-generation',
  async (job) => {
    const { url, userId } = job.data;
    
    try {
      // 更新進度：0%
      await job.updateProgress(0);
      
      // 抓取網頁
      const htmlContent = await scrapeWebPage(url);
      await job.updateProgress(20);
      
      // LLM 解析
      const tourData = await extractTourData(htmlContent, url);
      await job.updateProgress(40);
      
      // 生成配色
      const colorTheme = generateColorTheme(tourData.destinationCity);
      await job.updateProgress(50);
      
      // 生成圖片
      const prompts = await generateAllPrompts(tourData);
      await job.updateProgress(60);
      
      const images = await Promise.all([
        generateAndUploadImage(prompts.hero, `tours/${job.id}/hero.jpg`),
        generateAndUploadImage(prompts.highlight1, `tours/${job.id}/h1.jpg`),
        generateAndUploadImage(prompts.highlight2, `tours/${job.id}/h2.jpg`),
        generateAndUploadImage(prompts.highlight3, `tours/${job.id}/h3.jpg`)
      ]);
      await job.updateProgress(90);
      
      // 儲存到資料庫
      const [tour] = await db.insert(tours).values({
        ...tourData,
        heroImage: images[0],
        colorTheme,
        status: 'inactive'
      }).returning();
      await job.updateProgress(100);
      
      return { tourId: tour.id };
      
    } catch (error) {
      console.error(`[任務 ${job.id}] 失敗:`, error);
      throw error; // 讓 BullMQ 處理重試
    }
  },
  {
    connection: redis,
    concurrency: 3 // 最多同時處理 3 個任務
  }
);
```

**優點：**
- ✅ 自動限制並發數量
- ✅ 失敗自動重試
- ✅ 任務持久化（Redis）
- ✅ 進度追蹤
- ✅ 錯誤處理完善

#### 解決方案 2：速率限制（Rate Limiting）

**實作：**
```typescript
// server/_core/rateLimiter.ts
import { RateLimiterMemory } from 'rate-limiter-flexible';

// 限制每個用戶每分鐘最多生成 3 個行程
const rateLimiter = new RateLimiterMemory({
  points: 3, // 3 個請求
  duration: 60 // 每 60 秒
});

// 在 tRPC mutation 中使用
tours: {
  autoGenerate: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input, ctx }) => {
      // 檢查速率限制
      try {
        await rateLimiter.consume(ctx.user.id.toString());
      } catch (error) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: '請求過於頻繁，請稍後再試'
        });
      }
      
      // 繼續處理...
    })
}
```

**優點：**
- ✅ 防止濫用
- ✅ 保護 API 限制
- ✅ 提升系統穩定性

#### 解決方案 3：超時處理

**實作：**
```typescript
// server/imageHelper.ts
async function generateAndUploadImage(
  prompt: string,
  fileKey: string,
  timeout: number = 60000 // 60 秒超時
): Promise<string> {
  return await Promise.race([
    // 實際操作
    (async () => {
      const { url: tempImageUrl } = await generateImage({ prompt });
      const response = await fetch(tempImageUrl);
      const imageBuffer = Buffer.from(await response.arrayBuffer());
      const { url: s3Url } = await storagePut(fileKey, imageBuffer, 'image/jpeg');
      return s3Url;
    })(),
    
    // 超時處理
    new Promise<string>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`圖片生成超時（${timeout}ms）`));
      }, timeout);
    })
  ]);
}
```

**優點：**
- ✅ 防止請求卡住
- ✅ 及時釋放資源
- ✅ 提供明確的錯誤訊息

#### 解決方案 4：資源清理

**實作：**
```typescript
// server/imageHelper.ts
async function generateAndUploadImage(
  prompt: string,
  fileKey: string
): Promise<string> {
  let tempImageUrl: string | null = null;
  
  try {
    // 生成圖片
    const result = await generateImage({ prompt });
    tempImageUrl = result.url;
    
    // 下載圖片
    const response = await fetch(tempImageUrl);
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    
    // 上傳到 S3
    const { url: s3Url } = await storagePut(fileKey, imageBuffer, 'image/jpeg');
    
    return s3Url;
    
  } catch (error) {
    console.error('[圖片生成失敗]', error);
    throw error;
    
  } finally {
    // 清理臨時資源（如果需要）
    if (tempImageUrl) {
      // 可以在這裡清理臨時檔案
    }
  }
}
```

**優點：**
- ✅ 防止資源洩漏
- ✅ 確保清理邏輯執行

#### 解決方案 5：健康檢查與監控

**實作：**
```typescript
// server/_core/health.ts
export async function checkSystemHealth() {
  const health = {
    database: false,
    redis: false,
    s3: false,
    imageGeneration: false
  };
  
  try {
    // 檢查資料庫
    await db.execute(sql`SELECT 1`);
    health.database = true;
  } catch (error) {
    console.error('[健康檢查] 資料庫連接失敗', error);
  }
  
  try {
    // 檢查 Redis
    await redis.ping();
    health.redis = true;
  } catch (error) {
    console.error('[健康檢查] Redis 連接失敗', error);
  }
  
  // ... 其他檢查
  
  return health;
}

// 定期執行健康檢查
setInterval(async () => {
  const health = await checkSystemHealth();
  if (!health.database || !health.redis) {
    console.error('[系統警告] 部分服務不可用', health);
    // 可以發送通知給管理員
  }
}, 60000); // 每分鐘檢查一次
```

**優點：**
- ✅ 及早發現問題
- ✅ 主動監控系統狀態

### 綜合架構建議

#### 推薦架構：任務隊列 + 速率限制

```
前端
  ↓
tRPC API（速率限制）
  ↓
任務隊列（BullMQ）
  ↓
Worker（並發限制：3）
  ├─ 抓取網頁
  ├─ LLM 解析
  ├─ 生成圖片（並行）
  └─ 儲存資料庫
  ↓
完成（通知前端）
```

**優點：**
- ✅ 系統穩定性高
- ✅ 可擴展性強
- ✅ 錯誤處理完善
- ✅ 用戶體驗好

---

## 問題 4：圖片要怎麼確保是符合題材？

### 問題分析

**挑戰：**
1. AI 生成的圖片可能與行程內容不符
2. 圖片風格可能不一致
3. 圖片品質可能不穩定

### 解決方案

#### 策略 1：精確的 Prompt 工程

**實作：**
```typescript
async function generateOptimizedPrompt(
  imageType: 'hero' | 'highlight',
  context: {
    title: string;
    description: string;
    destination: string;
    country: string;
    category: string; // 新增：行程類別
    season?: string; // 新增：季節
    activities?: string[]; // 新增：活動
  }
): Promise<string> {
  const systemPrompt = `你是一位專業的旅遊攝影指導專家。請根據行程資訊生成高品質的圖片 Prompt（英文）。

**重要規則：**
1. 必須包含具體的地點名稱（城市、地標、景點）
2. 必須包含行程類別相關的視覺元素
3. 必須包含季節特徵（如果提供）
4. 必須包含活動相關的場景（如果提供）
5. 必須使用專業攝影術語
6. 必須包含品質關鍵字（8K, professional, high quality）

**Prompt 結構：**
[主題] + [具體地點] + [季節/時間] + [視覺元素] + [光線] + [攝影風格] + [品質關鍵字]

**範例：**
- 日本北海道溫泉行程 → "A serene outdoor onsen in Niseko, Hokkaido during winter, snow-covered Mount Yotei in background, steaming hot spring water, golden hour lighting, professional travel photography, 8K resolution"
- 歐洲古堡之旅 → "Medieval castle in Loire Valley, France during autumn, golden foliage, dramatic sunset lighting, wide-angle architectural photography, cinematic composition, 8K ultra HD"

請直接輸出 Prompt，不需要額外說明。`;

  const userPrompt = `請為以下行程生成圖片 Prompt：

**圖片類型：**${imageType === 'hero' ? 'Hero 主視覺圖片（全屏背景大圖）' : '行程亮點圖片'}

**行程資訊：**
- 標題：${context.title}
- 描述：${context.description}
- 目的地：${context.destination}, ${context.country}
- 類別：${context.category}
${context.season ? `- 季節：${context.season}` : ''}
${context.activities ? `- 活動：${context.activities.join(', ')}` : ''}

**要求：**
- Prompt 長度：50-150 個英文單詞
- 必須包含具體地點名稱
- 必須反映行程類別特色
- 必須包含專業攝影術語
- 必須包含品質關鍵字`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });

  return response.choices[0].message.content.trim();
}
```

**效果：**
- ✅ 圖片與行程內容高度相關
- ✅ 包含具體地點資訊
- ✅ 反映行程類別特色

#### 策略 2：Prompt 驗證與品質控制

**實作：**
```typescript
function validatePrompt(prompt: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // 檢查長度
  const wordCount = prompt.split(' ').length;
  if (wordCount < 30) {
    issues.push('Prompt 太短（少於 30 個單詞）');
  }
  if (wordCount > 200) {
    issues.push('Prompt 太長（超過 200 個單詞）');
  }
  
  // 檢查品質關鍵字
  const qualityKeywords = ['8K', '4K', 'professional', 'high quality', 'ultra HD', 'cinematic'];
  const hasQualityKeyword = qualityKeywords.some(keyword => 
    prompt.toLowerCase().includes(keyword.toLowerCase())
  );
  if (!hasQualityKeyword) {
    issues.push('缺少品質關鍵字（8K, professional 等）');
  }
  
  // 檢查光線描述
  const lightingKeywords = ['golden hour', 'natural light', 'dramatic lighting', 'soft light', 'blue hour'];
  const hasLighting = lightingKeywords.some(keyword => 
    prompt.toLowerCase().includes(keyword.toLowerCase())
  );
  if (!hasLighting) {
    issues.push('缺少光線描述');
  }
  
  // 檢查攝影術語
  const photographyKeywords = ['wide-angle', 'telephoto', 'shallow depth', 'panoramic', 'aerial'];
  const hasPhotography = photographyKeywords.some(keyword => 
    prompt.toLowerCase().includes(keyword.toLowerCase())
  );
  if (!hasPhotography) {
    issues.push('缺少攝影術語');
  }
  
  // 檢查負面詞彙
  const negativeKeywords = ['no', 'not', 'without', 'avoid', 'exclude'];
  const hasNegative = negativeKeywords.some(keyword => 
    prompt.toLowerCase().includes(keyword)
  );
  if (hasNegative) {
    issues.push('包含負面詞彙（應避免使用 no, not 等）');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

// 使用驗證
async function generateOptimizedPromptWithValidation(
  imageType: string,
  context: any,
  maxRetries: number = 3
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const prompt = await generateOptimizedPrompt(imageType, context);
    const validation = validatePrompt(prompt);
    
    if (validation.valid) {
      return prompt;
    }
    
    console.warn(`[Prompt 驗證失敗] 第 ${i + 1} 次嘗試`, validation.issues);
  }
  
  throw new Error('無法生成有效的 Prompt');
}
```

**效果：**
- ✅ 確保 Prompt 品質
- ✅ 自動重試直到符合標準

#### 策略 3：圖片預覽與人工審核

**實作：**
```typescript
// 在儲存到資料庫前，先標記為「待審核」
const [tour] = await db.insert(tours).values({
  ...tourData,
  heroImage,
  colorTheme,
  status: 'pending_review', // 待審核
  autoGenerated: true
}).returning();

// 管理員可以在後台查看並審核
// 如果圖片不符合，可以重新生成或手動上傳
```

**前端實作：**
```typescript
// client/src/components/admin/TourReviewDialog.tsx
function TourReviewDialog({ tour }) {
  const regenerateImageMutation = trpc.tours.regenerateImage.useMutation();
  
  const handleRegenerate = async (imageType: 'hero' | 'highlight') => {
    await regenerateImageMutation.mutateAsync({
      tourId: tour.id,
      imageType
    });
  };
  
  return (
    <Dialog>
      <DialogContent>
        <h2>審核行程：{tour.title}</h2>
        
        {/* Hero 圖片預覽 */}
        <div>
          <h3>Hero 圖片</h3>
          <img src={tour.heroImage} alt="Hero" />
          <Button onClick={() => handleRegenerate('hero')}>
            重新生成
          </Button>
        </div>
        
        {/* 批准或拒絕 */}
        <div>
          <Button onClick={() => approveTour(tour.id)}>
            批准上架
          </Button>
          <Button variant="destructive" onClick={() => rejectTour(tour.id)}>
            拒絕
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**效果：**
- ✅ 管理員可以預覽圖片
- ✅ 不符合的圖片可以重新生成
- ✅ 確保最終上架的行程品質

#### 策略 4：A/B 測試與多變體生成

**實作：**
```typescript
// 生成多個變體，讓管理員選擇
async function generateMultipleImageVariants(
  prompt: string,
  fileKeyPrefix: string,
  count: number = 3
): Promise<string[]> {
  const variants = await Promise.all(
    Array.from({ length: count }, (_, i) => 
      generateAndUploadImage(prompt, `${fileKeyPrefix}-variant-${i + 1}.jpg`)
    )
  );
  
  return variants;
}

// 在 autoGenerate mutation 中使用
const heroImageVariants = await generateMultipleImageVariants(
  heroPrompt,
  `tours/${taskId}/hero`,
  3 // 生成 3 個變體
);

// 儲存所有變體
await db.insert(tours).values({
  ...tourData,
  heroImage: heroImageVariants[0], // 預設使用第一個
  heroImageVariants: JSON.stringify(heroImageVariants), // 儲存所有變體
  status: 'pending_review'
});
```

**前端實作：**
```typescript
// 管理員可以選擇最佳變體
function ImageVariantSelector({ variants, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {variants.map((variant, index) => (
        <div key={index} className="cursor-pointer" onClick={() => onSelect(variant)}>
          <img src={variant} alt={`變體 ${index + 1}`} />
          <Button>選擇此圖片</Button>
        </div>
      ))}
    </div>
  );
}
```

**效果：**
- ✅ 提供多個選擇
- ✅ 提高圖片符合度
- ✅ 管理員有更多控制權

### 綜合建議

**推薦方案：精確 Prompt + 驗證 + 人工審核**

1. **自動生成階段：**
   - 使用精確的 Prompt 工程
   - 自動驗證 Prompt 品質
   - 生成高品質圖片

2. **審核階段：**
   - 管理員預覽圖片
   - 不符合的圖片可以重新生成
   - 批准後才上架

3. **持續優化：**
   - 收集管理員反饋
   - 優化 Prompt 模板
   - 提升自動生成品質

---

## 問題 5：修改部分也應該是整體詳細介面去做更改

### 需求分析

**目前的編輯介面：**
- 簡單的表單欄位
- 缺少視覺預覽
- 無法直觀地編輯圖片和配色

**理想的編輯介面：**
- 視覺化編輯器
- 即時預覽
- 拖放上傳圖片
- 配色選擇器
- 圖文交錯編輯

### 解決方案

#### 方案 A：分頁式編輯器（推薦）

**結構：**
```
編輯行程
├─ Tab 1：基本資訊
│   ├─ 標題
│   ├─ 描述
│   ├─ 目的地
│   ├─ 天數
│   └─ 價格
├─ Tab 2：Hero 區域
│   ├─ Hero 圖片上傳
│   ├─ Hero 副標題
│   └─ 即時預覽
├─ Tab 3：配色主題
│   ├─ 主色選擇器
│   ├─ 輔助色選擇器
│   ├─ 點綴色選擇器
│   └─ 即時預覽
├─ Tab 4：行程亮點
│   ├─ 亮點 1（圖片 + 標題 + 描述）
│   ├─ 亮點 2
│   ├─ 亮點 3
│   └─ 拖放排序
├─ Tab 5：每日行程
│   ├─ 第 1 天（圖片 + 標題 + 描述）
│   ├─ 第 2 天
│   └─ 動態新增/刪除
└─ Tab 6：費用說明
    ├─ 包含項目
    ├─ 不包含項目
    └─ 價格明細
```

**實作：**
```typescript
// client/src/components/admin/TourEditor.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TourBasicInfoTab } from './TourEditor/BasicInfoTab';
import { TourHeroTab } from './TourEditor/HeroTab';
import { TourColorThemeTab } from './TourEditor/ColorThemeTab';
import { TourHighlightsTab } from './TourEditor/HighlightsTab';
import { TourItineraryTab } from './TourEditor/ItineraryTab';
import { TourPricingTab } from './TourEditor/PricingTab';

export function TourEditor({ tour, onSave }: { tour: Tour; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState(tour);
  const [activeTab, setActiveTab] = useState('basic');
  
  return (
    <div className="flex h-screen">
      {/* 左側：編輯器 */}
      <div className="w-1/2 overflow-y-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="basic">基本資訊</TabsTrigger>
            <TabsTrigger value="hero">Hero 區域</TabsTrigger>
            <TabsTrigger value="color">配色主題</TabsTrigger>
            <TabsTrigger value="highlights">行程亮點</TabsTrigger>
            <TabsTrigger value="itinerary">每日行程</TabsTrigger>
            <TabsTrigger value="pricing">費用說明</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <TourBasicInfoTab data={formData} onChange={setFormData} />
          </TabsContent>
          
          <TabsContent value="hero">
            <TourHeroTab data={formData} onChange={setFormData} />
          </TabsContent>
          
          <TabsContent value="color">
            <TourColorThemeTab data={formData} onChange={setFormData} />
          </TabsContent>
          
          <TabsContent value="highlights">
            <TourHighlightsTab data={formData} onChange={setFormData} />
          </TabsContent>
          
          <TabsContent value="itinerary">
            <TourItineraryTab data={formData} onChange={setFormData} />
          </TabsContent>
          
          <TabsContent value="pricing">
            <TourPricingTab data={formData} onChange={setFormData} />
          </TabsContent>
        </Tabs>
        
        {/* 儲存按鈕 */}
        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            取消
          </Button>
          <Button onClick={() => onSave(formData)}>
            儲存變更
          </Button>
        </div>
      </div>
      
      {/* 右側：即時預覽 */}
      <div className="w-1/2 bg-gray-100 overflow-y-auto">
        <TourDetailPreview tour={formData} />
      </div>
    </div>
  );
}
```

**Hero Tab 實作：**
```typescript
// client/src/components/admin/TourEditor/HeroTab.tsx
import { useState } from 'react';
import { Upload } from 'lucide-react';

export function TourHeroTab({ data, onChange }) {
  const [uploading, setUploading] = useState(false);
  
  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      // 上傳到 S3
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const { url } = await response.json();
      
      // 更新表單資料
      onChange({
        ...data,
        heroImage: url
      });
      
      toast.success('圖片上傳成功');
    } catch (error) {
      toast.error('圖片上傳失敗');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Hero 圖片</label>
        
        {/* 圖片預覽 */}
        {data.heroImage && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
            <img 
              src={data.heroImage} 
              alt="Hero" 
              className="w-full h-full object-cover"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => onChange({ ...data, heroImage: null })}
            >
              移除
            </Button>
          </div>
        )}
        
        {/* 上傳按鈕 */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="hero-image-upload"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
          <label htmlFor="hero-image-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600">
              點擊上傳或拖放圖片
            </p>
            <p className="text-xs text-gray-400 mt-2">
              建議尺寸：1920 × 1080 px
            </p>
          </label>
        </div>
        
        {/* AI 生成按鈕 */}
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={async () => {
            // 調用 AI 生成圖片
            const prompt = await generateOptimizedPrompt('hero', {
              title: data.title,
              description: data.description,
              destination: data.destinationCity,
              country: data.destinationCountry
            });
            
            const imageUrl = await generateAndUploadImage(
              prompt,
              `tours/${data.id}/hero-${Date.now()}.jpg`
            );
            
            onChange({ ...data, heroImage: imageUrl });
          }}
        >
          🪄 AI 生成圖片
        </Button>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Hero 副標題</label>
        <Input
          value={data.heroSubtitle || ''}
          onChange={(e) => onChange({ ...data, heroSubtitle: e.target.value })}
          placeholder="探索日本北海道的美好時光"
        />
      </div>
    </div>
  );
}
```

**配色 Tab 實作：**
```typescript
// client/src/components/admin/TourEditor/ColorThemeTab.tsx
import { HexColorPicker } from 'react-colorful';

export function TourColorThemeTab({ data, onChange }) {
  const colorTheme = data.colorTheme ? JSON.parse(data.colorTheme) : {
    primary: '#C41E3A',
    secondary: '#F4E5D3',
    accent: '#D4AF37',
    background: '#FFFFFF',
    text: '#2C2C2C',
    muted: '#8B8B8B',
    border: '#E5E5E5'
  };
  
  const updateColor = (key: string, value: string) => {
    const newTheme = { ...colorTheme, [key]: value };
    onChange({ ...data, colorTheme: JSON.stringify(newTheme) });
  };
  
  return (
    <div className="space-y-6">
      {/* 主色 */}
      <div>
        <label className="block text-sm font-medium mb-2">主色（Primary）</label>
        <div className="flex gap-4">
          <HexColorPicker
            color={colorTheme.primary}
            onChange={(color) => updateColor('primary', color)}
          />
          <div>
            <Input
              value={colorTheme.primary}
              onChange={(e) => updateColor('primary', e.target.value)}
              className="font-mono"
            />
            <div
              className="w-full h-20 rounded-lg mt-2"
              style={{ backgroundColor: colorTheme.primary }}
            />
          </div>
        </div>
      </div>
      
      {/* 輔助色 */}
      <div>
        <label className="block text-sm font-medium mb-2">輔助色（Secondary）</label>
        <div className="flex gap-4">
          <HexColorPicker
            color={colorTheme.secondary}
            onChange={(color) => updateColor('secondary', color)}
          />
          <div>
            <Input
              value={colorTheme.secondary}
              onChange={(e) => updateColor('secondary', e.target.value)}
              className="font-mono"
            />
            <div
              className="w-full h-20 rounded-lg mt-2"
              style={{ backgroundColor: colorTheme.secondary }}
            />
          </div>
        </div>
      </div>
      
      {/* 預設配色方案 */}
      <div>
        <label className="block text-sm font-medium mb-2">預設配色方案</label>
        <div className="grid grid-cols-3 gap-4">
          {presetColorThemes.map((preset) => (
            <div
              key={preset.name}
              className="border rounded-lg p-4 cursor-pointer hover:border-primary"
              onClick={() => onChange({ ...data, colorTheme: JSON.stringify(preset.theme) })}
            >
              <p className="text-sm font-medium mb-2">{preset.name}</p>
              <div className="flex gap-2">
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: preset.theme.primary }}
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: preset.theme.secondary }}
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: preset.theme.accent }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const presetColorThemes = [
  {
    name: '日本紅',
    theme: {
      primary: '#C41E3A',
      secondary: '#F4E5D3',
      accent: '#D4AF37',
      background: '#FFFFFF',
      text: '#2C2C2C',
      muted: '#8B8B8B',
      border: '#E5E5E5'
    }
  },
  {
    name: '北海道藍',
    theme: {
      primary: '#4A90E2',
      secondary: '#FFB6C1',
      accent: '#D4AF37',
      background: '#FFFFFF',
      text: '#2C2C2C',
      muted: '#8B8B8B',
      border: '#E5E5E5'
    }
  },
  // ... 更多預設配色
];
```

**即時預覽實作：**
```typescript
// client/src/components/admin/TourDetailPreview.tsx
export function TourDetailPreview({ tour }: { tour: Tour }) {
  const theme = useColorTheme(tour.colorTheme);
  
  return (
    <div className="bg-white">
      {/* Hero 區域預覽 */}
      <div 
        className="relative h-[50vh] w-full flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${tour.heroImage || '/placeholder.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="text-center text-white z-10 px-4">
          <h1 
            className="text-4xl font-serif font-bold mb-4"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
          >
            {tour.title || '行程標題'}
          </h1>
          {tour.heroSubtitle && (
            <p 
              className="text-xl font-light"
              style={{ color: theme.secondary }}
            >
              {tour.heroSubtitle}
            </p>
          )}
        </div>
      </div>
      
      {/* 內容區域預覽 */}
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4" style={{ color: theme.primary }}>
          行程介紹
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {tour.description || '行程描述'}
        </p>
      </div>
    </div>
  );
}
```

### 效果

**優點：**
- ✅ 視覺化編輯
- ✅ 即時預覽
- ✅ 直觀的介面
- ✅ 支援拖放上傳
- ✅ 配色選擇器
- ✅ 分頁式結構清晰

---

## 問題 6：要不要利用 skills 增加每個部分 AI agent 協調，不用只靠一個 Agent 處理？

### 分析

**單一 Agent 的問題：**
- ❌ 處理複雜任務時效率低
- ❌ 錯誤處理困難
- ❌ 難以並行處理
- ❌ 可擴展性差

**多 Agent 協調的優勢：**
- ✅ 專業分工，效率更高
- ✅ 並行處理，縮短時間
- ✅ 錯誤隔離，更容易處理
- ✅ 可擴展性強

### 建議架構：多 Agent 協調系統

#### Agent 分工

```
Master Agent（協調者）
├─ Web Scraper Agent（網頁抓取專家）
│   └─ 負責：抓取網頁、清理 HTML、提取結構化資料
├─ Content Analyzer Agent（內容分析專家）
│   └─ 負責：LLM 解析、提取行程資訊、生成行銷文案
├─ Image Prompt Agent（圖片 Prompt 專家）
│   └─ 負責：生成優化的圖片 Prompt、驗證 Prompt 品質
├─ Image Generation Agent（圖片生成專家）
│   └─ 負責：調用圖片生成 API、下載圖片、上傳 S3
└─ Color Theme Agent（配色主題專家）
    └─ 負責：根據目的地生成配色方案、驗證配色和諧度
```

#### 實作方式

**使用 Manus Skills 系統：**

1. **建立 Web Scraper Skill**
```bash
# /home/ubuntu/skills/web-scraper-agent/SKILL.md
```

```markdown
# Web Scraper Agent Skill

## 功能描述
專門負責抓取旅遊網站的行程資訊，並提取結構化資料。

## 輸入格式
```json
{
  "url": "https://travel.liontravel.com/detail?NormGroupID=..."
}
```

## 輸出格式
```json
{
  "html": "<html>...</html>",
  "title": "行程標題",
  "rawContent": "原始內容",
  "metadata": {
    "source": "雄獅旅遊",
    "scrapedAt": "2026-01-24T10:00:00Z"
  }
}
```

## 使用方式
```typescript
import { webScraperAgent } from '@/skills/web-scraper-agent';

const result = await webScraperAgent.scrape({ url });
```

## 錯誤處理
- 網頁無法訪問 → 返回錯誤碼 404
- 超時 → 返回錯誤碼 408
- 內容解析失敗 → 返回錯誤碼 500
```

2. **建立 Content Analyzer Skill**
```markdown
# Content Analyzer Agent Skill

## 功能描述
使用 LLM 分析行程內容，提取結構化資訊並生成行銷文案。

## 輸入格式
```json
{
  "html": "<html>...</html>",
  "rawContent": "原始內容"
}
```

## 輸出格式
```json
{
  "title": "精心設計的行銷標題",
  "description": "吸引人的行程介紹",
  "destinationCity": "東京",
  "destinationCountry": "日本",
  "days": 5,
  "price": 35000,
  "category": "團體旅遊",
  "itinerary": [
    {
      "day": 1,
      "title": "第一天標題",
      "description": "第一天行程描述"
    }
  ]
}
```

## 使用方式
```typescript
import { contentAnalyzerAgent } from '@/skills/content-analyzer-agent';

const result = await contentAnalyzerAgent.analyze({ html, rawContent });
```
```

3. **建立 Master Agent 協調邏輯**
```typescript
// server/agents/masterAgent.ts
import { webScraperAgent } from '@/skills/web-scraper-agent';
import { contentAnalyzerAgent } from '@/skills/content-analyzer-agent';
import { imagePromptAgent } from '@/skills/image-prompt-agent';
import { imageGenerationAgent } from '@/skills/image-generation-agent';
import { colorThemeAgent } from '@/skills/color-theme-agent';

export class MasterAgent {
  async generateTour(url: string): Promise<Tour> {
    console.log('[Master Agent] 開始生成行程');
    
    // 階段 1：抓取網頁（Web Scraper Agent）
    console.log('[Master Agent] 階段 1：抓取網頁');
    const scrapedData = await webScraperAgent.scrape({ url });
    
    // 階段 2：分析內容（Content Analyzer Agent）
    console.log('[Master Agent] 階段 2：分析內容');
    const tourData = await contentAnalyzerAgent.analyze({
      html: scrapedData.html,
      rawContent: scrapedData.rawContent
    });
    
    // 階段 3-5：並行處理
    console.log('[Master Agent] 階段 3-5：並行處理');
    const [colorTheme, imagePrompts] = await Promise.all([
      // 階段 3：生成配色（Color Theme Agent）
      colorThemeAgent.generate({
        destination: tourData.destinationCity,
        category: tourData.category
      }),
      
      // 階段 4：生成圖片 Prompt（Image Prompt Agent）
      imagePromptAgent.generateAll({
        title: tourData.title,
        description: tourData.description,
        destination: tourData.destinationCity,
        country: tourData.destinationCountry,
        category: tourData.category
      })
    ]);
    
    // 階段 5：生成圖片（Image Generation Agent）
    console.log('[Master Agent] 階段 5：生成圖片');
    const images = await imageGenerationAgent.generateAll({
      prompts: imagePrompts,
      tourId: Date.now()
    });
    
    // 階段 6：組合結果
    console.log('[Master Agent] 階段 6：組合結果');
    const finalTour = {
      ...tourData,
      heroImage: images.hero,
      colorTheme: JSON.stringify(colorTheme),
      status: 'inactive'
    };
    
    console.log('[Master Agent] 完成生成行程');
    return finalTour;
  }
}
```

#### 優勢

**1. 專業分工**
- 每個 Agent 專注於自己的領域
- 提升處理品質和效率

**2. 並行處理**
- 配色和圖片 Prompt 可以並行生成
- 大幅縮短總時間

**3. 錯誤隔離**
- 單一 Agent 失敗不影響其他 Agent
- 更容易定位和修復問題

**4. 可擴展性**
- 輕鬆添加新的 Agent（如評論生成 Agent、SEO 優化 Agent）
- 不影響現有系統

**5. 可測試性**
- 每個 Agent 可以獨立測試
- 更容易確保品質

### 建議

**推薦：採用多 Agent 協調系統**

**理由：**
1. ✅ 系統更穩定
2. ✅ 處理速度更快（並行處理）
3. ✅ 更容易維護和擴展
4. ✅ 錯誤處理更完善
5. ✅ 符合 Manus Skills 系統設計理念

**實作順序：**
1. 先實作 MVP（單一 Agent）驗證可行性
2. 再重構為多 Agent 協調系統
3. 持續優化各個 Agent 的效能

---

## 總結與建議

### 回答摘要

1. **一條龍流程**：整合到現有 AI 自動生成器，建議採用非同步處理 + 任務隊列
2. **時間優化**：MVP 版本 25-40 秒，完整版本 40-70 秒（並行處理）
3. **系統穩定性**：使用任務隊列 + 速率限制 + 超時處理 + 健康檢查
4. **圖片品質**：精確 Prompt 工程 + 驗證 + 人工審核 + 多變體生成
5. **編輯介面**：分頁式編輯器 + 即時預覽 + 視覺化工具
6. **多 Agent 協調**：強烈建議採用，提升效率和穩定性

### 推薦實作順序

**第一步（今天）：MVP 版本**
1. 資料庫擴充
2. 整合圖片生成（僅 Hero 圖片）
3. 實作配色系統
4. 重構 Hero 區域前端
5. 測試並儲存 checkpoint

**第二步（明天）：優化與完善**
1. 實作非同步處理
2. 添加任務隊列
3. 實作速率限制
4. 完善錯誤處理

**第三步（下週）：多 Agent 系統**
1. 建立各個 Agent Skills
2. 實作 Master Agent 協調邏輯
3. 重構現有代碼
4. 測試並優化

**您想要現在開始實作 MVP 版本嗎？**
