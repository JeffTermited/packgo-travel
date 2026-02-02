import { useState, useEffect, Fragment, useMemo } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import { 
  MapPin, Calendar, Heart, Star, Plane, Bus, Ship, Train, 
  Sparkles, Mountain, Utensils, Camera, Users, Clock, 
  ChevronRight, ChevronDown, ChevronUp, Search, X, SlidersHorizontal, Filter
} from "lucide-react";
import { DestinationAutocomplete } from "@/components/DestinationAutocomplete";
import { groupDestinationsByContinent, continentOrder } from "@shared/continentMapping";
import { FavoriteButton } from "@/components/FavoriteButton";

// 智能標籤生成函數 - 根據行程資料自動生成正確的標籤
const generateSmartTags = (tour: any) => {
  const tags: { label: string; icon: any; color: string }[] = [];
  
  // 1. 根據天數判斷行程類型
  if (tour.duration >= 10) {
    tags.push({ label: "深度旅遊", icon: Mountain, color: "bg-emerald-100 text-emerald-700" });
  } else if (tour.duration >= 7) {
    tags.push({ label: "經典行程", icon: Star, color: "bg-amber-100 text-amber-700" });
  } else if (tour.duration <= 4) {
    tags.push({ label: "輕旅行", icon: Sparkles, color: "bg-sky-100 text-sky-700" });
  }
  
  // 2. 根據價格判斷行程等級
  if (tour.price && tour.price >= 80000) {
    tags.push({ label: "精緻行程", icon: Star, color: "bg-purple-100 text-purple-700" });
  } else if (tour.price && tour.price < 30000) {
    tags.push({ label: "超值優惠", icon: Sparkles, color: "bg-rose-100 text-rose-700" });
  }
  
  // 3. 根據交通方式判斷
  const category = tour.category?.toLowerCase() || "";
  const title = tour.title?.toLowerCase() || "";
  const description = tour.description?.toLowerCase() || "";
  const combinedText = `${title} ${description}`;
  
  if (category === "cruise" || combinedText.includes("郵輪") || combinedText.includes("遊輪")) {
    tags.push({ label: "郵輪", icon: Ship, color: "bg-blue-100 text-blue-700" });
  }
  
  if (tour.outboundAirline || combinedText.includes("航空") || combinedText.includes("飛機")) {
    tags.push({ label: "航空", icon: Plane, color: "bg-indigo-100 text-indigo-700" });
  }
  
  if (combinedText.includes("高鐵") || combinedText.includes("火車") || combinedText.includes("列車")) {
    tags.push({ label: "鐵道", icon: Train, color: "bg-orange-100 text-orange-700" });
  }
  
  if (combinedText.includes("巴士") || combinedText.includes("遊覽車")) {
    tags.push({ label: "巴士", icon: Bus, color: "bg-gray-100 text-gray-700" });
  }
  
  // 4. 根據特色活動判斷
  if (combinedText.includes("美食") || combinedText.includes("料理") || combinedText.includes("餐廳")) {
    tags.push({ label: "美食之旅", icon: Utensils, color: "bg-red-100 text-red-700" });
  }
  
  if (combinedText.includes("攝影") || combinedText.includes("拍照") || combinedText.includes("打卡")) {
    tags.push({ label: "攝影之旅", icon: Camera, color: "bg-pink-100 text-pink-700" });
  }
  
  // 5. 根據行程類型判斷
  if (category === "group" || combinedText.includes("團體")) {
    tags.push({ label: "團體旅遊", icon: Users, color: "bg-teal-100 text-teal-700" });
  }
  
  // 6. 解析資料庫中的 tags 欄位
  if (tour.tags) {
    try {
      const dbTags = typeof tour.tags === "string" ? JSON.parse(tour.tags) : tour.tags;
      if (Array.isArray(dbTags)) {
        dbTags.forEach((tag: string) => {
          // 避免重複標籤
          if (!tags.some(t => t.label === tag)) {
            tags.push({ label: tag, icon: Star, color: "bg-gray-100 text-gray-700" });
          }
        });
      }
    } catch (e) {
      // 忽略解析錯誤
    }
  }
  
  // 限制最多顯示 5 個標籤
  return tags.slice(0, 5);
};

export default function SearchResults() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  // 篩選狀態
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || searchParams.get("destination") || "");
  const [sortBy, setSortBy] = useState<"popular" | "price_asc" | "price_desc" | "days_asc" | "days_desc">(
    searchParams.get("sortBy") as any || "popular"
  );
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // 進階篩選狀態
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [durationRange, setDurationRange] = useState<[number, number]>([1, 30]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  
  const pageSize = 12;

  // 獲取智能篩選選項
  const { data: filterOptions } = trpc.tours.getFilterOptions.useQuery();

  // 洲別展開狀態
  const [expandedContinents, setExpandedContinents] = useState<Set<string>>(new Set(["亞洲"]));

  // 將目的地按洲別分組
  const groupedDestinations = useMemo(() => {
    if (!filterOptions?.destinations) return {};
    return groupDestinationsByContinent(filterOptions.destinations);
  }, [filterOptions?.destinations]);

  // 切換洲別展開狀態
  const toggleContinent = (continent: string) => {
    setExpandedContinents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(continent)) {
        newSet.delete(continent);
      } else {
        newSet.add(continent);
      }
      return newSet;
    });
  };

  // 當獲取到篩選選項時，初始化範圍
  useEffect(() => {
    if (filterOptions) {
      setDurationRange([filterOptions.durationRange.min, filterOptions.durationRange.max]);
      setPriceRange([filterOptions.priceRange.min, filterOptions.priceRange.max]);
    }
  }, [filterOptions]);

  // 同步篩選到 URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (sortBy !== "popular") params.set("sortBy", sortBy);
    
    const newUrl = params.toString() ? `/search?${params.toString()}` : "/search";
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [keyword, sortBy]);

  // 組合搜尋關鍵字（包含選中的目的地）
  const searchKeyword = useMemo(() => {
    if (selectedDestinations.length === 1) {
      // 如果只選了一個目的地，用它作為搜尋關鍵字
      return keyword || selectedDestinations[0];
    }
    return keyword;
  }, [keyword, selectedDestinations]);

  // 搜尋行程
  // 智能標籤篩選在前端執行，不傳遞到後端
  const { data, isLoading } = trpc.tours.search.useQuery({
    destination: searchKeyword,
    minDays: durationRange[0],
    maxDays: durationRange[1],
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    sortBy,
    page: 1, // 當使用前端篩選時，先獲取所有資料
    pageSize: 100, // 獲取較多資料以便前端篩選
  });
  
  // 在前端過濾多個目的地和智能標籤
  const filteredTours = useMemo(() => {
    let result = data?.tours || [];
    
    // 1. 多個目的地篩選
    if (selectedDestinations.length > 1) {
      result = result.filter(tour => 
        selectedDestinations.some(dest => 
          tour.destinationCountry?.includes(dest) || 
          tour.destination?.includes(dest)
        )
      );
    }
    
    // 2. 智能標籤篩選（前端過濾）
    if (selectedTags.length > 0) {
      result = result.filter(tour => {
        const combinedText = `${tour.title || ''} ${tour.description || ''} ${tour.category || ''}`.toLowerCase();
        
        return selectedTags.every(tag => {
          // 天數分類
          if (tag === '深度旅遊') return tour.duration >= 10;
          if (tag === '經典行程') return tour.duration >= 7 && tour.duration < 10;
          if (tag === '輕旅行') return tour.duration <= 4;
          if (tag === '一般行程') return tour.duration > 4 && tour.duration < 7;
          
          // 價格分類
          if (tag === '精緻行程') return tour.price && tour.price >= 80000;
          if (tag === '超值優惠') return tour.price && tour.price < 30000;
          
          // 交通方式
          if (tag === '航空') return tour.outboundAirline || combinedText.includes('航空') || combinedText.includes('飛機');
          if (tag === '鐵道') return combinedText.includes('高鐵') || combinedText.includes('火車') || combinedText.includes('列車');
          if (tag === '郵輪') return tour.category === 'cruise' || combinedText.includes('郵輪') || combinedText.includes('遊輪');
          if (tag === '巴士') return combinedText.includes('巴士') || combinedText.includes('遊覽車');
          
          // 特色活動
          if (tag === '美食之旅') return combinedText.includes('美食') || combinedText.includes('料理') || combinedText.includes('餐廳');
          if (tag === '攝影之旅') return combinedText.includes('攝影') || combinedText.includes('拍照') || combinedText.includes('打卡');
          if (tag === '團體旅遊') return tour.category === 'group' || combinedText.includes('團體');
          if (tag === '永續旅遊') return combinedText.includes('esg') || combinedText.includes('永續');
          if (tag === '溫泉') return combinedText.includes('溫泉');
          
          return true;
        });
      });
    }
    
    return result;
  }, [data?.tours, selectedDestinations, selectedTags]);

  const tours = filteredTours;
  const pagination = data?.pagination;

  // 計算已套用的篩選數量
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedDestinations.length > 0) count++;
    if (selectedTags.length > 0) count++;
    if (filterOptions) {
      if (durationRange[0] !== filterOptions.durationRange.min || durationRange[1] !== filterOptions.durationRange.max) count++;
      if (priceRange[0] !== filterOptions.priceRange.min || priceRange[1] !== filterOptions.priceRange.max) count++;
    }
    return count;
  }, [selectedDestinations, selectedTags, durationRange, priceRange, filterOptions]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setKeyword("");
    setSortBy("popular");
    setCurrentPage(1);
    setLocation("/search");
  };

  const handleClearFilters = () => {
    setSelectedDestinations([]);
    setSelectedTags([]);
    if (filterOptions) {
      setDurationRange([filterOptions.durationRange.min, filterOptions.durationRange.max]);
      setPriceRange([filterOptions.priceRange.min, filterOptions.priceRange.max]);
    }
    setCurrentPage(1);
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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const toggleDestination = (destination: string) => {
    setSelectedDestinations(prev => 
      prev.includes(destination) 
        ? prev.filter(d => d !== destination)
        : [...prev, destination]
    );
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        {/* 簡潔的頁面標題 */}
        <section className="bg-white border-b border-gray-200">
          <div className="container py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">探索行程</h1>
            <p className="text-gray-500">找到最適合您的旅遊體驗</p>
          </div>
        </section>

        {/* 搜尋欄 */}
        <section className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="container py-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* 搜尋輸入 */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <DestinationAutocomplete 
                    value={keyword}
                    onChange={setKeyword}
                    placeholder="搜尋目的地、行程名稱..."
                    className="w-full [&_input]:pl-12 [&_input]:h-12 [&_input]:text-base [&_input]:rounded-full [&_input]:border-gray-300 [&_input]:focus:border-black [&_input]:focus:ring-black"
                  />
                  {keyword && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 篩選按鈕 + 排序選擇 */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-12 px-4 rounded-full border-gray-300 ${showFilters ? 'bg-black text-white border-black' : ''}`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  篩選
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 bg-black text-white text-xs px-1.5 py-0.5">
                      {activeFilterCount}
                    </Badge>
                  )}
                  {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                </Button>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="w-40 h-12 rounded-full border-gray-300">
                    <SelectValue placeholder="排序方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">熱門推薦</SelectItem>
                    <SelectItem value="price_asc">價格低到高</SelectItem>
                    <SelectItem value="price_desc">價格高到低</SelectItem>
                    <SelectItem value="days_asc">天數短到長</SelectItem>
                    <SelectItem value="days_desc">天數長到短</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleSearch}
                  className="h-12 px-8 bg-black hover:bg-gray-800 text-white rounded-full font-medium"
                >
                  搜尋
                </Button>
              </div>
            </div>

            {/* 可展開的篩選面板 */}
            {showFilters && filterOptions && (
              <div className="mt-4 p-6 bg-gray-50 rounded-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900">進階篩選</h3>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      清除所有篩選
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* 目的地篩選 - 按洲別分組 */}
                  {Object.keys(groupedDestinations).length > 0 && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">目的地</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {Object.entries(groupedDestinations).map(([continent, destinations]) => (
                          <div key={continent} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* 洲別標題 */}
                            <button
                              onClick={() => toggleContinent(continent)}
                              className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              <span className="font-medium text-gray-800">{continent}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {destinations.reduce((sum, d) => sum + d.count, 0)} 個行程
                                </span>
                                {expandedContinents.has(continent) ? (
                                  <ChevronUp className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                )}
                              </div>
                            </button>
                            {/* 國家列表 */}
                            {expandedContinents.has(continent) && (
                              <div className="p-3 bg-white space-y-2">
                                {destinations.map(({ country, count }) => (
                                  <label key={country} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <Checkbox
                                      checked={selectedDestinations.includes(country)}
                                      onCheckedChange={() => toggleDestination(country)}
                                    />
                                    <span className="text-sm text-gray-600 flex-1">{country}</span>
                                    <span className="text-xs text-gray-400">({count})</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 智能標籤篩選 - 按分類顯示 */}
                  {filterOptions.smartTags && (
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="text-sm font-medium text-gray-700">行程類型</h4>
                      
                      {/* 天數分類 */}
                      {filterOptions.smartTags.duration.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-500 mb-2 block">天數</span>
                          <div className="flex flex-wrap gap-2">
                            {filterOptions.smartTags.duration.map(({ label, count }) => (
                              <Badge
                                key={label}
                                variant={selectedTags.includes(label) ? "default" : "outline"}
                                className={`cursor-pointer transition-colors ${
                                  selectedTags.includes(label) 
                                    ? 'bg-black text-white hover:bg-gray-800' 
                                    : 'hover:bg-gray-100 border-gray-300'
                                }`}
                                onClick={() => toggleTag(label)}
                              >
                                {label}
                                <span className="ml-1 text-xs opacity-70">({count})</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 價格分類 */}
                      {filterOptions.smartTags.price.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-500 mb-2 block">價格</span>
                          <div className="flex flex-wrap gap-2">
                            {filterOptions.smartTags.price.map(({ label, count }) => (
                              <Badge
                                key={label}
                                variant={selectedTags.includes(label) ? "default" : "outline"}
                                className={`cursor-pointer transition-colors ${
                                  selectedTags.includes(label) 
                                    ? 'bg-black text-white hover:bg-gray-800' 
                                    : 'hover:bg-gray-100 border-gray-300'
                                }`}
                                onClick={() => toggleTag(label)}
                              >
                                {label}
                                <span className="ml-1 text-xs opacity-70">({count})</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 交通方式 */}
                      {filterOptions.smartTags.transport.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-500 mb-2 block">交通方式</span>
                          <div className="flex flex-wrap gap-2">
                            {filterOptions.smartTags.transport.map(({ label, count }) => (
                              <Badge
                                key={label}
                                variant={selectedTags.includes(label) ? "default" : "outline"}
                                className={`cursor-pointer transition-colors ${
                                  selectedTags.includes(label) 
                                    ? 'bg-black text-white hover:bg-gray-800' 
                                    : 'hover:bg-gray-100 border-gray-300'
                                }`}
                                onClick={() => toggleTag(label)}
                              >
                                {label}
                                <span className="ml-1 text-xs opacity-70">({count})</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 特色活動 */}
                      {filterOptions.smartTags.feature.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-500 mb-2 block">特色活動</span>
                          <div className="flex flex-wrap gap-2">
                            {filterOptions.smartTags.feature.map(({ label, count }) => (
                              <Badge
                                key={label}
                                variant={selectedTags.includes(label) ? "default" : "outline"}
                                className={`cursor-pointer transition-colors ${
                                  selectedTags.includes(label) 
                                    ? 'bg-black text-white hover:bg-gray-800' 
                                    : 'hover:bg-gray-100 border-gray-300'
                                }`}
                                onClick={() => toggleTag(label)}
                              >
                                {label}
                                <span className="ml-1 text-xs opacity-70">({count})</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 天數範圍 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      天數範圍：{durationRange[0]} - {durationRange[1]} 天
                    </h4>
                    <Slider
                      value={durationRange}
                      onValueChange={(value) => {
                        setDurationRange(value as [number, number]);
                        setCurrentPage(1);
                      }}
                      min={filterOptions.durationRange.min}
                      max={filterOptions.durationRange.max}
                      step={1}
                      className="mt-4"
                    />
                  </div>

                  {/* 價格範圍 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      價格範圍：NT$ {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}
                    </h4>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => {
                        setPriceRange(value as [number, number]);
                        setCurrentPage(1);
                      }}
                      min={filterOptions.priceRange.min}
                      max={filterOptions.priceRange.max}
                      step={1000}
                      className="mt-4"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 已套用的篩選標籤 */}
            {(keyword || selectedTags.length > 0 || selectedDestinations.length > 0) && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500">篩選條件：</span>
                {keyword && (
                  <Badge 
                    variant="secondary" 
                    className="bg-black text-white hover:bg-gray-800 cursor-pointer"
                    onClick={handleClearSearch}
                  >
                    搜尋：{keyword} <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {selectedDestinations.map(dest => (
                  <Badge 
                    key={dest}
                    variant="secondary" 
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                    onClick={() => toggleDestination(dest)}
                  >
                    {dest} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {selectedTags.map(tag => (
                  <Badge 
                    key={tag}
                    variant="secondary" 
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 搜尋結果 */}
        <section className="py-8">
          <div className="container">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-500">載入中...</p>
              </div>
            ) : tours && tours.length > 0 ? (
              <>
                {/* 結果數量 */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    找到 <span className="font-bold text-black">{pagination?.total || tours.length}</span> 個行程
                  </p>
                </div>

                {/* 行程卡片網格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tours.map((tour: any) => {
                    const tags = generateSmartTags(tour);
                    const isFavorite = favorites.has(tour.id);
                    
                    return (
                      <Card 
                        key={tour.id} 
                        className="group border-0 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden bg-white"
                        onClick={() => setLocation(`/tours/${tour.id}`)}
                      >
                        {/* 圖片區域 */}
                        <div className="relative aspect-[4/3] bg-gray-100">
                          {tour.mainImage || tour.heroImage || tour.imageUrl ? (
                            <img 
                              src={tour.mainImage || tour.heroImage || tour.imageUrl} 
                              alt={tour.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <MapPin className="h-16 w-16" />
                            </div>
                          )}
                          
                          {/* 天數標籤 */}
                          <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1.5 text-sm font-medium rounded-full">
                            {tour.duration} 天
                          </div>
                          
                          {/* 收藏按鈕 */}
                          <div className="absolute top-4 right-4">
                            <FavoriteButton tourId={tour.id} size="md" />
                          </div>
                        </div>

                        {/* 內容區域 */}
                        <CardContent className="p-5">
                          {/* 目的地 */}
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                            <MapPin className="h-4 w-4" />
                            <span>{tour.destinationCountry || tour.destination}</span>
                          </div>

                          {/* 標題 */}
                          <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-black transition-colors">
                            {tour.title}
                          </h3>

                          {/* 智能標籤 - 最多顯示3個，超過顯示... */}
                          <div className="flex flex-wrap gap-1.5 mb-4 h-[26px] overflow-hidden">
                            {tags.slice(0, 3).map((tag, idx) => {
                              const Icon = tag.icon;
                              return (
                                <Badge 
                                  key={idx} 
                                  variant="secondary" 
                                  className={`${tag.color} text-xs font-normal px-2 py-0.5`}
                                >
                                  <Icon className="h-3 w-3 mr-1" />
                                  {tag.label}
                                </Badge>
                              );
                            })}
                            {tags.length > 3 && (
                              <Badge 
                                variant="secondary" 
                                className="bg-gray-100 text-gray-500 text-xs font-normal px-2 py-0.5"
                              >
                                +{tags.length - 3}
                              </Badge>
                            )}
                          </div>

                          {/* 價格 */}
                          <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                            <div>
                              <span className="text-xs text-gray-400">每人</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-black">
                                  NT$ {tour.price?.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-500">起</span>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-black hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/tours/${tour.id}`);
                              }}
                            >
                              查看詳情
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* 分頁 */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      上一頁
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          return page === 1 || 
                                 page === pagination.totalPages || 
                                 Math.abs(page - currentPage) <= 2;
                        })
                        .map((page, idx, arr) => {
                          const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1;
                          return (
                            <Fragment key={page}>
                              {showEllipsisBefore && <span className="px-2 text-gray-400">…</span>}
                              <Button
                                variant={currentPage === page ? "default" : "outline"}
                                className={`rounded-full w-10 h-10 p-0 ${currentPage === page ? "bg-black text-white" : ""}`}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            </Fragment>
                          );
                        })}
                    </div>
                    
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage === pagination.totalPages}
                    >
                      下一頁
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">找不到符合條件的行程</h3>
                <p className="text-gray-500 mb-6">請嘗試其他搜尋關鍵字或調整篩選條件</p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={handleClearSearch}
                    variant="outline"
                    className="rounded-full"
                  >
                    清除搜尋條件
                  </Button>
                  {activeFilterCount > 0 && (
                    <Button 
                      onClick={handleClearFilters}
                      variant="outline"
                      className="rounded-full"
                    >
                      清除篩選條件
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
