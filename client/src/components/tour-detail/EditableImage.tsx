/**
 * EditableImage Component
 * 可編輯圖片組件 - 點擊可上傳新圖片替換
 */

import React, { useState, useRef } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EditableImageProps {
  src: string;
  alt: string;
  onUpload: (file: File) => Promise<string>; // 返回新的圖片 URL
  isEditable?: boolean;
  className?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1" | "3/4";
  placeholder?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  onUpload,
  isEditable = false,
  className = "",
  aspectRatio = "16/9",
  placeholder = "點擊上傳圖片",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!isEditable || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 驗證檔案類型
    if (!file.type.startsWith("image/")) {
      alert("請選擇圖片檔案");
      return;
    }

    // 驗證檔案大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("圖片大小不能超過 10MB");
      return;
    }

    // 顯示預覽
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      await onUpload(file);
      // 上傳成功後清除預覽
      setPreviewUrl(null);
    } catch (error) {
      console.error("圖片上傳失敗:", error);
      alert("圖片上傳失敗，請重試");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // 清除 input 值，允許重複選擇同一檔案
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }

    // 清理 object URL
    URL.revokeObjectURL(objectUrl);
  };

  const aspectRatioClass = {
    "16/9": "aspect-[16/9]",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
    "3/4": "aspect-[3/4]",
  }[aspectRatio];

  const displaySrc = previewUrl || src;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg",
        aspectRatioClass,
        isEditable && "cursor-pointer group",
        className
      )}
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
      onClick={handleClick}
    >
      {/* 圖片 */}
      {displaySrc ? (
        <img
          src={displaySrc}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">{placeholder}</span>
        </div>
      )}

      {/* 編輯覆蓋層 */}
      {isEditable && (showOverlay || isUploading) && (
        <div
          className={cn(
            "absolute inset-0 bg-black/50 flex flex-col items-center justify-center transition-opacity",
            showOverlay || isUploading ? "opacity-100" : "opacity-0"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
              <span className="text-white text-sm">上傳中...</span>
            </>
          ) : (
            <>
              <Camera className="h-8 w-8 text-white mb-2" />
              <span className="text-white text-sm">點擊更換圖片</span>
              <span className="text-white/70 text-xs mt-1">支援 JPG、PNG、WebP</span>
            </>
          )}
        </div>
      )}

      {/* 隱藏的檔案輸入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
