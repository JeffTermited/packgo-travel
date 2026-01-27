/**
 * Content Analyzer Agent
 * Responsible for analyzing content and copyright cleansing
 */

import { invokeLLM } from "../_core/llm";
import { COPYWRITER_SKILL } from "./skillLibrary";
import { getKeyInstructions, extractJsonSchema } from "./skillLoader";

export interface ContentAnalyzerResult {
  success: boolean;
  data?: {
    poeticTitle: string; // 詩意化標題 (Sipincollection 風格)
    title: string;
    description: string;
    heroSubtitle: string;
    highlights: any[];
    keyFeatures: any[];
    poeticContent: any;
    poeticSubtitle: string; // 詩意副標題
    attractions: any[]; // 景點詳細介紹
    hotels: any[]; // 飯店詳細介紹
    meals: any[]; // 餐食介紹
    flights: any; // 航班資訊
    originalityScore: number; // 0-100
  };
  error?: string;
}

/**
 * Content Analyzer Agent
 * Analyzes and rewrites content to ensure originality
 */
export class ContentAnalyzerAgent {
  private skillInstructions: string;
  private jsonSchema: any;

  constructor() {
    // Load SKILL.md instructions (only key sections for token optimization)
    this.skillInstructions = getKeyInstructions('ContentAnalyzerAgent');
    this.jsonSchema = extractJsonSchema('ContentAnalyzerAgent');
    console.log('[ContentAnalyzerAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
  }
  /**
   * Execute content analysis and copyright cleansing
   */
  async execute(rawData: any): Promise<ContentAnalyzerResult> {
    console.log("[ContentAnalyzerAgent] Starting content analysis...");
    
    try {
      // Step 1: Generate poetic title and highlights (Sipincollection style)
      const { poeticTitle, highlights: poeticHighlights } = await this.generatePoeticTitle(rawData);
      
      // Step 2: Rewrite title (marketing-focused, fallback)
      const title = await this.rewriteTitle(rawData);
      
      // Step 3: Rewrite description (100-150 words)
      const description = await this.rewriteDescription(rawData);
      
      // Step 4: Generate hero subtitle
      const heroSubtitle = await this.generateHeroSubtitle(rawData);
      
      // Step 5: Use poetic highlights (from Step 1)
      const highlights = poeticHighlights.length > 0 ? poeticHighlights : await this.generateHighlights(rawData);
      
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
          poeticTitle, // 新增: 詩意化標題
          title,
          description,
          heroSubtitle,
          highlights,
          keyFeatures,
          poeticContent,
          poeticSubtitle: "", // TODO: 將由 PoeticAgent 生成
          attractions: [], // TODO: 將由 AttractionAgent 生成
          hotels: [], // TODO: 將由 HotelAgent 生成
          meals: [], // TODO: 將由 MealAgent 生成
          flights: {}, // TODO: 將由 FlightAgent 生成
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
   * Generate poetic title and highlights (Sipincollection style) with JSON Schema
   */
  private async generatePoeticTitle(rawData: any): Promise<{ poeticTitle: string; highlights: string[] }> {
    const destinationCountry = rawData.location?.destinationCountry || "";
    const destinationCity = rawData.location?.destinationCity || "";
    const days = rawData.duration?.days || "";
    const nights = rawData.duration?.nights || "";
    const highlights = rawData.highlights || [];
    const hotelGrade = rawData.accommodation?.hotelGrade || "";
    const specialExperiences = rawData.specialExperiences || [];
    
    // Data validation
    if (!destinationCity && !destinationCountry) {
      console.warn("[ContentAnalyzerAgent] Insufficient data for poetic title generation");
      return { poeticTitle: "精選行程", highlights: [] }; // Fallback
    }
    
    // Use SKILL.md instructions instead of hardcoded prompt
    const systemPrompt = this.skillInstructions || `你是一位資深的高端旅遊文案編輯,專門為頂級旅遊品牌撰寫詩意化的行程標題。

你的標題風格特點:
1. 使用精煉的形容詞修飾目的地或體驗 (例如: 雅奢、秘境、光影、極致)
2. 加入動詞增加動感 (例如: 尋蹤、漫遊、走進、探索)
3. 使用比喻和意象,讓標題更有畫面感
4. 保持簡潔,15-25 個中文字
5. 突出行程的核心賣點和獨特性

參考範例:
- "北海道二世谷雅奢6日" (強調奢華體驗)
- "秘境尋蹤 中島漫遊" (強調神秘探索)
- "光影之城 走進藝術家眼中的旅程" (強調藝術體驗)
- "京都禪意之旅 米其林懷石料理" (強調文化與美食)
- "托斯卡尼艷陽下 品味義式慢活" (強調生活方式)

請根據行程資訊,生成一個符合上述風格的詩意化標題。`;
    
    const userPrompt = `請根據以下資訊生成一個詩意化的行程標題和亮點:

目的地國家: ${destinationCountry}
目的地城市: ${destinationCity}
天數: ${days}天${nights}夜
行程亮點: ${highlights.slice(0, 3).join("、")}
飯店等級: ${hotelGrade}
特色體驗: ${specialExperiences.join("、")}

範例風格:
- "北海道二世谷雅奢6日" (強調奢華)
- "秘境尋蹤 中島漫遊" (強調探索)
- "光影之城 走進藝術家眼中的旅程" (強調藝術)

請生成:
1. 一個 15-25 個中文字的詩意化標題
2. 6-10 個行程亮點 (每個 10-30 個中文字的純文字描述)`;
    
    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "poetic_title_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                poeticTitle: {
                  type: "string",
                  description: "詩意化的行程標題,15-25 個中文字"
                },
                highlights: {
                  type: "array",
                  description: "6-10 個行程亮點,每個是 10-30 個中文字的純文字描述",
                  items: {
                    type: "string"
                  },
                  minItems: 6,
                  maxItems: 10
                },
                reasoning: {
                  type: "string",
                  description: "標題設計的理由"
                },
                keywords: {
                  type: "array",
                  description: "標題中使用的關鍵詞",
                  items: {
                    type: "string"
                  }
                }
              },
              required: ["poeticTitle", "highlights", "reasoning", "keywords"],
              additionalProperties: false
            }
          }
        }
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from LLM");
      }
      
      // Convert content to string if it's an array
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      const result = JSON.parse(contentStr);
      const poeticTitle = result.poeticTitle;
      const highlights = result.highlights || [];
      
      // Validate length
      if (poeticTitle && poeticTitle.length >= 15 && poeticTitle.length <= 30) {
        console.log(`[ContentAnalyzerAgent] Poetic title generated: ${poeticTitle}`);
        console.log(`[ContentAnalyzerAgent] Highlights count: ${highlights.length}`);
        console.log(`[ContentAnalyzerAgent] Reasoning: ${result.reasoning}`);
        return { poeticTitle, highlights };
      }
      
      // If too long, truncate
      if (poeticTitle && poeticTitle.length > 30) {
        console.warn(`[ContentAnalyzerAgent] Poetic title too long (${poeticTitle.length} chars), truncating...`);
        return { poeticTitle: poeticTitle.substring(0, 30), highlights };
      }
      
      // If too short, use fallback
      console.warn(`[ContentAnalyzerAgent] Poetic title too short, using fallback`);
      return {
        poeticTitle: `${destinationCity}${days}日精選之旅`,
        highlights: []
      };
      
    } catch (error) {
      console.error("[ContentAnalyzerAgent] Poetic title generation failed:", error);
      // Fallback: simple template
      return {
        poeticTitle: `${destinationCity}${days}日精選之旅`,
        highlights: []
      };
    }
  }
  
  /**
   * Rewrite title as marketing copy with retry mechanism
   */
  private async rewriteTitle(rawData: any): Promise<string> {
    const originalTitle = rawData.basicInfo?.title || "";
    const destination = rawData.location?.destinationCity || rawData.location?.destinationCountry || "";
    const days = rawData.duration?.days || "";
    
    // Data validation
    if (!originalTitle && !destination) {
      console.warn("[ContentAnalyzerAgent] Insufficient data for title generation");
      return "精選行程"; // Fallback
    }
    
    const userPrompt = `請根據以下資訊重新撰寫一個簡潔、吸引人的行銷標題：

原標題：${originalTitle}
目的地：${destination}
天數：${days}天

範例：「北海道雪國秘境 5 日｜米其林溫泉旅宿 × 洞爺湖心中島探索」

只回傳標題文字，不要其他說明。`;
    
    // Retry up to 2 times
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: COPYWRITER_SKILL },
            { role: "user", content: userPrompt }
          ],
        });
        
        const content = response.choices[0]?.message?.content;
        const title = typeof content === "string" ? content.trim() : null;
        
        // Validate word count (20-30 characters)
        if (title && title.length >= 20 && title.length <= 30) {
          return title;
        }
        
        // If word count is invalid, force truncate or retry
        if (title && title.length > 30) {
          console.warn(`[ContentAnalyzerAgent] Title too long (${title.length} chars), truncating...`);
          return title.substring(0, 30);
        }
        
        console.warn(`[ContentAnalyzerAgent] Title too short or invalid, attempt ${attempt}/2`);
      } catch (error) {
        console.error(`[ContentAnalyzerAgent] Title generation failed, attempt ${attempt}/2:`, error);
      }
    }
    
    // Fallback: use original title or default
    return originalTitle || "精選行程";
  }
  
  /**
   * Rewrite description (100-120 words) with retry mechanism
   */
  private async rewriteDescription(rawData: any): Promise<string> {
    const originalDescription = rawData.basicInfo?.description || "";
    const destination = rawData.location?.destinationCity || rawData.location?.destinationCountry || "";
    const highlights = rawData.highlights || [];
    
    // Data validation
    if (!originalDescription && !destination && highlights.length === 0) {
      console.warn("[ContentAnalyzerAgent] Insufficient data for description generation");
      return "探索精彩行程，體驗難忘旅程。"; // Fallback
    }
    
    const userPrompt = `請根據以下資訊重新撰寫一段精彩的行程介紹：

原描述：${originalDescription}
目的地：${destination}
行程亮點：${highlights.join("、")}

範例：「在北海道的雪白世界中，展開一場心靈的洗禮之旅。入住米其林一星鑰旅宿，感受極致奢華與日式美學的完美融合；搭乘遊船探索洞爺湖心中島，欣賞湖光山色的絕美景致；漫步二世谷秘境，體驗北國獨有的寧靜與感動。這不僅是一趟旅行，更是一場與自然、與自我的深度對話。」

只回傳介紹文字，不要其他說明。`;
    
    // Retry up to 2 times
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: COPYWRITER_SKILL },
            { role: "user", content: userPrompt }
          ],
        });
        
        const content = response.choices[0]?.message?.content;
        const description = typeof content === "string" ? content.trim() : null;
        
        // Validate word count (100-120 characters)
        if (description && description.length >= 100 && description.length <= 120) {
          return description;
        }
        
        // If word count is invalid, force truncate or retry
        if (description && description.length > 120) {
          console.warn(`[ContentAnalyzerAgent] Description too long (${description.length} chars), truncating...`);
          return description.substring(0, 120);
        }
        
        console.warn(`[ContentAnalyzerAgent] Description too short or invalid, attempt ${attempt}/2`);
      } catch (error) {
        console.error(`[ContentAnalyzerAgent] Description generation failed, attempt ${attempt}/2:`, error);
      }
    }
    
    // Fallback: use original description or default
    return originalDescription || "探索精彩行程，體驗難忘旅程。";
  }
  
  /**
   * Generate hero subtitle (30-40 words) with retry mechanism
   */
  private async generateHeroSubtitle(rawData: any): Promise<string> {
    const hotelGrade = rawData.accommodation?.hotelGrade || "";
    const destinationCity = rawData.location?.destinationCity || "";
    const days = rawData.duration?.days || "";
    const nights = rawData.duration?.nights || "";
    const highlights = rawData.highlights?.slice(0, 3) || [];
    
    // Data validation
    if (highlights.length === 0 && !destinationCity) {
      console.warn("[ContentAnalyzerAgent] Insufficient data for hero subtitle generation");
      return "精選行程．深度體驗"; // Fallback
    }
    
    const userPrompt = `請根據以下資訊生成一個精彩的 Hero 副標題：

目的地：${destinationCity}
飯店等級：${hotelGrade}
天數：${days}天${nights}夜
行程亮點：${highlights.join("、")}

範例：「米其林溫泉旅宿．洞爺湖心中島探索．二世谷秘境漫遊」

只回傳副標題文字，不要其他說明。`;
    
    // Retry up to 2 times
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: COPYWRITER_SKILL },
            { role: "user", content: userPrompt }
          ],
        });
        
        const content = response.choices[0]?.message?.content;
        const subtitle = typeof content === "string" ? content.trim() : null;
        
        // Validate word count (30-40 characters)
        if (subtitle && subtitle.length >= 30 && subtitle.length <= 40) {
          return subtitle;
        }
        
        // If word count is invalid, force truncate or retry
        if (subtitle && subtitle.length > 40) {
          console.warn(`[ContentAnalyzerAgent] Hero subtitle too long (${subtitle.length} chars), truncating...`);
          return subtitle.substring(0, 40);
        }
        
        console.warn(`[ContentAnalyzerAgent] Hero subtitle too short or invalid, attempt ${attempt}/2`);
      } catch (error) {
        console.error(`[ContentAnalyzerAgent] Hero subtitle generation failed, attempt ${attempt}/2:`, error);
      }
    }
    
    // Fallback: use highlights or default
    if (highlights.length > 0) {
      return highlights.join("．");
    }
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
