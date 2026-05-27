import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { Spinner } from '../../components/common/Spinner';
import authApi from '../../api/authApi';
import { useToast } from '../../context/ToastContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      setDone(true);
      toast.show('Đã gửi hướng dẫn đặt lại mật khẩu vào email của bạn.', 'success');
    } catch (err) {
      toast.show(err.response?.data?.message || 'Không thể gửi yêu cầu.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email tài khoản — chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu."
      footer={<>Nhớ lại mật khẩu? <Link to="/auth/login">Đăng nhập</Link></>}
    >
      {done ? (
        <div className="forgot-done">
          <p>Đã gửi email hướng dẫn đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến (và mục Spam).</p>
          <Link to="/auth/login" className="btn btn-primary btn-block mt-3">Quay lại đăng nhập</Link>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email tài khoản</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {submitting ? <><Spinner size={14} /> Đang gửi…</> : 'Gửi yêu cầu'}
          </button>
        </form>
      )}
      <style>{`.forgot-done p { color: var(--color-text-soft); }`}</style>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
