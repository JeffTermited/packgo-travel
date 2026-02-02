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

  // Scheduled Learning Tab Component
  const ScheduledLearningTab = () => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
    const [newSchedule, setNewSchedule] = useState({
      name: '',
      frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
      dayOfWeek: 1,
      dayOfMonth: 1,
      hour: 3,
      minute: 0,
      maxToursPerRun: 10,
      minTourAge: 24,
      autoApplyHighConfidence: false,
      autoApplyThreshold: 0.9,
      notifyOnComplete: true,
      notifyOnNewSuggestions: true,
    });

    // 獲取所有排程
    const { data: schedules, refetch: refetchSchedules } = trpc.skills.getSchedules.useQuery();
    
    // 獲取學習歷史
    const { data: learningHistory, refetch: refetchHistory } = trpc.skills.getLearningHistory.useQuery({ limit: 20 });

    // 創建排程
    const createSchedule = trpc.skills.createSchedule.useMutation({
      onSuccess: () => {
        toast.success('排程已創建');
        setIsCreateDialogOpen(false);
        refetchSchedules();
        setNewSchedule({
          name: '',
          frequency: 'weekly',
          dayOfWeek: 1,
          dayOfMonth: 1,
          hour: 3,
          minute: 0,
          maxToursPerRun: 10,
          minTourAge: 24,
          autoApplyHighConfidence: false,
          autoApplyThreshold: 0.9,
          notifyOnComplete: true,
          notifyOnNewSuggestions: true,
        });
      },
      onError: (error) => {
        toast.error(`創建失敗: ${error.message}`);
      },
    });

    // 更新排程
    const updateSchedule = trpc.skills.updateSchedule.useMutation({
      onSuccess: () => {
        toast.success('排程已更新');
        refetchSchedules();
      },
      onError: (error) => {
        toast.error(`更新失敗: ${error.message}`);
      },
    });

    // 刪除排程
    const deleteSchedule = trpc.skills.deleteSchedule.useMutation({
      onSuccess: () => {
        toast.success('排程已刪除');
        refetchSchedules();
      },
      onError: (error) => {
        toast.error(`刪除失敗: ${error.message}`);
      },
    });

    // 手動觸發排程
    const triggerSchedule = trpc.skills.triggerScheduledLearning.useMutation({
      onSuccess: (result) => {
        toast.success(`學習完成！處理了 ${(result.result as any)?.toursProcessed || 0} 個行程`);
        refetchHistory();
        refetchSchedules();
      },
      onError: (error) => {
        toast.error(`執行失敗: ${error.message}`);
      },
    });

    const frequencyLabels = {
      daily: '每天',
      weekly: '每週',
      monthly: '每月',
    };

    const dayOfWeekLabels = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

    const formatScheduleTime = (schedule: any) => {
      const hour = String(schedule.hour || 0).padStart(2, '0');
      const minute = String(schedule.minute || 0).padStart(2, '0');
      
      if (schedule.frequency === 'daily') {
        return `每天 ${hour}:${minute}`;
      } else if (schedule.frequency === 'weekly') {
        return `每${dayOfWeekLabels[schedule.dayOfWeek || 0]} ${hour}:${minute}`;
      } else {
        return `每月 ${schedule.dayOfMonth || 1} 日 ${hour}:${minute}`;
      }
    };

    return (
      <div className="space-y-6">
        {/* Schedules Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  自動學習排程
                </CardTitle>
                <CardDescription>
                  設定自動學習任務，讓系統定期從新行程中學習
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                新增排程
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {schedules && schedules.length > 0 ? (
              <div className="space-y-4">
                {schedules.map((schedule: any) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={schedule.isEnabled}
                        onCheckedChange={(checked) =>
                          updateSchedule.mutate({ id: schedule.id, isEnabled: checked })
                        }
                      />
                      <div>
                        <p className="font-medium">{schedule.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatScheduleTime(schedule)} | 每次最多 {schedule.maxToursPerRun} 個行程
                        </p>
                        {schedule.lastRunAt && (
                          <p className="text-xs text-muted-foreground">
                            上次執行: {new Date(schedule.lastRunAt).toLocaleString('zh-TW')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerSchedule.mutate({ scheduleId: schedule.id })}
                        disabled={triggerSchedule.isPending}
                      >
                        {triggerSchedule.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSchedule.mutate({ id: schedule.id })}
                        disabled={deleteSchedule.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>尚未設定任何自動學習排程</p>
                <p className="text-sm">點擊「新增排程」開始設定</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning History Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              學習歷史記錄
            </CardTitle>
            <CardDescription>
              查看過去的自動學習結果
            </CardDescription>
          </CardHeader>
          <CardContent>
            {learningHistory && learningHistory.length > 0 ? (
              <div className="space-y-3">
                {learningHistory.map((history: any) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={history.status === 'completed' ? 'default' : history.status === 'failed' ? 'destructive' : 'secondary'}>
                          {history.status === 'completed' ? '完成' : history.status === 'failed' ? '失敗' : '進行中'}
                        </Badge>
                        <span className="text-sm font-medium">
                          {history.sourceType === 'scheduled' ? '排程學習' : history.sourceType === 'manual' ? '手動學習' : '批量學習'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        處理 {history.toursProcessed || 0} 個行程 | 
                        發現 {history.keywordSuggestions || 0} 個關鍵字 | 
                        新技能 {history.newSkillSuggestions || 0} 個
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(history.createdAt).toLocaleString('zh-TW')}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      {history.suggestionsAccepted > 0 && (
                        <p className="text-green-600">採納: {history.suggestionsAccepted}</p>
                      )}
                      {history.suggestionsRejected > 0 && (
                        <p className="text-red-600">拒絕: {history.suggestionsRejected}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>尚無學習歷史記錄</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Schedule Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>新增自動學習排程</DialogTitle>
              <DialogDescription>
                設定系統自動從新行程中學習的時間和參數
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>排程名稱</Label>
                <Input
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  placeholder="例如：每週自動學習"
                />
              </div>
              
              <div className="space-y-2">
                <Label>執行頻率</Label>
                <Select
                  value={newSchedule.frequency}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                    setNewSchedule({ ...newSchedule, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">每天</SelectItem>
                    <SelectItem value="weekly">每週</SelectItem>
                    <SelectItem value="monthly">每月</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newSchedule.frequency === 'weekly' && (
                <div className="space-y-2">
                  <Label>執行日</Label>
                  <Select
                    value={String(newSchedule.dayOfWeek)}
                    onValueChange={(value) =>
                      setNewSchedule({ ...newSchedule, dayOfWeek: Number(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dayOfWeekLabels.map((label, idx) => (
                        <SelectItem key={idx} value={String(idx)}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {newSchedule.frequency === 'monthly' && (
                <div className="space-y-2">
                  <Label>執行日期</Label>
                  <Select
                    value={String(newSchedule.dayOfMonth)}
                    onValueChange={(value) =>
                      setNewSchedule({ ...newSchedule, dayOfMonth: Number(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={String(day)}>{day} 日</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>執行時間 (時)</Label>
                  <Select
                    value={String(newSchedule.hour)}
                    onValueChange={(value) =>
                      setNewSchedule({ ...newSchedule, hour: Number(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                        <SelectItem key={hour} value={String(hour)}>
                          {String(hour).padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>執行時間 (分)</Label>
                  <Select
                    value={String(newSchedule.minute)}
                    onValueChange={(value) =>
                      setNewSchedule({ ...newSchedule, minute: Number(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 15, 30, 45].map((minute) => (
                        <SelectItem key={minute} value={String(minute)}>
                          {String(minute).padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>每次最多處理行程數</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={newSchedule.maxToursPerRun}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, maxToursPerRun: Number(e.target.value) })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>自動應用高信心度建議</Label>
                    <p className="text-xs text-muted-foreground">
                      自動採納信心度超過閾值的建議
                    </p>
                  </div>
                  <Switch
                    checked={newSchedule.autoApplyHighConfidence}
                    onCheckedChange={(checked) =>
                      setNewSchedule({ ...newSchedule, autoApplyHighConfidence: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>完成時通知</Label>
                    <p className="text-xs text-muted-foreground">
                      學習完成後發送通知
                    </p>
                  </div>
                  <Switch
                    checked={newSchedule.notifyOnComplete}
                    onCheckedChange={(checked) =>
                      setNewSchedule({ ...newSchedule, notifyOnComplete: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>新建議通知</Label>
                    <p className="text-xs text-muted-foreground">
                      發現新建議時發送通知
                    </p>
                  </div>
                  <Switch
                    checked={newSchedule.notifyOnNewSuggestions}
                    onCheckedChange={(checked) =>
                      setNewSchedule({ ...newSchedule, notifyOnNewSuggestions: checked })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button
                onClick={() => createSchedule.mutate(newSchedule)}
                disabled={!newSchedule.name || createSchedule.isPending}
              >
                {createSchedule.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                創建排程
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Analytics Tab Component
  const AnalyticsTab = () => {
    const { data: dashboardStats, isLoading: statsLoading } = trpc.skills.getDashboardStats.useQuery();
    const { data: learningTrends, isLoading: trendsLoading } = trpc.skills.getLearningTrends.useQuery({ days: 30 });
    const { data: adoptionRates, isLoading: adoptionLoading } = trpc.skills.getAdoptionRates.useQuery();
    const { data: sourceDistribution, isLoading: sourceLoading } = trpc.skills.getSourceDistribution.useQuery();
    const { data: prioritizedTours, isLoading: toursLoading } = trpc.skills.getPrioritizedTours.useQuery({ limit: 5 });

    const isLoading = statsLoading || trendsLoading || adoptionLoading || sourceLoading;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{dashboardStats?.totalLearnings || 0}</p>
                <p className="text-sm text-muted-foreground">總學習次數</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{dashboardStats?.totalKeywordsSuggested || 0}</p>
                <p className="text-sm text-muted-foreground">建議關鍵字</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{dashboardStats?.totalSkillsSuggested || 0}</p>
                <p className="text-sm text-muted-foreground">建議技能</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{dashboardStats?.overallAdoptionRate?.toFixed(1) || 0}%</p>
                <p className="text-sm text-muted-foreground">採納率</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{dashboardStats?.pendingReviews || 0}</p>
                <p className="text-sm text-muted-foreground">待審核</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{dashboardStats?.activeSkills || 0}</p>
                <p className="text-sm text-muted-foreground">已啟用技能</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Learning Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                學習趨勢 (過去 30 天)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {learningTrends && learningTrends.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-end gap-1 h-32">
                    {learningTrends.slice(-14).map((day: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t"
                        style={{ height: `${Math.max(10, (day.learningCount / Math.max(...learningTrends.map((d: any) => d.learningCount || 1))) * 100)}%` }}
                        title={`${day.date}: ${day.learningCount} 次學習`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{learningTrends[learningTrends.length - 14]?.date || ''}</span>
                    <span>{learningTrends[learningTrends.length - 1]?.date || ''}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>尚無學習趨勢數據</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Adoption Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                技能採納率
              </CardTitle>
            </CardHeader>
            <CardContent>
              {adoptionRates && adoptionRates.length > 0 ? (
                <div className="space-y-3">
                  {adoptionRates.map((rate: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{rate.category}</span>
                        <span className="font-medium">{rate.count} ({rate.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            rate.category === '已批准' ? 'bg-green-500' :
                            rate.category === '已拒絕' ? 'bg-red-500' :
                            rate.category === '待審核' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${rate.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>尚無採納率數據</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Source Distribution & Prioritized Tours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                學習來源分佈
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sourceDistribution && sourceDistribution.length > 0 ? (
                <div className="space-y-3">
                  {sourceDistribution.map((source: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                      <span className="font-medium">{source.source}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{source.count} 次</span>
                        <Badge variant="outline">{source.percentage.toFixed(1)}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>尚無來源分佈數據</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prioritized Tours for Learning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                優先學習行程
              </CardTitle>
              <CardDescription>
                根據熱門度排名，尚未學習的行程
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prioritizedTours && prioritizedTours.length > 0 ? (
                <div className="space-y-2">
                  {prioritizedTours.map((tour: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{tour.title}</p>
                        <p className="text-xs text-muted-foreground">{tour.destination}</p>
                      </div>
                      <div className="text-right text-xs">
                        <p>瀏覽: {tour.viewCount}</p>
                        <p>預訂: {tour.bookingCount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>所有行程已學習完成</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Review Queue Tab Component
  const ReviewQueueTab = () => {
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'merged' | undefined>('pending');
    const { data: reviewQueue, isLoading, refetch } = trpc.skills.getReviewQueue.useQuery({ status: statusFilter, limit: 20 });
    const approveSkill = trpc.skills.approveSkill.useMutation({
      onSuccess: () => {
        toast.success('技能已批准並建立');
        refetch();
      },
      onError: (error) => toast.error(`批准失敗: ${error.message}`),
    });
    const rejectSkill = trpc.skills.rejectSkill.useMutation({
      onSuccess: () => {
        toast.success('技能已拒絕');
        refetch();
      },
      onError: (error) => toast.error(`拒絕失敗: ${error.message}`),
    });

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Filter */}
        <div className="flex items-center gap-4">
          <Label>狀態篩選：</Label>
          <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? undefined : v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="pending">待審核</SelectItem>
              <SelectItem value="approved">已批准</SelectItem>
              <SelectItem value="rejected">已拒絕</SelectItem>
              <SelectItem value="merged">已合併</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            共 {reviewQueue?.total || 0} 項
          </span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重新整理
          </Button>
        </div>

        {/* Review Items */}
        {reviewQueue?.items && reviewQueue.items.length > 0 ? (
          <div className="space-y-4">
            {reviewQueue.items.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.skillName}</h3>
                        <Badge variant={item.status === 'pending' ? 'secondary' : item.status === 'approved' ? 'default' : 'destructive'}>
                          {item.status === 'pending' ? '待審核' : item.status === 'approved' ? '已批准' : item.status === 'rejected' ? '已拒絕' : '已合併'}
                        </Badge>
                        <Badge variant="outline">{item.skillType}</Badge>
                        {item.confidence && (
                          <Badge variant="outline" className="bg-blue-50">
                            信心度: {(Number(item.confidence) * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {item.keywords && JSON.parse(item.keywords).slice(0, 5).map((kw: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{kw}</Badge>
                        ))}
                        {item.keywords && JSON.parse(item.keywords).length > 5 && (
                          <Badge variant="secondary" className="text-xs">+{JSON.parse(item.keywords).length - 5}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        來源: {item.sourceType === 'ai_learning' ? 'AI 學習' : item.sourceType === 'scheduled' ? '排程學習' : '手動新增'}
                        {item.sourceTourId && ` | 行程 ID: ${item.sourceTourId}`}
                        {' | '}建立時間: {new Date(item.createdAt).toLocaleString('zh-TW')}
                      </p>
                    </div>
                    {item.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => approveSkill.mutate({ reviewId: item.id })}
                          disabled={approveSkill.isPending}
                        >
                          {approveSkill.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ThumbsUp className="h-4 w-4 mr-1" />
                          )}
                          批准
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => rejectSkill.mutate({ reviewId: item.id })}
                          disabled={rejectSkill.isPending}
                        >
                          {rejectSkill.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ThumbsDown className="h-4 w-4 mr-1" />
                          )}
                          拒絕
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>沒有{statusFilter === 'pending' ? '待審核' : ''}的技能</p>
              </div>
            </CardContent>
          </Card>
        )}
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
          <TabsTrigger value="scheduled-learning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            自動排程
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            學習分析
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            審核佇列
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

        {/* Scheduled Learning Tab */}
        <TabsContent value="scheduled-learning" className="mt-4">
          <ScheduledLearningTab />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <AnalyticsTab />
        </TabsContent>

        {/* Review Queue Tab */}
        <TabsContent value="review" className="mt-4">
          <ReviewQueueTab />
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
