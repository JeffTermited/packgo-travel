/**
 * Master Agent
 * Coordinates all agents to generate a complete tour
 * 
 * Optimizations:
 * - Retry mechanism with exponential backoff
 * - Parallel execution for independent agents
 * - Agent status monitoring
 * - Fallback handling for non-critical agents
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
import { getKeyInstructions } from "./skillLoader";
import {
  RetryManager,
  AgentMonitor,
  FallbackManager,
  DEFAULT_RETRY_CONFIG,
  DEFAULT_FALLBACK_CONFIGS,
  type RetryConfig
} from "./agentOrchestration";

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
  executionReport?: string; // Agent execution report
}

/**
 * Master Agent
 * Orchestrates all agents to generate a complete tour
 */
export class MasterAgent {
  private skillInstructions: string;
  private retryManager: RetryManager;
  private monitor: AgentMonitor;
  private fallbackManager: FallbackManager;
  private retryConfig: RetryConfig;

  // Agent instances
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
    // Load SKILL.md instructions
    this.skillInstructions = getKeyInstructions('MasterAgent');
    console.log('[MasterAgent] SKILL loaded:', this.skillInstructions.length, 'chars');
    
    // Initialize orchestration utilities
    this.retryManager = new RetryManager();
    this.monitor = new AgentMonitor();
    this.fallbackManager = new FallbackManager();
    this.retryConfig = DEFAULT_RETRY_CONFIG;
    
    // Register fallback configurations
    for (const config of DEFAULT_FALLBACK_CONFIGS) {
      this.fallbackManager.registerFallback(config);
    }
    
    // Initialize all agents
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
    
    console.log('[MasterAgent] Initialized with retry and fallback mechanisms');
  }
  
  /**
   * Execute complete tour generation with optimizations
   */
  async execute(
    url: string,
    userId: number,
    onProgress?: (step: string, percentage: number) => void
  ): Promise<MasterAgentResult> {
    const startTime = Date.now();
    console.log("[MasterAgent] Starting optimized tour generation...");
    console.log("[MasterAgent] URL:", url);
    console.log("[MasterAgent] User ID:", userId);
    
    // Reset monitor for new execution
    this.monitor.reset();
    
    try {
      // ========================================================================
      // Phase 1: Web Scraping (Critical)
      // ========================================================================
      onProgress?.("scraping", 10);
      this.monitor.startAgent('WebScraperAgent');
      
      const scrapingResult = await this.retryManager.executeWithRetry(
        () => this.webScraperAgent.execute(url),
        this.retryConfig,
        'WebScraperAgent'
      );
      
      if (!scrapingResult.success || !scrapingResult.data) {
        this.monitor.failAgent('WebScraperAgent', new Error(scrapingResult.error || "Web scraping failed"));
        throw new Error(scrapingResult.error || "Web scraping failed");
      }
      
      this.monitor.completeAgent('WebScraperAgent', scrapingResult);
      const rawData = scrapingResult.data;
      console.log("[MasterAgent] ✓ Web scraping completed");
      
      // ========================================================================
      // Phase 2: Content Analysis (Critical)
      // ========================================================================
      onProgress?.("analyzing", 30);
      this.monitor.startAgent('ContentAnalyzerAgent');
      
      const analysisResult = await this.retryManager.executeWithRetry(
        () => this.contentAnalyzerAgent.execute(rawData),
        this.retryConfig,
        'ContentAnalyzerAgent'
      );
      
      if (!analysisResult.success || !analysisResult.data) {
        this.monitor.failAgent('ContentAnalyzerAgent', new Error(analysisResult.error || "Content analysis failed"));
        throw new Error(analysisResult.error || "Content analysis failed");
      }
      
      this.monitor.completeAgent('ContentAnalyzerAgent', analysisResult);
      const analyzedContent = analysisResult.data;
      console.log("[MasterAgent] ✓ Content analysis completed");
      console.log("[MasterAgent] Originality score:", analyzedContent.originalityScore);
      
      // ========================================================================
      // Phase 3: Parallel Execution - Color Theme + Image Prompts
      // Optimization: Execute ColorThemeAgent and ImagePromptAgent in parallel
      // ========================================================================
      onProgress?.("generating_themes", 45);
      console.log("[MasterAgent] Starting parallel execution: ColorTheme + ImagePrompt");
      
      this.monitor.startAgent('ColorThemeAgent');
      this.monitor.startAgent('ImagePromptAgent');
      
      const [colorThemeResult, promptResult] = await Promise.all([
        this.retryManager.executeWithRetry(
          () => this.colorThemeAgent.execute(
            rawData.location?.destinationCountry || "",
            rawData.location?.destinationCity
          ),
          this.retryConfig,
          'ColorThemeAgent'
        ),
        this.retryManager.executeWithRetry(
          () => this.imagePromptAgent.execute(
            rawData.location?.destinationCountry || "",
            rawData.location?.destinationCity || "",
            analyzedContent.highlights,
            analyzedContent.keyFeatures
          ),
          this.retryConfig,
          'ImagePromptAgent'
        )
      ]);
      
      // Handle ColorThemeAgent result
      if (!colorThemeResult.success || !colorThemeResult.data) {
        this.monitor.failAgent('ColorThemeAgent', new Error(colorThemeResult.error || "Color theme generation failed"));
        throw new Error(colorThemeResult.error || "Color theme generation failed");
      }
      this.monitor.completeAgent('ColorThemeAgent', colorThemeResult);
      const colorTheme = colorThemeResult.data;
      
      // Handle ImagePromptAgent result
      if (!promptResult.success || !promptResult.data) {
        this.monitor.failAgent('ImagePromptAgent', new Error(promptResult.error || "Image prompt generation failed"));
        throw new Error(promptResult.error || "Image prompt generation failed");
      }
      this.monitor.completeAgent('ImagePromptAgent', promptResult);
      const { heroPrompt, highlightPrompts, featurePrompts, styleGuide } = promptResult.data;
      
      console.log("[MasterAgent] ✓ Parallel execution completed (ColorTheme + ImagePrompt)");
      
      // ========================================================================
      // Phase 4: Image Generation (Critical, but with fallback)
      // ========================================================================
      onProgress?.("generating_images", 60);
      this.monitor.startAgent('ImageGenerationAgent');
      
      let heroImage = { url: "", alt: "Hero image" };
      let highlightImages: any[] = [];
      let featureImages: any[] = [];
      
      try {
        const imageResult = await this.retryManager.executeWithRetry(
          () => this.imageGenerationAgent.execute(
            heroPrompt,
            highlightPrompts,
            featurePrompts,
            styleGuide,
            userId
          ),
          this.retryConfig,
          'ImageGenerationAgent'
        );
        
        if (imageResult.success && imageResult.data) {
          heroImage = imageResult.data.heroImage;
          highlightImages = imageResult.data.highlightImages;
          featureImages = imageResult.data.featureImages;
          this.monitor.completeAgent('ImageGenerationAgent', imageResult);
          console.log("[MasterAgent] ✓ Images generated successfully");
        } else {
          throw new Error(imageResult.error || "Image generation failed");
        }
      } catch (imageError) {
        this.monitor.failAgent('ImageGenerationAgent', imageError as Error);
        console.warn("[MasterAgent] ⚠ Image generation failed, using placeholder images");
        
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
      
      // Extract feature image URLs
      const featureImageUrls = featureImages.map(img => img.url).filter(url => url !== "");
      
      // ========================================================================
      // Phase 5: Itinerary Generation (Required before detail agents)
      // ========================================================================
      onProgress?.("generating_itinerary", 75);
      this.monitor.startAgent('ItineraryAgent');
      
      let itineraryData = "";
      try {
        const itineraryResult = await this.retryManager.executeWithRetry(
          () => this.itineraryAgent.execute(rawData),
          this.retryConfig,
          'ItineraryAgent'
        );
        
        if (itineraryResult.success && itineraryResult.data) {
          itineraryData = JSON.stringify(itineraryResult.data.dailyItineraries);
          this.monitor.completeAgent('ItineraryAgent', itineraryResult);
          console.log("[MasterAgent] ✓ Itinerary generated successfully");
        } else {
          throw new Error(itineraryResult.error || "Itinerary generation failed");
        }
      } catch (itineraryError) {
        this.monitor.failAgent('ItineraryAgent', itineraryError as Error);
        console.warn("[MasterAgent] ⚠ Itinerary generation failed, using empty data");
        itineraryData = JSON.stringify([]);
      }
      
      // ========================================================================
      // Phase 6: Parallel Execution - Detail Agents (Non-critical)
      // Optimization: Execute 5 detail agents in parallel
      // ========================================================================
      onProgress?.("generating_details", 85);
      console.log("[MasterAgent] Starting parallel execution: 5 detail agents");
      
      this.monitor.startAgent('CostAgent');
      this.monitor.startAgent('NoticeAgent');
      this.monitor.startAgent('HotelAgent');
      this.monitor.startAgent('MealAgent');
      this.monitor.startAgent('FlightAgent');
      
      const detailResults = await Promise.allSettled([
        this.retryManager.executeWithRetry(
          () => this.costAgent.execute(rawData),
          this.retryConfig,
          'CostAgent'
        ),
        this.retryManager.executeWithRetry(
          () => this.noticeAgent.execute(rawData),
          this.retryConfig,
          'NoticeAgent'
        ),
        this.retryManager.executeWithRetry(
          () => this.hotelAgent.execute(rawData),
          this.retryConfig,
          'HotelAgent'
        ),
        this.retryManager.executeWithRetry(
          () => this.mealAgent.execute(rawData),
          this.retryConfig,
          'MealAgent'
        ),
        this.retryManager.executeWithRetry(
          () => this.flightAgent.execute(rawData),
          this.retryConfig,
          'FlightAgent'
        )
      ]);
      
      // Process results with fallback handling
      const agentNames = ['CostAgent', 'NoticeAgent', 'HotelAgent', 'MealAgent', 'FlightAgent'];
      const processedResults = detailResults.map((result, index) => {
        const agentName = agentNames[index];
        
        if (result.status === 'fulfilled' && result.value.success && result.value.data) {
          this.monitor.completeAgent(agentName, result.value);
          console.log(`[MasterAgent] ✓ ${agentName} completed`);
          return result.value.data;
        } else {
          const error = result.status === 'rejected' 
            ? result.reason 
            : new Error(result.value.error || `${agentName} failed`);
          
          this.monitor.failAgent(agentName, error);
          console.warn(`[MasterAgent] ⚠ ${agentName} failed, using fallback`);
          
          return this.fallbackManager.handleFailure(agentName, error);
        }
      });
      
      const [costData, noticeData, hotelData, mealData, flightData] = processedResults;
      
      console.log("[MasterAgent] ✓ Parallel execution completed (5 detail agents)");
      
      // ========================================================================
      // Phase 7: Assemble Final Data
      // ========================================================================
      onProgress?.("saving", 95);
      
      const finalData = {
        // Basic info
        poeticTitle: analyzedContent.poeticTitle,
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
        highlights: JSON.stringify(analyzedContent.highlights),
        
        // Feature Images
        featureImages: JSON.stringify(featureImageUrls),
        
        // Poetic content
        poeticContent: JSON.stringify(analyzedContent.poeticContent),
        
        // Detailed Itinerary
        itineraryDetailed: itineraryData,
        
        // Cost Explanation
        costExplanation: JSON.stringify(costData),
        
        // Detailed Notice
        noticeDetailed: JSON.stringify(noticeData),
        
        // Hotels
        hotels: JSON.stringify(hotelData.hotels || []),
        
        // Meals
        meals: JSON.stringify(mealData.meals || []),
        
        // Flights
        flights: JSON.stringify(flightData),
        
        // Metadata
        originalityScore: analyzedContent.originalityScore,
        sourceUrl: url,
      };
      
      // ========================================================================
      // Generate Execution Report
      // ========================================================================
      const executionReport = this.monitor.generateReport();
      const totalDuration = Date.now() - startTime;
      
      console.log("[MasterAgent] ✓ Tour generation completed successfully");
      console.log("[MasterAgent] Total execution time:", totalDuration, "ms");
      console.log(executionReport);
      
      return {
        success: true,
        data: finalData,
        executionReport
      };
      
    } catch (error) {
      console.error("[MasterAgent] ✗ Critical error:", error);
      
      const executionReport = this.monitor.generateReport();
      console.log(executionReport);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        executionReport
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
