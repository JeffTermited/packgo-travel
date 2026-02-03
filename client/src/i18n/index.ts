import { zhTW } from './zh-TW';
import { en } from './en';
import { es } from './es';
import type { Language } from '@/contexts/LocaleContext';

// 翻譯資源
export const translations = {
  'zh-TW': zhTW,
  'en': en,
  'es': es,
} as const;

export type TranslationKeys = typeof zhTW;

// 獲取嵌套物件的值
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

// 翻譯函數
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

export { zhTW, en, es };
