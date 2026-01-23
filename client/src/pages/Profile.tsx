import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  Loader2, Mail, User, Calendar, LogOut, Heart, ShoppingBag, 
  MapPin, Clock, TrendingUp, Award, CreditCard, MessageSquare 
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
      <div className="min-h-screen flex items-center justify-center bg-white">
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
    <div className="min-h-screen bg-white">
      {/* Hero Section with Personalized Greeting */}
      <div className="bg-black text-white py-16">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                歡迎回來，{user.name}
              </h1>
              <p className="text-gray-400 text-lg">
                準備好開始下一段旅程了嗎？
              </p>
            </div>
            <div className="hidden md:block">
              <div className="h-24 w-24 bg-white text-black flex items-center justify-center text-4xl font-bold border-4 border-white">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-2 border-black hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">已完成旅遊</p>
                  <p className="text-3xl font-bold text-black">{completedTrips}</p>
                </div>
                <div className="h-12 w-12 bg-black text-white flex items-center justify-center">
                  <MapPin className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">即將出發</p>
                  <p className="text-3xl font-bold text-black">{upcomingTrips}</p>
                </div>
                <div className="h-12 w-12 bg-black text-white flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">累積消費</p>
                  <p className="text-3xl font-bold text-black">${totalSpent.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-black text-white flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">會員等級</p>
                  <p className="text-3xl font-bold text-black">
                    {user.role === 'admin' ? 'VIP' : '一般'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-black text-white flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card 
            className="border-2 border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => setLocation("/profile")}
          >
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 bg-black text-white flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">我的預訂</h3>
              <p className="text-gray-600 text-sm">查看所有預訂記錄與行程詳情</p>
            </CardContent>
          </Card>

          <Card 
            className="border-2 border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => setLocation("/profile")}
          >
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 bg-black text-white flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">收藏行程</h3>
              <p className="text-gray-600 text-sm">瀏覽您收藏的旅遊產品</p>
            </CardContent>
          </Card>

          <Card 
            className="border-2 border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => setLocation("/profile")}
          >
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 bg-black text-white flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">聯絡客服</h3>
              <p className="text-gray-600 text-sm">有任何問題？立即與我們聯繫</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Bookings */}
            <Card className="border-2 border-black">
              <CardHeader className="border-b-2 border-black bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-black">
                    <ShoppingBag className="h-5 w-5" />
                    最近預訂
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 border-black hover:bg-black hover:text-white"
                    onClick={() => setLocation("/profile")}
                  >
                    查看全部
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking: any) => (
                      <div 
                        key={booking.id}
                        className="flex items-center justify-between p-4 border-2 border-gray-200 hover:border-black transition-colors duration-200 cursor-pointer"
                        onClick={() => setLocation(`/booking/${booking.id}`)}
                      >
                        <div className="flex-1">
                          <p className="font-bold text-black">預訂編號: {booking.bookingNumber}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            狀態: {booking.bookingStatus === 'pending' && '待確認'}
                            {booking.bookingStatus === 'confirmed' && '已確認'}
                            {booking.bookingStatus === 'cancelled' && '已取消'}
                            {booking.bookingStatus === 'completed' && '已完成'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-black">${parseFloat(booking.totalPrice).toLocaleString()}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {booking.paymentStatus === 'pending' && '待付款'}
                            {booking.paymentStatus === 'deposit_paid' && '已付訂金'}
                            {booking.paymentStatus === 'paid' && '已付清'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">目前沒有預訂記錄</p>
                    <p className="text-sm text-gray-500 mt-2">開始探索精彩的旅遊行程吧！</p>
                    <Button 
                      className="mt-6 bg-black text-white hover:bg-gray-800"
                      onClick={() => setLocation("/")}
                    >
                      瀏覽行程
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favorites */}
            <Card className="border-2 border-black">
              <CardHeader className="border-b-2 border-black bg-gray-50">
                <CardTitle className="flex items-center gap-2 text-black">
                  <Heart className="h-5 w-5" />
                  收藏的行程
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600">尚未收藏任何行程</p>
                  <p className="text-sm text-gray-500 mt-2">瀏覽行程並加入收藏，方便日後查看</p>
                  <Button 
                    className="mt-6 bg-black text-white hover:bg-gray-800"
                    onClick={() => setLocation("/")}
                  >
                    探索行程
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="border-2 border-black">
              <CardHeader className="border-b-2 border-black bg-gray-50">
                <CardTitle className="flex items-center gap-2 text-black">
                  <User className="h-5 w-5" />
                  個人資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500">姓名</label>
                    <p className="text-sm font-medium text-black mt-1">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">電子郵件</label>
                    <p className="text-sm font-medium text-black mt-1">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">會員編號</label>
                    <p className="text-sm font-medium text-black mt-1">#{user.id}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">註冊日期</label>
                    <p className="text-sm font-medium text-black mt-1">
                      {new Date(user.createdAt).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">登入方式</label>
                    <p className="text-sm font-medium text-black mt-1">
                      {user.loginMethod === 'google' && 'Google'}
                      {user.loginMethod === 'line' && 'LINE'}
                      {user.loginMethod === 'email' && 'Email'}
                    </p>
                  </div>
                  {user.role === 'admin' && (
                    <div className="mt-4 p-3 bg-black text-white text-center">
                      <p className="text-sm font-bold">管理員帳號</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-2 border-black">
              <CardHeader className="border-b-2 border-black bg-gray-50">
                <CardTitle className="text-black text-sm">快速連結</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-2 border-black hover:bg-black hover:text-white"
                    onClick={() => setLocation("/profile")}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    付款記錄
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-2 border-black hover:bg-black hover:text-white"
                    onClick={() => setLocation("/profile")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    我的諮詢
                  </Button>
                  <Button 
                    onClick={handleLogout}
                    variant="outline" 
                    className="w-full justify-start border-2 border-black hover:bg-black hover:text-white"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    登出
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
