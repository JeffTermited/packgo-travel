# 詩意化標題生成 Prompt 策略

## 目標

生成類似 Sipincollection 風格的詩意化標題,例如:
- ❌ **一般標題**: "北海道 6 日遊"
- ✅ **詩意化標題**: "北海道二世谷**雅奢**6日"
- ✅ **詩意化標題**: "**秘境**尋蹤 中島漫遊"
- ✅ **詩意化標題**: "**光影**之城 走進藝術家眼中的旅程"

## 詩意化標題的特徵

### 1. 使用形容詞修飾
- **雅奢** (奢華、優雅)
- **秘境** (神秘、隱藏的景點)
- **光影** (藝術、視覺美感)
- **心靈** (精神層面的體驗)
- **極致** (最高級的體驗)

### 2. 使用動詞增加動感
- **尋蹤** (探索)
- **漫遊** (悠閒地遊覽)
- **走進** (沉浸式體驗)
- **探索** (發現新事物)
- **品味** (細細體驗)

### 3. 使用比喻和意象
- "走進藝術家眼中的旅程" (比喻)
- "心靈的洗禮之旅" (意象)
- "雪白世界的童話" (比喻)

### 4. 保持簡潔
- 15-25 個中文字
- 避免過長的描述
- 突出核心賣點

## Prompt 設計

### System Prompt

```
你是一位資深的高端旅遊文案編輯,專門為頂級旅遊品牌撰寫詩意化的行程標題。

你的標題風格特點:
1. 使用精煉的形容詞修飾目的地或體驗 (例如: 雅奢、秘境、光影、極致)
2. 加入動詞增加動感 (例如: 尋蹤、漫遊、走進、探索)
3. 使用比喻和意象,讓標題更有畫面感
4. 保持簡潔,15-25 個中文字
5. 突出行程的核心賣點和獨特性

參考範例:
- "北海道二世谷雅奢6日" (強調奢華體驗)
- "秘境尋蹤 中島漫遊" (強調神秘探索)
- "光影之城 走進藝術家眼中的旅程" (強調藝術體驗)
- "京都禪意之旅 米其林懷石料理" (強調文化與美食)
- "托斯卡尼艷陽下 品味義式慢活" (強調生活方式)

請根據行程資訊,生成一個符合上述風格的詩意化標題。
```

### User Prompt Template

```typescript
const userPrompt = `請根據以下資訊生成一個詩意化的行程標題:

目的地國家: ${destinationCountry}
目的地城市: ${destinationCity}
天數: ${days}天${nights}夜
行程亮點: ${highlights.slice(0, 3).join("、")}
飯店等級: ${hotelGrade}
特色體驗: ${specialExperiences.join("、")}

範例風格:
- "北海道二世谷雅奢6日" (強調奢華)
- "秘境尋蹤 中島漫遊" (強調探索)
- "光影之城 走進藝術家眼中的旅程" (強調藝術)

請生成一個 15-25 個中文字的詩意化標題。`;
```

## JSON Schema 輸出格式

使用 LLM 的 `response_format` 參數,確保輸出格式正確:

```typescript
const response = await invokeLLM({
  messages: [
    { role: "system", content: POETIC_TITLE_SYSTEM_PROMPT },
    { role: "user", content: userPrompt }
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "poetic_title_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          poeticTitle: {
            type: "string",
            description: "詩意化的行程標題,15-25 個中文字"
          },
          reasoning: {
            type: "string",
            description: "標題設計的理由,說明為什麼選擇這個標題"
          },
          keywords: {
            type: "array",
            description: "標題中使用的關鍵詞",
            items: {
              type: "string"
            }
          }
        },
        required: ["poeticTitle", "reasoning", "keywords"],
        additionalProperties: false
      }
    }
  }
});

// 解析回應
const result = JSON.parse(response.choices[0].message.content);
const poeticTitle = result.poeticTitle;
```

## 實作範例

### 輸入資料

```json
{
  "destinationCountry": "日本",
  "destinationCity": "北海道",
  "days": 6,
  "nights": 5,
  "highlights": [
    "入住米其林一星鑰旅宿",
    "洞爺湖心中島探索",
    "二世谷滑雪體驗"
  ],
  "hotelGrade": "五星級",
  "specialExperiences": [
    "米其林溫泉旅宿",
    "私人遊船",
    "粉雪滑雪"
  ]
}
```

### 預期輸出

```json
{
  "poeticTitle": "北海道二世谷雅奢6日｜米其林溫泉旅宿 × 洞爺湖心中島探索",
  "reasoning": "使用「雅奢」強調高端奢華體驗,搭配「米其林溫泉旅宿」和「洞爺湖心中島探索」突出核心賣點,符合 Sipincollection 的詩意風格",
  "keywords": ["雅奢", "米其林", "溫泉旅宿", "洞爺湖", "心中島"]
}
```

## 錯誤處理

### 標題長度驗證

```typescript
if (poeticTitle.length < 15 || poeticTitle.length > 25) {
  console.warn(`[ContentAnalyzerAgent] Poetic title length invalid: ${poeticTitle.length} chars`);
  
  // 如果太長,截斷
  if (poeticTitle.length > 25) {
    poeticTitle = poeticTitle.substring(0, 25);
  }
  
  // 如果太短,使用 fallback
  if (poeticTitle.length < 15) {
    poeticTitle = `${destinationCity}${days}日精選之旅`;
  }
}
```

### Fallback 策略

如果 LLM 生成失敗,使用以下 fallback 策略:

1. **第一層 Fallback**: 使用簡化版 Prompt 重試
2. **第二層 Fallback**: 使用模板生成
   - `${destinationCity} ${specialKeyword} ${days}日`
   - 例如: "北海道雅奢6日"
3. **最終 Fallback**: 使用原始標題

## 測試案例

### 案例 1: 北海道行程

**輸入**:
- 目的地: 北海道
- 天數: 6天5夜
- 亮點: 米其林旅宿、洞爺湖、二世谷滑雪

**預期輸出**:
- "北海道二世谷雅奢6日｜米其林溫泉旅宿 × 洞爺湖心中島探索"

### 案例 2: 京都行程

**輸入**:
- 目的地: 京都
- 天數: 5天4夜
- 亮點: 禪寺、懷石料理、茶道體驗

**預期輸出**:
- "京都禪意之旅 5日｜米其林懷石料理 × 千年古寺巡禮"

### 案例 3: 義大利行程

**輸入**:
- 目的地: 托斯卡尼
- 天數: 8天7夜
- 亮點: 酒莊、藝術博物館、美食

**預期輸出**:
- "托斯卡尼艷陽下 8日｜品味義式慢活 × 酒莊美食之旅"

## 成功指標

1. **詩意度**: 標題是否使用了形容詞、動詞、比喻等詩意元素
2. **簡潔度**: 標題長度是否在 15-25 個中文字之間
3. **吸引力**: 標題是否能吸引目標客群
4. **準確度**: 標題是否準確反映行程內容
5. **一致性**: 不同行程的標題風格是否一致

## 注意事項

1. **避免過度誇張**: 標題要詩意但不能誇大不實
2. **保持真實性**: 標題要反映行程的真實內容
3. **考慮 SEO**: 標題要包含目的地和關鍵詞
4. **文化適應**: 不同目的地使用不同的詩意風格
   - 日本: 禪意、雅致、極致
   - 歐洲: 藝術、浪漫、慢活
   - 東南亞: 秘境、探索、度假
