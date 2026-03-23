import React, { useState, useRef, useCallback } from "react";
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
  PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Loader2, Check, RotateCcw } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface ImageCropperProps {
  imageSrc: string;
  aspectRatio?: number; // e.g., 16/9, 4/3, 1
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

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
  const { t } = useLocale();
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | undefined>(
    initialAspectRatio
  );
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Aspect ratio options - computed inside component to use t()
  const ASPECT_RATIOS = [
    { label: "16:9", value: 16 / 9 },
    { label: "4:3", value: 4 / 3 },
    { label: "1:1", value: 1 },
    { label: t('imageCropper.free'), value: undefined },
  ];

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const aspect = selectedAspectRatio || 16 / 9;
      setCrop(centerAspectCrop(width, height, aspect));
    },
    [selectedAspectRatio]
  );

  const handleAspectRatioChange = (ratio: number | undefined) => {
    setSelectedAspectRatio(ratio);
    if (imgRef.current && ratio) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, ratio));
    }
  };

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

  const handleReset = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const aspect = selectedAspectRatio || 16 / 9;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  return (
    <div className="space-y-4">
      {/* Aspect ratio selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 mr-2">{t('imageCropper.aspectRatio')}</span>
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

      {/* Crop area */}
      <div className="relative bg-gray-100 rounded-none overflow-hidden max-h-[400px] flex items-center justify-center">
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
            alt={t('imageCropper.cropPreview')}
            onLoad={onImageLoad}
            className="max-h-[400px] max-w-full object-contain"
          />
        </ReactCrop>
      </div>

      {/* Hidden canvas for generating cropped image */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isUploading}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            {t('imageCropper.reset')}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={generateCroppedImage}
            disabled={!completedCrop || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('imageCropper.uploading')}
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {t('imageCropper.confirmCrop')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Hint text */}
      <p className="text-xs text-gray-500 text-center">
        {t('imageCropper.hint')}
      </p>
    </div>
  );
}

export default ImageCropper;
