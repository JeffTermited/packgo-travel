import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Eye, MessageSquare, Phone, Mail, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

type InquiryStatus = "new" | "in_progress" | "replied" | "resolved" | "closed";

export default function InquiriesTab() {
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">("all");
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data: inquiries, isLoading } = trpc.inquiries.list.useQuery();
  const { data: selectedInquiry } = trpc.inquiries.getById.useQuery(
    { id: selectedInquiryId! },
    { enabled: !!selectedInquiryId }
  );

  const updateStatusMutation = trpc.inquiries.update.useMutation({
    onSuccess: () => {
      utils.inquiries.list.invalidate();
      utils.inquiries.getById.invalidate();
      toast.success("狀態已更新");
    },
    onError: (error) => {
      toast.error(`更新失敗：${error.message}`);
    },
  });

  const addMessageMutation = trpc.inquiries.addMessage.useMutation({
    onSuccess: () => {
      utils.inquiries.getById.invalidate();
      setReplyMessage("");
      toast.success("回覆已送出");
    },
    onError: (error) => {
      toast.error(`回覆失敗：${error.message}`);
    },
  });

  const handleStatusChange = (inquiryId: number, newStatus: InquiryStatus) => {
    updateStatusMutation.mutate({ id: inquiryId, status: newStatus });
  };

  const handleReply = () => {
    if (!selectedInquiryId || !replyMessage.trim()) return;
    addMessageMutation.mutate({
      inquiryId: selectedInquiryId,
      message: replyMessage,
    });
  };

  const handleViewDetails = (inquiryId: number) => {
    setSelectedInquiryId(inquiryId);
    setIsDetailDialogOpen(true);
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      new: { label: "新諮詢", className: "bg-amber-100 text-amber-800 border border-amber-200" },
      in_progress: { label: "處理中", className: "bg-blue-100 text-blue-800 border border-blue-200" },
      replied: { label: "已回覆", className: "bg-purple-100 text-purple-800 border border-purple-200" },
      resolved: { label: "已解決", className: "bg-green-100 text-green-800 border border-green-200" },
      closed: { label: "已關閉", className: "bg-gray-100 text-gray-600 border border-gray-200" },
    };
    return config[status] || { label: status, className: "bg-gray-100 text-gray-600" };
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      general: "一般諮詢",
      custom_tour: "客製旅遊",
      booking: "預訂相關",
      complaint: "投訴建議",
    };
    return labels[type] || type;
  };

  const filteredInquiries =
    statusFilter === "all"
      ? inquiries
      : inquiries?.filter((inq) => inq.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">諮詢管理</h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {filteredInquiries?.length || 0} 筆諮詢
          </p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as InquiryStatus | "all")}
        >
          <SelectTrigger className="w-[160px] border-gray-300">
            <SelectValue placeholder="篩選狀態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部狀態</SelectItem>
            <SelectItem value="new">新諮詢</SelectItem>
            <SelectItem value="in_progress">處理中</SelectItem>
            <SelectItem value="replied">已回覆</SelectItem>
            <SelectItem value="resolved">已解決</SelectItem>
            <SelectItem value="closed">已關閉</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">載入中...</p>
          </div>
        ) : filteredInquiries && filteredInquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">客戶</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">類型</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">主旨</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">狀態</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">時間</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inquiry) => {
                  const statusConfig = getStatusConfig(inquiry.status);
                  return (
                    <tr key={inquiry.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-5">
                        <p className="font-semibold text-sm text-gray-900">{inquiry.customerName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{inquiry.customerEmail}</p>
                        {inquiry.customerPhone && (
                          <p className="text-xs text-gray-400">{inquiry.customerPhone}</p>
                        )}
                      </td>
                      <td className="px-5 py-5">
                        <span className="text-sm text-gray-600">{getTypeLabel(inquiry.inquiryType)}</span>
                      </td>
                      <td className="px-5 py-5 max-w-xs">
                        <p className="text-sm text-gray-900 truncate">{inquiry.subject}</p>
                      </td>
                      <td className="px-5 py-5">
                        <Select
                          value={inquiry.status}
                          onValueChange={(value) =>
                            handleStatusChange(inquiry.id, value as InquiryStatus)
                          }
                        >
                          <SelectTrigger className={`w-[110px] text-xs font-semibold h-8 ${statusConfig.className}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">新諮詢</SelectItem>
                            <SelectItem value="in_progress">處理中</SelectItem>
                            <SelectItem value="replied">已回覆</SelectItem>
                            <SelectItem value="resolved">已解決</SelectItem>
                            <SelectItem value="closed">已關閉</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(inquiry.createdAt), "MM/dd HH:mm", { locale: zhTW })}
                        </div>
                      </td>
                      <td className="px-5 py-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(inquiry.id)}
                          className="h-8 px-3 text-xs text-gray-600 hover:bg-gray-100"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          查看
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-gray-700 mb-1">尚無諮詢資料</h3>
            <p className="text-sm text-gray-400">當客戶提交諮詢後，資料將會顯示在這裡</p>
          </div>
        )}
      </div>

      {/* Inquiry Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>諮詢詳情</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-5 py-2">
              {/* Customer Info */}
              <div className="bg-gray-50 border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">客戶資訊</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">姓名</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{selectedInquiry.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">電話</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedInquiry.customerPhone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedInquiry.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">類型</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{getTypeLabel(selectedInquiry.inquiryType)}</p>
                  </div>
                </div>
              </div>

              {/* Subject and Message */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">主旨</p>
                <p className="text-sm font-semibold text-gray-900">{selectedInquiry.subject}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">訊息內容</p>
                <div className="bg-gray-50 border border-gray-200 p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedInquiry.message}</p>
                </div>
              </div>

              {/* Reply Section */}
              <div className="border-t border-gray-200 pt-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">回覆客戶</p>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="輸入回覆內容..."
                  rows={4}
                  className="mb-3 border-gray-300 text-sm"
                />
                <Button
                  onClick={handleReply}
                  disabled={addMessageMutation.isPending || !replyMessage.trim()}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {addMessageMutation.isPending ? "送出中..." : "送出回覆"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
