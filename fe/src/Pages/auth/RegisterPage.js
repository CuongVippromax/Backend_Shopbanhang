import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { Icon } from '../../components/common/Icon';
import { Spinner } from '../../components/common/Spinner';
import authApi from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username.trim() || form.username.length < 3) e.username = 'Tên đăng nhập tối thiểu 3 ký tự';
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ tên';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ';
    if (form.password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Mật khẩu nhập lại không khớp';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await authApi.register({
        username: form.username.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone,
        address: form.address,
        password: form.password,
      });
      toast.show('Tạo tài khoản thành công!', 'success');
      try {
        await login(form.username.trim(), form.password);
        navigate('/', { replace: true });
      } catch {
        navigate('/auth/login');
      }
    } catch (err) {
      const fieldErrors = err.response?.data?.fieldErrors;
      if (fieldErrors) setErrors(fieldErrors);
      toast.show(err.response?.data?.message || 'Không thể tạo tài khoản.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Gia nhập cộng đồng yêu sách Hoàng Kim — miễn phí và chỉ mất 1 phút."
      footer={<>Đã có tài khoản? <Link to="/auth/login">Đăng nhập</Link></>}
    >
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tên đăng nhập *</label>
            <input className="form-control" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" />
            {errors.username && <div className="form-error">{errors.username}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Họ và tên *</label>
            <input className="form-control" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} autoComplete="name" />
            {errors.fullName && <div className="form-error">{errors.fullName}</div>}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
          </div>
          <div className="form-group">
            <label className="form-label">Địa chỉ</label>
            <input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} autoComplete="street-address" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Mật khẩu *</label>
            <div className="pwd-input">
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-control"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)} aria-label="Hiện mật khẩu">
                <Icon name={showPwd ? 'eyeOff' : 'eye'} size={18} />
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Nhập lại mật khẩu *</label>
            <input
              type={showPwd ? 'text' : 'password'}
              className="form-control"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-block btn-lg mt-3" disabled={submitting}>
          {submitting ? <><Spinner size={14} /> Đang tạo…</> : 'Tạo tài khoản'}
        </button>
      </form>
      <style>{`
        .pwd-input { position: relative; }
        .pwd-input input { padding-right: 44px; }
        .pwd-input button {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          width: 34px; height: 34px;
          display: inline-flex; align-items: center; justify-content: center;
          color: var(--color-text-mute);
          border-radius: 6px;
        }
        .pwd-input button:hover { background: var(--color-bg-alt); color: var(--color-text); }
      `}</style>
    </AuthLayout>
  );
};

export default RegisterPage;
