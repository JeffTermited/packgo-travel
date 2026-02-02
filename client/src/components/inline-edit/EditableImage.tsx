import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Upload, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EditableImageProps {
  src: string;
  alt: string;
  onSave: (newSrc: string) => void;
  isEditing: boolean;
  className?: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
  tourId?: number;
  imagePath?: string;
}

export function EditableImage({
  src,
  alt,
  onSave,
  isEditing,
  className = "",
  aspectRatio = "auto",
  tourId,
  imagePath = "image",
}: EditableImageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(src);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // 當 src 變更時更新 imageUrl
  useEffect(() => {
    setImageUrl(src);
  }, [src]);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
    auto: "",
  }[aspectRatio];

  // 處理檔案上傳
  const handleFileUpload = useCallback(async (file: File) => {
    // 驗證檔案類型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type) && !file.type.startsWith("image/")) {
      toast.error("請選擇圖片檔案（支援 JPG、PNG、GIF、WebP）");
      return;
    }

    // 驗證檔案大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("圖片大小不能超過 10MB");
      return;
    }

    setIsUploading(true);
    try {
      // 如果有 tourId，使用行程圖片上傳 API
      if (tourId) {
        // 將檔案轉換為 base64
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = reader.result as string;
            const response = await fetch(`/api/tours/${tourId}/upload-image`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                image: base64,
                path: imagePath,
              }),
            });

            if (!response.ok) {
              throw new Error("上傳失敗");
            }

            const { url } = await response.json();
            setImageUrl(url);
            onSave(url); // 自動儲存
            toast.success("圖片上傳成功");
            setIsDialogOpen(false);
          } catch (error) {
            toast.error("圖片上傳失敗，請稍後再試");
          } finally {
            setIsUploading(false);
          }
        };
        reader.onerror = () => {
          toast.error("讀取檔案失敗");
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } else {
        // 使用通用圖片上傳 API
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("上傳失敗");
        }

        const { url } = await response.json();
        setImageUrl(url);
        onSave(url); // 自動儲存
        toast.success("圖片上傳成功");
        setIsDialogOpen(false);
        setIsUploading(false);
      }
    } catch (error) {
      toast.error("圖片上傳失敗，請稍後再試");
      setIsUploading(false);
    }
  }, [tourId, imagePath, onSave]);

  // 處理檔案選擇
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // 清除 input 值，允許重複選擇同一檔案
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 處理拖放事件
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 只有當離開 dropZone 時才設置 isDragging 為 false
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  // 非編輯模式：直接顯示圖片
  if (!isEditing) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(aspectRatioClass, "object-cover", className)}
      />
    );
  }

  // 編輯模式：顯示可點擊的圖片
  return (
    <>
      <div
        className={cn(
          "relative group cursor-pointer",
          aspectRatioClass,
          className
        )}
        onClick={() => setIsDialogOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          className={cn("w-full h-full object-cover", aspectRatioClass)}
        />
        {/* 編輯覆蓋層 */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-white text-center">
            <Camera className="h-8 w-8 mx-auto mb-2" />
            <span className="text-sm font-medium">點擊更換圖片</span>
          </div>
        </div>
        {/* 編輯標記 */}
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          可編輯
        </div>
      </div>

      {/* 圖片編輯對話框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              更換圖片
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 拖放上傳區域 */}
            <div
              ref={dropZoneRef}
              className={cn(
                "relative border-2 border-dashed rounded-lg transition-all duration-200",
                isDragging 
                  ? "border-primary bg-primary/10" 
                  : "border-gray-300 hover:border-gray-400",
                "cursor-pointer"
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              {/* 預覽圖片 */}
              <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="預覽"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                    <ImageIcon className="h-16 w-16 mb-4" />
                    <p className="text-sm">尚未選擇圖片</p>
                  </div>
                )}
              </div>

              {/* 拖放覆蓋層 */}
              {(isDragging || isUploading) && (
                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-lg">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
                      <p className="text-gray-600 font-medium">上傳中...</p>
                      <p className="text-gray-400 text-sm">圖片將自動調整大小</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-primary mb-3" />
                      <p className="text-gray-600 font-medium">放開以上傳圖片</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 上傳按鈕 */}
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    上傳中...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    上傳圖片
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                支援 JPG、PNG、GIF、WebP 格式，最大 10MB
              </p>
              <p className="text-xs text-gray-400 mt-1">
                可直接拖放圖片到上方區域
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EditableImage;
