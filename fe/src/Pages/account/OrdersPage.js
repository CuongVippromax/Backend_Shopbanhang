import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi, unwrapPage } from '../../api/shopApi';
import { Spinner } from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import Empty from '../../components/common/Empty';
import { formatVnd, formatDateTime, safeImage } from '../../utils/format';

const STATUS_LABELS = {
  PENDING: { label: 'Đang chờ', cls: 'st-pending' },
  PROCESSING: { label: 'Đang xử lý', cls: 'st-processing' },
  SHIPPED: { label: 'Đang giao', cls: 'st-shipped' },
  COMPLETED: { label: 'Hoàn thành', cls: 'st-completed' },
  CANCELLED: { label: 'Đã huỷ', cls: 'st-cancelled' },
};

const PAGE_SIZE = 10;

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    orderApi.myOrders(page, PAGE_SIZE)
      .then((resp) => {
        const p = unwrapPage(resp);
        setOrders(p.items);
        setPageInfo({ pageNo: p.pageNo || page, totalPages: p.totalPages || 1 });
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <div className="card mb-4">
        <h2 className="page-title">Đơn hàng của tôi</h2>
        <p className="page-sub">Theo dõi trạng thái và xem chi tiết các đơn đã đặt.</p>
      </div>

      {loading && <div className="card text-center"><Spinner size={28} /></div>}

      {!loading && orders.length === 0 && (
        <div className="card">
          <Empty title="Chưa có đơn hàng" subtitle="Bạn chưa đặt đơn nào. Hãy bắt đầu mua sắm!"
            action={<Link to="/books" className="btn btn-primary">Khám phá sách</Link>}
          />
        </div>
      )}

      <div className="orders-list">
        {orders.map((o) => {
          const status = STATUS_LABELS[o.orderStatus] || { label: o.orderStatus, cls: 'st-pending' };
          return (
            <div className="order-card" key={o.orderId}>
              <div className="order-head">
                <div>
                  <strong>Đơn #{o.orderId}</strong>
                  <span>{formatDateTime(o.orderDate)}</span>
                </div>
                <span className={`order-status ${status.cls}`}>{status.label}</span>
              </div>
              <div className="order-body">
                {(o.items || []).slice(0, 3).map((it) => (
                  <div className="order-item" key={it.cartItemId}>
                    <img src={safeImage(it.image, it.bookName)} alt={it.bookName}
                      onError={(e) => { e.currentTarget.src = safeImage(null, it.bookName); }} />
                    <div className="order-item-meta">
                      <span>{it.bookName}</span>
                      <small>{it.quantity} × {formatVnd(it.price)}</small>
                    </div>
                  </div>
                ))}
                {o.items?.length > 3 && (
                  <div className="order-more">+{o.items.length - 3} sản phẩm khác</div>
                )}
              </div>
              <div className="order-foot">
                <div className="order-total">
                  <span>Tổng cộng:</span>
                  <strong>{formatVnd(o.totalAmount)}</strong>
                </div>
                <Link to={`/account/orders/${o.orderId}`} className="btn btn-secondary btn-sm">
                  Xem chi tiết
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination pageNo={pageInfo.pageNo} totalPages={pageInfo.totalPages} onChange={setPage} />

      <style>{`
        .orders-list { display: flex; flex-direction: column; gap: 14px; }
        .order-card { background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border-soft); overflow: hidden; }
        .order-head {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 20px;
          border-bottom: 1px solid var(--color-border-soft);
          background: var(--color-bg-alt);
        }
        .order-head strong { display: block; font-size: 15px; }
        .order-head span:not(.order-status) { font-size: 12.5px; color: var(--color-text-mute); }

        .order-status {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 99px;
        }
        .st-pending { background: var(--color-accent-bg); color: #8a6614; }
        .st-processing { background: #e3f2ff; color: #1962a8; }
        .st-shipped { background: var(--color-primary-bg); color: var(--color-primary); }
        .st-completed { background: #d8f0e2; color: #1d6c44; }
        .st-cancelled { background: var(--color-danger-soft); color: var(--color-danger); }

        .order-body { padding: 14px 20px; display: flex; flex-direction: column; gap: 10px; }
        .order-item { display: flex; align-items: center; gap: 12px; }
        .order-item img { width: 52px; height: 64px; object-fit: cover; border-radius: var(--radius-sm); background: var(--color-bg-alt); }
        .order-item-meta { display: flex; flex-direction: column; gap: 2px; }
        .order-item-meta span { font-size: 14px; color: var(--color-text); }
        .order-item-meta small { font-size: 12px; color: var(--color-text-mute); }
        .order-more { font-size: 13px; color: var(--color-text-mute); }

        .order-foot {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 20px;
          border-top: 1px solid var(--color-border-soft);
        }
        .order-total span { color: var(--color-text-soft); margin-right: 6px; }
        .order-total strong { font-family: var(--font-serif); color: var(--color-primary); font-size: 18px; }
      `}</style>
    </div>
  );
};

export default OrdersPage;
