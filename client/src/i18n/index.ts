import { zhTW } from './zh-TW';
import { en } from './en';
import type { Language } from '@/contexts/LocaleContext';

// 翻譯資源（僅支援繁體中文和英文）
export const translations = {
  'zh-TW': zhTW,
  'en': en,
} as const;

export type TranslationKeys = typeof zhTW;

// 獲取嵌套物件的值（字串）
function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[key];
  }
  
  return typeof current === 'string' ? current : undefined;
}

// 獲取嵌套物件的值（陣列）
function getNestedArrayValue(obj: any, path: string): string[] | undefined {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[key];
  }
  
  return Array.isArray(current) ? current as string[] : undefined;
}

// 翻譯函數（回傳字串）
export function translate(
  key: string,
  language: Language,
  params?: Record<string, string | number>
): string {
  const translation = translations[language];
  let text = getNestedValue(translation, key);
  
  // 如果找不到翻譯，嘗試使用繁體中文
  if (text === undefined && language !== 'zh-TW') {
    text = getNestedValue(translations['zh-TW'], key);
  }
  
  // 如果還是找不到，返回 key
  if (text === undefined) {
    console.warn(`[i18n] Missing translation for key: ${key}`);
    return key;
  }
  
  // 替換參數
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text!.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
    });
  }
  
  return text;
}

// 翻譯函數（回傳陣列）
export function translateArray(
  key: string,
  language: Language
): string[] {
  const translation = translations[language];
  let arr = getNestedArrayValue(translation, key);
  
  // 如果找不到翻譯，嘗試使用繁體中文
  if (arr === undefined && language !== 'zh-TW') {
    arr = getNestedArrayValue(translations['zh-TW'], key);
  }
  
  // 如果還是找不到，返回空陣列並警告
  if (arr === undefined) {
    console.warn(`[i18n] Missing array translation for key: ${key}`);
    return [];
  }
  
  return arr;
}

export { zhTW, en };
