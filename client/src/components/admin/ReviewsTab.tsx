import { Button } from "@/components/ui/button";
import { Star, Eye } from "lucide-react";
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
  const reviews = [];
  const isLoading = false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">評價管理</h2>
          <p className="text-sm text-gray-600 mt-1">共 {reviews.length} 則評價</p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: any) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px] rounded-full">
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
      <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客戶姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    行程名稱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    評分
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    評價內容
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    精選
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Review rows will be mapped here */}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Star className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">尚無評價資料</h3>
            <p className="text-sm text-gray-600">當客戶提交評價後，資料將會顯示在這裡</p>
          </div>
        )}
      </div>

      {/* Review Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>評價詳情</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">客戶姓名</p>
                <p className="font-medium">-</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">行程名稱</p>
                <p className="font-medium">-</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">評分</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">評價內容</p>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-sm">-</p>
              </div>
            </div>
            <div className="border-t pt-6">
              <p className="text-sm font-medium text-gray-900 mb-3">管理員回覆</p>
              <Textarea
                placeholder="輸入回覆內容..."
                rows={4}
                className="rounded-2xl mb-3"
              />
              <div className="flex gap-3">
                <Button className="bg-green-600 text-white hover:bg-green-700 rounded-full">
                  通過審核
                </Button>
                <Button className="bg-red-600 text-white hover:bg-red-700 rounded-full">
                  拒絕評價
                </Button>
                <Button className="bg-yellow-600 text-white hover:bg-yellow-700 rounded-full">
                  設為精選
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              評價管理功能將在後端 API 準備好後啟用
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
