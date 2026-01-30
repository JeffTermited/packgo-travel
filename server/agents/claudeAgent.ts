/**
 * Claude Agent
 * Uses Anthropic Claude API for content analysis and generation
 * 
 * Advantages:
 * - 200K token context (vs GPT-4's 128K)
 * - Excellent structured output with native JSON Schema support
 * - Strong reasoning capabilities
 * - Better multilingual support (Chinese + English)
 * - Cost-effective (Haiku: $0.25/1M input, $1.25/1M output)
 * 
 * Claude Hybrid Architecture:
 * - Brain (Complex Logic): Claude 3.5 Sonnet for itinerary planning
 * - Hands (Simple Tasks): Claude 3 Haiku for extraction and formatting
 */

import Anthropic from '@anthropic-ai/sdk';

// Model constants
export const CLAUDE_MODELS = {
  HAIKU: 'claude-3-haiku-20240307',      // Fast, cost-effective ($0.25/1M input)
  SONNET: 'claude-3-5-sonnet-20241022',  // Balanced quality/speed ($3/1M input)
  OPUS: 'claude-3-opus-20240229',        // Highest quality ($15/1M input)
} as const;

export type ClaudeModel = typeof CLAUDE_MODELS[keyof typeof CLAUDE_MODELS];

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResult {
  success: boolean;
  content?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  error?: string;
}

export interface ClaudeStructuredResult<T> extends ClaudeResult {
  data?: T;
}

// JSON Schema type definition
export interface JSONSchema {
  type: 'object';
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface JSONSchemaProperty {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null';
  description?: string;
  enum?: (string | number)[];
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
  default?: any;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

// Token usage tracking
interface TokenUsageStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCalls: number;
  estimatedCostUSD: number;
}

// Strict Data Fidelity Rules (to prevent hallucinations)
export const STRICT_DATA_FIDELITY_RULES = `
## 嚴格數據忠實度規則

你必須遵守以下規則，違反將導致系統錯誤：

1. **只提取明確存在的資訊**：如果來源文本中沒有明確提到某個欄位的資訊，必須返回 null 或空值，絕對不能創造或推測。

2. **不要添加任何額外內容**：不要添加來源文本中沒有的飯店名稱、餐廳名稱、景點名稱或任何其他資訊。

3. **保持原始措辭**：盡可能保留來源文本的原始措辭，只做必要的格式調整。

4. **標記不確定性**：如果某個資訊不確定或模糊，在相關欄位中標記為 "待確認" 而不是猜測。

5. **數字必須準確**：價格、天數、時間等數字必須與來源文本完全一致，不能四捨五入或估算。

6. **不要輸出任何閒聊填充詞**：直接返回 JSON，不要有任何前言、解釋或後語。
`;

export class ClaudeAgent {
  private client: Anthropic;
  private model: string;
  private usageStats: TokenUsageStats;

  constructor(options?: { model?: ClaudeModel }) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    this.client = new Anthropic({ apiKey });
    // Default to Haiku for cost-effectiveness
    this.model = options?.model || CLAUDE_MODELS.HAIKU;
    
    // Initialize usage stats
    this.usageStats = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCalls: 0,
      estimatedCostUSD: 0,
    };
    
    console.log(`[ClaudeAgent] Initialized with model: ${this.model}`);
  }

  /**
   * Get current token usage statistics
   */
  getUsageStats(): TokenUsageStats {
    return { ...this.usageStats };
  }

  /**
   * Reset token usage statistics
   */
  resetUsageStats(): void {
    this.usageStats = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCalls: 0,
      estimatedCostUSD: 0,
    };
  }

  /**
   * Update usage stats after a call
   */
  private updateUsageStats(inputTokens: number, outputTokens: number): void {
    this.usageStats.totalInputTokens += inputTokens;
    this.usageStats.totalOutputTokens += outputTokens;
    this.usageStats.totalCalls += 1;

    // Calculate cost based on model
    let inputCostPer1M: number;
    let outputCostPer1M: number;

    switch (this.model) {
      case CLAUDE_MODELS.HAIKU:
        inputCostPer1M = 0.25;
        outputCostPer1M = 1.25;
        break;
      case CLAUDE_MODELS.SONNET:
        inputCostPer1M = 3.0;
        outputCostPer1M = 15.0;
        break;
      case CLAUDE_MODELS.OPUS:
        inputCostPer1M = 15.0;
        outputCostPer1M = 75.0;
        break;
      default:
        inputCostPer1M = 0.25;
        outputCostPer1M = 1.25;
    }

    const inputCost = (inputTokens / 1_000_000) * inputCostPer1M;
    const outputCost = (outputTokens / 1_000_000) * outputCostPer1M;
    this.usageStats.estimatedCostUSD += inputCost + outputCost;
  }

  /**
   * Switch to a different model
   */
  setModel(model: ClaudeModel): void {
    this.model = model;
    console.log(`[ClaudeAgent] Switched to model: ${this.model}`);
  }

  /**
   * Send a single message to Claude
   */
  async sendMessage(
    prompt: string,
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<ClaudeResult> {
    console.log('[ClaudeAgent] Sending message to Claude...');
    const startTime = Date.now();

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 1.0,
        system: options?.systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      console.log(`[ClaudeAgent] Response received in ${duration}ms`);

      // Update usage stats
      this.updateUsageStats(response.usage.input_tokens, response.usage.output_tokens);

      // Extract text content from response
      const content = response.content
        .filter((block) => block.type === 'text')
        .map((block: any) => block.text)
        .join('\n');

      return {
        success: true,
        content,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[ClaudeAgent] Error after ${duration}ms:`, error.message);

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Send a conversation (multiple messages) to Claude
   */
  async sendConversation(
    messages: ClaudeMessage[],
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<ClaudeResult> {
    console.log(`[ClaudeAgent] Sending conversation (${messages.length} messages) to Claude...`);
    const startTime = Date.now();

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 1.0,
        system: options?.systemPrompt,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      const duration = Date.now() - startTime;
      console.log(`[ClaudeAgent] Response received in ${duration}ms`);

      // Update usage stats
      this.updateUsageStats(response.usage.input_tokens, response.usage.output_tokens);

      // Extract text content from response
      const content = response.content
        .filter((block) => block.type === 'text')
        .map((block: any) => block.text)
        .join('\n');

      return {
        success: true,
        content,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[ClaudeAgent] Error after ${duration}ms:`, error.message);

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Send a structured message with JSON Schema enforcement
   * This is the key method for the Claude Hybrid Architecture
   * 
   * Uses Claude's native tool use feature to guarantee valid JSON output
   * that conforms to the provided schema.
   * 
   * @param prompt - The user prompt
   * @param schema - JSON Schema defining the expected output structure
   * @param options - Additional options (systemPrompt, maxTokens, temperature)
   * @returns Structured result with parsed data
   */
  async sendStructuredMessage<T>(
    prompt: string,
    schema: JSONSchema,
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
      schemaName?: string;
      schemaDescription?: string;
      strictDataFidelity?: boolean;
    }
  ): Promise<ClaudeStructuredResult<T>> {
    const schemaName = options?.schemaName || 'structured_output';
    const schemaDescription = options?.schemaDescription || 'Extract structured data according to the schema';
    
    console.log(`[ClaudeAgent] Sending structured message with schema: ${schemaName}`);
    const startTime = Date.now();

    // Build system prompt with strict data fidelity rules if enabled
    let systemPrompt = options?.systemPrompt || '你是一個專業的資料提取專家，擅長從文本中提取結構化資訊。';
    if (options?.strictDataFidelity !== false) {
      systemPrompt = `${systemPrompt}\n\n${STRICT_DATA_FIDELITY_RULES}`;
    }

    try {
      // Use Claude's tool use feature to enforce JSON schema
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature ?? 0.3, // Lower temperature for consistent extraction
        system: systemPrompt,
        tools: [
          {
            name: schemaName,
            description: schemaDescription,
            input_schema: schema as Anthropic.Tool.InputSchema,
          },
        ],
        tool_choice: { type: 'tool', name: schemaName },
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      console.log(`[ClaudeAgent] Structured response received in ${duration}ms`);

      // Update usage stats
      this.updateUsageStats(response.usage.input_tokens, response.usage.output_tokens);

      // Extract tool use result
      const toolUseBlock = response.content.find((block) => block.type === 'tool_use');
      
      if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
        console.error('[ClaudeAgent] No tool use block found in response');
        return {
          success: false,
          error: 'No structured output returned from Claude',
          usage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
          },
        };
      }

      // The input field contains the structured data
      const data = toolUseBlock.input as T;

      console.log(`[ClaudeAgent] Successfully extracted structured data`);

      return {
        success: true,
        data,
        content: JSON.stringify(data, null, 2),
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[ClaudeAgent] Structured message error after ${duration}ms:`, error.message);

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Extract structured data from text using Claude (legacy method)
   * @deprecated Use sendStructuredMessage instead for guaranteed JSON output
   */
  async extractStructuredData(
    text: string,
    schema: {
      description: string;
      fields: Record<string, { type: string; description: string }>;
    },
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
    }
  ): Promise<ClaudeResult & { data?: any }> {
    console.log('[ClaudeAgent] Extracting structured data (legacy method)...');

    // Build prompt for structured extraction
    const fieldsDescription = Object.entries(schema.fields)
      .map(([key, field]) => `- ${key} (${field.type}): ${field.description}`)
      .join('\n');

    const prompt = `${schema.description}

請從以下文本中提取資訊，並以 JSON 格式返回。

欄位說明：
${fieldsDescription}

文本內容：
${text}

請直接返回 JSON 格式的結果，不要包含任何其他說明文字。`;

    const result = await this.sendMessage(prompt, {
      systemPrompt: options?.systemPrompt || '你是一個專業的資料提取專家，擅長從文本中提取結構化資訊。',
      maxTokens: options?.maxTokens || 4096,
      temperature: 0.3, // Lower temperature for more consistent extraction
    });

    if (!result.success || !result.content) {
      return result;
    }

    // Try to parse JSON from response
    try {
      // Extract JSON from markdown code blocks if present
      let jsonText = result.content.trim();
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const data = JSON.parse(jsonText);

      return {
        ...result,
        data,
      };
    } catch (error) {
      console.error('[ClaudeAgent] Failed to parse JSON from response:', error);
      return {
        success: false,
        error: 'Failed to parse JSON from Claude response',
      };
    }
  }
}

// Export singleton instances for different use cases
let haikuInstance: ClaudeAgent | null = null;
let sonnetInstance: ClaudeAgent | null = null;

/**
 * Get a shared Haiku instance (for simple extraction tasks)
 */
export function getHaikuAgent(): ClaudeAgent {
  if (!haikuInstance) {
    haikuInstance = new ClaudeAgent({ model: CLAUDE_MODELS.HAIKU });
  }
  return haikuInstance;
}

/**
 * Get a shared Sonnet instance (for complex reasoning tasks)
 */
export function getSonnetAgent(): ClaudeAgent {
  if (!sonnetInstance) {
    sonnetInstance = new ClaudeAgent({ model: CLAUDE_MODELS.SONNET });
  }
  return sonnetInstance;
}
