import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, register, getUserProfile, getGoogleAuthUrl } from '../api';
import { useToast } from './Toast';
import './UserMenu.css';

export default function UserMenu() {
  const { success, logoutSuccess, error: showError } = useToast();
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Helper function to get first letter of name (works with Unicode)
  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

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

  // Listen for open login modal event from other components
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setShowLoginModal(true);
    };
    window.addEventListener('openLoginModal', handleOpenLoginModal);
    return () => window.removeEventListener('openLoginModal', handleOpenLoginModal);
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

        // Nếu là admin thì lưu thêm adminToken và redirect
        if (data.role === 'ADMIN') {
          localStorage.setItem('adminToken', data.accessToken);
          setTimeout(() => {
            window.location.href = '/admin';
          }, 500);
        }

        setIsLoggedIn(true);
        setUser(userData);
        setShowLoginModal(false);
        setLoginForm({ usernameOrEmail: '', password: '' });
        success('Đăng nhập thành công!');
      }
    } catch (error) {
      showError(error.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
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
        success('Đăng ký thành công! Vui lòng đăng nhập.');
    } catch (error) {
      showError(error.message || 'Đăng ký thất bại!');
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
    logoutSuccess('Đăng xuất thành công!');
    navigate('/');
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    
    try {
      const response = await getGoogleAuthUrl();
      const authUrl = response.url;
      
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        authUrl,
        'Google Login',
        `width=${width},height=${height},left=${left},top=${top},popup=yes`
      );

      const messageHandler = async (event) => {
        // Accept messages from both frontend and backend
        if (event.origin !== window.location.origin && event.origin !== 'http://localhost:8080') return;
        
        if (event.data.type === 'GOOGLE_LOGIN_SUCCESS') {
          window.removeEventListener('message', messageHandler);
          if (popup) popup.close();
          
          const data = event.data.data;
          localStorage.setItem('token', data.accessToken);
          const userData = {
            userId: data.userId,
            username: data.username,
            email: data.email,
            fullName: data.fullName,
            imageUrl: data.imageUrl,
            role: data.role
          };
          localStorage.setItem('user', JSON.stringify(userData));
          
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          
          if (data.role === 'ADMIN') {
            localStorage.setItem('adminToken', data.accessToken);
            // Redirect directly to dashboard
            window.location.href = '/admin/dashboard';
            setGoogleLoading(false);
            return;
          }
          
          setIsLoggedIn(true);
          setUser(userData);
          setShowLoginModal(false);
          setGoogleLoading(false);
          success('Đăng nhập Google thành công!');
          
          // Dispatch event to update other components (like CartContext)
          window.dispatchEvent(new Event('userLoggedIn'));
        } else if (event.data.type === 'GOOGLE_LOGIN_ERROR') {
          window.removeEventListener('message', messageHandler);
          if (popup) popup.close();
          showError(event.data.message || 'Đăng nhập Google thất bại!');
          setGoogleLoading(false);
        }
      };

      window.addEventListener('message', messageHandler);

    } catch (err) {
      console.error('Google login error:', err);
      showError('Không thể kết nối với Google. Vui lòng thử lại!');
      setGoogleLoading(false);
    }
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
              ) : user?.imageUrl ? (
                <img src={user.imageUrl} alt="Avatar" className="user-avatar" />
              ) : user?.fullName ? (
                <span className="user-icon-placeholder">
                  {getInitial(user.fullName)}
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
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="dropdown-item admin-link" onClick={() => setShowDropdown(false)}>
                  ⚙️ Quản trị viên
                </Link>
              )}
              <Link to="/don-hang" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                📦 Đơn hàng
              </Link>
              <Link to="/dia-chi" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                📍 Địa chỉ giao hàng
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

              <div className="divider">
                <span>hoặc</span>
              </div>

              <button 
                type="button" 
                className="google-login-btn"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  'Đang kết nối...'
                ) : (
                  <>
                    <svg className="google-icon" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Đăng nhập với Google
                  </>
                )}
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
