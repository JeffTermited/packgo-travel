import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { MapPin, Calendar, DollarSign, Heart, Star, Plane, Bus, Hotel, Utensils } from "lucide-react";

export default function SearchResults() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  // Filter states
  const [destination, setDestination] = useState(searchParams.get("destination") || "all");
  const [minDays, setMinDays] = useState(Number(searchParams.get("minDays")) || 1);
  const [maxDays, setMaxDays] = useState(Number(searchParams.get("maxDays")) || 30);
  const [minPrice, setMinPrice] = useState(Number(searchParams.get("minPrice")) || 0);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get("maxPrice")) || 100000);
  const [sortBy, setSortBy] = useState<"popular" | "price_asc" | "price_desc" | "days_asc" | "days_desc">(searchParams.get("sortBy") as any || "popular");
  
  // New filter states - initialize from URL
  const [tourType, setTourType] = useState<string[]>(searchParams.get("tourType")?.split(",").filter(Boolean) || []);
  const [weekdays, setWeekdays] = useState<string[]>(searchParams.get("weekdays")?.split(",").filter(Boolean) || []);
  const [airlines, setAirlines] = useState<string[]>(searchParams.get("airlines")?.split(",").filter(Boolean) || []);
  const [hotelGrade, setHotelGrade] = useState<string[]>(searchParams.get("hotelGrade")?.split(",").filter(Boolean) || []);
  const [specialActivities, setSpecialActivities] = useState<string[]>(searchParams.get("specialActivities")?.split(",").filter(Boolean) || []);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Sync filters to URL whenever they change
  useEffect(() => {
    const params = new URLSearchParams();
    if (destination && destination !== "all") params.set("destination", destination);
    if (minDays !== 1) params.set("minDays", minDays.toString());
    if (maxDays !== 30) params.set("maxDays", maxDays.toString());
    if (minPrice !== 0) params.set("minPrice", minPrice.toString());
    if (maxPrice !== 100000) params.set("maxPrice", maxPrice.toString());
    if (sortBy !== "popular") params.set("sortBy", sortBy);
    if (tourType.length > 0) params.set("tourType", tourType.join(","));
    if (weekdays.length > 0) params.set("weekdays", weekdays.join(","));
    if (airlines.length > 0) params.set("airlines", airlines.join(","));
    if (hotelGrade.length > 0) params.set("hotelGrade", hotelGrade.join(","));
    if (specialActivities.length > 0) params.set("specialActivities", specialActivities.join(","));
    
    const newUrl = params.toString() ? `/search?${params.toString()}` : "/search";
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [destination, minDays, maxDays, minPrice, maxPrice, sortBy, tourType, weekdays, airlines, hotelGrade, specialActivities]);

  // Fetch tours with filters
  const { data: tours, isLoading } = trpc.tours.search.useQuery({
    destination: destination === "all" ? "" : destination,
    minDays,
    maxDays,
    minPrice,
    maxPrice,
    airlines: airlines.length > 0 ? airlines : undefined,
    hotelGrades: hotelGrade.length > 0 ? hotelGrade : undefined,
    specialActivities: specialActivities.length > 0 ? specialActivities : undefined,
    sortBy,
  });

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (destination && destination !== "all") params.set("destination", destination);
    params.set("minDays", minDays.toString());
    params.set("maxDays", maxDays.toString());
    params.set("minPrice", minPrice.toString());
    params.set("maxPrice", maxPrice.toString());
    params.set("sortBy", sortBy);
    setLocation(`/search?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setDestination("all");
    setMinDays(1);
    setMaxDays(30);
    setMinPrice(0);
    setMaxPrice(100000);
    setSortBy("popular");
    setTourType([]);
    setWeekdays([]);
    setAirlines([]);
    setHotelGrade([]);
    setSpecialActivities([]);
    setLocation("/search");
  };

  const toggleFavorite = (tourId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tourId)) {
        newFavorites.delete(tourId);
      } else {
        newFavorites.add(tourId);
      }
      return newFavorites;
    });
  };

  const getTourTags = (tour: any) => {
    const tags = [];
    if (tour.price && tour.price < 20000) tags.push({ label: "限時優惠", icon: Star });
    if (tour.duration >= 7) tags.push({ label: "深度旅遊", icon: Calendar });
    if (tour.price && tour.price > 50000) tags.push({ label: "精緻行程", icon: Hotel });
    tags.push({ label: "航空", icon: Plane });
    tags.push({ label: "巴士", icon: Bus });
    return tags;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Page Header */}
        <section className="bg-black text-white py-12 border-b border-gray-800">
          <div className="container">
            <h1 className="text-4xl font-serif font-bold mb-2">搜尋行程</h1>
            <p className="text-gray-300">找到最適合您的旅遊行程</p>
          </div>
        </section>

        {/* Search Bar Section */}
        <section className="bg-gray-100 py-6 border-b border-gray-200">
          <div className="container">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Destination */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">出發地</label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger className="h-12 rounded-lg border-gray-300">
                      <SelectValue placeholder="不限" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="日本">日本</SelectItem>
                      <SelectItem value="韓國">韓國</SelectItem>
                      <SelectItem value="歐洲">歐洲</SelectItem>
                      <SelectItem value="美國">美國</SelectItem>
                      <SelectItem value="東南亞">東南亞</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Keywords */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">關鍵字</label>
                  <input 
                    type="text" 
                    placeholder="日本" 
                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                {/* Date Range */}
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">出發時間</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      className="flex-1 h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <span className="text-gray-500">~</span>
                    <input 
                      type="date" 
                      className="flex-1 h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <div className="md:col-span-2">
                  <Button 
                    onClick={handleApplyFilters}
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold"
                  >
                    搜尋
                  </Button>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6 mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox />
                  <span className="text-sm text-gray-700">只找成行</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox />
                  <span className="text-sm text-gray-700">只找可報名</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Enhanced Filters Sidebar */}
            <aside className="lg:col-span-1">
              <Card className="border-2 border-gray-300 rounded-xl shadow-none">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-black">篩選條件</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleResetFilters}
                      className="text-sm text-gray-600 hover:text-black"
                    >
                      重設
                    </Button>
                  </div>

                  {/* Destination Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-black flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      目的地
                    </label>
                    <Select value={destination} onValueChange={setDestination}>
                      <SelectTrigger className="border-2 border-gray-300 rounded-xl h-10">
                        <SelectValue placeholder="選擇目的地" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="日本">日本</SelectItem>
                        <SelectItem value="韓國">韓國</SelectItem>
                        <SelectItem value="歐洲">歐洲</SelectItem>
                        <SelectItem value="美國">美國</SelectItem>
                        <SelectItem value="東南亞">東南亞</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tour Type Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-black">旅遊型態</label>
                    <div className="space-y-2">
                      {["團體旅遊", "自由行", "客製包團"].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox 
                            id={type}
                            checked={tourType.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTourType([...tourType, type]);
                              } else {
                                setTourType(tourType.filter(t => t !== type));
                              }
                            }}
                          />
                          <label htmlFor={type} className="text-sm text-gray-700 cursor-pointer">
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Days Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-black flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      旅遊天數
                    </label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{minDays} 天</span>
                        <span>{maxDays} 天</span>
                      </div>
                      <Slider
                        min={1}
                        max={30}
                        step={1}
                        value={[minDays, maxDays]}
                        onValueChange={([min, max]) => {
                          setMinDays(min);
                          setMaxDays(max);
                        }}
                        className="py-2"
                      />
                    </div>
                  </div>

                  {/* Weekday Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-black">出發星期</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["日", "一", "二", "三", "四", "五", "六"].map((day, index) => (
                        <Button
                          key={day}
                          variant={weekdays.includes(day) ? "default" : "outline"}
                          size="sm"
                          className={`h-8 text-xs ${
                            weekdays.includes(day) 
                              ? "bg-black text-white hover:bg-gray-800" 
                              : "border-gray-300 hover:border-black"
                          }`}
                          onClick={() => {
                            if (weekdays.includes(day)) {
                              setWeekdays(weekdays.filter(d => d !== day));
                            } else {
                              setWeekdays([...weekdays, day]);
                            }
                          }}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Airlines Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-black flex items-center gap-2">
                      <Plane className="h-4 w-4" />
                      航空公司
                    </label>
                    <div className="space-y-2">
                      {["中華航空", "長榮航空", "星宇航空", "國泰航空", "日本航空", "全日空"].map((airline) => (
                        <div key={airline} className="flex items-center space-x-2">
                          <Checkbox 
                            id={airline}
                            checked={airlines.includes(airline)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setAirlines([...airlines, airline]);
                              } else {
                                setAirlines(airlines.filter(a => a !== airline));
                              }
                            }}
                          />
                          <label htmlFor={airline} className="text-sm text-gray-700 cursor-pointer">
                            {airline}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hotel Grade Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-black flex items-center gap-2">
                      <Hotel className="h-4 w-4" />
                      飯店等級
                    </label>
                    <div className="space-y-2">
                      {["五星級", "四星級", "三星級", "精品飯店", "溫泉飯店"].map((grade) => (
                        <div key={grade} className="flex items-center space-x-2">
                          <Checkbox 
                            id={grade}
                            checked={hotelGrade.includes(grade)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setHotelGrade([...hotelGrade, grade]);
                              } else {
                                setHotelGrade(hotelGrade.filter(g => g !== grade));
                              }
                            }}
                          />
                          <label htmlFor={grade} className="text-sm text-gray-700 cursor-pointer">
                            {grade}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Activities Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-black flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      特殊活動
                    </label>
                    <div className="space-y-2">
                      {["賞櫻", "賞楓", "滑雪", "溫泉", "美食之旅", "文化體驗", "購物行程"].map((activity) => (
                        <div key={activity} className="flex items-center space-x-2">
                          <Checkbox 
                            id={activity}
                            checked={specialActivities.includes(activity)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSpecialActivities([...specialActivities, activity]);
                              } else {
                                setSpecialActivities(specialActivities.filter(a => a !== activity));
                              }
                            }}
                          />
                          <label htmlFor={activity} className="text-sm text-gray-700 cursor-pointer">
                            {activity}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-black flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      價格區間
                    </label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>NT$ {minPrice.toLocaleString()}</span>
                        <span>NT$ {maxPrice.toLocaleString()}</span>
                      </div>
                      <Slider
                        min={0}
                        max={100000}
                        step={5000}
                        value={[minPrice, maxPrice]}
                        onValueChange={([min, max]) => {
                          setMinPrice(min);
                          setMaxPrice(max);
                        }}
                        className="py-2"
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-black">排序方式</label>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                      <SelectTrigger className="border-2 border-gray-300 rounded-xl h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">熱門度</SelectItem>
                        <SelectItem value="price_asc">價格：低到高</SelectItem>
                        <SelectItem value="price_desc">價格：高到低</SelectItem>
                        <SelectItem value="days_asc">天數：短到長</SelectItem>
                        <SelectItem value="days_desc">天數：長到短</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleApplyFilters}
                    className="w-full bg-black hover:bg-gray-800 text-white h-11 font-semibold"
                  >
                    套用篩選
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* Results List - Horizontal Cards */}
            <div className="lg:col-span-3">
              {/* Selected Filters Display */}
              {(destination !== "all" || tourType.length > 0 || weekdays.length > 0 || airlines.length > 0 || hotelGrade.length > 0 || specialActivities.length > 0 || minDays !== 1 || maxDays !== 30 || minPrice !== 0 || maxPrice !== 100000) && (
                <div className="mb-6 p-4 border-2 border-gray-300 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-black">已選篩選條件</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleResetFilters}
                      className="text-xs text-gray-600 hover:text-black h-7"
                    >
                      清除全部
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {destination !== "all" && (
                      <Badge 
                        variant="outline" 
                        className="border-gray-300 bg-white text-black px-3 py-1 cursor-pointer hover:bg-gray-800 hover:text-white transition-colors rounded-full"
                        onClick={() => setDestination("all")}
                      >
                        目的地：{destination} ×
                      </Badge>
                    )}
                    {tourType.map(type => (
                      <Badge 
                        key={type}
                        variant="outline" 
                        className="border-gray-300 bg-white text-black px-3 py-1 cursor-pointer hover:bg-gray-800 hover:text-white transition-colors rounded-full"
                        onClick={() => setTourType(tourType.filter(t => t !== type))}
                      >
                        {type} ×
                      </Badge>
                    ))}
                    {weekdays.map(day => (
                      <Badge 
                        key={day}
                        variant="outline" 
                        className="border-gray-300 bg-white text-black px-3 py-1 cursor-pointer hover:bg-gray-800 hover:text-white transition-colors rounded-full"
                        onClick={() => setWeekdays(weekdays.filter(d => d !== day))}
                      >
                        星期{day} ×
                      </Badge>
                    ))}
                    {airlines.map(airline => (
                      <Badge 
                        key={airline}
                        variant="outline" 
                        className="border-gray-300 bg-white text-black px-3 py-1 cursor-pointer hover:bg-gray-800 hover:text-white transition-colors rounded-full"
                        onClick={() => setAirlines(airlines.filter(a => a !== airline))}
                      >
                        {airline} ×
                      </Badge>
                    ))}
                    {hotelGrade.map(grade => (
                      <Badge 
                        key={grade}
                        variant="outline" 
                        className="border-gray-300 bg-white text-black px-3 py-1 cursor-pointer hover:bg-gray-800 hover:text-white transition-colors rounded-full"
                        onClick={() => setHotelGrade(hotelGrade.filter(g => g !== grade))}
                      >
                        {grade} ×
                      </Badge>
                    ))}
                    {specialActivities.map(activity => (
                      <Badge 
                        key={activity}
                        variant="outline" 
                        className="border-gray-300 bg-white text-black px-3 py-1 cursor-pointer hover:bg-gray-800 hover:text-white transition-colors rounded-full"
                        onClick={() => setSpecialActivities(specialActivities.filter(a => a !== activity))}
                      >
                        {activity} ×
                      </Badge>
                    ))}
                    {(minDays !== 1 || maxDays !== 30) && (
                      <Badge 
                        variant="outline" 
                        className="border-gray-300 bg-white text-black px-3 py-1 cursor-pointer hover:bg-gray-800 hover:text-white transition-colors rounded-full"
                        onClick={() => { setMinDays(1); setMaxDays(30); }}
                      >
                        天數：{minDays}-{maxDays}天 ×
                      </Badge>
                    )}
                    {(minPrice !== 0 || maxPrice !== 100000) && (
                      <Badge 
                        variant="outline" 
                        className="border-gray-300 bg-white text-black px-3 py-1 cursor-pointer hover:bg-gray-800 hover:text-white transition-colors rounded-full"
                        onClick={() => { setMinPrice(0); setMaxPrice(100000); }}
                      >
                        價格：${minPrice.toLocaleString()}-${maxPrice.toLocaleString()} ×
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">載入中...</p>
                </div>
              ) : tours && tours.length > 0 ? (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <p className="text-gray-600">找到 <span className="font-semibold text-black">{tours.length}</span> 個行程</p>
                  </div>
                  <div className="space-y-4">
                    {tours.map((tour: any, index: number) => {
                      const tags = getTourTags(tour);
                      const isFavorite = favorites.has(tour.id);
                      
                      return (
                        <Card 
                          key={tour.id} 
                          className="border-2 border-gray-300 rounded-xl shadow-none hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                        >
                          <div className="flex flex-col md:flex-row">
                            {/* Image Section */}
                            <div 
                              className="relative md:w-72 h-48 md:h-auto flex-shrink-0 bg-gray-100"
                              onClick={() => setLocation(`/tours/${tour.id}`)}
                            >
                              {tour.mainImage ? (
                                <img 
                                  src={tour.mainImage} 
                                  alt={tour.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <MapPin className="h-12 w-12" />
                                </div>
                              )}
                              {/* Ranking Badge */}
                              <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 font-bold text-sm">
                                {index + 1}
                              </div>
                              {/* Days Badge */}
                              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 font-semibold text-sm">
                                {tour.duration}天
                              </div>
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 p-5" onClick={() => setLocation(`/tours/${tour.id}`)}>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="font-bold text-lg text-black mb-2 line-clamp-2 hover:text-gray-700 transition-colors">
                                    {tour.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                    {tour.description}
                                  </p>
                                </div>
                                {/* Favorite Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(tour.id);
                                  }}
                                >
                                  <Heart 
                                    className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                  />
                                </Button>
                              </div>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {tags.map((tag, idx) => {
                                  const Icon = tag.icon;
                                  return (
                                    <Badge 
                                      key={idx} 
                                      variant="secondary" 
                                      className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-normal px-2 py-1"
                                    >
                                      <Icon className="h-3 w-3 mr-1" />
                                      {tag.label}
                                    </Badge>
                                  );
                                })}
                              </div>

                              {/* Info Row */}
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  出發地點：台北
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {tour.destination}
                                </span>
                              </div>

                              {/* Departure Dates */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="outline" className="border-black text-black bg-gray-100">
                                  01/25 (六) 熱銷中
                                </Badge>
                                <Badge variant="outline" className="border-gray-400 text-gray-700 bg-gray-50">
                                  02/08 (六) 最後名額
                                </Badge>
                                <Badge variant="outline" className="border-gray-300 text-gray-600">
                                  02/15 (六) 可報名
                                </Badge>
                              </div>

                              {/* Price and Action */}
                              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">起</div>
                                  <span className="text-3xl font-bold text-black">
                                    {tour.price?.toLocaleString()}
                                  </span>
                                  <span className="text-sm text-gray-600 ml-1">元起</span>
                                </div>
                                <Button 
                                  className="bg-black hover:bg-gray-800 text-white px-6 h-10 font-semibold"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLocation(`/tours/${tour.id}`);
                                  }}
                                >
                                  查看詳情
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">找不到符合條件的行程</h3>
                  <p className="text-gray-500">請嘗試調整篩選條件</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
