/**
 * PrintFriendly Agent - 網頁轉 PDF 並分析內容
 * 
 * 使用 PrintFriendly API 將網頁轉換成乾淨的 PDF，
 * 然後提取文字內容並使用 LLM 分析行程資訊
 */

import { invokeLLM } from '../_core/llm';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface PrintFriendlyResult {
  success: boolean;
  pdfUrl?: string;
  textContent?: string;
  error?: string;
}

interface AnalysisResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class PrintFriendlyAgent {
  private apiKey: string;
  private apiBaseUrl = 'https://api.printfriendly.com/v2';
  
  constructor() {
    this.apiKey = process.env.PRINTFRIENDLY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[PrintFriendlyAgent] API Key not configured');
    }
    console.log('[PrintFriendlyAgent] Initialized');
  }
  
  /**
   * 將網頁轉換為 PDF
   */
  async convertToPdf(url: string): Promise<PrintFriendlyResult> {
    console.log(`[PrintFriendlyAgent] Converting URL to PDF: ${url}`);
    
    if (!this.apiKey) {
      return {
        success: false,
        error: 'PrintFriendly API Key not configured',
      };
    }
    
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/pdf/create?api_key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          },
          body: `page_url=${encodeURIComponent(url)}`,
        }
      );
      
      const data = await response.json();
      
      if (data.status !== 'success') {
        console.error('[PrintFriendlyAgent] API Error:', data);
        return {
          success: false,
          error: data.message || 'Failed to convert URL to PDF',
        };
      }
      
      console.log(`[PrintFriendlyAgent] PDF created: ${data.file_url}`);
      
      return {
        success: true,
        pdfUrl: data.file_url,
      };
    } catch (error) {
      console.error('[PrintFriendlyAgent] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * 下載 PDF 並提取文字內容
   */
  async extractTextFromPdf(pdfUrl: string): Promise<string> {
    console.log(`[PrintFriendlyAgent] Extracting text from PDF: ${pdfUrl}`);
    
    try {
      // 下載 PDF
      const response = await fetch(pdfUrl);
      const pdfBuffer = await response.arrayBuffer();
      
      // 保存到臨時檔案
      const tempDir = '/tmp';
      const timestamp = Date.now();
      const pdfPath = path.join(tempDir, `tour_${timestamp}.pdf`);
      const txtPath = path.join(tempDir, `tour_${timestamp}.txt`);
      
      fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));
      console.log(`[PrintFriendlyAgent] PDF saved to: ${pdfPath}`);
      
      // 使用 pdftotext 提取文字（poppler-utils 已預裝）
      try {
        execSync(`pdftotext -layout "${pdfPath}" "${txtPath}"`, { encoding: 'utf-8' });
        const textContent = fs.readFileSync(txtPath, 'utf-8');
        
        // 清理臨時檔案
        fs.unlinkSync(pdfPath);
        fs.unlinkSync(txtPath);
        
        console.log(`[PrintFriendlyAgent] Extracted ${textContent.length} characters`);
        return textContent;
      } catch (pdfError) {
        console.warn('[PrintFriendlyAgent] pdftotext failed, trying alternative method');
        
        // 清理臨時檔案
        try { fs.unlinkSync(pdfPath); } catch {}
        try { fs.unlinkSync(txtPath); } catch {}
        
        // 如果 pdftotext 失敗，返回空字串（後續會使用 Vision API）
        return '';
      }
    } catch (error) {
      console.error('[PrintFriendlyAgent] Error extracting text:', error);
      return '';
    }
  }
  
  /**
   * 使用 LLM 分析提取的文字內容
   */
  async analyzeTextContent(textContent: string, originalUrl: string): Promise<AnalysisResult> {
    console.log(`[PrintFriendlyAgent] Analyzing text content (${textContent.length} chars)...`);
    
    if (!textContent || textContent.length < 100) {
      return {
        success: false,
        error: 'Insufficient text content to analyze',
      };
    }
    
    try {
      const systemPrompt = `你是一位專業的旅遊行程分析師。請仔細分析以下從旅遊網站提取的文字內容，提取所有重要的行程資訊。

請以 JSON 格式回傳以下資訊（注意：只回傳 JSON，不要有其他文字）：

{
  "basicInfo": {
    "title": "行程標題",
    "productCode": "產品代碼",
    "description": "行程描述（100-200字）"
  },
  "location": {
    "destinationCountry": "目的地國家（用逗號分隔多個國家）",
    "destinationCity": "目的地城市（用逗號分隔多個城市）",
    "departureCity": "出發城市"
  },
  "duration": {
    "days": 天數（數字）,
    "nights": 夜數（數字）
  },
  "pricing": {
    "basePrice": 基本價格（數字，無貨幣符號）,
    "currency": "貨幣（TWD/USD等）",
    "includes": ["包含項目1", "包含項目2"],
    "excludes": ["不包含項目1", "不包含項目2"]
  },
  "dailyItinerary": [
    {
      "day": 1,
      "title": "Day 1 標題",
      "description": "當日行程描述",
      "highlights": ["景點1", "景點2"],
      "meals": {
        "breakfast": "早餐安排",
        "lunch": "午餐安排",
        "dinner": "晚餐安排"
      },
      "accommodation": "住宿飯店名稱"
    }
  ],
  "highlights": ["行程亮點1", "行程亮點2", "行程亮點3"],
  "hotels": [
    {
      "name": "飯店名稱",
      "rating": "星級（5星/4星等）",
      "location": "位置"
    }
  ],
  "flights": {
    "airline": "航空公司",
    "departureTime": "出發時間",
    "returnTime": "回程時間"
  },
  "notices": ["注意事項1", "注意事項2"]
}

注意：
1. 請仔細閱讀所有文字內容，提取所有可用資訊
2. 如果某些資訊找不到，請填入 null 或空陣列
3. 每日行程請盡量詳細，包含所有景點和活動
4. 價格請只填數字，不要包含貨幣符號或逗號
5. 只回傳 JSON，不要有 markdown 格式或其他文字`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `請分析以下旅遊行程內容，提取所有行程資訊：

來源網址：${originalUrl}

內容：
${textContent.substring(0, 15000)}` // 限制長度避免超過 token 限制
          },
        ],
      });
      
      const content = response.choices[0]?.message?.content;
      let contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      
      // 移除 markdown 格式
      contentStr = contentStr.trim();
      if (contentStr.startsWith("```json")) {
        contentStr = contentStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (contentStr.startsWith("```")) {
        contentStr = contentStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      
      const analysisResult = JSON.parse(contentStr);
      
      console.log("[PrintFriendlyAgent] Analysis completed successfully");
      
      return {
        success: true,
        data: analysisResult,
      };
    } catch (error) {
      console.error("[PrintFriendlyAgent] Error analyzing content:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
  /**
   * 使用 LLM Vision 分析 PDF（當文字提取失敗時的備用方案）
   */
  async analyzePdfWithVision(pdfUrl: string, originalUrl: string): Promise<AnalysisResult> {
    console.log(`[PrintFriendlyAgent] Analyzing PDF with Vision API: ${pdfUrl}`);
    
    try {
      const systemPrompt = `你是一位專業的旅遊行程分析師。請仔細分析這個旅遊行程 PDF 文件，提取所有重要資訊。

請以 JSON 格式回傳以下資訊（注意：只回傳 JSON，不要有其他文字）：

{
  "basicInfo": {
    "title": "行程標題",
    "productCode": "產品代碼",
    "description": "行程描述（100-200字）"
  },
  "location": {
    "destinationCountry": "目的地國家（用逗號分隔多個國家）",
    "destinationCity": "目的地城市（用逗號分隔多個城市）",
    "departureCity": "出發城市"
  },
  "duration": {
    "days": 天數（數字）,
    "nights": 夜數（數字）
  },
  "pricing": {
    "basePrice": 基本價格（數字，無貨幣符號）,
    "currency": "貨幣（TWD/USD等）",
    "includes": ["包含項目1", "包含項目2"],
    "excludes": ["不包含項目1", "不包含項目2"]
  },
  "dailyItinerary": [
    {
      "day": 1,
      "title": "Day 1 標題",
      "description": "當日行程描述",
      "highlights": ["景點1", "景點2"],
      "meals": {
        "breakfast": "早餐安排",
        "lunch": "午餐安排",
        "dinner": "晚餐安排"
      },
      "accommodation": "住宿飯店名稱"
    }
  ],
  "highlights": ["行程亮點1", "行程亮點2", "行程亮點3"],
  "hotels": [
    {
      "name": "飯店名稱",
      "rating": "星級（5星/4星等）",
      "location": "位置"
    }
  ],
  "flights": {
    "airline": "航空公司",
    "departureTime": "出發時間",
    "returnTime": "回程時間"
  },
  "notices": ["注意事項1", "注意事項2"]
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: `請分析以下旅遊行程 PDF 文件，提取所有行程資訊。來源網址：${originalUrl}` },
              {
                type: "file_url",
                file_url: {
                  url: pdfUrl,
                  mime_type: "application/pdf",
                },
              },
            ],
          },
        ],
      });
      
      const content = response.choices[0]?.message?.content;
      let contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      
      // 移除 markdown 格式
      contentStr = contentStr.trim();
      if (contentStr.startsWith("```json")) {
        contentStr = contentStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (contentStr.startsWith("```")) {
        contentStr = contentStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      
      const analysisResult = JSON.parse(contentStr);
      
      console.log("[PrintFriendlyAgent] Vision analysis completed successfully");
      
      return {
        success: true,
        data: analysisResult,
      };
    } catch (error) {
      console.error("[PrintFriendlyAgent] Error in Vision analysis:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
  /**
   * 完整流程：轉換 PDF → 提取文字 → 分析內容
   */
  async execute(url: string): Promise<AnalysisResult> {
    console.log(`[PrintFriendlyAgent] Starting full execution for: ${url}`);
    
    try {
      // 步驟 1: 將網頁轉換為 PDF
      const pdfResult = await this.convertToPdf(url);
      
      if (!pdfResult.success || !pdfResult.pdfUrl) {
        return {
          success: false,
          error: pdfResult.error || 'Failed to convert URL to PDF',
        };
      }
      
      // 步驟 2: 提取 PDF 文字內容
      const textContent = await this.extractTextFromPdf(pdfResult.pdfUrl);
      
      // 步驟 3: 分析內容
      if (textContent && textContent.length > 500) {
        // 如果成功提取文字，使用文字分析
        console.log('[PrintFriendlyAgent] Using text-based analysis');
        return await this.analyzeTextContent(textContent, url);
      } else {
        // 如果文字提取失敗，使用 Vision API 分析 PDF
        console.log('[PrintFriendlyAgent] Text extraction insufficient, using Vision API');
        return await this.analyzePdfWithVision(pdfResult.pdfUrl, url);
      }
    } catch (error) {
      console.error("[PrintFriendlyAgent] Error in execution:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// 導出單例
export const printFriendlyAgent = new PrintFriendlyAgent();
