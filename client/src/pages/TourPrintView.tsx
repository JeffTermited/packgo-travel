/**
 * TourPrintView.tsx
 * 專屬列印/PDF 版行程頁面
 * 設計特點：
 * - A4 紙張專用排版 (210mm x 297mm)
 * - 專業旅行社行程表風格
 * - 清晰的分頁控制
 * - 適合列印和 PDF 下載
 */

import React, { useEffect, useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { 
  Printer,
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  Utensils,
  Building,
  Check,
  X,
  Phone,
  Mail,
  Globe
} from "lucide-react";

// 解析 JSON 字串
const parseJSON = (str: string | null | undefined, defaultValue: any = null) => {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
};

// 根據目的地獲取主題色
const getThemeColor = (country: string) => {
  const countryLower = country?.toLowerCase() || "";
  
  if (countryLower.includes("日本") || countryLower.includes("japan")) {
    return { primary: "#BE185D", secondary: "#EC4899", light: "#FDF2F8" };
  }
  if (countryLower.includes("韓國") || countryLower.includes("korea")) {
    return { primary: "#1E40AF", secondary: "#3B82F6", light: "#EFF6FF" };
  }
  if (countryLower.includes("泰國") || countryLower.includes("thailand")) {
    return { primary: "#B45309", secondary: "#F59E0B", light: "#FFFBEB" };
  }
  if (countryLower.includes("歐洲") || countryLower.includes("europe")) {
    return { primary: "#0F766E", secondary: "#14B8A6", light: "#F0FDFA" };
  }
  if (countryLower.includes("台灣") || countryLower.includes("taiwan")) {
    return { primary: "#991B1B", secondary: "#DC2626", light: "#FEF2F2" };
  }
  
  return { primary: "#0A0A0A", secondary: "#374151", light: "#F9FAFB" };
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  });
};

export default function TourPrintView() {
  const [, params] = useRoute("/tours/:id/print");
  const [, setLocation] = useLocation();
  const tourId = params?.id ? parseInt(params.id) : null;
  const printRef = useRef<HTMLDivElement>(null);
  
  // 獲取行程資料
  const { data: tour, isLoading, error } = trpc.tours.getById.useQuery(
    { id: tourId! },
    { enabled: !!tourId }
  );
  
  // 頁面載入後自動觸發列印
  useEffect(() => {
    if (tour && !isLoading) {
      // 延遲一下讓頁面完全渲染
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tour, isLoading]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">載入行程資料中...</p>
        </div>
      </div>
    );
  }
  
  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">無法載入行程資料</p>
          <Button onClick={() => setLocation("/")}>返回首頁</Button>
        </div>
      </div>
    );
  }
  
  const themeColor = getThemeColor(tour.destinationCountry || "");
  const dailyItinerary = parseJSON(tour.dailyItinerary, []);
  const inclusions = parseJSON(tour.includes, []);
  const exclusions = parseJSON(tour.excludes, []);
  const notes = parseJSON(tour.notes, []);
  const keyFeatures = parseJSON(tour.keyFeatures, []);
  
  return (
    <>
      {/* 列印控制按鈕（螢幕上顯示，列印時隱藏） */}
      <div className="print:hidden fixed top-4 left-4 z-50 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation(`/tours/${tourId}`)}
          className="bg-white shadow-md"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回行程
        </Button>
        <Button
          size="sm"
          onClick={() => window.print()}
          className="bg-black text-white shadow-md"
        >
          <Printer className="h-4 w-4 mr-2" />
          列印 / 下載 PDF
        </Button>
      </div>
      
      {/* 列印版內容 */}
      <div ref={printRef} className="print-document bg-white">
        
        {/* ===== 封面頁 ===== */}
        <div className="print-page print-cover-page">
          {/* 公司 Logo 和名稱 */}
          <div className="print-header">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="PACK&GO" 
                className="h-12 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">PACK&GO 旅行社</h1>
                <p className="text-sm text-gray-500">讓旅行更美好</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>行程編號：{tour.productCode || `T${tour.id}`}</p>
              <p>列印日期：{new Date().toLocaleDateString("zh-TW")}</p>
            </div>
          </div>
          
          {/* 行程封面圖 */}
          <div className="print-cover-image">
            {tour.heroImage ? (
              <img 
                src={tour.heroImage} 
                alt={tour.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: themeColor.light }}
              >
                <Globe className="h-24 w-24 text-gray-300" />
              </div>
            )}
            <div className="print-cover-overlay">
              <div className="print-cover-content">
                <div 
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-3"
                  style={{ backgroundColor: themeColor.primary, color: "white" }}
                >
                  {tour.destinationCountry || "精選行程"}
                </div>
                <h1 className="print-tour-title">{tour.title}</h1>
                <div className="print-tour-meta">
                  <span><Calendar className="inline h-4 w-4 mr-1" />{tour.duration}天</span>
                  <span><MapPin className="inline h-4 w-4 mr-1" />{tour.destination || tour.destinationCountry}</span>
                  <span><Users className="inline h-4 w-4 mr-1" />10-25人</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 行程簡介 */}
          <div className="print-intro">
            <h2 className="print-section-title" style={{ color: themeColor.primary }}>
              行程簡介
            </h2>
            <p className="print-intro-text">{tour.description}</p>
          </div>
          
          {/* 行程亮點 */}
          {keyFeatures.length > 0 && (
            <div className="print-highlights">
              <h3 className="text-sm font-bold text-gray-700 mb-2">行程亮點</h3>
              <ul className="print-highlights-list">
                {keyFeatures.slice(0, 6).map((feature: any, idx: number) => (
                  <li key={idx} className="print-highlight-item">
                    <Check className="h-4 w-4 flex-shrink-0" style={{ color: themeColor.secondary }} />
                    <span>{typeof feature === 'string' ? feature : feature.title || feature.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* 頁腳 */}
          <div className="print-page-footer">
            <span>PACK&GO 旅行社</span>
            <span>第 1 頁</span>
          </div>
        </div>
        
        {/* ===== 每日行程頁 ===== */}
        {dailyItinerary.map((day: any, dayIndex: number) => (
          <div key={dayIndex} className="print-page print-itinerary-page">
            {/* 頁眉 */}
            <div className="print-page-header">
              <span className="font-medium">{tour.title}</span>
              <span className="text-gray-500">行程編號：{tour.productCode || `T${tour.id}`}</span>
            </div>
            
            {/* 日期標題 */}
            <div 
              className="print-day-header"
              style={{ backgroundColor: themeColor.light, borderLeftColor: themeColor.primary }}
            >
              <div className="print-day-number" style={{ backgroundColor: themeColor.primary }}>
                DAY {day.day || dayIndex + 1}
              </div>
              <div className="print-day-title">
                <h2>{day.title || `第${day.day || dayIndex + 1}天`}</h2>
                {day.date && <span className="text-sm text-gray-500">{formatDate(day.date)}</span>}
              </div>
            </div>
            
            {/* 行程描述 */}
            {day.description && (
              <div className="print-day-description">
                <p>{day.description}</p>
              </div>
            )}
            
            {/* 活動列表 */}
            {day.activities && day.activities.length > 0 && (
              <div className="print-activities">
                <h3 className="print-subsection-title">
                  <Clock className="h-4 w-4" style={{ color: themeColor.secondary }} />
                  今日行程
                </h3>
                <div className="print-activities-list">
                  {day.activities.map((activity: any, actIdx: number) => (
                    <div key={actIdx} className="print-activity-item">
                      <div 
                        className="print-activity-time"
                        style={{ color: themeColor.primary }}
                      >
                        {activity.time || `${9 + actIdx}:00`}
                      </div>
                      <div className="print-activity-content">
                        <span className="font-medium">{activity.title || activity.name || activity}</span>
                        {activity.description && (
                          <span className="text-gray-500 text-sm ml-2">- {activity.description}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 餐食安排 */}
            <div className="print-meals">
              <h3 className="print-subsection-title">
                <Utensils className="h-4 w-4" style={{ color: themeColor.secondary }} />
                今日餐食
              </h3>
              <div className="print-meals-grid">
                <div className="print-meal-item">
                  <span className="print-meal-label">早餐</span>
                  <span className="print-meal-value">{day.breakfast || "飯店內用"}</span>
                </div>
                <div className="print-meal-item">
                  <span className="print-meal-label">午餐</span>
                  <span className="print-meal-value">{day.lunch || "當地風味餐"}</span>
                </div>
                <div className="print-meal-item">
                  <span className="print-meal-label">晚餐</span>
                  <span className="print-meal-value">{day.dinner || "飯店內用"}</span>
                </div>
              </div>
            </div>
            
            {/* 住宿資訊 */}
            {day.hotel && (
              <div className="print-hotel">
                <h3 className="print-subsection-title">
                  <Building className="h-4 w-4" style={{ color: themeColor.secondary }} />
                  今晚住宿
                </h3>
                <div className="print-hotel-info">
                  <span className="font-medium">{day.hotel}</span>
                  {day.hotelAddress && (
                    <span className="text-gray-500 text-sm ml-2">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {day.hotelAddress}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* 頁腳 */}
            <div className="print-page-footer">
              <span>PACK&GO 旅行社</span>
              <span>第 {dayIndex + 2} 頁</span>
            </div>
          </div>
        ))}
        
        {/* ===== 費用說明頁 ===== */}
        <div className="print-page print-pricing-page">
          {/* 頁眉 */}
          <div className="print-page-header">
            <span className="font-medium">{tour.title}</span>
            <span className="text-gray-500">費用說明</span>
          </div>
          
          <h2 className="print-section-title" style={{ color: themeColor.primary }}>
            費用說明
          </h2>
          
          {/* 價格資訊 */}
          <div className="print-price-box" style={{ backgroundColor: themeColor.light }}>
            <div className="print-price-label">團費</div>
            <div className="print-price-value" style={{ color: themeColor.primary }}>
              NT$ {tour.price?.toLocaleString() || "請洽詢"}
              <span className="text-sm font-normal text-gray-500"> /人</span>
            </div>
          </div>
          
          {/* 費用包含 */}
          <div className="print-inclusions">
            <h3 className="print-subsection-title">
              <Check className="h-4 w-4 text-green-600" />
              費用包含
            </h3>
            <ul className="print-list">
              {inclusions.length > 0 ? (
                inclusions.map((item: string, idx: number) => (
                  <li key={idx} className="print-list-item">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="print-list-item"><Check className="h-4 w-4 text-green-600" /><span>全程住宿費用</span></li>
                  <li className="print-list-item"><Check className="h-4 w-4 text-green-600" /><span>行程中標示之餐食</span></li>
                  <li className="print-list-item"><Check className="h-4 w-4 text-green-600" /><span>行程中交通接駁</span></li>
                  <li className="print-list-item"><Check className="h-4 w-4 text-green-600" /><span>專業導遊服務</span></li>
                  <li className="print-list-item"><Check className="h-4 w-4 text-green-600" /><span>行程中景點門票</span></li>
                </>
              )}
            </ul>
          </div>
          
          {/* 費用不含 */}
          <div className="print-exclusions">
            <h3 className="print-subsection-title">
              <X className="h-4 w-4 text-red-600" />
              費用不含
            </h3>
            <ul className="print-list">
              {exclusions.length > 0 ? (
                exclusions.map((item: string, idx: number) => (
                  <li key={idx} className="print-list-item">
                    <X className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="print-list-item"><X className="h-4 w-4 text-red-600" /><span>國際機票或往返交通</span></li>
                  <li className="print-list-item"><X className="h-4 w-4 text-red-600" /><span>個人護照及簽證費用</span></li>
                  <li className="print-list-item"><X className="h-4 w-4 text-red-600" /><span>旅遊保險</span></li>
                  <li className="print-list-item"><X className="h-4 w-4 text-red-600" /><span>個人消費及購物</span></li>
                  <li className="print-list-item"><X className="h-4 w-4 text-red-600" /><span>小費及服務費</span></li>
                </>
              )}
            </ul>
          </div>
          
          {/* 頁腳 */}
          <div className="print-page-footer">
            <span>PACK&GO 旅行社</span>
            <span>第 {dailyItinerary.length + 2} 頁</span>
          </div>
        </div>
        
        {/* ===== 注意事項頁 ===== */}
        <div className="print-page print-notes-page">
          {/* 頁眉 */}
          <div className="print-page-header">
            <span className="font-medium">{tour.title}</span>
            <span className="text-gray-500">注意事項</span>
          </div>
          
          <h2 className="print-section-title" style={{ color: themeColor.primary }}>
            注意事項
          </h2>
          
          {/* 注意事項列表 */}
          <div className="print-notes-content">
            {notes.length > 0 ? (
              notes.map((note: any, idx: number) => (
                <div key={idx} className="print-note-section">
                  {typeof note === 'object' ? (
                    <>
                      <h3 className="print-note-title">{note.title || `注意事項 ${idx + 1}`}</h3>
                      {note.items ? (
                        <ul className="print-note-list">
                          {note.items.map((item: string, itemIdx: number) => (
                            <li key={itemIdx}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{note.content || note.description}</p>
                      )}
                    </>
                  ) : (
                    <p>{note}</p>
                  )}
                </div>
              ))
            ) : (
              <>
                <div className="print-note-section">
                  <h3 className="print-note-title">行前準備</h3>
                  <ul className="print-note-list">
                    <li>請攜帶有效身分證件（身分證或護照）</li>
                    <li>建議攜帶輕便衣物和防曬用品</li>
                    <li>準備舒適的步行鞋</li>
                    <li>攜帶個人常用藥物</li>
                  </ul>
                </div>
                <div className="print-note-section">
                  <h3 className="print-note-title">集合資訊</h3>
                  <ul className="print-note-list">
                    <li>請於出發前 30 分鐘抵達集合地點</li>
                    <li>領隊會於出發前一天以簡訊通知詳細集合資訊</li>
                  </ul>
                </div>
                <div className="print-note-section">
                  <h3 className="print-note-title">取消政策</h3>
                  <ul className="print-note-list">
                    <li>出發前 31 天以上取消，退還全額團費</li>
                    <li>出發前 21-30 天取消，收取團費 10%</li>
                    <li>出發前 2-20 天取消，收取團費 30%</li>
                    <li>出發前 1 天取消，收取團費 50%</li>
                    <li>出發當天取消或未到，恕不退費</li>
                  </ul>
                </div>
              </>
            )}
          </div>
          
          {/* 聯絡資訊 */}
          <div className="print-contact-box" style={{ backgroundColor: themeColor.light }}>
            <h3 className="font-bold mb-3" style={{ color: themeColor.primary }}>聯絡我們</h3>
            <div className="print-contact-grid">
              <div className="print-contact-item">
                <Phone className="h-4 w-4" style={{ color: themeColor.secondary }} />
                <span>+1 (510) 634-2307</span>
              </div>
              <div className="print-contact-item">
                <Mail className="h-4 w-4" style={{ color: themeColor.secondary }} />
                <span>info@packgo.com</span>
              </div>
              <div className="print-contact-item">
                <Globe className="h-4 w-4" style={{ color: themeColor.secondary }} />
                <span>www.packgo.com</span>
              </div>
            </div>
          </div>
          
          {/* 頁腳 */}
          <div className="print-page-footer">
            <span>PACK&GO 旅行社</span>
            <span>第 {dailyItinerary.length + 3} 頁</span>
          </div>
        </div>
        
      </div>
      
      {/* 列印專用樣式 */}
      <style>{`
        /* 螢幕顯示樣式 */
        @media screen {
          .print-document {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
          }
          
          .print-page {
            background: white;
            margin-bottom: 20px;
            padding: 20mm 15mm;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            min-height: 297mm;
            position: relative;
          }
        }
        
        /* 列印樣式 */
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 12mm 20mm 12mm;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .print-document {
            background: white;
          }
          
          .print-page {
            page-break-after: always;
            padding: 0;
            min-height: auto;
          }
          
          .print-page:last-child {
            page-break-after: auto;
          }
        }
        
        /* 通用樣式 */
        .print-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15mm;
          padding-bottom: 5mm;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .print-page-header {
          display: flex;
          justify-content: space-between;
          font-size: 10pt;
          color: #6b7280;
          margin-bottom: 8mm;
          padding-bottom: 3mm;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .print-page-footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          font-size: 9pt;
          color: #9ca3af;
          padding-top: 3mm;
          border-top: 1px solid #e5e7eb;
        }
        
        .print-cover-image {
          position: relative;
          width: 100%;
          height: 80mm;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 10mm;
        }
        
        .print-cover-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          padding: 15mm 8mm 8mm;
        }
        
        .print-cover-content {
          color: white;
        }
        
        .print-tour-title {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 3mm;
          line-height: 1.3;
        }
        
        .print-tour-meta {
          display: flex;
          gap: 15px;
          font-size: 10pt;
          opacity: 0.9;
        }
        
        .print-section-title {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 5mm;
          padding-bottom: 2mm;
          border-bottom: 2px solid currentColor;
        }
        
        .print-subsection-title {
          font-size: 11pt;
          font-weight: 600;
          margin-bottom: 3mm;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #374151;
        }
        
        .print-intro {
          margin-bottom: 8mm;
        }
        
        .print-intro-text {
          font-size: 10pt;
          line-height: 1.7;
          color: #4b5563;
          text-align: justify;
        }
        
        .print-highlights {
          margin-bottom: 8mm;
        }
        
        .print-highlights-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2mm 8mm;
        }
        
        .print-highlight-item {
          display: flex;
          align-items: flex-start;
          gap: 4px;
          font-size: 9pt;
          color: #4b5563;
        }
        
        .print-day-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4mm 5mm;
          border-left: 4px solid;
          margin-bottom: 5mm;
        }
        
        .print-day-number {
          color: white;
          font-size: 10pt;
          font-weight: bold;
          padding: 2mm 4mm;
          border-radius: 4px;
        }
        
        .print-day-title h2 {
          font-size: 12pt;
          font-weight: bold;
          color: #1f2937;
        }
        
        .print-day-description {
          font-size: 10pt;
          line-height: 1.6;
          color: #4b5563;
          margin-bottom: 5mm;
          padding-left: 5mm;
          border-left: 2px solid #e5e7eb;
        }
        
        .print-activities {
          margin-bottom: 5mm;
        }
        
        .print-activities-list {
          display: flex;
          flex-direction: column;
          gap: 2mm;
        }
        
        .print-activity-item {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: 10pt;
        }
        
        .print-activity-time {
          font-weight: 600;
          min-width: 40px;
        }
        
        .print-meals {
          margin-bottom: 5mm;
        }
        
        .print-meals-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5mm;
        }
        
        .print-meal-item {
          background: #f9fafb;
          padding: 3mm;
          border-radius: 4px;
          text-align: center;
        }
        
        .print-meal-label {
          display: block;
          font-size: 9pt;
          color: #6b7280;
          margin-bottom: 1mm;
        }
        
        .print-meal-value {
          font-size: 10pt;
          font-weight: 500;
          color: #1f2937;
        }
        
        .print-hotel {
          margin-bottom: 5mm;
        }
        
        .print-hotel-info {
          font-size: 10pt;
          padding: 3mm;
          background: #f9fafb;
          border-radius: 4px;
        }
        
        .print-price-box {
          padding: 5mm;
          border-radius: 8px;
          margin-bottom: 8mm;
          text-align: center;
        }
        
        .print-price-label {
          font-size: 10pt;
          color: #6b7280;
          margin-bottom: 2mm;
        }
        
        .print-price-value {
          font-size: 20pt;
          font-weight: bold;
        }
        
        .print-inclusions,
        .print-exclusions {
          margin-bottom: 6mm;
        }
        
        .print-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2mm 8mm;
        }
        
        .print-list-item {
          display: flex;
          align-items: flex-start;
          gap: 4px;
          font-size: 10pt;
          color: #4b5563;
        }
        
        .print-notes-content {
          margin-bottom: 8mm;
        }
        
        .print-note-section {
          margin-bottom: 5mm;
        }
        
        .print-note-title {
          font-size: 11pt;
          font-weight: 600;
          color: #374151;
          margin-bottom: 2mm;
        }
        
        .print-note-list {
          padding-left: 5mm;
          font-size: 10pt;
          color: #4b5563;
          line-height: 1.6;
        }
        
        .print-note-list li {
          margin-bottom: 1mm;
          list-style-type: disc;
        }
        
        .print-contact-box {
          padding: 5mm;
          border-radius: 8px;
        }
        
        .print-contact-grid {
          display: flex;
          gap: 15mm;
        }
        
        .print-contact-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10pt;
        }
      `}</style>
    </>
  );
}
