import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Loader2, 
  ArrowLeft,
  CheckCircle2,
  Phone,
  Mail,
  Plane,
  Building2,
  Star,
  Users,
  Tag,
  Info,
  Shield,
  FileText,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useLocation, useRoute, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FavoriteButton } from "@/components/FavoriteButton";
import "../defensive.css";
import "../print.css";

export default function TourDetail() {
  const { user } = useAuth();
  const { t } = useLocale();
  const isAdmin = user?.role === "admin";
  const [, params] = useRoute("/tours/:id");
  const [, setLocation] = useLocation();
  const tourId = params?.id ? parseInt(params.id) : undefined;

  const { data: tour, isLoading, error } = trpc.tours.getById.useQuery(
    { id: tourId! },
    { enabled: !!tourId }
  );

  // Parse JSON fields safely
  const parseJSON = (str: string | null | undefined, defaultValue: any[] = []) => {
    if (!str) return defaultValue;
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('tourDetail.tourNotFound')}</h2>
            <Button onClick={() => setLocation("/")} className="bg-primary hover:bg-red-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('tourDetail.backToHome')}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const tags = parseJSON(tour.tags);
  const highlights = parseJSON(tour.highlights);
  const includes = parseJSON(tour.includes);
  const excludes = parseJSON(tour.excludes);
  const dailyItinerary = parseJSON(tour.dailyItinerary);
  const attractions = parseJSON(tour.attractions);
  const optionalTours = parseJSON(tour.optionalTours);
  const hotelFacilities = parseJSON(tour.hotelFacilities);
  const hotelSpecialOffers = parseJSON(tour.hotelSpecialOffers);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <img 
            src={tour.imageUrl || '/images/tour-placeholder.jpg'} 
            alt={tour.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-4 left-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              className="bg-white/90 hover:bg-white border-0 text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('tourDetail.back')}
            </Button>
          </div>
          
          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 container py-8">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tour.promotionText && (
                <Badge className="bg-primary text-white px-3 py-1">
                  {tour.promotionText}
                </Badge>
              )}
              {tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-white/90 text-gray-900 px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {tour.title}
            </h1>
            
            {/* Quick Info */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{tour.destinationCountry} {tour.destinationCity}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{tour.duration}{t('common.days')}{tour.nights ? `${tour.nights}${t('common.nights')}` : ''}</span>
              </div>
              {tour.productCode && (
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  <span>{t('tourDetail.productCode')}：{tour.productCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-8">
          {/* Admin Info Card */}
          {isAdmin && (tour.sourceUrl || tour.originalityScore) && (
            <Card className="border-0 shadow-lg mb-6 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-blue-900">{t('tourDetail.adminInfo')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tour.sourceUrl && (
                    <div>
                      <div className="text-sm font-medium text-blue-700 mb-2">{t('tourDetail.sourceUrl')}</div>
                      <a
                        href={tour.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="truncate">{tour.sourceUrl}</span>
                      </a>
                    </div>
                  )}
                  {tour.originalityScore && (
                    <div>
                      <div className="text-sm font-medium text-blue-700 mb-2">{t('tourDetail.originalityScore')}</div>
                      <span
                        className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${
                          Number(tour.originalityScore) >= 90
                            ? "bg-green-100 text-green-800"
                            : Number(tour.originalityScore) >= 70
                              ? "bg-yellow-100 text-yellow-800"
                              : Number(tour.originalityScore) >= 60
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {Number(tour.originalityScore).toFixed(1)} / 100
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Flight Information Card */}
              {(tour.outboundAirline || tour.inboundAirline) && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                      <Plane className="h-5 w-5" />
                      {t('tourDetail.flights')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Outbound Flight */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-500 mb-2">{t('tourDetail.outbound')}</div>
                        <div className="font-medium text-gray-900 mb-2">
                          {tour.outboundAirline || tour.airline}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">
                              {tour.outboundDepartureTime || '--:--'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {tour.departureAirportCode || 'TPE'}
                            </div>
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 border-t border-dashed border-gray-300"></div>
                            <Plane className="h-4 w-4 text-gray-400 rotate-90" />
                            <div className="flex-1 border-t border-dashed border-gray-300"></div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">
                              {tour.outboundArrivalTime || '--:--'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {tour.destinationAirportCode || 'OKA'}
                            </div>
                          </div>
                        </div>
                        {tour.outboundFlightDuration && (
                          <div className="text-center text-xs text-gray-500 mt-2">
                            {t('tourDetail.flightDuration')}：{tour.outboundFlightDuration}
                          </div>
                        )}
                      </div>
                      
                      {/* Inbound Flight */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-500 mb-2">{t('tourDetail.inbound')}</div>
                        <div className="font-medium text-gray-900 mb-2">
                          {tour.inboundAirline || tour.airline}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">
                              {tour.inboundDepartureTime || '--:--'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {tour.destinationAirportCode || 'OKA'}
                            </div>
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 border-t border-dashed border-gray-300"></div>
                            <Plane className="h-4 w-4 text-gray-400 -rotate-90" />
                            <div className="flex-1 border-t border-dashed border-gray-300"></div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">
                              {tour.inboundArrivalTime || '--:--'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {tour.departureAirportCode || 'TPE'}
                            </div>
                          </div>
                        </div>
                        {tour.inboundFlightDuration && (
                          <div className="text-center text-xs text-gray-500 mt-2">
                            {t('tourDetail.flightDuration')}：{tour.inboundFlightDuration}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tabs Navigation */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start bg-white border-b rounded-none h-auto p-0 overflow-x-auto">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-3"
                  >
                    {t('tourDetail.tabs.overview')}
                  </TabsTrigger>
                  {dailyItinerary.length > 0 && (
                    <TabsTrigger 
                      value="itinerary"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-3"
                    >
                      {t('tourDetail.tabs.itinerary')}
                    </TabsTrigger>
                  )}
                  {tour.hotelName && (
                    <TabsTrigger 
                      value="hotel"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-3"
                    >
                      {t('tourDetail.tabs.hotel')}
                    </TabsTrigger>
                  )}
                  {(includes.length > 0 || excludes.length > 0) && (
                    <TabsTrigger 
                      value="pricing"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-3"
                    >
                      {t('tourDetail.tabs.pricing')}
                    </TabsTrigger>
                  )}
                  {tour.specialReminders && (
                    <TabsTrigger 
                      value="notes"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-3"
                    >
                      {t('tourDetail.tabs.notes')}
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-6 space-y-6">
                  {/* Description */}
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{t('tourDetail.description')}</h3>
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {tour.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Destination Description */}
                  {tour.destinationDescription && (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('tourDetail.destinationIntro')}</h3>
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {tour.destinationDescription}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Highlights */}
                  {highlights.length > 0 && (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('tourDetail.highlights')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {highlights.map((highlight: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-gray-700">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Attractions */}
                  {attractions.length > 0 && (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('tourDetail.attractions')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {attractions.map((attraction: any, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {typeof attraction === 'string' ? attraction : attraction.name}
                                </div>
                                {typeof attraction === 'object' && attraction.description && (
                                  <div className="text-sm text-gray-500 mt-1">{attraction.description}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Daily Itinerary Tab */}
                <TabsContent value="itinerary" className="mt-6">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-6">{t('tourDetail.itinerary')}</h3>
                      <div className="space-y-8">
                        {dailyItinerary.map((day: any, index: number) => (
                          <div key={index} className="relative">
                            {/* Day Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex items-center justify-center w-12 h-12 bg-primary text-white rounded-full font-bold text-lg">
                                Day {index + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-gray-900">
                                  {typeof day === 'string' ? day : day.title}
                                </h4>
                              </div>
                            </div>

                            {/* Activities Timeline */}
                            {typeof day === 'object' && day.activities && day.activities.length > 0 && (
                              <div className="ml-6 border-l-2 border-primary/20 pl-6 space-y-4">
                                {day.activities.map((activity: any, actIndex: number) => (
                                  <div key={actIndex} className="relative pb-4 last:pb-0">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[29px] top-2 w-3 h-3 bg-primary rounded-full border-2 border-white" />
                                    
                                    {/* Activity Content */}
                                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                      {/* Time & Title */}
                                      <div className="flex items-start gap-2 mb-2">
                                        <Clock className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                                        <div className="flex-1">
                                          {activity.time && (
                                            <p className="text-xs font-medium text-gray-600 mb-1">{activity.time}</p>
                                          )}
                                          <h5 className="text-base font-bold text-gray-900">{activity.title}</h5>
                                        </div>
                                      </div>
                                      
                                      {/* Description */}
                                      {activity.description && (
                                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{activity.description}</p>
                                      )}
                                      
                                      {/* Location & Transportation */}
                                      <div className="flex flex-wrap gap-4 text-sm">
                                        {activity.location && (
                                          <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <span>{activity.location}</span>
                                          </div>
                                        )}
                                        {activity.transportation && (
                                          <div className="flex items-center gap-2 text-gray-600">
                                            <Plane className="h-4 w-4 text-primary" />
                                            <span>{activity.transportation}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Fallback: Show description if no activities */}
                            {typeof day === 'object' && (!day.activities || day.activities.length === 0) && day.description && (
                              <div className="ml-6 pl-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-gray-700 text-sm whitespace-pre-line">{day.description}</p>
                                </div>
                              </div>
                            )}

                            {/* Meals & Accommodation */}
                            <div className="mt-4 ml-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Meals */}
                              {typeof day === 'object' && day.meals && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <h5 className="font-bold text-gray-900 mb-3">{t('tourDetail.mealArrangement')}</h5>
                                  <div className="space-y-2 text-sm text-gray-700">
                                    {typeof day.meals === 'object' ? (
                                      <>
                                        {day.meals.breakfast && (
                                          <p><span className="font-medium">{t('tourDetail.breakfast')}：</span>{day.meals.breakfast}</p>
                                        )}
                                        {day.meals.lunch && (
                                          <p><span className="font-medium">{t('tourDetail.lunch')}：</span>{day.meals.lunch}</p>
                                        )}
                                        {day.meals.dinner && (
                                          <p><span className="font-medium">{t('tourDetail.dinner')}：</span>{day.meals.dinner}</p>
                                        )}
                                      </>
                                    ) : (
                                      <p>{day.meals}</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Accommodation */}
                              {typeof day === 'object' && day.accommodation && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <h5 className="font-bold text-gray-900 mb-3">{t('tourDetail.accommodationArrangement')}</h5>
                                  <p className="text-sm text-gray-700">{day.accommodation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Hotel Tab */}
                <TabsContent value="hotel" className="mt-6">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-6">
                        <Building2 className="h-8 w-8 text-primary shrink-0" />
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{tour.hotelName}</h3>
                          {tour.hotelGrade && (
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                              ))}
                              <span className="text-sm text-gray-500 ml-2">{tour.hotelGrade}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {tour.hotelLocation && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-500">{t('tourDetail.location')}</div>
                              <div className="font-medium text-gray-900">{tour.hotelLocation}</div>
                            </div>
                          </div>
                        )}
                        {tour.hotelNights && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-500">{t('tourDetail.nightsStay')}</div>
                              <div className="font-medium text-gray-900">{tour.hotelNights} {t('tourDetail.nights')}</div>
                            </div>
                          </div>
                        )}
                        {(tour.hotelCheckIn || tour.hotelCheckOut) && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-500">{t('tourDetail.checkInOut')}</div>
                              <div className="font-medium text-gray-900">
                                {tour.hotelCheckIn || '15:00'} / {tour.hotelCheckOut || '11:00'}
                              </div>
                            </div>
                          </div>
                        )}
                        {tour.hotelRoomType && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Building2 className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-500">{t('tourDetail.roomType')}</div>
                              <div className="font-medium text-gray-900">
                                {tour.hotelRoomType} {tour.hotelRoomSize && `(${tour.hotelRoomSize})`}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {tour.hotelDescription && (
                        <div className="mb-6">
                          <h4 className="font-bold text-gray-900 mb-2">{t('tourDetail.hotelIntro')}</h4>
                          <p className="text-gray-700 whitespace-pre-line">{tour.hotelDescription}</p>
                        </div>
                      )}

                      {hotelFacilities.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-bold text-gray-900 mb-3">{t('tourDetail.facilities')}</h4>
                          <div className="flex flex-wrap gap-2">
                            {hotelFacilities.map((facility: string, index: number) => (
                              <Badge key={index} variant="outline" className="px-3 py-1">
                                {facility}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {hotelSpecialOffers.length > 0 && (
                        <div className="bg-primary/5 rounded-lg p-4">
                          <h4 className="font-bold text-primary mb-2">{t('tourDetail.specialOffers')}</h4>
                          <ul className="space-y-1">
                            {hotelSpecialOffers.map((offer: string, index: number) => (
                              <li key={index} className="flex items-center gap-2 text-gray-700">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                {offer}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pricing Tab */}
                <TabsContent value="pricing" className="mt-6 space-y-6">
                  {includes.length > 0 && (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-green-600 mb-4 flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5" />
                          {t('tourDetail.includedItems')}
                        </h3>
                        <ul className="space-y-2">
                          {includes.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-3 text-gray-700">
                              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {excludes.length > 0 && (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                          <Info className="h-5 w-5" />
                          {t('tourDetail.excludedItems')}
                        </h3>
                        <ul className="space-y-2">
                          {excludes.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-3 text-gray-700">
                              <span className="text-red-500 shrink-0">✕</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {optionalTours.length > 0 && (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('tourDetail.optionalTours')}</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-4 font-medium text-gray-500">{t('tourDetail.optionalItem')}</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-500">{t('tourDetail.optionalContent')}</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-500">{t('tourDetail.optionalPrice')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {optionalTours.map((optTour: any, index: number) => (
                                <tr key={index} className="border-b last:border-b-0">
                                  <td className="py-3 px-4 font-medium text-gray-900">
                                    {typeof optTour === 'string' ? optTour : optTour.name}
                                  </td>
                                  <td className="py-3 px-4 text-gray-700">
                                    {typeof optTour === 'object' ? optTour.description : '-'}
                                  </td>
                                  <td className="py-3 px-4 text-right font-medium text-primary">
                                    {typeof optTour === 'object' && optTour.price ? `NT$ ${optTour.price.toLocaleString()}` : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="mt-6 space-y-6">
                  {tour.specialReminders && (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Info className="h-5 w-5 text-amber-500" />
                          {t('tourDetail.specialReminders')}
                        </h3>
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 whitespace-pre-line">{tour.specialReminders}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {tour.notes && (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          {t('tourDetail.tourNotes')}
                        </h3>
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 whitespace-pre-line">{tour.notes}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {tour.safetyGuidelines && (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Shield className="h-5 w-5 text-green-500" />
                          {t('tourDetail.safetyGuidelines')}
                        </h3>
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 whitespace-pre-line">{tour.safetyGuidelines}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {tour.flightRules && (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Plane className="h-5 w-5 text-primary" />
                          {t('tourDetail.flightRules')}
                        </h3>
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 whitespace-pre-line">{tour.flightRules}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                {/* Price Card */}
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    {/* Price */}
                    <div className="text-center mb-6 pb-6 border-b border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">{t('tourDetail.perPerson')}</p>
                      <p className="text-4xl font-bold text-primary">
                        NT$ {tour.price.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">{tour.priceUnit || t('tourDetail.startingFrom')}</p>
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-500 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {t('tourDetail.departureDate')}
                        </span>
                        <span className="font-medium text-gray-900">
                          {tour.startDate ? new Date(tour.startDate).toLocaleDateString('zh-TW', { 
                            month: 'numeric', 
                            day: 'numeric',
                            weekday: 'short'
                          }) : t('tourDetail.toBeConfirmed')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-500 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {t('tourDetail.duration')}
                        </span>
                        <span className="font-medium text-gray-900">
                          {tour.duration}{t('common.days')}{tour.nights ? `${tour.nights}${t('common.nights')}` : ''}
                        </span>
                      </div>
                      {tour.availableSeats !== null && tour.availableSeats !== undefined && (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-gray-500 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {t('tourDetail.availableSeats')}
                          </span>
                          <span className={`font-medium ${tour.availableSeats <= 5 ? 'text-red-500' : 'text-gray-900'}`}>
                            {tour.availableSeats} {t('tourDetail.seats')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-4">
                      <Link href={`/book/${tour.id}`} className="flex-1">
                        <Button 
                          className="w-full bg-primary hover:bg-red-700 text-white py-6 text-lg font-bold"
                          disabled={tour.availableSeats !== null && tour.availableSeats !== undefined && tour.availableSeats <= 0}
                        >
                          {(tour.availableSeats !== null && tour.availableSeats !== undefined && tour.availableSeats <= 0) 
                            ? t('tourDetail.soldOut') 
                            : t('tourDetail.bookNow')}
                          <ChevronRight className="h-5 w-5 ml-2" />
                        </Button>
                      </Link>
                    </div>
                    
                    {/* Favorite Button */}
                    <FavoriteButton 
                      tourId={tour.id} 
                      variant="button" 
                      showText 
                      size="md" 
                      className="w-full justify-center"
                    />
                  </CardContent>
                </Card>

                {/* Contact Card */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">{t('tourDetail.needHelp')}</h3>
                    <div className="space-y-3">
                      <a 
                        href="tel:1-510-634-2307" 
                        className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors"
                      >
                        <Phone className="h-5 w-5" />
                        <span>+1 (510) 634-2307</span>
                      </a>
                      <a 
                        href="mailto:Jeffhsieh09@gmail.com" 
                        className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors"
                      >
                        <Mail className="h-5 w-5" />
                        <span>Jeffhsieh09@gmail.com</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Source Link - Admin Only */}
                {isAdmin && tour.sourceUrl && (
                  <Card className="border-0 shadow-lg bg-gray-50">
                    <CardContent className="p-4">
                      <a 
                        href={tour.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>{t('tourDetail.viewOriginal')}</span>
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
