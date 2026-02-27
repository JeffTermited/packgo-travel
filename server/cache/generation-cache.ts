/**
 * AI 行程生成快取系統
 * 
 * 分層快取策略：
 * - 完整結果快取：3 天（259200 秒）
 * - 配色方案快取：7 天（604800 秒）
 * - 爬取結果快取：1 天（86400 秒）
 * - DetailsSkill 結果快取：3 天（259200 秒）- P3 優化
 * 
 * 預期效益：
 * - 快取命中時響應時間 < 1 秒
 * - API 成本降低 30-40%
 */

import crypto from "crypto";
import redis from "../redis";

export interface CacheStats {
  totalKeys: number;
  fullResults: number;
  palettes: number;
  scrapes: number;
  memoryUsage: string;
}

export class GenerationCache {
  private prefix = "packgo";

  // ═══════════════════════════════════════════════════════
  // 1. 快取完整生成結果（3天）
  // ═══════════════════════════════════════════════════════
  async cacheFullResult(url: string, result: any): Promise<void> {
    const key = this.generateKey("full", url);
    try {
      await redis.setex(
        key,
        259200, // 3天
        JSON.stringify(result)
      );
      console.log(`✅ [Cache] 快取完整結果: ${this.truncateUrl(url)}`);
    } catch (error) {
      console.error(`❌ [Cache] 快取完整結果失敗:`, error);
    }
  }

  async getFullResult(url: string): Promise<any | null> {
    const key = this.generateKey("full", url);
    try {
      const cached = await redis.get(key);

      if (cached) {
        console.log(`🎯 [Cache] 完整結果快取命中: ${this.truncateUrl(url)}`);
        return JSON.parse(cached);
      }

      return null;
    } catch (error) {
      console.error(`❌ [Cache] 讀取完整結果失敗:`, error);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════
  // 2. 快取配色方案（7天）
  // ═══════════════════════════════════════════════════════
  async cacheColorPalette(destination: string, palette: any): Promise<void> {
    const key = this.generateKey("palette", destination.toLowerCase());
    try {
      await redis.setex(
        key,
        604800, // 7天
        JSON.stringify(palette)
      );
      console.log(`✅ [Cache] 快取配色方案: ${destination}`);
    } catch (error) {
      console.error(`❌ [Cache] 快取配色方案失敗:`, error);
    }
  }

  async getColorPalette(destination: string): Promise<any | null> {
    const key = this.generateKey("palette", destination.toLowerCase());
    try {
      const cached = await redis.get(key);
      if (cached) {
        console.log(`🎯 [Cache] 配色方案快取命中: ${destination}`);
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error(`❌ [Cache] 讀取配色方案失敗:`, error);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════
  // 3. 快取爬取結果（1天）
  // ═══════════════════════════════════════════════════════
  async cacheScrapeResult(url: string, data: any): Promise<void> {
    const key = this.generateKey("scrape", url);
    try {
      await redis.setex(
        key,
        86400, // 1天
        JSON.stringify(data)
      );
      console.log(`✅ [Cache] 快取爬取結果: ${this.truncateUrl(url)}`);
    } catch (error) {
      console.error(`❌ [Cache] 快取爬取結果失敗:`, error);
    }
  }

  async getScrapeResult(url: string): Promise<any | null> {
    const key = this.generateKey("scrape", url);
    try {
      const cached = await redis.get(key);
      if (cached) {
        console.log(`🎯 [Cache] 爬取結果快取命中: ${this.truncateUrl(url)}`);
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error(`❌ [Cache] 讀取爬取結果失敗:`, error);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════
  // 4. 快取 Hero 圖片（7天）
  // ═══════════════════════════════════════════════════════
  async cacheHeroImage(destination: string, imageData: any): Promise<void> {
    const key = this.generateKey("hero", destination.toLowerCase());
    try {
      await redis.setex(
        key,
        604800, // 7天
        JSON.stringify(imageData)
      );
      console.log(`✅ [Cache] 快取 Hero 圖片: ${destination}`);
    } catch (error) {
      console.error(`❌ [Cache] 快取 Hero 圖片失敗:`, error);
    }
  }

  async getHeroImage(destination: string): Promise<any | null> {
    const key = this.generateKey("hero", destination.toLowerCase());
    try {
      const cached = await redis.get(key);
      if (cached) {
        console.log(`🎯 [Cache] Hero 圖片快取命中: ${destination}`);
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error(`❌ [Cache] 讀取 Hero 圖片失敗:`, error);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════
  // 5. 快取 DetailsSkill 結果（3天）- P3 優化
  // ═══════════════════════════════════════════════════════
  async cacheDetailsResult(destination: string, detailsData: any): Promise<void> {
    const key = this.generateKey("details", destination.toLowerCase());
    try {
      await redis.setex(
        key,
        259200, // 3天
        JSON.stringify(detailsData)
      );
      console.log(`✅ [Cache] 快取 Details 結果: ${destination}`);
    } catch (error) {
      console.error(`❌ [Cache] 快取 Details 結果失敗:`, error);
    }
  }

  async getDetailsResult(destination: string): Promise<any | null> {
    const key = this.generateKey("details", destination.toLowerCase());
    try {
      const cached = await redis.get(key);
      if (cached) {
        console.log(`🎯 [Cache] Details 結果快取命中: ${destination}`);
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error(`❌ [Cache] 讀取 Details 結果失敗:`, error);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════
  // 輔助方法
  // ═══════════════════════════════════════════════════════
  private generateKey(type: string, value: string): string {
    const hash = crypto.createHash("md5").update(value).digest("hex");
    return `${this.prefix}:${type}:${hash}`;
  }

  private truncateUrl(url: string, maxLength: number = 50): string {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  }

  // 清除特定 URL 的所有快取
  async clearUrlCache(url: string): Promise<void> {
    const keys = [
      this.generateKey("full", url),
      this.generateKey("scrape", url),
    ];

    try {
      await redis.del(...keys);
      console.log(`🗑️ [Cache] 清除 URL 快取: ${this.truncateUrl(url)}`);
    } catch (error) {
      console.error(`❌ [Cache] 清除 URL 快取失敗:`, error);
    }
  }

  // 清除所有快取（用於測試）
  async clearAll(): Promise<number> {
    try {
      const keys = await redis.keys(`${this.prefix}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`🗑️ [Cache] 清除 ${keys.length} 個快取`);
        return keys.length;
      }
      return 0;
    } catch (error) {
      console.error(`❌ [Cache] 清除所有快取失敗:`, error);
      return 0;
    }
  }

  // 獲取快取統計
  async getStats(): Promise<CacheStats> {
    try {
      const allKeys = await redis.keys(`${this.prefix}:*`);
      const info = await redis.info("memory");
      const memoryMatch = info.match(/used_memory_human:(\S+)/);

      return {
        totalKeys: allKeys.length,
        fullResults: allKeys.filter((k) => k.includes(":full:")).length,
        palettes: allKeys.filter((k) => k.includes(":palette:")).length,
        scrapes: allKeys.filter((k) => k.includes(":scrape:")).length,
        memoryUsage: memoryMatch ? memoryMatch[1] : "unknown",
      };
    } catch (error) {
      console.error(`❌ [Cache] 獲取統計失敗:`, error);
      return {
        totalKeys: 0,
        fullResults: 0,
        palettes: 0,
        scrapes: 0,
        memoryUsage: "error",
      };
    }
  }

  // 檢查快取是否存在
  async exists(type: "full" | "scrape" | "palette" | "hero" | "details", key: string): Promise<boolean> {
    const cacheKey = this.generateKey(type, type === "full" || type === "scrape" ? key : key.toLowerCase());
    try {
      const exists = await redis.exists(cacheKey);
      return exists === 1;
    } catch (error) {
      return false;
    }
  }

  // 獲取快取剩餘 TTL（秒）
  async getTTL(type: "full" | "scrape" | "palette" | "hero" | "details", key: string): Promise<number> {
    const cacheKey = this.generateKey(type, type === "full" || type === "scrape" ? key : key.toLowerCase());
    try {
      return await redis.ttl(cacheKey);
    } catch (error) {
      return -1;
    }
  }
}

// 單例模式
const generationCache = new GenerationCache();
export default generationCache;
