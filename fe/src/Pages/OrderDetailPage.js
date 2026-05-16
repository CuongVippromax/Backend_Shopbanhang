import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ImgAsset from '../public';
import './OrderDetailPage.css';
import UserMenu from '../Components/UserMenu';
import { getOrderById, cancelOrder } from '../api';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const data = await getOrderById(orderId);
      setOrder(data?.data || data);
    } catch (err) {
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Check if order can be cancelled (only PENDING or CONFIRMED status)
  const canCancel = order && (order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED');

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    setCancelling(true);
    try {
      await cancelOrder(orderId);
      loadOrderDetail(); // Reload to get updated status
      alert('Đơn hàng đã được hủy thành công!');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.message || 'Không thể hủy đơn hàng. Vui lòng thử lại!');
    } finally {
      setCancelling(false);
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

  const statusSteps = [
    { key: 'PENDING', label: 'Chờ xác nhận', icon: '⏳', color: '#ffc107' },
    { key: 'CONFIRMED', label: 'Đã xác nhận', icon: '✓', color: '#17a2b8' },
    { key: 'SHIPPING', label: 'Đang giao', icon: '🚚', color: '#6610f2' },
    { key: 'DELIVERED', label: 'Đã giao', icon: '📦', color: '#28a745' }
  ];

  const getCurrentStepIndex = (status) => {
    if (status === 'CANCELLED') return -1;
    const index = statusSteps.findIndex(s => s.key === status);
    return index;
  };

  const paymentLabels = {
    PAID: 'Đã thanh toán',
    UNPAID: 'Chưa thanh toán',
    REFUNDED: 'Đã hoàn tiền'
  };

  const statusLabels = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã hủy'
  };

  if (loading) {
    return (
      <div className="order-detail-page">
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
        <main className="order-detail-content">
          <p>Không tìm thấy đơn hàng</p>
          <Link to="/don-hang" className="btn-back">Quay lại</Link>
        </main>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex(order.orderStatus);

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

        {/* Order Header Card */}
        <div className="order-header-card">
          <div className="order-header-left">
            <h1>Đơn hàng #{order.orderId}</h1>
            <p className="order-date">Ngày đặt: {formatDate(order.orderDate)}</p>
            <div className="order-badges">
              <span className={`payment-badge payment-${order.paymentStatus}`}>
                {paymentLabels[order.paymentStatus] || order.paymentStatus}
              </span>
              <span className={`order-status-badge status-${order.orderStatus}`}>
                {statusLabels[order.orderStatus] || order.orderStatus}
              </span>
            </div>
          </div>
          <div className="order-header-right">
            <div className="total-amount">
              <span className="total-label">Tổng tiền</span>
              <span className="total-value">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Order Status Timeline */}
        {order.orderStatus !== 'CANCELLED' && (
          <div className="order-timeline-card">
            <h3>Tiến trình đơn hàng</h3>
            <div className="timeline-container">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;
                return (
                  <div key={step.key} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="step-icon-wrapper">
                      <div className="step-icon">
                        {step.icon}
                      </div>
                      {index < statusSteps.length - 1 && <div className="step-line"></div>}
                    </div>
                    <div className="step-info">
                      <span className="step-label">{step.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled Status */}
        {order.orderStatus === 'CANCELLED' && (
          <div className="order-cancelled-card">
            <div className="cancelled-icon">✕</div>
            <h3>Đơn hàng đã bị hủy</h3>
            <p>Đơn hàng này đã được hủy. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.</p>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="order-detail-grid">
          {/* Left Column - Shipping Info */}
          <div className="order-info-card">
            <h3>📍 Thông tin giao hàng</h3>
            <div className="shipping-info">
              <div className="info-row">
                <span className="info-icon">👤</span>
                <div className="info-content">
                  <label>Người nhận</label>
                  <span>{order.recipientName}</span>
                </div>
              </div>
              <div className="info-row">
                <span className="info-icon">📞</span>
                <div className="info-content">
                  <label>Số điện thoại</label>
                  <span>{order.recipientPhone}</span>
                </div>
              </div>
              <div className="info-row">
                <span className="info-icon">📍</span>
                <div className="info-content">
                  <label>Địa chỉ giao hàng</label>
                  <span>{order.shippingAddress}</span>
                </div>
              </div>
              {order.note && (
                <div className="info-row note-row">
                  <span className="info-icon">📝</span>
                  <div className="info-content">
                    <label>Ghi chú từ khách hàng</label>
                    <span className="note-text">{order.note}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="order-payment-card">
            <h3>💳 Thông tin thanh toán</h3>
            <div className="payment-summary">
              <div className="summary-item">
                <span>Tạm tính</span>
                <span>{formatPrice(order.subTotal)}</span>
              </div>
              <div className="summary-item">
                <span>Phí vận chuyển</span>
                <span>{formatPrice(order.shippingFee || 0)}</span>
              </div>
              {order.discount > 0 && (
                <div className="summary-item discount">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="summary-item total">
                <span>Tổng cộng</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="order-items-card">
          <h3>📦 Sản phẩm đã đặt ({order.items?.length || 0} sản phẩm)</h3>
          <div className="order-items-list">
            {(order.items || []).map((item, idx) => (
              <div className="order-item-row" key={item.cartItemId || idx}>
                <img
                  src={item.image || ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentwoocommerce_thumbnailsizewoocommerce_thumbnail}
                  alt={item.bookName}
                  className="item-image"
                />
                <div className="item-details">
                  <Link to={`/san-pham/${item.bookId}`} className="item-name">
                    {item.bookName}
                  </Link>
                  <div className="item-meta">
                    <span className="item-price">Giá: {formatPrice(item.price)}</span>
                    <span className="item-qty">× {item.quantity}</span>
                  </div>
                </div>
                <div className="item-subtotal">
                  {formatPrice(item.totalPrice || item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancel Order Button */}
        {canCancel && (
          <div className="cancel-order-section">
            <button 
              className="btn-cancel-order" 
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
            </button>
          </div>
        )}
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
