/**
 * TourDetailMinimal.tsx
 * 現代極簡風格的行程詳情頁面
 * 設計特點：大量留白、清晰層級、黑白為主、動態強調色
 */

import React, { useEffect, useState, useRef } from "react";
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
  Car
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

// 預設配色（現代極簡）
const DEFAULT_COLOR_THEME = {
  primary: "#0A0A0A",    // 純黑
  secondary: "#FAFAFA",  // 近白
  accent: "#2563EB",     // 藍色強調
};

// 交通類型圖標
const TransportIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'FLIGHT': return <Plane className="h-5 w-5" />;
    case 'TRAIN': return <Train className="h-5 w-5" />;
    case 'CRUISE': return <Ship className="h-5 w-5" />;
    case 'BUS': return <Bus className="h-5 w-5" />;
    case 'CAR': return <Car className="h-5 w-5" />;
    default: return <Plane className="h-5 w-5" />;
  }
};

export default function TourDetailMinimal() {
  const [matchSipin, paramsSipin] = useRoute("/tours-sipin/:id");
  const [matchTours, paramsTours] = useRoute("/tours/:id");
  const [matchMinimal, paramsMinimal] = useRoute("/tours-minimal/:id");
  const params = paramsSipin || paramsTours || paramsMinimal;
  const [, navigate] = useLocation();
  const tourId = params?.id ? parseInt(params.id) : undefined;

  const { data: tour, isLoading, error } = trpc.tours.getById.useQuery(
    { id: tourId! },
    { enabled: !!tourId }
  );

  const [colorTheme, setColorTheme] = useState(DEFAULT_COLOR_THEME);
  const [activeSection, setActiveSection] = useState("overview");
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));

  // Section refs for scroll tracking
  const sectionRefs = {
    overview: useRef<HTMLElement>(null),
    itinerary: useRef<HTMLElement>(null),
    hotels: useRef<HTMLElement>(null),
    pricing: useRef<HTMLElement>(null),
    notes: useRef<HTMLElement>(null),
  };

  useEffect(() => {
    if (tour && tour.colorTheme) {
      const parsedTheme = parseJSON(tour.colorTheme, DEFAULT_COLOR_THEME);
      setColorTheme(parsedTheme);
    }
  }, [tour]);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      
      for (const [key, ref] of Object.entries(sectionRefs)) {
        if (ref.current) {
          const { offsetTop, offsetHeight } = ref.current;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(key);
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
      const yOffset = -120;
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
    { id: "overview", label: "概覽" },
    { id: "itinerary", label: "行程" },
    { id: "hotels", label: "住宿" },
    { id: "pricing", label: "費用" },
    { id: "notes", label: "須知" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Sticky Navigation - Minimal */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back button */}
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">返回</span>
            </button>

            {/* Center: Nav items */}
            <div className="flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm tracking-wide transition-all ${
                    activeSection === item.id
                      ? "text-black font-medium"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right: Download */}
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">下載</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Width */}
      <section className="relative h-[70vh] min-h-[500px] max-h-[800px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16">
          {/* Destination tag */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-white/80 text-sm tracking-widest uppercase">
              {tour.destinationCountry}
            </span>
            {tour.destinationCity && (
              <>
                <span className="text-white/40">·</span>
                <span className="text-white/80 text-sm tracking-widest uppercase">
                  {tour.destinationCity}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6 max-w-4xl leading-tight">
            {tour.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{tour.duration || "多日行程"}</span>
            </div>
            {transportationInfo?.type && (
              <div className="flex items-center gap-2">
                <TransportIcon type={transportationInfo.type} />
                <span>{transportationInfo.typeName || transportationInfo.type}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>小團出發</span>
            </div>
          </div>
        </div>

        {/* Price Card - Floating */}
        <div className="absolute right-6 bottom-16 hidden lg:block">
          <div className="bg-white p-8 shadow-2xl min-w-[280px]">
            <p className="text-sm text-gray-500 mb-2">每人價格</p>
            <p className="text-4xl font-light mb-1">
              NT$ {tour.price?.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mb-6">{tour.priceUnit || "起"}</p>
            <Button 
              className="w-full bg-black text-white hover:bg-gray-800 rounded-none py-4 text-sm tracking-wide"
              style={{ backgroundColor: colorTheme.accent }}
            >
              立即預訂
            </Button>
          </div>
        </div>
      </section>

      {/* Mobile Price Bar */}
      <div className="lg:hidden sticky top-16 z-40 bg-white border-b border-gray-100 py-4 px-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-light">NT$ {tour.price?.toLocaleString()}</p>
            <p className="text-sm text-gray-400">{tour.priceUnit || "每人起"}</p>
          </div>
          <Button 
            className="bg-black text-white hover:bg-gray-800 rounded-none px-6 py-3"
            style={{ backgroundColor: colorTheme.accent }}
          >
            預訂
          </Button>
        </div>
      </div>

      {/* Overview Section */}
      <section ref={sectionRefs.overview} id="overview" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left: Description */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-light mb-8">行程概覽</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-8">
                {tour.description || "探索這個令人驚嘆的目的地，體驗獨特的文化與自然風光。"}
              </p>
              
              {/* Key Features */}
              {keyFeatures.length > 0 && (
                <div className="space-y-4">
                  {keyFeatures.slice(0, 5).map((feature: any, index: number) => (
                    <div key={index} className="flex items-start gap-4">
                      <div 
                        className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: colorTheme.accent + '15' }}
                      >
                        <Check className="h-4 w-4" style={{ color: colorTheme.accent }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {typeof feature === 'string' ? feature : feature.title}
                        </p>
                        {typeof feature === 'object' && feature.description && (
                          <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Quick Info */}
            <div className="lg:pl-12 lg:border-l border-gray-100">
              <h3 className="text-sm tracking-widest uppercase text-gray-400 mb-8">行程資訊</h3>
              
              <div className="space-y-8">
                <div>
                  <p className="text-sm text-gray-400 mb-2">目的地</p>
                  <p className="text-xl">{tour.destinationCountry} {tour.destinationCity}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">行程天數</p>
                  <p className="text-xl">{tour.duration || "請洽客服"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">出發日期</p>
                  <p className="text-xl">
                    {tour.startDate 
                      ? new Date(tour.startDate).toLocaleDateString("zh-TW", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })
                      : "多個日期可選"
                    }
                  </p>
                </div>

                {transportationInfo?.type && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">交通方式</p>
                    <div className="flex items-center gap-3">
                      <TransportIcon type={transportationInfo.type} />
                      <p className="text-xl">{transportationInfo.typeName || transportationInfo.type}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Attractions Gallery */}
      {attractions.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl lg:text-4xl font-light mb-12">精選景點</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {attractions.slice(0, 6).map((attr: any, index: number) => (
                <div key={index} className="group">
                  <div className="aspect-[4/3] overflow-hidden mb-4">
                    <img 
                      src={attr.image || `https://images.unsplash.com/photo-${1488646953014 + index}?w=600`}
                      alt={attr.name || `景點 ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-xl font-medium mb-2">{attr.name || `景點 ${index + 1}`}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{attr.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Daily Itinerary Section */}
      <section ref={sectionRefs.itinerary} id="itinerary" className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-light mb-4">每日行程</h2>
          <p className="text-gray-500 mb-12">詳細的每日安排，讓您的旅程更加充實</p>

          <div className="space-y-4">
            {itineraryDetailed.map((day: any, index: number) => {
              const dayNum = index + 1;
              const isExpanded = expandedDays.has(dayNum);
              
              return (
                <div 
                  key={index} 
                  className="border border-gray-200 transition-all"
                >
                  <button
                    onClick={() => toggleDay(dayNum)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-6">
                      <span 
                        className="w-12 h-12 flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: colorTheme.accent }}
                      >
                        {dayNum}
                      </span>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Day {dayNum}</p>
                        <p className="text-lg font-medium">{day.title || `第 ${dayNum} 天`}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                      <div className="pl-18 ml-6">
                        {/* Day Image */}
                        {day.image && (
                          <div className="aspect-video mb-6 overflow-hidden">
                            <img 
                              src={day.image} 
                              alt={day.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Description */}
                        {day.description && (
                          <p className="text-gray-600 mb-6 leading-relaxed">{day.description}</p>
                        )}

                        {/* Activities */}
                        {day.activities && day.activities.length > 0 && (
                          <div className="space-y-4">
                            {day.activities.map((activity: any, actIndex: number) => (
                              <div key={actIndex} className="flex gap-4">
                                <div className="w-16 text-sm text-gray-400 flex-shrink-0">
                                  {activity.time || ""}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{activity.title || activity.name}</p>
                                  {activity.description && (
                                    <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Meals */}
                        {(day.breakfast || day.lunch || day.dinner) && (
                          <div className="mt-6 pt-6 border-t border-gray-100">
                            <p className="text-sm text-gray-400 mb-3">餐食安排</p>
                            <div className="flex gap-6 text-sm">
                              <span className={day.breakfast ? "text-gray-900" : "text-gray-300"}>
                                早餐 {day.breakfast ? "✓" : "✗"}
                              </span>
                              <span className={day.lunch ? "text-gray-900" : "text-gray-300"}>
                                午餐 {day.lunch ? "✓" : "✗"}
                              </span>
                              <span className={day.dinner ? "text-gray-900" : "text-gray-300"}>
                                晚餐 {day.dinner ? "✓" : "✗"}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Accommodation */}
                        {day.accommodation && (
                          <div className="mt-6 pt-6 border-t border-gray-100">
                            <p className="text-sm text-gray-400 mb-2">住宿</p>
                            <p className="font-medium">{day.accommodation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hotels Section */}
      {hotels.length > 0 && (
        <section ref={sectionRefs.hotels} id="hotels" className="py-20 lg:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl lg:text-4xl font-light mb-4">精選住宿</h2>
            <p className="text-gray-500 mb-12">嚴選優質飯店，讓您的旅程更加舒適</p>

            <div className="grid md:grid-cols-2 gap-8">
              {hotels.map((hotel: any, index: number) => (
                <div key={index} className="bg-white">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img 
                      src={hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"}
                      alt={hotel.name || `飯店 ${index + 1}`}
                      className="w-full h-full object-cover"
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
                    <h3 className="text-xl font-medium mb-2">{hotel.name || `飯店 ${index + 1}`}</h3>
                    {hotel.location && (
                      <p className="text-sm text-gray-400 mb-3 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {hotel.location}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm line-clamp-3">{hotel.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      {costExplanation && (
        <section ref={sectionRefs.pricing} id="pricing" className="py-20 lg:py-32">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl lg:text-4xl font-light mb-4">費用說明</h2>
            <p className="text-gray-500 mb-12">透明的價格，讓您安心預訂</p>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Included */}
              {costExplanation.included && costExplanation.included.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    費用包含
                  </h3>
                  <ul className="space-y-3">
                    {costExplanation.included.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Excluded */}
              {costExplanation.excluded && costExplanation.excluded.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 flex items-center justify-center">
                      <X className="h-4 w-4 text-red-600" />
                    </div>
                    費用不包含
                  </h3>
                  <ul className="space-y-3">
                    {costExplanation.excluded.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600">
                        <X className="h-4 w-4 text-red-400 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Price Table */}
            {costExplanation.priceTable && costExplanation.priceTable.length > 0 && (
              <div className="mt-12 pt-12 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-6">價格表</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 text-sm text-gray-400 font-normal">房型</th>
                        <th className="text-right py-4 text-sm text-gray-400 font-normal">價格</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costExplanation.priceTable.map((row: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-4">{row.type || row.name}</td>
                          <td className="py-4 text-right font-medium">
                            NT$ {row.price?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Notes Section */}
      <section ref={sectionRefs.notes} id="notes" className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-light mb-4">注意事項</h2>
          <p className="text-gray-500 mb-12">出發前請詳閱以下資訊</p>

          {noticeDetailed ? (
            <div className="space-y-8">
              {noticeDetailed.preparation && (
                <div>
                  <h3 className="text-lg font-medium mb-4">行前準備</h3>
                  <ul className="space-y-2">
                    {(Array.isArray(noticeDetailed.preparation) 
                      ? noticeDetailed.preparation 
                      : [noticeDetailed.preparation]
                    ).map((item: string, index: number) => (
                      <li key={index} className="text-gray-600 pl-4 border-l-2 border-gray-200">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {noticeDetailed.visa && (
                <div>
                  <h3 className="text-lg font-medium mb-4">簽證資訊</h3>
                  <p className="text-gray-600 pl-4 border-l-2 border-gray-200">
                    {noticeDetailed.visa}
                  </p>
                </div>
              )}

              {noticeDetailed.health && (
                <div>
                  <h3 className="text-lg font-medium mb-4">健康須知</h3>
                  <ul className="space-y-2">
                    {(Array.isArray(noticeDetailed.health) 
                      ? noticeDetailed.health 
                      : [noticeDetailed.health]
                    ).map((item: string, index: number) => (
                      <li key={index} className="text-gray-600 pl-4 border-l-2 border-gray-200">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {noticeDetailed.cancellation && (
                <div>
                  <h3 className="text-lg font-medium mb-4">取消政策</h3>
                  <p className="text-gray-600 pl-4 border-l-2 border-gray-200">
                    {noticeDetailed.cancellation}
                  </p>
                </div>
              )}

              {noticeDetailed.other && (
                <div>
                  <h3 className="text-lg font-medium mb-4">其他事項</h3>
                  <ul className="space-y-2">
                    {(Array.isArray(noticeDetailed.other) 
                      ? noticeDetailed.other 
                      : [noticeDetailed.other]
                    ).map((item: string, index: number) => (
                      <li key={index} className="text-gray-600 pl-4 border-l-2 border-gray-200">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">請洽客服了解詳細注意事項</p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-light mb-6">
            準備好開始您的旅程了嗎？
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            立即預訂，體驗難忘的旅行回憶
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-white text-black hover:bg-gray-100 rounded-none px-10 py-4 text-sm tracking-wide"
            >
              立即預訂
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 rounded-none px-10 py-4 text-sm tracking-wide"
              onClick={() => window.print()}
            >
              <Download className="mr-2 h-4 w-4" />
              下載行程
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-black text-white flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors z-50"
        style={{ backgroundColor: colorTheme.accent }}
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </div>
  );
}
