/**
 * NoticeSection Component
 * 注意事項區塊 - 顯示行程注意事項、簽證要求、健康提醒等重要資訊
 */

import React from "react";
import { AlertCircle, FileText, Heart, Phone } from "lucide-react";

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

export const NoticeSection: React.FC<NoticeSectionProps> = ({
  noticeDetailed,
  colorTheme,
}) => {
  // 預設注意事項（當資料庫為空時使用）
  const defaultNotice: NoticeDetailed = {
    preparation: [
      "請確認護照效期至少6個月以上，並檢查簽證要求。",
      "建議提前2小時抵達機場辦理登機手續。",
      "請攜帶足夠的當地貨幣或信用卡，部分地區可能不接受外幣。",
      "建議攜帶輕便行李，避免超重費用。",
    ],
    culturalNotes: [
      "尊重當地文化習俗，進入宗教場所請穿著得體。",
      "拍照前請先徵得當地居民同意。",
      "用餐時請注意當地禮儀，避免浪費食物。",
    ],
    healthSafety: [
      "建議出發前諮詢醫生，確認是否需要接種疫苗。",
      "請攜帶常用藥品及個人醫療用品。",
      "注意飲食衛生，避免生食或不潔食物。",
      "購買旅遊保險，確保行程期間的醫療保障。",
    ],
    emergency: [
      "緊急聯絡電話：+886-2-xxxx-xxxx（24小時客服）",
      "當地緊急救援電話：請參考行前說明會資料",
      "遺失護照請立即聯絡當地台灣駐外單位。",
      "如遇緊急狀況，請立即聯絡領隊或導遊。",
    ],
  };

  // 使用資料庫資料或預設資料
  const notice = noticeDetailed || defaultNotice;
  const hasData = noticeDetailed && (
    (noticeDetailed.preparation && noticeDetailed.preparation.length > 0) ||
    (noticeDetailed.culturalNotes && noticeDetailed.culturalNotes.length > 0) ||
    (noticeDetailed.healthSafety && noticeDetailed.healthSafety.length > 0) ||
    (noticeDetailed.emergency && noticeDetailed.emergency.length > 0)
  );

  // 如果沒有資料，使用預設資料
  const displayNotice = hasData ? notice : defaultNotice;

  return (
    <section id="notice" className="w-full py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl lg:text-4xl font-serif font-bold text-center mb-8 lg:mb-12"
          style={{ color: colorTheme.primary }}
        >
          注意事項
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 行前準備 */}
          {displayNotice.preparation && displayNotice.preparation.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: colorTheme.accent + "20" }}
                >
                  <FileText
                    className="h-5 w-5"
                    style={{ color: colorTheme.accent }}
                  />
                </div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: colorTheme.primary }}
                >
                  行前準備
                </h3>
              </div>
              <ul className="space-y-3">
                {displayNotice.preparation.map((item, index) => (
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
          {displayNotice.culturalNotes && displayNotice.culturalNotes.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: "#3B82F6" + "20" }}
                >
                  <AlertCircle
                    className="h-5 w-5"
                    style={{ color: "#3B82F6" }}
                  />
                </div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: colorTheme.primary }}
                >
                  文化禮儀
                </h3>
              </div>
              <ul className="space-y-3">
                {displayNotice.culturalNotes.map((item, index) => (
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
          {displayNotice.healthSafety && displayNotice.healthSafety.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: "#10B981" + "20" }}
                >
                  <Heart
                    className="h-5 w-5"
                    style={{ color: "#10B981" }}
                  />
                </div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: colorTheme.primary }}
                >
                  健康安全
                </h3>
              </div>
              <ul className="space-y-3">
                {displayNotice.healthSafety.map((item, index) => (
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
          {displayNotice.emergency && displayNotice.emergency.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: "#EF4444" + "20" }}
                >
                  <Phone
                    className="h-5 w-5"
                    style={{ color: "#EF4444" }}
                  />
                </div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: colorTheme.primary }}
                >
                  緊急聯絡
                </h3>
              </div>
              <ul className="space-y-3">
                {displayNotice.emergency.map((item, index) => (
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
              style={{ color: colorTheme.accent }}
            />
            <div>
              <h4
                className="font-bold mb-2"
                style={{ color: colorTheme.primary }}
              >
                重要提醒
              </h4>
              <p className="text-gray-700 leading-relaxed text-sm">
                以上注意事項僅供參考，實際行程可能因天氣、交通、政治等不可抗力因素而調整。出發前請務必參加行前說明會，並詳閱旅遊契約書及相關文件。如有任何疑問，請洽詢客服人員。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
