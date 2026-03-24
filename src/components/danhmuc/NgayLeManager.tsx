import React, { useState } from 'react';
import { Plus, Trash, FloppyDisk } from '@phosphor-icons/react';
import { useQuery, useMutation } from '@animaapp/playground-react-sdk';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/statusUtils';

export default function NgayLeManager() {
  const { addToast, currentUser } = useApp();
  const isAdmin = currentUser.vai_tro === 'admin';

  const { data: ngayLeList = [], isPending } = useQuery('NgayLe', { orderBy: { ngay: 'asc' } });
  const { create, remove, isPending: isMutating } = useMutation('NgayLe');

  const [showAdd, setShowAdd] = useState(false);
  const [newData, setNewData] = useState({ ngay: '', tenNgayLe: '' });

  const handleAdd = async () => {
    if (!newData.ngay || !newData.tenNgayLe) {
      addToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }
    try {
      await create({ ngay: new Date(newData.ngay), tenNgayLe: newData.tenNgayLe });
      setNewData({ ngay: '', tenNgayLe: '' });
      setShowAdd(false);
      addToast('Thêm ngày nghỉ thành công', 'success');
    } catch {
      addToast('Lỗi khi thêm ngày nghỉ', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa ngày nghỉ này?')) return;
    try {
      await remove(id);
      addToast('Đã xóa ngày nghỉ', 'info');
    } catch {
      addToast('Lỗi khi xóa ngày nghỉ', 'error');
    }
  };

  if (isPending) return <div className="p-6 text-center text-muted-foreground">Đang tải...</div>;

  return (
    <main className="p-6 max-w-app mx-auto" aria-label="Quản lý ngày nghỉ">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-semibold text-h2 text-foreground">Danh mục Ngày nghỉ</h1>
          <p className="text-body-sm text-muted-foreground mt-1">{ngayLeList.length} ngày nghỉ được cấu hình</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(true)} disabled={isMutating}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-body-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-40">
            <Plus size={16} weight="regular" /> Thêm ngày nghỉ
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-md p-6 mb-6">
          <h2 className="font-heading font-semibold text-h4 text-foreground mb-4">Thêm ngày nghỉ mới</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Ngày *</label>
              <input type="date" value={newData.ngay} onChange={e => setNewData(p => ({ ...p, ngay: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Tên ngày nghỉ *</label>
              <input type="text" value={newData.tenNgayLe} onChange={e => setNewData(p => ({ ...p, tenNgayLe: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" placeholder="Tên ngày lễ..." />
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

      <div className="bg-card border border-border rounded-md overflow-hidden">
        <table className="w-full" role="table" aria-label="Bảng ngày nghỉ">
          <thead>
            <tr className="bg-neutral-50 border-b border-border">
              <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Ngày</th>
              <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Tên ngày nghỉ</th>
              {isAdmin && <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ngayLeList.map((n: any) => (
              <tr key={n.id} className="hover:bg-neutral-50 transition-colors duration-200">
                <td className="px-4 py-3 text-body-sm font-mono text-foreground">{formatDate(n.ngay)}</td>
                <td className="px-4 py-3 text-body-sm text-foreground">{n.tenNgayLe}</td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(n.id)} disabled={isMutating} className="p-1.5 rounded text-muted-foreground hover:text-error hover:bg-red-50 transition-colors cursor-pointer" aria-label="Xóa">
                      <Trash size={16} weight="regular" />
                    </button>
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
