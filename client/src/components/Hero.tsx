import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import AIAdvisor from "./AIAdvisor";

export default function Hero() {
  const [activeTab, setActiveTab] = useState("group");

  return (
    <section className="relative w-full h-[800px] md:h-[900px] flex items-center justify-center overflow-hidden">
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
      <div className="container relative z-10 flex flex-col items-center pt-20">
        {/* Hero Text */}
        <div className="text-center mb-12 animate-in fade-in zoom-in duration-1000">
          <h2 className="text-white text-xl md:text-2xl font-serif mb-2 tracking-widest text-shadow">
            * 跟著花期去旅行 *
          </h2>
          <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-bold font-serif tracking-tight text-shadow-lg">
            精選旅程 折扣<span className="text-white">最後一週</span>
          </h1>
        </div>

        {/* Search Console */}
        <div className="w-full max-w-5xl bg-black/60 backdrop-blur-md p-1 rounded-none shadow-2xl animate-in slide-in-from-bottom-10 duration-700 delay-300">
          {/* Tabs */}
          <div className="flex w-full border-b border-white/10 overflow-x-auto">
            {[
              { id: "group", label: "團遊 Group Tours" },
              { id: "flight", label: "機票 Flights" },
              { id: "hotel", label: "飯店 Hotels" },
              { id: "cruise", label: "郵輪 Cruises" },
              { id: "custom", label: "客製 Customized" },
              { id: "ai-advisor", label: "AI 規劃 Advisor", icon: <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-4 text-sm font-medium transition-all relative whitespace-nowrap flex items-center justify-center gap-2 ${
                  activeTab === tab.id 
                    ? "text-white bg-white/10" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "ai-advisor" ? (
              <div className="animate-in fade-in zoom-in duration-300">
                <AIAdvisor />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Destination Input */}
                <div className="md:col-span-5 relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="搜尋目的地 (例如: 日本, 歐洲...)" 
                    className="w-full h-14 pl-12 pr-4 bg-white/90 border-0 rounded-none text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
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
                    className="w-full h-14 pl-12 pr-4 bg-white/90 border-0 rounded-none text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  />
                </div>

                {/* Search Button */}
                <div className="md:col-span-2">
                  <Button 
                    className="w-full h-14 bg-primary hover:bg-red-700 text-white rounded-none text-lg font-medium shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    搜尋
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
