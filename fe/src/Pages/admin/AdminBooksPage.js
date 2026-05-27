import React, { useEffect, useState, useCallback } from 'react';
import { adminBookApi, adminCategoryApi, unwrapPage } from '../../api/shopApi';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/admin/Modal';
import { Icon } from '../../components/common/Icon';
import { Spinner } from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import { formatVnd, safeImage } from '../../utils/format';
import { useToast } from '../../context/ToastContext';

const emptyForm = {
  bookName: '', price: '', quantity: '', description: '',
  author: '', publisher: '', publicationYear: '', categoryId: '',
  image: null,
};

const AdminBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | 'new' | book
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    adminBookApi.list({ page, size: 10, search: search || undefined })
      .then((resp) => {
        const p = unwrapPage(resp);
        setBooks(p.items);
        setPageInfo({ pageNo: p.pageNo || page, totalPages: p.totalPages || 1 });
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(load, [load]);
  useEffect(() => {
    adminCategoryApi.list({ pageNo: 1, pageSize: 1000 })
      .then((resp) => setCategories(unwrapPage(resp).items))
      .catch(() => setCategories([]));
  }, []);

  const openCreate = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (b) => {
    setForm({
      bookName: b.bookName || '', price: b.price || '',
      quantity: b.quantity || '', description: b.description || '',
      author: b.author || '', publisher: b.publisher || '',
      publicationYear: b.publicationYear || '', categoryId: b.categoryId || '',
      image: null,
    });
    setEditing(b);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v != null && v !== '') fd.append(k, v);
      });
      if (editing === 'new') {
        await adminBookApi.create(fd);
        toast.show('Đã thêm sách.', 'success');
      } else {
        await adminBookApi.update(editing.bookId, fd);
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

  const onRemove = async (b) => {
    if (!window.confirm(`Xoá "${b.bookName}"?`)) return;
    try {
      await adminBookApi.remove(b.bookId);
      toast.show('Đã xoá.', 'info');
      load();
    } catch (err) {
      toast.show('Không thể xoá.', 'error');
    }
  };

  const columns = [
    { key: 'image', title: 'Ảnh', width: 80, render: (r) => (
      <img src={safeImage(r.image, r.bookName)} alt={r.bookName}
        onError={(e) => { e.currentTarget.src = safeImage(null, r.bookName); }}
        style={{ width: 48, height: 64, objectFit: 'cover', borderRadius: 6 }}
      />
    ) },
    { key: 'bookName', title: 'Tên sách', render: (r) => (
      <div>
        <strong>{r.bookName}</strong>
        <div style={{ fontSize: 12, color: 'var(--color-text-mute)' }}>{r.author}</div>
      </div>
    ) },
    { key: 'category', title: 'Danh mục' },
    { key: 'price', title: 'Giá', render: (r) => formatVnd(r.price), align: 'right' },
    { key: 'quantity', title: 'Tồn kho', align: 'right' },
    { key: 'actions', title: '', align: 'right', render: (r) => (
      <div style={{ display: 'inline-flex', gap: 6 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}><Icon name="edit" size={14} /></button>
        <button className="btn btn-ghost btn-sm" onClick={() => onRemove(r)} style={{ color: 'var(--color-danger)' }}>
          <Icon name="trash" size={14} />
        </button>
      </div>
    ) },
  ];

  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h1>Quản lý sách</h1>
          <p>Tổng cộng {books.length > 0 ? `${pageInfo.pageNo}/${pageInfo.totalPages} trang` : 'chưa có dữ liệu'}</p>
        </div>
        <div className="adm-page-tools">
          <div className="adm-search">
            <Icon name="search" size={14} />
            <input value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="Tìm theo tên..." />
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon name="plus" size={14} /> Thêm sách
          </button>
        </div>
      </div>

      {loading ? <div className="text-center"><Spinner size={28} /></div> : (
        <>
          <AdminTable columns={columns} data={books} rowKey="bookId" />
          <Pagination pageNo={pageInfo.pageNo} totalPages={pageInfo.totalPages} onChange={setPage} />
        </>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Thêm sách mới' : `Sửa: ${editing?.bookName || ''}`}
        size="lg"
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
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tên sách *</label>
              <input className="form-control" value={form.bookName} onChange={(e) => setForm({ ...form, bookName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Danh mục</label>
              <select className="form-control" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">— Chọn danh mục —</option>
                {categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Giá *</label>
              <input type="number" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Số lượng *</label>
              <input type="number" className="form-control" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tác giả</label>
              <input className="form-control" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Nhà xuất bản</label>
              <input className="form-control" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Năm xuất bản</label>
              <input type="number" className="form-control" value={form.publicationYear} onChange={(e) => setForm({ ...form, publicationYear: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Ảnh bìa</label>
              <input type="file" accept="image/*" className="form-control" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea className="form-control" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </form>
      </Modal>

      <style>{`
        .adm-page-head {
          display: flex; justify-content: space-between; align-items: flex-end;
          margin-bottom: 20px; gap: 14px; flex-wrap: wrap;
        }
        .adm-page-head h1 { font-family: var(--font-serif); font-size: 26px; margin: 0; }
        .adm-page-head p { color: var(--color-text-mute); font-size: 13.5px; margin: 4px 0 0; }
        .adm-page-tools { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .adm-search {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }
        .adm-search input { border: 0; outline: none; background: transparent; font-size: 14px; padding: 4px 0; min-width: 200px; }
      `}</style>
    </div>
  );
};

export default AdminBooksPage;
