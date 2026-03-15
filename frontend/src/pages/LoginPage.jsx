import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost, isLoggedIn } from '../api/client'
import { initCartForUser } from '../utils/cart'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Nếu đã đăng nhập thì chuyển về trang chủ
  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/')
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

      // Lưu token vào localStorage (backend trả về accessToken)
      if (response.accessToken) {
        localStorage.setItem('token', response.accessToken)
      }
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken)
      }
      // Backend trả về thông tin user ở top-level, không phải trong object user
      const userData = {
        id: response.userId,
        username: response.username,
        email: response.email,
        fullName: response.fullName,
        role: response.role
      }
      localStorage.setItem('user', JSON.stringify(userData))

      // Chuyển giỏ hàng sang key của user
      initCartForUser(response.userId)

      // Trigger custom event để Header cập nhật state
      window.dispatchEvent(new Event('auth-change'))

      // Chuyển về trang chủ
      navigate('/')
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

        {error && <div className="auth-error">{error}</div>}

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
