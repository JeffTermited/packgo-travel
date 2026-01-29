import { describe, it, expect } from 'vitest';
import { ClaudeAgent } from './claudeAgent';

describe('ClaudeAgent', () => {
  const agent = new ClaudeAgent();

  it('should send a simple message to Claude', async () => {
    const result = await agent.sendMessage('請用一句話介紹台灣。', {
      systemPrompt: '你是一個專業的旅遊顧問。',
      maxTokens: 200,
    });

    console.log('[Test] Claude result:', {
      success: result.success,
      contentLength: result.content?.length,
      usage: result.usage,
      content: result.content?.substring(0, 100),
      error: result.error,
    });

    expect(result.success).toBe(true);
    expect(result.content).toBeTruthy();
    expect(result.content!.length).toBeGreaterThan(10);
    expect(result.usage).toBeDefined();
    expect(result.usage!.inputTokens).toBeGreaterThan(0);
    expect(result.usage!.outputTokens).toBeGreaterThan(0);
  }, 30000);

  it('should extract structured data from tour description', async () => {
    const tourText = `
新馬旅遊｜紫竹谷.馬六甲文化遺產.六宮格下午茶.棕櫚水上渡假村.無購物五日

行程特色：
- 探訪馬六甲世界文化遺產
- 入住棕櫚水上渡假村
- 品嚐六宮格下午茶
- 無購物行程，輕鬆自在

價格：NT$ 35,900 起
天數：5天4夜
目的地：新加坡、馬來西亞
    `;

    const result = await agent.extractStructuredData(
      tourText,
      {
        description: '從旅遊行程描述中提取關鍵資訊',
        fields: {
          title: { type: 'string', description: '行程標題' },
          price: { type: 'number', description: '價格（數字，不含貨幣符號）' },
          days: { type: 'number', description: '天數' },
          countries: { type: 'array', description: '目的地國家列表' },
          highlights: { type: 'array', description: '行程特色列表' },
        },
      },
      {
        maxTokens: 1000,
      }
    );

    console.log('[Test] Structured extraction result:', {
      success: result.success,
      data: result.data,
      usage: result.usage,
      error: result.error,
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.title).toBeTruthy();
    expect(result.data.price).toBeGreaterThan(0);
    expect(result.data.days).toBe(5);
    expect(Array.isArray(result.data.countries)).toBe(true);
    expect(Array.isArray(result.data.highlights)).toBe(true);
  }, 30000);
});
