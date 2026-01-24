import { Link, useLocation } from "wouter";
import { XCircle, RefreshCw, Mail, Phone, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PaymentFailure() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const bookingId = searchParams.get("booking_id");
  const error = searchParams.get("error");

  const getErrorMessage = () => {
    if (error === "cancelled") {
      return "您已取消付款流程";
    }
    if (error === "expired") {
      return "付款連結已過期";
    }
    return "付款處理失敗，請稍後再試";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-3xl">
        {/* Error Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">付款失敗</h1>
          <p className="text-gray-600">{getErrorMessage()}</p>
        </div>

        {/* Error Details Card */}
        <Card className="p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">發生什麼問題？</h2>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">
                您的付款未能成功完成。這可能是由於以下原因：
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-red-800 space-y-1">
                <li>信用卡資訊輸入錯誤</li>
                <li>信用卡額度不足</li>
                <li>銀行拒絕交易</li>
                <li>網路連線中斷</li>
                <li>您取消了付款流程</li>
              </ul>
            </div>

            {bookingId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>預訂編號：</strong>#{bookingId}
                </p>
                <p className="text-sm text-blue-900 mt-2">
                  您的預訂資料已保留，您可以稍後再次嘗試付款。
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {bookingId ? (
            <>
              <Button
                variant="default"
                className="flex-1 h-12"
                asChild
              >
                <Link href={`/bookings/${bookingId}`}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新付款
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12"
                asChild
              >
                <Link href="/tours">
                  繼續瀏覽行程
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                className="flex-1 h-12"
                asChild
              >
                <Link href="/tours">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新選擇行程
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12"
                asChild
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  返回首頁
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Contact Information */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">需要協助？</h3>
          <p className="text-gray-600 mb-4">
            如果您持續遇到付款問題，或需要其他付款方式，請聯絡我們的客服團隊。
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">客服電話</p>
                <p className="font-semibold text-gray-900">02-1234-5678</p>
                <p className="text-xs text-gray-500">服務時間：週一至週五 09:00-18:00</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">客服信箱</p>
                <p className="font-semibold text-gray-900">service@packgo.com</p>
                <p className="text-xs text-gray-500">我們將在 24 小時內回覆</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tips Card */}
        <Card className="p-6 mt-6 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💡 付款小提示</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>請確認您的信用卡資訊正確無誤</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>確保信用卡額度足夠支付此筆訂單</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>如使用海外信用卡，請確認是否已開啟海外交易功能</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>建議使用穩定的網路連線進行付款</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
