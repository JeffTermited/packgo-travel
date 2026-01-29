/**
 * TourDetailSipin.tsx
 * Sipincollection 風格的行程詳情頁面
 * 整合所有新組件：StickyNav、HeroSection、FeaturesSection、ImageTextBlock、FullWidthSection
 */

import React, { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar, MapPin, DollarSign } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Import Sipincollection Style Components
import { StickyNav } from "@/components/tour-detail/StickyNav";
import { HeroSection } from "@/components/tour-detail/HeroSection";
import { FeaturesSection } from "@/components/tour-detail/FeaturesSection";
import { ImageTextBlock } from "@/components/tour-detail/ImageTextBlock";
import { FullWidthSection } from "@/components/tour-detail/FullWidthSection";
import { DailyItinerarySection } from "@/components/tour-detail/DailyItinerarySection";
import { CostExplanationSection } from "@/components/tour-detail/CostExplanationSection";
import { TransportationInfoSection } from "@/components/tour-detail/TransportationInfoSection";
import { NoticeSection } from "@/components/tour-detail/NoticeSection";
import { BackToTop } from "@/components/tour-detail/BackToTop";

// 解析 JSON 字串
const parseJSON = (str: string | null | undefined, defaultValue: any = null) => {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
};

// 預設配色（Pack&Go 品牌標準色）
const DEFAULT_COLOR_THEME = {
  primary: "#1A1A1A",   // 深灰黑（專業、穩重）
  secondary: "#F5F5F5", // 淺灰白（乾淨、現代）
  accent: "#E63946",    // 紅色（活力、冒險）
};

export default function TourDetailSipin() {
  // 支援多個路由路徑
  const [matchSipin, paramsSipin] = useRoute("/tours-sipin/:id");
  const [matchTours, paramsTours] = useRoute("/tours/:id");
  const params = paramsSipin || paramsTours;
  const [, navigate] = useLocation();
  const tourId = params?.id ? parseInt(params.id) : undefined;
  
  console.log('[TourDetailSipin] params:', params);
  console.log('[TourDetailSipin] tourId:', tourId);

  const { data: tour, isLoading, error } = trpc.tours.getById.useQuery(
    { id: tourId! },
    { enabled: !!tourId }
  );

  const [colorTheme, setColorTheme] = useState(DEFAULT_COLOR_THEME);

  useEffect(() => {
    if (tour && tour.colorTheme) {
      const parsedTheme = parseJSON(tour.colorTheme, DEFAULT_COLOR_THEME);
      setColorTheme(parsedTheme);
    }
  }, [tour]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center bg-white">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">找不到此行程</h2>
              <p className="text-gray-600 mb-6">
                {error ? '資料載入失敗，請稍後再試。' : '此行程不存在或已被移除。'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/")} className="bg-primary hover:bg-red-700 text-white rounded-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首頁
              </Button>
              <Button onClick={() => navigate("/search")} variant="outline" className="border-gray-300 rounded-full">
                瀏覽所有行程
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 解析資料（加入錯誤處理）
  const heroImage = tour.heroImage || tour.imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200";
  const heroSubtitle = tour.heroSubtitle || `探索 ${tour.destinationCountry || '未知目的地'} ${tour.destinationCity || ''} 的美好`;
  
  // 安全解析 keyFeatures，支援字串陣列和物件陣列
  let keyFeatures = [];
  try {
    keyFeatures = parseJSON(tour.keyFeatures, []);
    if (!Array.isArray(keyFeatures)) {
      console.warn('[TourDetailSipin] keyFeatures is not an array, using empty array');
      keyFeatures = [];
    }
  } catch (error) {
    console.error('[TourDetailSipin] Error parsing keyFeatures:', error);
    keyFeatures = [];
  }
  
  // 從 keyFeatures 物件陣列中提取 title 欄位作為字串陣列
  const keywords = keyFeatures.slice(0, 5).map((feature: any) => {
    if (typeof feature === 'string') return feature;
    if (typeof feature === 'object' && feature !== null) {
      return feature.title || feature.subtitle || feature.description || '';
    }
    return '';
  }).filter((keyword: string) => keyword.length > 0);

  // 準備 Features 資料（加入錯誤處理）
  const attractions = parseJSON(tour.attractions, []);
  const features = Array.isArray(attractions) ? attractions.slice(0, 3).map((attr: any, index: number) => ({
    label: `特色 ${index + 1}`,
    title: attr?.name || `景點 ${index + 1}`,
    description: attr?.description || "探索這個令人驚嘆的目的地",
    image: attr?.image || `https://images.unsplash.com/photo-${1488646953014 + index}?w=600`,
    imageAlt: attr?.imageAlt || attr?.name || `景點 ${index + 1}`,
  })) : [];

  // 準備 ImageTextBlock 資料（加入錯誤處理）
  const hotels = parseJSON(tour.hotels, []);
  const firstHotel = Array.isArray(hotels) && hotels.length > 0 ? hotels[0] : null;

  // 準備 FullWidthSection 資料（加入錯誤處理）
  const meals = parseJSON(tour.meals, []);
  const smallImages = Array.isArray(meals) ? meals.slice(0, 3).map((meal: any) => ({
    url: meal?.image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200",
    alt: meal?.name || "美食",
  })) : [];

  // 準備每日行程資料（加入錯誤處理）
  const itineraryDetailed = parseJSON(tour.itineraryDetailed, []);
  if (!Array.isArray(itineraryDetailed)) {
    console.warn('[TourDetailSipin] itineraryDetailed is not an array');
  }

  // 準備費用說明資料（加入錯誤處理）
  const costExplanation = parseJSON(tour.costExplanation, null);
  if (costExplanation && typeof costExplanation !== 'object') {
    console.warn('[TourDetailSipin] costExplanation is not an object');
  }

  // 準備交通資訊（加入錯誤處理）
  const transportationInfo = parseJSON(tour.flights, null);
  if (transportationInfo && typeof transportationInfo !== 'object') {
    console.warn('[TourDetailSipin] transportationInfo is not an object');
  }
  
  // 判斷是否需要顯示獨立的航班資訊區塊
  // 只有飛機行程才需要顯示獨立的航班資訊
  const shouldShowFlightSection = transportationInfo && 
    (transportationInfo.type === 'FLIGHT' || !transportationInfo.type);

  // 準備注意事項資料（加入錯誤處理）
  const noticeDetailed = parseJSON(tour.noticeDetailed, null);
  if (noticeDetailed && typeof noticeDetailed !== 'object') {
    console.warn('[TourDetailSipin] noticeDetailed is not an object');
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Sticky Navigation */}
      <StickyNav 
        tourTitle={tour.title} 
        colorTheme={colorTheme} 
        transportationType={transportationInfo?.type || null}
      />

      {/* Hero Section */}
      <HeroSection
        title={tour.title}
        subtitle={heroSubtitle}
        keywords={keywords}
        heroImage={heroImage}
        colorTheme={colorTheme}
      />

      {/* 下載按鈕 */}
      <div className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 flex justify-center">
          <Button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-medium shadow-md hover:shadow-lg transition-all"
            style={{
              backgroundColor: colorTheme.accent,
            }}
          >
            <Download className="h-4 w-4" />
            下載行程 PDF
          </Button>
        </div>
      </div>

      {/* Features Section */}
      {features.length > 0 && (
        <FeaturesSection features={features} colorTheme={colorTheme} />
      )}

      {/* Image Text Block - Hotels */}
      {firstHotel && (
        <ImageTextBlock
          title={firstHotel.name || "精選住宿"}
          description={firstHotel.description || "體驗當地最優質的住宿環境"}
          mainImage={firstHotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"}
          mainImageAlt={firstHotel.imageAlt || firstHotel.name || "飯店"}
          layout="left"
          colorTheme={colorTheme}
        />
      )}

      {/* Full Width Section - Meals */}
      {meals.length > 0 && (
        <FullWidthSection
          title="美食饗宴"
          description="品嚐當地特色美食，體驗最道地的飲食文化"
          mainImage={meals[0]?.image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"}
          mainImageAlt={meals[0]?.name || "美食"}
          smallImages={smallImages}
          colorTheme={colorTheme}
        />
      )}

      {/* 每日行程區塊 */}
      {itineraryDetailed.length > 0 && (
        <DailyItinerarySection
          itineraries={itineraryDetailed}
          colorTheme={colorTheme}
        />
      )}

      {/* 費用說明區塊 */}
      {costExplanation && (
        <CostExplanationSection
          costExplanation={costExplanation}
          colorTheme={colorTheme}
        />
      )}

      {/* 航班資訊區塊 - 只有飛機行程才顯示 */}
      {shouldShowFlightSection && (
        <TransportationInfoSection
          transportationInfo={transportationInfo}
          colorTheme={colorTheme}
        />
      )}

      {/* 注意事項區塊 */}
      <NoticeSection
        noticeDetailed={noticeDetailed}
        colorTheme={colorTheme}
      />

      {/* 基本資訊區塊 */}
      <section id="info" className="w-full py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2
            className="text-3xl lg:text-4xl font-serif font-bold text-center mb-8 lg:mb-12"
            style={{ color: colorTheme.primary }}
          >
            行程資訊
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 出發日期 */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm">
              <Calendar className="h-6 w-6 flex-shrink-0" style={{ color: colorTheme.accent }} />
              <div>
                <h3 className="font-bold text-lg mb-2" style={{ color: colorTheme.primary }}>
                  出發日期
                </h3>
                <p className="text-gray-700">
                  {tour.startDate
                    ? new Date(tour.startDate).toLocaleDateString("zh-TW")
                    : "請洽客服"}
                </p>
              </div>
            </div>

            {/* 目的地 */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm">
              <MapPin className="h-6 w-6 flex-shrink-0" style={{ color: colorTheme.accent }} />
              <div>
                <h3 className="font-bold text-lg mb-2" style={{ color: colorTheme.primary }}>
                  目的地
                </h3>
                <p className="text-gray-700">
                  {tour.destinationCountry} {tour.destinationCity}
                </p>
              </div>
            </div>

            {/* 價格 */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm">
              <DollarSign className="h-6 w-6 flex-shrink-0" style={{ color: colorTheme.accent }} />
              <div>
                <h3 className="font-bold text-lg mb-2" style={{ color: colorTheme.primary }}>
                  價格
                </h3>
                <p className="text-2xl font-bold" style={{ color: colorTheme.accent }}>
                  NT$ {tour.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">{tour.priceUnit || "人/起"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-3xl lg:text-4xl font-serif font-bold mb-6"
            style={{ color: colorTheme.primary }}
          >
            準備好開始您的旅程了嗎？
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            立即預訂，體驗難忘的旅行回憶
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              style={{
                backgroundColor: colorTheme.accent,
                color: "white",
              }}
              onClick={() => {
                // TODO: 實作預訂功能
                alert("預訂功能開發中");
              }}
            >
              立即預訂
            </Button>
            <Button
              size="lg"
              variant="outline"
              style={{
                borderColor: colorTheme.primary,
                color: colorTheme.primary,
              }}
              onClick={() => {
                // TODO: 實作下載功能
                alert("下載功能開發中");
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              下載行程
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Back to Top Button */}
      <BackToTop colorTheme={colorTheme} />
    </div>
  );
}
