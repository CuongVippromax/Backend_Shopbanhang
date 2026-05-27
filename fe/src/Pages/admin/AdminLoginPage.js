import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';
import { Spinner } from '../../components/common/Spinner';
import { tokenStorage } from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axiosClient from '../../api/axiosClient';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axiosClient.post('/api/v1/auth/admin/login', {
        usernameOrEmail: form.usernameOrEmail.trim(),
        password: form.password,
      }).then((r) => r.data);
      tokenStorage.set(res.accessToken, res.refreshToken);
      const profile = {
        userId: res.userId, username: res.username, email: res.email,
        fullName: res.fullName, role: res.role,
      };
      tokenStorage.setUser(profile);
      await refreshProfile();
      toast.show('Đăng nhập quản trị thành công.', 'success');
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.show(err.response?.data?.message || 'Đăng nhập thất bại.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adm-login">
      <div className="adm-card">
        <div className="adm-brand">
          <span className="adm-brand-mark"><Icon name="shield" size={24} /></span>
          <div>
            <strong>Hoàng Kim Books</strong>
            <small>Trang đăng nhập quản trị</small>
          </div>
        </div>
        <h1>Đăng nhập quản trị</h1>
        <p>Khu vực dành cho quản trị viên hệ thống. Vui lòng đăng nhập bằng tài khoản được cấp.</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Tên đăng nhập hoặc Email</label>
            <input className="form-control" value={form.usernameOrEmail} onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input type="password" className="form-control" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {submitting ? <><Spinner size={14} /> Đang đăng nhập…</> : 'Đăng nhập'}
          </button>
        </form>
      </div>
      <style>{`
        .adm-login {
          min-height: 100vh;
          background: linear-gradient(135deg, #34504b, #2c3a33);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .adm-card {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: 40px 36px;
          width: 100%; max-width: 440px;
          box-shadow: var(--shadow-lg);
        }
        .adm-brand { display: flex; gap: 12px; align-items: center; margin-bottom: 24px; }
        .adm-brand-mark {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: var(--color-accent);
          color: #2c2410;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .adm-brand strong { display: block; font-family: var(--font-serif); }
        .adm-brand small { color: var(--color-text-mute); font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; }
        .adm-card h1 { font-family: var(--font-serif); font-size: 26px; margin: 0 0 6px; }
        .adm-card > p { color: var(--color-text-mute); margin: 0 0 20px; }
      `}</style>
    </div>
  );
};

export default AdminLoginPage;
