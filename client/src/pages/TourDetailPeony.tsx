/**
 * TourDetailPeony.tsx
 * 參考 Peony Tours 設計風格的行程詳情頁面
 * 設計特點：
 * - 固定標籤導航（行程簡介、精彩行程、內容特色、豪華酒店、出發日期/售價）
 * - Zigzag 左右交錯的每日行程佈局
 * - 根據目的地自動調整主題色
 * - 現代、簡潔、專業的設計風格
 */

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  MapPin, 
  Clock, 
  Users,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Star,
  Plane,
  Train,
  Ship,
  Bus,
  Car,
  Share2,
  Printer,
  Phone,
  Mail,
  Building,
  Utensils,
  Camera,
  Info,
  AlertCircle
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// 解析 JSON 字串
const parseJSON = (str: string | null | undefined, defaultValue: any = null) => {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
};

// 根據目的地生成主題色
const getThemeColorByDestination = (country: string | null | undefined) => {
  const countryLower = (country || "").toLowerCase();
  
  // 歐洲國家 - 藍色系
  if (countryLower.includes("法國") || countryLower.includes("france") ||
      countryLower.includes("義大利") || countryLower.includes("italy") ||
      countryLower.includes("英國") || countryLower.includes("uk") ||
      countryLower.includes("德國") || countryLower.includes("germany") ||
      countryLower.includes("西班牙") || countryLower.includes("spain") ||
      countryLower.includes("歐洲") || countryLower.includes("europe") ||
      countryLower.includes("奧地利") || countryLower.includes("austria") ||
      countryLower.includes("捷克") || countryLower.includes("czech") ||
      countryLower.includes("巴爾幹") || countryLower.includes("balkan")) {
    return {
      primary: "#1E3A5F",      // 深藍
      secondary: "#2563EB",    // 亮藍
      accent: "#3B82F6",       // 藍色
      light: "#EFF6FF",        // 淺藍背景
      gradient: "from-blue-900 to-blue-700"
    };
  }
  
  // 日本 - 櫻花粉/紅色系
  if (countryLower.includes("日本") || countryLower.includes("japan")) {
    return {
      primary: "#9D174D",      // 深粉紅
      secondary: "#DB2777",    // 粉紅
      accent: "#EC4899",       // 亮粉
      light: "#FDF2F8",        // 淺粉背景
      gradient: "from-pink-900 to-pink-700"
    };
  }
  
  // 東南亞 - 綠色系
  if (countryLower.includes("泰國") || countryLower.includes("thailand") ||
      countryLower.includes("越南") || countryLower.includes("vietnam") ||
      countryLower.includes("印尼") || countryLower.includes("indonesia") ||
      countryLower.includes("新加坡") || countryLower.includes("singapore") ||
      countryLower.includes("馬來西亞") || countryLower.includes("malaysia")) {
    return {
      primary: "#065F46",      // 深綠
      secondary: "#059669",    // 綠色
      accent: "#10B981",       // 亮綠
      light: "#ECFDF5",        // 淺綠背景
      gradient: "from-emerald-900 to-emerald-700"
    };
  }
  
  // 中國/台灣 - 紅色系
  if (countryLower.includes("中國") || countryLower.includes("china") ||
      countryLower.includes("台灣") || countryLower.includes("taiwan")) {
    return {
      primary: "#991B1B",      // 深紅
      secondary: "#DC2626",    // 紅色
      accent: "#EF4444",       // 亮紅
      light: "#FEF2F2",        // 淺紅背景
      gradient: "from-red-900 to-red-700"
    };
  }
  
  // 美洲 - 橙色系
  if (countryLower.includes("美國") || countryLower.includes("usa") ||
      countryLower.includes("加拿大") || countryLower.includes("canada") ||
      countryLower.includes("墨西哥") || countryLower.includes("mexico")) {
    return {
      primary: "#9A3412",      // 深橙
      secondary: "#EA580C",    // 橙色
      accent: "#F97316",       // 亮橙
      light: "#FFF7ED",        // 淺橙背景
      gradient: "from-orange-900 to-orange-700"
    };
  }
  
  // 預設 - 黑色系（極簡風格）
  return {
    primary: "#0A0A0A",      // 純黑
    secondary: "#374151",    // 深灰
    accent: "#6B7280",       // 灰色
    light: "#F9FAFB",        // 淺灰背景
    gradient: "from-gray-900 to-gray-700"
  };
};

// 交通類型圖標
const TransportIcon = ({ type, className = "h-5 w-5" }: { type: string; className?: string }) => {
  switch (type) {
    case 'FLIGHT': return <Plane className={className} />;
    case 'TRAIN': return <Train className={className} />;
    case 'CRUISE': return <Ship className={className} />;
    case 'BUS': return <Bus className={className} />;
    case 'CAR': return <Car className={className} />;
    default: return <Plane className={className} />;
  }
};

// 導航標籤組件
const NavTabs = ({ 
  items, 
  activeTab, 
  onTabClick, 
  themeColor 
}: { 
  items: { id: string; label: string }[];
  activeTab: string;
  onTabClick: (id: string) => void;
  themeColor: ReturnType<typeof getThemeColorByDestination>;
}) => {
  return (
    <div className="flex items-center justify-center gap-0 border-b border-gray-200">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabClick(item.id)}
          className={`px-6 py-4 text-sm font-medium transition-all border-b-2 -mb-[2px] ${
            activeTab === item.id
              ? "border-current text-black"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          style={activeTab === item.id ? { borderColor: themeColor.secondary } : {}}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

// 每日行程卡片 - Zigzag 佈局
const DayCard = ({ 
  day, 
  index, 
  themeColor,
  isExpanded,
  onToggle
}: { 
  day: any; 
  index: number;
  themeColor: ReturnType<typeof getThemeColorByDestination>;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const isEven = index % 2 === 0;
  const dayImage = day.image || day.imageUrl || `https://images.unsplash.com/photo-${1500000000000 + index * 1000}?w=800`;
  
  return (
    <div className="relative">
      {/* Day Badge */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 -top-5 z-10 px-6 py-2 text-white text-sm font-bold tracking-wider"
        style={{ backgroundColor: themeColor.secondary }}
      >
        DAY {day.day || index + 1}
      </div>
      
      {/* Content Container */}
      <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-0 bg-white`}>
        {/* Image Side */}
        <div className="md:w-1/2 aspect-[4/3] md:aspect-auto overflow-hidden">
          <img 
            src={dayImage}
            alt={day.title || `Day ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content Side */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          {/* Location */}
          <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: themeColor.primary }}>
            {day.title || day.location || `第 ${index + 1} 天`}
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-6">
            {day.description || day.summary || "精彩行程內容"}
          </p>
          
          {/* Activities Preview */}
          {day.activities && day.activities.length > 0 && (
            <div className="space-y-3 mb-6">
              {day.activities.slice(0, isExpanded ? undefined : 3).map((activity: any, actIndex: number) => (
                <div key={actIndex} className="flex items-start gap-3">
                  <div 
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: themeColor.secondary }}
                  />
                  <div>
                    <span className="font-medium">{activity.title || activity.name}</span>
                    {activity.description && isExpanded && (
                      <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Expand Button */}
          {day.activities && day.activities.length > 3 && (
            <button
              onClick={onToggle}
              className="flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: themeColor.secondary }}
            >
              {isExpanded ? (
                <>收起 <ChevronUp className="h-4 w-4" /></>
              ) : (
                <>查看更多 <ChevronDown className="h-4 w-4" /></>
              )}
            </button>
          )}
          
          {/* Meals & Accommodation */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-500">
            {(day.breakfast || day.lunch || day.dinner) && (
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                <span>
                  {[
                    day.breakfast && "早",
                    day.lunch && "午",
                    day.dinner && "晚"
                  ].filter(Boolean).join("/")}餐
                </span>
              </div>
            )}
            {day.accommodation && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>{day.accommodation}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 飯店卡片組件
const HotelCard = ({ hotel, themeColor }: { hotel: any; themeColor: ReturnType<typeof getThemeColorByDestination> }) => {
  return (
    <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[16/10] overflow-hidden">
        <img 
          src={hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"}
          alt={hotel.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        {hotel.rating && (
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < hotel.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
              />
            ))}
          </div>
        )}
        <h3 className="text-xl font-bold mb-2">{hotel.name}</h3>
        {hotel.location && (
          <p className="text-sm text-gray-400 mb-3 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {hotel.location}
          </p>
        )}
        <p className="text-gray-600 text-sm line-clamp-3">{hotel.description}</p>
      </div>
    </div>
  );
};

export default function TourDetailPeony() {
  const [matchSipin, paramsSipin] = useRoute("/tours-sipin/:id");
  const [matchTours, paramsTours] = useRoute("/tours/:id");
  const [matchMinimal, paramsMinimal] = useRoute("/tours-minimal/:id");
  const [matchPeony, paramsPeony] = useRoute("/tours-peony/:id");
  const params = paramsSipin || paramsTours || paramsMinimal || paramsPeony;
  const [, navigate] = useLocation();
  const tourId = params?.id ? parseInt(params.id) : undefined;

  const { data: tour, isLoading, error } = trpc.tours.getById.useQuery(
    { id: tourId! },
    { enabled: !!tourId }
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  // Section refs for scroll tracking
  const sectionRefs = {
    overview: useRef<HTMLElement>(null),
    itinerary: useRef<HTMLElement>(null),
    features: useRef<HTMLElement>(null),
    hotels: useRef<HTMLElement>(null),
    pricing: useRef<HTMLElement>(null),
    notes: useRef<HTMLElement>(null),
  };

  // 根據目的地計算主題色
  const themeColor = useMemo(() => {
    if (tour?.colorTheme) {
      const parsed = parseJSON(tour.colorTheme, null);
      if (parsed) {
        return {
          primary: parsed.primary || "#0A0A0A",
          secondary: parsed.secondary || parsed.accent || "#2563EB",
          accent: parsed.accent || "#3B82F6",
          light: parsed.light || "#F9FAFB",
          gradient: "from-gray-900 to-gray-700"
        };
      }
    }
    return getThemeColorByDestination(tour?.destinationCountry);
  }, [tour]);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      
      for (const [key, ref] of Object.entries(sectionRefs)) {
        if (ref.current) {
          const { offsetTop, offsetHeight } = ref.current;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveTab(key);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const ref = sectionRefs[sectionId as keyof typeof sectionRefs];
    if (ref?.current) {
      const yOffset = -150;
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const toggleDay = (dayNum: number) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayNum)) {
        newSet.delete(dayNum);
      } else {
        newSet.add(dayNum);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-sm tracking-widest uppercase text-gray-500">Loading</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <h2 className="text-4xl font-light mb-4">404</h2>
            <p className="text-gray-500 mb-8">找不到此行程</p>
            <Button 
              onClick={() => navigate("/")} 
              className="bg-black text-white hover:bg-gray-800 rounded-none px-8 py-3"
            >
              返回首頁
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 解析資料
  const heroImage = tour.heroImage || tour.imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200";
  const keyFeatures = parseJSON(tour.keyFeatures, []);
  const attractions = parseJSON(tour.attractions, []);
  const hotels = parseJSON(tour.hotels, []);
  const meals = parseJSON(tour.meals, []);
  const itineraryDetailed = parseJSON(tour.itineraryDetailed, []);
  const costExplanation = parseJSON(tour.costExplanation, null);
  const transportationInfo = parseJSON(tour.flights, null);
  const noticeDetailed = parseJSON(tour.noticeDetailed, null);

  // 導覽項目
  const navItems = [
    { id: "overview", label: "行程簡介" },
    { id: "itinerary", label: "精彩行程" },
    { id: "features", label: "內容特色" },
    { id: "hotels", label: "豪華酒店" },
    { id: "pricing", label: "出發日期/售價" },
    { id: "notes", label: "注意事項" },
  ];

  // 確保陣列類型
  const ensureArray = (val: any) => Array.isArray(val) ? val : [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-3 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button onClick={() => navigate("/")} className="hover:text-black transition-colors">首頁</button>
            <span>&gt;</span>
            <button onClick={() => navigate("/search")} className="hover:text-black transition-colors">行程搜尋</button>
            <span>&gt;</span>
            <span className="text-black">{tour.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[450px] max-h-[600px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className={`absolute inset-0 bg-gradient-to-t ${themeColor.gradient} opacity-60`} />
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center text-center">
          {/* Destination Badge */}
          <div className="mb-4">
            <span 
              className="inline-block px-4 py-1 text-white text-sm tracking-widest uppercase"
              style={{ backgroundColor: themeColor.secondary }}
            >
              {tour.destinationCountry || "精選行程"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-4xl leading-tight">
            {tour.title}
          </h1>

          {/* Subtitle / Poetic Title */}
          {tour.poeticTitle && (
            <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">
              {tour.poeticTitle}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{tour.duration || "多日行程"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{tour.destinationCity || tour.destinationCountry}</span>
            </div>
            {transportationInfo?.type && (
              <div className="flex items-center gap-2">
                <TransportIcon type={transportationInfo.type} className="h-4 w-4" />
                <span>{transportationInfo.typeName || "精選交通"}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sticky Navigation Tabs */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <NavTabs 
              items={navItems} 
              activeTab={activeTab} 
              onTabClick={scrollToSection}
              themeColor={themeColor}
            />
            
            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
              >
                <Printer className="h-4 w-4" />
                列印
              </button>
              <button 
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
              >
                <Share2 className="h-4 w-4" />
                分享
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Promotion Banner */}
      {tour.promotionText && (
        <div 
          className="py-3 text-center text-white text-sm"
          style={{ backgroundColor: themeColor.secondary }}
        >
          <span className="font-medium">{tour.promotionText}</span>
        </div>
      )}

      {/* Overview Section */}
      <section ref={sectionRefs.overview} id="overview" className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: themeColor.primary }}>
            行程簡介
          </h2>
          
          {/* Description */}
          <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed text-center mb-12">
            <p>{tour.description}</p>
          </div>

          {/* Key Features Grid */}
          {keyFeatures.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {keyFeatures.map((feature: any, index: number) => (
                <div 
                  key={index} 
                  className="p-6 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div 
                    className="w-12 h-12 flex items-center justify-center mb-4"
                    style={{ backgroundColor: themeColor.light }}
                  >
                    <Check className="h-6 w-6" style={{ color: themeColor.secondary }} />
                  </div>
                  <h3 className="font-bold mb-2">{typeof feature === 'string' ? feature : feature.title || feature.name}</h3>
                  {typeof feature !== 'string' && feature.description && (
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quick Info Cards */}
          <div className="grid md:grid-cols-4 gap-4 mt-12">
            <div className="text-center p-6 bg-gray-50">
              <Clock className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-500 mb-1">行程天數</p>
              <p className="font-bold text-lg">{tour.duration || "多日行程"}</p>
            </div>
            <div className="text-center p-6 bg-gray-50">
              <MapPin className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-500 mb-1">目的地</p>
              <p className="font-bold text-lg">{tour.destinationCity || tour.destinationCountry}</p>
            </div>
            <div className="text-center p-6 bg-gray-50">
              <Users className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-500 mb-1">成團人數</p>
              <p className="font-bold text-lg">{(tour as any).minGroupSize || 10}-{(tour as any).maxGroupSize || 25}人</p>
            </div>
            <div className="text-center p-6 bg-gray-50">
              <Calendar className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-500 mb-1">出發日期</p>
              <p className="font-bold text-lg">多日期可選</p>
            </div>
          </div>
        </div>
      </section>

      {/* Itinerary Section - Zigzag Layout */}
      <section ref={sectionRefs.itinerary} id="itinerary" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: themeColor.primary }}>
            精彩行程
          </h2>
          <p className="text-gray-500 text-center mb-16">每一天都是獨特的旅程體驗</p>

          {/* Daily Itinerary */}
          <div className="space-y-16">
            {itineraryDetailed.length > 0 ? (
              itineraryDetailed.map((day: any, index: number) => (
                <DayCard 
                  key={index}
                  day={day}
                  index={index}
                  themeColor={themeColor}
                  isExpanded={expandedDays.has(index)}
                  onToggle={() => toggleDay(index)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Info className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>詳細行程資訊即將更新</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={sectionRefs.features} id="features" className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: themeColor.primary }}>
            內容特色 & 升等選項
          </h2>
          <p className="text-gray-500 text-center mb-12">精心安排的行程亮點</p>

          {/* Attractions */}
          {attractions.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Camera className="h-5 w-5" style={{ color: themeColor.secondary }} />
                精選景點
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {attractions.map((attraction: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50">
                    <div 
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: themeColor.secondary }}
                    />
                    <div>
                      <span className="font-medium">
                        {typeof attraction === 'string' ? attraction : attraction.name || attraction.title}
                      </span>
                      {typeof attraction !== 'string' && attraction.description && (
                        <p className="text-sm text-gray-500 mt-1">{attraction.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meals */}
          {meals.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Utensils className="h-5 w-5" style={{ color: themeColor.secondary }} />
                餐飲安排
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {meals.map((meal: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50">
                    <div 
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: themeColor.secondary }}
                    />
                    <span>{typeof meal === 'string' ? meal : meal.name || meal.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost Inclusions */}
          {costExplanation && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Included */}
              {costExplanation.included && costExplanation.included.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-700">
                    <Check className="h-5 w-5" />
                    費用包含
                  </h3>
                  <ul className="space-y-3">
                    {ensureArray(costExplanation.included).map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Excluded */}
              {costExplanation.excluded && costExplanation.excluded.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-700">
                    <X className="h-5 w-5" />
                    費用不含
                  </h3>
                  <ul className="space-y-3">
                    {ensureArray(costExplanation.excluded).map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <X className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Hotels Section */}
      {hotels.length > 0 && (
        <section ref={sectionRefs.hotels} id="hotels" className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: themeColor.primary }}>
              豪華酒店
            </h2>
            <p className="text-gray-500 text-center mb-12">嚴選優質住宿，讓您的旅程更加舒適</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map((hotel: any, index: number) => (
                <HotelCard key={index} hotel={hotel} themeColor={themeColor} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <section ref={sectionRefs.pricing} id="pricing" className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: themeColor.primary }}>
            出發日期 / 售價
          </h2>
          <p className="text-gray-500 text-center mb-12">選擇您理想的出發日期</p>

          {/* Price Display */}
          <div className="bg-gray-50 p-8 text-center mb-8">
            <p className="text-sm text-gray-500 mb-2">每人售價 (含稅)</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-sm" style={{ color: themeColor.secondary }}>NT$</span>
              <span className="text-5xl font-bold" style={{ color: themeColor.primary }}>
                {tour.price ? tour.price.toLocaleString() : "洽詢"}
              </span>
              <span className="text-gray-500">起</span>
            </div>
            {(tour as any).originalPrice && (tour as any).originalPrice > (tour.price || 0) && (
              <p className="text-gray-400 line-through mt-2">
                原價 NT$ {(tour as any).originalPrice.toLocaleString()}
              </p>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate(`/book/${tour.id}`)}
              className="px-8 py-4 text-white text-lg font-medium"
              style={{ backgroundColor: themeColor.secondary }}
            >
              立即預訂
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/contact")}
              className="px-8 py-4 text-lg font-medium border-2"
              style={{ borderColor: themeColor.secondary, color: themeColor.secondary }}
            >
              聯繫我們
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-12 text-center text-gray-500">
            <p className="mb-4">如需更多資訊，歡迎聯繫我們的旅遊顧問</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-black transition-colors">
                <Phone className="h-4 w-4" />
                <span>+1 (234) 567-890</span>
              </a>
              <a href="mailto:info@packgo.com" className="flex items-center gap-2 hover:text-black transition-colors">
                <Mail className="h-4 w-4" />
                <span>info@packgo.com</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Notes Section */}
      <section ref={sectionRefs.notes} id="notes" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: themeColor.primary }}>
            注意事項
          </h2>
          <p className="text-gray-500 text-center mb-12">出發前請詳閱以下資訊</p>

          {noticeDetailed ? (
            <div className="space-y-8">
              {/* Preparation */}
              {noticeDetailed.preparation && ensureArray(noticeDetailed.preparation).length > 0 && (
                <div className="bg-white p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" style={{ color: themeColor.secondary }} />
                    行前準備
                  </h3>
                  <ul className="space-y-2">
                    {ensureArray(noticeDetailed.preparation).map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600">
                        <span className="text-gray-400">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Documents */}
              {noticeDetailed.documents && ensureArray(noticeDetailed.documents).length > 0 && (
                <div className="bg-white p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5" style={{ color: themeColor.secondary }} />
                    證件需求
                  </h3>
                  <ul className="space-y-2">
                    {ensureArray(noticeDetailed.documents).map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600">
                        <span className="text-gray-400">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Health */}
              {noticeDetailed.health && ensureArray(noticeDetailed.health).length > 0 && (
                <div className="bg-white p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" style={{ color: themeColor.secondary }} />
                    健康須知
                  </h3>
                  <ul className="space-y-2">
                    {ensureArray(noticeDetailed.health).map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600">
                        <span className="text-gray-400">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Terms */}
              {noticeDetailed.terms && ensureArray(noticeDetailed.terms).length > 0 && (
                <div className="bg-white p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5" style={{ color: themeColor.secondary }} />
                    條款與細則
                  </h3>
                  <ul className="space-y-2">
                    {ensureArray(noticeDetailed.terms).map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600">
                        <span className="text-gray-400">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Info className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>詳細注意事項請洽詢旅遊顧問</p>
            </div>
          )}
        </div>
      </section>

      {/* Fixed Bottom CTA (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">每人售價起</p>
            <p className="text-xl font-bold" style={{ color: themeColor.primary }}>
              NT$ {tour.price ? tour.price.toLocaleString() : "洽詢"}
            </p>
          </div>
          <Button 
            onClick={() => navigate(`/book/${tour.id}`)}
            className="px-6 py-3 text-white font-medium"
            style={{ backgroundColor: themeColor.secondary }}
          >
            立即預訂
          </Button>
        </div>
      </div>

      {/* Add padding for fixed bottom CTA on mobile */}
      <div className="h-20 md:hidden" />

      <Footer />
    </div>
  );
}
