/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { BarChart2, FileText, Building2 } from "lucide-react";
import AiCostTab from "./AiCostTab";
import AiSessionReport from "./AiSessionReport";
import AiOffice from "./AiOffice";

type HubTab = "office" | "report" | "session";

const tabs: { id: HubTab; icon: any; label: string; desc: string }[] = [
  { id: "office",  icon: Building2, label: "AI 辦公室",  desc: "即時監控每位 AI 員工的工作狀態與任務彙報" },
  { id: "report",  icon: BarChart2, label: "使用報告",   desc: "Token 用量、費用與 Agent 統計" },
  { id: "session", icon: FileText,  label: "任務摘要",   desc: "每次 AI 任務完成後的自動小報告" },
];

export default function AiHubTab() {
  const [activeTab, setActiveTab] = useState<HubTab>("office");

  return (
    <div className="space-y-0">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">AI 中心</h2>
        <p className="text-sm text-gray-500 mt-0.5">統一管理 AI 員工團隊、使用狀況與任務摘要報告</p>
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
        {activeTab === "office"  && <AiOffice />}
        {activeTab === "report"  && <AiCostTab />}
        {activeTab === "session" && <AiSessionReport />}
      </div>
    </div>
  );
}
