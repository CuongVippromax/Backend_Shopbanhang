import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiPost, isLoggedIn, getUser } from '../api/client'
import { initCartForUser } from '../utils/cart'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn()) {
      const user = getUser()
      if (user?.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    }
  }, [navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiPost('/auth/login', {
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password
      })

      if (response.accessToken) {
        localStorage.setItem('token', response.accessToken)
      }
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken)
      }

      const userData = {
        id: response.userId,
        userId: response.userId,
        username: response.username,
        email: response.email,
        fullName: response.fullName,
        phone: response.phone ?? '',
        address: response.address ?? '',
        role: response.role
      }
      localStorage.setItem('user', JSON.stringify(userData))

      initCartForUser(response.userId)
      window.dispatchEvent(new Event('auth-change'))

      // Redirect theo role
      if (response.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Đăng nhập</h1>
        <p className="auth-desc">Nhập thông tin để đăng nhập vào tài khoản của bạn.</p>

        {error && <div className="auth-error" role="alert">{error}</div>}
        {searchParams.get('registered') === '1' && (
          <p className="auth-inline-success" role="status">Đăng ký thành công. Vui lòng đăng nhập.</p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="usernameOrEmail">Tên đăng nhập hoặc Email</label>
            <input
              id="usernameOrEmail"
              name="usernameOrEmail"
              type="text"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập hoặc email"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/quen-mat-khau">Quên mật khẩu?</Link>
          <span style={{margin: '0 8px'}}>|</span>
          <Link to="/dang-ky">Đăng ký</Link>
        </div>
      </div>
    </div>
  )
}
