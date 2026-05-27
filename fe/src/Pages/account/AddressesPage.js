import React, { useEffect, useState } from 'react';
import { addressApi, unwrap } from '../../api/shopApi';
import { Icon } from '../../components/common/Icon';
import { Spinner } from '../../components/common/Spinner';
import Empty from '../../components/common/Empty';
import { useToast } from '../../context/ToastContext';

const emptyForm = { label: '', recipientName: '', phone: '', address: '', isDefault: false };

const AddressesPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const load = () => {
    setLoading(true);
    addressApi.list()
      .then((resp) => setList(unwrap(resp) || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm({ ...emptyForm, isDefault: list.length === 0 });
    setEditing('new');
    setErrors({});
  };

  const openEdit = (a) => {
    setForm({ label: a.label, recipientName: a.recipientName, phone: a.phone, address: a.address, isDefault: a.isDefault });
    setEditing(a.id);
    setErrors({});
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      if (editing === 'new') {
        await addressApi.create(form);
        toast.show('Đã thêm địa chỉ.', 'success');
      } else {
        await addressApi.update(editing, form);
        toast.show('Đã cập nhật địa chỉ.', 'success');
      }
      setEditing(null);
      load();
    } catch (err) {
      const fieldErrors = err.response?.data?.fieldErrors;
      if (fieldErrors) setErrors(fieldErrors);
      toast.show(err.response?.data?.message || 'Không thể lưu địa chỉ.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const onRemove = async (id) => {
    if (!window.confirm('Xoá địa chỉ này?')) return;
    try {
      await addressApi.remove(id);
      toast.show('Đã xoá địa chỉ.', 'info');
      load();
    } catch (err) {
      toast.show(err.response?.data?.message || 'Không thể xoá.', 'error');
    }
  };

  const setDefault = async (id) => {
    try {
      await addressApi.setDefault(id);
      toast.show('Đã đặt làm mặc định.', 'success');
      load();
    } catch (err) {
      toast.show(err.response?.data?.message || 'Không thể cập nhật.', 'error');
    }
  };

  return (
    <div>
      <div className="card mb-4">
        <div className="addr-head">
          <div>
            <h2 className="page-title">Sổ địa chỉ</h2>
            <p className="page-sub">Quản lý địa chỉ giao hàng của bạn.</p>
          </div>
          {!editing && (
            <button className="btn btn-primary" onClick={openCreate}>
              <Icon name="plus" size={14} /> Thêm địa chỉ
            </button>
          )}
        </div>
      </div>

      {editing && (
        <div className="card mb-4">
          <h3 className="block-title">{editing === 'new' ? 'Địa chỉ mới' : 'Chỉnh sửa địa chỉ'}</h3>
          <form onSubmit={onSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nhãn (VD: Nhà riêng, Văn phòng) *</label>
                <input className="form-control" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                {errors.label && <div className="form-error">{errors.label}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Họ tên người nhận *</label>
                <input className="form-control" value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} />
                {errors.recipientName && <div className="form-error">{errors.recipientName}</div>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Số điện thoại *</label>
                <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Đặt làm mặc định</label>
                <label className="switch">
                  <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
                  <span>Sử dụng địa chỉ này mặc định khi đặt hàng</span>
                </label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Địa chỉ chi tiết *</label>
              <textarea className="form-control" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              {errors.address && <div className="form-error">{errors.address}</div>}
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <><Spinner size={14} /> Đang lưu…</> : 'Lưu địa chỉ'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Huỷ</button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="card text-center"><Spinner size={28} /></div>}

      {!loading && list.length === 0 && !editing && (
        <div className="card">
          <Empty title="Chưa có địa chỉ nào" subtitle="Thêm địa chỉ giao hàng đầu tiên để tiết kiệm thời gian khi thanh toán." />
        </div>
      )}

      <div className="addr-list">
        {list.map((a) => (
          <div className="addr-card" key={a.id}>
            <div className="addr-card-head">
              <strong>{a.label}</strong>
              {a.isDefault && <span className="badge">Mặc định</span>}
            </div>
            <div className="addr-card-body">
              <p>{a.recipientName} <span>·</span> {a.phone}</p>
              <p className="text-soft">{a.address}</p>
            </div>
            <div className="addr-card-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}><Icon name="edit" size={14} /> Sửa</button>
              <button className="btn btn-ghost btn-sm" onClick={() => onRemove(a.id)}><Icon name="trash" size={14} /> Xoá</button>
              {!a.isDefault && (
                <button className="btn btn-secondary btn-sm" onClick={() => setDefault(a.id)}>
                  <Icon name="check" size={14} /> Đặt mặc định
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .addr-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
        .page-title { font-family: var(--font-serif); font-size: 22px; margin: 0; }
        .page-sub { color: var(--color-text-mute); margin: 4px 0 0; }
        .block-title { font-family: var(--font-serif); font-size: 18px; margin-top: 0; }
        .form-actions { display: flex; gap: 10px; margin-top: 8px; }
        .switch { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; padding: 11px 0; }
        .switch input { accent-color: var(--color-primary); width: 18px; height: 18px; }
        .switch span { font-size: 14px; color: var(--color-text-soft); }

        .addr-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .addr-card {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-soft);
          padding: 18px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .addr-card-head { display: flex; align-items: center; gap: 10px; }
        .addr-card-head strong { font-size: 15px; }
        .addr-card-body p { margin: 0; font-size: 14px; }
        .addr-card-body p span { color: var(--color-text-mute); }
        .addr-card-actions { display: flex; gap: 8px; margin-top: auto; padding-top: 8px; border-top: 1px solid var(--color-border-soft); flex-wrap: wrap; }
        @media (max-width: 700px) { .addr-list { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default AddressesPage;
