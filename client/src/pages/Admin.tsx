import { useAuth } from "@/_core/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Home, LogOut, LayoutDashboard, Plane, ShoppingCart, MessageSquare, Star, Brain } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";

// Import tab components
import DashboardTab from "@/components/admin/DashboardTab";
import ToursTab from "@/components/admin/ToursTab";
import BookingsTab from "@/components/admin/BookingsTab";
import InquiriesTab from "@/components/admin/InquiriesTab";
import ReviewsTab from "@/components/admin/ReviewsTab";
import SkillsTab from "@/components/admin/SkillsTab";

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useLocale();

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
          <p className="text-gray-600">{t('admin.loading')}</p>
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
              <h1 className="text-2xl font-bold text-gray-900">{t('admin.title')}</h1>
              <p className="text-sm text-gray-600 mt-1">{t('admin.welcome')}，{user?.name || t('admin.administrator')}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                className="rounded-full"
              >
                <Home className="h-4 w-4 mr-2" />
                {t('admin.backToHome')}
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="rounded-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('admin.logout')}
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
              {t('admin.dashboard')}
            </TabsTrigger>
            <TabsTrigger value="tours" className="rounded-full">
              <Plane className="h-4 w-4 mr-2" />
              {t('admin.tours')}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-full">
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t('admin.bookings')}
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="rounded-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t('admin.inquiries')}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-full">
              <Star className="h-4 w-4 mr-2" />
              {t('admin.reviews')}
            </TabsTrigger>
            <TabsTrigger value="skills" className="rounded-full">
              <Brain className="h-4 w-4 mr-2" />
              {t('admin.skills')}
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

          <TabsContent value="skills">
            <SkillsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
