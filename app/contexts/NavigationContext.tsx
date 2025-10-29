'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type NavigationSection = 
  | 'dashboard'
  | 'reports'
  | 'mme'
  | 'assets'
  | 'tools'
  | 'materials'
  | 'search'
  | 'employee'
  | 'ppe'
  | null;

interface NavigationContextType {
  activeSection: NavigationSection;
  setActiveSection: (section: NavigationSection) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<NavigationSection>(null);

  return (
    <NavigationContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

