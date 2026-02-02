import { useState, useCallback, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

interface UseInlineEditOptions {
  initialData: any;
  onSave: (data: any) => Promise<void>;
}

export function useInlineEdit({ initialData, onSave }: UseInlineEditOptions) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const originalDataRef = useRef<any>(null);

  // 進入編輯模式
  const enterEditMode = useCallback(() => {
    if (!isAdmin) return;
    originalDataRef.current = JSON.parse(JSON.stringify(initialData));
    setEditedData(JSON.parse(JSON.stringify(initialData)));
    setIsEditMode(true);
  }, [initialData, isAdmin]);

  // 退出編輯模式
  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setEditedData(null);
    originalDataRef.current = null;
  }, []);

  // 更新欄位
  const updateField = useCallback((path: string, value: any) => {
    setEditedData((prev: any) => {
      if (!prev) return prev;
      
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        // 處理陣列索引
        if (key.includes("[")) {
          const [arrayKey, indexStr] = key.split("[");
          const index = parseInt(indexStr.replace("]", ""));
          current = current[arrayKey][index];
        } else {
          current = current[key];
        }
      }
      
      const lastKey = keys[keys.length - 1];
      if (lastKey.includes("[")) {
        const [arrayKey, indexStr] = lastKey.split("[");
        const index = parseInt(indexStr.replace("]", ""));
        current[arrayKey][index] = value;
      } else {
        current[lastKey] = value;
      }
      
      return newData;
    });
  }, []);

  // 檢查是否有變更
  const hasChanges = useCallback(() => {
    if (!editedData || !originalDataRef.current) return false;
    return JSON.stringify(editedData) !== JSON.stringify(originalDataRef.current);
  }, [editedData]);

  // 儲存變更
  const saveChanges = useCallback(async () => {
    if (!editedData || !hasChanges()) return;
    
    setIsSaving(true);
    try {
      await onSave(editedData);
      originalDataRef.current = JSON.parse(JSON.stringify(editedData));
    } finally {
      setIsSaving(false);
    }
  }, [editedData, hasChanges, onSave]);

  // 放棄變更
  const discardChanges = useCallback(() => {
    if (originalDataRef.current) {
      setEditedData(JSON.parse(JSON.stringify(originalDataRef.current)));
    }
    exitEditMode();
  }, [exitEditMode]);

  // 取得當前值（編輯模式下返回編輯中的值，否則返回原始值）
  const getValue = useCallback((path: string, defaultValue: any = "") => {
    const data = isEditMode && editedData ? editedData : initialData;
    if (!data) return defaultValue;
    
    const keys = path.split(".");
    let current = data;
    
    for (const key of keys) {
      if (key.includes("[")) {
        const [arrayKey, indexStr] = key.split("[");
        const index = parseInt(indexStr.replace("]", ""));
        current = current?.[arrayKey]?.[index];
      } else {
        current = current?.[key];
      }
      if (current === undefined) return defaultValue;
    }
    
    return current ?? defaultValue;
  }, [isEditMode, editedData, initialData]);

  return {
    isAdmin,
    isEditMode,
    isSaving,
    editedData,
    enterEditMode,
    exitEditMode,
    updateField,
    hasChanges: hasChanges(),
    saveChanges,
    discardChanges,
    getValue,
  };
}

export default useInlineEdit;
