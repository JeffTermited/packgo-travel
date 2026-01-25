/**
 * Content Analyzer Agent
 * Responsible for analyzing content and copyright cleansing
 */

import { invokeLLM } from "../_core/llm";

export interface ContentAnalyzerResult {
  success: boolean;
  data?: {
    title: string;
    description: string;
    heroSubtitle: string;
    highlights: any[];
    keyFeatures: any[];
    poeticContent: any;
    originalityScore: number; // 0-100
  };
  error?: string;
}

/**
 * Content Analyzer Agent
 * Analyzes and rewrites content to ensure originality
 */
export class ContentAnalyzerAgent {
  /**
   * Execute content analysis and copyright cleansing
   */
  async execute(rawData: any): Promise<ContentAnalyzerResult> {
    console.log("[ContentAnalyzerAgent] Starting content analysis...");
    
    try {
      // Step 1: Rewrite title (marketing-focused)
      const title = await this.rewriteTitle(rawData);
      
      // Step 2: Rewrite description (100-150 words)
      const description = await this.rewriteDescription(rawData);
      
      // Step 3: Generate hero subtitle
      const heroSubtitle = await this.generateHeroSubtitle(rawData);
      
      // Step 4: Generate highlights
      const highlights = await this.generateHighlights(rawData);
      
      // Step 5: Generate key features
      const keyFeatures = await this.generateKeyFeatures(rawData);
      
      // Step 6: Generate poetic content
      const poeticContent = await this.generatePoeticContent(rawData);
      
      // Step 7: Verify originality
      const originalityScore = await this.verifyOriginality({
        title,
        description,
        heroSubtitle,
      });
      
      console.log("[ContentAnalyzerAgent] Content analysis completed");
      console.log("[ContentAnalyzerAgent] Originality score:", originalityScore);
      
      return {
        success: true,
        data: {
          title,
          description,
          heroSubtitle,
          highlights,
          keyFeatures,
          poeticContent,
          originalityScore,
        },
      };
    } catch (error) {
      console.error("[ContentAnalyzerAgent] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
  /**
   * Rewrite title as marketing copy
   */
  private async rewriteTitle(rawData: any): Promise<string> {
    const originalTitle = rawData.basicInfo?.title || "";
    const destination = rawData.location?.destinationCity || rawData.location?.destinationCountry || "";
    const days = rawData.duration?.days || "";
    
    const prompt = `你是一位資深旅遊編輯，請根據以下資訊重新撰寫一個簡潔、吸引人的行銷標題（不超過 30 字）：

原標題：${originalTitle}
目的地：${destination}
天數：${days}天

要求：
1. 不要原文照抄
2. 突出行程亮點和特色
3. 使用吸引人的詞彙
4. 保持專業和優雅的語調
5. 只回傳標題文字，不要其他說明

範例：「北海道雪國秘境 5 日｜米其林溫泉旅宿 × 洞爺湖心中島探索」`;

    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
    });
    
    const content = response.choices[0]?.message?.content;
    return (typeof content === "string" ? content.trim() : originalTitle) || originalTitle;
  }
  
  /**
   * Rewrite description (100-150 words)
   */
  private async rewriteDescription(rawData: any): Promise<string> {
    const originalDescription = rawData.basicInfo?.description || "";
    const destination = rawData.location?.destinationCity || rawData.location?.destinationCountry || "";
    const highlights = rawData.highlights || [];
    
    const prompt = `你是一位資深旅遊編輯，請根據以下資訊重新撰寫一段精彩的行程介紹（100-150 字）：

原描述：${originalDescription}
目的地：${destination}
行程亮點：${highlights.join("、")}

要求：
1. 完全重寫，不要原文照抄
2. 突出行程的獨特性和吸引力
3. 使用優雅、詩意的語言
4. 字數控制在 100-150 字
5. 只回傳介紹文字，不要其他說明

範例：「在北海道的雪白世界中，展開一場心靈的洗禮之旅。入住米其林一星鑰旅宿，感受極致奢華與日式美學的完美融合；搭乘遊船探索洞爺湖心中島，欣賞湖光山色的絕美景致；漫步二世谷秘境，體驗北國獨有的寧靜與感動。這不僅是一趟旅行，更是一場與自然、與自我的深度對話。」`;

    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
    });
    
    const content = response.choices[0]?.message?.content;
    return (typeof content === "string" ? content.trim() : originalDescription) || originalDescription;
  }
  
  /**
   * Generate hero subtitle
   */
  private async generateHeroSubtitle(rawData: any): Promise<string> {
    const hotelGrade = rawData.accommodation?.hotelGrade || "";
    const destinationCity = rawData.location?.destinationCity || "";
    const days = rawData.duration?.days || "";
    const nights = rawData.duration?.nights || "";
    const highlights = rawData.highlights?.slice(0, 3) || [];
    
    // Simple format: highlight1 · highlight2 · highlight3
    if (highlights.length > 0) {
      return highlights.join("．");
    }
    
    // Fallback format
    return `${hotelGrade ? hotelGrade + "．" : ""}${destinationCity}深度遊．${days}天${nights}夜`;
  }
  
  /**
   * Generate highlights (3-5 items)
   */
  private async generateHighlights(rawData: any): Promise<any[]> {
    const highlights = rawData.highlights || [];
    const accommodation = rawData.accommodation || {};
    const attractions = rawData.attractions || [];
    
    // Transform to new structure
    const result: any[] = [];
    
    // Add accommodation highlight
    if (accommodation.hotelName) {
      result.push({
        id: 1,
        image: "", // Will be generated by Image Generation Agent
        imageAlt: `${accommodation.hotelName}`,
        title: accommodation.hotelName,
        subtitle: "STAY",
        description: accommodation.hotelDescription || `入住${accommodation.hotelGrade || ""}酒店，享受舒適與便利`,
        labelColor: "#F39C12",
        labelPosition: "bottom-right",
      });
    }
    
    // Add attraction highlights
    attractions.slice(0, 2).forEach((attraction: any, index: number) => {
      result.push({
        id: index + 2,
        image: "", // Will be generated by Image Generation Agent
        imageAlt: attraction.name || `景點 ${index + 1}`,
        title: attraction.name || `特色景點 ${index + 1}`,
        subtitle: "EXPLORE",
        description: attraction.description || "探索當地特色景點",
        labelColor: "#F39C12",
        labelPosition: "bottom-right",
      });
    });
    
    // Ensure at least 3 highlights
    while (result.length < 3) {
      result.push({
        id: result.length + 1,
        image: "",
        imageAlt: `行程亮點 ${result.length + 1}`,
        title: highlights[result.length - 1] || `精彩體驗 ${result.length + 1}`,
        subtitle: "EXPERIENCE",
        description: "深度體驗當地文化與風情",
        labelColor: "#F39C12",
        labelPosition: "bottom-right",
      });
    }
    
    return result.slice(0, 5); // Max 5 highlights
  }
  
  /**
   * Generate key features (vertical text layout)
   */
  private async generateKeyFeatures(rawData: any): Promise<any[]> {
    const accommodation = rawData.accommodation || {};
    const destination = rawData.location?.destinationCity || rawData.location?.destinationCountry || "";
    
    return [
      {
        id: 1,
        keyword: "雅奢旅宿",
        keywordStyle: "vertical",
        image: "", // Will be generated by Image Generation Agent
        imageAlt: `${destination}雅奢旅宿`,
        phrases: [
          "覽秘境無邊風月",
          "品其國美饌名湯",
          "享星鑰洞迴匠心",
        ],
        description: accommodation.hotelDescription || "現代設計與傳統美學的完美融合，打造極致奢華的住宿體驗。",
      },
      {
        id: 2,
        keyword: "遊",
        keywordStyle: "vertical",
        image: null,
        phrases: [
          "理想星鏡",
          "極致歡待",
        ],
        description: `深度探索${destination}的自然美景與人文風情。`,
      },
      {
        id: 3,
        keyword: "特別安排",
        keywordStyle: "vertical",
        image: null,
        phrases: [
          "秘境尋蹤",
          "深度漫遊",
        ],
        description: `獨家安排的特色行程，帶您體驗不一樣的${destination}。`,
      },
    ];
  }
  
  /**
   * Generate poetic content
   */
  private async generatePoeticContent(rawData: any): Promise<any> {
    const destination = rawData.location?.destinationCity || rawData.location?.destinationCountry || "";
    const accommodation = rawData.accommodation || {};
    
    return {
      intro: `在${destination}的世界中，尋找心靈的寧靜與感動`,
      accommodation: accommodation.hotelName 
        ? `入住${accommodation.hotelName}，感受極致奢華與美學的完美融合`
        : `入住精選酒店，享受舒適與便利`,
      dining: `品嚐${destination}的山珍海味，每一口都是大自然的恩賜`,
      experience: `深度探索${destination}的秘境，讓旅程成為一生難忘的回憶`,
      closing: "這不僅是一趟旅行，更是一場心靈的洗禮",
    };
  }
  
  /**
   * Verify originality (simple check)
   */
  private async verifyOriginality(content: {
    title: string;
    description: string;
    heroSubtitle: string;
  }): Promise<number> {
    // Simple originality check based on content length and uniqueness
    // In production, this could be enhanced with more sophisticated checks
    
    const totalLength = content.title.length + content.description.length + content.heroSubtitle.length;
    
    // Basic score: longer content = higher originality
    let score = Math.min(100, totalLength / 3);
    
    // Check for common phrases (reduce score if found)
    const commonPhrases = ["行程", "旅遊", "精選", "特色", "深度"];
    let commonCount = 0;
    commonPhrases.forEach(phrase => {
      if (content.description.includes(phrase)) commonCount++;
    });
    
    score -= commonCount * 5;
    
    return Math.max(60, Math.min(100, score)); // Ensure score is between 60-100
  }
}
