# MasterAgent 優化方案設計

## 📋 問題分析

### 現有問題

1. **缺乏並行執行優化**
   - 現狀: 所有 Agents 按順序執行
   - 問題: 執行時間過長 (約 90-120 秒)
   - SKILL.md 建議: Phase 1 和 Phase 3 應並行執行

2. **錯誤處理不完善**
   - 現狀: 簡單的 try-catch,缺少重試機制
   - 問題: 暫時性錯誤(網路超時)導致整個流程失敗
   - SKILL.md 建議: 實作智能重試和 Fallback 機制

3. **缺少任務佇列管理**
   - 現狀: 直接執行,無法控制並行數量
   - 問題: 大量請求時可能導致資源耗盡
   - 需求: 任務佇列、優先級管理、並行控制

4. **Agent 協作狀態不透明**
   - 現狀: 只有簡單的進度百分比
   - 問題: 無法追蹤每個 Agent 的狀態
   - 需求: 詳細的狀態監控和日誌記錄

5. **資料流轉不清晰**
   - 現狀: 資料在 Agents 之間傳遞時缺少驗證
   - 問題: 上游錯誤可能導致下游 Agents 失敗
   - 需求: 資料驗證和轉換層

---

## 🎯 優化目標

### 效能目標
- 執行時間: 從 90-120 秒降至 60-90 秒 (節省 30-40%)
- 成功率: 從 85% 提升至 95%+
- 並行效率: 實作 Phase 1 和 Phase 3 的並行執行

### 可靠性目標
- 實作智能重試機制 (最多 3 次,指數退避)
- 實作 Fallback 機制 (非必要 Agents 失敗時使用預設值)
- 實作資料驗證層 (確保資料完整性)

### 可維護性目標
- 清晰的任務佇列管理
- 詳細的狀態監控和日誌
- 模組化的錯誤處理

---

## 🏗️ 優化方案

### 1. 任務佇列管理器

#### 設計原則
- **優先級管理**: 支援高/中/低優先級任務
- **並行控制**: 限制同時執行的任務數量
- **狀態追蹤**: 追蹤每個任務的執行狀態

#### 實作細節

```typescript
interface Task {
  id: string;
  priority: 'high' | 'medium' | 'low';
  agentName: string;
  execute: () => Promise<any>;
  dependencies?: string[]; // 依賴的任務 ID
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

class TaskQueue {
  private tasks: Map<string, Task> = new Map();
  private runningTasks: Set<string> = new Set();
  private maxConcurrent: number = 5; // 最多同時執行 5 個任務
  
  async addTask(task: Task): Promise<void>;
  async executeTask(taskId: string): Promise<any>;
  async executeBatch(taskIds: string[]): Promise<any[]>;
  getTaskStatus(taskId: string): Task['status'];
  getCompletedTasks(): Task[];
  getFailedTasks(): Task[];
}
```

#### 使用範例

```typescript
const queue = new TaskQueue();

// 添加任務
queue.addTask({
  id: 'web-scraper',
  priority: 'high',
  agentName: 'WebScraperAgent',
  execute: () => webScraperAgent.execute(url),
  retryCount: 0,
  maxRetries: 3,
  status: 'pending'
});

// 並行執行
const [colorTheme, imagePrompt] = await queue.executeBatch([
  'color-theme',
  'image-prompt'
]);
```

---

### 2. 智能重試機制

#### 設計原則
- **指數退避策略**: 第 1 次重試等待 1 秒,第 2 次 2 秒,第 3 次 4 秒
- **可重試錯誤判斷**: 網路錯誤、超時錯誤可重試,邏輯錯誤不重試
- **最大重試次數**: 每個 Agent 最多重試 3 次

#### 實作細節

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // 基礎延遲 (毫秒)
  maxDelay: number;  // 最大延遲 (毫秒)
  retryableErrors: string[]; // 可重試的錯誤類型
}

class RetryManager {
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    config: RetryConfig
  ): Promise<T>;
  
  private isRetryableError(error: Error): boolean;
  private calculateDelay(retryCount: number, baseDelay: number): number;
  private sleep(ms: number): Promise<void>;
}
```

#### 使用範例

```typescript
const retryManager = new RetryManager();

const result = await retryManager.executeWithRetry(
  () => webScraperAgent.execute(url),
  {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    retryableErrors: ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND']
  }
);
```

---

### 3. 並行執行優化

#### Phase 1: 並行執行 ColorThemeAgent 和 ImagePromptAgent

**現狀** (順序執行):
```
ContentAnalyzerAgent (10s)
  ↓
ColorThemeAgent (5s)
  ↓
ImagePromptAgent (5s)
總計: 20s
```

**優化後** (並行執行):
```
ContentAnalyzerAgent (10s)
  ↓ (並行)
ColorThemeAgent (5s) + ImagePromptAgent (5s)
總計: 15s (節省 5s)
```

**實作**:
```typescript
const [colorThemeResult, imagePromptResult] = await Promise.all([
  retryManager.executeWithRetry(
    () => colorThemeAgent.execute(country, city, title),
    retryConfig
  ),
  retryManager.executeWithRetry(
    () => imagePromptAgent.execute(country, city, highlights, keyFeatures),
    retryConfig
  )
]);
```

#### Phase 3: 並行執行 5 個細節 Agents

**現狀** (順序執行):
```
ItineraryAgent (8s)
  ↓
CostAgent (5s)
  ↓
NoticeAgent (5s)
  ↓
HotelAgent (5s)
  ↓
MealAgent (5s)
  ↓
FlightAgent (5s)
總計: 33s
```

**優化後** (並行執行):
```
ItineraryAgent (8s)
  ↓ (並行)
CostAgent (5s) + NoticeAgent (5s) + HotelAgent (5s) + MealAgent (5s) + FlightAgent (5s)
總計: 13s (節省 20s)
```

**實作**:
```typescript
const [
  costResult,
  noticeResult,
  hotelResult,
  mealResult,
  flightResult
] = await Promise.allSettled([
  retryManager.executeWithRetry(() => costAgent.execute(rawData), retryConfig),
  retryManager.executeWithRetry(() => noticeAgent.execute(rawData), retryConfig),
  retryManager.executeWithRetry(() => hotelAgent.execute(rawData), retryConfig),
  retryManager.executeWithRetry(() => mealAgent.execute(rawData), retryConfig),
  retryManager.executeWithRetry(() => flightAgent.execute(rawData), retryConfig)
]);
```

---

### 4. Agent 協作狀態監控

#### 設計原則
- **詳細狀態追蹤**: 追蹤每個 Agent 的執行狀態
- **執行時間記錄**: 記錄每個 Agent 的執行時間
- **錯誤日誌**: 記錄所有錯誤和重試資訊

#### 實作細節

```typescript
interface AgentStatus {
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
  duration?: number;
  retryCount: number;
  error?: string;
}

class AgentMonitor {
  private statuses: Map<string, AgentStatus> = new Map();
  
  startAgent(agentName: string): void;
  completeAgent(agentName: string, result: any): void;
  failAgent(agentName: string, error: Error): void;
  retryAgent(agentName: string): void;
  getStatus(agentName: string): AgentStatus;
  getAllStatuses(): AgentStatus[];
  generateReport(): string;
}
```

#### 使用範例

```typescript
const monitor = new AgentMonitor();

monitor.startAgent('WebScraperAgent');
try {
  const result = await webScraperAgent.execute(url);
  monitor.completeAgent('WebScraperAgent', result);
} catch (error) {
  monitor.failAgent('WebScraperAgent', error);
}

// 生成報告
console.log(monitor.generateReport());
```

---

### 5. 錯誤處理和 Fallback 機制

#### 設計原則
- **必要 Agents 失敗 → 終止流程**: WebScraperAgent, ContentAnalyzerAgent, ImageGenerationAgent
- **非必要 Agents 失敗 → 使用 Fallback**: CostAgent, NoticeAgent, HotelAgent, MealAgent, FlightAgent
- **部分成功策略**: 使用 `Promise.allSettled` 處理並行任務

#### 實作細節

```typescript
interface FallbackConfig {
  agentName: string;
  isCritical: boolean;
  fallbackData: any;
}

class FallbackManager {
  private configs: Map<string, FallbackConfig> = new Map();
  
  registerFallback(config: FallbackConfig): void;
  handleFailure(agentName: string, error: Error): any;
  isCriticalAgent(agentName: string): boolean;
}
```

#### 使用範例

```typescript
const fallbackManager = new FallbackManager();

// 註冊 Fallback 配置
fallbackManager.registerFallback({
  agentName: 'CostAgent',
  isCritical: false,
  fallbackData: {
    included: [],
    excluded: [],
    notes: []
  }
});

// 處理失敗
try {
  const result = await costAgent.execute(rawData);
} catch (error) {
  if (fallbackManager.isCriticalAgent('CostAgent')) {
    throw error; // 必要 Agent,終止流程
  } else {
    const fallbackData = fallbackManager.handleFailure('CostAgent', error);
    // 使用 Fallback 資料繼續
  }
}
```

---

## 📊 預期效果

### 效能提升
- **執行時間**: 60-90 秒 (原本 90-120 秒)
- **並行效率**: Phase 1 節省 5 秒,Phase 3 節省 20 秒,總計節省 25 秒
- **成功率**: 95%+ (原本 85%)

### 可靠性提升
- **重試成功率**: 暫時性錯誤的成功率從 0% 提升至 80%+
- **部分成功率**: 非必要 Agents 失敗時仍能生成行程
- **資料完整性**: 資料驗證層確保資料格式正確

### 可維護性提升
- **狀態透明度**: 詳細的狀態監控和日誌
- **錯誤追蹤**: 清晰的錯誤日誌和重試記錄
- **模組化**: 任務佇列、重試、Fallback 都是獨立模組

---

## 🚀 實作步驟

### Step 1: 實作基礎設施
1. 創建 `TaskQueue` 類別
2. 創建 `RetryManager` 類別
3. 創建 `AgentMonitor` 類別
4. 創建 `FallbackManager` 類別

### Step 2: 重構 MasterAgent
1. 整合 `TaskQueue` 管理任務
2. 整合 `RetryManager` 處理重試
3. 整合 `AgentMonitor` 追蹤狀態
4. 整合 `FallbackManager` 處理錯誤

### Step 3: 實作並行執行
1. Phase 1: 並行執行 ColorThemeAgent 和 ImagePromptAgent
2. Phase 3: 並行執行 5 個細節 Agents
3. 使用 `Promise.allSettled` 處理部分成功

### Step 4: 測試和驗證
1. 單元測試: 測試每個模組
2. 整合測試: 測試完整流程
3. 效能測試: 驗證執行時間
4. 錯誤測試: 驗證重試和 Fallback 機制

---

## 📝 實作優先級

### P0 (必須實作)
- [x] RetryManager (智能重試)
- [x] 並行執行優化 (Phase 1 和 Phase 3)
- [x] FallbackManager (錯誤處理)

### P1 (高優先級)
- [ ] AgentMonitor (狀態監控)
- [ ] TaskQueue (任務佇列)

### P2 (中優先級)
- [ ] 資料驗證層
- [ ] 快取機制

---

## 🎯 成功指標

### 量化指標
- 執行時間 < 90 秒 (目標: 60-90 秒)
- 成功率 > 95%
- 重試成功率 > 80%

### 質化指標
- 代碼可讀性提升
- 錯誤追蹤更清晰
- 維護成本降低

---

## 📅 時間規劃

- **Phase 1**: 實作基礎設施 (2 小時)
- **Phase 2**: 重構 MasterAgent (2 小時)
- **Phase 3**: 實作並行執行 (1 小時)
- **Phase 4**: 測試和驗證 (1 小時)
- **總計**: 6 小時

---

## 📚 參考資料

- [MasterAgent SKILL.md](./skills/MasterAgent.SKILL.md)
- [Anthropic's Progressive Disclosure Architecture](https://www.anthropic.com)
- [Multi-Agent Coordination Patterns](https://www.microsoft.com/en-us/research/publication/multi-agent-coordination/)
