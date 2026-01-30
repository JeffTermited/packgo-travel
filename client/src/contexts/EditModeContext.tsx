/**
 * EditModeContext
 * 管理詳情頁面的全局編輯模式狀態
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

interface EditModeContextType {
  isEditMode: boolean;
  canEdit: boolean;
  hasUnsavedChanges: boolean;
  toggleEditMode: () => void;
  enableEditMode: () => void;
  disableEditMode: () => void;
  setHasUnsavedChanges: (value: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

interface EditModeProviderProps {
  children: ReactNode;
}

export const EditModeProvider: React.FC<EditModeProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 檢查是否為管理員
  const canEdit = isAuthenticated && user?.role === "admin";

  const toggleEditMode = useCallback(() => {
    if (canEdit) {
      if (isEditMode && hasUnsavedChanges) {
        const confirm = window.confirm("您有未儲存的變更，確定要離開編輯模式嗎？");
        if (!confirm) return;
      }
      setIsEditMode((prev) => !prev);
      if (isEditMode) {
        setHasUnsavedChanges(false);
      }
    }
  }, [canEdit, isEditMode, hasUnsavedChanges]);

  const enableEditMode = useCallback(() => {
    if (canEdit) {
      setIsEditMode(true);
    }
  }, [canEdit]);

  const disableEditMode = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm("您有未儲存的變更，確定要離開編輯模式嗎？");
      if (!confirm) return;
    }
    setIsEditMode(false);
    setHasUnsavedChanges(false);
  }, [hasUnsavedChanges]);

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        canEdit,
        hasUnsavedChanges,
        toggleEditMode,
        enableEditMode,
        disableEditMode,
        setHasUnsavedChanges,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = (): EditModeContextType => {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error("useEditMode must be used within an EditModeProvider");
  }
  return context;
};
