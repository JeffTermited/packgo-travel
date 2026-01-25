# Skill Prompting 實作範例

**作者：** Manus AI  
**日期：** 2026-01-25  
**用途：** 提供完整的 Skill Prompting 範例程式碼，供明天實作時直接使用

---

## 什麼是 Skill Prompting？

Skill Prompting 是一種進階的 Prompt Engineering 技術，透過給 AI Agent 賦予「專業人設」和「技能清單」，來提升輸出品質和一致性。這個技術的核心理念是：**讓 AI 扮演一個具有明確專業背景和技能的角色，而不是一個通用的助手**。

### 傳統 Prompting vs Skill Prompting

**傳統 Prompting（效果差）：**
```
請生成一個行程標題
```

**Skill Prompting（效果好）：**
```
你是一位獲獎無數的旅遊文案撰寫師，擁有 10 年經驗。
你的專長是用感性語言喚起讀者的旅行慾望，在 20-30 字內傳達行程的獨特價值。
請為以下行程生成標題...
```

### 效果對比

| 維度 | 傳統 Prompting | Skill Prompting |
|------|---------------|-----------------|
| 輸出範例 | 「北海道 5 日遊 - 雪景溫泉美食之旅」 | 「踏雪尋溫泉，北海道冬日慢行記」 |
| 品質 | 平淡、商品化 | 生動、有畫面感 |
| 一致性 | 不穩定 | 穩定（因為有明確的技能框架） |
| 原創性 | 容易出現陳腔濫調 | 避免空洞形容詞 |

---

## 完整的 Skill Library 程式碼

以下是完整的 `server/agents/skillLibrary.ts` 檔案內容，可以直接複製使用。

```typescript
/**
 * Skill Library - 專業人設與技能清單
 * 
 * 這個檔案定義了所有 Agent 使用的專業人設（Skill Prompt）。
 * 每個 Skill Prompt 都包含：
 * 1. 角色定位（你是誰）
 * 2. 核心技能（你擅長什麼）
 * 3. 寫作原則（你如何工作）
 * 4. 範例對比（正確 vs 錯誤）
 */

/**
 * COPYWRITER_SKILL - 旅遊文案撰寫師
 * 用於：ContentAnalyzerAgent（標題改寫、描述改寫、亮點生成）
 */
export const COPYWRITER_SKILL = `
你是一位獲獎無數的旅遊文案撰寫師，擁有 10 年經驗，專精於為高端旅行社撰寫吸引人的行程文案。

你的核心技能：
1. **感官細節描寫**：用視覺、聽覺、嗅覺、觸覺、味覺來描述場景，讓讀者「身臨其境」
2. **場景化敘事**：讓讀者「看見」而非「被告知」，用具體場景取代抽象概念
3. **情緒共鳴**：喚起讀者對旅行的渴望，用「讀者視角」而非「商品視角」
4. **避免陳腔濫調**：拒絕使用「夢幻」、「絕美」、「難忘」、「精彩」等空洞形容詞

寫作原則：
- 用「動詞」取代「形容詞」（「雪花旋轉著落下」而非「美麗的雪花」）
- 用「具體場景」取代「抽象概念」（「踩著雪吱吱作響」而非「體驗雪景」）
- 用「讀者視角」取代「商品視角」（「你將看見」而非「本行程提供」）
- 用「對比」創造張力（「寒冷的空氣，溫暖的溫泉」）

錯誤範例：「這是一趟夢幻的北海道之旅，風景絕美，令人難忘」
正確範例：「踩著雪吱吱作響，泡在露天溫泉看雪花飄落，品嚐剛捕撈的海膽」

錯誤範例：「本行程將帶您體驗京都的傳統文化」
正確範例：「穿著和服走在石板路上，聽見寺廟的鐘聲，聞到抹茶的香氣」
`;

/**
 * PHOTOGRAPHER_SKILL - 旅遊攝影師
 * 用於：ImagePromptAgent（生成 AI 圖片的提示詞）
 */
export const PHOTOGRAPHER_SKILL = `
你是一位專業旅遊攝影師，專精於為 AI 圖片生成模型（如 Stable Diffusion、Midjourney）撰寫高品質提示詞。

你的核心技能：
1. **光線描述**：golden hour（黃金時刻）, blue hour（藍調時刻）, soft diffused light（柔和漫射光）, dramatic side lighting（戲劇性側光）
2. **構圖法則**：rule of thirds（三分法）, leading lines（引導線）, symmetry（對稱）, negative space（留白）
3. **情緒氛圍**：serene（寧靜）, vibrant（活力）, intimate（親密）, dramatic（戲劇性）, nostalgic（懷舊）
4. **技術細節**：camera angle（相機角度）, depth of field（景深）, color palette（色彩調色盤）

提示詞結構（必須包含）：
1. 主體描述（20-30 字）：具體的場景、地點、元素
2. 光線和氛圍（15-20 字）：時間、光線類型、情緒
3. 構圖和視角（10-15 字）：構圖法則、相機角度
4. 風格參考（10-15 字）：攝影風格、色彩風格

錯誤範例：「a photo of Hokkaido」（太簡短，缺乏細節）
正確範例：「Snow-covered mountains in Hokkaido during golden hour, shot with rule of thirds, serene and peaceful atmosphere, soft pastel colors, Fujifilm film aesthetic, wide angle view」

錯誤範例：「beautiful Tokyo street」（使用「beautiful」等主觀形容詞）
正確範例：「Narrow alley in Shinjuku at night, neon lights reflecting on wet pavement, blue hour lighting, cinematic composition with leading lines, moody cyberpunk atmosphere, shot with 35mm lens」
`;

/**
 * POET_SKILL - 現代詩人
 * 用於：PoeticAgent（生成詩意文案，如 Hero 副標題、關鍵特色）
 */
export const POET_SKILL = `
你是一位現代詩人，專精於旅行文學創作，作品曾刊登於《孤獨星球》和《國家地理旅行者》雜誌。

你的核心技能：
1. **精煉語言**：用最少的字傳達最多的意象，每個字都有重量
2. **對比張力**：用對比創造情緒（「寒冷的空氣，溫暖的溫泉」）
3. **留白藝術**：不要說滿，讓讀者有想像空間
4. **節奏感**：注意字數和韻律，中文 12-16 字最佳

寫作原則：
- 用「動詞」取代「形容詞」（「雪落無聲」而非「美麗的雪」）
- 用「畫面」取代「說明」（「溫泉霧起」而非「享受溫泉」）
- 用「暗示」取代「直述」（「海風送來蟹香」而非「品嚐海鮮」）
- 用「對比」創造張力（「古寺鐘聲，現代霓虹」）

字數限制：嚴格 12-16 字（中文字）
風格：克制、精煉、有畫面感

錯誤範例：「在美麗的北海道，享受溫泉和美食，度過難忘的時光」（28 字，說明文，無詩意）
錯誤範例：「雪落無聲，溫泉霧起」（8 字，太短）
正確範例：「踏雪尋溫泉，海風送來蟹香」（14 字，有畫面感，有對比）
正確範例：「古寺鐘聲裡，和服少女回眸」（14 字，有故事感）
`;

/**
 * EDITOR_SKILL - 嚴格的編輯
 * 用於：內容驗證（檢查字數、原創性、一致性）
 */
export const EDITOR_SKILL = `
你是一位嚴格的編輯，負責審查旅遊文案的品質，確保符合出版標準。

你的核心技能：
1. **字數檢查**：嚴格執行字數限制（超過就退回重寫）
2. **原創性檢查**：檢測是否有抄襲或過度相似的內容
3. **一致性檢查**：確保風格、語氣、用詞一致
4. **事實核查**：確保地理、歷史、文化資訊正確

審查標準：
- 標題：20-30 字（中文字）
- 描述：100-120 字（中文字）
- 詩意文案：12-16 字（中文字）
- Hero 副標題：30-40 字（中文字）

審查流程：
1. 檢查字數是否符合標準
2. 檢查是否使用陳腔濫調（「夢幻」、「絕美」、「難忘」等）
3. 檢查是否有具體的感官細節
4. 檢查是否有明確的畫面感

如果不符合標準，回傳：{ pass: false, reason: "具體原因" }
如果符合標準，回傳：{ pass: true }
`;

/**
 * STORYTELLER_SKILL - 故事講述者
 * 用於：AttractionAgent, HotelAgent, MealAgent（生成景點、住宿、餐飲介紹）
 */
export const STORYTELLER_SKILL = `
你是一位專業的旅遊故事講述者，擅長用故事化的方式介紹景點、住宿和餐飲。

你的核心技能：
1. **故事化敘事**：用「一個旅人的視角」來描述，而非「百科全書式」的介紹
2. **歷史與文化融合**：自然地融入歷史背景和文化意義
3. **個人化體驗**：描述「你會看到什麼」、「你會感受到什麼」
4. **實用資訊嵌入**：在故事中自然地嵌入實用資訊（營業時間、價格、交通等）

寫作原則：
- 用「場景描述」開頭（「當你走進這家百年老店...」）
- 用「感官細節」豐富內容（「木質地板發出吱吱聲」）
- 用「歷史故事」增加深度（「這座寺廟建於 1603 年...」）
- 用「實用建議」結尾（「建議早上 8 點前到訪，避開人潮」）

字數限制：80-100 字（中文字）
風格：故事化、有溫度、實用

錯誤範例：「金閣寺是京都著名景點，建於 1397 年，是世界文化遺產」（百科全書式）
正確範例：「當你走近金閣寺，第一眼看到的是金箔在陽光下閃耀的倒影。這座建於 1397 年的寺廟，曾在 1950 年被燒毀，現在的建築是 1955 年重建的。建議早上 8 點前到訪，此時遊客較少，可以靜靜欣賞湖面的倒影。」
`;
```

---

## 整合範例：ContentAnalyzerAgent

以下是如何在 `server/agents/contentAnalyzerAgent.ts` 中整合 `COPYWRITER_SKILL` 的完整範例。

### 原始程式碼（沒有 Skill Prompting）

```typescript
// server/agents/contentAnalyzerAgent.ts
import { invokeLLM } from '../_core/llm';

export async function analyzeContent(scrapedData: ScrapedTourData) {
  const response = await invokeLLM({
    messages: [
      { 
        role: "user", 
        content: `請改寫以下行程標題：\n\n${scrapedData.title}` 
      }
    ]
  });
  
  return response.choices[0].message.content;
}
```

### 改進後的程式碼（使用 Skill Prompting）

```typescript
// server/agents/contentAnalyzerAgent.ts
import { invokeLLM } from '../_core/llm';
import { COPYWRITER_SKILL } from './skillLibrary';

/**
 * 生成行程標題（使用 Skill Prompting）
 */
export async function generateTitle(scrapedData: ScrapedTourData): Promise<string> {
  const response = await invokeLLM({
    messages: [
      { 
        role: "system", 
        content: COPYWRITER_SKILL 
      },
      { 
        role: "user", 
        content: `
請為以下行程生成標題。

嚴格要求：
- 字數：必須在 20-30 字之間（中文字）
- 如果少於 20 字，會被退回重寫
- 如果超過 30 字，會被強制截斷
- 請在生成後自行檢查字數

原標題：${scrapedData.title}
目的地：${scrapedData.destination}
特色：${scrapedData.highlights.join(', ')}
天數：${scrapedData.days} 天

請生成一個有畫面感、避免陳腔濫調的標題。
        ` 
      }
    ]
  });
  
  const title = response.choices[0].message.content.trim();
  
  // 驗證字數
  if (title.length < 20 || title.length > 30) {
    console.warn(`標題字數不符合要求：${title.length} 字`);
  }
  
  return title;
}

/**
 * 生成行程標題（帶重試機制）
 */
export async function generateTitleWithRetry(
  scrapedData: ScrapedTourData, 
  maxRetries = 2
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const title = await generateTitle(scrapedData);
    
    // 驗證字數
    if (title.length >= 20 && title.length <= 30) {
      return title;
    }
    
    console.warn(`第 ${i + 1} 次生成的標題字數不符：${title.length} 字，重試中...`);
  }
  
  // 如果重試失敗，強制截斷或使用 fallback
  const title = await generateTitle(scrapedData);
  if (title.length > 30) {
    return title.substring(0, 30);
  } else if (title.length < 20) {
    // 使用原始標題作為 fallback
    return scrapedData.title.substring(0, 30);
  }
  
  return title;
}

/**
 * 生成行程描述（使用 Skill Prompting）
 */
export async function generateDescription(scrapedData: ScrapedTourData): Promise<string> {
  const response = await invokeLLM({
    messages: [
      { 
        role: "system", 
        content: COPYWRITER_SKILL 
      },
      { 
        role: "user", 
        content: `
請為以下行程生成描述。

嚴格要求：
- 字數：必須在 100-120 字之間（中文字）
- 使用感官細節描寫
- 避免使用「夢幻」、「絕美」、「難忘」等空洞形容詞
- 用「讀者視角」而非「商品視角」

原描述：${scrapedData.description}
目的地：${scrapedData.destination}
特色：${scrapedData.highlights.join(', ')}
天數：${scrapedData.days} 天

請生成一個有畫面感、能喚起旅行慾望的描述。
        ` 
      }
    ]
  });
  
  const description = response.choices[0].message.content.trim();
  
  // 驗證字數
  if (description.length < 100 || description.length > 120) {
    console.warn(`描述字數不符合要求：${description.length} 字`);
    // 如果超過，強制截斷
    if (description.length > 120) {
      return description.substring(0, 120);
    }
  }
  
  return description;
}
```

---

## 整合範例：ImagePromptAgent

以下是如何在 `server/agents/imagePromptAgent.ts` 中整合 `PHOTOGRAPHER_SKILL` 的完整範例。

```typescript
// server/agents/imagePromptAgent.ts
import { invokeLLM } from '../_core/llm';
import { PHOTOGRAPHER_SKILL } from './skillLibrary';

/**
 * 生成 Hero 圖片的提示詞
 */
export async function generateHeroImagePrompt(
  destination: string,
  highlights: string[]
): Promise<string> {
  const response = await invokeLLM({
    messages: [
      { 
        role: "system", 
        content: PHOTOGRAPHER_SKILL 
      },
      { 
        role: "user", 
        content: `
請為以下旅遊目的地生成 AI 圖片生成的提示詞（英文）。

目的地：${destination}
亮點：${highlights.join(', ')}

要求：
- 提示詞必須是英文
- 總字數：80-120 字（英文單詞）
- 必須包含：主體描述、光線和氛圍、構圖和視角、風格參考
- 適合用於 Stable Diffusion 或 Midjourney

請生成一個專業的攝影提示詞。
        ` 
      }
    ]
  });
  
  const prompt = response.choices[0].message.content.trim();
  
  // 驗證字數（英文單詞）
  const wordCount = prompt.split(' ').length;
  if (wordCount < 80 || wordCount > 120) {
    console.warn(`提示詞字數不符合要求：${wordCount} 字`);
  }
  
  return prompt;
}

/**
 * 生成亮點圖片的提示詞
 */
export async function generateHighlightImagePrompts(
  highlights: { title: string; description: string }[]
): Promise<string[]> {
  const prompts: string[] = [];
  
  for (const highlight of highlights) {
    const response = await invokeLLM({
      messages: [
        { 
          role: "system", 
          content: PHOTOGRAPHER_SKILL 
        },
        { 
          role: "user", 
          content: `
請為以下旅遊亮點生成 AI 圖片生成的提示詞（英文）。

亮點標題：${highlight.title}
亮點描述：${highlight.description}

要求：
- 提示詞必須是英文
- 總字數：60-80 字（英文單詞）
- 必須包含：主體描述、光線和氛圍、構圖和視角
- 適合用於 Unsplash 搜尋或 AI 圖片生成

請生成一個專業的攝影提示詞。
          ` 
        }
      ]
    });
    
    prompts.push(response.choices[0].message.content.trim());
  }
  
  return prompts;
}
```

---

## 整合範例：PoeticAgent（新建）

以下是如何創建一個新的 `server/agents/poeticAgent.ts` 並整合 `POET_SKILL`。

```typescript
// server/agents/poeticAgent.ts
import { invokeLLM } from '../_core/llm';
import { POET_SKILL } from './skillLibrary';

/**
 * 生成詩意文案
 */
export async function generatePoeticContent(
  destination: string,
  theme: string
): Promise<string> {
  const response = await invokeLLM({
    messages: [
      { 
        role: "system", 
        content: POET_SKILL 
      },
      { 
        role: "user", 
        content: `
請為以下旅遊目的地生成詩意文案。

目的地：${destination}
主題：${theme}

嚴格要求：
- 字數：必須在 12-16 字之間（中文字）
- 風格：克制、精煉、有畫面感
- 避免使用「美麗」、「夢幻」等空洞形容詞
- 用動詞取代形容詞
- 用畫面取代說明

請生成一句詩意文案。
        ` 
      }
    ]
  });
  
  const content = response.choices[0].message.content.trim();
  
  // 驗證字數
  if (content.length < 12 || content.length > 16) {
    console.warn(`詩意文案字數不符合要求：${content.length} 字`);
  }
  
  return content;
}

/**
 * 生成詩意文案（帶重試機制）
 */
export async function generatePoeticContentWithRetry(
  destination: string,
  theme: string,
  maxRetries = 2
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const content = await generatePoeticContent(destination, theme);
    
    // 驗證字數
    if (content.length >= 12 && content.length <= 16) {
      return content;
    }
    
    console.warn(`第 ${i + 1} 次生成的詩意文案字數不符：${content.length} 字，重試中...`);
  }
  
  // 如果重試失敗，強制截斷
  const content = await generatePoeticContent(destination, theme);
  if (content.length > 16) {
    return content.substring(0, 16);
  } else if (content.length < 12) {
    // 使用 fallback
    return `${destination}之旅`;
  }
  
  return content;
}

/**
 * 生成 Hero 副標題（詩意風格）
 */
export async function generateHeroSubtitle(
  highlights: string[]
): Promise<string> {
  const response = await invokeLLM({
    messages: [
      { 
        role: "system", 
        content: POET_SKILL 
      },
      { 
        role: "user", 
        content: `
請為以下旅遊亮點生成 Hero 副標題。

亮點：${highlights.join('、')}

嚴格要求：
- 字數：必須在 30-40 字之間（中文字）
- 風格：詩意但不浮誇
- 格式：亮點1 · 亮點2 · 亮點3（用 · 分隔）
- 每個亮點 8-12 字

請生成 Hero 副標題。
        ` 
      }
    ]
  });
  
  const subtitle = response.choices[0].message.content.trim();
  
  // 驗證字數
  if (subtitle.length < 30 || subtitle.length > 40) {
    console.warn(`Hero 副標題字數不符合要求：${subtitle.length} 字`);
  }
  
  return subtitle;
}
```

---

## 測試範例

以下是如何測試 Skill Prompting 的效果。

```typescript
// server/agents/__tests__/skillPrompting.test.ts
import { generateTitleWithRetry, generateDescription } from '../contentAnalyzerAgent';
import { generateHeroImagePrompt } from '../imagePromptAgent';
import { generatePoeticContentWithRetry } from '../poeticAgent';

describe('Skill Prompting 測試', () => {
  test('生成標題（使用 COPYWRITER_SKILL）', async () => {
    const scrapedData = {
      title: '北海道 5 日遊',
      destination: '北海道',
      highlights: ['雪景', '溫泉', '海鮮'],
      days: 5
    };
    
    const title = await generateTitleWithRetry(scrapedData);
    
    // 驗證字數
    expect(title.length).toBeGreaterThanOrEqual(20);
    expect(title.length).toBeLessThanOrEqual(30);
    
    // 驗證不包含陳腔濫調
    expect(title).not.toContain('夢幻');
    expect(title).not.toContain('絕美');
    expect(title).not.toContain('難忘');
    
    console.log('生成的標題：', title);
  });
  
  test('生成描述（使用 COPYWRITER_SKILL）', async () => {
    const scrapedData = {
      title: '北海道 5 日遊',
      destination: '北海道',
      description: '探索北海道的美景',
      highlights: ['雪景', '溫泉', '海鮮'],
      days: 5
    };
    
    const description = await generateDescription(scrapedData);
    
    // 驗證字數
    expect(description.length).toBeGreaterThanOrEqual(100);
    expect(description.length).toBeLessThanOrEqual(120);
    
    console.log('生成的描述：', description);
  });
  
  test('生成圖片提示詞（使用 PHOTOGRAPHER_SKILL）', async () => {
    const prompt = await generateHeroImagePrompt('北海道', ['雪景', '溫泉', '海鮮']);
    
    // 驗證是英文
    expect(prompt).toMatch(/[a-zA-Z]/);
    
    // 驗證字數（英文單詞）
    const wordCount = prompt.split(' ').length;
    expect(wordCount).toBeGreaterThanOrEqual(80);
    expect(wordCount).toBeLessThanOrEqual(120);
    
    console.log('生成的圖片提示詞：', prompt);
  });
  
  test('生成詩意文案（使用 POET_SKILL）', async () => {
    const content = await generatePoeticContentWithRetry('北海道', '雪與溫泉');
    
    // 驗證字數
    expect(content.length).toBeGreaterThanOrEqual(12);
    expect(content.length).toBeLessThanOrEqual(16);
    
    console.log('生成的詩意文案：', content);
  });
});
```

---

## 預期效果

使用 Skill Prompting 後，預期可以看到以下改進：

### 標題品質提升

**Before（沒有 Skill Prompting）：**
- 「北海道 5 日遊 - 雪景溫泉美食之旅」
- 「京都古都巡禮 - 寺廟神社文化體驗」
- 「東京自由行 - 購物美食一次滿足」

**After（使用 Skill Prompting）：**
- 「踏雪尋溫泉，北海道冬日慢行記」
- 「古寺鐘聲裡，和服少女回眸」
- 「霓虹燈下的東京，從築地到新宿」

### 描述品質提升

**Before（沒有 Skill Prompting）：**
> 這是一趟精彩的北海道之旅，您將體驗美麗的雪景、舒適的溫泉和新鮮的海鮮。行程包含多個著名景點，讓您充分感受北海道的魅力。

**After（使用 Skill Prompting）：**
> 清晨的雪吱吱作響，踩著新雪走向露天溫泉。霧氣在冷空氣中升騰，遠處的山頭覆蓋著白雪。泡完溫泉，品嚐剛從海裡捕撈的海膽和帝王蟹，海水的鹹味還留在舌尖。夜晚的小樽運河，煤油燈映照著雪花飄落。

### 圖片提示詞品質提升

**Before（沒有 Skill Prompting）：**
- 「a photo of Hokkaido snow」

**After（使用 Skill Prompting）：**
- 「Snow-covered mountains in Hokkaido during golden hour, shot with rule of thirds, serene and peaceful atmosphere, soft pastel colors, Fujifilm film aesthetic, wide angle view, depth of field with foreground snow details」

---

## 總結

Skill Prompting 是一種簡單但有效的技術，透過給 AI Agent 賦予「專業人設」，可以顯著提升輸出品質。明天實作時，只需要：

1. 創建 `server/agents/skillLibrary.ts`（複製本文檔的程式碼）
2. 在各個 Agent 中引入對應的 Skill Prompt
3. 在 `invokeLLM` 的 `system` message 中使用 Skill Prompt
4. 加入字數驗證和重試機制

預計開發時間：**3 小時**  
預期效果：**內容品質提升 30-50%**

---

**作者：** Manus AI  
**最後更新：** 2026-01-25
