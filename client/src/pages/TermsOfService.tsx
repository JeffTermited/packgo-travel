import GenericPage from "@/components/GenericPage";

export default function TermsOfService() {
  return (
    <GenericPage
      title="服務條款"
      subtitle="使用本網站服務前，請詳細閱讀以下條款"
    >
      <div className="space-y-6 text-gray-700">
        <h2 className="text-2xl font-bold text-black">1. 服務說明</h2>
        <p>
          PACK&GO 旅行社提供旅遊規劃、機票預訂、飯店預訂、簽證代辦等相關服務。使用本網站服務即表示您同意遵守本服務條款。
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">2. 預訂與付款</h2>
        <p>
          所有預訂需經過確認後方可生效。付款方式包括信用卡、銀行轉帳等，具體以實際預訂時的選項為準。
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">3. 取消與退款</h2>
        <p>
          取消政策依據不同產品而有所不同，請在預訂前詳細閱讀相關條款。退款將依據取消政策進行處理。
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">4. 責任限制</h2>
        <p>
          PACK&GO 旅行社將盡力提供準確的資訊與優質的服務，但對於不可抗力因素（如天災、政治事件等）造成的損失不承擔責任。
        </p>
        
        <h2 className="text-2xl font-bold text-black mt-8">5. 條款變更</h2>
        <p>
          我們保留隨時修改本服務條款的權利，修改後的條款將在網站上公布。繼續使用本網站服務即表示您同意修改後的條款。
        </p>
      </div>
    </GenericPage>
  );
}
