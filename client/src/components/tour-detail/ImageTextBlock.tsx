/**
 * ImageTextBlock Component (Sipincollection Style)
 * 圖文交錯區塊：大圖 + 文字說明 - 支援 Inline Editing
 */

import React from "react";
import { Star } from "lucide-react";
import { EditableText } from "./EditableText";
import { EditableImage } from "./EditableImage";
import { useEditMode } from "@/contexts/EditModeContext";
import { ensureReadableOnWhite } from "@/lib/colorUtils";

export interface ImageTextBlockProps {
  title: string;
  description: string;
  mainImage: string;
  mainImageAlt: string;
  smallImage?: string;
  smallImageAlt?: string;
  layout?: "left" | "right";
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  // Editing props
  sectionType?: "hotel" | "meal" | "attraction";
  sectionIndex?: number;
  tourId?: number;
  onUpdate?: (field: string, value: string) => Promise<void>;
  onImageUpload?: (file: File, path: string) => Promise<string>;
  // Additional hotel info
  stars?: number;
  location?: string;
}

export const ImageTextBlock: React.FC<ImageTextBlockProps> = ({
  title,
  description,
  mainImage,
  mainImageAlt,
  smallImage,
  smallImageAlt,
  layout = "left",
  colorTheme,
  sectionType,
  sectionIndex = 0,
  tourId,
  onUpdate,
  onImageUpload,
  stars,
  location,
}) => {
  const { isEditMode } = useEditMode();

  const getFieldName = () => {
    switch (sectionType) {
      case "hotel": return "hotels";
      case "meal": return "meals";
      case "attraction": return "attractions";
      default: return "";
    }
  };

  return (
    <section className="w-full py-12 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div
          className={`flex flex-col ${
            layout === "left" ? "lg:flex-row" : "lg:flex-row-reverse"
          } items-center gap-8 lg:gap-16`}
        >
          {/* 圖片區塊 */}
          <div className="w-full lg:w-3/5 relative">
            {/* 主圖 */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              {isEditMode && onImageUpload ? (
                <EditableImage
                  src={mainImage}
                  alt={mainImageAlt}
                  onUpload={async (file) => {
                    const url = await onImageUpload(file, `${sectionType}-${sectionIndex}-main`);
                    // 這裡需要根據 sectionType 更新對應的欄位
                    return url;
                  }}
                  isEditable={isEditMode}
                  aspectRatio="4/3"
                  className="w-full"
                />
              ) : (
                <img
                  src={mainImage}
                  alt={mainImageAlt}
                  className="w-full aspect-[4/3] object-cover"
                />
              )}
            </div>

            {/* 小圖（重疊在主圖角落） */}
            {(smallImage || isEditMode) && (
              <div className="absolute -bottom-6 -right-6 lg:-bottom-8 lg:-right-8">
                {isEditMode && onImageUpload ? (
                  <EditableImage
                    src={smallImage || ""}
                    alt={smallImageAlt || ""}
                    onUpload={async (file) => {
                      const url = await onImageUpload(file, `${sectionType}-${sectionIndex}-small`);
                      return url;
                    }}
                    isEditable={isEditMode}
                    aspectRatio="1/1"
                    className="w-28 h-28 lg:w-36 lg:h-36 rounded-xl shadow-xl border-4 border-white"
                  />
                ) : smallImage ? (
                  <img
                    src={smallImage}
                    alt={smallImageAlt || ""}
                    className="w-28 h-28 lg:w-36 lg:h-36 object-cover rounded-xl shadow-xl border-4 border-white"
                  />
                ) : null}
              </div>
            )}
          </div>

          {/* 文字區塊 */}
          <div className="w-full lg:w-2/5 flex flex-col gap-5">
            {/* 星級評等（如果是飯店） */}
            {stars && stars > 0 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {stars} 星級
                </span>
              </div>
            )}

            {/* 標題 */}
            {isEditMode && onUpdate ? (
              <EditableText
                value={title}
                onSave={async (newValue) => {
                  // 需要更新對應的 JSON 欄位
                  await onUpdate(`${getFieldName()}_title_${sectionIndex}`, newValue);
                }}
                isEditable={isEditMode}
                className="text-2xl lg:text-4xl font-serif font-bold"
                style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
                as="h2"
              />
            ) : (
              <h2
                className="text-2xl lg:text-4xl font-serif font-bold"
                style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
              >
                {title}
              </h2>
            )}

            {/* 位置（如果有） */}
            {location && (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colorTheme.accent }}
                />
                {location}
              </p>
            )}

            {/* 描述 */}
            {isEditMode && onUpdate ? (
              <EditableText
                value={description}
                onSave={async (newValue) => {
                  await onUpdate(`${getFieldName()}_desc_${sectionIndex}`, newValue);
                }}
                isEditable={isEditMode}
                multiline
                className="text-base lg:text-lg text-gray-700 leading-relaxed"
                as="p"
              />
            ) : (
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                {description}
              </p>
            )}

            {/* 裝飾線 */}
            <div
              className="w-16 h-1 rounded-full mt-2"
              style={{ backgroundColor: colorTheme.accent }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
