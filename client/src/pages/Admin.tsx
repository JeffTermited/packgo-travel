import { useAuth } from "@/_core/hooks/useAuth";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Edit, Plus, Trash2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
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

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
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

  // Check if user is admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      setLocation("/");
      toast.error("您沒有權限訪問此頁面");
    }
  }, [loading, isAuthenticated, user, setLocation]);

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

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (loading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">管理員後台</h1>
            <p className="text-sm text-gray-600">旅遊行程管理系統</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-black">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-black hover:bg-black hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              登出
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-black">行程列表</h2>
            <p className="text-sm text-gray-600">
              共 {tours?.length || 0} 個行程
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}
            className="bg-black text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            新增行程
          </Button>
        </div>

        {/* Tours Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                    <tr key={tour.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tour.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {tour.title}
                      </td>
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
                          className="mr-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tour.id)}
                          className="text-red-600 hover:text-red-700"
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
      </main>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增行程</DialogTitle>
            <DialogDescription>填寫以下資訊以建立新的旅遊行程</DialogDescription>
          </DialogHeader>
          <TourForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createTourMutation.isPending}
              className="bg-black text-white hover:bg-gray-800"
            >
              {createTourMutation.isPending ? "建立中..." : "建立"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>編輯行程</DialogTitle>
            <DialogDescription>修改行程資訊</DialogDescription>
          </DialogHeader>
          <TourForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateTourMutation.isPending}
              className="bg-black text-white hover:bg-gray-800"
            >
              {updateTourMutation.isPending ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
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
            >
              取消
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteTourMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteTourMutation.isPending ? "刪除中..." : "刪除"}
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
            placeholder="例：日本東京"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="duration">天數 *</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: parseInt(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">行程描述 *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="詳細描述行程內容..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">價格 (TWD) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseInt(e.target.value) })
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="maxParticipants">最大人數</Label>
          <Input
            id="maxParticipants"
            type="number"
            min="1"
            value={formData.maxParticipants || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxParticipants: e.target.value
                  ? parseInt(e.target.value)
                  : undefined,
              })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">分類 *</Label>
          <Select
            value={formData.category}
            onValueChange={(value: any) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="group">團體旅遊</SelectItem>
              <SelectItem value="custom">客製旅遊</SelectItem>
              <SelectItem value="package">包團旅遊</SelectItem>
              <SelectItem value="cruise">郵輪旅遊</SelectItem>
              <SelectItem value="theme">主題旅遊</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">狀態 *</Label>
          <Select
            value={formData.status}
            onValueChange={(value: any) =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">上架中</SelectItem>
              <SelectItem value="inactive">已下架</SelectItem>
              <SelectItem value="soldout">已售完</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="featured">精選</Label>
          <Select
            value={formData.featured.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, featured: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">否</SelectItem>
              <SelectItem value="1">是</SelectItem>
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
          placeholder="每行一個亮點"
          rows={3}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="includes">費用包含</Label>
        <Textarea
          id="includes"
          value={formData.includes}
          onChange={(e) =>
            setFormData({ ...formData, includes: e.target.value })
          }
          placeholder="每行一個項目"
          rows={3}
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
          placeholder="每行一個項目"
          rows={3}
        />
      </div>
    </div>
  );
}

// Helper functions
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    group: "團體旅遊",
    custom: "客製旅遊",
    package: "包團旅遊",
    cruise: "郵輪旅遊",
    theme: "主題旅遊",
  };
  return labels[category] || category;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "上架中",
    inactive: "已下架",
    soldout: "已售完",
  };
  return labels[status] || status;
}
