/**
 * FeaturesSection Component (Sipincollection Style)
 * 特色區塊：大圖展示 + 支援 Inline Editing
 */

import React from "react";
import { EditableText } from "./EditableText";
import { EditableImage } from "./EditableImage";
import { useEditMode } from "@/contexts/EditModeContext";
import { ensureReadableOnWhite } from "@/lib/colorUtils";
import { useLocale } from "@/contexts/LocaleContext";

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
  tourId?: number;
  onUpdate?: (field: string, value: string) => Promise<void>;
  onImageUpload?: (file: File, path: string) => Promise<string>;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  features,
  colorTheme,
  tourId,
  onUpdate,
  onImageUpload,
}) => {
  const { isEditMode } = useEditMode();
  const { t } = useLocale();
  
  // 只顯示前 3 個特色
  const displayFeatures = features.slice(0, 3);

  if (displayFeatures.length === 0 && !isEditMode) {
    return null;
  }

  return (
    <section id="features" className="w-full py-12 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* 標題 */}
        <div className="text-center mb-10 lg:mb-14">
          <h2
            className="text-3xl lg:text-4xl font-serif font-bold mb-3"
            style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
          >
            {t('tourDetail.sections.features')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('tourDetail.sections.featuresSubtitle')}
          </p>
        </div>

        {/* 特色卡片 - Bento Grid 風格 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {displayFeatures.map((feature, index) => (
            <div
              key={index}
              className={`
                relative group overflow-hidden  shadow-lg
                ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}
              `}
            >
              {/* 圖片 */}
              <div className={`
                relative w-full overflow-hidden
                ${index === 0 ? 'aspect-[16/9] lg:aspect-[4/3]' : 'aspect-[4/3]'}
              `}>
                {isEditMode && onImageUpload ? (
                  <EditableImage
                    src={feature.image}
                    alt={feature.imageAlt}
                    onUpload={async (file) => {
                      const url = await onImageUpload(file, `feature-${index}`);
                      // 更新 attractions 陣列
                      const updatedFeatures = [...features];
                      updatedFeatures[index].image = url;
                      await onUpdate?.('attractions', JSON.stringify(updatedFeatures));
                      return url;
                    }}
                    isEditable={isEditMode}
                    aspectRatio={index === 0 ? "16/9" : "4/3"}
                    className="w-full h-full"
                  />
                ) : (
                  <img
                    src={feature.image}
                    alt={feature.imageAlt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              {/* 內容覆蓋層 */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                {/* 標籤 */}
                <div
                  className="inline-flex self-start px-3 py-1 rounded-lg text-sm font-bold text-white mb-3"
                  style={{ backgroundColor: colorTheme.accent }}
                >
                  {feature.label}
                </div>

                {/* 標題 */}
                {isEditMode && onUpdate ? (
                  <EditableText
                    value={feature.title}
                    onSave={async (newValue) => {
                      const updatedFeatures = [...features];
                      updatedFeatures[index].title = newValue;
                      await onUpdate('attractions', JSON.stringify(updatedFeatures));
                    }}
                    isEditable={isEditMode}
                    className={`font-bold text-white mb-2 ${index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl'}`}
                    as="h3"
                  />
                ) : (
                  <h3 className={`font-bold text-white mb-2 ${index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl'}`}>
                    {feature.title}
                  </h3>
                )}

                {/* 描述 */}
                {isEditMode && onUpdate ? (
                  <EditableText
                    value={feature.description}
                    onSave={async (newValue) => {
                      const updatedFeatures = [...features];
                      updatedFeatures[index].description = newValue;
                      await onUpdate('attractions', JSON.stringify(updatedFeatures));
                    }}
                    isEditable={isEditMode}
                    multiline
                    className={`text-white/90 ${index === 0 ? 'text-base lg:text-lg line-clamp-4' : 'text-sm line-clamp-3'}`}
                    as="p"
                  />
                ) : (
                  <p className={`text-white/90 ${index === 0 ? 'text-base lg:text-lg line-clamp-4' : 'text-sm line-clamp-3'}`}>
                    {feature.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
