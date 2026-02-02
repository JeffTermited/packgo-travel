import { invokeLLM } from "./_core/llm";

// 翻譯快取（記憶體內）
const translationCache = new Map<string, string>();

// 支援的語言
type Language = 'zh-TW' | 'en' | 'es';

// 語言名稱對應
const languageFullNames: Record<Language, string> = {
  'zh-TW': 'Traditional Chinese (Taiwan)',
  'en': 'English',
  'es': 'Spanish',
};

/**
 * AI 翻譯 Agent - 使用 LLM 進行高品質翻譯
 */
export async function translateText(
  text: string,
  targetLanguage: Language,
  sourceLanguage: Language = 'zh-TW'
): Promise<string> {
  // 如果目標語言和來源語言相同，直接返回
  if (targetLanguage === sourceLanguage) {
    return text;
  }

  // 檢查快取
  const cacheKey = `${sourceLanguage}:${targetLanguage}:${text}`;
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a professional translator specializing in travel and tourism content. 
Your task is to translate text from ${languageFullNames[sourceLanguage]} to ${languageFullNames[targetLanguage]}.

Guidelines:
- Maintain the original meaning and tone
- Use natural, fluent expressions in the target language
- Keep proper nouns (place names, brand names) appropriately translated or transliterated
- For travel-related terms, use industry-standard terminology
- Preserve any formatting (line breaks, punctuation)
- Only output the translated text, nothing else`
        },
        {
          role: "user",
          content: text
        }
      ],
    });

    const content = response.choices[0]?.message?.content;
    const translatedText = typeof content === 'string' ? content.trim() : text;
    
    // 儲存到快取
    translationCache.set(cacheKey, translatedText);
    
    return translatedText;
  } catch (error) {
    console.error('[Translation Agent] Error:', error);
    // 翻譯失敗時返回原文
    return text;
  }
}

/**
 * 批量翻譯多個文字
 */
export async function translateBatch(
  texts: string[],
  targetLanguage: Language,
  sourceLanguage: Language = 'zh-TW'
): Promise<string[]> {
  const results = await Promise.all(
    texts.map(text => translateText(text, targetLanguage, sourceLanguage))
  );
  return results;
}

/**
 * 翻譯物件中的指定欄位
 */
export async function translateObject<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
  targetLanguage: Language,
  sourceLanguage: Language = 'zh-TW'
): Promise<T> {
  const result = { ...obj };
  
  for (const field of fields) {
    const value = obj[field];
    if (typeof value === 'string') {
      (result as any)[field] = await translateText(value, targetLanguage, sourceLanguage);
    }
  }
  
  return result;
}

/**
 * 清除翻譯快取
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * 獲取快取統計
 */
export function getTranslationCacheStats(): { size: number; keys: string[] } {
  return {
    size: translationCache.size,
    keys: Array.from(translationCache.keys()),
  };
}
