/**
 * PrintFriendly API 驗證測試
 */

import { describe, it, expect } from 'vitest';

describe('PrintFriendly API', () => {
  it('should have valid API key configured', async () => {
    const apiKey = process.env.PRINTFRIENDLY_API_KEY;
    
    // 確認 API Key 存在
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe('');
    expect(apiKey?.length).toBeGreaterThan(10);
    
    console.log('[PrintFriendly] API Key configured:', apiKey?.substring(0, 8) + '...');
  });
  
  it('should be able to call PrintFriendly API', async () => {
    const apiKey = process.env.PRINTFRIENDLY_API_KEY;
    
    if (!apiKey) {
      throw new Error('PRINTFRIENDLY_API_KEY not configured');
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
