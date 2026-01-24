# Manus API 整合筆記

## API 端點
- **Base URL**: `https://api.manus.ai`
- **Create Task**: `POST /v1/tasks`

## 認證
- Header: `API_KEY: <api-key>`

## Create Task 請求參數

```json
{
  "prompt": "任務指令",
  "agentProfile": "manus-1.6",  // 可選: manus-1.6, manus-1.6-lite, manus-1.6-max
  "taskMode": "agent",  // 可選: chat, adaptive, agent
  "attachments": [],  // 可附加 URL 或檔案
  "hideInTaskList": true,  // 隱藏任務
  "createShareableLink": false,
  "interactiveMode": false
}
```

## 回應格式

```json
{
  "task_id": "<string>",
  "task_title": "<string>",
  "task_url": "<string>",
  "share_url": "<string>"
}
```

## 自動生成行程的實作方式

1. 呼叫 Manus API 建立任務
2. prompt 內容：請 Manus 訪問指定網址並提取旅遊資訊
3. 使用 taskMode: "agent" 讓 Manus 可以瀏覽網頁
4. 等待任務完成後取得結果

## Get Task API

**Endpoint**: `GET /v1/tasks/{task_id}`

### 回應格式
```json
{
  "id": "<string>",
  "status": "pending | running | completed | failed",
  "output": [
    {
      "role": "user",
      "content": [
        {
          "type": "output_text",
          "text": "<string>"
        }
      ]
    }
  ],
  "credit_usage": 123
}
```

## 實作流程

1. 建立任務 (POST /v1/tasks)
2. 輪詢任務狀態 (GET /v1/tasks/{task_id})
3. 等待 status 變成 "completed"
4. 從 output 中提取結果
