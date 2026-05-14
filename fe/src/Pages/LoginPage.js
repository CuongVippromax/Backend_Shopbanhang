import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { login } from '../api';
import { useToast } from '../Components/Toast';
import './LoginPage.css';

export default function LoginPage() {
  const location = useLocation();
  const { success, error: showError } = useToast();
  const [form, setForm] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.usernameOrEmail || !form.password) {
      showError('Vui lòng nhập tên đăng nhập và mật khẩu!');
      return;
    }

    setLoading(true);

    try {
      const response = await login(form);
      const data = response?.data || response;
      
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify({
          userId: data.userId,
          username: data.username,
          email: data.email,
          fullName: data.fullName,
          role: data.role
        }));

        // Nếu là admin thì lưu thêm adminToken
        if (data.role === 'ADMIN') {
          localStorage.setItem('adminToken', data.accessToken);
        }

        // Hiển thị thông báo thành công
        success('Đăng nhập thành công!');

        // Check if user is admin, redirect to admin page
        setTimeout(() => {
          if (data.role === 'ADMIN') {
            window.location.href = '/admin';
          } else {
            window.location.href = from === '/' ? '/' : from;
          }
        }, 1500);
      } else {
        showError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Login error:', err);
      showError(err.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <Link to="/" className="login-logo">
              <img src="/image/logo-hoang-kim.jpg" alt="Logo Hoàng Kim" />
            </Link>
            <h1>Đăng Nhập</h1>
            <p>Chào mừng bạn quay trở lại Nhà sách Hoàng Kim</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="usernameOrEmail">Tên đăng nhập hoặc Email</label>
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={form.usernameOrEmail}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập hoặc email"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <Link to="/quen-mat-khau" className="forgot-password">Quên mật khẩu?</Link>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>

          <div className="login-footer">
            <p>Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
