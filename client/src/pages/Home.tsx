import Destinations from "@/components/Destinations";
import FeaturedTours from "@/components/FeaturedTours";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />
      
      <main className="flex-grow">
        <Hero />
        <Destinations />
        <FeaturedTours />
        
        {/* Newsletter Section */}
        <section className="bg-[#1A1A1A] py-16 border-b border-gray-800">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-white md:w-1/2">
                <h3 className="text-2xl font-serif font-bold mb-2">訂閱時事通訊</h3>
                <p className="text-gray-400">訂閱我們的電子報，獲取最新的旅遊資訊及優惠活動</p>
              </div>
              <div className="w-full md:w-1/2 flex gap-0">
                <div className="relative flex-grow">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input 
                    type="email" 
                    placeholder="輸入您的電子郵件地址" 
                    className="w-full h-12 pl-12 pr-4 bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <Button className="h-12 px-8 bg-primary hover:bg-red-700 text-white rounded-none font-bold tracking-wide">
                  訂閱
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trustpilot Section */}
        <section className="py-12 bg-gray-50 border-b border-gray-200">
          <div className="container flex flex-col items-center justify-center text-center">
            <h4 className="text-xl font-serif font-bold text-gray-900 mb-6">Excellent</h4>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {[
                { name: "5 stars", desc: "This is my first time using a Chinese agency...", author: "Melody, Dec 24" },
                { name: "Good company", desc: "Good company", author: "Ming Kuang, Dec 22" },
                { name: "Excellent job", desc: "Excellent job", author: "Ruixin Lanwu, Dec 22" },
              ].map((review, idx) => (
                <div key={idx} className="flex flex-col items-start text-left max-w-[250px]">
                  <div className="flex text-green-500 mb-2">
                    {"★★★★★".split("").map((star, i) => (
                      <span key={i} className="text-xl">★</span>
                    ))}
                  </div>
                  <h5 className="font-bold text-gray-900 text-sm mb-1">{review.name}</h5>
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">{review.desc}</p>
                  <span className="text-gray-400 text-[10px]">{review.author}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm font-medium text-gray-900">
              <span className="text-green-500 text-xl">★</span> Trustpilot
              <span className="text-gray-500 font-normal">Based on 1,200+ reviews</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
