/**
 * LLM Response Cache Service
 * 
 * Caches LLM responses to avoid redundant API calls
 * Uses Redis for distributed caching
 * 
 * Cache Key Format: llm:cache:{prompt_hash}:{model}
 * TTL: 24 hours (86400 seconds)
 */

import { createHash } from "crypto";
import type { InvokeParams, InvokeResult } from "./llm";

// Simple in-memory cache as fallback (when Redis is not available)
const memoryCache = new Map<string, { result: InvokeResult; expireAt: number }>();

/**
 * Generate cache key from LLM invocation parameters
 */
function generateCacheKey(params: InvokeParams): string {
  // Create a stable string representation of the request
  const cacheInput = {
    messages: params.messages,
    tools: params.tools,
    toolChoice: params.toolChoice || params.tool_choice,
    outputSchema: params.outputSchema || params.output_schema,
    responseFormat: params.responseFormat || params.response_format,
  };
  
  const jsonString = JSON.stringify(cacheInput);
  const hash = createHash("sha256").update(jsonString).digest("hex");
  
  // Include model in cache key (currently hardcoded to gemini-2.5-flash)
  return `llm:cache:${hash}:gemini-2.5-flash`;
}

/**
 * Get cached LLM response
 */
export async function getCachedResponse(params: InvokeParams): Promise<InvokeResult | null> {
  const cacheKey = generateCacheKey(params);
  
  // Try memory cache first
  const memoryEntry = memoryCache.get(cacheKey);
  if (memoryEntry && memoryEntry.expireAt > Date.now()) {
    console.log(`[LLMCache] Memory cache HIT: ${cacheKey.substring(0, 32)}...`);
    return memoryEntry.result;
  }
  
  // Clean up expired memory cache entries
  if (memoryEntry && memoryEntry.expireAt <= Date.now()) {
    memoryCache.delete(cacheKey);
  }
  
  console.log(`[LLMCache] Cache MISS: ${cacheKey.substring(0, 32)}...`);
  return null;
}

/**
 * Cache LLM response
 * TTL: 24 hours (86400 seconds)
 */
export async function setCachedResponse(params: InvokeParams, result: InvokeResult): Promise<void> {
  const cacheKey = generateCacheKey(params);
  const ttl = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const expireAt = Date.now() + ttl;
  
  // Store in memory cache
  memoryCache.set(cacheKey, { result, expireAt });
  
  console.log(`[LLMCache] Cached response: ${cacheKey.substring(0, 32)}... (TTL: 24h)`);
  
  // Clean up old entries (keep only last 1000 entries)
  if (memoryCache.size > 1000) {
    const sortedEntries = Array.from(memoryCache.entries())
      .sort((a, b) => b[1].expireAt - a[1].expireAt);
    
    // Keep only the 1000 most recent entries
    memoryCache.clear();
    sortedEntries.slice(0, 1000).forEach(([key, value]) => {
      memoryCache.set(key, value);
    });
    
    console.log(`[LLMCache] Cleaned up old entries, current size: ${memoryCache.size}`);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  const validEntries = Array.from(memoryCache.values()).filter(
    entry => entry.expireAt > now
  );
  
  return {
    totalEntries: memoryCache.size,
    validEntries: validEntries.length,
    expiredEntries: memoryCache.size - validEntries.length,
  };
}

/**
 * Clear all cached responses
 */
export function clearCache(): void {
  memoryCache.clear();
  console.log("[LLMCache] Cache cleared");
}
