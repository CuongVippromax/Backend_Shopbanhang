import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getUser, isLoggedIn, apiGet } from '../api/client'

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
  if (s === 'SHIPPED') return 'Trên đường giao'
  if (s === 'COMPLETED') return 'Giao thành công'
  if (s === 'CANCELLED') return 'Đã hủy'
  return status
}

const STEPPER_STEPS = [
  { key: 'PENDING', label: 'Chờ xác nhận', icon: '✓' },
  { key: 'PROCESSING', label: 'Đã xác nhận', icon: '👤' },
  { key: 'SHIPPED', label: 'Trên đường giao', icon: '🚚' },
  { key: 'COMPLETED', label: 'Giao thành công', icon: '✓' }
]

function getStepperActiveIndex(status) {
  const s = String(status).toUpperCase()
  const i = STEPPER_STEPS.findIndex((step) => step.key === s)
  return i >= 0 ? i : 0
}

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/dang-nhap')
      return
    }
    if (!orderId) {
      setLoading(false)
      return
    }
    apiGet(`/orders/${orderId}`)
      .then(setOrder)
      .catch((err) => {
        let msg = 'Không tải được đơn hàng.'
        try {
          const body = JSON.parse(err.message)
          if (body.message) msg = body.message
        } catch (_) {}
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [orderId, navigate])

  if (loading) {
    return (
      <div className="page-placeholder">
        <p>Đang tải...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="page-placeholder">
        <p>{error || 'Không tìm thấy đơn hàng.'}</p>
        <Link to="/don-hang">Quay lại đơn mua</Link>
      </div>
    )
  }

  const activeStep = getStepperActiveIndex(order.orderStatus)
  const totalFromItems = order.items?.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (it.quantity || 1),
    0
  ) ?? 0
  const displayTotal = Number(order.totalAmount) > 0 ? order.totalAmount : totalFromItems
  const estimatedDelivery = order.orderDate
    ? (() => {
        const d = new Date(order.orderDate)
        d.setDate(d.getDate() + 5)
        return formatOrderTime(d.toISOString())
      })()
    : ''

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb__sep">›</span>
        <Link to="/tai-khoan">Tài khoản</Link>
        <span className="breadcrumb__sep">›</span>
        <Link to="/don-hang">Đơn mua</Link>
        <span className="breadcrumb__sep">›</span>
        <span>Chi tiết đơn hàng</span>
      </div>

      <div className="order-detail-page">
        <h1 className="order-detail-title">Đơn đặt hàng của tôi</h1>

        <div className="order-detail-summary">
          <div className="order-detail-summary__item">
            <span className="order-detail-summary__label">Thời gian đặt hàng:</span>
            <span className="order-detail-summary__value">{formatOrderTime(order.orderDate)}</span>
          </div>
          <div className="order-detail-summary__item">
            <span className="order-detail-summary__label">Thời gian giao ước tính:</span>
            <span className="order-detail-summary__value">{estimatedDelivery}</span>
          </div>
          <div className="order-detail-summary__item">
            <span className="order-detail-summary__label">Trạng thái:</span>
            <span className="order-detail-summary__value">{getStatusLabel(order.orderStatus)}</span>
          </div>
        </div>

        <div className="order-detail-stepper">
          {STEPPER_STEPS.map((step, idx) => (
            <div
              key={step.key}
              className={`order-detail-stepper__step ${idx <= activeStep ? 'order-detail-stepper__step--active' : ''}`}
            >
              <div className="order-detail-stepper__circle">
                <span className="order-detail-stepper__icon">{step.icon}</span>
              </div>
              <span className="order-detail-stepper__label">{step.label}</span>
              {idx < STEPPER_STEPS.length - 1 && (
                <div className="order-detail-stepper__line" />
              )}
            </div>
          ))}
        </div>

        <div className="order-detail-products">
          <h2 className="order-detail-products__title">Sản phẩm đã đặt</h2>
          <div className="order-detail-products__grid">
            {order.items?.map((item, idx) => {
              const imgSrc = getImageSrc(item.image)
              const price = Number(item.price) || 0
              const qty = item.quantity || 1
              return (
                <div key={idx} className="order-detail-product">
                  <div className="order-detail-product__thumb">
                    {imgSrc ? (
                      <img src={imgSrc} alt={item.bookName} />
                    ) : (
                      <div className="order-detail-product__placeholder" />
                    )}
                  </div>
                  <div className="order-detail-product__info">
                    <span className="order-detail-product__name">{item.bookName}</span>
                    <span className="order-detail-product__price">{price.toLocaleString('vi-VN')}₫</span>
                    <span className="order-detail-product__qty">x{qty}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="order-detail-shipping">
          <h2 className="order-detail-shipping__title">Thông tin giao hàng & thanh toán</h2>
          <div className="order-detail-shipping__card">
            <div className="order-detail-shipping__row">
              <span className="order-detail-shipping__label">Họ và tên</span>
              <span className="order-detail-shipping__value">{order.fullName || getUser()?.fullName || order.username || '—'}</span>
            </div>
            {order.recipientPhone && (
              <div className="order-detail-shipping__row">
                <span className="order-detail-shipping__label">Số điện thoại</span>
                <span className="order-detail-shipping__value">{order.recipientPhone}</span>
              </div>
            )}
            <div className="order-detail-shipping__row">
              <span className="order-detail-shipping__label">Địa chỉ giao hàng</span>
              <span className="order-detail-shipping__value">{order.shippingAddress || '—'}</span>
            </div>
            <div className="order-detail-shipping__row">
              <span className="order-detail-shipping__label">Tổng tiền hàng</span>
              <span className="order-detail-shipping__value order-detail-shipping__value--total">
                {displayTotal.toLocaleString('vi-VN')}₫
              </span>
            </div>
            <div className="order-detail-shipping__row">
              <span className="order-detail-shipping__label">Phí vận chuyển</span>
              <span className="order-detail-shipping__value">Freeship</span>
            </div>
          </div>
        </div>

        <div className="order-detail-actions">
          <Link to="/don-hang" className="order-detail-btn order-detail-btn--back">‹ Trở lại</Link>
        </div>
      </div>
    </>
  )
}
