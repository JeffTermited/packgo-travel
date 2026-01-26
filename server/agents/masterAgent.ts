/**
 * Master Agent
 * Coordinates all agents to generate a complete tour
 */

import { WebScraperAgent } from "./webScraperAgent";
import { ContentAnalyzerAgent } from "./contentAnalyzerAgent";
import { ImagePromptAgent } from "./imagePromptAgent";
import { ImageGenerationAgent } from "./imageGenerationAgent";
import { ColorThemeAgent } from "./colorThemeAgent";
import { ItineraryAgent } from "./itineraryAgent";
import { CostAgent } from "./costAgent";
import { NoticeAgent } from "./noticeAgent";
import { HotelAgent } from "./hotelAgent";
import { MealAgent } from "./mealAgent";
import { FlightAgent } from "./flightAgent";

export interface MasterAgentResult {
  success: boolean;
  data?: {
    // Basic info
    poeticTitle: string; // 詩意化標題 (Sipincollection 風格)
    title: string;
    description: string;
    productCode: string;
    tags: string[];
    
    // Location
    destinationCountry: string;
    destinationCity: string;
    departureCity: string;
    
    // Duration
    days: number;
    nights: number;
    
    // Pricing
    price: number;
    
    // Hero section
    heroImage: string;
    heroImageAlt: string;
    heroSubtitle: string;
    
    // Color theme
    colorTheme: any;
    
    // Highlights
    highlights: string; // JSON string
    
    // Key features
    keyFeatures: string; // JSON string
    
    // Poetic content
    poeticContent: string; // JSON string
    
    // Detailed Itinerary (詳細每日行程)
    itineraryDetailed: string; // JSON string
    
    // Cost Explanation (費用說明)
    costExplanation: string; // JSON string
    
    // Detailed Notice (詳細注意事項)
    noticeDetailed: string; // JSON string
    
    // Hotels (飯店介紹)
    hotels: string; // JSON string
    
    // Meals (餐飲介紹)
    meals: string; // JSON string
    
    // Flights (航班資訊)
    flights: string; // JSON string
    
    // Metadata
    originalityScore: number;
    sourceUrl: string;
  };
  error?: string;
  progress?: {
    currentStep: string;
    percentage: number;
  };
}

/**
 * Master Agent
 * Orchestrates all agents to generate a complete tour
 */
export class MasterAgent {
  private webScraperAgent: WebScraperAgent;
  private contentAnalyzerAgent: ContentAnalyzerAgent;
  private imagePromptAgent: ImagePromptAgent;
  private imageGenerationAgent: ImageGenerationAgent;
  private colorThemeAgent: ColorThemeAgent;
  private itineraryAgent: ItineraryAgent;
  private costAgent: CostAgent;
  private noticeAgent: NoticeAgent;
  private hotelAgent: HotelAgent;
  private mealAgent: MealAgent;
  private flightAgent: FlightAgent;
  
  constructor() {
    this.webScraperAgent = new WebScraperAgent();
    this.contentAnalyzerAgent = new ContentAnalyzerAgent();
    this.imagePromptAgent = new ImagePromptAgent();
    this.imageGenerationAgent = new ImageGenerationAgent();
    this.colorThemeAgent = new ColorThemeAgent();
    this.itineraryAgent = new ItineraryAgent();
    this.costAgent = new CostAgent();
    this.noticeAgent = new NoticeAgent();
    this.hotelAgent = new HotelAgent();
    this.mealAgent = new MealAgent();
    this.flightAgent = new FlightAgent();
  }
  
  /**
   * Execute complete tour generation
   */
  async execute(
    url: string,
    userId: number,
    onProgress?: (step: string, percentage: number) => void
  ): Promise<MasterAgentResult> {
    console.log("[MasterAgent] Starting tour generation...");
    console.log("[MasterAgent] URL:", url);
    console.log("[MasterAgent] User ID:", userId);
    
    try {
      // Step 1: Web scraping (10%)
      onProgress?.("scraping", 10);
      const scrapingResult = await this.webScraperAgent.execute(url);
      
      if (!scrapingResult.success || !scrapingResult.data) {
        throw new Error(scrapingResult.error || "Web scraping failed");
      }
      
      const rawData = scrapingResult.data;
      console.log("[MasterAgent] Web scraping completed");
      
      // Step 2: Content analysis (30%)
      onProgress?.("analyzing", 30);
      const analysisResult = await this.contentAnalyzerAgent.execute(rawData);
      
      if (!analysisResult.success || !analysisResult.data) {
        throw new Error(analysisResult.error || "Content analysis failed");
      }
      
      const analyzedContent = analysisResult.data;
      console.log("[MasterAgent] Content analysis completed");
      console.log("[MasterAgent] Originality score:", analyzedContent.originalityScore);
      
      // Step 3: Color theme generation (40%)
      onProgress?.("generating_color_theme", 40);
      const colorThemeResult = await this.colorThemeAgent.execute(
        rawData.location?.destinationCountry || "",
        rawData.location?.destinationCity
      );
      
      if (!colorThemeResult.success || !colorThemeResult.data) {
        throw new Error(colorThemeResult.error || "Color theme generation failed");
      }
      
      const colorTheme = colorThemeResult.data;
      console.log("[MasterAgent] Color theme generated");
      
      // Step 4: Image prompt generation (50%)
      onProgress?.("generating_image_prompts", 50);
      const promptResult = await this.imagePromptAgent.execute(
        rawData.location?.destinationCountry || "",
        rawData.location?.destinationCity || "",
        analyzedContent.highlights,
        analyzedContent.keyFeatures
      );
      
      if (!promptResult.success || !promptResult.data) {
        throw new Error(promptResult.error || "Image prompt generation failed");
      }
      
      const { heroPrompt, highlightPrompts, featurePrompts, styleGuide } = promptResult.data;
      console.log("[MasterAgent] Image prompts generated");
      
      // Step 5: Image generation (60% - 90%)
      // Implement Partial Success: image generation failure should not block tour creation
      onProgress?.("generating_images", 60);
      let heroImage = { url: "", alt: "Hero image" };
      let highlightImages: any[] = [];
      let featureImages: any[] = [];
      
      try {
        const imageResult = await this.imageGenerationAgent.execute(
          heroPrompt,
          highlightPrompts,
          featurePrompts,
          styleGuide,
          userId
        );
        
        if (imageResult.success && imageResult.data) {
          heroImage = imageResult.data.heroImage;
          highlightImages = imageResult.data.highlightImages;
          featureImages = imageResult.data.featureImages;
          console.log("[MasterAgent] Images generated successfully");
        } else {
          console.warn("[MasterAgent] Image generation failed, using placeholder images:", imageResult.error);
          // Use placeholder images
          heroImage = { url: "/placeholder-hero.jpg", alt: "Placeholder hero image" };
          highlightImages = analyzedContent.highlights.map((_: any, index: number) => ({
            url: `/placeholder-highlight-${index + 1}.jpg`,
            alt: `Placeholder highlight image ${index + 1}`
          }));
          featureImages = analyzedContent.keyFeatures.map((_: any, index: number) => ({
            url: `/placeholder-feature-${index + 1}.jpg`,
            alt: `Placeholder feature image ${index + 1}`
          }));
        }
      } catch (imageError) {
        console.error("[MasterAgent] Image generation error (non-blocking):", imageError);
        // Use placeholder images on error
        heroImage = { url: "/placeholder-hero.jpg", alt: "Placeholder hero image" };
        highlightImages = analyzedContent.highlights.map((_: any, index: number) => ({
          url: `/placeholder-highlight-${index + 1}.jpg`,
          alt: `Placeholder highlight image ${index + 1}`
        }));
        featureImages = analyzedContent.keyFeatures.map((_: any, index: number) => ({
          url: `/placeholder-feature-${index + 1}.jpg`,
          alt: `Placeholder feature image ${index + 1}`
        }));
      }
      
      // Step 6: Assemble final tour data (95%)
      onProgress?.("saving", 95);
      
      // Update highlights with generated images
      const finalHighlights = analyzedContent.highlights.map((highlight: any, index: number) => ({
        ...highlight,
        image: highlightImages[index]?.url || "",
        imageAlt: highlightImages[index]?.alt || highlight.imageAlt,
      }));
      
      // Update key features with generated images
      const finalKeyFeatures = analyzedContent.keyFeatures.map((feature: any, index: number) => ({
        ...feature,
        image: featureImages[index]?.url || null,
        imageAlt: featureImages[index]?.alt || feature.imageAlt,
      }));
      
      // Step 6: Generate itinerary, cost, and notice (90% - 95%      // Step 6: Generate itinerary, cost, and notice
      let itineraryData = "";
      let costData = "";
      let noticeData = "";
      
      try {
        // Generate detailed itinerary
        const itineraryResult = await this.itineraryAgent.execute(rawData);
        if (itineraryResult.success && itineraryResult.data) {
          itineraryData = JSON.stringify(itineraryResult.data.dailyItineraries);
          console.log("[MasterAgent] Itinerary generated successfully");
        } else {
          console.warn("[MasterAgent] Itinerary generation failed:", itineraryResult.error);
        }
        
        // Generate cost explanation
        const costResult = await this.costAgent.execute(rawData);
        if (costResult.success && costResult.data) {
          costData = JSON.stringify(costResult.data);
          console.log("[MasterAgent] Cost explanation generated successfully");
        } else {
          console.warn("[MasterAgent] Cost generation failed:", costResult.error);
        }
        
        // Generate notice
        const noticeResult = await this.noticeAgent.execute(rawData);
        if (noticeResult.success && noticeResult.data) {
          noticeData = JSON.stringify(noticeResult.data);
          console.log("[MasterAgent] Notice generated successfully");
        } else {
          console.warn("[MasterAgent] Notice generation failed:", noticeResult.error);
        }
      } catch (detailsError) {
        console.error("[MasterAgent] Details generation error (non-blocking):", detailsError);
      }
      
      // Step 7: Generate hotels, meals, and flights
      let hotelsData = "";
      let mealsData = "";
      let flightsData = "";
      
      try {
        // Generate hotel information
        const hotelResult = await this.hotelAgent.execute(rawData);
        if (hotelResult.success && hotelResult.data) {
          hotelsData = JSON.stringify(hotelResult.data.hotels);
          console.log("[MasterAgent] Hotel information generated successfully");
        } else {
          console.warn("[MasterAgent] Hotel generation failed:", hotelResult.error);
        }
        
        // Generate meal information
        const mealResult = await this.mealAgent.execute(rawData);
        if (mealResult.success && mealResult.data) {
          mealsData = JSON.stringify(mealResult.data.meals);
          console.log("[MasterAgent] Meal information generated successfully");
        } else {
          console.warn("[MasterAgent] Meal generation failed:", mealResult.error);
        }
        
        // Generate flight information
        const flightResult = await this.flightAgent.execute(rawData);
        if (flightResult.success && flightResult.data) {
          flightsData = JSON.stringify(flightResult.data);
          console.log("[MasterAgent] Flight information generated successfully");
        } else {
          console.warn("[MasterAgent] Flight generation failed:", flightResult.error);
        }
      } catch (additionalError) {
        console.error("[MasterAgent] Additional details generation error (non-blocking):", additionalError);
      }     
      const finalData = {
        // Basic info
        poeticTitle: analyzedContent.poeticTitle, // 詩意化標題
        title: analyzedContent.title,
        description: analyzedContent.description,
        productCode: rawData.basicInfo?.productCode || "",
        tags: rawData.basicInfo?.tags || [],
        
        // Location
        destinationCountry: rawData.location?.destinationCountry || "",
        destinationCity: rawData.location?.destinationCity || "",
        departureCity: rawData.location?.departureCity || "",
        
        // Duration
        days: rawData.duration?.days || 0,
        nights: rawData.duration?.nights || 0,
        
        // Pricing
        price: rawData.pricing?.price || 0,
        
        // Hero section
        heroImage: heroImage.url,
        heroImageAlt: heroImage.alt,
        heroSubtitle: analyzedContent.heroSubtitle,
        
        // Color theme
        colorTheme: JSON.stringify(colorTheme),
        
        // Highlights
        highlights: JSON.stringify(finalHighlights),
        
        // Key features
        keyFeatures: JSON.stringify(finalKeyFeatures),
        
        // Poetic content
        poeticContent: JSON.stringify(analyzedContent.poeticContent),
        
        // Detailed Itinerary (詳細每日行程)
        itineraryDetailed: itineraryData,
        
        // Cost Explanation (費用說明)
        costExplanation: costData,
        
        // Detailed Notice (詳細注意事項)
        noticeDetailed: noticeData,
        
        // Hotels (飯店介紹)
        hotels: hotelsData,
        
        // Meals (餐飲介紹)
        meals: mealsData,
        
        // Flights (航班資訊)
        flights: flightsData,
        
        // Metadata
        originalityScore: analyzedContent.originalityScore,
        sourceUrl: url, // Store the original source URL
      };
      
      console.log("[MasterAgent] Tour generation completed successfully");;
      
      return {
        success: true,
        data: finalData,
      };
    } catch (error) {
      console.error("[MasterAgent] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
  /**
   * Rollback on error (cleanup resources)
   */
  async rollback(partialData: any): Promise<void> {
    console.log("[MasterAgent] Rolling back...");
    
    // TODO: Implement cleanup logic
    // - Delete uploaded images from S3
    // - Clean up database entries
    // - Log error details
    
    console.log("[MasterAgent] Rollback completed");
  }
}
