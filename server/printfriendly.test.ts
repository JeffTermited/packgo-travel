/**
 * PrintFriendly API 驗證測試
 */

import { describe, it, expect } from 'vitest';

describe('PrintFriendly API', () => {
  it('should have valid API key configured if present', async () => {
    const apiKey = process.env.PRINTFRIENDLY_API_KEY;
    
    if (!apiKey) {
      // PRINTFRIENDLY_API_KEY is optional in this environment
      console.warn('[PrintFriendly] PRINTFRIENDLY_API_KEY not configured, skipping validation');
      return;
    }
    
    expect(typeof apiKey).toBe('string');
    expect(apiKey.length).toBeGreaterThan(10);
    
    console.log('[PrintFriendly] API Key configured:', apiKey.substring(0, 8) + '...');
  });
  
  it.skipIf(!process.env.PRINTFRIENDLY_API_KEY)('should be able to call PrintFriendly API (skipped when key not available)', async () => {
    const apiKey = process.env.PRINTFRIENDLY_API_KEY;
    
    if (!apiKey) {
      return; // handled by skipIf
    }
    
    // 使用簡單的測試 URL 來驗證 API
    const testUrl = 'https://example.com';
    
    const response = await fetch(
      `https://api.printfriendly.com/v2/pdf/create?api_key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
        body: `page_url=${encodeURIComponent(testUrl)}`,
      }
    );
    
    const data = await response.json();
    
    console.log('[PrintFriendly] API Response:', data);
    
    // 驗證回應
    expect(response.ok).toBe(true);
    expect(data.status).toBe('success');
    expect(data.file_url).toBeDefined();
    expect(data.file_url).toContain('printfriendly.com');
  }, 30000); // 30 秒超時
});
