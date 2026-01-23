import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin, Calendar, Users, Star } from "lucide-react";

export default function CustomTours() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[400px] bg-black flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70"></div>
          <div className="container relative z-10 text-center text-white">
            <h1 className="text-5xl font-bold mb-4">客製旅遊</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              打造專屬於您的完美旅程，讓我們為您量身訂做獨一無二的旅行體驗
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-black mb-8">為什麼選擇客製旅遊？</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="border border-gray-200 p-6">
                  <MapPin className="h-12 w-12 text-black mb-4" />
                  <h3 className="text-xl font-bold text-black mb-2">自由選擇目的地</h3>
                  <p className="text-gray-600">
                    不受限於既定行程，想去哪就去哪，完全依照您的喜好規劃
                  </p>
                </div>
                
                <div className="border border-gray-200 p-6">
                  <Calendar className="h-12 w-12 text-black mb-4" />
                  <h3 className="text-xl font-bold text-black mb-2">彈性安排時間</h3>
                  <p className="text-gray-600">
                    自由決定出發日期與旅遊天數，完全配合您的時間安排
                  </p>
                </div>
                
                <div className="border border-gray-200 p-6">
                  <Users className="h-12 w-12 text-black mb-4" />
                  <h3 className="text-xl font-bold text-black mb-2">專屬旅遊顧問</h3>
                  <p className="text-gray-600">
                    專業顧問一對一服務，從規劃到出發全程協助
                  </p>
                </div>
                
                <div className="border border-gray-200 p-6">
                  <Star className="h-12 w-12 text-black mb-4" />
                  <h3 className="text-xl font-bold text-black mb-2">獨特體驗</h3>
                  <p className="text-gray-600">
                    深度探索在地文化，享受與眾不同的旅行回憶
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-8 border border-gray-200 mb-12">
                <h3 className="text-2xl font-bold text-black mb-4">客製旅遊流程</h3>
                <ol className="space-y-4 text-gray-700">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">1</span>
                    <div>
                      <strong>提出需求：</strong>告訴我們您的旅遊想法、預算、人數和時間
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">2</span>
                    <div>
                      <strong>行程規劃：</strong>專業顧問為您量身打造行程並提供報價
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">3</span>
                    <div>
                      <strong>確認細節：</strong>討論並調整行程內容，直到您完全滿意
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">4</span>
                    <div>
                      <strong>安心出發：</strong>完成預訂後，我們會處理所有細節，您只需享受旅程
                    </div>
                  </li>
                </ol>
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-black mb-4">準備好開始規劃了嗎？</h3>
                <p className="text-gray-600 mb-6">
                  填寫客製旅遊需求表，讓我們為您打造夢想中的旅程
                </p>
                <Link href="/custom-tour-request">
                  <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8">
                    立即諮詢
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
