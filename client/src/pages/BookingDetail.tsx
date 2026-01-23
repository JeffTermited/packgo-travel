import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Loader2, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  CreditCard,
  User,
  Mail,
  Phone
} from "lucide-react";
import { useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function BookingDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const bookingId = params.id ? parseInt(params.id) : 0;

  const { data: booking, isLoading, refetch } = trpc.bookings.getById.useQuery(
    { id: bookingId },
    { enabled: !!bookingId && !!user }
  );

  const createCheckoutMutation = trpc.bookings.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      toast.success("正在前往付款頁面...");
      if (data.url) {
        window.open(data.url, "_blank");
      }
      // Refetch booking data after a delay to update payment status
      setTimeout(() => {
        refetch();
      }, 3000);
    },
    onError: (error) => {
      toast.error("建立付款連結失敗", {
        description: error.message,
      });
    },
  });

  const handlePayment = (paymentType: "deposit" | "balance" | "full") => {
    if (!user) {
      toast.error("請先登入");
      window.location.href = getLoginUrl();
      return;
    }

    createCheckoutMutation.mutate({
      bookingId,
      paymentType,
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center bg-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4">請先登入</h2>
            <Button onClick={() => window.location.href = getLoginUrl()} className="bg-black hover:bg-gray-800 text-white">
              前往登入
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center bg-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4">找不到此預訂</h2>
            <Button onClick={() => navigate("/profile")} className="bg-black hover:bg-gray-800 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回個人中心
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "待確認", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
      confirmed: { label: "已確認", className: "bg-blue-100 text-blue-800 border-blue-300" },
      cancelled: { label: "已取消", className: "bg-red-100 text-red-800 border-red-300" },
      completed: { label: "已完成", className: "bg-green-100 text-green-800 border-green-300" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={`${config.className} border`}>{config.label}</Badge>;
  };

  // Calculate amounts
  const totalAmount = booking.totalPrice;
  const depositAmount = booking.depositAmount;
  const balanceAmount = booking.remainingAmount;
  const paidAmount = booking.paymentStatus === 'unpaid' ? 0 : 
                     booking.paymentStatus === 'deposit' ? depositAmount : 
                     booking.paymentStatus === 'paid' ? totalAmount : 0;

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      unpaid: { label: "待付款", className: "bg-gray-100 text-gray-800 border-gray-300", icon: Clock },
      deposit: { label: "已付訂金", className: "bg-blue-100 text-blue-800 border-blue-300", icon: CheckCircle2 },
      paid: { label: "已付清", className: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle2 },
      refunded: { label: "已退款", className: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid;
    const Icon = config.icon;
    return (
      <Badge className={`${config.className} border flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const canPayDeposit = booking.paymentStatus === "unpaid";
  const canPayBalance = booking.paymentStatus === "deposit";
  const isFullyPaid = booking.paymentStatus === "paid";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow container py-12">
        <Button 
          variant="outline" 
          onClick={() => navigate("/profile")}
          className="mb-6 border-2 border-black rounded-3xl hover:bg-black hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回個人中心
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Header */}
            <Card className="border-2 border-black rounded-3xl">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">預訂編號 #{booking.id}</CardTitle>
                    <p className="text-sm text-gray-600">
                      預訂時間：{new Date(booking.createdAt).toLocaleString('zh-TW')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(booking.bookingStatus)}
                    {getPaymentStatusBadge(booking.paymentStatus)}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Tour Information */}
            <Card className="border-2 border-black rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  行程資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">行程編號 #{booking.tourId}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>出發團號：#{booking.departureId}</span>
                    </div>

                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">成人</p>
                    <p className="font-bold">{booking.numberOfAdults} 位</p>
                  </div>
                  {booking.numberOfChildrenWithBed > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">兒童（佔床）</p>
                      <p className="font-bold">{booking.numberOfChildrenWithBed} 位</p>
                    </div>
                  )}
                  {booking.numberOfChildrenNoBed > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">兒童（不佔床）</p>
                      <p className="font-bold">{booking.numberOfChildrenNoBed} 位</p>
                    </div>
                  )}
                  {booking.numberOfInfants > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">嬰兒</p>
                      <p className="font-bold">{booking.numberOfInfants} 位</p>
                    </div>
                  )}
                  {booking.numberOfSingleRooms > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">單人房</p>
                      <p className="font-bold">{booking.numberOfSingleRooms} 間</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-2 border-black rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  聯絡資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-600" />
                  <span>{booking.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span>{booking.customerEmail}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span>{booking.customerPhone}</span>
                </div>
                {booking.message && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">特殊需求</p>
                      <p className="text-sm">{booking.message}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Payment Card */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-black rounded-3xl sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  付款資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">總金額</span>
                    <span className="font-bold text-lg">NT$ {totalAmount.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">訂金（20%）</span>
                    <span className="font-medium">NT$ {depositAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">尾款</span>
                    <span className="font-medium">NT$ {balanceAmount.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">已付金額</span>
                    <span className="font-bold text-green-600">NT$ {paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">未付金額</span>
                    <span className="font-bold text-red-600">
                      NT$ {(totalAmount - paidAmount).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!isFullyPaid && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-bold text-sm">選擇付款方式</h3>
                      {canPayDeposit && (
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handlePayment("deposit")}
                          disabled={createCheckoutMutation.isPending}
                        >
                          {createCheckoutMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CreditCard className="h-4 w-4 mr-2" />
                          )}
                          支付訂金 NT$ {depositAmount.toLocaleString()}
                        </Button>
                      )}
                      {canPayBalance && (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handlePayment("balance")}
                          disabled={createCheckoutMutation.isPending}
                        >
                          {createCheckoutMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CreditCard className="h-4 w-4 mr-2" />
                          )}
                          支付尾款 NT$ {balanceAmount.toLocaleString()}
                        </Button>
                      )}
                      {canPayDeposit && (
                        <Button 
                          className="w-full bg-black hover:bg-gray-800 text-white"
                          onClick={() => handlePayment("full")}
                          disabled={createCheckoutMutation.isPending}
                        >
                          {createCheckoutMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CreditCard className="h-4 w-4 mr-2" />
                          )}
                          一次付清 NT$ {totalAmount.toLocaleString()}
                        </Button>
                      )}
                    </div>
                  </>
                )}

                {isFullyPaid && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-bold text-green-800">付款已完成</p>
                    <p className="text-sm text-green-600 mt-1">感謝您的預訂！</p>
                  </div>
                )}

                <Separator />
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• 付款後請保留收據</p>
                  <p>• 如有問題請聯絡客服</p>
                  <p>• 取消政策依行程規定</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
