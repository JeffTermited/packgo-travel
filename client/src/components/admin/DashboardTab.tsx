import { trpc } from "@/lib/trpc";
import { Users, Plane, ShoppingCart, MessageSquare, DollarSign, TrendingUp, ArrowRight, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function DashboardTab() {
  const { data: statsData, isLoading } = trpc.admin.getStats.useQuery();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: "今日預訂",
      value: isLoading ? "—" : (statsData?.todayBookings ?? 0).toString(),
      sub: "筆新訂單",
      icon: ShoppingCart,
      accent: "text-gray-900",
    },
    {
      title: "本月營收",
      value: isLoading ? "—" : formatCurrency(statsData?.thisMonthRevenue || 0),
      sub: isLoading ? "" : `${(statsData?.revenueGrowth ?? 0) >= 0 ? "+" : ""}${(statsData?.revenueGrowth ?? 0).toFixed(1)}% 較上月`,
      icon: DollarSign,
      accent: (statsData?.revenueGrowth ?? 0) >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "待處理諮詢",
      value: isLoading ? "—" : (statsData?.pendingInquiries ?? 0).toString(),
      sub: isLoading ? "" : `共 ${statsData?.totalInquiries || 0} 筆`,
      icon: MessageSquare,
      accent: (statsData?.pendingInquiries ?? 0) > 0 ? "text-amber-600" : "text-gray-500",
    },
    {
      title: "上架行程",
      value: isLoading ? "—" : (statsData?.activeTours ?? 0).toString(),
      sub: isLoading ? "" : `共 ${statsData?.totalTours || 0} 個行程`,
      icon: Plane,
      accent: "text-gray-900",
    },
  ];

  const newInquiries = statsData?.pendingInquiries || 0;
  const activeTours = statsData?.activeTours || 0;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">總覽</h2>
        <p className="text-sm text-gray-500 mt-1">歡迎回來，以下是今日業務摘要</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                <Icon className="h-5 w-5 text-gray-300" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className={`text-xs font-medium ${stat.accent}`}>{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">待辦事項</h3>
          <div className="space-y-3">
            {newInquiries > 0 ? (
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-900">{newInquiries} 筆諮詢待回覆</p>
                  <p className="text-xs text-amber-700">請盡快處理客戶諮詢</p>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-600 flex-shrink-0" />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-medium text-green-900">所有諮詢已處理完畢</p>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200">
              <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activeTours} 個行程上架中</p>
                <p className="text-xs text-gray-500">共 {statsData?.totalTours || 0} 個行程</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">快速操作</h3>
          <div className="space-y-2">
            {[
              { icon: Plane, label: "新增行程", desc: "建立新的旅遊行程" },
              { icon: MessageSquare, label: "查看諮詢", desc: "處理客戶諮詢與回覆" },
              { icon: TrendingUp, label: "查看報表", desc: "分析業務數據" },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all text-left group"
                >
                  <Icon className="h-5 w-5 text-gray-400 group-hover:text-gray-700 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-500">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
