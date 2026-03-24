import React, { useEffect, useState } from 'react';
import { Warning, Sun, Moon, ArrowRight, X, Clock } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';
import { useQuery } from '@animaapp/playground-react-sdk';
import { getTinhTrangBadgeClass, formatDate } from '../utils/statusUtils';

/** Returns storage key for today's session slot: "morning" (before 13:00) or "evening" */
function getSessionKey(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const slot = now.getHours() < 13 ? 'morning' : 'evening';
  return `alert_dismissed_${dateStr}_${slot}`;
}

export default function AlertModal() {
  const { setActiveSection } = useApp();
  const [open, setOpen] = useState(false);
  const { data: tnhsList = [] } = useQuery('HoSoTNHS');
  const { data: nqtList = [] } = useQuery('HoSoNQT');

  const urgentCases = [
    ...tnhsList.filter(h => !h.daTraGiay && h.soNgayConLai <= 2),
    ...nqtList.filter(h => !h.daTraGiay && h.soNgayConLai <= 2),
  ];

  useEffect(() => {
    if (urgentCases.length === 0) return;
    const key = getSessionKey();
    const dismissed = localStorage.getItem(key);
    if (!dismissed) {
      // Small delay so app renders first
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [urgentCases.length]);

  const handleClose = () => {
    const key = getSessionKey();
    localStorage.setItem(key, '1');
    setOpen(false);
  };

  const handleView = () => {
    handleClose();
    setActiveSection('tnhs');
  };

  if (!open) return null;

  const hour = new Date().getHours();
  const isMorning = hour < 13;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ backgroundColor: 'hsla(0,0%,0%,0.45)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
    >
      <div className="daily-popup w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden border border-border">

        {/* Header strip */}
        <div
          className="relative px-6 pt-7 pb-6 flex flex-col items-center text-center"
          style={{ background: isMorning ? 'linear-gradient(135deg, hsl(38,95%,60%) 0%, hsl(28,95%,68%) 100%)' : 'linear-gradient(135deg, hsl(250,60%,45%) 0%, hsl(200,70%,38%) 100%)' }}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X size={16} weight="bold" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-3 shadow-lg">
            {isMorning
              ? <Sun size={34} weight="fill" className="text-white" />
              : <Moon size={34} weight="fill" className="text-white" />}
          </div>
          <h2 id="alert-modal-title" className="font-heading font-bold text-xl text-white tracking-tight">
            {isMorning ? 'Chào buổi sáng! ☀️' : 'Nhắc buổi chiều 🌙'}
          </h2>
          <p className="text-white/80 text-sm mt-1 font-sans">
            {isMorning ? 'Kiểm tra danh sách hồ sơ cần xử lý hôm nay' : 'Còn hồ sơ chưa xử lý trước khi kết thúc ngày'}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <Warning size={15} weight="fill" className="text-error" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              <span className="text-error font-bold">{urgentCases.length} hồ sơ</span> cần xử lý (còn ≤ 2 ngày)
            </p>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-thin pr-1">
            {urgentCases.map(h => (
              <div key={h.id} className="flex items-center justify-between p-3 rounded-2xl border border-border bg-neutral-50 hover:bg-neutral-100 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground font-mono truncate">{h.maHoSo}</p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Clock size={11} />
                    {h.tenDonVi} · Hạn: {formatDate(h.ngayHenTra)}
                  </p>
                </div>
                <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${getTinhTrangBadgeClass(h.tinhTrang)}`}>
                  {h.soNgayConLai <= 0 ? `Trễ ${Math.abs(h.soNgayConLai)}n` : `Còn ${h.soNgayConLai}n`}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleView}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold text-white transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-md"
              style={{ background: isMorning ? 'hsl(28, 95%, 58%)' : 'hsl(250, 60%, 50%)' }}
            >
              <ArrowRight size={16} weight="bold" />
              Xem ngay
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-3 border border-border text-muted-foreground rounded-2xl text-sm font-medium hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
