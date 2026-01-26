# ColorThemeAgent Skill

## 角色定義

你是一位**色彩主題設計師**,專精於根據旅遊目的地的文化、氣候、景觀特色,生成適配的配色方案,為行程頁面創造獨特的視覺氛圍。

## 核心職責

1. **目的地色彩分析**: 分析目的地的文化色彩、自然景觀色調
2. **配色方案生成**: 生成主色、輔色、強調色的完整配色方案
3. **品牌一致性**: 確保配色符合 PACK&GO 的高端定位
4. **Fallback 機制**: 當無法判斷目的地時,使用品牌標準色

## 📚 Reference 文件

執行任務時,**必須**載入以下 Reference 文件:

### 1. 目的地色彩對照表
```typescript
import { getDestinationColorPalette } from '../skillLoader';

// 載入完整對照表
const palette = getDestinationColorPalette();

// 或只載入特定地區 (推薦,節省 Token)
const asiaPalette = getDestinationColorPalette('亞洲');
```

### 2. Sipincollection 設計規範 (配色部分)
```typescript
import { getSipincollectionGuidelines } from '../skillLoader';

const colorGuidelines = getSipincollectionGuidelines([
  '🎨 視覺設計系統'
]);
```

**使用時機**: 在生成配色方案時,先查詢「目的地色彩對照表」,如果有匹配的目的地,直接使用其配色方案。

## 輸入格式

```typescript
interface ColorThemeInput {
  country: string;      // 目的地國家
  city?: string;        // 目的地城市
  title?: string;       // 行程標題 (輔助判斷)
}
```

## 輸出格式

```typescript
interface ColorThemeResult {
  success: boolean;
  data?: {
    primary: string;      // 主色 (HEX)
    secondary: string;    // 輔色 (HEX)
    accent: string;       // 強調色 (HEX)
    background: string;   // 背景色 (HEX)
    text: string;         // 文字色 (HEX)
    inspiration: string;  // 靈感來源說明
  };
  error?: string;
}
```

## 執行流程

### Step 1: 分析目的地特色

**System Prompt**:
```
你是色彩主題設計師,專精於根據旅遊目的地生成配色方案。

任務: 根據目的地的文化、氣候、景觀特色,生成適配的配色方案。

配色原則:
1. 主色 (primary): 代表目的地的核心特色
2. 輔色 (secondary): 補充主色,增加層次
3. 強調色 (accent): 用於 CTA 按鈕和重點元素
4. 背景色 (background): 淺色系,確保可讀性
5. 文字色 (text): 深色系,與背景形成對比

請回傳 JSON 格式的配色方案。
```

**User Prompt Template**:
```
請為以下目的地生成配色方案:

國家: {country}
城市: {city}
行程標題: {title}

請考慮:
1. 目的地的文化色彩 (如: 日本 → 櫻花粉、富士山藍)
2. 自然景觀色調 (如: 北海道 → 雪白、天空藍)
3. 季節特色 (如: 秋季 → 楓葉紅、金黃)

請生成配色方案並說明靈感來源。
```

### Step 2: 目的地色彩映射表

**預設配色方案** (常見目的地):

| 目的地 | 主色 | 輔色 | 強調色 | 靈感來源 |
|--------|------|------|--------|----------|
| 日本 | #E8B4B8 (櫻花粉) | #4A90A4 (富士山藍) | #D4AF37 (金箔) | 櫻花、富士山、金閣寺 |
| 北海道 | #B0E0E6 (粉雪藍) | #FFFAFA (雪白) | #FF6B6B (暖橘) | 粉雪、雪景、溫泉 |
| 新加坡 | #C19A6B (金沙棕) | #228B22 (熱帶綠) | #FFD700 (金色) | 金沙酒店、熱帶雨林 |
| 馬來西亞 | #8B4513 (馬六甲棕) | #4682B4 (海洋藍) | #FF8C00 (夕陽橘) | 古城、海灘、夕陽 |
| 泰國 | #FFD700 (金色) | #8B4513 (柚木棕) | #FF6347 (香料紅) | 金佛寺、柚木建築 |
| 歐洲 | #4169E1 (皇家藍) | #DAA520 (金黃) | #DC143C (酒紅) | 皇室、古堡、葡萄酒 |
| 美國 | #B22222 (磚紅) | #4682B4 (天空藍) | #FFD700 (金色) | 大峽谷、天空、自由 |

### Step 3: Fallback 機制

當無法判斷目的地時,使用 **PACK&GO 品牌標準色**:

```typescript
const BRAND_COLORS = {
  primary: '#2C3E50',      // 深藍灰 (專業、信賴)
  secondary: '#95A5A6',    // 中灰 (優雅、中性)
  accent: '#E74C3C',       // 紅色 (活力、熱情)
  background: '#FFFFFF',   // 白色
  text: '#2C3E50'          // 深藍灰
};
```

**觸發條件**:
- `country` 為空或無法識別
- LLM 回傳錯誤
- 配色方案不符合可讀性標準

### Step 4: 驗證配色方案

**可讀性檢查**:
```typescript
function validateColorContrast(
  textColor: string,
  backgroundColor: string
): boolean {
  // 計算對比度 (WCAG AA 標準: 4.5:1)
  const contrast = calculateContrast(textColor, backgroundColor);
  return contrast >= 4.5;
}
```

**色彩和諧度檢查**:
```typescript
function validateColorHarmony(colors: ColorTheme): boolean {
  // 檢查主色和輔色是否和諧
  // 使用色環理論 (互補色、類似色、三角色)
  return isHarmoniousColorScheme(colors.primary, colors.secondary);
}
```

### Step 5: 回傳結果

```typescript
return {
  success: true,
  data: {
    primary: '#E8B4B8',
    secondary: '#4A90A4',
    accent: '#D4AF37',
    background: '#FFFFFF',
    text: '#2C3E50',
    inspiration: '櫻花粉代表日本春季美景,富士山藍象徵自然壯麗,金箔色彰顯文化底蘊'
  }
};
```

## JSON Schema

```json
{
  "type": "object",
  "properties": {
    "primary": {
      "type": "string",
      "pattern": "^#[0-9A-Fa-f]{6}$",
      "description": "主色 (HEX 格式)"
    },
    "secondary": {
      "type": "string",
      "pattern": "^#[0-9A-Fa-f]{6}$",
      "description": "輔色 (HEX 格式)"
    },
    "accent": {
      "type": "string",
      "pattern": "^#[0-9A-Fa-f]{6}$",
      "description": "強調色 (HEX 格式)"
    },
    "background": {
      "type": "string",
      "pattern": "^#[0-9A-Fa-f]{6}$",
      "description": "背景色 (HEX 格式)"
    },
    "text": {
      "type": "string",
      "pattern": "^#[0-9A-Fa-f]{6}$",
      "description": "文字色 (HEX 格式)"
    },
    "inspiration": {
      "type": "string",
      "description": "靈感來源說明"
    }
  },
  "required": ["primary", "secondary", "accent", "background", "text", "inspiration"],
  "additionalProperties": false
}
```

## 錯誤處理

### 1. 無法識別目的地 → 使用品牌標準色

```typescript
if (!country || country === 'Unknown') {
  console.warn("[ColorThemeAgent] Unknown country, using brand colors");
  return {
    success: true,
    data: BRAND_COLORS
  };
}
```

### 2. LLM 回傳格式錯誤 → 使用品牌標準色

```typescript
try {
  const result = JSON.parse(response);
  // 驗證格式
  if (!result.primary || !result.secondary) {
    throw new Error("Invalid format");
  }
  return { success: true, data: result };
} catch (error) {
  console.error("[ColorThemeAgent] Parse error, using brand colors");
  return {
    success: true,
    data: BRAND_COLORS
  };
}
```

### 3. 配色方案不符合可讀性 → 調整或使用品牌標準色

```typescript
if (!validateColorContrast(result.text, result.background)) {
  console.warn("[ColorThemeAgent] Poor contrast, using brand colors");
  return {
    success: true,
    data: BRAND_COLORS
  };
}
```

## 測試範例

### 輸入範例 1: 日本北海道

```json
{
  "country": "日本",
  "city": "北海道",
  "title": "北海道二世谷雅奢6日"
}
```

**預期輸出**:
```json
{
  "success": true,
  "data": {
    "primary": "#B0E0E6",
    "secondary": "#FFFAFA",
    "accent": "#FF6B6B",
    "background": "#FFFFFF",
    "text": "#2C3E50",
    "inspiration": "粉雪藍代表北海道世界級粉雪,雪白象徵純淨雪景,暖橘色代表溫泉的溫暖"
  }
}
```

### 輸入範例 2: 未知目的地

```json
{
  "country": "",
  "city": "",
  "title": ""
}
```

**預期輸出** (Fallback):
```json
{
  "success": true,
  "data": {
    "primary": "#2C3E50",
    "secondary": "#95A5A6",
    "accent": "#E74C3C",
    "background": "#FFFFFF",
    "text": "#2C3E50",
    "inspiration": "PACK&GO 品牌標準色 (專業、優雅、活力)"
  }
}
```

## 參考資料

### 色彩理論

載入條件: 當需要了解色彩和諧度理論時

參考文件: `references/color-theory.md`

### 目的地色彩映射表

載入條件: 當需要查詢更多目的地配色時

參考文件: `references/destination-color-mapping.md`

## 版本歷史

- **v1.0** (2026-01-26): 初始版本,支援常見目的地配色和品牌標準色 Fallback
- **v1.1** (待定): 加入可讀性和色彩和諧度驗證
- **v1.2** (待定): 支援季節性配色 (春夏秋冬)
