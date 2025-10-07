import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ViewAsUserContextType {
  viewAsUserId: string | null;
  setViewAsUserId: (userId: string | null) => void;
  isViewingAsOtherUser: boolean;
}

const ViewAsUserContext = createContext<ViewAsUserContextType | undefined>(undefined);

export function ViewAsUserProvider({ children }: { children: ReactNode }) {
  const [viewAsUserId, setViewAsUserId] = useState<string | null>(null);

  const value: ViewAsUserContextType = {
    viewAsUserId,
    setViewAsUserId,
    isViewingAsOtherUser: viewAsUserId !== null,
  };

  return (
    <ViewAsUserContext.Provider value={value}>
      {children}
    </ViewAsUserContext.Provider>
  );
}

export function useViewAsUser() {
  const context = useContext(ViewAsUserContext);
  if (context === undefined) {
    throw new Error('useViewAsUser must be used within a ViewAsUserProvider');
  }
  return context;
}
