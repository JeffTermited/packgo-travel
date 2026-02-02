/**
 * AI 自動生成進度條組件 - 優化版
 * 
 * 改進項目：
 * - 更簡潔的介面設計，減少佔用空間
 * - 準確的進度百分比計算
 * - 清楚顯示每個 Agent 正在執行的任務
 * - 技能學習通知功能
 */

import { useEffect, useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock,
  Globe,
  FileSearch,
  Palette,
  MapPin,
  DollarSign,
  AlertTriangle,
  Building2,
  UtensilsCrossed,
  Plane,
  Package,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Brain
} from "lucide-react";

// Agent 階段定義
interface AgentPhase {
  id: string;
  name: string;
  shortName: string; // 簡短名稱用於緊湊顯示
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: number;
  endTime?: number;
  duration?: number;
  error?: string;
  currentTask?: string; // 當前正在執行的具體任務
}

// 漸進式結果類型
interface PartialResults {
  title?: string;
  poeticTitle?: string;
  destination?: string;
  colorTheme?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  heroImage?: string;
  highlights?: string[];
}

// 技能學習通知
interface SkillLearned {
  name: string;
  category: string;
  timestamp: number;
}

// 整體進度狀態
interface GenerationProgress {
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentPhase: string;
  overallProgress: number;
  phases: AgentPhase[];
  startTime: number;
  endTime?: number;
  totalDuration?: number;
  error?: string;
  partialResults?: PartialResults;
  skillsLearned?: SkillLearned[];
}

// Agent 圖標映射
const AGENT_ICONS: Record<string, React.ReactNode> = {
  web_scraper: <Globe className="h-3.5 w-3.5" />,
  content_analyzer: <FileSearch className="h-3.5 w-3.5" />,
  color_theme: <Palette className="h-3.5 w-3.5" />,
  details: <Package className="h-3.5 w-3.5" />,
  itinerary: <MapPin className="h-3.5 w-3.5" />,
  cost_agent: <DollarSign className="h-3.5 w-3.5" />,
  notice_agent: <AlertTriangle className="h-3.5 w-3.5" />,
  hotel_agent: <Building2 className="h-3.5 w-3.5" />,
  meal_agent: <UtensilsCrossed className="h-3.5 w-3.5" />,
  flight_agent: <Plane className="h-3.5 w-3.5" />,
  finalize: <Package className="h-3.5 w-3.5" />,
  learning: <Brain className="h-3.5 w-3.5" />,
};

// 步驟到階段的映射（更精確）
const STEP_DETAILS: Record<string, { phase: string; task: string; baseProgress: number }> = {
  'starting': { phase: 'web_scraper', task: '初始化生成任務', baseProgress: 0 },
  'scraping': { phase: 'web_scraper', task: '抓取網頁內容', baseProgress: 5 },
  'parsing_pdf': { phase: 'web_scraper', task: '解析 PDF 文件', baseProgress: 5 },
  'analyzing': { phase: 'content_analyzer', task: '分析行程結構', baseProgress: 15 },
  'extracting_basic': { phase: 'content_analyzer', task: '提取基本資訊', baseProgress: 20 },
  'extracting_itinerary': { phase: 'itinerary', task: '解析每日行程', baseProgress: 30 },
  'extracting_hotels': { phase: 'hotel_agent', task: '提取住宿資訊', baseProgress: 40 },
  'extracting_meals': { phase: 'meal_agent', task: '提取餐飲資訊', baseProgress: 45 },
  'extracting_flights': { phase: 'flight_agent', task: '提取航班資訊', baseProgress: 50 },
  'extracting_costs': { phase: 'cost_agent', task: '分析費用明細', baseProgress: 55 },
  'extracting_notices': { phase: 'notice_agent', task: '整理注意事項', baseProgress: 60 },
  'generating_themes': { phase: 'color_theme', task: '生成配色主題', baseProgress: 70 },
  'generating_color_theme': { phase: 'color_theme', task: '優化配色方案', baseProgress: 75 },
  'generating_content': { phase: 'itinerary', task: '生成詩意描述', baseProgress: 80 },
  'applying_skills': { phase: 'learning', task: '應用已學習技能', baseProgress: 85 },
  'learning_new_skills': { phase: 'learning', task: '學習新技能', baseProgress: 88 },
  'saving': { phase: 'finalize', task: '儲存到資料庫', baseProgress: 92 },
  'completed': { phase: 'finalize', task: '生成完成', baseProgress: 100 },
  'failed': { phase: 'finalize', task: '生成失敗', baseProgress: 0 },
};

interface GenerationProgressProps {
  taskId: string | null;
  isGenerating: boolean;
  pollingStatus?: {
    status: string;
    progress?: number;
    progressDetails?: {
      step: string;
      progress: number;
      message: string;
      timestamp: number;
      partialResults?: PartialResults;
      skillsLearned?: SkillLearned[];
    } | null;
    failedReason?: string;
  } | null;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function GenerationProgressComponent({ 
  taskId, 
  isGenerating,
  pollingStatus,
  onComplete,
  onError 
}: GenerationProgressProps) {
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [skillNotifications, setSkillNotifications] = useState<SkillLearned[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // 定義所有階段
  const allPhases: AgentPhase[] = [
    { id: 'web_scraper', name: '網頁爬取', shortName: '爬取', description: '從來源網站提取行程資訊', status: 'pending', progress: 0 },
    { id: 'content_analyzer', name: '內容分析', shortName: '分析', description: '分析並結構化行程資料', status: 'pending', progress: 0 },
    { id: 'itinerary', name: '行程規劃', shortName: '行程', description: '生成詳細每日行程', status: 'pending', progress: 0 },
    { id: 'hotel_agent', name: '住宿資訊', shortName: '住宿', description: '提取住宿資訊', status: 'pending', progress: 0 },
    { id: 'meal_agent', name: '餐飲資訊', shortName: '餐飲', description: '提取餐飲資訊', status: 'pending', progress: 0 },
    { id: 'flight_agent', name: '航班資訊', shortName: '航班', description: '提取航班資訊', status: 'pending', progress: 0 },
    { id: 'cost_agent', name: '費用分析', shortName: '費用', description: '分析費用明細', status: 'pending', progress: 0 },
    { id: 'notice_agent', name: '注意事項', shortName: '注意', description: '整理注意事項', status: 'pending', progress: 0 },
    { id: 'color_theme', name: '配色主題', shortName: '配色', description: '生成行程配色方案', status: 'pending', progress: 0 },
    { id: 'learning', name: '技能學習', shortName: '學習', description: '應用與學習新技能', status: 'pending', progress: 0 },
    { id: 'finalize', name: '完成組裝', shortName: '完成', description: '組裝最終行程資料', status: 'pending', progress: 0 },
  ];

  // 根據輪詢狀態更新進度
  useEffect(() => {
    if (!pollingStatus || !isGenerating) return;

    const currentStep = pollingStatus.progressDetails?.step || 'starting';
    const stepInfo = STEP_DETAILS[currentStep] || { phase: 'web_scraper', task: '處理中', baseProgress: 0 };
    const currentPhaseId = stepInfo.phase;
    const currentTask = stepInfo.task;
    
    // 計算準確的進度百分比
    const reportedProgress = pollingStatus.progressDetails?.progress || pollingStatus.progress || 0;
    const calculatedProgress = Math.max(stepInfo.baseProgress, reportedProgress);

    // 構建階段列表
    const phases = allPhases.map(phase => ({ ...phase }));
    const phaseOrder = phases.map(p => p.id);
    const currentPhaseIndex = phaseOrder.indexOf(currentPhaseId);

    phases.forEach((phase, index) => {
      if (index < currentPhaseIndex) {
        phase.status = 'completed';
        phase.progress = 100;
      } else if (index === currentPhaseIndex) {
        phase.status = pollingStatus.status === 'failed' ? 'failed' : 'running';
        phase.progress = Math.min(100, Math.max(0, (calculatedProgress - stepInfo.baseProgress) * 10));
        phase.currentTask = currentTask;
        if (pollingStatus.status === 'failed') {
          phase.error = pollingStatus.failedReason;
        }
      } else {
        phase.status = 'pending';
        phase.progress = 0;
      }
    });

    // 如果已完成，標記所有階段為完成
    if (pollingStatus.status === 'completed') {
      phases.forEach(phase => {
        phase.status = 'completed';
        phase.progress = 100;
      });
    }

    // 處理技能學習通知
    const newSkills = pollingStatus.progressDetails?.skillsLearned || [];
    if (newSkills.length > skillNotifications.length) {
      const addedSkills = newSkills.slice(skillNotifications.length);
      setSkillNotifications(newSkills);
      // 可以在這裡觸發 toast 通知
    }

    setProgress({
      taskId: taskId || '',
      status: pollingStatus.status as any,
      currentPhase: currentPhaseId,
      overallProgress: calculatedProgress,
      phases,
      startTime: startTimeRef.current,
      error: pollingStatus.failedReason,
      partialResults: pollingStatus.progressDetails?.partialResults,
      skillsLearned: newSkills,
    });

    // 處理完成和錯誤回調
    if (pollingStatus.status === 'completed') {
      onComplete?.();
    } else if (pollingStatus.status === 'failed' && pollingStatus.failedReason) {
      onError?.(pollingStatus.failedReason);
    }
  }, [pollingStatus, isGenerating, taskId, onComplete, onError]);

  // 計時器
  useEffect(() => {
    if (!isGenerating) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    startTimeRef.current = Date.now();
    setElapsedTime(0);

    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isGenerating]);

  // 格式化時間
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 如果沒有在生成，不顯示
  if (!isGenerating && !progress) {
    return null;
  }

  const displayPhases = progress?.phases || allPhases;
  const overallProgress = progress?.overallProgress || 0;
  const currentStatus = progress?.status || 'running';
  const currentPhase = displayPhases.find(p => p.status === 'running');
  const completedCount = displayPhases.filter(p => p.status === 'completed').length;

  return (
    <div className="w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* 緊湊的主要進度區 */}
      <div className="p-3">
        {/* 頂部：狀態、進度、時間 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {currentStatus === 'running' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            {currentStatus === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            {currentStatus === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
            <span className="text-sm font-medium">
              {currentStatus === 'running' && currentPhase?.currentTask}
              {currentStatus === 'completed' && '生成完成'}
              {currentStatus === 'failed' && '生成失敗'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(elapsedTime)}
            </span>
            <span className="font-medium text-primary">{overallProgress}%</span>
          </div>
        </div>

        {/* 進度條 */}
        <Progress value={overallProgress} className="h-2 mb-2" />

        {/* Agent 狀態指示器（緊湊版） */}
        <div className="flex items-center gap-1 flex-wrap">
          {displayPhases.map((phase) => (
            <div
              key={phase.id}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-all ${
                phase.status === 'running' 
                  ? 'bg-primary/10 text-primary border border-primary/30' 
                  : phase.status === 'completed'
                  ? 'bg-green-50 text-green-600'
                  : phase.status === 'failed'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
              title={`${phase.name}: ${phase.currentTask || phase.description}`}
            >
              {AGENT_ICONS[phase.id]}
              <span className="hidden sm:inline">{phase.shortName}</span>
              {phase.status === 'running' && (
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              )}
              {phase.status === 'completed' && (
                <CheckCircle2 className="h-3 w-3" />
              )}
            </div>
          ))}
        </div>

        {/* 技能學習通知 */}
        {skillNotifications.length > 0 && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span className="text-amber-600">
              已學習 {skillNotifications.length} 個新技能
            </span>
            {skillNotifications.slice(-2).map((skill, idx) => (
              <Badge key={idx} variant="outline" className="text-xs py-0 bg-amber-50 border-amber-200 text-amber-700">
                {skill.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* 展開/收合按鈕 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 text-xs text-gray-600"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-3 w-3" />
            收合詳情
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3" />
            展開詳情 ({completedCount}/{displayPhases.length})
          </>
        )}
      </button>

      {/* 展開的詳細內容 */}
      {isExpanded && (
        <div className="p-3 border-t border-gray-200 space-y-3">
          {/* Agent 詳細列表 */}
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {displayPhases.map((phase) => (
              <div 
                key={phase.id}
                className={`flex items-center gap-2 p-2 rounded text-sm ${
                  phase.status === 'running' ? 'bg-primary/5 border border-primary/20' : 
                  phase.status === 'completed' ? 'bg-green-50/50' :
                  phase.status === 'failed' ? 'bg-red-50' :
                  'bg-gray-50'
                }`}
              >
                <div className={`p-1.5 rounded ${
                  phase.status === 'running' ? 'bg-primary/10' :
                  phase.status === 'completed' ? 'bg-green-100' :
                  phase.status === 'failed' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  {AGENT_ICONS[phase.id]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs">{phase.name}</span>
                    {phase.status === 'running' && (
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {phase.currentTask || phase.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {phase.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {phase.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                  {phase.status === 'pending' && <Clock className="h-4 w-4 text-gray-300" />}
                </div>
              </div>
            ))}
          </div>

          {/* 漸進式結果預覽 */}
          {progress?.partialResults && Object.keys(progress.partialResults).length > 0 && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded border border-blue-100 space-y-2">
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <Package className="h-3 w-3 text-blue-500" />
                即時預覽
              </h4>
              
              {progress.partialResults.title && (
                <p className="text-sm font-bold text-gray-900 line-clamp-1">
                  {typeof progress.partialResults.title === 'string' 
                    ? progress.partialResults.title 
                    : String(progress.partialResults.title)}
                </p>
              )}
              
              {progress.partialResults.destination && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {typeof progress.partialResults.destination === 'string' 
                    ? progress.partialResults.destination 
                    : String(progress.partialResults.destination)}
                </p>
              )}
              
              {progress.partialResults.colorTheme && typeof progress.partialResults.colorTheme === 'object' && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">配色：</span>
                  <div className="flex gap-0.5">
                    {Object.entries(progress.partialResults.colorTheme).slice(0, 5).map(([key, color]) => {
                      const colorValue = typeof color === 'string' ? color : '#cccccc';
                      return (
                        <div
                          key={key}
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: colorValue }}
                          title={`${key}: ${colorValue}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 錯誤訊息 */}
          {progress?.error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
              <strong>錯誤：</strong> {typeof progress.error === 'string' ? progress.error : String(progress.error)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
