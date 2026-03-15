import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUser, isLoggedIn, logout } from '../api/client'

export default function AccountPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/dang-nhap')
      return
    }
    setUser(getUser())
    setLoading(false)
  }, [navigate])

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

  const fullName = user?.fullName || user?.username || ''
  const email = user?.email || ''
  const phone = user?.phone || ''
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
                <Link to="/tai-khoan" className="account-info-row__link">Thêm địa chỉ</Link>
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
    </>
  )
}
