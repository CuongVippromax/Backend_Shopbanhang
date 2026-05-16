import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImgAsset from '../public';
import './CheckoutPage.css';
import UserMenu from '../Components/UserMenu';
import AddressManager from '../Components/AddressManager';
import { useCart } from '../context/CartContext';
import { useToast } from '../Components/Toast';
import { getCart, createOrder, getUserProfile, getAddresses } from '../api';

export default function CheckoutPage() {
  const { cartCount, clearAll } = useCart();
  const { success, error } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    shippingAddress: '',
    paymentMethod: 'COD',
    note: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cartData, profileData, addressesData] = await Promise.all([
        getCart(),
        getUserProfile(),
        getAddresses()
      ]);
      
      // Backend trả CartResponse trực tiếp (không wrapped trong DataResponse)
      // CartResponse có format: { cartId, userId, items: [...], totalItems, totalPrice }
      const items = cartData?.items || [];
      console.log('CheckoutPage - Cart data loaded:', items.length, 'items');
      setCartItems(items);

      // Backend trả DataResponse<UserResponse>, interceptor trả response.data → profileData là DataResponse
      const user = profileData?.data || profileData || {};
      const addresses = addressesData?.data || addressesData || [];
      
      // Tìm địa chỉ mặc định hoặc địa chỉ đầu tiên
      const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0];
      
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
        setForm(prev => ({
          ...prev,
          fullName: defaultAddr.recipientName || user.fullName || '',
          phone: defaultAddr.phone || user.phone || user.phoneNumber || '',
          email: user.email || '',
          shippingAddress: defaultAddr.address || ''
        }));
      } else {
        // Không có địa chỉ, chỉ pre-fill từ user profile
        setForm(prev => ({
          ...prev,
          fullName: user.fullName || '',
          phone: user.phone || user.phoneNumber || '',
          email: user.email || '',
          shippingAddress: ''
        }));
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);
    setForm(prev => ({
      ...prev,
      fullName: addr.recipientName,
      phone: addr.phone,
      shippingAddress: addr.address
    }));
    setShowAddressPicker(false);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);

    try {
      const orderData = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        shippingAddress: form.shippingAddress,
        paymentMethod: form.paymentMethod,
        note: form.note
      };

      const result = await createOrder(orderData);
      const order = result;

      // Nếu chọn VNPay, gọi API để lấy payment URL và chuyển hướng
      if (form.paymentMethod === 'VNPAY' && order?.orderId) {
        try {
          const paymentResponse = await fetch(
            `http://localhost:8080/api/v1/payment/vn-pay?amount=${subtotal}&orderId=${order.orderId}`
          );
          const paymentData = await paymentResponse.json();
          
          if (paymentData.data?.paymentUrl) {
            window.location.href = paymentData.data.paymentUrl;
          } else {
            throw new Error('Không nhận được URL thanh toán từ VNPay');
          }
        } catch (paymentError) {
          error('Không thể kết nối thanh toán VNPay. Vui lòng thử lại!');
          setPlacing(false);
          return;
        }
        return;
      }

      // COD: hiển thị toast thành công và chuyển đến trang chi tiết đơn hàng
      const orderId = order?.orderId;
      success(`Đặt hàng thành công! Mã đơn: #${orderId}`);
      
      // Xóa giỏ hàng sau khi đặt thành công
      clearAll();
      
      // Chuyển đến trang chi tiết đơn hàng sau 2s
      setTimeout(() => {
        navigate(`/don-hang/${orderId}`);
      }, 2000);
    } catch (err) {
      error(err.message || 'Đặt hàng thất bại!');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="checkout-page">
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
              <div className="cart-text">Giỏ hàng / <span className="cart-price">{formatPrice(subtotal)}</span></div>
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

      {/* Checkout Content */}
      <main className="container checkout-content">
        <h2>💳 Thanh Toán</h2>

        {loading ? (
          <p>Đang tải...</p>
        ) : cartItems.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px'}}>
            <p>Giỏ hàng trống</p>
            <Link to="/cua-hang" style={{color: 'var(--primary-orange)', fontWeight: '600'}}>← Quay lại mua sắm</Link>
          </div>
        ) : (
          <form className="checkout-layout" onSubmit={handlePlaceOrder}>
            {/* Left: Checkout Form */}
            <div className="checkout-form">
              <div className="form-group">
                <label>Họ và tên <span className="required">*</span></label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({...form, fullName: e.target.value})}
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại <span className="required">*</span></label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  placeholder="Nhập số điện thoại..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  placeholder="Nhập email..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ giao hàng <span className="required">*</span></label>
                <div className="address-input-group">
                  <input
                    type="text"
                    value={form.shippingAddress}
                    onChange={(e) => setForm({...form, shippingAddress: e.target.value})}
                    placeholder="Nhập địa chỉ giao hàng..."
                    required
                  />
                  <button
                    type="button"
                    className="btn-select-address"
                    onClick={() => setShowAddressPicker(true)}
                  >
                    Chọn địa chỉ
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({...form, note: e.target.value})}
                  placeholder="Ghi chú cho đơn hàng (tùy chọn)..."
                />
              </div>

              <div className="form-group">
                <label>Phương thức thanh toán <span className="required">*</span></label>
                <div className="payment-methods">
                  <div
                    className={`payment-option ${form.paymentMethod === 'COD' ? 'selected' : ''}`}
                    onClick={() => setForm({...form, paymentMethod: 'COD'})}
                  >
                    <input type="radio" name="payment" checked={form.paymentMethod === 'COD'} readOnly />
                    <label>💵 Thanh toán khi nhận hàng (COD)</label>
                  </div>
                  <div
                    className={`payment-option ${form.paymentMethod === 'VNPAY' ? 'selected' : ''}`}
                    onClick={() => setForm({...form, paymentMethod: 'VNPAY'})}
                  >
                    <input type="radio" name="payment" checked={form.paymentMethod === 'VNPAY'} readOnly />
                    <label>🏦 Thanh toán qua VNPay</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="order-summary">
              <h3>Đơn hàng của bạn</h3>

              {cartItems.map((item, idx) => (
                <div className="summary-item" key={item.cartItemId || idx}>
                  <img
                    src={item.image || ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentwoocommerce_thumbnailsizewoocommerce_thumbnail}
                    alt={item.bookName}
                  />
                  <div className="summary-item-info">
                    <div className="summary-item-name">{item.bookName}</div>
                    <div className="summary-item-qty">x{item.quantity}</div>
                  </div>
                  <div className="summary-item-price">{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <span>{subtotal >= 200000 ? 'Miễn phí' : '30.000 ₫'}</span>
                </div>
                <div className="summary-row total">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(subtotal >= 200000 ? subtotal : subtotal + 30000)}</span>
                </div>
              </div>

              <button type="submit" className="btn-place-order" disabled={placing}>
                {placing ? 'Đang xử lý...' : 'ĐẶT HÀNG'}
              </button>
            </div>
          </form>
        )}

        {/* Address Picker Modal */}
        {showAddressPicker && (
          <div className="modal-overlay" onClick={() => setShowAddressPicker(false)}>
            <div className="modal address-picker-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal__header">
                <h2>Chọn địa chỉ giao hàng</h2>
                <button className="modal__close" onClick={() => setShowAddressPicker(false)}>×</button>
              </div>
              <div className="modal__body">
                <AddressManager
                  selectionMode={true}
                  onSelectAddress={handleSelectAddress}
                />
              </div>
            </div>
          </div>
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
