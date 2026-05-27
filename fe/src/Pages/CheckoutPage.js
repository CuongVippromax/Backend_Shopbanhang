import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { addressApi, orderApi, paymentApi, unwrap } from '../api/shopApi';
import { Icon } from '../components/common/Icon';
import Breadcrumb from '../components/common/Breadcrumb';
import { Spinner } from '../components/common/Spinner';
import Empty from '../components/common/Empty';
import { formatVnd, safeImage } from '../utils/format';

const PHONE_REGEX = /^(\+84|0)[3-9]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SHIPPING_FREE_THRESHOLD = 300000;
const SHIPPING_FEE = 25000;

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Thanh toán khi nhận hàng', desc: 'Bạn thanh toán bằng tiền mặt khi nhận sách.', icon: 'truck' },
  { value: 'VNPAY', label: 'Thanh toán VNPay', desc: 'Thẻ ATM nội địa, Visa, MasterCard, QR code.', icon: 'vnpay' },
];

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useNew, setUseNew] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    shippingAddress: user?.address || '',
    paymentMethod: 'COD',
    note: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    addressApi.list()
      .then((resp) => {
        const list = unwrap(resp) || [];
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) {
          setSelectedAddressId(String(def.id));
          setForm((f) => ({
            ...f,
            fullName: def.recipientName,
            phone: def.phone,
            shippingAddress: def.address,
          }));
        } else {
          setUseNew(true);
        }
      })
      .catch(() => setUseNew(true));
  }, []);

  const items = cart?.items || [];
  const subTotal = cart?.totalPrice || 0;
  const shipping = subTotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subTotal + shipping;

  const selectAddress = (id) => {
    setSelectedAddressId(String(id));
    setUseNew(false);
    const a = addresses.find((x) => String(x.id) === String(id));
    if (a) {
      setForm((f) => ({
        ...f,
        fullName: a.recipientName,
        phone: a.phone,
        shippingAddress: a.address,
      }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ tên';
    if (!PHONE_REGEX.test(form.phone)) e.phone = 'Số điện thoại không hợp lệ (VD: 0901234567)';
    if (!EMAIL_REGEX.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.shippingAddress.trim()) e.shippingAddress = 'Vui lòng nhập địa chỉ';
    if (!form.paymentMethod) e.paymentMethod = 'Vui lòng chọn phương thức';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.show('Giỏ hàng đang trống.', 'warning');
      return;
    }
    if (!validate()) {
      toast.show('Vui lòng kiểm tra thông tin đặt hàng.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const order = await orderApi.checkout(form);
      toast.show('Đặt hàng thành công!', 'success');
      await fetchCart();
      if (form.paymentMethod === 'VNPAY') {
        try {
          const resp = await paymentApi.vnPay(order.orderId, Math.round(total));
          const url = resp?.data?.paymentUrl || resp?.paymentUrl;
          if (url) {
            window.location.href = url;
            return;
          }
        } catch (_) {}
        toast.show('Không thể khởi tạo thanh toán VNPay. Đơn hàng đã lưu, bạn có thể thanh toán sau.', 'warning');
      }
      navigate(`/account/orders/${order.orderId}`);
    } catch (err) {
      const fieldErrors = err.response?.data?.fieldErrors;
      if (fieldErrors) setErrors(fieldErrors);
      toast.show(err.response?.data?.message || 'Không thể đặt hàng. Vui lòng thử lại.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Thanh toán' }]} />
        <div className="container section">
          <Empty
            title="Giỏ hàng trống"
            subtitle="Bạn cần có sản phẩm trong giỏ trước khi thanh toán."
            action={<Link to="/books" className="btn btn-primary">Khám phá sách</Link>}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Giỏ hàng', to: '/cart' }, { label: 'Thanh toán' }]} />

      <section className="section">
        <div className="container">
          <h1 className="checkout-title">Thanh toán</h1>
          <form className="checkout-grid" onSubmit={submit}>
            <div className="checkout-left">
              <div className="card">
                <h3 className="block-title">1. Thông tin giao hàng</h3>

                {addresses.length > 0 && (
                  <div className="addr-options">
                    {addresses.map((a) => (
                      <label
                        key={a.id}
                        className={`addr-option ${String(selectedAddressId) === String(a.id) && !useNew ? 'is-selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="addr"
                          checked={String(selectedAddressId) === String(a.id) && !useNew}
                          onChange={() => selectAddress(a.id)}
                        />
                        <div>
                          <strong>{a.label} {a.isDefault && <span className="badge">Mặc định</span>}</strong>
                          <span>{a.recipientName} · {a.phone}</span>
                          <span className="addr-line">{a.address}</span>
                        </div>
                      </label>
                    ))}
                    <label className={`addr-option ${useNew ? 'is-selected' : ''}`}>
                      <input type="radio" name="addr" checked={useNew} onChange={() => setUseNew(true)} />
                      <div>
                        <strong>Dùng địa chỉ mới</strong>
                        <span>Nhập thông tin giao hàng bên dưới</span>
                      </div>
                    </label>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Họ và tên *</label>
                    <input
                      className="form-control"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      readOnly={!useNew && !!selectedAddressId}
                    />
                    {errors.fullName && <div className="form-error">{errors.fullName}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số điện thoại *</label>
                    <input
                      className="form-control"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="VD: 0901234567"
                      readOnly={!useNew && !!selectedAddressId}
                    />
                    {errors.phone && <div className="form-error">{errors.phone}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  {errors.email && <div className="form-error">{errors.email}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Địa chỉ nhận hàng *</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={form.shippingAddress}
                    onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                    readOnly={!useNew && !!selectedAddressId}
                  />
                  {errors.shippingAddress && <div className="form-error">{errors.shippingAddress}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi chú (tuỳ chọn)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Yêu cầu đặc biệt cho người giao hàng…"
                  />
                </div>
              </div>

              <div className="card">
                <h3 className="block-title">2. Phương thức thanh toán</h3>
                <div className="pay-options">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.value}
                      className={`pay-option ${form.paymentMethod === m.value ? 'is-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="pay"
                        checked={form.paymentMethod === m.value}
                        onChange={() => setForm({ ...form, paymentMethod: m.value })}
                      />
                      <div className="pay-icon">
                        {m.value === 'VNPAY'
                          ? <img src="/image/vnpay.png" alt="VNPay" className="vnpay-img" />
                          : <Icon name={m.icon} size={20} />}
                      </div>
                      <div>
                        <strong>{m.label}</strong>
                        <span>{m.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <aside className="checkout-right">
              <div className="card co-summary">
                <h3 className="block-title">Đơn hàng ({items.length})</h3>
                <div className="co-items">
                  {items.map((it) => (
                    <div className="co-item" key={it.cartItemId}>
                      <div className="co-thumb">
                        <img src={safeImage(it.image, it.bookName)} alt={it.bookName}
                          onError={(e) => { e.currentTarget.src = safeImage(null, it.bookName); }}
                        />
                        <span className="co-qty">{it.quantity}</span>
                      </div>
                      <div className="co-meta">
                        <span>{it.bookName}</span>
                        <strong>{formatVnd(it.totalPrice || it.price * it.quantity)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="sum-divider" />
                <div className="sum-row"><span>Tạm tính</span><strong>{formatVnd(subTotal)}</strong></div>
                <div className="sum-row"><span>Vận chuyển</span><strong>{shipping === 0 ? 'Miễn phí' : formatVnd(shipping)}</strong></div>
                <div className="sum-divider" />
                <div className="sum-row sum-total"><span>Tổng cộng</span><strong>{formatVnd(total)}</strong></div>

                <button type="submit" className="btn btn-primary btn-block btn-lg mt-4" disabled={submitting}>
                  {submitting ? <><Spinner size={14} /> Đang xử lý…</> : 'Đặt hàng ngay'}
                </button>
                <p className="co-terms">
                  Nhấn "Đặt hàng" nghĩa là bạn đồng ý với <Link to="/about">Điều khoản dịch vụ</Link> của Hoàng Kim Books.
                </p>
              </div>
            </aside>
          </form>
        </div>
      </section>

      <style>{`
        .checkout-title { font-family: var(--font-serif); font-size: 30px; margin: 0 0 24px; }
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
          align-items: start;
        }
        .checkout-left { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
        .block-title { font-family: var(--font-serif); font-size: 18px; margin: 0 0 16px; }
        .addr-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .addr-option, .pay-option {
          display: flex; gap: 12px; align-items: flex-start;
          padding: 14px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: border-color var(--t-fast), background var(--t-fast);
        }
        .addr-option.is-selected, .pay-option.is-selected {
          border-color: var(--color-primary);
          background: var(--color-primary-bg);
        }
        .addr-option input, .pay-option input { margin-top: 2px; accent-color: var(--color-primary); }
        .addr-option > div, .pay-option > div { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .addr-option strong { display: flex; align-items: center; gap: 8px; }
        .addr-option span { font-size: 13px; color: var(--color-text-soft); }
        .addr-line { font-size: 12.5px; }

        .pay-options { display: flex; flex-direction: column; gap: 10px; }
        .pay-icon {
          width: 28px; height: 28px;
          border-radius: 6px;
          background: var(--color-bg-alt);
          color: var(--color-primary);
          display: inline-flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .pay-option .pay-icon:has(.vnpay-img) {
          background: #fff;
        }
        .vnpay-img {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        .checkout-right { position: sticky; top: calc(var(--header-h) + 24px); }
        .co-summary .co-items {
          max-height: 320px; overflow: auto;
          display: flex; flex-direction: column; gap: 10px;
          margin-bottom: 10px;
        }
        .co-item { display: flex; gap: 10px; align-items: center; }
        .co-thumb { position: relative; width: 52px; height: 64px; flex-shrink: 0; }
        .co-thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm); background: var(--color-bg-alt); }
        .co-qty {
          position: absolute; top: -6px; right: -6px;
          background: var(--color-primary);
          color: #fff;
          width: 22px; height: 22px;
          border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
        }
        .co-meta { flex: 1; display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
        .co-meta span { font-size: 13px; }
        .co-meta strong { font-size: 14px; font-weight: 700; color: var(--color-text); font-family: var(--font-sans); }
        .sum-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .sum-row span { color: var(--color-text-soft); }
        .sum-row strong { font-weight: 700; }
        .sum-divider { height: 1px; background: var(--color-border-soft); margin: 6px 0; }
        .sum-total strong { color: var(--color-primary); font-size: 22px; font-weight: 800; font-family: var(--font-sans); letter-spacing: -0.5px; }
        .co-terms { font-size: 12px; color: var(--color-text-mute); text-align: center; margin-top: 14px; }
        .co-terms a { font-weight: 600; }

        @media (max-width: 900px) {
          .checkout-grid { grid-template-columns: 1fr; }
          .checkout-right { position: static; }
        }
      `}</style>
    </>
  );
};

export default CheckoutPage;
