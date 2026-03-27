import { useState } from "react";
import {
  Crown, Search, FileSearch, Pen, Layers, Plane, Train, Car, Hotel,
  UtensilsCrossed, DollarSign, AlertTriangle, Image, Palette, FileText,
  BookOpen, Wrench, ChevronRight, Activity, CheckCircle, Clock, Zap,
  Brain
} from "lucide-react";

// ── 員工定義 ──────────────────────────────────────────────────────────────────
type Department = "管理層" | "情報部" | "產品部" | "交通部" | "住宿部" | "服務部" | "行銷部" | "財務部" | "研發部";
type Status = "待命中" | "工作中" | "休息中";

interface Employee {
  id: string;
  name: string;
  title: string;
  department: Department;
  icon: React.ElementType;
  status: Status;
  description: string;
  skills: string[];
  completedTasks: number;
  successRate: number;
  avgDuration: string;
}

const EMPLOYEES: Employee[] = [
  {
    id: "master",
    name: "Master",
    title: "總指揮官",
    department: "管理層",
    icon: Crown,
    status: "待命中",
    description: "協調所有 AI 員工，分派任務並整合最終輸出，是整個 AI 團隊的核心大腦。",
    skills: ["任務分派", "流程協調", "品質把關", "錯誤處理"],
    completedTasks: 142,
    successRate: 97,
    avgDuration: "45s",
  },
  {
    id: "content-analyzer",
    name: "Analyzer",
    title: "資料分析師",
    department: "情報部",
    icon: Search,
    status: "待命中",
    description: "解析旅遊網頁原始碼，提取結構化行程資料，是資料採集的第一道關卡。",
    skills: ["網頁解析", "資料萃取", "HTML 分析", "JSON 轉換"],
    completedTasks: 138,
    successRate: 91,
    avgDuration: "12s",
  },
  {
    id: "itinerary-extract",
    name: "Extractor",
    title: "資料萃取師",
    department: "情報部",
    icon: FileSearch,
    status: "待命中",
    description: "從原始資料中精準提取每日行程結構，確保行程資訊完整無缺。",
    skills: ["LLM 提取", "結構化輸出", "JSON Schema", "資料驗證"],
    completedTasks: 134,
    successRate: 89,
    avgDuration: "18s",
  },
  {
    id: "pdf-parser",
    name: "DocReader",
    title: "文件解析師",
    department: "情報部",
    icon: FileText,
    status: "待命中",
    description: "專門解析 PDF 旅遊文件，將非結構化的 PDF 內容轉換為可用的行程資料。",
    skills: ["PDF 解析", "OCR 識別", "文字提取", "格式轉換"],
    completedTasks: 67,
    successRate: 84,
    avgDuration: "22s",
  },
  {
    id: "itinerary",
    name: "Planner",
    title: "行程規劃師",
    department: "產品部",
    icon: Layers,
    status: "待命中",
    description: "根據萃取的資料設計完整每日行程，確保行程邏輯合理、內容豐富。",
    skills: ["行程設計", "景點規劃", "時間安排", "體驗優化"],
    completedTasks: 128,
    successRate: 93,
    avgDuration: "25s",
  },
  {
    id: "itinerary-unified",
    name: "Integrator",
    title: "整合協調員",
    department: "產品部",
    icon: Wrench,
    status: "待命中",
    description: "統一整合各 Agent 的輸出結果，確保最終行程資料格式一致、無衝突。",
    skills: ["資料整合", "格式統一", "衝突解決", "品質驗證"],
    completedTasks: 119,
    successRate: 95,
    avgDuration: "8s",
  },
  {
    id: "itinerary-polish",
    name: "Writer",
    title: "文案潤飾師",
    department: "行銷部",
    icon: Pen,
    status: "待命中",
    description: "優化行程文字描述，讓行程介紹更吸引人、更專業，提升客戶購買意願。",
    skills: ["文案撰寫", "語言優化", "繁體中文", "品牌語調"],
    completedTasks: 115,
    successRate: 96,
    avgDuration: "20s",
  },
  {
    id: "flight",
    name: "SkyDesk",
    title: "機票專員",
    department: "交通部",
    icon: Plane,
    status: "待命中",
    description: "專責處理航班資訊，包括去回程班機、轉機安排與航空公司資訊。",
    skills: ["航班解析", "轉機規劃", "航空公司識別", "時區換算"],
    completedTasks: 98,
    successRate: 88,
    avgDuration: "10s",
  },
  {
    id: "train",
    name: "RailDesk",
    title: "火車票專員",
    department: "交通部",
    icon: Train,
    status: "待命中",
    description: "處理鐵路交通資訊，包括新幹線、高鐵、地鐵等各類軌道交通安排。",
    skills: ["鐵路資訊", "新幹線規劃", "地鐵路線", "票務資訊"],
    completedTasks: 72,
    successRate: 90,
    avgDuration: "9s",
  },
  {
    id: "transportation",
    name: "MoveDesk",
    title: "交通統籌員",
    department: "交通部",
    icon: Car,
    status: "待命中",
    description: "統籌所有地面交通方式，包括巴士、包車、渡輪等，確保行程交通順暢。",
    skills: ["地面交通", "包車安排", "渡輪資訊", "交通整合"],
    completedTasks: 85,
    successRate: 87,
    avgDuration: "11s",
  },
  {
    id: "hotel",
    name: "StayDesk",
    title: "住宿專員",
    department: "住宿部",
    icon: Hotel,
    status: "待命中",
    description: "負責飯店與住宿資訊的解析與整理，包括星級、設施、位置等詳細資料。",
    skills: ["飯店解析", "星級評定", "設施識別", "位置分析"],
    completedTasks: 103,
    successRate: 92,
    avgDuration: "13s",
  },
  {
    id: "meal",
    name: "FoodDesk",
    title: "餐飲顧問",
    department: "服務部",
    icon: UtensilsCrossed,
    status: "待命中",
    description: "規劃行程中的餐飲安排，包括特色美食推薦、餐廳資訊與飲食注意事項。",
    skills: ["餐飲規劃", "特色美食", "飲食限制", "餐廳推薦"],
    completedTasks: 89,
    successRate: 91,
    avgDuration: "8s",
  },
  {
    id: "cost",
    name: "FinDesk",
    title: "費用計算師",
    department: "財務部",
    icon: DollarSign,
    status: "待命中",
    description: "精準計算行程費用，包括機票、住宿、餐飲、活動等各項費用的彙整。",
    skills: ["費用計算", "匯率換算", "費用分類", "預算分析"],
    completedTasks: 112,
    successRate: 94,
    avgDuration: "7s",
  },
  {
    id: "notice",
    name: "SafeDesk",
    title: "注意事項編輯",
    department: "服務部",
    icon: AlertTriangle,
    status: "待命中",
    description: "整理旅遊注意事項，包括簽證要求、健康建議、文化禁忌與安全提醒。",
    skills: ["注意事項", "簽證資訊", "健康建議", "文化禮儀"],
    completedTasks: 107,
    successRate: 95,
    avgDuration: "9s",
  },
  {
    id: "image-generation",
    name: "PixelDesk",
    title: "視覺設計師",
    department: "行銷部",
    icon: Image,
    status: "待命中",
    description: "根據行程內容生成高品質配圖，為每個行程打造專屬的視覺形象。",
    skills: ["AI 圖像生成", "風格設定", "構圖設計", "品牌視覺"],
    completedTasks: 76,
    successRate: 82,
    avgDuration: "35s",
  },
  {
    id: "image-prompt",
    name: "PromptDesk",
    title: "圖像提示師",
    department: "行銷部",
    icon: Zap,
    status: "待命中",
    description: "撰寫精準的圖像生成提示詞，確保 AI 生成的圖像符合行程主題與品牌風格。",
    skills: ["Prompt 工程", "風格描述", "構圖指引", "品質控制"],
    completedTasks: 76,
    successRate: 88,
    avgDuration: "5s",
  },
  {
    id: "color-theme",
    name: "ColorDesk",
    title: "色彩設計師",
    department: "行銷部",
    icon: Palette,
    status: "待命中",
    description: "為每個行程設定專屬的視覺色彩主題，讓行程頁面更具辨識度與吸引力。",
    skills: ["色彩搭配", "主題設計", "品牌一致性", "視覺層次"],
    completedTasks: 98,
    successRate: 93,
    avgDuration: "6s",
  },
  {
    id: "skill-learner",
    name: "LearnBot",
    title: "技能學習師",
    department: "研發部",
    icon: BookOpen,
    status: "待命中",
    description: "持續學習並優化 Agent 技能庫，讓整個 AI 團隊的能力不斷進化與提升。",
    skills: ["技能學習", "模式識別", "知識更新", "效能優化"],
    completedTasks: 45,
    successRate: 78,
    avgDuration: "60s",
  },
];

const DEPARTMENT_COLORS: Record<Department, string> = {
  "管理層": "bg-black text-white",
  "情報部": "bg-blue-900 text-white",
  "產品部": "bg-green-900 text-white",
  "交通部": "bg-orange-800 text-white",
  "住宿部": "bg-purple-900 text-white",
  "服務部": "bg-teal-800 text-white",
  "行銷部": "bg-rose-900 text-white",
  "財務部": "bg-yellow-800 text-white",
  "研發部": "bg-gray-700 text-white",
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; dot: string }> = {
  "待命中": { label: "待命中", color: "text-green-700", dot: "bg-green-500" },
  "工作中": { label: "工作中", color: "text-blue-700",  dot: "bg-blue-500 animate-pulse" },
  "休息中": { label: "休息中", color: "text-gray-500",  dot: "bg-gray-400" },
};

// ── 員工詳情 Modal ─────────────────────────────────────────────────────────────
function EmployeeModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const Icon = employee.icon;
  const statusCfg = STATUS_CONFIG[employee.status];
  const deptColor = DEPARTMENT_COLORS[employee.department];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg mx-4 border-2 border-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start gap-4 p-6 border-b-2 border-black">
          <div className="w-14 h-14 bg-black flex items-center justify-center flex-shrink-0">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-black">{employee.name}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 ${deptColor}`}>
                {employee.department}
              </span>
            </div>
            <p className="text-sm text-gray-500">{employee.title}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
              <span className={`text-xs font-medium ${statusCfg.color}`}>{statusCfg.label}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">工作職責</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{employee.description}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">核心技能</h4>
            <div className="flex flex-wrap gap-2">
              {employee.skills.map((skill) => (
                <span key={skill} className="text-xs px-2.5 py-1 border border-black text-black font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-black">{employee.completedTasks}</p>
              <p className="text-xs text-gray-500 mt-0.5">完成任務</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-2xl font-bold text-black">{employee.successRate}%</p>
              <p className="text-xs text-gray-500 mt-0.5">成功率</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-black">{employee.avgDuration}</p>
              <p className="text-xs text-gray-500 mt-0.5">平均耗時</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 員工卡片 ──────────────────────────────────────────────────────────────────
function EmployeeCard({ employee, onClick }: { employee: Employee; onClick: () => void }) {
  const Icon = employee.icon;
  const statusCfg = STATUS_CONFIG[employee.status];
  const deptColor = DEPARTMENT_COLORS[employee.department];

  return (
    <button
      onClick={onClick}
      className="w-full text-left border border-gray-200 hover:border-black transition-colors bg-white group"
    >
      <div className="p-4">
        {/* Card Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-black flex items-center justify-center flex-shrink-0 group-hover:bg-gray-800 transition-colors">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-black truncate">{employee.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-black transition-colors flex-shrink-0" />
            </div>
            <p className="text-xs text-gray-500">{employee.title}</p>
          </div>
        </div>

        {/* Department Badge + Status */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 ${deptColor}`}>
            {employee.department}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            <span className={`text-[11px] font-medium ${statusCfg.color}`}>{statusCfg.label}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
          <div>
            <p className="text-base font-bold text-black">{employee.completedTasks}</p>
            <p className="text-[10px] text-gray-400">完成任務</p>
          </div>
          <div className="text-right">
            <p className="text-base font-bold text-black">{employee.successRate}%</p>
            <p className="text-[10px] text-gray-400">成功率</p>
          </div>
        </div>
      </div>
    </button>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
export default function AiTeamRoster() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filterDept, setFilterDept] = useState<Department | "全部">("全部");

  const departments: (Department | "全部")[] = [
    "全部", "管理層", "情報部", "產品部", "交通部",
    "住宿部", "服務部", "行銷部", "財務部", "研發部",
  ];

  const filtered = filterDept === "全部"
    ? EMPLOYEES
    : EMPLOYEES.filter((e) => e.department === filterDept);

  const totalTasks = EMPLOYEES.reduce((sum, e) => sum + e.completedTasks, 0);
  const avgSuccess = Math.round(EMPLOYEES.reduce((sum, e) => sum + e.successRate, 0) / EMPLOYEES.length);

  return (
    <div className="space-y-6">
      {/* Team Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "AI 員工人數", value: EMPLOYEES.length, unit: "人" },
          { label: "累計完成任務", value: totalTasks.toLocaleString(), unit: "次" },
          { label: "平均成功率",   value: avgSuccess, unit: "%" },
        ].map((stat) => (
          <div key={stat.label} className="border-2 border-black p-4">
            <p className="text-2xl font-bold text-black">{stat.value}<span className="text-base font-normal ml-0.5">{stat.unit}</span></p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Department Filter */}
      <div className="flex flex-wrap gap-2">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setFilterDept(dept)}
            className={`text-xs px-3 py-1.5 font-medium transition-colors ${
              filterDept === dept
                ? "bg-black text-white"
                : "border border-gray-300 text-gray-600 hover:border-black hover:text-black"
            }`}
          >
            {dept}
            {dept !== "全部" && (
              <span className="ml-1 opacity-60">
                ({EMPLOYEES.filter((e) => e.department === dept).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onClick={() => setSelectedEmployee(employee)}
          />
        ))}
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
}
