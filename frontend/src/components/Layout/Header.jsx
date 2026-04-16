/* ================================================================
   HEADER COMPONENT - Redesigned Bold & Vibrant
   ================================================================ */

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCartCount } from '../../utils/cart'
import { isLoggedIn, getUser } from '../../api/client'

/* ================================================================
   ICONS
   ================================================================ */

const Icons = {
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Cart: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  User: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Heart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Sun: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Moon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  X: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  LogOut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Package: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Book: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
}

/* ================================================================
   LOGO
   ================================================================ */

function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ================================================================
   HEADER COMPONENT
   ================================================================ */

export function Header() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const userMenuRef = useRef(null)

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cart count
  useEffect(() => {
    const updateCart = () => setCartCount(getCartCount())
    updateCart()
    window.addEventListener('cart-change', updateCart)
    return () => window.removeEventListener('cart-change', updateCart)
  }, [])

  // User state
  useEffect(() => {
    if (isLoggedIn()) {
      setUser(getUser())
    }
  }, [])

  // Click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/san-pham?search=${encodeURIComponent(searchValue.trim())}`)
    } else {
      navigate('/san-pham')
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    setUser(null)
    window.dispatchEvent(new Event('auth-change'))
    navigate('/')
    window.location.reload()
  }

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light')
  }

  const getUserInitial = () => {
    if (user?.fullName) return user.fullName.charAt(0).toUpperCase()
    if (user?.username) return user.username.charAt(0).toUpperCase()
    return 'U'
  }

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="header__container">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <div className="header__logo-icon">
            <Logo size={26} />
          </div>
          <span className="header__logo-text">HOÀNG KIM</span>
        </Link>

        {/* Search */}
        <form className="header__search" onSubmit={handleSearch}>
          <input
            type="search"
            className="header__search-input"
            placeholder="Tìm kiếm sách, tác giả..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="Tìm kiếm sản phẩm"
          />
          <button type="submit" className="header__search-btn" aria-label="Tìm kiếm">
            <Icons.Search />
          </button>
        </form>

        {/* Actions */}
        <div className="header__actions">
          {/* Wishlist */}
          <Link to="/san-pham?favorites=true" className="header__action" aria-label="Sách yêu thích">
            <span className="header__action-icon">
              <Icons.Heart />
            </span>
            <span className="header__action-label">Yêu thích</span>
          </Link>

          {/* Cart */}
          <Link to="/gio-hang" className="header__action header__action--cart" aria-label="Giỏ hàng">
            <span className="header__action-icon">
              <Icons.Cart />
              {cartCount > 0 && (
                <span className="header__cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </span>
            <span className="header__action-label">Giỏ hàng</span>
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="header__user-menu" ref={userMenuRef}>
              <button
                className="header__action header__action--user"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <span className="header__action-avatar">{getUserInitial()}</span>
                <span className="header__action-label">{user.fullName || user.username}</span>
                <Icons.ChevronDown />
              </button>
              
              {showUserMenu && (
                <div className="header__dropdown">
                  <Link to="/tai-khoan" className="header__dropdown-item">
                    <Icons.User /> Thông tin tài khoản
                  </Link>
                  <Link to="/don-hang" className="header__dropdown-item">
                    <Icons.Package /> Đơn hàng
                  </Link>
                  <Link to="/san-pham?favorites=true" className="header__dropdown-item">
                    <Icons.Heart /> Yêu thích
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="header__dropdown-item">
                      <Icons.Package /> Quản trị
                    </Link>
                  )}
                  <hr className="header__dropdown-divider" />
                  <button onClick={handleLogout} className="header__dropdown-item header__dropdown-item--danger">
                    <Icons.LogOut /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/dang-nhap" className="header__action header__action--login">
              <span className="header__action-icon">
                <Icons.User />
              </span>
              <span className="header__action-label">Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
