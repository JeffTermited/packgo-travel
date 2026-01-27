/**
 * Lion Travel Title Generator
 * 生成符合雄獅旅遊風格的行程標題 (40-80 字)
 */

import { invokeLLM } from "../_core/llm";

/**
 * Generate Lion Travel style title (40-80 characters)
 * Format: 目的地旅遊｜亮點1.亮點2.亮點3.天數日
 */
export async function generateLionTravelTitle(rawData: any): Promise<string> {
  const destinationCountry = rawData.location?.destinationCountry || "";
  const destinationCity = rawData.location?.destinationCity || "";
  const days = rawData.duration?.days || 5;
  const highlights = rawData.highlights || [];
  const hotelName = rawData.accommodation?.hotelName || "";
  const hotelGrade = rawData.accommodation?.hotelGrade || "";
  const attractions = rawData.attractions || [];
  const specialExperiences = rawData.specialExperiences || [];
  
  // Data validation
  if (!destinationCity && !destinationCountry) {
    console.warn("[LionTitleGenerator] Insufficient data for title generation");
    return `精選旅遊｜${days}日`;
  }
  
  const systemPrompt = `你是雄獅旅遊的資深行程編輯，專門撰寫符合雄獅旅遊風格的行程標題。

雄獅旅遊標題格式特點：
1. 開頭是「目的地旅遊｜」或「國家/城市旅遊｜」
2. 中間用「.」分隔各個行程亮點
3. 結尾是「天數日」
4. 總長度 40-80 個中文字
5. 亮點包含：特色景點、住宿特色、餐食特色、體驗活動、購物說明等

參考範例：
- 「新馬旅遊｜紫竹谷禪境.入住話題性十足的棕櫚水上渡假村.深度體驗世界文化遺產馬六甲古城.特別安排三輪車漫遊古城.品嚐精緻六宮格下午茶.探訪馬來西亞清幽的紫竹谷及普陀村.5日」
- 「日本旅遊｜北海道二世谷雅奢6日.入住米其林一星鑰旅宿.洞爺湖心中島探索.二世谷秘境漫遊.品嚐懷石料理」
- 「韓國旅遊｜首爾明洞購物.景福宮古裝體驗.北村韓屋村.南山塔夜景.5日」`;
  
  const userPrompt = `請根據以下資訊生成一個符合雄獅旅遊風格的行程標題（40-80字）：

目的地國家: ${destinationCountry}
目的地城市: ${destinationCity}
天數: ${days}天
行程亮點: ${highlights.slice(0, 5).join("、")}
飯店名稱: ${hotelName}
飯店等級: ${hotelGrade}
景點: ${attractions.map((a: any) => a.name || a).slice(0, 3).join("、")}
特色體驗: ${specialExperiences.join("、")}

請直接回傳標題文字，不要其他說明。標題必須：
1. 以「目的地旅遊｜」開頭
2. 用「.」分隔各個亮點
3. 以「${days}日」結尾
4. 總長度 40-80 個中文字`;
  
  // Retry up to 2 times
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      });
      
      const content = response.choices[0]?.message?.content;
      const title = typeof content === "string" ? content.trim() : null;
      
      // Validate length (40-80 characters)
      if (title && title.length >= 40 && title.length <= 80) {
        console.log(`[LionTitleGenerator] Title generated: ${title} (${title.length} chars)`);
        return title;
      }
      
      // If too long, truncate and add days suffix
      if (title && title.length > 80) {
        console.warn(`[LionTitleGenerator] Title too long (${title.length} chars), truncating...`);
        const truncated = title.substring(0, 75);
        // Find last . and truncate there
        const lastDot = truncated.lastIndexOf(".");
        if (lastDot > 30) {
          return truncated.substring(0, lastDot) + `.${days}日`;
        }
        return truncated + `...${days}日`;
      }
      
      // If too short, try again
      console.warn(`[LionTitleGenerator] Title too short (${title?.length || 0} chars), attempt ${attempt}/2`);
    } catch (error) {
      console.error(`[LionTitleGenerator] Title generation failed, attempt ${attempt}/2:`, error);
    }
  }
  
  // Fallback: construct title from available data
  const destination = destinationCity || destinationCountry;
  const fallbackHighlights: string[] = [];
  
  if (hotelName) {
    fallbackHighlights.push(`入住${hotelName.substring(0, 15)}`);
  } else if (hotelGrade) {
    fallbackHighlights.push(`${hotelGrade}住宿`);
  }
  
  attractions.slice(0, 2).forEach((a: any) => {
    const name = a.name || a;
    if (name && name.length <= 15) {
      fallbackHighlights.push(name);
    }
  });
  
  highlights.slice(0, 2).forEach((h: string) => {
    if (h && h.length <= 15) {
      fallbackHighlights.push(h);
    }
  });
  
  const fallbackTitle = `${destination}旅遊｜${fallbackHighlights.join(".")}.${days}日`;
  console.log(`[LionTitleGenerator] Using fallback title: ${fallbackTitle}`);
  return fallbackTitle;
}
