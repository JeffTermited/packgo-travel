import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type TourFormData = {
  title: string;
  destination: string;
  description: string;
  duration: number;
  price: number;
  imageUrl?: string;
  category: "group" | "custom" | "package" | "cruise" | "theme";
  status: "active" | "inactive" | "soldout";
  featured: number;
  maxParticipants?: number;
  highlights?: string;
  includes?: string;
  excludes?: string;
};

export default function ToursTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [selectedTourIds, setSelectedTourIds] = useState<number[]>([]);
  const [formData, setFormData] = useState<TourFormData>({
    title: "",
    destination: "",
    description: "",
    duration: 1,
    price: 0,
    imageUrl: "",
    category: "group",
    status: "active",
    featured: 0,
    maxParticipants: undefined,
    highlights: "",
    includes: "",
    excludes: "",
  });

  const utils = trpc.useUtils();
  const { data: tours, isLoading: toursLoading } = trpc.tours.list.useQuery();
  
  const createTourMutation = trpc.tours.create.useMutation({
    onSuccess: () => {
      utils.tours.list.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("行程已成功建立");
    },
    onError: (error) => {
      toast.error(`建立失敗：${error.message}`);
    },
  });

  const updateTourMutation = trpc.tours.update.useMutation({
    onSuccess: () => {
      utils.tours.list.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
      toast.success("行程已成功更新");
    },
    onError: (error) => {
      toast.error(`更新失敗：${error.message}`);
    },
  });

  const deleteTourMutation = trpc.tours.delete.useMutation({
    onSuccess: () => {
      utils.tours.list.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedTourId(null);
      toast.success("行程已成功刪除");
    },
    onError: (error) => {
      toast.error(`刪除失敗：${error.message}`);
    },
  });

  const batchDeleteToursMutation = trpc.tours.batchDelete.useMutation({
    onSuccess: (data) => {
      utils.tours.list.invalidate();
      setIsBatchDeleteDialogOpen(false);
      setSelectedTourIds([]);
      toast.success(`已成功刪除 ${data.deletedCount} 個行程`);
    },
    onError: (error) => {
      toast.error(`批量刪除失敗：${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      destination: "",
      description: "",
      duration: 1,
      price: 0,
      imageUrl: "",
      category: "group",
      status: "active",
      featured: 0,
      maxParticipants: undefined,
      highlights: "",
      includes: "",
      excludes: "",
    });
  };

  const handleCreate = () => {
    createTourMutation.mutate(formData);
  };

  const handleEdit = (tourId: number) => {
    const tour = tours?.find((t) => t.id === tourId);
    if (tour) {
      setFormData({
        title: tour.title,
        destination: tour.destination,
        description: tour.description,
        duration: tour.duration,
        price: tour.price,
        imageUrl: tour.imageUrl || "",
        category: tour.category,
        status: tour.status,
        featured: tour.featured,
        maxParticipants: tour.maxParticipants || undefined,
        highlights: tour.highlights || "",
        includes: tour.includes || "",
        excludes: tour.excludes || "",
      });
      setSelectedTourId(tourId);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdate = () => {
    if (selectedTourId) {
      updateTourMutation.mutate({
        id: selectedTourId,
        ...formData,
      });
    }
  };

  const handleDelete = (tourId: number) => {
    setSelectedTourId(tourId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTourId) {
      deleteTourMutation.mutate({ id: selectedTourId });
    }
  };

  const handleSelectTour = (tourId: number, checked: boolean) => {
    if (checked) {
      setSelectedTourIds([...selectedTourIds, tourId]);
    } else {
      setSelectedTourIds(selectedTourIds.filter((id) => id !== tourId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && tours) {
      setSelectedTourIds(tours.map((tour) => tour.id));
    } else {
      setSelectedTourIds([]);
    }
  };

  const handleBatchDelete = () => {
    if (selectedTourIds.length > 0) {
      setIsBatchDeleteDialogOpen(true);
    }
  };

  const confirmBatchDelete = () => {
    if (selectedTourIds.length > 0) {
      batchDeleteToursMutation.mutate({ ids: selectedTourIds });
    }
  };

  const isAllSelected = tours && tours.length > 0 && selectedTourIds.length === tours.length;
  const isSomeSelected = selectedTourIds.length > 0 && selectedTourIds.length < (tours?.length || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">行程管理</h2>
          <p className="text-sm text-gray-600 mt-1">共 {tours?.length || 0} 個行程</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedTourIds.length > 0 && (
            <Button
              onClick={handleBatchDelete}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 rounded-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              刪除已選 ({selectedTourIds.length})
            </Button>
          )}
          <Button
            onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}
            className="bg-black text-white hover:bg-gray-800 rounded-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            新增行程
          </Button>
        </div>
      </div>

      {/* Tours Table */}
      <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden">
        {toursLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        ) : tours && tours.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      className="data-[state=indeterminate]:bg-gray-400"
                      data-state={isSomeSelected ? "indeterminate" : isAllSelected ? "checked" : "unchecked"}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    標題
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    目的地
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    天數
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    價格
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分類
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tours.map((tour) => (
                  <tr key={tour.id} className={`hover:bg-gray-50 ${selectedTourIds.includes(tour.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={selectedTourIds.includes(tour.id)}
                        onCheckedChange={(checked) => handleSelectTour(tour.id, checked as boolean)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tour.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{tour.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tour.destination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tour.duration} 天
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      NT$ {tour.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCategoryLabel(tour.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tour.status === "active"
                            ? "bg-green-100 text-green-800"
                            : tour.status === "soldout"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getStatusLabel(tour.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(tour.id)}
                        className="mr-2 rounded-full"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tour.id)}
                        className="text-red-600 hover:text-red-700 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-600">尚無行程資料</p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>新增行程</DialogTitle>
            <DialogDescription>填寫以下資訊以建立新的旅遊行程</DialogDescription>
          </DialogHeader>
          <TourForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="rounded-full"
            >
              取消
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createTourMutation.isPending}
              className="bg-black text-white hover:bg-gray-800 rounded-full"
            >
              {createTourMutation.isPending ? "建立中..." : "建立"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>編輯行程</DialogTitle>
            <DialogDescription>修改行程資訊</DialogDescription>
          </DialogHeader>
          <TourForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="rounded-full"
            >
              取消
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateTourMutation.isPending}
              className="bg-black text-white hover:bg-gray-800 rounded-full"
            >
              {updateTourMutation.isPending ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              您確定要刪除這個行程嗎？此操作無法復原。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-full"
            >
              取消
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteTourMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700 rounded-full"
            >
              {deleteTourMutation.isPending ? "刪除中..." : "刪除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Delete Confirmation Dialog */}
      <Dialog open={isBatchDeleteDialogOpen} onOpenChange={setIsBatchDeleteDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>確認批量刪除</DialogTitle>
            <DialogDescription>
              您確定要刪除選取的 {selectedTourIds.length} 個行程嗎？此操作無法復原。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBatchDeleteDialogOpen(false)}
              className="rounded-full"
            >
              取消
            </Button>
            <Button
              onClick={confirmBatchDelete}
              disabled={batchDeleteToursMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700 rounded-full"
            >
              {batchDeleteToursMutation.isPending ? "刪除中..." : `刪除 ${selectedTourIds.length} 個行程`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Tour Form Component
function TourForm({
  formData,
  setFormData,
}: {
  formData: TourFormData;
  setFormData: React.Dispatch<React.SetStateAction<TourFormData>>;
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">行程標題 *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          placeholder="例：東京賞櫻 5 日遊"
          className="rounded-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="destination">目的地 *</Label>
          <Input
            id="destination"
            value={formData.destination}
            onChange={(e) =>
              setFormData({ ...formData, destination: e.target.value })
            }
            placeholder="例：日本"
            className="rounded-full"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="duration">天數 *</Label>
          <Input
            id="duration"
            type="number"
            min={1}
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })
            }
            className="rounded-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">價格 (NT$) *</Label>
          <Input
            id="price"
            type="number"
            min={0}
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
            }
            className="rounded-full"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="maxParticipants">人數上限</Label>
          <Input
            id="maxParticipants"
            type="number"
            min={1}
            value={formData.maxParticipants || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxParticipants: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="不限"
            className="rounded-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">分類 *</Label>
          <Select
            value={formData.category}
            onValueChange={(value: TourFormData["category"]) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger className="rounded-full">
              <SelectValue placeholder="選擇分類" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="group">團體旅遊</SelectItem>
              <SelectItem value="custom">客製化行程</SelectItem>
              <SelectItem value="package">自由行套裝</SelectItem>
              <SelectItem value="cruise">郵輪旅遊</SelectItem>
              <SelectItem value="theme">主題旅遊</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">狀態 *</Label>
          <Select
            value={formData.status}
            onValueChange={(value: TourFormData["status"]) =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger className="rounded-full">
              <SelectValue placeholder="選擇狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">上架中</SelectItem>
              <SelectItem value="inactive">已下架</SelectItem>
              <SelectItem value="soldout">已售完</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="imageUrl">圖片網址</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData({ ...formData, imageUrl: e.target.value })
          }
          placeholder="https://example.com/image.jpg"
          className="rounded-full"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">行程描述 *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="請輸入行程描述..."
          rows={3}
          className="rounded-2xl"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="highlights">行程亮點</Label>
        <Textarea
          id="highlights"
          value={formData.highlights}
          onChange={(e) =>
            setFormData({ ...formData, highlights: e.target.value })
          }
          placeholder="每行一個亮點..."
          rows={3}
          className="rounded-2xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="includes">費用包含</Label>
          <Textarea
            id="includes"
            value={formData.includes}
            onChange={(e) =>
              setFormData({ ...formData, includes: e.target.value })
            }
            placeholder="每行一項..."
            rows={3}
            className="rounded-2xl"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="excludes">費用不含</Label>
          <Textarea
            id="excludes"
            value={formData.excludes}
            onChange={(e) =>
              setFormData({ ...formData, excludes: e.target.value })
            }
            placeholder="每行一項..."
            rows={3}
            className="rounded-2xl"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured === 1}
          onChange={(e) =>
            setFormData({ ...formData, featured: e.target.checked ? 1 : 0 })
          }
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="featured" className="cursor-pointer">
          設為精選行程
        </Label>
      </div>
    </div>
  );
}

// Helper functions
function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    group: "團體旅遊",
    custom: "客製化行程",
    package: "自由行套裝",
    cruise: "郵輪旅遊",
    theme: "主題旅遊",
  };
  return labels[category] || category;
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    active: "上架中",
    inactive: "已下架",
    soldout: "已售完",
  };
  return labels[status] || status;
}
