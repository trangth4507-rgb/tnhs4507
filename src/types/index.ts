export type TinhTrang = 'truoc_han' | 'can_han' | 'dung_han' | 'tre_han' | 'qua_han' | 'da_tra';

export type VaiTro = 'admin' | 'operator' | 'viewer';

export type ActiveSection = 'dashboard' | 'baocao' | 'tnhs' | 'nqt' | 'donvi' | 'thutuc' | 'ngayle' | 'users' | 'hcc';

// Legacy local type for UserManager (not SDK-backed)
export interface NguoiDung {
  id: string;
  ten: string;
  email: string;
  vai_tro: VaiTro;
  bi_khoa: boolean;
  ngay_tao: string;
}
