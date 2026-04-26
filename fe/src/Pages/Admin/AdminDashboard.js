import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

const ORDER_STATUS_VI = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy'
};

const PAYMENT_STATUS_VI = {
  PENDING: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền'
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
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
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'PROCESSING': 'status-processing',
      'SHIPPED': 'status-shipped',
      'DELIVERED': 'status-delivered',
      'COMPLETED': 'status-delivered',
      'CANCELLED': 'status-cancelled'
    };
    return statusMap[status] || '';
  };

  const getPaymentClass = (status) => {
    const statusMap = {
      'PENDING': 'payment-pending',
      'PAID': 'payment-paid',
      'FAILED': 'payment-failed',
      'REFUNDED': 'payment-refunded'
    };
    return statusMap[status] || '';
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  // Prepare chart data
  const inventoryData = [
    { name: 'Còn hàng', value: (stats?.totalBooks || 0) - (stats?.lowStockBooks || 0) - (stats?.outOfStockBooks || 0), color: '#52c41a' },
    { name: 'Sắp hết', value: stats?.lowStockBooks || 0, color: '#faad14' },
    { name: 'Hết hàng', value: stats?.outOfStockBooks || 0, color: '#ff4d4f' }
  ].filter(item => item.value > 0);

  const revenueData = (stats?.revenueByMonth || []).map(item => ({
    ...item,
    month: `${item.month}`,
    doanhThu: item.revenue
  }));

  const topBooksData = (stats?.topSellingBooks || []).map((item, index) => ({
    ...item,
    stt: index + 1,
    doanhSo: item.totalSold,
    doanhThu: item.totalRevenue
  }));

  return (
    <div className="admin-dashboard">
      {/* ===== PHẦN 1: TỔNG QUAN ===== */}
      <div className="dashboard-section">
        <h2 className="section-title">Tổng quan</h2>
        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-info">
              <h3>{stats?.totalUsers || 0}</h3>
              <p>Người dùng</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-info">
              <h3>{stats?.totalOrders || 0}</h3>
              <p>Đơn hàng</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-info">
              <h3>{stats?.totalBooks || 0}</h3>
              <p>Sản phẩm</p>
            </div>
          </div>
          
          <div className="stat-card stat-card-revenue">
            <div className="stat-info">
              <h3>{formatPrice(stats?.totalRevenue)}</h3>
              <p>Doanh thu</p>
            </div>
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="order-status-summary">
          <div className="status-item">
            <span>Chờ xác nhận: <strong>{stats?.pendingOrders || 0}</strong></span>
          </div>
          <div className="status-item">
            <span>Đang giao: <strong>{stats?.shippedOrders || 0}</strong></span>
          </div>
          <div className="status-item">
            <span>Hoàn thành: <strong>{stats?.completedOrders || 0}</strong></span>
          </div>
          <div className="status-item">
            <span>Đã hủy: <strong>{stats?.cancelledOrders || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* ===== PHẦN 2: KHO HÀNG - BIỂU ĐỒ TỒN KHO ===== */}
      <div className="dashboard-section">
        <h2 className="section-title">Kho hàng</h2>
        <div className="chart-container">
          <div className="chart-wrapper chart-half">
            <h3>Tỷ lệ tồn kho sách</h3>
            {inventoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} sách`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">Không có dữ liệu</div>
            )}
          </div>
          
          <div className="chart-wrapper chart-half">
            <h3>Cảnh báo kho hàng</h3>
            <div className="inventory-alerts">
              <div className="alert-item alert-warning">
                <span>Sách sắp hết hàng: <strong>{stats?.lowStockBooks || 0}</strong> cuốn</span>
              </div>
              <div className="alert-item alert-danger">
                <span>Sách hết hàng: <strong>{stats?.outOfStockBooks || 0}</strong> cuốn</span>
              </div>
              <div className="alert-item alert-info">
                <span>Tổng sách trong kho: <strong>{stats?.totalBooks || 0}</strong> cuốn</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PHẦN 3: BIỂU ĐỒ DOANH THU ===== */}
      <div className="dashboard-section">
        <h2 className="section-title">Doanh thu</h2>
        <div className="chart-wrapper chart-full">
          <h3>Doanh thu theo tháng</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [formatPrice(value), 'Doanh thu']}
                  labelFormatter={(label) => `Tháng ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="doanhThu" 
                  name="Doanh thu" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  dot={{ fill: '#1890ff', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Không có dữ liệu doanh thu</div>
          )}
        </div>

        {/* Revenue Summary Cards */}
        <div className="revenue-summary">
          {revenueData.length > 0 && (
            <>
              <div className="revenue-card">
                <span className="revenue-label">Doanh thu tháng này</span>
                <span className="revenue-value">{formatPrice(revenueData[revenueData.length - 1]?.doanhThu || 0)}</span>
              </div>
              <div className="revenue-card">
                <span className="revenue-label">Đơn hàng tháng này</span>
                <span className="revenue-value">{revenueData[revenueData.length - 1]?.orderCount || 0}</span>
              </div>
              <div className="revenue-card">
                <span className="revenue-label">TB đơn hàng</span>
                <span className="revenue-value">
                  {formatPrice(
                    revenueData[revenueData.length - 1]?.orderCount > 0 
                      ? revenueData[revenueData.length - 1]?.doanhThu / revenueData[revenueData.length - 1]?.orderCount 
                      : 0
                  )}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===== PHẦN 4: TOP SÁCH BÁN CHẠY ===== */}
      <div className="dashboard-section">
        <h2 className="section-title">Top sách bán chạy</h2>
        <div className="chart-wrapper chart-full">
          {topBooksData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={topBooksData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="bookName" 
                  width={150}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'doanhSo' ? `${value} cuốn` : formatPrice(value),
                    name === 'doanhSo' ? 'Đã bán' : 'Doanh thu'
                  ]}
                />
                <Legend />
                <Bar dataKey="doanhSo" name="Đã bán" fill="#52c41a" radius={[0, 4, 4, 0]} />
                <Bar dataKey="doanhThu" name="Doanh thu" fill="#1890ff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Chưa có dữ liệu bán hàng</div>
          )}
        </div>

        {/* Top Books Table */}
        <div className="top-books-table">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Sản phẩm</th>
                <th>Đã bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {topBooksData.map((book, index) => (
                <tr key={book.bookId || index}>
                  <td>{book.stt}</td>
                  <td className="book-cell">
                    <img 
                      src={book.image || '/image/default-book.jpg'} 
                      alt={book.bookName}
                      className="book-thumb"
                      onError={(e) => { e.target.src = '/image/default-book.jpg'; }}
                    />
                    <span className="book-name">{book.bookName}</span>
                  </td>
                  <td>{book.doanhSo} cuốn</td>
                  <td className="revenue-cell">{formatPrice(book.doanhThu)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== PHẦN 5: ĐƠN HÀNG GẦN ĐÂY ===== */}
      <div className="dashboard-section">
        <h2 className="section-title">Đơn hàng gần đây</h2>
        <div className="recent-orders-table">
          <table>
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
              {(stats?.recentOrders || []).map((order) => (
                <tr key={order.orderId}>
                  <td>#{order.orderId}</td>
                  <td>{order.fullName || order.username || 'Khách vãng lai'}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td className="revenue-cell">{formatPrice(order.totalAmount)}</td>
                  <td>
                    <span className={`payment-badge ${getPaymentClass(order.paymentStatus)}`}>
                      {PAYMENT_STATUS_VI[order.paymentStatus] || order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(order.orderStatus)}`}>
                      {ORDER_STATUS_VI[order.orderStatus] || order.orderStatus}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/orders/${order.orderId}`} className="btn-view">
                      Xem
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
            <div className="no-data">Chưa có đơn hàng nào</div>
          )}
        </div>
        <div className="section-footer">
          <Link to="/admin/orders" className="btn-view-all">
            Xem tất cả đơn hàng →
          </Link>
        </div>
      </div>
    </div>
  );
}
