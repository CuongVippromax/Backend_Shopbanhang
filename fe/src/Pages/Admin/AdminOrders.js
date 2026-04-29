import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrdersAdmin, updateOrderStatus, updatePaymentStatus } from '../../api';
import './AdminOrders.css';

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

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updatingField, setUpdatingField] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [page, searchTerm, statusFilter, paymentFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 10,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined
      };
      const response = await getAllOrdersAdmin(params);
      
      // Axios có thể unwrap nhiều lần, nên kiểm tra cả 2 trường hợp
      // Trường hợp 1: response = {pageNo, totalElements, totalPages, data: [...]}
      // Trường hợp 2: response = [...] (đã unwrap hoàn toàn)
      
      let ordersData = [];
      let total = 0;
      let pages = 0;
      
      if (Array.isArray(response)) {
        // Response là array trực tiếp
        ordersData = response;
        total = response.length;
        pages = 1;
      } else if (response && typeof response === 'object') {
        // Response là object - kiểm tra có phải cấu trúc phân trang không
        if (response.data && Array.isArray(response.data)) {
          // { data: [...], totalElements, totalPages }
          ordersData = response.data;
          total = response.totalElements || response.totalElements || 0;
          pages = response.totalPages || 0;
        } else if (Array.isArray(response.content)) {
          // { content: [...], totalElements, totalPages } (Spring Data format)
          ordersData = response.content;
          total = response.totalElements || 0;
          pages = response.totalPages || 0;
        } else {
          // Không rõ format, thử lấy các giá trị trực tiếp
          ordersData = Object.values(response).filter(v => Array.isArray(v))[0] || [];
          total = ordersData.length;
          pages = 1;
        }
      }
      
      setOrders(ordersData);
      setTotalElements(total);
      setTotalPages(pages);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setUpdatingField('orderStatus');
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Cập nhật trạng thái đơn hàng thất bại');
    } finally {
      setUpdatingOrderId(null);
      setUpdatingField(null);
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setUpdatingField('paymentStatus');
    try {
      await updatePaymentStatus(orderId, newStatus);
      loadOrders();
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Cập nhật trạng thái thanh toán thất bại');
    } finally {
      setUpdatingOrderId(null);
      setUpdatingField(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      PENDING: 'status-pending',
      PROCESSING: 'status-processing',
      SHIPPED: 'status-shipped',
      COMPLETED: 'status-delivered',
      CANCELLED: 'status-cancelled'
    };
    return statusMap[status] || '';
  };

  const getPaymentClass = (status) => {
    const statusMap = {
      PENDING: 'payment-pending',
      PAID: 'payment-paid',
      FAILED: 'payment-failed',
      REFUNDED: 'payment-refunded'
    };
    return statusMap[status] || '';
  };

  return (
    <div className="admin-orders">
      <div className="orders-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
          />
        </div>
        
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(ORDER_STATUS_VI).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(0);
            }}
            className="filter-select"
          >
            <option value="">Tất cả thanh toán</option>
            {Object.entries(PAYMENT_STATUS_VI).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        
        <div className="toolbar-info">
          <span className="total-count">Tổng: {totalElements} đơn hàng</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <>
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId || order.id}>
                    <td className="order-id">#{order.orderId || order.id}</td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">{order.fullName || order.username || 'Khách vãng lai'}</span>
                        <span className="customer-email">{order.username || ''}</span>
                      </div>
                    </td>
                    <td>{formatDate(order.orderDate || order.createdAt)}</td>
                    <td className="price-cell">{formatPrice(order.totalAmount || order.total)}</td>
                    <td>
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(order.orderId || order.id, e.target.value)}
                        disabled={updatingOrderId === (order.orderId || order.id) && updatingField === 'paymentStatus'}
                        className={`status-select ${getPaymentClass(order.paymentStatus)}`}
                      >
                        {Object.entries(PAYMENT_STATUS_VI).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleOrderStatusChange(order.orderId || order.id, e.target.value)}
                        disabled={updatingOrderId === (order.orderId || order.id) && updatingField === 'orderStatus'}
                        className={`status-select ${getStatusClass(order.orderStatus)}`}
                      >
                        {Object.entries(ORDER_STATUS_VI).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="actions-cell">
                      <Link
                        to={`/admin/orders/${order.orderId || order.id}`}
                        className="btn-view"
                      >
                        👁️ Xem
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages >= 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="page-btn"
              >
                ««
              </button>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="page-btn"
              >
                «
              </button>
              <span className="page-info">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="page-btn"
              >
                »
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="page-btn"
              >
                »»
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
