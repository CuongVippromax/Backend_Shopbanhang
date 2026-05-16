import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AccountPage.css';
import UserMenu from '../Components/UserMenu';
import { useCart } from '../context/CartContext';
import { useToast } from '../Components/Toast';
import { getUserProfile, updateUserProfile, getAddresses } from '../api';

export default function AccountPage() {
  const { cartCount } = useCart();
  const { updateSuccess } = useToast();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: ''
  });
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileData, addressesData] = await Promise.all([
        getUserProfile(),
        getAddresses()
      ]);
      const user = profileData?.data || profileData;
      const addresses = addressesData?.data || addressesData || [];
      
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
        username: user.username || ''
      });

      // Find default address
      const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0] || null;
      setDefaultAddress(defaultAddr);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Không thể tải thông tin tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị lỗi khi có
  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(form);
      updateSuccess('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert(err.message || 'Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-page">
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

      {/* Account Content */}
      <main className="container account-content">
        <h2>👤 Tài Khoản Của Tôi</h2>

        {loading ? (
          <p>Đang tải thông tin...</p>
        ) : (
          <>
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên đăng nhập</label>
                <input type="text" value={form.username} disabled />
              </div>
              <div className="form-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({...form, fullName: e.target.value})}
                  placeholder="Nhập họ và tên..."
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  placeholder="Nhập email..."
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  placeholder="Nhập số điện thoại..."
                />
              </div>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? 'Đang lưu...' : 'CẬP NHẬT THÔNG TIN'}
              </button>
            </form>

            <div className="address-section">
              <h3>📍 Địa chỉ giao hàng mặc định</h3>
              {defaultAddress ? (
                <div className="default-address-display">
                  <div className="address-detail-row">
                    <span className="label">Người nhận:</span>
                    <span className="value">{defaultAddress.recipientName} - {defaultAddress.phone}</span>
                  </div>
                  <div className="address-detail-row">
                    <span className="label">Địa chỉ:</span>
                    <span className="value">{defaultAddress.address}</span>
                  </div>
                  <div className="address-detail-row">
                    <span className="label">Loại:</span>
                    <span className="value">{defaultAddress.label}</span>
                  </div>
                  <Link to="/dia-chi" className="btn-manage-address">Quản lý địa chỉ</Link>
                </div>
              ) : (
                <div className="no-default-address">
                  <p>Chưa có địa chỉ mặc định.</p>
                  <Link to="/dia-chi" className="btn-add-address">+ Thêm địa chỉ</Link>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="main-footer" style={{marginTop: '50px'}}>
        <div className="container footer-grid">
          <div className="footer-col">
            <h3 className="footer-logo">Nhà Sách Hoàng Kim</h3>
            <p>📧 Nhà Sách Hoàng Kim</p>
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
