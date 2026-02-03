import GenericPage from "@/components/GenericPage";
import { useLocale } from "@/contexts/LocaleContext";

export default function ContactUs() {
  const { t } = useLocale();
  
  return (
    <GenericPage
      title={t('contactUs.title')}
      subtitle={t('contactUs.subtitle')}
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          {t('contactUs.intro')}
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div className="border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-black mb-4">{t('contactUs.contactInfo')}</h3>
            <div className="space-y-3">
              <p><strong>{t('contactUs.address')}：</strong><br />39055 Cedar Blvd #126<br />Newark CA 94560</p>
              <p><strong>{t('contactUs.phone')}：</strong><br />+1 (510) 634-2307</p>
              <p><strong>{t('contactUs.email')}：</strong><br />Jeffhsieh09@gmail.com</p>
            </div>
          </div>
          
          <div className="border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-black mb-4">{t('contactUs.businessHours')}</h3>
            <div className="space-y-2">
              <p><strong>{t('contactUs.weekdays')}：</strong><br />9:00 AM - 6:00 PM</p>
              <p><strong>{t('contactUs.saturday')}：</strong><br />10:00 AM - 4:00 PM</p>
              <p><strong>{t('contactUs.sunday')}：</strong><br />{t('contactUs.closed')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 border border-gray-200 mt-8">
          <h3 className="text-xl font-bold text-black mb-4">{t('contactUs.quickInquiry')}</h3>
          <p className="mb-4">
            {t('contactUs.quickInquiryDesc')}
          </p>
          <a 
            href="/inquiry" 
            className="inline-block bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            {t('contactUs.goToForm')}
          </a>
        </div>
      </div>
    </GenericPage>
  );
}
