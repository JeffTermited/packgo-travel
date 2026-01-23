import GenericPage from "@/components/GenericPage";

export default function PrivacyPolicy() {
  return (
    <GenericPage
      title="隱私權政策"
      subtitle="我們重視您的隱私，並致力於保護您的個人資訊"
    >
      <div className="space-y-6 text-gray-700">
        <h2 className="text-2xl font-bold text-black">1. 資訊收集</h2>
        <p>
          我們收集的個人資訊包括姓名、聯絡方式、護照資訊等，僅用於提供旅遊服務。
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">2. 資訊使用</h2>
        <p>
          您的個人資訊將用於處理預訂、提供客戶服務、發送旅遊資訊等用途。我們不會將您的資訊出售給第三方。
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">3. 資訊保護</h2>
        <p>
          我們採用業界標準的安全措施保護您的個人資訊，包括加密傳輸、安全儲存等。
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">4. Cookie 使用</h2>
        <p>
          本網站使用 Cookie 來改善使用者體驗。您可以透過瀏覽器設定來管理 Cookie。
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">5. 政策變更</h2>
        <p>
          我們保留隨時修改本隱私權政策的權利，修改後的政策將在網站上公布。
        </p>
      </div>
    </GenericPage>
  );
}
