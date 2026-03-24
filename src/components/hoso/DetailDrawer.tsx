import React, { useState } from 'react';
import { X, CheckCircle, PencilSimple, SpinnerGap, Printer } from '@phosphor-icons/react';
import { getTinhTrangBadgeClass, getTinhTrangLabel, formatDate } from '../../utils/statusUtils';
import { useApp } from '../../context/AppContext';
import { useMutation } from '@animaapp/playground-react-sdk';
import { format } from 'date-fns';

interface DetailDrawerProps {
  record: any;
  type: 'tnhs' | 'nqt';
  onClose: () => void;
  onEdit: () => void;
}

export default function DetailDrawer({ record, type, onClose, onEdit }: DetailDrawerProps) {
  const { addToast } = useApp();
  const entityName = type === 'tnhs' ? 'HoSoTNHS' : 'HoSoNQT';
  const { update, isPending: loading } = useMutation(entityName as any);

  const handleTraGiay = async () => {
    try {
      await update(record.id, {
        daTraGiay: true,
        tinhTrang: 'da_tra',
        thoiGianTraGiay: new Date(),
      });
      addToast(`Đã đánh dấu trả giấy cho ${record.maHoSo}`, 'success');
      onClose();
    } catch {
      addToast('Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  const fields = [
    { label: 'Mã hồ sơ', value: record.maHoSo },
    { label: 'Mã số BHXH', value: record.maBhxh || '—' },
    { label: 'Họ và tên', value: record.hoTen || '—' },
    { label: 'Đơn vị', value: record.tenDonVi },
    { label: 'Thủ tục', value: record.tenThuTuc },
    { label: 'Ngày tiếp nhận', value: formatDate(record.ngayTiepNhan) },
    { label: 'Ngày hẹn trả', value: formatDate(record.ngayHenTra) },
    { label: 'Số ngày còn lại', value: record.soNgayConLai <= 0 ? `Trễ ${Math.abs(record.soNgayConLai)} ngày` : `${record.soNgayConLai} ngày` },
    { label: 'Chuyên quản', value: record.chuyenQuan },
    { label: 'Đã trả giấy', value: record.daTraGiay ? `Có (${record.thoiGianTraGiay ? formatDate(record.thoiGianTraGiay) : ''})` : 'Chưa' },
    { label: 'Ghi chú', value: record.ghiChu || '—' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ backgroundColor: 'hsla(0, 0%, 0%, 0.3)' }} onClick={onClose} aria-hidden="true" />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 bg-card border-l border-border flex flex-col animate-slide-in-right"
        role="complementary" aria-label="Chi tiết hồ sơ">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-neutral-50">
          <div>
            <h2 className="font-heading font-semibold text-h4 text-foreground">Chi tiết hồ sơ</h2>
            <p className="text-caption text-muted-foreground">{record.maHoSo}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" aria-label="Đóng">
            <X size={20} weight="regular" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-3 py-1.5 rounded-full text-body-sm font-medium ${getTinhTrangBadgeClass(record.tinhTrang)}`}>
              {getTinhTrangLabel(record.tinhTrang)}
            </span>
            {record.soNgayConLai <= 2 && !record.daTraGiay && (
              <span className="text-caption text-error font-medium">Cần xử lý ngay!</span>
            )}
          </div>
          <dl className="space-y-4">
            {fields.map(f => (
              <div key={f.label} className="flex flex-col gap-0.5">
                <dt className="text-caption text-muted-foreground font-medium uppercase tracking-wide">{f.label}</dt>
                <dd className="text-body-sm text-foreground font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="px-6 py-4 border-t border-border space-y-3">
          {!record.daTraGiay && (
            <button onClick={handleTraGiay} disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-11 bg-success text-success-foreground rounded-xl text-body-sm font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? <SpinnerGap size={16} weight="regular" className="animate-spin" /> : <CheckCircle size={16} weight="regular" />}
              {loading ? 'Đang xử lý...' : 'Đánh dấu đã trả giấy'}
            </button>
          )}
          <div className="flex gap-3">
            <button onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 h-11 border border-primary text-primary rounded-xl text-body-sm font-medium hover:bg-blue-50 transition-colors cursor-pointer">
              <PencilSimple size={16} weight="regular" /> Chỉnh sửa
            </button>
            <button onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 h-11 border border-border text-foreground rounded-xl text-body-sm hover:bg-neutral-100 transition-colors cursor-pointer">
              <Printer size={16} weight="regular" /> In
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
