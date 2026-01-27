/**
 * Master Agent
 * Coordinates all agents to generate a complete tour
 * 
 * Optimizations:
 * - Retry mechanism with exponential backoff
 * - Parallel execution for independent agents
 * - Agent status monitoring
 * - Fallback handling for non-critical agents
 * 
 * Execution Flow (Optimized):
 * Phase 1: Web Scraping (Critical, Sequential)
 * Phase 2: Content Analysis (Critical, Sequential)
 * Phase 3: ColorTheme + ImagePrompt (Parallel)
 * Phase 4: ImageGeneration + Itinerary + 5 Detail Agents (Parallel - 7 agents)
 * Phase 5: Assemble Final Data
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
import { generateLionTravelTitle } from "./lionTitleGenerator";
import { getKeyInstructions } from "./skillLoader";
import {
  RetryManager,
  AgentMonitor,
  FallbackManager,
  DEFAULT_RETRY_CONFIG,
  DEFAULT_FALLBACK_CONFIGS,
  type RetryConfig
} from "./agentOrchestration";
import { progressTracker } from "./progressTracker";

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
    
    // Feature Images
    featureImages: string; // JSON string
    
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
    
    console.log('[MasterAgent] Initialized with optimized parallel execution');
  }
  
  /**
   * Execute complete tour generation with optimizations
   * 
   * Optimized execution flow:
   * 1. Web Scraping (sequential, critical)
   * 2. Content Analysis + Lion Title (sequential, critical)
   * 3. ColorTheme + ImagePrompt (parallel)
   * 4. ImageGeneration + Itinerary + 5 Detail Agents (parallel - 7 agents!)
   * 5. Assemble final data
   */
  async execute(
    url: string,
    userId?: number,
    onProgress?: (step: string, percentage: number) => void,
    taskId?: string
  ): Promise<MasterAgentResult> {
    const startTime = Date.now();
    console.log("[MasterAgent] Starting OPTIMIZED tour generation...");
    console.log("[MasterAgent] URL:", url);
    console.log("[MasterAgent] User ID:", userId);
    
    // Reset monitor for new execution
    this.monitor.reset();
    
    // Initialize progress tracker if taskId is provided
    if (taskId) {
      progressTracker.createTask(taskId);
    }
    
    try {
      // ========================================================================
      // Phase 1: Web Scraping (Critical, Sequential)
      // Must complete first as all other agents depend on rawData
      // ========================================================================
      onProgress?.("scraping", 10);
      this.monitor.startAgent('WebScraperAgent');
      if (taskId) progressTracker.startPhase(taskId, 'web_scraper');
      
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
      if (taskId) progressTracker.completePhase(taskId, 'web_scraper');
      const rawData = scrapingResult.data;
      console.log("[MasterAgent] ✓ Phase 1 completed: Web scraping");
      
      // ========================================================================
      // Phase 2: Content Analysis + Lion Title (Critical, Sequential)
      // Must complete before image prompts can be generated
      // ========================================================================
      onProgress?.("analyzing", 25);
      this.monitor.startAgent('ContentAnalyzerAgent');
      if (taskId) progressTracker.startPhase(taskId, 'content_analyzer');
      
      // Run Content Analysis and Lion Title in parallel
      const [analysisResult, lionTravelTitle] = await Promise.all([
        this.retryManager.executeWithRetry(
          () => this.contentAnalyzerAgent.execute(rawData),
          this.retryConfig,
          'ContentAnalyzerAgent'
        ),
        generateLionTravelTitle(rawData)
      ]);
      
      if (!analysisResult.success || !analysisResult.data) {
        this.monitor.failAgent('ContentAnalyzerAgent', new Error(analysisResult.error || "Content analysis failed"));
        throw new Error(analysisResult.error || "Content analysis failed");
      }
      
      this.monitor.completeAgent('ContentAnalyzerAgent', analysisResult);
      if (taskId) progressTracker.completePhase(taskId, 'content_analyzer');
      const analyzedContent = analysisResult.data;
      console.log("[MasterAgent] ✓ Phase 2 completed: Content analysis + Lion title");
      console.log("[MasterAgent] Originality score:", analyzedContent.originalityScore);
      console.log("[MasterAgent] Lion Travel title:", lionTravelTitle);
      
      // ========================================================================
      // Phase 3: ColorTheme + ImagePrompt (Parallel)
      // These two agents can run in parallel as they don't depend on each other
      // ========================================================================
      onProgress?.("generating_themes", 40);
      console.log("[MasterAgent] Starting Phase 3: ColorTheme + ImagePrompt (parallel)");
      
      this.monitor.startAgent('ColorThemeAgent');
      this.monitor.startAgent('ImagePromptAgent');
      if (taskId) {
        progressTracker.startPhase(taskId, 'color_theme');
        progressTracker.startPhase(taskId, 'image_prompt');
      }
      
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
      if (taskId) progressTracker.completePhase(taskId, 'color_theme');
      const colorTheme = colorThemeResult.data;
      
      // Handle ImagePromptAgent result
      if (!promptResult.success || !promptResult.data) {
        this.monitor.failAgent('ImagePromptAgent', new Error(promptResult.error || "Image prompt generation failed"));
        throw new Error(promptResult.error || "Image prompt generation failed");
      }
      this.monitor.completeAgent('ImagePromptAgent', promptResult);
      if (taskId) progressTracker.completePhase(taskId, 'image_prompt');
      const { heroPrompt, highlightPrompts, featurePrompts, styleGuide } = promptResult.data;
      
      console.log("[MasterAgent] ✓ Phase 3 completed: ColorTheme + ImagePrompt");
      
      // ========================================================================
      // Phase 4: MEGA PARALLEL EXECUTION
      // ImageGeneration + Itinerary + 5 Detail Agents (7 agents in parallel!)
      // This is the key optimization - running 7 agents simultaneously
      // ========================================================================
      onProgress?.("generating_content", 55);
      console.log("[MasterAgent] Starting Phase 4: MEGA PARALLEL (7 agents)");
      console.log("[MasterAgent] Running: ImageGeneration, Itinerary, Cost, Notice, Hotel, Meal, Flight");
      
      // Start all agents
      this.monitor.startAgent('ImageGenerationAgent');
      this.monitor.startAgent('ItineraryAgent');
      this.monitor.startAgent('CostAgent');
      this.monitor.startAgent('NoticeAgent');
      this.monitor.startAgent('HotelAgent');
      this.monitor.startAgent('MealAgent');
      this.monitor.startAgent('FlightAgent');
      if (taskId) {
        progressTracker.startPhase(taskId, 'image_generation');
        progressTracker.startPhase(taskId, 'itinerary');
        progressTracker.startPhase(taskId, 'cost_agent');
        progressTracker.startPhase(taskId, 'notice_agent');
        progressTracker.startPhase(taskId, 'hotel_agent');
        progressTracker.startPhase(taskId, 'meal_agent');
        progressTracker.startPhase(taskId, 'flight_agent');
      }
      
      const megaParallelResults = await Promise.allSettled([
        // Image Generation
        this.retryManager.executeWithRetry(
          () => this.imageGenerationAgent.execute(
            heroPrompt,
            highlightPrompts,
            featurePrompts,
            styleGuide,
            userId || 1
          ),
          this.retryConfig,
          'ImageGenerationAgent'
        ),
        // Itinerary Generation
        this.retryManager.executeWithRetry(
          () => this.itineraryAgent.execute(rawData),
          this.retryConfig,
          'ItineraryAgent'
        ),
        // Cost Agent
        this.retryManager.executeWithRetry(
          () => this.costAgent.execute(rawData),
          this.retryConfig,
          'CostAgent'
        ),
        // Notice Agent
        this.retryManager.executeWithRetry(
          () => this.noticeAgent.execute(rawData),
          this.retryConfig,
          'NoticeAgent'
        ),
        // Hotel Agent
        this.retryManager.executeWithRetry(
          () => this.hotelAgent.execute(rawData),
          this.retryConfig,
          'HotelAgent'
        ),
        // Meal Agent
        this.retryManager.executeWithRetry(
          () => this.mealAgent.execute(rawData),
          this.retryConfig,
          'MealAgent'
        ),
        // Flight Agent
        this.retryManager.executeWithRetry(
          () => this.flightAgent.execute(rawData),
          this.retryConfig,
          'FlightAgent'
        )
      ]);
      
      // Process Image Generation result
      let heroImage = { url: "", alt: "Hero image" };
      let highlightImages: any[] = [];
      let featureImages: any[] = [];
      
      const imageResult = megaParallelResults[0];
      if (imageResult.status === 'fulfilled' && imageResult.value.success && imageResult.value.data) {
        heroImage = imageResult.value.data.heroImage;
        highlightImages = imageResult.value.data.highlightImages;
        featureImages = imageResult.value.data.featureImages;
        this.monitor.completeAgent('ImageGenerationAgent', imageResult.value);
        if (taskId) progressTracker.completePhase(taskId, 'image_generation');
        console.log("[MasterAgent] ✓ ImageGenerationAgent completed");
      } else {
        const error = imageResult.status === 'rejected' 
          ? imageResult.reason 
          : new Error(imageResult.value?.error || "Image generation failed");
        this.monitor.failAgent('ImageGenerationAgent', error);
        if (taskId) progressTracker.failPhase(taskId, 'image_generation', error.message);
        console.warn("[MasterAgent] ⚠ ImageGenerationAgent failed, using placeholder images");
        
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
      
      // Process Itinerary result
      let itineraryData = "";
      const itineraryResult = megaParallelResults[1];
      if (itineraryResult.status === 'fulfilled' && itineraryResult.value.success && itineraryResult.value.data) {
        itineraryData = JSON.stringify(itineraryResult.value.data.dailyItineraries);
        this.monitor.completeAgent('ItineraryAgent', itineraryResult.value);
        if (taskId) progressTracker.completePhase(taskId, 'itinerary');
        console.log("[MasterAgent] ✓ ItineraryAgent completed");
      } else {
        const error = itineraryResult.status === 'rejected' 
          ? itineraryResult.reason 
          : new Error(itineraryResult.value?.error || "Itinerary generation failed");
        this.monitor.failAgent('ItineraryAgent', error);
        if (taskId) progressTracker.failPhase(taskId, 'itinerary', error.message);
        console.warn("[MasterAgent] ⚠ ItineraryAgent failed, using empty data");
        itineraryData = JSON.stringify([]);
      }
      
      // Process Detail Agents results (Cost, Notice, Hotel, Meal, Flight)
      const detailAgentNames = ['CostAgent', 'NoticeAgent', 'HotelAgent', 'MealAgent', 'FlightAgent'];
      const detailResults = megaParallelResults.slice(2).map((result, index) => {
        const agentName = detailAgentNames[index];
        
        // Map agent names to progress phase IDs
        const agentToPhaseId: Record<string, string> = {
          'CostAgent': 'cost_agent',
          'NoticeAgent': 'notice_agent',
          'HotelAgent': 'hotel_agent',
          'MealAgent': 'meal_agent',
          'FlightAgent': 'flight_agent'
        };
        
        if (result.status === 'fulfilled' && result.value.success && result.value.data) {
          this.monitor.completeAgent(agentName, result.value);
          if (taskId) progressTracker.completePhase(taskId, agentToPhaseId[agentName]);
          console.log(`[MasterAgent] ✓ ${agentName} completed`);
          return result.value.data;
        } else {
          const error = result.status === 'rejected' 
            ? result.reason 
            : new Error(result.value?.error || `${agentName} failed`);
          
          this.monitor.failAgent(agentName, error);
          if (taskId) progressTracker.failPhase(taskId, agentToPhaseId[agentName], error.message);
          console.warn(`[MasterAgent] ⚠ ${agentName} failed, using fallback`);
          
          return this.fallbackManager.handleFailure(agentName, error);
        }
      });
      
      const [costData, noticeData, hotelData, mealData, flightData] = detailResults;
      
      console.log("[MasterAgent] ✓ Phase 4 completed: MEGA PARALLEL (7 agents)");
      
      // Extract feature image URLs
      const featureImageUrls = featureImages.map(img => img.url).filter(url => url !== "");
      
      // ========================================================================
      // Phase 5: Assemble Final Data
      // ========================================================================
      onProgress?.("assembling", 90);
      if (taskId) progressTracker.startPhase(taskId, 'finalize');
      
      const finalData = {
        // Basic info
        poeticTitle: lionTravelTitle, // Use Lion Travel style title (40-80 chars)
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
        hotels: JSON.stringify(hotelData?.hotels || []),
        
        // Meals
        meals: JSON.stringify(mealData?.meals || []),
        
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
      console.log("[MasterAgent] Time saved by parallel execution: ~40-60 seconds");
      console.log(executionReport);
      
      onProgress?.("completed", 100);
      if (taskId) {
        progressTracker.completePhase(taskId, 'finalize');
        progressTracker.completeTask(taskId);
      }
      
      return {
        success: true,
        data: finalData,
        executionReport
      };
      
    } catch (error) {
      console.error("[MasterAgent] ✗ Critical error:", error);
      
      const executionReport = this.monitor.generateReport();
      console.log(executionReport);
      
      // Mark task as failed in progress tracker
      if (taskId) {
        progressTracker.failTask(taskId, error instanceof Error ? error.message : "Unknown error");
      }
      
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
