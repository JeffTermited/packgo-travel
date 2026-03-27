import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Search, Sparkles, Plane, Hotel, Ticket, Users, Lock } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import AIAdvisor from "./AIAdvisor";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { DestinationAutocomplete } from "@/components/DestinationAutocomplete";
import { DepartureAutocomplete } from "@/components/DepartureAutocomplete";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";


export default function Hero() {
  const [activeTab, setActiveTab] = useState("group");
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [, setLocation] = useLocation();
  const { t, language } = useLocale();

  // Hot keywords for destinations - hardcoded for each language
  const hotKeywordsMap: Record<string, string[]> = {
    'zh-TW': ['北海道', '東京', '大阪', '歐洲', '土耳其', '郵輪', '滑雪'],
    'en': ['Hokkaido', 'Tokyo', 'Osaka', 'Europe', 'Turkey', 'Cruise', 'Skiing'],
  };
  const hotKeywords = hotKeywordsMap[language] || hotKeywordsMap['en'];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination.trim()) {
      params.set("destination", destination.trim());
    }
    if (departure.trim()) {
      params.set("departure", departure.trim());
    }
    const queryString = params.toString();
    setLocation(`/search${queryString ? `?${queryString}` : ""}`);
  };

  const handleKeywordClick = (keyword: string) => {
    setLocation(`/search?destination=${encodeURIComponent(keyword)}`);
  };

  const handleLockedTabClick = () => {
    toast.info(t('common.comingSoon'));
  };


  return (
    <section className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-sakura.webp" 
          alt="Cherry Blossoms Travel" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="container relative z-10 flex flex-col items-center pt-10">
        {/* Hero Text */}
        <div className="text-center mb-8 animate-in fade-in zoom-in duration-1000">
          <h2 className="text-white text-xl md:text-2xl font-serif mb-2 tracking-widest text-shadow">
            {t('hero.subtitle')}
          </h2>
          <h1 className="text-white text-4xl md:text-6xl font-bold font-serif tracking-tight text-shadow-lg">
            {t('hero.title')}
          </h1>
        </div>

        {/* Search Console - Lion Travel Style */}
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 duration-700 delay-300 overflow-hidden">
          {/* Tabs */}
          <div className="flex w-full border-b border-gray-200 bg-gray-50 rounded-t-3xl">
            {[
              { id: "group", labelKey: "hero.search.tabs.groupTours", icon: <Users className="h-4 w-4" />, locked: false },
              { id: "flight", labelKey: "hero.search.tabs.flights", icon: <Plane className="h-4 w-4" />, locked: true },
              { id: "hotel", labelKey: "hero.search.tabs.hotels", icon: <Hotel className="h-4 w-4" />, locked: true },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.locked) {
                    handleLockedTabClick();
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex-1 py-4 px-2 text-base font-medium transition-all relative flex items-center justify-center gap-2 ${
                  tab.locked 
                    ? "text-gray-400 cursor-not-allowed bg-gray-100" 
                    : activeTab === tab.id 
                      ? "text-primary bg-white border-t-2 border-t-primary" 
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                {t(tab.labelKey)}
                {tab.locked && <Lock className="h-3 w-3 ml-1" />}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 bg-white rounded-b-3xl">
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Use flexbox with equal basis for equal widths */}
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  {/* Departure Location - Changed to Autocomplete */}
                  <div className="w-full" style={{ flex: '1 1 0', minWidth: 0 }}>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">{t('hero.search.departure')}</label>
                    <DepartureAutocomplete 
                      value={departure}
                      onChange={setDeparture}
                      placeholder={t('hero.search.departurePlaceholder')}
                      className="w-full [&_input]:rounded-lg [&_input]:bg-gray-50 [&_input]:border-gray-200 [&_input]:focus:ring-primary [&_input]:focus:border-primary [&_input]:h-12 [&_input]:w-full"
                    />
                  </div>

                  {/* Keyword Input */}
                  <div className="w-full" style={{ flex: '1 1 0', minWidth: 0 }}>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">{t('hero.search.keyword')}</label>
                    <DestinationAutocomplete 
                      value={destination}
                      onChange={setDestination}
                      onSelect={handleSearch}
                      placeholder={t('hero.search.destinationPlaceholder')}
                      className="w-full [&_input]:rounded-lg [&_input]:bg-gray-50 [&_input]:border-gray-200 [&_input]:focus:ring-primary [&_input]:focus:border-primary [&_input]:h-12 [&_input]:w-full"
                    />
                  </div>

                  {/* Date Range Picker */}
                  <div className="w-full" style={{ flex: '1 1 0', minWidth: 0 }}>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">{t('hero.search.departureDate')}</label>
                    <DateRangePicker 
                      value={dateRange}
                      onChange={setDateRange}
                      placeholder={t('hero.search.selectDate')}
                      className="h-12 rounded-lg w-full"
                    />
                  </div>

                  {/* Search Button */}
                  <div className="w-full md:w-32 flex-shrink-0">
                    <Button 
                      onClick={handleSearch}
                      className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-lg font-bold shadow-md transition-all hover:shadow-lg"
                    >
                      {t('hero.search.searchButton')}
                    </Button>
                  </div>
                </div>


                {/* Hot Keywords - Only show for group tours */}
                {activeTab === "group" && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100">
                    <span className="font-medium text-primary">{t('hero.search.hotKeywords')}：</span>
                    <div className="flex flex-wrap gap-2">
                      {hotKeywords.map((keyword: string) => (
                        <button 
                          key={keyword} 
                          onClick={() => handleKeywordClick(keyword)}
                          className="hover:text-primary hover:underline transition-colors"
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

