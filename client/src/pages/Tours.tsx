import { useState, useMemo, useCallback } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Calendar, Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocale } from "@/contexts/LocaleContext";
import { useDebounce } from "@/hooks/useDebounce";

// 行程卡片組件，支援動態翻譯和貨幣轉換
function TourCard({ tour, language, t, formatPrice }: { 
  tour: any; 
  language: string; 
  t: (key: string) => string;
  formatPrice: (price: number, originalCurrency?: 'TWD' | 'USD') => string;
}) {
  const shouldLoadTranslation = language !== 'zh-TW';
  
  const { data: translations } = trpc.translation.getTourTranslations.useQuery(
    { tourId: tour.id, targetLanguage: language as 'en' | 'es' | 'ja' | 'ko' },
    { 
      enabled: shouldLoadTranslation,
      staleTime: 1000 * 60 * 5,
    }
  );

  const displayTitle = useMemo(() => {
    if (language === 'zh-TW') return tour.title;
    return translations?.title || tour.title;
  }, [language, translations, tour.title]);

  return (
    <Link href={`/tours/${tour.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-200">
        <div className="relative aspect-[4/3] overflow-hidden">
          {tour.imageUrl || tour.heroImage ? (
            <img
              src={tour.imageUrl || tour.heroImage}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <MapPin className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {tour.status === "inactive" && (
            <Badge className="absolute top-4 right-4 bg-red-500 text-white rounded-none">
              {t('tours.inactive')}
            </Badge>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {displayTitle}
          </h3>

          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {tour.destinationCountry} {tour.destinationCity}
            </span>
          </div>

          <div className="flex items-center text-gray-600 mb-4">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {tour.duration} {t('tours.days')} {tour.nights} {t('tours.nights')}
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(tour.price || 0, (tour.priceCurrency || 'TWD') as 'TWD' | 'USD')}
              </span>
              <span className="text-sm text-gray-500 ml-1">{t('tours.startingFrom')}</span>
            </div>
            <Button className="rounded-none bg-black text-white hover:bg-gray-800">
              {t('tours.viewDetails')}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// 分頁元件
function Pagination({ 
  page, 
  totalPages, 
  onPageChange 
}: { 
  page: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        className="rounded-none"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {start > 1 && (
        <>
          <Button variant="outline" size="sm" className="rounded-none w-9 h-9 p-0" onClick={() => onPageChange(1)}>1</Button>
          {start > 2 && <span className="text-gray-400">…</span>}
        </>
      )}
      
      {pages.map(p => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="sm"
          className={`rounded-none w-9 h-9 p-0 ${p === page ? 'bg-black text-white' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}
      
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-400">…</span>}
          <Button variant="outline" size="sm" className="rounded-none w-9 h-9 p-0" onClick={() => onPageChange(totalPages)}>{totalPages}</Button>
        </>
      )}
      
      <Button
        variant="outline"
        size="sm"
        className="rounded-none"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function Tours() {
  const [searchInput, setSearchInput] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedSortBy, setSelectedSortBy] = useState<string>("popular");
  const [page, setPage] = useState(1);
  const { t, language, formatPrice } = useLocale();

  // 防抖搜尋，避免每個字元都觸發 API
  const debouncedSearch = useDebounce(searchInput, 400);

  // 當篩選條件改變時重置頁碼
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const handleCountryChange = useCallback((value: string) => {
    setSelectedCountry(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSelectedSortBy(value);
    setPage(1);
  }, []);

  // 使用後端搜尋 API（帶分頁）
  const { data, isLoading } = trpc.tours.search.useQuery({
    destination: debouncedSearch || undefined,
    sortBy: selectedSortBy as "popular" | "price_asc" | "price_desc" | "days_asc" | "days_desc",
    page,
    pageSize: 12,
  });

  const tours = data?.tours ?? [];
  const pagination = data?.pagination;

  // 前端對國家做二次篩選（因為後端 search 用 destination 模糊匹配，國家需精確匹配）
  const filteredTours = useMemo(() => {
    if (selectedCountry === "all") return tours;
    return tours.filter((tour: any) => tour.destinationCountry === selectedCountry);
  }, [tours, selectedCountry]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
          <div className="container">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:text-gray-200 mb-4 rounded-none">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.backToHome')}
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-4">{t('tours.title')}</h1>
            <p className="text-xl text-gray-300">
              {t('tours.subtitle')}
            </p>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-white border-b">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-4">
              {/* 搜尋框 */}
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={t('tours.searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 rounded-none"
                />
              </div>

              {/* 國家篩選 */}
              <Select value={selectedCountry} onValueChange={handleCountryChange}>
                <SelectTrigger className="w-full md:w-[200px] rounded-none">
                  <SelectValue placeholder={t('tours.selectCountry')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('tours.allCountries')}</SelectItem>
                  <SelectItem value="日本">{t('destinations.japan')}</SelectItem>
                  <SelectItem value="韓國">{t('destinations.korea')}</SelectItem>
                  <SelectItem value="泰國">{t('destinations.thailand')}</SelectItem>
                  <SelectItem value="新加坡">{t('destinations.singapore')}</SelectItem>
                  <SelectItem value="馬來西亞">{t('destinations.malaysia')}</SelectItem>
                  <SelectItem value="越南">{t('destinations.vietnam')}</SelectItem>
                  <SelectItem value="歐洲">{t('destinations.europe')}</SelectItem>
                  <SelectItem value="美國">{t('destinations.usa')}</SelectItem>
                </SelectContent>
              </Select>

              {/* 排序 */}
              <Select value={selectedSortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full md:w-[200px] rounded-none">
                  <SelectValue placeholder={t('tours.sortBy') || '排序方式'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">{t('tours.sortPopular') || '熱門優先'}</SelectItem>
                  <SelectItem value="price_asc">{t('tours.sortPriceAsc') || '價格由低至高'}</SelectItem>
                  <SelectItem value="price_desc">{t('tours.sortPriceDesc') || '價格由高至低'}</SelectItem>
                  <SelectItem value="days_asc">{t('tours.sortDaysAsc') || '天數由少至多'}</SelectItem>
                  <SelectItem value="days_desc">{t('tours.sortDaysDesc') || '天數由多至少'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Tours Grid */}
        <section className="py-12">
          <div className="container">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredTours.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">{t('tours.noResults')}</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    {t('tours.found')} <span className="font-bold text-gray-900">{pagination?.total ?? filteredTours.length}</span> {t('tours.tours')}
                    {pagination && pagination.totalPages > 1 && (
                      <span className="text-gray-400 ml-2">
                        （第 {pagination.page} / {pagination.totalPages} 頁）
                      </span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTours.map((tour: any) => (
                    <TourCard 
                      key={tour.id} 
                      tour={tour} 
                      language={language} 
                      t={t}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>

                {/* 分頁 */}
                {pagination && selectedCountry === "all" && (
                  <Pagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
