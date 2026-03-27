/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Crown, Search, FileSearch, Pen, Layers, Plane, Train, Car, Hotel,
  UtensilsCrossed, DollarSign, AlertTriangle, Image, Palette, FileText,
  BookOpen, Zap, Star, Shield, X, Clock,
  TrendingUp, RefreshCw, ScrollText, Wrench, Swords
} from "lucide-react";
import HealthBar from "@/components/ui/8bit/health-bar";
import XpBar from "@/components/ui/8bit/xp-bar";

// ── Types ─────────────────────────────────────────────────────────────────────
type Department = "管理層" | "情報部" | "產品部" | "交通部" | "住宿部" | "服務部" | "行銷部" | "財務部" | "研發部";
type Rarity = "legendary" | "epic" | "rare" | "uncommon" | "common";

interface AgentDef {
  id: string;
  agentKey: string;
  name: string;
  title: string;
  department: Department;
  icon: React.ElementType;
  rarity: Rarity;
  description: string;
  skills: string[];
  baseLevel: number;
  emoji: string;
  bgColor: string;
  textColor: string;
  role: string;
}

// ── Agent Roster ──────────────────────────────────────────────────────────────
const AGENTS: AgentDef[] = [
  { id: "master", agentKey: "MasterAgent", name: "MASTER", title: "總指揮官", department: "管理層", icon: Crown, rarity: "legendary", emoji: "👑", bgColor: "bg-yellow-950", textColor: "text-yellow-300", role: "指揮官", baseLevel: 40, description: "統籌所有 AI 員工，分派任務並整合最終輸出，是整個 AI 團隊的核心大腦。", skills: ["任務分派", "流程協調", "品質把關", "錯誤處理"] },
  { id: "content-analyzer", agentKey: "ContentAnalyzerAgent", name: "ANALYZER", title: "資料分析師", department: "情報部", icon: Search, rarity: "epic", emoji: "🔍", bgColor: "bg-purple-950", textColor: "text-purple-300", role: "偵察兵", baseLevel: 35, description: "解析旅遊網頁原始碼，提取結構化行程資料，是資料採集的第一道關卡。", skills: ["網頁解析", "資料萃取", "HTML 分析", "JSON 轉換"] },
  { id: "itinerary-extract", agentKey: "ItineraryExtractAgent", name: "EXTRACTOR", title: "資料萃取師", department: "情報部", icon: FileSearch, rarity: "rare", emoji: "🗂️", bgColor: "bg-blue-950", textColor: "text-blue-300", role: "學者", baseLevel: 30, description: "從原始資料中精準提取每日行程結構，確保行程資訊完整無缺。", skills: ["LLM 提取", "結構化輸出", "JSON Schema", "資料驗證"] },
  { id: "pdf-parser", agentKey: "PdfParserAgent", name: "DOCREADER", title: "文件解析師", department: "情報部", icon: FileText, rarity: "uncommon", emoji: "📄", bgColor: "bg-slate-800", textColor: "text-slate-300", role: "書記官", baseLevel: 20, description: "專門解析 PDF 旅遊文件，將非結構化的 PDF 內容轉換為可用的行程資料。", skills: ["PDF 解析", "OCR 識別", "文字提取", "格式轉換"] },
  { id: "itinerary", agentKey: "ItineraryAgent", name: "PLANNER", title: "行程規劃師", department: "產品部", icon: Layers, rarity: "epic", emoji: "🗺️", bgColor: "bg-emerald-950", textColor: "text-emerald-300", role: "策略師", baseLevel: 38, description: "設計完整的每日旅遊行程，確保行程節奏合理、景點豐富、體驗深度。", skills: ["行程設計", "景點規劃", "時間管理", "體驗優化"] },
  { id: "itinerary-unified", agentKey: "ItineraryUnifiedAgent", name: "INTEGRATOR", title: "整合協調員", department: "產品部", icon: Wrench, rarity: "rare", emoji: "⚡", bgColor: "bg-cyan-950", textColor: "text-cyan-300", role: "協調者", baseLevel: 32, description: "統一整合各 Agent 的輸出，確保最終行程資料格式一致、內容完整。", skills: ["資料整合", "格式統一", "品質驗證", "輸出優化"] },
  { id: "itinerary-polish", agentKey: "ItineraryPolishAgent", name: "WRITER", title: "文案潤飾師", department: "行銷部", icon: Pen, rarity: "rare", emoji: "✍️", bgColor: "bg-pink-950", textColor: "text-pink-300", role: "詩人", baseLevel: 28, description: "優化行程文字描述，讓每個景點介紹生動有趣，提升旅客的期待感。", skills: ["文案撰寫", "語氣優化", "多語支援", "情感表達"] },
  { id: "flight", agentKey: "FlightAgent", name: "SKYDESK", title: "機票專員", department: "交通部", icon: Plane, rarity: "uncommon", emoji: "✈️", bgColor: "bg-sky-950", textColor: "text-sky-300", role: "飛行士", baseLevel: 25, description: "處理所有航班資訊，包括航班時刻、機場資訊與轉機安排。", skills: ["航班查詢", "機場資訊", "轉機規劃", "行李規定"] },
  { id: "train", agentKey: "TrainAgent", name: "RAILDESK", title: "火車票專員", department: "交通部", icon: Train, rarity: "uncommon", emoji: "🚄", bgColor: "bg-orange-950", textColor: "text-orange-300", role: "鐵道師", baseLevel: 22, description: "處理鐵路交通資訊，包括新幹線、高鐵、地鐵等各類軌道交通安排。", skills: ["鐵路規劃", "票務資訊", "路線優化", "時刻查詢"] },
  { id: "transportation", agentKey: "TransportationAgent", name: "MOVEDESK", title: "交通統籌員", department: "交通部", icon: Car, rarity: "uncommon", emoji: "🚌", bgColor: "bg-amber-950", textColor: "text-amber-300", role: "導航師", baseLevel: 24, description: "統籌所有交通方式，確保旅途中每段移動都順暢無縫接軌。", skills: ["多模式交通", "路線規劃", "費用估算", "時間優化"] },
  { id: "hotel", agentKey: "HotelAgent", name: "STAYDESK", title: "住宿專員", department: "住宿部", icon: Hotel, rarity: "rare", emoji: "🏨", bgColor: "bg-violet-950", textColor: "text-violet-300", role: "管家", baseLevel: 30, description: "規劃最適合的住宿安排，從精品飯店到特色民宿，確保旅客舒適入住。", skills: ["飯店推薦", "位置評估", "設施查詢", "預訂協助"] },
  { id: "meal", agentKey: "MealAgent", name: "FOODDESK", title: "餐飲顧問", department: "服務部", icon: UtensilsCrossed, rarity: "uncommon", emoji: "🍜", bgColor: "bg-red-950", textColor: "text-red-300", role: "美食家", baseLevel: 26, description: "規劃在地美食體驗，推薦特色餐廳與必吃料理，讓旅途充滿味覺享受。", skills: ["美食推薦", "餐廳評估", "飲食禁忌", "在地特色"] },
  { id: "cost", agentKey: "CostAgent", name: "FINDESK", title: "費用計算師", department: "財務部", icon: DollarSign, rarity: "rare", emoji: "💰", bgColor: "bg-green-950", textColor: "text-green-300", role: "財務官", baseLevel: 32, description: "精確計算行程費用，包括交通、住宿、餐飲、門票等所有費用項目。", skills: ["費用估算", "匯率換算", "預算規劃", "費用分析"] },
  { id: "notice", agentKey: "NoticeAgent", name: "SAFEDESK", title: "注意事項編輯", department: "服務部", icon: AlertTriangle, rarity: "uncommon", emoji: "⚠️", bgColor: "bg-yellow-900", textColor: "text-yellow-300", role: "守護者", baseLevel: 28, description: "整理旅遊注意事項，包括簽證、保險、安全提示等重要旅行資訊。", skills: ["簽證資訊", "安全提示", "保險建議", "緊急聯絡"] },
  { id: "image-generation", agentKey: "ImageGenerationAgent", name: "PIXELDESK", title: "視覺設計師", department: "行銷部", icon: Image, rarity: "rare", emoji: "🎨", bgColor: "bg-fuchsia-950", textColor: "text-fuchsia-300", role: "畫師", baseLevel: 22, description: "生成精美的行程配圖，讓每個旅遊產品都有吸引人的視覺呈現。", skills: ["圖像生成", "風格設計", "構圖優化", "色彩搭配"] },
  { id: "image-prompt", agentKey: "ImagePromptAgent", name: "PROMPTDESK", title: "圖像提示師", department: "行銷部", icon: Zap, rarity: "uncommon", emoji: "🖌️", bgColor: "bg-rose-950", textColor: "text-rose-300", role: "吟遊詩人", baseLevel: 20, description: "撰寫精準的圖像生成提示詞，確保 AI 生成的圖像符合旅遊場景需求。", skills: ["提示詞撰寫", "場景描述", "風格定義", "細節優化"] },
  { id: "color-theme", agentKey: "ColorThemeAgent", name: "COLORDESK", title: "色彩設計師", department: "行銷部", icon: Palette, rarity: "uncommon", emoji: "🌈", bgColor: "bg-indigo-950", textColor: "text-indigo-300", role: "調色師", baseLevel: 25, description: "為每個行程設定獨特的視覺色彩主題，打造一致的品牌視覺體驗。", skills: ["色彩搭配", "主題設計", "視覺一致性", "品牌應用"] },
  { id: "skill-learner", agentKey: "SkillLearnerAgent", name: "LEARNBOT", title: "技能學習師", department: "研發部", icon: BookOpen, rarity: "epic", emoji: "📚", bgColor: "bg-teal-950", textColor: "text-teal-300", role: "賢者", baseLevel: 15, description: "持續學習新的旅遊知識與技能，讓整個 AI 團隊不斷進化成長。", skills: ["知識學習", "技能優化", "模型微調", "持續改進"] },
];

// ── Rarity Config ─────────────────────────────────────────────────────────────
const RARITY: Record<Rarity, { label: string; color: string; bg: string; border: string; glow: string; bar: string; pixelBorder: string }> = {
  legendary: { label: "★ LEGEND", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-500", glow: "shadow-yellow-500/30", bar: "bg-yellow-400", pixelBorder: "border-yellow-500" },
  epic:      { label: "◆ EPIC",   color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-500", glow: "shadow-purple-500/30", bar: "bg-purple-400", pixelBorder: "border-purple-500" },
  rare:      { label: "▲ RARE",   color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-500",   glow: "shadow-blue-500/30",   bar: "bg-blue-400",   pixelBorder: "border-blue-500" },
  uncommon:  { label: "● GOOD",   color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-600",  glow: "shadow-green-500/20",  bar: "bg-green-400",  pixelBorder: "border-green-600" },
  common:    { label: "○ NORM",   color: "text-gray-400",   bg: "bg-gray-400/10",   border: "border-gray-600",   glow: "shadow-gray-500/10",   bar: "bg-gray-400",   pixelBorder: "border-gray-600" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcLevel(base: number, calls: number) { return Math.min(99, base + Math.floor(Math.sqrt(calls) * 0.8)); }
function calcExp(calls: number) { return Math.min(100, (calls % 20) * 5); }
function calcHp(rarity: Rarity, totalCalls: number) {
  const base = rarity === "legendary" ? 97 : rarity === "epic" ? 93 : rarity === "rare" ? 89 : 85;
  return Math.min(100, base + Math.min(3, Math.floor(totalCalls / 100)));
}

function taskLabel(t: string) {
  const m: Record<string, string> = {
    tour_generation: "行程生成",
    ai_chat: "AI 對話",
    translation: "翻譯任務",
    image_generation: "圖像生成",
    pdf_parse: "PDF 解析",
    skill_learning: "技能學習",
    unknown: "系統任務"
  };
  return m[t] || t;
}

function taskEmoji(t: string) {
  const m: Record<string, string> = {
    tour_generation: "🗺️",
    ai_chat: "💬",
    translation: "🌐",
    image_generation: "🎨",
    pdf_parse: "📄",
    skill_learning: "📚",
    unknown: "⚙️"
  };
  return m[t] || "⚙️";
}

function timeAgo(d: string | Date) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ── Pixel Border Utility ──────────────────────────────────────────────────────
// Creates the classic 8-bit pixel border effect using box-shadow
const pixelBorderStyle = (color: string): React.CSSProperties => ({
  boxShadow: `
    0 -4px 0 0 ${color},
    0 4px 0 0 ${color},
    -4px 0 0 0 ${color},
    4px 0 0 0 ${color}
  `,
});

// ── Main Component ────────────────────────────────────────────────────────────
export default function AiTeamRoster() {
  const [selected, setSelected] = useState<AgentDef | null>(null);
  const [dept, setDept] = useState("全部");
  const [rarityFilter, setRarityFilter] = useState("全部");

  const { data, isLoading, refetch } = (trpc as any).admin.getAgentDailyLogs.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const depts = ["全部", ...Array.from(new Set(AGENTS.map(a => a.department))) as string[]];
  const rarities = ["全部", "legendary", "epic", "rare", "uncommon"];

  const filtered = AGENTS.filter(a => {
    if (dept !== "全部" && a.department !== dept) return false;
    if (rarityFilter !== "全部" && a.rarity !== rarityFilter) return false;
    return true;
  });

  function stats(a: AgentDef) {
    const all = data?.allTimeStats?.find((s: any) => s.agentName === a.agentKey);
    const today = data?.todayStats?.find((s: any) => s.agentName === a.agentKey);
    const totalCalls = Number(all?.totalCalls ?? 0);
    return {
      level: calcLevel(a.baseLevel, totalCalls),
      exp: calcExp(totalCalls),
      hp: calcHp(a.rarity, totalCalls),
      todayCalls: Number(today?.calls ?? 0),
      totalCalls,
      today,
    };
  }

  function activity(a: AgentDef) {
    return (data?.recentActivity ?? []).filter((x: any) => x.agentName === a.agentKey).slice(0, 8);
  }

  const totalToday = (data?.todayStats ?? []).reduce((s: number, x: any) => s + Number(x.calls), 0);
  const activeCount = (data?.todayStats ?? []).length;

  return (
    <div
      className="min-h-screen bg-gray-950 text-white"
      style={{ fontFamily: "'Press Start 2P', monospace", imageRendering: "pixelated" }}
    >
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-10 bg-gray-950 border-b-4 border-yellow-500 px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Title */}
          <div className="flex items-center gap-3">
            <Swords className="w-5 h-5 text-yellow-400" />
            <div>
              <h1 className="text-[11px] text-yellow-400 tracking-widest">AI COMMAND CENTER</h1>
              <p className="text-[8px] text-gray-600 mt-0.5">PACK&GO TRAVEL AGENCY</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            {[
              { label: "AGENTS", value: AGENTS.length, color: "text-yellow-400" },
              { label: "ACTIVE", value: isLoading ? "..." : activeCount, color: "text-green-400" },
              { label: "TASKS", value: isLoading ? "..." : totalToday, color: "text-blue-400" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[7px] text-gray-600 mt-0.5">{s.label}</div>
              </div>
            ))}
            <button
              onClick={() => refetch()}
              className="p-1.5 border-2 border-gray-700 hover:border-yellow-500 hover:bg-yellow-500/10 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {/* Department filter */}
          <div className="flex gap-1 flex-wrap">
            {depts.map(d => (
              <button
                key={d}
                onClick={() => setDept(d)}
                className={`text-[7px] px-2 py-1 border-2 transition-colors tracking-wider ${
                  dept === d
                    ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                    : "border-gray-700 text-gray-600 hover:border-gray-500 hover:text-gray-400"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="w-px h-4 bg-gray-700" />
          {/* Rarity filter */}
          <div className="flex gap-1 flex-wrap">
            {rarities.map(r => {
              const cfg = r === "全部" ? null : RARITY[r as Rarity];
              return (
                <button
                  key={r}
                  onClick={() => setRarityFilter(r)}
                  className={`text-[7px] px-2 py-1 border-2 transition-colors tracking-wider ${
                    rarityFilter === r
                      ? `border-current ${cfg?.color ?? "text-white"} ${cfg?.bg ?? "bg-white/10"}`
                      : "border-gray-700 text-gray-600 hover:border-gray-500"
                  }`}
                >
                  {r === "全部" ? "ALL" : RARITY[r as Rarity].label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── AGENT GRID ── */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map(agent => {
          const { level, exp, hp, todayCalls } = stats(agent);
          const r = RARITY[agent.rarity];
          const isActive = todayCalls > 0;

          return (
            <button
              key={agent.id}
              onClick={() => setSelected(agent)}
              className={`
                relative text-left border-2 ${r.border} bg-gray-900
                hover:bg-gray-800 transition-all duration-150
                shadow-lg ${r.glow} hover:shadow-xl
                p-3 flex flex-col gap-2 group
                ${isActive ? "ring-1 ring-green-500/40" : ""}
              `}
            >
              {/* Rarity badge */}
              <div className={`text-[7px] font-bold ${r.color} tracking-widest`}>{r.label}</div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 animate-pulse" />
                </div>
              )}

              {/* Avatar */}
              <div className={`
                w-14 h-14 ${agent.bgColor} border-2 ${r.border}
                flex items-center justify-center text-2xl mx-auto
                ${isActive ? "animate-[bounce_2s_ease-in-out_infinite]" : ""}
              `}>
                {agent.emoji}
              </div>

              {/* Name & Title */}
              <div className="text-center">
                <div className={`text-[9px] font-bold ${agent.textColor} tracking-wide`}>{agent.name}</div>
                <div className="text-[7px] text-gray-500 mt-0.5 leading-relaxed">{agent.title}</div>
              </div>

              {/* Level */}
              <div className="flex items-center justify-between">
                <span className="text-[7px] text-gray-600">LV</span>
                <span className={`text-sm font-bold ${r.color}`}>{level}</span>
              </div>

              {/* HP Bar */}
              <div>
                <div className="flex justify-between text-[6px] text-gray-600 mb-1">
                  <span>HP</span>
                  <span className="text-red-400">{hp}%</span>
                </div>
                <HealthBar value={hp} variant="retro" className="h-2" />
              </div>

              {/* EXP Bar */}
              <div>
                <div className="flex justify-between text-[6px] text-gray-600 mb-1">
                  <span>EXP</span>
                  <span className="text-yellow-400">{exp}%</span>
                </div>
                <XpBar value={exp} variant="retro" className="h-2" />
              </div>

              {/* Today tasks */}
              <div className="flex justify-between text-[7px] border-t-2 border-gray-800 pt-1.5">
                <span className="text-gray-600">TODAY</span>
                <span className={isActive ? "text-green-400 font-bold" : "text-gray-700"}>
                  {isActive ? `${todayCalls}x` : "IDLE"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── DETAIL MODAL ── */}
      {selected && (
        <AgentModal
          agent={selected}
          stats={stats(selected)}
          activity={activity(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// ── Agent Detail Modal ────────────────────────────────────────────────────────
function AgentModal({
  agent,
  stats,
  activity,
  onClose,
}: {
  agent: AgentDef;
  stats: { level: number; exp: number; hp: number; todayCalls: number; totalCalls: number; today: any };
  activity: any[];
  onClose: () => void;
}) {
  const r = RARITY[agent.rarity];
  const { level, exp, hp, todayCalls, totalCalls, today } = stats;
  const mp = Math.min(100, 40 + level);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
      style={{ fontFamily: "'Press Start 2P', monospace" }}
    >
      <div
        className={`relative w-full max-w-2xl bg-gray-900 border-4 ${r.border} shadow-2xl max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: `0 0 40px rgba(0,0,0,0.8), inset 0 0 0 2px rgba(255,255,255,0.05)` }}
      >
        {/* ── MODAL HEADER ── */}
        <div className={`${agent.bgColor} border-b-4 ${r.border} p-4 flex items-start gap-4`}>
          {/* Avatar */}
          <div className={`w-16 h-16 bg-gray-900/60 border-4 ${r.border} flex items-center justify-center text-3xl flex-shrink-0`}>
            {agent.emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className={`text-sm font-bold ${agent.textColor} tracking-widest`}>{agent.name}</h2>
              <span className={`text-[7px] font-bold px-2 py-0.5 border-2 ${r.border} ${r.color} ${r.bg}`}>
                {r.label}
              </span>
              {todayCalls > 0 && (
                <span className="text-[7px] font-bold px-2 py-0.5 border-2 border-green-500 text-green-400 bg-green-400/10 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 animate-pulse inline-block" />
                  ONLINE
                </span>
              )}
            </div>
            <div className="text-[8px] text-gray-400 mb-1">{agent.title} · {agent.department}</div>
            <div className="text-[7px] text-gray-500 leading-relaxed">{agent.description}</div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors flex-shrink-0 border-2 border-gray-700 hover:border-red-500 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── MODAL BODY ── */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ── LEFT: STATS ── */}
          <div className="space-y-3">
            {/* Level & EXP */}
            <div className="border-2 border-gray-700 bg-gray-800/40 p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[7px] text-gray-600 tracking-widest">LEVEL</span>
                <span className={`text-2xl font-bold ${r.color}`}>LV {level}</span>
              </div>
              <div className="flex justify-between text-[7px] text-gray-600 mb-1.5">
                <span>EXP</span>
                <span className="text-yellow-400">{exp}%</span>
              </div>
              <XpBar value={exp} variant="retro" className="h-3" />
            </div>

            {/* HP / MP */}
            <div className="border-2 border-gray-700 bg-gray-800/40 p-3 space-y-3">
              <div>
                <div className="flex justify-between text-[7px] mb-1.5">
                  <span className="text-red-400 flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" /> HP 成功率
                  </span>
                  <span className="text-red-400">{hp}%</span>
                </div>
                <HealthBar value={hp} variant="retro" className="h-3" />
              </div>
              <div>
                <div className="flex justify-between text-[7px] mb-1.5">
                  <span className="text-blue-400 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> MP 快取命中
                  </span>
                  <span className="text-blue-400">{mp}%</span>
                </div>
                {/* Custom blue progress bar */}
                <div className="relative w-full h-3">
                  <div className="w-full h-full bg-blue-500/20 overflow-hidden flex">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const filled = Math.round((mp / 100) * 20);
                      return (
                        <div
                          key={i}
                          className={`flex-1 h-full mx-[1px] ${i < filled ? "bg-blue-500" : "bg-transparent"}`}
                        />
                      );
                    })}
                  </div>
                  <div className="absolute inset-0 border-y-4 -my-1 border-gray-300 pointer-events-none" aria-hidden="true" />
                  <div className="absolute inset-0 border-x-4 -mx-1 border-gray-300 pointer-events-none" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "TOTAL TASKS", value: totalCalls.toLocaleString(), emoji: "⚔️" },
                { label: "TODAY", value: todayCalls.toString(), emoji: "📅" },
                { label: "AVG TIME", value: today?.avgMs ? `${today.avgMs}ms` : "---", emoji: "⏱️" },
                { label: "TOKENS", value: today?.totalTokens ? `${(today.totalTokens / 1000).toFixed(1)}K` : "---", emoji: "🔋" },
              ].map(s => (
                <div key={s.label} className="border-2 border-gray-700 bg-gray-800/40 p-2 text-center">
                  <div className="text-base mb-1">{s.emoji}</div>
                  <div className={`text-xs font-bold ${r.color}`}>{s.value}</div>
                  <div className="text-[6px] text-gray-600 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="border-2 border-gray-700 bg-gray-800/40 p-3">
              <div className="text-[7px] text-gray-500 tracking-widest mb-2 flex items-center gap-1">
                <Star className="w-2.5 h-2.5" /> SKILLS
              </div>
              <div className="flex flex-wrap gap-1.5">
                {agent.skills.map(s => (
                  <span
                    key={s}
                    className={`text-[7px] px-2 py-0.5 border-2 ${r.border} ${r.bg} ${r.color} tracking-wide`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: DAILY LOG ── */}
          <div className="space-y-3">
            <div className="border-2 border-gray-700 bg-gray-800/40 p-3">
              <div className="text-[7px] text-gray-500 tracking-widest mb-3 flex items-center gap-1">
                <ScrollText className="w-2.5 h-2.5" /> TODAY'S WORK LOG
              </div>

              {activity.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-3">😴</div>
                  <div className="text-[8px] text-gray-600">NO TASKS TODAY</div>
                  <div className="text-[7px] text-gray-700 mt-1">AGENT IS ON STANDBY...</div>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {activity.map((log: any, i: number) => (
                    <div key={i} className="border-2 border-gray-700 bg-gray-900 p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[8px] font-bold ${r.color}`}>
                          {taskEmoji(log.taskType)} {taskLabel(log.taskType)}
                        </span>
                        <span className="text-[7px] text-gray-700">
                          {log.createdAt ? timeAgo(log.createdAt) : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[7px] text-gray-600">
                        {log.totalTokens && (
                          <span className="flex items-center gap-0.5">
                            <Zap className="w-2 h-2" /> {log.totalTokens.toLocaleString()} tkn
                          </span>
                        )}
                        {log.processingTimeMs && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2 h-2" /> {log.processingTimeMs}ms
                          </span>
                        )}
                        {log.wasFromCache && (
                          <span className="text-blue-400">⚡ CACHE</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Today Summary */}
            {todayCalls > 0 && (
              <div className={`border-2 ${r.border} ${r.bg} p-3`}>
                <div className={`text-[7px] ${r.color} tracking-widest mb-2 flex items-center gap-1`}>
                  <TrendingUp className="w-2.5 h-2.5" /> TODAY'S PERFORMANCE
                </div>
                <p className="text-[7px] text-gray-300 leading-loose">
                  {agent.name} completed{" "}
                  <span className={`font-bold ${r.color}`}>{todayCalls}</span> tasks,
                  used{" "}
                  <span className={`font-bold ${r.color}`}>{(today?.totalTokens ?? 0).toLocaleString()}</span> tokens,
                  avg{" "}
                  <span className={`font-bold ${r.color}`}>{today?.avgMs ?? 0}ms</span>.
                  {todayCalls >= 10 ? " 🔥 EXCELLENT!" : todayCalls >= 5 ? " ✅ GOOD WORK." : " 📋 LIGHT DAY."}
                </p>
              </div>
            )}

            {/* Role badge */}
            <div className="border-2 border-gray-700 bg-gray-800/40 p-3 flex items-center justify-between">
              <div>
                <div className="text-[7px] text-gray-600 mb-1">ROLE</div>
                <div className={`text-[9px] font-bold ${r.color}`}>{agent.role}</div>
              </div>
              <div>
                <div className="text-[7px] text-gray-600 mb-1">DEPT</div>
                <div className="text-[9px] font-bold text-gray-300">{agent.department}</div>
              </div>
              <div className={`text-3xl w-12 h-12 ${agent.bgColor} border-2 ${r.border} flex items-center justify-center`}>
                {agent.emoji}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
