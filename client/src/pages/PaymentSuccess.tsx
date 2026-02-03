import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle, Download, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";

export default function PaymentSuccess() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const bookingId = searchParams.get("booking_id");
  const { t } = useLocale();

  const { data: booking, isLoading } = trpc.bookings.getById.useQuery(
    { id: Number(bookingId) },
    { enabled: !!bookingId }
  );

  useEffect(() => {
    // Confetti animation on success
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const interval: ReturnType<typeof setInterval> = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('payment.success.title')}</h1>
          <p className="text-gray-600">
            {t('payment.success.description')}
          </p>
        </div>

        {/* Booking Details Card */}
        {booking && (
          <Card className="p-8 mb-6">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('booking.tourInfo')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t('booking.bookingNumber')}</p>
                  <p className="font-semibold text-gray-900">#{booking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('booking.bookingStatus')}</p>
                  <p className="font-semibold text-green-600">{t('booking.confirmed')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('booking.traveler')}</p>
                  <p className="font-semibold text-gray-900">{booking.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('quickInquiry.form.phone')}</p>
                  <p className="font-semibold text-gray-900">{booking.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('quickInquiry.form.email')}</p>
                  <p className="font-semibold text-gray-900">{booking.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('booking.travelers')}</p>
                  <p className="font-semibold text-gray-900">
                    {t('booking.adults')} {booking.numberOfAdults}
                    {(booking.numberOfChildrenWithBed + booking.numberOfChildrenNoBed) > 0 && ` · ${t('booking.children')} ${booking.numberOfChildrenWithBed + booking.numberOfChildrenNoBed}`}
                    {booking.numberOfInfants > 0 && ` · ${t('booking.infants')} ${booking.numberOfInfants}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('booking.payment')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('booking.price')}</span>
                  <span className="font-semibold text-gray-900">
                    NT$ {booking.depositAmount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('booking.price')}</span>
                  <span className="font-semibold text-gray-900">
                    NT$ {booking.remainingAmount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>{t('booking.price')}</span>
                  <span>NT$ {booking.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>{t('common.note')}：</strong>
                {t('payment.success.description')} <strong>{booking.customerEmail}</strong>
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
              {t('payment.success.viewBooking')}
            </Link>
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12"
            asChild
          >
            <Link href="/tours">
              {t('tours.title')}
            </Link>
          </Button>
        </div>

        {/* Contact Information */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t('common.haveMoreQuestions')}</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">{t('contactUs.phone')}</p>
                <p className="font-semibold text-gray-900">+1 (510) 634-2307</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">{t('contactUs.email')}</p>
                <p className="font-semibold text-gray-900">Jeffhsieh09@gmail.com</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
