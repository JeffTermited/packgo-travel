import React, { useState, useRef, useCallback } from "react";
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
  PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Loader2, Check, RotateCcw, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCropperProps {
  imageSrc: string;
  aspectRatio?: number; // e.g., 16/9, 4/3, 1
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

// 預設裁切比例選項
const ASPECT_RATIOS = [
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "自由", value: undefined },
];

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropper({
  imageSrc,
  aspectRatio: initialAspectRatio,
  onCropComplete,
  onCancel,
  isUploading = false,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | undefined>(
    initialAspectRatio
  );
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 當圖片載入時，設置初始裁切區域
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const aspect = selectedAspectRatio || 16 / 9;
      setCrop(centerAspectCrop(width, height, aspect));
    },
    [selectedAspectRatio]
  );

  // 當選擇新的比例時，重新計算裁切區域
  const handleAspectRatioChange = (ratio: number | undefined) => {
    setSelectedAspectRatio(ratio);
    if (imgRef.current && ratio) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, ratio));
    }
  };

  // 生成裁切後的圖片
  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    // 計算實際的裁切尺寸（考慮圖片的原始尺寸和顯示尺寸的比例）
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = "high";

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // 將 canvas 轉換為 Blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      "image/jpeg",
      0.9
    );
  }, [completedCrop, onCropComplete]);

  // 重置裁切區域
  const handleReset = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const aspect = selectedAspectRatio || 16 / 9;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  return (
    <div className="space-y-4">
      {/* 比例選擇器 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 mr-2">裁切比例：</span>
        {ASPECT_RATIOS.map((ratio) => (
          <Button
            key={ratio.label}
            variant={selectedAspectRatio === ratio.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleAspectRatioChange(ratio.value)}
            className="min-w-[60px]"
          >
            {ratio.label}
          </Button>
        ))}
      </div>

      {/* 裁切區域 */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden max-h-[400px] flex items-center justify-center">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={selectedAspectRatio}
          className="max-h-[400px]"
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="裁切預覽"
            onLoad={onImageLoad}
            className="max-h-[400px] max-w-full object-contain"
          />
        </ReactCrop>
      </div>

      {/* 隱藏的 canvas 用於生成裁切後的圖片 */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 操作按鈕 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isUploading}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            重置
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
          >
            取消
          </Button>
          <Button
            onClick={generateCroppedImage}
            disabled={!completedCrop || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                上傳中...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                確認裁切
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 提示文字 */}
      <p className="text-xs text-gray-500 text-center">
        拖曳調整裁切區域，選擇您想要的圖片範圍
      </p>
    </div>
  );
}

export default ImageCropper;
