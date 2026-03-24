import React, { useMemo, useState } from 'react';
import { useQuery } from '@animaapp/playground-react-sdk';
import { useApp } from '../../context/AppContext';
import {
  ChartBar, ChartPie, ChartLine, ArrowUp, ArrowDown, Folders,
  CheckCircle, Warning, XCircle, Clock, Buildings, FileText
} from '@phosphor-icons/react';
import { getTinhTrangLabel } from '../../utils/statusUtils';

// Simple bar chart component (no external lib needed)
function BarChart({ data, maxVal, colorClass }: { data: { label: string; value: number }[]; maxVal: number; colorClass: string }) {
  return (
    <div className="flex items-end gap-2 h-40 w-full">
      {data.map((item, i) => {
        const heightPct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
        return (
          <div key={i} className="flex flex-col items-center flex-1 gap-1">
            <span className="text-caption text-foreground font-medium">{item.value}</span>
            <div className="w-full rounded-t-sm flex items-end" style={{ height: '100px' }}>
              <div
                className={`w-full rounded-t-sm transition-all duration-700 ${colorClass}`}
                style={{ height: `${heightPct}%`, minHeight: item.value > 0 ? '4px' : '0' }}
              />
            </div>
            <span className="text-caption text-muted-foreground text-center leading-tight" style={{ fontSize: '10px' }}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Donut chart segment
function DonutChart({ segments, size = 120 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <div className="flex items-center justify-center text-muted-foreground text-body-sm" style={{ width: size, height: size }}>Không có dữ liệu</div>;
  const radius = 40;
  const cx = 50;
  const cy = 50;
  const circ = 2 * Math.PI * radius;

  let cumulative = 0;
  const slices = segments.map(seg => {
    const frac = seg.value / total;
    const dash = frac * circ;
    const offset = circ - cumulative * circ / total;
    const result = { ...seg, dash, offset: circ - (cumulative / total) * circ };
    cumulative += seg.value;
    return result;
  });

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
      {slices.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={radius} fill="none"
          stroke={s.color} strokeWidth="18"
          strokeDasharray={`${(s.value / total) * circ} ${circ}`}
          strokeDashoffset={-((slices.slice(0, i).reduce((acc, x) => acc + x.value, 0) / total) * circ)}
        />
      ))}
      <circle cx={cx} cy={cy} r="28" fill="white" />
    </svg>
  );
}

const TINHTRANG_COLORS: Record<string, string> = {
  truoc_han: '#6b7280',
  can_han: '#f59e0b',
  dung_han: '#3b82f6',
  tre_han: '#ef4444',
  qua_han: '#7f1d1d',
  da_tra: '#16a34a',
};

export default function BaoCaoDashboard() {
  const { setActiveSection } = useApp();
  const { data: tnhsList = [], isPending: p1 } = useQuery('HoSoTNHS');
  const { data: nqtList = [], isPending: p2 } = useQuery('HoSoNQT');
  const { data: donViList = [] } = useQuery('DonVi');
  const { data: hccList = [] } = useQuery('HCC');
  const [chartType, setChartType] = useState<'tnhs' | 'nqt' | 'all'>('all');

  const isPending = p1 || p2;

  const sourceData = useMemo(() => {
    if (chartType === 'tnhs') return tnhsList;
    if (chartType === 'nqt') return nqtList;
    return [...tnhsList, ...nqtList];
  }, [chartType, tnhsList, nqtList]);

  // Tình trạng distribution
  const tinhTrangStats = useMemo(() => {
    const counts: Record<string, number> = {};
    sourceData.forEach((h: any) => {
      counts[h.tinhTrang] = (counts[h.tinhTrang] || 0) + 1;
    });
    return ['truoc_han', 'can_han', 'dung_han', 'tre_han', 'qua_han', 'da_tra'].map(tt => ({
      label: getTinhTrangLabel(tt),
      value: counts[tt] || 0,
      color: TINHTRANG_COLORS[tt],
      key: tt,
    }));
  }, [sourceData]);

  // Hồ sơ theo đơn vị (top 8)
  const donViStats = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    sourceData.forEach((h: any) => {
      if (!counts[h.maDonVi]) counts[h.maDonVi] = { name: h.tenDonVi, count: 0 };
      counts[h.maDonVi].count++;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 8).map(d => ({
      label: d.name.length > 12 ? d.name.slice(0, 12) + '…' : d.name,
      value: d.count,
    }));
  }, [sourceData]);

  // Hồ sơ theo tháng (6 tháng gần nhất)
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const months: { label: string; key: string; tnhs: number; nqt: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
      months.push({ label, key, tnhs: 0, nqt: 0 });
    }
    tnhsList.forEach((h: any) => {
      const d = h.ngayTiepNhan instanceof Date ? h.ngayTiepNhan : new Date(h.ngayTiepNhan);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const m = months.find(x => x.key === key);
      if (m) m.tnhs++;
    });
    nqtList.forEach((h: any) => {
      const d = h.ngayTiepNhan instanceof Date ? h.ngayTiepNhan : new Date(h.ngayTiepNhan);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const m = months.find(x => x.key === key);
      if (m) m.nqt++;
    });
    return months;
  }, [tnhsList, nqtList]);

  // Summary KPIs
  const total = sourceData.length;
  const daTraCount = sourceData.filter((h: any) => h.daTraGiay).length;
  const treHanCount = sourceData.filter((h: any) => h.tinhTrang === 'tre_han' || h.tinhTrang === 'qua_han').length;
  const canHanCount = sourceData.filter((h: any) => h.tinhTrang === 'can_han').length;
  const completionRate = total > 0 ? Math.round((daTraCount / total) * 100) : 0;
  const maxDonVi = Math.max(...donViStats.map(d => d.value), 1);
  const maxMonthly = Math.max(...monthlyStats.map(m => m.tnhs + m.nqt), 1);

  // HCC stats
  const hccByDonVi = useMemo(() => {
    const counts: Record<string, number> = {};
    hccList.forEach((h: any) => {
      counts[h.tenDonViNhan] = (counts[h.tenDonViNhan] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [hccList]);

  if (isPending) return <div className="p-6 text-center text-muted-foreground">Đang tải dữ liệu báo cáo...</div>;

  return (
    <main className="p-6 max-w-app mx-auto" aria-label="Báo cáo thống kê">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-semibold text-h2 text-foreground flex items-center gap-2">
            <ChartBar size={28} className="text-primary" weight="regular" />
            Báo cáo & Thống kê
          </h1>
          <p className="text-body-sm text-muted-foreground mt-1">Tổng quan dữ liệu hồ sơ theo thời gian thực</p>
        </div>
        {/* Source toggle */}
        <div className="flex bg-neutral-100 rounded-lg p-1 gap-1">
          {(['all', 'tnhs', 'nqt'] as const).map(t => (
            <button key={t} onClick={() => setChartType(t)}
              className={`px-3 py-1.5 rounded-md text-body-sm font-medium transition-colors cursor-pointer ${chartType === t ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {t === 'all' ? 'Tất cả' : t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng hồ sơ', value: total, sub: `${tnhsList.length} TNHS · ${nqtList.length} NQT`, icon: <Folders size={20} />, color: 'text-primary', bg: 'bg-blue-50' },
          { label: 'Đã hoàn thành', value: daTraCount, sub: `${completionRate}% tỷ lệ`, icon: <CheckCircle size={20} />, color: 'text-success', bg: 'bg-green-50' },
          { label: 'Trễ / Quá hạn', value: treHanCount, sub: 'Cần xử lý ngay', icon: <XCircle size={20} />, color: 'text-error', bg: 'bg-red-50' },
          { label: 'Cận hạn', value: canHanCount, sub: 'Sắp đến hạn', icon: <Clock size={20} />, color: 'text-warning', bg: 'bg-amber-50' },
        ].map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-md p-5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-md ${kpi.bg} flex items-center justify-center flex-shrink-0 ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-caption text-muted-foreground font-medium uppercase tracking-wide">{kpi.label}</p>
              <p className={`text-h3 font-heading font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-caption text-muted-foreground">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Donut + Status Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Donut tình trạng */}
        <div className="bg-card border border-border rounded-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChartPie size={18} className="text-primary" />
            <h2 className="font-heading font-semibold text-h4 text-foreground">Phân bố tình trạng</h2>
          </div>
          <div className="flex items-center gap-4">
            <DonutChart segments={tinhTrangStats.filter(s => s.value > 0).map(s => ({ value: s.value, color: s.color, label: s.label }))} size={110} />
            <div className="flex-1 space-y-1.5">
              {tinhTrangStats.filter(s => s.value > 0).map(s => (
                <div key={s.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-caption text-foreground">{s.label}</span>
                  </div>
                  <span className="text-caption font-medium text-foreground">{s.value}</span>
                </div>
              ))}
              {tinhTrangStats.every(s => s.value === 0) && (
                <p className="text-body-sm text-muted-foreground">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>

        {/* Progress bars - tỷ lệ */}
        <div className="lg:col-span-2 bg-card border border-border rounded-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChartBar size={18} className="text-primary" />
            <h2 className="font-heading font-semibold text-h4 text-foreground">Chi tiết tình trạng</h2>
          </div>
          <div className="space-y-3">
            {tinhTrangStats.map(s => {
              const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
              return (
                <div key={s.key}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-body-sm text-foreground font-medium">{s.label}</span>
                    <span className="text-body-sm font-medium text-foreground">{s.value} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Monthly bar + Don vi bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly */}
        <div className="bg-card border border-border rounded-md p-6">
          <div className="flex items-center gap-2 mb-5">
            <ChartLine size={18} className="text-primary" />
            <h2 className="font-heading font-semibold text-h4 text-foreground">Hồ sơ tiếp nhận 6 tháng</h2>
          </div>
          <div className="flex items-end gap-1 h-40 w-full mb-2">
            {monthlyStats.map((m, i) => {
              const totalM = m.tnhs + m.nqt;
              const hPct = maxMonthly > 0 ? (totalM / maxMonthly) * 100 : 0;
              const tPct = totalM > 0 ? (m.tnhs / totalM) * 100 : 0;
              return (
                <div key={i} className="flex flex-col items-center flex-1 gap-1">
                  <span className="text-caption text-foreground font-medium" style={{ fontSize: '10px' }}>{totalM > 0 ? totalM : ''}</span>
                  <div className="w-full flex items-end rounded-t-sm overflow-hidden" style={{ height: '100px' }}>
                    <div className="w-full flex flex-col justify-end rounded-t-sm overflow-hidden" style={{ height: `${hPct}%`, minHeight: totalM > 0 ? '4px' : '0' }}>
                      <div className="bg-purple-400" style={{ height: `${100 - tPct}%` }} />
                      <div className="bg-primary" style={{ height: `${tPct}%` }} />
                    </div>
                  </div>
                  <span className="text-caption text-muted-foreground" style={{ fontSize: '10px' }}>{m.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-primary" /><span className="text-caption text-muted-foreground">TNHS</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-purple-400" /><span className="text-caption text-muted-foreground">NQT</span></div>
          </div>
        </div>

        {/* By don vi */}
        <div className="bg-card border border-border rounded-md p-6">
          <div className="flex items-center gap-2 mb-5">
            <Buildings size={18} className="text-primary" />
            <h2 className="font-heading font-semibold text-h4 text-foreground">Top đơn vị nhiều hồ sơ</h2>
          </div>
          {donViStats.length === 0 ? (
            <div className="text-center text-muted-foreground text-body-sm py-8">Chưa có dữ liệu</div>
          ) : (
            <BarChart data={donViStats} maxVal={maxDonVi} colorClass="bg-primary/70" />
          )}
        </div>
      </div>

      {/* Row 3: Completion rate + HCC + Summary table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Completion radial */}
        <div className="bg-card border border-border rounded-md p-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 self-start">
            <CheckCircle size={18} className="text-success" />
            <h2 className="font-heading font-semibold text-h4 text-foreground">Tỷ lệ hoàn thành</h2>
          </div>
          <div className="relative w-36 h-36 my-2">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(0,0%,90%)" strokeWidth="14" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(150,60%,40%)" strokeWidth="14"
                strokeDasharray={`${2 * Math.PI * 40 * completionRate / 100} ${2 * Math.PI * 40}`}
                strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease-out' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading font-bold text-h2 text-foreground">{completionRate}%</span>
              <span className="text-caption text-muted-foreground">hoàn thành</span>
            </div>
          </div>
          <div className="w-full mt-3 space-y-2 text-body-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Đã trả giấy</span><span className="font-medium text-success">{daTraCount}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Đang xử lý</span><span className="font-medium">{total - daTraCount}</span></div>
          </div>
        </div>

        {/* HCC stats */}
        <div className="bg-card border border-border rounded-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-orange-500" />
            <h2 className="font-heading font-semibold text-h4 text-foreground">HCC theo đơn vị</h2>
          </div>
          {hccByDonVi.length === 0 ? (
            <p className="text-body-sm text-muted-foreground">Chưa có dữ liệu HCC</p>
          ) : (
            <div className="space-y-3">
              {hccByDonVi.map(([name, count], i) => {
                const maxHcc = hccByDonVi[0][1];
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-body-sm text-foreground truncate max-w-[160px]">{name}</span>
                      <span className="text-body-sm font-medium text-foreground ml-2">{count}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full transition-all duration-700" style={{ width: `${(count / maxHcc) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex justify-between text-body-sm">
              <span className="text-muted-foreground">Tổng HCC</span>
              <span className="font-medium">{hccList.length}</span>
            </div>
          </div>
        </div>

        {/* Summary table */}
        <div className="bg-card border border-border rounded-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Warning size={18} className="text-warning" />
            <h2 className="font-heading font-semibold text-h4 text-foreground">Chỉ số hiệu quả</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'TNHS đang xử lý', value: tnhsList.filter((h: any) => !h.daTraGiay).length, color: 'text-primary' },
              { label: 'NQT đang xử lý', value: nqtList.filter((h: any) => !h.daTraGiay).length, color: 'text-secondary' },
              { label: 'HS cận hạn (≤2 ngày)', value: [...tnhsList, ...nqtList].filter((h: any) => !h.daTraGiay && h.soNgayConLai >= 0 && h.soNgayConLai <= 2).length, color: 'text-warning' },
              { label: 'HS trễ hạn (< 0 ngày)', value: [...tnhsList, ...nqtList].filter((h: any) => !h.daTraGiay && h.soNgayConLai < 0).length, color: 'text-error' },
              { label: 'Tổng đơn vị', value: donViList.length, color: 'text-foreground' },
              { label: 'Tổng HCC', value: hccList.length, color: 'text-orange-600' },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-1 border-b border-neutral-50">
                <span className="text-body-sm text-muted-foreground">{row.label}</span>
                <span className={`text-body-sm font-semibold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick navigate */}
      <section className="bg-neutral-50 border border-border rounded-md p-4">
        <p className="text-body-sm text-muted-foreground mb-3 font-medium">Điều hướng nhanh đến bảng quản lý:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '→ Hồ sơ TNHS', section: 'tnhs' as const, cls: 'bg-blue-50 text-primary border-blue-100' },
            { label: '→ Hồ sơ NQT', section: 'nqt' as const, cls: 'bg-purple-50 text-secondary border-purple-100' },
            { label: '→ HCC', section: 'hcc' as const, cls: 'bg-orange-50 text-orange-700 border-orange-100' },
            { label: '→ Đơn vị', section: 'donvi' as const, cls: 'bg-green-50 text-success border-green-100' },
            { label: '→ Thủ tục', section: 'thutuc' as const, cls: 'bg-teal-50 text-teal-700 border-teal-100' },
          ].map(nav => (
            <button key={nav.section} onClick={() => setActiveSection(nav.section)}
              className={`px-3 py-1.5 rounded-md border text-body-sm font-medium cursor-pointer hover:opacity-80 transition-opacity ${nav.cls}`}>
              {nav.label}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
