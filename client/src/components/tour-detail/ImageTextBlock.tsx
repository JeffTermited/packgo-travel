/**
 * ImageTextBlock Component (Sipincollection Style)
 * 圖文交錯區塊：左大右小 + 重疊
 */

import React from "react";

export interface ImageTextBlockProps {
  title: string;
  description: string;
  mainImage: string;
  mainImageAlt: string;
  smallImage?: string;
  smallImageAlt?: string;
  layout?: "left" | "right"; // 主圖在左還是右
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
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
}) => {
  return (
    <section className="w-full py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div
          className={`flex flex-col ${
            layout === "left" ? "lg:flex-row" : "lg:flex-row-reverse"
          } items-center gap-8 lg:gap-12`}
        >
          {/* 圖片區塊（左大右小 + 重疊） */}
          <div className="w-full lg:w-3/5 relative">
            {/* 主圖 */}
            <img
              src={mainImage}
              alt={mainImageAlt}
              className="w-full h-auto object-cover rounded-lg shadow-lg"
              style={{
                maxHeight: "500px",
                objectFit: "cover",
              }}
            />

            {/* 小圖（重疊在主圖右下角） */}
            {smallImage && (
              <img
                src={smallImage}
                alt={smallImageAlt || ""}
                className="absolute bottom-4 right-4 w-32 h-32 lg:w-40 lg:h-40 object-cover rounded-lg shadow-xl border-4 border-white"
                style={{
                  objectFit: "cover",
                }}
              />
            )}
          </div>

          {/* 文字區塊 */}
          <div className="w-full lg:w-2/5 flex flex-col gap-4">
            <h2
              className="text-2xl lg:text-3xl font-serif font-bold"
              style={{ color: colorTheme.primary }}
            >
              {title}
            </h2>

            <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
