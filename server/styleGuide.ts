/**
 * Global Style Guide for Image Generation
 * Ensures consistency across all generated images
 */

import { StyleGuide } from "../shared/tourTypes";

/**
 * Default style guide for travel photography
 */
export const DEFAULT_STYLE_GUIDE: StyleGuide = {
  photographyStyle: "cinematic travel photography",
  colorPalette: ["#4A90E2", "#F39C12", "#27AE60", "#E74C3C", "#9B59B6"],
  mood: "serene and inspiring",
  lighting: "golden hour soft natural light",
  composition: "wide angle rule of thirds",
  keywords: [
    "professional",
    "high quality",
    "8k resolution",
    "travel magazine style",
    "no text",
    "no watermark",
  ],
};

/**
 * Destination-specific style guides
 */
export const DESTINATION_STYLE_GUIDES: Record<string, Partial<StyleGuide>> = {
  "日本": {
    colorPalette: ["#FFB6C1", "#4A90E2", "#F39C12"],
    mood: "peaceful and elegant",
    keywords: ["japanese aesthetic", "zen", "minimalist"],
  },
  "北海道": {
    colorPalette: ["#4A90E2", "#7FB3D5", "#F39C12"],
    mood: "serene and majestic",
    keywords: ["snow landscape", "winter wonderland", "hokkaido"],
  },
  "歐洲": {
    colorPalette: ["#D4AF37", "#9B59B6", "#E74C3C"],
    mood: "romantic and classic",
    keywords: ["european architecture", "historic", "elegant"],
  },
  "東南亞": {
    colorPalette: ["#27AE60", "#F39C12", "#3498DB"],
    mood: "vibrant and tropical",
    keywords: ["tropical paradise", "beach", "lush greenery"],
  },
  "北美": {
    colorPalette: ["#E74C3C", "#3498DB", "#F39C12"],
    mood: "adventurous and grand",
    keywords: ["vast landscape", "national park", "wilderness"],
  },
  "澳洲": {
    colorPalette: ["#2980B9", "#E67E22", "#27AE60"],
    mood: "adventurous and natural",
    keywords: ["coastal", "outback", "wildlife"],
  },
};

/**
 * Get style guide for a destination
 */
export function getStyleGuideForDestination(
  destinationCountry: string,
  destinationCity?: string
): StyleGuide {
  // Check for city-specific style guide
  if (destinationCity && DESTINATION_STYLE_GUIDES[destinationCity]) {
    return {
      ...DEFAULT_STYLE_GUIDE,
      ...DESTINATION_STYLE_GUIDES[destinationCity],
    };
  }
  
  // Check for country-specific style guide
  if (DESTINATION_STYLE_GUIDES[destinationCountry]) {
    return {
      ...DEFAULT_STYLE_GUIDE,
      ...DESTINATION_STYLE_GUIDES[destinationCountry],
    };
  }
  
  // Return default style guide
  return DEFAULT_STYLE_GUIDE;
}

/**
 * Validate style consistency
 * Returns true if the image matches the style guide
 */
export function validateStyleConsistency(
  imageUrl: string,
  styleGuide: StyleGuide
): boolean {
  // TODO: Implement actual validation logic
  // For now, just log a warning
  console.warn("[StyleGuide] Style consistency validation not yet implemented");
  console.warn("[StyleGuide] Image URL:", imageUrl);
  console.warn("[StyleGuide] Expected style:", styleGuide.photographyStyle);
  
  // Always return true for now (will be enhanced later)
  return true;
}
