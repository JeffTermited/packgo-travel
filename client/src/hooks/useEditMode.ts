/**
 * useEditMode Hook
 * 管理詳情頁面的編輯模式狀態
 */

import { useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export interface UseEditModeReturn {
  isEditMode: boolean;
  canEdit: boolean;
  toggleEditMode: () => void;
  enableEditMode: () => void;
  disableEditMode: () => void;
}

export const useEditMode = (): UseEditModeReturn => {
  const { user, isAuthenticated } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);

  // 檢查是否為管理員
  const canEdit = isAuthenticated && user?.role === "admin";

  const toggleEditMode = useCallback(() => {
    if (canEdit) {
      setIsEditMode((prev) => !prev);
    }
  }, [canEdit]);

  const enableEditMode = useCallback(() => {
    if (canEdit) {
      setIsEditMode(true);
    }
  }, [canEdit]);

  const disableEditMode = useCallback(() => {
    setIsEditMode(false);
  }, []);

  return {
    isEditMode,
    canEdit,
    toggleEditMode,
    enableEditMode,
    disableEditMode,
  };
};
