import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, User, ThumbsUp, ThumbsDown, Sparkles, X, Minimize2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { useLocale } from "@/contexts/LocaleContext";

// 企鵝表情圖像 URLs (透明背景版本)
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
  const { t } = useLocale();
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: t('aiAdvisor.greeting'),
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
          content: t('aiAdvisor.errorMessage'),
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
      <DialogContent className="max-w-md w-[95vw] sm:w-full h-[85vh] sm:h-[650px] flex flex-col p-0 border-2 border-black gap-0 overflow-hidden bg-white shadow-2xl">
        {/* Hidden DialogTitle and Description for accessibility */}
        <VisuallyHidden>
          <DialogTitle>{t('aiAdvisor.dialogTitle')}</DialogTitle>
          <DialogDescription>{t('aiAdvisor.dialogDescription')}</DialogDescription>
        </VisuallyHidden>
        
        {/* Header with Animated Penguin Character */}
        <div className="bg-black text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* Penguin Avatar with Animation */}
            <div 
              className={`relative w-14 h-14 bg-gradient-to-br from-gray-100 to-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-lg transition-transform duration-300 ${
                isAnimating ? "scale-110" : "scale-100"
              }`}
            >
              <img
                src={currentPenguinImage}
                alt={t('aiAdvisor.title')}
                className={`w-12 h-12 object-contain transition-all duration-300 ${
                  chatMutation.isPending ? "animate-bounce" : ""
                }`}
              />
              {/* Online Status Indicator */}
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-bold text-lg tracking-wide">{t('aiAdvisor.title')}</h3>
              <p className="text-sm text-gray-300 flex items-center gap-1.5">
                {chatMutation.isPending ? (
                  <>
                    <span className="inline-block w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
                    {t('aiAdvisor.thinking')}
                  </>
                ) : (
                  <>
                    <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    {t('aiAdvisor.online')} · {t('aiAdvisor.atYourService')}
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-white hover:bg-white/20 rounded-full"
              onClick={() => onOpenChange(false)}
              aria-label={t('aiAdvisor.minimize')}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-white hover:bg-white/20 rounded-full"
              onClick={() => onOpenChange(false)}
              aria-label={t('aiAdvisor.close')}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((message, index) => (
            <div key={index}>
              <div
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-gray-100 to-white rounded-full border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                    <img
                      src={PENGUIN_EXPRESSIONS.default}
                      alt="AI"
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 shadow-sm ${
                    message.role === "user"
                      ? "bg-black text-white rounded-2xl rounded-br-md"
                      : "bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-md"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="text-sm prose prose-sm max-w-none leading-relaxed">
                      <Streamdown>{message.content}</Streamdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-9 h-9 bg-black text-white rounded-full flex items-center justify-center shadow-sm">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
              
              {/* Triggered Skills & Feedback */}
              {message.role === "assistant" && index > 0 && (
                <div className="ml-12 mt-2 flex flex-wrap items-center gap-2">
                  {message.triggeredSkills && message.triggeredSkills.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      <Sparkles className="h-3 w-3 text-yellow-500" />
                      <span>
                        {message.triggeredSkills.map(s => s.skillName).join(", ")}
                      </span>
                    </div>
                  )}
                  
                  {message.usageLogIds && message.usageLogIds.length > 0 && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="text-xs text-gray-400">{t('aiAdvisor.helpfulQuestion')}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 rounded-full transition-all ${
                          message.feedbackGiven === "positive" 
                            ? "bg-green-100 text-green-600 border border-green-300" 
                            : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                        }`}
                        onClick={() => handleFeedback(index, "positive")}
                        disabled={!!message.feedbackGiven || feedbackMutation.isPending}
                        aria-label={t('aiAdvisor.helpful')}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 rounded-full transition-all ${
                          message.feedbackGiven === "negative" 
                            ? "bg-red-100 text-red-600 border border-red-300" 
                            : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                        }`}
                        onClick={() => handleFeedback(index, "negative")}
                        disabled={!!message.feedbackGiven || feedbackMutation.isPending}
                        aria-label={t('aiAdvisor.notHelpful')}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* Loading indicator */}
          {chatMutation.isPending && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-gray-100 to-white rounded-full border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                <img
                  src={PENGUIN_EXPRESSIONS.thinking}
                  alt="AI"
                  className="w-7 h-7 object-contain animate-pulse"
                />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                  <span className="text-sm text-gray-500">{t('aiAdvisor.thinkingMessage')}</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 py-4 border-t border-gray-200 bg-white shrink-0">
          <div className="flex gap-3 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('aiAdvisor.inputPlaceholder')}
              className="flex-1 h-11 border border-gray-300 rounded-full px-5 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0 focus-visible:border-black bg-gray-50"
              disabled={chatMutation.isPending}
              aria-label={t('aiAdvisor.inputPlaceholder')}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="h-11 w-11 bg-black hover:bg-gray-800 rounded-full p-0 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
              aria-label={t('aiAdvisor.sendMessage')}
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            {t('aiAdvisor.disclaimer')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
