import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/common/Icon';
import Breadcrumb from '../components/common/Breadcrumb';
import Empty from '../components/common/Empty';
import { formatVnd, safeImage } from '../utils/format';

const SHIPPING_FREE_THRESHOLD = 300000;
const SHIPPING_FEE = 25000;

const CartPage = () => {
  const { cart, loading, updateItem, removeItem, clear } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="container section">
        <Empty
          title="Đăng nhập để xem giỏ hàng"
          subtitle="Bạn cần đăng nhập để thêm và quản lý sản phẩm trong giỏ hàng."
          action={
            <Link to="/auth/login" className="btn btn-primary">Đăng nhập ngay</Link>
          }
        />
      </div>
    );
  }

  const items = cart?.items || [];
  const subTotal = cart?.totalPrice || 0;
  const shipping = subTotal >= SHIPPING_FREE_THRESHOLD || items.length === 0 ? 0 : SHIPPING_FEE;
  const total = subTotal + shipping;

  return (
    <>
      <Breadcrumb items={[{ label: 'Giỏ hàng' }]} />
      <section className="section">
        <div className="container">
          <div className="cart-head">
            <h1 className="cart-title">Giỏ hàng của bạn</h1>
            {items.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clear}>
                <Icon name="trash" size={14} /> Xoá toàn bộ
              </button>
            )}
          </div>

          {(!loading && items.length === 0) ? (
            <Empty
              title="Giỏ hàng trống"
              subtitle="Hãy khám phá hàng ngàn đầu sách hấp dẫn tại Hoàng Kim Books."
              action={<Link to="/books" className="btn btn-primary">Mua sắm ngay</Link>}
            />
          ) : (
            <div className="cart-grid">
              <div className="cart-items">
                <div className="cart-header-row">
                  <span>Sản phẩm</span>
                  <span>Đơn giá</span>
                  <span>Số lượng</span>
                  <span className="text-right">Thành tiền</span>
                  <span></span>
                </div>
                {items.map((item) => (
                  <div className="cart-row" key={item.cartItemId}>
                    <Link to={`/books/${item.bookId}`} className="cart-product">
                      <img
                        src={safeImage(item.image, item.bookName)}
                        alt={item.bookName}
                        onError={(e) => { e.currentTarget.src = safeImage(null, item.bookName); }}
                      />
                      <div>
                        <h4>{item.bookName}</h4>
                        <span className="cart-mobile-price">{formatVnd(item.price)}</span>
                      </div>
                    </Link>
                    <div className="cart-price">{formatVnd(item.price)}</div>
                    <div className="cart-qty">
                      <div className="qty-input">
                        <button onClick={() => updateItem(item.bookId, Math.max(1, item.quantity - 1))} aria-label="Giảm">
                          <Icon name="minus" size={14} />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.bookId, Math.max(1, parseInt(e.target.value || '1', 10)))}
                          min={1}
                        />
                        <button onClick={() => updateItem(item.bookId, item.quantity + 1)} aria-label="Tăng">
                          <Icon name="plus" size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="cart-total">{formatVnd(item.totalPrice || item.price * item.quantity)}</div>
                    <button className="cart-remove" onClick={() => removeItem(item.bookId)} aria-label="Xoá">
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                ))}
                <Link to="/books" className="btn btn-secondary mt-4">
                  <Icon name="arrowLeft" size={14} /> Tiếp tục mua sắm
                </Link>
              </div>

              <aside className="cart-summary">
                <h3>Tóm tắt đơn hàng</h3>
                <div className="sum-row"><span>Tạm tính ({cart?.totalItems || 0} sản phẩm)</span><strong>{formatVnd(subTotal)}</strong></div>
                <div className="sum-row">
                  <span>Phí vận chuyển</span>
                  <strong>{shipping === 0 ? 'Miễn phí' : formatVnd(shipping)}</strong>
                </div>
                {subTotal > 0 && subTotal < SHIPPING_FREE_THRESHOLD && (
                  <div className="sum-note">
                    Mua thêm <strong>{formatVnd(SHIPPING_FREE_THRESHOLD - subTotal)}</strong> để được miễn phí vận chuyển!
                  </div>
                )}
                <div className="sum-divider" />
                <div className="sum-row sum-total">
                  <span>Tổng cộng</span>
                  <strong>{formatVnd(total)}</strong>
                </div>
                <button
                  className="btn btn-primary btn-block btn-lg mt-4"
                  onClick={() => navigate('/checkout')}
                  disabled={items.length === 0}
                >
                  Tiến hành thanh toán <Icon name="arrow" size={16} />
                </button>
                <div className="sum-secure">
                  <Icon name="shield" size={14} /> Giao dịch được mã hoá và bảo vệ
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .cart-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .cart-title { font-family: var(--font-serif); font-size: 30px; margin: 0; }
        .cart-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
          align-items: start;
        }
        .cart-items {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: 8px 18px 22px;
          border: 1px solid var(--color-border-soft);
        }
        .cart-header-row, .cart-row {
          display: grid;
          grid-template-columns: 2.2fr 1fr 1.2fr 1fr 36px;
          gap: 16px;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid var(--color-border-soft);
        }
        .cart-header-row {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: var(--color-text-mute);
          font-weight: 600;
        }
        .cart-product {
          display: flex; gap: 12px; align-items: center;
          color: inherit;
        }
        .cart-product img {
          width: 72px; height: 96px;
          object-fit: cover;
          border-radius: var(--radius-md);
          background: var(--color-bg-alt);
        }
        .cart-product h4 { margin: 0; font-size: 14.5px; line-height: 1.35; }
        .cart-mobile-price { display: none; }
        .cart-price { font-weight: 600; color: var(--color-text-soft); }
        .cart-total { font-weight: 700; font-family: var(--font-serif); color: var(--color-primary); }
        .text-right { text-align: right; }
        .cart-row .cart-total { text-align: right; }
        .qty-input {
          display: inline-flex; align-items: center;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .qty-input button { width: 30px; height: 32px; display: inline-flex; align-items: center; justify-content: center; }
        .qty-input button:hover { background: var(--color-bg-alt); }
        .qty-input input { width: 44px; height: 32px; text-align: center; border: 0; outline: none; font-weight: 600; }
        .qty-input input::-webkit-outer-spin-button, .qty-input input::-webkit-inner-spin-button { display: none; }
        .cart-remove {
          width: 32px; height: 32px;
          border-radius: 50%;
          color: var(--color-text-mute);
          display: inline-flex; align-items: center; justify-content: center;
          transition: background var(--t-fast), color var(--t-fast);
          justify-self: center;
        }
        .cart-remove:hover { background: var(--color-danger-soft); color: var(--color-danger); }

        .cart-summary {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: 22px;
          border: 1px solid var(--color-border-soft);
          position: sticky;
          top: calc(var(--header-h) + 24px);
        }
        .cart-summary h3 { margin: 0 0 16px; font-family: var(--font-serif); font-size: 20px; }
        .sum-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .sum-row span { color: var(--color-text-soft); }
        .sum-row strong { color: var(--color-text); }
        .sum-note {
          background: var(--color-accent-bg);
          color: #8a6614;
          padding: 8px 12px;
          border-radius: var(--radius-md);
          font-size: 12.5px;
          margin: 6px 0;
        }
        .sum-divider { height: 1px; background: var(--color-border-soft); margin: 10px 0; }
        .sum-total span { color: var(--color-text); font-weight: 600; }
        .sum-total strong { color: var(--color-primary); font-size: 22px; font-family: var(--font-serif); }
        .sum-secure {
          display: flex; align-items: center; gap: 6px;
          margin-top: 12px;
          font-size: 12px;
          color: var(--color-text-mute);
          justify-content: center;
        }

        @media (max-width: 900px) {
          .cart-grid { grid-template-columns: 1fr; }
          .cart-header-row { display: none; }
          .cart-row {
            grid-template-columns: 80px 1fr auto;
            grid-template-areas:
              "img info remove"
              "img qty total";
            gap: 10px;
          }
          .cart-product { grid-area: img / img / info / info; align-items: flex-start; }
          .cart-product img { width: 80px; height: 100px; }
          .cart-product > div { flex: 1; }
          .cart-mobile-price { display: block; font-size: 13.5px; color: var(--color-primary); font-weight: 700; margin-top: 4px; }
          .cart-price { display: none; }
          .cart-qty { grid-area: qty; }
          .cart-total { grid-area: total; text-align: right; }
          .cart-remove { grid-area: remove; align-self: flex-start; justify-self: end; }
        }
      `}</style>
    </>
  );
};

export default CartPage;
