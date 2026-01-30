/**
 * PDF Parser Agent
 * 使用 LLM Vision 解析 PDF 內容，並從 PDF 中提取圖片
 */

import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";
import { randomBytes } from "crypto";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

export interface PdfParseResult {
  title: string;
  subtitle: string;
  productCode: string;
  departureDate: string;
  duration: number;
  price: number;
  priceNote: string;
  destinations: string[];
  country: string;
  highlights: string[];
  dailyItinerary: DailyItinerary[];
  costDetails: CostDetails;
  notices: NoticeDetails;
  hotelInfo: HotelInfo[];
  images: ExtractedImage[];
  rawContent: string;
}

interface DailyItinerary {
  day: number;
  title: string;
  description: string;
  activities: Activity[];
  meals: { breakfast: string; lunch: string; dinner: string };
  hotel: string;
}

interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  transportation: string;
}

interface CostDetails {
  included: string[];
  excluded: string[];
  extras: { name: string; price: string }[];
  notes: string;
}

interface NoticeDetails {
  beforeTrip: string[];
  cultural: string[];
  healthSafety: string[];
  emergency: string[];
}

interface HotelInfo {
  name: string;
  description: string;
  imageUrl?: string;
}

interface ExtractedImage {
  url: string;
  description: string;
  page: number;
  type: "hero" | "feature" | "hotel" | "activity" | "other";
}

/**
 * 將 PDF 轉換為圖片（每頁一張）
 */
async function convertPdfToImages(pdfPath: string): Promise<string[]> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "pdf-"));
  const outputPattern = path.join(tempDir, "page");
  
  try {
    // 使用 pdftoppm（poppler-utils 的一部分）將 PDF 轉換為 PNG
    await execAsync(`pdftoppm -png -r 150 "${pdfPath}" "${outputPattern}"`);
    
    // 讀取生成的圖片檔案
    const files = await fs.readdir(tempDir);
    const imageFiles = files
      .filter(f => f.endsWith(".png"))
      .sort()
      .map(f => path.join(tempDir, f));
    
    console.log(`[PdfParserAgent] Converted PDF to ${imageFiles.length} images`);
    return imageFiles;
  } catch (error) {
    console.error("[PdfParserAgent] PDF to image conversion failed:", error);
    throw new Error("Failed to convert PDF to images");
  }
}

/**
 * 從 PDF 中提取嵌入的圖片
 */
async function extractImagesFromPdf(pdfPath: string): Promise<string[]> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "pdf-images-"));
  
  try {
    // 使用 pdfimages（poppler-utils 的一部分）提取圖片
    await execAsync(`pdfimages -png "${pdfPath}" "${path.join(tempDir, "img")}"`);
    
    // 讀取提取的圖片檔案
    const files = await fs.readdir(tempDir);
    const imageFiles = files
      .filter(f => f.endsWith(".png"))
      .sort()
      .map(f => path.join(tempDir, f));
    
    console.log(`[PdfParserAgent] Extracted ${imageFiles.length} images from PDF`);
    return imageFiles;
  } catch (error) {
    console.error("[PdfParserAgent] Image extraction failed:", error);
    return []; // 提取失敗不是致命錯誤
  }
}

/**
 * 將本地圖片上傳到 S3
 */
async function uploadImageToS3(imagePath: string, prefix: string): Promise<string> {
  const buffer = await fs.readFile(imagePath);
  const randomSuffix = randomBytes(8).toString("hex");
  const fileName = `${prefix}-${Date.now()}-${randomSuffix}.png`;
  const fileKey = `pdf-extracted/${fileName}`;
  
  const { url } = await storagePut(fileKey, buffer, "image/png");
  return url;
}

/**
 * 使用 LLM Vision 分析 PDF 頁面內容
 */
async function analyzePageWithVision(
  imageBase64: string,
  pageNumber: number,
  totalPages: number
): Promise<any> {
  const prompt = `你是一位專業的旅遊行程分析師。請仔細分析這張旅遊行程 PDF 的第 ${pageNumber}/${totalPages} 頁圖片，並提取所有相關資訊。

## 特別注意（雄獅旅遊 PDF 格式）：
- 價格通常在頁面右上角或標題下方，格式如：NT$ 18,000、$24,000 等
- 每日行程通常以「DAY 1」、「第一天」、「第1天」開頭
- 行程中的景點、餐廳、飯店通常有粗體標題
- 注意提取筐頭後的文字內容，這些是行程亮點

請以 JSON 格式回傳以下資訊（只回傳在這一頁中找到的資訊，沒有的欄位請省略）：

{
  "pageType": "cover|features|itinerary|hotel|cost|notice|other",
  "title": "行程標題（通常在封面或頁首，如：縱谷旬味山嵐號）",
  "subtitle": "行程副標題",
  "productCode": "產品代碼",
  "departureDate": "出發日期",
  "duration": 天數（數字，如 2天1夜 → 2）,
  "price": 價格（數字，如 NT$18,000 → 18000，注意看清楚每個數字）,
  "priceNote": "價格備註（如：每人費用、不含機票等）",
  "destinations": ["目的地1", "目的地2"],
  "country": "國家（如：台灣、日本、馬來西亞）",
  "highlights": ["行程亮點1", "行程亮點2"],
  "dailyItinerary": [{
    "day": 1,
    "title": "第一天標題（如：台北→台東）",
    "description": "當天行程總覽",
    "activities": [{
      "time": "08:00",
      "title": "活動/景點名稱",
      "description": "詳細描述（越詳細越好）",
      "location": "地點",
      "transportation": "交通方式"
    }],
    "meals": { "breakfast": "早餐內容", "lunch": "午餐內容", "dinner": "晚餐內容" },
    "hotel": "住宿飯店名稱"
  }],
  "costIncluded": ["費用包含項目1", "費用包含項目2"],
  "costExcluded": ["費用不包含項目1"],
  "notices": ["注意事項1", "注意事項2"],
  "hotelInfo": [{
    "name": "飯店名稱",
    "description": "飯店描述"
  }],
  "imageDescriptions": [
    { "description": "圖片描述", "type": "hero|feature|hotel|activity|other" }
  ]
}

## 重要提取規則：
1. 只回傳 JSON，不要有其他文字
2. **價格提取**：仔細尋找 NT$、$、元 等價格標記，轉換為純數字（例如 NT$18,000 → 18000）
3. **天數提取**：尋找「X天Y夜」、「X日」等格式，轉換為數字
4. **每日行程**：這是最重要的部分！請仔細閱讀每一天的內容，包括：
   - 每個景點/活動的名稱和描述
   - 餐食安排（早、中、晚餐）
   - 住宿飯店
5. **圖片描述**：描述頁面中的圖片內容，這些將用於行程展示`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${imageBase64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const rawContent = response.choices[0]?.message?.content || "{}";
    const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
    return JSON.parse(content);
  } catch (error) {
    console.error(`[PdfParserAgent] Vision analysis failed for page ${pageNumber}:`, error);
    return {};
  }
}

/**
 * 合併多頁分析結果
 */
function mergePageResults(pageResults: any[]): Partial<PdfParseResult> {
  const merged: Partial<PdfParseResult> = {
    title: "",
    subtitle: "",
    productCode: "",
    departureDate: "",
    duration: 0,
    price: 0,
    priceNote: "",
    destinations: [],
    country: "",
    highlights: [],
    dailyItinerary: [],
    costDetails: { included: [], excluded: [], extras: [], notes: "" },
    notices: { beforeTrip: [], cultural: [], healthSafety: [], emergency: [] },
    hotelInfo: [],
    images: [],
    rawContent: "",
  };

  for (const page of pageResults) {
    // 合併基本資訊（取第一個非空值）
    if (!merged.title && page.title) merged.title = page.title;
    if (!merged.subtitle && page.subtitle) merged.subtitle = page.subtitle;
    if (!merged.productCode && page.productCode) merged.productCode = page.productCode;
    if (!merged.departureDate && page.departureDate) merged.departureDate = page.departureDate;
    if (!merged.duration && page.duration) merged.duration = page.duration;
    if (!merged.price && page.price) merged.price = page.price;
    if (!merged.priceNote && page.priceNote) merged.priceNote = page.priceNote;
    if (!merged.country && page.country) merged.country = page.country;

    // 合併陣列資訊
    if (page.destinations) {
      merged.destinations = Array.from(new Set([...merged.destinations!, ...page.destinations]));
    }
    if (page.highlights) {
      merged.highlights = Array.from(new Set([...merged.highlights!, ...page.highlights]));
    }

    // 合併每日行程
    if (page.dailyItinerary && Array.isArray(page.dailyItinerary)) {
      for (const day of page.dailyItinerary) {
        const existingDay = merged.dailyItinerary!.find(d => d.day === day.day);
        if (existingDay) {
          // 合併同一天的活動
          if (day.activities) {
            existingDay.activities = [...existingDay.activities, ...day.activities];
          }
          if (day.description && !existingDay.description) {
            existingDay.description = day.description;
          }
        } else {
          merged.dailyItinerary!.push({
            day: day.day,
            title: day.title || `第 ${day.day} 天`,
            description: day.description || "",
            activities: day.activities || [],
            meals: day.meals || { breakfast: "", lunch: "", dinner: "" },
            hotel: day.hotel || "",
          });
        }
      }
    }

    // 合併費用資訊
    if (page.costIncluded) {
      merged.costDetails!.included = Array.from(new Set([...merged.costDetails!.included, ...page.costIncluded]));
    }
    if (page.costExcluded) {
      merged.costDetails!.excluded = Array.from(new Set([...merged.costDetails!.excluded, ...page.costExcluded]));
    }

    // 合併注意事項
    if (page.notices) {
      merged.notices!.beforeTrip = Array.from(new Set([...merged.notices!.beforeTrip, ...page.notices]));
    }

    // 合併飯店資訊
    if (page.hotelInfo && Array.isArray(page.hotelInfo)) {
      for (const hotel of page.hotelInfo) {
        if (!merged.hotelInfo!.find(h => h.name === hotel.name)) {
          merged.hotelInfo!.push(hotel);
        }
      }
    }
  }

  // 排序每日行程
  merged.dailyItinerary!.sort((a, b) => a.day - b.day);

  return merged;
}

/**
 * 主要解析函數 - 解析 PDF 並返回結構化資料
 */
export async function parsePdf(pdfUrl: string): Promise<PdfParseResult> {
  console.log(`[PdfParserAgent] Starting PDF parsing: ${pdfUrl}`);
  const startTime = Date.now();

  // 下載 PDF 到臨時目錄
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "pdf-parse-"));
  const pdfPath = path.join(tempDir, "document.pdf");

  try {
    // 下載 PDF
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.status}`);
    }
    const pdfBuffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(pdfPath, pdfBuffer);
    console.log(`[PdfParserAgent] Downloaded PDF: ${pdfBuffer.length} bytes`);

    // 將 PDF 轉換為圖片
    const pageImages = await convertPdfToImages(pdfPath);
    console.log(`[PdfParserAgent] Converted to ${pageImages.length} page images`);

    // 從 PDF 中提取嵌入的圖片
    const extractedImages = await extractImagesFromPdf(pdfPath);
    console.log(`[PdfParserAgent] Extracted ${extractedImages.length} embedded images`);

    // 使用 LLM Vision 分析每一頁
    const pageResults: any[] = [];
    for (let i = 0; i < pageImages.length; i++) {
      const imageBuffer = await fs.readFile(pageImages[i]);
      const imageBase64 = imageBuffer.toString("base64");
      
      console.log(`[PdfParserAgent] Analyzing page ${i + 1}/${pageImages.length}...`);
      const result = await analyzePageWithVision(imageBase64, i + 1, pageImages.length);
      result.pageNumber = i + 1;
      pageResults.push(result);
    }

    // 合併所有頁面的分析結果
    const mergedResult = mergePageResults(pageResults);

    // 上傳提取的圖片到 S3
    const uploadedImages: ExtractedImage[] = [];
    
    // 上傳頁面圖片（用於備用）
    for (let i = 0; i < Math.min(pageImages.length, 3); i++) {
      try {
        const url = await uploadImageToS3(pageImages[i], `page-${i + 1}`);
        uploadedImages.push({
          url,
          description: `PDF 第 ${i + 1} 頁`,
          page: i + 1,
          type: i === 0 ? "hero" : "feature",
        });
      } catch (error) {
        console.error(`[PdfParserAgent] Failed to upload page ${i + 1} image:`, error);
      }
    }

    // 上傳提取的嵌入圖片
    for (let i = 0; i < extractedImages.length; i++) {
      try {
        // 檢查圖片大小，只上傳較大的圖片（可能是有意義的內容圖片）
        const stats = await fs.stat(extractedImages[i]);
        if (stats.size > 10000) { // 大於 10KB
          const url = await uploadImageToS3(extractedImages[i], `extracted-${i}`);
          uploadedImages.push({
            url,
            description: `提取的圖片 ${i + 1}`,
            page: 0,
            type: "feature",
          });
        }
      } catch (error) {
        console.error(`[PdfParserAgent] Failed to upload extracted image ${i}:`, error);
      }
    }

    // 清理臨時檔案
    try {
      await fs.rm(tempDir, { recursive: true });
      for (const img of pageImages) {
        await fs.rm(path.dirname(img), { recursive: true }).catch(() => {});
      }
    } catch (error) {
      console.error("[PdfParserAgent] Cleanup error:", error);
    }

    const result: PdfParseResult = {
      title: mergedResult.title || "未命名行程",
      subtitle: mergedResult.subtitle || "",
      productCode: mergedResult.productCode || "",
      departureDate: mergedResult.departureDate || "",
      duration: mergedResult.duration || 1,
      price: mergedResult.price || 0,
      priceNote: mergedResult.priceNote || "",
      destinations: mergedResult.destinations || [],
      country: mergedResult.country || "台灣",
      highlights: mergedResult.highlights || [],
      dailyItinerary: mergedResult.dailyItinerary || [],
      costDetails: mergedResult.costDetails || { included: [], excluded: [], extras: [], notes: "" },
      notices: mergedResult.notices || { beforeTrip: [], cultural: [], healthSafety: [], emergency: [] },
      hotelInfo: mergedResult.hotelInfo || [],
      images: uploadedImages,
      rawContent: JSON.stringify(pageResults, null, 2),
    };

    const elapsed = Date.now() - startTime;
    console.log(`[PdfParserAgent] PDF parsing completed in ${elapsed}ms`);
    console.log(`[PdfParserAgent] Result: ${result.title}, ${result.duration} days, ${result.images.length} images`);

    return result;
  } catch (error) {
    console.error("[PdfParserAgent] PDF parsing failed:", error);
    throw error;
  }
}

/**
 * 從本地檔案解析 PDF
 */
export async function parsePdfFromFile(filePath: string): Promise<PdfParseResult> {
  // 讀取檔案並上傳到 S3，然後調用 parsePdf
  const buffer = await fs.readFile(filePath);
  const randomSuffix = randomBytes(8).toString("hex");
  const fileName = `temp-${Date.now()}-${randomSuffix}.pdf`;
  const fileKey = `pdf-uploads/${fileName}`;
  
  const { url } = await storagePut(fileKey, buffer, "application/pdf");
  return parsePdf(url);
}


/**
 * PdfParserAgent class - 包裝 parsePdf 函數以符合 Agent 介面
 */
export class PdfParserAgent {
  async execute(pdfUrl: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      console.log("[PdfParserAgent] Executing PDF parsing...");
      const result = await parsePdf(pdfUrl);
      
      // 將 PdfParseResult 轉換為 WebScraperAgent 相容的格式
      // 確保資料結構與 WebScraperAgent 完全一致
      const destinationCity = result.destinations?.join(', ') || '';
      const destinationCountry = result.country || '台灣';
      const days = result.duration || 1;
      const nights = days > 1 ? days - 1 : 0;
      
      const webScraperCompatibleData = {
        // basicInfo - 與 WebScraperAgent 相同的結構
        basicInfo: {
          title: result.title || '未命名行程',
          subtitle: result.subtitle || '',
          description: result.subtitle || '',
          productCode: result.productCode || '',
        },
        // location - 與 WebScraperAgent 相同的結構
        location: {
          destinationCountry,
          destinationCity,
        },
        // duration - 與 WebScraperAgent 相同的結構
        duration: {
          days,
          nights,
        },
        // pricing - 與 WebScraperAgent 相同的結構
        pricing: {
          price: result.price || 0,
          basePrice: result.price || 0,
          currency: 'TWD',
          priceNote: result.priceNote || '',
        },
        // highlights - 行程亮點
        highlights: result.highlights || [],
        // dailyItinerary - 每日行程（轉換為 WebScraperAgent 格式）
        dailyItinerary: (result.dailyItinerary || []).map((day: any) => ({
          day: day.day,
          title: day.title || `第 ${day.day} 天`,
          activities: (day.activities || []).map((act: any) => ({
            time: act.time || '',
            title: act.title || '',
            description: act.description || '',
            location: act.location || '',
            transportation: act.transportation || '',
          })),
          meals: {
            breakfast: day.meals?.breakfast || '',
            lunch: day.meals?.lunch || '',
            dinner: day.meals?.dinner || '',
          },
          accommodation: day.hotel || '',
        })),
        // includes/excludes - 費用包含/不包含
        includes: result.costDetails?.included || [],
        excludes: result.costDetails?.excluded || [],
        // accommodation - 住宿資訊
        accommodation: (result.hotelInfo || []).map((hotel: any) => hotel.name),
        // hotels - 飯店詳細資訊
        hotels: (result.hotelInfo || []).map((hotel: any) => ({
          name: hotel.name || '',
          description: hotel.description || '',
          imageUrl: hotel.imageUrl || '',
        })),
        // meals - 餐食資訊
        meals: [],
        // flights - 航班資訊
        flights: [],
        // notices - 注意事項
        notices: result.notices?.beforeTrip || [],
        // images - 提取的圖片
        images: result.images || [],
        // 原始資料
        rawContent: result.rawContent,
        // PDF 來源標記
        sourceUrl: pdfUrl,
        isPdfSource: true,
      };
      
      return {
        success: true,
        data: webScraperCompatibleData,
      };
    } catch (error) {
      console.error("[PdfParserAgent] Execution failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "PDF parsing failed",
      };
    }
  }
}
