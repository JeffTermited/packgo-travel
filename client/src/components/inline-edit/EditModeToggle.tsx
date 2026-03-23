import React from "react";
import { Pencil, Eye, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditModeToggleProps {
  isEditMode: boolean;
  onToggle: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
  className?: string;
}

export function EditModeToggle({
  isEditMode,
  onToggle,
  onSave,
  onCancel,
  isSaving = false,
  hasChanges = false,
  className = "",
}: EditModeToggleProps) {
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white rounded-none shadow-lg border border-gray-200 p-2",
        className
      )}
    >
      {isEditMode ? (
        <>
          {/* 編輯模式下的按鈕 */}
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-none text-yellow-800 text-sm font-medium">
            <Pencil className="h-4 w-4" />
            編輯模式
          </div>
          
          {hasChanges && onSave && (
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="rounded-none bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  儲存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  儲存變更
                </>
              )}
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={onCancel || onToggle}
            className="rounded-none"
          >
            <X className="h-4 w-4 mr-2" />
            {hasChanges ? "放棄變更" : "退出編輯"}
          </Button>
        </>
      ) : (
        <>
          {/* 預覽模式下的按鈕 */}
          <Button
            onClick={onToggle}
            className="rounded-none bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <Pencil className="h-4 w-4 mr-2" />
            進入編輯模式
          </Button>
        </>
      )}
    </div>
  );
}

// 編輯模式提示橫幅
export function EditModeBanner({
  isEditMode,
  hasChanges,
}: {
  isEditMode: boolean;
  hasChanges: boolean;
}) {
  if (!isEditMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-400 text-yellow-900 py-2 px-4 text-center text-sm font-medium shadow-md">
      <div className="flex items-center justify-center gap-2">
        <Pencil className="h-4 w-4" />
        <span>您正在編輯模式中</span>
        {hasChanges && (
          <span className="bg-yellow-600 text-white px-2 py-0.5 rounded text-xs">
            有未儲存的變更
          </span>
        )}
        <span className="text-yellow-700">
          — 點擊任何文字或圖片即可編輯
        </span>
      </div>
    </div>
  );
}

export default EditModeToggle;
