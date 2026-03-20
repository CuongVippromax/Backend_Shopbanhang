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
        console.log('Calling VNPay API with amount:', amountVnd, 'orderId:', orderId)
        try {
          const res = await apiGet('/payment/vn-pay', { amount: amountVnd, orderId: orderId })
          console.log('VNPay response:', res)
          const paymentUrl = res?.data?.paymentUrl
          console.log('Payment URL:', paymentUrl)
          if (paymentUrl) {
            window.location.href = paymentUrl
            return
          }
        } catch (vnPayErr) {
          console.error('VNPay error:', vnPayErr)
          setError('Lỗi kết nối VNPay: ' + vnPayErr.message)
          return
        }
        setError('Không tạo được link thanh toán VNPay. Vui lòng thử lại.')
        return
      }

      navigate('/don-hang')
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
      {showPaymentFailedMessage && (
        <div className="cart-added-banner" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}>
          <span className="cart-added-banner__text">Thanh toán không thành công. Sản phẩm đã được đưa lại vào giỏ hàng.</span>
        </div>
      )}

      <div className="cart-page">
        <div className="cart-main">
          <section className="cart-section">
            {items.length === 0 ? (
              <div className="cart-empty">
                <p>Giỏ hàng trống.</p>
                <Link to="/san-pham" className="cart-buy-more">Mua sắm ngay</Link>
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
                            <td className="cart-table__price">
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
                            <td className="cart-table__total">
                              {lineTotal.toLocaleString('vi-VN')}₫
                            </td>
                            <td className="cart-table__remove">
                              <button
                                type="button"
                                className="cart-table-remove"
                                onClick={() => handleRemove(item.id)}
                                aria-label="Xóa sản phẩm"
                                title="Xóa"
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

                <Link to="/san-pham" className="cart-buy-more cart-buy-more--btn">
                  Mua thêm
                </Link>

                <div className="cart-summary">
                  <div className="cart-summary-row">
                    <span>Phí vận chuyển</span>
                    <span className="cart-freeship">Freeship</span>
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
              <>
                <Link to="/dang-nhap" className="cart-login-prompt">
                  Đăng ký / Đăng nhập để mua hàng tích điểm
                </Link>
                <div className="cart-guest-info">
                  <span className="cart-guest-icon">i</span>
                  <span>Hoặc mua hàng không cần đăng ký</span>
                </div>
              </>
            )}

            <div className="cart-delivery-form">
              <h2 className="cart-delivery-title">1. Địa chỉ giao hàng</h2>
              <div className="cart-form-group">
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={delivery.fullName}
                  onChange={(e) => setDelivery((d) => ({ ...d, fullName: e.target.value }))}
                  className="cart-input"
                />
              </div>
              <div className="cart-form-group">
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={delivery.phone}
                  onChange={(e) => setDelivery((d) => ({ ...d, phone: e.target.value }))}
                  className="cart-input"
                />
              </div>
              <div className="cart-form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={delivery.email}
                  onChange={(e) => setDelivery((d) => ({ ...d, email: e.target.value }))}
                  className="cart-input"
                />
              </div>
              <div className="cart-form-group">
                <input
                  type="text"
                  placeholder="Nhập địa chỉ đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                  value={delivery.address}
                  onChange={(e) => setDelivery((d) => ({ ...d, address: e.target.value }))}
                  className="cart-input"
                />
              </div>
              <div className="cart-form-group">
                <input
                  type="text"
                  placeholder="Ghi chú"
                  value={delivery.note}
                  onChange={(e) => setDelivery((d) => ({ ...d, note: e.target.value }))}
                  className="cart-input"
                />
              </div>

              <h2 className="cart-delivery-title">2. Hình thức thanh toán</h2>
              <div className="cart-payment-methods">
                <label className={`cart-payment-option ${paymentMethod === 'CASH' ? 'cart-payment-option--active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH"
                    checked={paymentMethod === 'CASH'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="cart-payment-icon">💵</span>
                  <span className="cart-payment-label">Tiền mặt (COD)</span>
                </label>
                <label className={`cart-payment-option ${paymentMethod === 'VNPAY' ? 'cart-payment-option--active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={paymentMethod === 'VNPAY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="cart-payment-icon">🏦</span>
                  <span className="cart-payment-label">VNPay</span>
                </label>
              </div>

              {items.length > 0 && (
                <div className="cart-delivery-actions">
                  {error && <p className="cart-error">{error}</p>}
                  {isLoggedIn() ? (
                    <button
                      type="button"
                      className="cart-checkout-btn cart-checkout-btn--block"
                      onClick={handleCheckout}
                      disabled={loading}
                    >
                      {loading ? 'Đang xử lý...' : 'Thanh toán'}
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
