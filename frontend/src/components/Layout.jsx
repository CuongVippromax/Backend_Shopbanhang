import { Outlet, Link, useLocation, useNavigate, createSearchParams } from 'react-router-dom'
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { getUser, isLoggedIn, logout } from '../api/client'
import { getCartCount, getCart } from '../utils/cart'
import Chatbot from './Chatbot'
import './Chatbot.css'

/* ================================================================
   ICONS - SVG Icons
   ================================================================ */

const Icons = {
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  Cart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  Phone: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  ),
  Heart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  X: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Info: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
  Home: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
  Package: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  ),
  Book: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  Children: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
      <line x1="9" y1="9" x2="9.01" y2="9"></line>
      <line x1="15" y1="9" x2="15.01" y2="9"></line>
    </svg>
  ),
  FileText: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  Mail: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  ),
  MapPin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  LogOut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  ),
  ShoppingBag: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  ),
  LayoutDashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1"></rect>
      <rect x="14" y="3" width="7" height="5" rx="1"></rect>
      <rect x="14" y="12" width="7" height="9" rx="1"></rect>
      <rect x="3" y="16" width="7" height="5" rx="1"></rect>
    </svg>
  ),
  List: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  ),
  Zalo: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
    </svg>
  ),
  Truck: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5"></circle>
      <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  ),
  RefreshCw: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"></polyline>
      <polyline points="1 20 1 14 7 14"></polyline>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
  ),
}

/** Logo nhà sách: sách mở (thay chữ HK) */
function LogoBookMark({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
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

/** Logo GHN (inline — tránh lỗi tải file SVG / encoding) */
function FooterLogoGhn() {
  return (
    <span className="footer__partner-img footer__partner-img--inline-svg" role="img" aria-label="Giao Hàng Nhanh (GHN)">
      <svg viewBox="0 0 48 48" width="40" height="40" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect width="48" height="48" rx="10" fill="#F47920" />
        <rect x="14" y="12" width="20" height="14" rx="2" fill="none" stroke="#fff" strokeWidth="1.8" />
        <line x1="14" y1="17" x2="34" y2="17" stroke="#fff" strokeWidth="1.2" />
        <text
          x="24"
          y="38"
          textAnchor="middle"
          fill="#fff"
          style={{ fontFamily: 'system-ui, Segoe UI, Arial, sans-serif', fontSize: 10, fontWeight: 800 }}
        >
          GHN
        </text>
      </svg>
    </span>
  )
}

/* ================================================================
   HEADER COMPONENT
   ================================================================ */

function Header() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef(null)

  // Scroll detection for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const getUserInitial = () => {
    if (user?.fullName) return user.fullName.charAt(0).toUpperCase()
    if (user?.username) return user.username.charAt(0).toUpperCase()
    return 'U'
  }

  return (
    <header className={`header ${isScrolled ? 'header--sticky' : ''}`}>
      <Link to="/" className="header__logo">
        <div className="logo-circle" aria-hidden>
          <LogoBookMark size={26} />
        </div>
        <div className="logo-text">
          <span className="logo-title">NHÀ SÁCH HOÀNG KIM</span>
          <span className="logo-subtitle">Nơi tri thức gặp gỡ</span>
        </div>
      </Link>

      <form className={`header__search ${isSearchFocused ? 'header__search--focused' : ''}`} onSubmit={handleSearch}>
        <input
          name="q"
          className="search__input"
          placeholder="Tìm kiếm sách, tác giả..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        <button type="submit" className="search__button" aria-label="Tìm kiếm">
          <Icons.Search />
          <span className="hide-mobile">Tìm kiếm</span>
        </button>
      </form>

      <div className="header__actions">
        <Link to="/gio-hang" className="header-action header-action--cart" aria-label="Giỏ hàng">
          <span className="header-action__icon"><Icons.Cart /></span>
          {cartCount > 0 && (
            <span className="header-cart-badge animate-bounce">{cartCount > 99 ? '99+' : cartCount}</span>
          )}
          <span className="header-action__label">Giỏ hàng</span>
        </Link>

        {user ? (
          <div
            ref={dropdownRef}
            className={`user-dropdown ${showDropdown ? 'show' : ''}`}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <button
              className="header-action header-action--user"
              aria-haspopup="true"
              aria-expanded={showDropdown}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="header-action__avatar">{getUserInitial()}</span>
              <span className="header-action__label">{user.fullName || user.username || 'Tài khoản'}</span>
              <span className="header-action__chevron"><Icons.ChevronDown /></span>
            </button>
            <div className="dropdown-menu animate-slide-down" role="menu">
              <Link to="/tai-khoan" className="dropdown-item" role="menuitem" onClick={() => setShowDropdown(false)}>
                <Icons.User /> Thông tin tài khoản
              </Link>
              <Link to="/don-hang" className="dropdown-item" role="menuitem" onClick={() => setShowDropdown(false)}>
                <Icons.ShoppingBag /> Lịch sử đơn hàng
              </Link>
              <Link to="/san-pham?favorites=true" className="dropdown-item" role="menuitem" onClick={() => setShowDropdown(false)}>
                <Icons.Heart /> Sách yêu thích
              </Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="dropdown-item" role="menuitem" onClick={() => setShowDropdown(false)}>
                  <Icons.LayoutDashboard /> Dashboard
                </Link>
              )}
              <div className="dropdown-divider" />
              <button onClick={handleLogout} className="dropdown-item dropdown-item--danger" role="menuitem">
                <Icons.LogOut /> Đăng xuất
              </button>
            </div>
          </div>
        ) : (
          <Link to="/dang-nhap" className="header-action header-action--login">
            <span className="header-action__icon"><Icons.User /></span>
            <span className="header-action__label">Đăng nhập</span>
          </Link>
        )}
      </div>
    </header>
  )
}

/* ================================================================
   NAVBAR COMPONENT
   ================================================================ */

/** Link tới /san-pham với query chuẩn (tránh lỗi encoding / mất param trên RR7) */
function sanPhamCategoryTo(id, name) {
  const label = name != null ? String(name).trim() : ''
  const params = {}
  if (id != null && id !== '') {
    params.categoryId = String(id)
    if (label) params.category = label
  } else if (label) {
    params.category = label
  }
  const q = createSearchParams(params).toString()
  return q ? { pathname: '/san-pham', search: `?${q}` } : '/san-pham'
}

function NavBar() {
  const location = useLocation()
  const [categories, setCategories] = useState([])
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <nav className="nav">
      <div className="nav__left">
        <div className="nav-catalog-wrap">
          <Link to="/san-pham" className="nav__catalog">
            <span>DANH MỤC SÁCH</span>
            <span className="nav-catalog-arrow"><Icons.ChevronDown /></span>
          </Link>
          <div className="nav-catalog-dropdown">
            {!categoriesLoaded ? (
              <div className="nav-catalog-empty">
                <span className="spinner spinner-sm"></span>
                <span>Đang tải...</span>
              </div>
            ) : categories.length > 0 ? (
              <ul className="nav-catalog-list">
                {categories.map((cat, index) => {
                  const name = String(cat.categoryName ?? cat.CategoryName ?? '').trim()
                  const id = cat.categoryId ?? cat.CategoryId
                  return (
                    <li key={id ?? name} style={{ animationDelay: `${index * 30}ms` }}>
                      <Link to={sanPhamCategoryTo(id, name)}>
                        <Icons.ChevronRight /> {name || 'Danh mục'}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="nav-catalog-empty">Không có danh mục</div>
            )}
          </div>
        </div>

        <button
          className="nav__mobile-toggle hide-desktop"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <Icons.Menu />
        </button>
      </div>

      <div className={`nav__links ${isMobileMenuOpen ? 'nav__links--open' : ''}`}>
        <Link to="/" className={`nav__link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>
          Trang chủ
        </Link>
        <Link to="/san-pham" className={`nav__link ${isActive('/san-pham') ? 'active' : ''}`}>
          Sản phẩm
        </Link>
        <Link to="/sach-moi" className={`nav__link ${isActive('/sach-moi') ? 'active' : ''}`}>
          Sách mới
        </Link>
        <Link to="/sach-hay" className={`nav__link ${isActive('/sach-hay') ? 'active' : ''}`}>
          Sách hay
        </Link>
        <Link to="/truyen-tranh-thieu-nhi" className={`nav__link ${isActive('/truyen-tranh-thieu-nhi') ? 'active' : ''}`}>
          Thiếu nhi
        </Link>
        <Link to="/chinh-sach" className={`nav__link ${isActive('/chinh-sach') ? 'active' : ''}`}>
          Chính sách
        </Link>
        <Link to="/lien-he" className={`nav__link ${isActive('/lien-he') ? 'active' : ''}`}>
          Liên hệ
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="nav__hotline hide-mobile" aria-label="Hotline: 024 3856 7890" role="img">
          <Icons.Phone />
          <span>Hotline: <strong>024 3856 7890</strong></span>
        </div>
      </div>
    </nav>
  )
}

/* ================================================================
   TOAST NOTIFICATION COMPONENT
   ================================================================ */

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 8000)
    return () => clearTimeout(timer)
  }, [onClose])

  const config = {
    success: { bg: '#10b981', icon: <Icons.Check />, title: 'Thành công' },
    error: { bg: '#ef4444', icon: <Icons.X />, title: 'Lỗi' },
    warning: { bg: '#f59e0b', icon: <Icons.Info />, title: 'Cảnh báo' },
    info: { bg: '#3b82f6', icon: <Icons.Info />, title: 'Thông tin' },
  }

  const { bg, icon, title } = config[type] || config.success

  return (
    <div className="toast-modern" style={{ '--toast-bg': bg }} aria-live="polite">
      <div className="toast-modern__icon">{icon}</div>
      <div className="toast-modern__content">
        <div className="toast-modern__title">{title}</div>
        <div className="toast-modern__message">{message}</div>
      </div>
      <button className="toast-modern__close" onClick={onClose} aria-label="Đóng thông báo">
        <Icons.X />
      </button>
      <div className="toast-modern__progress" />
    </div>
  )
}

/** Cuộn lên đầu trang (kể cả khi bấm lại cùng một link footer) */
function scrollPageTop() {
  window.scrollTo(0, 0)
}

/* ================================================================
   FOOTER COMPONENT
   ================================================================ */

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__container">
          <div className="footer__grid">
            {/* Brand Column */}
            <div className="footer__col footer__col--brand">
              <div className="footer__logo">
                <span className="footer__logo-icon" aria-hidden>
                  <LogoBookMark size={22} />
                </span>
                <span>NHÀ SÁCH HOÀNG KIM</span>
              </div>
              <p className="footer__desc">
                Nhà sách Hoàng Kim là hệ thống sách online với hàng ngàn đầu sách trong và ngoài nước. Cam kết mang đến những cuốn sách chất lượng, đóng gói cẩn thận và giao hàng nhanh chóng.
              </p>
              <div className="footer__social">
                <a href="#" className="footer__social-link" title="Zalo">
                  <Icons.Zalo />
                </a>
              </div>
            </div>

            {/* Services Column */}
            <div className="footer__col">
              <h4 className="footer__title">
                <Icons.FileText /> Dịch vụ
              </h4>
              <ul className="footer__list">
                <li><Link to="/trang/dieu-khoan-su-dung" onClick={scrollPageTop}><Icons.ChevronRight /> Điều khoản sử dụng</Link></li>
                <li><Link to="/trang/chinh-sach-bao-mat" onClick={scrollPageTop}><Icons.ChevronRight /> Chính sách bảo mật</Link></li>
                <li><Link to="/trang/chinh-sach-thanh-toan" onClick={scrollPageTop}><Icons.ChevronRight /> Chính sách thanh toán</Link></li>
                <li><Link to="/trang/gioi-thieu" onClick={scrollPageTop}><Icons.ChevronRight /> Giới thiệu Hoàng Kim</Link></li>
                <li><Link to="/trang/he-thong-nha-sach" onClick={scrollPageTop}><Icons.ChevronRight /> Hệ thống nhà sách</Link></li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="footer__col">
              <h4 className="footer__title">
                <Icons.Heart /> Hỗ trợ
              </h4>
              <ul className="footer__list">
                <li><Link to="/trang/chinh-sach-doi-tra-hoan-tien" onClick={scrollPageTop}><Icons.ChevronRight /> Chính sách đổi - trả - hoàn tiền</Link></li>
                <li><Link to="/chinh-sach-bao-hanh" onClick={scrollPageTop}><Icons.ChevronRight /> Chính sách bảo hành</Link></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="footer__col footer__col--contact">
              <h4 className="footer__title">
                <Icons.MapPin /> Liên hệ
              </h4>
              <div className="footer__contact">
                <div className="footer__contact-item">
                  <Icons.MapPin />
                  <span>Số 123 Đường Quang Trung, Quận Hà Đông, Hà Nội</span>
                </div>
                <div className="footer__contact-item">
                  <Icons.Mail />
                  <a href="mailto:hotro@hoangkimbooks.vn">hotro@hoangkimbooks.vn</a>
                </div>
                <div className="footer__contact-item">
                  <Icons.Phone />
                  <a href="tel:02438567890" className="footer__hotline">024 3856 7890</a>
                </div>
                <div className="footer__contact-item">
                  <Icons.Clock />
                  <span>8h00 - 22h00 (T2 - CN)</span>
                </div>
              </div>
              <div className="footer__partners" aria-label="Thanh toán và đơn vị vận chuyển">
                <img
                  className="footer__partner-img"
                  src="/images/vnpay-logo.png"
                  alt="VNPay — thanh toán"
                  width="90"
                  height="32"
                  loading="lazy"
                />
                <img
                  className="footer__partner-img"
                  src="/images/partner-jnt.svg"
                  alt="J&amp;T Express — vận chuyển"
                  width="120"
                  height="34"
                  loading="lazy"
                />
                <FooterLogoGhn />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__container">
          <div className="footer__bottom-content">
            <div className="footer__copyright">
              <p>© 2026 Nhà sách Hoàng Kim. Tất cả quyền được bảo lưu.</p>
              <p className="footer__secure">
                <Icons.Shield /> Thanh toán an toàn & bảo mật
              </p>
            </div>
            <div className="footer__bottom-links">
              <Link to="/trang/dieu-khoan-su-dung" onClick={scrollPageTop}>Điều khoản</Link>
              <Link to="/trang/chinh-sach-bao-mat" onClick={scrollPageTop}>Bảo mật</Link>
              <Link to="/trang/faq" onClick={scrollPageTop}>FAQ</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ================================================================
   MAIN LAYOUT COMPONENT
   ================================================================ */

/** Mỗi lần đổi route (vd: link footer) → cuộn lên đầu trang */
function ScrollToTop() {
  const { pathname, search, hash } = useLocation()
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search, hash])
  return null
}

export default function Layout() {
  const [showChatbot, setShowChatbot] = useState(false)

  const toggleChatbot = () => setShowChatbot(!showChatbot)
  const closeChatbot = () => setShowChatbot(false)

  return (
    <div className="app">
      <ScrollToTop />
      <Header />
      <NavBar />
      <main id="main-content" className="main">
        <Outlet />
      </main>
      <Footer />

      {/* Chatbot */}
      {showChatbot && <Chatbot onClose={closeChatbot} />}
      {createPortal(
        <div className="chatbot-wrapper">
          <button
            type="button"
            className="chatbot-toggle-btn"
            onClick={toggleChatbot}
            aria-label={showChatbot ? 'Đóng cửa sổ tư vấn' : 'Mở chat tư vấn nhà sách'}
          >
            {showChatbot ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            )}
          </button>
        </div>,
        document.body
      )}
    </div>
  )
}

export { Header, NavBar, Footer, Toast }
