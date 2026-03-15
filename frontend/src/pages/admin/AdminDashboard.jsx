import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats, getAllOrders } from '../../api/admin'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getAllOrders({ page: 1, size: 5 })
    ])
      .then(([statsRes, ordersRes]) => {
        setStats(statsRes.data)
        setRecentOrders(ordersRes.data?.data || [])
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const formatCurrency = (value) => {
    if (!value) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ xử lý', className: 'badge--warning' },
      SHIPPED: { label: 'Đang giao', className: 'badge--info' },
      COMPLETED: { label: 'Hoàn thành', className: 'badge--success' },
      CANCELLED: { label: 'Đã hủy', className: 'badge--danger' },
    }
    const info = statusMap[status] || { label: status, className: '' }
    return <span className={`badge ${info.className}`}>{info.label}</span>
  }

  if (loading) {
    return <div className="admin-loading">Đang tải...</div>
  }

  return (
    <div className="admin-dashboard">
      <h1 className="admin-page-title">Tổng quan</h1>

      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--users">👥</div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats?.totalUsers || 0}</span>
            <span className="admin-stat-card__label">Người dùng</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--books">📚</div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats?.totalBooks || 0}</span>
            <span className="admin-stat-card__label">Sản phẩm</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--orders">📦</div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats?.totalOrders || 0}</span>
            <span className="admin-stat-card__label">Đơn hàng</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--revenue">💰</div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{formatCurrency(stats?.totalRevenue)}</span>
            <span className="admin-stat-card__label">Doanh thu</span>
          </div>
        </div>
      </div>

      {/* Order Stats */}
      <div className="admin-order-stats">
        <h2 className="admin-section-title">Trạng thái đơn hàng</h2>
        <div className="admin-order-stats__grid">
          <div className="admin-order-stat">
            <span className="admin-order-stat__value">{stats?.pendingOrders || 0}</span>
            <span className="admin-order-stat__label">Chờ xử lý</span>
          </div>
          <div className="admin-order-stat">
            <span className="admin-order-stat__value">{stats?.shippedOrders || 0}</span>
            <span className="admin-order-stat__label">Đang giao</span>
          </div>
          <div className="admin-order-stat admin-order-stat--success">
            <span className="admin-order-stat__value">{stats?.completedOrders || 0}</span>
            <span className="admin-order-stat__label">Hoàn thành</span>
          </div>
          <div className="admin-order-stat admin-order-stat--danger">
            <span className="admin-order-stat__value">{stats?.cancelledOrders || 0}</span>
            <span className="admin-order-stat__label">Đã hủy</span>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-recent-orders">
        <div className="admin-recent-orders__header">
          <h2 className="admin-section-title">Đơn hàng gần đây</h2>
          <Link to="/admin/orders" className="admin-link">Xem tất cả →</Link>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="admin-table__empty">Chưa có đơn hàng nào</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>#{order.orderId}</td>
                    <td>{order.userName || 'Khách'}</td>
                    <td>{formatCurrency(order.totalPrice)}</td>
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
