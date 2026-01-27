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
    <section className="w-full py-6 lg:py-10 bg-gray-50">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        {/* 左側：直式標題 + 副標題 + 關鍵詞 */}
        <div className="w-full lg:w-1/3 flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* 直式標題（桌面版直排，手機版橫排） */}
          <h1
            className="vertical-title text-xl lg:text-2xl xl:text-3xl font-serif font-bold max-w-[180px] lg:max-w-[250px]"
            style={{
              color: colorTheme.primary,
              lineHeight: '1.6',
              letterSpacing: '0.12em',
            }}
          >
            {title.length > 30 ? title.slice(0, 30) + '...' : title}
          </h1>

          {/* 副標題 + 關鍵詞 */}
          <div className="flex flex-col gap-4">
            {subtitle && (
              <h2
                className="text-lg lg:text-xl font-bold"
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

        {/* 右側：大圖 (16:9 Aspect Ratio) */}
        <div className="w-full lg:w-2/3">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
            <img
              src={heroImage}
              alt={title}
              className="absolute top-0 left-0 w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
