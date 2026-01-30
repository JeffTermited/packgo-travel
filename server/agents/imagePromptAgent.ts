/**
 * Image Prompt Agent
 * Responsible for generating optimized image prompts using Claude
 * 
 * Claude Hybrid Architecture: Uses Claude 3 Haiku for simple prompt generation
 */

import { getHaikuAgent, STRICT_DATA_FIDELITY_RULES } from "./claudeAgent";
import { StyleGuide, ImageGenerationRequest } from "../../shared/tourTypes";
import { getStyleGuideForDestination } from "../styleGuide";
import { PHOTOGRAPHER_SKILL } from "./skillLibrary";
import { getKeyInstructions } from "./skillLoader";

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
  private skillInstructions: string;

  constructor() {
    this.skillInstructions = getKeyInstructions('ImagePromptAgent');
    console.log('[ImagePromptAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
    console.log('[ImagePromptAgent] Using Claude 3 Haiku');
  }
  
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
   * Generate hero image prompt with Claude optimization and validation
   */
  private async generateHeroPrompt(
    destination: string,
    destinationCity: string,
    styleGuide: StyleGuide
  ): Promise<string> {
    const basePrompt = `${destinationCity || destination} landscape`;
    
    // Data validation
    if (!destination && !destinationCity) {
      console.warn("[ImagePromptAgent] Insufficient data for hero prompt generation");
      return "Travel destination landscape, cinematic photography, 8k resolution";
    }
    
    const userPrompt = `Please generate a detailed image generation prompt for:

Destination: ${destinationCity || destination}
Image Type: Hero full-screen background image
Photography Style: ${styleGuide.photographyStyle}
Mood: ${styleGuide.mood}
Lighting: ${styleGuide.lighting}
Composition: ${styleGuide.composition}

Requirements:
1. Include specific scene descriptions (landmarks, natural landscapes, architecture)
2. Include quality keywords: ${styleGuide.keywords.join(", ")}
3. No text, no watermark, no close-up portraits
4. Length: 100-150 words
5. Return only the prompt itself, no other explanation

Example format:
"Breathtaking wide-angle view of Hokkaido winter landscape at golden hour, snow-covered mountains in the background, frozen lake reflecting the warm sunset light, traditional Japanese ryokan in the foreground, cinematic travel photography, professional 8k resolution, serene and peaceful atmosphere, rule of thirds composition, soft natural lighting, travel magazine style, no text, no watermark"`;
    
    // Retry up to 2 times
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const claudeAgent = getHaikuAgent();
        const response = await claudeAgent.sendMessage(userPrompt, {
          systemPrompt: PHOTOGRAPHER_SKILL,
          maxTokens: 512,
          temperature: 0.7,
        });
        
        const prompt = response.content?.trim() || null;
        
        // Validate prompt (should not be too short or contain generic phrases)
        if (prompt && prompt.length >= 50 && !prompt.includes("beautiful") && !prompt.includes("amazing")) {
          console.log("[ImagePromptAgent] Hero prompt generated:", prompt.substring(0, 100) + "...");
          return prompt;
        }
        
        console.warn(`[ImagePromptAgent] Hero prompt invalid or too generic, attempt ${attempt}/2`);
      } catch (error) {
        console.error(`[ImagePromptAgent] Hero prompt generation failed, attempt ${attempt}/2:`, error);
      }
    }
    
    // Fallback: use base prompt
    console.warn("[ImagePromptAgent] Using fallback hero prompt");
    return basePrompt;
  }
  
  /**
   * Generate highlight image prompts with validation
   */
  private async generateHighlightPrompts(
    highlights: any[],
    destination: string,
    styleGuide: StyleGuide
  ): Promise<string[]> {
    const prompts: string[] = [];
    
    for (const highlight of highlights) {
      const basePrompt = `${destination} ${highlight.title} ${highlight.subtitle}`;
      
      // Data validation
      if (!highlight.title && !highlight.description) {
        console.warn("[ImagePromptAgent] Insufficient data for highlight prompt, using fallback");
        prompts.push(basePrompt);
        continue;
      }
      
      const userPrompt = `Please generate a detailed image generation prompt for:

Destination: ${destination}
Theme: ${highlight.title}
Type: ${highlight.subtitle}
Description: ${highlight.description}
Photography Style: ${styleGuide.photographyStyle}
Mood: ${styleGuide.mood}

Requirements:
1. Include specific scene descriptions
2. Include quality keywords: ${styleGuide.keywords.join(", ")}
3. No text, no watermark
4. Length: 80-100 words
5. Return only the prompt itself, no other explanation`;
      
      // Single attempt (no retry for highlights to save time)
      try {
        const claudeAgent = getHaikuAgent();
        const response = await claudeAgent.sendMessage(userPrompt, {
          systemPrompt: PHOTOGRAPHER_SKILL,
          maxTokens: 512,
          temperature: 0.7,
        });
        
        const prompt = response.content?.trim() || basePrompt;
        prompts.push(prompt);
      } catch (error) {
        console.error("[ImagePromptAgent] Highlight prompt generation failed, using fallback:", error);
        prompts.push(basePrompt);
      }
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

      try {
        const claudeAgent = getHaikuAgent();
        const response = await claudeAgent.sendMessage(optimizationPrompt, {
          maxTokens: 512,
          temperature: 0.7,
        });
        
        const optimizedPrompt = response.content?.trim() || basePrompt;
        prompts.push(optimizedPrompt);
      } catch (error) {
        console.error("[ImagePromptAgent] Feature prompt generation failed, using fallback:", error);
        prompts.push(basePrompt);
      }
    }
    
    console.log("[ImagePromptAgent] Generated", prompts.filter(p => p).length, "feature prompts");
    
    return prompts;
  }
}
