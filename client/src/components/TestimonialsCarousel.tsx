import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const testimonials = [
  {
    nameZh: "陳美玲",
    nameEn: "Melody Chen",
    locationZh: "台北",
    locationEn: "Taipei",
    tourZh: "日本北海道 8 天 7 夜",
    tourEn: "Hokkaido Japan 8D7N",
    rating: 5,
    textZh: "第一次使用 PACK&GO 訂行程，完全超出預期！領隊非常專業，行程安排得很緊湊但不疲憊，每個景點都很精彩。飯店選擇也很棒，下次一定還要再訂！",
    textEn: "First time using PACK&GO and it completely exceeded my expectations! The guide was very professional, the itinerary was well-paced, and every attraction was amazing. Will definitely book again!",
    date: "Dec 2024",
  },
  {
    nameZh: "王明光",
    nameEn: "Ming Kuang Wang",
    locationZh: "高雄",
    locationEn: "Kaohsiung",
    tourZh: "歐洲精華 12 天",
    tourEn: "Europe Highlights 12 Days",
    rating: 5,
    textZh: "PACK&GO 的服務真的很好！從出發前的準備到回程，每個環節都照顧得很周到。特別是簽證辦理幫了我們很大的忙，省去很多麻煩。強烈推薦！",
    textEn: "PACK&GO's service is truly excellent! From pre-trip preparation to the return journey, every detail was well taken care of. The visa processing assistance was especially helpful. Highly recommended!",
    date: "Dec 2024",
  },
  {
    nameZh: "林瑞欣",
    nameEn: "Ruixin Lin",
    locationZh: "台中",
    locationEn: "Taichung",
    tourZh: "土耳其熱氣球 10 天",
    tourEn: "Turkey Hot Air Balloon 10 Days",
    rating: 5,
    textZh: "土耳其熱氣球之旅是我這輩子最難忘的旅行！PACK&GO 安排的每個細節都很完美，從卡帕多奇亞的熱氣球到伊斯坦堡的美食，全都令人印象深刻。",
    textEn: "The Turkey hot air balloon tour was the most unforgettable trip of my life! Every detail arranged by PACK&GO was perfect, from the Cappadocia balloon ride to Istanbul's cuisine.",
    date: "Nov 2024",
  },
  {
    nameZh: "張家豪",
    nameEn: "Jason Chang",
    locationZh: "新竹",
    locationEn: "Hsinchu",
    tourZh: "地中海郵輪 7 天",
    tourEn: "Mediterranean Cruise 7 Days",
    rating: 5,
    textZh: "郵輪行程安排得非常好，PACK&GO 的工作人員在出發前詳細說明了所有注意事項，讓我們全家都玩得很開心。孩子們特別喜歡船上的活動，下次還要再來！",
    textEn: "The cruise itinerary was excellently arranged. PACK&GO staff explained all details before departure, making it a wonderful family trip. The kids loved the onboard activities!",
    date: "Oct 2024",
  },
];

export default function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { language } = useLocale();
  const isEn = language === "en";

  const goTo = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(index);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const prev = () => goTo((current - 1 + testimonials.length) % testimonials.length);
  const next = () => goTo((current + 1) % testimonials.length);

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [current]);

  const t = testimonials[current];

  return (
    <section className="py-16 bg-white border-b border-gray-200">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.3em] text-gray-400 uppercase mb-3">
            {isEn ? "TESTIMONIALS" : "旅客評價"}
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-4">
            {isEn ? "What Our Travelers Say" : "旅客怎麼說"}
          </h2>
        </div>

        {/* Carousel */}
        <div className="max-w-3xl mx-auto">
          <div
            className={`transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}
          >
            {/* Quote Icon */}
            <div className="flex justify-center mb-6">
              <Quote className="h-10 w-10 text-gray-200" />
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: t.rating }).map((_, i) => (
                <span key={i} className="text-black text-xl">★</span>
              ))}
            </div>

            {/* Review Text */}
            <blockquote className="text-center text-gray-700 text-lg leading-relaxed mb-8 font-serif italic px-4">
              "{isEn ? t.textEn : t.textZh}"
            </blockquote>

            {/* Reviewer Info */}
            <div className="text-center">
              <p className="font-bold text-black text-base">
                {isEn ? t.nameEn : t.nameZh}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {isEn ? t.locationEn : t.locationZh} · {isEn ? t.tourEn : t.tourZh} · {t.date}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <button
              onClick={prev}
              className="w-10 h-10 border border-gray-300 hover:border-black flex items-center justify-center transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-2 h-2 transition-all ${
                    i === current ? "bg-black w-6" : "bg-gray-300 hover:bg-gray-500"
                  }`}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 border border-gray-300 hover:border-black flex items-center justify-center transition-colors"
              aria-label="Next review"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
