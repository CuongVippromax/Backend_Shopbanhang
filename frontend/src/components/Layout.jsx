import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getUser, isLoggedIn, logout } from '../api/client'
import { getCartCount, getCart } from '../utils/cart'

function Header() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [cartCount, setCartCount] = useState(0)

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

    // Listen for storage changes (for when user logs in from another tab)
    const handleStorage = () => checkUser()
    window.addEventListener('storage', handleStorage)

    // Listen for custom auth-change event (for login/logout in same tab)
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

  return (
    <header className="header">
      <Link to="/" className="header__logo">
        <div className="logo-circle">HK</div>
        <div className="logo-text">
          <span className="logo-title">NHÀ SÁCH HOÀNG KIM</span>
          <span className="logo-subtitle">Nơi tri thức gặp gỡ</span>
        </div>
      </Link>

      <form className="header__search" onSubmit={(e) => {
        e.preventDefault()
        const q = e.currentTarget.querySelector('input[name="q"]').value
        if (q && q.trim()) navigate(`/san-pham?search=${encodeURIComponent(q.trim())}`)
        else navigate('/san-pham')
      }}>
        <input name="q" className="search__input" placeholder="Bạn muốn tìm gì..." />
        <button type="submit" className="search__button">Tìm kiếm</button>
      </form>

      <div className="header__actions">
        <Link to="#" className="header-action">
          <span className="header-action__icon">🔔</span>
          <span className="header-action__label">Thông báo</span>
        </Link>
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
              <Link to="/tai-khoan" className="dropdown-item" onClick={() => setShowDropdown(false)}>Thông tin tài khoản</Link>
              <Link to="/don-hang" className="dropdown-item" onClick={() => setShowDropdown(false)}>Lịch sử đơn hàng</Link>
              <button onClick={handleLogout} className="dropdown-item">Đăng xuất</button>
            </div>
          </div>
        ) : (
          <Link to="/dang-nhap" className="header-action">
            <span className="header-action__icon">👤</span>
            <span className="header-action__label">Tài khoản</span>
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
        console.log('Categories timeout - setting loaded')
        setCategoriesLoaded(true)
      }
    }, 8000)
    import('../api/categories.js')
      .then(({ getCategories }) => getCategories())
      .then((res) => {
        if (cancelled) return
        console.log('Categories API response:', res)
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
          console.error('Categories API error:', err)
          setCategories([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          clearTimeout(timeoutId)
          console.log('Categories loaded (finally)')
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
          <span>CHỌN TỦ SÁCH</span>
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
                    {String(cat.categoryName).trim() || 'Danh mục'}
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
          TRANG CHỦ
        </Link>
        <Link to="/san-pham" className={isActive('/san-pham') ? 'active' : ''}>
          SẢN PHẨM
          <span className="badge-hot">Hot</span>
        </Link>
        <Link to="/sach-moi" className={isActive('/sach-moi') ? 'active' : ''}>SÁCH BÁN CHẠY</Link>
        <Link to="/sach-hay" className={isActive('/sach-hay') ? 'active' : ''}>SÁCH HAY</Link>
        <Link to="/tin-tuc" className={isActive('/tin-tuc') ? 'active' : ''}>TIN TỨC</Link>
        <Link to="/chinh-sach" className={isActive('/chinh-sach') ? 'active' : ''}>CHÍNH SÁCH</Link>
        <Link to="/lien-he" className={isActive('/lien-he') ? 'active' : ''}>LIÊN HỆ</Link>
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
