import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Loader2, 
  ArrowLeft,
  CheckCircle2,
  Users,
  Tag,
  ChevronDown
} from "lucide-react";
import { useLocation, useRoute, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import "../defensive.css";
import "../print.css";

export default function TourDetailV2() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [, params] = useRoute("/tours/:id");
  const [, setLocation] = useLocation();
  const tourId = params?.id ? parseInt(params.id) : undefined;

  const { data: tour, isLoading, error } = trpc.tours.getById.useQuery(
    { id: tourId! },
    { enabled: !!tourId }
  );

  // Parse JSON fields safely
  const parseJSON = (str: string | null | undefined, defaultValue: any[] = []) => {
    if (!str) return defaultValue;
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  };

  // Parse color theme
  const parseColorTheme = (str: string | null | undefined) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center bg-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">找不到此行程</h2>
            <Button onClick={() => setLocation("/")} className="bg-primary hover:bg-red-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首頁
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const tags = parseJSON(tour.tags);
  const highlights = parseJSON(tour.highlights);
  const dailyItinerary = parseJSON(tour.dailyItinerary);
  const colorTheme = parseColorTheme(tour.colorTheme);
  
  // Use poetic title if available, otherwise use regular title
  const displayTitle = tour.poeticTitle || tour.title;
  const displaySubtitle = tour.heroSubtitle || highlights.slice(0, 5).join('．');

  // Apply color theme to page
  const themeColors = colorTheme || {
    primary: "#DC2626",
    secondary: "#1F2937",
    accent: "#F59E0B"
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-white"
      style={{
        "--theme-primary": themeColors.primary,
        "--theme-secondary": themeColors.secondary,
        "--theme-accent": themeColors.accent
      } as React.CSSProperties}
    >
      <Header />
      
      <main className="flex-grow">
        {/* Sipincollection-style Hero Section - Full Screen */}
        <div className="relative w-full h-screen overflow-hidden">
          {/* Hero Image */}
          <img 
            src={tour.heroImage || tour.imageUrl || '/images/tour-placeholder.jpg'} 
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-8 left-8 z-10">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              className="bg-white/95 hover:bg-white border-0 text-gray-900 rounded-full px-6 py-3 shadow-xl backdrop-blur-sm"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              返回
            </Button>
          </div>
          
          {/* Hero Content - Centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container text-center px-4">
              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  {tour.promotionText && (
                    <Badge 
                      className="px-4 py-2 text-sm font-medium rounded-full shadow-lg"
                      style={{ 
                        backgroundColor: themeColors.accent,
                        color: 'white'
                      }}
                    >
                      {tour.promotionText}
                    </Badge>
                  )}
                  {tags.slice(0, 3).map((tag: string, index: number) => (
                    <Badge 
                      key={index} 
                      className="bg-white/90 text-gray-900 px-4 py-2 text-sm rounded-full shadow-lg backdrop-blur-sm"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Main Title - Large and Poetic */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-wide">
                {displayTitle}
              </h1>
              
              {/* Subtitle - Highlights */}
              <p className="text-lg md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
                {displaySubtitle}
              </p>
              
              {/* Quick Info - Elegant */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-white/95 text-base md:text-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="font-medium">{tour.destinationCountry} {tour.destinationCity}</span>
                </div>
                <div className="hidden md:block text-white/50">|</div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="font-medium">{tour.duration}天{tour.nights ? `${tour.nights}夜` : ''}</span>
                </div>
                {tour.price && (
                  <>
                    <div className="hidden md:block text-white/50">|</div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 md:h-6 md:w-6" />
                      <span className="font-medium">NT$ {tour.price.toLocaleString()} 起</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Scroll Down Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-8 w-8 text-white/80" />
          </div>
        </div>

        {/* Feature Section with Image Overlay - Sipincollection Style */}
        {highlights.length > 0 && (
          <div className="relative py-24 md:py-32 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
            
            <div className="container relative z-10">
              {/* Section Title with Vertical Text */}
              <div className="flex items-center gap-8 mb-16">
                {/* Vertical Title - Sipincollection Style */}
                <div 
                  className="hidden md:block text-6xl font-bold tracking-widest"
                  style={{ 
                    writingMode: 'vertical-rl',
                    textOrientation: 'upright',
                    color: themeColors.primary,
                    letterSpacing: '0.5rem'
                  }}
                >
                  行程特色
                </div>
                
                {/* Horizontal Title for Mobile */}
                <div className="md:hidden w-full text-center">
                  <h2 
                    className="text-3xl md:text-4xl font-bold mb-4"
                    style={{ color: themeColors.primary }}
                  >
                    行程特色
                  </h2>
                  <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: themeColors.accent }} />
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {highlights.slice(0, 6).map((highlight: string, index: number) => (
                      <div key={index} className="flex items-start gap-4 group">
                        {/* Gold Badge - Sipincollection Style */}
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                          style={{ 
                            background: `linear-gradient(135deg, ${themeColors.accent} 0%, #F59E0B 100%)`,
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                          }}
                        >
                          <span className="text-white font-bold text-lg">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 leading-relaxed text-lg">{highlight}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Gallery with Overlay - Sipincollection Style */}
        {tour.featureImages && parseJSON(tour.featureImages).length > 0 && (
          <div className="relative py-24">
            <div className="container">
              <div className="grid grid-cols-12 gap-6">
                {/* Large Image */}
                <div className="col-span-12 md:col-span-8 relative group overflow-hidden rounded-2xl shadow-2xl">
                  <img 
                    src={parseJSON(tour.featureImages)[0]} 
                    alt="Feature 1"
                    className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                {/* Small Overlapping Images */}
                <div className="col-span-12 md:col-span-4 space-y-6">
                  {parseJSON(tour.featureImages).slice(1, 3).map((img: string, index: number) => (
                    <div key={index} className="relative group overflow-hidden rounded-2xl shadow-xl">
                      <img 
                        src={img} 
                        alt={`Feature ${index + 2}`}
                        className="w-full h-[240px] object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div className="container py-16 md:py-24">
          {/* Daily Itinerary with Vertical Title - Sipincollection Style */}
          {dailyItinerary.length > 0 && (
            <div className="mb-24">
              <div className="flex items-center gap-8 mb-16">
                {/* Vertical Title */}
                <div 
                  className="hidden md:block text-6xl font-bold tracking-widest"
                  style={{ 
                    writingMode: 'vertical-rl',
                    textOrientation: 'upright',
                    color: themeColors.primary,
                    letterSpacing: '0.5rem'
                  }}
                >
                  每日行程
                </div>
                
                {/* Horizontal Title for Mobile */}
                <div className="md:hidden w-full text-center">
                  <h2 
                    className="text-3xl md:text-4xl font-bold mb-4"
                    style={{ color: themeColors.primary }}
                  >
                    每日行程
                  </h2>
                  <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: themeColors.accent }} />
                </div>
                
                {/* Content */}
                <div className="flex-1 space-y-12">
                  {dailyItinerary.slice(0, 3).map((day: any, index: number) => (
                    <Card key={index} className="border-0 shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Day Number */}
                          <div 
                            className="w-full md:w-32 flex items-center justify-center p-6 text-white"
                            style={{ backgroundColor: themeColors.primary }}
                          >
                            <div className="text-center">
                              <div className="text-sm font-medium mb-1">DAY</div>
                              <div className="text-4xl font-bold">{day.day || index + 1}</div>
                            </div>
                          </div>
                          
                          {/* Day Content */}
                          <div className="flex-1 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                              {day.title || `第 ${day.day || index + 1} 天`}
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                              {day.description || day.content}
                            </p>
                            {day.meals && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>🍽️ 餐食：{day.meals}</span>
                              </div>
                            )}
                            {day.hotel && (
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                <span>🏨 住宿：{day.hotel}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {dailyItinerary.length > 3 && (
                    <div className="text-center mt-8">
                      <Button 
                        variant="outline" 
                        className="rounded-full px-8 py-6 text-base"
                        style={{ 
                          borderColor: themeColors.primary,
                          color: themeColors.primary
                        }}
                      >
                        查看完整行程
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Booking CTA */}
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              準備好開始您的旅程了嗎？
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              立即預訂,享受難忘的旅行體驗
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/book/${tour.id}`}>
                <Button 
                  className="px-8 py-6 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ 
                    backgroundColor: themeColors.primary,
                    color: 'white'
                  }}
                  disabled={tour.availableSeats !== null && tour.availableSeats !== undefined && tour.availableSeats <= 0}
                >
                  {(tour.availableSeats !== null && tour.availableSeats !== undefined && tour.availableSeats <= 0) 
                    ? '已額滿' 
                    : '立即預訂'}
                </Button>
              </Link>
              <Link href="/inquiry">
                <Button 
                  variant="outline"
                  className="px-8 py-6 text-lg font-bold rounded-full"
                  style={{ 
                    borderColor: themeColors.primary,
                    color: themeColors.primary
                  }}
                >
                  諮詢行程
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
