import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getUser, isLoggedIn, logout } from '../api/client'
import { getCartCount, getCart } from '../utils/cart'

function Header() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [searchValue, setSearchValue] = useState('')

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDropdown && !e.target.closest('.user-dropdown')) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showDropdown])

  useEffect(() => {
    const checkUser = () => {
      const loggedIn = isLoggedIn()
      if (loggedIn) {
        const userData = getUser()
        setUser(userData)
      } else {
        setUser(null)
      }
      getCart()
    }
    checkUser()

    const handleStorage = () => checkUser()
    window.addEventListener('storage', handleStorage)

    const handleAuthChange = () => checkUser()
    window.addEventListener('auth-change', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

  useEffect(() => {
    const updateCartCount = () => setCartCount(getCartCount())
    updateCartCount()
    window.addEventListener('cart-change', updateCartCount)
    return () => window.removeEventListener('cart-change', updateCartCount)
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
    window.dispatchEvent(new Event('auth-change'))
    navigate('/')
    window.location.reload()
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/san-pham?search=${encodeURIComponent(searchValue.trim())}`)
    } else {
      navigate('/san-pham')
    }
  }

  return (
    <header className="header">
      <Link to="/" className="header__logo">
        <div className="logo-circle">HK</div>
        <div className="logo-text">
          <span className="logo-title">NHÀ SÁCH HOÀNG KIM</span>
          <span className="logo-subtitle">Nơi tri thức gặp gỡ</span>
        </div>
      </Link>

      <form className="header__search" onSubmit={handleSearch}>
        <input 
          name="q" 
          className="search__input" 
          placeholder="Tìm kiếm sách..." 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <button type="submit" className="search__button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Tìm
        </button>
      </form>

      <div className="header__actions">
        <Link to="/gio-hang" className="header-action header-action--cart" aria-label="Giỏ hàng">
          <span className="header-action__icon">🛒</span>
          {cartCount > 0 && <span className="header-cart-badge">{cartCount}</span>}
          <span className="header-action__label">Giỏ hàng</span>
        </Link>

        {user ? (
          <div 
            className={`user-dropdown ${showDropdown ? 'show' : ''}`} 
            onClick={(e) => {
              e.stopPropagation()
              setShowDropdown(!showDropdown)
            }}
          >
            <span className="header-action__icon">👤</span>
            <span className="header-action__label">{user.fullName || user.username || 'Tài khoản'}</span>
            <div className="dropdown-menu">
              <Link to="/tai-khoan" className="dropdown-item" onClick={() => setShowDropdown(false)}>👤 Thông tin tài khoản</Link>
              <Link to="/don-hang" className="dropdown-item" onClick={() => setShowDropdown(false)}>📦 Lịch sử đơn hàng</Link>
              <div style={{ borderTop: '1px solid #eee', marginTop: '4px' }} />
              <button onClick={handleLogout} className="dropdown-item" style={{ color: '#e74c3c' }}>🚪 Đăng xuất</button>
            </div>
          </div>
        ) : (
          <Link to="/dang-nhap" className="header-action">
            <span className="header-action__icon">👤</span>
            <span className="header-action__label">Đăng nhập</span>
          </Link>
        )}
      </div>
    </header>
  )
}

function NavBar() {
  const location = useLocation()
  const [categories, setCategories] = useState([])
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  useEffect(() => {
    let cancelled = false
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setCategoriesLoaded(true)
      }
    }, 8000)
    import('../api/categories.js')
      .then(({ getCategories }) => getCategories())
      .then((res) => {
        if (cancelled) return
        let raw
        if (Array.isArray(res)) {
          raw = res
        } else {
          raw = res?.content ?? res?.data ?? []
        }
        const list = Array.isArray(raw) ? raw : []
        const seen = new Set()
        const valid = list
          .filter((c) => {
            if (!c || (c.categoryId == null && !c.categoryName && !c.CategoryName)) return false
            const id = c.categoryId ?? c.categoryName ?? c.CategoryName
            if (seen.has(id)) return false
            seen.add(id)
            return true
          })
          .slice(0, 12)
        setCategories(valid)
      })
      .catch((err) => {
        if (!cancelled) {
          setCategories([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          clearTimeout(timeoutId)
          setCategoriesLoaded(true)
        }
      })
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <nav className="nav">
      <div className="nav-catalog-wrap">
        <Link to="/san-pham" className="nav__catalog">
          <span className="hamburger" />
          <span>DANH MỤC SÁCH</span>
          <span className="nav-catalog-arrow">▼</span>
        </Link>
        <div className="nav-catalog-dropdown">
          {!categoriesLoaded ? (
            <div className="nav-catalog-empty">Đang tải...</div>
          ) : categories.length > 0 ? (
            <ul className="nav-catalog-list">
              {categories.map((cat) => (
                <li key={cat.categoryId}>
                  <Link to={`/san-pham?category=${cat.categoryId}`}>
                    📚 {String(cat.categoryName).trim() || 'Danh mục'}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="nav-catalog-empty">Không có danh mục</div>
          )}
        </div>
      </div>

      <div className="nav__links">
        <Link to="/" className={isActive('/') && location.pathname === '/' ? 'active' : ''}>
          🏠 Trang chủ
        </Link>
        <Link to="/san-pham" className={isActive('/san-pham') ? 'active' : ''}>
          📖 Sản phẩm
        </Link>
        <Link to="/sach-moi" className={isActive('/sach-moi') ? 'active' : ''}>
          ✨ Sách mới
        </Link>
        <Link to="/sach-hay" className={isActive('/sach-hay') ? 'active' : ''}>
          🔥 Sách hay
        </Link>
        <Link to="/truyen-tranh-thieu-nhi" className={isActive('/truyen-tranh-thieu-nhi') ? 'active' : ''}>
          📚 Thiếu nhi
        </Link>
        <Link to="/chinh-sach" className={isActive('/chinh-sach') ? 'active' : ''}>
          📋 Chính sách
        </Link>
        <Link to="/lien-he" className={isActive('/lien-he') ? 'active' : ''}>
          📞 Liên hệ
        </Link>
      </div>

      <div className="nav__hotline">
        <span>📞 Hotline: 1900 1234</span>
      </div>
    </nav>
  )
}

export default function Layout() {
  return (
    <div className="app">
      <Header />
      <NavBar />
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-col footer-col--brand">
            <div className="footer-logo">HKBOOKS</div>
            <p className="footer-text">
              Nhà sách Hoàng Kim là hệ thống sách online với hàng ngàn đầu sách trong và ngoài nước.
            </p>
            <p className="footer-text">
              Chúng tôi cam kết mang đến những cuốn sách chất lượng, đóng gói cẩn thận và giao hàng nhanh chóng.
            </p>
            <div className="footer-badges">
              <span className="footer-badge">Đã đăng ký Bộ Công Thương</span>
            </div>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">Fb</a>
              <a href="#" aria-label="Instagram">Ig</a>
              <a href="#" aria-label="YouTube">Yt</a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Dịch vụ</h4>
            <ul className="footer-list">
              <li><Link to="#">Điều khoản sử dụng</Link></li>
              <li><Link to="#">Chính sách bảo mật thông tin cá nhân</Link></li>
              <li><Link to="#">Chính sách bảo mật thanh toán</Link></li>
              <li><Link to="#">Giới thiệu Hoàng Kim</Link></li>
              <li><Link to="#">Hệ thống nhà sách</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Hỗ trợ</h4>
            <ul className="footer-list">
              <li><Link to="#">Chính sách đổi - trả - hoàn tiền</Link></li>
              <li><Link to="/chinh-sach-bao-hanh">Chính sách bảo hành - bồi hoàn</Link></li>
              <li><Link to="#">Chính sách vận chuyển</Link></li>
              <li><Link to="#">Chính sách khách sỉ</Link></li>
              <li><Link to="#">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          <div className="footer-col footer-col--contact">
            <h4 className="footer-title">Liên hệ</h4>
            <p className="footer-text">
              Nhà sách Hoàng Kim - Trụ sở chính<br />
              123 Đường Sách, Quận 1, TP. HCM
            </p>
            <p className="footer-text">
              Email: <a href="mailto:hotro@hoangkimbooks.vn">hotro@hoangkimbooks.vn</a><br />
              Hotline: <a href="tel:19001234">1900 1234</a>
            </p>
            <div className="footer-partners">
              <span className="footer-partner">VNPay</span>
              <span className="footer-partner">Momo</span>
              <span className="footer-partner">ZaloPay</span>
              <span className="footer-partner">ShopeePay</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Nhà sách Hoàng Kim. All rights reserved.</span>
          <div className="footer-bottom-links">
            <Link to="#">Điều khoản sử dụng</Link>
            <Link to="#">Chính sách bảo mật</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export { Header, NavBar }
