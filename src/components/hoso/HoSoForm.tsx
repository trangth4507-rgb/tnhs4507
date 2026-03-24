import React, { useState, useEffect, useRef } from 'react';
import { X, FloppyDisk, SpinnerGap, CaretDown, PencilSimple } from '@phosphor-icons/react';
import { useQuery, useMutation } from '@animaapp/playground-react-sdk';
import { useApp } from '../../context/AppContext';
import { tinhNgayHenTra } from '../../data/mockData';
import { tinhTinhTrang } from '../../data/mockData';
import { format, differenceInDays } from 'date-fns';
import { toDateInputValue } from '../../utils/statusUtils';

interface HoSoFormProps {
  type: 'tnhs' | 'nqt';
  onClose: () => void;
  editRecord?: any;
}

export default function HoSoForm({ type, onClose, editRecord }: HoSoFormProps) {
  const { addToast } = useApp();
  const entityName = type === 'tnhs' ? 'HoSoTNHS' : 'HoSoNQT';

  const { data: donViList = [] } = useQuery('DonVi');
  const { data: thuTucList = [] } = useQuery('ThuTuc');
  const { data: ngayLeList = [] } = useQuery('NgayLe');
  const { data: allRecords = [] } = useQuery(entityName as any);
  const { create, update, isPending: isMutating } = useMutation(entityName as any);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [donViMode, setDonViMode] = useState<'select' | 'manual'>('select');
  const [donViDropdownOpen, setDonViDropdownOpen] = useState(false);
  const [editingMaHoSo, setEditingMaHoSo] = useState(false);
  const donViDropdownRef = useRef<HTMLDivElement>(null);
  const maHoSoInputRef = useRef<HTMLInputElement>(null);

  const generateMaHoSo = () => {
    const prefix = type === 'tnhs' ? 'TNHS' : 'NQT';
    const year = format(new Date(), 'yyyy');
    const newId = (allRecords.length + 1).toString();
    return `${prefix}${year}-${newId.padStart(4, '0')}`;
  };

  const [formData, setFormData] = useState({
    maHoSo: editRecord?.maHoSo || generateMaHoSo(),
    maBhxh: editRecord?.maBhxh || '',
    hoTen: editRecord?.hoTen || '',
    maDonVi: editRecord?.maDonVi || '',
    tenDonVi: editRecord?.tenDonVi || '',
    maThuTuc: editRecord?.maThuTuc || '',
    ngayTiepNhan: toDateInputValue(editRecord?.ngayTiepNhan) || format(new Date(), 'yyyy-MM-dd'),
    ghiChu: editRecord?.ghiChu || '',
    chuyenQuan: editRecord?.chuyenQuan || '',
    soNgayQuyDinh: 0,
    ngayHenTra: toDateInputValue(editRecord?.ngayHenTra) || '',
  });

  useEffect(() => {
    if (editRecord?.tenDonVi) {
      const found = (donViList as any[]).find((d: any) => d.maDonVi === editRecord.maDonVi);
      if (!found) setDonViMode('manual');
    }
  }, []);

  const holidays = (ngayLeList as any[]).map((n: any) => {
    const d = n.ngay instanceof Date ? n.ngay : new Date(n.ngay);
    return d.toISOString().slice(0, 10);
  });

  useEffect(() => {
    if (donViMode === 'select' && formData.maDonVi) {
      const dv = (donViList as any[]).find((d: any) => d.maDonVi === formData.maDonVi);
      if (dv) {
        setFormData(prev => ({ ...prev, tenDonVi: dv.tenDonVi, chuyenQuan: dv.chuyenQuan }));
      }
    }
  }, [formData.maDonVi, donViMode]);

  useEffect(() => {
    if (formData.maThuTuc && formData.ngayTiepNhan) {
      const tt = (thuTucList as any[]).find((t: any) => t.maThuTuc === formData.maThuTuc);
      if (tt) {
        const ngayBatDau = new Date(formData.ngayTiepNhan);
        const ngayHen = tinhNgayHenTra(ngayBatDau, tt.soNgayQuyDinh, holidays);
        setFormData(prev => ({
          ...prev,
          soNgayQuyDinh: tt.soNgayQuyDinh,
          ngayHenTra: format(ngayHen, 'yyyy-MM-dd'),
        }));
      }
    }
  }, [formData.maThuTuc, formData.ngayTiepNhan]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (donViDropdownRef.current && !donViDropdownRef.current.contains(e.target as Node)) {
        setDonViDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (editingMaHoSo && maHoSoInputRef.current) {
      maHoSoInputRef.current.focus();
      maHoSoInputRef.current.select();
    }
  }, [editingMaHoSo]);

  const handleSelectDonVi = (dv: any) => {
    setFormData(prev => ({ ...prev, maDonVi: dv.maDonVi, tenDonVi: dv.tenDonVi, chuyenQuan: dv.chuyenQuan }));
    setDonViDropdownOpen(false);
  };

  const switchDonViMode = (mode: 'select' | 'manual') => {
    setDonViMode(mode);
    setDonViDropdownOpen(false);
    setFormData(prev => ({ ...prev, maDonVi: '', tenDonVi: '', chuyenQuan: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.maHoSo.trim()) errs.maHoSo = 'Mã hồ sơ không được để trống';
    if (!formData.maThuTuc) errs.maThuTuc = 'Vui lòng chọn thủ tục';
    if (!formData.ngayTiepNhan) errs.ngayTiepNhan = 'Vui lòng nhập ngày tiếp nhận';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const today = new Date();
    const soNgayConLai = formData.ngayHenTra ? differenceInDays(new Date(formData.ngayHenTra), today) : 0;
    const tinhTrang = tinhTinhTrang(soNgayConLai, false);
    const tenThuTuc = (thuTucList as any[]).find((t: any) => t.maThuTuc === formData.maThuTuc)?.tenThuTuc || '';

    const payload = {
      maHoSo: formData.maHoSo,
      maBhxh: formData.maBhxh,
      hoTen: formData.hoTen,
      maDonVi: formData.maDonVi,
      tenDonVi: formData.tenDonVi,
      maThuTuc: formData.maThuTuc,
      tenThuTuc,
      ngayTiepNhan: new Date(formData.ngayTiepNhan),
      ngayHenTra: formData.ngayHenTra ? new Date(formData.ngayHenTra) : new Date(),
      soNgayConLai,
      chuyenQuan: formData.chuyenQuan,
      tinhTrang,
      daTraGiay: editRecord?.daTraGiay ?? false,
      ghiChu: formData.ghiChu,
    };

    try {
      if (editRecord) {
        await update(editRecord.id, payload);
        addToast('Cập nhật hồ sơ thành công', 'success');
      } else {
        await create(payload);
        addToast('Thêm hồ sơ mới thành công', 'success');
      }
      onClose();
    } catch {
      addToast('Lỗi khi lưu hồ sơ', 'error');
    }
  };

  const inputBase = 'w-full h-11 px-4 rounded-md border text-foreground bg-card text-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';
  const inputReadOnly = 'w-full h-11 px-4 rounded-md border border-border text-foreground bg-neutral-50 text-body cursor-not-allowed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'hsla(0, 0%, 0%, 0.5)' }}
      role="dialog" aria-modal="true" aria-labelledby="form-title">
      <div className="w-full max-w-lg bg-card border border-border rounded-md shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-neutral-50">
          <h2 id="form-title" className="font-heading font-semibold text-h4 text-foreground">
            {editRecord ? 'Chỉnh sửa hồ sơ' : `Thêm hồ sơ ${type.toUpperCase()} mới`}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" aria-label="Đóng">
            <X size={20} weight="regular" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
          {/* Mã hồ sơ */}
          <div>
            <label className="block text-body-sm font-medium text-foreground mb-1" htmlFor="maHoSo">
              Mã hồ sơ <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input ref={maHoSoInputRef} id="maHoSo" type="text" value={formData.maHoSo}
                readOnly={!editingMaHoSo}
                onChange={e => setFormData(prev => ({ ...prev, maHoSo: e.target.value }))}
                onBlur={() => {
                  if (!formData.maHoSo.trim()) setFormData(prev => ({ ...prev, maHoSo: generateMaHoSo() }));
                  setEditingMaHoSo(false);
                }}
                className={`${errors.maHoSo ? 'border-error' : 'border-border'} ${editingMaHoSo ? `${inputBase} pr-10 border-primary ring-2 ring-primary/20` : `${inputReadOnly} pr-10`}`}
                placeholder="Mã hồ sơ tự động..." />
              <button type="button" onClick={() => setEditingMaHoSo(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <PencilSimple size={15} weight="regular" />
              </button>
            </div>
            {errors.maHoSo && <p className="text-caption text-error mt-1">{errors.maHoSo}</p>}
          </div>

          {/* Mã BHXH */}
          <div>
            <label className="block text-body-sm font-medium text-foreground mb-1" htmlFor="maBhxh">Mã số BHXH</label>
            <input id="maBhxh" type="text" value={formData.maBhxh}
              onChange={e => setFormData(prev => ({ ...prev, maBhxh: e.target.value }))}
              className={`${inputBase} border-border`} placeholder="Nhập mã số BHXH..." />
          </div>

          {/* Họ và tên */}
          <div>
            <label className="block text-body-sm font-medium text-foreground mb-1" htmlFor="hoTen">Họ và tên</label>
            <input id="hoTen" type="text" value={formData.hoTen}
              onChange={e => setFormData(prev => ({ ...prev, hoTen: e.target.value }))}
              className={`${inputBase} border-border`} placeholder="Nhập họ và tên..." />
          </div>

          {/* Đơn vị */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-body-sm font-medium text-foreground">
                Đơn vị <span className="ml-1 text-caption font-normal text-muted-foreground">(không bắt buộc)</span>
              </label>
              <div className="flex gap-1 text-caption">
                {(['select', 'manual'] as const).map(mode => (
                  <button key={mode} type="button" onClick={() => switchDonViMode(mode)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${donViMode === mode ? 'bg-primary text-primary-foreground' : 'bg-neutral-100 text-muted-foreground hover:bg-neutral-200'}`}>
                    {mode === 'select' ? 'Chọn từ danh sách' : 'Nhập tay'}
                  </button>
                ))}
              </div>
            </div>
            {donViMode === 'select' ? (
              <div className="relative" ref={donViDropdownRef}>
                <button type="button" onClick={() => setDonViDropdownOpen(p => !p)}
                  className={`w-full h-11 px-4 pr-10 rounded-md border text-left text-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-card cursor-pointer
                    ${formData.tenDonVi ? 'text-foreground' : 'text-muted-foreground'}
                    ${errors.maDonVi ? 'border-error' : 'border-border'}`}>
                  {formData.tenDonVi || '-- Chọn đơn vị hoặc để trống --'}
                </button>
                <CaretDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-transform ${donViDropdownOpen ? 'rotate-180' : ''}`} />
                {donViDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-md shadow-lg overflow-hidden">
                    <button type="button" onClick={() => { setFormData(prev => ({ ...prev, maDonVi: '', tenDonVi: '', chuyenQuan: '' })); setDonViDropdownOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-body-sm text-muted-foreground hover:bg-neutral-100 transition-colors cursor-pointer italic">
                      -- Để trống --
                    </button>
                    <div className="border-t border-border" />
                    {(donViList as any[]).map((dv: any) => (
                      <button key={dv.id} type="button" onClick={() => handleSelectDonVi(dv)}
                        className={`w-full px-4 py-2.5 text-left text-body-sm hover:bg-neutral-100 transition-colors cursor-pointer ${formData.maDonVi === dv.maDonVi ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}`}>
                        <span className="font-medium">{dv.tenDonVi}</span>
                        <span className="ml-2 text-caption text-muted-foreground">({dv.chuyenQuan})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <input type="text" value={formData.tenDonVi}
                onChange={e => setFormData(prev => ({ ...prev, tenDonVi: e.target.value, maDonVi: '', chuyenQuan: '' }))}
                className={`${inputBase} border-border`} placeholder="Nhập tên đơn vị..." />
            )}
          </div>

          {/* Chuyên quản */}
          <div>
            <label className="block text-body-sm font-medium text-foreground mb-1" htmlFor="chuyenQuan">Chuyên quản</label>
            <input id="chuyenQuan" type="text" value={formData.chuyenQuan}
              readOnly={donViMode === 'select' && !!formData.maDonVi}
              onChange={e => setFormData(prev => ({ ...prev, chuyenQuan: e.target.value }))}
              className={donViMode === 'select' && !!formData.maDonVi ? inputReadOnly : `${inputBase} border-border`}
              placeholder={donViMode === 'select' ? 'Tự động điền từ đơn vị' : 'Nhập chuyên quản...'} />
          </div>

          {/* Thủ tục */}
          <div>
            <label className="block text-body-sm font-medium text-foreground mb-1" htmlFor="maThuTuc">
              Thủ tục <span className="text-error">*</span>
            </label>
            <select id="maThuTuc" value={formData.maThuTuc}
              onChange={e => setFormData(prev => ({ ...prev, maThuTuc: e.target.value }))}
              className={`${inputBase} ${errors.maThuTuc ? 'border-error' : 'border-border'}`}>
              <option value="">-- Chọn thủ tục --</option>
              {(thuTucList as any[]).map((t: any) => (
                <option key={t.id} value={t.maThuTuc}>{t.tenThuTuc} ({t.soNgayQuyDinh} ngày)</option>
              ))}
            </select>
            {errors.maThuTuc && <p className="text-caption text-error mt-1">{errors.maThuTuc}</p>}
          </div>

          {/* Ngày tiếp nhận */}
          <div>
            <label className="block text-body-sm font-medium text-foreground mb-1" htmlFor="ngayTiepNhan">
              Ngày tiếp nhận <span className="text-error">*</span>
            </label>
            <input id="ngayTiepNhan" type="date" value={formData.ngayTiepNhan}
              onChange={e => setFormData(prev => ({ ...prev, ngayTiepNhan: e.target.value }))}
              className={`${inputBase} ${errors.ngayTiepNhan ? 'border-error' : 'border-border'}`} />
            {errors.ngayTiepNhan && <p className="text-caption text-error mt-1">{errors.ngayTiepNhan}</p>}
          </div>

          {/* Ngày hẹn trả */}
          <div>
            <label className="block text-body-sm font-medium text-foreground mb-1" htmlFor="ngayHenTra">
              Ngày hẹn trả <span className="ml-1 text-caption font-normal text-muted-foreground">(tự động tính)</span>
            </label>
            <input id="ngayHenTra" type="date" value={formData.ngayHenTra} readOnly className={inputReadOnly} />
            {formData.ngayHenTra && formData.soNgayQuyDinh > 0 ? (
              <p className="text-caption text-muted-foreground mt-1">Tính theo <b>{formData.soNgayQuyDinh}</b> ngày làm việc</p>
            ) : (
              <p className="text-caption text-muted-foreground mt-1">Chọn thủ tục và ngày tiếp nhận để tự tính</p>
            )}
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-body-sm font-medium text-foreground mb-1" htmlFor="ghiChu">Ghi chú</label>
            <textarea id="ghiChu" value={formData.ghiChu}
              onChange={e => setFormData(prev => ({ ...prev, ghiChu: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 rounded-md border border-border text-foreground bg-card text-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
              placeholder="Ghi chú thêm..." />
          </div>
        </form>

        <div className="flex gap-3 px-6 py-4 border-t border-border bg-neutral-50">
          <button type="submit" onClick={handleSubmit} disabled={isMutating}
            className="flex-1 flex items-center justify-center gap-2 h-11 bg-primary text-primary-foreground rounded-xl text-body-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            {isMutating ? <SpinnerGap size={16} weight="regular" className="animate-spin" /> : <FloppyDisk size={16} weight="regular" />}
            {isMutating ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
          <button type="button" onClick={onClose} disabled={isMutating}
            className="px-6 h-11 border border-border text-foreground rounded-xl text-body-sm hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-40">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
