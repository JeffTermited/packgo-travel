import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Eye, Download, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function BookingsTab() {
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // TODO: Implement bookings query when backend is ready
  const bookings: any[] = [];
  const isLoading = false;

  const handleViewDetails = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">預訂管理</h2>
          <p className="text-sm text-gray-500 mt-1">共 {bookings.length} 筆預訂</p>
        </div>
        <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4 mr-2" />
          匯出報表
        </Button>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">載入中...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">訂單編號</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">客戶姓名</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">行程名稱</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">出發日期</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">人數</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">金額</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">付款狀態</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">訂單狀態</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody>
                {/* Booking rows will be mapped here */}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-gray-700 mb-1">尚無預訂資料</h3>
            <p className="text-sm text-gray-400">當客戶完成預訂後，訂單將會顯示在這裡</p>
          </div>
        )}
      </div>

      {/* Booking Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>預訂詳情</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">訂單編號</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">—</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">預訂時間</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">—</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 p-4">
              預訂管理功能將在後端 API 準備好後啟用
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
