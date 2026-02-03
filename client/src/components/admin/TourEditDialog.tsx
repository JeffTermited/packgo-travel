import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Loader2, Plus, Trash2, GripVertical, Plane, Train, Ship, Bus, Car, Upload, Image, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

interface TourEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourData: any;
  onSave: (editedData: any) => void;
  isSaving: boolean;
}

export function TourEditDialog({
  open,
  onOpenChange,
  tourData,
  onSave,
  isSaving,
}: TourEditDialogProps) {
  const [editedData, setEditedData] = useState<any>(null);

  // 當 tourData 變化時，更新 editedData
  useEffect(() => {
    if (tourData) {
      // 解析 JSON 欄位
      const parsed = { ...tourData };
      
      // 解析 itineraryDetailed
      if (typeof parsed.itineraryDetailed === 'string') {
        try {
          parsed.itineraryDetailed = JSON.parse(parsed.itineraryDetailed);
        } catch {
          parsed.itineraryDetailed = [];
        }
      }
      if (!Array.isArray(parsed.itineraryDetailed)) {
        parsed.itineraryDetailed = [];
      }
      
      // 解析 costExplanation
      if (typeof parsed.costExplanation === 'string') {
        try {
          parsed.costExplanation = JSON.parse(parsed.costExplanation);
        } catch {
          parsed.costExplanation = { included: [], excluded: [], additionalCosts: [], notes: "" };
        }
      }
      if (!parsed.costExplanation || typeof parsed.costExplanation !== 'object') {
        parsed.costExplanation = { included: [], excluded: [], additionalCosts: [], notes: "" };
      }
      
      // 解析 noticeDetailed
      if (typeof parsed.noticeDetailed === 'string') {
        try {
          parsed.noticeDetailed = JSON.parse(parsed.noticeDetailed);
        } catch {
          parsed.noticeDetailed = { preparation: [], culturalNotes: [], healthSafety: [], emergency: [] };
        }
      }
      if (!parsed.noticeDetailed || typeof parsed.noticeDetailed !== 'object') {
        parsed.noticeDetailed = { preparation: [], culturalNotes: [], healthSafety: [], emergency: [] };
      }
      // 確保所有欄位都是陣列
      const ensureArray = (val: any) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') return [val];
        return [];
      };
      parsed.noticeDetailed = {
        preparation: ensureArray(parsed.noticeDetailed.preparation),
        culturalNotes: ensureArray(parsed.noticeDetailed.culturalNotes),
        healthSafety: ensureArray(parsed.noticeDetailed.healthSafety),
        emergency: ensureArray(parsed.noticeDetailed.emergency),
      };
      
      // 解析 flights (交通資訊)
      if (typeof parsed.flights === 'string') {
        try {
          parsed.flights = JSON.parse(parsed.flights);
        } catch {
          parsed.flights = { type: 'FLIGHT', typeName: '' };
        }
      }
      if (!parsed.flights || typeof parsed.flights !== 'object') {
        parsed.flights = { type: 'FLIGHT', typeName: '' };
      }
      
      // 解析 images (照片陣列)
      if (typeof parsed.images === 'string') {
        try {
          parsed.images = JSON.parse(parsed.images);
        } catch {
          parsed.images = [];
        }
      }
      if (!Array.isArray(parsed.images)) {
        parsed.images = [];
      }
      
      setEditedData(parsed);
    }
  }, [tourData]);

  if (!editedData) return null;

  const handleSave = () => {
    // 將 JSON 欄位轉換為字串
    const dataToSave = {
      ...editedData,
      itineraryDetailed: JSON.stringify(editedData.itineraryDetailed || []),
      costExplanation: JSON.stringify(editedData.costExplanation || {}),
      noticeDetailed: JSON.stringify(editedData.noticeDetailed || {}),
      flights: JSON.stringify(editedData.flights || {}),
      images: JSON.stringify(editedData.images || []),
    };
    onSave(dataToSave);
  };

  // 每日行程操作
  const addDailyItinerary = () => {
    const newDay = {
      day: (editedData.itineraryDetailed?.length || 0) + 1,
      title: "",
      activities: [],
      meals: { breakfast: "", lunch: "", dinner: "" },
      accommodation: "",
    };
    setEditedData({
      ...editedData,
      itineraryDetailed: [...(editedData.itineraryDetailed || []), newDay],
    });
  };

  const removeDailyItinerary = (index: number) => {
    const updated = [...(editedData.itineraryDetailed || [])];
    updated.splice(index, 1);
    // 重新編號
    updated.forEach((item, idx) => {
      item.day = idx + 1;
    });
    setEditedData({ ...editedData, itineraryDetailed: updated });
  };

  const updateDailyItinerary = (index: number, field: string, value: any) => {
    const updated = [...(editedData.itineraryDetailed || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditedData({ ...editedData, itineraryDetailed: updated });
  };

  // 活動操作
  const addActivity = (dayIndex: number) => {
    const updated = [...(editedData.itineraryDetailed || [])];
    if (!updated[dayIndex].activities) {
      updated[dayIndex].activities = [];
    }
    updated[dayIndex].activities.push({
      time: "",
      title: "",
      description: "",
      transportation: "",
      location: "",
    });
    setEditedData({ ...editedData, itineraryDetailed: updated });
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const updated = [...(editedData.itineraryDetailed || [])];
    updated[dayIndex].activities.splice(activityIndex, 1);
    setEditedData({ ...editedData, itineraryDetailed: updated });
  };

  const updateActivity = (dayIndex: number, activityIndex: number, field: string, value: string) => {
    const updated = [...(editedData.itineraryDetailed || [])];
    updated[dayIndex].activities[activityIndex] = {
      ...updated[dayIndex].activities[activityIndex],
      [field]: value,
    };
    setEditedData({ ...editedData, itineraryDetailed: updated });
  };

  // 費用項目操作
  const addCostItem = (type: 'included' | 'excluded' | 'additionalCosts') => {
    const updated = { ...editedData.costExplanation };
    if (!updated[type]) {
      updated[type] = [];
    }
    updated[type].push("");
    setEditedData({ ...editedData, costExplanation: updated });
  };

  const removeCostItem = (type: 'included' | 'excluded' | 'additionalCosts', index: number) => {
    const updated = { ...editedData.costExplanation };
    updated[type].splice(index, 1);
    setEditedData({ ...editedData, costExplanation: updated });
  };

  const updateCostItem = (type: 'included' | 'excluded' | 'additionalCosts', index: number, value: string) => {
    const updated = { ...editedData.costExplanation };
    updated[type][index] = value;
    setEditedData({ ...editedData, costExplanation: updated });
  };

  // 注意事項操作
  const addNoticeItem = (type: 'preparation' | 'culturalNotes' | 'healthSafety' | 'emergency') => {
    const updated = { ...editedData.noticeDetailed };
    if (!updated[type]) {
      updated[type] = [];
    }
    updated[type].push("");
    setEditedData({ ...editedData, noticeDetailed: updated });
  };

  const removeNoticeItem = (type: 'preparation' | 'culturalNotes' | 'healthSafety' | 'emergency', index: number) => {
    const updated = { ...editedData.noticeDetailed };
    updated[type].splice(index, 1);
    setEditedData({ ...editedData, noticeDetailed: updated });
  };

  const updateNoticeItem = (type: 'preparation' | 'culturalNotes' | 'healthSafety' | 'emergency', index: number, value: string) => {
    const updated = { ...editedData.noticeDetailed };
    updated[type][index] = value;
    setEditedData({ ...editedData, noticeDetailed: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden rounded-3xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-purple-600" />
            編輯行程資訊
          </DialogTitle>
          <DialogDescription>
            修改 AI 生成的行程資訊，確認無誤後再儲存
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">基本資訊</TabsTrigger>
            <TabsTrigger value="itinerary">每日行程</TabsTrigger>
            <TabsTrigger value="cost">費用說明</TabsTrigger>
            <TabsTrigger value="notice">注意事項</TabsTrigger>
            <TabsTrigger value="transport">交通資訊</TabsTrigger>
            <TabsTrigger value="photos">照片管理</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            {/* 基本資訊 Tab */}
            <TabsContent value="basic" className="mt-0 space-y-6">
              <div className="bg-purple-50 rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold text-purple-900 mb-4">基本資訊</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      行程標題 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={editedData.title || ""}
                      onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="productCode" className="text-sm font-medium">
                      產品代碼
                    </Label>
                    <Input
                      id="productCode"
                      value={editedData.productCode || ""}
                      onChange={(e) => setEditedData({ ...editedData, productCode: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="promotionText" className="text-sm font-medium">
                      促銷文字
                    </Label>
                    <Input
                      id="promotionText"
                      value={editedData.promotionText || ""}
                      onChange={(e) => setEditedData({ ...editedData, promotionText: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration" className="text-sm font-medium">
                      天數 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={editedData.duration || 1}
                      onChange={(e) => setEditedData({ ...editedData, duration: parseInt(e.target.value) || 1 })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-sm font-medium">
                      價格 <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        value={editedData.price || 0}
                        onChange={(e) => setEditedData({ ...editedData, price: parseInt(e.target.value) || 0 })}
                        className="flex-1"
                      />
                      <Select
                        value={editedData.priceCurrency || 'TWD'}
                        onValueChange={(value) => setEditedData({ ...editedData, priceCurrency: value })}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="貨幣" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TWD">NT$ TWD</SelectItem>
                          <SelectItem value="USD">$ USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      行程描述
                    </Label>
                    <Textarea
                      id="description"
                      value={editedData.description || ""}
                      onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold text-blue-900 mb-4">地點資訊</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departureCity" className="text-sm font-medium">
                      出發城市
                    </Label>
                    <Input
                      id="departureCity"
                      value={editedData.departureCity || ""}
                      onChange={(e) => setEditedData({ ...editedData, departureCity: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="departureAirportName" className="text-sm font-medium">
                      出發機場
                    </Label>
                    <Input
                      id="departureAirportName"
                      value={editedData.departureAirportName || ""}
                      onChange={(e) => setEditedData({ ...editedData, departureAirportName: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="destinationCountry" className="text-sm font-medium">
                      目的地國家
                    </Label>
                    <Input
                      id="destinationCountry"
                      value={editedData.destinationCountry || ""}
                      onChange={(e) => setEditedData({ ...editedData, destinationCountry: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="destinationCity" className="text-sm font-medium">
                      目的地城市
                    </Label>
                    <Input
                      id="destinationCity"
                      value={editedData.destinationCity || ""}
                      onChange={(e) => setEditedData({ ...editedData, destinationCity: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold text-amber-900 mb-4">Hero 圖片</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="heroImage" className="text-sm font-medium">
                      圖片網址
                    </Label>
                    <Input
                      id="heroImage"
                      value={editedData.heroImage || ""}
                      onChange={(e) => setEditedData({ ...editedData, heroImage: e.target.value })}
                      className="mt-2"
                      placeholder="https://..."
                    />
                  </div>

                  {editedData.heroImage && (
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src={editedData.heroImage} 
                        alt="Hero Preview" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="heroSubtitle" className="text-sm font-medium">
                      Hero 副標題
                    </Label>
                    <Input
                      id="heroSubtitle"
                      value={editedData.heroSubtitle || ""}
                      onChange={(e) => setEditedData({ ...editedData, heroSubtitle: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 每日行程 Tab */}
            <TabsContent value="itinerary" className="mt-0 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">每日行程</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDailyItinerary}
                  className="rounded-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  新增一天
                </Button>
              </div>

              {editedData.itineraryDetailed?.map((day: any, dayIndex: number) => (
                <div key={dayIndex} className="bg-green-50 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-green-900">第 {day.day} 天</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDailyItinerary(dayIndex)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">標題</Label>
                    <Input
                      value={day.title || ""}
                      onChange={(e) => updateDailyItinerary(dayIndex, 'title', e.target.value)}
                      className="mt-2"
                      placeholder="例如：抵達東京，淺草寺巡禮"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">住宿</Label>
                    <Input
                      value={day.accommodation || ""}
                      onChange={(e) => updateDailyItinerary(dayIndex, 'accommodation', e.target.value)}
                      className="mt-2"
                      placeholder="例如：東京希爾頓酒店"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">早餐</Label>
                      <Input
                        value={day.meals?.breakfast || ""}
                        onChange={(e) => updateDailyItinerary(dayIndex, 'meals', { ...day.meals, breakfast: e.target.value })}
                        className="mt-2"
                        placeholder="例如：飯店內"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">午餐</Label>
                      <Input
                        value={day.meals?.lunch || ""}
                        onChange={(e) => updateDailyItinerary(dayIndex, 'meals', { ...day.meals, lunch: e.target.value })}
                        className="mt-2"
                        placeholder="例如：日式料理"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">晚餐</Label>
                      <Input
                        value={day.meals?.dinner || ""}
                        onChange={(e) => updateDailyItinerary(dayIndex, 'meals', { ...day.meals, dinner: e.target.value })}
                        className="mt-2"
                        placeholder="例如：自理"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">活動安排</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addActivity(dayIndex)}
                        className="rounded-full"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        新增活動
                      </Button>
                    </div>

                    {day.activities?.map((activity: any, activityIndex: number) => (
                      <div key={activityIndex} className="bg-white rounded-xl p-4 space-y-3 border border-green-200">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-gray-600">活動 {activityIndex + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeActivity(dayIndex, activityIndex)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-medium">時間</Label>
                            <Input
                              value={activity.time || ""}
                              onChange={(e) => updateActivity(dayIndex, activityIndex, 'time', e.target.value)}
                              className="mt-1 h-8 text-sm"
                              placeholder="例如：09:00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">地點</Label>
                            <Input
                              value={activity.location || ""}
                              onChange={(e) => updateActivity(dayIndex, activityIndex, 'location', e.target.value)}
                              className="mt-1 h-8 text-sm"
                              placeholder="例如：淺草寺"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-medium">標題</Label>
                          <Input
                            value={activity.title || ""}
                            onChange={(e) => updateActivity(dayIndex, activityIndex, 'title', e.target.value)}
                            className="mt-1 h-8 text-sm"
                            placeholder="例如：參觀淺草寺"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-medium">描述</Label>
                          <Textarea
                            value={activity.description || ""}
                            onChange={(e) => updateActivity(dayIndex, activityIndex, 'description', e.target.value)}
                            className="mt-1 text-sm"
                            rows={2}
                            placeholder="詳細描述活動內容..."
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-medium">交通方式</Label>
                          <Input
                            value={activity.transportation || ""}
                            onChange={(e) => updateActivity(dayIndex, activityIndex, 'transportation', e.target.value)}
                            className="mt-1 h-8 text-sm"
                            placeholder="例如：遊覽車"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {(!editedData.itineraryDetailed || editedData.itineraryDetailed.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  <p>尚未新增每日行程</p>
                  <p className="text-sm mt-2">點擊上方「新增一天」按鈕開始編輯</p>
                </div>
              )}
            </TabsContent>

            {/* 費用說明 Tab */}
            <TabsContent value="cost" className="mt-0 space-y-6">
              <div className="bg-orange-50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-orange-900">費用包含</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCostItem('included')}
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    新增項目
                  </Button>
                </div>

                {editedData.costExplanation?.included?.map((item: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateCostItem('included', index, e.target.value)}
                      placeholder="例如：來回經濟艙機票"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCostItem('included', index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="bg-red-50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-red-900">費用不包含</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCostItem('excluded')}
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    新增項目
                  </Button>
                </div>

                {editedData.costExplanation?.excluded?.map((item: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateCostItem('excluded', index, e.target.value)}
                      placeholder="例如：個人消費"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCostItem('excluded', index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-yellow-900">額外費用</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCostItem('additionalCosts')}
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    新增項目
                  </Button>
                </div>

                {editedData.costExplanation?.additionalCosts?.map((item: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateCostItem('additionalCosts', index, e.target.value)}
                      placeholder="例如：單人房差 NT$ 5,000"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCostItem('additionalCosts', index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">備註</h3>
                <Textarea
                  value={editedData.costExplanation?.notes || ""}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    costExplanation: { ...editedData.costExplanation, notes: e.target.value }
                  })}
                  rows={4}
                  placeholder="其他費用相關說明..."
                />
              </div>
            </TabsContent>

            {/* 注意事項 Tab */}
            <TabsContent value="notice" className="mt-0 space-y-6">
              <div className="bg-blue-50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-blue-900">行前準備</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addNoticeItem('preparation')}
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    新增項目
                  </Button>
                </div>

                {editedData.noticeDetailed?.preparation?.map((item: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateNoticeItem('preparation', index, e.target.value)}
                      placeholder="例如：請攜帶有效護照"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNoticeItem('preparation', index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-purple-900">文化注意</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addNoticeItem('culturalNotes')}
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    新增項目
                  </Button>
                </div>

                {editedData.noticeDetailed?.culturalNotes?.map((item: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateNoticeItem('culturalNotes', index, e.target.value)}
                      placeholder="例如：進入寺廟請脫鞋"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNoticeItem('culturalNotes', index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-green-900">健康安全</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addNoticeItem('healthSafety')}
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    新增項目
                  </Button>
                </div>

                {editedData.noticeDetailed?.healthSafety?.map((item: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateNoticeItem('healthSafety', index, e.target.value)}
                      placeholder="例如：建議購買旅遊保險"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNoticeItem('healthSafety', index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="bg-red-50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-red-900">緊急聯絡</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addNoticeItem('emergency')}
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    新增項目
                  </Button>
                </div>

                {editedData.noticeDetailed?.emergency?.map((item: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateNoticeItem('emergency', index, e.target.value)}
                      placeholder="例如：緊急聯絡電話：+886-2-1234-5678"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNoticeItem('emergency', index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* 交通資訊 Tab */}
            <TabsContent value="transport" className="mt-0 space-y-6">
              <div className="bg-sky-50 rounded-2xl p-6 space-y-6">
                <h3 className="font-semibold text-sky-900 mb-4">交通資訊設定</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">交通類型</Label>
                    <Select
                      value={editedData.flights?.type || 'FLIGHT'}
                      onValueChange={(value) => setEditedData({
                        ...editedData,
                        flights: { ...editedData.flights, type: value }
                      })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="選擇交通類型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FLIGHT">
                          <div className="flex items-center gap-2">
                            <Plane className="h-4 w-4" />
                            飛機
                          </div>
                        </SelectItem>
                        <SelectItem value="TRAIN">
                          <div className="flex items-center gap-2">
                            <Train className="h-4 w-4" />
                            火車
                          </div>
                        </SelectItem>
                        <SelectItem value="CRUISE">
                          <div className="flex items-center gap-2">
                            <Ship className="h-4 w-4" />
                            郵輪
                          </div>
                        </SelectItem>
                        <SelectItem value="BUS">
                          <div className="flex items-center gap-2">
                            <Bus className="h-4 w-4" />
                            巴士
                          </div>
                        </SelectItem>
                        <SelectItem value="CAR">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            自駕
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">交通工具名稱</Label>
                    <Input
                      value={editedData.flights?.typeName || ''}
                      onChange={(e) => setEditedData({
                        ...editedData,
                        flights: { ...editedData.flights, typeName: e.target.value }
                      })}
                      className="mt-2"
                      placeholder="例如：鳴日號、山嵐號、長榮航空..."
                    />
                  </div>
                </div>

                {/* 火車詳細資訊 */}
                {editedData.flights?.type === 'TRAIN' && (
                  <div className="bg-white rounded-xl p-4 space-y-4 border border-sky-200">
                    <h4 className="font-medium text-sky-800">列車詳細資訊</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">列車名稱</Label>
                        <Input
                          value={editedData.flights?.trainName || ''}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            flights: { ...editedData.flights, trainName: e.target.value }
                          })}
                          className="mt-2"
                          placeholder="例如：鳴日號觀光列車"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">列車類型</Label>
                        <Input
                          value={editedData.flights?.trainType || ''}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            flights: { ...editedData.flights, trainType: e.target.value }
                          })}
                          className="mt-2"
                          placeholder="例如：觀光列車、普悠瑪號、自強號"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">列車介紹</Label>
                      <Textarea
                        value={editedData.flights?.description || ''}
                        onChange={(e) => setEditedData({
                          ...editedData,
                          flights: { ...editedData.flights, description: e.target.value }
                        })}
                        className="mt-2"
                        rows={3}
                        placeholder="詳細介紹列車特色..."
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">列車特色（每行一個）</Label>
                      <Textarea
                        value={editedData.flights?.features?.join('\n') || ''}
                        onChange={(e) => setEditedData({
                          ...editedData,
                          flights: { ...editedData.flights, features: e.target.value.split('\n').filter((f: string) => f.trim()) }
                        })}
                        className="mt-2"
                        rows={4}
                        placeholder="頂級觀光列車\n原住民文化車廂\n專屬餐飲服務"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">行駛路線（每行一個站）</Label>
                      <Textarea
                        value={editedData.flights?.route?.join('\n') || ''}
                        onChange={(e) => setEditedData({
                          ...editedData,
                          flights: { ...editedData.flights, route: e.target.value.split('\n').filter((r: string) => r.trim()) }
                        })}
                        className="mt-2"
                        rows={4}
                        placeholder="南港站\n花蓮站\n台東站"
                      />
                    </div>
                  </div>
                )}

                {/* 郵輪詳細資訊 */}
                {editedData.flights?.type === 'CRUISE' && (
                  <div className="bg-white rounded-xl p-4 space-y-4 border border-sky-200">
                    <h4 className="font-medium text-sky-800">郵輪詳細資訊</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">船名</Label>
                        <Input
                          value={editedData.flights?.shipName || ''}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            flights: { ...editedData.flights, shipName: e.target.value }
                          })}
                          className="mt-2"
                          placeholder="例如：黃金公主號"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">航線</Label>
                        <Input
                          value={editedData.flights?.cruiseRoute || ''}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            flights: { ...editedData.flights, cruiseRoute: e.target.value }
                          })}
                          className="mt-2"
                          placeholder="例如：基隆-那霸-石垣島"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">郵輪介紹</Label>
                      <Textarea
                        value={editedData.flights?.description || ''}
                        onChange={(e) => setEditedData({
                          ...editedData,
                          flights: { ...editedData.flights, description: e.target.value }
                        })}
                        className="mt-2"
                        rows={3}
                        placeholder="詳細介紹郵輪特色..."
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">船上設施（每行一個）</Label>
                      <Textarea
                        value={editedData.flights?.features?.join('\n') || ''}
                        onChange={(e) => setEditedData({
                          ...editedData,
                          flights: { ...editedData.flights, features: e.target.value.split('\n').filter((f: string) => f.trim()) }
                        })}
                        className="mt-2"
                        rows={4}
                        placeholder="無邊際泳池\n全天候自助餐廳\nSPA水療中心"
                      />
                    </div>
                  </div>
                )}

                {/* 飛機詳細資訊 */}
                {editedData.flights?.type === 'FLIGHT' && (
                  <div className="bg-white rounded-xl p-4 space-y-4 border border-sky-200">
                    <h4 className="font-medium text-sky-800">航班詳細資訊</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">航空公司</Label>
                        <Input
                          value={editedData.flights?.airline || ''}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            flights: { ...editedData.flights, airline: e.target.value }
                          })}
                          className="mt-2"
                          placeholder="例如：長榮航空、華航"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">航班號碼</Label>
                        <Input
                          value={editedData.flights?.flightNumber || ''}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            flights: { ...editedData.flights, flightNumber: e.target.value }
                          })}
                          className="mt-2"
                          placeholder="例如：BR123"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">去程出發時間</Label>
                        <Input
                          value={editedData.flights?.outbound?.departureTime || ''}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            flights: { 
                              ...editedData.flights, 
                              outbound: { ...editedData.flights?.outbound, departureTime: e.target.value }
                            }
                          })}
                          className="mt-2"
                          placeholder="例如：08:30"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">去程抵達時間</Label>
                        <Input
                          value={editedData.flights?.outbound?.arrivalTime || ''}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            flights: { 
                              ...editedData.flights, 
                              outbound: { ...editedData.flights?.outbound, arrivalTime: e.target.value }
                            }
                          })}
                          className="mt-2"
                          placeholder="例如：12:30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">回程出發時間</Label>
                        <Input
                          value={editedData.flights?.inbound?.departureTime || ''}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            flights: { 
                              ...editedData.flights, 
                              inbound: { ...editedData.flights?.inbound, departureTime: e.target.value }
                            }
                          })}
                          className="mt-2"
                          placeholder="例如：14:00"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">回程抵達時間</Label>
                        <Input
                          value={editedData.flights?.inbound?.arrivalTime || ''}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            flights: { 
                              ...editedData.flights, 
                              inbound: { ...editedData.flights?.inbound, arrivalTime: e.target.value }
                            }
                          })}
                          className="mt-2"
                          placeholder="例如：18:00"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 照片管理 Tab */}
            <TabsContent value="photos" className="mt-0 space-y-6">
              <div className="bg-violet-50 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-violet-900">行程照片</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newImage = { url: '', alt: '', caption: '' };
                      setEditedData({
                        ...editedData,
                        images: [...(editedData.images || []), newImage]
                      });
                    }}
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    新增照片
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {editedData.images?.map((image: any, index: number) => (
                    <div key={index} className="bg-white rounded-xl p-4 space-y-3 border border-violet-200">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-violet-800">照片 {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = [...editedData.images];
                            updated.splice(index, 1);
                            setEditedData({ ...editedData, images: updated });
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {image.url && (
                        <div className="relative rounded-lg overflow-hidden">
                          <img 
                            src={image.url} 
                            alt={image.alt || '行程照片'} 
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}

                      <div>
                        <Label className="text-xs font-medium">圖片網址</Label>
                        <Input
                          value={image.url || ''}
                          onChange={(e) => {
                            const updated = [...editedData.images];
                            updated[index] = { ...updated[index], url: e.target.value };
                            setEditedData({ ...editedData, images: updated });
                          }}
                          className="mt-1 h-8 text-sm"
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-medium">替代文字 (Alt)</Label>
                        <Input
                          value={image.alt || ''}
                          onChange={(e) => {
                            const updated = [...editedData.images];
                            updated[index] = { ...updated[index], alt: e.target.value };
                            setEditedData({ ...editedData, images: updated });
                          }}
                          className="mt-1 h-8 text-sm"
                          placeholder="描述圖片內容..."
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-medium">圖片說明</Label>
                        <Input
                          value={image.caption || ''}
                          onChange={(e) => {
                            const updated = [...editedData.images];
                            updated[index] = { ...updated[index], caption: e.target.value };
                            setEditedData({ ...editedData, images: updated });
                          }}
                          className="mt-1 h-8 text-sm"
                          placeholder="例如：東京鐵塔夜景"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {(!editedData.images || editedData.images.length === 0) && (
                  <div className="text-center py-12 text-gray-500">
                    <Image className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>尚未新增行程照片</p>
                    <p className="text-sm mt-2">點擊上方「新增照片」按鈕開始新增</p>
                  </div>
                )}
              </div>

              {/* Hero 圖片設定 */}
              <div className="bg-amber-50 rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold text-amber-900">Hero 圖片（主視覺）</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="heroImage" className="text-sm font-medium">
                      Hero 圖片網址
                    </Label>
                    <Input
                      id="heroImage"
                      value={editedData.heroImage || ''}
                      onChange={(e) => setEditedData({ ...editedData, heroImage: e.target.value })}
                      className="mt-2"
                      placeholder="https://..."
                    />
                  </div>

                  {editedData.heroImage && (
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src={editedData.heroImage} 
                        alt="Hero Preview" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
            disabled={isSaving}
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-purple-600 text-white hover:bg-purple-700 rounded-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                儲存中...
              </>
            ) : (
              "確認儲存"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
