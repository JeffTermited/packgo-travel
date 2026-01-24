import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle, Download, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function PaymentSuccess() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("booking_id");

  const { data: booking, isLoading } = trpc.bookings.getById.useQuery(
    { id: Number(bookingId) },
    { enabled: !!bookingId }
  );

  useEffect(() => {
    // Confetti animation on success
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Since confetti is not available, we'll skip the animation
      // confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      // confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-3xl">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">付款成功！</h1>
          <p className="text-gray-600">
            感謝您的預訂，我們已收到您的付款
          </p>
        </div>

        {/* Booking Details Card */}
        {booking && (
          <Card className="p-8 mb-6">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">預訂詳情</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">預訂編號</p>
                  <p className="font-semibold text-gray-900">#{booking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">預訂狀態</p>
                  <p className="font-semibold text-green-600">已確認</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">客戶姓名</p>
                  <p className="font-semibold text-gray-900">{booking.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">聯絡電話</p>
                  <p className="font-semibold text-gray-900">{booking.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">電子郵件</p>
                  <p className="font-semibold text-gray-900">{booking.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">旅客人數</p>
                  <p className="font-semibold text-gray-900">
                    成人 {booking.numberOfAdults} 位
                    {(booking.numberOfChildrenWithBed + booking.numberOfChildrenNoBed) > 0 && ` · 兒童 ${booking.numberOfChildrenWithBed + booking.numberOfChildrenNoBed} 位`}
                    {booking.numberOfInfants > 0 && ` · 嬰兒 ${booking.numberOfInfants} 位`}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">付款資訊</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">訂金金額</span>
                  <span className="font-semibold text-gray-900">
                    NT$ {booking.depositAmount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">尾款金額</span>
                  <span className="font-semibold text-gray-900">
                    NT$ {booking.remainingAmount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>總金額</span>
                  <span>NT$ {booking.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>重要提醒：</strong>
                我們已將預訂確認信發送至您的電子郵件 <strong>{booking.customerEmail}</strong>。
                請檢查您的收件匣（包含垃圾郵件資料夾）。
              </p>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            variant="default"
            className="flex-1 h-12"
            asChild
          >
            <Link href={`/bookings/${bookingId}`}>
              <Download className="w-4 h-4 mr-2" />
              查看預訂詳情
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
        </div>

        {/* Contact Information */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">需要協助？</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">客服電話</p>
                <p className="font-semibold text-gray-900">02-1234-5678</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">客服信箱</p>
                <p className="font-semibold text-gray-900">service@packgo.com</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
