import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { LionHeroSection } from "@/components/tour-detail/LionHeroSection";
import { LionAttractionsSection } from "@/components/tour-detail/LionAttractionsSection";
import LionHotelSection from "@/components/tour-detail/LionHotelSection";
import LionMealSection from "@/components/tour-detail/LionMealSection";

export default function TourDetailLion() {
  const params = useParams();
  const tourId = params.id ? parseInt(params.id) : null;

  const { data: tour, isLoading, error } = trpc.tours.getById.useQuery(
    { id: tourId! },
    { enabled: !!tourId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lion-primary" />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            找不到行程
          </h1>
          <p className="text-gray-600">
            {error?.message || "此行程不存在或已下架"}
          </p>
        </div>
      </div>
    );
  }

  // 解析 tour.content (JSON 格式)
  let content: any = {};
  try {
    content = typeof tour.content === 'string' 
      ? JSON.parse(tour.content) 
      : tour.content || {};
  } catch (e) {
    console.error("Failed to parse tour content:", e);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <LionHeroSection
        title={tour.title}
        productCode={tour.productCode || `TOUR-${tour.id}`}
        mainImage={tour.heroImage || tour.imageUrl || "/placeholder-tour.jpg"}
        destination={tour.destinationCity || tour.destinationCountry || ""}
        duration={`${tour.duration}天${tour.nights ? tour.nights + '夜' : ''}`}
        airline={content.airline || "中華航空"}
        basePrice={tour.price || 0}
        departures={tour.departures || []}
      />

      {/* Attractions Section */}
      {content.attractions && content.attractions.length > 0 && (
        <LionAttractionsSection
          title="行程特色"
          description={content.attractionsDescription || "探索當地最具代表性的景點和體驗"}
          attractions={content.attractions}
        />
      )}

      {/* Hotel Section */}
      {content.hotel && (
        <LionHotelSection
          title={content.hotel.title || "住宿介紹"}
          subtitle={content.hotel.subtitle}
          badge={content.hotel.badge}
          name={content.hotel.name}
          rating={content.hotel.rating}
          description={content.hotel.description}
          roomTypes={content.hotel.roomTypes}
          facilities={content.hotel.facilities}
          policies={content.hotel.policies}
          images={content.hotel.images}
          location={content.hotel.location}
        />
      )}

      {/* Meal Section */}
      {content.meal && (
        <LionMealSection
          title={content.meal.title || "餐食介紹"}
          description={content.meal.description}
          mealPlan={content.meal.mealPlan}
          highlights={content.meal.highlights}
          details={content.meal.details}
          notes={content.meal.notes}
        />
      )}

      {/* Itinerary Section - TODO: 創建 LionItinerarySection */}
      {content.itinerary && content.itinerary.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">每日行程</h2>
            <div className="space-y-6">
              {content.itinerary.map((day: any, index: number) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-lion-primary mb-4">
                    第 {day.day} 天: {day.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {day.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section - TODO: 創建 LionPricingSection */}
      {content.pricing && (
        <section className="py-12 bg-gray-50">
          <div className="container">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">費用說明</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 費用包含 */}
              {content.pricing.inclusions && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-green-600 mb-4">
                    ✓ 費用包含
                  </h3>
                  <ul className="space-y-2">
                    {content.pricing.inclusions.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 費用不包含 */}
              {content.pricing.exclusions && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-red-600 mb-4">
                    ✗ 費用不包含
                  </h3>
                  <ul className="space-y-2">
                    {content.pricing.exclusions.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Notes Section - TODO: 創建 LionNotesSection */}
      {content.notes && content.notes.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">注意事項</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
              <ul className="space-y-3">
                {content.notes.map((note: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-1">•</span>
                    <span className="text-gray-700">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
