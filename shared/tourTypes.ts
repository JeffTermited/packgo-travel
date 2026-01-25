/**
 * Shared type definitions for tour generation system
 */

// Color Theme
export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textLight: string;
  background: string;
  backgroundDark: string;
}

// Tour Highlight
export interface TourHighlight {
  id: number;
  image: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  description: string;
  labelColor: string;
  labelPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

// Key Feature (for vertical text layout)
export interface KeyFeature {
  id: number;
  keyword: string;
  keywordStyle: "vertical" | "horizontal";
  image: string | null;
  imageAlt?: string;
  phrases: string[];
  description: string;
}

// Gallery Image
export interface GalleryImage {
  id: number;
  url: string;
  alt: string;
  caption: string;
  category: string;
  order: number;
}

// Poetic Content
export interface PoeticContent {
  intro: string;
  accommodation: string;
  dining: string;
  experience: string;
  closing: string;
}

// Style Guide for image generation
export interface StyleGuide {
  photographyStyle: string; // e.g., "cinematic travel photography"
  colorPalette: string[]; // Hex colors
  mood: string; // e.g., "serene", "adventurous", "luxurious"
  lighting: string; // e.g., "golden hour", "soft natural light"
  composition: string; // e.g., "wide angle", "rule of thirds"
  keywords: string[]; // Common keywords for all images
}

// Image generation request
export interface ImageGenerationRequest {
  prompt: string;
  styleGuide: StyleGuide;
  destination: string;
  category: "hero" | "highlight" | "feature";
}

// Image generation result
export interface ImageGenerationResult {
  url: string;
  alt: string;
  source: "ai" | "unsplash" | "fallback";
  prompt?: string;
}
