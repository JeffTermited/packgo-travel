import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Brain,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Tag,
  Clock,
  BarChart3,
  Loader2,
  Play,
  BookOpen,
  AlertTriangle,
  GraduationCap,
  ThumbsUp,
  ThumbsDown,
  Wand2,
  Database,
  Zap,
  GitBranch,
  TestTube,
  FileText,
  Target,
  Lightbulb,
  Shield,
  TrendingUp,
  Eye,
  ChevronRight,
} from "lucide-react";

// 技能類型選項（對應後端 schema 的 skillType enum）
const SKILL_TYPE_OPTIONS = [
  { value: "feature_classification", label: "特色分類", color: "bg-purple-100 text-purple-800", icon: Tag },
  { value: "tag_rule", label: "標籤規則", color: "bg-blue-100 text-blue-800", icon: Target },
  { value: "itinerary_structure", label: "行程結構", color: "bg-green-100 text-green-800", icon: FileText },
  { value: "highlight_detection", label: "亮點識別", color: "bg-yellow-100 text-yellow-800", icon: Lightbulb },
  { value: "transportation_type", label: "交通類型", color: "bg-orange-100 text-orange-800", icon: GitBranch },
  { value: "meal_classification", label: "餐食分類", color: "bg-pink-100 text-pink-800", icon: Zap },
  { value: "accommodation_type", label: "住宿類型", color: "bg-indigo-100 text-indigo-800", icon: Shield },
] as const;

// Superpowers 風格的技能分類
const SKILL_CATEGORY_OPTIONS = [
  { value: "technique", label: "技術", description: "具體方法，有明確步驟可循", color: "bg-emerald-100 text-emerald-800" },
  { value: "pattern", label: "模式", description: "思考問題的方式", color: "bg-amber-100 text-amber-800" },
  { value: "reference", label: "參考", description: "API 文檔、語法指南", color: "bg-cyan-100 text-cyan-800" },
] as const;

type SkillType = typeof SKILL_TYPE_OPTIONS[number]["value"];
type SkillCategory = typeof SKILL_CATEGORY_OPTIONS[number]["value"];

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description?: string;
}

export default function SkillsTab() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  
  // Form state with Superpowers-style fields
  const [formData, setFormData] = useState({
    skillName: "",
    skillType: "feature_classification" as SkillType,
    skillCategory: "technique" as SkillCategory,
    description: "",
    keywords: "",
    isActive: true,
    // Superpowers-style documentation
    whenToUse: "",
    corePattern: "",
    quickReference: "",
    commonMistakes: "",
    realWorldImpact: "",
    // Test cases
    testCases: [] as TestCase[],
  });

  // New test case form
  const [newTestCase, setNewTestCase] = useState({
    input: "",
    expectedOutput: "",
    description: "",
  });

  // Queries
  const { data: skills, isLoading, refetch } = trpc.skills.list.useQuery();
  const { data: stats } = trpc.skills.getStats.useQuery();

  // 過濾技能
  const filteredSkills = skills?.filter(skill => {
    const typeMatch = filterType === "all" || skill.skillType === filterType;
    const categoryMatch = filterCategory === "all" || skill.skillCategory === filterCategory;
    return typeMatch && categoryMatch;
  });

  // Mutations
  const createSkill = trpc.skills.create.useMutation({
    onSuccess: () => {
      toast.success("技能已新增", { description: "新技能已成功加入資料庫" });
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("新增失敗", { description: error.message });
    },
  });

  const updateSkill = trpc.skills.update.useMutation({
    onSuccess: () => {
      toast.success("技能已更新", { description: "技能資訊已成功更新" });
      setIsEditDialogOpen(false);
      setSelectedSkillId(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("更新失敗", { description: error.message });
    },
  });

  const deleteSkill = trpc.skills.delete.useMutation({
    onSuccess: () => {
      toast.success("技能已刪除", { description: "技能已從資料庫中移除" });
      refetch();
    },
    onError: (error) => {
      toast.error("刪除失敗", { description: error.message });
    },
  });

  const initializeBuiltIn = trpc.skills.initializeBuiltIn.useMutation({
    onSuccess: () => {
      toast.success("內建技能已初始化", { description: "已載入預設技能" });
      refetch();
    },
    onError: (error) => {
      toast.error("初始化失敗", { description: error.message });
    },
  });

  const runTests = trpc.skills.runTests.useMutation({
    onSuccess: (data) => {
      if (data.totalTests === 0) {
        toast.info("無測試案例", { description: "此技能尚未定義測試案例" });
      } else {
        const passRate = (data.passRate * 100).toFixed(0);
        if (data.passRate === 1) {
          toast.success("所有測試通過", { description: `${data.passedTests}/${data.totalTests} 測試通過 (${passRate}%)` });
        } else if (data.passRate >= 0.5) {
          toast.warning("部分測試失敗", { description: `${data.passedTests}/${data.totalTests} 測試通過 (${passRate}%)` });
        } else {
          toast.error("多數測試失敗", { description: `${data.passedTests}/${data.totalTests} 測試通過 (${passRate}%)` });
        }
      }
      refetch();
    },
    onError: (error) => {
      toast.error("測試執行失敗", { description: error.message });
    },
  });

  const resetForm = () => {
    setFormData({
      skillName: "",
      skillType: "feature_classification",
      skillCategory: "technique",
      description: "",
      keywords: "",
      isActive: true,
      whenToUse: "",
      corePattern: "",
      quickReference: "",
      commonMistakes: "",
      realWorldImpact: "",
      testCases: [],
    });
    setNewTestCase({ input: "", expectedOutput: "", description: "" });
  };

  const handleAdd = () => {
    const keywordsArray = formData.keywords
      .split(",")
      .map(k => k.trim())
      .filter(Boolean);
    
    createSkill.mutate({
      skillName: formData.skillName,
      skillType: formData.skillType,
      skillCategory: formData.skillCategory,
      description: formData.description || undefined,
      keywords: keywordsArray,
      rules: {},
      whenToUse: formData.whenToUse || undefined,
      corePattern: formData.corePattern || undefined,
      quickReference: formData.quickReference || undefined,
      commonMistakes: formData.commonMistakes || undefined,
      realWorldImpact: formData.realWorldImpact || undefined,
      testCases: formData.testCases.length > 0 ? formData.testCases : undefined,
    });
  };

  const handleEdit = () => {
    if (!selectedSkillId) return;
    
    const keywordsArray = formData.keywords
      .split(",")
      .map(k => k.trim())
      .filter(Boolean);
    
    updateSkill.mutate({
      id: selectedSkillId,
      skillName: formData.skillName,
      skillCategory: formData.skillCategory,
      description: formData.description || undefined,
      keywords: keywordsArray,
      isActive: formData.isActive,
      whenToUse: formData.whenToUse || undefined,
      corePattern: formData.corePattern || undefined,
      quickReference: formData.quickReference || undefined,
      commonMistakes: formData.commonMistakes || undefined,
      realWorldImpact: formData.realWorldImpact || undefined,
      testCases: formData.testCases.length > 0 ? formData.testCases : undefined,
    });
  };

  const handleDelete = (skillId: number, skillName: string) => {
    if (confirm(`確定要刪除技能「${skillName}」嗎？`)) {
      deleteSkill.mutate({ id: skillId });
    }
  };

  const addTestCase = () => {
    if (!newTestCase.input || !newTestCase.expectedOutput) return;
    
    const testCase: TestCase = {
      id: `test-${Date.now()}`,
      input: newTestCase.input,
      expectedOutput: newTestCase.expectedOutput,
      description: newTestCase.description || undefined,
    };
    
    setFormData({
      ...formData,
      testCases: [...formData.testCases, testCase],
    });
    setNewTestCase({ input: "", expectedOutput: "", description: "" });
  };

  const removeTestCase = (testCaseId: string) => {
    setFormData({
      ...formData,
      testCases: formData.testCases.filter(tc => tc.id !== testCaseId),
    });
  };

  const openEditDialog = (skill: NonNullable<typeof skills>[number]) => {
    setSelectedSkillId(skill.id);
    
    let keywordsStr = "";
    try {
      const keywordsArray = JSON.parse(skill.keywords || "[]");
      keywordsStr = Array.isArray(keywordsArray) ? keywordsArray.join(", ") : "";
    } catch {
      keywordsStr = "";
    }

    let testCases: TestCase[] = [];
    try {
      testCases = JSON.parse(skill.testCases as string || "[]");
    } catch {
      testCases = [];
    }
    
    setFormData({
      skillName: skill.skillName,
      skillType: skill.skillType as SkillType,
      skillCategory: (skill.skillCategory || "technique") as SkillCategory,
      description: skill.description || "",
      keywords: keywordsStr,
      isActive: skill.isActive,
      whenToUse: skill.whenToUse || "",
      corePattern: skill.corePattern || "",
      quickReference: skill.quickReference || "",
      commonMistakes: skill.commonMistakes || "",
      realWorldImpact: skill.realWorldImpact || "",
      testCases,
    });
    setIsEditDialogOpen(true);
  };

  const openDetailDialog = (skill: NonNullable<typeof skills>[number]) => {
    setSelectedSkillId(skill.id);
    
    let keywordsStr = "";
    try {
      const keywordsArray = JSON.parse(skill.keywords || "[]");
      keywordsStr = Array.isArray(keywordsArray) ? keywordsArray.join(", ") : "";
    } catch {
      keywordsStr = "";
    }

    let testCases: TestCase[] = [];
    try {
      testCases = JSON.parse(skill.testCases as string || "[]");
    } catch {
      testCases = [];
    }
    
    setFormData({
      skillName: skill.skillName,
      skillType: skill.skillType as SkillType,
      skillCategory: (skill.skillCategory || "technique") as SkillCategory,
      description: skill.description || "",
      keywords: keywordsStr,
      isActive: skill.isActive,
      whenToUse: skill.whenToUse || "",
      corePattern: skill.corePattern || "",
      quickReference: skill.quickReference || "",
      commonMistakes: skill.commonMistakes || "",
      realWorldImpact: skill.realWorldImpact || "",
      testCases,
    });
    setIsDetailDialogOpen(true);
  };

  const getTypeBadge = (skillType: string) => {
    const type = SKILL_TYPE_OPTIONS.find(t => t.value === skillType);
    return type ? (
      <Badge className={type.color}>{type.label}</Badge>
    ) : (
      <Badge variant="secondary">{skillType}</Badge>
    );
  };

  const getCategoryBadge = (skillCategory: string | null) => {
    const category = SKILL_CATEGORY_OPTIONS.find(c => c.value === skillCategory);
    return category ? (
      <Badge variant="outline" className={category.color}>{category.label}</Badge>
    ) : (
      <Badge variant="outline">技術</Badge>
    );
  };

  const parseKeywords = (keywordsJson: string | null): string[] => {
    if (!keywordsJson) return [];
    try {
      const parsed = JSON.parse(keywordsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Stats Overview Component
  const StatsOverview = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats?.totalSkills || 0}</p>
              <p className="text-xs text-muted-foreground">總技能數</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats?.activeSkills || 0}</p>
              <p className="text-xs text-muted-foreground">啟用中</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats?.totalUsage || 0}</p>
              <p className="text-xs text-muted-foreground">總使用次數</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{stats?.overallSuccessRate || 0}%</p>
              <p className="text-xs text-muted-foreground">成功率</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Category Distribution Component
  const CategoryDistribution = () => (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">技能分類分佈</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {SKILL_CATEGORY_OPTIONS.map(cat => (
            <div key={cat.value} className="flex items-center gap-2">
              <Badge className={cat.color}>
                {stats?.byCategory?.[cat.value as keyof typeof stats.byCategory] || 0}
              </Badge>
              <span className="text-sm">{cat.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // AI Learning Tab Component
  const AILearningTab = () => {
    const [isLearning, setIsLearning] = useState(false);
    const [learningResults, setLearningResults] = useState<any>(null);
    const [selectedTourId, setSelectedTourId] = useState<string>("");
    
    // 獲取所有行程用於學習
    const { data: tours } = trpc.tours.list.useQuery();
    
    // AI 學習 mutation
    const aiLearn = trpc.skills.aiLearn.useMutation({
      onSuccess: (result) => {
        setLearningResults(result);
        setIsLearning(false);
        toast.success(`學習完成！發現 ${result.keywordSuggestions?.length || 0} 個新關鍵字建議`);
        refetch();
      },
      onError: (error) => {
        setIsLearning(false);
        toast.error(`學習失敗: ${error.message}`);
      },
    });
    
    // 應用關鍵字建議
    const applyKeywords = trpc.skills.applyLearnedKeywords.useMutation({
      onSuccess: () => {
        toast.success("關鍵字已成功新增到技能");
        refetch();
      },
      onError: (error) => {
        toast.error(`應用失敗: ${error.message}`);
      },
    });
    
    // 創建新技能
    const createSkill = trpc.skills.createSuggestedSkill.useMutation({
      onSuccess: () => {
        toast.success("新技能已成功創建");
        refetch();
      },
      onError: (error) => {
        toast.error(`創建失敗: ${error.message}`);
      },
    });
    
    const handleLearnFromTour = async () => {
      if (!selectedTourId) {
        toast.error("請選擇一個行程");
        return;
      }
      
      const tour = tours?.find(t => t.id === Number(selectedTourId));
      if (!tour) return;
      
      setIsLearning(true);
      
      // 準備學習內容
      const content = [
        tour.title,
        tour.description,
        tour.highlights,
        tour.dailyItinerary,
        tour.attractions,
      ].filter(Boolean).join('\n\n');
      
      aiLearn.mutate({
        content,
        metadata: {
          title: tour.title,
          source: `行程 ID: ${tour.id}`,
          country: tour.destinationCountry || undefined,
        },
      });
    };
    
    const handleLearnFromAllTours = async () => {
      if (!tours || tours.length === 0) {
        toast.error("沒有可用的行程資料");
        return;
      }
      
      setIsLearning(true);
      toast.info(`開始從 ${tours.length} 個行程中學習...`);
      
      // 逐個學習以避免過載
      let totalSuggestions = 0;
      for (const tour of tours.slice(0, 5)) { // 限制前 5 個避免過載
        const content = [
          tour.title,
          tour.description,
          tour.highlights,
          tour.dailyItinerary,
        ].filter(Boolean).join('\n\n');
        
        try {
          const result = await aiLearn.mutateAsync({
            content,
            metadata: {
              title: tour.title,
              source: `行程 ID: ${tour.id}`,
              country: tour.destinationCountry || undefined,
            },
          });
          totalSuggestions += result.keywordSuggestions?.length || 0;
        } catch (e) {
          console.error(`學習行程 ${tour.id} 失敗:`, e);
        }
      }
      
      setIsLearning(false);
      toast.success(`批量學習完成！共發現 ${totalSuggestions} 個新關鍵字建議`);
    };
    
    return (
      <div className="space-y-6">
        {/* Learning Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              AI 自動學習
            </CardTitle>
            <CardDescription>
              讓 AI 從現有行程內容中自動學習新的關鍵字和模式，持續優化技能系統
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 單一行程學習 */}
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label>選擇行程進行學習</Label>
                <Select value={selectedTourId} onValueChange={setSelectedTourId}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇一個行程..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tours?.map(tour => (
                      <SelectItem key={tour.id} value={String(tour.id)}>
                        {tour.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleLearnFromTour}
                disabled={isLearning || !selectedTourId}
              >
                {isLearning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                開始學習
              </Button>
            </div>
            
            <Separator />
            
            {/* 批量學習 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">批量學習</p>
                <p className="text-sm text-muted-foreground">
                  從所有行程中學習新的關鍵字和模式（最多 5 個）
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLearnFromAllTours}
                disabled={isLearning || !tours?.length}
              >
                {isLearning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                批量學習
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Learning Results */}
        {learningResults && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">學習結果</CardTitle>
              <CardDescription>
                處理時間: {learningResults.stats?.processingTimeMs || 0}ms | 
                發現關鍵字: {learningResults.stats?.totalKeywordsFound || 0} | 
                新關鍵字: {learningResults.stats?.newKeywordsFound || 0}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 關鍵字建議 */}
              {learningResults.keywordSuggestions?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    關鍵字建議 ({learningResults.keywordSuggestions.length})
                  </h4>
                  {learningResults.keywordSuggestions.map((suggestion: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{suggestion.skillName}</p>
                          <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                        </div>
                        <Badge variant="outline">
                          信心度: {Math.round((suggestion.confidence || 0) * 100)}%
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.newKeywords?.map((kw: string, kwIdx: number) => (
                          <Badge key={kwIdx} variant="secondary">{kw}</Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => applyKeywords.mutate({
                            skillId: suggestion.skillId,
                            newKeywords: suggestion.newKeywords,
                          })}
                          disabled={applyKeywords.isPending}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          採納
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setLearningResults({
                              ...learningResults,
                              keywordSuggestions: learningResults.keywordSuggestions.filter(
                                (_: any, i: number) => i !== idx
                              ),
                            });
                          }}
                        >
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          忽略
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 新技能建議 */}
              {learningResults.newSkillSuggestions?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    新技能建議 ({learningResults.newSkillSuggestions.length})
                  </h4>
                  {learningResults.newSkillSuggestions.map((suggestion: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{suggestion.skillName}</p>
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                        </div>
                        <Badge variant="outline">
                          信心度: {Math.round((suggestion.confidence || 0) * 100)}%
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.keywords?.map((kw: string, kwIdx: number) => (
                          <Badge key={kwIdx} variant="secondary">{kw}</Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => createSkill.mutate({
                            skillName: suggestion.skillName,
                            skillType: suggestion.skillType,
                            category: 'technique',
                            description: suggestion.description,
                            keywords: suggestion.keywords,
                            whenToUse: suggestion.whenToUse,
                            corePattern: suggestion.corePattern,
                          })}
                          disabled={createSkill.isPending}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          創建技能
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setLearningResults({
                              ...learningResults,
                              newSkillSuggestions: learningResults.newSkillSuggestions.filter(
                                (_: any, i: number) => i !== idx
                              ),
                            });
                          }}
                        >
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          忽略
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 識別出的標籤 */}
              {learningResults.identifiedTags?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    識別出的標籤 ({learningResults.identifiedTags.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {learningResults.identifiedTags.map((tag: any, idx: number) => (
                      <Badge 
                        key={idx} 
                        variant={tag.isNew ? "default" : "secondary"}
                        className={tag.isNew ? "bg-green-100 text-green-800" : ""}
                      >
                        {tag.tag}
                        {tag.isNew && <span className="ml-1 text-xs">(新)</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 無結果 */}
              {!learningResults.keywordSuggestions?.length && 
               !learningResults.newSkillSuggestions?.length && 
               !learningResults.identifiedTags?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>未發現新的學習內容</p>
                  <p className="text-sm">現有技能已能充分覆蓋此行程的特徵</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Learning Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              學習提示
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• AI 會從行程內容中自動識別新的關鍵字和模式</li>
              <li>• 建議的關鍵字需要您審核後才會新增到技能中</li>
              <li>• 新技能建議需要您確認後才會創建</li>
              <li>• 學習過程中會自動跳過已存在的關鍵字</li>
              <li>• 建議定期從新上架的行程中進行學習以保持技能更新</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">AI Agent 技能管理</h2>
            <p className="text-sm text-muted-foreground">
              基於 Superpowers 架構的模組化技能系統
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => initializeBuiltIn.mutate()}
            disabled={initializeBuiltIn.isPending}
          >
            {initializeBuiltIn.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            初始化內建技能
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            重新整理
          </Button>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            新增技能
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Category Distribution */}
      <CategoryDistribution />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">技能總覽</TabsTrigger>
          <TabsTrigger value="techniques">技術</TabsTrigger>
          <TabsTrigger value="patterns">模式</TabsTrigger>
          <TabsTrigger value="references">參考</TabsTrigger>
          <TabsTrigger value="ai-learning" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI 學習
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          {/* Filter */}
          <div className="flex items-center gap-4 mb-4">
            <Label>篩選類型：</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="選擇類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {SKILL_TYPE_OPTIONS.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label>篩選分類：</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="選擇分類" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {SKILL_CATEGORY_OPTIONS.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              共 {filteredSkills?.length || 0} 個技能
            </span>
          </div>

          {/* Skills Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSkills && filteredSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map((skill) => {
                const keywords = parseKeywords(skill.keywords);
                const hasDocumentation = skill.whenToUse || skill.corePattern || skill.commonMistakes;
                const testPassRate = skill.testPassRate ? Number(skill.testPassRate) * 100 : null;
                
                return (
                  <Card 
                    key={skill.id} 
                    className={`${!skill.isActive ? "opacity-60" : ""} hover:shadow-md transition-shadow cursor-pointer`}
                    onClick={() => openDetailDialog(skill)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {skill.skillName}
                            {skill.isActive ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {getTypeBadge(skill.skillType)}
                            {getCategoryBadge(skill.skillCategory)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => runTests.mutate({ skillId: skill.id })}
                            disabled={runTests.isPending}
                          >
                            {runTests.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(skill)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(skill.id, skill.skillName)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {skill.description && (
                        <CardDescription className="text-sm line-clamp-2">
                          {skill.description}
                        </CardDescription>
                      )}
                      
                      {/* Documentation indicator */}
                      {hasDocumentation && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          <span>包含 Superpowers 文檔</span>
                        </div>
                      )}
                      
                      {/* Keywords */}
                      {keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <Tag className="h-3 w-3 text-muted-foreground mt-1" />
                          {keywords.slice(0, 4).map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {keywords.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{keywords.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          使用 {skill.usageCount} 次
                        </div>
                        {testPassRate !== null && (
                          <div className="flex items-center gap-1">
                            <TestTube className="h-3 w-3" />
                            測試 {testPassRate.toFixed(0)}%
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(skill.createdAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">尚無技能資料</p>
                <p className="text-sm text-muted-foreground mt-1">
                  點擊「初始化內建技能」載入預設技能，或手動新增技能
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Category-specific tabs */}
        {["techniques", "patterns", "references"].map((tabValue) => {
          const categoryValue = tabValue === "techniques" ? "technique" : tabValue === "patterns" ? "pattern" : "reference";
          const categorySkills = skills?.filter(s => s.skillCategory === categoryValue) || [];
          
          return (
            <TabsContent key={tabValue} value={tabValue} className="mt-4">
              {categorySkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorySkills.map((skill) => {
                    const keywords = parseKeywords(skill.keywords);
                    
                    return (
                      <Card 
                        key={skill.id} 
                        className={`${!skill.isActive ? "opacity-60" : ""} hover:shadow-md transition-shadow cursor-pointer`}
                        onClick={() => openDetailDialog(skill)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            {skill.skillName}
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </CardTitle>
                          {getTypeBadge(skill.skillType)}
                        </CardHeader>
                        <CardContent>
                          {skill.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {skill.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">此分類尚無技能</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          );
        })}

        {/* AI Learning Tab */}
        <TabsContent value="ai-learning" className="mt-4">
          <AILearningTab />
        </TabsContent>
      </Tabs>

      {/* Add Dialog with Superpowers-style fields */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增技能</DialogTitle>
            <DialogDescription>
              新增一個 AI Agent 可以學習和應用的技能（支援 Superpowers 風格文檔）
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基本資訊</TabsTrigger>
              <TabsTrigger value="documentation">文檔</TabsTrigger>
              <TabsTrigger value="testing">測試案例</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>技能名稱 *</Label>
                  <Input
                    value={formData.skillName}
                    onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                    placeholder="例如：ESG 永續旅遊識別"
                  />
                </div>
                <div className="space-y-2">
                  <Label>技能類型 *</Label>
                  <Select
                    value={formData.skillType}
                    onValueChange={(value) => setFormData({ ...formData, skillType: value as SkillType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILL_TYPE_OPTIONS.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>技能分類（Superpowers 風格）</Label>
                <Select
                  value={formData.skillCategory}
                  onValueChange={(value) => setFormData({ ...formData, skillCategory: value as SkillCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_CATEGORY_OPTIONS.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex flex-col">
                          <span>{cat.label}</span>
                          <span className="text-xs text-muted-foreground">{cat.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="技能的詳細描述..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>關鍵字（以逗號分隔）</Label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="例如：永續, 環保, 綠色旅遊, ESG"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>啟用此技能</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="documentation" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  何時使用 (When to Use)
                </Label>
                <Textarea
                  value={formData.whenToUse}
                  onChange={(e) => setFormData({ ...formData, whenToUse: e.target.value })}
                  placeholder="描述此技能應該在什麼情況下被觸發..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  核心模式 (Core Pattern)
                </Label>
                <Textarea
                  value={formData.corePattern}
                  onChange={(e) => setFormData({ ...formData, corePattern: e.target.value })}
                  placeholder="描述此技能的核心邏輯和執行步驟..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  快速參考 (Quick Reference)
                </Label>
                <Textarea
                  value={formData.quickReference}
                  onChange={(e) => setFormData({ ...formData, quickReference: e.target.value })}
                  placeholder="常用操作的速查表..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  常見錯誤 (Common Mistakes)
                </Label>
                <Textarea
                  value={formData.commonMistakes}
                  onChange={(e) => setFormData({ ...formData, commonMistakes: e.target.value })}
                  placeholder="使用此技能時應避免的陷阱..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  實際影響 (Real World Impact)
                </Label>
                <Textarea
                  value={formData.realWorldImpact}
                  onChange={(e) => setFormData({ ...formData, realWorldImpact: e.target.value })}
                  placeholder="使用此技能能帶來的實際效果..."
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="testing" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <Label className="flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    新增測試案例
                  </Label>
                  <div className="space-y-2">
                    <Input
                      value={newTestCase.input}
                      onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                      placeholder="輸入內容（例如：行程描述文字）"
                    />
                    <Input
                      value={newTestCase.expectedOutput}
                      onChange={(e) => setNewTestCase({ ...newTestCase, expectedOutput: e.target.value })}
                      placeholder="預期輸出（例如：ESG, 永續旅遊）"
                    />
                    <Input
                      value={newTestCase.description}
                      onChange={(e) => setNewTestCase({ ...newTestCase, description: e.target.value })}
                      placeholder="測試描述（選填）"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTestCase}
                      disabled={!newTestCase.input || !newTestCase.expectedOutput}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      新增測試案例
                    </Button>
                  </div>
                </div>
                
                {formData.testCases.length > 0 && (
                  <div className="space-y-2">
                    <Label>已新增的測試案例 ({formData.testCases.length})</Label>
                    {formData.testCases.map((tc, idx) => (
                      <div key={tc.id} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">測試 #{idx + 1}</p>
                          <p className="text-xs text-muted-foreground truncate">輸入: {tc.input}</p>
                          <p className="text-xs text-muted-foreground truncate">預期: {tc.expectedOutput}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeTestCase(tc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAdd} disabled={createSkill.isPending || !formData.skillName}>
              {createSkill.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>編輯技能</DialogTitle>
            <DialogDescription>
              修改技能的資訊和設定
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基本資訊</TabsTrigger>
              <TabsTrigger value="documentation">文檔</TabsTrigger>
              <TabsTrigger value="testing">測試案例</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>技能名稱</Label>
                  <Input
                    value={formData.skillName}
                    onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>技能類型</Label>
                  <Select value={formData.skillType} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILL_TYPE_OPTIONS.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">技能類型建立後無法更改</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>技能分類</Label>
                <Select
                  value={formData.skillCategory}
                  onValueChange={(value) => setFormData({ ...formData, skillCategory: value as SkillCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_CATEGORY_OPTIONS.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label} - {cat.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>關鍵字（以逗號分隔）</Label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>啟用此技能</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="documentation" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  何時使用
                </Label>
                <Textarea
                  value={formData.whenToUse}
                  onChange={(e) => setFormData({ ...formData, whenToUse: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  核心模式
                </Label>
                <Textarea
                  value={formData.corePattern}
                  onChange={(e) => setFormData({ ...formData, corePattern: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  快速參考
                </Label>
                <Textarea
                  value={formData.quickReference}
                  onChange={(e) => setFormData({ ...formData, quickReference: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  常見錯誤
                </Label>
                <Textarea
                  value={formData.commonMistakes}
                  onChange={(e) => setFormData({ ...formData, commonMistakes: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  實際影響
                </Label>
                <Textarea
                  value={formData.realWorldImpact}
                  onChange={(e) => setFormData({ ...formData, realWorldImpact: e.target.value })}
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="testing" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <Label>新增測試案例</Label>
                  <div className="space-y-2">
                    <Input
                      value={newTestCase.input}
                      onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                      placeholder="輸入內容"
                    />
                    <Input
                      value={newTestCase.expectedOutput}
                      onChange={(e) => setNewTestCase({ ...newTestCase, expectedOutput: e.target.value })}
                      placeholder="預期輸出"
                    />
                    <Input
                      value={newTestCase.description}
                      onChange={(e) => setNewTestCase({ ...newTestCase, description: e.target.value })}
                      placeholder="測試描述（選填）"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTestCase}
                      disabled={!newTestCase.input || !newTestCase.expectedOutput}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      新增
                    </Button>
                  </div>
                </div>
                
                {formData.testCases.length > 0 && (
                  <div className="space-y-2">
                    <Label>測試案例 ({formData.testCases.length})</Label>
                    {formData.testCases.map((tc, idx) => (
                      <div key={tc.id} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">測試 #{idx + 1}</p>
                          <p className="text-xs text-muted-foreground truncate">輸入: {tc.input}</p>
                          <p className="text-xs text-muted-foreground truncate">預期: {tc.expectedOutput}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeTestCase(tc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEdit} disabled={updateSkill.isPending || !formData.skillName}>
              {updateSkill.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {formData.skillName}
              {getCategoryBadge(formData.skillCategory)}
            </DialogTitle>
            <DialogDescription>
              {formData.description || "無描述"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Type and Keywords */}
            <div className="flex items-center gap-2 flex-wrap">
              {getTypeBadge(formData.skillType)}
              {formData.keywords.split(",").filter(Boolean).map((kw, idx) => (
                <Badge key={idx} variant="outline">{kw.trim()}</Badge>
              ))}
            </div>
            
            <Separator />
            
            {/* Superpowers Documentation */}
            <Accordion type="multiple" className="w-full">
              {formData.whenToUse && (
                <AccordionItem value="when-to-use">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      何時使用
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm whitespace-pre-wrap">{formData.whenToUse}</p>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {formData.corePattern && (
                <AccordionItem value="core-pattern">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      核心模式
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm whitespace-pre-wrap">{formData.corePattern}</p>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {formData.quickReference && (
                <AccordionItem value="quick-reference">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      快速參考
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm whitespace-pre-wrap">{formData.quickReference}</p>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {formData.commonMistakes && (
                <AccordionItem value="common-mistakes">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      常見錯誤
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm whitespace-pre-wrap">{formData.commonMistakes}</p>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {formData.realWorldImpact && (
                <AccordionItem value="real-world-impact">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      實際影響
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm whitespace-pre-wrap">{formData.realWorldImpact}</p>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {formData.testCases.length > 0 && (
                <AccordionItem value="test-cases">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <TestTube className="h-4 w-4" />
                      測試案例 ({formData.testCases.length})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {formData.testCases.map((tc, idx) => (
                        <div key={tc.id} className="p-2 border rounded text-sm">
                          <p className="font-medium">測試 #{idx + 1}</p>
                          <p className="text-muted-foreground">輸入: {tc.input}</p>
                          <p className="text-muted-foreground">預期: {tc.expectedOutput}</p>
                          {tc.description && <p className="text-xs">{tc.description}</p>}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              關閉
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedSkillId) {
                  runTests.mutate({ skillId: selectedSkillId });
                }
              }}
              disabled={runTests.isPending || formData.testCases.length === 0}
            >
              {runTests.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              執行測試
            </Button>
            <Button onClick={() => {
              setIsDetailDialogOpen(false);
              setIsEditDialogOpen(true);
            }}>
              <Pencil className="h-4 w-4 mr-2" />
              編輯
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
