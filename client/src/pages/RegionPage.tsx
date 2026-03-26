import { useParams, useLocation } from "wouter";
import SEO from "@/components/SEO";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { continentMapping, continentOrder } from "@shared/continentMapping";
import { useLocale } from "@/contexts/LocaleContext";

// 地區配置（與首頁 Destinations 對應）
const regionConfig: Record<string, {
  nameKey: string;
  label: string;
  descriptionKey: string;
  image: string;
  continents: string[]; // 對應的洲別
}> = {
  "europe": {
    nameKey: "regionPage.europe.name",
    label: "Europe",
    descriptionKey: "regionPage.europe.description",
    image: "/images/dest-europe.webp",
    continents: ["歐洲"]
  },
  "asia": {
    nameKey: "regionPage.asia.name",
    label: "Asia",
    descriptionKey: "regionPage.asia.description",
    image: "/images/dest-asia.webp",
    continents: ["亞洲"]
  },
  "south-america": {
    nameKey: "regionPage.southAmerica.name",
    label: "Americas",
    descriptionKey: "regionPage.southAmerica.description",
    image: "/images/dest-southamerica.webp",
    continents: ["美洲"]
  },
  "middle-east": {
    nameKey: "regionPage.middleEast.name",
    label: "Middle East",
    descriptionKey: "regionPage.middleEast.description",
    image: "/images/dest-israel.webp",
    continents: ["中東"]
  },
  "africa": {
    nameKey: "regionPage.africa.name",
    label: "Africa",
    descriptionKey: "regionPage.africa.description",
    image: "/images/dest-africa.webp",
    continents: ["非洲"]
  },
  "cruise": {
    nameKey: "regionPage.cruise.name",
    label: "Cruises",
    descriptionKey: "regionPage.cruise.description",
    image: "/images/dest-cruise.webp",
    continents: [] // 郵輪是特殊類別，不按洲別分
  },
  "oceania": {
    nameKey: "regionPage.oceania.name",
    label: "Oceania",
    descriptionKey: "regionPage.oceania.description",
    image: "/images/dest-europe.webp",
    continents: ["大洋洲"]
  }
};

// 國家圖片映射（使用本地圖片優先，備用 Unsplash）
const countryImages: Record<string, string> = {
  // 亞洲 - 使用本地高品質圖片
  "台灣": "/images/countries/taiwan.jpg",
  "日本": "/images/countries/japan.jpg",
  "中國": "/images/countries/china.jpg",
  "韓國": "/images/countries/korea.jpg",
  "泰國": "/images/countries/thailand.jpg",
  "越南": "/images/countries/vietnam.jpg",
  "新加坡": "/images/countries/singapore.jpg",
  "馬來西亞": "/images/countries/malaysia.jpg",
  "印尼": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
  "印度": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
  "菲律賓": "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800",
  "柬埔寨": "https://images.unsplash.com/photo-1569242840510-9fe6f0112cee?w=800",
  "緬甸": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
  "尼泊爾": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
  "斯里蘭卡": "https://images.unsplash.com/photo-1586523969990-d8e3c?w=800",
  // 歐洲 - 使用本地高品質圖片
  "英國": "/images/countries/uk.jpg",
  "法國": "/images/countries/france.jpg",
  "德國": "/images/countries/germany.jpg",
  "義大利": "/images/countries/italy.jpg",
  "西班牙": "/images/countries/spain.jpg",
  "瑞士": "/images/countries/switzerland.jpg",
  "荷蘭": "/images/countries/netherlands.jpg",
  "希臘": "/images/countries/greece.jpg",
  "捷克": "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800",
  "奧地利": "https://images.unsplash.com/photo-1516426122078-c23e76319af?w=800",
  "巴爾幹半島": "https://images.unsplash.com/photo-1555990538-1e6c0c1b1b0c?w=800",
  "葡萄牙": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800",
  "比利時": "https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=800",
  "北歐": "https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=800",
  "冰島": "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800",
  "克羅埃西亞": "https://images.unsplash.com/photo-1555990538-1e6c0c1b1b0c?w=800",
  // 大洋洲 - 使用本地高品質圖片
  "澳洲": "/images/countries/australia.jpg",
  "紐西蘭": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800",
  // 美洲 - 使用本地高品質圖片
  "美國": "/images/countries/usa.jpg",
  "加拿大": "/images/countries/canada.jpg",
  "墨西哥": "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800",
  "巴西": "/images/countries/brazil.jpg",
  "阿根廷": "https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=800",
  "秘魯": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800",
  "智利": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
  "古巴": "https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=800",
  // 非洲 - 使用本地高品質圖片
  "埃及": "/images/countries/egypt.jpg",
  "南非": "https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=800",
  "摩洛哥": "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800",
  "肯亞": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800",
  "坦尚尼亞": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
  // 中東 - 使用本地高品質圖片
  "阿聯酋": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
  "杜拜": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
  "約旦": "/images/countries/jordan.jpg",
  "以色列": "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800",
  "土耳其": "/images/countries/turkey.jpg",
};

export default function RegionPage() {
  const { region } = useParams<{ region: string }>();
  const [, setLocation] = useLocation();
  const { t } = useLocale();
  
  const config = regionConfig[region || ""] || {
    nameKey: "regionPage.title",
    label: "Unknown",
    descriptionKey: "regionPage.subtitle",
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
      <SEO title="地區行程" description="瀏覽 PACK&GO 各地區精選旅遊行程，找到最適合您的旅遊目的地。" url="/regions" />
        <Header />
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative h-[400px] overflow-hidden">
            <img 
              src={config.image} 
              alt={t(config.nameKey)}
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
                  {t('common.backToHome')}
                </Button>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
                  {t(config.nameKey)}
                </h1>
                <p className="text-gray-200 text-lg">{t(config.descriptionKey)}</p>
              </div>
            </div>
          </section>

          {/* 郵輪行程列表 */}
          <section className="py-16">
            <div className="container">
              <p className="text-gray-500 text-center">
                {t('cruise.comingSoon') || '郵輪行程功能開發中，敬請期待...'}
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
            alt={t(config.nameKey)}
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
                {t('common.backToHome')}
              </Button>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
                {t(config.nameKey)}
              </h1>
              <p className="text-gray-200 text-lg">{t(config.descriptionKey)}</p>
            </div>
          </div>
        </section>

        {/* 國家列表 */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">
              {t('regionPage.popularDestinations')}
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200  mb-3" />
                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : countries.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">{t('regionPage.noToursInRegion')}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleBackClick}
                >
                  {t('common.backToHome')}
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
                    <div className="relative aspect-[4/3] overflow-hidden  mb-3 shadow-md hover:shadow-xl transition-all duration-300">
                      <img
                        src={countryImages[country.country] || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800`}
                        alt={country.country}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                      <div className="absolute bottom-0 left-0 w-full p-4">
                        <h3 className="text-xl font-bold text-white">{country.country}</h3>
                        <p className="text-gray-200 text-sm">{country.count} {t('countryPage.tours')}</p>
                      </div>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 rounded-lg p-2">
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
