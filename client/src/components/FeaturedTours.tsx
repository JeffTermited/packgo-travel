import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Clock, MapPin, Star } from "lucide-react";

const tours = [
  {
    id: 1,
    title: "英國、愛爾蘭經典之旅",
    subtitle: "UK & Ireland Classic Tour",
    days: "14天12夜",
    price: "$4,190",
    image: "/images/tour-uk.jpg",
    tags: ["倫敦", "愛丁堡", "都柏林", "巨石陣"],
    rating: 4.9,
    reviews: 128,
    badge: "BEST SELLER"
  },
  {
    id: 2,
    title: "北歐及冰河峽灣之旅",
    subtitle: "Nordic Fjords & Glaciers",
    days: "12天10夜",
    price: "$3,750",
    image: "/images/tour-nordic.jpg",
    tags: ["挪威", "瑞典", "丹麥", "峽灣遊船"],
    rating: 4.8,
    reviews: 96,
    badge: "POPULAR"
  }
];

export default function FeaturedTours() {
  return (
    <section id="featured-tours" className="py-20 bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4 relative inline-block">
            熱門行程
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary"></span>
          </h2>
          <p className="text-gray-500 mt-4">Our most popular packages curated for you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tours.map((tour) => (
            <Card key={tour.id} className="group overflow-hidden border-0 shadow-lg rounded-none hover:shadow-2xl transition-all duration-300">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img 
                  src={tour.image} 
                  alt={tour.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {tour.badge && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black text-white hover:bg-black rounded-full px-4 py-1 text-xs font-bold tracking-wider shadow-lg">
                      {tour.badge}
                    </Badge>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{tour.days}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-bold">{tour.rating}</span>
                      <span className="text-xs text-gray-300">({tour.reviews})</span>
                    </div>
                  </div>
                </div>
              </div>

              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2 text-primary border-primary/20 rounded-sm">
                      精選團體
                    </Badge>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {tour.title}
                    </h3>
                    <p className="text-gray-500 text-sm font-medium">{tour.subtitle}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tour.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">
                  體驗最道地的文化與風景，包含全程五星級住宿、特色餐飲以及專業導遊解說。讓您的旅程充滿難忘回憶。
                </p>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-gray-100 pt-6 bg-gray-50/50">
                <div>
                  <span className="text-xs text-gray-500 block">每人起</span>
                  <span className="text-2xl font-bold text-primary">{tour.price}</span>
                  <span className="text-xs text-gray-400 ml-1">起</span>
                </div>
                <Button className="bg-black hover:bg-gray-800 text-white rounded-none px-8 shadow-md transition-transform active:scale-95">
                  查看詳情
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
