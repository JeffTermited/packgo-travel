/**
 * AI 行程生成診斷工具
 * 
 * 功能：
 * 1. 測試雄獅旅遊 URL 的爬取結果
 * 2. 檢查 dailyItinerary 和 activities 是否有資料
 * 3. 驗證 LLM Fallback 是否被觸發
 * 4. 顯示每個 Agent 的輸入/輸出
 * 5. 標出問題卡在哪一個環節
 */

import { WebScraperAgent } from './webScraperAgent';
import { ItineraryExtractAgent, ExtractedItinerary } from './itineraryExtractAgent';
import { ItineraryPolishAgent } from './itineraryPolishAgent';
import { ContentAnalyzerAgent } from './contentAnalyzerAgent';
import { ColorThemeAgent } from './colorThemeAgent';
import { LionTravelParser, parseLionTravel } from './parsers/lionTravelParser';
import { FirecrawlAgent } from './firecrawlAgent';

// 診斷結果類型
export interface DiagnosticStep {
  name: string;
  status: 'success' | 'warning' | 'error' | 'skipped';
  duration: number; // ms
  input?: any;
  output?: any;
  error?: string;
  details?: string;
  subSteps?: DiagnosticStep[];
}

export interface DiagnosticReport {
  url: string;
  timestamp: string;
  totalDuration: number;
  overallStatus: 'success' | 'partial' | 'failed';
  problemSummary: string[];
  steps: DiagnosticStep[];
  recommendations: string[];
}

/**
 * Agent 診斷工具
 */
export class AgentDiagnostics {
  private webScraperAgent: WebScraperAgent;
  private itineraryExtractAgent: ItineraryExtractAgent;
  private itineraryPolishAgent: ItineraryPolishAgent;
  private contentAnalyzerAgent: ContentAnalyzerAgent;
  private colorThemeAgent: ColorThemeAgent;
  private firecrawlAgent: FirecrawlAgent | null = null;

  constructor() {
    this.webScraperAgent = new WebScraperAgent();
    this.itineraryExtractAgent = new ItineraryExtractAgent();
    this.itineraryPolishAgent = new ItineraryPolishAgent();
    this.contentAnalyzerAgent = new ContentAnalyzerAgent();
    this.colorThemeAgent = new ColorThemeAgent();
    
    // 初始化 Firecrawl
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    if (firecrawlApiKey) {
      try {
        this.firecrawlAgent = new FirecrawlAgent();
      } catch (error) {
        console.warn('[AgentDiagnostics] Failed to initialize FirecrawlAgent:', error);
      }
    }
  }

  /**
   * 執行完整診斷
   */
  async runFullDiagnostics(url: string): Promise<DiagnosticReport> {
    const startTime = Date.now();
    const steps: DiagnosticStep[] = [];
    const problemSummary: string[] = [];
    const recommendations: string[] = [];

    console.log('\n========================================');
    console.log('🔍 AI 行程生成診斷工具');
    console.log('========================================');
    console.log(`URL: ${url}`);
    console.log(`時間: ${new Date().toISOString()}`);
    console.log('========================================\n');

    // Step 1: URL 分析
    const urlAnalysis = this.analyzeUrl(url);
    steps.push(urlAnalysis);
    if (urlAnalysis.status === 'error') {
      problemSummary.push('URL 格式無效');
    }

    // Step 2: Firecrawl 爬取測試
    const firecrawlStep = await this.testFirecrawl(url);
    steps.push(firecrawlStep);
    if (firecrawlStep.status === 'error') {
      problemSummary.push('Firecrawl 爬取失敗');
      recommendations.push('檢查 FIRECRAWL_API_KEY 是否有效');
    }

    // Step 3: LionTravelParser 測試（如果是雄獅旅遊）
    if (LionTravelParser.isLionTravelUrl(url) && firecrawlStep.output?.html) {
      const lionTravelStep = await this.testLionTravelParser(firecrawlStep.output.html, url);
      steps.push(lionTravelStep);
      if (lionTravelStep.status === 'error' || lionTravelStep.status === 'warning') {
        problemSummary.push('LionTravelParser 無法提取每日行程');
        recommendations.push('需要更新 LionTravelParser 的 CSS 選擇器以適應新版網站');
      }
    }

    // Step 4: WebScraperAgent 完整測試
    const webScraperStep = await this.testWebScraperAgent(url);
    steps.push(webScraperStep);
    if (webScraperStep.status === 'error') {
      problemSummary.push('WebScraperAgent 爬取失敗');
    }

    // Step 5: 檢查 dailyItinerary 資料
    const dailyItineraryCheck = this.checkDailyItinerary(webScraperStep.output?.data);
    steps.push(dailyItineraryCheck);
    if (dailyItineraryCheck.status === 'error') {
      problemSummary.push('dailyItinerary 為空或無效');
      recommendations.push('檢查 LLM Fallback 是否正確觸發');
    }

    // Step 6: 檢查 activities 資料
    const activitiesCheck = this.checkActivities(webScraperStep.output?.data?.dailyItinerary);
    steps.push(activitiesCheck);
    if (activitiesCheck.status === 'error') {
      problemSummary.push('activities 為空');
      recommendations.push('增強 WebScraperAgent 的 JSON Schema 以提取更詳細的 activities');
    }

    // Step 7: ItineraryExtractAgent 測試
    if (webScraperStep.output?.data) {
      const extractStep = await this.testItineraryExtractAgent(webScraperStep.output.data);
      steps.push(extractStep);
      if (extractStep.status === 'error') {
        problemSummary.push('ItineraryExtractAgent 提取失敗');
      }

      // Step 8: ItineraryPolishAgent 測試
      if (extractStep.output?.data?.extractedItineraries) {
        const polishStep = await this.testItineraryPolishAgent(
          extractStep.output.data.extractedItineraries,
          webScraperStep.output.data
        );
        steps.push(polishStep);
        if (polishStep.status === 'error') {
          problemSummary.push('ItineraryPolishAgent 美化失敗');
        }
      }
    }

    // Step 9: ContentAnalyzerAgent 測試
    if (webScraperStep.output?.data) {
      const contentStep = await this.testContentAnalyzerAgent(webScraperStep.output.data);
      steps.push(contentStep);
      if (contentStep.status === 'error') {
        problemSummary.push('ContentAnalyzerAgent 分析失敗');
      }
    }

    // Step 10: ColorThemeAgent 測試
    if (webScraperStep.output?.data?.location) {
      const colorStep = await this.testColorThemeAgent(webScraperStep.output.data.location);
      steps.push(colorStep);
    }

    // 計算總時間和整體狀態
    const totalDuration = Date.now() - startTime;
    const errorCount = steps.filter(s => s.status === 'error').length;
    const warningCount = steps.filter(s => s.status === 'warning').length;
    
    let overallStatus: 'success' | 'partial' | 'failed';
    if (errorCount === 0 && warningCount === 0) {
      overallStatus = 'success';
    } else if (errorCount > 2) {
      overallStatus = 'failed';
    } else {
      overallStatus = 'partial';
    }

    // 生成報告
    const report: DiagnosticReport = {
      url,
      timestamp: new Date().toISOString(),
      totalDuration,
      overallStatus,
      problemSummary,
      steps,
      recommendations,
    };

    // 輸出摘要
    this.printSummary(report);

    return report;
  }

  /**
   * Step 1: URL 分析
   */
  private analyzeUrl(url: string): DiagnosticStep {
    const startTime = Date.now();
    
    try {
      const urlObj = new URL(url);
      const isLionTravel = LionTravelParser.isLionTravelUrl(url);
      
      return {
        name: 'URL 分析',
        status: 'success',
        duration: Date.now() - startTime,
        input: { url },
        output: {
          host: urlObj.host,
          pathname: urlObj.pathname,
          isLionTravel,
          protocol: urlObj.protocol,
        },
        details: isLionTravel ? '✅ 偵測到雄獅旅遊網站，將使用專屬解析器' : '一般網站，使用標準解析流程',
      };
    } catch (error) {
      return {
        name: 'URL 分析',
        status: 'error',
        duration: Date.now() - startTime,
        input: { url },
        error: `無效的 URL: ${error}`,
      };
    }
  }

  /**
   * Step 2: Firecrawl 爬取測試
   */
  private async testFirecrawl(url: string): Promise<DiagnosticStep> {
    const startTime = Date.now();
    
    if (!this.firecrawlAgent) {
      return {
        name: 'Firecrawl 爬取',
        status: 'error',
        duration: Date.now() - startTime,
        error: 'FIRECRAWL_API_KEY 未設定',
        details: '無法使用 Firecrawl API',
      };
    }

    try {
      console.log('[診斷] 測試 Firecrawl 爬取...');
      const result = await this.firecrawlAgent.scrape(url);
      
      const output = {
        success: result.success,
        htmlLength: result.html?.length || 0,
        markdownLength: result.markdown?.length || 0,
        hasQuickInfo: !!result.quickInfo,
        quickInfo: result.quickInfo,
      };

      return {
        name: 'Firecrawl 爬取',
        status: result.success ? 'success' : 'error',
        duration: Date.now() - startTime,
        input: { url },
        output: { ...output, html: result.html, markdown: result.markdown },
        details: result.success 
          ? `✅ 成功爬取 ${output.htmlLength} chars HTML, ${output.markdownLength} chars Markdown`
          : '❌ 爬取失敗',
      };
    } catch (error) {
      return {
        name: 'Firecrawl 爬取',
        status: 'error',
        duration: Date.now() - startTime,
        input: { url },
        error: `Firecrawl 錯誤: ${error}`,
      };
    }
  }

  /**
   * Step 3: LionTravelParser 測試
   */
  private async testLionTravelParser(html: string, url: string): Promise<DiagnosticStep> {
    const startTime = Date.now();
    
    try {
      console.log('[診斷] 測試 LionTravelParser...');
      const result = await parseLionTravel(html, url);
      
      const hasDailyItinerary = result?.dailyItinerary && 
                                Array.isArray(result.dailyItinerary) && 
                                result.dailyItinerary.length > 0;
      
      const output = {
        success: !!result,
        hasDailyItinerary,
        dailyItineraryCount: result?.dailyItinerary?.length || 0,
        hasBasicInfo: !!result?.basicInfo?.title,
        hasPricing: !!result?.pricing?.price,
        basicInfo: result?.basicInfo,
        pricing: result?.pricing,
        dailyItinerary: result?.dailyItinerary,
      };

      let status: 'success' | 'warning' | 'error' = 'success';
      let details = '';

      if (!result) {
        status = 'error';
        details = '❌ LionTravelParser 返回 null';
      } else if (!hasDailyItinerary) {
        status = 'warning';
        details = `⚠️ LionTravelParser 未提取到每日行程（dailyItinerary: ${output.dailyItineraryCount} 天）`;
      } else {
        details = `✅ 成功提取 ${output.dailyItineraryCount} 天行程`;
      }

      return {
        name: 'LionTravelParser 專屬解析',
        status,
        duration: Date.now() - startTime,
        input: { htmlLength: html.length, url },
        output,
        details,
      };
    } catch (error) {
      return {
        name: 'LionTravelParser 專屬解析',
        status: 'error',
        duration: Date.now() - startTime,
        input: { htmlLength: html.length, url },
        error: `LionTravelParser 錯誤: ${error}`,
      };
    }
  }

  /**
   * Step 4: WebScraperAgent 完整測試
   */
  private async testWebScraperAgent(url: string): Promise<DiagnosticStep> {
    const startTime = Date.now();
    const subSteps: DiagnosticStep[] = [];
    
    try {
      console.log('[診斷] 測試 WebScraperAgent...');
      const result = await this.webScraperAgent.execute(url);
      
      // 檢查各個欄位
      const checks = {
        hasBasicInfo: !!result.data?.basicInfo?.title,
        hasLocation: !!result.data?.location?.destinationCountry || !!result.data?.location?.destinationCity,
        hasDuration: !!result.data?.duration?.days,
        hasPricing: !!result.data?.pricing?.price,
        hasDailyItinerary: Array.isArray(result.data?.dailyItinerary) && result.data.dailyItinerary.length > 0,
        hasHighlights: Array.isArray(result.data?.highlights) && result.data.highlights.length > 0,
      };

      // 記錄子步驟
      Object.entries(checks).forEach(([key, value]) => {
        subSteps.push({
          name: key,
          status: value ? 'success' : 'warning',
          duration: 0,
          details: value ? '✅' : '⚠️ 缺失',
        });
      });

      const output = {
        success: result.success,
        method: result.method,
        checks,
        data: result.data,
        extractionDetails: result.extractionDetails,
      };

      return {
        name: 'WebScraperAgent 完整爬取',
        status: result.success ? 'success' : 'error',
        duration: Date.now() - startTime,
        input: { url },
        output,
        details: result.success 
          ? `✅ 爬取成功 (方法: ${result.method})`
          : '❌ 爬取失敗',
        subSteps,
      };
    } catch (error) {
      return {
        name: 'WebScraperAgent 完整爬取',
        status: 'error',
        duration: Date.now() - startTime,
        input: { url },
        error: `WebScraperAgent 錯誤: ${error}`,
        subSteps,
      };
    }
  }

  /**
   * Step 5: 檢查 dailyItinerary 資料
   */
  private checkDailyItinerary(data: any): DiagnosticStep {
    const startTime = Date.now();
    
    const dailyItinerary = data?.dailyItinerary;
    const hasDailyItinerary = Array.isArray(dailyItinerary) && dailyItinerary.length > 0;
    
    if (!hasDailyItinerary) {
      return {
        name: 'dailyItinerary 資料檢查',
        status: 'error',
        duration: Date.now() - startTime,
        input: { hasDailyItinerary: false },
        output: { count: 0, sample: null },
        details: '❌ dailyItinerary 為空或不存在',
        error: 'dailyItinerary 為空，這是導致每日行程無法顯示的主要原因',
      };
    }

    const sample = dailyItinerary[0];
    const output = {
      count: dailyItinerary.length,
      sample: {
        day: sample?.day,
        title: sample?.title,
        hasDescription: !!sample?.description,
        hasActivities: Array.isArray(sample?.activities) && sample.activities.length > 0,
        activitiesCount: sample?.activities?.length || 0,
        hasMeals: !!sample?.meals,
        hasAccommodation: !!sample?.accommodation,
      },
      allDays: dailyItinerary.map((d: any, i: number) => ({
        day: d.day || i + 1,
        title: d.title,
        activitiesCount: d.activities?.length || 0,
      })),
    };

    return {
      name: 'dailyItinerary 資料檢查',
      status: 'success',
      duration: Date.now() - startTime,
      input: { hasDailyItinerary: true },
      output,
      details: `✅ 有 ${output.count} 天行程資料`,
    };
  }

  /**
   * Step 6: 檢查 activities 資料
   */
  private checkActivities(dailyItinerary: any[]): DiagnosticStep {
    const startTime = Date.now();
    
    if (!Array.isArray(dailyItinerary) || dailyItinerary.length === 0) {
      return {
        name: 'activities 資料檢查',
        status: 'skipped',
        duration: Date.now() - startTime,
        details: '⏭️ 跳過（dailyItinerary 為空）',
      };
    }

    const activitiesAnalysis = dailyItinerary.map((day: any, index: number) => {
      const activities = day.activities || [];
      return {
        day: day.day || index + 1,
        activitiesCount: activities.length,
        hasTime: activities.some((a: any) => !!a.time),
        hasTitle: activities.some((a: any) => !!a.title),
        hasDescription: activities.some((a: any) => !!a.description),
        sample: activities[0] || null,
      };
    });

    const totalActivities = activitiesAnalysis.reduce((sum, d) => sum + d.activitiesCount, 0);
    const daysWithActivities = activitiesAnalysis.filter(d => d.activitiesCount > 0).length;

    const status = totalActivities > 0 ? 'success' : 'error';
    const details = totalActivities > 0
      ? `✅ 共 ${totalActivities} 個活動，分布在 ${daysWithActivities}/${dailyItinerary.length} 天`
      : '❌ 所有天數的 activities 都為空';

    return {
      name: 'activities 資料檢查',
      status,
      duration: Date.now() - startTime,
      input: { daysCount: dailyItinerary.length },
      output: {
        totalActivities,
        daysWithActivities,
        analysis: activitiesAnalysis,
      },
      details,
      error: totalActivities === 0 ? 'activities 為空，這會導致前端無法顯示詳細活動時間軸' : undefined,
    };
  }

  /**
   * Step 7: ItineraryExtractAgent 測試
   */
  private async testItineraryExtractAgent(rawData: any): Promise<DiagnosticStep> {
    const startTime = Date.now();
    
    try {
      console.log('[診斷] 測試 ItineraryExtractAgent...');
      const result = await this.itineraryExtractAgent.execute(rawData);
      
      const output = {
        success: result.success,
        extractedCount: result.data?.extractedItineraries?.length || 0,
        extractionMethod: result.data?.extractionMethod,
        tourType: result.data?.tourType,
        sample: result.data?.extractedItineraries?.[0],
      };

      return {
        name: 'ItineraryExtractAgent 行程提取',
        status: result.success ? 'success' : 'error',
        duration: Date.now() - startTime,
        input: { 
          hasDailyItinerary: !!rawData.dailyItinerary,
          dailyItineraryCount: rawData.dailyItinerary?.length || 0,
        },
        output,
        details: result.success 
          ? `✅ 提取 ${output.extractedCount} 天行程 (方法: ${output.extractionMethod}, 類型: ${output.tourType})`
          : '❌ 提取失敗',
        error: result.error,
      };
    } catch (error) {
      return {
        name: 'ItineraryExtractAgent 行程提取',
        status: 'error',
        duration: Date.now() - startTime,
        error: `ItineraryExtractAgent 錯誤: ${error}`,
      };
    }
  }

  /**
   * Step 8: ItineraryPolishAgent 測試
   */
  private async testItineraryPolishAgent(
    extractedItineraries: ExtractedItinerary[],
    rawData: any
  ): Promise<DiagnosticStep> {
    const startTime = Date.now();
    
    if (!extractedItineraries || extractedItineraries.length === 0) {
      return {
        name: 'ItineraryPolishAgent 行程美化',
        status: 'skipped',
        duration: Date.now() - startTime,
        details: '⏭️ 跳過（extractedItineraries 為空）',
      };
    }

    try {
      console.log('[診斷] 測試 ItineraryPolishAgent...');
      const result = await this.itineraryPolishAgent.execute(
        extractedItineraries,
        {
          country: rawData.location?.destinationCountry,
          city: rawData.location?.destinationCity,
        }
      );
      
      const output = {
        success: result.success,
        polishedCount: result.data?.polishedItineraries?.length || 0,
        fidelityCheck: result.data?.fidelityCheck,
        sample: result.data?.polishedItineraries?.[0],
      };

      const fidelityScore = result.data?.fidelityCheck?.overallScore || 0;
      let status: 'success' | 'warning' | 'error' = 'success';
      if (!result.success) {
        status = 'error';
      } else if (fidelityScore < 80) {
        status = 'warning';
      }

      return {
        name: 'ItineraryPolishAgent 行程美化',
        status,
        duration: Date.now() - startTime,
        input: { 
          extractedCount: extractedItineraries.length,
          destination: rawData.location,
        },
        output,
        details: result.success 
          ? `✅ 美化 ${output.polishedCount} 天行程 (忠實度: ${fidelityScore}%)`
          : '❌ 美化失敗',
        error: result.error,
      };
    } catch (error) {
      return {
        name: 'ItineraryPolishAgent 行程美化',
        status: 'error',
        duration: Date.now() - startTime,
        error: `ItineraryPolishAgent 錯誤: ${error}`,
      };
    }
  }

  /**
   * Step 9: ContentAnalyzerAgent 測試
   */
  private async testContentAnalyzerAgent(rawData: any): Promise<DiagnosticStep> {
    const startTime = Date.now();
    
    try {
      console.log('[診斷] 測試 ContentAnalyzerAgent...');
      const result = await this.contentAnalyzerAgent.execute(rawData);
      
      const output = {
        success: result.success,
        poeticTitle: result.data?.poeticTitle,
        title: result.data?.title,
        highlightsCount: result.data?.highlights?.length || 0,
        originalityScore: result.data?.originalityScore,
      };

      return {
        name: 'ContentAnalyzerAgent 內容分析',
        status: result.success ? 'success' : 'error',
        duration: Date.now() - startTime,
        input: { 
          hasBasicInfo: !!rawData.basicInfo,
          hasHighlights: !!rawData.highlights,
        },
        output,
        details: result.success 
          ? `✅ 生成詩意標題: "${output.poeticTitle}" (原創性: ${output.originalityScore}%)`
          : '❌ 分析失敗',
        error: result.error,
      };
    } catch (error) {
      return {
        name: 'ContentAnalyzerAgent 內容分析',
        status: 'error',
        duration: Date.now() - startTime,
        error: `ContentAnalyzerAgent 錯誤: ${error}`,
      };
    }
  }

  /**
   * Step 10: ColorThemeAgent 測試
   */
  private async testColorThemeAgent(location: any): Promise<DiagnosticStep> {
    const startTime = Date.now();
    
    try {
      console.log('[診斷] 測試 ColorThemeAgent...');
      const result = await this.colorThemeAgent.execute(
        location.destinationCountry || '',
        location.destinationCity
      );
      
      return {
        name: 'ColorThemeAgent 配色主題',
        status: result.success ? 'success' : 'error',
        duration: Date.now() - startTime,
        input: { location },
        output: result.data,
        details: result.success 
          ? `✅ 生成配色方案 (主色: ${result.data?.primary})`
          : '❌ 生成失敗',
        error: result.error,
      };
    } catch (error) {
      return {
        name: 'ColorThemeAgent 配色主題',
        status: 'error',
        duration: Date.now() - startTime,
        error: `ColorThemeAgent 錯誤: ${error}`,
      };
    }
  }

  /**
   * 輸出診斷摘要
   */
  private printSummary(report: DiagnosticReport): void {
    console.log('\n========================================');
    console.log('📊 診斷報告摘要');
    console.log('========================================');
    console.log(`URL: ${report.url}`);
    console.log(`總耗時: ${report.totalDuration}ms`);
    console.log(`整體狀態: ${report.overallStatus === 'success' ? '✅ 成功' : report.overallStatus === 'partial' ? '⚠️ 部分成功' : '❌ 失敗'}`);
    
    console.log('\n📋 步驟結果:');
    report.steps.forEach((step, index) => {
      const icon = step.status === 'success' ? '✅' : step.status === 'warning' ? '⚠️' : step.status === 'error' ? '❌' : '⏭️';
      console.log(`  ${index + 1}. ${icon} ${step.name} (${step.duration}ms)`);
      if (step.details) {
        console.log(`     ${step.details}`);
      }
      if (step.error) {
        console.log(`     ❌ 錯誤: ${step.error}`);
      }
    });

    if (report.problemSummary.length > 0) {
      console.log('\n🚨 發現的問題:');
      report.problemSummary.forEach((problem, index) => {
        console.log(`  ${index + 1}. ${problem}`);
      });
    }

    if (report.recommendations.length > 0) {
      console.log('\n💡 建議修復:');
      report.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }

    console.log('\n========================================\n');
  }
}

// 導出單例
export const agentDiagnostics = new AgentDiagnostics();
