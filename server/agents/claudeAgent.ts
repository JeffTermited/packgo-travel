/**
 * Claude Agent
 * Uses Anthropic Claude API for content analysis and generation
 * 
 * Advantages:
 * - 200K token context (vs GPT-4's 128K)
 * - Excellent structured output
 * - Strong reasoning capabilities
 * - Better multilingual support (Chinese + English)
 * - Cost-effective ($3/1M input, $15/1M output)
 */

import Anthropic from '@anthropic-ai/sdk';

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

export class ClaudeAgent {
  private client: Anthropic;
  private model: string;

  constructor(options?: { model?: string }) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    this.client = new Anthropic({ apiKey });
    // Use Claude 3 Haiku for fast, cost-effective processing
    // Can upgrade to Claude 3.5 Sonnet for better quality if needed
    this.model = options?.model || 'claude-3-haiku-20240307';
    
    console.log(`[ClaudeAgent] Initialized with model: ${this.model}`);
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
   * Extract structured data from text using Claude
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
    console.log('[ClaudeAgent] Extracting structured data...');

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
