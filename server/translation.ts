import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { translations, translationJobs } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// 翻譯快取（記憶體內）
const translationCache = new Map<string, string>();

// 支援的語言
export type Language = 'zh-TW' | 'en' | 'es' | 'ja' | 'ko';

// 語言名稱對應
const languageFullNames: Record<Language, string> = {
  'zh-TW': 'Traditional Chinese (Taiwan)',
  'en': 'English',
  'es': 'Spanish',
  'ja': 'Japanese',
  'ko': 'Korean',
};

// 語言原生名稱
const languageNativeNames: Record<Language, string> = {
  'zh-TW': '繁體中文',
  'en': 'English',
  'es': 'Español',
  'ja': '日本語',
  'ko': '한국어',
};

/**
 * Translation Agent - 使用 Claude API 進行高品質翻譯
 * 專為旅遊內容優化，支援多語言翻譯
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

  // 空字串或純空白直接返回
  if (!text || !text.trim()) {
    return text;
  }

  // 檢查快取
  const cacheKey = getCacheKey(text, sourceLanguage, targetLanguage);
  const cached = translationCache.get(cacheKey);
  if (cached) {
    console.log('[Translation Agent] Cache hit');
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
  if (texts.length === 0) return [];
  
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
 * 翻譯行程內容
 * 將行程的標題、描述、每日行程等內容翻譯到指定語言
 */
export async function translateTour(
  tourId: number,
  targetLanguages: Language[],
  sourceLanguage: Language = 'zh-TW',
  userId: number
): Promise<{
  success: boolean;
  translatedLanguages: Language[];
  errors: string[];
}> {
  const db = await getDb();
  if (!db) {
    return { success: false, translatedLanguages: [], errors: ['Database not available'] };
  }

  const errors: string[] = [];
  const translatedLanguages: Language[] = [];

  try {
    // 獲取行程資料
    const { tours } = await import('../drizzle/schema');
    const [tour] = await db.select().from(tours).where(eq(tours.id, tourId));
    
    if (!tour) {
      return { success: false, translatedLanguages: [], errors: ['Tour not found'] };
    }

    // 需要翻譯的欄位
    const fieldsToTranslate = [
      { name: 'title', value: tour.title },
      { name: 'description', value: tour.description },
      { name: 'highlights', value: tour.highlights },
      { name: 'includes', value: tour.includes },
      { name: 'excludes', value: tour.excludes },
      { name: 'notes', value: tour.notes },
    ];

    for (const targetLang of targetLanguages) {
      if (targetLang === sourceLanguage) continue;

      try {
        for (const field of fieldsToTranslate) {
          if (!field.value) continue;

          const translatedText = await translateText(
            field.value,
            targetLang,
            sourceLanguage
          );

          // 儲存翻譯到資料庫
          await saveTranslation({
            entityType: 'tour',
            entityId: tourId,
            fieldName: field.name,
            sourceLanguage,
            targetLanguage: targetLang,
            originalText: field.value,
            translatedText,
            translatedBy: `user:${userId}`,
          });
        }

        // 翻譯每日行程（如果有）
        if (tour.dailyItinerary) {
          const dailyItinerary = typeof tour.dailyItinerary === 'string' 
            ? JSON.parse(tour.dailyItinerary) 
            : tour.dailyItinerary;

          if (Array.isArray(dailyItinerary)) {
            const translatedItinerary = await Promise.all(
              dailyItinerary.map(async (day: any) => ({
                ...day,
                title: day.title ? await translateText(day.title, targetLang, sourceLanguage) : day.title,
                description: day.description ? await translateText(day.description, targetLang, sourceLanguage) : day.description,
                activities: day.activities ? await Promise.all(
                  day.activities.map(async (activity: any) => ({
                    ...activity,
                    name: activity.name ? await translateText(activity.name, targetLang, sourceLanguage) : activity.name,
                    description: activity.description ? await translateText(activity.description, targetLang, sourceLanguage) : activity.description,
                  }))
                ) : day.activities,
              }))
            );

            await saveTranslation({
              entityType: 'tour',
              entityId: tourId,
              fieldName: 'dailyItinerary',
              sourceLanguage,
              targetLanguage: targetLang,
              originalText: JSON.stringify(dailyItinerary),
              translatedText: JSON.stringify(translatedItinerary),
              translatedBy: `user:${userId}`,
            });
          }
        }

        translatedLanguages.push(targetLang);
        console.log(`[Translation Agent] Tour ${tourId} translated to ${targetLang}`);
      } catch (langError) {
        const errorMsg = `Failed to translate to ${targetLang}: ${langError}`;
        errors.push(errorMsg);
        console.error(`[Translation Agent] ${errorMsg}`);
      }
    }

    return {
      success: errors.length === 0,
      translatedLanguages,
      errors,
    };
  } catch (error) {
    const errorMsg = `Translation failed: ${error}`;
    errors.push(errorMsg);
    console.error(`[Translation Agent] ${errorMsg}`);
    return { success: false, translatedLanguages, errors };
  }
}

/**
 * 儲存翻譯到資料庫
 */
async function saveTranslation(data: {
  entityType: 'tour' | 'tour_departure' | 'page' | 'ui_element' | 'notification';
  entityId: number;
  fieldName: string;
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  translatedText: string;
  translatedBy?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error('[Translation Agent] Database not available');
    return;
  }

  try {
    // 檢查是否已存在
    const existing = await db.select().from(translations).where(
      and(
        eq(translations.entityType, data.entityType),
        eq(translations.entityId, data.entityId),
        eq(translations.fieldName, data.fieldName),
        eq(translations.targetLanguage, data.targetLanguage)
      )
    );

    if (existing.length > 0) {
      // 更新現有翻譯
      await db.update(translations).set({
        translatedText: data.translatedText,
        translatedBy: data.translatedBy,
        updatedAt: new Date(),
      }).where(eq(translations.id, existing[0].id));
    } else {
      // 插入新翻譯
      await db.insert(translations).values({
        entityType: data.entityType,
        entityId: data.entityId,
        fieldName: data.fieldName,
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
        originalText: data.originalText,
        translatedText: data.translatedText,
        translatedBy: data.translatedBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('[Translation Agent] Failed to save translation:', error);
  }
}

/**
 * 獲取行程的翻譯內容
 */
export async function getTourTranslations(
  tourId: number,
  targetLanguage: Language
): Promise<Record<string, string>> {
  const db = await getDb();
  if (!db) return {};

  try {
    const results = await db.select().from(translations).where(
      and(
        eq(translations.entityType, 'tour'),
        eq(translations.entityId, tourId),
        eq(translations.targetLanguage, targetLanguage)
      )
    );

    const translationMap: Record<string, string> = {};
    for (const row of results) {
      translationMap[row.fieldName] = row.translatedText;
    }
    return translationMap;
  } catch (error) {
    console.error('[Translation Agent] Failed to get tour translations:', error);
    return {};
  }
}

/**
 * 獲取行程的所有語言翻譯
 */
export async function getAllTourTranslations(
  tourId: number
): Promise<Record<Language, Record<string, string>>> {
  const db = await getDb();
  if (!db) return {} as Record<Language, Record<string, string>>;

  try {
    const results = await db.select().from(translations).where(
      and(
        eq(translations.entityType, 'tour'),
        eq(translations.entityId, tourId)
      )
    );

    const translationsByLang: Record<Language, Record<string, string>> = {} as any;
    for (const row of results) {
      const lang = row.targetLanguage as Language;
      if (!translationsByLang[lang]) {
        translationsByLang[lang] = {};
      }
      translationsByLang[lang][row.fieldName] = row.translatedText;
    }
    return translationsByLang;
  } catch (error) {
    console.error('[Translation Agent] Failed to get all tour translations:', error);
    return {} as Record<Language, Record<string, string>>;
  }
}

/**
 * 創建翻譯任務
 */
export async function createTranslationJob(data: {
  jobType: 'tour_full' | 'tour_update' | 'batch_tours' | 'ui_elements' | 'custom';
  entityType?: string;
  entityIds?: number[];
  targetLanguages: Language[];
  createdBy: number;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const [result] = await db.insert(translationJobs).values({
    jobType: data.jobType,
    entityType: data.entityType,
    entityIds: data.entityIds ? JSON.stringify(data.entityIds) : null,
    targetLanguages: JSON.stringify(data.targetLanguages),
    totalItems: data.entityIds?.length || 1,
    status: 'pending',
    createdBy: data.createdBy,
    createdAt: new Date(),
  });

  return result.insertId;
}

/**
 * 更新翻譯任務狀態
 */
export async function updateTranslationJobStatus(
  jobId: number,
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial',
  updates?: {
    completedItems?: number;
    failedItems?: number;
    results?: any;
    errors?: string[];
    processingTimeMs?: number;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const updateData: any = { status };
  
  if (status === 'processing' && !updates?.completedItems) {
    updateData.startedAt = new Date();
  }
  
  if (status === 'completed' || status === 'failed' || status === 'partial') {
    updateData.completedAt = new Date();
  }

  if (updates) {
    if (updates.completedItems !== undefined) updateData.completedItems = updates.completedItems;
    if (updates.failedItems !== undefined) updateData.failedItems = updates.failedItems;
    if (updates.results !== undefined) updateData.results = JSON.stringify(updates.results);
    if (updates.errors !== undefined) updateData.errors = JSON.stringify(updates.errors);
    if (updates.processingTimeMs !== undefined) updateData.processingTimeMs = updates.processingTimeMs;
  }

  await db.update(translationJobs).set(updateData).where(eq(translationJobs.id, jobId));
}

/**
 * 批量翻譯多個行程
 */
export async function translateMultipleTours(
  tourIds: number[],
  targetLanguages: Language[],
  userId: number
): Promise<{
  jobId: number;
  success: boolean;
  results: Array<{ tourId: number; success: boolean; languages: Language[]; errors: string[] }>;
}> {
  // 創建翻譯任務
  const jobId = await createTranslationJob({
    jobType: 'batch_tours',
    entityType: 'tour',
    entityIds: tourIds,
    targetLanguages,
    createdBy: userId,
  });

  const startTime = Date.now();
  await updateTranslationJobStatus(jobId, 'processing');

  const results: Array<{ tourId: number; success: boolean; languages: Language[]; errors: string[] }> = [];
  let completedCount = 0;
  let failedCount = 0;

  for (const tourId of tourIds) {
    const result = await translateTour(tourId, targetLanguages, 'zh-TW', userId);
    results.push({
      tourId,
      success: result.success,
      languages: result.translatedLanguages,
      errors: result.errors,
    });

    if (result.success) {
      completedCount++;
    } else {
      failedCount++;
    }

    // 更新進度
    await updateTranslationJobStatus(jobId, 'processing', {
      completedItems: completedCount,
      failedItems: failedCount,
    });
  }

  const processingTimeMs = Date.now() - startTime;
  const allErrors = results.flatMap(r => r.errors);

  await updateTranslationJobStatus(
    jobId,
    failedCount === 0 ? 'completed' : failedCount === tourIds.length ? 'failed' : 'partial',
    {
      completedItems: completedCount,
      failedItems: failedCount,
      results,
      errors: allErrors,
      processingTimeMs,
    }
  );

  return {
    jobId,
    success: failedCount === 0,
    results,
  };
}

/**
 * 獲取翻譯任務列表
 */
export async function getTranslationJobs(limit: number = 20): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  const jobs = await db.select().from(translationJobs).orderBy(desc(translationJobs.createdAt)).limit(limit);
  return jobs;
}

/**
 * 獲取支援的語言列表
 */
export function getSupportedLanguages(): Array<{ code: Language; name: string; nativeName: string }> {
  return Object.entries(languageFullNames).map(([code, name]) => ({
    code: code as Language,
    name,
    nativeName: languageNativeNames[code as Language],
  }));
}

/**
 * 生成快取 key
 */
function getCacheKey(text: string, source: string, target: string): string {
  // 對長文字使用 hash
  const textKey = text.length > 100 ? `${text.substring(0, 100)}_${hashCode(text)}` : text;
  return `${source}:${target}:${textKey}`;
}

/**
 * 簡單的 hash 函數
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
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
