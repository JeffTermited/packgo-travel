/**
 * Lion Travel Print Page Parser
 * 雄獅旅遊列印版頁面解析器
 * 
 * 專門解析列印版 URL 的 Markdown 內容
 * 列印版頁面結構清晰，不是 SPA，容易解析
 * 
 * 列印版 URL 格式：
 * https://travel.liontravel.com/detail/print?NormGroupID=xxx&GroupID=xxx&PrintItem=FEATURE,SDGS&TourSource=Lion
 */

export interface LionTravelPrintData {
  basicInfo: {
    title: string;
    tourCode?: string;
    updateTime?: string;
    departureDate?: string;
    duration?: string;
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
    deposit?: number;
    priceTable?: Array<{
      roomType: string;
      adultPrice: number;
      childPrice?: number;
    }>;
  };
  highlights: string[];
  dailyItinerary: Array<{
    day: number;
    title: string;
    description: string;
    meals?: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
    };
    accommodation?: string;
    activities?: Array<{
      time?: string;
      title: string;
      description?: string;
    }>;
  }>;
  includes: string[];
  excludes: string[];
  notices: string[];
  assemblyPoint?: {
    location: string;
    address: string;
    time: string;
  };
}

// 台灣景點到城市的對應表
const TAIWAN_ATTRACTIONS_TO_CITY: Record<string, string> = {
  '阿里山': '嘉義', '奮起湖': '嘉義', '達娜伊谷': '嘉義',
  '日月潭': '南投', '清境': '南投', '合歡山': '南投', '溪頭': '南投', '杉林溪': '南投',
  '墾丁': '屏東', '小琉球': '屏東', '大鵬灣': '屏東',
  '太魯閣': '花蓮', '七星潭': '花蓮', '瑞穗': '花蓮', '富里': '花蓮',
  '知本': '台東', '綠島': '台東', '蘭嶼': '台東', '池上': '台東', '鹿野': '台東', '成功': '台東',
  '礁溪': '宜蘭', '羅東': '宜蘭', '太平山': '宜蘭', '龜山島': '宜蘭',
  '三義': '苗栗', '南庄': '苗栗', '大湖': '苗栗',
  '內灣': '新竹', '司馬庫斯': '新竹',
  '鹿港': '彰化',
  '古坑': '雲林', '劍湖山': '雲林',
  '澎湖': '澎湖', '馬公': '澎湖',
  '金門': '金門',
  '馬祖': '馬祖', '北竿': '馬祖', '南竿': '馬祖',
};

const TAIWAN_CITIES = [
  '台北', '新北', '基隆', '桃園', '新竹', '苗栗',
  '台中', '彰化', '南投', '雲林',
  '嘉義', '台南', '高雄', '屏東',
  '宜蘭', '花蓮', '台東',
  '澎湖', '金門', '馬祖',
];

export class LionTravelPrintParser {
  private markdown: string;
  private lines: string[];

  constructor(markdown: string) {
    this.markdown = markdown;
    this.lines = markdown.split('\n').map(line => line.trim());
  }

  /**
   * 檢查是否為雄獅旅遊 URL
   */
  static isLionTravelUrl(url: string): boolean {
    return url.includes('travel.liontravel.com') || 
           url.includes('liontravel.com/detail');
  }

  /**
   * 將一般 URL 轉換為列印版 URL
   */
  static convertToPrintUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // 如果已經是列印版 URL，直接返回
      if (urlObj.pathname.includes('/print')) {
        return url;
      }

      // 提取必要參數
      const normGroupId = urlObj.searchParams.get('NormGroupID');
      const groupId = urlObj.searchParams.get('GroupID');

      if (!normGroupId) {
        console.log('[LionTravelPrintParser] Missing NormGroupID, cannot convert to print URL');
        return url;
      }

      // 構建列印版 URL
      const printUrl = new URL('https://travel.liontravel.com/detail/print');
      printUrl.searchParams.set('NormGroupID', normGroupId);
      if (groupId) {
        printUrl.searchParams.set('GroupID', groupId);
      }
      printUrl.searchParams.set('PrintItem', 'FEATURE,SDGS');
      printUrl.searchParams.set('TourSource', 'Lion');

      console.log(`[LionTravelPrintParser] Converted to print URL: ${printUrl.toString()}`);
      return printUrl.toString();
    } catch (error) {
      console.error('[LionTravelPrintParser] URL conversion error:', error);
      return url;
    }
  }

  /**
   * 解析 Markdown 內容
   */
  parse(): LionTravelPrintData | null {
    console.log('[LionTravelPrintParser] Starting parse...');
    console.log(`[LionTravelPrintParser] Markdown length: ${this.markdown.length} chars`);

    try {
      const basicInfo = this.extractBasicInfo();
      const duration = this.extractDuration(basicInfo.title);
      const pricing = this.extractPricing();
      const dailyItinerary = this.extractDailyItinerary();
      const location = this.extractLocation(basicInfo.title, dailyItinerary);
      const highlights = this.extractHighlights();
      const includes = this.extractIncludes();
      const excludes = this.extractExcludes();
      const notices = this.extractNotices();
      const assemblyPoint = this.extractAssemblyPoint();

      // 驗證必要欄位
      if (!basicInfo.title) {
        console.log('[LionTravelPrintParser] Missing title');
        return null;
      }

      console.log('[LionTravelPrintParser] Parse completed:', {
        title: basicInfo.title,
        destination: `${location.destinationCountry} ${location.destinationCity}`,
        days: duration.days,
        price: pricing.price,
        itineraryDays: dailyItinerary.length,
        highlights: highlights.length,
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
        notices,
        assemblyPoint,
      };
    } catch (error) {
      console.error('[LionTravelPrintParser] Parse error:', error);
      return null;
    }
  }

  /**
   * 提取基本資訊
   */
  private extractBasicInfo(): LionTravelPrintData['basicInfo'] {
    let title = '';
    let tourCode = '';
    let updateTime = '';
    let departureDate = '';
    let duration = '';

    // 方法 1：從 H1 標題提取
    for (const line of this.lines) {
      if (line.startsWith('# ')) {
        title = line.replace('# ', '').replace(/-團體行程\|雄獅旅遊$/, '').trim();
        break;
      }
    }

    // 方法 2：如果沒有 H1，從「產品代碼」前一行提取
    if (!title) {
      for (let i = 0; i < this.lines.length; i++) {
        const line = this.lines[i];
        // 找到產品代碼行，標題通常在前幾行
        if (line.includes('產品代碼')) {
          // 往回找非空的行作為標題
          for (let j = i - 1; j >= 0 && j >= i - 5; j--) {
            const prevLine = this.lines[j];
            // 跳過空行、URL、分隔線
            if (prevLine && 
                !prevLine.startsWith('**URL') && 
                !prevLine.startsWith('---') &&
                !prevLine.startsWith('http') &&
                prevLine !== '列印' &&
                prevLine.length > 5) {
              title = prevLine.replace(/-團體行程\|雄獅旅遊$/, '').trim();
              break;
            }
          }
          break;
        }
      }
    }

    // 方法 3：從「團費說明」區塊提取標題
    if (!title) {
      for (let i = 0; i < this.lines.length; i++) {
        const line = this.lines[i];
        if (line.includes('團費說明')) {
          // 標題通常在下一行
          const nextLine = this.lines[i + 1];
          if (nextLine && nextLine.includes('旅遊') && !nextLine.includes('TWD')) {
            title = nextLine.trim();
            break;
          }
        }
      }
    }

    // 方法 4：從第一個非空行提取（最後手段）
    if (!title) {
      for (const line of this.lines) {
        // 跳過空行、URL、分隔線、「列印」等
        if (line && 
            line.length > 10 &&
            !line.startsWith('**URL') && 
            !line.startsWith('---') &&
            !line.startsWith('http') &&
            !line.startsWith('#') &&
            line !== '列印' &&
            !line.includes('產品代碼') &&
            !line.includes('更新時間') &&
            !line.includes('出發日期') &&
            !line.includes('列印時間')) {
          // 檢查是否包含旅遊相關關鍵字
          if (line.includes('旅遊') || line.includes('日') || line.includes('天') || 
              line.includes('遊') || line.includes('行程') || line.includes('天天') ||
              line.match(/[\u4e00-\u9fa5]{2,}.*[\d]+[\u5929\u65e5]/)) {
            title = line.replace(/-團體行程\|雄獅旅遊$/, '').trim();
            console.log(`[LionTravelPrintParser] Found title via method 4: ${title}`);
            break;
          }
        }
      }
    }

    // 方法 5：從「行程費用」上方提取
    if (!title) {
      for (let i = 0; i < this.lines.length; i++) {
        const line = this.lines[i];
        if (line === '行程費用' || line.includes('應付訂金')) {
          // 往回找標題
          for (let j = i - 1; j >= 0 && j >= i - 10; j--) {
            const prevLine = this.lines[j];
            if (prevLine && 
                prevLine.length > 10 &&
                (prevLine.includes('旅遊') || prevLine.includes('日') || prevLine.includes('天'))) {
              title = prevLine.replace(/-團體行程\|雄獅旅遊$/, '').trim();
              console.log(`[LionTravelPrintParser] Found title via method 5: ${title}`);
              break;
            }
          }
          if (title) break;
        }
      }
    }

    // 提取產品代碼
    for (const line of this.lines) {
      const codeMatch = line.match(/產品代碼[：:]\s*([A-Z0-9-]+)/);
      if (codeMatch) {
        tourCode = codeMatch[1];
        break;
      }
    }

    // 提取更新時間
    for (const line of this.lines) {
      const updateMatch = line.match(/更新時間[：:]\s*([\d/: ]+)/);
      if (updateMatch) {
        updateTime = updateMatch[1].trim();
        break;
      }
    }

    // 提取出發日期
    for (const line of this.lines) {
      const dateMatch = line.match(/出發日期[：:]\s*(.+?)(?:\s+共|$)/);
      if (dateMatch) {
        departureDate = dateMatch[1].trim();
        // 同時提取天數
        const durationMatch = line.match(/共(\d+)天/);
        if (durationMatch) {
          duration = `${durationMatch[1]}天`;
        }
        break;
      }
    }

    return { title, tourCode, updateTime, departureDate, duration };
  }

  /**
   * 提取天數
   */
  private extractDuration(title: string): LionTravelPrintData['duration'] {
    let days = 0;
    let nights = 0;

    // 從標題提取
    const titleMatch = title.match(/(\d+)\s*[天日]/);
    if (titleMatch) {
      days = parseInt(titleMatch[1]);
    }

    const nightsMatch = title.match(/(\d+)\s*夜/);
    if (nightsMatch) {
      nights = parseInt(nightsMatch[1]);
    }

    // 從內容中提取
    if (!days) {
      for (const line of this.lines) {
        const match = line.match(/共(\d+)天/);
        if (match) {
          days = parseInt(match[1]);
          break;
        }
      }
    }

    // 計算晚數
    if (days > 0 && !nights) {
      nights = days - 1;
    }

    return { days, nights };
  }

  /**
   * 提取價格
   */
  private extractPricing(): LionTravelPrintData['pricing'] {
    let price = 0;
    let deposit = 0;
    const currency = 'TWD';
    const priceTable: Array<{ roomType: string; adultPrice: number; childPrice?: number }> = [];

    // 提取訂金
    for (const line of this.lines) {
      const depositMatch = line.match(/應付訂金[：:]\s*TWD\s*([\d,]+)/);
      if (depositMatch) {
        deposit = parseInt(depositMatch[1].replace(/,/g, ''));
        break;
      }
    }

    // 方法 0：直接從 Markdown 內容搜尋價格模式
    // 格式：大人\n\n20,999 或 大人\n20,999
    const adultPriceMatch = this.markdown.match(/大人\s*\n\s*\n?\s*([\d,]+)/);
    if (adultPriceMatch) {
      const adultPrice = parseInt(adultPriceMatch[1].replace(/,/g, ''));
      if (adultPrice > 1000) {
        price = adultPrice;
        priceTable.push({ roomType: '大人', adultPrice });
        console.log(`[LionTravelPrintParser] Found adult price via regex: ${adultPrice}`);
      }
    }

    // 方法 1：提取「大人」價格（新格式）
    let inPriceSection = false;
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i].trim();
      
      // 檢測價格區塊（使用 includes 而不是嚴格相等）
      if (line.includes('團費說明') || line.includes('TWD 計價') || line.includes('行程費用')) {
        inPriceSection = true;
        console.log(`[LionTravelPrintParser] Entered price section at line ${i}: ${line}`);
        continue;
      }
      
      if (inPriceSection) {
        // 檢測「大人」價格（使用 includes 而不是嚴格相等）
        if (line === '大人' || line.includes('大人') && line.length <= 4) {
          const nextLine = this.lines[i + 1]?.trim();
          if (nextLine) {
            const priceMatch = nextLine.match(/([\d,]+)/);
            if (priceMatch) {
              const adultPrice = parseInt(priceMatch[1].replace(/,/g, ''));
              if (adultPrice > 1000) {
                price = adultPrice;
                priceTable.push({ roomType: '大人', adultPrice });
                console.log(`[LionTravelPrintParser] Found adult price: ${adultPrice}`);
              }
            }
          }
        }
        
        // 檢測所有價格選項：小孩佔床、小孩不佔床、小孩加床、嬰兒
        const priceTypes = ['小孩佔床', '小孩不佔床', '小孩加床', '嬰兒'];
        for (const priceType of priceTypes) {
          if (line === priceType || (line.includes(priceType) && line.length <= priceType.length + 2)) {
            // 找下一個非空行
            for (let j = i + 1; j < Math.min(i + 5, this.lines.length); j++) {
              const nextLine = this.lines[j]?.trim();
              if (nextLine && nextLine.length > 0) {
                const priceMatch = nextLine.match(/^([\d,]+)$/);
                if (priceMatch) {
                  const typePrice = parseInt(priceMatch[1].replace(/,/g, ''));
                  // 嬰兒價格可能較低，使用 500 作為門檻
                  if (typePrice > 500) {
                    // 避免重複添加
                    if (!priceTable.find(p => p.roomType === priceType)) {
                      priceTable.push({ roomType: priceType, adultPrice: typePrice });
                      console.log(`[LionTravelPrintParser] Found ${priceType} price: ${typePrice}`);
                    }
                  }
                  break;
                }
              }
            }
          }
        }
        
        // 結束價格區塊
        if (line.includes('行程特色') || line.includes('集合地點') || line.includes('Itinerary Features')) {
          inPriceSection = false;
          console.log(`[LionTravelPrintParser] Exited price section at line ${i}`);
        }
      }
    }

    // 方法 2：提取房型價格（舊格式）
    if (!price) {
      inPriceSection = false;
      let currentRoomType = '';
      
      for (let i = 0; i < this.lines.length; i++) {
        const line = this.lines[i];
        
        if (line.includes('團費說明') || line.includes('TWD 計價')) {
          inPriceSection = true;
          continue;
        }
        
        if (inPriceSection) {
          // 檢測房型
          if (line.includes('單人房') || line.includes('雙人房') || line.includes('三人房') || line.includes('四人房')) {
            currentRoomType = line.includes('單人房') ? '單人房' :
                             line.includes('雙人房') ? '雙人房' :
                             line.includes('三人房') ? '三人房' : '四人房';
          }
          
          // 檢測價格
          if (currentRoomType) {
            const priceMatch = line.match(/([\d,]+)/);
            if (priceMatch) {
              const roomPrice = parseInt(priceMatch[1].replace(/,/g, ''));
              if (roomPrice > 1000) {
                priceTable.push({ roomType: currentRoomType, adultPrice: roomPrice });
                
                // 使用雙人房價格作為主要價格
                if (currentRoomType === '雙人房' && !price) {
                  price = roomPrice;
                }
                currentRoomType = '';
              }
            }
          }
          
          if (line.includes('行程特色') || line.includes('集合地點')) {
            inPriceSection = false;
          }
        }
      }
    }

    // 價格優先順序：雙人房 > 大人 > 其他
    // 如果有雙人房價格，使用雙人房價格作為主要價格
    const doubleRoomPrice = priceTable.find(p => p.roomType === '雙人房');
    if (doubleRoomPrice) {
      price = doubleRoomPrice.adultPrice;
      console.log(`[LionTravelPrintParser] Using double room price as main price: ${price}`);
    }
    
    // 如果沒有雙人房，使用大人價格
    if (!price) {
      const adultPrice = priceTable.find(p => p.roomType === '大人');
      if (adultPrice) {
        price = adultPrice.adultPrice;
        console.log(`[LionTravelPrintParser] Using adult price as main price: ${price}`);
      }
    }
    
    // 如果還是沒有價格，使用第一個找到的價格
    if (!price && priceTable.length > 0) {
      price = priceTable[0].adultPrice;
    }

    console.log(`[LionTravelPrintParser] Final price: ${price}, deposit: ${deposit}, priceTable:`, priceTable);

    return { price, currency, deposit, priceTable };
  }

  /**
   * 提取目的地
   */
  private extractLocation(title: string, dailyItinerary: LionTravelPrintData['dailyItinerary']): LionTravelPrintData['location'] {
    let destinationCountry = '台灣';
    let destinationCity = '';
    const departureCity = '台北';

    // 從標題提取
    for (const city of TAIWAN_CITIES) {
      if (title.includes(city)) {
        destinationCity = city;
        break;
      }
    }

    // 從景點推斷
    if (!destinationCity) {
      for (const [attraction, city] of Object.entries(TAIWAN_ATTRACTIONS_TO_CITY)) {
        if (title.includes(attraction)) {
          destinationCity = city;
          break;
        }
      }
    }

    // 從每日行程推斷
    if (!destinationCity && dailyItinerary.length > 0) {
      const citiesFound = new Set<string>();
      
      for (const day of dailyItinerary) {
        const dayText = `${day.title} ${day.description}`;
        
        // 檢查城市
        for (const city of TAIWAN_CITIES) {
          if (dayText.includes(city)) {
            citiesFound.add(city);
          }
        }
        
        // 檢查景點
        for (const [attraction, city] of Object.entries(TAIWAN_ATTRACTIONS_TO_CITY)) {
          if (dayText.includes(attraction)) {
            citiesFound.add(city);
          }
        }
      }
      
      if (citiesFound.size > 0) {
        // 排除出發地台北
        citiesFound.delete('台北');
        if (citiesFound.size > 0) {
          destinationCity = Array.from(citiesFound)[0];
        }
      }
    }

    // 預設值
    if (!destinationCity) {
      destinationCity = '台北';
    }

    return { destinationCountry, destinationCity, departureCity };
  }

  /**
   * 提取行程亮點
   */
  private extractHighlights(): string[] {
    const highlights: string[] = [];
    let inHighlightSection = false;

    for (const line of this.lines) {
      // 檢測亮點區塊
      if (line.includes('行程特色') || line.includes('Itinerary Features')) {
        inHighlightSection = true;
        continue;
      }

      // 結束亮點區塊
      if (inHighlightSection && (line.includes('集合地點') || line.includes('每日行程') || line.includes('費用包含'))) {
        inHighlightSection = false;
        break;
      }

      // 提取亮點
      if (inHighlightSection) {
        // 以 ＊ 或 * 開頭的行
        if (line.startsWith('＊') || line.startsWith('*')) {
          const highlight = line.replace(/^[＊*]\s*/, '').trim();
          if (highlight.length > 5 && highlight.length < 200) {
            highlights.push(highlight);
          }
        }
        // 或者是描述性的段落
        else if (line.length > 20 && line.length < 300 && !line.includes('More +')) {
          // 避免重複
          if (!highlights.includes(line)) {
            highlights.push(line);
          }
        }
      }
    }

    return highlights.slice(0, 15);
  }

  /**
   * 提取每日行程
   */
  private extractDailyItinerary(): LionTravelPrintData['dailyItinerary'] {
    const itinerary: LionTravelPrintData['dailyItinerary'] = [];
    let currentDay: LionTravelPrintData['dailyItinerary'][0] | null = null;
    let inItinerarySection = false;
    let inMealsSection = false;
    let inHotelSection = false;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const nextLine = this.lines[i + 1] || '';

      // 檢測每日行程區塊開始
      if (line.includes('每日行程') || line.includes('Daily Itinerary')) {
        inItinerarySection = true;
        continue;
      }

      // 檢測每日行程區塊結束
      if (inItinerarySection && (line.includes('行程特殊提醒') || line.includes('旅遊資訊') || line.includes('責任旅人'))) {
        if (currentDay) {
          itinerary.push(currentDay);
        }
        break;
      }

      if (!inItinerarySection) continue;

      // 檢測新的一天 (DAY 1, DAY 2, etc.)
      const trimmedLine = line.trim();
      const trimmedNextLine = nextLine.trim();
      
      // 處理 DAY 和數字之間可能有空行的情況
      if (trimmedLine === 'DAY') {
        // 尋找下一個非空行，應該是天數
        let dayNumLine = '';
        let dayNumLineIndex = i + 1;
        for (let j = i + 1; j < Math.min(i + 4, this.lines.length); j++) {
          const checkLine = this.lines[j].trim();
          if (checkLine && checkLine.match(/^\d+$/)) {
            dayNumLine = checkLine;
            dayNumLineIndex = j;
            break;
          }
        }
        
        if (dayNumLine) {
          // 保存前一天
          if (currentDay) {
            itinerary.push(currentDay);
          }

          const dayNum = parseInt(dayNumLine);
          console.log(`[LionTravelPrintParser] Found DAY ${dayNum}`);
          
          // 尋找行程標題（通常是 ### 開頭的行）
          let titleLine = '';
          for (let j = dayNumLineIndex + 1; j < Math.min(dayNumLineIndex + 5, this.lines.length); j++) {
            const checkLine = this.lines[j].trim();
            if (checkLine.startsWith('###')) {
              titleLine = checkLine.replace(/^#+\s*/, '');
              break;
            } else if (checkLine && checkLine.length > 10 && !checkLine.startsWith('#')) {
              titleLine = checkLine;
              break;
            }
          }
          
          currentDay = {
            day: dayNum,
            title: titleLine,
            description: titleLine,
            meals: {},
            accommodation: '',
            activities: [],
          };
          
          // 解析標題中的景點作為 activities
          if (titleLine) {
            const spots = titleLine.split(/[\u3001\uff0c,\s]+/).filter(s => s.length > 1);
            spots.forEach((spot, idx) => {
              currentDay!.activities!.push({
                time: `${8 + idx}:00`,
                title: spot,
              });
            });
          }
          
          inMealsSection = false;
          inHotelSection = false;
          continue;
        }
      }

      if (!currentDay) continue;

      // 檢測餐食區塊
      if (line === '餐食' || line === '### 餐食' || line.includes('餐食')) {
        inMealsSection = true;
        inHotelSection = false;
        continue;
      }

      // 檢測住宿區塊
      if (line === '旅館' || line === '### 旅館' || line.includes('旅館')) {
        inMealsSection = false;
        inHotelSection = true;
        continue;
      }

      // 提取餐食
      if (inMealsSection) {
        // 格式 1: 早餐\nxxx
        if (line === '早餐' && nextLine) {
          currentDay.meals!.breakfast = nextLine;
        } else if (line === '午餐' && nextLine) {
          currentDay.meals!.lunch = nextLine;
        } else if (line === '晚餐' && nextLine) {
          currentDay.meals!.dinner = nextLine;
        }
        // 格式 2: 早餐xxx (同一行)
        else if (line.startsWith('早餐') && line.length > 2) {
          currentDay.meals!.breakfast = line.substring(2).trim();
        } else if (line.startsWith('午餐') && line.length > 2) {
          currentDay.meals!.lunch = line.substring(2).trim();
        } else if (line.startsWith('晚餐') && line.length > 2) {
          currentDay.meals!.dinner = line.substring(2).trim();
        }
      }

      // 提取住宿
      if (inHotelSection && line && !line.includes('DAY') && line !== '旅館') {
        if (line !== '溫暖的家' && line.length > 2) {
          currentDay.accommodation = line;
        }
        inHotelSection = false;
      }

      // 提取行程標題和描述（以時間開頭的行）
      if (!inMealsSection && !inHotelSection) {
        // 檢測時間格式的行程（如 08:20台北火車站...）
        const timeMatch = line.match(/^(\d{1,2}:\d{2})/);
        if (timeMatch) {
          if (!currentDay.title) {
            currentDay.title = line;
          }
          currentDay.description += (currentDay.description ? '\n' : '') + line;
          
          // 解析活動
          const activity = {
            time: timeMatch[1],
            title: line.replace(timeMatch[0], '').trim(),
          };
          currentDay.activities!.push(activity);
        }
        // 以 ### 開頭的標題
        else if (line.startsWith('###')) {
          const content = line.replace(/^#+\s*/, '').trim();
          if (content.match(/^\d{1,2}:\d{2}/)) {
            if (!currentDay.title) {
              currentDay.title = content;
            }
            currentDay.description += (currentDay.description ? '\n' : '') + content;
          }
        }
        // 描述性內容（以【開頭的景點介紹）
        else if (line.startsWith('【') || line.startsWith('※')) {
          currentDay.description += (currentDay.description ? '\n' : '') + line;
        }
        // 其他描述性內容
        else if (line.length > 30 && !line.includes('More +') && !line.match(/^[早午晚]餐/)) {
          currentDay.description += (currentDay.description ? '\n' : '') + line;
        }
      }
    }

    // 保存最後一天
    if (currentDay && !itinerary.find(d => d.day === currentDay!.day)) {
      itinerary.push(currentDay);
    }

    // 清理和格式化
    return itinerary.map(day => ({
      ...day,
      title: day.title || `第 ${day.day} 天`,
      description: day.description.trim(),
    }));
  }

  /**
   * 提取費用包含
   */
  private extractIncludes(): string[] {
    const includes: string[] = [];
    let inIncludesSection = false;

    for (const line of this.lines) {
      if (line.includes('費用包含') && !line.includes('不包含')) {
        inIncludesSection = true;
        continue;
      }

      if (inIncludesSection && (line.includes('費用不含') || line.includes('報名注意'))) {
        break;
      }

      if (inIncludesSection && line.startsWith('【')) {
        includes.push(line);
      }
    }

    return includes;
  }

  /**
   * 提取費用不含
   */
  private extractExcludes(): string[] {
    const excludes: string[] = [];
    let inExcludesSection = false;

    for (const line of this.lines) {
      if (line.includes('費用不含')) {
        inExcludesSection = true;
        continue;
      }

      if (inExcludesSection && (line.includes('報名注意') || line.includes('行程特殊提醒'))) {
        break;
      }

      if (inExcludesSection && (line.startsWith('＊') || line.startsWith('*'))) {
        excludes.push(line.replace(/^[＊*]\s*/, ''));
      }
    }

    return excludes;
  }

  /**
   * 提取注意事項
   */
  private extractNotices(): string[] {
    const notices: string[] = [];
    let inNoticesSection = false;

    for (const line of this.lines) {
      if (line.includes('報名注意事項') || line.includes('行程特殊提醒')) {
        inNoticesSection = true;
        continue;
      }

      if (inNoticesSection && (line.includes('旅遊資訊') || line.includes('責任旅人'))) {
        break;
      }

      if (inNoticesSection && (line.startsWith('☆') || line.startsWith('⚠️') || line.startsWith('＊'))) {
        notices.push(line.replace(/^[☆⚠️＊]\s*/, ''));
      }
    }

    return notices;
  }

  /**
   * 提取集合地點
   */
  private extractAssemblyPoint(): LionTravelPrintData['assemblyPoint'] | undefined {
    let location = '';
    let address = '';
    let time = '';

    let inAssemblySection = false;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];

      if (line.includes('集合地點') && !line.includes('Assembling')) {
        inAssemblySection = true;
        continue;
      }

      if (inAssemblySection) {
        if (line.includes('雄獅') || line.includes('門市')) {
          location = line;
        } else if (line.includes('火車站') || line.includes('集合')) {
          address = line;
        } else if (line.match(/^\d{1,2}:\d{2}$/)) {
          time = line;
        }

        if (line.includes('每日行程')) {
          break;
        }
      }
    }

    if (location || address || time) {
      return { location, address, time };
    }

    return undefined;
  }
}

/**
 * 便捷函數：解析雄獅旅遊列印版 Markdown
 */
export function parseLionTravelPrint(markdown: string): LionTravelPrintData | null {
  const parser = new LionTravelPrintParser(markdown);
  return parser.parse();
}
