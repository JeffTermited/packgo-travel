# 圖片生成與上傳流程詳細說明

## 概述

本文件詳細說明如何使用 Manus 圖片生成 API 根據行程內容自動生成圖片，並將生成的圖片上傳到 S3 儲存的完整流程。

## 一、Manus 圖片生成 API 使用方式

### 1.1 API 基本資訊

Manus 提供了內建的圖片生成 API，已經在 `server/_core/imageGeneration.ts` 中預先配置好。

**API 特點：**
- 無需手動配置 API Key（自動注入）
- 支援文字描述生成圖片
- 支援圖片編輯（基於現有圖片修改）
- 生成時間約 5-20 秒
- 返回臨時圖片 URL（需要下載並上傳到 S3 永久儲存）

### 1.2 引入圖片生成函數

```typescript
import { generateImage } from "./server/_core/imageGeneration";
```

### 1.3 基本使用方式

```typescript
// 生成新圖片
const result = await generateImage({
  prompt: "A beautiful landscape of Tokyo, Japan, cherry blossoms, professional photography"
});

console.log(result.url); // 臨時圖片 URL
```

### 1.4 進階使用方式（圖片編輯）

```typescript
// 基於現有圖片進行編輯
const result = await generateImage({
  prompt: "Add a rainbow to this landscape",
  originalImages: [{
    url: "https://example.com/original.jpg",
    mimeType: "image/jpeg"
  }]
});
```

## 二、根據行程內容生成圖片的策略

### 2.1 Prompt 工程（提示詞設計）

為了生成高品質的行程圖片，我們需要設計精確的 Prompt。

**Prompt 結構：**
```
[主題] + [地點] + [風格] + [品質關鍵字]
```

**範例：**

| 圖片類型 | Prompt 範例 |
|---------|------------|
| Hero 圖片 | `A stunning panoramic landscape photo of Tokyo skyline at sunset, Mount Fuji in the background, golden hour lighting, professional photography, high quality, 8K resolution` |
| 溫泉場景 | `Traditional Japanese onsen hot spring in Hokkaido, snow-covered mountains in background, steam rising from water, serene atmosphere, professional travel photography` |
| 美食場景 | `Exquisite Japanese kaiseki cuisine beautifully plated, fresh sashimi, tempura, seasonal vegetables, elegant presentation, restaurant photography, soft lighting` |
| 住宿場景 | `Luxury 5-star hotel room with ocean view, modern Japanese design, tatami floor, floor-to-ceiling windows, minimalist interior, architectural photography` |
| 景點場景 | `Fushimi Inari Shrine in Kyoto, thousands of red torii gates, tourists walking through, sunny day, vibrant colors, travel photography` |

### 2.2 根據行程資料動態生成 Prompt

```typescript
/**
 * 根據行程資料生成 Hero 圖片的 Prompt
 */
function generateHeroPrompt(tour: Tour): string {
  const { destinationCity, destinationCountry, title } = tour;
  
  // 基礎 Prompt
  let prompt = `A stunning panoramic landscape photo of ${destinationCity}, ${destinationCountry}`;
  
  // 根據目的地添加特色元素
  const landmarks: Record<string, string> = {
    '東京': 'Mount Fuji in the background, Tokyo Tower',
    '京都': 'traditional temples, cherry blossoms',
    '北海道': 'snow-covered mountains, lavender fields',
    '大阪': 'Osaka Castle, modern cityscape',
    '巴黎': 'Eiffel Tower, Seine River',
    '倫敦': 'Big Ben, London Eye',
    '紐約': 'Manhattan skyline, Brooklyn Bridge',
    // ... 更多地標
  };
  
  if (landmarks[destinationCity]) {
    prompt += `, ${landmarks[destinationCity]}`;
  }
  
  // 添加品質關鍵字
  prompt += ', golden hour lighting, professional travel photography, high quality, 8K resolution, vibrant colors';
  
  return prompt;
}

/**
 * 根據行程亮點生成 Prompt
 */
function generateHighlightPrompt(highlight: TourHighlight, tour: Tour): string {
  const { title, description } = highlight;
  const { destinationCity, destinationCountry } = tour;
  
  let prompt = `${title} in ${destinationCity}, ${destinationCountry}`;
  
  // 根據亮點類型添加風格描述
  if (title.includes('溫泉') || title.includes('ONSEN')) {
    prompt += ', traditional Japanese hot spring, steam rising, serene atmosphere';
  } else if (title.includes('美食') || title.includes('料理')) {
    prompt += ', exquisite cuisine, beautifully plated, elegant presentation';
  } else if (title.includes('住宿') || title.includes('飯店') || title.includes('STAY')) {
    prompt += ', luxury hotel interior, modern design, comfortable atmosphere';
  } else {
    prompt += ', beautiful scenery, tourist attraction';
  }
  
  prompt += ', professional travel photography, high quality';
  
  return prompt;
}

/**
 * 根據每日行程生成 Prompt
 */
function generateDailyItineraryPrompt(day: DailyItinerary, tour: Tour): string {
  const { title, description } = day;
  const { destinationCity, destinationCountry } = tour;
  
  // 從行程描述中提取關鍵景點
  const attractions = extractAttractions(description);
  
  let prompt = `${attractions[0] || title} in ${destinationCity}, ${destinationCountry}`;
  prompt += ', beautiful scenery, tourist destination, professional travel photography, high quality';
  
  return prompt;
}

/**
 * 從描述中提取景點名稱
 */
function extractAttractions(description: string): string[] {
  // 簡單的關鍵字提取邏輯（可以使用 LLM 改進）
  const keywords = ['神社', '寺廟', '城堡', '公園', '博物館', '塔', '湖', '山', '海灘'];
  const attractions: string[] = [];
  
  for (const keyword of keywords) {
    const regex = new RegExp(`([^，。、]+${keyword})`, 'g');
    const matches = description.match(regex);
    if (matches) {
      attractions.push(...matches);
    }
  }
  
  return attractions;
}
```

### 2.3 使用 LLM 優化 Prompt（進階）

```typescript
import { invokeLLM } from "./server/_core/llm";

/**
 * 使用 LLM 生成更精確的圖片 Prompt
 */
async function generateOptimizedPrompt(
  imageType: 'hero' | 'highlight' | 'itinerary',
  context: {
    title: string;
    description: string;
    destination: string;
    country: string;
  }
): Promise<string> {
  const systemPrompt = `你是一位專業的旅遊攝影指導專家。你的任務是根據行程資訊，生成高品質的圖片生成 Prompt。

Prompt 應該包含：
1. 主題和地點
2. 視覺元素（建築、自然景觀、人物活動等）
3. 攝影風格（專業旅遊攝影、建築攝影、美食攝影等）
4. 光線和氛圍（黃金時刻、柔和光線、充滿活力等）
5. 品質關鍵字（high quality, 8K resolution, professional photography 等）

請用英文撰寫 Prompt，並確保描述清晰、具體。`;

  const userPrompt = `請為以下行程資訊生成圖片 Prompt：

圖片類型：${imageType}
標題：${context.title}
描述：${context.description}
目的地：${context.destination}, ${context.country}

請生成一個詳細的英文 Prompt，用於生成高品質的旅遊行程圖片。`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });

  return response.choices[0].message.content.trim();
}
```

## 三、圖片生成的完整流程

### 3.1 生成單張圖片

```typescript
/**
 * 生成並上傳單張圖片到 S3
 * @param prompt 圖片生成 Prompt
 * @param fileKey S3 儲存路徑
 * @returns S3 圖片 URL
 */
async function generateAndUploadImage(
  prompt: string,
  fileKey: string
): Promise<string> {
  try {
    // 步驟 1：使用 Manus API 生成圖片
    console.log(`[圖片生成] 開始生成圖片: ${prompt.substring(0, 50)}...`);
    const { url: tempImageUrl } = await generateImage({ prompt });
    console.log(`[圖片生成] 圖片生成成功: ${tempImageUrl}`);
    
    // 步驟 2：下載臨時圖片
    console.log(`[圖片下載] 開始下載圖片...`);
    const response = await fetch(tempImageUrl);
    if (!response.ok) {
      throw new Error(`下載圖片失敗: ${response.statusText}`);
    }
    const imageBuffer = await response.arrayBuffer();
    console.log(`[圖片下載] 圖片下載成功，大小: ${imageBuffer.byteLength} bytes`);
    
    // 步驟 3：上傳到 S3
    console.log(`[S3 上傳] 開始上傳到 S3: ${fileKey}`);
    const { url: s3Url } = await storagePut(
      fileKey,
      Buffer.from(imageBuffer),
      'image/jpeg'
    );
    console.log(`[S3 上傳] 上傳成功: ${s3Url}`);
    
    return s3Url;
  } catch (error) {
    console.error(`[圖片生成失敗] ${error}`);
    throw error;
  }
}
```

### 3.2 批量生成圖片

```typescript
/**
 * 批量生成並上傳圖片
 * @param prompts Prompt 陣列
 * @param basePath S3 基礎路徑
 * @returns S3 圖片 URL 陣列
 */
async function batchGenerateAndUploadImages(
  prompts: string[],
  basePath: string
): Promise<string[]> {
  const imageUrls: string[] = [];
  
  // 逐一生成圖片（避免並發過多導致 API 限制）
  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    const fileKey = `${basePath}/image-${i + 1}-${Date.now()}.jpg`;
    
    try {
      const imageUrl = await generateAndUploadImage(prompt, fileKey);
      imageUrls.push(imageUrl);
      
      // 添加延遲，避免 API 限制
      if (i < prompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 等待 2 秒
      }
    } catch (error) {
      console.error(`生成第 ${i + 1} 張圖片失敗:`, error);
      // 使用預設圖片或跳過
      imageUrls.push('');
    }
  }
  
  return imageUrls;
}
```

### 3.3 整合到行程生成流程

```typescript
/**
 * 為行程生成所有需要的圖片
 */
async function generateTourImages(tour: Tour): Promise<{
  heroImage: string;
  highlightImages: string[];
  itineraryImages: string[][];
}> {
  const tourId = tour.id;
  const basePath = `tours/${tourId}`;
  
  // 1. 生成 Hero 圖片
  console.log(`[行程 ${tourId}] 開始生成 Hero 圖片...`);
  const heroPrompt = await generateOptimizedPrompt('hero', {
    title: tour.title,
    description: tour.description,
    destination: tour.destinationCity,
    country: tour.destinationCountry
  });
  const heroImage = await generateAndUploadImage(
    heroPrompt,
    `${basePath}/hero-${Date.now()}.jpg`
  );
  
  // 2. 生成行程亮點圖片
  console.log(`[行程 ${tourId}] 開始生成行程亮點圖片...`);
  const highlights = JSON.parse(tour.highlights) as TourHighlight[];
  const highlightPrompts = await Promise.all(
    highlights.map(h => generateOptimizedPrompt('highlight', {
      title: h.title,
      description: h.description,
      destination: tour.destinationCity,
      country: tour.destinationCountry
    }))
  );
  const highlightImages = await batchGenerateAndUploadImages(
    highlightPrompts,
    `${basePath}/highlights`
  );
  
  // 3. 生成每日行程圖片
  console.log(`[行程 ${tourId}] 開始生成每日行程圖片...`);
  const dailyItinerary = JSON.parse(tour.dailyItinerary) as DailyItinerary[];
  const itineraryImages: string[][] = [];
  
  for (let i = 0; i < dailyItinerary.length; i++) {
    const day = dailyItinerary[i];
    const dayPrompts = await Promise.all(
      // 每天生成 2-3 張圖片
      [day.title, ...extractAttractions(day.description).slice(0, 2)].map(
        title => generateOptimizedPrompt('itinerary', {
          title,
          description: day.description,
          destination: tour.destinationCity,
          country: tour.destinationCountry
        })
      )
    );
    
    const dayImages = await batchGenerateAndUploadImages(
      dayPrompts,
      `${basePath}/itinerary/day-${i + 1}`
    );
    itineraryImages.push(dayImages);
  }
  
  return {
    heroImage,
    highlightImages,
    itineraryImages
  };
}
```

## 四、S3 上傳的詳細流程

### 4.1 S3 配置（已預先配置）

Manus 已經在 `server/storage.ts` 中預先配置好 S3 連接，無需手動設定。

```typescript
import { storagePut, storageGet } from "./server/storage";
```

### 4.2 上傳檔案到 S3

```typescript
/**
 * 上傳圖片到 S3
 * @param fileKey S3 檔案路徑（相對路徑）
 * @param fileBuffer 圖片 Buffer
 * @param contentType MIME 類型
 * @returns S3 公開 URL
 */
async function uploadImageToS3(
  fileKey: string,
  fileBuffer: Buffer,
  contentType: string = 'image/jpeg'
): Promise<string> {
  const { url } = await storagePut(fileKey, fileBuffer, contentType);
  return url;
}
```

### 4.3 S3 檔案路徑規劃

為了方便管理，建議使用以下路徑結構：

```
tours/
  {tourId}/
    hero-{timestamp}.jpg                    # Hero 圖片
    highlights/
      image-1-{timestamp}.jpg               # 亮點圖片 1
      image-2-{timestamp}.jpg               # 亮點圖片 2
      image-3-{timestamp}.jpg               # 亮點圖片 3
    itinerary/
      day-1/
        image-1-{timestamp}.jpg             # 第 1 天圖片 1
        image-2-{timestamp}.jpg             # 第 1 天圖片 2
      day-2/
        image-1-{timestamp}.jpg             # 第 2 天圖片 1
        image-2-{timestamp}.jpg             # 第 2 天圖片 2
    gallery/
      image-1-{timestamp}.jpg               # 圖片畫廊 1
      image-2-{timestamp}.jpg               # 圖片畫廊 2
```

**路徑生成函數：**

```typescript
/**
 * 生成 S3 檔案路徑
 */
function generateS3FileKey(
  tourId: number,
  imageType: 'hero' | 'highlight' | 'itinerary' | 'gallery',
  index?: number,
  dayIndex?: number
): string {
  const timestamp = Date.now();
  const basePath = `tours/${tourId}`;
  
  switch (imageType) {
    case 'hero':
      return `${basePath}/hero-${timestamp}.jpg`;
    
    case 'highlight':
      return `${basePath}/highlights/image-${index}-${timestamp}.jpg`;
    
    case 'itinerary':
      return `${basePath}/itinerary/day-${dayIndex}/image-${index}-${timestamp}.jpg`;
    
    case 'gallery':
      return `${basePath}/gallery/image-${index}-${timestamp}.jpg`;
    
    default:
      return `${basePath}/image-${timestamp}.jpg`;
  }
}
```

### 4.4 檔案大小優化

為了節省儲存空間和加快載入速度，建議壓縮圖片：

```typescript
import sharp from 'sharp';

/**
 * 壓縮並優化圖片
 * @param imageBuffer 原始圖片 Buffer
 * @param quality 品質（0-100）
 * @param maxWidth 最大寬度
 * @returns 壓縮後的 Buffer
 */
async function optimizeImage(
  imageBuffer: Buffer,
  quality: number = 85,
  maxWidth: number = 1920
): Promise<Buffer> {
  return await sharp(imageBuffer)
    .resize(maxWidth, null, {
      withoutEnlargement: true,
      fit: 'inside'
    })
    .jpeg({ quality, progressive: true })
    .toBuffer();
}

/**
 * 生成並上傳優化後的圖片
 */
async function generateAndUploadOptimizedImage(
  prompt: string,
  fileKey: string
): Promise<string> {
  // 生成圖片
  const { url: tempImageUrl } = await generateImage({ prompt });
  
  // 下載圖片
  const response = await fetch(tempImageUrl);
  const imageBuffer = Buffer.from(await response.arrayBuffer());
  
  // 優化圖片
  const optimizedBuffer = await optimizeImage(imageBuffer, 85, 1920);
  
  // 上傳到 S3
  const { url: s3Url } = await storagePut(
    fileKey,
    optimizedBuffer,
    'image/jpeg'
  );
  
  return s3Url;
}
```

## 五、整合到 tRPC API

### 5.1 建立圖片生成 API

```typescript
// 在 server/routers.ts 中
export const appRouter = router({
  // ... 其他 procedures
  
  tours: {
    // 生成行程圖片
    generateImages: protectedProcedure
      .input(z.object({
        tourId: z.number()
      }))
      .mutation(async ({ input, ctx }) => {
        const { tourId } = input;
        
        // 查詢行程資料
        const tour = await db.query.tours.findFirst({
          where: eq(tours.id, tourId)
        });
        
        if (!tour) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '找不到行程'
          });
        }
        
        // 生成圖片
        const images = await generateTourImages(tour);
        
        // 更新資料庫
        await db.update(tours)
          .set({
            heroImage: images.heroImage,
            highlights: JSON.stringify(
              JSON.parse(tour.highlights).map((h: any, i: number) => ({
                ...h,
                image: images.highlightImages[i]
              }))
            ),
            dailyItinerary: JSON.stringify(
              JSON.parse(tour.dailyItinerary).map((day: any, i: number) => ({
                ...day,
                images: images.itineraryImages[i].map((url, j) => ({
                  id: j + 1,
                  url,
                  alt: `Day ${i + 1} - Image ${j + 1}`,
                  caption: ''
                }))
              }))
            )
          })
          .where(eq(tours.id, tourId));
        
        return {
          success: true,
          images
        };
      })
  }
});
```

### 5.2 前端調用

```typescript
// 在管理後台的 ToursTab.tsx 中
const generateImagesMutation = trpc.tours.generateImages.useMutation({
  onSuccess: () => {
    toast.success('圖片生成成功！');
    refetch(); // 重新載入行程列表
  },
  onError: (error) => {
    toast.error(`圖片生成失敗: ${error.message}`);
  }
});

// 在行程列表中添加「生成圖片」按鈕
<Button
  onClick={() => generateImagesMutation.mutate({ tourId: tour.id })}
  disabled={generateImagesMutation.isLoading}
>
  {generateImagesMutation.isLoading ? '生成中...' : '生成圖片'}
</Button>
```

## 六、錯誤處理與重試機制

### 6.1 錯誤處理

```typescript
/**
 * 帶錯誤處理的圖片生成函數
 */
async function generateImageWithErrorHandling(
  prompt: string,
  fileKey: string,
  maxRetries: number = 3
): Promise<string | null> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[嘗試 ${attempt}/${maxRetries}] 生成圖片...`);
      const imageUrl = await generateAndUploadImage(prompt, fileKey);
      return imageUrl;
    } catch (error) {
      lastError = error as Error;
      console.error(`[嘗試 ${attempt}/${maxRetries}] 失敗:`, error);
      
      // 如果不是最後一次嘗試，等待後重試
      if (attempt < maxRetries) {
        const waitTime = attempt * 2000; // 指數退避
        console.log(`等待 ${waitTime}ms 後重試...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // 所有嘗試都失敗
  console.error(`圖片生成失敗（已重試 ${maxRetries} 次）:`, lastError);
  return null; // 返回 null 表示失敗
}
```

### 6.2 使用預設圖片作為備用

```typescript
/**
 * 生成圖片，失敗時使用預設圖片
 */
async function generateImageWithFallback(
  prompt: string,
  fileKey: string,
  fallbackImageUrl: string
): Promise<string> {
  const imageUrl = await generateImageWithErrorHandling(prompt, fileKey);
  return imageUrl || fallbackImageUrl;
}

// 使用範例
const heroImage = await generateImageWithFallback(
  heroPrompt,
  `tours/${tourId}/hero.jpg`,
  'https://storage.packgo.com/default/hero-placeholder.jpg'
);
```

## 七、效能優化建議

### 7.1 非同步處理

由於圖片生成需要較長時間（5-20 秒/張），建議使用非同步處理：

```typescript
// 在 autoGenerate mutation 中
const tour = await db.insert(tours).values({
  // ... 行程資料
  heroImage: null, // 先設為 null
  // ...
});

// 非同步生成圖片（不阻塞回應）
generateTourImages(tour).then(async (images) => {
  await db.update(tours)
    .set({
      heroImage: images.heroImage,
      // ...
    })
    .where(eq(tours.id, tour.id));
  
  console.log(`行程 ${tour.id} 的圖片生成完成`);
}).catch(error => {
  console.error(`行程 ${tour.id} 的圖片生成失敗:`, error);
});

// 立即返回行程資料（圖片稍後更新）
return tour;
```

### 7.2 批次處理

如果需要為多個行程生成圖片，建議使用批次處理：

```typescript
/**
 * 批次為多個行程生成圖片
 */
async function batchGenerateTourImages(tourIds: number[]): Promise<void> {
  for (const tourId of tourIds) {
    try {
      const tour = await db.query.tours.findFirst({
        where: eq(tours.id, tourId)
      });
      
      if (tour) {
        const images = await generateTourImages(tour);
        await db.update(tours)
          .set({
            heroImage: images.heroImage,
            // ...
          })
          .where(eq(tours.id, tourId));
        
        console.log(`行程 ${tourId} 圖片生成完成`);
      }
    } catch (error) {
      console.error(`行程 ${tourId} 圖片生成失敗:`, error);
    }
    
    // 添加延遲，避免 API 限制
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}
```

## 八、總結

完整的圖片生成與上傳流程包含以下步驟：

1. **設計 Prompt**：根據行程資料生成精確的圖片描述
2. **調用 Manus API**：使用 `generateImage()` 生成圖片
3. **下載臨時圖片**：使用 `fetch()` 下載生成的圖片
4. **優化圖片**（可選）：使用 `sharp` 壓縮和調整尺寸
5. **上傳到 S3**：使用 `storagePut()` 永久儲存
6. **更新資料庫**：將 S3 URL 儲存到資料庫
7. **錯誤處理**：實作重試機制和預設圖片備用方案

這套流程確保了圖片的高品質、穩定性和可維護性。
