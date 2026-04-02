import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus, MagnifyingGlass, Trash, FloppyDisk, X, PencilSimple,
  Printer, DownloadSimple, CheckSquare, Square, CaretDown,
  FileText, PencilLine
} from '@phosphor-icons/react';
import { useQuery, useMutation } from '@animaapp/playground-react-sdk';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/statusUtils';

const PAGE_SIZE = 15;

type HoSoSource = {
  id: string;
  maHoSo: string;
  tenDonVi: string;
  ngayTiepNhan: Date;
  ngayHenTra: Date;
  chuyenQuan: string;
  nguon: 'tnhs' | 'nqt';
};

// ─── Print/Export helpers ───────────────────────────────────────────────────
function printBBBG(records: any[], title = 'BIÊN BẢN BÀN GIAO HỒ SƠ') {
  const rows = records.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${r.maHoSo}</td>
      <td>${r.tenDonVi}</td>
      <td>${formatDate(r.ngayNhan)}</td>
      <td>${formatDate(r.ngayHenTra)}</td>
      <td>${r.chuyenQuan}</td>
      <td>${formatDate(r.thoiGianTao)}</td>
      <td>${r.ghiChu || ''}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; padding: 20px; }
    h2 { text-align: center; margin-bottom: 4px; font-size: 16px; }
    .sub { text-align: center; font-size: 12px; color: #555; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; font-size: 12px; }
    th { background: #f0f0f0; font-weight: bold; }
    tr:nth-child(even) { background: #fafafa; }
    .footer { margin-top: 24px; display: flex; justify-content: space-between; }
    .sign { text-align: center; width: 200px; }
    @media print { button { display: none; } }
  </style></head><body>
  <h2>${title}</h2>
  <p class="sub">Ngày in: ${new Date().toLocaleString('vi-VN')}</p>
  <table>
    <thead><tr>
      <th>STT</th><th>Mã HS</th><th>Tên đơn vị</th><th>Ngày nhận</th>
      <th>Ngày hẹn trả</th><th>Chuyên quản</th><th>TG tạo BB</th><th>Ghi chú</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    <div class="sign"><p>Người bàn giao</p><br/><br/><p>................................</p></div>
    <div class="sign"><p>Người nhận</p><br/><br/><p>................................</p></div>
  </div>
  </body></html>`;

  const w = window.open('', '_blank', 'width=1000,height=700');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 400);
}

function exportCSV(records: any[]) {
  const header = 'Mã HS,Tên đơn vị,Ngày nhận,Ngày hẹn trả,Chuyên quản,TG tạo biên bản,Nguồn,Ghi chú';
  const rows = records.map(r =>
    [r.maHoSo, r.tenDonVi, formatDate(r.ngayNhan), formatDate(r.ngayHenTra),
      r.chuyenQuan, formatDate(r.thoiGianTao), r.nguonHoSo, r.ghiChu || '']
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BBBG_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── HoSo Picker Modal ───────────────────────────────────────────────────────
interface HoSoPickerProps {
  onSelect: (items: HoSoSource[]) => void;
  onClose: () => void;
}

function HoSoPicker({ onSelect, onClose }: HoSoPickerProps) {
  const { data: tnhsList = [] } = useQuery('HoSoTNHS', { orderBy: { ngayTiepNhan: 'desc' } });
  const { data: nqtList = [] } = useQuery('HoSoNQT', { orderBy: { ngayTiepNhan: 'desc' } });
  const [tab, setTab] = useState<'tnhs' | 'nqt'>('tnhs');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const combined: HoSoSource[] = useMemo(() => {
    const list = tab === 'tnhs'
      ? tnhsList.map(h => ({ id: h.id, maHoSo: h.maHoSo, tenDonVi: h.tenDonVi, ngayTiepNhan: h.ngayTiepNhan, ngayHenTra: h.ngayHenTra, chuyenQuan: h.chuyenQuan, nguon: 'tnhs' as const }))
      : nqtList.map(h => ({ id: h.id, maHoSo: h.maHoSo, tenDonVi: h.tenDonVi, ngayTiepNhan: h.ngayTiepNhan, ngayHenTra: h.ngayHenTra, chuyenQuan: h.chuyenQuan, nguon: 'nqt' as const }));
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(h => h.maHoSo.toLowerCase().includes(q) || h.tenDonVi.toLowerCase().includes(q) || h.chuyenQuan.toLowerCase().includes(q));
  }, [tab, search, tnhsList, nqtList]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === combined.length) setSelected(new Set());
    else setSelected(new Set(combined.map(h => h.id)));
  };

  const handleConfirm = () => {
    const picked = combined.filter(h => selected.has(h.id));
    onSelect(picked);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'hsla(0,0%,0%,0.5)' }} onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-h4 text-foreground">Chọn hồ sơ từ danh sách</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer text-muted-foreground"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3">
          {(['tnhs', 'nqt'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setSelected(new Set()); }}
              className={`px-4 py-2 rounded-lg text-body-sm font-semibold transition-colors cursor-pointer ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-neutral-100'}`}>
              {t === 'tnhs' ? 'Hồ sơ TNHS' : 'Hồ sơ NQT'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-5 pt-3 pb-2">
          <div className="relative">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm mã HS, đơn vị, chuyên quản..."
              className="w-full h-9 pl-9 pr-3 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-5 pb-3">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left w-8">
                  <button onClick={toggleAll} className="cursor-pointer text-muted-foreground hover:text-primary">
                    {selected.size === combined.length && combined.length > 0 ? <CheckSquare size={16} weight="fill" className="text-primary" /> : <Square size={16} />}
                  </button>
                </th>
                <th className="py-2 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Mã HS</th>
                <th className="py-2 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Đơn vị</th>
                <th className="py-2 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Ngày nhận</th>
                <th className="py-2 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Hạn trả</th>
                <th className="py-2 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Chuyên quản</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {combined.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Không có hồ sơ</td></tr>
              )}
              {combined.map(h => (
                <tr key={h.id} onClick={() => toggle(h.id)} className="hover:bg-neutral-50 cursor-pointer transition-colors">
                  <td className="py-2 pr-3">
                    {selected.has(h.id) ? <CheckSquare size={16} weight="fill" className="text-primary" /> : <Square size={16} className="text-muted-foreground" />}
                  </td>
                  <td className="py-2 font-mono font-medium text-primary">{h.maHoSo}</td>
                  <td className="py-2 text-foreground max-w-36 truncate">{h.tenDonVi}</td>
                  <td className="py-2 text-muted-foreground">{formatDate(h.ngayTiepNhan)}</td>
                  <td className="py-2 text-muted-foreground">{formatDate(h.ngayHenTra)}</td>
                  <td className="py-2 text-foreground">{h.chuyenQuan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-neutral-50">
          <span className="text-body-sm text-muted-foreground">Đã chọn: <strong className="text-foreground">{selected.size}</strong></span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-border text-foreground rounded-lg text-body-sm hover:bg-neutral-100 transition-colors cursor-pointer">Hủy</button>
            <button onClick={handleConfirm} disabled={selected.size === 0}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-body-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-40">
              Thêm {selected.size > 0 ? `(${selected.size})` : ''} vào BB
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BBBGManager() {
  const { addToast, currentUser } = useApp();
  const isAdmin = currentUser.vai_tro === 'admin';

  const { data: bbbgList = [], isPending } = useQuery('BBBG', { orderBy: { thoiGianTao: 'desc' } });
  const { create, update, remove, isPending: isMutating } = useMutation('BBBG');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showPicker, setShowPicker] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const todayStr = new Date().toISOString().slice(0, 10);
  const [newData, setNewData] = useState({
    maHoSo: '',
    tenDonVi: '',
    ngayNhan: todayStr,
    ngayHenTra: '',
    chuyenQuan: '',
    ghiChu: '',
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return bbbgList;
    const q = search.toLowerCase();
    return bbbgList.filter((b: any) =>
      (b.maHoSo || '').toLowerCase().includes(q) ||
      (b.tenDonVi || '').toLowerCase().includes(q) ||
      (b.chuyenQuan || '').toLowerCase().includes(q) ||
      (b.ghiChu || '').toLowerCase().includes(q)
    );
  }, [bbbgList, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectedRecords = bbbgList.filter((b: any) => selectedIds.has(b.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map((b: any) => b.id)));
  };

  // Add from picker
  const handlePickerSelect = async (items: HoSoSource[]) => {
    setShowPicker(false);
    if (items.length === 0) return;
    let ok = 0;
    for (const item of items) {
      try {
        await create({
          maHoSo: item.maHoSo,
          tenDonVi: item.tenDonVi,
          ngayNhan: item.ngayTiepNhan,
          ngayHenTra: item.ngayHenTra,
          chuyenQuan: item.chuyenQuan,
          ghiChu: '',
          thoiGianTao: new Date(),
          nguonHoSo: item.nguon,
          maHoSoRef: item.id,
        });
        ok++;
      } catch {
        // continue
      }
    }
    addToast(`Đã thêm ${ok} hồ sơ vào biên bản`, 'success');
  };

  // Manual add
  const handleManualAdd = async () => {
    if (!newData.maHoSo.trim()) { addToast('Vui lòng nhập mã hồ sơ', 'error'); return; }
    if (!newData.ngayNhan) { addToast('Vui lòng chọn ngày nhận', 'error'); return; }
    if (!newData.ngayHenTra) { addToast('Vui lòng chọn ngày hẹn trả', 'error'); return; }
    try {
      await create({
        maHoSo: newData.maHoSo,
        tenDonVi: newData.tenDonVi,
        ngayNhan: new Date(newData.ngayNhan),
        ngayHenTra: new Date(newData.ngayHenTra),
        chuyenQuan: newData.chuyenQuan,
        ghiChu: newData.ghiChu,
        thoiGianTao: new Date(),
        nguonHoSo: 'manual',
      });
      setNewData({ maHoSo: '', tenDonVi: '', ngayNhan: todayStr, ngayHenTra: '', chuyenQuan: '', ghiChu: '' });
      setShowManualAdd(false);
      addToast('Đã thêm hồ sơ vào biên bản', 'success');
    } catch {
      addToast('Lỗi khi thêm', 'error');
    }
  };

  const handleEdit = (b: any) => {
    setEditId(b.id);
    setEditData({
      maHoSo: b.maHoSo,
      tenDonVi: b.tenDonVi,
      ngayNhan: b.ngayNhan instanceof Date ? b.ngayNhan.toISOString().slice(0, 10) : new Date(b.ngayNhan).toISOString().slice(0, 10),
      ngayHenTra: b.ngayHenTra instanceof Date ? b.ngayHenTra.toISOString().slice(0, 10) : new Date(b.ngayHenTra).toISOString().slice(0, 10),
      chuyenQuan: b.chuyenQuan,
      ghiChu: b.ghiChu || '',
    });
  };

  const handleSave = async () => {
    if (!editId) return;
    try {
      await update(editId, {
        maHoSo: editData.maHoSo,
        tenDonVi: editData.tenDonVi,
        ngayNhan: new Date(editData.ngayNhan),
        ngayHenTra: new Date(editData.ngayHenTra),
        chuyenQuan: editData.chuyenQuan,
        ghiChu: editData.ghiChu,
      });
      addToast('Cập nhật thành công', 'success');
      setEditId(null);
    } catch {
      addToast('Lỗi khi cập nhật', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa hồ sơ này khỏi biên bản?')) return;
    try {
      await remove(id);
      addToast('Đã xóa', 'info');
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    } catch {
      addToast('Lỗi khi xóa', 'error');
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Xóa ${selectedIds.size} hồ sơ đã chọn?`)) return;
    let ok = 0;
    for (const id of selectedIds) {
      try { await remove(id); ok++; } catch { /* continue */ }
    }
    setSelectedIds(new Set());
    addToast(`Đã xóa ${ok} hồ sơ`, 'info');
  };

  const inputCls = 'w-full h-9 px-3 rounded border border-primary text-foreground bg-card text-body-sm focus:outline-none';

  const nguonBadge = (s: string) => {
    if (s === 'tnhs') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">TNHS</span>;
    if (s === 'nqt') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">NQT</span>;
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600">Thủ công</span>;
  };

  if (isPending) return <div className="p-6 text-center text-muted-foreground">Đang tải...</div>;

  return (
    <main className="p-6 max-w-app mx-auto" aria-label="Quản lý Biên bản bàn giao">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading font-semibold text-h2 text-foreground">Biên bản bàn giao (BBBG)</h1>
          <p className="text-body-sm text-muted-foreground mt-1">{filtered.length} hồ sơ</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Export/Print */}
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 px-3 py-2 border border-border text-foreground rounded-xl text-body-sm font-medium hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Xuất CSV toàn bộ"
          >
            <DownloadSimple size={16} /> Xuất CSV
          </button>
          <button
            onClick={() => printBBBG(selectedIds.size > 0 ? selectedRecords : filtered)}
            className="flex items-center gap-2 px-3 py-2 border border-border text-foreground rounded-xl text-body-sm font-medium hover:bg-neutral-100 transition-colors cursor-pointer"
            title={selectedIds.size > 0 ? 'In các hồ sơ đã chọn' : 'In tất cả'}
          >
            <Printer size={16} /> {selectedIds.size > 0 ? `In (${selectedIds.size})` : 'In tất cả'}
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl text-body-sm font-medium hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <CheckSquare size={16} /> Chọn từ danh sách
              </button>
              <button
                onClick={() => setShowManualAdd(v => !v)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-body-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
              >
                <PencilLine size={16} /> Thêm thủ công
              </button>
            </>
          )}
        </div>
      </div>

      {/* Manual Add Form */}
      {showManualAdd && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="font-heading font-semibold text-h4 text-foreground mb-4">Thêm hồ sơ thủ công</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Mã hồ sơ *</label>
              <input type="text" value={newData.maHoSo} onChange={e => setNewData(p => ({ ...p, maHoSo: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="TNHS2024-0001" />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Tên đơn vị</label>
              <input type="text" value={newData.tenDonVi} onChange={e => setNewData(p => ({ ...p, tenDonVi: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Tên đơn vị..." />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Chuyên quản</label>
              <input type="text" value={newData.chuyenQuan} onChange={e => setNewData(p => ({ ...p, chuyenQuan: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Chuyên quản..." />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Ngày nhận *</label>
              <input type="date" value={newData.ngayNhan} onChange={e => setNewData(p => ({ ...p, ngayNhan: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Ngày hẹn trả *</label>
              <input type="date" value={newData.ngayHenTra} onChange={e => setNewData(p => ({ ...p, ngayHenTra: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Ghi chú</label>
              <input type="text" value={newData.ghiChu} onChange={e => setNewData(p => ({ ...p, ghiChu: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Ghi chú..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleManualAdd} disabled={isMutating}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-body-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-40">
              <FloppyDisk size={16} /> Lưu
            </button>
            <button onClick={() => setShowManualAdd(false)}
              className="px-4 py-2.5 border border-border text-foreground rounded-xl text-body-sm hover:bg-neutral-100 transition-colors cursor-pointer">
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Search & bulk actions */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm mã HS, đơn vị, chuyên quản..."
            className="w-full h-11 pl-9 pr-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
        </div>
        {selectedIds.size > 0 && isAdmin && (
          <button onClick={handleDeleteSelected} disabled={isMutating}
            className="flex items-center gap-2 px-3 py-2 bg-red-50 text-error border border-red-200 rounded-xl text-body-sm font-medium hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-40">
            <Trash size={15} /> Xóa ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Bảng biên bản bàn giao">
            <thead>
              <tr className="bg-neutral-50 border-b border-border">
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleAll} className="cursor-pointer text-muted-foreground hover:text-primary">
                    {selectedIds.size === paginated.length && paginated.length > 0
                      ? <CheckSquare size={16} weight="fill" className="text-primary" />
                      : <Square size={16} />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Mã HS</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Tên đơn vị</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Ngày nhận</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Hạn trả</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Chuyên quản</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">TG tạo BB</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Nguồn</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Ghi chú</th>
                {isAdmin && <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                        <FileText size={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-body-sm">Chưa có hồ sơ trong biên bản</p>
                      {isAdmin && <p className="text-caption text-muted-foreground">Chọn từ danh sách hoặc thêm thủ công</p>}
                    </div>
                  </td>
                </tr>
              ) : paginated.map((b: any) => (
                <tr key={b.id} className={`hover:bg-neutral-50 transition-colors ${selectedIds.has(b.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(b.id)} className="cursor-pointer">
                      {selectedIds.has(b.id)
                        ? <CheckSquare size={16} weight="fill" className="text-primary" />
                        : <Square size={16} className="text-muted-foreground" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {editId === b.id
                      ? <input type="text" value={editData.maHoSo} onChange={e => setEditData((p: any) => ({ ...p, maHoSo: e.target.value }))} className={inputCls} />
                      : <span className="text-body-sm font-mono font-medium text-primary">{b.maHoSo}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {editId === b.id
                      ? <input type="text" value={editData.tenDonVi} onChange={e => setEditData((p: any) => ({ ...p, tenDonVi: e.target.value }))} className={inputCls} />
                      : <span className="text-body-sm text-foreground">{b.tenDonVi || '—'}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {editId === b.id
                      ? <input type="date" value={editData.ngayNhan} onChange={e => setEditData((p: any) => ({ ...p, ngayNhan: e.target.value }))} className={inputCls} />
                      : <span className="text-body-sm text-foreground">{formatDate(b.ngayNhan)}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {editId === b.id
                      ? <input type="date" value={editData.ngayHenTra} onChange={e => setEditData((p: any) => ({ ...p, ngayHenTra: e.target.value }))} className={inputCls} />
                      : <span className="text-body-sm text-foreground">{formatDate(b.ngayHenTra)}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {editId === b.id
                      ? <input type="text" value={editData.chuyenQuan} onChange={e => setEditData((p: any) => ({ ...p, chuyenQuan: e.target.value }))} className={inputCls} />
                      : <span className="text-body-sm text-foreground">{b.chuyenQuan || '—'}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-body-sm text-muted-foreground">
                      {b.thoiGianTao
                        ? (b.thoiGianTao instanceof Date ? b.thoiGianTao : new Date(b.thoiGianTao)).toLocaleString('vi-VN')
                        : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{nguonBadge(b.nguonHoSo)}</td>
                  <td className="px-4 py-3">
                    {editId === b.id
                      ? <input type="text" value={editData.ghiChu} onChange={e => setEditData((p: any) => ({ ...p, ghiChu: e.target.value }))} className={inputCls} placeholder="Ghi chú..." />
                      : <span className="text-body-sm text-muted-foreground">{b.ghiChu || '—'}</span>}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {editId === b.id ? (
                          <>
                            <button onClick={handleSave} disabled={isMutating} className="p-1.5 rounded text-success hover:bg-green-50 transition-colors cursor-pointer" aria-label="Lưu"><FloppyDisk size={16} /></button>
                            <button onClick={() => setEditId(null)} className="p-1.5 rounded text-muted-foreground hover:bg-neutral-100 transition-colors cursor-pointer" aria-label="Hủy"><X size={16} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(b)} className="p-1.5 rounded text-muted-foreground hover:text-warning hover:bg-amber-50 transition-colors cursor-pointer" aria-label="Sửa"><PencilSimple size={16} /></button>
                            <button onClick={() => handleDelete(b.id)} disabled={isMutating} className="p-1.5 rounded text-muted-foreground hover:text-error hover:bg-red-50 transition-colors cursor-pointer" aria-label="Xóa"><Trash size={16} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-2 rounded-md border border-border text-foreground text-body-sm hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">Trước</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-md text-body-sm transition-colors cursor-pointer ${page === p ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground hover:bg-neutral-100'}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-2 rounded-md border border-border text-foreground text-body-sm hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">Sau</button>
        </div>
      )}

      {showPicker && <HoSoPicker onSelect={handlePickerSelect} onClose={() => setShowPicker(false)} />}
    </main>
  );
}
