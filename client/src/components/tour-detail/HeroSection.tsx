/**
 * HeroSection Component (Sipincollection Style)
 * 第一屏：左側直式標題 + 右側大圖
 */

import React from "react";

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  keywords?: string[];
  heroImage: string;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  keywords,
  heroImage,
  colorTheme,
}) => {
  return (
    <section className="w-full py-8 lg:py-16 bg-gray-50">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* 左側：直式標題 + 副標題 + 關鍵詞 */}
        <div className="w-full lg:w-1/3 flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* 直式標題（桌面版直排，手機版橫排） */}
          <h1
            className="vertical-title text-4xl lg:text-5xl xl:text-6xl font-serif font-bold"
            style={{
              color: colorTheme.primary,
            }}
          >
            {title}
          </h1>

          {/* 副標題 + 關鍵詞 */}
          <div className="flex flex-col gap-4">
            {subtitle && (
              <h2
                className="text-xl lg:text-2xl font-bold"
                style={{ color: colorTheme.primary }}
              >
                {subtitle}
              </h2>
            )}

            {keywords && keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm font-medium rounded"
                    style={{
                      backgroundColor: colorTheme.accent + "20",
                      color: colorTheme.primary,
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右側：大圖 */}
        <div className="w-full lg:w-2/3">
          <img
            src={heroImage}
            alt={title}
            className="w-full h-auto object-cover rounded-lg shadow-lg"
            style={{
              maxHeight: "600px",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    </section>
  );
};
