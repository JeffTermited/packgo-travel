/**
 * Hotel Image Service
 * 為飯店自動搜尋 Unsplash 圖片
 */

import { searchUnsplashPhotos } from './unsplashService';

export interface HotelWithImage {
  name: string;
  stars: string;
  description: string;
  facilities: string[];
  location: string;
  image?: string;
  imageAlt?: string;
}

/**
 * 為單個飯店搜尋圖片
 */
export async function searchHotelImage(hotel: HotelWithImage): Promise<HotelWithImage> {
  // 如果已有圖片，直接返回
  if (hotel.image && hotel.image.length > 0) {
    return hotel;
  }

  // 構建搜尋關鍵詞
  const searchTerms: string[] = [];
  
  // 優先使用飯店名稱（去除「待確認」等無效內容）
  if (hotel.name && !hotel.name.includes('待確認')) {
    // 提取飯店類型關鍵詞
    if (hotel.name.includes('溫泉')) {
      searchTerms.push('hot spring hotel room');
    } else if (hotel.name.includes('度假村') || hotel.name.includes('Resort')) {
      searchTerms.push('luxury resort room');
    } else if (hotel.name.includes('民宿')) {
      searchTerms.push('boutique hotel room');
    }
  }

  // 使用位置信息
  if (hotel.location && !hotel.location.includes('待確認')) {
    // 提取地點關鍵詞
    const locationKeywords = hotel.location
      .replace(/[,，、]/g, ' ')
      .split(' ')
      .filter(w => w.length > 1)
      .slice(0, 2);
    
    if (locationKeywords.length > 0) {
      searchTerms.push(`${locationKeywords.join(' ')} hotel`);
    }
  }

  // 根據星級添加關鍵詞
  if (hotel.stars) {
    if (hotel.stars.includes('五星') || hotel.stars.includes('5')) {
      searchTerms.push('luxury hotel room interior');
    } else if (hotel.stars.includes('四星') || hotel.stars.includes('4')) {
      searchTerms.push('modern hotel room');
    } else {
      searchTerms.push('comfortable hotel room');
    }
  }

  // 如果沒有有效的搜尋詞，使用通用關鍵詞
  if (searchTerms.length === 0) {
    searchTerms.push('hotel room interior');
  }

  // 嘗試搜尋圖片
  for (const term of searchTerms) {
    try {
      const photos = await searchUnsplashPhotos(term, 1);
      if (photos.length > 0) {
        return {
          ...hotel,
          image: photos[0],
          imageAlt: `${hotel.name} - ${hotel.location || '飯店'}`
        };
      }
    } catch (error) {
      console.error(`[HotelImageService] Failed to search for "${term}":`, error);
    }
  }

  // 如果所有搜尋都失敗，返回原始資料
  return hotel;
}

/**
 * 為多個飯店批量搜尋圖片
 */
export async function supplementHotelImages(hotels: HotelWithImage[]): Promise<HotelWithImage[]> {
  const results: HotelWithImage[] = [];
  
  for (const hotel of hotels) {
    try {
      const hotelWithImage = await searchHotelImage(hotel);
      results.push(hotelWithImage);
      
      // 添加延遲避免 API 限流
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`[HotelImageService] Error processing hotel "${hotel.name}":`, error);
      results.push(hotel);
    }
  }
  
  return results;
}

/**
 * 生成飯店設施列表
 */
export function generateFacilitiesFromDescription(description: string): string[] {
  const facilities: string[] = [];
  const descLower = description.toLowerCase();
  
  // 常見設施關鍵詞映射
  const facilityKeywords: Record<string, string[]> = {
    'wifi': ['wifi', 'wi-fi', '無線網路', '網路'],
    'pool': ['泳池', 'pool', '游泳池'],
    'spa': ['spa', '水療', '按摩'],
    'gym': ['健身', 'gym', '健身房', '健身中心'],
    'restaurant': ['餐廳', 'restaurant', '餐飲'],
    'bar': ['酒吧', 'bar', 'lounge'],
    'parking': ['停車', 'parking', '車位'],
    'breakfast': ['早餐', 'breakfast'],
    'aircon': ['空調', '冷氣', 'air conditioning'],
    'tv': ['電視', 'tv', 'television'],
    'minibar': ['迷你吧', 'minibar', '冰箱'],
    'safe': ['保險箱', 'safe', '保險櫃'],
    'laundry': ['洗衣', 'laundry'],
    'concierge': ['禮賓', 'concierge', '管家'],
    'roomservice': ['客房服務', 'room service'],
    'view': ['景觀', 'view', '海景', '山景', '湖景']
  };
  
  for (const [facility, keywords] of Object.entries(facilityKeywords)) {
    if (keywords.some(kw => descLower.includes(kw))) {
      facilities.push(facility);
    }
  }
  
  return facilities;
}
