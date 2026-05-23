import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImgAsset from '../public';
import './CartPage.css';
import MainHeader from '../Components/MainHeader';
import { getCart, updateCartItem, removeCartItem, getCategories } from '../api';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
    getCategories().then(data => {
      if (data && data.content) {
        setCategories(data.content);
      } else if (Array.isArray(data)) {
        setCategories(data);
      }
    }).catch(err => console.error('Error fetching categories:', err));

    // Listen for cart updates from other pages
    const handleCartUpdate = () => {
      loadCart();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCart = () => {
    setLoading(true);
    getCart()
      .then(data => {
        const items = data?.items || [];
        setCartItems(items);
      })
      .catch(error => {
        console.error('Error loading cart:', error);
        setCartItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
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
      <MainHeader />

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
          <div className="empty-cart" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px',
              opacity: 0.5
            }}>
              🛒
            </div>
            <h2 style={{
              fontSize: '24px',
              color: '#666',
              marginBottom: '30px',
              fontWeight: '500'
            }}>
              Giỏ hàng trống
            </h2>
            <Link to="/cua-hang" style={{
              padding: '12px 40px',
              background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '25px',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}>
              Tiếp tục mua hàng
            </Link>
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
            <p>📧 nhasachhoangkim@gmail.com</p>
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
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.categoryId}><Link to={`/cua-hang?categoryId=${cat.categoryId}`} style={{color: 'inherit', textDecoration: 'none'}}>{cat.categoryName}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Hotline Hỗ Trợ</h4>
            <p style={{marginBottom: '5px', fontSize: '13px', color: '#000'}}>Phương thức thanh toán</p>
            <div className="payment-icons" style={{display: 'flex', gap: '10px', fontSize: '24px', letterSpacing: '0'}}>
               💵 <img src="/image/vnpay.png" alt="VNPay" style={{width: '40px', height: 'auto'}} /> 🏦
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
