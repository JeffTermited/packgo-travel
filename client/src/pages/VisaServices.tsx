import GenericPage from "@/components/GenericPage";
import { useLocale } from "@/contexts/LocaleContext";

export default function VisaServices() {
  const { t } = useLocale();
  
  return (
    <GenericPage
      title={t('visaServices.title')}
      subtitle={t('visaServices.subtitle')}
      ctaText={t('common.contactUs')}
      ctaLink="/inquiry"
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          {t('visaServices.description')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">{t('visaServices.countries')}</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>USA Visa (B1/B2 Tourist/Business Visa, Student Visa)</li>
          <li>European Schengen Visa</li>
          <li>Japan Visa</li>
          <li>Korea Visa</li>
          <li>Other Countries</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-black mt-8">{t('visaServices.requirements')}</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t('visaServices.processingTime')}</li>
          <li>{t('visaServices.fees')}</li>
        </ul>
        
        <div className="mt-8 flex gap-4">
          <a href="/inquiry" className="inline-block px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors">
            {t('visaServices.applyNow')}
          </a>
          <a href="/contact-us" className="inline-block px-6 py-3 border border-black text-black font-medium hover:bg-gray-100 transition-colors">
            {t('visaServices.checkStatus')}
          </a>
        </div>
      </div>
    </GenericPage>
  );
}
