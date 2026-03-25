/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area
} from "recharts";
import {
  TrendingUp, ShoppingCart, DollarSign, MessageSquare,
  RefreshCw, Users, BarChart2
} from "lucide-react";

const COLORS = ['#1a1a1a', '#555555', '#888888', '#aaaaaa', '#cccccc', '#e5e5e5'];
const CATEGORY_COLORS = ['#0f172a', '#1e3a5f', '#2563eb', '#60a5fa', '#bfdbfe'];

function StatCard({ title, value, sub, icon: Icon, highlight = false }: {
  title: string;
  value: string;
  sub?: string;
  icon: any;
  highlight?: boolean;
}) {
  return (
    <div className={`border p-5 ${highlight ? 'border-black bg-black text-white' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-sm font-medium ${highlight ? 'text-gray-300' : 'text-gray-500'}`}>{title}</span>
        <Icon className={`h-4 w-4 ${highlight ? 'text-gray-400' : 'text-gray-400'}`} />
      </div>
      <div className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>{value}</div>
      {sub && <div className={`text-xs mt-1 ${highlight ? 'text-gray-400' : 'text-gray-500'}`}>{sub}</div>}
    </div>
  );
}

const formatTWD = (amount: number) =>
  new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(amount);

export default function AnalyticsTab() {
  const [days, setDays] = useState(30);

  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery(undefined, { staleTime: 1000 * 60 * 2 });
  const { data: analytics, isLoading: analyticsLoading, refetch } = trpc.admin.getAnalytics.useQuery({ days }, { staleTime: 1000 * 60 * 5 });

  const isLoading = statsLoading || analyticsLoading;

  const bookingChartData = useMemo(() => {
    if (!analytics?.bookingTrend) return [];
    return analytics.bookingTrend.map((d: any) => ({
      date: d.date,
      預訂數: d.bookings,
      營收: d.revenue,
    }));
  }, [analytics]);

  const categoryPieData = useMemo(() => {
    if (!analytics?.tourCategoryDist) return [];
    return analytics.tourCategoryDist.filter((d: any) => d.value > 0);
  }, [analytics]);

  const inquiryPieData = useMemo(() => {
    if (!analytics?.inquiryStatusDist) return [];
    return analytics.inquiryStatusDist.filter((d: any) => d.value > 0);
  }, [analytics]);

  const topToursData = useMemo(() => {
    if (!analytics?.topTours) return [];
    return analytics.topTours.slice(0, 8).map((t: any) => ({
      name: t.title?.length > 16 ? t.title.slice(0, 16) + '…' : t.title,
      fullTitle: t.title,
      預訂數: t.bookingCount,
      營收: t.revenue,
    }));
  }, [analytics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-2" />
        <span className="text-gray-500">載入數據中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">數據分析</h2>
          <p className="text-sm text-gray-500 mt-0.5">業務概覽與趨勢分析</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200">
            {[7, 14, 30, 60, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  days === d ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {d}天
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="rounded-none" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="總預訂數"
          value={(stats?.totalBookings ?? 0).toLocaleString()}
          sub={`今日 +${stats?.todayBookings ?? 0}`}
          icon={ShoppingCart}
          highlight
        />
        <StatCard
          title="本月營收"
          value={formatTWD(stats?.thisMonthRevenue ?? 0)}
          sub={`${(stats?.revenueGrowth ?? 0) >= 0 ? '+' : ''}${(stats?.revenueGrowth ?? 0).toFixed(1)}% 較上月`}
          icon={DollarSign}
        />
        <StatCard
          title="上架行程"
          value={(stats?.activeTours ?? 0).toString()}
          sub={`共 ${stats?.totalTours ?? 0} 個行程`}
          icon={BarChart2}
        />
        <StatCard
          title="待處理諮詢"
          value={(stats?.pendingInquiries ?? 0).toString()}
          sub={`共 ${stats?.totalInquiries ?? 0} 筆`}
          icon={MessageSquare}
        />
        <StatCard
          title="會員數"
          value={(stats?.totalUsers ?? 0).toLocaleString()}
          sub="已註冊用戶"
          icon={Users}
        />
        <StatCard
          title="電子報訂閱"
          value={(stats?.totalSubscribers ?? 0).toLocaleString()}
          sub="有效訂閱者"
          icon={TrendingUp}
        />
      </div>

      {/* Booking & Revenue Trend */}
      <div className="border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">預訂與營收趨勢（近 {days} 天）</h3>
        {bookingChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={bookingChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(v: any, name: string) => [
                  name === '營收' ? formatTWD(v) : v,
                  name
                ]}
              />
              <Legend />
              <Area yAxisId="right" type="monotone" dataKey="營收" fill="#e5e7eb" stroke="#9ca3af" strokeWidth={1.5} />
              <Bar yAxisId="left" dataKey="預訂數" fill="#1a1a1a" barSize={6} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
            近 {days} 天無預訂資料
          </div>
        )}
      </div>

      {/* Category & Inquiry Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tour Category Distribution */}
        <div className="border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">行程分類分佈</h3>
          {categoryPieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={categoryPieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" nameKey="name">
                    {categoryPieData.map((_: any, i: number) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [v, '行程數']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryPieData.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">無行程資料</div>
          )}
        </div>

        {/* Inquiry Status Distribution */}
        <div className="border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">諮詢狀態分佈</h3>
          {inquiryPieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={inquiryPieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" nameKey="name">
                    {inquiryPieData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [v, '筆數']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {inquiryPieData.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">無諮詢資料</div>
          )}
        </div>
      </div>

      {/* Top Tours by Bookings */}
      <div className="border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">熱門行程排行（依預訂數）</h3>
        {topToursData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topToursData} layout="vertical" margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip
                formatter={(v: any, name: string) => [
                  name === '營收' ? formatTWD(v) : v,
                  name
                ]}
                labelFormatter={(label: string) => {
                  const item = topToursData.find((t: any) => t.name === label);
                  return item?.fullTitle ?? label;
                }}
              />
              <Legend />
              <Bar dataKey="預訂數" fill="#1a1a1a" barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">
            尚無預訂資料
          </div>
        )}
      </div>

      {/* Top Tours Revenue Table */}
      {analytics?.topTours && analytics.topTours.length > 0 && (
        <div className="border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">熱門行程詳細資料</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">排名</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">行程名稱</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 uppercase">預訂數</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 uppercase">總營收</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 uppercase">平均客單價</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topTours.map((tour: any, i: number) => (
                  <tr key={tour.tourId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-500 font-medium">#{i + 1}</td>
                    <td className="px-4 py-2.5 text-gray-900 font-medium max-w-[300px] truncate">{tour.title}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{tour.bookingCount}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{formatTWD(tour.revenue)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-600">
                      {tour.bookingCount > 0 ? formatTWD(Math.round(tour.revenue / tour.bookingCount)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
