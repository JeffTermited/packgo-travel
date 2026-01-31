// Preconfigured storage helpers for Manus WebDev templates
// Uses the Biz-provided storage proxy (Authorization: Bearer <token>)

import { ENV } from './_core/env';

type StorageConfig = { baseUrl: string; apiKey: string };

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}

// Image optimization and upload
import {
  optimizeImage,
  generateStorageKeys,
  getMimeType,
  type ImageOptimizationOptions,
} from './imageOptimizer';

export interface OptimizedImageUrls {
  thumbnail: string;
  medium: string;
  large: string;
  original?: string;
}

/**
 * Upload an image with automatic optimization and multiple sizes
 * @param baseKey - Base storage key without extension (e.g., "tours/123/image1")
 * @param imageBuffer - Input image buffer
 * @param options - Optimization options
 * @returns URLs for all generated sizes
 */
export async function storageImagePut(
  baseKey: string,
  imageBuffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageUrls> {
  const format = options.format || 'webp';
  const mimeType = getMimeType(format);

  // Optimize image to multiple sizes
  const optimized = await optimizeImage(imageBuffer, options);

  // Generate storage keys
  const keys = generateStorageKeys(baseKey, format);

  // Upload all sizes in parallel
  const [thumbnailResult, mediumResult, largeResult, originalResult] = await Promise.all([
    storagePut(keys.thumbnail, optimized.thumbnail, mimeType),
    storagePut(keys.medium, optimized.medium, mimeType),
    storagePut(keys.large, optimized.large, mimeType),
    optimized.original
      ? storagePut(keys.original!, optimized.original, mimeType)
      : Promise.resolve(null),
  ]);

  const urls: OptimizedImageUrls = {
    thumbnail: thumbnailResult.url,
    medium: mediumResult.url,
    large: largeResult.url,
  };

  if (originalResult) {
    urls.original = originalResult.url;
  }

  return urls;
}
