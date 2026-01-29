import { describe, it, expect } from 'vitest';
import { FirecrawlAgent } from './firecrawlAgent';

describe('FirecrawlAgent', () => {
  const agent = new FirecrawlAgent();
  const testUrl = 'https://travel.liontravel.com/detail?NormGroupID=ac60c50a-372a-4d7f-a7a4-afd4f93a5b6a&Platform=APP&GroupID=26SS326BRH-T';

  it('should scrape Lion Travel tour page', async () => {
    const result = await agent.scrape(testUrl);

    console.log('[Test] Firecrawl result:', {
      success: result.success,
      markdownLength: result.markdown?.length,
      hasMetadata: !!result.metadata,
      title: result.metadata?.title,
      error: result.error,
    });

    expect(result.success).toBe(true);
    expect(result.markdown).toBeTruthy();
    expect(result.markdown!.length).toBeGreaterThan(100);
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.title).toBeTruthy();
  }, 60000); // 60 seconds timeout

  it('should extract JSON-LD from Lion Travel page', async () => {
    const jsonLd = await agent.extractJsonLd(testUrl);

    console.log('[Test] JSON-LD result:', {
      found: !!jsonLd,
      count: jsonLd?.length,
      types: jsonLd?.map((item: any) => item['@type']),
    });

    // JSON-LD may or may not exist, so we just log the result
    if (jsonLd) {
      expect(Array.isArray(jsonLd)).toBe(true);
      expect(jsonLd.length).toBeGreaterThan(0);
    }
  }, 60000);
});
