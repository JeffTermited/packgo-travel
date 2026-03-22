import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
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
  Loader2,
  Wand2,
  Database,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

// ── 類型定義 ──────────────────────────────────────────────
type SkillType =
  | "feature_classification"
  | "tag_rule"
  | "itinerary_structure"
  | "highlight_detection"
  | "transportation_type"
  | "meal_classification"
  | "accommodation_type";

// ── 技能類型對照表 ─────────────────────────────────────────
const SKILL_TYPE_LABELS: Record<SkillType, string> = {
  feature_classification: "特色分類",
  tag_rule: "標籤規則",
  itinerary_structure: "行程結構",
  highlight_detection: "亮點偵測",
  transportation_type: "交通類型",
  meal_classification: "餐飲分類",
  accommodation_type: "住宿類型",
};

const SKILL_TYPE_COLORS: Record<SkillType, string> = {
  feature_classification: "bg-purple-100 text-purple-800",
  tag_rule: "bg-blue-100 text-blue-800",
  itinerary_structure: "bg-green-100 text-green-800",
  highlight_detection: "bg-yellow-100 text-yellow-800",
  transportation_type: "bg-orange-100 text-orange-800",
  meal_classification: "bg-pink-100 text-pink-800",
  accommodation_type: "bg-indigo-100 text-indigo-800",
};

// ── 空白表單 ───────────────────────────────────────────────
const EMPTY_FORM = {
  skillName: "",
  skillType: "feature_classification" as SkillType,
  description: "",
  keywords: "",
  isActive: true,
  whenToUse: "",
};

export default function SkillsTab() {
  const { t } = useLocale();

  // ── 狀態 ──────────────────────────────────────────────────
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expandedSkillId, setExpandedSkillId] = useState<number | null>(null);

  // AI 學習狀態
  const [isLearnOpen, setIsLearnOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState<string>("");
  const [isLearning, setIsLearning] = useState(false);
  const [learnResults, setLearnResults] = useState<any>(null);

  // ── 資料查詢 ───────────────────────────────────────────────
  const { data: skills, isLoading, refetch } = trpc.skills.list.useQuery();
  const { data: stats } = trpc.skills.getStats.useQuery();
  const { data: tours } = trpc.tours.list.useQuery();

  // ── Mutations ─────────────────────────────────────────────
  const createSkill = trpc.skills.create.useMutation({
    onSuccess: () => {
      toast.success("技能已新增");
      setIsAddOpen(false);
      setForm(EMPTY_FORM);
      refetch();
    },
    onError: (e) => toast.error("新增失敗：" + e.message),
  });

  const updateSkill = trpc.skills.update.useMutation({
    onSuccess: () => {
      toast.success("技能已更新");
      setIsEditOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      refetch();
    },
    onError: (e) => toast.error("更新失敗：" + e.message),
  });

  const deleteSkill = trpc.skills.delete.useMutation({
    onSuccess: () => { toast.success("技能已刪除"); refetch(); },
    onError: (e) => toast.error("刪除失敗：" + e.message),
  });

  const toggleActive = trpc.skills.update.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error("更新失敗：" + e.message),
  });

  const initBuiltIn = trpc.skills.initializeBuiltIn.useMutation({
    onSuccess: () => { toast.success("內建技能已初始化"); refetch(); },
    onError: (e) => toast.error("初始化失敗：" + e.message),
  });

  const aiLearn = trpc.skills.aiLearn.useMutation({
    onSuccess: (result) => {
      setLearnResults(result);
      setIsLearning(false);
      toast.success(`AI 學習完成，發現 ${result.keywordSuggestions?.length || 0} 個建議`);
      refetch();
    },
    onError: (e) => { setIsLearning(false); toast.error("學習失敗：" + e.message); },
  });

  const applyKeywords = trpc.skills.applyLearnedKeywords.useMutation({
    onSuccess: () => { toast.success("關鍵字已套用"); refetch(); },
    onError: (e) => toast.error("套用失敗：" + e.message),
  });

  const createSuggested = trpc.skills.createSuggestedSkill.useMutation({
    onSuccess: () => { toast.success("技能已建立"); refetch(); },
    onError: (e) => toast.error("建立失敗：" + e.message),
  });

  // ── 工具函數 ───────────────────────────────────────────────
  const parseKeywords = (json: string | null): string[] => {
    if (!json) return [];
    try { const p = JSON.parse(json); return Array.isArray(p) ? p : []; }
    catch { return []; }
  };

  const openEdit = (skill: NonNullable<typeof skills>[number]) => {
    setEditingId(skill.id);
    setForm({
      skillName: skill.skillName,
      skillType: skill.skillType as SkillType,
      description: skill.description || "",
      keywords: parseKeywords(skill.keywords).join(", "),
      isActive: skill.isActive,
      whenToUse: skill.whenToUse || "",
    });
    setIsEditOpen(true);
  };

  const handleSave = (isEdit: boolean) => {
    const keywords = form.keywords.split(",").map(k => k.trim()).filter(Boolean);
    const payload = {
      skillName: form.skillName,
      skillType: form.skillType,
      description: form.description || undefined,
      keywords,
      rules: {},
      whenToUse: form.whenToUse || undefined,
      isActive: form.isActive,
    };
    if (isEdit && editingId) {
      updateSkill.mutate({ id: editingId, ...payload });
    } else {
      createSkill.mutate(payload);
    }
  };

  const handleLearn = () => {
    if (!selectedTourId) { toast.error("請先選擇一個行程"); return; }
    const tour = tours?.find(t => t.id === Number(selectedTourId));
    if (!tour) return;
    setIsLearning(true);
    const content = [tour.title, tour.description, tour.highlights, tour.dailyItinerary]
      .filter(Boolean).join("\n\n");
    aiLearn.mutate({ content, metadata: { title: tour.title, source: `行程 ID: ${tour.id}`, country: tour.destinationCountry || undefined } });
  };

  // ── 表單元件 ───────────────────────────────────────────────
  const SkillForm = () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>技能名稱 <span className="text-red-500">*</span></Label>
        <Input
          value={form.skillName}
          onChange={e => setForm({ ...form, skillName: e.target.value })}
          placeholder="例：日本溫泉住宿偵測"
        />
      </div>
      <div className="space-y-1.5">
        <Label>技能類型 <span className="text-red-500">*</span></Label>
        <Select value={form.skillType} onValueChange={v => setForm({ ...form, skillType: v as SkillType })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(SKILL_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>說明</Label>
        <Textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="這個技能的用途是什麼？"
          rows={2}
        />
      </div>
      <div className="space-y-1.5">
        <Label>關鍵字</Label>
        <Input
          value={form.keywords}
          onChange={e => setForm({ ...form, keywords: e.target.value })}
          placeholder="溫泉, 露天風呂, 湯屋（用逗號分隔）"
        />
        <p className="text-xs text-muted-foreground">AI 生成行程時，遇到這些關鍵字會觸發此技能</p>
      </div>
      <div className="space-y-1.5">
        <Label>使用時機</Label>
        <Textarea
          value={form.whenToUse}
          onChange={e => setForm({ ...form, whenToUse: e.target.value })}
          placeholder="什麼情況下 AI 應該使用這個技能？"
          rows={2}
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch
          checked={form.isActive}
          onCheckedChange={v => setForm({ ...form, isActive: v })}
        />
        <Label>啟用此技能</Label>
      </div>
    </div>
  );

  // ── 主渲染 ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── 頁面標題與操作 ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">AI Agent 技能管理</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            管理 AI 生成行程時使用的識別技能與關鍵字規則
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsLearnOpen(true)}>
            <Wand2 className="h-4 w-4 mr-1.5" />
            AI 自動學習
          </Button>
          <Button variant="outline" size="sm" onClick={() => initBuiltIn.mutate()} disabled={initBuiltIn.isPending}>
            {initBuiltIn.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Database className="h-4 w-4 mr-1.5" />}
            載入預設技能
          </Button>
          <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setIsAddOpen(true); }}>
            <Plus className="h-4 w-4 mr-1.5" />
            新增技能
          </Button>
        </div>
      </div>

      {/* ── 統計摘要 ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border p-4">
          <p className="text-2xl font-bold">{stats?.totalSkills || 0}</p>
          <p className="text-sm text-muted-foreground">技能總數</p>
        </div>
        <div className="border p-4">
          <p className="text-2xl font-bold text-green-600">{stats?.activeSkills || 0}</p>
          <p className="text-sm text-muted-foreground">已啟用</p>
        </div>
        <div className="border p-4">
          <p className="text-2xl font-bold">{stats?.totalUsage || 0}</p>
          <p className="text-sm text-muted-foreground">總使用次數</p>
        </div>
      </div>

      {/* ── 技能列表 ── */}
      <div className="border">
        {/* 表頭 */}
        <div className="grid grid-cols-[2fr_1fr_2fr_80px_100px] gap-4 px-4 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase tracking-wide">
          <span>技能名稱</span>
          <span>類型</span>
          <span>關鍵字</span>
          <span>使用次數</span>
          <span>操作</span>
        </div>

        {/* 載入中 */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* 空白狀態 */}
        {!isLoading && (!skills || skills.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Brain className="h-12 w-12 text-gray-300 mb-4" />
            <p className="font-medium text-gray-600">尚未建立任何技能</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              點擊「載入預設技能」快速開始，或手動新增技能
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => initBuiltIn.mutate()} disabled={initBuiltIn.isPending}>
                <Database className="h-4 w-4 mr-1.5" />
                載入預設技能
              </Button>
              <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setIsAddOpen(true); }}>
                <Plus className="h-4 w-4 mr-1.5" />
                新增技能
              </Button>
            </div>
          </div>
        )}

        {/* 技能列表 */}
        {!isLoading && skills && skills.map((skill) => {
          const keywords = parseKeywords(skill.keywords);
          const isExpanded = expandedSkillId === skill.id;

          return (
            <div key={skill.id} className={`border-b last:border-b-0 ${!skill.isActive ? "opacity-50" : ""}`}>
              {/* 主列 */}
              <div className="grid grid-cols-[2fr_1fr_2fr_80px_100px] gap-4 px-4 py-3 items-center">
                {/* 名稱 + 說明 */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {skill.isActive
                      ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      : <XCircle className="h-4 w-4 text-gray-300 shrink-0" />
                    }
                    <span className="font-medium truncate">{skill.skillName}</span>
                  </div>
                  {skill.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate pl-6">{skill.description}</p>
                  )}
                </div>

                {/* 類型 */}
                <div>
                  <Badge className={`text-xs ${SKILL_TYPE_COLORS[skill.skillType as SkillType] || "bg-gray-100 text-gray-700"}`}>
                    {SKILL_TYPE_LABELS[skill.skillType as SkillType] || skill.skillType}
                  </Badge>
                </div>

                {/* 關鍵字 */}
                <div className="flex flex-wrap gap-1">
                  {keywords.slice(0, 4).map((kw, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5">{kw}</span>
                  ))}
                  {keywords.length > 4 && (
                    <span className="text-xs text-muted-foreground">+{keywords.length - 4}</span>
                  )}
                  {keywords.length === 0 && (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>

                {/* 使用次數 */}
                <div className="text-sm text-muted-foreground">{skill.usageCount || 0} 次</div>

                {/* 操作 */}
                <div className="flex items-center gap-1">
                  <Switch
                    checked={skill.isActive}
                    onCheckedChange={(checked) => toggleActive.mutate({ id: skill.id, isActive: checked })}
                    className="scale-75"
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(skill)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                    onClick={() => {
                      if (confirm(`確定要刪除「${skill.skillName}」嗎？`)) {
                        deleteSkill.mutate({ id: skill.id });
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  {(skill.whenToUse || skill.description) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                  )}
                </div>
              </div>

              {/* 展開詳情 */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 bg-gray-50 border-t">
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    {skill.whenToUse && (
                      <div>
                        <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Info className="h-3.5 w-3.5" /> 使用時機
                        </p>
                        <p className="text-muted-foreground">{skill.whenToUse}</p>
                      </div>
                    )}
                    {keywords.length > 4 && (
                      <div>
                        <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5" /> 所有關鍵字
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {keywords.map((kw, i) => (
                            <span key={i} className="text-xs bg-white border px-1.5 py-0.5">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 新增技能 Dialog ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新增技能</DialogTitle>
          </DialogHeader>
          <SkillForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>取消</Button>
            <Button onClick={() => handleSave(false)} disabled={!form.skillName || createSkill.isPending}>
              {createSkill.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 編輯技能 Dialog ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>編輯技能</DialogTitle>
          </DialogHeader>
          <SkillForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>取消</Button>
            <Button onClick={() => handleSave(true)} disabled={!form.skillName || updateSkill.isPending}>
              {updateSkill.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── AI 自動學習 Dialog ── */}
      <Dialog open={isLearnOpen} onOpenChange={(open) => { setIsLearnOpen(open); if (!open) { setLearnResults(null); setSelectedTourId(""); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI 自動學習
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 說明 */}
            <div className="bg-blue-50 border border-blue-100 p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">這是什麼？</p>
              <p>AI 會分析現有行程的內容，自動找出可以新增到技能庫的關鍵字和規則，讓未來生成行程時更精準。</p>
            </div>

            {/* 選擇行程 */}
            <div className="space-y-1.5">
              <Label>選擇要學習的行程</Label>
              <div className="flex gap-2">
                <Select value={selectedTourId} onValueChange={setSelectedTourId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="選擇行程..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tours?.map(tour => (
                      <SelectItem key={tour.id} value={String(tour.id)}>
                        {tour.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleLearn} disabled={isLearning || !selectedTourId}>
                  {isLearning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                  開始學習
                </Button>
              </div>
            </div>

            {/* 學習結果 */}
            {learnResults && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-medium">學習完成</span>
                  <span className="text-sm text-muted-foreground">
                    發現 {learnResults.keywordSuggestions?.length || 0} 個關鍵字建議、
                    {learnResults.newSkillSuggestions?.length || 0} 個新技能建議
                  </span>
                </div>

                {/* 關鍵字建議 */}
                {learnResults.keywordSuggestions?.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium text-sm flex items-center gap-1">
                      <Tag className="h-4 w-4" /> 關鍵字建議（可套用到現有技能）
                    </p>
                    {learnResults.keywordSuggestions.map((s: any, i: number) => (
                      <div key={i} className="border p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{s.skillName}</p>
                            <p className="text-xs text-muted-foreground">{s.reason}</p>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            信心度 {Math.round((s.confidence || 0) * 100)}%
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {s.newKeywords?.map((kw: string, j: number) => (
                            <span key={j} className="text-xs bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5">{kw}</span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => applyKeywords.mutate({ skillId: s.skillId, newKeywords: s.newKeywords })}
                            disabled={applyKeywords.isPending}
                          >
                            ✓ 套用關鍵字
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground"
                            onClick={() => setLearnResults({
                              ...learnResults,
                              keywordSuggestions: learnResults.keywordSuggestions.filter((_: any, idx: number) => idx !== i),
                            })}
                          >
                            忽略
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 新技能建議 */}
                {learnResults.newSkillSuggestions?.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium text-sm flex items-center gap-1">
                      <Sparkles className="h-4 w-4" /> 新技能建議
                    </p>
                    {learnResults.newSkillSuggestions.map((s: any, i: number) => (
                      <div key={i} className="border p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{s.skillName}</p>
                            <p className="text-xs text-muted-foreground">{s.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            信心度 {Math.round((s.confidence || 0) * 100)}%
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {s.keywords?.map((kw: string, j: number) => (
                            <span key={j} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5">{kw}</span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => createSuggested.mutate({
                              skillName: s.skillName,
                              skillType: s.skillType,
                              category: "technique",
                              description: s.description,
                              keywords: s.keywords,
                              whenToUse: s.whenToUse,
                              corePattern: s.corePattern,
                            })}
                            disabled={createSuggested.isPending}
                          >
                            + 建立技能
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground"
                            onClick={() => setLearnResults({
                              ...learnResults,
                              newSkillSuggestions: learnResults.newSkillSuggestions.filter((_: any, idx: number) => idx !== i),
                            })}
                          >
                            忽略
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 無結果 */}
                {!learnResults.keywordSuggestions?.length && !learnResults.newSkillSuggestions?.length && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Brain className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>現有技能已涵蓋此行程的所有內容</p>
                    <p className="text-sm mt-1">沒有發現需要新增的關鍵字或技能</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLearnOpen(false)}>關閉</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
