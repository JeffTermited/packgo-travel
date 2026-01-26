/**
 * LionHeroSection.tsx
 * 雄獅旅遊風格的 Hero Section 組件
 * 包含左側概覽卡片和右側日曆選擇器
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Plane, Users, Clock } from "lucide-react";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore } from "date-fns";
import { zhTW } from "date-fns/locale";

interface Departure {
  id: number;
  date: Date;
  price: number;
  availableSeats: number;
  totalSeats: number;
  status: "available" | "limited" | "soldout";
}

interface LionHeroSectionProps {
  title: string;
  productCode: string;
  mainImage: string;
  destination: string;
  duration: string;
  airline?: string;
  airlineLogo?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  flightDuration?: string;
  basePrice: number;
  departures?: Departure[];
  onBooking?: (departureId: number) => void;
}

export function LionHeroSection({
  title,
  productCode,
  mainImage,
  destination,
  duration,
  airline = "長榮航空",
  airlineLogo,
  departureAirport = "TPE 桃園機場",
  arrivalAirport,
  flightDuration = "4h 40m",
  basePrice,
  departures = [],
  onBooking,
}: LionHeroSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 生成日曆天數
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 找到選定日期對應的出發資訊
  const selectedDeparture = departures.find(dep => 
    selectedDate && isSameDay(new Date(dep.date), selectedDate)
  );

  // 處理日期點擊
  const handleDateClick = (date: Date) => {
    const departure = departures.find(dep => isSameDay(new Date(dep.date), date));
    if (departure && departure.status !== "soldout") {
      setSelectedDate(date);
    }
  };

  // 處理報名按鈕點擊
  const handleBookingClick = () => {
    if (selectedDeparture && onBooking) {
      onBooking(selectedDeparture.id);
    }
  };

  // 獲取日期的出發資訊
  const getDepartureForDate = (date: Date) => {
    return departures.find(dep => isSameDay(new Date(dep.date), date));
  };

  // 獲取日期的樣式
  const getDateClassName = (date: Date) => {
    const departure = getDepartureForDate(date);
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const isCurrentMonth = isSameMonth(date, selectedMonth);

    let className = "relative p-2 text-center cursor-pointer transition-all";

    if (!isCurrentMonth) {
      className += " text-gray-300";
    } else if (!departure) {
      className += " text-gray-400 cursor-not-allowed";
    } else if (departure.status === "soldout") {
      className += " text-gray-400 cursor-not-allowed line-through";
    } else if (isSelected) {
      className += " bg-red-600 text-white font-bold rounded-lg";
    } else if (departure.status === "limited") {
      className += " bg-orange-100 text-orange-800 hover:bg-orange-200 rounded-lg";
    } else {
      className += " bg-red-50 text-red-600 hover:bg-red-100 rounded-lg";
    }

    return className;
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側:行程概覽卡片 */}
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            {/* 行程編號標籤 */}
            <div className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
              國外團體
            </div>

            {/* 行程標題 */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
              {title}
            </h1>

            {/* 產品資訊 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="font-medium">產品代碼:</span>
                <span>{productCode}</span>
              </div>
              {departures.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="text-green-600 font-medium">
                    可賣 {departures.filter(d => d.status !== "soldout").reduce((sum, d) => sum + d.availableSeats, 0)} 席次
                  </span>
                </div>
              )}
            </div>

            {/* 主圖 */}
            <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden">
              <img 
                src={mainImage} 
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* 行程資訊 */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-gray-500">目的地</div>
                  <div className="font-medium">{destination}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-gray-500">行程天數</div>
                  <div className="font-medium">{duration}</div>
                </div>
              </div>
            </div>

            {/* 航班資訊 */}
            {arrivalAirport && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">參考航班</h3>
                <div className="space-y-3">
                  {/* 去程 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Plane className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">{airline}</div>
                        <div className="font-medium">{departureAirport}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{flightDuration}</div>
                    <div className="font-medium">{arrivalAirport}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 價格與CTA */}
            <div className="border-t pt-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">TWD</div>
                  <div className="text-4xl font-bold text-red-600">
                    {selectedDeparture ? selectedDeparture.price.toLocaleString() : basePrice.toLocaleString()}+
                  </div>
                  <div className="text-sm text-gray-500">人/起</div>
                </div>
                {selectedDeparture && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">剩餘席次</div>
                    <div className="text-2xl font-bold text-green-600">
                      {selectedDeparture.availableSeats}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                >
                  費用說明
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={!selectedDate || !selectedDeparture}
                  onClick={handleBookingClick}
                >
                  報名
                </Button>
              </div>
            </div>
          </div>

          {/* 右側:出發日期日曆 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* 日曆標題 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {format(selectedMonth, "yyyy年M月", { locale: zhTW })}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMonth(addMonths(selectedMonth, -1))}
                >
                  上個月
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
                >
                  下個月
                </Button>
              </div>
            </div>

            {/* 日曆表頭 */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* 日曆內容 */}
            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map((date) => {
                const departure = getDepartureForDate(date);
                return (
                  <div
                    key={date.toISOString()}
                    className={getDateClassName(date)}
                    onClick={() => handleDateClick(date)}
                  >
                    <div className="text-lg font-medium">{format(date, "d")}</div>
                    {departure && departure.status !== "soldout" && (
                      <div className="text-xs mt-1">
                        {departure.price.toLocaleString()}+
                      </div>
                    )}
                    {departure && departure.status === "soldout" && (
                      <div className="text-xs mt-1 text-gray-400">已滿</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 圖例 */}
            <div className="mt-6 pt-6 border-t space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 rounded"></div>
                <span className="text-gray-600">可報名</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 rounded"></div>
                <span className="text-gray-600">席次有限</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span className="text-gray-600">已滿團</span>
              </div>
            </div>

            {/* 選擇提示 */}
            {selectedDate && selectedDeparture && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-1">已選擇出發日期:</div>
                  <div>{format(selectedDate, "yyyy年M月d日 (E)", { locale: zhTW })}</div>
                  <div className="mt-2">
                    價格: <span className="font-bold">TWD {selectedDeparture.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
