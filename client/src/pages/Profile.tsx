import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  Loader2, User, Calendar, LogOut, Heart, ShoppingBag, 
  MapPin, TrendingUp, Award, MessageSquare, ChevronRight, Package
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch user bookings
  const { data: bookings = [] } = trpc.bookings.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate statistics
  const completedTrips = bookings.filter((b: any) => b.bookingStatus === 'completed').length;
  const upcomingTrips = bookings.filter((b: any) => b.bookingStatus === 'confirmed').length;
  const totalSpent = bookings
    .filter((b: any) => b.paymentStatus === 'paid')
    .reduce((sum: number, b: any) => sum + parseFloat(b.totalPrice), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-1">會員中心</h1>
              <p className="text-gray-500">Hi, {user.name}</p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="rounded-full border-2 border-black hover:bg-black hover:text-white px-6"
            >
              <LogOut className="h-4 w-4 mr-2" />
              登出
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-3">
            <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <CardContent className="p-6">
                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="h-24 w-24 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold mb-4">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <h3 className="text-xl font-bold text-black">{user.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                  {user.role === 'admin' && (
                    <div className="mt-3 px-4 py-1 bg-black text-white text-xs font-bold rounded-full">
                      管理員
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="space-y-4 border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500 text-xs">會員編號</p>
                      <p className="text-black font-medium">#{user.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500 text-xs">註冊日期</p>
                      <p className="text-black font-medium">
                        {new Date(user.createdAt).toLocaleDateString('zh-TW')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Award className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500 text-xs">會員等級</p>
                      <p className="text-black font-medium">
                        {user.role === 'admin' ? 'VIP 會員' : '一般會員'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">已完成旅遊</p>
                      <p className="text-3xl font-bold text-black">{completedTrips}</p>
                      <p className="text-xs text-gray-400 mt-2">次旅程</p>
                    </div>
                    <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <MapPin className="h-7 w-7 text-black" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">即將出發</p>
                      <p className="text-3xl font-bold text-black">{upcomingTrips}</p>
                      <p className="text-xs text-gray-400 mt-2">個行程</p>
                    </div>
                    <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <Package className="h-7 w-7 text-black" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">累積消費</p>
                      <p className="text-3xl font-bold text-black">${totalSpent.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-2">總金額</p>
                    </div>
                    <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <TrendingUp className="h-7 w-7 text-black" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg text-black">快速操作</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setLocation("/profile")}
                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-black" />
                      </div>
                      <span className="font-medium text-black">我的預訂</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
                  </button>

                  <button
                    onClick={() => setLocation("/profile")}
                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-black" />
                      </div>
                      <span className="font-medium text-black">收藏行程</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
                  </button>

                  <button
                    onClick={() => setLocation("/profile")}
                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-black" />
                      </div>
                      <span className="font-medium text-black">聯絡客服</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-black">最近預訂</CardTitle>
                  {bookings.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full border border-gray-300 hover:border-black hover:bg-gray-50"
                      onClick={() => setLocation("/profile")}
                    >
                      查看全部
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.slice(0, 3).map((booking: any) => (
                      <div 
                        key={booking.id}
                        className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all cursor-pointer"
                        onClick={() => setLocation(`/booking/${booking.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-black" />
                          </div>
                          <div>
                            <p className="font-medium text-black">預訂編號: {booking.bookingNumber}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {booking.bookingStatus === 'pending' && '待確認'}
                              {booking.bookingStatus === 'confirmed' && '已確認'}
                              {booking.bookingStatus === 'cancelled' && '已取消'}
                              {booking.bookingStatus === 'completed' && '已完成'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-black">${parseFloat(booking.totalPrice).toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {booking.paymentStatus === 'pending' && '待付款'}
                            {booking.paymentStatus === 'deposit_paid' && '已付訂金'}
                            {booking.paymentStatus === 'paid' && '已付清'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-2">目前沒有預訂記錄</p>
                    <p className="text-sm text-gray-500 mb-6">開始探索精彩的旅遊行程吧！</p>
                    <Button 
                      className="rounded-full bg-black text-white hover:bg-gray-800 px-8"
                      onClick={() => setLocation("/")}
                    >
                      瀏覽行程
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favorites */}
            <Card className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg text-black">收藏的行程</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-16">
                  <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">尚未收藏任何行程</p>
                  <p className="text-sm text-gray-500 mb-6">瀏覽行程並加入收藏，方便日後查看</p>
                  <Button 
                    className="rounded-full bg-black text-white hover:bg-gray-800 px-8"
                    onClick={() => setLocation("/")}
                  >
                    探索行程
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
