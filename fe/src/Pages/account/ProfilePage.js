import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import authApi from '../../api/authApi';
import { Spinner } from '../../components/common/Spinner';

const ProfilePage = () => {
  const { user, updateUserLocal } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    username: user?.username || '',
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const res = await authApi.updateMe(form);
      const data = res?.data || res;
      updateUserLocal(data);
      toast.show('Cập nhật hồ sơ thành công.', 'success');
    } catch (err) {
      const fieldErrors = err.response?.data?.fieldErrors;
      if (fieldErrors) setErrors(fieldErrors);
      toast.show(err.response?.data?.message || 'Không thể cập nhật.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="page-title">Thông tin tài khoản</h2>
      <p className="page-sub">Cập nhật thông tin liên hệ của bạn.</p>

      <form onSubmit={submit} className="mt-4">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tên đăng nhập</label>
            <input className="form-control" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            {errors.username && <div className="form-error">{errors.username}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input className="form-control" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            {errors.fullName && <div className="form-error">{errors.fullName}</div>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            {errors.phone && <div className="form-error">{errors.phone}</div>}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Địa chỉ</label>
          <input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          {errors.address && <div className="form-error">{errors.address}</div>}
        </div>
        <button type="submit" className="btn btn-primary mt-3" disabled={submitting}>
          {submitting ? <><Spinner size={14} /> Đang lưu…</> : 'Lưu thay đổi'}
        </button>
      </form>
      <style>{`
        .page-title { font-family: var(--font-serif); font-size: 22px; margin: 0 0 4px; }
        .page-sub { color: var(--color-text-mute); margin: 0; }
      `}</style>
    </div>
  );
};

export default ProfilePage;
