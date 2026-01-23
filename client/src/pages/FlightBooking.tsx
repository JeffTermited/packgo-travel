import GenericPage from "@/components/GenericPage";

export default function FlightBooking() {
  return (
    <GenericPage
      title="機票預購"
      subtitle="提供全球航線機票預訂服務"
      ctaText="立即諮詢"
      ctaLink="/inquiry"
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          PACK&GO 提供全球各大航空公司機票預訂服務，協助您找到最適合的航班與價格。
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">服務特色</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>全球航線，多家航空公司選擇</li>
          <li>即時比價，找到最優惠價格</li>
          <li>彈性票種，滿足不同需求</li>
          <li>專人服務，協助處理各種問題</li>
          <li>團體機票，享有優惠折扣</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-black mt-8">票種說明</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>經濟艙：</strong>經濟實惠，適合預算有限的旅客</li>
          <li><strong>商務艙：</strong>舒適寬敞，享受優質服務</li>
          <li><strong>頭等艙：</strong>頂級體驗，尊榮禮遇</li>
        </ul>
      </div>
    </GenericPage>
  );
}
