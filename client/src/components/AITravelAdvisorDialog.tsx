import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, User, ThumbsUp, ThumbsDown, Sparkles, X, Minimize2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

// 企鵝表情圖像 URLs
const PENGUIN_EXPRESSIONS = {
  default: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663159191204/bJsbScmQpKmVdhut.png",
  thinking: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663159191204/SjvtTEmhuOMPCozg.png",
  happy: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663159191204/qvHPuVaTsuielbwl.png",
  confused: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663159191204/vyzjOiHzLOerStch.png",
  waving: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663159191204/WkOQbHIhVnUckSkg.png",
};

type PenguinExpression = keyof typeof PENGUIN_EXPRESSIONS;

interface Message {
  role: "user" | "assistant";
  content: string;
  triggeredSkills?: Array<{ skillId: number; skillName: string; confidence: number }>;
  usageLogIds?: number[];
  feedbackGiven?: "positive" | "negative" | null;
}

interface AITravelAdvisorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AITravelAdvisorDialog({ open, onOpenChange }: AITravelAdvisorDialogProps) {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "您好！我是 PACK&GO 的 AI 旅遊顧問。我可以協助您規劃行程、推薦目的地、解答旅遊相關問題。請問有什麼我可以幫您的嗎？",
    },
  ]);
  const [input, setInput] = useState("");
  const [penguinExpression, setPenguinExpression] = useState<PenguinExpression>("waving");
  const [isAnimating, setIsAnimating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 根據對話狀態切換企鵝表情
  const updatePenguinExpression = (newExpression: PenguinExpression) => {
    setIsAnimating(true);
    setPenguinExpression(newExpression);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const chatMutation = trpc.ai.chat.useMutation({
    onMutate: () => {
      updatePenguinExpression("thinking");
    },
    onSuccess: (data) => {
      updatePenguinExpression("happy");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: typeof data.response === 'string' ? data.response : JSON.stringify(data.response),
          triggeredSkills: data.triggeredSkills,
          usageLogIds: data.usageLogIds,
          feedbackGiven: null,
        },
      ]);
      setTimeout(() => updatePenguinExpression("default"), 3000);
    },
    onError: () => {
      updatePenguinExpression("confused");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "抱歉，我遇到了一些問題。請稍後再試。",
        },
      ]);
      setTimeout(() => updatePenguinExpression("default"), 3000);
    },
  });

  const feedbackMutation = trpc.ai.recordFeedback.useMutation({
    onSuccess: () => {
      console.log("感謝您的回饋！");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open) {
      updatePenguinExpression("waving");
      setTimeout(() => updatePenguinExpression("default"), 2000);
    }
  }, [open]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    chatMutation.mutate({
      message: userMessage,
      conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
      sessionId,
    });
  };

  const handleFeedback = (messageIndex: number, feedback: "positive" | "negative") => {
    const message = messages[messageIndex];
    if (!message.usageLogIds || message.usageLogIds.length === 0) return;
    if (message.feedbackGiven) return;

    if (feedback === "positive") {
      updatePenguinExpression("happy");
      setTimeout(() => updatePenguinExpression("default"), 2000);
    }

    setMessages((prev) => 
      prev.map((m, i) => 
        i === messageIndex ? { ...m, feedbackGiven: feedback } : m
      )
    );

    feedbackMutation.mutate({
      usageLogIds: message.usageLogIds,
      feedback,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentPenguinImage = PENGUIN_EXPRESSIONS[penguinExpression];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[600px] flex flex-col p-0 border-2 border-black rounded-none gap-0 overflow-hidden">
        {/* Header with Animated Character */}
        <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className={`w-12 h-12 bg-white flex items-center justify-center overflow-hidden transition-transform duration-300 ${
                isAnimating ? "scale-110" : "scale-100"
              }`}
            >
              <img
                src={currentPenguinImage}
                alt="AI 旅遊顧問"
                className={`w-11 h-11 object-contain transition-all duration-300 ${
                  chatMutation.isPending ? "animate-bounce" : ""
                }`}
              />
            </div>
            <div>
              <h3 className="font-bold text-base">AI 旅遊顧問</h3>
              <p className="text-xs text-gray-300">
                {chatMutation.isPending ? "思考中..." : "隨時為您服務"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              onClick={() => onOpenChange(false)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div key={index}>
              <div
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-white border border-black flex items-center justify-center overflow-hidden">
                    <img
                      src={PENGUIN_EXPRESSIONS.default}
                      alt="AI"
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-3 ${
                    message.role === "user"
                      ? "bg-black text-white"
                      : "bg-white border-2 border-black text-black"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="text-sm prose prose-sm max-w-none">
                      <Streamdown>{message.content}</Streamdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
              
              {/* Triggered Skills & Feedback */}
              {message.role === "assistant" && index > 0 && (
                <div className="ml-11 mt-2 flex flex-wrap items-center gap-2">
                  {message.triggeredSkills && message.triggeredSkills.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1">
                      <Sparkles className="h-3 w-3" />
                      <span>
                        {message.triggeredSkills.map(s => s.skillName).join(", ")}
                      </span>
                    </div>
                  )}
                  
                  {message.usageLogIds && message.usageLogIds.length > 0 && (
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-xs text-gray-400 mr-1">這個回答有幫助嗎？</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 border ${
                          message.feedbackGiven === "positive" 
                            ? "bg-black text-white border-black" 
                            : "border-gray-300 text-gray-500 hover:border-black hover:text-black"
                        }`}
                        onClick={() => handleFeedback(index, "positive")}
                        disabled={!!message.feedbackGiven || feedbackMutation.isPending}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 border ${
                          message.feedbackGiven === "negative" 
                            ? "bg-black text-white border-black" 
                            : "border-gray-300 text-gray-500 hover:border-black hover:text-black"
                        }`}
                        onClick={() => handleFeedback(index, "negative")}
                        disabled={!!message.feedbackGiven || feedbackMutation.isPending}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* Loading State with Thinking Expression */}
          {chatMutation.isPending && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-white border border-black flex items-center justify-center overflow-hidden">
                <img
                  src={PENGUIN_EXPRESSIONS.thinking}
                  alt="AI"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div className="bg-white border-2 border-black px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                  <span className="text-sm text-gray-600">正在思考中...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 py-3 border-t-2 border-black bg-white">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="輸入您的問題..."
              className="flex-1 border-2 border-black rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black"
              disabled={chatMutation.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="bg-black hover:bg-gray-800 rounded-none px-4"
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI 回答僅供參考，實際行程請以客服確認為準
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
