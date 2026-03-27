/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RefreshCw, CheckCircle2, AlertCircle, Clock,
  Zap, DollarSign, ChevronDown, ChevronRight, FileText
} from "lucide-react";

// Task type label mapping
const TASK_LABELS: Record<string, string> = {
  tour_generation:  "行程生成",
  ai_chat:          "AI 諮詢",
  skill_learning:   "技能學習",
  translation:      "翻譯",
  image_analysis:   "圖片分析",
  data_extraction:  "資料擷取",
};

function taskLabel(type: string | null) {
  if (!type) return "其他";
  return TASK_LABELS[type] ?? type;
}

function StatusBadge({ success }: { success: boolean }) {
  return success ? (
    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5">
      <CheckCircle2 className="h-3 w-3" /> 成功
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-0.5">
      <AlertCircle className="h-3 w-3" /> 失敗
    </span>
  );
}

function SessionCard({ session }: { session: any }) {
  const [expanded, setExpanded] = useState(false);

  const totalCost = session.logs?.reduce(
    (sum: number, l: any) => sum + parseFloat(l.estimatedCostUsd ?? "0"), 0
  ) ?? 0;
  const totalTokens = session.logs?.reduce(
    (sum: number, l: any) => sum + (l.inputTokens ?? 0) + (l.outputTokens ?? 0), 0
  ) ?? 0;
  const totalMs = session.logs?.reduce(
    (sum: number, l: any) => sum + (l.processingTimeMs ?? 0), 0
  ) ?? 0;

  const agentNames = Array.from(new Set((session.logs ?? []).map((l: any) =>
    l.agentName?.replace(/Agent$/i, "") ?? "Unknown"
  )));

  return (
    <div className="border border-gray-200 bg-white">
      {/* Card Header */}
      <button
        className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="mt-0.5">
          {expanded
            ? <ChevronDown className="h-4 w-4 text-gray-400" />
            : <ChevronRight className="h-4 w-4 text-gray-400" />
          }
        </div>

        {/* Task type + time */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">
              {taskLabel(session.taskType)}
            </span>
            <Badge variant="outline" className="text-xs font-normal rounded-none border-gray-300">
              {session.logs?.length ?? 0} 次呼叫
            </Badge>
            {agentNames.slice(0, 3).map((name: any, i: number) => (
              <span key={i} className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5">
                {name}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {new Date(session.startedAt).toLocaleString("zh-TW", {
              month: "2-digit", day: "2-digit",
              hour: "2-digit", minute: "2-digit", second: "2-digit"
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 text-xs text-gray-600 shrink-0">
          <div className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-gray-400" />
            {(totalTokens / 1000).toFixed(1)}K tokens
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            {(totalMs / 1000).toFixed(1)}s
          </div>
          <div className="flex items-center gap-1 font-medium text-gray-900">
            <DollarSign className="h-3.5 w-3.5 text-gray-400" />
            ${totalCost.toFixed(5)}
          </div>
        </div>
      </button>

      {/* Expanded: per-call log rows */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Summary report banner */}
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">任務摘要報告</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-gray-400">任務類型</div>
                <div className="font-medium text-gray-800">{taskLabel(session.taskType)}</div>
              </div>
              <div>
                <div className="text-gray-400">參與 Agent</div>
                <div className="font-medium text-gray-800">{agentNames.join("、") || "—"}</div>
              </div>
              <div>
                <div className="text-gray-400">總 Token 消耗</div>
                <div className="font-medium text-gray-800">{totalTokens.toLocaleString()} tokens</div>
              </div>
              <div>
                <div className="text-gray-400">總費用 (USD)</div>
                <div className="font-medium text-gray-800">${totalCost.toFixed(5)}</div>
              </div>
              <div>
                <div className="text-gray-400">總耗時</div>
                <div className="font-medium text-gray-800">{(totalMs / 1000).toFixed(1)} 秒</div>
              </div>
              <div>
                <div className="text-gray-400">呼叫次數</div>
                <div className="font-medium text-gray-800">{session.logs?.length ?? 0} 次</div>
              </div>
              <div>
                <div className="text-gray-400">快取命中</div>
                <div className="font-medium text-gray-800">
                  {session.logs?.filter((l: any) => l.wasFromCache).length ?? 0} 次
                </div>
              </div>
              <div>
                <div className="text-gray-400">開始時間</div>
                <div className="font-medium text-gray-800">
                  {new Date(session.startedAt).toLocaleTimeString("zh-TW")}
                </div>
              </div>
            </div>
          </div>

          {/* Per-call detail rows */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="text-left px-5 py-2 text-gray-400 font-medium uppercase tracking-wide">Agent</th>
                <th className="text-left px-3 py-2 text-gray-400 font-medium uppercase tracking-wide">模型</th>
                <th className="text-right px-3 py-2 text-gray-400 font-medium uppercase tracking-wide">Input</th>
                <th className="text-right px-3 py-2 text-gray-400 font-medium uppercase tracking-wide">Output</th>
                <th className="text-right px-3 py-2 text-gray-400 font-medium uppercase tracking-wide">費用</th>
                <th className="text-center px-3 py-2 text-gray-400 font-medium uppercase tracking-wide">快取</th>
                <th className="text-right px-3 py-2 text-gray-400 font-medium uppercase tracking-wide">耗時</th>
              </tr>
            </thead>
            <tbody>
              {session.logs?.map((log: any, i: number) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-2 text-gray-700">
                    {log.agentName?.replace(/Agent$/i, "") ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-500">
                    {log.model?.split("-").slice(-2).join("-") ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600">
                    {log.inputTokens?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600">
                    {log.outputTokens?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900">
                    ${parseFloat(log.estimatedCostUsd ?? "0").toFixed(5)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {log.wasFromCache
                      ? <span className="text-green-600 font-medium">✓</span>
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-3 py-2 text-right text-gray-500">
                    {log.processingTimeMs ? `${(log.processingTimeMs / 1000).toFixed(1)}s` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AiSessionReport() {
  const [days, setDays] = useState(7);

  const { data, isLoading, refetch } = trpc.admin.getLlmStats.useQuery({ days }, {
    staleTime: 1000 * 60 * 5,
  });

  // Group logs by taskType + approximate session (within 5 min window)
  const sessions = (() => {
    if (!data?.recentLogs?.length) return [];
    const sorted = [...data.recentLogs].sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const groups: any[] = [];
    let current: any = null;

    for (const log of sorted) {
      const logTime = new Date(log.createdAt).getTime();
      if (
        !current ||
        current.taskType !== log.taskType ||
        logTime - current.lastTime > 5 * 60 * 1000
      ) {
        current = {
          taskType: log.taskType,
          startedAt: log.createdAt,
          lastTime: logTime,
          logs: [log],
        };
        groups.push(current);
      } else {
        current.logs.push(log);
        current.lastTime = logTime;
      }
    }
    return groups.reverse(); // newest first
  })();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">AI 任務使用摘要</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            每次 AI 任務完成後自動產生報告，點擊展開查看詳細呼叫記錄
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200">
            {[3, 7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === d ? "bg-black text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {d}天
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="rounded-none border-gray-200" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Session list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          載入中...
        </div>
      ) : sessions.length === 0 ? (
        <div className="border border-dashed border-gray-200 py-16 text-center">
          <FileText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">近 {days} 天無 AI 任務記錄</p>
          <p className="text-xs text-gray-300 mt-1">每次使用 AI 功能後，報告將自動出現在這裡</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session, i) => (
            <SessionCard key={i} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
