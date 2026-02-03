import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Clock, MapPin, Star, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useLocale } from "@/contexts/LocaleContext";

export default function FeaturedTours() {
  const { data: tours, isLoading, error } = trpc.tours.list.useQuery();
  const { t, formatPrice } = useLocale();

  // Filter to show only featured and active tours, limit to 4
  const featuredTours = tours?.filter(tour => tour.featured === 1 && tour.status === 'active').slice(0, 4) || [];

  return (
    <section id="featured-tours" className="py-20 bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-black mb-4 relative inline-block">
            {t('featuredTours.title')}
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-black"></span>
          </h2>
          <p className="text-gray-600 mt-4">{t('featuredTours.subtitle')}</p>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-black" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-gray-600">{t('common.error')}</p>
          </div>
        )}

        {!isLoading && !error && featuredTours.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600">{t('common.noResults')}</p>
          </div>
        )}

        {!isLoading && !error && featuredTours.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredTours.map((tour) => (
                <Card key={tour.id} className="group overflow-hidden border-2 border-black rounded-3xl rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={tour.imageUrl || '/images/tour-placeholder.jpg'} 
                      alt={tour.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-black text-white hover:bg-black px-4 py-1 text-xs font-bold tracking-wider shadow-lg rounded-full">
                        {t('featuredTours.title')}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <FavoriteButton tourId={tour.id} size="md" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-white" />
                          <span className="text-sm font-medium">{tour.duration}{t('common.days')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-white" />
                          <span className="text-sm font-medium">{tour.destination}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-2 text-black border-black rounded-full">
                          {tour.category === 'group' && t('nav.groupTours')}
                          {tour.category === 'custom' && t('nav.customTours')}
                          {tour.category === 'theme' && t('common.features')}
                        </Badge>
                        <h3 className="text-2xl font-bold text-black group-hover:text-gray-700 transition-colors">
                          {tour.title}
                        </h3>
                        <p className="text-gray-600 text-sm font-medium">{tour.destination}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {tour.description}
                    </p>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between border-t-2 border-black pt-6 bg-gray-50">
                    <div>
                      <span className="text-xs text-gray-500 block">{t('common.perPerson')}</span>
                      <span className="text-2xl font-bold text-black">{formatPrice(tour.price, (tour.priceCurrency as 'TWD' | 'USD') || 'TWD')}</span>
                      <span className="text-xs text-gray-400 ml-1">{t('common.startingFrom')}</span>
                    </div>
                    <Link href={`/tours/${tour.id}`}>
                      <Button className="bg-black hover:bg-gray-800 text-white px-8 shadow-md transition-transform active:scale-95 rounded-full">
                        {t('common.viewMore')}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* View More Button */}
            <div className="text-center mt-12">
              <Link href="/tours">
                <Button 
                  variant="outline" 
                  className="border-2 border-black rounded-3xl text-black hover:bg-black hover:text-white px-12 py-6 text-lg font-bold transition-all rounded-full"
                >
                  {t('featuredTours.viewAll')}
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
