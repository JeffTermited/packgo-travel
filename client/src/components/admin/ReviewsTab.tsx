import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReviewsTab() {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // TODO: Implement reviews query when backend is ready
  const reviews: any[] = [];
  const isLoading = false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">評價管理</h2>
          <p className="text-sm text-gray-500 mt-1">共 {reviews.length} 則評價</p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: any) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[160px] border-gray-300">
            <SelectValue placeholder="篩選狀態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部狀態</SelectItem>
            <SelectItem value="pending">待審核</SelectItem>
            <SelectItem value="approved">已通過</SelectItem>
            <SelectItem value="rejected">已拒絕</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews Table */}
      <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">載入中...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">客戶姓名</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">行程名稱</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">評分</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">評價內容</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">狀態</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody>
                {/* Review rows will be mapped here */}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <Star className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-gray-700 mb-1">尚無評價資料</h3>
            <p className="text-sm text-gray-400">當客戶提交評價後，資料將會顯示在這裡</p>
          </div>
        )}
      </div>

      {/* Review Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>評價詳情</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">客戶姓名</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">—</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">行程名稱</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">—</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">評分</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">評價內容</p>
              <div className="bg-gray-50 border border-gray-200 p-4">
                <p className="text-sm text-gray-700">—</p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">審核操作</p>
              <Textarea
                placeholder="輸入管理員回覆..."
                rows={3}
                className="mb-3 border-gray-300 text-sm"
              />
              <div className="flex gap-2">
                <Button className="bg-black text-white hover:bg-gray-800 text-sm">
                  通過審核
                </Button>
                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 text-sm">
                  拒絕評價
                </Button>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">
                  設為精選
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-400 bg-gray-50 border border-gray-200 p-3">
              評價管理功能將在後端 API 準備好後啟用
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
