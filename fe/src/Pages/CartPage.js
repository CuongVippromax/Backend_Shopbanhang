import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImgAsset from '../public';
import './CartPage.css';
import UserMenu from '../Components/UserMenu';
import { useCart } from '../context/CartContext';
import { getCart, updateCartItem, removeCartItem } from '../api';

export default function CartPage() {
  const { cartCount, refresh } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const data = await getCart();
      // Backend trả về CartResponse với format: { cartId, userId, items: [...], totalItems, totalPrice }
      // Interceptor trả về response.data nên data chính là CartResponse
      const items = data?.items || [];
      setCartItems(items);
      // Also refresh the global cart context
      await refresh();
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(bookId, newQuantity);
      loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (bookId) => {
    try {
      await removeCartItem(bookId);
      setNotification('Đã xóa sản phẩm khỏi giỏ hàng.');
      loadCart();
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="cart-page">
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

      {/* Cart Content */}
      <main className="container cart-content-area">
        {notification && (
          <div className="cart-notification">
            <span>✔️</span> {notification}
          </div>
        )}

        {loading ? (
          <p>Đang tải giỏ hàng...</p>
        ) : cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Giỏ hàng trống</p>
            <Link to="/cua-hang" className="btn-continue">← TIẾP TỤC MUA SẮM</Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Left Column: Cart Table */}
            <div className="cart-left">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th className="th-product" colSpan={3}>SẢN PHẨM</th>
                    <th className="th-price">GIÁ</th>
                    <th className="th-quantity">SỐ LƯỢNG</th>
                    <th className="th-subtotal">TẠM TÍNH</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.cartItemId || item.bookId}>
                      <td className="td-remove">
                        <button className="btn-remove-item" onClick={() => handleRemoveItem(item.bookId)}>×</button>
                      </td>
                      <td className="td-image">
                        <img src={item.image || ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentwoocommerce_thumbnailsizewoocommerce_thumbnail} alt={item.bookName} />
                      </td>
                      <td className="td-name">
                        {item.bookName}
                      </td>
                      <td className="td-price">{formatPrice(item.price)}</td>
                      <td className="td-quantity">
                        <div className="qty-control">
                          <button className="btn-qty" onClick={() => handleUpdateQuantity(item.bookId, item.quantity - 1)}>-</button>
                          <input type="text" value={item.quantity} readOnly className="input-qty" />
                          <button className="btn-qty" onClick={() => handleUpdateQuantity(item.bookId, item.quantity + 1)}>+</button>
                        </div>
                      </td>
                      <td className="td-subtotal">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="cart-actions">
                <Link to="/cua-hang" className="btn-continue">← TIẾP TỤC XEM SẢN PHẨM</Link>
              </div>
            </div>

            {/* Right Column: Cart Totals */}
            <div className="cart-right">
              <div className="cart-totals-box">
                <h3 className="totals-title">TỔNG CỘNG GIỎ HÀNG</h3>
                <table className="totals-table">
                  <tbody>
                    <tr>
                      <th>Tạm tính</th>
                      <td>{formatPrice(subtotal)}</td>
                    </tr>
                    <tr>
                      <th>Phí vận chuyển</th>
                      <td>{subtotal >= 200000 ? 'Miễn phí' : 'Theo đơn hàng'}</td>
                    </tr>
                    <tr className="totals-final-row">
                      <th>Tổng</th>
                      <td><strong>{formatPrice(subtotal)}</strong></td>
                    </tr>
                  </tbody>
                </table>
                <button className="btn-checkout" onClick={() => navigate('/thanh-toan')}>TIẾN HÀNH THANH TOÁN</button>
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
            <h4>Danh Mục</h4>
            <ul>
              <li>Sách thiếu nhi</li>
              <li>Sách kỹ năng</li>
              <li>Sách tiếng anh</li>
              <li>Sách khởi nghiệp</li>
              <li>Sách nuôi dạy con</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Hotline Hỗ Trợ</h4>
            <p style={{marginBottom: '5px', fontSize: '13px', color: '#000'}}>Phương thức thanh toán</p>
            <div className="payment-icons" style={{display: 'flex', gap: '10px', fontSize: '24px', letterSpacing: '0'}}>
               💳 🏦 💵
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
