import GenericPage from "@/components/GenericPage";
import SEO from "@/components/SEO";
import { useLocale } from "@/contexts/LocaleContext";

export default function TermsOfService() {
  const { t } = useLocale();
  
  return (
    <GenericPage
      title={t('termsOfService.title')}
      subtitle={t('termsOfService.subtitle')}
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-sm text-gray-500">{t('termsOfService.lastUpdated')}: 2024-01-01</p>
        
        <h2 className="text-2xl font-bold text-black">1. {t('termsOfService.sections.acceptance.title')}</h2>
        <p>
          {t('termsOfService.sections.acceptance.content')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">2. {t('termsOfService.sections.services.title')}</h2>
        <p>
          {t('termsOfService.sections.services.content')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">3. {t('termsOfService.sections.booking.title')}</h2>
        <p>
          {t('termsOfService.sections.booking.content')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">4. {t('termsOfService.sections.liability.title')}</h2>
        <p>
          {t('termsOfService.sections.liability.content')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">5. {t('termsOfService.sections.intellectual.title')}</h2>
        <p>
          {t('termsOfService.sections.intellectual.content')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">6. {t('termsOfService.sections.changes.title')}</h2>
        <p>
          {t('termsOfService.sections.changes.content')}
        </p>
      </div>
    </GenericPage>
  );
}
