import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUser, isLoggedIn, logout, updateUser, apiGet } from '../api/client'

export default function AccountPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressForm, setAddressForm] = useState({ address: '' })
  const [addressSubmitting, setAddressSubmitting] = useState(false)
  const [addressError, setAddressError] = useState(null)
  const [addressSuccess, setAddressSuccess] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/dang-nhap')
      return
    }
    let cancelled = false
    ;(async () => {
      const cached = getUser()
      if (cached) setUser(cached)
      try {
        const res = await apiGet('/users/me')
        const p = res?.data
        if (p && !cancelled) {
          const merged = {
            ...(cached || {}),
            id: p.userId,
            userId: p.userId,
            username: p.username,
            email: p.email,
            fullName: p.fullName,
            phone: p.phone ?? p.phoneNumber ?? '',
            address: p.address ?? '',
            role: p.role
          }
          localStorage.setItem('user', JSON.stringify(merged))
          setUser(merged)
        }
      } catch {
        if (!cancelled && cached) setUser(cached)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [navigate])

  const handleLogout = () => {
    logout()
    window.dispatchEvent(new Event('auth-change'))
    navigate('/')
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    setAddressError(null)
    setAddressSuccess(false)

    if (!addressForm.address.trim()) {
      setAddressError('Vui lòng nhập địa chỉ')
      return
    }

    setAddressSubmitting(true)
    try {
      const userId = user?.userId || user?.id
      await updateUser(userId, { address: addressForm.address.trim() })

      // Update local user data
      const updatedUser = { ...user, address: addressForm.address.trim() }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)

      setAddressSuccess(true)
      setTimeout(() => {
        setShowAddressModal(false)
        setAddressSuccess(false)
        setAddressForm({ address: '' })
      }, 1500)
    } catch (err) {
      setAddressError(err.message || 'Cập nhật địa chỉ thất bại')
    } finally {
      setAddressSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-placeholder">
        <p>Đang tải...</p>
      </div>
    )
  }

  const fullName = user?.fullName || user?.username || ''
  const email = user?.email || ''
  const phone = user?.phone || user?.phoneNumber || ''
  const username = user?.username || ''
  const address = user?.address || ''

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb__sep">›</span>
        <span>Thông tin tài khoản</span>
      </div>

      <div className="account-page account-page--profile">
        <aside className="account-sidebar account-sidebar--profile">
          <div className="account-sidebar__head">
            <div className="account-avatar account-avatar--circle">
              <span className="account-avatar__inner">
                {(fullName || username).charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="account-sidebar__edit-label">Sửa hồ sơ</span>
          </div>
          <nav className="account-menu account-menu--vertical">
            <Link to="/tai-khoan" className="account-menu-item active">Hồ sơ</Link>
            <Link to="/don-hang" className="account-menu-item">Đơn mua</Link>
            <Link to="/doi-mat-khau" className="account-menu-item">Đổi mật khẩu</Link>
            <button type="button" onClick={handleLogout} className="account-menu-item account-menu-item--logout">
              Đăng xuất
            </button>
          </nav>
        </aside>

        <main className="account-content account-content--profile">
          <div className="account-info-list">
            <div className="account-info-row">
              <span className="account-info-row__label">Họ tên</span>
              <span className="account-info-row__value">{fullName}</span>
            </div>
            <div className="account-info-row">
              <span className="account-info-row__label">Email</span>
              <span className="account-info-row__value">{email}</span>
            </div>
            <div className="account-info-row">
              <span className="account-info-row__label">Số điện thoại</span>
              <span className="account-info-row__value">{phone || '—'}</span>
            </div>
            <div className="account-info-row">
              <span className="account-info-row__label">Tên tài khoản</span>
              <span className="account-info-row__value">{username}</span>
            </div>
            <div className="account-info-row">
              <span className="account-info-row__label">Mật khẩu</span>
              <span className="account-info-row__value">
                <span className="account-info-row__mask">********</span>
                <Link to="/doi-mat-khau" className="account-info-row__link">Thay đổi</Link>
              </span>
            </div>
            <div className="account-info-row">
              <span className="account-info-row__label">Địa chỉ</span>
              <span className="account-info-row__value">
                {address || '—'}
                <button
                  type="button"
                  className="account-info-row__link"
                  onClick={() => {
                    setAddressForm({ address: user?.address || '' })
                    setAddressError(null)
                    setAddressSuccess(false)
                    setShowAddressModal(true)
                  }}
                >
                  {address ? 'Thay đổi' : 'Thêm địa chỉ'}
                </button>
              </span>
            </div>
          </div>
          <div className="account-profile-actions">
            <Link to="/tai-khoan" className="account-profile-btn account-profile-btn--secondary">
              Sửa hồ sơ
            </Link>
            <Link to="/don-hang" className="account-profile-btn account-profile-btn--primary">
              Đơn mua
            </Link>
          </div>
        </main>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{address ? 'Thay đổi địa chỉ' : 'Thêm địa chỉ'}</h3>
              <button className="modal-close" onClick={() => setShowAddressModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveAddress} className="modal-body">
              <div className="form-group">
                <label htmlFor="address-input">Địa chỉ</label>
                <textarea
                  id="address-input"
                  className="form-control"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ address: e.target.value })}
                  placeholder="Nhập địa chỉ của bạn..."
                  rows={3}
                />
              </div>
              {addressError && <p className="form-error">{addressError}</p>}
              {addressSuccess && <p className="form-success">Cập nhật địa chỉ thành công!</p>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddressModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addressSubmitting}
                >
                  {addressSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
