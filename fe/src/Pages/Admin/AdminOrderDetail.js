import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetailAdmin } from '../../api';
import './AdminOrderDetail.css';

const ORDER_STATUS_VI = {
  PENDING: 'Chờ xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao hàng',
  COMPLETED: 'Đã giao hàng',
  CANCELLED: 'Đã hủy'
};

const PAYMENT_STATUS_VI = {
  PENDING: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại',
  REFUNDED: 'Đã hoàn tiền'
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrderDetail = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrderDetailAdmin(id);
      setOrder(data?.data || data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrderDetail();
  }, [loadOrderDetail]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="order-modal">
          <div className="modal-header">
            <h2>Không tìm thấy đơn hàng</h2>
            <button className="btn-close" onClick={() => navigate('/admin/orders')}>×</button>
          </div>
        </div>
      </div>
    );
  }

  const orderItems = order.items || [];
  const customerName = order.fullName || order.recipientName || order.username || 'Khách hàng';

  return (
    <div className="order-detail-page">
      <div className="order-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>Chi tiết đơn hàng #{order.orderId}</h2>
          <button className="btn-close" onClick={() => navigate('/admin/orders')}>×</button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Order Header */}
          <div className="order-header">
            <span className="order-id">Đơn hàng #{order.orderId}</span>
            <span className="order-date">Ngày đặt: {formatDate(order.orderDate)}</span>
          </div>

          {/* Status Section */}
          <div className="status-section">
            <div className="status-group">
              <label>Trạng thái đơn hàng</label>
              <span className="status-text">{ORDER_STATUS_VI[order.orderStatus] || order.orderStatus}</span>
            </div>
            <div className="status-group">
              <label>Thanh toán</label>
              <span className="status-text">{PAYMENT_STATUS_VI[order.paymentStatus] || order.paymentStatus}</span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="info-grid">
            {/* Customer Info */}
            <div className="info-card">
              <h3>Khách hàng</h3>
              <div className="info-item">
                <label>Tên</label>
                <span>{customerName}</span>
              </div>
              {order.username && (
                <div className="info-item">
                  <label>Tài khoản</label>
                  <span>{order.username}</span>
                </div>
              )}
              <div className="info-item">
                <label>Điện thoại</label>
                <span>{order.recipientPhone || '-'}</span>
              </div>
            </div>

            {/* Order Info */}
            <div className="info-card">
              <h3>Thông tin thanh toán</h3>
              <div className="info-item">
                <label>Phương thức</label>
                <span>{order.paymentMethod || 'COD'}</span>
              </div>
              <div className="info-item">
                <label>Tổng tiền</label>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="info-card shipping-card">
              <h3>Địa chỉ giao hàng</h3>
              <div className="info-item">
                <span style={{ textAlign: 'left', fontSize: '15px' }}>
                  {order.shippingAddress || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="products-section">
            <div className="products-header">
              <h3>Sản phẩm ({orderItems.length})</h3>
            </div>
            <table className="products-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên sách</th>
                  <th>Đơn giá</th>
                  <th>SL</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-text">Không có sản phẩm</td>
                  </tr>
                ) : (
                  orderItems.map((item, index) => (
                    <tr key={item.cartItemId || index}>
                      <td>
                        <img 
                          src={item.image || '/image/default-book.jpg'} 
                          alt={item.bookName}
                          className="product-thumb"
                          onError={(e) => { e.target.src = '/image/default-book.jpg'; }}
                        />
                      </td>
                      <td className="name-cell">
                        {item.bookName || 'N/A'}
                      </td>
                      <td className="price-cell">
                        {formatPrice(item.price)}
                      </td>
                      <td className="qty-cell">
                        {item.quantity || 0}
                      </td>
                      <td className="total-cell">
                        {formatPrice(item.totalPrice || (item.price * item.quantity))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-dong" onClick={() => navigate('/admin/orders')}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
