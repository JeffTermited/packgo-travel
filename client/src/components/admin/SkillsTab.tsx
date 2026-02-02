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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";

// 技能類型選項（對應後端 schema 的 skillType enum）
const SKILL_TYPE_OPTIONS = [
  { value: "feature_classification", label: "特色分類", color: "bg-purple-100 text-purple-800" },
  { value: "tag_rule", label: "標籤規則", color: "bg-blue-100 text-blue-800" },
  { value: "itinerary_structure", label: "行程結構", color: "bg-green-100 text-green-800" },
  { value: "highlight_detection", label: "亮點識別", color: "bg-yellow-100 text-yellow-800" },
  { value: "transportation_type", label: "交通類型", color: "bg-orange-100 text-orange-800" },
  { value: "meal_classification", label: "餐食分類", color: "bg-pink-100 text-pink-800" },
  { value: "accommodation_type", label: "住宿類型", color: "bg-indigo-100 text-indigo-800" },
] as const;

type SkillType = typeof SKILL_TYPE_OPTIONS[number]["value"];

export default function SkillsTab() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  
  // Form state
  const [formData, setFormData] = useState({
    skillName: "",
    skillType: "feature_classification" as SkillType,
    description: "",
    keywords: "",
    isActive: true,
  });

  // Queries - 使用正確的 API（list 不需要參數）
  const { data: skills, isLoading, refetch } = trpc.skills.list.useQuery();

  // 過濾技能
  const filteredSkills = skills?.filter(skill => 
    filterType === "all" || skill.skillType === filterType
  );

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
      toast.success("內建技能已初始化", { 
        description: "已載入預設技能" 
      });
      refetch();
    },
    onError: (error) => {
      toast.error("初始化失敗", { description: error.message });
    },
  });

  const resetForm = () => {
    setFormData({
      skillName: "",
      skillType: "feature_classification",
      description: "",
      keywords: "",
      isActive: true,
    });
  };

  const handleAdd = () => {
    const keywordsArray = formData.keywords
      .split(",")
      .map(k => k.trim())
      .filter(Boolean);
    
    createSkill.mutate({
      skillName: formData.skillName,
      skillType: formData.skillType,
      description: formData.description || undefined,
      keywords: keywordsArray,
      rules: {}, // 必填欄位，提供空物件
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
      description: formData.description || undefined,
      keywords: keywordsArray,
      isActive: formData.isActive,
    });
  };

  const handleDelete = (skillId: number, skillName: string) => {
    if (confirm(`確定要刪除技能「${skillName}」嗎？`)) {
      deleteSkill.mutate({ id: skillId });
    }
  };

  const openEditDialog = (skill: NonNullable<typeof skills>[number]) => {
    setSelectedSkillId(skill.id);
    
    // 解析 keywords JSON 字串
    let keywordsStr = "";
    try {
      const keywordsArray = JSON.parse(skill.keywords || "[]");
      keywordsStr = Array.isArray(keywordsArray) ? keywordsArray.join(", ") : "";
    } catch {
      keywordsStr = "";
    }
    
    setFormData({
      skillName: skill.skillName,
      skillType: skill.skillType as SkillType,
      description: skill.description || "",
      keywords: keywordsStr,
      isActive: skill.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const getTypeBadge = (skillType: string) => {
    const type = SKILL_TYPE_OPTIONS.find(t => t.value === skillType);
    return type ? (
      <Badge className={type.color}>{type.label}</Badge>
    ) : (
      <Badge variant="secondary">{skillType}</Badge>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">技能管理</h2>
            <p className="text-sm text-muted-foreground">
              管理 AI Agent 學習到的技能和分類規則
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

      {/* Filter */}
      <div className="flex items-center gap-4">
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
            
            return (
              <Card key={skill.id} className={!skill.isActive ? "opacity-60" : ""}>
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
                      {getTypeBadge(skill.skillType)}
                    </div>
                    <div className="flex items-center gap-1">
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
                    <CardDescription className="text-sm">
                      {skill.description}
                    </CardDescription>
                  )}
                  
                  {/* Keywords */}
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <Tag className="h-3 w-3 text-muted-foreground mt-1" />
                      {keywords.slice(0, 5).map((keyword, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {keywords.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{keywords.length - 5}
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
                    {skill.successCount > 0 && (
                      <div className="flex items-center gap-1">
                        成功 {skill.successCount} 次
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

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增技能</DialogTitle>
            <DialogDescription>
              新增一個 AI Agent 可以學習和應用的技能
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>技能名稱</Label>
              <Input
                value={formData.skillName}
                onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                placeholder="例如：ESG 永續旅遊"
              />
            </div>
            <div className="space-y-2">
              <Label>技能類型</Label>
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
          </div>
          <DialogFooter>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯技能</DialogTitle>
            <DialogDescription>
              修改技能的資訊和設定
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>技能名稱</Label>
              <Input
                value={formData.skillName}
                onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>技能類型</Label>
              <Select
                value={formData.skillType}
                onValueChange={(value) => setFormData({ ...formData, skillType: value as SkillType })}
                disabled // 類型不可更改
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
              <p className="text-xs text-muted-foreground">技能類型建立後無法更改</p>
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
          </div>
          <DialogFooter>
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
    </div>
  );
}
