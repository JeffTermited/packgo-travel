import GenericPage from "@/components/GenericPage";

export default function VisaServices() {
  return (
    <GenericPage
      title="代辦簽證"
      subtitle="專業簽證代辦服務，讓您的出國手續更輕鬆"
      ctaText="立即諮詢"
      ctaLink="/inquiry"
    >
      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          PACK&GO 提供專業的簽證代辦服務，協助您處理各國簽證申請，讓您省時省力，安心出國。
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">服務項目</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>美國簽證（B1/B2 觀光商務簽證、學生簽證）</li>
          <li>歐洲申根簽證</li>
          <li>日本簽證</li>
          <li>韓國簽證</li>
          <li>其他國家簽證諮詢與代辦</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-black mt-8">為什麼選擇我們？</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>專業團隊，經驗豐富</li>
          <li>快速處理，節省時間</li>
          <li>文件審核，降低拒簽風險</li>
          <li>全程協助，安心無憂</li>
        </ul>
      </div>
    </GenericPage>
  );
}
