# LLM 優化圖片生成 Prompt 詳細說明

## 概述

使用 LLM（大型語言模型）來優化圖片生成 Prompt，可以大幅提升生成圖片的品質和準確性。本文件詳細說明如何設計 LLM Prompt、處理回應，以及實際範例。

## 一、為什麼需要 LLM 優化 Prompt？

### 1.1 人工 Prompt 的局限性

**問題：**
- 缺乏專業攝影術語
- 描述不夠具體和生動
- 難以捕捉目的地的獨特特色
- 無法根據上下文動態調整

**範例：**
```
❌ 不佳的 Prompt：
"Tokyo Japan photo"

✅ 優化後的 Prompt：
"A stunning panoramic view of Tokyo skyline at sunset, with Mount Fuji visible in the distance, Tokyo Tower illuminated in the foreground, cherry blossom trees framing the scene, golden hour lighting casting warm tones across the cityscape, shot with professional travel photography techniques, ultra-high resolution 8K, vibrant colors, cinematic composition"
```

### 1.2 LLM 優化的優勢

- **專業術語**：自動添加攝影專業術語（golden hour、bokeh、composition 等）
- **豐富細節**：根據目的地特色添加地標、文化元素
- **風格一致**：確保所有圖片 Prompt 風格統一
- **動態調整**：根據行程類型（豪華、探險、文化等）調整描述

## 二、LLM Prompt 設計策略

### 2.1 System Prompt（系統提示）

System Prompt 定義 LLM 的角色和任務。

```typescript
const SYSTEM_PROMPT = `你是一位世界級的旅遊攝影指導專家和 AI 圖片生成專家。你的專長包括：

1. **攝影專業知識**：精通各種攝影技巧、光線運用、構圖原則
2. **旅遊目的地知識**：熟悉全球各地的著名景點、文化特色、最佳拍攝角度
3. **AI 圖片生成**：深入理解 AI 圖片生成模型（如 DALL-E、Midjourney、Stable Diffusion）的 Prompt 工程

你的任務是根據提供的行程資訊，生成高品質的圖片生成 Prompt（英文）。

## Prompt 結構要求

一個優秀的圖片生成 Prompt 應包含以下元素：

1. **主體描述**（Subject）：清晰描述圖片的主要內容
2. **地點與環境**（Location & Environment）：具體的地點、周圍環境
3. **視覺元素**（Visual Elements）：建築、自然景觀、人物活動、色彩
4. **光線與氛圍**（Lighting & Atmosphere）：時間、天氣、光線效果、情緒
5. **攝影技術**（Photography Technique）：拍攝角度、鏡頭類型、景深
6. **風格與品質**（Style & Quality）：藝術風格、品質關鍵字

## 品質關鍵字參考

**光線：**
- golden hour lighting（黃金時刻光線）
- soft diffused light（柔和漫射光）
- dramatic lighting（戲劇性光線）
- natural sunlight（自然陽光）
- blue hour（藍調時刻）

**攝影技術：**
- professional travel photography（專業旅遊攝影）
- wide-angle lens（廣角鏡頭）
- aerial view（航拍視角）
- shallow depth of field（淺景深）
- long exposure（長曝光）

**品質：**
- ultra-high resolution（超高解析度）
- 8K quality（8K 品質）
- sharp focus（清晰對焦）
- vibrant colors（鮮豔色彩）
- cinematic composition（電影般構圖）

**風格：**
- photorealistic（照片寫實）
- cinematic（電影感）
- magazine cover style（雜誌封面風格）
- National Geographic style（國家地理風格）

## 注意事項

1. **具體而非籠統**：使用具體的描述而非模糊的形容詞
2. **避免負面描述**：不要使用 "no", "without", "not" 等否定詞
3. **控制長度**：Prompt 長度建議在 50-150 個英文單詞之間
4. **文化敏感性**：尊重當地文化，避免刻板印象
5. **季節考量**：根據行程日期考慮季節特色（櫻花、雪景等）

請根據以上指導原則，為每個行程生成專業的圖片 Prompt。`;
```

### 2.2 User Prompt（使用者提示）

User Prompt 提供具體的行程資訊和要求。

```typescript
/**
 * 生成 User Prompt
 */
function generateUserPrompt(
  imageType: 'hero' | 'highlight' | 'itinerary' | 'accommodation' | 'dining',
  context: {
    title: string;
    description: string;
    destination: string;
    country: string;
    category?: string;
    season?: string;
    tourStyle?: string; // 'luxury' | 'adventure' | 'cultural' | 'family'
  }
): string {
  const { title, description, destination, country, category, season, tourStyle } = context;
  
  let prompt = `請為以下行程資訊生成一個專業的圖片生成 Prompt：

## 基本資訊
- **圖片類型**：${getImageTypeDescription(imageType)}
- **行程標題**：${title}
- **目的地**：${destination}, ${country}
${category ? `- **行程類別**：${category}` : ''}
${season ? `- **季節**：${season}` : ''}
${tourStyle ? `- **行程風格**：${getTourStyleDescription(tourStyle)}` : ''}

## 行程描述
${description}

## 要求
1. 生成一個詳細的英文 Prompt（50-150 個單詞）
2. 突出 ${destination} 的獨特特色和地標
3. 使用專業攝影術語
4. 確保視覺吸引力和情感共鳴
${imageType === 'hero' ? '5. 適合作為全屏背景大圖，構圖要有衝擊力' : ''}
${imageType === 'dining' ? '5. 強調美食的精緻呈現和誘人外觀' : ''}
${imageType === 'accommodation' ? '5. 展現住宿的舒適感和奢華氛圍' : ''}

請直接輸出 Prompt，不需要額外的解釋或說明。`;

  return prompt;
}

/**
 * 圖片類型描述
 */
function getImageTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    'hero': 'Hero 主視覺圖片（全屏背景大圖）',
    'highlight': '行程亮點圖片',
    'itinerary': '每日行程景點圖片',
    'accommodation': '住宿環境圖片',
    'dining': '美食料理圖片'
  };
  return descriptions[type] || '一般圖片';
}

/**
 * 行程風格描述
 */
function getTourStyleDescription(style: string): string {
  const descriptions: Record<string, string> = {
    'luxury': '奢華高端（強調精緻、優雅、獨特體驗）',
    'adventure': '冒險探索（強調刺激、自然、戶外活動）',
    'cultural': '文化深度（強調歷史、藝術、在地體驗）',
    'family': '家庭親子（強調溫馨、安全、適合全家）'
  };
  return descriptions[style] || '一般旅遊';
}
```

## 三、完整的 LLM 優化函數

### 3.1 基礎版本

```typescript
import { invokeLLM } from "./server/_core/llm";

/**
 * 使用 LLM 優化圖片生成 Prompt
 * @param imageType 圖片類型
 * @param context 行程上下文資訊
 * @returns 優化後的英文 Prompt
 */
async function optimizePromptWithLLM(
  imageType: 'hero' | 'highlight' | 'itinerary' | 'accommodation' | 'dining',
  context: {
    title: string;
    description: string;
    destination: string;
    country: string;
    category?: string;
    season?: string;
    tourStyle?: string;
  }
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: generateUserPrompt(imageType, context) }
      ]
    });
    
    const optimizedPrompt = response.choices[0].message.content.trim();
    
    // 移除可能的引號或多餘的格式
    return optimizedPrompt.replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('LLM 優化 Prompt 失敗:', error);
    // 降級到基礎 Prompt
    return generateBasicPrompt(imageType, context);
  }
}

/**
 * 基礎 Prompt 生成（作為備用方案）
 */
function generateBasicPrompt(
  imageType: string,
  context: {
    title: string;
    destination: string;
    country: string;
  }
): string {
  const { title, destination, country } = context;
  return `A beautiful ${imageType} photo of ${destination}, ${country}, ${title}, professional travel photography, high quality, 8K resolution`;
}
```

### 3.2 進階版本（帶快取和批次處理）

```typescript
/**
 * Prompt 快取（避免重複調用 LLM）
 */
const promptCache = new Map<string, string>();

/**
 * 生成快取鍵
 */
function generateCacheKey(
  imageType: string,
  context: {
    title: string;
    destination: string;
    country: string;
  }
): string {
  return `${imageType}:${context.destination}:${context.country}:${context.title}`;
}

/**
 * 帶快取的 LLM 優化
 */
async function optimizePromptWithCache(
  imageType: 'hero' | 'highlight' | 'itinerary' | 'accommodation' | 'dining',
  context: {
    title: string;
    description: string;
    destination: string;
    country: string;
    category?: string;
    season?: string;
    tourStyle?: string;
  }
): Promise<string> {
  // 檢查快取
  const cacheKey = generateCacheKey(imageType, context);
  if (promptCache.has(cacheKey)) {
    console.log(`[快取命中] ${cacheKey}`);
    return promptCache.get(cacheKey)!;
  }
  
  // 調用 LLM 優化
  const optimizedPrompt = await optimizePromptWithLLM(imageType, context);
  
  // 儲存到快取
  promptCache.set(cacheKey, optimizedPrompt);
  
  return optimizedPrompt;
}

/**
 * 批次優化多個 Prompt
 */
async function batchOptimizePrompts(
  requests: Array<{
    imageType: 'hero' | 'highlight' | 'itinerary' | 'accommodation' | 'dining';
    context: {
      title: string;
      description: string;
      destination: string;
      country: string;
      category?: string;
      season?: string;
      tourStyle?: string;
    };
  }>
): Promise<string[]> {
  const prompts: string[] = [];
  
  for (const request of requests) {
    try {
      const prompt = await optimizePromptWithCache(
        request.imageType,
        request.context
      );
      prompts.push(prompt);
      
      // 添加延遲，避免 API 限制
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('批次優化失敗:', error);
      prompts.push(generateBasicPrompt(request.imageType, request.context));
    }
  }
  
  return prompts;
}
```

## 四、實際使用範例

### 4.1 範例 1：生成 Hero 圖片 Prompt

**輸入：**
```typescript
const context = {
  title: '北海道二世谷雅奢酒店 5 天 4 夜',
  description: '保證入住米其林一星鑰旅宿２晚，探索北海道三大溫泉鄉，洞爺湖心中島探索，二世谷深度漫遊，札幌市區全日自由行',
  destination: '北海道',
  country: '日本',
  category: '團體旅遊',
  season: '冬季',
  tourStyle: 'luxury'
};

const heroPrompt = await optimizePromptWithLLM('hero', context);
```

**LLM 輸出：**
```
A breathtaking panoramic winter landscape of Niseko, Hokkaido, Japan, featuring snow-covered Mount Yotei (Ezo Fuji) dominating the horizon, pristine powder snow blanketing the ski slopes in the foreground, a luxury ryokan with warm golden lights glowing against the twilight blue hour sky, steam rising from outdoor onsen hot springs, traditional Japanese architecture harmoniously integrated with the natural alpine environment, shot with wide-angle lens capturing the majestic scale, professional travel photography, ultra-high resolution 8K, cinematic composition with dramatic depth, soft diffused lighting creating a serene and luxurious atmosphere, National Geographic style
```

### 4.2 範例 2：生成溫泉亮點圖片 Prompt

**輸入：**
```typescript
const context = {
  title: '米其林一星鑰旅宿溫泉體驗',
  description: '在北海道頂級溫泉旅館享受私人露天溫泉，遠眺雪山美景，感受日式待客之道的極致',
  destination: '北海道',
  country: '日本',
  tourStyle: 'luxury'
};

const highlightPrompt = await optimizePromptWithLLM('highlight', context);
```

**LLM 輸出：**
```
An exquisite outdoor onsen hot spring at a Michelin-starred luxury ryokan in Hokkaido, Japan, featuring a traditional wooden bath filled with steaming natural hot spring water, snow-covered mountains visible in the misty background, delicate snowflakes gently falling, smooth river stones surrounding the bath, bamboo water fountain (tsukubai) in the foreground, soft natural lighting during blue hour creating a tranquil ambiance, shallow depth of field focusing on the rising steam, professional spa photography, ultra-high resolution, serene and zen atmosphere, warm color tones contrasting with cool winter blues, magazine cover quality
```

### 4.3 範例 3：生成美食圖片 Prompt

**輸入：**
```typescript
const context = {
  title: '北海道海鮮料理',
  description: '品嚐北海道新鮮海鮮，包括帝王蟹、海膽、鮭魚卵等頂級食材，精緻的懷石料理呈現',
  destination: '北海道',
  country: '日本',
  tourStyle: 'luxury'
};

const diningPrompt = await optimizePromptWithLLM('dining', context);
```

**LLM 輸出：**
```
An exquisite kaiseki-style Japanese seafood feast from Hokkaido, beautifully arranged on traditional ceramic plates and lacquerware, featuring glistening fresh uni (sea urchin), vibrant ikura (salmon roe), succulent king crab legs, premium sashimi slices of toro and salmon, delicate tempura, presented with artistic precision and seasonal garnishes, shot from a 45-degree overhead angle, soft diffused natural lighting highlighting the textures and colors, shallow depth of field with sharp focus on the main dish, professional food photography, ultra-high resolution, magazine editorial style, warm color palette emphasizing the freshness and luxury of the ingredients
```

## 五、品質控制與驗證

### 5.1 Prompt 品質檢查

```typescript
/**
 * 檢查 Prompt 品質
 */
function validatePromptQuality(prompt: string): {
  isValid: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 100;
  
  // 檢查長度
  const wordCount = prompt.split(' ').length;
  if (wordCount < 30) {
    issues.push('Prompt 太短，缺乏細節');
    score -= 20;
  } else if (wordCount > 200) {
    issues.push('Prompt 太長，可能影響生成效果');
    score -= 10;
  }
  
  // 檢查是否包含品質關鍵字
  const qualityKeywords = [
    'professional', 'high quality', '8K', '4K', 'ultra-high resolution',
    'cinematic', 'photography', 'sharp focus', 'detailed'
  ];
  const hasQualityKeyword = qualityKeywords.some(keyword => 
    prompt.toLowerCase().includes(keyword.toLowerCase())
  );
  if (!hasQualityKeyword) {
    issues.push('缺少品質關鍵字');
    score -= 15;
  }
  
  // 檢查是否包含光線描述
  const lightingKeywords = [
    'lighting', 'golden hour', 'blue hour', 'natural light',
    'soft light', 'dramatic lighting', 'sunlight', 'twilight'
  ];
  const hasLightingKeyword = lightingKeywords.some(keyword => 
    prompt.toLowerCase().includes(keyword.toLowerCase())
  );
  if (!hasLightingKeyword) {
    issues.push('缺少光線描述');
    score -= 10;
  }
  
  // 檢查是否包含負面詞彙
  const negativeWords = ['no', 'not', 'without', 'avoid', 'exclude'];
  const hasNegativeWord = negativeWords.some(word => 
    prompt.toLowerCase().includes(` ${word} `)
  );
  if (hasNegativeWord) {
    issues.push('包含負面詞彙，可能影響生成效果');
    score -= 15;
  }
  
  // 檢查是否包含地點資訊
  if (!prompt.toLowerCase().includes('japan') && 
      !prompt.toLowerCase().includes('tokyo') &&
      !prompt.toLowerCase().includes('hokkaido')) {
    issues.push('缺少具體地點資訊');
    score -= 10;
  }
  
  return {
    isValid: score >= 60,
    score,
    issues
  };
}

/**
 * 帶驗證的 Prompt 優化
 */
async function optimizePromptWithValidation(
  imageType: 'hero' | 'highlight' | 'itinerary' | 'accommodation' | 'dining',
  context: {
    title: string;
    description: string;
    destination: string;
    country: string;
    category?: string;
    season?: string;
    tourStyle?: string;
  }
): Promise<string> {
  const optimizedPrompt = await optimizePromptWithLLM(imageType, context);
  
  // 驗證品質
  const validation = validatePromptQuality(optimizedPrompt);
  
  console.log(`[Prompt 品質] 分數: ${validation.score}/100`);
  if (validation.issues.length > 0) {
    console.log(`[Prompt 問題] ${validation.issues.join(', ')}`);
  }
  
  // 如果品質不佳，重新生成
  if (!validation.isValid) {
    console.log('[Prompt 品質不佳] 重新生成...');
    return await optimizePromptWithLLM(imageType, {
      ...context,
      description: context.description + '\n\n請特別注意：生成的 Prompt 必須包含具體的地點、光線描述和品質關鍵字。'
    });
  }
  
  return optimizedPrompt;
}
```

### 5.2 A/B 測試

```typescript
/**
 * 生成多個 Prompt 變體進行 A/B 測試
 */
async function generatePromptVariants(
  imageType: 'hero' | 'highlight' | 'itinerary' | 'accommodation' | 'dining',
  context: {
    title: string;
    description: string;
    destination: string;
    country: string;
    category?: string;
    season?: string;
    tourStyle?: string;
  },
  variantCount: number = 3
): Promise<string[]> {
  const variants: string[] = [];
  
  for (let i = 0; i < variantCount; i++) {
    const variantContext = {
      ...context,
      description: context.description + `\n\n變體 ${i + 1}：請從不同的視角或風格生成 Prompt。`
    };
    
    const prompt = await optimizePromptWithLLM(imageType, variantContext);
    variants.push(prompt);
    
    // 添加延遲
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return variants;
}
```

## 六、整合到行程生成流程

### 6.1 完整的圖片生成流程（帶 LLM 優化）

```typescript
/**
 * 為行程生成所有圖片（使用 LLM 優化 Prompt）
 */
async function generateTourImagesWithOptimizedPrompts(tour: Tour): Promise<{
  heroImage: string;
  highlightImages: string[];
  itineraryImages: string[][];
}> {
  const tourId = tour.id;
  const basePath = `tours/${tourId}`;
  
  // 提取行程風格
  const tourStyle = detectTourStyle(tour);
  const season = detectSeason(tour);
  
  // 1. 生成並優化 Hero 圖片 Prompt
  console.log(`[行程 ${tourId}] 優化 Hero 圖片 Prompt...`);
  const heroPrompt = await optimizePromptWithValidation('hero', {
    title: tour.title,
    description: tour.description,
    destination: tour.destinationCity,
    country: tour.destinationCountry,
    category: tour.category,
    season,
    tourStyle
  });
  console.log(`[Hero Prompt] ${heroPrompt}`);
  
  const heroImage = await generateAndUploadImage(
    heroPrompt,
    `${basePath}/hero-${Date.now()}.jpg`
  );
  
  // 2. 生成並優化行程亮點圖片 Prompt
  console.log(`[行程 ${tourId}] 優化行程亮點圖片 Prompt...`);
  const highlights = JSON.parse(tour.highlights) as TourHighlight[];
  const highlightPrompts = await batchOptimizePrompts(
    highlights.map(h => ({
      imageType: 'highlight' as const,
      context: {
        title: h.title,
        description: h.description,
        destination: tour.destinationCity,
        country: tour.destinationCountry,
        tourStyle
      }
    }))
  );
  
  const highlightImages = await batchGenerateAndUploadImages(
    highlightPrompts,
    `${basePath}/highlights`
  );
  
  // 3. 生成並優化每日行程圖片 Prompt
  console.log(`[行程 ${tourId}] 優化每日行程圖片 Prompt...`);
  const dailyItinerary = JSON.parse(tour.dailyItinerary) as DailyItinerary[];
  const itineraryImages: string[][] = [];
  
  for (let i = 0; i < dailyItinerary.length; i++) {
    const day = dailyItinerary[i];
    const dayPrompts = await batchOptimizePrompts(
      [day.title, ...extractAttractions(day.description).slice(0, 2)].map(
        title => ({
          imageType: 'itinerary' as const,
          context: {
            title,
            description: day.description,
            destination: tour.destinationCity,
            country: tour.destinationCountry,
            tourStyle
          }
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

/**
 * 偵測行程風格
 */
function detectTourStyle(tour: Tour): 'luxury' | 'adventure' | 'cultural' | 'family' {
  const title = tour.title.toLowerCase();
  const description = tour.description.toLowerCase();
  const text = `${title} ${description}`;
  
  if (text.includes('豪華') || text.includes('奢華') || text.includes('米其林') || text.includes('五星')) {
    return 'luxury';
  } else if (text.includes('探險') || text.includes('登山') || text.includes('戶外')) {
    return 'adventure';
  } else if (text.includes('文化') || text.includes('歷史') || text.includes('藝術')) {
    return 'cultural';
  } else if (text.includes('親子') || text.includes('家庭')) {
    return 'family';
  }
  
  return 'luxury'; // 預設
}

/**
 * 偵測季節
 */
function detectSeason(tour: Tour): string {
  const month = tour.startDate ? new Date(tour.startDate).getMonth() + 1 : 0;
  
  if (month >= 3 && month <= 5) return '春季';
  if (month >= 6 && month <= 8) return '夏季';
  if (month >= 9 && month <= 11) return '秋季';
  if (month === 12 || month === 1 || month === 2) return '冬季';
  
  return ''; // 未知
}
```

## 七、總結

使用 LLM 優化圖片生成 Prompt 的完整流程：

1. **設計 System Prompt**：定義 LLM 的角色和專業知識
2. **生成 User Prompt**：提供具體的行程資訊和要求
3. **調用 LLM**：使用 `invokeLLM()` 生成優化後的 Prompt
4. **品質驗證**：檢查 Prompt 長度、關鍵字、負面詞彙等
5. **快取機制**：避免重複調用 LLM
6. **批次處理**：一次優化多個 Prompt
7. **整合生成**：將優化後的 Prompt 用於圖片生成

這套流程確保了生成圖片的高品質和一致性。
