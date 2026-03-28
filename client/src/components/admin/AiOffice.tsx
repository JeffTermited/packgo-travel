/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI 員工辦公室
 * 每個 Agent 都有自己的辦公桌，顯示：
 * - 目前狀態（閒置 / 工作中 / 剛完成）
 * - 今日工作統計
 * - 最近任務彙報
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RefreshCw, CheckCircle2, AlertCircle, Clock, Zap,
  Crown, Search, FileSearch, FileText, Layers, Wrench,
  Pen, Plane, Train, Car, Hotel, UtensilsCrossed,
  DollarSign, AlertTriangle, Image, BookOpen, Palette,
  MessageCircle, ChevronDown, ChevronRight, Activity,
  Coffee, Briefcase
} from "lucide-react";

// ── Agent 定義 ────────────────────────────────────────────────────────────────
const AGENT_DEFS: Record<string, {
  name: string; title: string; icon: any; color: string; bg: string; dept: string;
}> = {
  MasterAgent:             { name: "MASTER",     title: "總指揮官",    icon: Crown,          color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200",  dept: "管理層" },
  ContentAnalyzerAgent:    { name: "ANALYZER",   title: "資料分析師",  icon: Search,         color: "text-purple-600", bg: "bg-purple-50 border-purple-200",  dept: "情報部" },
  ItineraryUnifiedAgent:   { name: "INTEGRATOR", title: "行程整合員",  icon: Layers,         color: "text-cyan-600",   bg: "bg-cyan-50 border-cyan-200",      dept: "產品部" },
  PdfParserAgent:          { name: "DOCREADER",  title: "文件解析師",  icon: FileText,       color: "text-slate-600",  bg: "bg-slate-50 border-slate-200",    dept: "情報部" },
  FlightAgent:             { name: "SKYDESK",    title: "機票專員",    icon: Plane,          color: "text-sky-600",    bg: "bg-sky-50 border-sky-200",        dept: "交通部" },
  TransportationAgent:     { name: "MOVEDESK",   title: "交通統籌員",  icon: Car,            color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",    dept: "交通部" },
  HotelAgent:              { name: "STAYDESK",   title: "住宿專員",    icon: Hotel,          color: "text-violet-600", bg: "bg-violet-50 border-violet-200",  dept: "住宿部" },
  MealAgent:               { name: "FOODDESK",   title: "餐飲顧問",    icon: UtensilsCrossed,color: "text-red-600",    bg: "bg-red-50 border-red-200",        dept: "服務部" },
  CostAgent:               { name: "FINDESK",    title: "費用計算師",  icon: DollarSign,     color: "text-green-600",  bg: "bg-green-50 border-green-200",    dept: "財務部" },
  NoticeAgent:             { name: "SAFEDESK",   title: "注意事項編輯",icon: AlertTriangle,  color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200",  dept: "服務部" },
  ImageGenerationAgent:    { name: "PIXELDESK",  title: "視覺設計師",  icon: Image,          color: "text-fuchsia-600",bg: "bg-fuchsia-50 border-fuchsia-200",dept: "行銷部" },
  PromptAgent:             { name: "PROMPTDESK", title: "提示工程師",  icon: Wrench,         color: "text-orange-600", bg: "bg-orange-50 border-orange-200",  dept: "行銷部" },
  ColorThemeAgent:         { name: "COLORDESK",  title: "色彩設計師",  icon: Palette,        color: "text-pink-600",   bg: "bg-pink-50 border-pink-200",      dept: "行銷部" },
  LearningAgent:           { name: "LEARNBOT",   title: "學習機器人",  icon: BookOpen,       color: "text-teal-600",   bg: "bg-teal-50 border-teal-200",      dept: "研發部" },
  SkillLearnerAgent:       { name: "SKILLBOT",   title: "技能學習員",  icon: BookOpen,       color: "text-teal-600",   bg: "bg-teal-50 border-teal-200",      dept: "研發部" },
  TranslationAgent:        { name: "TRANSLATOR", title: "翻譯員",      icon: MessageCircle,  color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",      dept: "服務部" },
  ClaudeAgent:             { name: "CLAUDE",     title: "通用 AI 助理",icon: Zap,            color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200",  dept: "服務部" },
  ImagePromptAgent:        { name: "IMGPROMPT",  title: "圖像提示師",  icon: Image,          color: "text-rose-600",   bg: "bg-rose-50 border-rose-200",      dept: "行銷部" },
};

function getAgentDef(agentName: string) {
  return AGENT_DEFS[agentName] ?? {
    name: agentName.replace(/Agent$/i, "").toUpperCase(),
    title: agentName,
    icon: Briefcase,
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
    dept: "其他",
  };
}

// ── 時間格式化 ────────────────────────────────────────────────────────────────
function timeAgo(date: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "剛剛";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分鐘前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小時前`;
  return d.toLocaleDateString("zh-TW");
}

function formatMs(ms: number | null): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── 活動日誌項目 ──────────────────────────────────────────────────────────────
function ActivityItem({ log }: { log: any }) {
  const isOk = log.status === "completed";
  const isFail = log.status === "failed";
  const isRunning = log.status === "started";

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 shrink-0">
        {isRunning && <Clock className="h-4 w-4 text-blue-500 animate-pulse" />}
        {isOk && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        {isFail && <AlertCircle className="h-4 w-4 text-red-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900 truncate">
            {log.taskTitle || log.taskType || "執行任務"}
          </span>
          {log.taskType && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 shrink-0">
              {TASK_LABELS[log.taskType] ?? log.taskType}
            </Badge>
          )}
        </div>
        {log.resultSummary && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{log.resultSummary}</p>
        )}
        {log.errorMessage && (
          <p className="text-xs text-red-500 mt-0.5 line-clamp-2">{log.errorMessage}</p>
        )}
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span>{timeAgo(log.startedAt)}</span>
          {log.processingTimeMs && <span>耗時 {formatMs(log.processingTimeMs)}</span>}
        </div>
      </div>
    </div>
  );
}

const TASK_LABELS: Record<string, string> = {
  tour_generation: "行程生成",
  ai_chat: "AI 諮詢",
  skill_learning: "技能學習",
  translation: "翻譯",
  pdf_parsing: "PDF 解析",
  customer_service: "客服",
  image_analysis: "圖片分析",
};

// ── 員工辦公桌卡片 ────────────────────────────────────────────────────────────
function DeskCard({
  agentName,
  stats,
  activities,
}: {
  agentName: string;
  stats?: { calls: number; totalTokens: number; lastActive: string | null };
  activities: any[];
}) {
  const [expanded, setExpanded] = useState(false);
  const def = getAgentDef(agentName);
  const Icon = def.icon;

  // 判斷目前狀態
  const recentActivity = activities[0];
  const isRunning = recentActivity?.status === "started" &&
    (Date.now() - new Date(recentActivity.startedAt).getTime()) < 5 * 60 * 1000;
  const justDone = recentActivity?.status === "completed" &&
    (Date.now() - new Date(recentActivity.completedAt ?? recentActivity.startedAt).getTime()) < 10 * 60 * 1000;

  const statusBadge = isRunning
    ? <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />工作中</span>
    : justDone
    ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />剛完成</span>
    : stats?.calls
    ? <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"><Coffee className="h-3 w-3" />今日有工作</span>
    : <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full"><Coffee className="h-3 w-3" />閒置</span>;

  return (
    <div className={`border rounded-lg overflow-hidden ${def.bg}`}>
      {/* 辦公桌頭部 */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white border ${def.bg.split(" ")[1]}`}>
              <Icon className={`h-5 w-5 ${def.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-sm">{def.name}</span>
                <span className="text-xs text-gray-400">{def.dept}</span>
              </div>
              <p className="text-xs text-gray-500">{def.title}</p>
            </div>
          </div>
          {statusBadge}
        </div>

        {/* 今日統計 */}
        {stats?.calls ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-white/70 rounded px-2 py-1.5 text-center">
              <div className="text-lg font-bold text-gray-900">{stats.calls}</div>
              <div className="text-xs text-gray-500">今日任務</div>
            </div>
            <div className="bg-white/70 rounded px-2 py-1.5 text-center">
              <div className="text-lg font-bold text-gray-900">{(stats.totalTokens / 1000).toFixed(1)}k</div>
              <div className="text-xs text-gray-500">Token 用量</div>
            </div>
          </div>
        ) : (
          <div className="mt-3 text-xs text-gray-400 text-center py-1">今日尚無工作記錄</div>
        )}
      </div>

      {/* 最近任務 */}
      {activities.length > 0 && (
        <div className="border-t border-white/60 bg-white/50">
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-600 hover:bg-white/70 transition-colors"
          >
            <span className="font-medium">今日工作記錄 ({activities.length})</span>
            {expanded
              ? <ChevronDown className="h-3.5 w-3.5" />
              : <ChevronRight className="h-3.5 w-3.5" />
            }
          </button>
          {expanded && (
            <div className="px-4 pb-3 max-h-64 overflow-y-auto">
              {activities.slice(0, 10).map((log: any) => (
                <ActivityItem key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 正在執行的任務橫幅 ────────────────────────────────────────────────────────
function ActiveTasksBanner({ tasks }: { tasks: any[] }) {
  if (!tasks.length) return null;
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
        <span className="text-sm font-semibold text-blue-800">正在執行中 ({tasks.length})</span>
      </div>
      <div className="space-y-1">
        {tasks.map((t: any) => {
          const def = getAgentDef(t.agentName);
          const Icon = def.icon;
          return (
            <div key={t.id} className="flex items-center gap-2 text-sm text-blue-700">
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium">{def.name}</span>
              <span className="text-blue-500">—</span>
              <span className="truncate">{t.taskTitle || t.taskType || "執行中…"}</span>
              <span className="text-xs text-blue-400 shrink-0 ml-auto">{timeAgo(t.startedAt)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export default function AiOffice() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data, isLoading, refetch, dataUpdatedAt } = (trpc as any).admin.getAgentOfficeStatus.useQuery(undefined, {
    refetchInterval: autoRefresh ? 30_000 : false,
  });

  // 把 todayActivities 按 agentName 分組
  const activitiesByAgent: Record<string, any[]> = {};
  (data?.todayActivities ?? []).forEach((a: any) => {
    if (!activitiesByAgent[a.agentName]) activitiesByAgent[a.agentName] = [];
    activitiesByAgent[a.agentName].push(a);
  });

  // 把 agentTodayStats 轉成 map
  const statsMap: Record<string, any> = {};
  (data?.agentTodayStats ?? []).forEach((s: any) => {
    statsMap[s.agentName] = s;
  });

  // 所有出現過的 Agent（有統計或有活動的）
  const allAgentNames = Array.from(new Set([
    ...Object.keys(statsMap),
    ...Object.keys(activitiesByAgent),
  ]));

  // 按部門分組
  const byDept: Record<string, string[]> = {};
  allAgentNames.forEach(name => {
    const dept = getAgentDef(name).dept;
    if (!byDept[dept]) byDept[dept] = [];
    byDept[dept].push(name);
  });

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("zh-TW") : "—";

  return (
    <div>
      {/* 頁面標題列 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">AI 員工辦公室</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            即時監控每位 AI 員工的工作狀態與今日任務彙報
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">最後更新 {lastUpdated}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            重新整理
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(v => !v)}
            className="gap-1.5 text-xs"
          >
            <Activity className="h-3.5 w-3.5" />
            {autoRefresh ? "自動更新中" : "自動更新"}
          </Button>
        </div>
      </div>

      {/* 正在執行的任務 */}
      <ActiveTasksBanner tasks={data?.activeTasks ?? []} />

      {/* 今日無任何活動 */}
      {!isLoading && allAgentNames.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Coffee className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">今日尚無 AI 員工工作記錄</p>
          <p className="text-xs mt-1">當 Agent 執行任務後，記錄將顯示在這裡</p>
        </div>
      )}

      {/* 按部門分組顯示辦公桌 */}
      {Object.entries(byDept).map(([dept, agents]) => (
        <div key={dept} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold text-gray-700">{dept}</h4>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">{agents.length} 位員工</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map(name => (
              <DeskCard
                key={name}
                agentName={name}
                stats={statsMap[name]}
                activities={activitiesByAgent[name] ?? []}
              />
            ))}
          </div>
        </div>
      ))}

      {/* 載入中 */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg bg-gray-50 h-40 animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
}
