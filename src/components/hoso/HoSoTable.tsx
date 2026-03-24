import React, { useState, useMemo } from 'react';
import { MagnifyingGlass, FunnelSimple, ArrowUp, ArrowDown, Eye, PencilSimple, Trash, Download, UploadSimple } from '@phosphor-icons/react';
import { useQuery, useMutation } from '@animaapp/playground-react-sdk';
import { getTinhTrangBadgeClass, getTinhTrangLabel, getTinhTrangRowClass, formatDate } from '../../utils/statusUtils';
import { useApp } from '../../context/AppContext';
import DetailDrawer from './DetailDrawer';
import HoSoForm from './HoSoForm';
import FAB from '../layout/FAB';
import ImportModal from './ImportModal';

interface HoSoTableProps {
  type: 'tnhs' | 'nqt';
}

const PAGE_SIZE = 8;

export default function HoSoTable({ type }: HoSoTableProps) {
  const { addToast } = useApp();
  const entityName = type === 'tnhs' ? 'HoSoTNHS' : 'HoSoNQT';

  const { data: list = [], isPending } = useQuery(entityName as any);
  const { remove, isPending: isMutating } = useMutation(entityName as any);
  const { data: donViList = [] } = useQuery('DonVi');

  const [search, setSearch] = useState('');
  const [filterTinhTrang, setFilterTinhTrang] = useState('');
  const [filterDonVi, setFilterDonVi] = useState('');
  const [sortKey, setSortKey] = useState<string>('ngayHenTra');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const filtered = useMemo(() => {
    let result = [...list];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((h: any) =>
        (h.maHoSo || '').toLowerCase().includes(q) ||
        (h.maBhxh || '').toLowerCase().includes(q) ||
        (h.hoTen || '').toLowerCase().includes(q) ||
        (h.tenDonVi || '').toLowerCase().includes(q)
      );
    }
    if (filterTinhTrang) result = result.filter((h: any) => h.tinhTrang === filterTinhTrang);
    if (filterDonVi) result = result.filter((h: any) => h.maDonVi === filterDonVi);
    result.sort((a: any, b: any) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (av instanceof Date) av = av.getTime();
      if (bv instanceof Date) bv = bv.getTime();
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [list, search, filterTinhTrang, filterDonVi, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa hồ sơ này?')) return;
    try {
      await remove(id);
      addToast('Đã xóa hồ sơ', 'info');
    } catch {
      addToast('Lỗi khi xóa hồ sơ', 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Mã hồ sơ', 'Mã số BHXH', 'Họ và tên', 'Đơn vị', 'Thủ tục', 'Tiếp nhận', 'Hẹn trả', 'Chuyên quản', 'Ghi chú', 'Tình trạng', 'Đã trả'];
    const rows = filtered.map((h: any) => [
      h.maHoSo, h.maBhxh || '', h.hoTen || '', h.tenDonVi, h.tenThuTuc,
      formatDate(h.ngayTiepNhan), formatDate(h.ngayHenTra),
      h.chuyenQuan, h.ghiChu || '', getTinhTrangLabel(h.tinhTrang),
      h.daTraGiay ? 'Có' : 'Chưa'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hoso_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Xuất CSV thành công', 'success');
  };

  const SortIcon = ({ col }: { col: string }) => (
    sortKey === col
      ? (sortDir === 'asc' ? <ArrowUp size={14} weight="regular" className="text-primary" /> : <ArrowDown size={14} weight="regular" className="text-primary" />)
      : <ArrowUp size={14} weight="regular" className="text-neutral-300" />
  );

  if (isPending) return <div className="p-6 text-center text-muted-foreground">Đang tải hồ sơ...</div>;

  return (
    <main className="p-6 max-w-app mx-auto" aria-label={`Quản lý hồ sơ ${type.toUpperCase()}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-semibold text-h2 text-foreground">Quản lý hồ sơ {type.toUpperCase()}</h1>
          <p className="text-body-sm text-muted-foreground mt-1">{filtered.length} hồ sơ · Trang {page}/{totalPages || 1}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl text-body-sm hover:bg-neutral-100 transition-colors cursor-pointer">
            <UploadSimple size={16} weight="regular" /> Import CSV
          </button>
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl text-body-sm hover:bg-neutral-100 transition-colors cursor-pointer">
            <Download size={16} weight="regular" /> Xuất CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlass size={16} weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm mã hồ sơ, mã BHXH, đơn vị..."
            className="w-full h-11 pl-9 pr-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            aria-label="Tìm kiếm hồ sơ" />
        </div>
        <div className="flex items-center gap-2">
          <FunnelSimple size={16} weight="regular" className="text-muted-foreground" />
          <select value={filterTinhTrang} onChange={e => { setFilterTinhTrang(e.target.value); setPage(1); }}
            className="h-11 px-3 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            aria-label="Lọc theo tình trạng">
            <option value="">Tất cả tình trạng</option>
            <option value="truoc_han">Trước hạn</option>
            <option value="can_han">Cận hạn</option>
            <option value="dung_han">Đúng hạn</option>
            <option value="tre_han">Trễ hạn</option>
            <option value="qua_han">Quá hạn</option>
            <option value="da_tra">Đã trả</option>
          </select>
          <select value={filterDonVi} onChange={e => { setFilterDonVi(e.target.value); setPage(1); }}
            className="h-11 px-3 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            aria-label="Lọc theo đơn vị">
            <option value="">Tất cả đơn vị</option>
            {donViList.map((d: any) => (
              <option key={d.id} value={d.maDonVi}>{d.tenDonVi}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-card border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label={`Bảng hồ sơ ${type.toUpperCase()}`}>
            <thead>
              <tr className="bg-neutral-50 border-b border-border">
                {[
                  { label: 'Mã hồ sơ', key: 'maHoSo' },
                  { label: 'Mã số BHXH', key: null },
                  { label: 'Họ và tên', key: null },
                  { label: 'Đơn vị', key: 'tenDonVi' },
                  { label: 'Thủ tục', key: null },
                  { label: 'Tiếp nhận', key: 'ngayTiepNhan' },
                  { label: 'Hẹn trả', key: 'ngayHenTra' },
                  { label: 'Chuyên quản', key: null },
                  { label: 'Ghi chú', key: null },
                  { label: 'Tình trạng', key: null },
                  { label: 'Trả giấy', key: null },
                  { label: '', key: null },
                ].map((col, i) => (
                  <th key={i}
                    className={`px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide ${col.key ? 'cursor-pointer hover:text-foreground transition-colors' : ''}`}
                    onClick={col.key ? () => handleSort(col.key!) : undefined}
                    scope="col">
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.key && <SortIcon col={col.key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-muted-foreground text-body-sm">Không có hồ sơ nào</td>
                </tr>
              ) : paginated.map((h: any) => (
                <tr key={h.id} className={`hover:bg-neutral-50 transition-colors duration-200 ${getTinhTrangRowClass(h.tinhTrang)}`}>
                  <td className="px-4 py-3"><span className="text-body-sm font-medium text-primary font-mono">{h.maHoSo}</span></td>
                  <td className="px-4 py-3 text-body-sm text-foreground font-mono">{h.maBhxh || '—'}</td>
                  <td className="px-4 py-3 text-body-sm text-foreground">{h.hoTen || '—'}</td>
                  <td className="px-4 py-3 text-body-sm text-foreground">{h.tenDonVi}</td>
                  <td className="px-4 py-3 text-body-sm text-foreground max-w-32 truncate">{h.tenThuTuc}</td>
                  <td className="px-4 py-3 text-body-sm text-foreground">{formatDate(h.ngayTiepNhan)}</td>
                  <td className="px-4 py-3 text-body-sm text-foreground">{formatDate(h.ngayHenTra)}</td>
                  <td className="px-4 py-3 text-body-sm text-foreground">{h.chuyenQuan || '—'}</td>
                  <td className="px-4 py-3 text-body-sm text-muted-foreground max-w-32 truncate">{h.ghiChu || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-caption font-medium ${getTinhTrangBadgeClass(h.tinhTrang)}`}>
                      {getTinhTrangLabel(h.tinhTrang)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-caption font-medium ${h.daTraGiay ? 'text-success' : 'text-muted-foreground'}`}>
                      {h.daTraGiay ? 'Đã trả' : 'Chưa'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedRecord(h)} className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-blue-50 transition-colors cursor-pointer" aria-label="Xem chi tiết">
                        <Eye size={16} weight="regular" />
                      </button>
                      <button onClick={() => { setEditRecord(h); setShowForm(true); }} className="p-1.5 rounded text-muted-foreground hover:text-warning hover:bg-amber-50 transition-colors cursor-pointer" aria-label="Chỉnh sửa">
                        <PencilSimple size={16} weight="regular" />
                      </button>
                      <button onClick={() => handleDelete(h.id)} disabled={isMutating} className="p-1.5 rounded text-muted-foreground hover:text-error hover:bg-red-50 transition-colors cursor-pointer" aria-label="Xóa">
                        <Trash size={16} weight="regular" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-body-sm">Không có hồ sơ nào</div>
        ) : paginated.map((h: any) => (
          <div key={h.id} className={`bg-card border border-border rounded-md p-4 ${getTinhTrangRowClass(h.tinhTrang)}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-body-sm font-medium text-primary font-mono">{h.maHoSo}</p>
                {h.hoTen && <p className="text-body-sm font-medium text-foreground">{h.hoTen}</p>}
                <p className="text-caption text-muted-foreground">{h.tenDonVi}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-caption font-medium ${getTinhTrangBadgeClass(h.tinhTrang)}`}>
                {getTinhTrangLabel(h.tinhTrang)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-caption mb-3">
              <div><span className="text-muted-foreground">Tiếp nhận: </span><span className="text-foreground">{formatDate(h.ngayTiepNhan)}</span></div>
              <div><span className="text-muted-foreground">Hẹn trả: </span><span className="text-foreground">{formatDate(h.ngayHenTra)}</span></div>
              <div>
                <span className="text-muted-foreground">Còn lại: </span>
                <span className={`font-medium ${h.soNgayConLai <= 0 ? 'text-error' : h.soNgayConLai <= 3 ? 'text-warning' : 'text-foreground'}`}>
                  {h.soNgayConLai <= 0 ? `Trễ ${Math.abs(h.soNgayConLai)} ngày` : `${h.soNgayConLai} ngày`}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Trả giấy: </span>
                <span className={h.daTraGiay ? 'text-success font-medium' : 'text-muted-foreground'}>{h.daTraGiay ? 'Đã trả' : 'Chưa'}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedRecord(h)} className="flex-1 flex items-center justify-center gap-1 py-2 border border-border text-foreground rounded-md text-caption hover:bg-neutral-100 transition-colors cursor-pointer">
                <Eye size={14} weight="regular" /> Xem
              </button>
              <button onClick={() => { setEditRecord(h); setShowForm(true); }} className="flex-1 flex items-center justify-center gap-1 py-2 border border-border text-foreground rounded-md text-caption hover:bg-neutral-100 transition-colors cursor-pointer">
                <PencilSimple size={14} weight="regular" /> Sửa
              </button>
              <button onClick={() => handleDelete(h.id)} disabled={isMutating} className="flex-1 flex items-center justify-center gap-1 py-2 border border-error text-error rounded-md text-caption hover:bg-red-50 transition-colors cursor-pointer">
                <Trash size={14} weight="regular" /> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

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

      {selectedRecord && (
        <DetailDrawer record={selectedRecord} type={type} onClose={() => setSelectedRecord(null)}
          onEdit={() => { setEditRecord(selectedRecord); setShowForm(true); setSelectedRecord(null); }} />
      )}

      {showForm && (
        <HoSoForm type={type} onClose={() => { setShowForm(false); setEditRecord(null); }} editRecord={editRecord || undefined} />
      )}

      {showImport && (
        <ImportModal type={type} onClose={() => setShowImport(false)} />
      )}

      <FAB onClick={() => { setEditRecord(null); setShowForm(true); }} label={`Thêm hồ sơ ${type.toUpperCase()}`} />
    </main>
  );
}
