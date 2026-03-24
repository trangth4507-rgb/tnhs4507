import { TinhTrang } from '../types';

export function getTinhTrangLabel(tt: string): string {
  switch (tt) {
    case 'truoc_han': return 'Trước hạn';
    case 'can_han': return 'Cận hạn';
    case 'dung_han': return 'Đúng hạn';
    case 'tre_han': return 'Trễ hạn';
    case 'qua_han': return 'Quá hạn';
    case 'da_tra': return 'Đã trả';
    default: return tt;
  }
}

export function getTinhTrangBadgeClass(tt: string): string {
  switch (tt) {
    case 'truoc_han': return 'bg-neutral-100 text-neutral-800 border border-neutral-300';
    case 'can_han': return 'bg-warning text-warning-foreground';
    case 'dung_han': return 'bg-info text-info-foreground';
    case 'tre_han': return 'bg-error text-error-foreground';
    case 'qua_han': return 'bg-red-900 text-white';
    case 'da_tra': return 'bg-success text-success-foreground';
    default: return 'bg-neutral-100 text-neutral-800';
  }
}

export function getTinhTrangRowClass(tt: string): string {
  switch (tt) {
    case 'can_han': return 'bg-amber-50';
    case 'dung_han': return 'bg-blue-50';
    case 'tre_han': return 'bg-red-50';
    case 'qua_han': return 'bg-red-100';
    default: return '';
  }
}

export function formatDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return '';
  if (dateInput instanceof Date) {
    const d = dateInput.getDate().toString().padStart(2, '0');
    const m = (dateInput.getMonth() + 1).toString().padStart(2, '0');
    const y = dateInput.getFullYear();
    return `${d}/${m}/${y}`;
  }
  const str = String(dateInput);
  if (str.includes('T')) {
    return formatDate(new Date(str));
  }
  const [y, mo, day] = str.split('-');
  return `${day}/${mo}/${y}`;
}

export function getVaiTroLabel(vaiTro: string): string {
  switch (vaiTro) {
    case 'admin': return 'Quản trị viên';
    case 'operator': return 'Nhân viên';
    case 'viewer': return 'Xem';
    default: return vaiTro;
  }
}

export function toDateInputValue(d: Date | string | undefined): string {
  if (!d) return '';
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  if (String(d).includes('T')) return String(d).slice(0, 10);
  return String(d).slice(0, 10);
}
