import GenericPage from "@/components/GenericPage";

export default function AirportTransfer() {
  return (
    <GenericPage
      title="機場接送"
      subtitle="專業機場接送服務，讓您的旅程更輕鬆"
      ctaText="立即預訂"
      ctaLink="/inquiry"
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          提供安全、舒適、準時的機場接送服務，讓您的旅程從家門口就開始享受。
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">服務範圍</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>機場至市區飯店接送</li>
          <li>市區至機場接送</li>
          <li>跨城市接送服務</li>
          <li>包車旅遊</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-black mt-8">服務特色</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>專業司機，熟悉路線</li>
          <li>準時接送，不誤點</li>
          <li>車輛舒適，安全可靠</li>
          <li>24小時服務</li>
          <li>彈性預訂，方便快捷</li>
        </ul>
      </div>
    </GenericPage>
  );
}
