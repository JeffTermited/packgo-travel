import { useParams, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { continentMapping, continentOrder } from "@shared/continentMapping";

// 地區配置（與首頁 Destinations 對應）
const regionConfig: Record<string, {
  name: string;
  label: string;
  description: string;
  image: string;
  continents: string[]; // 對應的洲別
}> = {
  "europe": {
    name: "歐洲",
    label: "Europe",
    description: "探索歐洲的歷史古蹟、藝術文化與自然風光",
    image: "/images/dest-europe.webp",
    continents: ["歐洲"]
  },
  "asia": {
    name: "中國 & 亞洲",
    label: "China & Asia",
    description: "體驗亞洲的多元文化、美食與自然奇觀",
    image: "/images/dest-asia.webp",
    continents: ["亞洲"]
  },
  "south-america": {
    name: "南美洲",
    label: "South America",
    description: "探索南美洲的熱情、自然奇觀與古文明遺跡",
    image: "/images/dest-southamerica.webp",
    continents: ["美洲"]
  },
  "middle-east": {
    name: "以色列 & 約旦",
    label: "Israel & Jordan",
    description: "走訪中東的聖地、古城與沙漠奇景",
    image: "/images/dest-israel.webp",
    continents: ["中東"]
  },
  "africa": {
    name: "埃及 & 非洲",
    label: "Egypt & Africa",
    description: "探索非洲的野生動物、古文明與自然奇觀",
    image: "/images/dest-africa.webp",
    continents: ["非洲"]
  },
  "cruise": {
    name: "郵輪之旅",
    label: "Cruises",
    description: "享受海上的奢華旅程，探索世界各地的港口城市",
    image: "/images/dest-cruise.webp",
    continents: [] // 郵輪是特殊類別，不按洲別分
  },
  "oceania": {
    name: "大洋洲",
    label: "Oceania",
    description: "探索澳洲、紐西蘭與太平洋島嶼的自然美景",
    image: "/images/dest-europe.webp",
    continents: ["大洋洲"]
  }
};

// 國家圖片映射（預設圖片）
const countryImages: Record<string, string> = {
  // 亞洲
  "日本": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
  "韓國": "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800",
  "台灣": "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800",
  "中國": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800",
  "泰國": "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800",
  "越南": "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800",
  "新加坡": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800",
  "馬來西亞": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800",
  "印尼": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
  "印度": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
  // 歐洲
  "英國": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
  "法國": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
  "德國": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800",
  "義大利": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800",
  "西班牙": "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800",
  "瑞士": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800",
  "荷蘭": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800",
  "希臘": "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800",
  "捷克": "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800",
  "奧地利": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800",
  "巴爾幹半島": "https://images.unsplash.com/photo-1555990538-1e6c0c1b1b0c?w=800",
  // 大洋洲
  "澳洲": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800",
  "紐西蘭": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800",
  // 美洲
  "美國": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800",
  "加拿大": "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800",
  "墨西哥": "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800",
  "巴西": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800",
  "阿根廷": "https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=800",
  "秘魯": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800",
  // 非洲
  "埃及": "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800",
  "南非": "https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=800",
  "摩洛哥": "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800",
  "肯亞": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800",
  // 中東
  "阿聯酋": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
  "杜拜": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
  "約旦": "https://images.unsplash.com/photo-1548786811-dd6e453ccca7?w=800",
  "以色列": "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800",
};

export default function RegionPage() {
  const { region } = useParams<{ region: string }>();
  const [, setLocation] = useLocation();
  
  const config = regionConfig[region || ""] || {
    name: "未知地區",
    label: "Unknown",
    description: "",
    image: "/images/dest-europe.webp",
    continents: []
  };

  // 獲取篩選選項（包含國家列表）
  const { data: filterOptions, isLoading } = trpc.tours.getFilterOptions.useQuery();

  // 根據地區配置篩選國家
  const getCountriesForRegion = () => {
    if (!filterOptions?.destinations) return [];
    
    // 郵輪特殊處理：搜尋帶有「郵輪」標籤的行程
    if (region === "cruise") {
      return []; // 郵輪不按國家分，直接顯示行程
    }
    
    // 根據洲別篩選國家
    return filterOptions.destinations.filter(dest => {
      const continent = continentMapping[dest.country];
      return config.continents.includes(continent);
    });
  };

  const countries = getCountriesForRegion();

  const handleCountryClick = (country: string) => {
    setLocation(`/destinations/${region}/${encodeURIComponent(country)}`);
  };

  const handleBackClick = () => {
    setLocation("/");
  };

  // 郵輪特殊頁面
  if (region === "cruise") {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative h-[400px] overflow-hidden">
            <img 
              src={config.image} 
              alt={config.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-8">
              <div className="container">
                <Button 
                  variant="ghost" 
                  className="text-white mb-4 hover:bg-white/20"
                  onClick={handleBackClick}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回首頁
                </Button>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
                  {config.name}
                </h1>
                <p className="text-gray-200 text-lg">{config.description}</p>
              </div>
            </div>
          </section>

          {/* 郵輪行程列表 */}
          <section className="py-16">
            <div className="container">
              <p className="text-gray-500 text-center">
                郵輪行程功能開發中，敬請期待...
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[400px] overflow-hidden">
          <img 
            src={config.image} 
            alt={config.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-8">
            <div className="container">
              <Button 
                variant="ghost" 
                className="text-white mb-4 hover:bg-white/20"
                onClick={handleBackClick}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回首頁
              </Button>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
                {config.name}
              </h1>
              <p className="text-gray-200 text-lg">{config.description}</p>
            </div>
          </div>
        </section>

        {/* 國家列表 */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">
              選擇目的地
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200 rounded-2xl mb-3" />
                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : countries.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">目前此地區尚無行程</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleBackClick}
                >
                  返回首頁
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {countries.map((country) => (
                  <div
                    key={country.country}
                    onClick={() => handleCountryClick(country.country)}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-3 shadow-md hover:shadow-xl transition-all duration-300">
                      <img
                        src={countryImages[country.country] || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800`}
                        alt={country.country}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                      <div className="absolute bottom-0 left-0 w-full p-4">
                        <h3 className="text-xl font-bold text-white">{country.country}</h3>
                        <p className="text-gray-200 text-sm">{country.count} 個行程</p>
                      </div>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 rounded-full p-2">
                          <ArrowRight className="h-4 w-4 text-gray-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
