/**
 * Price Agent
 * 使用 Puppeteer 抓取動態載入的價格資訊
 */

import puppeteer, { Browser, Page } from "puppeteer";

export interface PriceAgentResult {
  success: boolean;
  data?: {
    price: number;
    priceUnit: string;
    currency: string;
    originalPriceText: string;
    availableSeats?: number;
    departureDates?: Array<{
      date: string;
      price: number;
      status: string;
    }>;
  };
  error?: string;
}

/**
 * Price Agent
 * 專門用於抓取動態載入的價格資訊
 */
export class PriceAgent {
  private browser: Browser | null = null;

  /**
   * 初始化瀏覽器
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      console.log("[PriceAgent] Launching browser...");
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1920x1080",
        ],
      });
    }
    return this.browser;
  }

  /**
   * 關閉瀏覽器
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * 執行價格抓取
   */
  async execute(url: string): Promise<PriceAgentResult> {
    console.log("[PriceAgent] Starting price extraction for URL:", url);

    let page: Page | null = null;

    try {
      const browser = await this.initBrowser();
      page = await browser.newPage();

      // 設置 viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // 設置 User-Agent
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // 訪問頁面
      console.log("[PriceAgent] Navigating to URL...");
      try {
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
      } catch (navError) {
        console.warn("[PriceAgent] Initial navigation timeout, trying with load event...");
        // 如果 domcontentloaded 超時，嘗試使用 load 事件
        await page.goto(url, {
          waitUntil: "load",
          timeout: 60000,
        });
      }

      // 等待頁面完全載入
      console.log("[PriceAgent] Waiting for page to fully load...");
      await page.waitForSelector("body", { timeout: 10000 });

      // 額外等待以確保動態內容載入
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 嘗試多種方式提取價格
      const priceData = await this.extractPrice(page, url);

      if (page) {
        await page.close();
      }

      if (priceData.price > 0) {
        console.log("[PriceAgent] Price extracted successfully:", priceData);
        return {
          success: true,
          data: priceData,
        };
      } else {
        console.warn("[PriceAgent] Could not extract price from page");
        return {
          success: false,
          error: "無法從頁面中提取價格資訊",
        };
      }
    } catch (error) {
      console.error("[PriceAgent] Error:", error);

      if (page) {
        try {
          await page.close();
        } catch (e) {
          // Ignore close error
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * 從頁面中提取價格
   */
  private async extractPrice(
    page: Page,
    url: string
  ): Promise<{
    price: number;
    priceUnit: string;
    currency: string;
    originalPriceText: string;
    availableSeats?: number;
    departureDates?: Array<{
      date: string;
      price: number;
      status: string;
    }>;
  }> {
    let price = 0;
    let priceUnit = "人/起";
    let currency = "TWD";
    let originalPriceText = "";
    let availableSeats: number | undefined;
    const departureDates: Array<{
      date: string;
      price: number;
      status: string;
    }> = [];

    // 根據不同網站使用不同的提取策略
    if (url.includes("liontravel.com")) {
      const result = await this.extractLionTravelPrice(page);
      price = result.price;
      originalPriceText = result.originalPriceText;
      if (result.departureDates) {
        departureDates.push(...result.departureDates);
      }
    } else if (url.includes("colatour.com.tw")) {
      const result = await this.extractColatourPrice(page);
      price = result.price;
      originalPriceText = result.originalPriceText;
    } else if (url.includes("eztravel.com.tw")) {
      const result = await this.extractEzTravelPrice(page);
      price = result.price;
      originalPriceText = result.originalPriceText;
    } else {
      // 通用價格提取
      const result = await this.extractGenericPrice(page);
      price = result.price;
      originalPriceText = result.originalPriceText;
    }

    return {
      price,
      priceUnit,
      currency,
      originalPriceText,
      availableSeats,
      departureDates: departureDates.length > 0 ? departureDates : undefined,
    };
  }

  /**
   * 雄獅旅遊價格提取
   */
  private async extractLionTravelPrice(page: Page): Promise<{
    price: number;
    originalPriceText: string;
    departureDates?: Array<{
      date: string;
      price: number;
      status: string;
    }>;
  }> {
    console.log("[PriceAgent] Extracting Lion Travel price...");

    let price = 0;
    let originalPriceText = "";
    const departureDates: Array<{
      date: string;
      price: number;
      status: string;
    }> = [];

    try {
      // 方法 1: 從日曆中提取價格
      const calendarPrices = await page.evaluate(() => {
        const prices: Array<{
          date: string;
          price: number;
          status: string;
          text: string;
        }> = [];

        // 尋找日曆中的價格元素
        const calendarCells = document.querySelectorAll(
          '[class*="calendar"], [class*="date"], [class*="price"]'
        );
        calendarCells.forEach((cell) => {
          const text = cell.textContent || "";
          // 匹配價格模式：數字,數字 或 數字
          const priceMatch = text.match(/(\d{1,3}(?:,\d{3})*)/g);
          if (priceMatch) {
            priceMatch.forEach((p) => {
              const numPrice = parseInt(p.replace(/,/g, ""), 10);
              // 過濾掉太小的數字（可能是日期）
              if (numPrice > 10000) {
                prices.push({
                  date: "",
                  price: numPrice,
                  status: text.includes("額滿")
                    ? "full"
                    : text.includes("成行")
                      ? "confirmed"
                      : "available",
                  text: text.trim(),
                });
              }
            });
          }
        });

        return prices;
      });

      if (calendarPrices.length > 0) {
        // 取最低價格
        const lowestPrice = calendarPrices.reduce((min, p) =>
          p.price < min.price ? p : min
        );
        price = lowestPrice.price;
        originalPriceText = lowestPrice.text;
        departureDates.push(
          ...calendarPrices.map((p) => ({
            date: p.date,
            price: p.price,
            status: p.status,
          }))
        );
        console.log(
          "[PriceAgent] Found price from calendar:",
          price,
          "Original text:",
          originalPriceText
        );
      }

      // 方法 2: 從頁面文字中提取價格
      if (price === 0) {
        const pageText = await page.evaluate(() => document.body.innerText);

        // 尋找價格模式：NT$ 數字 或 數字 元
        const pricePatterns = [
          /NT\$?\s*(\d{1,3}(?:,\d{3})*)/gi,
          /(\d{1,3}(?:,\d{3})*)\s*元/gi,
          /(\d{1,3}(?:,\d{3})*)\s*起/gi,
          /成行\s*(\d{1,3}(?:,\d{3})*)/gi,
          /售價[：:]\s*(\d{1,3}(?:,\d{3})*)/gi,
          /團費[：:]\s*(\d{1,3}(?:,\d{3})*)/gi,
        ];

        for (const pattern of pricePatterns) {
          let match;
          while ((match = pattern.exec(pageText)) !== null) {
            const numPrice = parseInt(match[1].replace(/,/g, ""), 10);
            // 過濾合理的價格範圍（10,000 - 1,000,000）
            if (numPrice >= 10000 && numPrice <= 1000000) {
              if (price === 0 || numPrice < price) {
                price = numPrice;
                originalPriceText = match[0];
              }
            }
          }
        }

        if (price > 0) {
          console.log(
            "[PriceAgent] Found price from page text:",
            price,
            "Original text:",
            originalPriceText
          );
        }
      }

      // 方法 3: 從特定元素中提取
      if (price === 0) {
        const specificPrice = await page.evaluate(() => {
          // 尋找常見的價格容器
          const priceSelectors = [
            ".price",
            ".tour-price",
            ".product-price",
            '[class*="price"]',
            '[data-price]',
            ".amount",
            ".cost",
          ];

          for (const selector of priceSelectors) {
            const elements = document.querySelectorAll(selector);
            for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
              const text = el.textContent || "";
              const match = text.match(/(\d{1,3}(?:,\d{3})*)/);
              if (match) {
                const numPrice = parseInt(match[1].replace(/,/g, ""), 10);
                if (numPrice >= 10000 && numPrice <= 1000000) {
                  return { price: numPrice, text: text.trim() };
                }
              }
            }
          }

          return null;
        });

        if (specificPrice) {
          price = specificPrice.price;
          originalPriceText = specificPrice.text;
          console.log(
            "[PriceAgent] Found price from specific element:",
            price
          );
        }
      }
    } catch (error) {
      console.error("[PriceAgent] Error extracting Lion Travel price:", error);
    }

    return {
      price,
      originalPriceText,
      departureDates: departureDates.length > 0 ? departureDates : undefined,
    };
  }

  /**
   * 可樂旅遊價格提取
   */
  private async extractColatourPrice(page: Page): Promise<{
    price: number;
    originalPriceText: string;
  }> {
    console.log("[PriceAgent] Extracting Colatour price...");

    let price = 0;
    let originalPriceText = "";

    try {
      const result = await page.evaluate(() => {
        // 可樂旅遊的價格通常在特定元素中
        const priceElement = document.querySelector(
          '.price, .tour-price, [class*="price"]'
        );
        if (priceElement) {
          const text = priceElement.textContent || "";
          const match = text.match(/(\d{1,3}(?:,\d{3})*)/);
          if (match) {
            return {
              price: parseInt(match[1].replace(/,/g, ""), 10),
              text: text.trim(),
            };
          }
        }
        return null;
      });

      if (result) {
        price = result.price;
        originalPriceText = result.text;
      }
    } catch (error) {
      console.error("[PriceAgent] Error extracting Colatour price:", error);
    }

    return { price, originalPriceText };
  }

  /**
   * 易遊網價格提取
   */
  private async extractEzTravelPrice(page: Page): Promise<{
    price: number;
    originalPriceText: string;
  }> {
    console.log("[PriceAgent] Extracting EzTravel price...");

    let price = 0;
    let originalPriceText = "";

    try {
      const result = await page.evaluate(() => {
        const priceElement = document.querySelector(
          '.price, .tour-price, [class*="price"]'
        );
        if (priceElement) {
          const text = priceElement.textContent || "";
          const match = text.match(/(\d{1,3}(?:,\d{3})*)/);
          if (match) {
            return {
              price: parseInt(match[1].replace(/,/g, ""), 10),
              text: text.trim(),
            };
          }
        }
        return null;
      });

      if (result) {
        price = result.price;
        originalPriceText = result.text;
      }
    } catch (error) {
      console.error("[PriceAgent] Error extracting EzTravel price:", error);
    }

    return { price, originalPriceText };
  }

  /**
   * 通用價格提取
   */
  private async extractGenericPrice(page: Page): Promise<{
    price: number;
    originalPriceText: string;
  }> {
    console.log("[PriceAgent] Extracting generic price...");

    let price = 0;
    let originalPriceText = "";

    try {
      const pageText = await page.evaluate(() => document.body.innerText);

      // 通用價格模式
      const pricePatterns = [
        /NT\$?\s*(\d{1,3}(?:,\d{3})*)/gi,
        /TWD\s*(\d{1,3}(?:,\d{3})*)/gi,
        /(\d{1,3}(?:,\d{3})*)\s*元/gi,
        /(\d{1,3}(?:,\d{3})*)\s*起/gi,
        /價格[：:]\s*(\d{1,3}(?:,\d{3})*)/gi,
        /售價[：:]\s*(\d{1,3}(?:,\d{3})*)/gi,
      ];

      for (const pattern of pricePatterns) {
        let match;
        while ((match = pattern.exec(pageText)) !== null) {
          const numPrice = parseInt(match[1].replace(/,/g, ""), 10);
          if (numPrice >= 10000 && numPrice <= 1000000) {
            if (price === 0 || numPrice < price) {
              price = numPrice;
              originalPriceText = match[0];
            }
          }
        }
      }
    } catch (error) {
      console.error("[PriceAgent] Error extracting generic price:", error);
    }

    return { price, originalPriceText };
  }
}
