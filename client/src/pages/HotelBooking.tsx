import GenericPage from "@/components/GenericPage";
import { useLocale } from "@/contexts/LocaleContext";

export default function HotelBooking() {
  const { t } = useLocale();
  
  return (
    <GenericPage
      title={t('hotelBooking.title')}
      subtitle={t('hotelBooking.subtitle')}
      ctaText={t('common.search')}
      ctaLink="/inquiry"
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          {t('hotelBooking.description')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">{t('hotelBooking.filters.starRating')}</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>⭐⭐⭐ - 3 {t('hotelBooking.filters.starRating')}</li>
          <li>⭐⭐⭐⭐ - 4 {t('hotelBooking.filters.starRating')}</li>
          <li>⭐⭐⭐⭐⭐ - 5 {t('hotelBooking.filters.starRating')}</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-black mt-8">{t('hotelBooking.filters.amenities')}</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t('hotelBooking.filters.wifi')}</li>
          <li>{t('hotelBooking.filters.parking')}</li>
          <li>{t('hotelBooking.filters.pool')}</li>
          <li>{t('hotelBooking.filters.gym')}</li>
          <li>{t('hotelBooking.filters.restaurant')}</li>
          <li>{t('hotelBooking.filters.spa')}</li>
          <li>{t('hotelBooking.filters.petFriendly')}</li>
        </ul>
      </div>
    </GenericPage>
  );
}
