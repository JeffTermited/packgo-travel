/**
 * FullWidthSection Component (Sipincollection Style)
 * 全寬背景區塊：圖文交錯 + 小圖組交疊
 */

import React from "react";
import { ensureReadableOnWhite } from "@/lib/colorUtils";

export interface FullWidthSectionProps {
  title: string;
  description: string;
  mainImage: string;
  mainImageAlt: string;
  smallImages?: Array<{
    url: string;
    alt: string;
  }>;
  backgroundColor?: string;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const FullWidthSection: React.FC<FullWidthSectionProps> = ({
  title,
  description,
  mainImage,
  mainImageAlt,
  smallImages,
  backgroundColor,
  colorTheme,
}) => {
  return (
    <section
      className="w-full py-16 lg:py-24"
      style={{
        backgroundColor: backgroundColor || colorTheme.secondary + "40",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* 文字區塊 */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <h2
              className="text-3xl lg:text-4xl font-serif font-bold"
              style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
            >
              {title}
            </h2>

            <p className="text-base lg:text-lg leading-relaxed" style={{ color: colorTheme.primary + "CC" }}>
              {description}
            </p>
          </div>

          {/* 圖片區塊 */}
          <div className="w-full lg:w-1/2 relative">
            {/* 主圖 */}
            <img
              src={mainImage}
              alt={mainImageAlt}
              className="w-full h-auto object-cover rounded-none shadow-lg"
              style={{
                maxHeight: "400px",
                objectFit: "cover",
              }}
            />

            {/* 小圖組（交疊在主圖右側） */}
            {smallImages && smallImages.length > 0 && (
              <div className="absolute -right-4 -bottom-4 flex gap-2">
                {smallImages.slice(0, 3).map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt={img.alt}
                    className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-none shadow-xl border-2 border-white"
                    style={{
                      objectFit: "cover",
                      transform: `translateX(${index * -8}px)`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
