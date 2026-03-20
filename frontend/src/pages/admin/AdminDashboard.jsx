import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats } from '../../api/admin'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res || null))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ xử lý', className: 'badge--warning' },
      PROCESSING: { label: 'Đang xử lý', className: 'badge--info' },
      SHIPPED: { label: 'Đang giao', className: 'badge--info' },
      COMPLETED: { label: 'Hoàn thành', className: 'badge--success' },
      CANCELLED: { label: 'Đã hủy', className: 'badge--danger' },
      PAID: { label: 'Đã thanh toán', className: 'badge--success' },
    }
    const info = statusMap[status] || { label: status, className: '' }
    return <span className={`badge ${info.className}`}>{info.label}</span>
  }

  if (loading) {
    return <div className="admin-loading">Đang tải...</div>
  }

  if (!stats) {
    return <div className="admin-loading">Không thể tải dữ liệu dashboard</div>
  }

  // Revenue chart - find max for bar width
  const maxRevenue = stats.revenueByMonth
    ? Math.max(...stats.revenueByMonth.map(m => m.revenue || 0), 1)
    : 1

  return (
    <div className="admin-dashboard">
      <h1 className="admin-page-title">Tổng quan</h1>

      {/* ── Thống kê tổng quan ── */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ background: '#e3f2fd', color: '#1976d2' }}>👥</div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats.totalUsers || 0}</span>
            <span className="admin-stat-card__label">Người dùng</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ background: '#e8f5e9', color: '#388e3c' }}>📚</div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats.totalBooks || 0}</span>
            <span className="admin-stat-card__label">Sản phẩm</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ background: '#fff3e0', color: '#f57c00' }}>🛒</div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats.totalOrders || 0}</span>
            <span className="admin-stat-card__label">Đơn hàng</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ background: '#fce4ec', color: '#c62828' }}>💰</div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value" style={{ fontSize: '20px' }}>{formatCurrency(stats.totalRevenue)}</span>
            <span className="admin-stat-card__label">Doanh thu</span>
          </div>
        </div>
      </div>

      {/* ── Thống kê trạng thái đơn hàng ── */}
      <div className="admin-order-stats" style={{ marginBottom: '24px' }}>
        <h2 className="admin-section-title">📊 Trạng thái đơn hàng</h2>
        <div className="admin-order-stats__grid">
          <div className="admin-order-stat">
            <span className="admin-order-stat__value" style={{ color: '#7b1fa2' }}>{stats.pendingOrders || 0}</span>
            <span className="admin-order-stat__label">Chờ xử lý</span>
          </div>
          <div className="admin-order-stat">
            <span className="admin-order-stat__value" style={{ color: '#0288d1' }}>{stats.shippedOrders || 0}</span>
            <span className="admin-order-stat__label">Đang giao</span>
          </div>
          <div className="admin-order-stat admin-order-stat--success">
            <span className="admin-order-stat__value">{stats.completedOrders || 0}</span>
            <span className="admin-order-stat__label">Hoàn thành</span>
          </div>
          <div className="admin-order-stat admin-order-stat--danger">
            <span className="admin-order-stat__value">{stats.cancelledOrders || 0}</span>
            <span className="admin-order-stat__label">Đã hủy</span>
          </div>
        </div>
      </div>

      {/* ── 2 columns: Kho hàng + Danh mục ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Kho hàng */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-section-title">📦 Kho hàng</h2>
          </div>
          <div className="admin-card__body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Tổng sản phẩm', value: stats.totalBooks, color: '#1976d2', bg: '#e3f2fd' },
                { label: 'Sắp hết hàng', value: stats.lowStockBooks, color: '#f57c00', bg: '#fff3e0' },
                { label: 'Hết hàng', value: stats.outOfStockBooks, color: '#c62828', bg: '#ffebee' },
              ].map(item => (
                <div key={item.label} style={{ padding: '16px', background: item.bg, borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: item.color }}>{item.value || 0}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Danh mục */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-section-title">🏷️ Danh mục</h2>
          </div>
          <div className="admin-card__body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '64px' }}>📂</div>
              <div>
                <div style={{ fontSize: '48px', fontWeight: '700', color: '#388e3c' }}>{stats.totalCategories || 0}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Danh mục đang có</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2 columns: Doanh thu theo tháng + Top sách bán chạy ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Doanh thu theo tháng */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-section-title">📈 Doanh thu 6 tháng gần nhất</h2>
          </div>
          <div className="admin-card__body">
            {stats.revenueByMonth && stats.revenueByMonth.length > 0 ? (
              <div>
                {stats.revenueByMonth.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px', color: '#333' }}>
                        {item.month} {item.year}
                      </span>
                      <span style={{ fontWeight: '700', color: '#1976d2', fontSize: '13px' }}>
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                    <div style={{ background: '#e8e8e8', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(item.revenue / maxRevenue) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                        borderRadius: '4px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                      {item.orderCount || 0} đơn hàng
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu</div>
            )}
          </div>
        </div>

        {/* Top sách bán chạy */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-section-title">🔥 Top sách bán chạy</h2>
          </div>
          <div className="admin-card__body">
            {stats.topSellingBooks && stats.topSellingBooks.length > 0 ? (
              <div>
                {stats.topSellingBooks.map((book, idx) => (
                  <div key={book.bookId} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 0', borderBottom: idx < stats.topSellingBooks.length - 1 ? '1px solid #f0f0f0' : 'none',
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: idx === 0 ? '#f5c518' : idx === 1 ? '#b0bec5' : idx === 2 ? '#cd7f32' : '#e0e0e0',
                      color: '#fff', fontWeight: '700', fontSize: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {idx + 1}
                    </div>
                    <img
                      src={book.image || '/images/no-image.png'}
                      alt={book.bookName}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {book.bookName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        Đã bán: {book.totalSold} quyển
                      </div>
                    </div>
                    <div style={{ fontWeight: '700', color: '#e74c3c', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {formatCurrency(book.totalRevenue)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu bán hàng</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Đơn hàng gần nhất ── */}
      <div className="admin-recent-orders">
        <div className="admin-recent-orders__header">
          <h2 className="admin-section-title">📋 Đơn hàng gần nhất</h2>
          <Link to="/admin/orders" className="admin-link">Xem tất cả →</Link>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {(!stats.recentOrders || stats.recentOrders.length === 0) ? (
                <tr>
                  <td colSpan="6" className="admin-table__empty">Chưa có đơn hàng nào</td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>#{order.orderId}</td>
                    <td>{order.username || order.fullName || 'Khách'}</td>
                    <td style={{ fontWeight: '600', color: '#e74c3c' }}>{formatCurrency(order.totalAmount || order.totalPrice)}</td>
                    <td>{getStatusBadge(order.paymentStatus)}</td>
                    <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : '-'}</td>
                    <td>{getStatusBadge(order.orderStatus)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
