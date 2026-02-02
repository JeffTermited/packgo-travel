/**
 * 顏色工具函數
 * 用於確保文字在任何背景上都能清晰可見
 */

/**
 * 將十六進制顏色轉換為 RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * 計算顏色的相對亮度 (luminance)
 * 根據 WCAG 2.0 標準
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 計算兩個顏色之間的對比度
 * 根據 WCAG 2.0 標準，對比度應至少為 4.5:1（AA 級）或 7:1（AAA 級）
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 判斷顏色是否為淺色
 */
export function isLightColor(hex: string): boolean {
  return getLuminance(hex) > 0.5;
}

/**
 * 根據背景色獲取適合的文字顏色
 * @param backgroundColor 背景顏色（十六進制）
 * @param lightText 淺色文字（預設白色）
 * @param darkText 深色文字（預設深灰色）
 */
export function getContrastTextColor(
  backgroundColor: string,
  lightText: string = "#FFFFFF",
  darkText: string = "#1F2937"
): string {
  const luminance = getLuminance(backgroundColor);
  // 如果背景較亮，使用深色文字；否則使用淺色文字
  return luminance > 0.5 ? darkText : lightText;
}

/**
 * 確保顏色在白色背景上有足夠的對比度
 * 如果對比度不足，返回調整後的顏色
 */
export function ensureReadableOnWhite(hex: string, minContrast: number = 4.5): string {
  const contrastWithWhite = getContrastRatio(hex, "#FFFFFF");
  
  if (contrastWithWhite >= minContrast) {
    return hex;
  }
  
  // 如果對比度不足，使用深色版本
  return darkenColor(hex, 30);
}

/**
 * 加深顏色
 * @param hex 原始顏色
 * @param percent 加深百分比 (0-100)
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - percent / 100;
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * 淡化顏色
 * @param hex 原始顏色
 * @param percent 淡化百分比 (0-100)
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;
  const r = Math.round(rgb.r + (255 - rgb.r) * factor);
  const g = Math.round(rgb.g + (255 - rgb.g) * factor);
  const b = Math.round(rgb.b + (255 - rgb.b) * factor);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * 獲取顏色的深色版本（用於標題等需要高對比度的文字）
 */
export function getReadableColor(hex: string): string {
  const luminance = getLuminance(hex);
  
  // 如果顏色太亮，返回深色版本
  if (luminance > 0.4) {
    return darkenColor(hex, 40);
  }
  
  return hex;
}

/**
 * 獲取適合作為文字顏色的版本
 * 確保在白色背景上有足夠的對比度
 */
export function getTextColor(colorTheme: { primary: string; secondary: string; accent: string }): {
  primary: string;
  secondary: string;
  accent: string;
} {
  return {
    primary: ensureReadableOnWhite(colorTheme.primary),
    secondary: ensureReadableOnWhite(colorTheme.secondary),
    accent: ensureReadableOnWhite(colorTheme.accent),
  };
}
