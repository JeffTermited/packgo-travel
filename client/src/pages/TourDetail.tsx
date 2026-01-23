import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Loader2, 
  ArrowLeft,
  CheckCircle2,
  Phone,
  Mail
} from "lucide-react";
import { useLocation, useRoute, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TourDetail() {
  const [, params] = useRoute("/tours/:id");
  const [, setLocation] = useLocation();
  const tourId = params?.id ? parseInt(params.id) : undefined;

  const { data: tour, isLoading, error } = trpc.tours.getById.useQuery(
    { id: tourId! },
    { enabled: !!tourId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center bg-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4">找不到此行程</h2>
            <Button onClick={() => setLocation("/")} className="bg-black hover:bg-gray-800 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首頁
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Image */}
        <div className="relative h-[70vh] overflow-hidden shadow-2xl">
          <img 
            src={tour.imageUrl || '/images/tour-placeholder.jpg'} 
            alt={tour.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container py-12">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              className="mb-6 border-2 border-white text-white hover:bg-white hover:text-black"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首頁
            </Button>
            <Badge className="bg-black text-white mb-4">
              {tour.category === 'group' && '團體旅遊'}
              {tour.category === 'custom' && '客製旅遊'}
              {tour.category === 'theme' && '主題旅遊'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{tour.title}</h1>
            <div className="flex flex-wrap gap-6 text-white">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{tour.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-lg">{tour.duration}天</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span className="text-lg">{tour.startDate ? new Date(tour.startDate).toLocaleDateString('zh-TW') : '待確認'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tour Description */}
              <Card className="border border-gray-200 rounded-2xl shadow-lg">
                <CardContent className="p-10">
                  <h2 className="text-2xl font-bold text-black mb-6">行程介紹</h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {tour.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tour Highlights */}
              <Card className="border border-gray-200 rounded-2xl shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-black mb-6">行程亮點</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "專業導遊全程陪同",
                      "五星級飯店住宿",
                      "特色餐飲體驗",
                      "深度文化探索",
                      "彈性自由時間",
                      "完整旅遊保險"
                    ].map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-black shrink-0 mt-0.5" />
                        <span className="text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tour Details */}
              <Card className="border border-gray-200 rounded-2xl shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-black mb-6">行程資訊</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-black mb-2">出發日期</h3>
                      <p className="text-gray-700">{tour.startDate ? new Date(tour.startDate).toLocaleDateString('zh-TW', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        weekday: 'long'
                      }) : '待確認'}</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-black mb-2">行程天數</h3>
                      <p className="text-gray-700">{tour.duration}天</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-black mb-2">目的地</h3>
                      <p className="text-gray-700">{tour.destination}</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-black mb-2">行程類型</h3>
                      <p className="text-gray-700">
                        {tour.category === 'group' && '團體旅遊'}
                        {tour.category === 'custom' && '客製旅遊'}
                        {tour.category === 'theme' && '主題旅遊'}
                      </p>
                    </div>
                    {tour.airline && (
                      <div>
                        <h3 className="font-bold text-black mb-2">航空公司</h3>
                        <p className="text-gray-700">{tour.airline}</p>
                      </div>
                    )}
                    {tour.hotelGrade && (
                      <div>
                        <h3 className="font-bold text-black mb-2">飯店等級</h3>
                        <p className="text-gray-700">{tour.hotelGrade}</p>
                      </div>
                    )}
                    {tour.specialActivities && (
                      <div className="md:col-span-2">
                        <h3 className="font-bold text-black mb-2">特殊活動</h3>
                        <div className="flex flex-wrap gap-2">
                          {JSON.parse(tour.specialActivities).map((activity: string, index: number) => (
                            <span key={index} className="px-3 py-1 border-2 border-black text-black text-sm">
                              {activity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <Card className="border border-gray-200 rounded-2xl shadow-xl sticky top-4">
                <CardContent className="p-8">
                  <div className="text-center mb-6 pb-6 border-b-2 border-black">
                    <p className="text-sm text-gray-600 mb-2">每人起</p>
                    <p className="text-4xl font-bold text-black">
                      NT$ {tour.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">起</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">出發日期</span>
                      <span className="font-medium text-black">
                        {tour.startDate ? new Date(tour.startDate).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }) : '待確認'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">行程天數</span>
                      <span className="font-medium text-black">{tour.duration}天</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">剩餘名額</span>
                      <span className="font-medium text-black">
                        {tour.maxParticipants ? (tour.maxParticipants - tour.currentParticipants) : '無限制'}
                      </span>
                    </div>
                  </div>

                  <Link href={`/book/${tour.id}`}>
                    <Button 
                      className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg font-bold mb-4"
                      disabled={tour.maxParticipants ? (tour.maxParticipants - tour.currentParticipants) <= 0 : false}
                    >
                      {(tour.maxParticipants && (tour.maxParticipants - tour.currentParticipants) <= 0) ? '已額滿' : '立即報名'}
                    </Button>
                  </Link>

                  <div className="space-y-3 pt-6 border-t-2 border-black">
                    <h3 className="font-bold text-black mb-4">需要協助？</h3>
                    <a 
                      href="tel:1-510-634-2307" 
                      className="flex items-center gap-3 text-gray-700 hover:text-black transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                      <span>+1 (510) 634-2307</span>
                    </a>
                    <a 
                      href="mailto:Jeffhsieh09@gmail.com" 
                      className="flex items-center gap-3 text-gray-700 hover:text-black transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      <span>Jeffhsieh09@gmail.com</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
