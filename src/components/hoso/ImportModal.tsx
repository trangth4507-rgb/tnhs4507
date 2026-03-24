import React, { useState, useRef, useCallback } from 'react';
import { X, UploadSimple, FileCsv, FileXls, CheckCircle, Warning, Trash, SpinnerGap, DownloadSimple, Eye } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@animaapp/playground-react-sdk';
import { useApp } from '../../context/AppContext';
import { tinhNgayHenTra, tinhTinhTrang } from '../../data/mockData';
import { differenceInDays, format, parse, isValid } from 'date-fns';

interface ImportModalProps {
  type: 'tnhs' | 'nqt';
  onClose: () => void;
}

type RowStatus = 'ok' | 'error' | 'duplicate';

interface ParsedRow {
  index: number;
  status: RowStatus;
  errors: string[];
  data: {
    maHoSo: string;
    maBhxh: string;
    hoTen: string;
    tenDonVi: string;
    maDonVi: string;
    tenThuTuc: string;
    maThuTuc: string;
    ngayTiepNhan: string;
    ngayHenTra: string;
    chuyenQuan: string;
    ghiChu: string;
  };
}

// Parse nhiều định dạng ngày VN và quốc tế
function parseFlexDate(raw: string): Date | null {
  if (!raw) return null;
  const s = raw.trim();
  const formats = ['dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy', 'd/M/yyyy', 'yyyy/MM/dd'];
  for (const fmt of formats) {
    try {
      const d = parse(s, fmt, new Date());
      if (isValid(d) && d.getFullYear() > 1990) return d;
    } catch { /* continue */ }
  }
  // fallback
  const d = new Date(s);
  if (isValid(d) && d.getFullYear() > 1990) return d;
  return null;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    rows.push(cells);
  }
  return rows;
}

// Template headers (order matters)
const TEMPLATE_HEADERS = ['Mã hồ sơ', 'Mã BHXH', 'Họ và tên', 'Tên đơn vị', 'Thủ tục (mã)', 'Ngày tiếp nhận (dd/MM/yyyy)', 'Chuyên quản', 'Ghi chú'];

function downloadTemplate(type: string) {
  const prefix = type === 'tnhs' ? 'TNHS' : 'NQT';
  const year = new Date().getFullYear();
  const sampleRows = [
    [`${prefix}${year}-0001`, '1234567890', 'Nguyễn Văn A', 'Chi nhánh Quận 1', 'TT001', '01/03/2025', 'CQ-Q1', 'Hồ sơ ưu tiên'],
    [`${prefix}${year}-0002`, '0987654321', 'Trần Thị B', 'Chi nhánh Quận 2', 'TT002', '05/03/2025', 'CQ-Q2', ''],
  ];
  const bom = '\uFEFF';
  const csv = bom + [TEMPLATE_HEADERS, ...sampleRows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `template_import_${type}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ImportModal({ type, onClose }: ImportModalProps) {
  const { addToast } = useApp();
  const entityName = type === 'tnhs' ? 'HoSoTNHS' : 'HoSoNQT';

  const { data: thuTucList = [] } = useQuery('ThuTuc');
  const { data: donViList = [] } = useQuery('DonVi');
  const { data: ngayLeList = [] } = useQuery('NgayLe');
  const { data: existingRecords = [] } = useQuery(entityName as any);
  const { create, isPending: isMutating } = useMutation(entityName as any);

  const [dragging, setDragging] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');
  const [importedCount, setImportedCount] = useState(0);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [previewOnly, setPreviewOnly] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const holidays = (ngayLeList as any[]).map((n: any) => {
    const d = n.ngay instanceof Date ? n.ngay : new Date(n.ngay);
    return d.toISOString().slice(0, 10);
  });

  const existingMaHoSo = new Set((existingRecords as any[]).map((r: any) => r.maHoSo?.toLowerCase()));

  const parseRows = useCallback((rawRows: string[][]): ParsedRow[] => {
    if (rawRows.length < 2) return [];
    // Detect header row
    const headerRow = rawRows[0].map(h => h.toLowerCase().trim());
    const isFirstRowHeader = headerRow.some(h => h.includes('mã') || h.includes('họ') || h.includes('ngày') || h.includes('thủ tục'));
    const dataRows = isFirstRowHeader ? rawRows.slice(1) : rawRows;

    return dataRows.map((cells, idx) => {
      const get = (i: number) => (cells[i] || '').trim();
      const errs: string[] = [];

      const maHoSo = get(0);
      const maBhxh = get(1);
      const hoTen = get(2);
      const tenDonVi = get(3);
      const maThuTucRaw = get(4);
      const ngayTiepNhanRaw = get(5);
      const chuyenQuan = get(6);
      const ghiChu = get(7);

      if (!maHoSo) errs.push('Thiếu mã hồ sơ');
      if (!ngayTiepNhanRaw) errs.push('Thiếu ngày tiếp nhận');

      // Find thủ tục
      const thuTuc = (thuTucList as any[]).find((t: any) =>
        t.maThuTuc?.toLowerCase() === maThuTucRaw?.toLowerCase() ||
        t.tenThuTuc?.toLowerCase().includes(maThuTucRaw?.toLowerCase())
      );
      if (maThuTucRaw && !thuTuc) errs.push(`Không tìm thấy thủ tục: "${maThuTucRaw}"`);

      // Parse date
      const ngayTiepNhanDate = parseFlexDate(ngayTiepNhanRaw);
      if (ngayTiepNhanRaw && !ngayTiepNhanDate) errs.push(`Ngày không hợp lệ: "${ngayTiepNhanRaw}"`);

      // Calculate ngayHenTra
      let ngayHenTra = '';
      if (ngayTiepNhanDate && thuTuc) {
        const henTra = tinhNgayHenTra(ngayTiepNhanDate, thuTuc.soNgayQuyDinh, holidays);
        ngayHenTra = format(henTra, 'yyyy-MM-dd');
      }

      // Find maDonVi
      const donVi = (donViList as any[]).find((d: any) =>
        d.tenDonVi?.toLowerCase() === tenDonVi?.toLowerCase() ||
        d.maDonVi?.toLowerCase() === tenDonVi?.toLowerCase()
      );
      const maDonVi = donVi?.maDonVi || '';
      const resolvedChuyenQuan = chuyenQuan || donVi?.chuyenQuan || '';

      // Check duplicate
      const isDuplicate = maHoSo && existingMaHoSo.has(maHoSo.toLowerCase());
      const status: RowStatus = isDuplicate ? 'duplicate' : errs.length > 0 ? 'error' : 'ok';
      if (isDuplicate) errs.push('Mã hồ sơ đã tồn tại trong hệ thống');

      return {
        index: idx + 1,
        status,
        errors: errs,
        data: {
          maHoSo,
          maBhxh,
          hoTen,
          tenDonVi: donVi?.tenDonVi || tenDonVi,
          maDonVi,
          tenThuTuc: thuTuc?.tenThuTuc || maThuTucRaw,
          maThuTuc: thuTuc?.maThuTuc || maThuTucRaw,
          ngayTiepNhan: ngayTiepNhanDate ? format(ngayTiepNhanDate, 'yyyy-MM-dd') : '',
          ngayHenTra,
          chuyenQuan: resolvedChuyenQuan,
          ghiChu,
        }
      };
    }).filter(r => r.data.maHoSo || r.data.hoTen);
  }, [thuTucList, donViList, ngayLeList, existingMaHoSo, holidays]);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    const text = await file.text();
    let rawRows: string[][] = [];

    if (file.name.endsWith('.csv') || file.type === 'text/csv') {
      rawRows = parseCSV(text);
    } else {
      // Try to handle as UTF-8 CSV even if extension is different
      rawRows = parseCSV(text);
    }

    if (rawRows.length < 2) {
      addToast('File không có dữ liệu hoặc sai định dạng', 'error');
      return;
    }

    const parsed = parseRows(rawRows);
    setRows(parsed);
    setStep('preview');
  }, [parseRows, addToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const okRows = rows.filter(r => r.status === 'ok');
  const errorRows = rows.filter(r => r.status === 'error');
  const dupRows = rows.filter(r => r.status === 'duplicate');

  const handleImport = async () => {
    const toImport = previewOnly ? okRows : [...okRows, ...dupRows.filter(r => r.status === 'duplicate')];
    const validRows = okRows;
    if (validRows.length === 0) {
      addToast('Không có dòng hợp lệ để import', 'warning');
      return;
    }

    const errs: string[] = [];
    let count = 0;

    for (const row of validRows) {
      try {
        const today = new Date();
        const ngayHenTra = row.data.ngayHenTra ? new Date(row.data.ngayHenTra) : today;
        const soNgayConLai = differenceInDays(ngayHenTra, today);
        const tinhTrang = tinhTinhTrang(soNgayConLai, false);

        await create({
          maHoSo: row.data.maHoSo,
          maBhxh: row.data.maBhxh,
          hoTen: row.data.hoTen,
          maDonVi: row.data.maDonVi,
          tenDonVi: row.data.tenDonVi,
          maThuTuc: row.data.maThuTuc,
          tenThuTuc: row.data.tenThuTuc,
          ngayTiepNhan: row.data.ngayTiepNhan ? new Date(row.data.ngayTiepNhan) : today,
          ngayHenTra,
          soNgayConLai,
          chuyenQuan: row.data.chuyenQuan,
          tinhTrang,
          daTraGiay: false,
          ghiChu: row.data.ghiChu,
        });
        count++;
      } catch (e: any) {
        errs.push(`Dòng ${row.index} (${row.data.maHoSo}): ${e?.message || 'Lỗi không xác định'}`);
      }
    }

    setImportedCount(count);
    setImportErrors(errs);
    setStep('done');
    if (count > 0) addToast(`Đã import ${count} hồ sơ thành công`, 'success');
  };

  const formatDateDisplay = (s: string) => {
    if (!s) return '—';
    try { return format(new Date(s), 'dd/MM/yyyy'); } catch { return s; }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'hsla(0,0%,0%,0.55)' }}
      role="dialog" aria-modal="true" aria-labelledby="import-title">
      <div className="w-full max-w-5xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-neutral-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <UploadSimple size={18} weight="fill" className="text-primary" />
            </div>
            <div>
              <h2 id="import-title" className="font-heading font-semibold text-h4 text-foreground">
                Import hồ sơ {type.toUpperCase()} từ file
              </h2>
              <p className="text-caption text-muted-foreground">Hỗ trợ định dạng CSV · Excel (.xlsx) sẽ sớm ra mắt</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-neutral-200 transition-colors cursor-pointer" aria-label="Đóng">
            <X size={20} weight="regular" />
          </button>
        </div>

        {/* Step: UPLOAD */}
        {step === 'upload' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Template download */}
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div>
                <p className="text-body-sm font-semibold text-blue-800">Tải file mẫu</p>
                <p className="text-caption text-blue-600 mt-0.5">Sử dụng đúng định dạng để import thành công</p>
              </div>
              <button onClick={() => downloadTemplate(type)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-body-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                <DownloadSimple size={15} weight="bold" />
                Tải mẫu CSV
              </button>
            </div>

            {/* Drag & Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${dragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border bg-neutral-50 hover:border-primary/50 hover:bg-neutral-100'}`}>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileCsv size={32} weight="fill" className="text-primary" />
              </div>
              <div className="text-center">
                <p className="font-heading font-semibold text-foreground text-base">Kéo thả file vào đây</p>
                <p className="text-body-sm text-muted-foreground mt-1">hoặc <span className="text-primary font-semibold">nhấn để chọn file</span></p>
                <p className="text-caption text-muted-foreground mt-2">Định dạng: CSV, UTF-8 · Tối đa 5.000 dòng</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Column guide */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-neutral-50 border-b border-border">
                <p className="text-body-sm font-semibold text-foreground">Cấu trúc cột (theo thứ tự)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-2 text-left text-caption text-muted-foreground font-medium">Cột</th>
                      <th className="px-4 py-2 text-left text-caption text-muted-foreground font-medium">Tên cột</th>
                      <th className="px-4 py-2 text-left text-caption text-muted-foreground font-medium">Bắt buộc</th>
                      <th className="px-4 py-2 text-left text-caption text-muted-foreground font-medium">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-body-sm">
                    {[
                      ['A', 'Mã hồ sơ', true, 'VD: TNHS2025-0001'],
                      ['B', 'Mã BHXH', false, 'Mã số BHXH 10 số'],
                      ['C', 'Họ và tên', false, 'Tên người nộp'],
                      ['D', 'Tên đơn vị', false, 'Khớp tên đơn vị trong danh mục'],
                      ['E', 'Mã thủ tục', false, 'VD: TT001 — khớp danh mục ThuTuc'],
                      ['F', 'Ngày tiếp nhận', true, 'Định dạng dd/MM/yyyy'],
                      ['G', 'Chuyên quản', false, 'Tự điền nếu chọn đúng đơn vị'],
                      ['H', 'Ghi chú', false, 'Tuỳ chọn'],
                    ].map(([col, name, req, note]) => (
                      <tr key={col as string}>
                        <td className="px-4 py-2.5 font-mono font-bold text-primary">{col}</td>
                        <td className="px-4 py-2.5 font-medium text-foreground">{name}</td>
                        <td className="px-4 py-2.5">
                          {req ? <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-caption font-medium">Bắt buộc</span>
                            : <span className="px-2 py-0.5 bg-neutral-100 text-muted-foreground rounded-full text-caption">Tuỳ chọn</span>}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Step: PREVIEW */}
        {step === 'preview' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Summary bar */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-border bg-neutral-50 flex-shrink-0 flex-wrap">
              <div className="flex items-center gap-2 text-body-sm">
                <FileCsv size={16} weight="fill" className="text-muted-foreground" />
                <span className="font-medium text-foreground truncate max-w-48">{fileName}</span>
              </div>
              <div className="flex items-center gap-3 ml-auto flex-wrap">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-caption font-semibold">
                  <CheckCircle size={13} weight="fill" /> {okRows.length} hợp lệ
                </span>
                {errorRows.length > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-800 text-caption font-semibold">
                    <Warning size={13} weight="fill" /> {errorRows.length} lỗi
                  </span>
                )}
                {dupRows.length > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-caption font-semibold">
                    <Warning size={13} weight="fill" /> {dupRows.length} trùng lặp
                  </span>
                )}
                <button onClick={() => setStep('upload')}
                  className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-caption text-muted-foreground hover:bg-neutral-200 transition-colors cursor-pointer">
                  <Trash size={12} /> Đổi file
                </button>
              </div>
            </div>

            {/* Table preview */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-body-sm min-w-[900px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-neutral-100 border-b border-border">
                    <th className="px-3 py-2.5 text-left text-caption font-medium text-muted-foreground w-10">#</th>
                    <th className="px-3 py-2.5 text-left text-caption font-medium text-muted-foreground">Trạng thái</th>
                    <th className="px-3 py-2.5 text-left text-caption font-medium text-muted-foreground">Mã hồ sơ</th>
                    <th className="px-3 py-2.5 text-left text-caption font-medium text-muted-foreground">Mã BHXH</th>
                    <th className="px-3 py-2.5 text-left text-caption font-medium text-muted-foreground">Họ và tên</th>
                    <th className="px-3 py-2.5 text-left text-caption font-medium text-muted-foreground">Đơn vị</th>
                    <th className="px-3 py-2.5 text-left text-caption font-medium text-muted-foreground">Thủ tục</th>
                    <th className="px-3 py-2.5 text-left text-caption font-medium text-muted-foreground">Tiếp nhận</th>
                    <th className="px-3 py-2.5 text-left text-caption font-medium text-muted-foreground">Hẹn trả</th>
                    <th className="px-3 py-2.5 text-left text-caption font-medium text-muted-foreground">Ghi chú / Lỗi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map(row => (
                    <tr key={row.index}
                      className={`transition-colors ${row.status === 'error' ? 'bg-red-50 hover:bg-red-100' : row.status === 'duplicate' ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-neutral-50'}`}>
                      <td className="px-3 py-2.5 text-caption text-muted-foreground font-mono">{row.index}</td>
                      <td className="px-3 py-2.5">
                        {row.status === 'ok' && <span className="flex items-center gap-1 text-caption text-green-700 font-semibold"><CheckCircle size={13} weight="fill" /> Hợp lệ</span>}
                        {row.status === 'error' && <span className="flex items-center gap-1 text-caption text-red-700 font-semibold"><Warning size={13} weight="fill" /> Lỗi</span>}
                        {row.status === 'duplicate' && <span className="flex items-center gap-1 text-caption text-amber-700 font-semibold"><Warning size={13} weight="fill" /> Trùng</span>}
                      </td>
                      <td className="px-3 py-2.5 font-mono font-medium text-primary">{row.data.maHoSo || '—'}</td>
                      <td className="px-3 py-2.5 font-mono text-foreground">{row.data.maBhxh || '—'}</td>
                      <td className="px-3 py-2.5 text-foreground">{row.data.hoTen || '—'}</td>
                      <td className="px-3 py-2.5 text-foreground max-w-32 truncate" title={row.data.tenDonVi}>{row.data.tenDonVi || '—'}</td>
                      <td className="px-3 py-2.5 text-foreground max-w-32 truncate" title={row.data.tenThuTuc}>{row.data.tenThuTuc || '—'}</td>
                      <td className="px-3 py-2.5 text-foreground">{formatDateDisplay(row.data.ngayTiepNhan)}</td>
                      <td className="px-3 py-2.5 text-foreground">{formatDateDisplay(row.data.ngayHenTra)}</td>
                      <td className="px-3 py-2.5 max-w-48">
                        {row.errors.length > 0
                          ? <span className="text-caption text-red-700">{row.errors.join('; ')}</span>
                          : <span className="text-caption text-muted-foreground truncate">{row.data.ghiChu || '—'}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-border bg-neutral-50 flex-shrink-0">
              <p className="text-body-sm text-muted-foreground">
                Sẽ import <b className="text-foreground">{okRows.length}</b> dòng hợp lệ. {errorRows.length > 0 && <span className="text-red-600">{errorRows.length} dòng lỗi bị bỏ qua.</span>} {dupRows.length > 0 && <span className="text-amber-600">{dupRows.length} dòng trùng bị bỏ qua.</span>}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep('upload')}
                  className="px-5 h-10 border border-border text-foreground rounded-xl text-body-sm hover:bg-neutral-200 transition-colors cursor-pointer">
                  Quay lại
                </button>
                <button onClick={handleImport} disabled={isMutating || okRows.length === 0}
                  className="flex items-center gap-2 px-6 h-10 bg-primary text-primary-foreground rounded-xl text-body-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  {isMutating ? <SpinnerGap size={15} className="animate-spin" /> : <UploadSimple size={15} weight="bold" />}
                  {isMutating ? 'Đang import...' : `Import ${okRows.length} hồ sơ`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: DONE */}
        {step === 'done' && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 gap-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${importedCount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {importedCount > 0
                ? <CheckCircle size={40} weight="fill" className="text-success" />
                : <Warning size={40} weight="fill" className="text-error" />
              }
            </div>
            <div className="text-center">
              <h3 className="font-heading font-bold text-xl text-foreground mb-1">
                {importedCount > 0 ? `Đã import ${importedCount} hồ sơ!` : 'Import thất bại'}
              </h3>
              <p className="text-body-sm text-muted-foreground">
                {importedCount > 0
                  ? `${importedCount} hồ sơ ${type.toUpperCase()} đã được thêm vào hệ thống thành công.`
                  : 'Không có hồ sơ nào được import. Vui lòng kiểm tra lại file.'}
              </p>
            </div>

            {importErrors.length > 0 && (
              <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-body-sm font-semibold text-red-800 mb-2">Lỗi trong quá trình import:</p>
                <ul className="space-y-1">
                  {importErrors.slice(0, 5).map((e, i) => (
                    <li key={i} className="text-caption text-red-700">{e}</li>
                  ))}
                  {importErrors.length > 5 && <li className="text-caption text-red-500">... và {importErrors.length - 5} lỗi khác</li>}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              {importedCount > 0 && (
                <button onClick={() => { setStep('upload'); setRows([]); setFileName(''); }}
                  className="px-5 h-10 border border-border text-foreground rounded-xl text-body-sm hover:bg-neutral-100 transition-colors cursor-pointer">
                  Import thêm
                </button>
              )}
              <button onClick={onClose}
                className="px-6 h-10 bg-primary text-primary-foreground rounded-xl text-body-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer">
                Đóng & Xem hồ sơ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
