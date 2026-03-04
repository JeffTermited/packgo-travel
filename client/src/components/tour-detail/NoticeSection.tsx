/**
 * NoticeSection Component
 * 注意事項區塊 - 顯示行程注意事項、簽證要求、健康提醒等重要資訊
 */

import React from "react";
import { AlertCircle, FileText, Heart, Phone } from "lucide-react";
import { ensureReadableOnWhite } from "@/lib/colorUtils";
import { useLocale } from "@/contexts/LocaleContext";

export interface NoticeDetailed {
  preparation?: string[];
  culturalNotes?: string[];
  healthSafety?: string[];
  emergency?: string[];
}

export interface NoticeSectionProps {
  noticeDetailed: NoticeDetailed | null;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// 確保值是陣列的輔助函數
const ensureArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return [value];
  return [];
};

export const NoticeSection: React.FC<NoticeSectionProps> = ({
  noticeDetailed,
  colorTheme,
}) => {
  const { t } = useLocale();

  // 預設注意事項（當資料庫為空時使用）
  const defaultNotice: NoticeDetailed = {
    preparation: [
      t('tourDetail.notice.defaultPrep1'),
      t('tourDetail.notice.defaultPrep2'),
      t('tourDetail.notice.defaultPrep3'),
      t('tourDetail.notice.defaultPrep4'),
    ],
    culturalNotes: [
      t('tourDetail.notice.defaultCulture1'),
      t('tourDetail.notice.defaultCulture2'),
      t('tourDetail.notice.defaultCulture3'),
    ],
    healthSafety: [
      t('tourDetail.notice.defaultHealth1'),
      t('tourDetail.notice.defaultHealth2'),
      t('tourDetail.notice.defaultHealth3'),
      t('tourDetail.notice.defaultHealth4'),
    ],
    emergency: [
      t('tourDetail.notice.defaultEmergency1'),
      t('tourDetail.notice.defaultEmergency2'),
      t('tourDetail.notice.defaultEmergency3'),
      t('tourDetail.notice.defaultEmergency4'),
    ],
  };

  // 安全地獲取陣列資料
  const preparation = ensureArray(noticeDetailed?.preparation);
  const culturalNotes = ensureArray(noticeDetailed?.culturalNotes);
  const healthSafety = ensureArray(noticeDetailed?.healthSafety);
  const emergency = ensureArray(noticeDetailed?.emergency);

  // 檢查是否有資料
  const hasData = preparation.length > 0 || culturalNotes.length > 0 || 
                  healthSafety.length > 0 || emergency.length > 0;

  // 如果沒有資料，使用預設資料
  const displayPreparation = hasData ? preparation : defaultNotice.preparation!;
  const displayCulturalNotes = hasData ? culturalNotes : defaultNotice.culturalNotes!;
  const displayHealthSafety = hasData ? healthSafety : defaultNotice.healthSafety!;
  const displayEmergency = hasData ? emergency : defaultNotice.emergency!;

  return (
    <section id="notice" className="w-full py-8 lg:py-10 bg-white">
      <div className="container mx-auto px-4">
        <h2
          className="text-2xl lg:text-3xl font-serif font-bold text-center mb-6"
          style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
        >
          {t('tourDetail.sections.notice')}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 行前準備 */}
          {displayPreparation.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: colorTheme.accent + "20" }}
                >
                  <FileText
                    className="h-4 w-4"
                    style={{ color: ensureReadableOnWhite(colorTheme.accent) }}
                  />
                </div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
                >
                  {t('tourDetail.notice.preparation')}
                </h3>
              </div>
              <ul className="space-y-2">
                {displayPreparation.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: colorTheme.accent }}
                    >
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 文化禮儀 */}
          {displayCulturalNotes.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: "#3B82F6" + "20" }}
                >
                  <AlertCircle
                    className="h-4 w-4"
                    style={{ color: "#3B82F6" }}
                  />
                </div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
                >
                  {t('tourDetail.notice.culturalNotes')}
                </h3>
              </div>
              <ul className="space-y-2">
                {displayCulturalNotes.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: "#3B82F6" }}
                    >
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 健康安全 */}
          {displayHealthSafety.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: "#10B981" + "20" }}
                >
                  <Heart
                    className="h-4 w-4"
                    style={{ color: "#10B981" }}
                  />
                </div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
                >
                  {t('tourDetail.notice.healthSafety')}
                </h3>
              </div>
              <ul className="space-y-2">
                {displayHealthSafety.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: "#10B981" }}
                    >
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 緊急聯絡 */}
          {displayEmergency.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: "#EF4444" + "20" }}
                >
                  <Phone
                    className="h-4 w-4"
                    style={{ color: "#EF4444" }}
                  />
                </div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
                >
                  {t('tourDetail.notice.emergency')}
                </h3>
              </div>
              <ul className="space-y-2">
                {displayEmergency.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: "#EF4444" }}
                    >
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 免責聲明 */}
        <div
          className="mt-8 rounded-lg p-6"
          style={{
            backgroundColor: colorTheme.accent + "10",
            borderLeft: `4px solid ${colorTheme.accent}`,
          }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              className="h-6 w-6 flex-shrink-0 mt-0.5"
              style={{ color: ensureReadableOnWhite(colorTheme.accent) }}
            />
            <div>
              <h4
                className="font-bold mb-2"
                style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
              >
                {t('tourDetail.notice.importantReminder')}
              </h4>
              <p className="text-gray-700 leading-relaxed text-sm">
                {t('tourDetail.notice.disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
