import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminOrderApi } from '../../api/shopApi';
import { Icon } from '../../components/common/Icon';
import { FullPageLoader, Spinner } from '../../components/common/Spinner';
import { formatVnd, formatDateTime, safeImage } from '../../utils/format';
import { useToast } from '../../context/ToastContext';

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
const PAY_STATUSES = ['PENDING', 'PAID', 'FAILED', 'CANCELLED'];

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminOrderApi.getById(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const updateStatus = async (status) => {
    setSaving(true);
    try {
      const o = await adminOrderApi.updateStatus(order.orderId, status);
      setOrder(o);
      toast.show('Đã cập nhật trạng thái.', 'success');
    } catch (err) {
      toast.show('Không thể cập nhật.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updatePayment = async (status) => {
    setSaving(true);
    try {
      const o = await adminOrderApi.updatePayment(order.orderId, status);
      setOrder(o);
      toast.show('Đã cập nhật thanh toán.', 'success');
    } catch (err) {
      toast.show('Không thể cập nhật.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <FullPageLoader />;
  if (!order) return (
    <div className="text-center">
      <h2>Không tìm thấy đơn hàng</h2>
      <Link to="/admin/orders" className="btn btn-primary mt-3">Quay lại</Link>
    </div>
  );

  return (
    <div>
      <Link to="/admin/orders" className="text-soft" style={{ fontSize: 13, display: 'inline-flex', gap: 4, alignItems: 'center', marginBottom: 10 }}>
        <Icon name="arrowLeft" size={14} /> Tất cả đơn
      </Link>
      <div className="adm-page-head">
        <div>
          <h1>Đơn hàng #{order.orderId}</h1>
          <p>Đặt ngày {formatDateTime(order.orderDate)}</p>
        </div>
      </div>

      <div className="order-grid">
        <div>
          <div className="card mb-4">
            <h3 className="block-title">Sản phẩm</h3>
            {(order.items || []).map((it) => (
              <div className="od-item" key={it.cartItemId}>
                <img src={safeImage(it.image, it.bookName)} alt={it.bookName}
                  onError={(e) => { e.currentTarget.src = safeImage(null, it.bookName); }}
                />
                <div className="od-info">
                  <strong>{it.bookName}</strong>
                  <span>{formatVnd(it.price)} × {it.quantity}</span>
                </div>
                <strong>{formatVnd(it.totalPrice || it.price * it.quantity)}</strong>
              </div>
            ))}
            <div className="sum-divider" />
            <div className="sum-row"><span>Tạm tính</span><strong>{formatVnd(order.subTotal || order.totalAmount)}</strong></div>
            {order.shippingFee != null && <div className="sum-row"><span>Vận chuyển</span><strong>{order.shippingFee === 0 ? 'Miễn phí' : formatVnd(order.shippingFee)}</strong></div>}
            {order.discount > 0 && <div className="sum-row"><span>Giảm giá</span><strong>-{formatVnd(order.discount)}</strong></div>}
            <div className="sum-row sum-total"><span>Tổng cộng</span><strong>{formatVnd(order.totalAmount)}</strong></div>
          </div>

          <div className="card">
            <h3 className="block-title">Thông tin giao hàng</h3>
            <div className="info-row"><span>Người nhận</span><strong>{order.recipientName || order.fullName}</strong></div>
            <div className="info-row"><span>Số điện thoại</span><strong>{order.recipientPhone}</strong></div>
            <div className="info-row"><span>Địa chỉ</span><strong>{order.shippingAddress}</strong></div>
            {order.note && <div className="info-row"><span>Ghi chú</span><strong>{order.note}</strong></div>}
          </div>
        </div>

        <div>
          <div className="card mb-4">
            <h3 className="block-title">Trạng thái đơn hàng</h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-mute)' }}>Cập nhật trạng thái xử lý.</p>
            <div className="status-options">
              {ORDER_STATUSES.map((s) => (
                <button key={s}
                  className={`status-btn ${order.orderStatus === s ? 'is-active' : ''}`}
                  onClick={() => updateStatus(s)}
                  disabled={saving || order.orderStatus === s}
                >
                  {s}
                </button>
              ))}
            </div>
            {saving && <div className="mt-3"><Spinner size={18} /></div>}
          </div>

          <div className="card">
            <h3 className="block-title">Thanh toán</h3>
            <div className="info-row">
              <span>Phương thức</span>
              <strong className="adm-pay-method">
                {order.paymentMethod === 'VNPAY' && (
                  <img src="/image/vnpay.png" alt="VNPay" className="adm-vnpay-img" />
                )}
                {order.paymentMethod}
              </strong>
            </div>
            <div className="status-options">
              {PAY_STATUSES.map((s) => (
                <button key={s}
                  className={`status-btn ${order.paymentStatus === s ? 'is-active' : ''}`}
                  onClick={() => updatePayment(s)}
                  disabled={saving || order.paymentStatus === s}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .adm-page-head h1 { font-family: var(--font-serif); font-size: 26px; margin: 0; }
        .adm-page-head p { color: var(--color-text-mute); font-size: 13.5px; margin: 4px 0 0; }
        .order-grid { display: grid; grid-template-columns: 1fr 360px; gap: 16px; align-items: start; }
        .block-title { font-family: var(--font-serif); font-size: 18px; margin: 0 0 12px; }
        .od-item { display: grid; grid-template-columns: 56px 1fr auto; gap: 12px; align-items: center; padding: 8px 0; }
        .od-item img { width: 56px; height: 72px; object-fit: cover; border-radius: 6px; background: var(--color-bg-alt); }
        .od-info strong { display: block; font-size: 14px; }
        .od-info span { font-size: 12px; color: var(--color-text-mute); }
        .sum-divider { height: 1px; background: var(--color-border-soft); margin: 10px 0; }
        .sum-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .sum-row span { color: var(--color-text-soft); }
        .sum-total strong { color: var(--color-primary); font-family: var(--font-serif); font-size: 20px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .info-row span { color: var(--color-text-soft); }
        .adm-pay-method { display: inline-flex; align-items: center; gap: 8px; }
        .adm-vnpay-img { width: 28px; height: 28px; object-fit: contain; background: #fff; border-radius: 4px; padding: 2px; border: 1px solid var(--color-border-soft); }
        .status-options { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .status-btn {
          padding: 6px 12px;
          border-radius: 99px;
          background: var(--color-bg-alt);
          color: var(--color-text-soft);
          font-size: 12px;
          font-weight: 600;
          border: 1px solid var(--color-border-soft);
          transition: all var(--t-fast);
        }
        .status-btn:hover:not(:disabled):not(.is-active) { border-color: var(--color-primary-soft); color: var(--color-primary); }
        .status-btn.is-active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); cursor: default; }
        .status-btn:disabled { opacity: 0.7; }
        @media (max-width: 900px) { .order-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default AdminOrderDetailPage;
