import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminDashboardApi } from '../../api/shopApi';
import { Icon } from '../../components/common/Icon';
import { Spinner } from '../../components/common/Spinner';
import { formatVnd, formatNumber, formatDateTime, safeImage } from '../../utils/format';

const STAT_CARDS = [
  { key: 'totalUsers', label: 'Người dùng', icon: 'user', color: '#7fb5a0' },
  { key: 'totalBooks', label: 'Đầu sách', icon: 'book', color: '#c89b3c' },
  { key: 'totalOrders', label: 'Đơn hàng', icon: 'package', color: '#4d7866' },
  { key: 'totalRevenue', label: 'Doanh thu', icon: 'medal', color: '#b3563b', currency: true },
];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDashboardApi.stats()
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center"><Spinner size={28} /></div>;
  }

  if (!stats) {
    return <div className="card text-center">Không thể tải dữ liệu thống kê.</div>;
  }

  const maxRevenue = Math.max(1, ...(stats.revenueByMonth || []).map((r) => r.revenue || 0));

  return (
    <div>
      <div className="adm-head">
        <h1>Tổng quan</h1>
        <p>Tình hình hoạt động của Hoàng Kim Books trong thời gian gần đây.</p>
      </div>

      <div className="stat-grid">
        {STAT_CARDS.map((card) => (
          <div className="stat-card" key={card.key}>
            <div className="stat-icon" style={{ background: `${card.color}22`, color: card.color }}>
              <Icon name={card.icon} size={24} />
            </div>
            <div>
              <span>{card.label}</span>
              <strong>{card.currency ? formatVnd(stats[card.key] || 0) : formatNumber(stats[card.key] || 0)}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-grid">
        <div className="card">
          <h3 className="block-title">Doanh thu theo tháng</h3>
          {(stats.revenueByMonth || []).length === 0 ? (
            <p className="text-mute">Chưa có dữ liệu</p>
          ) : (
            <div className="chart-bars">
              {stats.revenueByMonth.map((r, i) => (
                <div className="bar-col" key={i}>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ height: `${(r.revenue / maxRevenue) * 100}%` }} title={formatVnd(r.revenue)} />
                  </div>
                  <span className="bar-label">{r.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="block-title">Trạng thái đơn hàng</h3>
          <div className="status-pill"><span>Đang chờ</span><strong>{formatNumber(stats.pendingOrders || 0)}</strong></div>
          <div className="status-pill"><span>Đã gửi</span><strong>{formatNumber(stats.shippedOrders || 0)}</strong></div>
          <div className="status-pill"><span>Hoàn thành</span><strong>{formatNumber(stats.completedOrders || 0)}</strong></div>
          <div className="status-pill"><span>Đã huỷ</span><strong>{formatNumber(stats.cancelledOrders || 0)}</strong></div>
          <div className="sum-divider" />
          <div className="status-pill warn"><span>Sách sắp hết</span><strong>{formatNumber(stats.lowStockBooks || 0)}</strong></div>
          <div className="status-pill warn"><span>Sách hết hàng</span><strong>{formatNumber(stats.outOfStockBooks || 0)}</strong></div>
        </div>
      </div>

      <div className="adm-grid">
        <div className="card">
          <div className="block-title-row">
            <h3 className="block-title">Sản phẩm bán chạy</h3>
            <Link to="/admin/books" className="text-link">Quản lý sách →</Link>
          </div>
          {(stats.topSellingBooks || []).length === 0 ? (
            <p className="text-mute">Chưa có dữ liệu</p>
          ) : (
            <div className="top-list">
              {stats.topSellingBooks.map((b, i) => (
                <div className="top-row" key={b.bookId || i}>
                  <span className="top-rank">{i + 1}</span>
                  <img src={safeImage(b.image, b.bookName)} alt={b.bookName}
                    onError={(e) => { e.currentTarget.src = safeImage(null, b.bookName); }}
                  />
                  <div className="top-meta">
                    <strong>{b.bookName}</strong>
                    <span>Đã bán: {formatNumber(b.totalSold || 0)}</span>
                  </div>
                  <span className="top-rev">{formatVnd(b.totalRevenue || 0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="block-title-row">
            <h3 className="block-title">Đơn hàng gần đây</h3>
            <Link to="/admin/orders" className="text-link">Tất cả đơn →</Link>
          </div>
          {(stats.recentOrders || []).length === 0 ? (
            <p className="text-mute">Chưa có dữ liệu</p>
          ) : (
            <div className="recent-list">
              {stats.recentOrders.slice(0, 6).map((o) => (
                <Link className="recent-row" to={`/admin/orders/${o.orderId}`} key={o.orderId}>
                  <div>
                    <strong>#{o.orderId}</strong>
                    <span>{o.fullName || o.recipientName}</span>
                  </div>
                  <div className="recent-amount">
                    <strong>{formatVnd(o.totalAmount)}</strong>
                    <span>{formatDateTime(o.orderDate)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .adm-head { margin-bottom: 22px; }
        .adm-head h1 { font-family: var(--font-serif); font-size: 28px; margin: 0; }
        .adm-head p { color: var(--color-text-mute); margin: 4px 0 0; }

        .stat-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
          margin-bottom: 22px;
        }
        .stat-card {
          display: flex; gap: 14px; align-items: center;
          padding: 20px;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-soft);
        }
        .stat-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stat-card span { font-size: 13px; color: var(--color-text-mute); text-transform: uppercase; letter-spacing: 1px; }
        .stat-card strong { display: block; font-size: 22px; font-family: var(--font-serif); }

        .adm-grid {
          display: grid; grid-template-columns: 2fr 1fr; gap: 16px;
          margin-bottom: 16px;
        }
        .adm-grid:last-child { grid-template-columns: 1fr 1fr; }
        .block-title { font-family: var(--font-serif); font-size: 18px; margin: 0 0 14px; }
        .block-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .block-title-row .block-title { margin: 0; }
        .text-link { font-size: 13px; font-weight: 600; color: var(--color-primary); }

        .chart-bars { display: flex; gap: 10px; align-items: flex-end; height: 200px; }
        .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; gap: 8px; }
        .bar-track { width: 24px; flex: 1; background: var(--color-bg-alt); border-radius: 6px; position: relative; overflow: hidden; display: flex; align-items: flex-end; }
        .bar-fill {
          width: 100%;
          background: linear-gradient(180deg, var(--color-primary-soft), var(--color-primary));
          border-radius: 6px;
          min-height: 2px;
          transition: height 0.5s ease;
        }
        .bar-label { font-size: 11px; color: var(--color-text-mute); }

        .status-pill {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          background: var(--color-bg-alt);
          margin-bottom: 8px;
          font-size: 13.5px;
        }
        .status-pill.warn { background: var(--color-accent-bg); color: #8a6614; }
        .status-pill strong { font-weight: 700; }
        .sum-divider { height: 1px; background: var(--color-border-soft); margin: 12px 0; }

        .top-list, .recent-list { display: flex; flex-direction: column; gap: 10px; }
        .top-row {
          display: grid;
          grid-template-columns: 24px 40px 1fr auto;
          gap: 12px;
          align-items: center;
          padding: 8px 10px;
          border-radius: var(--radius-md);
        }
        .top-row:hover { background: var(--color-bg-alt); }
        .top-rank {
          width: 24px; height: 24px;
          border-radius: 50%;
          background: var(--color-primary-bg);
          color: var(--color-primary);
          font-weight: 700;
          font-size: 12px;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .top-row img { width: 40px; height: 52px; object-fit: cover; border-radius: 4px; background: var(--color-bg-alt); }
        .top-meta strong { display: block; font-size: 13.5px; }
        .top-meta span { font-size: 12px; color: var(--color-text-mute); }
        .top-rev { font-family: var(--font-serif); color: var(--color-primary); font-weight: 700; }

        .recent-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          background: var(--color-bg-alt);
          color: inherit;
          font-size: 13.5px;
        }
        .recent-row:hover { background: var(--color-primary-bg); }
        .recent-row strong { display: block; }
        .recent-row span { font-size: 12px; color: var(--color-text-mute); }
        .recent-amount { text-align: right; }
        .recent-amount strong { color: var(--color-primary); }

        @media (max-width: 900px) {
          .stat-grid { grid-template-columns: 1fr 1fr; }
          .adm-grid, .adm-grid:last-child { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardPage;
