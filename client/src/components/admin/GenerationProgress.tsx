/**
 * AI 自動生成進度條組件
 * 使用輪詢機制（3秒間隔）即時顯示各 Agent 的執行狀態
 * 
 * 優化說明：
 * - 移除 SSE 連接，改用輪詢以避免 Cloudflare 100 秒超時問題
 * - 輪詢間隔 3 秒，平衡即時性和伺服器負載
 */

import { useEffect, useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Package
} from "lucide-react";

// Agent 階段定義
interface AgentPhase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: number;
  endTime?: number;
  duration?: number;
  error?: string;
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
}

// Agent 圖標映射
const AGENT_ICONS: Record<string, React.ReactNode> = {
  web_scraper: <Globe className="h-4 w-4" />,
  content_analyzer: <FileSearch className="h-4 w-4" />,
  color_theme: <Palette className="h-4 w-4" />,
  details: <Package className="h-4 w-4" />,
  itinerary: <MapPin className="h-4 w-4" />,
  cost_agent: <DollarSign className="h-4 w-4" />,
  notice_agent: <AlertTriangle className="h-4 w-4" />,
  hotel_agent: <Building2 className="h-4 w-4" />,
  meal_agent: <UtensilsCrossed className="h-4 w-4" />,
  flight_agent: <Plane className="h-4 w-4" />,
  finalize: <Package className="h-4 w-4" />,
};

// 狀態圖標映射
const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-gray-400" />,
  running: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
};

// 根據後端進度步驟映射到階段
const STEP_TO_PHASE_MAP: Record<string, string> = {
  'starting': 'web_scraper',
  'scraping': 'web_scraper',
  'analyzing': 'content_analyzer',
  'generating_themes': 'color_theme',

  'generating_color_theme': 'color_theme',
  'generating_content': 'itinerary',

  'saving': 'finalize',
  'completed': 'finalize',
  'failed': 'finalize',
};

interface GenerationProgressProps {
  taskId: string | null;
  isGenerating: boolean;
  // 從父組件傳入的輪詢狀態
  pollingStatus?: {
    status: string;
    progress?: number;
    progressDetails?: {
      step: string;
      progress: number;
      message: string;
      timestamp: number;
      partialResults?: PartialResults;
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // 根據輪詢狀態更新進度
  useEffect(() => {
    if (!pollingStatus || !isGenerating) return;

    const currentStep = pollingStatus.progressDetails?.step || 'starting';
    const currentProgress = pollingStatus.progressDetails?.progress || pollingStatus.progress || 0;
    const currentPhaseId = STEP_TO_PHASE_MAP[currentStep] || 'web_scraper';

    // 構建階段列表
    const phases: AgentPhase[] = [
      { id: 'web_scraper', name: '網頁爬取', description: '從來源網站提取行程資訊', status: 'pending', progress: 0 },
      { id: 'content_analyzer', name: '內容分析', description: '分析並結構化行程資料', status: 'pending', progress: 0 },
      { id: 'color_theme', name: '配色主題', description: '生成行程配色方案', status: 'pending', progress: 0 },
      { id: 'itinerary', name: '行程規劃', description: '生成詳細每日行程', status: 'pending', progress: 0 },
      { id: 'details', name: '細節提取', description: '提取費用、住宿、餐飲、航班資訊', status: 'pending', progress: 0 },
      { id: 'notice_agent', name: '注意事項', description: '生成旅遊注意事項', status: 'pending', progress: 0 },
      { id: 'finalize', name: '完成組裝', description: '組裝最終行程資料', status: 'pending', progress: 0 },
    ];

    // 根據當前進度更新階段狀態
    const phaseOrder = phases.map(p => p.id);
    const currentPhaseIndex = phaseOrder.indexOf(currentPhaseId);

    phases.forEach((phase, index) => {
      if (index < currentPhaseIndex) {
        phase.status = 'completed';
        phase.progress = 100;
      } else if (index === currentPhaseIndex) {
        phase.status = pollingStatus.status === 'failed' ? 'failed' : 'running';
        phase.progress = currentProgress;
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

    setProgress({
      taskId: taskId || '',
      status: pollingStatus.status as any,
      currentPhase: currentPhaseId,
      overallProgress: currentProgress,
      phases,
      startTime: startTimeRef.current,
      error: pollingStatus.failedReason,
      partialResults: pollingStatus.progressDetails?.partialResults,
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

  // 格式化持續時間（毫秒）
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // 如果沒有在生成，不顯示
  if (!isGenerating && !progress) {
    return null;
  }

  // 預設進度狀態
  const defaultPhases: AgentPhase[] = [
    { id: 'web_scraper', name: '網頁爬取', description: '從來源網站提取行程資訊', status: 'pending', progress: 0 },
    { id: 'content_analyzer', name: '內容分析', description: '分析並結構化行程資料', status: 'pending', progress: 0 },
    { id: 'color_theme', name: '配色主題', description: '生成行程配色方案', status: 'pending', progress: 0 },
    { id: 'itinerary', name: '行程規劃', description: '生成詳細每日行程', status: 'pending', progress: 0 },
    { id: 'details', name: '細節提取', description: '提取費用、住宿、餐飲、航班資訊', status: 'pending', progress: 0 },
    { id: 'notice_agent', name: '注意事項', description: '生成旅遊注意事項', status: 'pending', progress: 0 },
    { id: 'finalize', name: '完成組裝', description: '組裝最終行程資料', status: 'pending', progress: 0 },
  ];

  const displayPhases = progress?.phases || defaultPhases;
  const overallProgress = progress?.overallProgress || 0;
  const currentStatus = progress?.status || 'running';

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {currentStatus === 'running' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            {currentStatus === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {currentStatus === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
            AI 行程生成進度
          </CardTitle>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(elapsedTime)}
            </span>
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
              輪詢中
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 整體進度條 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">整體進度</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        {/* 漸進式結果預覽 */}
        {progress?.partialResults && Object.keys(progress.partialResults).length > 0 && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 space-y-3 animate-in fade-in duration-500">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              即時預覽
            </h4>
            
            {/* 標題和目的地 */}
            {(progress.partialResults.title || progress.partialResults.destination) && (
              <div className="space-y-1">
                {progress.partialResults.title && (
                  <p className="text-base font-bold text-gray-900">
                    {typeof progress.partialResults.title === 'string' 
                      ? progress.partialResults.title 
                      : String(progress.partialResults.title)}
                  </p>
                )}
                {progress.partialResults.poeticTitle && (
                  <p className="text-sm text-gray-600 italic">
                    {typeof progress.partialResults.poeticTitle === 'string' 
                      ? progress.partialResults.poeticTitle 
                      : String(progress.partialResults.poeticTitle)}
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
              </div>
            )}
            
            {/* 配色方案 */}
            {progress.partialResults.colorTheme && typeof progress.partialResults.colorTheme === 'object' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">配色：</span>
                <div className="flex gap-1">
                  {Object.entries(progress.partialResults.colorTheme).slice(0, 5).map(([key, color]) => {
                    // 確保 color 是字串
                    const colorValue = typeof color === 'string' ? color : '#cccccc';
                    return (
                      <div
                        key={key}
                        className="w-5 h-5 rounded-full border border-gray-200 shadow-sm"
                        style={{ backgroundColor: colorValue }}
                        title={`${key}: ${colorValue}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Hero 圖片 */}
            {progress.partialResults.heroImage && typeof progress.partialResults.heroImage === 'string' && (
              <div className="relative w-full h-24 rounded-md overflow-hidden">
                <img
                  src={progress.partialResults.heroImage}
                  alt="Hero preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 隱藏無法載入的圖片
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            )}
            
            {/* 亮點 */}
            {progress.partialResults.highlights && Array.isArray(progress.partialResults.highlights) && progress.partialResults.highlights.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs text-gray-500">行程亮點：</span>
                <ul className="text-xs text-gray-700 space-y-0.5">
                  {progress.partialResults.highlights.map((highlight, idx) => {
                    // 確保 highlight 是字串，避免 React Error #31
                    const highlightText = typeof highlight === 'string' 
                      ? highlight 
                      : (typeof highlight === 'object' && highlight !== null)
                        ? JSON.stringify(highlight)
                        : String(highlight);
                    return (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-blue-500">•</span>
                        <span className="line-clamp-1">{highlightText}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Agent 階段列表 */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {displayPhases.map((phase) => (
            <div 
              key={phase.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                phase.status === 'running' ? 'bg-blue-50 border border-blue-200' : 
                phase.status === 'completed' ? 'bg-green-50/50' :
                phase.status === 'failed' ? 'bg-red-50' :
                'bg-gray-50'
              }`}
            >
              {/* Agent 圖標 */}
              <div className={`p-2 rounded-full ${
                phase.status === 'running' ? 'bg-blue-100' :
                phase.status === 'completed' ? 'bg-green-100' :
                phase.status === 'failed' ? 'bg-red-100' :
                'bg-gray-100'
              }`}>
                {AGENT_ICONS[phase.id] || <Package className="h-4 w-4" />}
              </div>

              {/* Agent 資訊 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{phase.name}</span>
                  {phase.duration && (
                    <span className="text-xs text-gray-400">
                      {formatDuration(phase.duration)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{phase.description}</p>
                {phase.error && (
                  <p className="text-xs text-red-500 mt-1 truncate">
                    {typeof phase.error === 'string' 
                      ? phase.error 
                      : String(phase.error)}
                  </p>
                )}
              </div>

              {/* 狀態圖標 */}
              <div className="flex-shrink-0">
                {STATUS_ICONS[phase.status]}
              </div>
            </div>
          ))}
        </div>

        {/* 錯誤訊息 */}
        {progress?.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {typeof progress.error === 'string' 
                ? progress.error 
                : (typeof progress.error === 'object' && progress.error !== null)
                  ? JSON.stringify(progress.error)
                  : String(progress.error)}
            </p>
          </div>
        )}

        {/* 提示訊息 */}
        {currentStatus === 'running' && (
          <p className="text-xs text-gray-400 text-center">
            AI 正在生成行程內容，預計需要 60-90 秒，請耐心等候...
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default GenerationProgressComponent;
