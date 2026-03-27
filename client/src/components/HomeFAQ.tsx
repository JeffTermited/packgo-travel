import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { Link } from "wouter";

const faqs = [
  {
    qZh: "如何預訂行程？",
    qEn: "How do I book a tour?",
    aZh: "您可以在網站上瀏覽行程，點擊「立即預訂」填寫資料，或直接聯絡我們的客服人員。我們會在 24 小時內確認您的預訂。",
    aEn: "Browse our tours on the website, click 'Book Now' to fill in your details, or contact our customer service directly. We'll confirm your booking within 24 hours.",
  },
  {
    qZh: "可以客製化行程嗎？",
    qEn: "Can I customize my itinerary?",
    aZh: "當然可以！我們提供完全客製化的旅遊服務。您可以告訴我們您的需求、預算和偏好，我們的專業規劃師會為您量身打造專屬行程。",
    aEn: "Absolutely! We offer fully customized travel services. Tell us your needs, budget, and preferences, and our professional planners will create a tailor-made itinerary just for you.",
  },
  {
    qZh: "簽證需要多久時間辦理？",
    qEn: "How long does visa processing take?",
    aZh: "簽證處理時間因目的地國家而異，一般需要 7–30 個工作天。建議您出發前 2–3 個月開始辦理，我們的簽證專員會全程協助您。",
    aEn: "Visa processing time varies by destination, generally 7–30 business days. We recommend starting 2–3 months before departure. Our visa specialists will assist you throughout the process.",
  },
  {
    qZh: "如果需要取消行程怎麼辦？",
    qEn: "What if I need to cancel my booking?",
    aZh: "取消政策依據不同行程和出發日期而有所不同。出發前 30 天以上取消通常可退還大部分費用。請在預訂前詳細閱讀取消條款，或聯絡我們了解詳情。",
    aEn: "Cancellation policies vary by tour and departure date. Cancellations made 30+ days before departure usually qualify for most refunds. Please review the cancellation terms before booking or contact us for details.",
  },
  {
    qZh: "行程包含旅遊保險嗎？",
    qEn: "Is travel insurance included?",
    aZh: "部分行程包含基本旅遊保險。我們建議您根據個人需求購買額外保險，以獲得更全面的保障，包括醫療、行李遺失和班機延誤等。",
    aEn: "Some tours include basic travel insurance. We recommend purchasing additional insurance based on your personal needs for more comprehensive coverage including medical, baggage loss, and flight delays.",
  },
];

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { language } = useLocale();
  const isEn = language === "en";

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="py-16 bg-gray-50 border-b border-gray-200">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.3em] text-gray-400 uppercase mb-3">
              {isEn ? "FAQ" : "常見問題"}
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-4">
              {isEn ? "Frequently Asked Questions" : "您最想知道的事"}
            </h2>
            <p className="text-gray-500 text-base">
              {isEn
                ? "Can't find your answer? Contact us directly."
                : "找不到答案？直接聯絡我們，我們很樂意幫助您"}
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-0 border-t border-gray-200">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-200">
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between py-5 text-left group"
                >
                  <span className={`text-base font-semibold pr-8 transition-colors ${openIndex === i ? "text-black" : "text-gray-700 group-hover:text-black"}`}>
                    {isEn ? faq.qEn : faq.qZh}
                  </span>
                  <span className="flex-shrink-0 w-7 h-7 border border-gray-300 group-hover:border-black flex items-center justify-center transition-colors">
                    {openIndex === i
                      ? <Minus className="h-4 w-4 text-black" />
                      : <Plus className="h-4 w-4 text-gray-500 group-hover:text-black" />
                    }
                  </span>
                </button>

                {openIndex === i && (
                  <div className="pb-5 pr-12">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {isEn ? faq.aEn : faq.aZh}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <p className="text-gray-500 text-sm mb-4">
              {isEn ? "Still have questions?" : "還有其他問題嗎？"}
            </p>
            <Link href="/contact-us">
              <button className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 text-sm font-bold hover:bg-gray-800 transition-colors">
                {isEn ? "Contact Us" : "聯絡我們"}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
