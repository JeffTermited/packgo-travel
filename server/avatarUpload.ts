import { Router } from "express";
import { storagePut } from "./storage";
import { randomBytes } from "crypto";

export const avatarUploadRouter = Router();

avatarUploadRouter.post("/upload-avatar", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "Invalid image data" });
    }

    // Extract base64 data
    const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const imageType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const randomSuffix = randomBytes(8).toString("hex");
    const fileName = `avatar-${Date.now()}-${randomSuffix}.${imageType}`;
    const fileKey = `avatars/${fileName}`;

    // Upload to S3
    const { url } = await storagePut(fileKey, buffer, `image/${imageType}`);

    res.json({ url });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
});
