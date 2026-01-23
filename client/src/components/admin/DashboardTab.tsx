import { trpc } from "@/lib/trpc";
import { Users, Plane, ShoppingCart, MessageSquare, DollarSign, TrendingUp } from "lucide-react";

export default function DashboardTab() {
  const { data: statsData, isLoading } = trpc.admin.getStats.useQuery();

  // Format currency
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
      value: isLoading ? "..." : statsData?.todayBookings.toString() || "0",
      icon: ShoppingCart,
      change: "+0%",
      changeType: "positive" as const,
    },
    {
      title: "本月營收",
      value: isLoading ? "..." : formatCurrency(statsData?.thisMonthRevenue || 0),
      icon: DollarSign,
      change: isLoading ? "..." : `${statsData?.revenueGrowth.toFixed(1)}%`,
      changeType: (statsData?.revenueGrowth || 0) >= 0 ? "positive" as const : "negative" as const,
    },
    {
      title: "待處理諮詢",
      value: isLoading ? "..." : statsData?.pendingInquiries.toString() || "0",
      icon: MessageSquare,
      change: isLoading ? "..." : `共 ${statsData?.totalInquiries || 0} 筆`,
      changeType: "neutral" as const,
    },
    {
      title: "行程總數",
      value: isLoading ? "..." : statsData?.totalTours.toString() || "0",
      icon: Plane,
      change: isLoading ? "..." : `${statsData?.activeTours || 0} 個上架中`,
      changeType: "neutral" as const,
    },
  ];

  const newInquiries = statsData?.pendingInquiries || 0;
  const activeTours = statsData?.activeTours || 0;

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-3xl border-2 border-gray-200 p-6 hover:border-black transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Icon className="h-6 w-6 text-gray-700" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
              <p
                className={`text-sm ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : "text-gray-600"
                }`}
              >
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl border-2 border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-black hover:bg-gray-100 transition-all duration-200 text-left">
            <Plane className="h-8 w-8 text-gray-700 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">新增行程</h3>
            <p className="text-sm text-gray-600">建立新的旅遊行程</p>
          </button>
          <button className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-black hover:bg-gray-100 transition-all duration-200 text-left">
            <MessageSquare className="h-8 w-8 text-gray-700 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">查看待處理諮詢</h3>
            <p className="text-sm text-gray-600">處理客戶諮詢</p>
          </button>
          <button className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-black hover:bg-gray-100 transition-all duration-200 text-left">
            <TrendingUp className="h-8 w-8 text-gray-700 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">查看營收報表</h3>
            <p className="text-sm text-gray-600">分析業務數據</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border-2 border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">最新動態</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="p-2 bg-white rounded-full">
              <MessageSquare className="h-5 w-5 text-gray-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                {newInquiries > 0 ? `有 ${newInquiries} 筆新的客戶諮詢待處理` : "目前沒有待處理的諮詢"}
              </p>
              <p className="text-xs text-gray-500 mt-1">剛剛</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="p-2 bg-white rounded-full">
              <Plane className="h-5 w-5 text-gray-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                目前有 {activeTours} 個行程正在上架中
              </p>
              <p className="text-xs text-gray-500 mt-1">今天</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
