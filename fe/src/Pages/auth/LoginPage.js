import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { Icon } from '../../components/common/Icon';
import { Spinner } from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import authApi from '../../api/authApi';

const LoginPage = () => {
  const { login, loginWithOAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    const handler = (event) => {
      if (!event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'GOOGLE_LOGIN_SUCCESS' && event.data.data) {
        const user = loginWithOAuth(event.data.data);
        toast.show(`Xin chào, ${user.fullName || user.username}!`, 'success');
        navigate(user.role === 'ADMIN' && from === '/' ? '/admin' : from, { replace: true });
      } else if (event.data.type === 'GOOGLE_LOGIN_ERROR') {
        toast.show(event.data.message || 'Đăng nhập Google thất bại.', 'error');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [loginWithOAuth, navigate, toast, from]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.usernameOrEmail.trim() || !form.password) {
      toast.show('Vui lòng nhập đầy đủ thông tin.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const user = await login(form.usernameOrEmail.trim(), form.password);
      toast.show(`Xin chào, ${user.fullName || user.username}!`, 'success');
      navigate(user.role === 'ADMIN' && from === '/' ? '/admin' : from, { replace: true });
    } catch (err) {
      toast.show(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogle = async () => {
    try {
      const { url } = await authApi.googleAuthUrl();
      if (!url) throw new Error('Missing URL');
      const w = 480, h = 600;
      const left = window.screenX + (window.outerWidth - w) / 2;
      const top = window.screenY + (window.outerHeight - h) / 2;
      window.open(url, 'google-oauth', `width=${w},height=${h},left=${left},top=${top}`);
    } catch (_) {
      toast.show('Không thể kết nối Google đăng nhập.', 'error');
    }
  };

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục mua sắm tại Hoàng Kim Books."
      footer={<>Chưa có tài khoản? <Link to="/auth/register">Đăng ký ngay</Link></>}
    >
      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Tên đăng nhập hoặc Email</label>
          <input
            className="form-control"
            value={form.usernameOrEmail}
            onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })}
            autoComplete="username"
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">Mật khẩu</label>
          <div className="pwd-input">
            <input
              type={showPwd ? 'text' : 'password'}
              className="form-control"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPwd((v) => !v)} aria-label="Hiện mật khẩu">
              <Icon name={showPwd ? 'eyeOff' : 'eye'} size={18} />
            </button>
          </div>
        </div>
        <div className="auth-row">
          <Link to="/auth/forgot-password" className="auth-forgot">Quên mật khẩu?</Link>
        </div>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? <><Spinner size={14} /> Đang đăng nhập…</> : 'Đăng nhập'}
        </button>

        <div className="auth-divider"><span>hoặc</span></div>

        <button type="button" className="btn btn-secondary btn-block" onClick={onGoogle}>
          <Icon name="google" size={18} /> Tiếp tục với Google
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
        .auth-row { display: flex; justify-content: flex-end; margin: -10px 0 14px; }
        .auth-forgot { font-size: 13px; font-weight: 600; }
        .auth-divider {
          text-align: center;
          margin: 18px 0;
          color: var(--color-text-mute);
          font-size: 12px;
          position: relative;
        }
        .auth-divider::before {
          content: '';
          position: absolute; top: 50%; left: 0; right: 0;
          height: 1px; background: var(--color-border-soft);
        }
        .auth-divider span { background: var(--color-surface); padding: 0 12px; position: relative; }
      `}</style>
    </AuthLayout>
  );
};

export default LoginPage;
