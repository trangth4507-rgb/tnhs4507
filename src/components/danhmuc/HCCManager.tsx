import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, MagnifyingGlass, Trash, FloppyDisk, X, PencilSimple, UploadSimple } from '@phosphor-icons/react';
import { useQuery, useMutation } from '@animaapp/playground-react-sdk';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/statusUtils';
import HCCImportModal from './HCCImportModal';

const PAGE_SIZE = 10;

// ─── DonVi Autocomplete Input ────────────────────────────────────────────────
interface DonViAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  donViList: any[];
  placeholder?: string;
  compact?: boolean;
}

function DonViAutocomplete({ value, onChange, donViList, placeholder, compact }: DonViAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setInputVal(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const suggestions = useMemo(() => {
    if (!inputVal.trim()) return donViList.slice(0, 20);
    const q = inputVal.toLowerCase();
    return donViList.filter((d: any) => (d.maDonVi || '').toLowerCase().includes(q) || (d.tenDonVi || '').toLowerCase().includes(q)).slice(0, 20);
  }, [inputVal, donViList]);

  const baseCls = compact
    ? 'w-full h-9 px-3 rounded border border-primary text-foreground bg-card text-body-sm focus:outline-none'
    : 'w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={inputVal}
        placeholder={placeholder}
        className={baseCls}
        onFocus={() => setOpen(true)}
        onChange={e => {
          setInputVal(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((d: any) => (
            <li
              key={d.maDonVi}
              className="px-3 py-2 text-body-sm hover:bg-primary/10 cursor-pointer flex gap-2 items-center"
              onMouseDown={() => {
                onChange(d.maDonVi);
                setInputVal(d.maDonVi);
                setOpen(false);
              }}
            >
              <span className="font-mono font-medium text-primary w-20 shrink-0">{d.maDonVi}</span>
              <span className="text-foreground truncate">{d.tenDonVi}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HCCManager() {
  const { addToast, currentUser } = useApp();
  const isAdmin = currentUser.vai_tro === 'admin';

  const { data: hccList = [], isPending } = useQuery('HCC', { orderBy: { ngayGui: 'desc' } });
  const { data: donViList = [] } = useQuery('DonVi', { orderBy: { maDonVi: 'asc' } });
  const { create, update, remove, isPending: isMutating } = useMutation('HCC');

  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [newData, setNewData] = useState({
    maHs: '',
    maDonViNhan: '',
    tenDonViNhan: '',
    chiTiet: '',
    nguoiNhan: '',
    ngayGui: '',
  });

  const donViMap = useMemo(() => {
    const m: Record<string, string> = {};
    (donViList as any[]).forEach((d: any) => { m[d.maDonVi] = d.tenDonVi; });
    return m;
  }, [donViList]);

  const handleNewMaDonViChange = (val: string) => {
    const tenDonVi = donViMap[val] || '';
    setNewData(p => ({ ...p, maDonViNhan: val, tenDonViNhan: tenDonVi }));
  };

  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    hccList.forEach((h: any) => {
      const d = h.ngayGui instanceof Date ? h.ngayGui : new Date(h.ngayGui);
      if (!isNaN(d.getTime())) {
        months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
    });
    return Array.from(months).sort().reverse();
  }, [hccList]);

  const filtered = useMemo(() => {
    let result = [...hccList];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((h: any) =>
        (h.maHs || '').toLowerCase().includes(q) ||
        (h.tenDonViNhan || '').toLowerCase().includes(q) ||
        (h.maDonViNhan || '').toLowerCase().includes(q) ||
        (h.nguoiNhan || '').toLowerCase().includes(q) ||
        (h.chiTiet || '').toLowerCase().includes(q)
      );
    }
    if (filterMonth) {
      result = result.filter((h: any) => {
        const d = h.ngayGui instanceof Date ? h.ngayGui : new Date(h.ngayGui);
        if (isNaN(d.getTime())) return false;
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return ym === filterMonth;
      });
    }
    return result;
  }, [hccList, search, filterMonth]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAdd = async () => {
    if (!newData.ngayGui) {
      addToast('Vui lòng điền Ngày gửi', 'error');
      return;
    }
    try {
      await create({
        maHs: newData.maHs,
        maDonViNhan: newData.maDonViNhan,
        tenDonViNhan: newData.tenDonViNhan,
        chiTiet: newData.chiTiet,
        nguoiNhan: newData.nguoiNhan,
        ngayGui: new Date(newData.ngayGui),
      });
      setNewData({ maHs: '', maDonViNhan: '', tenDonViNhan: '', chiTiet: '', nguoiNhan: '', ngayGui: '' });
      setShowAdd(false);
      addToast('Thêm bản ghi HCC thành công', 'success');
    } catch {
      addToast('Lỗi khi thêm bản ghi', 'error');
    }
  };

  const handleEdit = (h: any) => {
    setEditId(h.id);
    const d = h.ngayGui instanceof Date ? h.ngayGui : new Date(h.ngayGui);
    setEditData({
      maHs: h.maHs,
      maDonViNhan: h.maDonViNhan,
      tenDonViNhan: h.tenDonViNhan,
      chiTiet: h.chiTiet,
      nguoiNhan: h.nguoiNhan,
      ngayGui: isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10),
    });
  };

  const handleSave = async () => {
    if (!editId) return;
    try {
      await update(editId, { ...editData, ngayGui: new Date(editData.ngayGui) });
      addToast('Cập nhật thành công', 'success');
      setEditId(null);
    } catch {
      addToast('Lỗi khi cập nhật', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa bản ghi này?')) return;
    try {
      await remove(id);
      addToast('Đã xóa bản ghi', 'info');
    } catch {
      addToast('Lỗi khi xóa', 'error');
    }
  };

  const inputCls = 'w-full h-9 px-3 rounded border border-primary text-foreground bg-card text-body-sm focus:outline-none';

  if (isPending) return <div className="p-6 text-center text-muted-foreground">Đang tải...</div>;

  return (
    <main className="p-6 max-w-app mx-auto" aria-label="Quản lý HCC">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-semibold text-h2 text-foreground">Hành chính công (HCC)</h1>
          <p className="text-body-sm text-muted-foreground mt-1">{filtered.length} bản ghi</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl text-body-sm font-medium hover:bg-neutral-100 transition-colors cursor-pointer">
              <UploadSimple size={16} weight="regular" /> Import CSV
            </button>
            <button onClick={() => setShowAdd(true)} disabled={isMutating}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-body-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-40">
              <Plus size={16} weight="regular" /> Thêm mới
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlass size={16} weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm mã HS, đơn vị, người nhận..."
            className="w-full h-11 pl-9 pr-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
        <select
          value={filterMonth}
          onChange={e => { setFilterMonth(e.target.value); setPage(1); }}
          className="h-11 px-3 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          aria-label="Lọc theo tháng"
        >
          <option value="">Tất cả tháng</option>
          {monthOptions.map(m => {
            const [y, mo] = m.split('-');
            return <option key={m} value={m}>Tháng {mo}/{y}</option>;
          })}
        </select>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-md p-6 mb-6">
          <h2 className="font-heading font-semibold text-h4 text-foreground mb-4">Thêm bản ghi HCC mới</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Mã HS <span className="text-muted-foreground font-normal">(để trống nếu chưa có)</span></label>
              <input type="text" value={newData.maHs} onChange={e => setNewData(p => ({ ...p, maHs: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" placeholder="HCC2024-001" />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Mã đơn vị nhận</label>
              <DonViAutocomplete
                value={newData.maDonViNhan}
                onChange={handleNewMaDonViChange}
                donViList={donViList as any[]}
                placeholder="DV001"
              />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Tên đơn vị nhận</label>
              <input type="text" value={newData.tenDonViNhan} onChange={e => setNewData(p => ({ ...p, tenDonViNhan: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" placeholder="Tự động điền khi chọn mã đơn vị..." />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-body-sm font-medium text-foreground mb-1">Chi tiết</label>
              <input type="text" value={newData.chiTiet} onChange={e => setNewData(p => ({ ...p, chiTiet: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" placeholder="Nội dung chi tiết..." />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Người nhận</label>
              <input type="text" value={newData.nguoiNhan} onChange={e => setNewData(p => ({ ...p, nguoiNhan: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" placeholder="Họ tên người nhận..." />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Ngày gửi *</label>
              <input type="date" value={newData.ngayGui} onChange={e => setNewData(p => ({ ...p, ngayGui: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} disabled={isMutating} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-body-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-40">
              <FloppyDisk size={16} weight="regular" /> Lưu
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 border border-border text-foreground rounded-xl text-body-sm hover:bg-neutral-100 transition-colors cursor-pointer">Hủy</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Bảng HCC">
            <thead>
              <tr className="bg-neutral-50 border-b border-border">
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Mã HS</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Mã đơn vị nhận</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Tên đơn vị nhận</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Chi tiết</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Người nhận</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Ngày gửi</th>
                {isAdmin && <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-body-sm">Không có bản ghi nào</td>
                </tr>
              ) : paginated.map((h: any) => (
                <tr key={h.id} className="hover:bg-neutral-50 transition-colors duration-200">
                  <td className="px-4 py-3">
                    {editId === h.id ? (
                      <input type="text" value={editData.maHs} onChange={e => setEditData((p: any) => ({ ...p, maHs: e.target.value }))} className={inputCls} />
                    ) : (
                      <span className="text-body-sm font-mono font-medium text-primary">{h.maHs}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editId === h.id ? (
                      <DonViAutocomplete
                        value={editData.maDonViNhan}
                        onChange={val => {
                          const ten = (donViList as any[]).find((d: any) => d.maDonVi === val)?.tenDonVi || '';
                          setEditData((p: any) => ({ ...p, maDonViNhan: val, tenDonViNhan: ten || p.tenDonViNhan }));
                        }}
                        donViList={donViList as any[]}
                        placeholder="DV001"
                        compact
                      />
                    ) : (
                      <span className="text-body-sm font-mono text-foreground">{h.maDonViNhan || '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editId === h.id ? (
                      <input type="text" value={editData.tenDonViNhan} onChange={e => setEditData((p: any) => ({ ...p, tenDonViNhan: e.target.value }))} className={inputCls} />
                    ) : (
                      <span className="text-body-sm text-foreground">{h.tenDonViNhan || '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-40">
                    {editId === h.id ? (
                      <input type="text" value={editData.chiTiet} onChange={e => setEditData((p: any) => ({ ...p, chiTiet: e.target.value }))} className={inputCls} />
                    ) : (
                      <span className="text-body-sm text-muted-foreground truncate block">{h.chiTiet || '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editId === h.id ? (
                      <input type="text" value={editData.nguoiNhan} onChange={e => setEditData((p: any) => ({ ...p, nguoiNhan: e.target.value }))} className={inputCls} />
                    ) : (
                      <span className="text-body-sm text-foreground">{h.nguoiNhan || '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editId === h.id ? (
                      <input type="date" value={editData.ngayGui} onChange={e => setEditData((p: any) => ({ ...p, ngayGui: e.target.value }))} className={inputCls} />
                    ) : (
                      <span className="text-body-sm text-foreground">{formatDate(h.ngayGui)}</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {editId === h.id ? (
                          <>
                            <button onClick={handleSave} disabled={isMutating} className="p-1.5 rounded text-success hover:bg-green-50 transition-colors cursor-pointer" aria-label="Lưu"><FloppyDisk size={16} weight="regular" /></button>
                            <button onClick={() => setEditId(null)} className="p-1.5 rounded text-muted-foreground hover:bg-neutral-100 transition-colors cursor-pointer" aria-label="Hủy"><X size={16} weight="regular" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(h)} className="p-1.5 rounded text-muted-foreground hover:text-warning hover:bg-amber-50 transition-colors cursor-pointer" aria-label="Sửa"><PencilSimple size={16} weight="regular" /></button>
                            <button onClick={() => handleDelete(h.id)} disabled={isMutating} className="p-1.5 rounded text-muted-foreground hover:text-error hover:bg-red-50 transition-colors cursor-pointer" aria-label="Xóa"><Trash size={16} weight="regular" /></button>
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

      {showImport && <HCCImportModal onClose={() => setShowImport(false)} />}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-2 rounded-md border border-border text-foreground text-body-sm hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-md text-body-sm transition-colors cursor-pointer ${page === p ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground hover:bg-neutral-100'}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-2 rounded-md border border-border text-foreground text-body-sm hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            Sau
          </button>
        </div>
      )}
    </main>
  );
}
