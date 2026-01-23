import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { MapPin, Calendar, DollarSign, Users } from "lucide-react";

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

  // Fetch tours with filters
  const { data: tours, isLoading } = trpc.tours.search.useQuery({
    destination: destination === "all" ? "" : destination,
    minDays,
    maxDays,
    minPrice,
    maxPrice,
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

        <div className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <Card className="border-2 border-black rounded-none shadow-none">
                <CardContent className="p-6 space-y-8">
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-black">篩選條件</h3>
                  </div>

                  {/* Destination Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-black flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      目的地
                    </label>
                    <Select value={destination} onValueChange={setDestination}>
                      <SelectTrigger className="border-2 border-black rounded-none h-12">
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

                  {/* Days Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-black flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      旅遊天數：{minDays} - {maxDays} 天
                    </label>
                    <Slider
                      min={1}
                      max={30}
                      step={1}
                      value={[minDays, maxDays]}
                      onValueChange={([min, max]) => {
                        setMinDays(min);
                        setMaxDays(max);
                      }}
                      className="py-4"
                    />
                  </div>

                  {/* Price Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-black flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      價格區間：NT$ {minPrice.toLocaleString()} - NT$ {maxPrice.toLocaleString()}
                    </label>
                    <Slider
                      min={0}
                      max={100000}
                      step={5000}
                      value={[minPrice, maxPrice]}
                      onValueChange={([min, max]) => {
                        setMinPrice(min);
                        setMaxPrice(max);
                      }}
                      className="py-4"
                    />
                  </div>

                  {/* Sort By */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-black">排序方式</label>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                      <SelectTrigger className="border-2 border-black rounded-none h-12">
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
                    className="w-full bg-black hover:bg-gray-800 text-white rounded-none h-12 font-bold"
                  >
                    套用篩選
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* Results Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">載入中...</p>
                </div>
              ) : tours && tours.length > 0 ? (
                <>
                  <div className="mb-6">
                    <p className="text-gray-600">找到 {tours.length} 個行程</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {tours.map((tour: any) => (
                      <Card 
                        key={tour.id} 
                        className="border-2 border-black rounded-none shadow-none hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setLocation(`/tours/${tour.id}`)}
                      >
                        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
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
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-bold text-lg text-black line-clamp-2">{tour.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{tour.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {tour.duration} 天
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {tour.destination}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <span className="text-2xl font-bold text-black">
                              NT$ {tour.price?.toLocaleString()}
                            </span>
                            <Button className="bg-black hover:bg-gray-800 text-white rounded-none">
                              查看詳情
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
