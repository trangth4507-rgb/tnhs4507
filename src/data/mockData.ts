// Data coming from Anima Playground SDK
// This file only retains pure utility functions used for deadline calculation.

import { addDays, format, isWeekend } from 'date-fns';

export function tinhNgayHenTra(ngayBatDau: Date, soNgay: number, holidays: string[]): Date {
  let ngayHienTai = new Date(ngayBatDau);
  let soNgayDaTinh = 0;
  while (soNgayDaTinh < soNgay) {
    ngayHienTai = addDays(ngayHienTai, 1);
    const dateStr = format(ngayHienTai, 'yyyy-MM-dd');
    if (!isWeekend(ngayHienTai) && !holidays.includes(dateStr)) {
      soNgayDaTinh++;
    }
  }
  return ngayHienTai;
}

export function tinhTinhTrang(soNgayConLai: number, daTraGiay: boolean): string {
  if (daTraGiay) return 'da_tra';
  if (soNgayConLai > 3) return 'truoc_han';
  if (soNgayConLai >= 1 && soNgayConLai <= 3) return 'can_han';
  if (soNgayConLai === 0) return 'dung_han';
  if (soNgayConLai >= -5) return 'tre_han';
  return 'qua_han';
}
