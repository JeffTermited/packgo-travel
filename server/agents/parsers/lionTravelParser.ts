/**
 * Lion Travel Parser
 * 雄獅旅遊專屬解析器
 * 
 * 針對 travel.liontravel.com 網站結構進行優化提取
 * 減少 Vision 救援的觸發頻率
 * 
 * 2026-01-30 更新：
 * - 修復 location 提取邏輯，支援台灣景點到城市的對應
 * - 先提取每日行程，從中推斷城市
 */

import { JSDOM } from 'jsdom';

export interface LionTravelData {
  basicInfo: {
    title: string;
    subtitle?: string;
    description?: string;
    tourCode?: string;
  };
  location: {
    destinationCountry: string;
    destinationCity: string;
    departureCity?: string;
  };
  duration: {
    days: number;
    nights: number;
  };
  pricing: {
    price: number;
    currency: string;
    priceNote?: string;
  };
  highlights: string[];
  dailyItinerary: Array<{
    day: number;
    title: string;
    description: string;
    meals?: string;
    accommodation?: string;
    activities?: string[];
  }>;
  includes: string[];
  excludes: string[];
  flights?: Array<{
    airline?: string;
    flightNumber?: string;
    departure?: string;
    arrival?: string;
    time?: string;
  }>;
  hotels?: Array<{
    name: string;
    rating?: number;
    location?: string;
  }>;
}

// 台灣景點到城市/縣市的對應表
const TAIWAN_ATTRACTIONS_TO_CITY: Record<string, string> = {
  // 嘉義縣
  '阿里山': '嘉義',
  '奮起湖': '嘉義',
  '達娜伊谷': '嘉義',
  // 南投縣
  '日月潭': '南投',
  '清境': '南投',
  '合歡山': '南投',
  '溪頭': '南投',
  '杉林溪': '南投',
  '九族文化村': '南投',
  // 屏東縣
  '墾丁': '屏東',
  '小琉球': '屏東',
  '大鵬灣': '屏東',
  // 花蓮縣
  '太魯閣': '花蓮',
  '七星潭': '花蓮',
  '瑞穗': '花蓮',
  '富里': '花蓮',
  // 台東縣
  '知本': '台東',
  '綠島': '台東',
  '蘭嶼': '台東',
  '池上': '台東',
  '鹿野': '台東',
  // 宜蘭縣
  '礁溪': '宜蘭',
  '羅東': '宜蘭',
  '太平山': '宜蘭',
  '龜山島': '宜蘭',
  // 苗栗縣
  '三義': '苗栗',
  '南庄': '苗栗',
  '大湖': '苗栗',
  // 新竹縣
  '內灣': '新竹',
  '司馬庫斯': '新竹',
  // 彰化縣
  '鹿港': '彰化',
  // 雲林縣
  '古坑': '雲林',
  '劍湖山': '雲林',
  // 澎湖縣
  '澎湖': '澎湖',
  '馬公': '澎湖',
  // 金門縣
  '金門': '金門',
  // 馬祖
  '馬祖': '馬祖',
  '北竿': '馬祖',
  '南竿': '馬祖',
};

// 台灣城市列表（用於直接匹配）
const TAIWAN_CITIES = [
  '台北', '新北', '基隆', '桃園', '新竹', '苗栗',
  '台中', '彰化', '南投', '雲林',
  '嘉義', '台南', '高雄', '屏東',
  '宜蘭', '花蓮', '台東',
  '澎湖', '金門', '馬祖',
];

export class LionTravelParser {
  private dom: JSDOM;
  private document: Document;

  constructor(html: string, url?: string) {
    this.dom = new JSDOM(html, { url });
    this.document = this.dom.window.document;
  }

  /**
   * 檢查是否為雄獅旅遊網站
   */
  static isLionTravelUrl(url: string): boolean {
    return url.includes('travel.liontravel.com') || 
           url.includes('liontravel.com/detail');
  }

  /**
   * 從 HTML 提取所有資料
   * 修改：先提取每日行程，再從中推斷 location
   */
  async parse(): Promise<LionTravelData | null> {
    console.log('[LionTravelParser] Starting parse...');

    try {
      const basicInfo = this.extractBasicInfo();
      const dailyItinerary = this.extractDailyItinerary(); // 先提取每日行程
      const duration = this.extractDuration();
      const pricing = this.extractPricing();
      const highlights = this.extractHighlights();
      const includes = this.extractIncludes();
      const excludes = this.extractExcludes();
      const flights = this.extractFlights();
      const hotels = this.extractHotels();
      
      // 最後提取 location，傳入 dailyItinerary 以便從中推斷
      const location = this.extractLocation(dailyItinerary, basicInfo.title);

      // 驗證必要欄位
      if (!basicInfo.title) {
        console.log('[LionTravelParser] Missing title');
        return null;
      }

      if (!location.destinationCountry || !location.destinationCity) {
        console.log('[LionTravelParser] Missing location, trying fallback...');
        // 如果還是沒有 location，使用標題中的任何地名作為 fallback
        const fallbackLocation = this.extractLocationFromTitle(basicInfo.title);
        if (fallbackLocation.destinationCountry && fallbackLocation.destinationCity) {
          location.destinationCountry = fallbackLocation.destinationCountry;
          location.destinationCity = fallbackLocation.destinationCity;
          console.log(`[LionTravelParser] Fallback location: ${location.destinationCountry} ${location.destinationCity}`);
        } else {
          console.log('[LionTravelParser] Missing location after fallback');
          return null;
        }
      }

      if (!duration.days || duration.days === 0) {
        console.log('[LionTravelParser] Missing duration');
        return null;
      }

      console.log('[LionTravelParser] Parse completed:', {
        title: basicInfo.title,
        destination: `${location.destinationCountry} ${location.destinationCity}`,
        days: duration.days,
        price: pricing.price,
        itineraryDays: dailyItinerary.length,
      });

      return {
        basicInfo,
        location,
        duration,
        pricing,
        highlights,
        dailyItinerary,
        includes,
        excludes,
        flights,
        hotels,
      };
    } catch (error) {
      console.error('[LionTravelParser] Parse error:', error);
      return null;
    }
  }

  /**
   * 提取基本資訊（標題、副標題、描述）
   */
  private extractBasicInfo(): LionTravelData['basicInfo'] {
    // 雄獅旅遊標題選擇器
    const titleSelectors = [
      'h1.product-title',
      'h1.tour-title',
      '.product-name h1',
      '.tour-name h1',
      'h1[class*="title"]',
      '.detail-title h1',
      'h1',
    ];

    let title = '';
    for (const selector of titleSelectors) {
      const element = this.document.querySelector(selector);
      if (element && element.textContent?.trim()) {
        title = element.textContent.trim();
        break;
      }
    }

    // 從 meta 標籤提取
    if (!title) {
      const metaTitle = this.document.querySelector('meta[property="og:title"]');
      if (metaTitle) {
        title = metaTitle.getAttribute('content') || '';
      }
    }

    // 副標題
    const subtitleSelectors = [
      '.product-subtitle',
      '.tour-subtitle',
      '.sub-title',
      'h2.subtitle',
    ];

    let subtitle = '';
    for (const selector of subtitleSelectors) {
      const element = this.document.querySelector(selector);
      if (element && element.textContent?.trim()) {
        subtitle = element.textContent.trim();
        break;
      }
    }

    // 描述
    const descriptionSelectors = [
      '.product-description',
      '.tour-description',
      '.description',
      'meta[property="og:description"]',
    ];

    let description = '';
    for (const selector of descriptionSelectors) {
      if (selector.startsWith('meta')) {
        const meta = this.document.querySelector(selector);
        if (meta) {
          description = meta.getAttribute('content') || '';
          break;
        }
      } else {
        const element = this.document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          description = element.textContent.trim();
          break;
        }
      }
    }

    // 行程代碼
    const tourCodeSelectors = [
      '.tour-code',
      '.product-code',
      '[class*="code"]',
    ];

    let tourCode = '';
    for (const selector of tourCodeSelectors) {
      const element = this.document.querySelector(selector);
      if (element && element.textContent?.trim()) {
        const match = element.textContent.match(/[A-Z0-9]{6,}/);
        if (match) {
          tourCode = match[0];
          break;
        }
      }
    }

    return { title, subtitle, description, tourCode };
  }

  /**
   * 提取目的地資訊
   * 修改：接收 dailyItinerary 參數，從中推斷城市
   */
  private extractLocation(dailyItinerary: LionTravelData['dailyItinerary'], title: string): LionTravelData['location'] {
    let destinationCountry = '';
    let destinationCity = '';
    let departureCity = '台北';

    // 1. 從 breadcrumb 提取國家
    const breadcrumbSelectors = [
      '.breadcrumb',
      '.bread-crumb',
      'nav[aria-label="breadcrumb"]',
      '.category-path',
    ];

    for (const selector of breadcrumbSelectors) {
      const element = this.document.querySelector(selector);
      if (element) {
        const text = element.textContent || '';
        // 常見國家名稱
        const countries = ['日本', '韓國', '泰國', '越南', '柬埔寨', '新加坡', '馬來西亞', 
                         '印尼', '菲律賓', '中國', '香港', '澳門', '台灣', '美國', '加拿大',
                         '英國', '法國', '德國', '義大利', '西班牙', '瑞士', '奧地利',
                         '澳洲', '紐西蘭', '埃及', '土耳其', '杜拜', '阿聯酋'];
        
        for (const country of countries) {
          if (text.includes(country)) {
            destinationCountry = country;
            break;
          }
        }
        break;
      }
    }

    // 2. 從每日行程中提取城市（新增邏輯）
    if (dailyItinerary && dailyItinerary.length > 0) {
      const citiesFound = new Set<string>();
      
      for (const day of dailyItinerary) {
        const dayText = `${day.title} ${day.description}`;
        
        // 檢查台灣景點
        for (const [attraction, city] of Object.entries(TAIWAN_ATTRACTIONS_TO_CITY)) {
          if (dayText.includes(attraction)) {
            citiesFound.add(city);
            if (!destinationCountry) {
              destinationCountry = '台灣';
            }
          }
        }
        
        // 檢查台灣城市
        for (const city of TAIWAN_CITIES) {
          if (dayText.includes(city)) {
            citiesFound.add(city);
            if (!destinationCountry) {
              destinationCountry = '台灣';
            }
          }
        }
      }
      
      // 如果找到城市，使用第一個作為主要目的地
      if (citiesFound.size > 0) {
        const cities = Array.from(citiesFound);
        destinationCity = cities[0];
        console.log(`[LionTravelParser] Cities found from itinerary: ${cities.join(', ')}`);
      }
    }

    // 3. 從標題提取城市（如果還沒找到）
    if (!destinationCity && title) {
      // 先檢查台灣景點
      for (const [attraction, city] of Object.entries(TAIWAN_ATTRACTIONS_TO_CITY)) {
        if (title.includes(attraction)) {
          destinationCity = city;
          if (!destinationCountry) {
            destinationCountry = '台灣';
          }
          console.log(`[LionTravelParser] Found attraction "${attraction}" in title, mapped to city: ${city}`);
          break;
        }
      }
      
      // 再檢查台灣城市
      if (!destinationCity) {
        for (const city of TAIWAN_CITIES) {
          if (title.includes(city)) {
            destinationCity = city;
            if (!destinationCountry) {
              destinationCountry = '台灣';
            }
            break;
          }
        }
      }
      
      // 檢查其他國家城市
      if (!destinationCity) {
        const cities = ['東京', '大阪', '京都', '北海道', '沖繩', '福岡', '名古屋',
                       '首爾', '釜山', '濟州島', '曼谷', '清邁', '普吉島', '芭達雅',
                       '河內', '胡志明市', '峴港', '下龍灣', '沙壩', '吳哥窟', '暹粒', '金邊',
                       '新加坡', '吉隆坡', '檳城', '峇里島', '長灘島', '宿霧',
                       '上海', '北京', '杭州', '蘇州', '成都', '重慶', '西安', '桂林',
                       '香港', '澳門',
                       '紐約', '洛杉磯', '舊金山', '拉斯維加斯', '溫哥華', '多倫多',
                       '倫敦', '巴黎', '羅馬', '米蘭', '威尼斯', '佛羅倫斯', '巴塞隆納',
                       '馬德里', '蘇黎世', '維也納', '布拉格', '布達佩斯',
                       '雪梨', '墨爾本', '黃金海岸', '凱恩斯', '奧克蘭', '皇后鎮',
                       '開羅', '伊斯坦堡', '杜拜', '阿布達比'];
        
        for (const city of cities) {
          if (title.includes(city)) {
            destinationCity = city;
            break;
          }
        }
      }

      // 如果沒找到城市但有國家，使用國家首都或主要城市
      if (!destinationCity && destinationCountry) {
        const countryCapitals: Record<string, string> = {
          '日本': '東京',
          '韓國': '首爾',
          '泰國': '曼谷',
          '越南': '河內',
          '柬埔寨': '暹粒',
          '新加坡': '新加坡',
          '馬來西亞': '吉隆坡',
          '印尼': '峇里島',
          '菲律賓': '馬尼拉',
          '中國': '北京',
          '香港': '香港',
          '澳門': '澳門',
          '台灣': '台北',
        };
        destinationCity = countryCapitals[destinationCountry] || destinationCountry;
      }
    }

    // 4. 從目的地標籤提取
    const destinationSelectors = [
      '.destination',
      '.tour-destination',
      '[class*="destination"]',
    ];

    for (const selector of destinationSelectors) {
      const element = this.document.querySelector(selector);
      if (element && element.textContent?.trim()) {
        const text = element.textContent.trim();
        if (!destinationCountry) {
          // 嘗試從文字中提取國家
          const countryMatch = text.match(/(日本|韓國|泰國|越南|柬埔寨|新加坡|馬來西亞|印尼|菲律賓|中國|香港|澳門|台灣)/);
          if (countryMatch) {
            destinationCountry = countryMatch[1];
          }
        }
        break;
      }
    }

    return { destinationCountry, destinationCity, departureCity };
  }

  /**
   * 從標題中提取 location 的 fallback 方法
   */
  private extractLocationFromTitle(title: string): { destinationCountry: string; destinationCity: string } {
    let destinationCountry = '';
    let destinationCity = '';

    if (!title) {
      return { destinationCountry, destinationCity };
    }

    // 檢查是否包含「國內」、「台灣」等關鍵字
    if (title.includes('國內') || title.includes('台灣') || title.includes('本島')) {
      destinationCountry = '台灣';
    }

    // 從標題中提取任何可能的地名
    // 先檢查台灣景點
    for (const [attraction, city] of Object.entries(TAIWAN_ATTRACTIONS_TO_CITY)) {
      if (title.includes(attraction)) {
        destinationCountry = '台灣';
        destinationCity = city;
        return { destinationCountry, destinationCity };
      }
    }

    // 檢查台灣城市
    for (const city of TAIWAN_CITIES) {
      if (title.includes(city)) {
        destinationCountry = '台灣';
        destinationCity = city;
        return { destinationCountry, destinationCity };
      }
    }

    // 如果有國家但沒有城市，使用預設城市
    if (destinationCountry === '台灣' && !destinationCity) {
      destinationCity = '台北';
    }

    return { destinationCountry, destinationCity };
  }

  /**
   * 提取天數資訊
   */
  private extractDuration(): LionTravelData['duration'] {
    let days = 0;
    let nights = 0;

    // 從標題提取天數
    const title = this.extractBasicInfo().title;
    if (title) {
      // 匹配 "5天4夜"、"5日4夜"、"5天"、"5日" 等格式
      const durationMatch = title.match(/(\d+)\s*[天日]/);
      if (durationMatch) {
        days = parseInt(durationMatch[1]);
      }
      
      const nightsMatch = title.match(/(\d+)\s*夜/);
      if (nightsMatch) {
        nights = parseInt(nightsMatch[1]);
      }
    }

    // 從專屬元素提取
    const durationSelectors = [
      '.tour-days',
      '.duration',
      '[class*="days"]',
      '[class*="duration"]',
    ];

    for (const selector of durationSelectors) {
      const element = this.document.querySelector(selector);
      if (element && element.textContent?.trim()) {
        const text = element.textContent.trim();
        const daysMatch = text.match(/(\d+)\s*[天日]/);
        if (daysMatch && !days) {
          days = parseInt(daysMatch[1]);
        }
        
        const nightsMatch = text.match(/(\d+)\s*夜/);
        if (nightsMatch && !nights) {
          nights = parseInt(nightsMatch[1]);
        }
        break;
      }
    }

    // 計算晚數
    if (days > 0 && !nights) {
      nights = days - 1;
    }

    return { days, nights };
  }

  /**
   * 提取價格資訊
   */
  private extractPricing(): LionTravelData['pricing'] {
    let price = 0;
    const currency = 'TWD';
    let priceNote = '';

    // 價格選擇器
    const priceSelectors = [
      '.tour-price',
      '.product-price',
      '[class*="price"]',
      '.cost',
      '.amount',
    ];

    for (const selector of priceSelectors) {
      const elements = this.document.querySelectorAll(selector);
      for (const element of Array.from(elements)) {
        const text = element.textContent || '';
        // 匹配價格格式：$29,900、NT$29,900、29,900元、TWD 29,900
        const priceMatch = text.match(/(?:NT\$?|TWD|＄|\$)?\s*([\d,]+)/);
        if (priceMatch) {
          const extractedPrice = parseInt(priceMatch[1].replace(/,/g, ''));
          // 確保價格合理（大於 1000 且小於 1000000）
          if (extractedPrice > 1000 && extractedPrice < 1000000) {
            price = extractedPrice;
            break;
          }
        }
      }
      if (price > 0) break;
    }

    // 價格備註
    const priceNoteSelectors = [
      '.price-note',
      '.price-remark',
      '[class*="price-note"]',
    ];

    for (const selector of priceNoteSelectors) {
      const element = this.document.querySelector(selector);
      if (element && element.textContent?.trim()) {
        priceNote = element.textContent.trim();
        break;
      }
    }

    return { price, currency, priceNote };
  }

  /**
   * 提取行程亮點
   */
  private extractHighlights(): string[] {
    const highlights: string[] = [];

    const highlightSelectors = [
      '.highlights li',
      '.tour-highlights li',
      '.feature-list li',
      '[class*="highlight"] li',
      '.selling-points li',
    ];

    for (const selector of highlightSelectors) {
      const elements = Array.from(this.document.querySelectorAll(selector));
      if (elements.length > 0) {
        elements.forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 5 && text.length < 200) {
            highlights.push(text);
          }
        });
        break;
      }
    }

    return highlights.slice(0, 10); // 最多 10 個亮點
  }

  /**
   * 提取每日行程
   */
  private extractDailyItinerary(): LionTravelData['dailyItinerary'] {
    const itinerary: LionTravelData['dailyItinerary'] = [];

    // 雄獅旅遊每日行程選擇器
    const daySelectors = [
      '.itinerary-day',
      '.day-item',
      '.schedule-day',
      '[class*="day-"]',
      '.tour-day',
      '.daily-schedule',
    ];

    for (const selector of daySelectors) {
      const elements = this.document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach((el, index) => {
          const dayNumber = index + 1;
          
          // 提取標題
          const titleEl = el.querySelector('h3, h4, .day-title, [class*="title"]');
          const title = titleEl?.textContent?.trim() || `第 ${dayNumber} 天`;
          
          // 提取描述
          const descEl = el.querySelector('.day-content, .day-description, p, [class*="content"]');
          const description = descEl?.textContent?.trim() || '';
          
          // 提取餐食
          const mealsEl = el.querySelector('.meals, [class*="meal"]');
          const meals = mealsEl?.textContent?.trim() || '';
          
          // 提取住宿
          const accommodationEl = el.querySelector('.accommodation, .hotel, [class*="hotel"]');
          const accommodation = accommodationEl?.textContent?.trim() || '';

          if (title || description) {
            itinerary.push({
              day: dayNumber,
              title: title.replace(/第\s*\d+\s*天[：:]\s*/, ''),
              description,
              meals,
              accommodation,
            });
          }
        });
        break;
      }
    }

    // 如果沒找到結構化的每日行程，嘗試從文字中解析
    if (itinerary.length === 0) {
      const contentEl = this.document.querySelector('.itinerary, .schedule, .tour-content, main');
      if (contentEl) {
        const text = contentEl.textContent || '';
        // 匹配 "第1天"、"Day 1"、"DAY1" 等格式
        const dayMatches = text.split(/(?=第\s*\d+\s*天|Day\s*\d+|DAY\s*\d+)/i);
        
        dayMatches.forEach((dayText, index) => {
          if (index === 0 && !dayText.match(/第\s*\d+\s*天|Day\s*\d+/i)) return;
          
          const dayMatch = dayText.match(/(?:第\s*)?(\d+)\s*(?:天|Day)/i);
          const dayNumber = dayMatch ? parseInt(dayMatch[1]) : index;
          
          // 提取標題（第一行或冒號後的內容）
          const lines = dayText.split('\n').filter(l => l.trim());
          const title = lines[0]?.replace(/第\s*\d+\s*天[：:]\s*|Day\s*\d+[：:]\s*/i, '').trim() || `第 ${dayNumber} 天`;
          const description = lines.slice(1).join('\n').trim();

          if (dayNumber > 0) {
            itinerary.push({
              day: dayNumber,
              title,
              description: description.substring(0, 500),
            });
          }
        });
      }
    }

    return itinerary;
  }

  /**
   * 提取費用包含項目
   */
  private extractIncludes(): string[] {
    const includes: string[] = [];

    const includeSelectors = [
      '.includes li',
      '.tour-includes li',
      '.price-includes li',
      '[class*="include"] li',
      '.fee-include li',
    ];

    for (const selector of includeSelectors) {
      const elements = Array.from(this.document.querySelectorAll(selector));
      if (elements.length > 0) {
        elements.forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 3 && text.length < 200) {
            includes.push(text);
          }
        });
        break;
      }
    }

    return includes;
  }

  /**
   * 提取費用不包含項目
   */
  private extractExcludes(): string[] {
    const excludes: string[] = [];

    const excludeSelectors = [
      '.excludes li',
      '.tour-excludes li',
      '.price-excludes li',
      '[class*="exclude"] li',
      '.fee-exclude li',
      '.not-include li',
    ];

    for (const selector of excludeSelectors) {
      const elements = Array.from(this.document.querySelectorAll(selector));
      if (elements.length > 0) {
        elements.forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 3 && text.length < 200) {
            excludes.push(text);
          }
        });
        break;
      }
    }

    return excludes;
  }

  /**
   * 提取航班資訊
   */
  private extractFlights(): LionTravelData['flights'] {
    const flights: LionTravelData['flights'] = [];

    const flightSelectors = [
      '.flight-info',
      '.flights',
      '[class*="flight"]',
      '.airline-info',
    ];

    for (const selector of flightSelectors) {
      const elements = Array.from(this.document.querySelectorAll(selector));
      if (elements.length > 0) {
        elements.forEach(el => {
          const text = el.textContent || '';
          
          // 提取航空公司
          const airlineMatch = text.match(/(長榮|華航|國泰|星宇|虎航|樂桃|酷航|亞航|越捷|泰航|日航|全日空|大韓|韓亞|新航|馬航|菲航)/);
          const airline = airlineMatch ? airlineMatch[1] : undefined;
          
          // 提取航班號
          const flightNumberMatch = text.match(/([A-Z]{2}\s*\d{3,4})/);
          const flightNumber = flightNumberMatch ? flightNumberMatch[1] : undefined;

          if (airline || flightNumber) {
            flights.push({ airline, flightNumber });
          }
        });
        break;
      }
    }

    return flights;
  }

  /**
   * 提取飯店資訊
   */
  private extractHotels(): LionTravelData['hotels'] {
    const hotels: LionTravelData['hotels'] = [];

    const hotelSelectors = [
      '.hotel-info',
      '.hotels',
      '.accommodation-list',
      '[class*="hotel"]',
    ];

    for (const selector of hotelSelectors) {
      const elements = Array.from(this.document.querySelectorAll(selector));
      if (elements.length > 0) {
        elements.forEach(el => {
          const text = el.textContent?.trim() || '';
          
          // 提取飯店名稱（通常是較長的文字）
          if (text.length > 5 && text.length < 100) {
            // 提取星級
            const ratingMatch = text.match(/(\d)\s*星/);
            const rating = ratingMatch ? parseInt(ratingMatch[1]) : undefined;
            
            hotels.push({
              name: text.replace(/\d\s*星/, '').trim(),
              rating,
            });
          }
        });
        break;
      }
    }

    return hotels;
  }
}

/**
 * 快速檢查並解析雄獅旅遊網頁
 */
export async function parseLionTravel(html: string, url: string): Promise<LionTravelData | null> {
  if (!LionTravelParser.isLionTravelUrl(url)) {
    console.log('[LionTravelParser] Not a Lion Travel URL');
    return null;
  }

  const parser = new LionTravelParser(html, url);
  return await parser.parse();
}
