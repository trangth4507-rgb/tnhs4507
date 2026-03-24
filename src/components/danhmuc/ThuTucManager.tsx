import React, { useState } from 'react';
import { Plus, PencilSimple, Trash, FloppyDisk, X } from '@phosphor-icons/react';
import { useQuery, useMutation } from '@animaapp/playground-react-sdk';
import { useApp } from '../../context/AppContext';

export default function ThuTucManager() {
  const { addToast, currentUser } = useApp();
  const isAdmin = currentUser.vai_tro === 'admin';

  const { data: thuTucList = [], isPending } = useQuery('ThuTuc');
  const { create, update, remove, isPending: isMutating } = useMutation('ThuTuc');

  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ tenThuTuc: string; soNgayQuyDinh: number }>({ tenThuTuc: '', soNgayQuyDinh: 0 });
  const [showAdd, setShowAdd] = useState(false);
  const [newData, setNewData] = useState({ maThuTuc: '', tenThuTuc: '', soNgayQuyDinh: 0 });

  const handleEdit = (t: any) => {
    setEditId(t.id);
    setEditData({ tenThuTuc: t.tenThuTuc, soNgayQuyDinh: t.soNgayQuyDinh });
  };

  const handleSave = async () => {
    if (!editId) return;
    try {
      await update(editId, editData);
      addToast('Cập nhật thủ tục thành công', 'success');
      setEditId(null);
    } catch {
      addToast('Lỗi khi cập nhật thủ tục', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa thủ tục này?')) return;
    try {
      await remove(id);
      addToast('Đã xóa thủ tục', 'info');
    } catch {
      addToast('Lỗi khi xóa thủ tục', 'error');
    }
  };

  const handleAdd = async () => {
    if (!newData.maThuTuc || !newData.tenThuTuc || !newData.soNgayQuyDinh) {
      addToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }
    try {
      await create(newData);
      setNewData({ maThuTuc: '', tenThuTuc: '', soNgayQuyDinh: 0 });
      setShowAdd(false);
      addToast('Thêm thủ tục thành công', 'success');
    } catch {
      addToast('Lỗi khi thêm thủ tục', 'error');
    }
  };

  if (isPending) return <div className="p-6 text-center text-muted-foreground">Đang tải...</div>;

  return (
    <main className="p-6 max-w-app mx-auto" aria-label="Quản lý thủ tục">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-semibold text-h2 text-foreground">Danh mục Thủ tục</h1>
          <p className="text-body-sm text-muted-foreground mt-1">{thuTucList.length} thủ tục</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(true)} disabled={isMutating}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-body-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-40">
            <Plus size={16} weight="regular" /> Thêm thủ tục
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-md p-6 mb-6">
          <h2 className="font-heading font-semibold text-h4 text-foreground mb-4">Thêm thủ tục mới</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Mã thủ tục *</label>
              <input type="text" value={newData.maThuTuc} onChange={e => setNewData(p => ({ ...p, maThuTuc: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" placeholder="TT007" />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Tên thủ tục *</label>
              <input type="text" value={newData.tenThuTuc} onChange={e => setNewData(p => ({ ...p, tenThuTuc: e.target.value }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" placeholder="Tên thủ tục..." />
            </div>
            <div>
              <label className="block text-body-sm font-medium text-foreground mb-1">Số ngày quy định *</label>
              <input type="number" value={newData.soNgayQuyDinh} onChange={e => setNewData(p => ({ ...p, soNgayQuyDinh: parseInt(e.target.value) || 0 }))}
                className="w-full h-11 px-4 rounded-md border border-border text-foreground bg-card text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" min={1} />
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
        <table className="w-full" role="table" aria-label="Bảng thủ tục">
          <thead>
            <tr className="bg-neutral-50 border-b border-border">
              <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Mã thủ tục</th>
              <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Tên thủ tục</th>
              <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Số ngày quy định</th>
              {isAdmin && <th className="px-4 py-3 text-left text-caption font-medium text-muted-foreground uppercase tracking-wide" scope="col">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {thuTucList.map((t: any) => (
              <tr key={t.id} className="hover:bg-neutral-50 transition-colors duration-200">
                <td className="px-4 py-3 text-body-sm font-mono font-medium text-primary">{t.maThuTuc}</td>
                <td className="px-4 py-3">
                  {editId === t.id ? (
                    <input type="text" value={editData.tenThuTuc} onChange={e => setEditData(p => ({ ...p, tenThuTuc: e.target.value }))}
                      className="w-full h-9 px-3 rounded border border-primary text-foreground bg-card text-body-sm focus:outline-none" />
                  ) : (
                    <span className="text-body-sm text-foreground">{t.tenThuTuc}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editId === t.id ? (
                    <input type="number" value={editData.soNgayQuyDinh} onChange={e => setEditData(p => ({ ...p, soNgayQuyDinh: parseInt(e.target.value) || 0 }))}
                      className="w-24 h-9 px-3 rounded border border-primary text-foreground bg-card text-body-sm focus:outline-none" min={1} />
                  ) : (
                    <span className="text-body-sm text-foreground">{t.soNgayQuyDinh} ngày</span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {editId === t.id ? (
                        <>
                          <button onClick={handleSave} disabled={isMutating} className="p-1.5 rounded text-success hover:bg-green-50 transition-colors cursor-pointer" aria-label="Lưu"><FloppyDisk size={16} weight="regular" /></button>
                          <button onClick={() => setEditId(null)} className="p-1.5 rounded text-muted-foreground hover:bg-neutral-100 transition-colors cursor-pointer" aria-label="Hủy"><X size={16} weight="regular" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(t)} className="p-1.5 rounded text-muted-foreground hover:text-warning hover:bg-amber-50 transition-colors cursor-pointer" aria-label="Sửa"><PencilSimple size={16} weight="regular" /></button>
                          <button onClick={() => handleDelete(t.id)} disabled={isMutating} className="p-1.5 rounded text-muted-foreground hover:text-error hover:bg-red-50 transition-colors cursor-pointer" aria-label="Xóa"><Trash size={16} weight="regular" /></button>
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
