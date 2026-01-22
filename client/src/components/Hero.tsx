import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Search, Sparkles, Plane, Hotel, Ticket, Users } from "lucide-react";
import { useState } from "react";
import AIAdvisor from "./AIAdvisor";

export default function Hero() {
  const [activeTab, setActiveTab] = useState("group");

  const hotKeywords = ["北海道", "東京", "大阪", "歐洲", "土耳其", "郵輪", "滑雪"];

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
        <div className="w-full max-w-5xl bg-white rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-700 delay-300">
          {/* Tabs */}
          <div className="flex w-full border-b border-gray-200 bg-gray-50">
            {[
              { id: "group", label: "團體旅遊", icon: <Users className="h-4 w-4" /> },
              { id: "flight", label: "機票", icon: <Plane className="h-4 w-4" /> },
              { id: "hotel", label: "訂房", icon: <Hotel className="h-4 w-4" /> },
              { id: "ticket", label: "票券", icon: <Ticket className="h-4 w-4" /> },
              { id: "ai-advisor", label: "AI 旅遊顧問", icon: <Sparkles className="h-4 w-4 text-primary" /> },
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
          <div className="p-6 bg-white">
            {activeTab === "ai-advisor" ? (
              <div className="animate-in fade-in zoom-in duration-300">
                <AIAdvisor />
              </div>
            ) : (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Destination Input */}
                  <div className="md:col-span-5 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="請輸入目的地、景點、關鍵字" 
                      className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-primary focus:border-primary focus:bg-white transition-all outline-none"
                    />
                  </div>

                  {/* Date Input */}
                  <div className="md:col-span-5 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="選擇出發日期" 
                      className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-primary focus:border-primary focus:bg-white transition-all outline-none"
                    />
                  </div>

                  {/* Search Button */}
                  <div className="md:col-span-2">
                    <Button 
                      className="w-full h-12 bg-primary hover:bg-red-700 text-white rounded font-bold shadow-md transition-all hover:shadow-lg"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      搜尋
                    </Button>
                  </div>
                </div>

                {/* Hot Keywords */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <span className="font-medium text-primary">熱門搜尋：</span>
                  <div className="flex flex-wrap gap-2">
                    {hotKeywords.map((keyword) => (
                      <a 
                        key={keyword} 
                        href="#" 
                        className="hover:text-primary hover:underline transition-colors"
                      >
                        {keyword}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
