import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUser, isLoggedIn, logout, apiPost } from '../api/client'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/dang-nhap')
      return
    }
  }, [navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không trùng khớp.')
      return
    }

    setLoading(true)
    try {
      await apiPost('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      })
      setSuccess('Đổi mật khẩu thành công.')
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.message || 'Đổi mật khẩu thất bại.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    window.dispatchEvent(new Event('auth-change'))
    navigate('/')
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb__sep">›</span>
        <Link to="/tai-khoan">Tài khoản</Link>
        <span className="breadcrumb__sep">›</span>
        <span>Đổi mật khẩu</span>
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
            <Link to="/don-hang" className="account-menu-item">Đơn mua</Link>
            <Link to="/doi-mat-khau" className="account-menu-item active">Đổi mật khẩu</Link>
            <button type="button" onClick={handleLogout} className="account-menu-item account-logout">
              Đăng xuất
            </button>
          </nav>
        </aside>

        <main className="account-content">
          <div className="account-section">
            <h2 className="account-section-title">Đổi mật khẩu</h2>
            <p className="account-section-desc">Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi.</p>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <form onSubmit={handleSubmit} className="auth-form change-password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Ít nhất 6 ký tự"
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  )
}
