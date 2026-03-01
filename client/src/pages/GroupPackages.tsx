import GenericPage from "@/components/GenericPage";
import { useLocale } from "@/contexts/LocaleContext";

export default function GroupPackages() {
  const { t } = useLocale();

  return (
    <GenericPage
      title={t('nav.groupTours')}
      subtitle={t('groupPackages.subtitle')}
      ctaText={t('common.contactUs')}
      ctaLink="/inquiry"
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          {t('groupPackages.feature1Desc')}
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">{t('groupPackages.whyChoose')}</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t('groupPackages.feature1Title')}</li>
          <li>{t('groupPackages.feature2Title')}</li>
          <li>{t('groupPackages.feature3Title')}</li>
          <li>{t('groupPackages.feature2Desc')}</li>
          <li>{t('groupPackages.feature3Desc')}</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-black mt-8">{t('groupPackages.groupTour')}</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>{t('groupPackages.feature1Desc')}</li>
          <li>{t('groupPackages.feature2Desc')}</li>
          <li>{t('groupPackages.feature3Desc')}</li>
        </ul>
      </div>
    </GenericPage>
  );
}
