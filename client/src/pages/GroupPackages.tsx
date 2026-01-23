import GenericPage from "@/components/GenericPage";

export default function GroupPackages() {
  return (
    <GenericPage
      title="包團旅遊"
      subtitle="專屬包團服務，打造您的私人旅行團"
      ctaText="立即諮詢"
      ctaLink="/inquiry"
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          無論是家族旅遊、公司團建、同學會或朋友聚會，我們都能為您量身打造專屬的包團行程。
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">包團優勢</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>彈性行程安排，完全客製化</li>
          <li>專屬領隊導遊，全程陪同</li>
          <li>自由選擇出發日期</li>
          <li>團體優惠價格</li>
          <li>隱私性高，旅遊品質佳</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-black mt-8">適合對象</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>家族旅遊（10人以上）</li>
          <li>公司員工旅遊</li>
          <li>同學會、校友會</li>
          <li>社團、協會出遊</li>
          <li>獎勵旅遊</li>
        </ul>
      </div>
    </GenericPage>
  );
}
