/**
 * Image Prompt Agent
 * Responsible for generating optimized image prompts using LLM
 */

import { invokeLLM } from "../_core/llm";
import { StyleGuide, ImageGenerationRequest } from "../../shared/tourTypes";
import { getStyleGuideForDestination } from "../styleGuide";

export interface ImagePromptResult {
  success: boolean;
  data?: {
    heroPrompt: string;
    highlightPrompts: string[];
    featurePrompts: string[];
    styleGuide: StyleGuide;
  };
  error?: string;
}

/**
 * Image Prompt Agent
 * Generates optimized prompts for image generation
 */
export class ImagePromptAgent {
  /**
   * Execute prompt generation
   */
  async execute(
    destination: string,
    destinationCity: string,
    highlights: any[],
    keyFeatures: any[]
  ): Promise<ImagePromptResult> {
    console.log("[ImagePromptAgent] Starting prompt generation...");
    console.log("[ImagePromptAgent] Destination:", destination, destinationCity);
    
    try {
      // Get style guide for destination
      const styleGuide = getStyleGuideForDestination(destination, destinationCity);
      
      // Generate hero image prompt
      const heroPrompt = await this.generateHeroPrompt(
        destination,
        destinationCity,
        styleGuide
      );
      
      // Generate highlight image prompts
      const highlightPrompts = await this.generateHighlightPrompts(
        highlights,
        destination,
        styleGuide
      );
      
      // Generate feature image prompts
      const featurePrompts = await this.generateFeaturePrompts(
        keyFeatures,
        destination,
        styleGuide
      );
      
      console.log("[ImagePromptAgent] Prompt generation completed");
      
      return {
        success: true,
        data: {
          heroPrompt,
          highlightPrompts,
          featurePrompts,
          styleGuide,
        },
      };
    } catch (error) {
      console.error("[ImagePromptAgent] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
  /**
   * Generate hero image prompt with LLM optimization
   */
  private async generateHeroPrompt(
    destination: string,
    destinationCity: string,
    styleGuide: StyleGuide
  ): Promise<string> {
    const basePrompt = `${destinationCity || destination} landscape`;
    
    const optimizationPrompt = `你是一位專業的旅遊攝影師和 AI 圖片生成專家。請根據以下資訊，生成一個詳細且高品質的圖片生成提示詞（prompt）：

目的地：${destinationCity || destination}
圖片類型：Hero 全屏背景圖片
攝影風格：${styleGuide.photographyStyle}
氛圍：${styleGuide.mood}
光線：${styleGuide.lighting}
構圖：${styleGuide.composition}

要求：
1. 提示詞必須是英文
2. 包含具體的場景描述（地標、自然景觀、建築等）
3. 包含攝影技術細節（光線、構圖、視角等）
4. 包含品質關鍵詞（${styleGuide.keywords.join(", ")}）
5. 不要包含文字、浮水印、人物特寫
6. 長度控制在 100-150 個單詞
7. 只回傳提示詞本身，不要其他說明

範例格式：
"Breathtaking wide-angle view of Hokkaido winter landscape at golden hour, snow-covered mountains in the background, frozen lake reflecting the warm sunset light, traditional Japanese ryokan in the foreground, cinematic travel photography, professional 8k resolution, serene and peaceful atmosphere, rule of thirds composition, soft natural lighting, travel magazine style, no text, no watermark"`;

    const response = await invokeLLM({
      messages: [{ role: "user", content: optimizationPrompt }],
    });
    
    const content = response.choices[0]?.message?.content;
    const optimizedPrompt = typeof content === "string" ? content.trim() : basePrompt;
    
    console.log("[ImagePromptAgent] Hero prompt generated:", optimizedPrompt.substring(0, 100) + "...");
    
    return optimizedPrompt;
  }
  
  /**
   * Generate highlight image prompts
   */
  private async generateHighlightPrompts(
    highlights: any[],
    destination: string,
    styleGuide: StyleGuide
  ): Promise<string[]> {
    const prompts: string[] = [];
    
    for (const highlight of highlights) {
      const basePrompt = `${destination} ${highlight.title} ${highlight.subtitle}`;
      
      const optimizationPrompt = `你是一位專業的旅遊攝影師和 AI 圖片生成專家。請根據以下資訊，生成一個詳細且高品質的圖片生成提示詞（prompt）：

目的地：${destination}
主題：${highlight.title}
類型：${highlight.subtitle}
描述：${highlight.description}
攝影風格：${styleGuide.photographyStyle}
氛圍：${styleGuide.mood}

要求：
1. 提示詞必須是英文
2. 包含具體的場景描述
3. 包含品質關鍵詞（${styleGuide.keywords.join(", ")}）
4. 不要包含文字、浮水印
5. 長度控制在 80-100 個單詞
6. 只回傳提示詞本身，不要其他說明`;

      const response = await invokeLLM({
        messages: [{ role: "user", content: optimizationPrompt }],
      });
      
      const content = response.choices[0]?.message?.content;
      const optimizedPrompt = typeof content === "string" ? content.trim() : basePrompt;
      
      prompts.push(optimizedPrompt);
    }
    
    console.log("[ImagePromptAgent] Generated", prompts.length, "highlight prompts");
    
    return prompts;
  }
  
  /**
   * Generate feature image prompts
   */
  private async generateFeaturePrompts(
    keyFeatures: any[],
    destination: string,
    styleGuide: StyleGuide
  ): Promise<string[]> {
    const prompts: string[] = [];
    
    for (const feature of keyFeatures) {
      // Skip features without images
      if (!feature.image && feature.image !== "") {
        prompts.push("");
        continue;
      }
      
      const basePrompt = `${destination} ${feature.keyword}`;
      
      const optimizationPrompt = `你是一位專業的旅遊攝影師和 AI 圖片生成專家。請根據以下資訊，生成一個詳細且高品質的圖片生成提示詞（prompt）：

目的地：${destination}
關鍵詞：${feature.keyword}
描述：${feature.description}
攝影風格：${styleGuide.photographyStyle}
氛圍：${styleGuide.mood}

要求：
1. 提示詞必須是英文
2. 包含具體的場景描述
3. 包含品質關鍵詞（${styleGuide.keywords.join(", ")}）
4. 適合作為寬幅橫向圖片
5. 長度控制在 80-100 個單詞
6. 只回傳提示詞本身，不要其他說明`;

      const response = await invokeLLM({
        messages: [{ role: "user", content: optimizationPrompt }],
      });
      
      const content = response.choices[0]?.message?.content;
      const optimizedPrompt = typeof content === "string" ? content.trim() : basePrompt;
      
      prompts.push(optimizedPrompt);
    }
    
    console.log("[ImagePromptAgent] Generated", prompts.filter(p => p).length, "feature prompts");
    
    return prompts;
  }
}
