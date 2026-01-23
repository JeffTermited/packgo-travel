import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Loader2, Mail, User, Calendar, LogOut, Heart, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-12">
        <div className="container">
          <h1 className="text-3xl font-bold">會員中心</h1>
          <p className="text-gray-400 mt-2">管理您的個人資訊與訂單記錄</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-black">
              <CardHeader className="border-b-2 border-black bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-black text-white flex items-center justify-center text-2xl font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <CardTitle className="text-xl text-black">{user.name}</CardTitle>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="h-5 w-5" />
                    <div>
                      <p className="text-xs text-gray-500">登入方式</p>
                      <p className="text-sm font-medium text-black">
                        {user.loginMethod === 'google' && 'Google'}
                        {user.loginMethod === 'line' && 'LINE'}
                        {user.loginMethod === 'email' && 'Email'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <p className="text-xs text-gray-500">註冊日期</p>
                      <p className="text-sm font-medium text-black">
                        {new Date(user.createdAt).toLocaleDateString('zh-TW')}
                      </p>
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <div className="mt-4 p-3 bg-black text-white text-center">
                      <p className="text-sm font-bold">管理員帳號</p>
                    </div>
                  )}
                  <Button 
                    onClick={handleLogout}
                    variant="outline" 
                    className="w-full mt-6 border-2 border-black hover:bg-black hover:text-white"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    登出
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Info */}
            <Card className="border-2 border-black">
              <CardHeader className="border-b-2 border-black bg-gray-50">
                <CardTitle className="flex items-center gap-2 text-black">
                  <User className="h-5 w-5" />
                  個人資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">姓名</label>
                    <p className="mt-1 text-lg font-medium text-black">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">電子郵件</label>
                    <p className="mt-1 text-lg font-medium text-black">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">會員編號</label>
                    <p className="mt-1 text-lg font-medium text-black">#{user.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">最後登入</label>
                    <p className="mt-1 text-lg font-medium text-black">
                      {user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleString('zh-TW') : '未記錄'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order History */}
            <Card className="border-2 border-black">
              <CardHeader className="border-b-2 border-black bg-gray-50">
                <CardTitle className="flex items-center gap-2 text-black">
                  <ShoppingBag className="h-5 w-5" />
                  訂單記錄
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600">目前沒有訂單記錄</p>
                  <p className="text-sm text-gray-500 mt-2">您的旅遊訂單將會顯示在這裡</p>
                </div>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
