import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
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

type SkillType = "feature_classification" | "tag_rule" | "itinerary_structure" | "highlight_detection" | "transportation_type" | "meal_classification" | "accommodation_type";
type SkillCategory = "technique" | "pattern" | "reference";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description?: string;
}

export default function SkillsTab() {
  const { t } = useLocale();

  // 技能類型選項（對應後端 schema 的 skillType enum）
  const SKILL_TYPE_OPTIONS = [
    { value: "feature_classification" as SkillType, label: t('admin.skillsTab.categoryFeature'), color: "bg-purple-100 text-purple-800", icon: Tag },
    { value: "tag_rule" as SkillType, label: t('admin.skillsTab.categoryTagRule'), color: "bg-blue-100 text-blue-800", icon: Target },
    { value: "itinerary_structure" as SkillType, label: t('admin.skillsTab.categoryItinerary'), color: "bg-green-100 text-green-800", icon: FileText },
    { value: "highlight_detection" as SkillType, label: t('admin.skillsTab.categoryHighlight'), color: "bg-yellow-100 text-yellow-800", icon: Lightbulb },
    { value: "transportation_type" as SkillType, label: t('admin.skillsTab.categoryTransport'), color: "bg-orange-100 text-orange-800", icon: GitBranch },
    { value: "meal_classification" as SkillType, label: t('admin.skillsTab.categoryMeal'), color: "bg-pink-100 text-pink-800", icon: Zap },
    { value: "accommodation_type" as SkillType, label: t('admin.skillsTab.categoryAccommodation'), color: "bg-indigo-100 text-indigo-800", icon: Shield },
  ];

  // Superpowers 風格的技能分類
  const SKILL_CATEGORY_OPTIONS = [
    { value: "technique" as SkillCategory, label: t('admin.skillsTab.typeTechnique'), description: t('admin.skillsTab.typeTechniqueDesc'), color: "bg-emerald-100 text-emerald-800" },
    { value: "pattern" as SkillCategory, label: t('admin.skillsTab.typePattern'), description: t('admin.skillsTab.typePatternDesc'), color: "bg-amber-100 text-amber-800" },
    { value: "reference" as SkillCategory, label: t('admin.skillsTab.typeReference'), description: t('admin.skillsTab.typeReferenceDesc'), color: "bg-cyan-100 text-cyan-800" },
  ];

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
      toast.success(t('admin.skillsTab.addSuccess'), { description: t('admin.skillsTab.addSuccessDesc') });
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(t('admin.skillsTab.addError'), { description: error.message });
    },
  });

  const updateSkill = trpc.skills.update.useMutation({
    onSuccess: () => {
      toast.success(t('admin.skillsTab.updateSuccess'), { description: t('admin.skillsTab.updateSuccessDesc') });
      setIsEditDialogOpen(false);
      setSelectedSkillId(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(t('admin.skillsTab.updateError'), { description: error.message });
    },
  });

  const deleteSkill = trpc.skills.delete.useMutation({
    onSuccess: () => {
      toast.success(t('admin.skillsTab.deleteSuccess'), { description: t('admin.skillsTab.deleteSuccessDesc') });
      refetch();
    },
    onError: (error) => {
      toast.error(t('admin.skillsTab.deleteError'), { description: error.message });
    },
  });

  const initializeBuiltIn = trpc.skills.initializeBuiltIn.useMutation({
    onSuccess: () => {
      toast.success(t('admin.skillsTab.initSuccess'), { description: t('admin.skillsTab.initSuccessDesc') });
      refetch();
    },
    onError: (error) => {
      toast.error(t('admin.skillsTab.initError'), { description: error.message });
    },
  });

  const runTests = trpc.skills.runTests.useMutation({
    onSuccess: (data) => {
      if (data.totalTests === 0) {
        toast.info(t('admin.skillsTab.noTestCases'), { description: t('admin.skillsTab.noTestCasesDesc') });
      } else {
        const passRate = (data.passRate * 100).toFixed(0);
        if (data.passRate === 1) {
          toast.success(t('admin.skillsTab.allTestsPassed'), { description: `${data.passedTests}/${data.totalTests} 測試通過 (${passRate}%)` });
        } else if (data.passRate >= 0.5) {
          toast.warning(t('admin.skillsTab.someTestsFailed'), { description: `${data.passedTests}/${data.totalTests} 測試通過 (${passRate}%)` });
        } else {
          toast.error(t('admin.skillsTab.mostTestsFailed'), { description: `${data.passedTests}/${data.totalTests} 測試通過 (${passRate}%)` });
        }
      }
      refetch();
    },
    onError: (error) => {
      toast.error(t('admin.skillsTab.testRunError'), { description: error.message });
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
    if (confirm(t('admin.skillsTab.confirmDelete').replace('{name}', skillName))) {
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
      <span>{t('admin.skillsTab.typeTechniqueLabel')}</span>
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
              <p className="text-xs text-muted-foreground">{t('admin.skillsTab.statTotal')}</p>
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
              <p className="text-xs text-muted-foreground">{t('admin.skillsTab.statActive')}</p>
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
              <p className="text-xs text-muted-foreground">{t('admin.skillsTab.statUsage')}</p>
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
              <p className="text-xs text-muted-foreground">{t('admin.skillsTab.statSuccessRate')}</p>
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
        <CardTitle className="text-sm">{t('admin.skillsTab.categoryDistribution')}</CardTitle>
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
        toast.success(t('admin.skillsTab.learnComplete').replace('{count}', String(result.keywordSuggestions?.length || 0)));
        refetch();
      },
      onError: (error) => {
        setIsLearning(false);
        toast.error(t('admin.skillsTab.learnError').replace('{msg}', error.message));
      },
    });
    
    // 應用關鍵字建議
    const applyKeywords = trpc.skills.applyLearnedKeywords.useMutation({
      onSuccess: () => {
        toast.success(t('admin.skillsTab.keywordAdded'));
        refetch();
      },
      onError: (error) => {
        toast.error(t('admin.skillsTab.applyError').replace('{msg}', error.message));
      },
    });
    
    // 創建新技能
    const createSkill = trpc.skills.createSuggestedSkill.useMutation({
      onSuccess: () => {
        toast.success(t('admin.skillsTab.skillCreated'));
        refetch();
      },
      onError: (error) => {
        toast.error(t('admin.skillsTab.createError').replace('{msg}', error.message));
      },
    });
    
    const handleLearnFromTour = async () => {
      if (!selectedTourId) {
        toast.error(t('admin.skillsTab.selectTourFirst'));
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
        toast.error(t('admin.skillsTab.noTourData'));
        return;
      }
      
      setIsLearning(true);
      toast.info(t('admin.skillsTab.batchLearnStart').replace('{count}', String(tours.length)));
      
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
      toast.success(t('admin.skillsTab.batchLearnComplete').replace('{count}', String(totalSuggestions)));
    };
    
    return (
      <div className="space-y-6">
        {/* Learning Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              {t('admin.skillsTab.aiLearningTitle')}
            </CardTitle>
            <CardDescription>
              {t('admin.skillsTab.aiLearningDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 單一行程學習 */}
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label>{t('admin.skillsTab.selectTourLabel')}</Label>
                <Select value={selectedTourId} onValueChange={setSelectedTourId}>
                  <SelectTrigger>
                    <SelectValue {...{placeholder: t('admin.skillsTab.selectTourPlaceholder')}} />
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
                {t('admin.skillsTab.startLearning')}
              </Button>
            </div>
            
            <Separator />
            
            {/* 批量學習 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('admin.skillsTab.batchLearn')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('admin.skillsTab.batchLearnDesc')}
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
                {t('admin.skillsTab.batchLearnBtn')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Learning Results */}
        {learningResults && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('admin.skillsTab.learnResults')}</CardTitle>
              <CardDescription>
                {t('admin.skillsTab.processingTime').replace('{ms}', String(learningResults.stats?.processingTimeMs || 0))} | 
                {t('admin.skillsTab.foundKeywords').replace('{count}', String(learningResults.stats?.totalKeywordsFound || 0))} | 
                {t('admin.skillsTab.newKeywords').replace('{count}', String(learningResults.stats?.newKeywordsFound || 0))}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 關鍵字建議 */}
              {learningResults.keywordSuggestions?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    {t('admin.skillsTab.keywordSuggestions').replace('{count}', String(learningResults.keywordSuggestions.length))}
                  </h4>
                  {learningResults.keywordSuggestions.map((suggestion: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{suggestion.skillName}</p>
                          <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                        </div>
                        <Badge variant="outline">
                          {t('admin.skillsTab.confidence').replace('{pct}', String(Math.round((suggestion.confidence || 0) * 100)))}
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
                          {t('admin.skillsTab.accept')}
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
                          {t('admin.skillsTab.ignore')}
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
                    {t('admin.skillsTab.newSkillSuggestions').replace('{count}', String(learningResults.newSkillSuggestions.length))}
                  </h4>
                  {learningResults.newSkillSuggestions.map((suggestion: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{suggestion.skillName}</p>
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                        </div>
                        <Badge variant="outline">
                          {t('admin.skillsTab.confidence').replace('{pct}', String(Math.round((suggestion.confidence || 0) * 100)))}
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
                          {t('admin.skillsTab.createSkill')}
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
                          {t('admin.skillsTab.ignore')}
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
                    {t('admin.skillsTab.identifiedTags').replace('{count}', String(learningResults.identifiedTags.length))}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {learningResults.identifiedTags.map((tag: any, idx: number) => (
                      <Badge 
                        key={idx} 
                        variant={tag.isNew ? "default" : "secondary"}
                        className={tag.isNew ? "bg-green-100 text-green-800" : ""}
                      >
                        {tag.tag}
                        {tag.isNew && <span className="ml-1 text-xs">({t('admin.skillsTab.newTag')})</span>}
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
                  <p>{t('admin.skillsTab.noNewContent')}</p>
                  <p className="text-sm">{t('admin.skillsTab.existingSkillsCover')}</p>
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
              {t('admin.skillsTab.learningTips')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t('admin.skillsTab.tip1')}</li>
              <li>{t('admin.skillsTab.tip2')}</li>
              <li>{t('admin.skillsTab.tip3')}</li>
              <li>{t('admin.skillsTab.tip4')}</li>
              <li>{t('admin.skillsTab.tip5')}</li>
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
        toast.success(t('admin.skillsTab.scheduleCreated'));
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
        toast.error(t('admin.skillsTab.createError').replace('{msg}', error.message));
      },
    });

    // 更新排程
    const updateSchedule = trpc.skills.updateSchedule.useMutation({
      onSuccess: () => {
        toast.success(t('admin.skillsTab.scheduleUpdated'));
        refetchSchedules();
      },
      onError: (error) => {
        toast.error(t('admin.skillsTab.scheduleUpdateError').replace('{msg}', error.message));
      },
    });

    // 刪除排程
    const deleteSchedule = trpc.skills.deleteSchedule.useMutation({
      onSuccess: () => {
        toast.success(t('admin.skillsTab.scheduleDeleted'));
        refetchSchedules();
      },
      onError: (error) => {
        toast.error(t('admin.skillsTab.scheduleDeleteError').replace('{msg}', error.message));
      },
    });

    // 手動觸發排程
    const triggerSchedule = trpc.skills.triggerScheduledLearning.useMutation({
      onSuccess: (result) => {
        toast.success(t('admin.skillsTab.scheduleRunComplete').replace('{count}', String((result.result as any)?.toursProcessed || 0)));
        refetchHistory();
        refetchSchedules();
      },
      onError: (error) => {
        toast.error(t('admin.skillsTab.scheduleRunError').replace('{msg}', error.message));
      },
    });

    const frequencyLabels = {
      daily: t('admin.skillsTab.freqDaily'),
      weekly: t('admin.skillsTab.freqWeekly'),
      monthly: t('admin.skillsTab.freqMonthly'),
    };

    const dayOfWeekLabels = [t('admin.skillsTab.sun'), t('admin.skillsTab.mon'), t('admin.skillsTab.tue'), t('admin.skillsTab.wed'), t('admin.skillsTab.thu'), t('admin.skillsTab.fri'), t('admin.skillsTab.sat')];

    const formatScheduleTime = (schedule: any) => {
      const hour = String(schedule.hour || 0).padStart(2, '0');
      const minute = String(schedule.minute || 0).padStart(2, '0');
      
      if (schedule.frequency === 'daily') {
        return t('admin.skillsTab.scheduleEveryDay').replace('{h}', hour).replace('{m}', minute);
      } else if (schedule.frequency === 'weekly') {
        return t('admin.skillsTab.scheduleEveryWeek').replace('{day}', dayOfWeekLabels[schedule.dayOfWeek || 0]).replace('{h}', hour).replace('{m}', minute);
      } else {
        return t('admin.skillsTab.scheduleEveryMonth').replace('{d}', String(schedule.dayOfMonth || 1)).replace('{h}', hour).replace('{m}', minute);
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
                  {t('admin.skillsTab.autoScheduleTitle')}
                </CardTitle>
                <CardDescription>
                  {t('admin.skillsTab.autoScheduleDesc')}
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.skillsTab.addSchedule')}
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
                          {formatScheduleTime(schedule)} | {t('admin.skillsTab.maxToursPerRun').replace('{n}', String(schedule.maxToursPerRun))}
                        </p>
                        {schedule.lastRunAt && (
                          <p className="text-xs text-muted-foreground">
                            {t('admin.skillsTab.lastRun')} {new Date(schedule.lastRunAt).toLocaleString()}
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
                <p>{t('admin.skillsTab.noSchedules')}</p>
                <p className="text-sm">{t('admin.skillsTab.noSchedulesHint')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning History Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t('admin.skillsTab.learningHistory')}
            </CardTitle>
            <CardDescription>
              {t('admin.skillsTab.learningHistoryDesc')}
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
                          {history.status === 'completed' ? t('admin.skillsTab.statusCompleted') : history.status === 'failed' ? t('admin.skillsTab.statusFailed') : t('admin.skillsTab.statusRunning')}
                        </Badge>
                        <span className="text-sm font-medium">
                          {history.sourceType === 'scheduled' ? t('admin.skillsTab.sourceScheduled') : history.sourceType === 'manual' ? t('admin.skillsTab.sourceManual') : t('admin.skillsTab.sourceBatch')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('admin.skillsTab.histProcessed').replace('{n}', String(history.toursProcessed || 0))} | 
                        {t('admin.skillsTab.histKeywords').replace('{n}', String(history.keywordSuggestions || 0))} | 
                        {t('admin.skillsTab.histNewSkills').replace('{n}', String(history.newSkillSuggestions || 0))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(history.createdAt).toLocaleString('zh-TW')}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      {history.suggestionsAccepted > 0 && (
                        <p className="text-green-600">{t('admin.skillsTab.histAccepted').replace('{n}', String(history.suggestionsAccepted))}</p>
                      )}
                      {history.suggestionsRejected > 0 && (
                        <p className="text-red-600">{t('admin.skillsTab.histRejected').replace('{n}', String(history.suggestionsRejected))}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('admin.skillsTab.noHistory')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Schedule Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('admin.skillsTab.addScheduleTitle')}</DialogTitle>
              <DialogDescription>
                {t('admin.skillsTab.addScheduleDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('admin.skillsTab.scheduleName')}</Label>
                <Input
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  {...{placeholder: t('admin.skillsTab.scheduleNamePlaceholder')}}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('admin.skillsTab.frequency')}</Label>
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
                    <SelectItem value="daily">{t('admin.skillsTab.freqDaily')}</SelectItem>
                    <SelectItem value="weekly">{t('admin.skillsTab.freqWeekly')}</SelectItem>
                    <SelectItem value="monthly">{t('admin.skillsTab.freqMonthly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newSchedule.frequency === 'weekly' && (
                <div className="space-y-2">
                  <Label>{t('admin.skillsTab.dayOfWeekLabel')}</Label>
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
                  <Label>{t('admin.skillsTab.dayOfMonthLabel')}</Label>
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
                        <SelectItem key={day} value={String(day)}>{t('admin.skillsTab.dayUnit').replace('{d}', String(day))}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.skillsTab.hourLabel')}</Label>
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
                  <Label>{t('admin.skillsTab.minuteLabel')}</Label>
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
                <Label>{t('admin.skillsTab.maxToursLabel')}</Label>
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
                    <Label>{t('admin.skillsTab.autoApplyLabel')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('admin.skillsTab.autoApplyDesc')}
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
                    <Label>{t('admin.skillsTab.notifyOnComplete')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('admin.skillsTab.notifyOnCompleteDesc')}
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
                    <Label>{t('admin.skillsTab.notifyOnNew')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('admin.skillsTab.notifyOnNewDesc')}
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
                {t('admin.skillsTab.cancel')}
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
                {t('admin.skillsTab.createSchedule')}
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
                <p className="text-sm text-muted-foreground">{t('admin.skillsTab.totalLearning')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{dashboardStats?.totalKeywordsSuggested || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.skillsTab.suggestedKeywords')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{dashboardStats?.totalSkillsSuggested || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.skillsTab.suggestedSkills')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{dashboardStats?.overallAdoptionRate?.toFixed(1) || 0}%</p>
                <p className="text-sm text-muted-foreground">{t('admin.skillsTab.acceptanceRate')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{dashboardStats?.pendingReviews || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.skillsTab.pendingReview')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{dashboardStats?.activeSkills || 0}</p>
                <p className="text-sm text-muted-foreground">{t('admin.skillsTab.enabledSkills')}</p>
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
                {t('admin.skillsTab.learningTrend')}
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
                        title={`${day.date}: ${day.learningCount} ${t('admin.skillsTab.learningCount')}`}
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
                  <p>{t('admin.skillsTab.noTrendData')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Adoption Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t('admin.skillsTab.skillAcceptanceRate')}
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
                            rate.category === t('admin.skillsTab.approved') ? 'bg-green-500' :
                            rate.category === t('admin.skillsTab.rejected') ? 'bg-red-500' :
                            rate.category === t('admin.skillsTab.pending') ? 'bg-amber-500' : 'bg-blue-500'
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
                  <p>{t('admin.skillsTab.noAcceptanceData')}</p>
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
                {t('admin.skillsTab.learningSourceDist')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sourceDistribution && sourceDistribution.length > 0 ? (
                <div className="space-y-3">
                  {sourceDistribution.map((source: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                      <span className="font-medium">{source.source}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{t('admin.skillsTab.sourceCount').replace('{n}', String(source.count))}</span>
                        <Badge variant="outline">{source.percentage.toFixed(1)}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('admin.skillsTab.noSourceData')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prioritized Tours for Learning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t('admin.skillsTab.priorityTours')}
              </CardTitle>
              <CardDescription>
                {t('admin.skillsTab.priorityToursDesc')}
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
                        <p>{t('admin.skillsTab.views').replace('{n}', String(tour.viewCount))}</p>
                        <p>{t('admin.skillsTab.bookings').replace('{n}', String(tour.bookingCount))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('admin.skillsTab.allToursLearned')}</p>
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
        toast.success(t('admin.skillsTab.approveSuccess'));
        refetch();
      },
      onError: (error) => toast.error(t('admin.skillsTab.approveError').replace('{msg}', error.message)),
    });
    const rejectSkill = trpc.skills.rejectSkill.useMutation({
      onSuccess: () => {
        toast.success(t('admin.skillsTab.rejectSuccess'));
        refetch();
      },
      onError: (error) => toast.error(t('admin.skillsTab.rejectError').replace('{msg}', error.message)),
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
          <Label>{t('admin.skillsTab.statusFilter')}</Label>
          <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? undefined : v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.skillsTab.filterAll')}</SelectItem>
              <SelectItem value="pending">{t('admin.skillsTab.filterPending')}</SelectItem>
              <SelectItem value="approved">{t('admin.skillsTab.filterApproved')}</SelectItem>
              <SelectItem value="rejected">{t('admin.skillsTab.filterRejected')}</SelectItem>
              <SelectItem value="merged">{t('admin.skillsTab.filterMerged')}</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {t('admin.skillsTab.totalItems').replace('{n}', String(reviewQueue?.total || 0))}
          </span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('admin.skillsTab.refresh')}
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
                          {item.status === 'pending' ? t('admin.skillsTab.filterPending') : item.status === 'approved' ? t('admin.skillsTab.filterApproved') : item.status === 'rejected' ? t('admin.skillsTab.filterRejected') : t('admin.skillsTab.filterMerged')}
                        </Badge>
                        <Badge variant="outline">{item.skillType}</Badge>
                        {item.confidence && (
                          <Badge variant="outline" className="bg-blue-50">
                            {t('admin.skillsTab.confidence').replace('{pct}', (Number(item.confidence) * 100).toFixed(0))}
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
                        {t('admin.skillsTab.source')}: {item.sourceType === 'ai_learning' ? t('admin.skillsTab.sourceAI') : item.sourceType === 'scheduled' ? t('admin.skillsTab.sourceScheduled') : t('admin.skillsTab.sourceManual')}
                        {item.sourceTourId && ` | ${t('admin.skillsTab.tourId')}: ${item.sourceTourId}`}
                        {' | '}{t('admin.skillsTab.createdAt')} {new Date(item.createdAt).toLocaleString()}
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
                          {t('admin.skillsTab.approve')}
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
                          {t('admin.skillsTab.reject')}
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
                <p>{t('admin.skillsTab.noSkillsWithStatus').replace('{status}', statusFilter === 'pending' ? t('admin.skillsTab.filterPending') : '')}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Performance Tab Component
  const PerformanceTab = () => {
    const { data: dashboard, isLoading } = trpc.skills.getPerformanceDashboard.useQuery({ days: 30 });
    const { data: skillSummary } = trpc.skills.getSkillPerformanceSummary.useQuery({ days: 30 });

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    const summary = dashboard?.summary || {};

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.skillsTab.totalTriggers')}</p>
                  <p className="text-2xl font-bold">{summary.totalTriggers || 0}</p>
                </div>
                <Zap className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.skillsTab.successRate')}</p>
                  <p className="text-2xl font-bold">
                    {((summary.overallSuccessRate || 0) * 100).toFixed(1)}%
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.skillsTab.satisfaction')}</p>
                  <p className="text-2xl font-bold">
                    {((summary.overallSatisfactionRate || 0) * 100).toFixed(1)}%
                  </p>
                </div>
                <ThumbsUp className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.skillsTab.conversionRate')}</p>
                  <p className="text-2xl font-bold">
                    {((summary.overallConversionRate || 0) * 100).toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.skillsTab.performanceRanking')}</CardTitle>
            <CardDescription>{t('admin.skillsTab.performanceRankingDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {skillSummary && skillSummary.length > 0 ? (
              <div className="space-y-3">
                {skillSummary.slice(0, 10).map((skill: any, index: number) => (
                  <div key={skill.skillId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{skill.skillName}</p>
                        <p className="text-sm text-muted-foreground">
                          {skill.totalTriggers} {t('admin.skillsTab.triggers')} | 
                          {t('admin.skillsTab.successRateVal').replace('{pct}', (skill.successRate * 100).toFixed(0))} | 
                          {t('admin.skillsTab.satisfactionVal').replace('{pct}', (skill.satisfactionRate * 100).toFixed(0))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {skill.positiveCount}
                      </Badge>
                      <Badge variant="outline" className="text-red-600">
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        {skill.negativeCount}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('admin.skillsTab.noPerformanceData')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.skillsTab.recentUsage')}</CardTitle>
            <CardDescription>{t('admin.skillsTab.recentUsageDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard?.recentLogs && dashboard.recentLogs.length > 0 ? (
              <div className="space-y-2">
                {dashboard.recentLogs.slice(0, 10).map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <Badge variant={log.wasSuccessful ? 'default' : 'destructive'} className="text-xs">
                        {log.wasSuccessful ? t('admin.skillsTab.success') : t('admin.skillsTab.failure')}
                      </Badge>
                      <span className="font-medium">{log.skillName}</span>
                      <span className="text-sm text-muted-foreground">{log.contextType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.userFeedback === 'positive' && <ThumbsUp className="h-4 w-4 text-green-500" />}
                      {log.userFeedback === 'negative' && <ThumbsDown className="h-4 w-4 text-red-500" />}
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.triggeredAt).toLocaleString('zh-TW')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('admin.skillsTab.noUsageLog')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Auto Rules Tab Component
  const AutoRulesTab = () => {
    const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
    const [newRule, setNewRule] = useState({
      ruleName: '',
      description: '',
      ruleType: 'confidence_threshold' as const,
      conditions: [{ field: 'confidence', operator: '>=' as const, value: 0.9 }],
      action: 'auto_approve' as const,
      priority: 50,
    });

    const { data: rules, isLoading, refetch } = trpc.skills.getAutoApprovalRules.useQuery();
    const { data: stats } = trpc.skills.getRuleStatistics.useQuery();
    const createRule = trpc.skills.createAutoApprovalRule.useMutation({
      onSuccess: () => {
        toast.success(t('admin.skillsTab.ruleCreated'));
        setIsAddRuleOpen(false);
        refetch();
      },
      onError: (error) => toast.error(error.message),
    });
    const updateRule = trpc.skills.updateAutoApprovalRule.useMutation({
      onSuccess: () => {
        toast.success(t('admin.skillsTab.ruleUpdated'));
        refetch();
      },
      onError: (error) => toast.error(error.message),
    });
    const deleteRule = trpc.skills.deleteAutoApprovalRule.useMutation({
      onSuccess: () => {
        toast.success(t('admin.skillsTab.ruleDeleted'));
        refetch();
      },
      onError: (error) => toast.error(error.message),
    });
    const initializeDefault = trpc.skills.initializeDefaultRules.useMutation({
      onSuccess: () => {
        toast.success(t('admin.skillsTab.defaultRulesInit'));
        refetch();
      },
      onError: (error) => toast.error(error.message),
    });

    const RULE_TYPES = [
      { value: 'confidence_threshold', label: t('admin.skillsTab.condConfidence') },
      { value: 'source_type', label: t('admin.skillsTab.condSource') },
      { value: 'keyword_count', label: t('admin.skillsTab.condKeywordCount') },
      { value: 'skill_category', label: t('admin.skillsTab.condCategory') },
      { value: 'combined', label: t('admin.skillsTab.condCombined') },
    ];

    const ACTIONS = [
      { value: 'auto_approve', label: t('admin.skillsTab.actionAutoApprove'), color: 'text-green-600' },
      { value: 'auto_reject', label: t('admin.skillsTab.actionAutoReject'), color: 'text-red-600' },
      { value: 'flag_priority', label: t('admin.skillsTab.actionFlagPriority'), color: 'text-yellow-600' },
      { value: 'notify_admin', label: t('admin.skillsTab.actionNotifyAdmin'), color: 'text-blue-600' },
    ];

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.skillsTab.totalRules')}</p>
                  <p className="text-2xl font-bold">{stats?.totalRules || 0}</p>
                </div>
                <Zap className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.skillsTab.activeRules')}</p>
                  <p className="text-2xl font-bold">{stats?.activeRules || 0}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.skillsTab.totalTriggers')}</p>
                  <p className="text-2xl font-bold">{stats?.totalTriggered || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => initializeDefault.mutate()}
                  disabled={initializeDefault.isPending}
                >
                  {initializeDefault.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  {t('admin.skillsTab.initDefaults')}
                </Button>
                <Button size="sm" onClick={() => setIsAddRuleOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('admin.skillsTab.addRule')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.skillsTab.autoRulesTitle')}</CardTitle>
            <CardDescription>{t('admin.skillsTab.autoRulesDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {rules && rules.length > 0 ? (
              <div className="space-y-3">
                {rules.map((rule: any) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{rule.ruleName}</h4>
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? t('admin.skillsTab.enabled') : t('admin.skillsTab.disabled')}
                        </Badge>
                        <Badge variant="outline">
                          {RULE_TYPES.find(t => t.value === rule.ruleType)?.label}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={ACTIONS.find(a => a.value === rule.action)?.color}
                        >
                          {ACTIONS.find(a => a.value === rule.action)?.label}
                        </Badge>
                      </div>
                      {rule.description && (
                        <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('admin.skillsTab.rulePriority').replace('{p}', String(rule.priority)).replace('{t}', String(rule.timesTriggered))}
                        {rule.lastTriggeredAt && ` | t('admin.skillsTab.lastTriggered').replace('{d}', new Date(rule.lastTriggeredAt).toLocaleString())`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) => 
                          updateRule.mutate({ ruleId: rule.id, isActive: checked })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRule.mutate({ ruleId: rule.id })}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('admin.skillsTab.noRules')}</p>
                <p className="text-sm">{t('admin.skillsTab.noRulesHint')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Rule Dialog */}
        <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('admin.skillsTab.addRuleTitle')}</DialogTitle>
              <DialogDescription>{t('admin.skillsTab.addRuleDesc')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('admin.skillsTab.ruleName')}</Label>
                <Input
                  value={newRule.ruleName}
                  onChange={(e) => setNewRule({ ...newRule, ruleName: e.target.value })}
                  {...{placeholder: t('admin.skillsTab.ruleNamePlaceholder')}}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.skillsTab.ruleDescription')}</Label>
                <Textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  {...{placeholder: t('admin.skillsTab.ruleDescPlaceholder')}}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.skillsTab.ruleType')}</Label>
                  <Select
                    value={newRule.ruleType}
                    onValueChange={(v: any) => setNewRule({ ...newRule, ruleType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RULE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.skillsTab.ruleAction')}</Label>
                  <Select
                    value={newRule.action}
                    onValueChange={(v: any) => setNewRule({ ...newRule, action: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIONS.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('admin.skillsTab.confidenceThreshold')}</Label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newRule.conditions[0]?.value || 0.9}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    conditions: [{ field: 'confidence', operator: '>=', value: parseFloat(e.target.value) }]
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.skillsTab.rulePriorityLabel')}</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newRule.priority}
                  onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddRuleOpen(false)}>{t('admin.skillsTab.cancel')}</Button>
              <Button
                onClick={() => createRule.mutate(newRule)}
                disabled={createRule.isPending || !newRule.ruleName}
              >
                {createRule.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t('admin.skillsTab.createRule')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            <h2 className="text-xl font-semibold">{t('admin.skillsTab.title')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('admin.skillsTab.subtitle')}
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
            {t('admin.skillsTab.initBuiltin')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('admin.skillsTab.refresh')}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('admin.skillsTab.addSkillTitle')}
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
          <TabsTrigger value="overview">{t('admin.skillsTab.tabOverview')}</TabsTrigger>
          <TabsTrigger value="techniques">{t('admin.skillsTab.tabTechniques')}</TabsTrigger>
          <TabsTrigger value="patterns">{t('admin.skillsTab.tabPatterns')}</TabsTrigger>
          <TabsTrigger value="references">{t('admin.skillsTab.tabReferences')}</TabsTrigger>
          <TabsTrigger value="ai-learning" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {t('admin.skillsTab.tabAILearning')}
          </TabsTrigger>
          <TabsTrigger value="scheduled-learning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {t('admin.skillsTab.tabAutoSchedule')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            {t('admin.skillsTab.tabAnalytics')}
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {t('admin.skillsTab.tabReviewQueue')}
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {t('admin.skillsTab.tabPerformance')}
          </TabsTrigger>
          <TabsTrigger value="auto-rules" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {t('admin.skillsTab.tabAutoRules')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          {/* Filter */}
          <div className="flex items-center gap-4 mb-4">
            <Label>{t('admin.skillsTab.filterType')}</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue {...{placeholder: t('admin.skillsTab.selectType')}} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.skillsTab.filterAll')}</SelectItem>
                {SKILL_TYPE_OPTIONS.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label>{t('admin.skillsTab.filterCategory')}</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue {...{placeholder: t('admin.skillsTab.selectCategory')}} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.skillsTab.filterAll')}</SelectItem>
                {SKILL_CATEGORY_OPTIONS.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {t('admin.skillsTab.totalSkills').replace('{n}', String(filteredSkills?.length || 0))}
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
                          <span>{t('admin.skillsTab.hasSuperpowers')}</span>
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
                          {t('admin.skillsTab.usageCount').replace('{n}', String(skill.usageCount))}
                        </div>
                        {testPassRate !== null && (
                          <div className="flex items-center gap-1">
                            <TestTube className="h-3 w-3" />
                            {t('admin.skillsTab.testRate').replace('{pct}', testPassRate.toFixed(0))}
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
                <p className="text-muted-foreground">{t('admin.skillsTab.noSkills')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('admin.skillsTab.noSkillsHint')}
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
                    <p className="text-muted-foreground">{t('admin.skillsTab.noCategorySkills')}</p>
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

        <TabsContent value="performance" className="mt-4">
          <PerformanceTab />
        </TabsContent>

        <TabsContent value="auto-rules" className="mt-4">
          <AutoRulesTab />
        </TabsContent>
      </Tabs>

      {/* Add Dialog with Superpowers-style fields */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.skillsTab.addSkillTitle')}</DialogTitle>
            <DialogDescription>
              {t('admin.skillsTab.addSkillDesc')}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">{t('admin.skillsTab.tabBasicInfo')}</TabsTrigger>
              <TabsTrigger value="documentation">{t('admin.skillsTab.tabDocumentation')}</TabsTrigger>
              <TabsTrigger value="testing">{t('admin.skillsTab.tabTestCases')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.skillsTab.skillName')}</Label>
                  <Input
                    value={formData.skillName}
                    onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                    {...{placeholder: t('admin.skillsTab.skillNamePlaceholder')}}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.skillsTab.skillType')}</Label>
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
                <Label>{t('admin.skillsTab.skillCategory')}</Label>
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
                <Label>{t('admin.skillsTab.ruleDescription')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  {...{placeholder: t('admin.skillsTab.descriptionPlaceholder')}}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('admin.skillsTab.keywords')}</Label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  {...{placeholder: t('admin.skillsTab.keywordsPlaceholder')}}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>{t('admin.skillsTab.enableSkill')}</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="documentation" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {t('admin.skillsTab.whenToUse')}
                </Label>
                <Textarea
                  value={formData.whenToUse}
                  onChange={(e) => setFormData({ ...formData, whenToUse: e.target.value })}
                  {...{placeholder: t('admin.skillsTab.whenToUsePlaceholder')}}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  {t('admin.skillsTab.corePattern')}
                </Label>
                <Textarea
                  value={formData.corePattern}
                  onChange={(e) => setFormData({ ...formData, corePattern: e.target.value })}
                  {...{placeholder: t('admin.skillsTab.corePatternPlaceholder')}}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {t('admin.skillsTab.quickRef')}
                </Label>
                <Textarea
                  value={formData.quickReference}
                  onChange={(e) => setFormData({ ...formData, quickReference: e.target.value })}
                  {...{placeholder: t('admin.skillsTab.quickRefPlaceholder')}}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t('admin.skillsTab.commonMistakes')}
                </Label>
                <Textarea
                  value={formData.commonMistakes}
                  onChange={(e) => setFormData({ ...formData, commonMistakes: e.target.value })}
                  {...{placeholder: t('admin.skillsTab.commonMistakesPlaceholder')}}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('admin.skillsTab.realWorldImpact')}
                </Label>
                <Textarea
                  value={formData.realWorldImpact}
                  onChange={(e) => setFormData({ ...formData, realWorldImpact: e.target.value })}
                  {...{placeholder: t('admin.skillsTab.realWorldImpactPlaceholder')}}
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="testing" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <Label className="flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    {t('admin.skillsTab.addTestCaseLabel')}
                  </Label>
                  <div className="space-y-2">
                    <Input
                      value={newTestCase.input}
                      onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                      {...{placeholder: t('admin.skillsTab.testInputPlaceholder')}}
                    />
                    <Input
                      value={newTestCase.expectedOutput}
                      onChange={(e) => setNewTestCase({ ...newTestCase, expectedOutput: e.target.value })}
                      {...{placeholder: t('admin.skillsTab.testOutputPlaceholder')}}
                    />
                    <Input
                      value={newTestCase.description}
                      onChange={(e) => setNewTestCase({ ...newTestCase, description: e.target.value })}
                      {...{placeholder: t('admin.skillsTab.testDescPlaceholder')}}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTestCase}
                      disabled={!newTestCase.input || !newTestCase.expectedOutput}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('admin.skillsTab.addTestCaseLabel')}
                    </Button>
                  </div>
                </div>
                
                {formData.testCases.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t('admin.skillsTab.addedTestCases').replace('{n}', String(formData.testCases.length))}</Label>
                    {formData.testCases.map((tc, idx) => (
                      <div key={tc.id} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t('admin.skillsTab.testNum').replace('{n}', String(idx + 1))}</p>
                          <p className="text-xs text-muted-foreground truncate">{t('admin.skillsTab.testInput').replace('{v}', tc.input)}</p>
                          <p className="text-xs text-muted-foreground truncate">{t('admin.skillsTab.testExpected').replace('{v}', tc.expectedOutput)}</p>
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
              {t('admin.skillsTab.cancel')}
            </Button>
            <Button onClick={handleAdd} disabled={createSkill.isPending || !formData.skillName}>
              {createSkill.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('admin.skillsTab.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.skillsTab.editSkillTitle')}</DialogTitle>
            <DialogDescription>
              {t('admin.skillsTab.editSkillDesc')}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">{t('admin.skillsTab.tabBasicInfo')}</TabsTrigger>
              <TabsTrigger value="documentation">{t('admin.skillsTab.tabDocumentation')}</TabsTrigger>
              <TabsTrigger value="testing">{t('admin.skillsTab.tabTestCases')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.skillsTab.skillName')}</Label>
                  <Input
                    value={formData.skillName}
                    onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.skillsTab.skillType')}</Label>
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
                  <p className="text-xs text-muted-foreground">{t('admin.skillsTab.typeImmutable')}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t('admin.skillsTab.skillCategory')}</Label>
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
                <Label>{t('admin.skillsTab.ruleDescription')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('admin.skillsTab.keywords')}</Label>
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
                <Label>{t('admin.skillsTab.enableSkill')}</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="documentation" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {t('admin.skillsTab.whenToUse')}
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
                  {t('admin.skillsTab.corePattern')}
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
                  {t('admin.skillsTab.quickRef')}
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
                  {t('admin.skillsTab.commonMistakes')}
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
                  {t('admin.skillsTab.realWorldImpact')}
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
                  <Label>{t('admin.skillsTab.addTestCaseLabel')}</Label>
                  <div className="space-y-2">
                    <Input
                      value={newTestCase.input}
                      onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                      {...{placeholder: t('admin.skillsTab.testInputPlaceholder')}}
                    />
                    <Input
                      value={newTestCase.expectedOutput}
                      onChange={(e) => setNewTestCase({ ...newTestCase, expectedOutput: e.target.value })}
                      {...{placeholder: t('admin.skillsTab.testOutputPlaceholder')}}
                    />
                    <Input
                      value={newTestCase.description}
                      onChange={(e) => setNewTestCase({ ...newTestCase, description: e.target.value })}
                      {...{placeholder: t('admin.skillsTab.testDescPlaceholder')}}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTestCase}
                      disabled={!newTestCase.input || !newTestCase.expectedOutput}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('admin.skillsTab.add')}
                    </Button>
                  </div>
                </div>
                
                {formData.testCases.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t('admin.skillsTab.testCasesLabel').replace('{n}', String(formData.testCases.length))}</Label>
                    {formData.testCases.map((tc, idx) => (
                      <div key={tc.id} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t('admin.skillsTab.testNum').replace('{n}', String(idx + 1))}</p>
                          <p className="text-xs text-muted-foreground truncate">{t('admin.skillsTab.testInput').replace('{v}', tc.input)}</p>
                          <p className="text-xs text-muted-foreground truncate">{t('admin.skillsTab.testExpected').replace('{v}', tc.expectedOutput)}</p>
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
              {t('admin.skillsTab.cancel')}
            </Button>
            <Button onClick={handleEdit} disabled={updateSkill.isPending || !formData.skillName}>
              {updateSkill.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('admin.skillsTab.save')}
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
              {formData.description || t('admin.skillsTab.noDescription')}
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
                      {t('admin.skillsTab.whenToUse')}
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
                      {t('admin.skillsTab.corePattern')}
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
                      {t('admin.skillsTab.quickRef')}
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
                      {t('admin.skillsTab.commonMistakes')}
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
                      {t('admin.skillsTab.realWorldImpact')}
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
                      {t('admin.skillsTab.testCasesLabel').replace('{n}', String(formData.testCases.length))}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {formData.testCases.map((tc, idx) => (
                        <div key={tc.id} className="p-2 border rounded text-sm">
                          <p className="font-medium">{t('admin.skillsTab.testNum').replace('{n}', String(idx + 1))}</p>
                          <p className="text-muted-foreground">{t('admin.skillsTab.testInput').replace('{v}', tc.input)}</p>
                          <p className="text-muted-foreground">{t('admin.skillsTab.testExpected').replace('{v}', tc.expectedOutput)}</p>
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
              {t('admin.skillsTab.close')}
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
              {t('admin.skillsTab.runTests')}
            </Button>
            <Button onClick={() => {
              setIsDetailDialogOpen(false);
              setIsEditDialogOpen(true);
            }}>
              <Pencil className="h-4 w-4 mr-2" />
              {t('admin.skillsTab.edit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
