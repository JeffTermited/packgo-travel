import { useAuth } from "@/_core/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Home, LogOut, LayoutDashboard, Plane, ShoppingCart, MessageSquare, Star } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

// Import tab components
import DashboardTab from "@/components/admin/DashboardTab";
import ToursTab from "@/components/admin/ToursTab";
import BookingsTab from "@/components/admin/BookingsTab";
import InquiriesTab from "@/components/admin/InquiriesTab";
import ReviewsTab from "@/components/admin/ReviewsTab";

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [loading, isAuthenticated, setLocation]);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">管理後台</h1>
              <p className="text-sm text-gray-600 mt-1">歡迎回來，{user?.name || "管理員"}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                className="rounded-full"
              >
                <Home className="h-4 w-4 mr-2" />
                返回首頁
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="rounded-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                登出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-8 rounded-full bg-white border border-gray-200 p-1">
            <TabsTrigger value="dashboard" className="rounded-full">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              儀表板
            </TabsTrigger>
            <TabsTrigger value="tours" className="rounded-full">
              <Plane className="h-4 w-4 mr-2" />
              行程管理
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-full">
              <ShoppingCart className="h-4 w-4 mr-2" />
              預訂管理
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="rounded-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              諮詢管理
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-full">
              <Star className="h-4 w-4 mr-2" />
              評價管理
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="tours">
            <ToursTab />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsTab />
          </TabsContent>

          <TabsContent value="inquiries">
            <InquiriesTab />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
