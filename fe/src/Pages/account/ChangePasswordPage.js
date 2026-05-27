import React, { useState } from 'react';
import authApi from '../../api/authApi';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

const ChangePasswordPage = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Nhập mật khẩu hiện tại';
    if (form.newPassword.length < 6) errs.newPassword = 'Mật khẩu mới tối thiểu 6 ký tự';
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Nhập lại không khớp';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      await authApi.changePassword(form);
      toast.show('Đổi mật khẩu thành công.', 'success');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const fieldErrors = err.response?.data?.fieldErrors;
      if (fieldErrors) setErrors(fieldErrors);
      toast.show(err.response?.data?.message || 'Không thể đổi mật khẩu.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="page-title">Đổi mật khẩu</h2>
      <p className="page-sub">Để bảo mật, hãy đặt mật khẩu mạnh và không chia sẻ với người khác.</p>
      <form onSubmit={submit} className="mt-4" style={{ maxWidth: 520 }}>
        <div className="form-group">
          <label className="form-label">Mật khẩu hiện tại</label>
          <input type="password" className="form-control"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
          {errors.currentPassword && <div className="form-error">{errors.currentPassword}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Mật khẩu mới</label>
          <input type="password" className="form-control"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
          {errors.newPassword && <div className="form-error">{errors.newPassword}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Nhập lại mật khẩu mới</label>
          <input type="password" className="form-control"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
        </div>
        <button type="submit" className="btn btn-primary mt-3" disabled={submitting}>
          {submitting ? <><Spinner size={14} /> Đang xử lý…</> : 'Cập nhật mật khẩu'}
        </button>
      </form>
      <style>{`
        .page-title { font-family: var(--font-serif); font-size: 22px; margin: 0 0 4px; }
        .page-sub { color: var(--color-text-mute); margin: 0; }
      `}</style>
    </div>
  );
};

export default ChangePasswordPage;
