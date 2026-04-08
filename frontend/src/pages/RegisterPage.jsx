import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost } from '../api/client'

const EMPTY_FIELD_ERRORS = {
  username: '',
  email: '',
  password: '',
  fullName: '',
  phone: '',
  confirmPassword: ''
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({ ...EMPTY_FIELD_ERRORS })
  const [globalError, setGlobalError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name } = e.target
    setFormData({
      ...formData,
      [name]: e.target.value
    })
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    setGlobalError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldErrors({ ...EMPTY_FIELD_ERRORS })
    setGlobalError('')

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: 'Mật khẩu xác nhận không khớp'
      }))
      return
    }

    if (formData.password.length < 6) {
      setFieldErrors((prev) => ({
        ...prev,
        password: 'Mật khẩu phải có ít nhất 6 ký tự'
      }))
      return
    }

    setLoading(true)

    try {
      await apiPost('/users/register', {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone?.trim() || ''
      })
      navigate('/dang-nhap?registered=1', { replace: true })
    } catch (err) {
      const fe = err.fieldErrors
      if (fe && typeof fe === 'object') {
        setFieldErrors({
          username: fe.username || '',
          email: fe.email || '',
          password: fe.password || '',
          fullName: fe.fullName || '',
          phone: fe.phone || '',
          confirmPassword: ''
        })
        if (fe._global) {
          setGlobalError(fe._global)
        }
      } else {
        setGlobalError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (name) => (fieldErrors[name] ? 'auth-input--error' : undefined)

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Tạo tài khoản</h1>
        <p className="auth-desc">
          Đăng ký để mua sắm dễ dàng hơn và theo dõi đơn hàng của bạn.
        </p>

        {globalError && <p className="auth-global-error">{globalError}</p>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              id="username"
              name="username"
              type="text"
              className={inputClass('username')}
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
            />
            {fieldErrors.username && (
              <span className="auth-field-error" role="alert">
                {fieldErrors.username}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className={inputClass('fullName')}
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              autoComplete="name"
            />
            {fieldErrors.fullName && (
              <span className="auth-field-error" role="alert">
                {fieldErrors.fullName}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={inputClass('email')}
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              autoComplete="email"
            />
            {fieldErrors.email && (
              <span className="auth-field-error" role="alert">
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className={inputClass('phone')}
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              autoComplete="tel"
            />
            {fieldErrors.phone && (
              <span className="auth-field-error" role="alert">
                {fieldErrors.phone}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              className={inputClass('password')}
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <span className="auth-field-error" role="alert">
                {fieldErrors.password}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={inputClass('confirmPassword')}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
            />
            {fieldErrors.confirmPassword && (
              <span className="auth-field-error" role="alert">
                {fieldErrors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Đã có tài khoản?</span>
          <Link to="/dang-nhap">Đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}
