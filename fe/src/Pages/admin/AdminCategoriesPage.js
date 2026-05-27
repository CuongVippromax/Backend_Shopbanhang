import React, { useEffect, useState, useCallback } from 'react';
import { adminCategoryApi, unwrapPage } from '../../api/shopApi';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/admin/Modal';
import { Icon } from '../../components/common/Icon';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

const AdminCategoriesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ categoryName: '', description: '', active: true });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    adminCategoryApi.list({ pageNo: 1, pageSize: 1000 })
      .then((resp) => setItems(unwrapPage(resp).items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing === 'new') {
        await adminCategoryApi.create(form);
        toast.show('Đã thêm danh mục.', 'success');
      } else {
        await adminCategoryApi.update(editing.categoryId, form);
        toast.show('Đã cập nhật.', 'success');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.show(err.response?.data?.message || 'Không thể lưu.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const onRemove = async (c) => {
    if (!window.confirm(`Xoá danh mục "${c.categoryName}"?`)) return;
    try {
      await adminCategoryApi.remove(c.categoryId);
      toast.show('Đã xoá.', 'info');
      load();
    } catch (err) {
      toast.show('Không thể xoá.', 'error');
    }
  };

  const columns = [
    { key: 'categoryName', title: 'Tên danh mục', render: (r) => <strong>{r.categoryName}</strong> },
    { key: 'description', title: 'Mô tả' },
    { key: 'bookCount', title: 'Số sách', align: 'right' },
    { key: 'active', title: 'Trạng thái', render: (r) => (
      <span className={`badge ${r.active ? '' : 'badge-mute'}`}>{r.active ? 'Hiển thị' : 'Ẩn'}</span>
    ) },
    { key: 'actions', title: '', align: 'right', render: (r) => (
      <div style={{ display: 'inline-flex', gap: 6 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ categoryName: r.categoryName, description: r.description || '', active: r.active }); setEditing(r); }}><Icon name="edit" size={14} /></button>
        <button className="btn btn-ghost btn-sm" onClick={() => onRemove(r)} style={{ color: 'var(--color-danger)' }}><Icon name="trash" size={14} /></button>
      </div>
    ) },
  ];

  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h1>Danh mục sách</h1>
          <p>Quản lý các danh mục phân loại trên hệ thống.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ categoryName: '', description: '', active: true }); setEditing('new'); }}>
          <Icon name="plus" size={14} /> Thêm danh mục
        </button>
      </div>
      {loading ? <Spinner size={28} /> : <AdminTable columns={columns} data={items} rowKey="categoryId" />}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Thêm danh mục' : 'Sửa danh mục'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Huỷ</button>
            <button className="btn btn-primary" onClick={onSubmit} disabled={submitting}>
              {submitting ? <><Spinner size={14} /> Đang lưu…</> : 'Lưu'}
            </button>
          </>
        }
      >
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Tên danh mục *</label>
            <input className="form-control" value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <label className="switch">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <span>Hiển thị trên trang khách hàng</span>
          </label>
        </form>
      </Modal>

      <style>{`
        .adm-page-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; gap: 14px; flex-wrap: wrap; }
        .adm-page-head h1 { font-family: var(--font-serif); font-size: 26px; margin: 0; }
        .adm-page-head p { color: var(--color-text-mute); font-size: 13.5px; margin: 4px 0 0; }
        .switch { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
        .switch input { accent-color: var(--color-primary); width: 18px; height: 18px; }
      `}</style>
    </div>
  );
};

export default AdminCategoriesPage;
