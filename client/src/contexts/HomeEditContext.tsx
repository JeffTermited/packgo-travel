import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';

interface HomeEditContextType {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  toggleEditMode: () => void;
  canEdit: boolean;
}

const HomeEditContext = createContext<HomeEditContextType | undefined>(undefined);

export function HomeEditProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const { user } = useAuth();
  
  // Only admin users can edit
  const canEdit = user?.role === 'admin';

  const toggleEditMode = useCallback(() => {
    if (canEdit) {
      setIsEditMode(prev => !prev);
    }
  }, [canEdit]);

  return (
    <HomeEditContext.Provider value={{ isEditMode, setIsEditMode, toggleEditMode, canEdit }}>
      {children}
    </HomeEditContext.Provider>
  );
}

export function useHomeEdit() {
  const context = useContext(HomeEditContext);
  if (context === undefined) {
    throw new Error('useHomeEdit must be used within a HomeEditProvider');
  }
  return context;
}
