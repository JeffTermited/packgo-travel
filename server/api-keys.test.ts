import { describe, it, expect } from 'vitest';
import Firecrawl from '@mendable/firecrawl-js';
import Anthropic from '@anthropic-ai/sdk';

describe('API Keys Validation', () => {
  it('should validate Firecrawl API key', async () => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toBeTruthy();

    // Test Firecrawl API connection
    const firecrawl = new Firecrawl({ apiKey: apiKey! });
    
    // Simple test: scrape a lightweight page (Firecrawl v2 uses scrape() not scrapeUrl())
    const result = await firecrawl.scrape('https://example.com', {
      formats: ['markdown'],
      onlyMainContent: true,
    });

    expect(result).toBeDefined();
    expect(result.markdown).toBeTruthy();
  }, 30000); // 30 seconds timeout

  it('should validate Anthropic API key', async () => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toBeTruthy();

    // Test Claude API connection
    const anthropic = new Anthropic({ apiKey: apiKey! });
    
    // Simple test: send a minimal message
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: 'Say "Hello" in one word.',
          },
        ],
      });

      expect(message).toBeDefined();
      expect(message.content).toBeDefined();
      expect(message.content.length).toBeGreaterThan(0);
      expect(message.content[0].type).toBe('text');
    } catch (error: any) {
      // Provide more detailed error message
      throw new Error(`Claude API error: ${error.message}`);
    }
  }, 30000); // 30 seconds timeout
});
