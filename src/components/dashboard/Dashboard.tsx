import React from 'react';
import { Folders, Clock, Warning, CheckCircle, XCircle, CalendarCheck, ArrowRight, ChartDonut, TrendUp } from '@phosphor-icons/react';
import { useQuery } from '@animaapp/playground-react-sdk';
import { useApp } from '../../context/AppContext';
import MetricCard from './MetricCard';
import { getTinhTrangBadgeClass, formatDate } from '../../utils/statusUtils';

export default function Dashboard() {
  const { setActiveSection } = useApp();
  const { data: tnhsList = [] } = useQuery('HoSoTNHS');
  const { data: nqtList = [] } = useQuery('HoSoNQT');

  const allHoSo = [...tnhsList, ...nqtList];
  const total = allHoSo.length;
  const truocHan = allHoSo.filter(h => h.tinhTrang === 'truoc_han').length;
  const canHan = allHoSo.filter(h => h.tinhTrang === 'can_han').length;
  const treHan = allHoSo.filter(h => h.tinhTrang === 'tre_han').length;
  const quaHan = allHoSo.filter(h => h.tinhTrang === 'qua_han').length;
  const daTraCount = allHoSo.filter(h => h.daTraGiay).length;
  const urgentCases = allHoSo.filter(h => !h.daTraGiay && h.soNgayConLai <= 2);
  const completionRate = total > 0 ? Math.round((daTraCount / total) * 100) : 0;
  const circumference = 2 * Math.PI * 38;
  const dashOffset = circumference - (completionRate / 100) * circumference;

  return (
    <main className="p-6 max-w-app mx-auto" aria-label="Trang chủ">

      {/* Hero Banner */}
      <section className="relative rounded-2xl overflow-hidden mb-8 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0f2554 0%, #1a3a8f 40%, #1e56c9 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)' }} />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #93c5fd 0%, transparent 70%)' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 24px, #fff 24px, #fff 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, #fff 24px, #fff 25px)' }} />
        <div className="relative flex items-center px-8 py-8 sm:py-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shadow-md border border-white/30">
                <span className="text-white font-heading font-bold text-sm">HS</span>
              </div>
              <h1 className="font-heading font-bold text-2xl text-white tracking-tight">QLHS</h1>
            </div>
            <p className="text-white/70 text-sm max-w-sm">Hệ thống quản lý hồ sơ BHXH — theo dõi tiến độ & hạn xử lý</p>
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 px-3 py-1.5 rounded-full">
                <TrendUp size={13} className="text-emerald-300" weight="bold" />
                <span className="text-white text-xs font-medium">Tỷ lệ hoàn thành {completionRate}%</span>
              </div>
              {urgentCases.length > 0 && (
                <div className="flex items-center gap-1.5 bg-red-500/25 border border-red-400/30 px-3 py-1.5 rounded-full">
                  <Warning size={13} className="text-red-300" weight="fill" />
                  <span className="text-white text-xs font-medium">{urgentCases.length} hồ sơ cần chú ý</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section aria-label="Thống kê tổng quan" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-h3 text-foreground">Tổng quan</h2>
          <span className="text-body-sm text-muted-foreground">{total} hồ sơ đang quản lý</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard label="Tổng hồ sơ" value={total} colorClass="text-white" bgClass="" icon={<Folders size={22} weight="fill" />} gradientClass="metric-gradient-blue" />
          <MetricCard label="Trước hạn" value={truocHan} colorClass="text-neutral-700" bgClass="bg-neutral-100" icon={<CalendarCheck size={22} weight="fill" />} />
          <MetricCard label="Cận hạn" value={canHan} colorClass="text-white" bgClass="" icon={<Clock size={22} weight="fill" />} gradientClass="metric-gradient-amber" onClick={() => setActiveSection('tnhs')} />
          <MetricCard label="Trễ hạn" value={treHan} colorClass="text-white" bgClass="" icon={<Warning size={22} weight="fill" />} gradientClass="metric-gradient-red" onClick={() => setActiveSection('tnhs')} />
          <MetricCard label="Quá hạn" value={quaHan} colorClass="text-red-800" bgClass="bg-red-100" icon={<XCircle size={22} weight="fill" />} onClick={() => setActiveSection('tnhs')} />
          <MetricCard label="Đã trả" value={daTraCount} colorClass="text-white" bgClass="" icon={<CheckCircle size={22} weight="fill" />} gradientClass="metric-gradient-green" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Warning Cases */}
        <section className="lg:col-span-2" aria-label="Hồ sơ cần chú ý">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border"
              style={{ background: 'linear-gradient(135deg, hsl(0,86%,97%) 0%, hsl(0,86%,99%) 100%)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <Warning size={16} weight="fill" className="text-error" />
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-h4 text-foreground">Hồ sơ cần chú ý</h2>
                  <p className="text-caption text-muted-foreground">{urgentCases.length} hồ sơ cận / quá hạn</p>
                </div>
              </div>
              <button onClick={() => setActiveSection('tnhs')} className="flex items-center gap-1 text-body-sm text-primary hover:text-primary-hover font-medium transition-colors cursor-pointer">
                Xem tất cả <ArrowRight size={14} weight="bold" />
              </button>
            </div>
            {urgentCases.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={28} weight="fill" className="text-success" />
                </div>
                <p className="text-body-sm font-medium text-foreground">Tất cả hồ sơ đang trong hạn</p>
                <p className="text-caption text-muted-foreground mt-1">Không có hồ sơ nào cần chú ý</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {urgentCases.slice(0, 6).map(h => (
                  <div key={h.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-neutral-50/80 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                        <Folders size={14} weight="fill" className="text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-body-sm font-semibold text-foreground font-mono truncate">{h.maHoSo}</p>
                        <p className="text-caption text-muted-foreground truncate">{h.tenDonVi} · {h.tenThuTuc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                      <span className="text-caption text-muted-foreground hidden sm:block">Hạn: {formatDate(h.ngayHenTra)}</span>
                      <span className={`px-2.5 py-1 rounded-full text-caption font-semibold ${getTinhTrangBadgeClass(h.tinhTrang)}`}>
                        {h.soNgayConLai <= 0 ? `Trễ ${Math.abs(h.soNgayConLai)}n` : `Còn ${h.soNgayConLai}n`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Completion Chart */}
        <section aria-label="Tỷ lệ hoàn thành">
          <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <ChartDonut size={16} weight="fill" className="text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-h4 text-foreground">Tỷ lệ hoàn thành</h2>
                <p className="text-caption text-muted-foreground">Trả giấy / Tổng hồ sơ</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="hsl(220, 18%, 92%)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="hsl(142, 71%, 45%)" strokeWidth="10"
                    strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading font-bold text-2xl text-foreground leading-none">{completionRate}%</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">hoàn thành</span>
                </div>
              </div>
              <div className="w-full space-y-2.5">
                {[
                  { label: 'Đã trả giấy', value: daTraCount, color: 'bg-success' },
                  { label: 'Đang xử lý', value: total - daTraCount, color: 'bg-primary' },
                  { label: 'Tổng cộng', value: total, color: 'bg-neutral-300' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-body-sm text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-body-sm font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Quick Actions */}
      <section aria-label="Thao tác nhanh" className="mb-8">
        <h2 className="font-heading font-semibold text-h3 text-foreground mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Báo cáo & Thống kê', section: 'baocao' as const, bg: 'bg-indigo-50 hover:bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', icon: '📊' },
            { label: 'Hồ sơ TNHS', section: 'tnhs' as const, bg: 'bg-blue-50 hover:bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: '📁' },
            { label: 'Hồ sơ NQT', section: 'nqt' as const, bg: 'bg-purple-50 hover:bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', icon: '📂' },
            { label: 'Danh mục đơn vị', section: 'donvi' as const, bg: 'bg-emerald-50 hover:bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: '🏢' },
            { label: 'HCC', section: 'hcc' as const, bg: 'bg-orange-50 hover:bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: '🔗' },
          ].map(item => (
            <button key={item.section} onClick={() => setActiveSection(item.section)}
              className={`p-4 rounded-xl border ${item.border} ${item.bg} ${item.text} text-left transition-all duration-150 cursor-pointer card-hover shadow-sm`}>
              <span className="text-2xl mb-2 block">{item.icon}</span>
              <span className="text-body-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
