import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { getDashboardStats } from '../../api/admin'

const ORANGE = '#ff6a00'
const BOOK_CHART_COLORS = ['#1976d2', '#42a5f5', '#0288d1', '#7b1fa2', '#388e3c']

const ORDER_STATUS_COLORS = {
  PENDING: '#f57c00',
  PROCESSING: '#0288d1',
  SHIPPED: '#7b1fa2',
  COMPLETED: '#388e3c',
  CANCELLED: '#c62828',
}

const ORDER_STATUS_LABELS = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
}

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDashboardStats()
      .then((res) => setStats(res || null))
      .catch((err) => {
        setError(err.message || 'Không tải được dữ liệu')
        setStats(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const formatCurrency = (value) => {
    if (value == null || value === '') return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
  }

  const fmtCompact = (value) => {
    if (value == null && value !== 0) return '0'
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
    return Number(value).toLocaleString('vi-VN')
  }

  if (loading) {
    return <div className="admin-loading">Đang tải dữ liệu...</div>
  }

  if (error) {
    return <div className="admin-loading">Lỗi: {error}</div>
  }

  if (!stats) {
    return <div className="admin-loading">Không thể tải thống kê. Vui lòng thử lại.</div>
  }

  const topBooks = Array.isArray(stats.topSellingBooks) ? stats.topSellingBooks : []

  // Chuẩn hóa revenueByMonth — đảm bảo luôn là mảng, revenue/orderCount là số
  const revenueByMonth = (() => {
    const raw = stats.revenueByMonth
    if (!raw || !Array.isArray(raw)) return []
    return raw.map((m) => ({
      month: m.month ?? '',
      year: m.year ?? new Date().getFullYear(),
      revenue: Number(m.revenue) || 0,
      orderCount: Number(m.orderCount) || 0,
    }))
  })()

  /** Nhãn trục X rõ ràng + tránh Recharts không vẽ tick khi dataKey trùng */
  const monthlyChartData = revenueByMonth.map((m) => ({
    ...m,
    periodLabel: [m.month, m.year].filter((x) => x != null && x !== '').join(' '),
  }))

  const orderPieData = [
    { name: ORDER_STATUS_LABELS.PENDING,    value: Number(stats.pendingOrders) || 0,    color: ORDER_STATUS_COLORS.PENDING },
    { name: ORDER_STATUS_LABELS.PROCESSING, value: Number(stats.processingOrders) || 0, color: ORDER_STATUS_COLORS.PROCESSING },
    { name: ORDER_STATUS_LABELS.SHIPPED,    value: Number(stats.shippedOrders) || 0,    color: ORDER_STATUS_COLORS.SHIPPED },
    { name: ORDER_STATUS_LABELS.COMPLETED,  value: Number(stats.completedOrders) || 0,  color: ORDER_STATUS_COLORS.COMPLETED },
    { name: ORDER_STATUS_LABELS.CANCELLED,  value: Number(stats.cancelledOrders) || 0,  color: ORDER_STATUS_COLORS.CANCELLED },
  ].filter((d) => d.value > 0)

  const totalOrderPie = orderPieData.reduce((s, d) => s + d.value, 0)

  const statsData = [
    { label: 'Người dùng',      value: (stats.totalUsers || 0).toLocaleString('vi-VN'),         icon: '👥', color: '#1976d2', bg: '#e3f2fd' },
    { label: 'Sản phẩm',         value: (stats.totalBooks || 0).toLocaleString('vi-VN'),         icon: '📚', color: '#388e3c', bg: '#e8f5e9' },
    { label: 'Tổng đơn hàng',   value: (stats.totalOrders || 0).toLocaleString('vi-VN'),        icon: '📦', color: '#f57c00', bg: '#fff3e0' },
    { label: 'Doanh thu',        value: formatCurrency(stats.totalRevenue),                        icon: '💰', color: '#d32f2f', bg: '#ffebee', isCurrency: true },
    { label: 'Đơn chờ xử lý',    value: (stats.pendingOrders || 0).toLocaleString('vi-VN'),      icon: '⏳', color: '#7b1fa2', bg: '#f3e5f5' },
    { label: 'Đơn đang giao',    value: (stats.shippedOrders || 0).toLocaleString('vi-VN'),      icon: '🚚', color: '#0288d1', bg: '#e1f5fe' },
    { label: 'Đơn hoàn thành',   value: (stats.completedOrders || 0).toLocaleString('vi-VN'),   icon: '✅', color: '#2e7d32', bg: '#e8f5e9' },
    { label: 'Đơn đã hủy',       value: (stats.cancelledOrders || 0).toLocaleString('vi-VN'),   icon: '❌', color: '#c62828', bg: '#ffebee' },
  ]

  return (
    <div className="admin-statistics">
      <h1 className="admin-page-title">Thống kê tổng quan</h1>

      <div className="admin-stats">
        {statsData.map((item, idx) => (
          <div key={idx} className="admin-stat-card">
            <div className="admin-stat-card__icon" style={{ background: item.bg, color: item.color }}>
              {item.icon}
            </div>
            <div className="admin-stat-card__content">
              <span className="admin-stat-card__value">{item.value}</span>
              <span className="admin-stat-card__label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-dashboard__two-col" style={{ marginTop: 24 }}>
        {/* Sách bán chạy */}
        <div className="admin-card admin-card--chart">
          <div className="admin-card__header">
            <h2 className="admin-section-title">📈 Sách bán chạy</h2>
          </div>
          <div className="admin-card__body">
            {topBooks.length > 0 ? (
              <div className="top-books-layout">
                <div className="top-books-chart">
                  <ResponsiveContainer width="100%" height={Math.max(220, topBooks.length * 56 + 24)}>
                    <BarChart
                      data={topBooks}
                      layout="vertical"
                      margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="bookName"
                        tick={{ fontSize: 11, fill: '#444' }}
                        axisLine={false}
                        tickLine={false}
                        width={140}
                        tickFormatter={(v) => (v && v.length > 18 ? `${v.slice(0, 18)}…` : v)}
                      />
                      <Tooltip
                        formatter={(val) => [`${val} quyển`, 'Đã bán']}
                        labelFormatter={(_, p) => p?.[0]?.payload?.bookName}
                        contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                      />
                      <Bar dataKey="totalSold" radius={[0, 4, 4, 0]} maxBarSize={26}>
                        {topBooks.map((_, idx) => (
                          <Cell key={idx} fill={BOOK_CHART_COLORS[idx % BOOK_CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="top-books-table">
                  {topBooks.map((book, idx) => (
                    <div key={book.bookId ?? idx} className="top-book-row">
                      <div className={`top-book-rank top-book-rank--${idx + 1}`}>{idx + 1}</div>
                      <img src={book.image || '/images/no-image.png'} alt="" className="top-book-img" />
                      <div className="top-book-info">
                        <div className="top-book-name">{book.bookName}</div>
                        <div className="top-book-sold">Đã bán: {Number(book.totalSold) || 0} quyển</div>
                      </div>
                      <div className="top-book-revenue">{formatCurrency(book.totalRevenue)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="chart-empty">Chưa có dữ liệu bán hàng</div>
            )}
          </div>
        </div>

        {/* Doanh thu theo tháng */}
        <div className="admin-card admin-card--chart">
          <div className="admin-card__header">
            <h2 className="admin-section-title">💹 Doanh thu theo tháng</h2>
            <span className="admin-card__badge">
              6 tháng:{' '}
              <strong>
                {formatCurrency(revenueByMonth.reduce((s, m) => s + (Number(m.revenue) || 0), 0))}
              </strong>
            </span>
          </div>
          <div className="admin-card__body">
            {revenueByMonth.length > 0 ? (
              <div className="revenue-chart-wrap admin-stats-revenue-chart">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthlyChartData} margin={{ top: 8, right: 8, left: 0, bottom: 28 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="periodLabel"
                      tick={{ fontSize: 10, fill: '#666' }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={48}
                    />
                    <YAxis
                      tickFormatter={fmtCompact}
                      tick={{ fontSize: 10, fill: '#999' }}
                      axisLine={false}
                      tickLine={false}
                      width={56}
                      domain={[0, (dataMax) => Math.max((Number(dataMax) || 0) * 1.08, 1)]}
                    />
                    <Tooltip
                      formatter={(val) => [formatCurrency(val), 'Doanh thu']}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.periodLabel ?? ''}
                      contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13 }}
                    />
                    <Bar dataKey="revenue" fill={ORANGE} radius={[5, 5, 0, 0]} maxBarSize={44} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="revenue-table">
                  <div className="revenue-table__header">
                    <span>Tháng</span>
                    <span>Doanh thu</span>
                    <span>Đơn</span>
                    <span>TB/đơn</span>
                  </div>
                  {revenueByMonth.map((item, idx) => (
                    <div key={idx} className="revenue-table__row">
                      <span className="revenue-table__month">
                        {item.month} {item.year}
                      </span>
                      <span className="revenue-table__revenue">{formatCurrency(item.revenue)}</span>
                      <span className="revenue-table__orders">{item.orderCount || 0}</span>
                      <span className="revenue-table__avg">
                        {item.orderCount > 0 ? formatCurrency(item.revenue / item.orderCount) : '—'}
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
      </div>

      {/* Tỷ lệ trạng thái đơn hàng */}
      <div className="admin-card admin-card--chart" style={{ marginTop: 24 }}>
        <div className="admin-card__header">
          <h2 className="admin-section-title">📊 Tỷ lệ trạng thái đơn hàng</h2>
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
                      innerRadius={58}
                      outerRadius={96}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {orderPieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} đơn (${((val / totalOrderPie) * 100).toFixed(1)}%)`, name]}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-center-label">
                  <div className="pie-center-value">{totalOrderPie}</div>
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
            <div className="chart-empty">Chưa có đơn hàng</div>
          )}
        </div>
      </div>
    </div>
  )
}
