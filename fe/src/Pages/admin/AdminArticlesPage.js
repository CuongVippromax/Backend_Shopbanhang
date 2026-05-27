import React, { useEffect, useState, useCallback } from 'react';
import { adminArticleApi, unwrapPage } from '../../api/shopApi';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/admin/Modal';
import { Icon } from '../../components/common/Icon';
import { Spinner } from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import { formatDate, safeImage } from '../../utils/format';
import { useToast } from '../../context/ToastContext';

const emptyForm = { title: '', summary: '', category: '', authorName: '', content: '', image: null, published: true, featured: false };

const AdminArticlesPage = () => {
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    adminArticleApi.list({ page, size: 10 })
      .then((resp) => {
        const p = unwrapPage(resp);
        setItems(p.items);
        setPageInfo({ pageNo: (p.pageNo ?? page) + 1, totalPages: p.totalPages || 1 });
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(load, [load]);

  const openEdit = (a) => {
    setForm({
      title: a.title || '', summary: a.summary || '', category: a.category || '',
      authorName: a.authorName || '', content: a.content || '',
      image: null, published: a.published, featured: a.featured,
    });
    setEditing(a);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v != null && v !== '') {
          if (typeof v === 'boolean') fd.append(k, String(v));
          else fd.append(k, v);
        }
      });
      if (editing === 'new') {
        await adminArticleApi.create(fd);
        toast.show('Đã thêm bài viết.', 'success');
      } else {
        await adminArticleApi.update(editing.articleId, fd);
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

  const onRemove = async (a) => {
    if (!window.confirm(`Xoá bài "${a.title}"?`)) return;
    try {
      await adminArticleApi.remove(a.articleId);
      toast.show('Đã xoá.', 'info');
      load();
    } catch {
      toast.show('Không thể xoá.', 'error');
    }
  };

  const toggleFeatured = async (a) => {
    try {
      await adminArticleApi.setFeatured(a.articleId, !a.featured);
      toast.show('Đã cập nhật.', 'success');
      load();
    } catch {
      toast.show('Không thể cập nhật.', 'error');
    }
  };

  const columns = [
    { key: 'image', title: 'Ảnh', width: 80, render: (r) => (
      <img src={safeImage(r.image, r.title)} alt={r.title}
        onError={(e) => { e.currentTarget.src = safeImage(null, r.title); }}
        style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }}
      />
    )},
    { key: 'title', title: 'Tiêu đề', render: (r) => (
      <div>
        <strong>{r.title}</strong>
        <div style={{ fontSize: 12, color: 'var(--color-text-mute)' }}>{r.category} · {r.authorName}</div>
      </div>
    ) },
    { key: 'createdAt', title: 'Ngày tạo', render: (r) => formatDate(r.createdAt) },
    { key: 'status', title: 'Trạng thái', render: (r) => (
      <div style={{ display: 'inline-flex', gap: 4 }}>
        <span className={`badge ${r.published ? '' : 'badge-mute'}`}>{r.published ? 'Đăng' : 'Nháp'}</span>
        {r.featured && <span className="badge badge-accent">Nổi bật</span>}
      </div>
    ) },
    { key: 'actions', title: '', align: 'right', render: (r) => (
      <div style={{ display: 'inline-flex', gap: 6 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => toggleFeatured(r)} title="Nổi bật">
          <Icon name="star" size={14} color={r.featured ? 'var(--color-accent)' : 'currentColor'} />
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}><Icon name="edit" size={14} /></button>
        <button className="btn btn-ghost btn-sm" onClick={() => onRemove(r)} style={{ color: 'var(--color-danger)' }}><Icon name="trash" size={14} /></button>
      </div>
    ) },
  ];

  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h1>Quản lý bài viết</h1>
          <p>Bài blog, tin tức và nội dung trên website.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing('new'); }}>
          <Icon name="plus" size={14} /> Bài viết mới
        </button>
      </div>

      {loading ? <Spinner size={28} /> : (
        <>
          <AdminTable columns={columns} data={items} rowKey="articleId" />
          <Pagination pageNo={pageInfo.pageNo} totalPages={pageInfo.totalPages} onChange={(p) => setPage(p - 1)} />
        </>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Bài viết mới' : `Sửa: ${editing?.title || ''}`}
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
          <div className="form-group">
            <label className="form-label">Tiêu đề *</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Danh mục</label>
              <input className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Tác giả</label>
              <input className="form-control" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả ngắn</label>
            <textarea className="form-control" rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Ảnh bìa</label>
            <input type="file" accept="image/*" className="form-control" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })} />
          </div>
          <div className="form-group">
            <label className="form-label">Nội dung</label>
            <textarea className="form-control" rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            <label className="switch"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /><span>Xuất bản</span></label>
            <label className="switch"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /><span>Bài nổi bật</span></label>
          </div>
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

export default AdminArticlesPage;
