import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Bot,
  ListChecks,
  AlertTriangle,
  Timer,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";

type StatusType = "started" | "completed" | "failed" | "idle";

const STATUS_CONFIG: Record<StatusType, { label: string; color: string; icon: React.ReactNode }> = {
  completed: {
    label: "已完成",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  failed: {
    label: "失敗",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  started: {
    label: "執行中",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  },
  idle: {
    label: "閒置",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
};

function formatDuration(ms: number | null | undefined): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const AGENT_NAME_MAP: Record<string, string> = {
  MasterAgent: "主控 Agent",
  ItineraryAgent: "行程生成 Agent",
  ContentAnalyzerAgent: "內容分析 Agent",
  ImageSearchAgent: "圖片搜尋 Agent",
  TranslationAgent: "翻譯 Agent",
  SkillLearnerAgent: "技能學習 Agent",
  ClaudeAgent: "Claude Agent",
  ExchangeRateAgent: "匯率 Agent",
};

function getAgentDisplayName(name: string): string {
  return AGENT_NAME_MAP[name] || name;
}

export default function TaskHistory() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [page, setPage] = useState(1);
  const [agentFilter, setAgentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Redirect non-admin users
  if (!authLoading && (!user || user.role !== "admin")) {
    navigate("/");
    return null;
  }

  const { data, isLoading, refetch, isFetching } = (trpc as any).admin.getTaskHistory.useQuery(
    {
      page,
      limit: 30,
      agentName: agentFilter || undefined,
      status: (statusFilter as StatusType) || undefined,
    },
    { refetchInterval: 30000 }
  );

  const handleFilterChange = () => {
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header />

      <main className="flex-grow">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <ListChecks className="h-7 w-7 text-primary" />
                  AI 任務執行記錄
                </h1>
                <p className="text-gray-500 mt-1 text-sm">查看所有 AI Agent 的任務執行歷史與狀態</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="self-start sm:self-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                重新整理
              </Button>
            </div>

            {/* Summary Stats */}
            {data?.summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Bot className="h-3.5 w-3.5" />
                    總任務數
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {data.summary.totalTasks.toLocaleString()}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-100">
                  <div className="flex items-center gap-2 text-green-600 text-xs mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    已完成
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-green-700">
                    {data.summary.completedTasks.toLocaleString()}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-100">
                  <div className="flex items-center gap-2 text-red-600 text-xs mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    失敗
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-red-700">
                    {data.summary.failedTasks.toLocaleString()}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-600 text-xs mb-1">
                    <Timer className="h-3.5 w-3.5" />
                    平均耗時
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-700">
                    {formatDuration(data.summary.avgProcessingMs)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              篩選：
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); handleFilterChange(); }}
            >
              <SelectTrigger className="w-full sm:w-36 h-9 text-sm">
                <SelectValue placeholder="所有狀態" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有狀態</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="failed">失敗</SelectItem>
                <SelectItem value="started">執行中</SelectItem>
                <SelectItem value="idle">閒置</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={agentFilter}
              onValueChange={(v) => { setAgentFilter(v === "all" ? "" : v); handleFilterChange(); }}
            >
              <SelectTrigger className="w-full sm:w-48 h-9 text-sm">
                <SelectValue placeholder="所有 Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有 Agent</SelectItem>
                {Object.entries(AGENT_NAME_MAP).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(statusFilter || agentFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStatusFilter(""); setAgentFilter(""); setPage(1); }}
                className="text-gray-500 h-9"
              >
                清除篩選
              </Button>
            )}
          </div>
        </div>

        {/* Task List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !data?.logs.length ? (
            <div className="text-center py-20 text-gray-400">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">尚無任務記錄</p>
              <p className="text-sm mt-1">AI Agent 執行任務後，記錄將顯示於此</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(data.logs as any[]).map((log: any) => {
                const statusCfg = STATUS_CONFIG[log.status as StatusType] ?? STATUS_CONFIG.idle;
                const isExpanded = expandedId === log.id;

                return (
                  <div
                    key={log.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    {/* Row */}
                    <button
                      className="w-full text-left px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Status Icon */}
                        <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${statusCfg.color}`}>
                          {statusCfg.icon}
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm truncate max-w-xs sm:max-w-none">
                              {log.taskTitle || log.taskType || "未命名任務"}
                            </span>
                            <Badge variant="outline" className={`text-xs px-2 py-0 border ${statusCfg.color}`}>
                              {statusCfg.label}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Bot className="h-3 w-3" />
                              {getAgentDisplayName(log.agentName)}
                            </span>
                            {log.taskType && (
                              <span className="text-gray-400">{log.taskType}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDateTime(log.startedAt)}
                            </span>
                            {log.processingTimeMs && (
                              <span className="flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                {formatDuration(log.processingTimeMs)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expand Arrow */}
                        <ChevronRight
                          className={`h-4 w-4 text-gray-400 flex-shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </div>
                    </button>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="px-4 sm:px-6 pb-4 border-t border-gray-100 bg-gray-50">
                        <div className="pt-4 space-y-3 text-sm">
                          {log.taskId && (
                            <div>
                              <span className="text-gray-500 font-medium">任務 ID：</span>
                              <span className="text-gray-700 font-mono text-xs">{log.taskId}</span>
                            </div>
                          )}
                          {log.completedAt && (
                            <div>
                              <span className="text-gray-500 font-medium">完成時間：</span>
                              <span className="text-gray-700">{formatDateTime(log.completedAt)}</span>
                            </div>
                          )}
                          {log.resultSummary && (
                            <div>
                              <span className="text-gray-500 font-medium block mb-1">執行結果摘要：</span>
                              <p className="text-gray-700 bg-white rounded border border-gray-200 p-3 leading-relaxed">
                                {log.resultSummary}
                              </p>
                            </div>
                          )}
                          {log.errorMessage && (
                            <div>
                              <span className="text-red-600 font-medium block mb-1">錯誤訊息：</span>
                              <p className="text-red-700 bg-red-50 rounded border border-red-200 p-3 font-mono text-xs leading-relaxed">
                                {log.errorMessage}
                              </p>
                            </div>
                          )}
                          {!log.resultSummary && !log.errorMessage && (
                            <p className="text-gray-400 italic">無詳細記錄</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                共 {data.pagination.total.toLocaleString()} 筆記錄，第 {page} / {data.pagination.totalPages} 頁
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一頁
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page >= data.pagination.totalPages}
                >
                  下一頁
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
