# PACK&GO Agent Skills 架構

## 概述

本目錄包含 PACK&GO 旅遊網站的 12 個 AI Agents 的 Skill 文檔,採用 Anthropic 的「漸進式披露」(Progressive Disclosure) 三層架構設計。

## 三層架構

### 1. 元數據層 (Metadata Layer)
- **目的**: 讓模型快速判斷使用哪個 Agent
- **內容**: 輕量級的名稱與描述
- **位置**: 本 README.md 的 Agent 列表

### 2. 指令層 (Instruction Layer)
- **目的**: 提供詳細的執行規則、格式、範例
- **內容**: SKILL.md 文件 (精密的提示詞工程)
- **位置**: 各 Agent 的 SKILL.md 文件

### 3. 資源層 (Resource Layer)
- **目的**: 按需載入參考文件或執行腳本
- **內容**: 
  - **Reference**: 條件式載入參考文件 (如 Sipincollection 設計規範)
  - **Script**: 執行本地腳本 (如圖片處理、資料驗證)
- **位置**: skills/references/ 和 skills/scripts/

## Agent 列表 (元數據層)

### 核心協調 Agents

#### 1. MasterAgent
**描述**: 總協調者,負責編排所有 Agents 的執行順序,組裝最終結果
**使用時機**: 完整生成模式,需要生成豐富的行程內容時
**SKILL 文檔**: [MasterAgent.SKILL.md](./MasterAgent.SKILL.md)

#### 2. WebScraperAgent
**描述**: 網頁內容抓取專家,從旅遊網站 URL 提取行程基本資訊
**使用時機**: 需要從外部 URL 提取行程資料時
**SKILL 文檔**: [WebScraperAgent.SKILL.md](./WebScraperAgent.SKILL.md)

### 內容生成 Agents

#### 3. ContentAnalyzerAgent
**描述**: 內容分析與詩意化專家,生成吸引人的標題和亮點
**使用時機**: 需要將平淡的行程描述轉化為高端文案時
**SKILL 文檔**: [ContentAnalyzerAgent.SKILL.md](./ContentAnalyzerAgent.SKILL.md)

#### 4. ColorThemeAgent
**描述**: 色彩主題設計師,根據目的地生成適配的配色方案
**使用時機**: 需要為行程頁面生成視覺主題時
**SKILL 文檔**: [ColorThemeAgent.SKILL.md](./ColorThemeAgent.SKILL.md)

#### 5. ImagePromptAgent
**描述**: 圖片提示詞工程師,為 AI 圖片生成創建精準的 prompts
**使用時機**: 需要生成 AI 圖片前,先設計提示詞時
**SKILL 文檔**: [ImagePromptAgent.SKILL.md](./ImagePromptAgent.SKILL.md)

#### 6. ImageGenerationAgent
**描述**: 圖片生成與搜尋專家,整合 AI 生成和 Unsplash 真實圖片
**使用時機**: 需要為行程生成視覺內容時
**SKILL 文檔**: [ImageGenerationAgent.SKILL.md](./ImageGenerationAgent.SKILL.md)

### 資訊提取 Agents

#### 7. ItineraryAgent
**描述**: 每日行程結構化專家,將文字行程轉為結構化資料
**使用時機**: 需要提取和格式化每日行程細節時
**SKILL 文檔**: [ItineraryAgent.SKILL.md](./ItineraryAgent.SKILL.md)

#### 8. CostAgent
**描述**: 費用分析專家,提取和分類行程費用資訊
**使用時機**: 需要整理費用說明和價格明細時
**SKILL 文檔**: [CostAgent.SKILL.md](./CostAgent.SKILL.md)

#### 9. NoticeAgent
**描述**: 注意事項提取專家,整理旅遊須知和重要提醒
**使用時機**: 需要提取簽證、保險、行李等注意事項時
**SKILL 文檔**: [NoticeAgent.SKILL.md](./NoticeAgent.SKILL.md)

### 細節提取 Agents

#### 10. HotelAgent
**描述**: 住宿資訊專家,提取飯店名稱、等級、特色
**使用時機**: 需要整理住宿安排時
**SKILL 文檔**: [HotelAgent.SKILL.md](./HotelAgent.SKILL.md)

#### 11. MealAgent
**描述**: 餐食安排專家,提取用餐資訊和特色餐點
**使用時機**: 需要整理餐食安排時
**SKILL 文檔**: [MealAgent.SKILL.md](./MealAgent.SKILL.md)

#### 12. FlightAgent
**描述**: 航班資訊專家,提取航班時間、航空公司、艙等
**使用時機**: 需要整理航班資訊時
**SKILL 文檔**: [FlightAgent.SKILL.md](./FlightAgent.SKILL.md)

## 設計原則

### 1. Token 優化
- 只在需要時載入詳細指令
- 避免一次性載入所有 Agent 的完整提示詞

### 2. 模組化
- 每個 Agent 專注於單一職責
- 透過 MasterAgent 協調多個 Agents

### 3. 可維護性
- 所有提示詞集中在 SKILL.md 文件
- 修改提示詞不需要改動程式碼

### 4. 可測試性
- 每個 Agent 可獨立測試
- 提供標準輸入輸出範例

## 使用方式

### 在 Agent 中載入 Skill

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

class ContentAnalyzerAgent {
  private skillContent: string;

  constructor() {
    // 載入 SKILL.md 文件
    const skillPath = join(__dirname, 'skills', 'ContentAnalyzerAgent.SKILL.md');
    this.skillContent = readFileSync(skillPath, 'utf-8');
  }

  async execute(input: string): Promise<Result> {
    // 將 SKILL 內容加入 system prompt
    const systemPrompt = this.skillContent;
    
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input }
      ],
      response_format: { /* JSON Schema */ }
    });
    
    return JSON.parse(response.choices[0].message.content);
  }
}
```

### 條件式載入 Reference

```typescript
// 當需要參考 Sipincollection 設計規範時
if (needsDesignReference) {
  const referencePath = join(__dirname, 'skills', 'references', 'sipincollection-design.md');
  const referenceContent = readFileSync(referencePath, 'utf-8');
  systemPrompt += `\n\n## 設計參考\n${referenceContent}`;
}
```

## 目錄結構

```
server/agents/skills/
├── README.md                           # 本文件 (元數據層)
├── MasterAgent.SKILL.md                # MasterAgent 指令層
├── WebScraperAgent.SKILL.md            # WebScraperAgent 指令層
├── ContentAnalyzerAgent.SKILL.md       # ContentAnalyzerAgent 指令層
├── ColorThemeAgent.SKILL.md            # ColorThemeAgent 指令層
├── ImagePromptAgent.SKILL.md           # ImagePromptAgent 指令層
├── ImageGenerationAgent.SKILL.md       # ImageGenerationAgent 指令層
├── ItineraryAgent.SKILL.md             # ItineraryAgent 指令層
├── CostAgent.SKILL.md                  # CostAgent 指令層
├── NoticeAgent.SKILL.md                # NoticeAgent 指令層
├── HotelAgent.SKILL.md                 # HotelAgent 指令層
├── MealAgent.SKILL.md                  # MealAgent 指令層
├── FlightAgent.SKILL.md                # FlightAgent 指令層
├── references/                         # 資源層 - 參考文件
│   ├── sipincollection-design.md       # Sipincollection 設計規範
│   ├── poetic-title-examples.md        # 詩意化標題範例
│   └── color-theme-palettes.md         # 配色方案參考
└── scripts/                            # 資源層 - 執行腳本
    ├── validate-json-output.ts         # JSON 輸出驗證
    └── image-quality-check.ts          # 圖片品質檢查
```

## 維護指南

### 更新 Skill 文檔
1. 修改對應的 SKILL.md 文件
2. 測試 Agent 執行結果
3. 更新本 README.md 的描述 (如有需要)

### 新增 Reference
1. 在 `references/` 目錄創建新文件
2. 在對應的 SKILL.md 中說明何時載入
3. 更新 Agent 程式碼加入條件式載入邏輯

### 新增 Script
1. 在 `scripts/` 目錄創建新腳本
2. 在對應的 SKILL.md 中說明何時執行
3. 更新 Agent 程式碼加入腳本執行邏輯

## 參考資料

- [Anthropic Agent Skill 官方文檔](https://docs.anthropic.com/en/docs/agents)
- [馬克的技術工作坊 - Agent Skill 從使用到原理](https://www.youtube.com/watch?v=yDc0_8emz7M)
- [Sipincollection 設計參考](https://sipincollection.com/)
