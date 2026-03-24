import GenericPage from "@/components/GenericPage";
import SEO from "@/components/SEO";
import { useLocale } from "@/contexts/LocaleContext";

export default function FlightBooking() {
  const { t } = useLocale();
  
  return (
    <GenericPage
      title={t('flightBooking.title')}
      subtitle={t('flightBooking.subtitle')}
      ctaText={t('common.contactUs')}
      ctaLink="/inquiry"
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          {t('flightBooking.description')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">{t('flightBooking.search.tripType')}</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t('flightBooking.search.oneWay')}</li>
          <li>{t('flightBooking.search.roundTrip')}</li>
          <li>{t('flightBooking.search.multiCity')}</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-black mt-8">{t('flightBooking.search.class')}</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>{t('flightBooking.search.economy')}：</strong>{t('flightBooking.description')}</li>
          <li><strong>{t('flightBooking.search.premiumEconomy')}：</strong>{t('flightBooking.description')}</li>
          <li><strong>{t('flightBooking.search.business')}：</strong>{t('flightBooking.description')}</li>
          <li><strong>{t('flightBooking.search.first')}：</strong>{t('flightBooking.description')}</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-black mt-8">{t('flightBooking.filters.stops')}</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t('flightBooking.filters.direct')}</li>
          <li>{t('flightBooking.filters.oneStop')}</li>
          <li>{t('flightBooking.filters.twoStops')}</li>
        </ul>
      </div>
    </GenericPage>
  );
}
