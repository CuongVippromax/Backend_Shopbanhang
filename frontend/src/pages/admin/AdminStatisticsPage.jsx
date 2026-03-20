import { useState, useEffect } from 'react'
import { getDashboardStats, getAllOrders } from '../../api/admin'

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [topBooks, setTopBooks] = useState([])
  const [revenueByMonth, setRevenueByMonth] = useState([])
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      getDashboardStats(),
      getAllOrders({ page: 1, size: 100 })
    ])
      .then(([statsRes, ordersRes]) => {
        setStats(statsRes.data)

        // Calculate revenue by month from orders
        const orders = ordersRes.data?.data || []
        const monthMap = {}
        orders.forEach(order => {
          if (order.orderStatus === 'COMPLETED' || order.orderStatus === 'PAID') {
            const date = new Date(order.orderDate)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            monthMap[key] = (monthMap[key] || 0) + (order.totalAmount || 0)
          }
        })
        const sorted = Object.entries(monthMap)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([month, revenue]) => ({ month, revenue }))
        setRevenueByMonth(sorted.slice(-6))

        // Simulate top selling books (from order items)
        const bookCount = {}
        orders.forEach(order => {
          if (order.items) {
            order.items.forEach(item => {
              if (!bookCount[item.bookId]) {
                bookCount[item.bookId] = { bookId: item.bookId, bookName: item.bookName, quantity: 0, revenue: 0 }
              }
              bookCount[item.bookId].quantity += item.quantity || 0
              bookCount[item.bookId].revenue += item.totalPrice || 0
            })
          }
        })
        const top = Object.values(bookCount)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5)
        setTopBooks(top)
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatCurrency = (value) => {
    if (!value) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const statsData = stats ? [
    {
      label: 'Người dùng',
      value: stats.totalUsers || 0,
      icon: '👥',
      color: '#1976d2',
      bg: '#e3f2fd',
    },
    {
      label: 'Sản phẩm',
      value: stats.totalBooks || 0,
      icon: '📚',
      color: '#388e3c',
      bg: '#e8f5e9',
    },
    {
      label: 'Tổng đơn hàng',
      value: stats.totalOrders || 0,
      icon: '📦',
      color: '#f57c00',
      bg: '#fff3e0',
    },
    {
      label: 'Doanh thu',
      value: formatCurrency(stats.totalRevenue),
      icon: '💰',
      color: '#d32f2f',
      bg: '#ffebee',
      isCurrency: true,
    },
    {
      label: 'Đơn chờ xử lý',
      value: stats.pendingOrders || 0,
      icon: '⏳',
      color: '#7b1fa2',
      bg: '#f3e5f5',
    },
    {
      label: 'Đơn đang giao',
      value: stats.shippedOrders || 0,
      icon: '🚚',
      color: '#0288d1',
      bg: '#e1f5fe',
    },
    {
      label: 'Đơn hoàn thành',
      value: stats.completedOrders || 0,
      icon: '✅',
      color: '#2e7d32',
      bg: '#e8f5e9',
    },
    {
      label: 'Đơn đã hủy',
      value: stats.cancelledOrders || 0,
      icon: '❌',
      color: '#c62828',
      bg: '#ffebee',
    },
  ] : []

  if (loading) {
    return <div className="admin-loading">Đang tải dữ liệu...</div>
  }

  return (
    <div className="admin-statistics">
      <h1 className="admin-page-title">Thống kê tổng quan</h1>

      {/* Summary Cards */}
      <div className="admin-stats">
        {statsData.map((item, idx) => (
          <div key={idx} className="admin-stat-card">
            <div
              className="admin-stat-card__icon"
              style={{ background: item.bg, color: item.color }}
            >
              {item.icon}
            </div>
            <div className="admin-stat-card__content">
              <span className="admin-stat-card__value">{item.value}</span>
              <span className="admin-stat-card__label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Top Selling Books */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-section-title">📈 Sách bán chạy</h2>
          </div>
          <div className="admin-card__body">
            {topBooks.length === 0 ? (
              <div className="admin-table__empty">Chưa có dữ liệu</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên sách</th>
                    <th>Đã bán</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {topBooks.map((book, idx) => (
                    <tr key={book.bookId}>
                      <td>{idx + 1}</td>
                      <td>{book.bookName}</td>
                      <td><strong>{book.quantity}</strong> quyển</td>
                      <td>{formatCurrency(book.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Revenue by Month */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-section-title">💹 Doanh thu theo tháng</h2>
          </div>
          <div className="admin-card__body">
            {revenueByMonth.length === 0 ? (
              <div className="admin-table__empty">Chưa có dữ liệu</div>
            ) : (
              <div>
                {revenueByMonth.map((item) => {
                  const maxRevenue = Math.max(...revenueByMonth.map(r => r.revenue))
                  const barWidth = maxRevenue > 0 ? (item.revenue / maxRevenue * 100) : 0
                  const [year, month] = item.month.split('-')
                  const monthName = new Date(year, parseInt(month) - 1).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })
                  return (
                    <div key={item.month} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '500', fontSize: '13px' }}>{monthName}</span>
                        <span style={{ fontWeight: '600', color: '#1976d2' }}>{formatCurrency(item.revenue)}</span>
                      </div>
                      <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${barWidth}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Status Summary */}
      <div className="admin-card" style={{ marginTop: '24px' }}>
        <div className="admin-card__header">
          <h2 className="admin-section-title">📊 Tỷ lệ trạng thái đơn hàng</h2>
        </div>
        <div className="admin-card__body">
          {stats && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { label: 'Chờ xử lý', value: stats.pendingOrders || 0, color: '#7b1fa2', bg: '#f3e5f5' },
                { label: 'Đang giao', value: stats.shippedOrders || 0, color: '#0288d1', bg: '#e1f5fe' },
                { label: 'Hoàn thành', value: stats.completedOrders || 0, color: '#2e7d32', bg: '#e8f5e9' },
                { label: 'Đã hủy', value: stats.cancelledOrders || 0, color: '#c62828', bg: '#ffebee' },
              ].map((item) => {
                const total = stats.totalOrders || 1
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
                return (
                  <div
                    key={item.label}
                    style={{
                      flex: '1 1 160px',
                      padding: '16px',
                      background: item.bg,
                      borderRadius: '8px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '28px', fontWeight: '700', color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{pct}% tổng đơn</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
