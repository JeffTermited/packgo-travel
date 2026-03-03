import { describe, it, expect } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';

/**
 * API Keys Validation
 * Note: Firecrawl has been removed from this project (replaced by PDF-first approach).
 * Live API tests are skipped when the key is not available (e.g., CI environment).
 */
describe('API Keys Validation', () => {
  it('should have ANTHROPIC_API_KEY configured if present', () => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      expect(typeof apiKey).toBe('string');
      expect(apiKey.length).toBeGreaterThan(10);
    } else {
      console.warn('[api-keys.test] ANTHROPIC_API_KEY not set in this environment, skipping live check');
    }
  });

  it.skipIf(!process.env.ANTHROPIC_API_KEY)(
    'should be able to call Anthropic API (skipped when key not available)',
    async () => {
      const apiKey = process.env.ANTHROPIC_API_KEY!;
      const anthropic = new Anthropic({ apiKey });

      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Say "Hello" in one word.' }],
      });

      expect(message).toBeDefined();
      expect(message.content.length).toBeGreaterThan(0);
      expect(message.content[0].type).toBe('text');
    },
    30000
  );
});
