import GenericPage from "@/components/GenericPage";

export default function HotelBooking() {
  return (
    <GenericPage
      title="飯店預訂"
      subtitle="全球飯店預訂服務，找到最適合您的住宿"
      ctaText="立即查詢"
      ctaLink="/inquiry"
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          PACK&GO 提供全球飯店預訂服務，從經濟型旅館到豪華度假村，滿足您的各種住宿需求。
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">飯店類型</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>經濟型飯店：</strong>價格實惠，乾淨舒適</li>
          <li><strong>商務飯店：</strong>設施完善，適合商務旅客</li>
          <li><strong>度假飯店：</strong>休閒設施豐富，適合度假放鬆</li>
          <li><strong>精品飯店：</strong>獨特設計，高品質服務</li>
          <li><strong>豪華飯店：</strong>頂級享受，尊榮體驗</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-black mt-8">預訂優勢</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>全球飯店資源，選擇多樣</li>
          <li>即時比價，找到最優惠價格</li>
          <li>專人服務，協助處理各種問題</li>
          <li>彈性取消政策</li>
        </ul>
      </div>
    </GenericPage>
  );
}
