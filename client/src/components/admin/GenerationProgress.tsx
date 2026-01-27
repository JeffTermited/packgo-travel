/**
 * AI 自動生成進度條組件
 * 使用 Server-Sent Events (SSE) 即時顯示各 Agent 的執行狀態
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
  ImageIcon,
  Camera,
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
}

// 進度事件類型
interface ProgressEvent {
  type: 'connected' | 'initial_state' | 'phase_start' | 'phase_progress' | 'phase_complete' | 'phase_error' | 'overall_progress' | 'generation_complete' | 'generation_error';
  taskId: string;
  data?: GenerationProgress;
}

// Agent 圖標映射
const AGENT_ICONS: Record<string, React.ReactNode> = {
  web_scraper: <Globe className="h-4 w-4" />,
  content_analyzer: <FileSearch className="h-4 w-4" />,
  color_theme: <Palette className="h-4 w-4" />,
  image_prompt: <ImageIcon className="h-4 w-4" />,
  image_generation: <Camera className="h-4 w-4" />,
  itinerary: <MapPin className="h-4 w-4" />,
  cost_agent: <DollarSign className="h-4 w-4" />,
  notice_agent: <AlertTriangle className="h-4 w-4" />,
  hotel_agent: <Building2 className="h-4 w-4" />,
  meal_agent: <UtensilsCrossed className="h-4 w-4" />,
  flight_agent: <Plane className="h-4 w-4" />,
  finalize: <Package className="h-4 w-4" />,
};

// 狀態顏色映射
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  running: "bg-blue-100 text-blue-600",
  completed: "bg-green-100 text-green-600",
  failed: "bg-red-100 text-red-600",
};

// 狀態圖標映射
const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-gray-400" />,
  running: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
};

interface GenerationProgressProps {
  taskId: string | null;
  isGenerating: boolean;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function GenerationProgressComponent({ 
  taskId, 
  isGenerating,
  onComplete,
  onError 
}: GenerationProgressProps) {
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [connected, setConnected] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 連接 SSE
  useEffect(() => {
    if (!taskId || !isGenerating) {
      return;
    }

    // 創建 EventSource 連接
    const eventSource = new EventSource(`/api/progress/${taskId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[GenerationProgress] SSE connected');
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: ProgressEvent = JSON.parse(event.data);
        console.log('[GenerationProgress] Received event:', data.type);

        if (data.type === 'connected') {
          setConnected(true);
        } else if (data.type === 'initial_state' || data.data) {
          setProgress(data.data || null);
        }

        // 處理完成事件
        if (data.type === 'generation_complete') {
          onComplete?.();
        }

        // 處理錯誤事件
        if (data.type === 'generation_error' && data.data?.error) {
          onError?.(data.data.error);
        }
      } catch (error) {
        console.error('[GenerationProgress] Failed to parse event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[GenerationProgress] SSE error:', error);
      setConnected(false);
    };

    // 啟動計時器
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [taskId, isGenerating, onComplete, onError]);

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

  // 預設進度狀態（當 SSE 尚未連接時）
  const defaultPhases: AgentPhase[] = [
    { id: 'web_scraper', name: '網頁爬取', description: '從來源網站提取行程資訊', status: 'pending', progress: 0 },
    { id: 'content_analyzer', name: '內容分析', description: '分析並結構化行程資料', status: 'pending', progress: 0 },
    { id: 'color_theme', name: '配色主題', description: '生成行程配色方案', status: 'pending', progress: 0 },
    { id: 'image_prompt', name: '圖片提示', description: '生成圖片搜尋關鍵字', status: 'pending', progress: 0 },
    { id: 'image_generation', name: '圖片生成', description: '搜尋並生成行程圖片', status: 'pending', progress: 0 },
    { id: 'itinerary', name: '行程規劃', description: '生成詳細每日行程', status: 'pending', progress: 0 },
    { id: 'cost_agent', name: '費用說明', description: '生成費用包含/不包含項目', status: 'pending', progress: 0 },
    { id: 'notice_agent', name: '注意事項', description: '生成旅遊注意事項', status: 'pending', progress: 0 },
    { id: 'hotel_agent', name: '住宿資訊', description: '生成住宿詳細資訊', status: 'pending', progress: 0 },
    { id: 'meal_agent', name: '餐飲資訊', description: '生成餐飲詳細資訊', status: 'pending', progress: 0 },
    { id: 'flight_agent', name: '航班資訊', description: '生成航班詳細資訊', status: 'pending', progress: 0 },
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
            {connected && (
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                即時連線
              </Badge>
            )}
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

        {/* Agent 階段列表 */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
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
                  <p className="text-xs text-red-500 mt-1 truncate">{phase.error}</p>
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
            <p className="text-sm text-red-600">{progress.error}</p>
          </div>
        )}

        {/* 提示訊息 */}
        {currentStatus === 'running' && (
          <p className="text-xs text-gray-400 text-center">
            AI 正在生成行程內容，預計需要 2-3 分鐘，請耐心等候...
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default GenerationProgressComponent;
