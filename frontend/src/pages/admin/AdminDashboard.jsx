import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { getDashboardStats } from '../../api/admin'

const ORANGE = '#ff6a00'
const BLUE = '#1976d2'
const GREEN = '#388e3c'
const PURPLE = '#7b1fa2'
const RED = '#c62828'

const ORDER_STATUS_COLORS = {
  PENDING:    '#f57c00',
  PROCESSING:  '#0288d1',
  SHIPPED:     '#7b1fa2',
  COMPLETED:   '#388e3c',
  CANCELLED:   '#c62828',
}

const ORDER_STATUS_LABELS = {
  PENDING:    'Chờ xử lý',
  PROCESSING:  'Đang xử lý',
  SHIPPED:     'Đang giao',
  COMPLETED:   'Hoàn thành',
  CANCELLED:   'Đã hủy',
}

const BOOK_CHART_COLORS = ['#ff6a00','#e65b00','#f57c00','#ff8a33','#ffa366','#ffbb80']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res || null))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const fmt = (value) => {
    if (!value && value !== 0) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
  }

  const fmtCompact = (value) => {
    if (!value && value !== 0) return '0'
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
    return value.toLocaleString('vi-VN')
  }

  const getStatusBadge = (status) => {
    const map = {
      PENDING: { label: 'Chờ xử lý', className: 'badge--warning' },
      PROCESSING: { label: 'Đang xử lý', className: 'badge--info' },
      SHIPPED: { label: 'Đang giao', className: 'badge--info' },
      COMPLETED: { label: 'Hoàn thành', className: 'badge--success' },
      CANCELLED: { label: 'Đã hủy', className: 'badge--danger' },
      PAID: { label: 'Đã thanh toán', className: 'badge--success' },
    }
    const info = map[status] || { label: status, className: '' }
    return <span className={`badge ${info.className}`}>{info.label}</span>
  }

  // ── Dữ liệu biểu đồ trạng thái đơn hàng ──────────────────────────────
  const orderPieData = stats ? [
    { name: ORDER_STATUS_LABELS.PENDING,    value: stats.pendingOrders || 0,    color: ORDER_STATUS_COLORS.PENDING },
    { name: ORDER_STATUS_LABELS.PROCESSING,  value: stats.processingOrders || 0, color: ORDER_STATUS_COLORS.PROCESSING },
    { name: ORDER_STATUS_LABELS.SHIPPED,     value: stats.shippedOrders || 0,   color: ORDER_STATUS_COLORS.SHIPPED },
    { name: ORDER_STATUS_LABELS.COMPLETED,   value: stats.completedOrders || 0,  color: ORDER_STATUS_COLORS.COMPLETED },
    { name: ORDER_STATUS_LABELS.CANCELLED,   value: stats.cancelledOrders || 0,  color: ORDER_STATUS_COLORS.CANCELLED },
  ].filter(d => d.value > 0) : []

  const totalOrderCount = orderPieData.reduce((s, d) => s + d.value, 0)

  if (loading) {
    return <div className="admin-loading">Đang tải...</div>
  }

  if (!stats) {
    return <div className="admin-loading">Không thể tải dữ liệu dashboard</div>
  }

  return (
    <div className="admin-dashboard">
      <h1 className="admin-page-title">Tổng quan</h1>

      {/* ── 4 thẻ KPI ── */}
      <div className="admin-stats">
        {[
          { label: 'Người dùng',  value: (stats.totalUsers   || 0).toLocaleString('vi-VN'), icon: '👥', bg: '#e3f2fd', color: '#1976d2' },
          { label: 'Sản phẩm',    value: (stats.totalBooks   || 0).toLocaleString('vi-VN'), icon: '📚', bg: '#e8f5e9', color: '#388e3c' },
          { label: 'Đơn hàng',    value: (stats.totalOrders  || 0).toLocaleString('vi-VN'), icon: '🛒', bg: '#fff3e0', color: '#f57c00' },
          { label: 'Doanh thu',   value: fmtCompact(stats.totalRevenue),                       icon: '💰', bg: '#fce4ec', color: '#c62828' },
        ].map(item => (
          <div key={item.label} className="admin-stat-card">
            <div className="admin-stat-card__icon" style={{ background: item.bg, color: item.color }}>{item.icon}</div>
            <div className="admin-stat-card__content">
              <span className="admin-stat-card__value" style={{ color: item.color }}>{item.value}</span>
              <span className="admin-stat-card__label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 2 cột: Kho hàng + Biểu đồ trạng thái đơn hàng ── */}
      <div className="admin-dashboard__two-col">

        {/* Kho hàng */}
        <div className="admin-card admin-card--chart">
          <div className="admin-card__header">
            <h2 className="admin-section-title">📦 Kho hàng</h2>
          </div>
          <div className="admin-card__body">
            <div className="stock-grid">
              {[
                { label: 'Tổng sản phẩm', value: stats.totalBooks || 0,       bg: '#e3f2fd', color: '#1976d2', icon: '📦' },
                { label: 'Sắp hết hàng',  value: stats.lowStockBooks || 0,   bg: '#fff3e0', color: '#f57c00', icon: '⚠️' },
                { label: 'Hết hàng',       value: stats.outOfStockBooks || 0, bg: '#ffebee', color: '#c62828', icon: '🚫' },
              ].map(item => (
                <div key={item.label} className="stock-item" style={{ background: item.bg }}>
                  <div style={{ fontSize: '28px' }}>{item.icon}</div>
                  <div className="stock-item__value" style={{ color: item.color }}>{item.value}</div>
                  <div className="stock-item__label">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Thanh tồn kho */}
            {stats.totalBooks > 0 && (
              <div className="stock-bar-wrap">
                <div className="stock-bar-label">
                  <span>Tỷ lệ tồn kho</span>
                  <span>{((stats.totalBooks - (stats.outOfStockBooks || 0)) / stats.totalBooks * 100).toFixed(0)}% có hàng</span>
                </div>
                <div className="stock-bar-track">
                  <div className="stock-bar-fill" style={{
                    width: `${(stats.totalBooks - (stats.outOfStockBooks || 0)) / stats.totalBooks * 100}%`
                  }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Biểu đồ trạng thái đơn hàng */}
        <div className="admin-card admin-card--chart">
          <div className="admin-card__header">
            <h2 className="admin-section-title">📊 Trạng thái đơn hàng</h2>
          </div>
          <div className="admin-card__body admin-card__body--pie">
            {orderPieData.length > 0 ? (
              <>
                <div className="pie-chart-wrap">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={orderPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {orderPieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val, name) => [`${val} đơn (${(val / totalOrderCount * 100).toFixed(0)}%)`, name]}
                        contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-center-label">
                    <div className="pie-center-value">{totalOrderCount}</div>
                    <div className="pie-center-text">đơn hàng</div>
                  </div>
                </div>
                <div className="pie-legend">
                  {orderPieData.map((entry, idx) => (
                    <div key={idx} className="pie-legend__item">
                      <span className="pie-legend__dot" style={{ background: entry.color }} />
                      <span className="pie-legend__name">{entry.name}</span>
                      <span className="pie-legend__val">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="chart-empty">Chưa có đơn hàng nào</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Biểu đồ doanh thu 6 tháng ── */}
      <div className="admin-card admin-card--full">
        <div className="admin-card__header">
          <h2 className="admin-section-title">📈 Doanh thu 6 tháng gần nhất</h2>
          <span className="admin-card__badge">
            Tổng: <strong>{fmt(stats.revenueByMonth?.reduce((s, m) => s + (m.revenue || 0), 0) || 0)}</strong>
          </span>
        </div>
        <div className="admin-card__body">
          {stats.revenueByMonth && stats.revenueByMonth.length > 0 ? (
            <div className="revenue-chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={stats.revenueByMonth.map((m) => ({
                    ...m,
                    revenue: Number(m.revenue) || 0,
                  }))}
                  margin={{ top: 8, right: 16, left: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#666' }}
                    axisLine={false}
                    tickLine={false}
                    dy={6}
                  />
                  <YAxis
                    tickFormatter={fmtCompact}
                    tick={{ fontSize: 11, fill: '#999' }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    formatter={(val) => [fmt(val), 'Doanh thu']}
                    labelFormatter={(label, payload) => payload?.[0] ? `${payload[0].payload.month} ${payload[0].payload.year}` : label}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                    cursor={{ fill: 'rgba(255,106,0,0.05)' }}
                  />
                  <Bar dataKey="revenue" fill={ORANGE} radius={[5, 5, 0, 0]} maxBarSize={52} />
                </BarChart>
              </ResponsiveContainer>

              {/* Bảng chi tiết bên dưới */}
              <div className="revenue-table">
                <div className="revenue-table__header">
                  <span>Tháng</span>
                  <span>Doanh thu</span>
                  <span>Đơn hàng</span>
                  <span>Thanh toán TB</span>
                </div>
                {stats.revenueByMonth.map((item, idx) => (
                  <div key={idx} className="revenue-table__row">
                    <span className="revenue-table__month">{item.month} {item.year}</span>
                    <span className="revenue-table__revenue">{fmt(item.revenue)}</span>
                    <span className="revenue-table__orders">{item.orderCount || 0} đơn</span>
                    <span className="revenue-table__avg">
                      {item.orderCount > 0 ? fmt(item.revenue / item.orderCount) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu doanh thu</div>
          )}
        </div>
      </div>

      {/* ── Biểu đồ top sách bán chạy ── */}
      <div className="admin-card admin-card--full">
        <div className="admin-card__header">
          <h2 className="admin-section-title">🔥 Top sách bán chạy</h2>
        </div>
        <div className="admin-card__body">
          {stats.topSellingBooks && stats.topSellingBooks.length > 0 ? (
            <div className="top-books-layout">
              {/* Biểu đồ ngang */}
              <div className="top-books-chart">
                <ResponsiveContainer width="100%" height={stats.topSellingBooks.length * 60 + 20}>
                  <BarChart
                    data={stats.topSellingBooks}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    barCategoryGap="22%"
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="bookName"
                      tick={{ fontSize: 12, fill: '#444' }}
                      axisLine={false}
                      tickLine={false}
                      width={160}
                      tickFormatter={(v) => v?.length > 22 ? v.slice(0, 22) + '…' : v}
                    />
                    <Tooltip
                      formatter={(val, name, props) => [fmt(val), 'Doanh thu']}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.bookName}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                      cursor={{ fill: 'rgba(255,106,0,0.04)' }}
                    />
                    <Bar dataKey="totalRevenue" radius={[0, 4, 4, 0]} maxBarSize={28}>
                      {stats.topSellingBooks.map((_, idx) => (
                        <Cell key={idx} fill={BOOK_CHART_COLORS[idx % BOOK_CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Bảng xếp hạng */}
              <div className="top-books-table">
                {stats.topSellingBooks.map((book, idx) => (
                  <div key={book.bookId} className="top-book-row">
                    <div className={`top-book-rank top-book-rank--${idx + 1}`}>{idx + 1}</div>
                    <img
                      src={book.image || '/images/no-image.png'}
                      alt={book.bookName}
                      className="top-book-img"
                    />
                    <div className="top-book-info">
                      <div className="top-book-name">{book.bookName}</div>
                      <div className="top-book-sold">Đã bán: {book.totalSold} quyển</div>
                    </div>
                    <div className="top-book-revenue">{fmt(book.totalRevenue)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu bán hàng</div>
          )}
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
                <tr><td colSpan="6" className="admin-table__empty">Chưa có đơn hàng nào</td></tr>
              ) : (
                stats.recentOrders.map(order => (
                  <tr key={order.orderId}>
                    <td>#{order.orderId}</td>
                    <td>{order.username || order.fullName || 'Khách'}</td>
                    <td style={{ fontWeight: '600', color: '#e74c3c' }}>
                      {fmt(order.totalAmount || order.totalPrice)}
                    </td>
                    <td>{getStatusBadge(order.paymentStatus)}</td>
                    <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : '—'}</td>
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
