import React, { useState } from 'react';
import { Plus, PencilSimple, Trash, FloppyDisk, X, Lock, LockOpen } from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';
import { NguoiDung, VaiTro } from '../../types';
import { getVaiTroLabel, formatDate } from '../../utils/statusUtils';

// Local state management for users (not backed by SDK entity)
const INITIAL_USERS: NguoiDung[] = [
  { id: '1', ten: 'admin', email: 'trangth@', vai_tro: 'admin', bi_khoa: false, ngay_tao: '2024-01-01' },
  { id: '2', ten: 'Nguyễn Thị Hoa', email: 'hoa.nt@bhxh.gov.vn', vai_tro: 'operator', bi_khoa: false, ngay_tao: '2024-02-15' },
  { id: '3', ten: 'Trần Văn Minh', email: 'minh.tv@bhxh.gov.vn', vai_tro: 'operator', bi_khoa: false, ngay_tao: '2024-03-10' },
  { id: '4', ten: 'Lê Thị Thu', email: 'thu.lt@bhxh.gov.vn', vai_tro: 'viewer', bi_khoa: false, ngay_tao: '2024-04-20' },
  { id: '5', ten: 'Phạm Văn Đức', email: 'duc.pv@bhxh.gov.vn', vai_tro: 'viewer', bi_khoa: true, ngay_tao: '2024-05-05' },
];

export default function UserManager() {
  const { addToast, currentUser } = useApp();
  const isAdmin = currentUser.vai_tro === 'admin';
  const [nguoiDungList, setNguoiDungList] = useState<NguoiDung[]>(INITIAL_USERS);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<NguoiDung>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newData, setNewData] = useState({ ten: '', email: '', vai_tro: 'viewer' as VaiTro });

  if (!isAdmin) {
    return (
      <main className="p-6 max-w-app mx-auto flex items-center justify-center min-h-64">
        <div className="text-center">
          <Lock size={48} weight="regular" className="text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading font-semibold text-h3 text-foreground mb-2">Không có quyền truy cập</h2>
          <p className="text-body-sm text-muted-foreground">Chỉ quản trị viên mới có thể quản lý người dùng.</p>
        </div>
      </main>
    );
  }

  const handleEdit = (u: NguoiDung) => { setEditId(u.id); setEditData({ ...u }); };
  const handleSave = () => {
    setNguoiDungList(prev => prev.map(u => u.id === editId ? { ...u, ...editData } as NguoiDung : u));
    addToast('Cập nhật người dùng thành công', 'success');
    setEditId(null);
  };
  const handleDelete = (id: string) => {
    if (id === currentUser.id) { addToast('Không thể xóa tài khoản đang đăng nhập', 'error'); return; }
    if (!confirm('Xóa người dùng này?')) return;
    setNguoiDungList(prev => prev.filter(u => u.id !== id));
    addToast('Đã xóa người dùng', 'info');
  };
  const handleToggleLock = (u: NguoiDung) => {
    setNguoiDungList(prev => prev.map(x => x.id === u.id ? { ...x, bi_khoa: !x.bi_khoa } : x));
    addToast(u.bi_khoa ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản', 'info');
  };
  const handleAdd = () => {
    if (!newData.ten || !newData.email) { addToast('Vui lòng điền đầy đủ thông tin', 'error'); return; }
    const newUser: NguoiDung = { id: Date.now().toString(), ...newData, bi_khoa: false, ngay_tao: new Date().toISOString().slice(0, 10) };
    setNguoiDungList(prev => [...prev, newUser]);
    setNewData({ ten: '', email: '', vai_tro: 'viewer' });
    setShowAdd(false);
    addToast('Thêm người dùng thành công', 'success');
  };

  const vaiTroBadge = (vt: VaiTro) => {
    switch (vt) {
      case 'admin': return 'bg-primary text-primary-foreground';
      case 'operator': return 'bg-info text-info-foreground';
      case 'viewer': return 'bg-neutral-200 text-neutral-800';
    }
  };

  return (
    <main className="p-6 max-w-app mx-auto" aria-label="Quản lý người dùng">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-semibold text-h2 text-foreground">Quản lý Người dùng</h1>
          <p className="text-body-sm text-muted-foreground mt-1">{nguoiDungList.length} tài khoản</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-body-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer">
          <Plus size={16} weight="regular" /> Thêm người dùng
        </button>
      </div>

      <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-md mb-6">
        <img src="https://c.animaapp.com/mmlpkfkldFmwGl/img/ai_4.png" alt="portrait of administrative manager"
          className="w-16 h-16 rounded-full object-cover border-2 border-primary" loading="lazy" />
        <div>
          <p className="font-heading font-semibold text-h4 text-foreground">{currentUser.ten}</p>
          <p className="text-body-sm text-muted-foreground">{currentUser.email}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-caption font-medium ${vaiTroBadge(currentUser.vai_tro)}`}>
            {getVaiTroLabel(currentUser.vai_tro)}
          </span>
        </div>
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-md p-6 mb-6">
          <h2 className="font-heading font-semibold text-h4 text-foreground mb-4">Thêm người dùng mới</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Họ tên *</label>
              <input type="text" value={newData.ten} onChange={e => setNewData(p => ({ ...p, ten: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" placeholder="Họ và tên..." />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Email *</label>
              <input type="email" value={newData.email} onChange={e => setNewData(p => ({ ...p, email: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" placeholder="email@bhxh.gov.vn" />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Vai trò *</label>
              <select value={newData.vai_tro} onChange={e => setNewData(p => ({ ...p, vai_tro: e.target.value as VaiTro }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors">
                <option value="viewer">Xem</option>
                <option value="operator">Nhân viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-body-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer">
              <FloppyDisk size={16} weight="regular" /> Lưu
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 border border-border text-foreground rounded-xl text-body-sm hover:bg-neutral-100 transition-colors cursor-pointer">Hủy</button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Bảng người dùng">
            <thead>
              <tr className="bg-neutral-50 border-b border-border">
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Họ tên</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Email</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Vai trò</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Ngày tạo</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Trạng thái</th>
                <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {nguoiDungList.map(u => (
                <tr key={u.id} className={`hover:bg-neutral-50 transition-colors duration-200 ${u.bi_khoa ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    {editId === u.id ? (
                      <input type="text" value={editData.ten || ''} onChange={e => setEditData(p => ({ ...p, ten: e.target.value }))}
                        className="w-full h-9 px-3 rounded border border-primary text-foreground bg-card text-body-sm focus:outline-none" />
                    ) : (
                      <span className="text-body-sm font-medium text-foreground">{u.ten}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-body-sm text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    {editId === u.id ? (
                      <select value={editData.vai_tro || 'viewer'} onChange={e => setEditData(p => ({ ...p, vai_tro: e.target.value as VaiTro }))}
                        className="h-9 px-3 rounded border border-primary text-foreground bg-card text-body-sm focus:outline-none">
                        <option value="viewer">Xem</option>
                        <option value="operator">Nhân viên</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-caption font-medium ${vaiTroBadge(u.vai_tro)}`}>
                        {getVaiTroLabel(u.vai_tro)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-body-sm text-muted-foreground">{formatDate(u.ngay_tao)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-caption font-medium ${u.bi_khoa ? 'text-error' : 'text-success'}`}>
                      {u.bi_khoa ? 'Đã khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {editId === u.id ? (
                        <>
                          <button onClick={handleSave} className="p-1.5 rounded text-success hover:bg-green-50 transition-colors cursor-pointer" aria-label="Lưu"><FloppyDisk size={16} weight="regular" /></button>
                          <button onClick={() => setEditId(null)} className="p-1.5 rounded text-muted-foreground hover:bg-neutral-100 transition-colors cursor-pointer" aria-label="Hủy"><X size={16} weight="regular" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(u)} className="p-1.5 rounded text-muted-foreground hover:text-warning hover:bg-amber-50 transition-colors cursor-pointer" aria-label="Sửa"><PencilSimple size={16} weight="regular" /></button>
                          <button onClick={() => handleToggleLock(u)} className={`p-1.5 rounded transition-colors cursor-pointer ${u.bi_khoa ? 'text-success hover:bg-green-50' : 'text-warning hover:bg-amber-50'}`} aria-label={u.bi_khoa ? 'Mở khóa' : 'Khóa'}>
                            {u.bi_khoa ? <LockOpen size={16} weight="regular" /> : <Lock size={16} weight="regular" />}
                          </button>
                          <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded text-muted-foreground hover:text-error hover:bg-red-50 transition-colors cursor-pointer" aria-label="Xóa"><Trash size={16} weight="regular" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
