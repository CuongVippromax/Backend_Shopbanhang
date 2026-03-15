import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUser, isLoggedIn, logout, apiGet } from '../api/client'

function getImageSrc(image) {
  if (!image || typeof image !== 'string') return null
  const t = image.trim()
  if (!t) return null
  if (/^https?:\/\//i.test(t)) return t
  if (t.startsWith('/')) return window.location.origin + t
  return t
}

function formatOrderTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${h}:${m} ${day}-${month}-${year}`
}

function getStatusLabel(status) {
  if (!status) return ''
  const s = String(status).toUpperCase()
  if (s === 'PENDING') return 'Chưa xác nhận'
  if (s === 'PROCESSING') return 'Đã xác nhận'
  if (s === 'SHIPPED') return 'Đang giao'
  if (s === 'COMPLETED') return 'Giao thành công'
  if (s === 'CANCELLED') return 'Đã hủy'
  return status
}

function isStatusUnconfirmed(status) {
  return String(status).toUpperCase() === 'PENDING'
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/dang-nhap')
      return
    }
    fetchOrders()
  }, [navigate])

  const fetchOrders = async () => {
    try {
      const response = await apiGet('/orders/my-orders?page=1&size=20')
      if (response?.data) setOrders(response.data)
      else setOrders([])
    } catch (err) {
      let msg = err.message || 'Không tải được danh sách đơn hàng'
      try {
        const body = JSON.parse(err.message)
        if (body.message) msg = body.message
      } catch (_) {}
      setError(msg)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    window.dispatchEvent(new Event('auth-change'))
    navigate('/')
  }

  if (loading) {
    return (
      <div className="page-placeholder">
        <p>Đang tải...</p>
      </div>
    )
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb__sep">›</span>
        <Link to="/tai-khoan">Tài khoản</Link>
        <span className="breadcrumb__sep">›</span>
        <span>Đơn mua</span>
      </div>

      <div className="account-page">
        <aside className="account-sidebar">
          <div className="account-avatar">
            <span className="avatar-circle">
              {getUser()?.fullName?.charAt(0) || getUser()?.username?.charAt(0) || 'U'}
            </span>
          </div>
          <h3 className="account-name">{getUser()?.fullName || getUser()?.username || 'Khách hàng'}</h3>
          <p className="account-email">{getUser()?.email || ''}</p>
          <nav className="account-menu">
            <Link to="/tai-khoan" className="account-menu-item">Thông tin tài khoản</Link>
            <Link to="/don-hang" className="account-menu-item active">Đơn mua</Link>
            <Link to="/doi-mat-khau" className="account-menu-item">Đổi mật khẩu</Link>
            <button type="button" onClick={handleLogout} className="account-menu-item account-logout">
              Đăng xuất
            </button>
          </nav>
        </aside>

        <main className="account-content">
          <div className="account-section">
            {error && (
              <div className="order-error">{error}</div>
            )}
            {orders.length === 0 ? (
              <div className="account-orders-empty">
                <p>Chưa có đơn hàng nào.</p>
                <Link to="/san-pham" className="account-shop-btn">Mua sắm ngay</Link>
              </div>
            ) : (
              <div className="order-blocks">
                {orders.map((order) => (
                  <div key={order.orderId} className="order-block">
                    <div className="order-block__head">
                      <span className={`order-block__status ${isStatusUnconfirmed(order.orderStatus) ? 'order-block__status--red' : ''}`}>
                        Trạng thái: {getStatusLabel(order.orderStatus)}
                      </span>
                      <span className="order-block__time">
                        Thời gian: {formatOrderTime(order.orderDate)}
                      </span>
                    </div>
                    <div className="order-block__items">
                      {order.items?.map((item, idx) => {
                        const imgSrc = getImageSrc(item.image)
                        const price = Number(item.price) || 0
                        const qty = item.quantity || 1
                        return (
                          <div key={idx} className="order-block-item">
                            <div className="order-block-item__thumb">
                              {imgSrc ? (
                                <img src={imgSrc} alt={item.bookName} />
                              ) : (
                                <div className="order-block-item__placeholder" />
                              )}
                            </div>
                            <div className="order-block-item__info">
                              <span className="order-block-item__name">{item.bookName}</span>
                              <span className="order-block-item__price-qty">
                                {price.toLocaleString('vi-VN')}₫ x{qty}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="order-block__foot">
                      <Link to="/don-hang" className="order-block__btn order-block__btn--back">
                        ‹ Trở lại
                      </Link>
                      <div className="order-block__foot-right">
                        <span className="order-block__total">
                          Thành tiền: <strong>{Number(order.totalAmount || 0).toLocaleString('vi-VN')}₫</strong>
                        </span>
                        <Link
                          to={`/don-hang/${order.orderId}`}
                          className="order-block__btn order-block__btn--detail"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
