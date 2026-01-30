/**
 * Tour Image Upload API
 * 處理行程詳情頁面的圖片上傳
 */

import { Router } from "express";
import { storagePut } from "./storage";
import { randomBytes } from "crypto";

export const tourImageUploadRouter = Router();

/**
 * 上傳行程圖片
 * POST /api/tours/:tourId/upload-image
 * Body: { image: base64 string, path: string (e.g., "hero", "day-1-activity-0") }
 */
tourImageUploadRouter.post("/tours/:tourId/upload-image", async (req, res) => {
  try {
    const { tourId } = req.params;
    const { image, path: imagePath } = req.body;

    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "Invalid image data" });
    }

    if (!imagePath || typeof imagePath !== "string") {
      return res.status(400).json({ error: "Invalid image path" });
    }

    // Extract base64 data
    const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const imageType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Validate file size (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: "Image size exceeds 10MB limit" });
    }

    // Generate unique filename
    const randomSuffix = randomBytes(8).toString("hex");
    const sanitizedPath = imagePath.replace(/[^a-zA-Z0-9-_]/g, "-");
    const fileName = `tour-${tourId}-${sanitizedPath}-${Date.now()}-${randomSuffix}.${imageType}`;
    const fileKey = `tours/${tourId}/${fileName}`;

    // Upload to S3
    const { url } = await storagePut(fileKey, buffer, `image/${imageType}`);

    console.log(`[TourImageUpload] Uploaded image for tour ${tourId}: ${url}`);

    res.json({ url, path: imagePath });
  } catch (error) {
    console.error("[TourImageUpload] Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

/**
 * 批量上傳行程圖片
 * POST /api/tours/:tourId/upload-images
 * Body: { images: [{ image: base64 string, path: string }] }
 */
tourImageUploadRouter.post("/tours/:tourId/upload-images", async (req, res) => {
  try {
    const { tourId } = req.params;
    const { images } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "Invalid images array" });
    }

    if (images.length > 20) {
      return res.status(400).json({ error: "Maximum 20 images per batch" });
    }

    const results: { url: string; path: string }[] = [];
    const errors: { path: string; error: string }[] = [];

    for (const item of images) {
      try {
        const { image, path: imagePath } = item;

        if (!image || typeof image !== "string") {
          errors.push({ path: imagePath || "unknown", error: "Invalid image data" });
          continue;
        }

        // Extract base64 data
        const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
          errors.push({ path: imagePath, error: "Invalid image format" });
          continue;
        }

        const imageType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, "base64");

        // Validate file size (max 10MB)
        if (buffer.length > 10 * 1024 * 1024) {
          errors.push({ path: imagePath, error: "Image size exceeds 10MB limit" });
          continue;
        }

        // Generate unique filename
        const randomSuffix = randomBytes(8).toString("hex");
        const sanitizedPath = imagePath.replace(/[^a-zA-Z0-9-_]/g, "-");
        const fileName = `tour-${tourId}-${sanitizedPath}-${Date.now()}-${randomSuffix}.${imageType}`;
        const fileKey = `tours/${tourId}/${fileName}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, `image/${imageType}`);
        results.push({ url, path: imagePath });
      } catch (err: any) {
        errors.push({ path: item.path || "unknown", error: err.message });
      }
    }

    console.log(`[TourImageUpload] Batch upload for tour ${tourId}: ${results.length} success, ${errors.length} failed`);

    res.json({ results, errors });
  } catch (error) {
    console.error("[TourImageUpload] Batch upload error:", error);
    res.status(500).json({ error: "Failed to upload images" });
  }
});
