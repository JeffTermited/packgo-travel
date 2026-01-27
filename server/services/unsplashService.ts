import { ENV } from "../_core/env";

/**
 * Unsplash API Service
 * 用於從 Unsplash 搜尋和下載旅遊相關圖片
 */

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
  };
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

/**
 * Search photos from Unsplash
 */
export async function searchUnsplashPhotos(
  query: string,
  count: number = 6
): Promise<string[]> {
  try {
    const accessKey = ENV.unsplashAccessKey;
    
    if (!accessKey) {
      console.error("[UnsplashService] Access key not configured");
      return [];
    }
    
    // Build search query
    const searchQuery = `${query} travel destination landscape`;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${count}&orientation=landscape`;
    
    console.log(`[UnsplashService] Searching photos: "${searchQuery}"`);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });
    
    if (!response.ok) {
      console.error(`[UnsplashService] API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data: UnsplashSearchResponse = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.warn(`[UnsplashService] No photos found for query: "${searchQuery}"`);
      return [];
    }
    
    // Extract regular-sized image URLs
    const imageUrls = data.results.map(photo => photo.urls.regular);
    
    console.log(`[UnsplashService] Found ${imageUrls.length} photos`);
    
    return imageUrls;
  } catch (error) {
    console.error("[UnsplashService] Error searching photos:", error);
    return [];
  }
}

/**
 * Supplement images if count is less than minimum
 */
export async function supplementImages(
  existingImages: string[],
  destination: string,
  minCount: number = 6
): Promise<string[]> {
  const currentCount = existingImages.length;
  
  if (currentCount >= minCount) {
    console.log(`[UnsplashService] Sufficient images (${currentCount}/${minCount}), no supplement needed`);
    return existingImages;
  }
  
  const neededCount = minCount - currentCount;
  console.log(`[UnsplashService] Need ${neededCount} more images (current: ${currentCount}, target: ${minCount})`);
  
  const newImages = await searchUnsplashPhotos(destination, neededCount);
  
  if (newImages.length === 0) {
    console.warn("[UnsplashService] Failed to fetch supplementary images");
    return existingImages;
  }
  
  const supplementedImages = [...existingImages, ...newImages];
  console.log(`[UnsplashService] Supplemented images: ${currentCount} + ${newImages.length} = ${supplementedImages.length}`);
  
  return supplementedImages;
}
