import GenericPage from "@/components/GenericPage";
import { useLocale } from "@/contexts/LocaleContext";

export default function AirportTransfer() {
  const { t } = useLocale();
  
  return (
    <GenericPage
      title={t('airportTransfer.title')}
      subtitle={t('airportTransfer.subtitle')}
      ctaText={t('common.bookNow')}
      ctaLink="/inquiry"
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          {t('airportTransfer.description')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">{t('airportTransfer.form.serviceType')}</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t('airportTransfer.form.pickup')}</li>
          <li>{t('airportTransfer.form.dropoff')}</li>
          <li>{t('airportTransfer.form.roundTrip')}</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-black mt-8">{t('airportTransfer.form.vehicleType')}</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t('airportTransfer.form.sedan')}</li>
          <li>{t('airportTransfer.form.suv')}</li>
          <li>{t('airportTransfer.form.van')}</li>
          <li>{t('airportTransfer.form.limousine')}</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-black mt-8">{t('airportTransfer.form.additionalServices')}</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t('airportTransfer.form.childSeat')}</li>
          <li>{t('airportTransfer.form.meetAndGreet')}</li>
          <li>{t('airportTransfer.form.waitingTime')}</li>
        </ul>
      </div>
    </GenericPage>
  );
}
