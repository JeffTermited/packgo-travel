// PDF generation using Puppeteer
// Generates tour itinerary PDFs from HTML templates

import puppeteer, { type Browser, type Page } from 'puppeteer';
import { storagePut } from './storage';

export interface TourPdfData {
  id: number;
  title: string;
  subtitle?: string;
  days: number;
  nights?: number;
  destinations: string[];
  price?: number;
  currency?: string;
  heroImage?: string;
  description?: string;
  highlights?: string[];
  itinerary?: Array<{
    day: number;
    title: string;
    subtitle?: string;
    activities?: Array<{
      time?: string;
      title: string;
      description?: string;
      location?: string;
    }>;
    meals?: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
    };
    accommodation?: string;
  }>;
  inclusions?: string[];
  exclusions?: string[];
  notes?: string[];
  colorTheme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const DEFAULT_COLOR_THEME = {
  primary: '#1A1A1A',
  secondary: '#F5F5F5',
  accent: '#E63946',
};

/**
 * Generate HTML template for PDF
 */
function generatePdfHtml(data: TourPdfData): string {
  const theme = data.colorTheme || DEFAULT_COLOR_THEME;
  const destinations = data.destinations.join(' / ');
  const daysNights = data.nights 
    ? `${data.days} 天 ${data.nights} 夜` 
    : `${data.days} 天`;

  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - 行程表</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans TC', 'Microsoft JhengHei', sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: ${theme.primary};
      background: white;
    }
    
    .page {
      padding: 40px;
      page-break-after: always;
    }
    
    .page:last-child {
      page-break-after: auto;
    }
    
    /* Header */
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid ${theme.accent};
    }
    
    .header h1 {
      font-size: 28pt;
      font-weight: bold;
      color: ${theme.primary};
      margin-bottom: 10px;
    }
    
    .header .subtitle {
      font-size: 14pt;
      color: #666;
      margin-bottom: 15px;
    }
    
    .header .meta {
      display: flex;
      justify-content: center;
      gap: 30px;
      font-size: 11pt;
      color: #666;
    }
    
    .header .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    /* Hero Image */
    .hero-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    
    /* Section */
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 18pt;
      font-weight: bold;
      color: ${theme.primary};
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid ${theme.accent};
    }
    
    .section-content {
      padding-left: 10px;
    }
    
    /* Description */
    .description {
      text-align: justify;
      line-height: 1.8;
      margin-bottom: 20px;
    }
    
    /* Highlights */
    .highlights-list {
      list-style: none;
      padding: 0;
    }
    
    .highlights-list li {
      padding: 8px 0 8px 25px;
      position: relative;
      line-height: 1.6;
    }
    
    .highlights-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: ${theme.accent};
      font-weight: bold;
      font-size: 14pt;
    }
    
    /* Itinerary */
    .day-block {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    
    .day-header {
      background: ${theme.accent};
      color: white;
      padding: 12px 15px;
      border-radius: 6px 6px 0 0;
      font-weight: bold;
      font-size: 14pt;
    }
    
    .day-content {
      border: 1px solid #ddd;
      border-top: none;
      padding: 15px;
      border-radius: 0 0 6px 6px;
    }
    
    .day-subtitle {
      color: #666;
      font-size: 11pt;
      margin-bottom: 12px;
    }
    
    .activity {
      margin-bottom: 15px;
      padding-left: 15px;
      border-left: 3px solid ${theme.accent};
    }
    
    .activity-time {
      font-weight: bold;
      color: ${theme.accent};
      font-size: 10pt;
    }
    
    .activity-title {
      font-weight: bold;
      font-size: 12pt;
      margin: 5px 0;
    }
    
    .activity-description {
      color: #555;
      font-size: 10pt;
      line-height: 1.5;
    }
    
    .activity-location {
      color: #888;
      font-size: 9pt;
      font-style: italic;
      margin-top: 3px;
    }
    
    .day-info {
      display: flex;
      gap: 30px;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px dashed #ddd;
      font-size: 10pt;
    }
    
    .day-info-item {
      flex: 1;
    }
    
    .day-info-label {
      font-weight: bold;
      color: ${theme.primary};
      margin-bottom: 5px;
    }
    
    .day-info-value {
      color: #666;
    }
    
    /* Lists */
    .info-list {
      list-style: none;
      padding: 0;
    }
    
    .info-list li {
      padding: 6px 0 6px 20px;
      position: relative;
      line-height: 1.5;
    }
    
    .info-list li:before {
      content: "•";
      position: absolute;
      left: 0;
      color: ${theme.accent};
      font-weight: bold;
    }
    
    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      font-size: 9pt;
      color: #888;
    }
    
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <!-- Page 1: Cover & Overview -->
  <div class="page">
    <div class="header">
      <h1>${data.title}</h1>
      ${data.subtitle ? `<div class="subtitle">${data.subtitle}</div>` : ''}
      <div class="meta">
        <div class="meta-item">📍 ${destinations}</div>
        <div class="meta-item">📅 ${daysNights}</div>
        ${data.price ? `<div class="meta-item">💰 ${data.currency || 'NT$'} ${data.price.toLocaleString()}</div>` : ''}
      </div>
    </div>
    
    ${data.heroImage ? `<img src="${data.heroImage}" alt="${data.title}" class="hero-image" />` : ''}
    
    ${data.description ? `
    <div class="section">
      <h2 class="section-title">行程簡介</h2>
      <div class="section-content">
        <p class="description">${data.description}</p>
      </div>
    </div>
    ` : ''}
    
    ${data.highlights && data.highlights.length > 0 ? `
    <div class="section">
      <h2 class="section-title">行程亮點</h2>
      <div class="section-content">
        <ul class="highlights-list">
          ${data.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
      </div>
    </div>
    ` : ''}
  </div>
  
  <!-- Page 2+: Daily Itinerary -->
  ${data.itinerary && data.itinerary.length > 0 ? `
  <div class="page">
    <div class="section">
      <h2 class="section-title">每日行程</h2>
      <div class="section-content">
        ${data.itinerary.map(day => `
        <div class="day-block">
          <div class="day-header">
            第 ${day.day} 天 - ${day.title}
          </div>
          <div class="day-content">
            ${day.subtitle ? `<div class="day-subtitle">${day.subtitle}</div>` : ''}
            
            ${day.activities && day.activities.length > 0 ? `
            <div class="activities">
              ${day.activities.map(act => `
              <div class="activity">
                ${act.time ? `<div class="activity-time">${act.time}</div>` : ''}
                <div class="activity-title">${act.title}</div>
                ${act.description ? `<div class="activity-description">${act.description}</div>` : ''}
                ${act.location ? `<div class="activity-location">📍 ${act.location}</div>` : ''}
              </div>
              `).join('')}
            </div>
            ` : ''}
            
            <div class="day-info">
              ${day.meals ? `
              <div class="day-info-item">
                <div class="day-info-label">🍽️ 餐食</div>
                <div class="day-info-value">
                  ${day.meals.breakfast ? `早餐: ${day.meals.breakfast}<br/>` : ''}
                  ${day.meals.lunch ? `午餐: ${day.meals.lunch}<br/>` : ''}
                  ${day.meals.dinner ? `晚餐: ${day.meals.dinner}` : ''}
                </div>
              </div>
              ` : ''}
              
              ${day.accommodation ? `
              <div class="day-info-item">
                <div class="day-info-label">🏨 住宿</div>
                <div class="day-info-value">${day.accommodation}</div>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </div>
  ` : ''}
  
  <!-- Page N: Inclusions & Exclusions -->
  ${(data.inclusions && data.inclusions.length > 0) || (data.exclusions && data.exclusions.length > 0) ? `
  <div class="page">
    ${data.inclusions && data.inclusions.length > 0 ? `
    <div class="section">
      <h2 class="section-title">費用包含</h2>
      <div class="section-content">
        <ul class="info-list">
          ${data.inclusions.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>
    ` : ''}
    
    ${data.exclusions && data.exclusions.length > 0 ? `
    <div class="section">
      <h2 class="section-title">費用不包含</h2>
      <div class="section-content">
        <ul class="info-list">
          ${data.exclusions.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>
    ` : ''}
  </div>
  ` : ''}
  
  <!-- Page N+1: Notes -->
  ${data.notes && data.notes.length > 0 ? `
  <div class="page">
    <div class="section">
      <h2 class="section-title">注意事項</h2>
      <div class="section-content">
        <ul class="info-list">
          ${data.notes.map(note => `<li>${note}</li>`).join('')}
        </ul>
      </div>
    </div>
  </div>
  ` : ''}
  
  <div class="footer">
    <p>本行程表由 PACK&GO 旅行社提供</p>
    <p>如有任何疑問，請聯繫我們的客服團隊</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate PDF from tour data
 * @param data - Tour data
 * @returns Buffer containing the PDF
 */
export async function generateTourPdf(data: TourPdfData): Promise<Buffer> {
  let browser: Browser | null = null;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
    
    const page: Page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({
      width: 1200,
      height: 1600,
    });
    
    // Generate HTML
    const html = generatePdfHtml(data);
    
    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });
    
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('[PDF Generator] Error generating PDF:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate PDF and upload to S3
 * @param data - Tour data
 * @param storageKey - S3 storage key (e.g., "tours/123/itinerary.pdf")
 * @returns URL of the uploaded PDF
 */
export async function generateAndUploadTourPdf(
  data: TourPdfData,
  storageKey: string
): Promise<string> {
  console.log(`[PDF Generator] Generating PDF for tour ${data.id}...`);
  
  const startTime = Date.now();
  const pdfBuffer = await generateTourPdf(data);
  const duration = Date.now() - startTime;
  
  console.log(`[PDF Generator] PDF generated in ${duration}ms, size: ${pdfBuffer.length} bytes`);
  
  // Upload to S3
  const { url } = await storagePut(storageKey, pdfBuffer, 'application/pdf');
  
  console.log(`[PDF Generator] PDF uploaded to: ${url}`);
  
  return url;
}
