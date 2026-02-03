import GenericPage from "@/components/GenericPage";
import { useLocale } from "@/contexts/LocaleContext";

export default function AboutUs() {
  const { t } = useLocale();
  
  return (
    <GenericPage
      title={t('aboutUs.title')}
      subtitle={t('aboutUs.subtitle')}
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          {t('aboutUs.intro')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">{t('aboutUs.mission.title')}</h2>
        <p>
          {t('aboutUs.mission.content')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">{t('aboutUs.servicesTitle')}</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t('aboutUs.servicesList.customTours')}</li>
          <li>{t('aboutUs.servicesList.visaServices')}</li>
          <li>{t('aboutUs.servicesList.groupPackages')}</li>
          <li>{t('aboutUs.servicesList.flightBooking')}</li>
          <li>{t('aboutUs.servicesList.airportTransfer')}</li>
          <li>{t('aboutUs.servicesList.hotelBooking')}</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-black mt-8">{t('aboutUs.contactTitle')}</h2>
        <p>
          <strong>{t('aboutUs.address')}：</strong>39055 Cedar Blvd #126, Newark CA 94560<br />
          <strong>{t('aboutUs.phone')}：</strong>+1 (510) 634-2307<br />
          <strong>{t('aboutUs.email')}：</strong>Jeffhsieh09@gmail.com
        </p>
      </div>
    </GenericPage>
  );
}
