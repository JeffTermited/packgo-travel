import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, DollarSign, Users, Plane, Hotel, Utensils, AlertCircle, Download, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/defensive.css";
import "@/print.css";

// 根據目的地自動調整配色
const getDestinationColors = (country: string | null, city: string | null) => {
  const destination = (country || city || "").toLowerCase();
  
  // 日本
  if (destination.includes("日本") || destination.includes("japan")) {
    if (destination.includes("沖繩") || destination.includes("okinawa")) {
      return {
        primary: "#00A8CC", // 海洋藍
        secondary: "#FFB74D", // 溫暖橙
        background: "#F0F8FF", // 淺藍背景
        accent: "#FF6B6B", // 珊瑚紅
        text: "#2C3E50"
      };
    }
    return {
      primary: "#FFB7C5", // 櫻花粉
      secondary: "#4A90E2", // 天空藍
      background: "#FFF5F7", // 淺粉背景
      accent: "#FF69B4", // 亮粉紅
      text: "#2C3E50"
    };
  }
  
  // 歐洲
  if (destination.includes("歐洲") || destination.includes("europe") || 
      destination.includes("法國") || destination.includes("義大利") || 
      destination.includes("西班牙") || destination.includes("英國")) {
    return {
      primary: "#9B59B6", // 優雅紫
      secondary: "#E74C3C", // 熱情紅
      background: "#F8F5FF", // 淺紫背景
      accent: "#F39C12", // 金黃色
      text: "#2C3E50"
    };
  }
  
  // 東南亞
  if (destination.includes("泰國") || destination.includes("越南") || 
      destination.includes("印尼") || destination.includes("馬來西亞")) {
    return {
      primary: "#27AE60", // 熱帶綠
      secondary: "#F39C12", // 金黃色
      background: "#F0FFF4", // 淺綠背景
      accent: "#E74C3C", // 熱情紅
      text: "#2C3E50"
    };
  }
  
  // 預設（深藍色 + 亮藍色）
  return {
    primary: "#2C3E50", // 深藍色
    secondary: "#3498DB", // 亮藍色
    background: "#F5F7FA", // 淺灰藍背景
    accent: "#E74C3C", // 熱情紅
    text: "#2C3E50"
  };
};

// 解析 JSON 字串
const parseJSON = (str: string | null | undefined, defaultValue: any = null) => {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
};

export default function TourDetailNew() {
  const params = useParams();
  const [, navigate] = useLocation();
  const tourId = params.id ? parseInt(params.id) : null;

  const { data: tour, isLoading, error } = trpc.tours.getById.useQuery(
    { id: tourId! },
    { enabled: !!tourId }
  );

  const [colors, setColors] = useState(getDestinationColors(null, null));

  useEffect(() => {
    if (tour) {
      setColors(getDestinationColors(tour.destinationCountry, tour.destinationCity));
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
          <h1 className="text-2xl font-bold text-gray-900">找不到行程</h1>
          <Button onClick={() => navigate("/")} className="mt-4">
            返回首頁
          </Button>
        </div>
      </div>
    );
  }

  // 解析資料
  const highlights = parseJSON(tour.highlights, []);
  const itineraryDetailed = parseJSON(tour.itineraryDetailed, []);
  const hotels = parseJSON(tour.hotels, []);
  const meals = parseJSON(tour.meals, []);
  const flights = parseJSON(tour.flights, null);
  const includes = parseJSON(tour.includes, []);
  const excludes = parseJSON(tour.excludes, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section - 全螢幕背景圖 */}
      <section 
        className="relative h-screen flex items-center justify-center text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${tour.heroImage || tour.imageUrl || "/placeholder-hero.jpg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* 返回按鈕 */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white/90 text-gray-900 rounded-lg hover:bg-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>

        <div className="container text-center z-10 px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {tour.title}
          </h1>
          {tour.heroSubtitle && (
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 font-light max-w-4xl mx-auto">
              {tour.heroSubtitle}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{tour.duration} 天 {tour.nights} 夜</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>{tour.destinationCity || tour.destinationCountry}</span>
            </div>
            {tour.price && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span>NT$ {tour.price.toLocaleString()}</span>
              </div>
            )}
          </div>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 hover:scale-105 transition-transform"
            style={{ backgroundColor: colors.primary }}
          >
            立即預訂
          </Button>
        </div>

        {/* 固定導航列 */}
        <nav 
          className="absolute bottom-0 left-0 right-0 backdrop-blur-sm"
          style={{ backgroundColor: `${colors.text}E6` }}
        >
          <div className="container">
            <ul className="flex justify-center gap-4 md:gap-8 py-4 text-white text-sm md:text-base overflow-x-auto">
              <li><a href="#highlights" className="hover:underline whitespace-nowrap">行程特色</a></li>
              <li><a href="#itinerary" className="hover:underline whitespace-nowrap">每日行程</a></li>
              <li><a href="#hotels" className="hover:underline whitespace-nowrap">飯店介紹</a></li>
              <li><a href="#meals" className="hover:underline whitespace-nowrap">餐飲介紹</a></li>
              <li><a href="#flights" className="hover:underline whitespace-nowrap">航班資訊</a></li>
              <li><a href="#cost" className="hover:underline whitespace-nowrap">費用說明</a></li>
              <li><a href="#notice" className="hover:underline whitespace-nowrap">注意事項</a></li>
            </ul>
          </div>
        </nav>
      </section>

      {/* 行程特色區塊 - Zigzag 佈局 */}
      <section id="highlights" className="py-20" style={{ backgroundColor: colors.background }}>
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: colors.primary }}>
            行程特色
          </h2>
          
          {highlights && highlights.length > 0 ? (
            <div className="space-y-20">
              {highlights.map((highlight: any, index: number) => (
                <div 
                  key={index}
                  className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center`}
                >
                  {/* 圖片 */}
                  <div className="w-full md:w-1/2">
                    <div className="relative">
                      <img
                        src={highlight.image || `/placeholder-highlight-${index + 1}.jpg`}
                        alt={highlight.title || `行程特色 ${index + 1}`}
                        className="w-full h-[400px] object-cover rounded-lg shadow-2xl"
                        style={{ border: `8px solid white` }}
                      />
                    </div>
                  </div>
                  
                  {/* 文字 */}
                  <div className="w-full md:w-1/2 px-4">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: colors.primary }}>
                      {highlight.title || highlight}
                    </h3>
                    <p className="text-lg leading-relaxed" style={{ color: colors.text }}>
                      {highlight.description || highlight}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">暫無行程特色資訊</p>
          )}
        </div>
      </section>

      {/* 每日行程區塊 - 時間軸 + Zigzag 佈局 */}
      <section id="itinerary" className="py-20 bg-white">
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: colors.primary }}>
            每日行程
          </h2>
          
          {itineraryDetailed && itineraryDetailed.length > 0 ? (
            <div className="space-y-16">
              {itineraryDetailed.map((day: any, index: number) => (
                <div 
                  key={index}
                  className="flex flex-col md:flex-row gap-8 items-start"
                >
                  {/* 日期標記 */}
                  <div className="w-full md:w-20 flex md:flex-col items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Day {index + 1}
                    </div>
                    {index < itineraryDetailed.length - 1 && (
                      <div 
                        className="hidden md:block w-1 flex-1 min-h-[100px]"
                        style={{ backgroundColor: colors.secondary }}
                      ></div>
                    )}
                  </div>
                  
                  {/* 內容區域 - Zigzag 佈局 */}
                  <div className={`flex-1 flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center`}>
                    {/* 圖片 */}
                    <div className="w-full md:w-1/2">
                      <img
                        src={day.image || `/placeholder-day-${index + 1}.jpg`}
                        alt={day.title || `第 ${index + 1} 天`}
                        className="w-full h-[300px] object-cover rounded-lg shadow-lg"
                        style={{ border: `6px solid white` }}
                      />
                    </div>
                    
                    {/* 文字 */}
                    <div className="w-full md:w-1/2 px-4">
                      <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: colors.primary }}>
                        {day.title || `第 ${index + 1} 天`}
                      </h3>
                      {day.time && (
                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                          <Clock className="w-4 h-4" />
                          <span>{day.time}</span>
                        </div>
                      )}
                      <p className="text-base leading-relaxed mb-4" style={{ color: colors.text }}>
                        {day.description || day.activities}
                      </p>
                      <div className="space-y-2">
                        {day.meals && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Utensils className="w-4 h-4" style={{ color: colors.secondary }} />
                            <span>餐食：{day.meals}</span>
                          </div>
                        )}
                        {day.accommodation && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Hotel className="w-4 h-4" style={{ color: colors.secondary }} />
                            <span>住宿：{day.accommodation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : tour.dailyItinerary ? (
            <div className="space-y-8">
              {parseJSON(tour.dailyItinerary, []).map((day: any, index: number) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg shadow">
                  <h3 className="text-xl font-bold mb-2" style={{ color: colors.primary }}>
                    Day {index + 1}: {day.title || day.location}
                  </h3>
                  <p className="text-gray-700">{day.description || day.activities}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">暫無每日行程資訊</p>
          )}
        </div>
      </section>

      {/* 飯店介紹區塊 - Zigzag 佈局 */}
      <section id="hotels" className="py-20" style={{ backgroundColor: colors.background }}>
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: colors.primary }}>
            飯店介紹
          </h2>
          
          {hotels && hotels.length > 0 ? (
            <div className="space-y-20">
              {hotels.map((hotel: any, index: number) => (
                <div 
                  key={index}
                  className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center`}
                >
                  {/* 圖片 */}
                  <div className="w-full md:w-1/2">
                    <img
                      src={hotel.image || `/placeholder-hotel-${index + 1}.jpg`}
                      alt={hotel.name || `飯店 ${index + 1}`}
                      className="w-full h-[350px] object-cover rounded-lg shadow-2xl"
                      style={{ border: `8px solid white` }}
                    />
                  </div>
                  
                  {/* 文字 */}
                  <div className="w-full md:w-1/2 px-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Hotel className="w-6 h-6" style={{ color: colors.secondary }} />
                      <h3 className="text-2xl md:text-3xl font-bold" style={{ color: colors.primary }}>
                        {hotel.name || `飯店 ${index + 1}`}
                      </h3>
                    </div>
                    {hotel.rating && (
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-xl">
                            {i < hotel.rating ? "★" : "☆"}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-lg leading-relaxed mb-4" style={{ color: colors.text }}>
                      {hotel.description}
                    </p>
                    {hotel.facilities && (
                      <div className="flex flex-wrap gap-2">
                        {hotel.facilities.map((facility: string, i: number) => (
                          <span 
                            key={i}
                            className="px-3 py-1 rounded-full text-sm"
                            style={{ backgroundColor: colors.secondary + "20", color: colors.secondary }}
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : tour.hotelName ? (
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>
                {tour.hotelName}
              </h3>
              {tour.hotelDescription && (
                <p className="text-gray-700">{tour.hotelDescription}</p>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-600">暫無飯店介紹資訊</p>
          )}
        </div>
      </section>

      {/* 餐飲介紹區塊 - Zigzag 佈局 */}
      <section id="meals" className="py-20 bg-white">
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: colors.primary }}>
            餐飲介紹
          </h2>
          
          {meals && meals.length > 0 ? (
            <div className="space-y-20">
              {meals.map((meal: any, index: number) => (
                <div 
                  key={index}
                  className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center`}
                >
                  {/* 圖片 */}
                  <div className="w-full md:w-1/2">
                    <img
                      src={meal.image || `/placeholder-meal-${index + 1}.jpg`}
                      alt={meal.name || `餐飲 ${index + 1}`}
                      className="w-full h-[350px] object-cover rounded-lg shadow-2xl"
                      style={{ border: `8px solid white` }}
                    />
                  </div>
                  
                  {/* 文字 */}
                  <div className="w-full md:w-1/2 px-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Utensils className="w-6 h-6" style={{ color: colors.secondary }} />
                      <h3 className="text-2xl md:text-3xl font-bold" style={{ color: colors.primary }}>
                        {meal.name || `餐飲 ${index + 1}`}
                      </h3>
                    </div>
                    {meal.type && (
                      <span 
                        className="inline-block px-3 py-1 rounded-full text-sm mb-4"
                        style={{ backgroundColor: colors.accent + "20", color: colors.accent }}
                      >
                        {meal.type}
                      </span>
                    )}
                    <p className="text-lg leading-relaxed mb-4" style={{ color: colors.text }}>
                      {meal.description}
                    </p>
                    {meal.specialties && (
                      <div className="space-y-2">
                        <p className="font-semibold text-sm" style={{ color: colors.secondary }}>特色料理：</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {meal.specialties.map((specialty: string, i: number) => (
                            <li key={i}>{specialty}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">暫無餐飲介紹資訊</p>
          )}
        </div>
      </section>

      {/* 航班資訊區塊 - 資訊卡片 */}
      <section id="flights" className="py-20" style={{ backgroundColor: colors.background }}>
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: colors.primary }}>
            航班資訊
          </h2>
          
          {flights ? (
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 去程 */}
              {flights.outbound && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Plane className="w-6 h-6" style={{ color: colors.primary }} />
                    <h3 className="text-xl font-bold" style={{ color: colors.primary }}>去程</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">航空公司</p>
                      <p className="font-semibold">{flights.outbound.airline}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">出發</p>
                        <p className="font-semibold">{flights.outbound.departure}</p>
                        <p className="text-lg font-bold" style={{ color: colors.primary }}>
                          {flights.outbound.departureTime}
                        </p>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-full border-t-2 border-dashed" style={{ borderColor: colors.secondary }}></div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">抵達</p>
                        <p className="font-semibold">{flights.outbound.arrival}</p>
                        <p className="text-lg font-bold" style={{ color: colors.primary }}>
                          {flights.outbound.arrivalTime}
                        </p>
                      </div>
                    </div>
                    {flights.outbound.duration && (
                      <p className="text-sm text-center text-gray-600">
                        飛行時間：{flights.outbound.duration}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* 回程 */}
              {flights.inbound && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Plane className="w-6 h-6 transform rotate-180" style={{ color: colors.primary }} />
                    <h3 className="text-xl font-bold" style={{ color: colors.primary }}>回程</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">航空公司</p>
                      <p className="font-semibold">{flights.inbound.airline}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">出發</p>
                        <p className="font-semibold">{flights.inbound.departure}</p>
                        <p className="text-lg font-bold" style={{ color: colors.primary }}>
                          {flights.inbound.departureTime}
                        </p>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-full border-t-2 border-dashed" style={{ borderColor: colors.secondary }}></div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">抵達</p>
                        <p className="font-semibold">{flights.inbound.arrival}</p>
                        <p className="text-lg font-bold" style={{ color: colors.primary }}>
                          {flights.inbound.arrivalTime}
                        </p>
                      </div>
                    </div>
                    {flights.inbound.duration && (
                      <p className="text-sm text-center text-gray-600">
                        飛行時間：{flights.inbound.duration}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : tour.airline ? (
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
              <Plane className="w-12 h-12 mx-auto mb-4" style={{ color: colors.primary }} />
              <p className="text-lg font-semibold">{tour.airline}</p>
            </div>
          ) : (
            <p className="text-center text-gray-600">暫無航班資訊</p>
          )}
        </div>
      </section>

      {/* 費用說明區塊 - 清單式 */}
      <section id="cost" className="py-20 bg-white">
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: colors.primary }}>
            費用說明
          </h2>
          
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 費用包含 */}
            {includes && includes.length > 0 && (
              <div className="bg-green-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
                  <span className="text-green-600">✓</span>
                  費用包含
                </h3>
                <ul className="space-y-2">
                  {includes.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* 費用不包含 */}
            {excludes && excludes.length > 0 && (
              <div className="bg-red-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
                  <span className="text-red-600">✗</span>
                  費用不包含
                </h3>
                <ul className="space-y-2">
                  {excludes.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {tour.costExplanation && (
            <div className="max-w-4xl mx-auto mt-8 bg-gray-50 p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>
                詳細說明
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {tour.costExplanation}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 注意事項區塊 - 清單式 */}
      <section id="notice" className="py-20" style={{ backgroundColor: colors.background }}>
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: colors.primary }}>
            注意事項
          </h2>
          
          {tour.noticeDetailed ? (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-start gap-3 mb-6">
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: colors.accent }} />
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {tour.noticeDetailed}
                  </p>
                </div>
              </div>
            </div>
          ) : tour.specialReminders ? (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: colors.accent }} />
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {tour.specialReminders}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600">暫無注意事項資訊</p>
          )}
        </div>
      </section>

      {/* 預訂區塊 - CTA */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: colors.primary }}>
              準備好出發了嗎？
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              立即預訂，開啟您的精彩旅程
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 hover:scale-105 transition-transform"
                style={{ backgroundColor: colors.primary }}
              >
                立即預訂
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 hover:scale-105 transition-transform"
                style={{ borderColor: colors.primary, color: colors.primary }}
                onClick={() => window.print()}
              >
                <Download className="w-5 h-5 mr-2" />
                下載行程
              </Button>
            </div>
            
            {/* 聯絡資訊 */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-600 mb-4">需要協助？歡迎聯絡我們</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <a href="tel:+15106342307" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                  <span>📞</span>
                  <span>+1 (510) 634-2307</span>
                </a>
                <a href="mailto:jeffhsieh09@gmail.com" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                  <span>✉️</span>
                  <span>jeffhsieh09@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
