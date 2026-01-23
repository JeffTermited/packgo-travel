import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Search, Sparkles, Plane, Hotel, Ticket, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useLocation } from "wouter";
import AIAdvisor from "./AIAdvisor";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { DestinationAutocomplete } from "@/components/DestinationAutocomplete";

export default function Hero() {
  const [activeTab, setActiveTab] = useState("group");
  const [departure, setDeparture] = useState("all");
  const [destination, setDestination] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [, setLocation] = useLocation();

  const hotKeywords = ["北海道", "東京", "大阪", "歐洲", "土耳其", "郵輪", "滑雪"];

  const handleSearch = () => {
    if (destination.trim()) {
      setLocation(`/search?destination=${encodeURIComponent(destination.trim())}`);
    } else {
      setLocation("/search");
    }
  };

  const handleKeywordClick = (keyword: string) => {
    setLocation(`/search?destination=${encodeURIComponent(keyword)}`);
  };

  return (
    <section className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-sakura.jpg" 
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
            * 跟著花期去旅行 *
          </h2>
          <h1 className="text-white text-4xl md:text-6xl font-bold font-serif tracking-tight text-shadow-lg">
            精選旅程 折扣<span className="text-white">最後一週</span>
          </h1>
        </div>

        {/* Search Console - Lion Travel Style */}
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-700 delay-300">
          {/* Tabs */}
          <div className="flex w-full border-b border-gray-200 bg-gray-50">
            {[
              { id: "group", label: "團體旅遊", icon: <Users className="h-4 w-4" /> },
              { id: "flight", label: "機票", icon: <Plane className="h-4 w-4" /> },
              { id: "hotel", label: "訂房", icon: <Hotel className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-2 text-base font-medium transition-all relative flex items-center justify-center gap-2 ${
                  activeTab === tab.id 
                    ? "text-primary bg-white border-t-2 border-t-primary" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 bg-white">
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Use flexbox with equal basis for equal widths */}
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  {/* Departure Location */}
                  <div className="w-full" style={{ flex: '1 1 0', minWidth: 0 }}>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">出發地</label>
                    <select 
                      value={departure} 
                      onChange={(e) => setDeparture(e.target.value)}
                      className="w-full h-12 rounded-full border border-gray-300 bg-gray-50 hover:border-gray-400 transition-colors px-4 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                    >
                      <option value="all">全部</option>
                      <option value="台北">台北</option>
                      <option value="台中">台中</option>
                      <option value="台南">台南</option>
                      <option value="高雄">高雄</option>
                    </select>
                  </div>

                  {/* Keyword Input */}
                  <div className="w-full" style={{ flex: '1 1 0', minWidth: 0 }}>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">關鍵字</label>
                    <DestinationAutocomplete 
                      value={destination}
                      onChange={setDestination}
                      onSelect={handleSearch}
                      placeholder="日本"
                      className="w-full [&_input]:rounded-full [&_input]:bg-gray-50 [&_input]:border-gray-200 [&_input]:focus:ring-primary [&_input]:focus:border-primary [&_input]:h-12 [&_input]:w-full"
                    />
                  </div>

                  {/* Date Range Picker */}
                  <div className="w-full" style={{ flex: '1 1 0', minWidth: 0 }}>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">出發時間</label>
                    <DateRangePicker 
                      value={dateRange}
                      onChange={setDateRange}
                      placeholder="選擇日期"
                      className="h-12 rounded-full w-full"
                    />
                  </div>

                  {/* Search Button */}
                  <div className="w-full md:w-32 flex-shrink-0">
                    <Button 
                      onClick={handleSearch}
                      className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-full font-bold shadow-md transition-all hover:shadow-lg"
                    >
                      搜尋
                    </Button>
                  </div>
                </div>

                {/* Hot Keywords */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <span className="font-medium text-primary">熱門搜尋：</span>
                  <div className="flex flex-wrap gap-2">
                    {hotKeywords.map((keyword) => (
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
