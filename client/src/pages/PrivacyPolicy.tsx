import GenericPage from "@/components/GenericPage";
import { useLocale } from "@/contexts/LocaleContext";

export default function PrivacyPolicy() {
  const { t } = useLocale();
  
  return (
    <GenericPage
      title={t('privacyPolicy.title')}
      subtitle={t('privacyPolicy.subtitle')}
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-sm text-gray-500">{t('privacyPolicy.lastUpdated')}: 2024-01-01</p>
        
        <h2 className="text-2xl font-bold text-black">1. {t('privacyPolicy.sections.collection.title')}</h2>
        <p>
          {t('privacyPolicy.sections.collection.content')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">2. {t('privacyPolicy.sections.usage.title')}</h2>
        <p>
          {t('privacyPolicy.sections.usage.content')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">3. {t('privacyPolicy.sections.protection.title')}</h2>
        <p>
          {t('privacyPolicy.sections.protection.content')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">4. {t('privacyPolicy.sections.cookies.title')}</h2>
        <p>
          {t('privacyPolicy.sections.cookies.content')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">5. {t('privacyPolicy.sections.rights.title')}</h2>
        <p>
          {t('privacyPolicy.sections.rights.content')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">6. {t('privacyPolicy.sections.contact.title')}</h2>
        <p>
          {t('privacyPolicy.sections.contact.content')}
        </p>
      </div>
    </GenericPage>
  );
}
