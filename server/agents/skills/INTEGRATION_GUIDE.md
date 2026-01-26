# Agent Skills 整合指南

## 概述

本指南說明如何將 SKILL.md 文檔整合到各個 Agent 的程式碼中,採用 Anthropic 的**漸進式披露**三層架構,優化提示詞工程和執行效率。

## 三層架構

### 第一層: 元數據層 (Metadata Layer)

**位置**: `README.md`

**內容**: 輕量級的 Agent 列表和簡短描述

**用途**: 讓 LLM 快速判斷是否需要載入詳細指令

**範例**:
```markdown
## Available Agents

1. **MasterAgent** - 總協調者,負責編排 12 個 Agents 的執行順序
2. **WebScraperAgent** - 網頁內容抓取專家,使用 Puppeteer 抓取動態網頁
3. **ContentAnalyzerAgent** - 內容分析與詩意化專家,生成行銷標題和亮點
...
```

### 第二層: 指令層 (Instruction Layer)

**位置**: `{AgentName}.SKILL.md`

**內容**: 詳細的執行規則、格式、範例、錯誤處理

**用途**: 當 Agent 需要執行時,載入完整的指令文檔

**範例**:
```markdown
# ContentAnalyzerAgent Skill

## 角色定義
你是一位**內容分析與詩意化專家**...

## 核心職責
1. **詩意化標題生成**: 將平凡的行程標題轉化為富有詩意和吸引力的標題
2. **行程亮點提取**: 從原始內容中提取 3-6 個核心亮點
...
```

### 第三層: 資源層 (Resource Layer)

**位置**: `references/` 和 `scripts/`

**內容**: 按需載入的參考文件和執行腳本

**用途**: 當需要更多上下文或執行特定操作時才載入

**範例**:
```
references/
  ├── sipincollection-design-guidelines.md  # Sipincollection 設計規範
  ├── poetic-title-examples.md              # 詩意化標題範例庫
  ├── destination-color-mapping.md          # 目的地配色映射表
  └── web-scraping-best-practices.md        # 網頁抓取最佳實踐

scripts/
  ├── validate-json-output.js               # JSON 輸出驗證腳本
  ├── check-image-quality.js                # 圖片品質檢查腳本
  └── test-agent-output.js                  # Agent 輸出測試腳本
```

## 整合步驟

### Step 1: 在 Agent 程式碼中載入 SKILL.md

**方法 1: 直接嵌入 System Prompt**

```typescript
import fs from 'fs';
import path from 'path';

class ContentAnalyzerAgent {
  private skillDoc: string;

  constructor() {
    // 載入 SKILL.md 文檔
    const skillPath = path.join(__dirname, 'skills', 'ContentAnalyzerAgent.SKILL.md');
    this.skillDoc = fs.readFileSync(skillPath, 'utf-8');
  }

  async execute(input: any) {
    const systemPrompt = `
${this.skillDoc}

請嚴格遵循上述 SKILL 文檔的指示執行任務。
`;

    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(input) }
      ]
    });

    return JSON.parse(response.choices[0].message.content);
  }
}
```

**方法 2: 按需載入 (推薦)**

```typescript
class ContentAnalyzerAgent {
  private skillDoc: string | null = null;

  private loadSkill() {
    if (!this.skillDoc) {
      const skillPath = path.join(__dirname, 'skills', 'ContentAnalyzerAgent.SKILL.md');
      this.skillDoc = fs.readFileSync(skillPath, 'utf-8');
    }
    return this.skillDoc;
  }

  async execute(input: any) {
    const skill = this.loadSkill();
    
    const systemPrompt = `
${skill}

請嚴格遵循上述 SKILL 文檔的指示執行任務。
`;

    // ... 執行 LLM 調用
  }
}
```

### Step 2: 提取關鍵部分 (優化 Token 使用)

**策略**: 不要載入整個 SKILL.md,只載入必要的部分

```typescript
class ContentAnalyzerAgent {
  private extractKeyInstructions(skillDoc: string): string {
    // 提取「角色定義」、「核心職責」、「輸出格式」、「JSON Schema」
    const sections = [
      '## 角色定義',
      '## 核心職責',
      '## 輸出格式',
      '## JSON Schema'
    ];

    let keyInstructions = '';
    for (const section of sections) {
      const startIndex = skillDoc.indexOf(section);
      if (startIndex !== -1) {
        const nextSectionIndex = skillDoc.indexOf('##', startIndex + section.length);
        const sectionContent = nextSectionIndex !== -1
          ? skillDoc.substring(startIndex, nextSectionIndex)
          : skillDoc.substring(startIndex);
        keyInstructions += sectionContent + '\n\n';
      }
    }

    return keyInstructions;
  }

  async execute(input: any) {
    const skillDoc = this.loadSkill();
    const keyInstructions = this.extractKeyInstructions(skillDoc);

    const systemPrompt = `
${keyInstructions}

請嚴格遵循上述指示執行任務。
`;

    // ... 執行 LLM 調用
  }
}
```

### Step 3: 使用 JSON Schema 驗證輸出

**策略**: 從 SKILL.md 提取 JSON Schema,驗證 LLM 輸出

```typescript
import Ajv from 'ajv';

class ContentAnalyzerAgent {
  private jsonSchema: any;

  constructor() {
    // 從 SKILL.md 提取 JSON Schema
    const skillDoc = this.loadSkill();
    this.jsonSchema = this.extractJsonSchema(skillDoc);
  }

  private extractJsonSchema(skillDoc: string): any {
    // 從 SKILL.md 中提取 JSON Schema (位於 ```json 區塊)
    const match = skillDoc.match(/```json\n([\s\S]+?)\n```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    return null;
  }

  private validateOutput(output: any): boolean {
    if (!this.jsonSchema) return true;

    const ajv = new Ajv();
    const validate = ajv.compile(this.jsonSchema);
    const valid = validate(output);

    if (!valid) {
      console.error('[ContentAnalyzerAgent] Output validation failed:', validate.errors);
      return false;
    }

    return true;
  }

  async execute(input: any) {
    // ... 執行 LLM 調用
    const output = JSON.parse(response.choices[0].message.content);

    // 驗證輸出
    if (!this.validateOutput(output)) {
      throw new Error('Output validation failed');
    }

    return output;
  }
}
```

### Step 4: 整合 Reference 文件 (按需載入)

**策略**: 只在需要時載入 Reference 文件

```typescript
class ContentAnalyzerAgent {
  private loadReference(referenceName: string): string {
    const referencePath = path.join(__dirname, 'skills', 'references', `${referenceName}.md`);
    if (fs.existsSync(referencePath)) {
      return fs.readFileSync(referencePath, 'utf-8');
    }
    return '';
  }

  async execute(input: any) {
    const skillDoc = this.loadSkill();
    let systemPrompt = this.extractKeyInstructions(skillDoc);

    // 根據條件載入 Reference
    if (input.needDesignGuidelines) {
      const designGuidelines = this.loadReference('sipincollection-design-guidelines');
      systemPrompt += `\n\n## 設計規範\n${designGuidelines}`;
    }

    if (input.needExamples) {
      const examples = this.loadReference('poetic-title-examples');
      systemPrompt += `\n\n## 範例\n${examples}`;
    }

    // ... 執行 LLM 調用
  }
}
```

## 效能優化建議

### 1. 快取 SKILL 文檔

```typescript
// 全域快取
const skillCache = new Map<string, string>();

function loadSkill(agentName: string): string {
  if (!skillCache.has(agentName)) {
    const skillPath = path.join(__dirname, 'skills', `${agentName}.SKILL.md`);
    skillCache.set(agentName, fs.readFileSync(skillPath, 'utf-8'));
  }
  return skillCache.get(agentName)!;
}
```

### 2. 只載入必要的 Section

```typescript
function loadSkillSection(agentName: string, sections: string[]): string {
  const fullSkill = loadSkill(agentName);
  let result = '';

  for (const section of sections) {
    const startIndex = fullSkill.indexOf(`## ${section}`);
    if (startIndex !== -1) {
      const nextSectionIndex = fullSkill.indexOf('##', startIndex + section.length + 3);
      const sectionContent = nextSectionIndex !== -1
        ? fullSkill.substring(startIndex, nextSectionIndex)
        : fullSkill.substring(startIndex);
      result += sectionContent + '\n\n';
    }
  }

  return result;
}

// 使用範例
const keyInstructions = loadSkillSection('ContentAnalyzerAgent', [
  '角色定義',
  '核心職責',
  '輸出格式',
  'JSON Schema'
]);
```

### 3. 使用 LLM Function Calling (推薦)

```typescript
async function executeWithFunctionCalling(input: any) {
  const jsonSchema = extractJsonSchema(loadSkill('ContentAnalyzerAgent'));

  const response = await invokeLLM({
    messages: [
      { role: 'system', content: '你是內容分析與詩意化專家...' },
      { role: 'user', content: JSON.stringify(input) }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'content_analysis_result',
        strict: true,
        schema: jsonSchema
      }
    }
  });

  return JSON.parse(response.choices[0].message.content);
}
```

## 測試策略

### 1. 單元測試 (驗證 JSON Schema)

```typescript
import { describe, it, expect } from 'vitest';

describe('ContentAnalyzerAgent', () => {
  it('should generate valid output according to JSON Schema', async () => {
    const agent = new ContentAnalyzerAgent();
    const input = {
      title: '新加坡馬來西亞5日',
      description: '入住聖淘沙名勝世界...',
      // ...
    };

    const output = await agent.execute(input);

    // 驗證必要欄位
    expect(output).toHaveProperty('poeticTitle');
    expect(output).toHaveProperty('highlights');
    expect(output.highlights).toBeInstanceOf(Array);
    expect(output.highlights.length).toBeGreaterThanOrEqual(3);
    expect(output.highlights.length).toBeLessThanOrEqual(6);
  });
});
```

### 2. 整合測試 (驗證 Agent 協調)

```typescript
describe('MasterAgent', () => {
  it('should coordinate all agents and produce final result', async () => {
    const masterAgent = new MasterAgent();
    const input = {
      url: 'https://travel.liontravel.com/detail?NormGroupID=...'
    };

    const output = await masterAgent.execute(input);

    // 驗證最終結果
    expect(output.success).toBe(true);
    expect(output.data).toHaveProperty('poeticTitle');
    expect(output.data).toHaveProperty('heroImage');
    expect(output.data).toHaveProperty('featureImages');
    
    // 驗證 JSON 字串格式
    expect(() => JSON.parse(output.data.highlights)).not.toThrow();
    expect(() => JSON.parse(output.data.featureImages)).not.toThrow();
  });
});
```

## 常見問題

### Q1: SKILL.md 太大,會不會超過 Token 限制?

**A**: 使用「提取關鍵部分」策略,只載入必要的 Section (角色定義、核心職責、輸出格式、JSON Schema),通常可以將 Token 使用量減少 70-80%。

### Q2: 如何更新 SKILL.md 而不影響現有程式碼?

**A**: SKILL.md 是獨立的文檔,更新時不需要修改程式碼。只需重新載入文檔即可 (如果有快取,需清除快取)。

### Q3: 如何處理 LLM 輸出不符合 JSON Schema 的情況?

**A**: 使用 `response_format` 參數強制 LLM 輸出符合 JSON Schema,或在後端驗證輸出並重試。

```typescript
async function executeWithRetry(input: any, maxRetries: number = 3): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const output = await this.execute(input);
      if (this.validateOutput(output)) {
        return output;
      }
    } catch (error) {
      console.error(`[Agent] Attempt ${i + 1} failed:`, error);
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Q4: 如何測試 SKILL.md 的效果?

**A**: 使用 A/B 測試,比較使用 SKILL.md 前後的輸出品質:

```typescript
// 測試範例
const inputSamples = [
  { url: 'https://travel.liontravel.com/detail?NormGroupID=...' },
  // ... 更多測試樣本
];

// 不使用 SKILL.md
const outputsWithoutSkill = await Promise.all(
  inputSamples.map(input => agentWithoutSkill.execute(input))
);

// 使用 SKILL.md
const outputsWithSkill = await Promise.all(
  inputSamples.map(input => agentWithSkill.execute(input))
);

// 比較結果 (人工評估或自動評估)
compareOutputs(outputsWithoutSkill, outputsWithSkill);
```

## 下一步

1. **創建 Reference 文件**: 在 `references/` 目錄下創建參考文件
2. **創建驗證腳本**: 在 `scripts/` 目錄下創建驗證腳本
3. **整合到現有 Agents**: 按照上述步驟整合到各個 Agent
4. **測試效果**: 使用 A/B 測試比較效果
5. **持續優化**: 根據測試結果持續優化 SKILL.md

## 版本歷史

- **v1.0** (2026-01-26): 初始版本,定義三層架構和整合步驟
