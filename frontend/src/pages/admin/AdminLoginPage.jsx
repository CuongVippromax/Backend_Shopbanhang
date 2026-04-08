import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost, isLoggedIn, getUser } from '../../api/client'
import { initCartForUser } from '../../utils/cart'

export default function AdminLoginPage() {
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
        role: response.role
      }
      localStorage.setItem('user', JSON.stringify(userData))

      initCartForUser(response.userId)
      window.dispatchEvent(new Event('auth-change'))

      if (response.role === 'ADMIN') {
        navigate('/admin')
      } else {
        // Người dùng thường → redirect về trang chủ
        window.dispatchEvent(new Event('auth-change'))
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-icon">⚙️</div>
          <h1>Quản trị viên</h1>
          <p>Đăng nhập vào trang quản trị</p>
        </div>

        {error && <div className="admin-login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
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

          <div className="admin-form-group">
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

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/dang-nhap" className="admin-login-link">
            ‹ Quay lại đăng nhập khách hàng
          </Link>
          <Link to="/" className="admin-login-link">
            ‹ Về trang chủ
          </Link>
        </div>
      </div>

      <style>{`
        .admin-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          padding: 20px;
        }

        .admin-login-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 48px 40px;
          width: 100%;
          max-width: 420px;
        }

        .admin-login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .admin-login-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .admin-login-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 8px 0;
        }

        .admin-login-header p {
          color: #666;
          margin: 0;
          font-size: 14px;
        }

        .admin-login-error {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          text-align: center;
        }

        .admin-form-group {
          margin-bottom: 20px;
        }

        .admin-form-group label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .admin-form-group input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 15px;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .admin-form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .admin-form-group input::placeholder {
          color: #9ca3af;
        }

        .admin-login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 8px;
        }

        .admin-login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
        }

        .admin-login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-login-footer {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: center;
        }

        .admin-login-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }

        .admin-login-link:hover {
          color: #1d4ed8;
        }
      `}</style>
    </div>
  )
}
