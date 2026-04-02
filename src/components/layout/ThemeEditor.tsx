import React, { useState, useRef, useEffect } from 'react';
import { Palette, X, ArrowCounterClockwise } from '@phosphor-icons/react';

type ThemePreset = {
  label: string;
  primary: string;
  sidebar: string;
  background: string;
  card: string;
  foreground: string;
};

const PRESETS: ThemePreset[] = [
  {
    label: 'Retro Cam & Navy',
    primary: 'hsl(28,100%,55%)',
    sidebar: 'hsl(220,35%,8%)',
    background: 'hsl(220,28%,10%)',
    card: 'hsl(220,30%,13%)',
    foreground: 'hsl(38,80%,92%)',
  },
  {
    label: 'Xanh Ngọc & Đen',
    primary: 'hsl(174,72%,44%)',
    sidebar: 'hsl(200,30%,8%)',
    background: 'hsl(200,22%,10%)',
    card: 'hsl(200,25%,13%)',
    foreground: 'hsl(174,60%,92%)',
  },
  {
    label: 'Đỏ Garnet & Đen',
    primary: 'hsl(348,85%,54%)',
    sidebar: 'hsl(348,25%,8%)',
    background: 'hsl(348,18%,10%)',
    card: 'hsl(348,20%,13%)',
    foreground: 'hsl(0,60%,94%)',
  },
  {
    label: 'Vàng & Nâu Đậm',
    primary: 'hsl(45,95%,52%)',
    sidebar: 'hsl(30,30%,8%)',
    background: 'hsl(30,22%,10%)',
    card: 'hsl(30,25%,13%)',
    foreground: 'hsl(45,70%,92%)',
  },
  {
    label: 'Tím & Đêm',
    primary: 'hsl(262,80%,62%)',
    sidebar: 'hsl(262,30%,8%)',
    background: 'hsl(262,20%,10%)',
    card: 'hsl(262,22%,13%)',
    foreground: 'hsl(262,50%,94%)',
  },
  {
    label: 'Trắng Sáng',
    primary: 'hsl(221,83%,53%)',
    sidebar: 'hsl(221,40%,18%)',
    background: 'hsl(0,0%,97%)',
    card: 'hsl(0,0%,100%)',
    foreground: 'hsl(221,30%,12%)',
  },
];

const DEFAULT = PRESETS[0];

function applyTheme(preset: ThemePreset) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary-background', preset.primary);
  root.style.setProperty('--color-ring', preset.primary);
  root.style.setProperty('--color-sidebar', preset.sidebar);
  root.style.setProperty('--color-sidebar-active', preset.primary);
  root.style.setProperty('--color-background', preset.background);
  root.style.setProperty('--color-card', preset.card);
  root.style.setProperty('--color-card-foreground', preset.foreground);
  root.style.setProperty('--color-foreground', preset.foreground);
  document.body.style.backgroundColor = preset.background;
  document.body.style.color = preset.foreground;
}

function resetTheme() {
  applyTheme(DEFAULT);
}

export default function ThemeEditor() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (index: number) => {
    setActive(index);
    applyTheme(PRESETS[index]);
  };

  const handleReset = () => {
    setActive(0);
    resetTheme();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        title="Chỉnh sửa giao diện"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-neutral-50 text-muted-foreground text-body-sm hover:border-primary/40 hover:bg-white hover:text-foreground transition-all duration-150 cursor-pointer"
        style={open ? { borderColor: 'var(--color-primary-background)', color: 'var(--color-primary-background)' } : {}}
      >
        <Palette size={14} weight="fill" />
        <span className="text-xs font-semibold">Theme</span>
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-72 rounded-2xl border border-border shadow-xl z-50 overflow-hidden"
          style={{ background: 'var(--color-card)', animation: 'slideDown 180ms cubic-bezier(0.16,1,0.3,1)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Palette size={14} weight="fill" style={{ color: 'var(--color-primary-background)' }} />
              <span className="text-sm font-heading font-bold" style={{ color: 'var(--color-foreground)' }}>Chỉnh sửa Theme</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Đặt lại mặc định"
                className="p-1.5 rounded-lg transition-colors cursor-pointer"
                style={{ color: 'var(--color-muted-foreground)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <ArrowCounterClockwise size={13} weight="bold" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg transition-colors cursor-pointer"
                style={{ color: 'var(--color-muted-foreground)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={13} weight="bold" />
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted-foreground)' }}>Bộ màu có sẵn</p>
            <div className="grid grid-cols-1 gap-1.5">
              {PRESETS.map((preset, i) => (
                <button
                  key={preset.label}
                  onClick={() => handleSelect(i)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left"
                  style={{
                    background: active === i ? 'var(--color-muted)' : 'transparent',
                    border: active === i ? '1px solid var(--color-primary-background)' : '1px solid transparent',
                  }}
                  onMouseEnter={e => { if (active !== i) (e.currentTarget as HTMLElement).style.background = 'var(--color-muted)'; }}
                  onMouseLeave={e => { if (active !== i) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {/* Color swatches */}
                  <div className="flex gap-1 flex-shrink-0">
                    <span className="w-5 h-5 rounded-full border-2 border-white/20 shadow-sm block"
                      style={{ background: preset.sidebar }} />
                    <span className="w-5 h-5 rounded-full border-2 border-white/20 shadow-sm block"
                      style={{ background: preset.primary }} />
                  </div>
                  <span className="text-xs font-semibold flex-1" style={{ color: 'var(--color-foreground)' }}>
                    {preset.label}
                  </span>
                  {active === i && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: preset.primary, color: preset.foreground }}>
                      Đang dùng
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="px-4 py-2.5 border-t border-border">
            <p className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>
              * Theme sẽ reset khi tải lại trang. Tính năng lưu sẽ có trong phiên bản sau.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
