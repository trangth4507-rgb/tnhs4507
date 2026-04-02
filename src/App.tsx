import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import TopBar from './components/layout/TopBar';
import ToastContainer from './components/layout/ToastContainer';
import CommandPalette from './components/CommandPalette';
import AlertModal from './components/AlertModal';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/dashboard/Dashboard';
import BaoCaoDashboard from './components/dashboard/BaoCaoDashboard';
import HoSoTable from './components/hoso/HoSoTable';
import DonViManager from './components/danhmuc/DonViManager';
import ThuTucManager from './components/danhmuc/ThuTucManager';
import NgayLeManager from './components/danhmuc/NgayLeManager';
import HCCManager from './components/danhmuc/HCCManager';
import BBBGManager from './components/danhmuc/BBBGManager';
import UserManager from './components/users/UserManager';

function AppShell() {
  const { activeSection, setCommandPaletteOpen, isLoggedIn, login } = useApp();

  if (!isLoggedIn) {
    return <LoginScreen onLogin={login} />;
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandPaletteOpen]);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'baocao': return <BaoCaoDashboard />;
      case 'tnhs': return <HoSoTable type="tnhs" />;
      case 'nqt': return <HoSoTable type="nqt" />;
      case 'donvi': return <DonViManager />;
      case 'thutuc': return <ThuTucManager />;
      case 'ngayle': return <NgayLeManager />;
      case 'hcc': return <HCCManager />;
      case 'bbbg': return <BBBGManager />;
      case 'users': return <UserManager />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-body-sm"
      >
        Bỏ qua điều hướng
      </a>
      <TopBar />
      <div id="main-content" className="pt-14 lg:pt-14 lg:pl-64 min-h-screen">
        {renderSection()}
      </div>
      <CommandPalette />
      <AlertModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
