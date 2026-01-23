import GenericPage from "@/components/GenericPage";

export default function AboutUs() {
  return (
    <GenericPage
      title="關於我們"
      subtitle="PACK&GO 旅行社致力於為您打造完美旅程"
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          PACK&GO 旅行社成立於美國加州，專注於為華人客戶提供專業的旅遊服務。我們的團隊擁有豐富的旅遊規劃經驗，致力於為每一位客戶打造獨特且難忘的旅行體驗。
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">我們的使命</h2>
        <p>
          讓旅行更美好。我們相信，每一次旅行都應該是一次美好的體驗，無論是探索世界的每一個角落，還是深入了解當地文化，我們都希望能為您提供最專業、最貼心的服務。
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">我們的服務</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>客製旅遊規劃</li>
          <li>代辦簽證服務</li>
          <li>包團旅遊安排</li>
          <li>機票預購</li>
          <li>機場接送</li>
          <li>飯店預訂</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-black mt-8">聯絡資訊</h2>
        <p>
          <strong>地址：</strong>39055 Cedar Blvd #126, Newark CA 94560<br />
          <strong>電話：</strong>+1 (510) 634-2307<br />
          <strong>Email：</strong>Jeffhsieh09@gmail.com
        </p>
      </div>
    </GenericPage>
  );
}
