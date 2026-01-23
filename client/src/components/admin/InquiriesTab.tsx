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
import { Eye } from "lucide-react";
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: "新諮詢",
      in_progress: "處理中",
      replied: "已回覆",
      resolved: "已解決",
      closed: "已關閉",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      replied: "bg-purple-100 text-purple-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">諮詢管理</h2>
          <p className="text-sm text-gray-600 mt-1">
            共 {filteredInquiries?.length || 0} 筆諮詢
          </p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as InquiryStatus | "all")}
        >
          <SelectTrigger className="w-[180px] rounded-full">
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
      <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        ) : filteredInquiries && filteredInquiries.length > 0 ? (
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
                    聯絡方式
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    類型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    主旨
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    建立時間
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inquiry.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inquiry.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{inquiry.customerEmail}</div>
                      <div className="text-xs text-gray-500">{inquiry.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getTypeLabel(inquiry.inquiryType)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {inquiry.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={inquiry.status}
                        onValueChange={(value) =>
                          handleStatusChange(inquiry.id, value as InquiryStatus)
                        }
                      >
                        <SelectTrigger
                          className={`w-[120px] rounded-full ${getStatusColor(inquiry.status)}`}
                        >
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(inquiry.createdAt), "yyyy/MM/dd HH:mm", {
                        locale: zhTW,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(inquiry.id)}
                        className="rounded-full"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">尚無諮詢資料</h3>
            <p className="text-sm text-gray-600">當客戶提交諮詢後，資料將會顯示在這裡</p>
          </div>
        )}
      </div>

      {/* Inquiry Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>諮詢詳情</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">客戶姓名</p>
                  <p className="font-medium">{selectedInquiry.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">聯絡電話</p>
                  <p className="font-medium">{selectedInquiry.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">電子郵件</p>
                  <p className="font-medium">{selectedInquiry.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">諮詢類型</p>
                  <p className="font-medium">{getTypeLabel(selectedInquiry.inquiryType)}</p>
                </div>
              </div>

              {/* Subject and Message */}
              <div>
                <p className="text-sm text-gray-600 mb-2">主旨</p>
                <p className="font-medium">{selectedInquiry.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">訊息內容</p>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>

              {/* Reply Section */}
              <div className="border-t pt-6">
                <p className="text-sm font-medium text-gray-900 mb-3">管理員回覆</p>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="輸入回覆內容..."
                  rows={4}
                  className="rounded-2xl mb-3"
                />
                <Button
                  onClick={handleReply}
                  disabled={addMessageMutation.isPending || !replyMessage.trim()}
                  className="bg-black text-white hover:bg-gray-800 rounded-full"
                >
                  {addMessageMutation.isPending ? "送出中..." : "送出回覆"}
                </Button>
              </div>

              {/* Conversation History - TODO: Implement when backend supports messages */}
              <div className="border-t pt-6">
                <p className="text-sm text-gray-600">對話記錄功能將在後端 API 準備好後啟用</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
