import React, { useState, useRef } from 'react';
import { Plus, PencilSimple, Trash, FloppyDisk, X, UploadSimple, DownloadSimple, Warning, CheckCircle, Export } from '@phosphor-icons/react';
import { useQuery, useMutation } from '@animaapp/playground-react-sdk';
import { useApp } from '../../context/AppContext';

type ImportRow = { maDonVi: string; tenDonVi: string; chuyenQuan: string; _error?: string };

function parseCSV(text: string): ImportRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  // skip header row
  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
    const [maDonVi = '', tenDonVi = '', chuyenQuan = ''] = cols;
    let _error: string | undefined;
    if (!maDonVi) _error = 'Thiếu mã đơn vị';
    else if (!tenDonVi) _error = 'Thiếu tên đơn vị';
    return { maDonVi, tenDonVi, chuyenQuan, _error };
  }).filter(r => r.maDonVi || r.tenDonVi);
}

function exportDonViCSV(donViList: any[]) {
  const header = 'maDonVi,tenDonVi,chuyenQuan';
  const rows = donViList.map(d => {
    const escape = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;
    return [escape(d.maDonVi), escape(d.tenDonVi), escape(d.chuyenQuan)].join(',');
  });
  const csv = [header, ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `danh_sach_don_vi_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadTemplate() {
  const csv = 'maDonVi,tenDonVi,chuyenQuan\nDV001,Phòng Kế toán,Nguyễn Văn A\nDV002,Phòng Nhân sự,Trần Thị B\n';
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mau_danh_sach_don_vi.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function DonViManager() {
  const { addToast, currentUser } = useApp();
  const isAdmin = currentUser.vai_tro === 'admin';

  const { data: donViList = [], isPending } = useQuery('DonVi');
  const { create, update, remove, isPending: isMutating } = useMutation('DonVi');

  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ tenDonVi: string; chuyenQuan: string }>({ tenDonVi: '', chuyenQuan: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [newData, setNewData] = useState({ maDonVi: '', tenDonVi: '', chuyenQuan: '' });

  // Import state
  const [showImport, setShowImport] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'done'>('upload');
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleEdit = (d: any) => {
    setEditId(d.id);
    setEditData({ tenDonVi: d.tenDonVi, chuyenQuan: d.chuyenQuan });
  };

  const handleSave = async () => {
    if (!editId) return;
    try {
      await update(editId, editData);
      addToast('Cập nhật đơn vị thành công', 'success');
      setEditId(null);
    } catch {
      addToast('Lỗi khi cập nhật đơn vị', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa đơn vị này?')) return;
    try {
      await remove(id);
      addToast('Đã xóa đơn vị', 'info');
    } catch {
      addToast('Lỗi khi xóa đơn vị', 'error');
    }
  };

  const handleAdd = async () => {
    if (!newData.maDonVi || !newData.tenDonVi) {
      addToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }
    try {
      await create(newData);
      setNewData({ maDonVi: '', tenDonVi: '', chuyenQuan: '' });
      setShowAdd(false);
      addToast('Thêm đơn vị thành công', 'success');
    } catch {
      addToast('Lỗi khi thêm đơn vị', 'error');
    }
  };

  // ── Import handlers ──
  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      addToast('Chỉ hỗ trợ file CSV', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length === 0) {
        addToast('File không có dữ liệu hợp lệ', 'error');
        return;
      }
      setImportRows(rows);
      setImportStep('preview');
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleRemoveImportRow = (idx: number) => {
    setImportRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleEditImportRow = (idx: number, field: keyof ImportRow, val: string) => {
    setImportRows(prev => prev.map((r, i) => {
      if (i !== idx) return r;
      const updated = { ...r, [field]: val };
      if (!updated.maDonVi) updated._error = 'Thiếu mã đơn vị';
      else if (!updated.tenDonVi) updated._error = 'Thiếu tên đơn vị';
      else updated._error = undefined;
      return updated;
    }));
  };

  const validRows = importRows.filter(r => !r._error);
  const invalidRows = importRows.filter(r => r._error);

  const handleImportConfirm = async () => {
    if (validRows.length === 0) return;
    let success = 0;
    let failed = 0;
    for (let i = 0; i < validRows.length; i++) {
      try {
        await create({ maDonVi: validRows[i].maDonVi, tenDonVi: validRows[i].tenDonVi, chuyenQuan: validRows[i].chuyenQuan });
        success++;
      } catch {
        failed++;
      }
      setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
    }
    setImportResults({ success, failed });
    setImportStep('done');
    addToast(`Đã import ${success} đơn vị thành công${failed > 0 ? `, ${failed} lỗi` : ''}`, failed > 0 ? 'error' : 'success');
  };

  const resetImport = () => {
    setShowImport(false);
    setImportRows([]);
    setImportStep('upload');
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0 });
    if (fileRef.current) fileRef.current.value = '';
  };

  if (isPending) return <div className="p-6 text-center text-muted-foreground">Đang tải...</div>;

  return (
    <main className="p-6 max-w-app mx-auto" aria-label="Quản lý đơn vị">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-semibold text-h2 text-foreground">Danh mục Đơn vị</h1>
          <p className="text-body-sm text-muted-foreground mt-1">{donViList.length} đơn vị</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={() => exportDonViCSV(donViList)}
              className="flex items-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl text-body-sm font-medium hover:bg-neutral-100 transition-colors cursor-pointer">
              <Export size={16} weight="regular" /> Xuất CSV
            </button>
            <button onClick={() => { setShowImport(true); setImportStep('upload'); }}
              className="flex items-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl text-body-sm font-medium hover:bg-neutral-100 transition-colors cursor-pointer">
              <UploadSimple size={16} weight="regular" /> Import CSV
            </button>
            <button onClick={() => setShowAdd(true)} disabled={isMutating}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-body-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-40">
              <Plus size={16} weight="regular" /> Thêm đơn vị
            </button>
          </div>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-md p-6 mb-6">
          <h2 className="font-heading font-semibold text-h4 text-foreground mb-4">Thêm đơn vị mới</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Mã đơn vị *</label>
              <input type="text" value={newData.maDonVi} onChange={e => setNewData(p => ({ ...p, maDonVi: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" placeholder="DV006" />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Tên đơn vị *</label>
              <input type="text" value={newData.tenDonVi} onChange={e => setNewData(p => ({ ...p, tenDonVi: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" placeholder="Phòng..." />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Chuyên quản</label>
              <input type="text" value={newData.chuyenQuan} onChange={e => setNewData(p => ({ ...p, chuyenQuan: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" placeholder="Họ tên..." />
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

      {/* ── Import Panel ── */}
      {showImport && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
          {/* Panel header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <UploadSimple size={20} className="text-primary" />
              <h2 className="font-heading font-semibold text-h4 text-foreground">Import danh sách đơn vị</h2>
            </div>
            <button onClick={resetImport} className="p-1.5 rounded text-muted-foreground hover:bg-neutral-100 transition-colors cursor-pointer"><X size={18} /></button>
          </div>

          {/* Step: upload */}
          {importStep === 'upload' && (
            <div className="space-y-4">
              {/* Template download */}
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-body-sm text-blue-700">Tải file mẫu CSV để điền dữ liệu đúng định dạng</p>
                <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-lg text-body-sm font-medium hover:bg-blue-50 transition-colors cursor-pointer">
                  <DownloadSimple size={15} /> Tải mẫu
                </button>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDropFile}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 py-12 cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-neutral-50'}`}
              >
                <UploadSimple size={36} className={isDragging ? 'text-primary' : 'text-muted-foreground'} weight="light" />
                <div className="text-center">
                  <p className="text-body-sm font-medium text-foreground">Kéo thả file CSV vào đây</p>
                  <p className="text-body-sm text-muted-foreground mt-0.5">hoặc <span className="text-primary font-medium">chọn file</span> từ máy tính</p>
                </div>
                <p className="text-caption text-muted-foreground">Chỉ hỗ trợ file .csv • Tối đa 5MB</p>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFileChange(e.target.files?.[0])} />

              {/* Format guide */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-neutral-50 px-4 py-2 border-b border-border">
                  <p className="text-caption font-medium text-muted-foreground uppercase tracking-wide">Định dạng file CSV</p>
                </div>
                <div className="p-3 overflow-x-auto">
                  <table className="text-body-sm w-full">
                    <thead>
                      <tr className="text-left">
                        <th className="pr-6 py-1 text-foreground font-medium">maDonVi</th>
                        <th className="pr-6 py-1 text-foreground font-medium">tenDonVi</th>
                        <th className="pr-6 py-1 text-foreground font-medium">chuyenQuan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-muted-foreground">
                        <td className="pr-6 py-1">DV001</td>
                        <td className="pr-6 py-1">Phòng Kế toán</td>
                        <td className="pr-6 py-1">Nguyễn Văn A</td>
                      </tr>
                      <tr className="text-muted-foreground">
                        <td className="pr-6 py-1">DV002</td>
                        <td className="pr-6 py-1">Phòng Nhân sự</td>
                        <td className="pr-6 py-1">Trần Thị B</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Step: preview */}
          {importStep === 'preview' && (
            <div className="space-y-4">
              {/* Summary bar */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-body-sm text-foreground font-medium">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-caption font-bold flex items-center justify-center">{importRows.length}</span> tổng hàng
                </span>
                <span className="flex items-center gap-1.5 text-body-sm text-success font-medium">
                  <CheckCircle size={16} weight="fill" /> {validRows.length} hợp lệ
                </span>
                {invalidRows.length > 0 && (
                  <span className="flex items-center gap-1.5 text-body-sm text-error font-medium">
                    <Warning size={16} weight="fill" /> {invalidRows.length} lỗi (sẽ bỏ qua)
                  </span>
                )}
                <button onClick={() => { setImportStep('upload'); setImportRows([]); if (fileRef.current) fileRef.current.value = ''; }}
                  className="ml-auto text-body-sm text-primary hover:underline cursor-pointer">← Chọn file khác</button>
              </div>

              {/* Editable preview table */}
              <div className="border border-border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-body-sm">
                  <thead className="sticky top-0 bg-neutral-50 border-b border-border z-10">
                    <tr>
                      <th className="px-3 py-2 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide w-8">#</th>
                      <th className="px-3 py-2 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Mã ĐV</th>
                      <th className="px-3 py-2 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Tên đơn vị</th>
                      <th className="px-3 py-2 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Chuyên quản</th>
                      <th className="px-3 py-2 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide">Trạng thái</th>
                      <th className="px-3 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {importRows.map((row, idx) => (
                      <tr key={idx} className={row._error ? 'bg-red-50' : 'hover:bg-neutral-50'}>
                        <td className="px-3 py-2 text-muted-foreground text-caption">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <input value={row.maDonVi} onChange={e => handleEditImportRow(idx, 'maDonVi', e.target.value)}
                            className={`w-full h-8 px-2 rounded border text-body-sm focus:outline-none focus:ring-1 focus:ring-primary bg-transparent ${row._error && !row.maDonVi ? 'border-error' : 'border-border'}`} />
                        </td>
                        <td className="px-3 py-2">
                          <input value={row.tenDonVi} onChange={e => handleEditImportRow(idx, 'tenDonVi', e.target.value)}
                            className={`w-full h-8 px-2 rounded border text-body-sm focus:outline-none focus:ring-1 focus:ring-primary bg-transparent ${row._error && !row.tenDonVi ? 'border-error' : 'border-border'}`} />
                        </td>
                        <td className="px-3 py-2">
                          <input value={row.chuyenQuan} onChange={e => handleEditImportRow(idx, 'chuyenQuan', e.target.value)}
                            className="w-full h-8 px-2 rounded border border-border text-body-sm focus:outline-none focus:ring-1 focus:ring-primary bg-transparent" />
                        </td>
                        <td className="px-3 py-2">
                          {row._error
                            ? <span className="inline-flex items-center gap-1 text-caption text-error"><Warning size={12} weight="fill" />{row._error}</span>
                            : <span className="inline-flex items-center gap-1 text-caption text-success"><CheckCircle size={12} weight="fill" />OK</span>}
                        </td>
                        <td className="px-3 py-2">
                          <button onClick={() => handleRemoveImportRow(idx)} className="p-1 rounded text-muted-foreground hover:text-error hover:bg-red-50 transition-colors cursor-pointer"><X size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <button onClick={handleImportConfirm} disabled={validRows.length === 0 || isMutating}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-body-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-40">
                  <UploadSimple size={16} /> Import {validRows.length} đơn vị
                </button>
                <button onClick={resetImport} className="px-4 py-2.5 border border-border text-foreground rounded-xl text-body-sm hover:bg-neutral-100 transition-colors cursor-pointer">Hủy</button>
              </div>
            </div>
          )}

          {/* Step: done */}
          {importStep === 'done' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle size={56} weight="fill" className="text-success" />
              <div className="text-center">
                <p className="font-heading font-semibold text-h4 text-foreground">Import hoàn tất!</p>
                <p className="text-body-sm text-muted-foreground mt-1">
                  <span className="text-success font-medium">{importResults.success} đơn vị</span> đã được thêm thành công
                  {importResults.failed > 0 && <>, <span className="text-error font-medium">{importResults.failed} lỗi</span> bị bỏ qua</>}
                </p>
              </div>
              {/* Progress bar */}
              <div className="w-full max-w-xs bg-neutral-200 rounded-full h-2">
                <div className="bg-success h-2 rounded-full transition-all" style={{ width: `${importProgress}%` }} />
              </div>
              <button onClick={resetImport} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-body-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer">Đóng</button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <table className="w-full" role="table" aria-label="Bảng đơn vị">
          <thead>
            <tr className="bg-neutral-50 border-b border-border">
              <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Mã đơn vị</th>
              <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Tên đơn vị</th>
              <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Chuyên quản</th>
              {isAdmin && <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {donViList.map((d: any) => (
              <tr key={d.id} className="hover:bg-neutral-50 transition-colors duration-200">
                <td className="px-4 py-3 text-body-sm font-mono font-medium text-primary">{d.maDonVi}</td>
                <td className="px-4 py-3">
                  {editId === d.id ? (
                    <input type="text" value={editData.tenDonVi} onChange={e => setEditData(p => ({ ...p, tenDonVi: e.target.value }))}
                      className="w-full h-9 px-3 rounded border border-primary text-foreground bg-card text-body-sm focus:outline-none" />
                  ) : (
                    <span className="text-body-sm text-foreground">{d.tenDonVi}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editId === d.id ? (
                    <input type="text" value={editData.chuyenQuan} onChange={e => setEditData(p => ({ ...p, chuyenQuan: e.target.value }))}
                      className="w-full h-9 px-3 rounded border border-primary text-foreground bg-card text-body-sm focus:outline-none" />
                  ) : (
                    <span className="text-body-sm text-foreground">{d.chuyenQuan}</span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {editId === d.id ? (
                        <>
                          <button onClick={handleSave} disabled={isMutating} className="p-1.5 rounded text-success hover:bg-green-50 transition-colors cursor-pointer" aria-label="Lưu"><FloppyDisk size={16} weight="regular" /></button>
                          <button onClick={() => setEditId(null)} className="p-1.5 rounded text-muted-foreground hover:bg-neutral-100 transition-colors cursor-pointer" aria-label="Hủy"><X size={16} weight="regular" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(d)} className="p-1.5 rounded text-muted-foreground hover:text-warning hover:bg-amber-50 transition-colors cursor-pointer" aria-label="Sửa"><PencilSimple size={16} weight="regular" /></button>
                          <button onClick={() => handleDelete(d.id)} disabled={isMutating} className="p-1.5 rounded text-muted-foreground hover:text-error hover:bg-red-50 transition-colors cursor-pointer" aria-label="Xóa"><Trash size={16} weight="regular" /></button>
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
    </main>
  );
}
