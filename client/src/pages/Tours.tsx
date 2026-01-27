import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Calendar, Users, Loader2, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Tours() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("active");

  // 查詢所有行程
  const { data: tours, isLoading } = trpc.tours.list.useQuery({
    status: selectedStatus as "active" | "inactive" | "all",
  });

  // 篩選後的行程列表
  const filteredTours = (tours || []).filter((tour: any) => {
    // 國家篩選
    if (selectedCountry !== "all" && tour.destinationCountry !== selectedCountry) {
      return false;
    }
    
    // 搜尋篩選
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titleMatch = tour.title?.toLowerCase().includes(query);
      const countryMatch = tour.destinationCountry?.toLowerCase().includes(query);
      const cityMatch = tour.destinationCity?.toLowerCase().includes(query);
      if (!titleMatch && !countryMatch && !cityMatch) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
          <div className="container">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:text-gray-200 mb-4 rounded-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首頁
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-4">探索精選行程</h1>
            <p className="text-xl text-gray-300">
              發現世界各地的精彩旅程，開啟您的夢想之旅
            </p>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-white border-b">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-4">
              {/* 搜尋框 */}
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="搜尋行程名稱或目的地..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>

              {/* 國家篩選 */}
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full md:w-[200px] rounded-full">
                  <SelectValue placeholder="選擇國家" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有國家</SelectItem>
                  <SelectItem value="日本">日本</SelectItem>
                  <SelectItem value="韓國">韓國</SelectItem>
                  <SelectItem value="泰國">泰國</SelectItem>
                  <SelectItem value="新加坡">新加坡</SelectItem>
                  <SelectItem value="馬來西亞">馬來西亞</SelectItem>
                  <SelectItem value="越南">越南</SelectItem>
                  <SelectItem value="歐洲">歐洲</SelectItem>
                  <SelectItem value="美國">美國</SelectItem>
                </SelectContent>
              </Select>

              {/* 狀態篩選 */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-[200px] rounded-full">
                  <SelectValue placeholder="選擇狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有行程</SelectItem>
                  <SelectItem value="active">上架中</SelectItem>
                  <SelectItem value="inactive">已下架</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Tours Grid */}
        <section className="py-12">
          <div className="container">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredTours.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">沒有找到符合條件的行程</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    找到 <span className="font-bold text-gray-900">{filteredTours.length}</span> 個行程
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTours.map((tour: any) => (
                    <Link key={tour.id} href={`/tours/${tour.id}`}>
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group rounded-3xl border-0">
                        {/* 行程圖片 */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                          {tour.imageUrl || tour.heroImage ? (
                            <img
                              src={tour.imageUrl || tour.heroImage}
                              alt={tour.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <MapPin className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                          
                          {/* 狀態標籤 */}
                          {tour.status === "inactive" && (
                            <Badge className="absolute top-4 right-4 bg-red-500 text-white rounded-full">
                              已下架
                            </Badge>
                          )}
                        </div>

                        {/* 行程資訊 */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {tour.title}
                          </h3>

                          {/* 目的地 */}
                          <div className="flex items-center text-gray-600 mb-3">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {tour.destinationCountry} {tour.destinationCity}
                            </span>
                          </div>

                          {/* 天數 */}
                          <div className="flex items-center text-gray-600 mb-4">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {tour.duration} 天 {tour.nights} 夜
                            </span>
                          </div>

                          {/* 價格 */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <span className="text-2xl font-bold text-primary">
                                NT$ {tour.price?.toLocaleString() || "0"}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">起</span>
                            </div>
                            <Button className="rounded-full bg-black text-white hover:bg-gray-800">
                              查看詳情
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
