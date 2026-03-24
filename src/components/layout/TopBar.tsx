import React, { useState, useRef, useEffect } from 'react';
import {
  House, ChartBar, Folders, FolderOpen, Buildings, ClipboardText,
  CalendarBlank, ShareNetwork, Users, MagnifyingGlass, Bell, X, List,
  User, Gear, SignOut, CaretRight, Warning, Clock, CheckCircle
} from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';
import { useQuery } from '@animaapp/playground-react-sdk';
import { ActiveSection } from '../../types';
import { getTinhTrangBadgeClass, formatDate } from '../../utils/statusUtils';

const NAV_ITEMS: { label: string; section: ActiveSection; icon: React.ReactNode; sub?: string }[] = [
  { label: 'Trang chủ', section: 'dashboard', icon: <House size={18} weight="fill" />, sub: 'Tổng quan' },
  { label: 'Báo cáo', section: 'baocao', icon: <ChartBar size={18} weight="fill" />, sub: 'Thống kê' },
  { label: 'Hồ sơ TNHS', section: 'tnhs', icon: <Folders size={18} weight="fill" />, sub: 'Tiếp nhận' },
  { label: 'Hồ sơ NQT', section: 'nqt', icon: <FolderOpen size={18} weight="fill" />, sub: 'Nghị quyết' },
  { label: 'Đơn vị', section: 'donvi', icon: <Buildings size={18} weight="fill" />, sub: 'Danh mục' },
  { label: 'Thủ tục', section: 'thutuc', icon: <ClipboardText size={18} weight="fill" />, sub: 'Danh mục' },
  { label: 'Ngày nghỉ', section: 'ngayle', icon: <CalendarBlank size={18} weight="fill" />, sub: 'Lịch' },
  { label: 'HCC', section: 'hcc', icon: <ShareNetwork size={18} weight="fill" />, sub: 'Hành chính' },
  { label: 'Người dùng', section: 'users', icon: <Users size={18} weight="fill" />, sub: 'Hệ thống' },
];

const NAV_GROUPS = [
  { label: 'Tổng quan', items: NAV_ITEMS.slice(0, 2) },
  { label: 'Hồ sơ', items: NAV_ITEMS.slice(2, 4) },
  { label: 'Danh mục', items: NAV_ITEMS.slice(4, 8) },
  { label: 'Quản trị', items: NAV_ITEMS.slice(8) },
];

function BellPanel({ onClose, onNavigate }: { onClose: () => void; onNavigate: (s: ActiveSection) => void }) {
  const { data: tnhsList = [] } = useQuery('HoSoTNHS');
  const { data: nqtList = [] } = useQuery('HoSoNQT');
  const urgent = [
    ...tnhsList.filter(h => !h.daTraGiay && h.soNgayConLai <= 2),
    ...nqtList.filter(h => !h.daTraGiay && h.soNgayConLai <= 2),
  ];
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="notif-panel absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-neutral-50">
        <div className="flex items-center gap-2">
          <Bell size={15} weight="fill" className="text-primary" />
          <span className="font-heading font-semibold text-sm text-foreground">Thông báo</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer text-muted-foreground">
          <X size={14} weight="bold" />
        </button>
      </div>

      {urgent.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={24} weight="fill" className="text-success" />
          </div>
          <p className="text-sm font-semibold text-foreground">Tất cả trong hạn!</p>
          <p className="text-xs text-muted-foreground mt-1">Không có hồ sơ nào cần chú ý</p>
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto scrollbar-thin divide-y divide-border">
          {urgent.map(h => (
            <div key={h.id}
              onClick={() => { onNavigate('tnhs'); onClose(); }}
              className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Warning size={14} weight="fill" className="text-error" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground font-mono truncate">{h.maHoSo}</p>
                <p className="text-xs text-muted-foreground truncate">{h.tenDonVi}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={11} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Hạn: {formatDate(h.ngayHenTra)}</span>
                </div>
              </div>
              <span className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${getTinhTrangBadgeClass(h.tinhTrang)}`}>
                {h.soNgayConLai <= 0 ? `Trễ ${Math.abs(h.soNgayConLai)}n` : `Còn ${h.soNgayConLai}n`}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-3 border-t border-border bg-neutral-50">
        <button
          onClick={() => { onNavigate('tnhs'); onClose(); }}
          className="w-full text-center text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
        >
          Xem tất cả hồ sơ →
        </button>
      </div>
    </div>
  );
}

export default function TopBar() {
  const { activeSection, setActiveSection, setCommandPaletteOpen, currentUser } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const { data: tnhsList = [] } = useQuery('HoSoTNHS');
  const { data: nqtList = [] } = useQuery('HoSoNQT');
  const urgentCount = [...tnhsList, ...nqtList].filter(h => !h.daTraGiay && h.soNgayConLai <= 2).length;

  const handleNav = (section: ActiveSection) => {
    setActiveSection(section);
    setMobileOpen(false);
  };

  const activeItem = NAV_ITEMS.find(i => i.section === activeSection);

  return (
    <>
      {/* ─────────────────── DESKTOP SIDEBAR ─────────────────── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col z-50 shadow-sidebar"
        style={{ background: 'var(--color-sidebar)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid var(--color-sidebar-border)' }}>
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
            style={{ background: 'hsl(28, 95%, 58%)' }}>
            <span className="text-white font-heading font-bold text-sm">HS</span>
          </div>
          <div>
            <p className="font-heading font-bold text-white text-base leading-tight tracking-tight">QLHS</p>
            <p className="text-xs leading-tight" style={{ color: 'var(--color-sidebar-muted)' }}>Quản lý hồ sơ BHXH</p>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-5" aria-label="Điều hướng chính">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--color-sidebar-muted)' }}>{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const isActive = activeSection === item.section;
                  return (
                    <button
                      key={item.section}
                      onClick={() => handleNav(item.section)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer"
                      style={{
                        background: isActive ? 'hsl(28, 95%, 58%)' : 'transparent',
                        color: isActive ? '#fff' : 'var(--color-sidebar-muted)',
                      }}
                      onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-sidebar-hover)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; } }}
                      onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-sidebar-muted)'; } }}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {isActive && <CaretRight size={12} weight="bold" className="opacity-60" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="px-3 py-3" style={{ borderTop: '1px solid var(--color-sidebar-border)' }}>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer"
              style={{ color: 'var(--color-sidebar-muted)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-sidebar-hover)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-sidebar-muted)'; }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'hsl(28,95%,58%)' }}>
                <User size={15} weight="fill" className="text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-white truncate leading-tight">{currentUser.ten}</p>
                <p className="text-[11px] truncate leading-tight" style={{ color: 'var(--color-sidebar-muted)' }}>{currentUser.email}</p>
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 bg-neutral-50 border-b border-border">
                  <p className="text-body-sm font-semibold text-foreground">{currentUser.ten}</p>
                  <p className="text-caption text-muted-foreground">{currentUser.email}</p>
                </div>
                <button className="w-full flex items-center gap-2 px-4 py-2.5 text-body-sm text-foreground hover:bg-neutral-50 transition-colors cursor-pointer" onClick={() => setUserMenuOpen(false)}>
                  <Gear size={15} weight="regular" className="text-muted-foreground" /> Cài đặt
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2.5 text-body-sm text-error hover:bg-red-50 transition-colors cursor-pointer" onClick={() => setUserMenuOpen(false)}>
                  <SignOut size={15} weight="regular" /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─────────────────── DESKTOP TOP BAR ─────────────────── */}
      <header className="hidden lg:flex fixed top-0 left-64 right-0 h-14 z-40 bg-card border-b border-border items-center px-6 gap-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 flex-1">
          <span className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
            <span className="text-muted-foreground/60">{activeItem?.sub ?? 'Tổng quan'}</span>
            <CaretRight size={12} className="text-muted-foreground/40" />
            <span className="font-semibold text-foreground">{activeItem?.label ?? 'Trang chủ'}</span>
          </span>
        </div>

        {/* Search */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-neutral-50 text-muted-foreground text-body-sm hover:border-primary/40 hover:bg-white transition-all duration-150 cursor-pointer"
          style={{ minWidth: '200px' }}
          aria-label="Tìm kiếm (Ctrl+K)"
        >
          <MagnifyingGlass size={14} weight="regular" />
          <span className="flex-1 text-left">Tìm kiếm...</span>
          <kbd className="text-[10px] bg-neutral-200 text-neutral-500 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </button>

        {/* Bell notification */}
        <div className="relative">
          <button
            onClick={() => setBellOpen(!bellOpen)}
            className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-neutral-100 transition-all cursor-pointer"
            aria-label={`Thông báo: ${urgentCount} hồ sơ cần chú ý`}
          >
            <Bell size={20} weight={urgentCount > 0 ? 'fill' : 'regular'} className={urgentCount > 0 ? 'text-primary' : ''} />
            {urgentCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] text-white"
                style={{ background: 'hsl(0,78%,54%)' }}>
                {urgentCount}
              </span>
            )}
          </button>
          {bellOpen && <BellPanel onClose={() => setBellOpen(false)} onNavigate={handleNav} />}
        </div>
      </header>

      {/* ─────────────────── MOBILE TOP BAR ─────────────────── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-3"
        style={{ background: 'var(--color-sidebar)' }}>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'hsl(28,95%,58%)' }}>
            <span className="text-white font-heading font-bold text-xs">HS</span>
          </div>
          <span className="font-heading font-bold text-white text-sm">QLHS</span>
        </div>
        <button onClick={() => setCommandPaletteOpen(true)} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer" style={{ color: 'var(--color-sidebar-muted)' }} aria-label="Tìm kiếm">
          <MagnifyingGlass size={18} weight="regular" />
        </button>
        <div className="relative">
          <button
            onClick={() => setBellOpen(!bellOpen)}
            className="relative p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            style={{ color: 'var(--color-sidebar-muted)' }}
            aria-label="Thông báo"
          >
            <Bell size={18} weight={urgentCount > 0 ? 'fill' : 'regular'} className={urgentCount > 0 ? 'text-yellow-300' : ''} />
            {urgentCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] text-white"
                style={{ background: 'hsl(0,78%,54%)' }}>
                {urgentCount}
              </span>
            )}
          </button>
          {bellOpen && <BellPanel onClose={() => setBellOpen(false)} onNavigate={handleNav} />}
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer" style={{ color: 'var(--color-sidebar-muted)' }} aria-label="Mở menu">
          <List size={20} weight="regular" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 h-full flex flex-col animate-slide-in-left shadow-xl"
            style={{ background: 'var(--color-sidebar)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-sidebar-border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'hsl(28,95%,58%)' }}>
                  <span className="text-white font-heading font-bold text-sm">HS</span>
                </div>
                <span className="font-heading font-bold text-white">QLHS</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-xl transition-colors cursor-pointer" style={{ color: 'var(--color-sidebar-muted)' }}>
                <X size={20} weight="regular" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-4">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-sidebar-muted)' }}>{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const isActive = activeSection === item.section;
                      return (
                        <button key={item.section} onClick={() => handleNav(item.section)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                          style={{ background: isActive ? 'hsl(28,95%,58%)' : 'transparent', color: isActive ? '#fff' : 'var(--color-sidebar-muted)' }}>
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
