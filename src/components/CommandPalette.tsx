import React, { useEffect, useRef, useState } from 'react';
import { MagnifyingGlass, X, FileText, Buildings, ClipboardText } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';
import { useQuery } from '@animaapp/playground-react-sdk';

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setActiveSection } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: tnhsList = [] } = useQuery('HoSoTNHS');
  const { data: nqtList = [] } = useQuery('HoSoNQT');
  const { data: donViList = [] } = useQuery('DonVi');
  const { data: thuTucList = [] } = useQuery('ThuTuc');

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') setCommandPaletteOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const q = query.toLowerCase();
  const tnhsResults = q ? tnhsList.filter(h => h.maHoSo?.toLowerCase().includes(q) || (h.maBhxh || '').toLowerCase().includes(q)).slice(0, 3) : [];
  const nqtResults = q ? nqtList.filter(h => h.maHoSo?.toLowerCase().includes(q) || (h.maBhxh || '').toLowerCase().includes(q)).slice(0, 3) : [];
  const donViResults = q ? donViList.filter(d => d.tenDonVi?.toLowerCase().includes(q) || d.maDonVi?.toLowerCase().includes(q)).slice(0, 3) : [];
  const thuTucResults = q ? thuTucList.filter(t => t.tenThuTuc?.toLowerCase().includes(q) || t.maThuTuc?.toLowerCase().includes(q)).slice(0, 3) : [];
  const hasResults = tnhsResults.length > 0 || nqtResults.length > 0 || donViResults.length > 0 || thuTucResults.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ backgroundColor: 'hsla(0, 0%, 0%, 0.5)' }}
      onClick={() => setCommandPaletteOpen(false)}
      role="dialog" aria-modal="true" aria-label="Tìm kiếm nhanh"
    >
      <div className="w-full max-w-lg bg-card border border-border rounded-md shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <MagnifyingGlass size={20} weight="regular" className="text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm hồ sơ, đơn vị, thủ tục..."
            className="flex-1 bg-transparent text-foreground text-body placeholder:text-muted-foreground outline-none"
            aria-label="Tìm kiếm"
          />
          <button onClick={() => setCommandPaletteOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" aria-label="Đóng">
            <X size={16} weight="regular" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {!q && <div className="p-6 text-center text-muted-foreground text-body-sm">Nhập để tìm kiếm hồ sơ, đơn vị, thủ tục...</div>}
          {q && !hasResults && <div className="p-6 text-center text-muted-foreground text-body-sm">Không tìm thấy kết quả cho "{query}"</div>}
          {tnhsResults.length > 0 && (
            <div>
              <div className="px-4 py-2 text-caption text-muted-foreground font-medium uppercase tracking-wide bg-neutral-50">Hồ sơ TNHS</div>
              {tnhsResults.map(h => (
                <button key={h.id} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-100 transition-colors cursor-pointer text-left" onClick={() => { setActiveSection('tnhs'); setCommandPaletteOpen(false); }}>
                  <FileText size={16} weight="regular" className="text-primary flex-shrink-0" />
                  <div>
                    <p className="text-body-sm font-medium text-foreground">{h.maHoSo}</p>
                    <p className="text-caption text-muted-foreground">{h.tenDonVi} · {h.tenThuTuc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {nqtResults.length > 0 && (
            <div>
              <div className="px-4 py-2 text-caption text-muted-foreground font-medium uppercase tracking-wide bg-neutral-50">Hồ sơ NQT</div>
              {nqtResults.map(h => (
                <button key={h.id} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-100 transition-colors cursor-pointer text-left" onClick={() => { setActiveSection('nqt'); setCommandPaletteOpen(false); }}>
                  <FileText size={16} weight="regular" className="text-secondary flex-shrink-0" />
                  <div>
                    <p className="text-body-sm font-medium text-foreground">{h.maHoSo}</p>
                    <p className="text-caption text-muted-foreground">{h.tenDonVi} · {h.tenThuTuc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {donViResults.length > 0 && (
            <div>
              <div className="px-4 py-2 text-caption text-muted-foreground font-medium uppercase tracking-wide bg-neutral-50">Đơn vị</div>
              {donViResults.map(d => (
                <button key={d.id} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-100 transition-colors cursor-pointer text-left" onClick={() => { setActiveSection('donvi'); setCommandPaletteOpen(false); }}>
                  <Buildings size={16} weight="regular" className="text-accent flex-shrink-0" />
                  <div>
                    <p className="text-body-sm font-medium text-foreground">{d.tenDonVi}</p>
                    <p className="text-caption text-muted-foreground">{d.maDonVi} · {d.chuyenQuan}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {thuTucResults.length > 0 && (
            <div>
              <div className="px-4 py-2 text-caption text-muted-foreground font-medium uppercase tracking-wide bg-neutral-50">Thủ tục</div>
              {thuTucResults.map(t => (
                <button key={t.id} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-100 transition-colors cursor-pointer text-left" onClick={() => { setActiveSection('thutuc'); setCommandPaletteOpen(false); }}>
                  <ClipboardText size={16} weight="regular" className="text-warning flex-shrink-0" />
                  <div>
                    <p className="text-body-sm font-medium text-foreground">{t.tenThuTuc}</p>
                    <p className="text-caption text-muted-foreground">{t.maThuTuc} · {t.soNgayQuyDinh} ngày</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
