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
import { Edit, Loader2 } from "lucide-react";
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
      setEditedData({ ...tourData });
    }
  }, [tourData]);

  if (!editedData) return null;

  const handleSave = () => {
    onSave(editedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-purple-600" />
            編輯行程資訊
          </DialogTitle>
          <DialogDescription>
            修改 AI 生成的行程資訊，確認無誤後再儲存
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* 基本資訊 */}
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
                  價格 (NT$) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={editedData.price || 0}
                  onChange={(e) => setEditedData({ ...editedData, price: parseInt(e.target.value) || 0 })}
                  className="mt-2"
                />
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

          {/* 地點資訊 */}
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

          {/* Hero 圖片 */}
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
        </div>

        <DialogFooter className="flex gap-2">
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
