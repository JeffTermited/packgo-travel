// Image optimization and compression using Sharp
// Generates multiple sizes for responsive images

import sharp from 'sharp';

export interface ImageSizes {
  thumbnail: Buffer;
  medium: Buffer;
  large: Buffer;
  original?: Buffer; // Optional: keep original for high-quality downloads
}

export interface ImageOptimizationOptions {
  quality?: number; // JPEG/WebP quality (1-100), default: 80
  format?: 'jpeg' | 'webp' | 'png'; // Output format, default: 'webp'
  sizes?: {
    thumbnail?: number; // Width in pixels, default: 300
    medium?: number; // Width in pixels, default: 800
    large?: number; // Width in pixels, default: 1920
  };
  keepOriginal?: boolean; // Keep original size, default: false
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  quality: 80,
  format: 'webp',
  sizes: {
    thumbnail: 300,
    medium: 800,
    large: 1920,
  },
  keepOriginal: false,
};

/**
 * Optimize and resize an image to multiple sizes
 * @param imageBuffer - Input image buffer
 * @param options - Optimization options
 * @returns Object containing buffers for each size
 */
export async function optimizeImage(
  imageBuffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<ImageSizes> {
  const opts = { ...DEFAULT_OPTIONS, ...options, sizes: { ...DEFAULT_OPTIONS.sizes, ...options.sizes } };

  // Get image metadata
  const metadata = await sharp(imageBuffer).metadata();
  const originalWidth = metadata.width || 0;

  // Helper function to resize and optimize
  const resizeAndOptimize = async (width: number): Promise<Buffer> => {
    let pipeline = sharp(imageBuffer).resize(width, undefined, {
      fit: 'inside',
      withoutEnlargement: true, // Don't upscale if original is smaller
    });

    // Apply format conversion
    switch (opts.format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality: opts.quality, progressive: true });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality: opts.quality });
        break;
      case 'png':
        pipeline = pipeline.png({ quality: opts.quality, compressionLevel: 9 });
        break;
    }

    return pipeline.toBuffer();
  };

  // Generate all sizes
  const [thumbnail, medium, large] = await Promise.all([
    resizeAndOptimize(opts.sizes.thumbnail!),
    resizeAndOptimize(opts.sizes.medium!),
    resizeAndOptimize(opts.sizes.large!),
  ]);

  const result: ImageSizes = {
    thumbnail,
    medium,
    large,
  };

  // Optionally keep original
  if (opts.keepOriginal) {
    result.original = imageBuffer;
  }

  return result;
}

/**
 * Get file extension based on format
 */
export function getExtension(format: 'jpeg' | 'webp' | 'png'): string {
  switch (format) {
    case 'jpeg':
      return 'jpg';
    case 'webp':
      return 'webp';
    case 'png':
      return 'png';
  }
}

/**
 * Get MIME type based on format
 */
export function getMimeType(format: 'jpeg' | 'webp' | 'png'): string {
  switch (format) {
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'png':
      return 'image/png';
  }
}

/**
 * Generate storage keys for all sizes
 * @param baseKey - Base key without extension (e.g., "tours/123/image1")
 * @param format - Image format
 * @returns Object containing keys for each size
 */
export function generateStorageKeys(
  baseKey: string,
  format: 'jpeg' | 'webp' | 'png'
): Record<keyof ImageSizes, string> {
  const ext = getExtension(format);
  return {
    thumbnail: `${baseKey}_thumb.${ext}`,
    medium: `${baseKey}_medium.${ext}`,
    large: `${baseKey}_large.${ext}`,
    original: `${baseKey}_original.${ext}`,
  };
}
