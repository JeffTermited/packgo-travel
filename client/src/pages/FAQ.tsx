import GenericPage from "@/components/GenericPage";

export default function FAQ() {
  return (
    <GenericPage
      title="常見問題"
      subtitle="快速找到您需要的答案"
      ctaText="還有其他問題？"
      ctaLink="/inquiry"
    >
      <div className="space-y-8 text-gray-700">
        <div>
          <h2 className="text-xl font-bold text-black mb-2">如何預訂行程？</h2>
          <p>
            您可以透過網站瀏覽我們的行程，點擊「立即預訂」按鈕填寫資料，或直接聯絡我們的客服人員協助預訂。
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-black mb-2">付款方式有哪些？</h2>
          <p>
            我們接受信用卡、銀行轉帳等多種付款方式。具體以實際預訂時的選項為準。
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-black mb-2">可以取消預訂嗎？</h2>
          <p>
            可以，但取消政策依據不同產品而有所不同。請在預訂前詳細閱讀相關條款，或聯絡客服了解詳情。
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-black mb-2">簽證需要多久時間？</h2>
          <p>
            簽證處理時間因國家而異，一般需要 7-30 個工作天。建議您提前規劃，我們會盡力協助您快速取得簽證。
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-black mb-2">可以客製化行程嗎？</h2>
          <p>
            當然可以！我們提供完全客製化的旅遊服務，您可以告訴我們您的需求，我們會為您量身打造專屬行程。
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-black mb-2">旅遊保險包含在內嗎？</h2>
          <p>
            部分行程包含基本旅遊保險，但我們建議您根據個人需求購買額外的旅遊保險，以獲得更全面的保障。
          </p>
        </div>
      </div>
    </GenericPage>
  );
}
