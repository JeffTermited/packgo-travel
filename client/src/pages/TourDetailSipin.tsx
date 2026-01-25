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
  const [, params] = useRoute("/tours-sipin/:id");
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">找不到行程</h2>
          <Button onClick={() => navigate("/tours")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回行程列表
          </Button>
        </div>
      </div>
    );
  }

  // 解析資料
  const heroImage = tour.heroImage || tour.imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200";
  const heroSubtitle = tour.heroSubtitle || `探索 ${tour.destinationCountry} ${tour.destinationCity} 的美好`;
  const keyFeatures = parseJSON(tour.keyFeatures, []);
  const keywords = keyFeatures.slice(0, 5);

  // 準備 Features 資料
  const attractions = parseJSON(tour.attractions, []);
  const features = attractions.slice(0, 3).map((attr: any, index: number) => ({
    label: `特色 ${index + 1}`,
    title: attr.name || `景點 ${index + 1}`,
    description: attr.description || "探索這個令人驚嘆的目的地",
    image: attr.image || `https://images.unsplash.com/photo-${1488646953014 + index}?w=600`,
    imageAlt: attr.imageAlt || attr.name || `景點 ${index + 1}`,
  }));

  // 準備 ImageTextBlock 資料
  const hotels = parseJSON(tour.hotels, []);
  const firstHotel = hotels[0];

  // 準備 FullWidthSection 資料
  const meals = parseJSON(tour.meals, []);
  const smallImages = meals.slice(0, 3).map((meal: any) => ({
    url: meal.image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200",
    alt: meal.name || "美食",
  }));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Sticky Navigation */}
      <StickyNav tourTitle={tour.title} colorTheme={colorTheme} />

      {/* Hero Section */}
      <HeroSection
        title={tour.title}
        subtitle={heroSubtitle}
        keywords={keywords}
        heroImage={heroImage}
        colorTheme={colorTheme}
      />

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
    </div>
  );
}
