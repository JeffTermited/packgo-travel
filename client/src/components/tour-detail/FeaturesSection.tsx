/**
 * FeaturesSection Component (Sipincollection Style)
 * 特色區塊：三圖並排 + 金色標籤
 */

import React from "react";

export interface Feature {
  label: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

export interface FeaturesSectionProps {
  features: Feature[];
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  features,
  colorTheme,
}) => {
  // 只顯示前 3 個特色
  const displayFeatures = features.slice(0, 3);

  return (
    <section id="features" className="w-full py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* 標題 */}
        <h2
          className="text-3xl lg:text-4xl font-serif font-bold text-center mb-8 lg:mb-12"
          style={{ color: colorTheme.primary }}
        >
          行程特色
        </h2>

        {/* 三圖並排 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayFeatures.map((feature, index) => (
            <div key={index} className="flex flex-col gap-4">
              {/* 圖片 */}
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg shadow-md">
                <img
                  src={feature.image}
                  alt={feature.imageAlt}
                  className="w-full h-full object-contain"
                />

                {/* 金色標籤 */}
                <div
                  className="absolute top-4 left-4 px-4 py-2 rounded text-white font-bold text-sm"
                  style={{
                    backgroundColor: colorTheme.accent,
                  }}
                >
                  {feature.label}
                </div>
              </div>

              {/* 標題 */}
              <h3
                className="text-xl lg:text-2xl font-bold"
                style={{ color: colorTheme.primary }}
              >
                {feature.title}
              </h3>

              {/* 描述 */}
              <p className="text-sm lg:text-base text-gray-700 line-clamp-3">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
