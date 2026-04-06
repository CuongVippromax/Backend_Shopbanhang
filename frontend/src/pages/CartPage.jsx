import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getCart, setCart, removeFromCart, updateQuantity, clearCart } from '../utils/cart'
import { getUser, isLoggedIn, apiPost, apiDelete, apiGet } from '../api/client'

function getImageSrc(image) {
  if (!image || typeof image !== 'string') return null
  const t = image.trim()
  if (!t) return null
  if (/^https?:\/\//i.test(t)) return t
  if (t.startsWith('/')) return window.location.origin + t
  return t
}

/** Icon tiền mặt / COD — tờ tiền + ký hiệu */
function PaymentIconCash() {
  return (
    <svg
      className="cart-payment-icon-svg"
      viewBox="0 0 48 48"
      width="44"
      height="44"
      aria-hidden
    >
      <defs>
        <linearGradient id="codBillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#66bb6a" />
          <stop offset="100%" stopColor="#2e7d32" />
        </linearGradient>
      </defs>
      <rect x="4" y="13" width="40" height="24" rx="4" fill="url(#codBillGrad)" />
      <rect x="6" y="15" width="36" height="20" rx="3" fill="#fff" opacity="0.98" />
      <circle cx="24" cy="25" r="6" fill="none" stroke="#2e7d32" strokeWidth="1.5" />
      <text
        x="24"
        y="28.5"
        textAnchor="middle"
        fill="#2e7d32"
        fontSize="10"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        ₫
      </text>
      <rect x="8" y="18" width="7" height="2" rx="1" fill="#c8e6c9" />
      <rect x="8" y="30" width="7" height="2" rx="1" fill="#c8e6c9" />
      <rect x="33" y="18" width="7" height="2" rx="1" fill="#c8e6c9" />
      <rect x="33" y="30" width="7" height="2" rx="1" fill="#c8e6c9" />
    </svg>
  )
}

export default function CartPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const showAddedMessage = new URLSearchParams(location.search).get('added') === '1'
  const showPaymentFailedMessage = new URLSearchParams(location.search).get('payment_failed') === '1'
  // Khi đang sync giỏ từ API (sau thanh toán thất bại), không cho loadCart ghi đè state
  const [syncingFromApi, setSyncingFromApi] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [delivery, setDelivery] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    province: '',
    district: '',
    ward: '',
    note: ''
  })

  const loadCart = () => {
    // Không ghi đè state khi đang sync từ API server
    if (syncingFromApi) return
    setItems(getCart())
  }

  useEffect(() => {
    if (!syncingFromApi) loadCart()
    const onCartChange = () => loadCart()
    window.addEventListener('cart-change', onCartChange)
    return () => window.removeEventListener('cart-change', onCartChange)
  }, [syncingFromApi])

  useEffect(() => {
    if (isLoggedIn()) {
      const user = getUser()
      setDelivery((d) => ({
        ...d,
        fullName: user?.fullName || user?.username || d.fullName,
        email: user?.email || d.email
      }))
    }
  }, [])

  // Sau thanh toán VNPay thất bại: đồng bộ giỏ hàng từ server (đã được backend khôi phục)
  useEffect(() => {
    if (!showPaymentFailedMessage || !isLoggedIn()) return
    const user = getUser()
    const userId = user?.userId ?? user?.id
    if (!userId) return

    // Bật cờ để loadCart() không ghi đè state
    setSyncingFromApi(true)

    apiGet(`/cart/${userId}`)
      .then((res) => {
        // Backend CartController trả về CartResponse trực tiếp (có .items)
        const cartData = res?.data ?? res
        const list = cartData?.items ?? []
        const localItems = list.map((i) => ({
          id: i.bookId,
          bookName: i.bookName,
          image: i.image,
          price: i.price != null ? Number(i.price) : 0,
          quantity: i.quantity || 1
        }))
        // Ghi vào localStorage trước
        setCart(localItems)
        // Cập nhật state
        setItems(localItems)
        window.dispatchEvent(new Event('cart-change'))
      })
      .catch((err) => {
        console.error('Lỗi sync giỏ hàng:', err)
      })
      .finally(() => {
        // Tắt cờ — từ giờ loadCart() hoạt động bình thường
        setSyncingFromApi(false)
      })
  }, [showPaymentFailedMessage])

  const handleRemove = (id) => {
    removeFromCart(id)
    loadCart()
  }

  const handleQuantity = (id, delta) => {
    const item = items.find((i) => String(i.id) === String(id))
    if (!item) return
    const qty = Math.max(1, (item.quantity || 1) + delta)
    const nextCart = updateQuantity(id, qty)
    setItems(Array.isArray(nextCart) ? nextCart : getCart())
  }

  const handleQuantityInput = (id, value) => {
    const num = parseInt(value, 10)
    if (Number.isNaN(num) || num < 1) return
    const nextCart = updateQuantity(id, num)
    setItems(Array.isArray(nextCart) ? nextCart : getCart())
  }

  const handleCheckout = async () => {
    if (!isLoggedIn()) {
      setError('Vui lòng đăng nhập để đặt hàng')
      return
    }
    if (!delivery.fullName || !delivery.phone || !delivery.address) {
      setError('Vui lòng nhập đầy đủ thông tin giao hàng')
      return
    }
    const phoneNorm = delivery.phone.trim().replace(/\s/g, '')
    if (!/^(\+84|0)[3-9]\d{8}$/.test(phoneNorm)) {
      setError('Số điện thoại không hợp lệ')
      return
    }
    if (items.length === 0) {
      setError('Giỏ hàng trống')
      return
    }

    setLoading(true)
    setError('')

    try {
      const user = getUser()
      const userId = user?.id

      if (!userId) {
        setError('Không xác định được tài khoản. Vui lòng đăng nhập lại.')
        return
      }

      await apiDelete(`/cart/${userId}/clear`).catch(() => {})

      for (const item of items) {
        const bookId = Number(item.id) || item.id
        const qty = item.quantity || 1
        await apiPost(`/cart/${userId}/add?bookId=${bookId}&quantity=${qty}`, {})
      }

      const checkoutResult = await apiPost('/orders/checkout', {
        fullName: delivery.fullName.trim(),
        phone: delivery.phone?.trim() || '',
        email: delivery.email?.trim() || '',
        shippingAddress: delivery.address.trim(),
        note: delivery.note?.trim() || '',
        paymentMethod: paymentMethod
      })

      clearCart()
      setItems([])

      if (paymentMethod === 'VNPAY') {
        const orderId = checkoutResult?.orderId
        if (orderId) {
          localStorage.setItem('pendingOrderId', orderId)
        } else {
          setError('Không lấy được mã đơn hàng. Vui lòng thử lại.')
          return
        }
        const amountVnd = Math.round(total)
        try {
          const res = await apiGet('/payment/vn-pay', { amount: amountVnd, orderId: orderId })
          const paymentUrl = res?.data?.paymentUrl
          if (paymentUrl) {
            window.location.href = paymentUrl
            return
          }
        } catch (vnPayErr) {
          setError('Lỗi kết nối VNPay: ' + vnPayErr.message)
          return
        }
        setError('Không tạo được link thanh toán VNPay. Vui lòng thử lại.')
        return
      }

      const orderId = checkoutResult?.orderId
      navigate(orderId ? `/don-hang/${orderId}` : '/don-hang')
    } catch (err) {
      const msg = err.message || 'Đặt hàng thất bại. Vui lòng thử lại.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0)
  const total = subtotal
  const productCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0)

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb__sep">›</span>
        <Link to="/san-pham">Cửa hàng</Link>
        <span className="breadcrumb__sep">›</span>
        <span>Giỏ hàng</span>
      </div>

      {showAddedMessage && (
        <div className="cart-added-banner">
          <span className="cart-added-banner__text">Đã thêm sản phẩm vào giỏ hàng</span>
        </div>
      )}

      <div className="cart-page">
        <div className="cart-main">
          <section className="cart-section">
            <h2 className="cart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Giỏ hàng của bạn
              {items.length > 0 && (
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 400, 
                  color: '#666',
                  background: '#f5f5f5',
                  padding: '4px 12px',
                  borderRadius: '20px'
                }}>
                  {productCount} sản phẩm
                </span>
              )}
            </h2>
            
            {items.length === 0 ? (
              <div className="cart-empty" style={{ padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px', color: '#ccc' }}>—</div>
                <h3 style={{ margin: '0 0 12px', color: '#333' }}>Giỏ hàng trống</h3>
                <p style={{ margin: '0 0 24px', color: '#666' }}>Hãy khám phá những cuốn sách thú vị!</p>
                <Link to="/san-pham" className="cart-buy-more" style={{
                  display: 'inline-block',
                  padding: '12px 32px',
                  background: 'var(--primary)',
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600
                }}>
                  Khám phá sách ngay
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-table-wrap">
                  <table className="cart-table">
                    <thead>
                      <tr>
                        <th className="cart-table__th-product">SẢN PHẨM</th>
                        <th className="cart-table__th-price">GIÁ</th>
                        <th className="cart-table__th-qty">SỐ LƯỢNG</th>
                        <th className="cart-table__th-total">TỔNG</th>
                        <th className="cart-table__th-remove" aria-label="Xóa" />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => {
                        const price = Number(item.price) || 0
                        const qty = item.quantity || 1
                        const lineTotal = price * qty
                        const imageSrc = getImageSrc(item.image)
                        return (
                          <tr key={item.id} className="cart-table-row">
                            <td className="cart-table__product">
                              <Link to={`/san-pham/${item.id}`} className="cart-table-product">
                                <div className="cart-table-product__image">
                                  {imageSrc ? (
                                    <img src={imageSrc} alt={item.bookName} />
                                  ) : (
                                    <div className="cart-table-product__placeholder" />
                                  )}
                                </div>
                                <div className="cart-table-product__body">
                                  <span className="cart-table-product__name">{item.bookName}</span>
                                  <div className="cart-table-product__stars" aria-hidden>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                      <span key={i} className="cart-table-product__star">★</span>
                                    ))}
                                  </div>
                                </div>
                              </Link>
                            </td>
                            <td className="cart-table__price" style={{ fontWeight: 600 }}>
                              {price.toLocaleString('vi-VN')}₫
                            </td>
                            <td className="cart-table__qty">
                              <div className="cart-table-qty">
                                <button
                                  type="button"
                                  className="cart-table-qty__btn"
                                  onClick={() => handleQuantity(item.id, -1)}
                                  aria-label="Giảm"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  value={qty}
                                  onChange={(e) => handleQuantityInput(item.id, e.target.value)}
                                  className="cart-table-qty__input"
                                  aria-label="Số lượng"
                                />
                                <button
                                  type="button"
                                  className="cart-table-qty__btn"
                                  onClick={() => handleQuantity(item.id, 1)}
                                  aria-label="Tăng"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="cart-table__total" style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                              {lineTotal.toLocaleString('vi-VN')}₫
                            </td>
                            <td className="cart-table__remove">
                              <button
                                type="button"
                                className="cart-table-remove"
                                onClick={() => handleRemove(item.id)}
                                aria-label="Xóa sản phẩm"
                                title="Xóa sản phẩm"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid #eee'
                }}>
                  <Link to="/san-pham" className="cart-buy-more">
                    ← Tiếp tục mua sắm
                  </Link>
                  <button 
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm?')) {
                        clearCart()
                        loadCart()
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textDecoration: 'underline'
                    }}
                  >
                    Xóa tất cả
                  </button>
                </div>

                <div className="cart-summary">
                  <div className="cart-summary-row">
                    <span>Tạm tính ({productCount} sản phẩm)</span>
                    <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="cart-summary-row">
                    <span>Phí vận chuyển</span>
                    <span className="cart-freeship">Miễn phí</span>
                  </div>
                  <div className="cart-summary-row cart-summary-total">
                    <span>Tổng cộng:</span>
                    <span className="cart-total-value">{total.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <p className="cart-vat-note">(Giá đã bao gồm VAT)</p>
                </div>
              </>
            )}
          </section>

          {/* Cột phải: Thông tin nhận hàng */}
          <aside className="cart-delivery">
            {!isLoggedIn() && (
              <Link to="/dang-nhap" className="cart-login-prompt">
                Đăng nhập hoặc đăng ký để đặt hàng
              </Link>
            )}

            <div className="cart-delivery-form">
              <h2 className="cart-delivery-title">Địa chỉ giao hàng</h2>
              <div className="cart-form-group">
                <input
                  type="text"
                  placeholder="Họ và tên người nhận *"
                  value={delivery.fullName}
                  onChange={(e) => setDelivery((d) => ({ ...d, fullName: e.target.value }))}
                  className="cart-input"
                  disabled={!isLoggedIn()}
                />
              </div>
              <div className="cart-form-group">
                <input
                  type="tel"
                  placeholder="Số điện thoại *"
                  value={delivery.phone}
                  onChange={(e) => setDelivery((d) => ({ ...d, phone: e.target.value }))}
                  className="cart-input"
                  disabled={!isLoggedIn()}
                />
              </div>
              <div className="cart-form-group">
                <input
                  type="email"
                  placeholder="Email (nhận hóa đơn)"
                  value={delivery.email}
                  onChange={(e) => setDelivery((d) => ({ ...d, email: e.target.value }))}
                  className="cart-input"
                  disabled={!isLoggedIn()}
                />
              </div>
              <div className="cart-form-group">
                <input
                  type="text"
                  placeholder="Địa chỉ giao hàng * (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                  value={delivery.address}
                  onChange={(e) => setDelivery((d) => ({ ...d, address: e.target.value }))}
                  className="cart-input"
                  disabled={!isLoggedIn()}
                />
              </div>
              <div className="cart-form-group">
                <input
                  type="text"
                  placeholder="Ghi chú đơn hàng (tùy chọn)"
                  value={delivery.note}
                  onChange={(e) => setDelivery((d) => ({ ...d, note: e.target.value }))}
                  className="cart-input"
                  disabled={!isLoggedIn()}
                />
              </div>

              <div className="cart-payment-panel">
                <h2 className="cart-delivery-title cart-delivery-title--payment">Hình thức thanh toán</h2>
                <div className="cart-payment-methods">
                <label className={`cart-payment-option ${paymentMethod === 'CASH' ? 'cart-payment-option--active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH"
                    checked={paymentMethod === 'CASH'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={!isLoggedIn()}
                  />
                  <span className="cart-payment-badge" aria-hidden>
                    <PaymentIconCash />
                  </span>
                  <div className="cart-payment-text">
                    <span className="cart-payment-label">Tiền mặt (COD)</span>
                    <p className="cart-payment-hint">Thanh toán khi nhận hàng</p>
                  </div>
                </label>
                <label className={`cart-payment-option ${paymentMethod === 'VNPAY' ? 'cart-payment-option--active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={paymentMethod === 'VNPAY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={!isLoggedIn()}
                  />
                  <span className="cart-payment-badge" aria-hidden>
                    <img
                      src="/images/vnpay-logo.png"
                      alt=""
                      className="cart-payment-img cart-payment-img--vnpay"
                      width="120"
                      height="56"
                      decoding="async"
                    />
                  </span>
                  <div className="cart-payment-text">
                    <span className="cart-payment-label">VNPay</span>
                    <p className="cart-payment-hint">Thanh toán qua ví điện tử, thẻ ngân hàng</p>
                  </div>
                </label>
                </div>
              </div>

              {items.length > 0 && (
                <div className="cart-delivery-actions">
                  {error && (
                    <div style={{ 
                      padding: '12px 16px', 
                      background: '#ffebee', 
                      border: '1px solid #ffcdd2',
                      borderRadius: '8px',
                      color: '#c62828',
                      fontSize: '14px',
                      marginBottom: '12px'
                    }}>
                      {error}
                    </div>
                  )}
                  {isLoggedIn() ? (
                    <button
                      type="button"
                      className="cart-checkout-btn cart-checkout-btn--block"
                      onClick={handleCheckout}
                      disabled={loading}
                    >
                      {loading ? 'Đang xử lý...' : `Thanh toán ${total.toLocaleString('vi-VN')}₫`}
                    </button>
                  ) : (
                    <Link to="/dang-nhap" className="cart-checkout-btn cart-checkout-btn--block cart-checkout-btn--login">
                      Đăng nhập để thanh toán
                    </Link>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
