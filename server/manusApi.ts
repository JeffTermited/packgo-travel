/**
 * Manus Open API Helper
 * 用於呼叫 Manus AI Browser Operator 來瀏覽網頁並提取資訊
 */

const MANUS_API_BASE_URL = "https://api.manus.ai";

interface CreateTaskParams {
  prompt: string;
  agentProfile?: "manus-1.6" | "manus-1.6-lite" | "manus-1.6-max";
  taskMode?: "chat" | "adaptive" | "agent";
  hideInTaskList?: boolean;
}

interface CreateTaskResponse {
  task_id: string;
  task_title: string;
  task_url: string;
  share_url?: string;
}

interface TaskOutput {
  id: string;
  status: string;
  role: string;
  type: string;
  content: Array<{
    type: string;
    text?: string;
    fileUrl?: string;
    fileName?: string;
    mimeType?: string;
  }>;
}

interface GetTaskResponse {
  id: string;
  object: string;
  created_at: number;
  updated_at: number;
  status: "pending" | "running" | "completed" | "failed";
  error?: string;
  incomplete_details?: string;
  instructions?: string;
  model?: string;
  metadata?: {
    task_title?: string;
    task_url?: string;
  };
  output?: TaskOutput[];
  credit_usage?: number;
}

/**
 * 建立 Manus 任務
 */
export async function createManusTask(params: CreateTaskParams): Promise<CreateTaskResponse> {
  const apiKey = process.env.MANUS_API_KEY;
  
  if (!apiKey) {
    throw new Error("MANUS_API_KEY is not configured");
  }

  const response = await fetch(`${MANUS_API_BASE_URL}/v1/tasks`, {
    method: "POST",
    headers: {
      "API_KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: params.prompt,
      agentProfile: params.agentProfile || "manus-1.6",
      taskMode: params.taskMode || "agent",
      hideInTaskList: params.hideInTaskList ?? true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[ManusAPI] Create task error:", response.status, errorText);
    throw new Error(`Failed to create Manus task: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log("[ManusAPI] Task created:", data);
  return data;
}

/**
 * 取得 Manus 任務狀態和結果
 */
export async function getManusTask(taskId: string): Promise<GetTaskResponse> {
  const apiKey = process.env.MANUS_API_KEY;
  
  if (!apiKey) {
    throw new Error("MANUS_API_KEY is not configured");
  }

  const response = await fetch(`${MANUS_API_BASE_URL}/v1/tasks/${taskId}`, {
    method: "GET",
    headers: {
      "API_KEY": apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[ManusAPI] Get task error:", response.status, errorText);
    throw new Error(`Failed to get Manus task: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * 等待 Manus 任務完成
 * @param taskId 任務 ID
 * @param maxWaitTime 最大等待時間（毫秒），預設 5 分鐘
 * @param pollInterval 輪詢間隔（毫秒），預設 5 秒
 */
export async function waitForManusTask(
  taskId: string,
  maxWaitTime: number = 5 * 60 * 1000,
  pollInterval: number = 5000
): Promise<GetTaskResponse> {
  const startTime = Date.now();
  
  // Wait a bit before first poll to allow task to be created in Manus system
  console.log(`[ManusAPI] Waiting 3 seconds before first poll for task ${taskId}...`);
  await new Promise((resolve) => setTimeout(resolve, 3000));

  while (Date.now() - startTime < maxWaitTime) {
    let task: GetTaskResponse;
    try {
      task = await getManusTask(taskId);
    } catch (error: any) {
      // If task not found, wait and retry
      if (error.message.includes("task not found")) {
        console.log(`[ManusAPI] Task ${taskId} not found yet, waiting...`);
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        continue;
      }
      throw error;
    }
    console.log(`[ManusAPI] Task ${taskId} status: ${task.status}`);

    if (task.status === "completed") {
      return task;
    }

    if (task.status === "failed") {
      throw new Error(`Manus task failed: ${task.error || "Unknown error"}`);
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Manus task timed out after ${maxWaitTime / 1000} seconds`);
}

/**
 * 從 Manus 任務輸出中提取文字內容
 */
export function extractTextFromTaskOutput(task: GetTaskResponse): string {
  if (!task.output || task.output.length === 0) {
    return "";
  }

  // Find the last assistant message
  const assistantMessages = task.output.filter((msg) => msg.role === "assistant");
  if (assistantMessages.length === 0) {
    return "";
  }

  const lastMessage = assistantMessages[assistantMessages.length - 1];
  if (!lastMessage.content || lastMessage.content.length === 0) {
    return "";
  }

  // Extract text content
  const textContents = lastMessage.content
    .filter((c) => c.type === "output_text" && c.text)
    .map((c) => c.text);

  return textContents.join("\n");
}

/**
 * 從 Manus 任務輸出中提取 JSON 檔案內容
 */
export async function extractJsonFileFromTaskOutput(task: GetTaskResponse): Promise<string | null> {
  if (!task.output || task.output.length === 0) {
    return null;
  }

  // Search all messages for JSON file
  for (const msg of task.output) {
    if (!msg.content) continue;
    
    for (const content of msg.content) {
      // Check for file attachment with JSON
      if (content.fileUrl && content.fileName?.endsWith('.json')) {
        console.log("[ManusAPI] Found JSON file:", content.fileName, content.fileUrl);
        try {
          const response = await fetch(content.fileUrl);
          if (response.ok) {
            const jsonText = await response.text();
            console.log("[ManusAPI] Downloaded JSON file, length:", jsonText.length);
            return jsonText;
          }
        } catch (error) {
          console.error("[ManusAPI] Failed to download JSON file:", error);
        }
      }
      
      // Also check for JSON in text content
      if (content.type === "output_text" && content.text) {
        const text = content.text.trim();
        // Try to find JSON block in text
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          console.log("[ManusAPI] Found JSON in code block");
          return jsonMatch[1].trim();
        }
        // Check if the entire text is JSON
        if (text.startsWith('{') && text.endsWith('}')) {
          try {
            JSON.parse(text);
            console.log("[ManusAPI] Found raw JSON text");
            return text;
          } catch {
            // Not valid JSON, continue
          }
        }
      }
    }
  }

  return null;
}

/**
 * 使用 Manus 瀏覽網頁並提取旅遊行程資訊
 */
export async function extractTourInfoWithManus(url: string): Promise<string> {
  console.log("[ManusAPI] Starting tour extraction for URL:", url);

  const prompt = `請訪問以下旅遊行程網址，並提取完整的行程資訊：

網址：${url}

請仔細閱讀網頁內容，提取以下所有資訊，並以 JSON 格式回傳：

{
  "basicInfo": {
    "title": "行程標題（請重新撰寫一個吸引人的行銷標題）",
    "productCode": "產品代碼",
    "description": "行程描述（100-200字的精彩行程亮點介紹）",
    "promotionText": "促銷文字（如：過年大促銷、限時優惠等）",
    "tags": ["標籤，如：特色住宿、獨家企劃、刷卡好康"]
  },
  "location": {
    "departureCountry": "出發國家（預設台灣）",
    "departureCity": "出發城市（如：桃園、台北、高雄）",
    "departureAirportCode": "出發機場代碼（如：TPE）",
    "departureAirportName": "出發機場名稱",
    "destinationCountry": "目的地國家",
    "destinationCity": "目的地城市",
    "destinationRegion": "目的地區域（如：那霸、大阪、東京）",
    "destinationAirportCode": "目的地機場代碼",
    "destinationAirportName": "目的地機場名稱",
    "destinationDescription": "目的地介紹（100-200字）"
  },
  "duration": {
    "days": 天數,
    "nights": 晚數
  },
  "pricing": {
    "price": 價格（數字，新台幣）,
    "priceUnit": "人/起",
    "availableSeats": 可賣席次（數字）
  },
  "flight": {
    "outbound": {
      "airline": "去程航空公司",
      "flightNo": "去程航班號",
      "departureTime": "去程出發時間（如：06:55）",
      "arrivalTime": "去程抵達時間（如：09:15）",
      "duration": "去程飛行時間（如：1h20m）"
    },
    "inbound": {
      "airline": "回程航空公司",
      "flightNo": "回程航班號",
      "departureTime": "回程出發時間",
      "arrivalTime": "回程抵達時間",
      "duration": "回程飛行時間"
    }
  },
  "accommodation": {
    "hotelName": "酒店名稱",
    "hotelGrade": "酒店等級（如：五星級、四星級）",
    "hotelNights": 住宿晚數,
    "hotelLocation": "酒店位置",
    "hotelDescription": "酒店介紹（100-200字）",
    "hotelFacilities": ["設施1", "設施2"],
    "hotelRoomType": "房型",
    "hotelRoomSize": "房間大小",
    "hotelCheckIn": "入住時間",
    "hotelCheckOut": "退房時間",
    "hotelSpecialOffers": ["特別贈送項目"],
    "hotelWebsite": "酒店官網"
  },
  "attractions": [
    {
      "name": "景點名稱",
      "description": "景點描述"
    }
  ],
  "dailyItinerary": [
    {
      "day": 1,
      "title": "第一天標題",
      "activities": ["活動1", "活動2"]
    }
  ],
  "pricingDetails": {
    "includes": ["費用包含項目1", "費用包含項目2"],
    "excludes": ["費用不含項目1", "費用不含項目2"],
    "optionalTours": [
      {
        "name": "自費行程名稱",
        "content": "自費行程內容",
        "price": 價格,
        "includes": ["包含項目"]
      }
    ]
  },
  "highlights": ["行程亮點1", "行程亮點2"],
  "notes": {
    "specialReminders": "行程特殊提醒",
    "notes": "行程備註",
    "safetyGuidelines": "安全守則",
    "flightRules": "團體航班規定事項"
  },
  "departureDate": "出發日期（YYYY-MM-DD）",
  "imageUrl": "行程主圖片網址"
}

重要注意事項：
1. 請務必訪問網頁並仔細閱讀所有內容
2. 標題請重新撰寫，使其更吸引人
3. 描述請重新撰寫，突出行程亮點
4. 價格請只提取數字，不要包含貨幣符號
5. 天數和晚數請只提取數字
6. 請確保 JSON 格式正確
7. 如果找不到某項資訊，請留空或使用合理的預設值
8. 請只回傳 JSON 格式的資料，不要包含其他文字`;

  // Create task
  const createResponse = await createManusTask({
    prompt,
    agentProfile: "manus-1.6",
    taskMode: "agent",
    hideInTaskList: true,
  });

  console.log("[ManusAPI] Task created with ID:", createResponse.task_id);

  // Wait for task completion
  const completedTask = await waitForManusTask(createResponse.task_id);

  // Try to extract JSON file first
  const jsonFileContent = await extractJsonFileFromTaskOutput(completedTask);
  if (jsonFileContent) {
    console.log("[ManusAPI] Extraction completed from JSON file, length:", jsonFileContent.length);
    return jsonFileContent;
  }

  // Fallback to text extraction
  const result = extractTextFromTaskOutput(completedTask);
  console.log("[ManusAPI] Extraction completed from text, result length:", result.length);

  return result;
}
