/**
 * Color Theme Agent
 * Responsible for generating color themes based on destination
 */

import { ColorTheme } from "../../shared/tourTypes";

export interface ColorThemeResult {
  success: boolean;
  data?: ColorTheme;
  error?: string;
}

/**
 * Color Theme Agent
 * Generates color themes based on destination characteristics
 */
export class ColorThemeAgent {
  /**
   * Execute color theme generation
   */
  async execute(
    destinationCountry: string,
    destinationCity?: string
  ): Promise<ColorThemeResult> {
    console.log("[ColorThemeAgent] Starting color theme generation...");
    console.log("[ColorThemeAgent] Destination:", destinationCountry, destinationCity);
    
    try {
      // Generate color theme based on destination
      const colorTheme = this.generateColorTheme(destinationCountry, destinationCity);
      
      console.log("[ColorThemeAgent] Color theme generated:", colorTheme);
      
      return {
        success: true,
        data: colorTheme,
      };
    } catch (error) {
      console.error("[ColorThemeAgent] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
  /**
   * Generate color theme based on destination
   */
  private generateColorTheme(
    destinationCountry: string,
    destinationCity?: string
  ): ColorTheme {
    // Check for city-specific themes
    if (destinationCity) {
      const cityTheme = this.getCityTheme(destinationCity);
      if (cityTheme) return cityTheme;
    }
    
    // Check for country-specific themes
    const countryTheme = this.getCountryTheme(destinationCountry);
    if (countryTheme) return countryTheme;
    
    // Return default theme
    return this.getDefaultTheme();
  }
  
  /**
   * Get city-specific theme
   */
  private getCityTheme(city: string): ColorTheme | null {
    const cityThemes: Record<string, ColorTheme> = {
      "北海道": {
        primary: "#4A90E2", // Blue (snow, sky)
        secondary: "#7FB3D5", // Light blue
        accent: "#F39C12", // Orange (sunset)
        text: "#2C3E50", // Dark blue-gray
        textLight: "#7F8C8D", // Gray
        background: "#ECF0F1", // Light gray
        backgroundDark: "#BDC3C7", // Medium gray
      },
      "京都": {
        primary: "#E74C3C", // Red (temples)
        secondary: "#FFB6C1", // Pink (cherry blossoms)
        accent: "#D4AF37", // Gold
        text: "#2C3E50", // Dark blue-gray
        textLight: "#7F8C8D", // Gray
        background: "#FFF5E6", // Cream
        backgroundDark: "#F5DEB3", // Wheat
      },
      "東京": {
        primary: "#9B59B6", // Purple (modern)
        secondary: "#3498DB", // Blue
        accent: "#E74C3C", // Red
        text: "#2C3E50", // Dark blue-gray
        textLight: "#7F8C8D", // Gray
        background: "#F8F9FA", // Light gray
        backgroundDark: "#E9ECEF", // Medium gray
      },
    };
    
    return cityThemes[city] || null;
  }
  
  /**
   * Get country-specific theme
   */
  private getCountryTheme(country: string): ColorTheme | null {
    const countryThemes: Record<string, ColorTheme> = {
      "日本": {
        primary: "#E74C3C", // Red
        secondary: "#FFB6C1", // Pink
        accent: "#D4AF37", // Gold
        text: "#2C3E50", // Dark blue-gray
        textLight: "#7F8C8D", // Gray
        background: "#FFF5E6", // Cream
        backgroundDark: "#F5DEB3", // Wheat
      },
      "韓國": {
        primary: "#3498DB", // Blue
        secondary: "#E74C3C", // Red
        accent: "#F39C12", // Orange
        text: "#2C3E50", // Dark blue-gray
        textLight: "#7F8C8D", // Gray
        background: "#F8F9FA", // Light gray
        backgroundDark: "#E9ECEF", // Medium gray
      },
      "泰國": {
        primary: "#F39C12", // Orange (temples)
        secondary: "#27AE60", // Green (tropical)
        accent: "#E74C3C", // Red
        text: "#2C3E50", // Dark blue-gray
        textLight: "#7F8C8D", // Gray
        background: "#FFF9E6", // Light yellow
        backgroundDark: "#FFE5B4", // Peach
      },
      "法國": {
        primary: "#3498DB", // Blue (flag)
        secondary: "#E74C3C", // Red (flag)
        accent: "#D4AF37", // Gold
        text: "#2C3E50", // Dark blue-gray
        textLight: "#7F8C8D", // Gray
        background: "#F8F9FA", // Light gray
        backgroundDark: "#E9ECEF", // Medium gray
      },
      "義大利": {
        primary: "#27AE60", // Green (flag)
        secondary: "#E74C3C", // Red (flag)
        accent: "#D4AF37", // Gold
        text: "#2C3E50", // Dark blue-gray
        textLight: "#7F8C8D", // Gray
        background: "#FFF9E6", // Light yellow
        backgroundDark: "#FFE5B4", // Peach
      },
      "美國": {
        primary: "#3498DB", // Blue (flag)
        secondary: "#E74C3C", // Red (flag)
        accent: "#F39C12", // Orange
        text: "#2C3E50", // Dark blue-gray
        textLight: "#7F8C8D", // Gray
        background: "#F8F9FA", // Light gray
        backgroundDark: "#E9ECEF", // Medium gray
      },
      "澳洲": {
        primary: "#2980B9", // Blue (ocean)
        secondary: "#E67E22", // Orange (outback)
        accent: "#27AE60", // Green
        text: "#2C3E50", // Dark blue-gray
        textLight: "#7F8C8D", // Gray
        background: "#F0F8FF", // Alice blue
        backgroundDark: "#D6EAF8", // Light blue
      },
    };
    
    return countryThemes[country] || null;
  }
  
  /**
   * Get default theme (Pack&Go Brand Colors)
   * ⚠️ Tech Lead 審查意見：
   * 當使用者輸入「冰島」或「南極」等未定義地點時，系統不應崩潰或變全白。
   * 務必在 getDestinationColors 中加入 Default 配色方案（Pack&Go 品牌標準色），
   * 當查無地點時自動降級使用。
   */
  private getDefaultTheme(): ColorTheme {
    // Pack&Go 品牌標準色（用於未知目的地）
    return {
      primary: "#1A1A1A",   // 深灰黑（專業、穩重）
      secondary: "#F5F5F5", // 淺灰白（乾淨、現代）
      accent: "#E63946",    // 紅色（活力、冒險）
      text: "#2C3E50",      // 深藍灰（文字）
      textLight: "#7F8C8D", // 灰色（次要文字）
      background: "#F8F9FA", // 淺灰色（背景）
      backgroundDark: "#E9ECEF", // 中灰色（深色背景）
    };
  }
}
