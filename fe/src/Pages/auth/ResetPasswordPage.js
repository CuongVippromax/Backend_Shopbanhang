import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { Spinner } from '../../components/common/Spinner';
import authApi from '../../api/authApi';
import { useToast } from '../../context/ToastContext';

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const token = params.get('token') || '';
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.password.length < 6) errs.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (form.password !== form.confirm) errs.confirm = 'Mật khẩu nhập lại không khớp';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, form.password);
      toast.show('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', 'success');
      navigate('/auth/login');
    } catch (err) {
      toast.show(err.response?.data?.message || 'Đặt lại mật khẩu thất bại. Link có thể đã hết hạn.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Liên kết không hợp lệ" subtitle="Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.">
        <Link to="/auth/forgot-password" className="btn btn-primary btn-block">Gửi lại yêu cầu</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Đặt lại mật khẩu" subtitle="Tạo mật khẩu mới cho tài khoản của bạn.">
      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Mật khẩu mới</label>
          <input
            type="password"
            className="form-control"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Nhập lại mật khẩu</label>
          <input
            type="password"
            className="form-control"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
          {errors.confirm && <div className="form-error">{errors.confirm}</div>}
        </div>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? <><Spinner size={14} /> Đang xử lý…</> : 'Đặt lại mật khẩu'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
