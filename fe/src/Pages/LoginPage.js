import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../api';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.usernameOrEmail || !form.password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu!');
      return;
    }

    setLoading(true);
    setError('');

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
        
        // Check if user is admin, redirect to admin page
        if (data.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
        window.location.reload();
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
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
            {error && <div className="error-message">{error}</div>}
            
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
