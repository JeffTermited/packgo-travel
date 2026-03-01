/**
 * Exchange Rate Agent
 * 
 * 匯率代理服務，負責獲取即時匯率並提供貨幣轉換功能。
 * 使用免費的 ExchangeRate-API 服務。
 * 
 * 功能：
 * 1. 獲取即時匯率（支援 TWD, USD, EUR, JPY 等主要貨幣）
 * 2. 三層快取機制：Redis（1小時 TTL）→ 記憶體 → 備用靜態匯率
 * 3. 貨幣轉換計算
 */

import { redis as redisClient } from '../redis';

// 支援的貨幣類型
export type SupportedCurrency = 'TWD' | 'USD' | 'EUR' | 'JPY' | 'CNY' | 'HKD' | 'KRW' | 'SGD' | 'GBP' | 'AUD';

// 匯率資料結構
interface ExchangeRateData {
  base: string;
  rates: Record<string, number>;
  lastUpdated: number; // Unix timestamp
}

// 快取設定
const CACHE_TTL_SECONDS = 3600; // 1 小時 (秒，用於 Redis)
const CACHE_TTL_MS = CACHE_TTL_SECONDS * 1000; // 1 小時 (毫秒，用於記憶體)
const REDIS_CACHE_KEY = 'exchange_rates:usd_base';

// 免費匯率 API (ExchangeRate-API 免費方案)
const EXCHANGE_RATE_API_URL = 'https://open.er-api.com/v6/latest/USD';

// 記憶體快取（Redis 不可用時的降級方案）
let memoryCache: ExchangeRateData | null = null;

/**
 * 從 API 獲取最新匯率
 */
async function fetchExchangeRates(): Promise<ExchangeRateData> {
  try {
    console.log('[ExchangeRateAgent] Fetching latest exchange rates from API...');
    
    const response = await fetch(EXCHANGE_RATE_API_URL);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.result !== 'success') {
      throw new Error('API returned unsuccessful result');
    }
    
    const exchangeRateData: ExchangeRateData = {
      base: 'USD',
      rates: data.rates,
      lastUpdated: Date.now()
    };
    
    console.log('[ExchangeRateAgent] Successfully fetched exchange rates');
    console.log(`[ExchangeRateAgent] USD to TWD: ${data.rates.TWD}`);
    console.log(`[ExchangeRateAgent] USD to JPY: ${data.rates.JPY}`);
    
    return exchangeRateData;
  } catch (error) {
    console.error('[ExchangeRateAgent] Error fetching exchange rates:', error);
    
    // 返回備用匯率（當 API 不可用時）
    return getFallbackRates();
  }
}

/**
 * 備用匯率（當 API 不可用時使用）
 * 這些是大約的匯率，僅供緊急情況使用
 */
function getFallbackRates(): ExchangeRateData {
  console.log('[ExchangeRateAgent] Using fallback exchange rates');
  
  return {
    base: 'USD',
    rates: {
      USD: 1,
      TWD: 32.5,  // 約略匯率
      EUR: 0.92,
      JPY: 150,
      CNY: 7.25,
      HKD: 7.85,
      KRW: 1350,
      SGD: 1.35,
      GBP: 0.79,
      AUD: 1.55
    },
    lastUpdated: Date.now()
  };
}

/**
 * 獲取匯率（三層快取：Redis → 記憶體 → API → 備用靜態匯率）
 */
export async function getExchangeRates(): Promise<ExchangeRateData> {
  // 層一：檢查 Redis 快取
  try {
    const cached = await redisClient.get(REDIS_CACHE_KEY);
    if (cached) {
      const parsed: ExchangeRateData = JSON.parse(cached);
      console.log('[ExchangeRateAgent] ✅ Redis cache HIT');
      // 同步更新記憶體快取
      memoryCache = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('[ExchangeRateAgent] Redis read failed, falling back to memory cache:', err);
  }

  // 層二：檢查記憶體快取
  if (memoryCache && (Date.now() - memoryCache.lastUpdated) < CACHE_TTL_MS) {
    console.log('[ExchangeRateAgent] 💾 Memory cache HIT');
    return memoryCache;
  }

  // 層三：從 API 獲取最新匯率
  const rates = await fetchExchangeRates();

  // 寫入記憶體快取
  memoryCache = rates;

  // 寫入 Redis 快取（失敗不阻斷流程）
  try {
    await redisClient.setex(REDIS_CACHE_KEY, CACHE_TTL_SECONDS, JSON.stringify(rates));
    console.log('[ExchangeRateAgent] 💾 Cached to Redis (TTL: 1h)');
  } catch (err) {
    console.warn('[ExchangeRateAgent] Redis write failed (non-critical):', err);
  }

  return rates;
}

/**
 * 轉換貨幣
 * @param amount 金額
 * @param fromCurrency 來源貨幣
 * @param toCurrency 目標貨幣
 * @returns 轉換後的金額
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const rates = await getExchangeRates();
  
  // 先轉換為 USD，再轉換為目標貨幣
  const fromRate = rates.rates[fromCurrency] || 1;
  const toRate = rates.rates[toCurrency] || 1;
  
  // amount / fromRate = USD amount
  // USD amount * toRate = target currency amount
  const convertedAmount = (amount / fromRate) * toRate;
  
  // 根據貨幣類型決定小數位數
  const decimals = getDecimalPlaces(toCurrency);
  return Math.round(convertedAmount * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * 獲取貨幣的小數位數
 */
function getDecimalPlaces(currency: SupportedCurrency): number {
  switch (currency) {
    case 'JPY':
    case 'KRW':
    case 'TWD':
      return 0; // 這些貨幣通常不顯示小數
    default:
      return 2;
  }
}

/**
 * 獲取特定貨幣對的匯率
 */
export async function getExchangeRate(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  
  const rates = await getExchangeRates();
  
  const fromRate = rates.rates[fromCurrency] || 1;
  const toRate = rates.rates[toCurrency] || 1;
  
  return toRate / fromRate;
}

/**
 * 格式化貨幣顯示
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency,
  locale: string = 'zh-TW'
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: getDecimalPlaces(currency),
    maximumFractionDigits: getDecimalPlaces(currency)
  });
  
  return formatter.format(amount);
}

/**
 * 獲取貨幣符號
 */
export function getCurrencySymbol(currency: SupportedCurrency): string {
  const symbols: Record<SupportedCurrency, string> = {
    TWD: 'NT$',
    USD: '$',
    EUR: '€',
    JPY: '¥',
    CNY: '¥',
    HKD: 'HK$',
    KRW: '₩',
    SGD: 'S$',
    GBP: '£',
    AUD: 'A$'
  };
  
  return symbols[currency] || currency;
}

/**
 * 批量轉換價格
 * 用於一次性轉換多個行程的價格
 */
export async function convertPrices(
  prices: Array<{ id: number; price: number; priceCurrency: SupportedCurrency }>,
  targetCurrency: SupportedCurrency
): Promise<Array<{ id: number; originalPrice: number; convertedPrice: number; rate: number }>> {
  const rates = await getExchangeRates();
  
  return prices.map(item => {
    const fromRate = rates.rates[item.priceCurrency] || 1;
    const toRate = rates.rates[targetCurrency] || 1;
    const rate = toRate / fromRate;
    
    const convertedPrice = Math.round((item.price / fromRate) * toRate);
    
    return {
      id: item.id,
      originalPrice: item.price,
      convertedPrice,
      rate
    };
  });
}

// 導出類型
export type { ExchangeRateData };
