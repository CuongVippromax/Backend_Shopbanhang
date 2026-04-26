import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImgAsset from '../public';
import './OrdersPage.css';
import UserMenu from '../Components/UserMenu';
import { useCart } from '../context/CartContext';
import { getOrders, cancelOrder } from '../api';

export default function OrdersPage() {
  const { cartCount } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 5
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
  }, [navigate]);

  const loadOrders = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const data = await getOrders({ page, size: pagination.pageSize });
      
      // Backend trả về PageResponse với format: { pageNo, pageSize, totalElements, totalPages, data: [...] }
      // pageNo là 0-based (0 = trang 1)
      let ordersData = [];
      let pageNo = 0;
      let totalElements = 0;
      let totalPages = 1;
      let pageSize = pagination.pageSize;
      
      if (data) {
        if (Array.isArray(data)) {
          ordersData = data;
        } else if (data.data && Array.isArray(data.data)) {
          ordersData = data.data;
          pageNo = data.pageNo ?? 0;
          totalElements = data.totalElements ?? 0;
          totalPages = data.totalPages ?? 1;
          pageSize = data.pageSize ?? pagination.pageSize;
        } else if (data.content && Array.isArray(data.content)) {
          ordersData = data.content;
          pageNo = data.number ?? data.pageNo ?? 0;
          totalElements = data.totalElements ?? 0;
          totalPages = data.totalPages ?? 1;
          pageSize = data.size ?? pagination.pageSize;
        }
      }
      
      const pageInfo = {
        currentPage: pageNo,
        totalPages: totalPages,
        totalElements: totalElements,
        pageSize: pageSize
      };
      
      setOrders(ordersData);
      setPagination(pageInfo);
    } catch (err) {
      console.error('Error loading orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize]);

  // Initial load and when page changes
  const [currentPage, setCurrentPage] = useState(0);
  
  useEffect(() => {
    loadOrders(currentPage);
  }, [currentPage, loadOrders]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    try {
      await cancelOrder(orderId);
      loadOrders(currentPage);
    } catch (err) {
      alert(err.message || 'Hủy đơn hàng thất bại!');
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
    PROCESSING: 'Đang xử lý',
    SHIPPED: 'Đang giao hàng',
    COMPLETED: 'Đã giao',
    CANCELLED: 'Đã hủy'
  };

  const paymentLabels = {
    PAID: 'Đã thanh toán',
    UNPAID: 'Chưa thanh toán',
    REFUNDED: 'Đã hoàn tiền'
  };

  return (
    <div className="orders-page">
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

      {/* Orders Content */}
      <main className="container orders-content">
        <h2>📦 Đơn Hàng Của Tôi</h2>

        {loading ? (
          <p>Đang tải đơn hàng...</p>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <p>Bạn chưa có đơn hàng nào</p>
            <Link to="/cua-hang" className="btn-shop">MUA SẮM NGAY</Link>
          </div>
        ) : (
          orders.map((order) => (
            <div className="order-card" key={order.orderId}>
              <div className="order-card-header">
                <div>
                  <span className="order-id">Đơn hàng #{order.orderId}</span>
                  <span className="order-date" style={{marginLeft: '15px'}}>
                    {formatDate(order.orderDate)}
                  </span>
                </div>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <span className={`payment-badge payment-${order.paymentStatus}`}>
                    {paymentLabels[order.paymentStatus] || order.paymentStatus}
                  </span>
                  <span className={`order-status status-${order.orderStatus}`}>
                    {statusLabels[order.orderStatus] || order.orderStatus}
                  </span>
                  <button 
                    className="btn-view-detail"
                    onClick={() => navigate(`/don-hang/${order.orderId}`)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>

              <div className="order-items">
                {(order.items || []).map((item, idx) => (
                  <div className="order-item" key={item.cartItemId || idx}>
                    <img
                      src={item.image || ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentwoocommerce_thumbnailsizewoocommerce_thumbnail}
                      alt={item.bookName}
                    />
                    <div className="order-item-info">
                      <div className="order-item-name">{item.bookName}</div>
                      <div className="order-item-qty">x{item.quantity}</div>
                    </div>
                    <div className="order-item-price">{formatPrice(item.totalPrice || item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div className="order-total">
                  Tổng: {formatPrice(order.totalAmount)}
                </div>
                {order.orderStatus === 'PENDING' && (
                  <button
                    className="btn-cancel-order"
                    onClick={() => handleCancelOrder(order.orderId)}
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                disabled={currentPage === 0}
                onClick={() => handlePageChange(0)}
              >
                ««
              </button>
              <button
                className="pagination-btn"
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                «
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 3) {
                  pageNum = i;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${pageNum === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                className="pagination-btn"
                disabled={currentPage >= pagination.totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                »
              </button>
              <button
                className="pagination-btn"
                disabled={currentPage >= pagination.totalPages - 1}
                onClick={() => handlePageChange(pagination.totalPages - 1)}
              >
                »»
              </button>
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
            <h4>Hotline Hỗ Trợ</h4>
            <p>1900 1234</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
