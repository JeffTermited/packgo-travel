/**
 * 快速網頁抓取模組
 * 使用多種方式快速提取網頁內容，不依賴慢速的 Browser Operator
 */

import { invokeLLM } from "./_core/llm";

interface ScrapedContent {
  html: string;
  text: string;
  title: string;
  images: string[];
}

/**
 * 使用 fetch 直接抓取網頁內容
 * 速度最快，但可能無法處理 JavaScript 渲染的內容
 */
export async function fetchWebPage(url: string): Promise<ScrapedContent> {
  console.log("[WebScraper] Fetching URL:", url);
  
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";
  
  // Extract images
  const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const images: string[] = [];
  let imageMatch;
  while ((imageMatch = imageRegex.exec(html)) !== null) {
    if (imageMatch[1] && !imageMatch[1].includes('data:') && !imageMatch[1].includes('svg')) {
      images.push(imageMatch[1]);
    }
  }
  
  // Extract text content
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  console.log("[WebScraper] Fetched content - Title:", title, "Text length:", text.length, "Images:", images.length);
  
  return { html, text, title, images };
}

/**
 * 使用 LLM 從網頁內容中提取旅遊行程資訊
 * 這是核心的提取邏輯，速度快且準確
 */
export async function extractTourInfoWithLLM(content: ScrapedContent, sourceUrl: string): Promise<any> {
  console.log("[WebScraper] Extracting tour info with LLM...");
  console.log("[WebScraper] Content text length:", content.text.length);
  console.log("[WebScraper] Content title:", content.title);
  
  // 限制文字長度以加快處理速度
  const textContent = content.text.substring(0, 30000);
  
  const extractionPrompt = `你是一個資深旅遊編輯，專門從網頁內容中提取完整的旅遊行程資訊。請從以下網頁內容中提取所有旅遊行程資訊，並以 JSON 格式回傳。

網頁標題：${content.title}
網頁網址：${sourceUrl}

網頁內容：
${textContent}

請提取以下資訊並以 JSON 格式回傳（如果找不到某項資訊，請使用合理的預設值或留空）：
{
  "basicInfo": {
    "title": "行程標題（請重新撰寫一個吸引人的行銷標題，不要原文照抄）",
    "productCode": "產品代碼",
    "description": "行程描述（100-200字的精彩行程亮點介紹，請重新撰寫）",
    "promotionText": "促銷文字（如：過年大促銷、限時優惠等）",
    "tags": ["標籤，如：特色住宿、獨家企劃、刷卡好康"]
  },
  "location": {
    "departureCountry": "出發國家（預設台灣）",
    "departureCity": "出發城市（如：桃園、台北、高雄）",
    "departureAirportCode": "出發機場代碼（如：TPE）",
    "departureAirportName": "出發機場名稱",
    "destinationCountry": "目的地國家",
    "destinationCity": "目的地城市",
    "destinationRegion": "目的地區域",
    "destinationAirportCode": "目的地機場代碼",
    "destinationAirportName": "目的地機場名稱",
    "destinationDescription": "目的地介紹（100-200字）"
  },
  "duration": {
    "days": 天數（數字）,
    "nights": 晚數（數字）
  },
  "pricing": {
    "price": 價格（數字，新台幣，不含逗號）,
    "priceUnit": "人/起",
    "availableSeats": 可賣席次（數字）
  },
  "flight": {
    "outbound": {
      "airline": "去程航空公司",
      "flightNo": "去程航班號",
      "departureTime": "去程出發時間（如：06:55）",
      "arrivalTime": "去程抵達時間（如：09:15）",
      "duration": "去程飛行時間（如：1h20m）"
    },
    "inbound": {
      "airline": "回程航空公司",
      "flightNo": "回程航班號",
      "departureTime": "回程出發時間",
      "arrivalTime": "回程抵達時間",
      "duration": "回程飛行時間"
    }
  },
  "accommodation": {
    "hotelName": "酒店名稱",
    "hotelGrade": "酒店等級（如：五星級、四星級）",
    "hotelNights": 住宿晚數,
    "hotelLocation": "酒店位置",
    "hotelDescription": "酒店介紹",
    "hotelFacilities": ["設施1", "設施2"],
    "hotelRoomType": "房型",
    "hotelCheckIn": "入住時間",
    "hotelCheckOut": "退房時間"
  },
  "attractions": [
    {
      "name": "景點名稱",
      "description": "景點描述"
    }
  ],
  "dailyItinerary": [
    {
      "day": 1,
      "title": "第一天標題",
      "activities": ["活動1", "活動2"]
    }
  ],
  "pricingDetails": {
    "includes": ["費用包含項目1", "費用包含項目2"],
    "excludes": ["費用不含項目1", "費用不含項目2"],
    "optionalTours": []
  },
  "highlights": ["行程亮點1", "行程亮點2"],
  "notes": {
    "specialReminders": "行程特殊提醒",
    "notes": "行程備註",
    "safetyGuidelines": "安全守則"
  },
  "departureDate": "出發日期（YYYY-MM-DD）",
  "imageUrl": "行程主圖片網址"
}

重要注意事項：
1. 標題和描述請重新撰寫，使其更吸引人，不要原文照抄
2. 價格請只提取數字，不要包含貨幣符號和逗號
3. 天數和晚數請只提取數字
4. 請確保 JSON 格式正確，可以被解析
5. 如果找不到某項資訊，請留空或使用合理的預設值`;

  let llmResponse;
  try {
    console.log("[WebScraper] Calling LLM API...");
    llmResponse = await invokeLLM({
      messages: [
        {
          role: "system" as const,
          content: "你是一個資深旅遊編輯，專門從網頁內容中提取結構化的旅遊行程資訊。你需要重新撰寫標題和描述，使其更具吸引力。請只回傳 JSON 格式的資料，不要包含其他文字。",
        },
        {
          role: "user" as const,
          content: extractionPrompt,
        },
      ],
      response_format: { type: "json_object" },
    });
    console.log("[WebScraper] LLM API response received");
  } catch (llmError: any) {
    console.error("[WebScraper] LLM API call failed:", llmError.message);
    throw new Error(`LLM API 呼叫失敗: ${llmError.message}`);
  }

  const responseContent = llmResponse.choices[0]?.message?.content;
  if (!responseContent) {
    console.error("[WebScraper] LLM response:", JSON.stringify(llmResponse, null, 2));
    throw new Error("LLM 未返回任何內容");
  }

  console.log("[WebScraper] LLM extraction completed, response type:", typeof responseContent);
  console.log("[WebScraper] Response preview:", typeof responseContent === "string" ? responseContent.substring(0, 200) : "non-string");
  
  // Parse JSON response
  let extractedData;
  try {
    extractedData = JSON.parse(typeof responseContent === "string" ? responseContent : JSON.stringify(responseContent));
  } catch (parseError: any) {
    console.error("[WebScraper] JSON parse error:", parseError.message);
    console.error("[WebScraper] Raw response:", responseContent);
    throw new Error(`JSON 解析失敗: ${parseError.message}`);
  }
  
  // Add first image from scraped content if no imageUrl found
  if (!extractedData.imageUrl && content.images.length > 0) {
    // Find a suitable main image (usually larger images)
    const mainImage = content.images.find(img => 
      !img.includes('icon') && 
      !img.includes('logo') && 
      !img.includes('avatar') &&
      (img.includes('jpg') || img.includes('jpeg') || img.includes('png') || img.includes('webp'))
    );
    if (mainImage) {
      // Convert relative URL to absolute if needed
      if (mainImage.startsWith('/')) {
        const urlObj = new URL(sourceUrl);
        extractedData.imageUrl = `${urlObj.origin}${mainImage}`;
      } else if (!mainImage.startsWith('http')) {
        const urlObj = new URL(sourceUrl);
        extractedData.imageUrl = `${urlObj.origin}/${mainImage}`;
      } else {
        extractedData.imageUrl = mainImage;
      }
    }
  }
  
  return extractedData;
}

/**
 * 快速提取旅遊行程資訊的主函數
 * 使用 fetch + LLM 方式，速度約 30 秒
 */
export async function quickExtractTourInfo(url: string): Promise<any> {
  console.log("[WebScraper] Quick extracting tour info from:", url);
  const startTime = Date.now();
  
  try {
    // Step 1: Fetch web page content
    const content = await fetchWebPage(url);
    
    // Step 2: Use LLM to extract tour info
    const extractedData = await extractTourInfoWithLLM(content, url);
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`[WebScraper] Quick extraction completed in ${duration.toFixed(1)} seconds`);
    
    return extractedData;
  } catch (error) {
    console.error("[WebScraper] Quick extraction failed:", error);
    throw error;
  }
}
