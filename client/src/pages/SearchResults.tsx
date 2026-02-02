import { useState, useEffect, Fragment, useMemo } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  MapPin, Calendar, Heart, Star, Plane, Bus, Ship, Train, 
  Sparkles, Mountain, Utensils, Camera, Users, Clock, 
  ChevronRight, Search, X, SlidersHorizontal
} from "lucide-react";
import { DestinationAutocomplete } from "@/components/DestinationAutocomplete";

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
  
  // 簡化的篩選狀態
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || searchParams.get("destination") || "");
  const [sortBy, setSortBy] = useState<"popular" | "price_asc" | "price_desc" | "days_asc" | "days_desc">(
    searchParams.get("sortBy") as any || "popular"
  );
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 12;

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

  // 搜尋行程
  const { data, isLoading } = trpc.tours.search.useQuery({
    destination: keyword,
    sortBy,
    page: currentPage,
    pageSize,
  });
  
  const tours = data?.tours || [];
  const pagination = data?.pagination;

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setKeyword("");
    setSortBy("popular");
    setCurrentPage(1);
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

        {/* 簡化的搜尋欄 */}
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

              {/* 排序選擇 */}
              <div className="flex items-center gap-3">
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

            {/* 搜尋結果摘要 */}
            {keyword && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-500">搜尋：</span>
                <Badge 
                  variant="secondary" 
                  className="bg-black text-white hover:bg-gray-800 cursor-pointer"
                  onClick={handleClearSearch}
                >
                  {keyword} <X className="h-3 w-3 ml-1" />
                </Badge>
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
                          <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                            {tour.duration} 天
                          </div>
                          
                          {/* 收藏按鈕 */}
                          <button
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(tour.id);
                            }}
                          >
                            <Heart 
                              className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                            />
                          </button>
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

                          {/* 智能標籤 */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {tags.map((tag, idx) => {
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
                <p className="text-gray-500 mb-6">請嘗試其他搜尋關鍵字</p>
                <Button 
                  onClick={handleClearSearch}
                  variant="outline"
                  className="rounded-full"
                >
                  清除搜尋條件
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
