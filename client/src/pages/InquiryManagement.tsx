import { useAuth } from "@/_core/hooks/useAuth";
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
import { Home, LogOut, MessageSquare, Eye } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

type InquiryStatus = "new" | "in_progress" | "replied" | "resolved" | "closed";

export default function InquiryManagement() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
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

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

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

  if (loading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  const filteredInquiries =
    statusFilter === "all"
      ? inquiries
      : inquiries?.filter((inq) => inq.status === statusFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">諮詢管理後台</h1>
            <p className="text-sm text-gray-600">客戶諮詢與客製旅遊管理系統</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-black">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/")}
              className="border-black hover:bg-black hover:text-white rounded-full"
            >
              <Home className="h-4 w-4 mr-2" />
              返回首頁
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-black hover:bg-black hover:text-white rounded-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              登出
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-black">諮詢列表</h2>
            <p className="text-sm text-gray-600">
              共 {filteredInquiries?.length || 0} 筆諮詢
            </p>
          </div>
          <div className="flex items-center gap-4">
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
        </div>

        {/* Inquiries Table */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      編號
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      類型
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      客戶資訊
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      主旨
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      狀態
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      建立時間
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">#{inquiry.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getTypeLabel(inquiry.inquiryType)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{inquiry.customerName}</p>
                          <p className="text-gray-500">{inquiry.customerEmail}</p>
                          {inquiry.customerPhone && (
                            <p className="text-gray-500">{inquiry.customerPhone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {inquiry.subject}
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(new Date(inquiry.createdAt), "yyyy/MM/dd HH:mm", {
                          locale: zhTW,
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInquiryId(inquiry.id);
                            setIsDetailDialogOpen(true);
                          }}
                          className="rounded-full"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">目前沒有諮詢記錄</p>
            </div>
          )}
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>諮詢詳情 #{selectedInquiry?.id}</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">客戶資訊</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">姓名：</span>
                    <span className="text-gray-900 font-medium">
                      {selectedInquiry.customerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">電話：</span>
                    <span className="text-gray-900">{selectedInquiry.customerPhone || "未提供"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Email：</span>
                    <span className="text-gray-900">{selectedInquiry.customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Inquiry Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">諮詢內容</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">類型：</span>
                    <span className="text-gray-900 font-medium">
                      {getTypeLabel(selectedInquiry.inquiryType)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">主旨：</span>
                    <span className="text-gray-900 font-medium">{selectedInquiry.subject}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-2">詳細內容：</span>
                    <p className="text-gray-900 bg-gray-50 rounded-2xl p-4 whitespace-pre-wrap">
                      {selectedInquiry.message}
                    </p>
                  </div>
                  {selectedInquiry.destination && (
                    <div>
                      <span className="text-gray-600">目的地：</span>
                      <span className="text-gray-900">{selectedInquiry.destination}</span>
                    </div>
                  )}
                  {selectedInquiry.numberOfDays && (
                    <div>
                      <span className="text-gray-600">天數：</span>
                      <span className="text-gray-900">{selectedInquiry.numberOfDays} 天</span>
                    </div>
                  )}
                  {selectedInquiry.numberOfPeople && (
                    <div>
                      <span className="text-gray-600">人數：</span>
                      <span className="text-gray-900">{selectedInquiry.numberOfPeople} 人</span>
                    </div>
                  )}
                  {selectedInquiry.budget && (
                    <div>
                      <span className="text-gray-600">預算：</span>
                      <span className="text-gray-900">TWD {selectedInquiry.budget.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedInquiry.preferredDepartureDate && (
                    <div>
                      <span className="text-gray-600">預計出發日期：</span>
                      <span className="text-gray-900">
                        {format(new Date(selectedInquiry.preferredDepartureDate), "yyyy/MM/dd", {
                          locale: zhTW,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reply Section */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">回覆客戶</h4>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="輸入回覆訊息..."
                  rows={4}
                  className="rounded-2xl mb-3"
                />
                <Button
                  onClick={handleReply}
                  disabled={!replyMessage.trim() || addMessageMutation.isPending}
                  className="rounded-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
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
