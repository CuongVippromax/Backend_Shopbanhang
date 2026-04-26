import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ChangePasswordPage.css';
import UserMenu from '../Components/UserMenu';
import { useCart } from '../context/CartContext';
import { changePassword } from '../api';

export default function ChangePasswordPage() {
  const { cartCount } = useCart();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (form.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      await changePassword(form);
      setSuccess('Đổi mật khẩu thành công!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Đổi mật khẩu thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      {/* Main Header */}
      <header className="main-header">
        <div className="container header-inner">
          <div className="logo-area">
            <Link to="/" style={{display: 'flex', alignItems: 'center', textDecoration: 'none'}}>
              <img src="/image/logo-hoang-kim.jpg" alt="Logo Hoàng Kim" className="logo-img" style={{height: '70px', objectFit: 'contain'}} />
            </Link>
          </div>
          <div className="search-area">
            <input type="text" placeholder="Bạn muốn mua gì?" />
            <button className="search-btn">🔍</button>
          </div>
          <div className="cart-area">
            <Link to="/gio-hang" style={{display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', color: 'inherit', marginRight: '15px', paddingRight: '15px', borderRight: '1px solid #ddd'}}>
              <div className="cart-text">Giỏ hàng / <span className="cart-price">0 ₫</span></div>
              <div className="cart-icon">
                <span className="cart-count">{cartCount}</span>
                🛒
              </div>
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="main-nav" style={{marginBottom: '30px'}}>
        <div className="container nav-inner">
          <div className="categories-menu" style={{background: 'var(--primary-orange)', padding: '15px 20px', color: 'white', fontWeight: 'bold', width: '220px', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span>☰</span> Danh mục sản phẩm
          </div>
          <ul className="nav-links">
            <li><Link to="/" style={{color: 'inherit', textDecoration: 'none'}}>Trang chủ</Link></li>
            <li><Link to="/cua-hang" style={{color: 'inherit', textDecoration: 'none'}}>Cửa hàng</Link></li>
            <li><Link to="/tin-tuc" style={{color: 'inherit', textDecoration: 'none'}}>Tin tức</Link></li>
            <li><Link to="/gioi-thieu" style={{color: 'inherit', textDecoration: 'none'}}>Giới thiệu</Link></li>
            <li><Link to="/lien-he" style={{color: 'inherit', textDecoration: 'none'}}>Liên hệ</Link></li>
          </ul>
        </div>
      </nav>

      {/* Change Password Content */}
      <main className="container password-content">
        <h2>🔒 Đổi Mật Khẩu</h2>

        {success && <div className="success-msg">{success}</div>}
        {error && <div className="error-msg">{error}</div>}

        <form className="password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mật khẩu hiện tại</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({...form, currentPassword: e.target.value})}
              placeholder="Nhập mật khẩu hiện tại..."
              required
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({...form, newPassword: e.target.value})}
              placeholder="Nhập mật khẩu mới..."
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
              placeholder="Nhập lại mật khẩu mới..."
              required
            />
          </div>
          <button type="submit" className="btn-change" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'ĐỔI MẬT KHẨU'}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="main-footer" style={{marginTop: '50px'}}>
        <div className="container footer-grid">
          <div className="footer-col">
            <h3 className="footer-logo">Nhà Sách Hoàng Kim</h3>
            <p>📧 nhasachhaian@gmail.com</p>
          </div>
          <div className="footer-col">
            <h4>Hỗ Trợ</h4>
            <ul>
              <li><Link to="/chinh-sach-doi-tra" style={{color: 'inherit', textDecoration: 'none'}}>Chính sách đổi trả sản phẩm</Link></li>
              <li><Link to="/quy-dinh-bao-hanh" style={{color: 'inherit', textDecoration: 'none'}}>Quy định bảo hành</Link></li>
              <li><Link to="/giao-nhan-va-thanh-toan" style={{color: 'inherit', textDecoration: 'none'}}>Giao nhận và thanh toán</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Hotline Hỗ Trợ</h4>
            <p>1900 1234</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
