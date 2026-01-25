/**
 * Report Generator
 * Generates verification reports for AI tour generation system
 */

export interface VerificationReportData {
  // System Overview
  systemName: string;
  version: string;
  generatedAt: string;
  
  // Phase 1: Infrastructure
  phase1: {
    redis: boolean;
    bullmq: boolean;
    database: boolean;
    trpcApi: boolean;
    rateLimit: boolean;
    worker: boolean;
  };
  
  // Phase 2: Multi-Agent System
  phase2: {
    webScraperAgent: boolean;
    contentAnalyzerAgent: boolean;
    imagePromptAgent: boolean;
    imageGenerationAgent: boolean;
    colorThemeAgent: boolean;
    masterAgent: boolean;
  };
  
  // Test Results
  testResults: {
    tourId?: number;
    sourceUrl?: string;
    title?: string;
    originalityScore?: number;
    heroImageGenerated?: boolean;
    colorThemeGenerated?: boolean;
    keyFeaturesCount?: number;
  };
}

/**
 * Generate a verification report in Markdown format
 */
export function generateVerificationReport(data: VerificationReportData): string {
  const report = `# AI 自動生成行程系統驗證報告

## 系統資訊

- **系統名稱**：${data.systemName}
- **版本**：${data.version}
- **生成時間**：${data.generatedAt}

---

## 階段一：基礎架構驗證

### 1.1 任務佇列系統
- **Redis 連線**：${data.phase1.redis ? '✅ 正常' : '❌ 異常'}
- **BullMQ 佇列**：${data.phase1.bullmq ? '✅ 正常' : '❌ 異常'}
- **Worker 並發處理**：${data.phase1.worker ? '✅ 正常（2 個任務同時執行）' : '❌ 異常'}

### 1.2 資料庫擴充
- **Schema 擴充**：${data.phase1.database ? '✅ 完成' : '❌ 未完成'}
  - heroImage, heroImageAlt, heroSubtitle
  - colorTheme
  - keyFeatures
  - poeticContent
  - sourceUrl
  - originalityScore

### 1.3 API 端點
- **tRPC API**：${data.phase1.trpcApi ? '✅ 正常' : '❌ 異常'}
  - \`generateFromUrl\` - 行程生成
  - \`getGenerationStatus\` - 查詢任務狀態
  - \`getMyGenerationJobs\` - 查詢用戶所有任務

### 1.4 速率限制
- **速率限制中間件**：${data.phase1.rateLimit ? '✅ 正常' : '❌ 異常'}
  - 行程生成：每小時 5 次
  - 圖片生成：每小時 20 次

---

## 階段二：多代理系統驗證

### 2.1 Web Scraper Agent
- **狀態**：${data.phase2.webScraperAgent ? '✅ 正常運作' : '❌ 異常'}
- **功能**：快速提取行程資訊、錯誤處理和重試機制

### 2.2 Content Analyzer Agent
- **狀態**：${data.phase2.contentAnalyzerAgent ? '✅ 正常運作' : '❌ 異常'}
- **功能**：內容分析和結構化、版權清洗（LLM 主動改寫）、原創性驗證

### 2.3 Image Prompt Agent
- **狀態**：${data.phase2.imagePromptAgent ? '✅ 正常運作' : '❌ 異常'}
- **功能**：LLM 優化圖片提示詞、根據目的地和行程主題生成提示詞、整合全域 Style Guide

### 2.4 Image Generation Agent
- **狀態**：${data.phase2.imageGenerationAgent ? '✅ 正常運作' : '❌ 異常'}
- **功能**：Manus API 生成 Hero 圖片、Unsplash API 生成亮點圖片（fallback）、圖片上傳至 S3、風格一致性驗證

### 2.5 Color Theme Agent
- **狀態**：${data.phase2.colorThemeAgent ? '✅ 正常運作' : '❌ 異常'}
- **功能**：根據目的地生成配色主題、預設配色方案

### 2.6 Master Agent
- **狀態**：${data.phase2.masterAgent ? '✅ 正常運作' : '❌ 異常'}
- **功能**：協調所有 Agent、錯誤處理和回滾、進度追蹤

---

## 測試結果

${data.testResults.tourId ? `
### 生成的行程資訊

- **行程 ID**：${data.testResults.tourId}
- **來源 URL**：${data.testResults.sourceUrl || '未提供'}
- **標題**：${data.testResults.title || '未提供'}
- **原創性評分**：${data.testResults.originalityScore !== undefined ? `${data.testResults.originalityScore.toFixed(2)} 分` : '未提供'}

### 生成的內容

- **Hero 圖片**：${data.testResults.heroImageGenerated ? '✅ 已生成並上傳至 S3' : '❌ 未生成'}
- **配色主題**：${data.testResults.colorThemeGenerated ? '✅ 已生成（目的地特定配色）' : '❌ 未生成'}
- **關鍵特色**：${data.testResults.keyFeaturesCount !== undefined ? `✅ 已生成（${data.testResults.keyFeaturesCount} 個）` : '❌ 未生成'}
` : '**尚未執行測試**'}

---

## 系統架構總結

### 多代理系統流程

\`\`\`
User Request (URL)
    ↓
tRPC API (generateFromUrl)
    ↓
BullMQ Queue (add job)
    ↓
Worker (process job)
    ↓
Master Agent
    ├── Web Scraper Agent → 抓取網頁內容
    ├── Content Analyzer Agent → 分析並改寫內容（原創性驗證）
    ├── Color Theme Agent → 生成配色主題
    ├── Image Prompt Agent → 生成圖片提示詞（LLM 優化）
    └── Image Generation Agent → 生成圖片並上傳至 S3
    ↓
Save to Database (tours table)
    ↓
Return Result (tourId)
\`\`\`

### 關鍵特性

1. **非同步處理**：使用 BullMQ 任務佇列，避免阻塞主執行緒
2. **進度追蹤**：7 個步驟的詳細進度更新（10%, 30%, 40%, 50%, 60%, 95%, 100%）
3. **速率限制**：防止濫用，保護系統資源
4. **錯誤處理**：最多重試 3 次，指數退避策略
5. **原創性驗證**：Content Analyzer Agent 評分 0-100 分
6. **來源追蹤**：儲存原始 URL，方便向供應商要貨

---

## 結論

${
  data.phase1.redis &&
  data.phase1.bullmq &&
  data.phase1.database &&
  data.phase1.trpcApi &&
  data.phase1.rateLimit &&
  data.phase1.worker &&
  data.phase2.webScraperAgent &&
  data.phase2.contentAnalyzerAgent &&
  data.phase2.imagePromptAgent &&
  data.phase2.imageGenerationAgent &&
  data.phase2.colorThemeAgent &&
  data.phase2.masterAgent
    ? '✅ **所有系統組件運作正常，階段一和階段二已完全達到需求。**'
    : '⚠️ **部分系統組件異常，請檢查上述錯誤項目。**'
}

---

*本報告由系統自動生成，生成時間：${data.generatedAt}*
`;

  return report;
}
