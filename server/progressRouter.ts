/**
 * SSE 進度回報路由
 * 提供即時的 AI 自動生成進度更新
 */

import { Router, Request, Response } from 'express';
import { progressTracker, ProgressEvent } from './agents/progressTracker';

const router = Router();

// 儲存活躍的 SSE 連線
const activeConnections: Map<string, Response[]> = new Map();

/**
 * SSE 端點：訂閱特定任務的進度更新
 * GET /api/progress/:taskId
 */
router.get('/progress/:taskId', (req: Request, res: Response) => {
  const { taskId } = req.params;
  
  // 延長超時設定到 10 分鐘（600000 ms）
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000); // 10 minutes
  
  // 設定 SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // 禁用 nginx 緩衝
  
  // 發送初始連線確認
  res.write(`data: ${JSON.stringify({ type: 'connected', taskId })}\n\n`);
  
  // 發送當前進度狀態（如果存在）
  const currentProgress = progressTracker.getProgress(taskId);
  if (currentProgress) {
    res.write(`data: ${JSON.stringify({ type: 'initial_state', taskId, data: currentProgress })}\n\n`);
  }
  
  // 註冊連線
  if (!activeConnections.has(taskId)) {
    activeConnections.set(taskId, []);
  }
  activeConnections.get(taskId)!.push(res);
  
  // 監聽進度事件
  const progressHandler = (event: ProgressEvent) => {
    if (event.taskId === taskId) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  };
  
  progressTracker.on('progress', progressHandler);
  
  // 處理連線關閉
  req.on('close', () => {
    progressTracker.off('progress', progressHandler);
    
    const connections = activeConnections.get(taskId);
    if (connections) {
      const index = connections.indexOf(res);
      if (index > -1) {
        connections.splice(index, 1);
      }
      if (connections.length === 0) {
        activeConnections.delete(taskId);
      }
    }
  });
  
  // 保持連線活躍（每 15 秒發送心跳，增加頻率以防止超時）
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 15000); // 從 30s 改為 15s
  
  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

/**
 * 獲取當前進度狀態（非 SSE，用於初始載入）
 * GET /api/progress/:taskId/status
 */
router.get('/progress/:taskId/status', (req: Request, res: Response) => {
  const { taskId } = req.params;
  const progress = progressTracker.getProgress(taskId);
  
  if (!progress) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.json(progress);
});

export { router as progressRouter };
