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
import { ItineraryExtractAgent } from "./itineraryExtractAgent";
import { ItineraryPolishAgent } from "./itineraryPolishAgent";
import { CostAgent } from "./costAgent";
import { NoticeAgent } from "./noticeAgent";
import { HotelAgent } from "./hotelAgent";
import { MealAgent } from "./mealAgent";
import { FlightAgent } from "./flightAgent";
import { TransportationAgent } from "./transportationAgent";
// LionTitleGenerator removed - using ContentAnalyzerAgent.poeticTitle instead
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
import generationCache from "../cache/generation-cache";

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
  private itineraryExtractAgent: ItineraryExtractAgent;
  private itineraryPolishAgent: ItineraryPolishAgent;
  private costAgent: CostAgent;
  private noticeAgent: NoticeAgent;
  private hotelAgent: HotelAgent;
  private mealAgent: MealAgent;
  private flightAgent: FlightAgent;
  private transportationAgent: TransportationAgent;

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
    this.itineraryExtractAgent = new ItineraryExtractAgent();
    this.itineraryPolishAgent = new ItineraryPolishAgent();
    this.costAgent = new CostAgent();
    this.noticeAgent = new NoticeAgent();
    this.hotelAgent = new HotelAgent();
    this.mealAgent = new MealAgent();
    this.flightAgent = new FlightAgent();
    this.transportationAgent = new TransportationAgent();
    
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
      // Phase 0: Check Cache for Full Result
      // If we have a cached result for this URL, return it immediately
      // ========================================================================
      onProgress?.("checking_cache", 5);
      console.log("[MasterAgent] Checking cache for URL:", url);
      
      const cachedFullResult = await generationCache.getFullResult(url);
      if (cachedFullResult) {
        console.log("[MasterAgent] 🎯 Cache HIT! Returning cached result");
        const elapsedTime = Date.now() - startTime;
        console.log(`[MasterAgent] Total time (from cache): ${elapsedTime}ms`);
        
        return {
          success: true,
          data: cachedFullResult,
          executionReport: `Cache hit - returned in ${elapsedTime}ms`,
        };
      }
      console.log("[MasterAgent] Cache MISS, proceeding with generation...");
      
      // ========================================================================
      // Phase 1: Web Scraping (Critical, Sequential)
      // Must complete first as all other agents depend on rawData
      // ========================================================================
      onProgress?.("scraping", 10);
      this.monitor.startAgent('WebScraperAgent');
      if (taskId) progressTracker.startPhase(taskId, 'web_scraper');
      
      // Check for cached scrape result first
      let rawData;
      const cachedScrape = await generationCache.getScrapeResult(url);
      if (cachedScrape) {
        console.log("[MasterAgent] 🎯 Scrape cache HIT!");
        rawData = cachedScrape;
        this.monitor.completeAgent('WebScraperAgent', { success: true, data: cachedScrape });
      } else {
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
        rawData = scrapingResult.data;
        
        // Cache the scrape result (1 day TTL)
        await generationCache.cacheScrapeResult(url, rawData);
      }
      
      if (taskId) progressTracker.completePhase(taskId, 'web_scraper');
      console.log("[MasterAgent] ✓ Phase 1 completed: Web scraping");
      
      // ========================================================================
      // Phase 2: Content Analysis + Lion Title (Critical, Sequential)
      // Must complete before image prompts can be generated
      // ========================================================================
      onProgress?.("analyzing", 25);
      this.monitor.startAgent('ContentAnalyzerAgent');
      if (taskId) progressTracker.startPhase(taskId, 'content_analyzer');
      
      // Run Content Analysis (includes poeticTitle generation)
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
      if (taskId) progressTracker.completePhase(taskId, 'content_analyzer');
      const analyzedContent = analysisResult.data;
      
      // 漸進式結果：更新標題和目的地
      if (taskId) {
        progressTracker.updatePartialResults(taskId, {
          title: analyzedContent.poeticTitle,
          poeticTitle: analyzedContent.poeticTitle,
          destination: `${rawData.location?.destinationCity || ''}, ${rawData.location?.destinationCountry || ''}`,
          highlights: analyzedContent.highlights?.slice(0, 3),
        });
      }
      
      console.log("[MasterAgent] ✓ Phase 2 completed: Content analysis + Lion title");
      console.log("[MasterAgent] Originality score:", analyzedContent.originalityScore);
      console.log("[MasterAgent] Poetic title:", analyzedContent.poeticTitle);
      
      // ========================================================================
      // Phase 3: ColorTheme ONLY (ImagePrompt removed for speed optimization)
      // Image generation is skipped - editors will manage images manually
      // ========================================================================
      onProgress?.("generating_themes", 40);
      console.log("[MasterAgent] Starting Phase 3: ColorTheme only (image generation disabled)");
      
      this.monitor.startAgent('ColorThemeAgent');
      if (taskId) {
        progressTracker.startPhase(taskId, 'color_theme');
        // Skip image_prompt phase - mark as complete immediately
        progressTracker.startPhase(taskId, 'image_prompt');
        progressTracker.completePhase(taskId, 'image_prompt');
      }
      
      // Check for cached color palette first
      const destination = rawData.location?.destinationCity || rawData.location?.destinationCountry || "";
      let colorTheme;
      const cachedPalette = await generationCache.getColorPalette(destination);
      
      // Run ColorTheme only
      const colorThemeResult = cachedPalette 
        ? { success: true, data: cachedPalette }
        : await this.retryManager.executeWithRetry(
            () => this.colorThemeAgent.execute(
              rawData.location?.destinationCountry || "",
              rawData.location?.destinationCity
            ),
            this.retryConfig,
            'ColorThemeAgent'
          );
      
      // Handle ColorThemeAgent result
      if (!colorThemeResult.success || !colorThemeResult.data) {
        const errorMsg = (colorThemeResult as any).error || "Color theme generation failed";
        this.monitor.failAgent('ColorThemeAgent', new Error(errorMsg));
        throw new Error(errorMsg);
      }
      
      if (cachedPalette) {
        console.log("[MasterAgent] 🎯 Color palette cache HIT!");
      } else {
        // Cache the color palette (7 days TTL)
        await generationCache.cacheColorPalette(destination, colorThemeResult.data);
      }
      
      this.monitor.completeAgent('ColorThemeAgent', colorThemeResult);
      if (taskId) progressTracker.completePhase(taskId, 'color_theme');
      colorTheme = colorThemeResult.data;
      
      // 漸進式結果：更新配色方案
      if (taskId) {
        progressTracker.updatePartialResults(taskId, {
          colorTheme: colorTheme,
        });
      }
      
      // Skip ImagePromptAgent - editors will manage images
      console.log("[MasterAgent] Skipping ImagePromptAgent - editors will manage images");
      
      console.log("[MasterAgent] ✓ Phase 3 completed: ColorTheme only");
      
      // ========================================================================
      // Phase 4: PARALLEL EXECUTION (6 agents - Image generation removed)
      // Itinerary + 5 Detail Agents running in parallel
      // ========================================================================
      onProgress?.("generating_content", 55);
      console.log("[MasterAgent] Starting Phase 4: PARALLEL (6 agents - no image generation)");
      console.log("[MasterAgent] Running: Itinerary, Cost, Notice, Hotel, Meal, Flight");
      
      // Skip image generation - editors will manage images
      console.log("[MasterAgent] Skipping ImageGenerationAgent - editors will manage images");
      
      // Start all agents (except ImageGenerationAgent and ItineraryAgent which runs separately)
      this.monitor.startAgent('CostAgent');
      this.monitor.startAgent('NoticeAgent');
      this.monitor.startAgent('HotelAgent');
      this.monitor.startAgent('MealAgent');
      this.monitor.startAgent('TransportationAgent');
      if (taskId) {
        // Skip image_generation phase - mark as complete immediately
        progressTracker.startPhase(taskId, 'image_generation');
        progressTracker.completePhase(taskId, 'image_generation');
        progressTracker.startPhase(taskId, 'itinerary');
        progressTracker.startPhase(taskId, 'cost_agent');
        progressTracker.startPhase(taskId, 'notice_agent');
        progressTracker.startPhase(taskId, 'hotel_agent');
        progressTracker.startPhase(taskId, 'meal_agent');
        progressTracker.startPhase(taskId, 'flight_agent');
      }
      
      // Execute Itinerary Extract + Polish sequentially first
      // Phase 1 優化：傳遞原始資料快照給 ItineraryPolishAgent
      let itineraryData = "";
      let tourType = 'GENERAL'; // 預設行程類型
      try {
        // Step 1: Extract raw itinerary from scraped data
        this.monitor.startAgent('ItineraryExtractAgent');
        if (taskId) progressTracker.startPhase(taskId, 'itinerary');
        
        const extractResult = await this.itineraryExtractAgent.execute(rawData);
        
        if (extractResult.success && extractResult.data && extractResult.data.extractedItineraries.length > 0) {
          console.log(`[MasterAgent] ✓ ItineraryExtractAgent completed: ${extractResult.data.extractedItineraries.length} days, method: ${extractResult.data.extractionMethod}`);
          console.log(`[MasterAgent] Tour Type: ${extractResult.data.tourType}, Transportation: ${extractResult.data.originalTransportation}`);
          // 保存 tourType 供 TransportationAgent 使用
          tourType = extractResult.data.tourType || 'GENERAL';
          this.monitor.completeAgent('ItineraryExtractAgent', extractResult);
          
          // Step 2: Polish the extracted itinerary
          // Phase 1 優化：傳遞原始資料快照
          this.monitor.startAgent('ItineraryPolishAgent');
          
          const polishResult = await this.itineraryPolishAgent.execute(
            extractResult.data.extractedItineraries,
            { country: rawData?.location?.destinationCountry, city: rawData?.location?.destinationCity },
            // Phase 1 新增：傳遞原始資料快照
            {
              tourType: extractResult.data.tourType,
              originalTransportation: extractResult.data.originalTransportation,
              originalHotels: extractResult.data.originalHotels,
              originalAttractions: extractResult.data.originalAttractions,
            }
          );
          
          if (polishResult.success && polishResult.data) {
            itineraryData = JSON.stringify(polishResult.data.polishedItineraries);
            console.log(`[MasterAgent] ✓ ItineraryPolishAgent completed: ${polishResult.data.polishedItineraries.length} days polished`);
            // Phase 1 新增：輸出忠實度檢查結果
            console.log(`[MasterAgent] Fidelity Check: Score=${polishResult.data.fidelityCheck.overallScore}, Transportation=${polishResult.data.fidelityCheck.transportationMatch}, Hotel=${polishResult.data.fidelityCheck.hotelMatch}`);
            if (polishResult.data.fidelityCheck.issues.length > 0) {
              console.warn(`[MasterAgent] Fidelity Issues: ${polishResult.data.fidelityCheck.issues.join(', ')}`);
            }
            this.monitor.completeAgent('ItineraryPolishAgent', polishResult);
          } else {
            // Use extracted data without polish if polish fails
            itineraryData = JSON.stringify(extractResult.data.extractedItineraries);
            console.warn("[MasterAgent] ⚠ ItineraryPolishAgent failed, using extracted data");
          }
        } else {
          console.warn("[MasterAgent] ⚠ ItineraryExtractAgent returned no data");
          itineraryData = JSON.stringify([]);
        }
        
        if (taskId) progressTracker.completePhase(taskId, 'itinerary');
      } catch (error) {
        console.error("[MasterAgent] Itinerary generation error:", error);
        if (taskId) progressTracker.failPhase(taskId, 'itinerary', error instanceof Error ? error.message : 'Unknown error');
        itineraryData = JSON.stringify([]);
      }
      
      // Execute remaining Detail Agents in parallel
      const megaParallelResults = await Promise.allSettled([
        // Cost Agent (now index 1)
        this.retryManager.executeWithRetry(
          () => this.costAgent.execute(rawData),
          this.retryConfig,
          'CostAgent'
        ),
        // Notice Agent (now index 2)
        this.retryManager.executeWithRetry(
          () => this.noticeAgent.execute(rawData),
          this.retryConfig,
          'NoticeAgent'
        ),
        // Hotel Agent (now index 3)
        this.retryManager.executeWithRetry(
          () => this.hotelAgent.execute(rawData),
          this.retryConfig,
          'HotelAgent'
        ),
        // Meal Agent (now index 4)
        this.retryManager.executeWithRetry(
          () => this.mealAgent.execute(rawData),
          this.retryConfig,
          'MealAgent'
        ),
        // Transportation Agent (now index 5) - 根據行程類型選擇交通方式
        this.retryManager.executeWithRetry(
          () => this.transportationAgent.execute(rawData, tourType),
          this.retryConfig,
          'TransportationAgent'
        )
      ]);
      
      // Dynamic Hero Image: Search from Unsplash based on destination
      let heroImage = { url: "", alt: "" };
      let highlightImages: any[] = [];
      let featureImages: any[] = [];
      
      // Try to get hero image from Unsplash based on destination
      try {
        const { searchUnsplashPhotos } = await import("../services/unsplashService");
        const destination = rawData.location?.destinationCity || rawData.location?.destinationCountry || "travel";
        console.log(`[MasterAgent] Searching hero image for destination: ${destination}`);
        
        const heroImages = await searchUnsplashPhotos(destination, 1);
        if (heroImages.length > 0) {
          heroImage = {
            url: heroImages[0],
            alt: `${destination} travel destination`
          };
          console.log(`[MasterAgent] ✓ Found hero image from Unsplash: ${heroImage.url.substring(0, 50)}...`);
        } else {
          console.log(`[MasterAgent] No hero image found, will use default`);
        }
      } catch (error) {
        console.warn(`[MasterAgent] Failed to search hero image:`, error);
      }
      
      // Process Detail Agents results (Cost, Notice, Hotel, Meal, Transportation)
      const detailAgentNames = ['CostAgent', 'NoticeAgent', 'HotelAgent', 'MealAgent', 'TransportationAgent'];
      const detailResults = megaParallelResults.map((result, index) => {
        const agentName = detailAgentNames[index];
        
        // Map agent names to progress phase IDs
        const agentToPhaseId: Record<string, string> = {
          'CostAgent': 'cost_agent',
          'NoticeAgent': 'notice_agent',
          'HotelAgent': 'hotel_agent',
          'MealAgent': 'meal_agent',
          'TransportationAgent': 'flight_agent' // 保持 phase ID 不變以相容前端
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
      
      const [costData, noticeData, hotelData, mealData, transportationData] = detailResults;
      
      console.log("[MasterAgent] ✓ Phase 4 completed: PARALLEL (6 agents - no image generation)");
      
      // Extract feature image URLs
      const featureImageUrls = featureImages.map(img => img.url).filter(url => url !== "");
      
      // ========================================================================
      // Phase 5: Assemble Final Data
      // ========================================================================
      onProgress?.("assembling", 90);
      if (taskId) progressTracker.startPhase(taskId, 'finalize');
      
      const finalData = {
        // Basic info
        poeticTitle: analyzedContent.poeticTitle, // Use ContentAnalyzerAgent's poetic title
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
        
        // Key Features (required field)
        keyFeatures: JSON.stringify(analyzedContent.highlights || []),
        
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
        
        // Transportation (交通資訊 - 只有飛機行程才生成)
        // 火車、巴士等行程的交通資訊已整合到每日行程中
        flights: (transportationData?.type === 'FLIGHT' || !transportationData?.type) 
          ? JSON.stringify(transportationData) 
          : JSON.stringify({ type: transportationData?.type, typeName: transportationData?.typeName }),
        
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
      
      // Cache the full result (3 days TTL)
      await generationCache.cacheFullResult(url, finalData);
      console.log("[MasterAgent] 💾 Full result cached for URL:", url);
      
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
