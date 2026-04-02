import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ActiveSection, NguoiDung, VaiTro } from '../types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Static local user (UI-only, not SDK-backed)
const LOCAL_USER: NguoiDung = {
  id: '1',
  ten: 'trangth',
  email: 'trangth@bhxh.gov.vn',
  vai_tro: 'admin',
  bi_khoa: false,
  ngay_tao: '2024-01-01',
};

// Credentials
const VALID_USERNAME = 'trangth';
const VALID_PASSWORD = 'Trangth2026@#$';

interface AppContextType {
  activeSection: ActiveSection;
  setActiveSection: (s: ActiveSection) => void;
  currentUser: NguoiDung;
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useCallback((username: string, password: string): boolean => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setActiveSection('dashboard');
  }, []);
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      activeSection, setActiveSection,
      currentUser: LOCAL_USER,
      isLoggedIn, login, logout,
      toasts, addToast, removeToast,
      commandPaletteOpen, setCommandPaletteOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
