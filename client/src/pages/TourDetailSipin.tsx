/**
 * TourDetailSipin.tsx
 * Sipincollection 風格的行程詳情頁面
 * 支援 Inline Editing - 管理員可直接在頁面上編輯內容
 */

import React, { useEffect, useState, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar, MapPin, DollarSign, Pencil } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Import Edit Mode Context
import { EditModeProvider, useEditMode } from "@/contexts/EditModeContext";
import { EditModeToolbar, EditModeButton } from "@/components/tour-detail/EditModeToolbar";
import { EditableText } from "@/components/tour-detail/EditableText";

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
import { PriceEditDialog } from "@/components/tour-detail/PriceEditDialog";
import { ensureReadableOnWhite, getReadableColor } from "@/lib/colorUtils";

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
  primary: "#1A1A1A",
  secondary: "#F5F5F5",
  accent: "#E63946",
};

// 內部組件 - 使用 EditMode Context
function TourDetailContent() {
  const [matchSipin, paramsSipin] = useRoute("/tours-sipin/:id");
  const [matchSipinShort, paramsSipinShort] = useRoute("/sipin/:id");
  const [matchTours, paramsTours] = useRoute("/tours/:id");
  const params = paramsSipin || paramsSipinShort || paramsTours;
  const [, navigate] = useLocation();
  const tourId = params?.id ? parseInt(params.id) : undefined;
  // Using sonner toast directly
  const { isEditMode, canEdit } = useEditMode();
  
  const [showPriceDialog, setShowPriceDialog] = useState(false);

  const { data: tour, isLoading, error, refetch } = trpc.tours.getById.useQuery(
    { id: tourId! },
    { enabled: !!tourId }
  );

  const updateMutation = trpc.tours.patchField.useMutation({
    onSuccess: () => {
      toast.success("儲存成功", { description: "內容已更新" });
      refetch();
    },
    onError: (err) => {
      toast.error("儲存失敗", { description: err.message });
    },
  });

  const [colorTheme, setColorTheme] = useState(DEFAULT_COLOR_THEME);

  useEffect(() => {
    if (tour && tour.colorTheme) {
      const parsedTheme = parseJSON(tour.colorTheme, DEFAULT_COLOR_THEME);
      setColorTheme(parsedTheme);
    }
  }, [tour]);

  // 更新欄位的回調函數
  const handleUpdate = useCallback(async (field: string, value: string) => {
    if (!tourId) return;
    await updateMutation.mutateAsync({ id: tourId, field, value });
  }, [tourId, updateMutation]);

  // 圖片上傳的回調函數
  const handleImageUpload = useCallback(async (file: File, path: string): Promise<string> => {
    if (!tourId) {
      toast.error("上傳失敗", { description: "無效的行程 ID" });
      throw new Error("Invalid tour ID");
    }

    try {
      // 讀取檔案為 base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Image = await base64Promise;

      // 呼叫後端 API 上傳到 S3
      const response = await fetch(`/api/tours/${tourId}/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, path }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '上傳失敗');
      }

      const { url } = await response.json();
      toast.success("圖片上傳成功");
      return url;
    } catch (error: any) {
      toast.error("圖片上傳失敗", { description: error.message });
      throw error;
    }
  }, [tourId]);

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

  // 解析資料
  const heroImage = tour.heroImage || tour.imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200";
  const heroSubtitle = tour.heroSubtitle || `探索 ${tour.destinationCountry || '未知目的地'} ${tour.destinationCity || ''} 的美好`;
  
  // 安全解析 keyFeatures
  let keyFeatures = [];
  try {
    keyFeatures = parseJSON(tour.keyFeatures, []);
    if (!Array.isArray(keyFeatures)) keyFeatures = [];
  } catch {
    keyFeatures = [];
  }
  
  const keywords = keyFeatures.slice(0, 5).map((feature: any) => {
    if (typeof feature === 'string') return feature;
    if (typeof feature === 'object' && feature !== null) {
      return feature.title || feature.subtitle || feature.description || '';
    }
    return '';
  }).filter((keyword: string) => keyword.length > 0);

  // 準備 Features 資料
  const attractions = parseJSON(tour.attractions, []);
  const features = Array.isArray(attractions) ? attractions.slice(0, 3).map((attr: any, index: number) => ({
    label: `特色 ${index + 1}`,
    title: attr?.name || `景點 ${index + 1}`,
    description: attr?.description || "探索這個令人驚嘆的目的地",
    image: attr?.image || `https://images.unsplash.com/photo-${1488646953014 + index}?w=600`,
    imageAlt: attr?.imageAlt || attr?.name || `景點 ${index + 1}`,
  })) : [];

  // 準備飯店資料
  const hotels = parseJSON(tour.hotels, []);
  const firstHotel = Array.isArray(hotels) && hotels.length > 0 ? hotels[0] : null;

  // 準備餐食資料
  const meals = parseJSON(tour.meals, []);
  const smallImages = Array.isArray(meals) ? meals.slice(0, 3).map((meal: any) => ({
    url: meal?.image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200",
    alt: meal?.name || "美食",
  })) : [];

  // 準備每日行程資料
  const itineraryDetailed = parseJSON(tour.itineraryDetailed, []);

  // 準備費用說明資料
  const costExplanation = parseJSON(tour.costExplanation, null);

  // 準備交通資訊
  const transportationInfo = parseJSON(tour.flights, null);
  const shouldShowFlightSection = transportationInfo && 
    (transportationInfo.type === 'FLIGHT' || !transportationInfo.type);

  // 準備注意事項資料
  const noticeDetailed = parseJSON(tour.noticeDetailed, null);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Edit Mode Toolbar */}
      <EditModeToolbar colorTheme={colorTheme} />

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
        tourId={tourId}
        onUpdate={handleUpdate}
        onImageUpload={handleImageUpload}
      />

      {/* 快速資訊列 */}
      <div className="py-6 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-12">
            {/* 天數 */}
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-5 w-5" style={{ color: ensureReadableOnWhite(colorTheme.accent) }} />
              <span className="font-medium">{tour.duration} 天 {tour.nights || tour.duration - 1} 夜</span>
            </div>
            
            {/* 目的地 */}
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="h-5 w-5" style={{ color: ensureReadableOnWhite(colorTheme.accent) }} />
              <span className="font-medium">{tour.destinationCountry} {tour.destinationCity}</span>
            </div>
            
            {/* 價格 - 可編輯 */}
            <div 
              className={`flex items-center gap-2 ${canEdit ? 'cursor-pointer hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors' : ''}`}
              onClick={() => canEdit && setShowPriceDialog(true)}
            >
              <DollarSign className="h-5 w-5" style={{ color: ensureReadableOnWhite(colorTheme.accent) }} />
              <span className="text-2xl font-bold" style={{ color: ensureReadableOnWhite(colorTheme.accent) }}>
                NT$ {tour.price.toLocaleString()}
              </span>
              <span className="text-gray-500 text-sm">{tour.priceUnit || "人/起"}</span>
              {canEdit && <Pencil className="h-4 w-4 text-gray-400 ml-1" />}
            </div>
          </div>
        </div>
      </div>

      {/* 下載按鈕 */}
      <div className="py-6 bg-gray-50">
        <div className="container mx-auto px-4 flex justify-center">
          <Button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium shadow-md hover:shadow-lg transition-all"
            style={{ backgroundColor: colorTheme.accent }}
          >
            <Download className="h-5 w-5" />
            下載行程 PDF
          </Button>
        </div>
      </div>

      {/* Features Section */}
      {(features.length > 0 || isEditMode) && (
        <FeaturesSection 
          features={features} 
          colorTheme={colorTheme}
          tourId={tourId}
          onUpdate={handleUpdate}
          onImageUpload={handleImageUpload}
        />
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
          sectionType="hotel"
          sectionIndex={0}
          tourId={tourId}
          onUpdate={handleUpdate}
          onImageUpload={handleImageUpload}
          stars={firstHotel.stars}
          location={firstHotel.location}
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
      {(itineraryDetailed.length > 0 || isEditMode) && (
        <DailyItinerarySection
          itineraries={itineraryDetailed}
          colorTheme={colorTheme}
          tourId={tourId}
          onUpdate={handleUpdate}
          onImageUpload={handleImageUpload}
        />
      )}

      {/* 費用說明區塊 */}
      {costExplanation && (
        <CostExplanationSection
          costExplanation={costExplanation}
          colorTheme={colorTheme}
        />
      )}

      {/* 航班資訊區塊 */}
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

      {/* CTA Section */}
      <section className="w-full py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-3xl lg:text-4xl font-serif font-bold mb-4"
            style={{ color: colorTheme.primary }}
          >
            準備好開始您的旅程了嗎？
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            立即預訂，體驗難忘的旅行回憶
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="px-8 py-3 text-lg rounded-full"
              style={{
                backgroundColor: colorTheme.accent,
                color: "white",
              }}
              onClick={() => alert("預訂功能開發中")}
            >
              立即預訂
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-3 text-lg rounded-full"
              style={{
                borderColor: colorTheme.primary,
                color: colorTheme.primary,
              }}
              onClick={() => window.print()}
            >
              <Download className="mr-2 h-5 w-5" />
              下載行程
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Back to Top Button */}
      <BackToTop colorTheme={colorTheme} />
      
      {/* Edit Mode Button (floating) */}
      <EditModeButton colorTheme={colorTheme} />

      {/* Price Edit Dialog */}
      {showPriceDialog && (
        <PriceEditDialog
          open={showPriceDialog}
          onOpenChange={setShowPriceDialog}
          tourId={tourId!}
          currentPrice={tour.price}
          currentStartDate={tour.startDate}
          currentEndDate={tour.endDate}
          onSave={async (data) => {
            if (data.price !== undefined) {
              await handleUpdate('price', data.price.toString());
            }
            if (data.startDate) {
              await handleUpdate('startDate', data.startDate);
            }
            if (data.endDate) {
              await handleUpdate('endDate', data.endDate);
            }
            setShowPriceDialog(false);
          }}
          colorTheme={colorTheme}
        />
      )}
    </div>
  );
}

// 主組件 - 包裹 EditModeProvider
export default function TourDetailSipin() {
  return (
    <EditModeProvider>
      <TourDetailContent />
    </EditModeProvider>
  );
}
