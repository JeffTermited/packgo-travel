import GenericPage from "@/components/GenericPage";

export default function ContactUs() {
  return (
    <GenericPage
      title="聯絡我們"
      subtitle="我們隨時為您服務"
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          有任何問題或需求，歡迎隨時與我們聯絡。我們的專業團隊將竭誠為您服務。
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div className="border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-black mb-4">聯絡資訊</h3>
            <div className="space-y-3">
              <p><strong>地址：</strong><br />39055 Cedar Blvd #126<br />Newark CA 94560</p>
              <p><strong>電話：</strong><br />+1 (510) 634-2307</p>
              <p><strong>Email：</strong><br />Jeffhsieh09@gmail.com</p>
            </div>
          </div>
          
          <div className="border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-black mb-4">營業時間</h3>
            <div className="space-y-2">
              <p><strong>週一至週五：</strong><br />9:00 AM - 6:00 PM</p>
              <p><strong>週六：</strong><br />10:00 AM - 4:00 PM</p>
              <p><strong>週日：</strong><br />休息</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 border border-gray-200 mt-8">
          <h3 className="text-xl font-bold text-black mb-4">快速諮詢</h3>
          <p className="mb-4">
            如需立即諮詢，請填寫我們的線上表單，我們會盡快與您聯絡。
          </p>
          <a 
            href="/inquiry" 
            className="inline-block bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            前往諮詢表單
          </a>
        </div>
      </div>
    </GenericPage>
  );
}
