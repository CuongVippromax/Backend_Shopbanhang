import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ImgAsset from '../public';
import './OrderDetailPage.css';
import UserMenu from '../Components/UserMenu';
import { getOrderById } from '../api';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOrderDetail = async () => {
    setLoading(true);
    try {
      const data = await getOrderById(orderId);
      setOrder(data?.data || data);
    } catch (err) {
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const statusLabels = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã hủy'
  };

  const paymentLabels = {
    PAID: 'Đã thanh toán',
    UNPAID: 'Chưa thanh toán',
    REFUNDED: 'Đã hoàn tiền'
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <main className="order-detail-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin đơn hàng...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <main className="order-detail-content">
          <p>Không tìm thấy đơn hàng</p>
          <Link to="/don-hang" className="btn-back">Quay lại</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      {/* Header */}
      <header className="main-header">
        <div className="container header-inner">
          <div className="logo-area">
            <Link to="/" style={{display: 'flex', alignItems: 'center', textDecoration: 'none'}}>
              <img src="/image/logo-hoang-kim.jpg" alt="Logo Hoàng Kim" className="logo-img" style={{height: '70px', objectFit: 'contain'}} />
            </Link>
          </div>
          <div className="cart-area">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="order-detail-content">
        <button onClick={() => navigate('/don-hang')} className="btn-back">
          ← Quay lại danh sách đơn hàng
        </button>

        <div className="order-detail-card">
          <div className="order-detail-header">
            <div>
              <h2>Đơn hàng #{order.orderId}</h2>
              <p className="order-date">Ngày đặt: {formatDate(order.orderDate)}</p>
            </div>
            <div className="order-badges">
              <span className={`payment-badge payment-${order.paymentStatus}`}>
                {paymentLabels[order.paymentStatus] || order.paymentStatus}
              </span>
              <span className={`order-status status-${order.orderStatus}`}>
                {statusLabels[order.orderStatus] || order.orderStatus}
              </span>
            </div>
          </div>

          {/* Thông tin giao hàng */}
          <div className="order-detail-section">
            <h3>📍 Thông tin giao hàng</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Người nhận:</label>
                <span>{order.recipientName}</span>
              </div>
              <div className="info-item">
                <label>Số điện thoại:</label>
                <span>{order.recipientPhone}</span>
              </div>
              <div className="info-item" style={{gridColumn: '1 / -1'}}>
                <label>Địa chỉ:</label>
                <span>{order.shippingAddress}</span>
              </div>
              {order.note && (
                <div className="info-item order-note" style={{gridColumn: '1 / -1'}}>
                  <label>Ghi chú:</label>
                  <span>{order.note}</span>
                </div>
              )}
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="order-detail-section">
            <h3>📦 Sản phẩm đã đặt</h3>
            <div className="order-items-list">
              {(order.items || []).map((item, idx) => (
                <div className="order-item-detail" key={item.cartItemId || idx}>
                  <img
                    src={item.image || ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentwoocommerce_thumbnailsizewoocommerce_thumbnail}
                    alt={item.bookName}
                  />
                  <div className="item-info">
                    <Link to={`/san-pham/${item.bookId}`} className="item-name">
                      {item.bookName}
                    </Link>
                    <p className="item-price">Giá: {formatPrice(item.price)}</p>
                    <p className="item-qty">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="item-total">
                    {formatPrice(item.totalPrice || item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tổng cộng */}
          <div className="order-detail-footer">
            <div className="order-summary">
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(order.subTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>{formatPrice(order.shippingFee || 0)}</span>
              </div>
              {order.discount > 0 && (
                <div className="summary-row discount">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Tổng cộng:</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="main-footer" style={{marginTop: '50px'}}>
        <div className="container footer-grid">
          <div className="footer-col">
            <h3 className="footer-logo">Nhà Sách Hoàng Kim</h3>
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
