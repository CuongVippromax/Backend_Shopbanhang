import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, register, getUserProfile } from '../api';
import './UserMenu.css';

export default function UserMenu() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ usernameOrEmail: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Get stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch (e) {
        setIsLoggedIn(true);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // eslint-disable-next-line no-unused-vars
  const loadUserProfile = async () => {
    try {
      const data = await getUserProfile();
      // Backend trả về DataResponse với format: { statusCode, message, data: {...} }
      const userData = data?.data || data;
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(loginForm);
      // Backend trả về LoginResponse với format: { accessToken, refreshToken, userId, username, email, fullName, ... }
      // Interceptor trả về response.data nên data là LoginResponse object
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        // Lưu user info từ response
        const userData = {
          userId: data.userId,
          username: data.username,
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          role: data.role
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoggedIn(true);
        setUser(userData);
        setShowLoginModal(false);
        setLoginForm({ usernameOrEmail: '', password: '' });
      }
    } catch (error) {
      setError(error.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = registerForm;
      // Backend trả về DataResponse
      await register(registerData);
      setShowRegisterModal(false);
      setShowLoginModal(true);
      setRegisterForm({ username: '', email: '', password: '', confirmPassword: '', fullName: '', phone: '' });
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
    } catch (error) {
      setError(error.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <div className="user-menu" ref={dropdownRef}>
      {isLoggedIn ? (
        <div className="user-menu__loggedin">
          <button 
            className="user-menu__btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className={`user-icon ${user ? 'logged-in' : ''}`}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="user-avatar" />
              ) : user?.fullName ? (
                <span className="user-icon-placeholder">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <span>👤</span>
              )}
            </span>
            <span className="user-name">{user?.fullName || user?.username || 'Tài khoản'}</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {showDropdown && (
            <div className="user-menu__dropdown">
              <div className="dropdown-header">
                <span className="dropdown-user-name">{user?.fullName || 'Khách hàng'}</span>
                <span className="dropdown-user-email">{user?.email}</span>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/tai-khoan" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                👤 Tài khoản của tôi
              </Link>
              <Link to="/don-hang" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                📦 Đơn hàng
              </Link>
              <Link to="/doi-mat-khau" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                🔒 Đổi mật khẩu
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={logoutUser}>
                🚪 Đăng xuất
              </button>
            </div>
          )}
        </div>
      ) : (
        <button 
          className="user-menu__btn-login"
          onClick={() => setShowLoginModal(true)}
          title="Đăng nhập / Đăng ký"
        >
          <span className="user-icon">
            <span>👤</span>
          </span>
        </button>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Đăng nhập</h2>
              <button className="modal__close" onClick={() => setShowLoginModal(false)}>×</button>
            </div>
            <form onSubmit={handleLogin} className="modal__body">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label>Tên đăng nhập hoặc Email</label>
                <input
                  type="text"
                  value={loginForm.usernameOrEmail}
                  onChange={(e) => setLoginForm({...loginForm, usernameOrEmail: e.target.value})}
                  placeholder="Nhập tên đăng nhập hoặc email..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  placeholder="Nhập mật khẩu..."
                  required
                />
              </div>

              <div className="form-actions">
                <span className="form-hint">Chưa có tài khoản? </span>
                <button type="button" className="btn-text" onClick={() => {
                  setShowLoginModal(false);
                  setShowRegisterModal(true);
                }}>
                  Đăng ký ngay
                </button>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Đăng ký tài khoản</h2>
              <button className="modal__close" onClick={() => setShowRegisterModal(false)}>×</button>
            </div>
            <form onSubmit={handleRegister} className="modal__body">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-row">
                <div className="form-group">
                  <label>Tên đăng nhập</label>
                  <input
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                    placeholder="Nhập tên đăng nhập..."
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                    placeholder="Nhập họ và tên..."
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  placeholder="Nhập email..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                  placeholder="Nhập số điện thoại..."
                />
              </div>
              
              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  placeholder="Nhập mật khẩu..."
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                  placeholder="Nhập lại mật khẩu..."
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-text" onClick={() => {
                  setShowRegisterModal(false);
                  setShowLoginModal(true);
                }}>
                  Đã có tài khoản? Đăng nhập
                </button>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
