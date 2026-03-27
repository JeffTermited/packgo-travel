/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Brain, BarChart2, FileText } from "lucide-react";
import AiCostTab from "./AiCostTab";
import SkillsTab from "./SkillsTab";
import AiSessionReport from "./AiSessionReport";

type HubTab = "report" | "skills" | "session";

const tabs: { id: HubTab; icon: any; label: string; desc: string }[] = [
  { id: "report",  icon: BarChart2, label: "使用報告",   desc: "Token 用量、費用與 Agent 統計" },
  { id: "skills",  icon: Brain,     label: "技能管理",   desc: "管理 AI 識別技能與關鍵字規則" },
  { id: "session", icon: FileText,  label: "使用摘要",   desc: "每次 AI 任務完成後的自動小報告" },
];

export default function AiHubTab() {
  const [activeTab, setActiveTab] = useState<HubTab>("report");

  return (
    <div className="space-y-0">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">AI 中心</h2>
        <p className="text-sm text-gray-500 mt-0.5">統一管理 AI 使用狀況、技能設定與任務摘要報告</p>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors relative
                ${isActive
                  ? "text-gray-900 border-b-2 border-black -mb-px"
                  : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent -mb-px"
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {isActive && (
                <span className="hidden sm:inline text-xs text-gray-400 font-normal ml-1">
                  — {tab.desc}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "report"  && <AiCostTab />}
        {activeTab === "skills"  && <SkillsTab />}
        {activeTab === "session" && <AiSessionReport />}
      </div>
    </div>
  );
}
