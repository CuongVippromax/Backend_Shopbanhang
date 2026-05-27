import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderApi } from '../../api/shopApi';
import { FullPageLoader, Spinner } from '../../components/common/Spinner';
import { Icon } from '../../components/common/Icon';
import { formatVnd, formatDateTime, safeImage } from '../../utils/format';
import { useToast } from '../../context/ToastContext';

const STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED'];
const STATUS_LABELS = {
  PENDING: 'Đang chờ xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  COMPLETED: 'Đã giao thành công',
  CANCELLED: 'Đã huỷ',
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    setLoading(true);
    orderApi.getById(id)
      .then((o) => setOrder(o))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const onCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn huỷ đơn này?')) return;
    setCancelling(true);
    try {
      const o = await orderApi.cancel(order.orderId);
      setOrder(o);
      toast.show('Đơn hàng đã được huỷ.', 'info');
    } catch (err) {
      toast.show(err.response?.data?.message || 'Không thể huỷ đơn.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <FullPageLoader />;
  if (!order) {
    return (
      <div className="card text-center">
        <h2>Không tìm thấy đơn hàng</h2>
        <Link to="/account/orders" className="btn btn-primary mt-3">Quay lại</Link>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'CANCELLED';
  const canCancel = ['PENDING', 'PROCESSING'].includes(order.orderStatus);

  return (
    <div className="order-detail">
      <div className="card">
        <div className="od-head">
          <div>
            <Link to="/account/orders" className="od-back"><Icon name="arrowLeft" size={14} /> Tất cả đơn hàng</Link>
            <h2>Đơn hàng #{order.orderId}</h2>
            <p className="od-sub">Đặt ngày {formatDateTime(order.orderDate)}</p>
          </div>
          <div className="od-actions">
            {canCancel && (
              <button className="btn btn-secondary btn-sm" onClick={onCancel} disabled={cancelling}>
                {cancelling ? <><Spinner size={14} /> Đang huỷ…</> : 'Huỷ đơn'}
              </button>
            )}
          </div>
        </div>

        {isCancelled ? (
          <div className="status-cancelled">
            <Icon name="x" size={18} />
            <strong>Đơn hàng đã huỷ</strong>
          </div>
        ) : (
          <div className="status-tracker">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className={`tracker-step ${i <= currentStep ? 'is-done' : ''} ${i === currentStep ? 'is-current' : ''}`}>
                <div className="tracker-dot">{i <= currentStep ? <Icon name="check" size={14} color="#fff" /> : i + 1}</div>
                <span>{STATUS_LABELS[s]}</span>
              </div>
            ))}
            <div className="tracker-bar" style={{ '--progress': `${(Math.max(0, currentStep) / (STATUS_STEPS.length - 1)) * 100}%` }} />
          </div>
        )}
      </div>

      <div className="od-grid">
        <div className="card">
          <h3 className="block-title">Sản phẩm ({order.items?.length || 0})</h3>
          <div className="od-items">
            {(order.items || []).map((it) => (
              <div className="od-item" key={it.cartItemId}>
                <img src={safeImage(it.image, it.bookName)} alt={it.bookName}
                  onError={(e) => { e.currentTarget.src = safeImage(null, it.bookName); }}
                />
                <div className="od-item-info">
                  <Link to={`/books/${it.bookId}`}><strong>{it.bookName}</strong></Link>
                  <span>{formatVnd(it.price)} × {it.quantity}</span>
                </div>
                <strong className="od-item-total">{formatVnd(it.totalPrice || it.price * it.quantity)}</strong>
              </div>
            ))}
          </div>
          <div className="sum-divider" />
          <div className="sum-row"><span>Tạm tính</span><strong>{formatVnd(order.subTotal || order.totalAmount)}</strong></div>
          {order.shippingFee != null && (
            <div className="sum-row"><span>Vận chuyển</span><strong>{order.shippingFee === 0 ? 'Miễn phí' : formatVnd(order.shippingFee)}</strong></div>
          )}
          {order.discount > 0 && (
            <div className="sum-row"><span>Giảm giá</span><strong>-{formatVnd(order.discount)}</strong></div>
          )}
          <div className="sum-divider" />
          <div className="sum-row sum-total"><span>Tổng cộng</span><strong>{formatVnd(order.totalAmount)}</strong></div>
        </div>

        <div>
          <div className="card mb-4">
            <h3 className="block-title">Thông tin giao hàng</h3>
            <div className="od-info-row"><Icon name="user" size={14} /><strong>{order.recipientName || order.fullName}</strong></div>
            <div className="od-info-row"><Icon name="phone" size={14} /><span>{order.recipientPhone}</span></div>
            <div className="od-info-row"><Icon name="location" size={14} /><span>{order.shippingAddress}</span></div>
            {order.note && <div className="od-info-row"><Icon name="chat" size={14} /><span>{order.note}</span></div>}
          </div>

          <div className="card">
            <h3 className="block-title">Thanh toán</h3>
            <div className="od-info-row">
              <span>Phương thức</span>
              <strong>{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}</strong>
            </div>
            <div className="od-info-row">
              <span>Trạng thái</span>
              <strong className={`pay-tag pay-${(order.paymentStatus || 'PENDING').toLowerCase()}`}>
                {order.paymentStatus === 'PAID' ? 'Đã thanh toán' :
                  order.paymentStatus === 'FAILED' ? 'Thất bại' :
                  order.paymentStatus === 'CANCELLED' ? 'Đã huỷ' : 'Chưa thanh toán'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .order-detail { display: flex; flex-direction: column; gap: 16px; }
        .od-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
        .od-back { font-size: 13px; color: var(--color-text-soft); display: inline-flex; gap: 4px; align-items: center; margin-bottom: 6px; }
        .od-head h2 { font-family: var(--font-serif); margin: 0; }
        .od-sub { color: var(--color-text-mute); font-size: 13.5px; margin: 4px 0 0; }
        .block-title { font-family: var(--font-serif); font-size: 18px; margin: 0 0 16px; }

        .status-tracker {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding: 18px 8px 8px;
          position: relative;
        }
        .tracker-bar {
          position: absolute;
          height: 4px;
          background: var(--color-border-soft);
          top: 36px; left: 12.5%; right: 12.5%;
          border-radius: 4px;
          z-index: 0;
        }
        .tracker-bar::before {
          content: ''; position: absolute; top: 0; left: 0; bottom: 0;
          width: var(--progress, 0%);
          background: var(--color-primary);
          border-radius: 4px;
          transition: width 0.4s ease;
        }
        .tracker-step {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          font-size: 13px; color: var(--color-text-mute);
          text-align: center;
        }
        .tracker-step.is-done { color: var(--color-text); }
        .tracker-step.is-current { color: var(--color-primary); font-weight: 600; }
        .tracker-dot {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: var(--color-bg-alt);
          color: var(--color-text-mute);
          font-weight: 700;
          display: inline-flex; align-items: center; justify-content: center;
          border: 2px solid var(--color-border-soft);
          transition: background var(--t-base), border-color var(--t-base);
        }
        .tracker-step.is-done .tracker-dot { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
        .status-cancelled {
          display: flex; align-items: center; gap: 8px;
          padding: 14px;
          background: var(--color-danger-soft);
          color: var(--color-danger);
          border-radius: var(--radius-md);
          font-weight: 600;
        }

        .od-grid { display: grid; grid-template-columns: 1fr 360px; gap: 16px; align-items: start; }
        .od-items { display: flex; flex-direction: column; gap: 14px; }
        .od-item {
          display: grid;
          grid-template-columns: 60px 1fr auto;
          gap: 14px;
          align-items: center;
        }
        .od-item img { width: 60px; height: 76px; object-fit: cover; border-radius: var(--radius-sm); background: var(--color-bg-alt); }
        .od-item-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .od-item-info strong { font-size: 14.5px; }
        .od-item-info span { font-size: 12.5px; color: var(--color-text-mute); }
        .od-item-total { font-family: var(--font-serif); color: var(--color-primary); font-size: 16px; }

        .sum-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .sum-row span { color: var(--color-text-soft); }
        .sum-divider { height: 1px; background: var(--color-border-soft); margin: 8px 0; }
        .sum-total span { color: var(--color-text); font-weight: 600; }
        .sum-total strong { color: var(--color-primary); font-family: var(--font-serif); font-size: 20px; }

        .od-info-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; font-size: 14px; color: var(--color-text-soft); }
        .od-info-row strong { color: var(--color-text); }
        .od-info-row svg { color: var(--color-primary); flex-shrink: 0; }

        .pay-tag { padding: 2px 10px; border-radius: 99px; font-size: 12px; }
        .pay-paid { background: #d8f0e2; color: #1d6c44; }
        .pay-pending { background: var(--color-accent-bg); color: #8a6614; }
        .pay-failed, .pay-cancelled { background: var(--color-danger-soft); color: var(--color-danger); }

        @media (max-width: 900px) {
          .od-grid { grid-template-columns: 1fr; }
          .status-tracker { grid-template-columns: repeat(2, 1fr); }
          .tracker-bar { display: none; }
        }
      `}</style>
    </div>
  );
};

export default OrderDetailPage;
