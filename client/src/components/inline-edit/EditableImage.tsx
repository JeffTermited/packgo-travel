import React, { useState, useRef } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface EditableImageProps {
  src: string;
  alt: string;
  onSave: (newSrc: string) => void;
  isEditing: boolean;
  className?: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
}

export function EditableImage({
  src,
  alt,
  onSave,
  isEditing,
  className = "",
  aspectRatio = "auto",
}: EditableImageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(src);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
    auto: "",
  }[aspectRatio];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 驗證檔案類型
    if (!file.type.startsWith("image/")) {
      toast.error("請選擇圖片檔案");
      return;
    }

    // 驗證檔案大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("圖片大小不能超過 10MB");
      return;
    }

    setIsUploading(true);
    try {
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
      toast.success("圖片上傳成功");
    } catch (error) {
      toast.error("圖片上傳失敗，請稍後再試");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (imageUrl !== src) {
      onSave(imageUrl);
    }
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setImageUrl(src);
    setIsDialogOpen(false);
  };

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
            {/* 預覽圖片 */}
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="預覽"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Camera className="h-12 w-12" />
                </div>
              )}
            </div>

            {/* 上傳按鈕 */}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1"
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
            </div>

            {/* 或輸入 URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                或輸入圖片網址
              </label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* 操作按鈕 */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                取消
              </Button>
              <Button onClick={handleSave} disabled={isUploading}>
                確認更換
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EditableImage;
