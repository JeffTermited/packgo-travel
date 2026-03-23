import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Home,
  LogOut,
  LayoutDashboard,
  Plane,
  ShoppingCart,
  MessageSquare,
  Star,
  Brain,
  Languages,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";
import { trpc } from "@/lib/trpc";

// Import tab components
import DashboardTab from "@/components/admin/DashboardTab";
import ToursTab from "@/components/admin/ToursTab";
import BookingsTab from "@/components/admin/BookingsTab";
import InquiriesTab from "@/components/admin/InquiriesTab";
import ReviewsTab from "@/components/admin/ReviewsTab";
import SkillsTab from "@/components/admin/SkillsTab";
import TranslationsTab from "@/components/admin/TranslationsTab";

type AdminTab = "dashboard" | "tours" | "bookings" | "inquiries" | "reviews" | "skills" | "translations";

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get stats for badge counts
  const { data: statsData } = trpc.admin.getStats.useQuery();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [loading, isAuthenticated, setLocation]);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const navItems: { id: AdminTab; icon: React.ElementType; label: string; badge?: number }[] = [
    { id: "dashboard", icon: LayoutDashboard, label: t('admin.dashboard') },
    { id: "tours", icon: Plane, label: t('admin.tours'), badge: statsData?.activeTours },
    { id: "bookings", icon: ShoppingCart, label: t('admin.bookings') },
    { id: "inquiries", icon: MessageSquare, label: t('admin.inquiries'), badge: statsData?.pendingInquiries },
    { id: "reviews", icon: Star, label: t('admin.reviews') },
    { id: "skills", icon: Brain, label: t('admin.skills') },
    { id: "translations", icon: Languages, label: t('admin.translations') },
  ];

  const currentNavItem = navItems.find(item => item.id === activeTab);

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Sidebar Header */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">PACK&GO</p>
              <h2 className="text-lg font-bold text-gray-900">{t('admin.title')}</h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
              {(user?.name || "A").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || t('admin.administrator')}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-3 rounded-none text-sm font-medium
                  transition-all duration-150 group
                  ${isActive
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`
                    text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center
                    ${isActive ? "bg-white text-black" : "bg-gray-200 text-gray-700"}
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <button
            onClick={() => setLocation("/")}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-none text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <Home className="h-5 w-5 text-gray-400" />
            <span>{t('admin.backToHome')}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-none text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all"
          >
            <LogOut className="h-5 w-5 text-gray-400" />
            <span>{t('admin.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-none hover:bg-gray-100"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">{t('admin.title')}</span>
              <ChevronRight className="h-4 w-4 text-gray-300" />
              <span className="font-semibold text-gray-900">{currentNavItem?.label}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 lg:px-8 py-8 overflow-auto">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "tours" && <ToursTab />}
          {activeTab === "bookings" && <BookingsTab />}
          {activeTab === "inquiries" && <InquiriesTab />}
          {activeTab === "reviews" && <ReviewsTab />}
          {activeTab === "skills" && <SkillsTab />}
          {activeTab === "translations" && <TranslationsTab />}
        </main>
      </div>
    </div>
  );
}
