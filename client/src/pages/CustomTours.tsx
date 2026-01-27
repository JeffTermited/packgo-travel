import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, MapPin, Calendar, Users, DollarSign, MessageCircle, Star } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function CustomTours() {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    destination: "",
    duration: "",
    travelers: "",
    budget: "",
    departureDate: "",
    requirements: "",
  });

  const createInquiry = trpc.inquiries.create.useMutation({
    onSuccess: () => {
      toast.success("諮詢已送出！我們會盡快與您聯繫");
      setFormData({
        customerName: "",
        email: "",
        phone: "",
        destination: "",
        duration: "",
        travelers: "",
        budget: "",
        departureDate: "",
        requirements: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "送出失敗，請稍後再試");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInquiry.mutate({
      customerName: formData.customerName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      subject: `客製旅遊諮詢 - ${formData.destination}`,
      message: `目的地：${formData.destination}\n天數：${formData.duration}\n人數：${formData.travelers}\n預算：${formData.budget}\n出發日期：${formData.departureDate}\n詳細需求：${formData.requirements}`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/custom-tours-hero.jpg"
            alt="客製旅遊"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/images/hero-sakura.jpg";
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="container relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold font-serif mb-4">客製旅遊</h1>
          <p className="text-xl">為您量身打造獨一無二的旅程</p>
        </div>
      </section>

      <main className="flex-grow">
        {/* Service Introduction */}
        <section className="py-20 bg-white">
          <div className="container max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-serif mb-6">為什麼選擇客製旅遊？</h2>
              <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
                每個旅人都有獨特的夢想與期待，我們的專業團隊將根據您的需求、預算與時間，為您規劃專屬的旅遊行程。從目的地選擇、行程安排到住宿交通，每個細節都為您量身打造。
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-20">
              {[
                {
                  icon: <MapPin className="h-8 w-8" />,
                  title: "自由選擇目的地",
                  description: "不受限於既定行程，想去哪就去哪，深度探索您心儀的國家與城市"
                },
                {
                  icon: <Calendar className="h-8 w-8" />,
                  title: "彈性安排時間",
                  description: "根據您的假期時間靈活規劃，無論是週末小旅行或長假深度遊"
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: "專屬旅遊顧問",
                  description: "一對一專業服務，從諮詢到出發全程陪伴，解答所有疑問"
                },
                {
                  icon: <Star className="h-8 w-8" />,
                  title: "獨特深度體驗",
                  description: "深入在地文化，體驗一般旅行團無法觸及的獨特風景與人文"
                },
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-6 p-8 bg-gray-50 rounded-3xl hover:shadow-lg transition-all">
                  <div className="flex-shrink-0 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 bg-gray-50">
          <div className="container max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-serif mb-6">客製旅遊流程</h2>
              <p className="text-gray-600 text-lg">簡單四步驟，開啟您的夢想旅程</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "提交需求", description: "填寫諮詢表單，告訴我們您的旅遊想法" },
                { step: "2", title: "專人聯繫", description: "24小時內專業顧問與您聯繫，深入了解需求" },
                { step: "3", title: "行程規劃", description: "為您量身打造行程方案，並提供詳細報價" },
                { step: "4", title: "確認出發", description: "確認行程後完成付款，準備出發探索世界" },
              ].map((process, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                    {process.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{process.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{process.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-white">
          <div className="container max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-serif mb-6">服務費用說明</h2>
              <p className="text-gray-600 text-lg">透明化報價，讓您安心規劃旅程</p>
            </div>

            <div className="bg-gray-50 rounded-3xl p-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-bold mb-6">費用包含</h3>
                  <ul className="space-y-4">
                    {[
                      "專業旅遊顧問一對一服務",
                      "客製化行程規劃與設計",
                      "機票、住宿、交通預訂",
                      "景點門票與活動安排",
                      "旅遊保險諮詢與辦理",
                      "24小時緊急聯絡服務",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-black flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-6">計價方式</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-lg mb-2">服務費</h4>
                      <p className="text-gray-600">根據行程複雜度與天數計算，一般為總費用的 8-12%</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2">實際費用</h4>
                      <p className="text-gray-600">機票、住宿、交通、門票等實際支出費用</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl">
                      <p className="text-sm text-gray-500 mb-2">參考價格範圍</p>
                      <p className="text-3xl font-bold">NT$ 50,000 - 200,000</p>
                      <p className="text-sm text-gray-500 mt-2">依據目的地、天數、人數而定</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Inquiry Form Section */}
        <section className="py-20 bg-gray-50">
          <div className="container max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold font-serif mb-6">開始規劃您的旅程</h2>
              <p className="text-gray-600 text-lg">填寫以下表單，我們將在 24 小時內與您聯繫</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-12 shadow-lg">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">姓名 *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="請輸入您的姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">電子郵件 *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">聯絡電話 *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="0912-345-678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">目的地 *</label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="例如：日本、歐洲"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">旅遊天數 *</label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="例如：7天"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">旅遊人數 *</label>
                  <input
                    type="text"
                    required
                    value={formData.travelers}
                    onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="例如：2人"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">預算範圍</label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    placeholder="例如：10萬"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">預計出發日期</label>
                <input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">詳細需求</label>
                <textarea
                  rows={6}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-none"
                  placeholder="請告訴我們您的旅遊偏好、特殊需求或任何想法..."
                />
              </div>

              <Button
                type="submit"
                disabled={createInquiry.isPending}
                className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-full text-lg font-bold transition-all"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {createInquiry.isPending ? "送出中..." : "提交諮詢"}
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
