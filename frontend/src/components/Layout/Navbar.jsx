/* ================================================================
   NAVBAR COMPONENT - Redesigned Bold & Vibrant
   ================================================================ */

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

/* ================================================================
   ICONS
   ================================================================ */

const Icons = {
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Package: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Star: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Book: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Children: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  FileText: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Phone: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Sparkles: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 14l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5L17 16l1.5-.5.5-1.5z" />
      <path d="M5 18l.5 1.5L7 20l-1.5.5L5 22l-.5-1.5L3 20l1.5-.5.5-1.5z" />
    </svg>
  ),
  Fire: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c-4.97 0-9-2.24-9-5v-.09c.23-2.68 3.29-4.86 6.5-6.77l1.5-.91c.65-.39 1.47-.39 2.12 0l1.5.91c3.21 1.91 6.27 4.09 6.5 6.77V17c0 2.76-4.03 5-9 5z" />
      <path d="M12 22c-2 0-3.5-1.12-3.5-2.5 0-1.93 2.5-4.17 3.5-4.88.5.71 1.5 1.88 2 2.88.5-1 1.5-2.17 2-2.88 1 .71 3.5 2.95 3.5 4.88 0 1.38-1.5 2.5-3.5 2.5z" />
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
}

/* ================================================================
   NAV LINKS DATA
   ================================================================ */

const navLinks = [
  { to: '/', icon: Icons.Home, label: 'Trang chủ' },
  { to: '/san-pham', icon: Icons.Package, label: 'Sản phẩm' },
  { to: '/sach-moi', icon: Icons.Sparkles, label: 'Sách mới', highlight: true },
  { to: '/sach-hay', icon: Icons.Star, label: 'Sách hay', highlight: true },
  { to: '/truyen-tranh-thieu-nhi', icon: Icons.Children, label: 'Thiếu nhi' },
  { to: '/chinh-sach', icon: Icons.FileText, label: 'Chính sách' },
  { to: '/lien-he', icon: Icons.Phone, label: 'Liên hệ' },
]

/* ================================================================
   NAVBAR COMPONENT
   ================================================================ */

export function Navbar() {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [categories, setCategories] = useState([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { getCategories } = await import('../../api/categories.js')
        const data = await getCategories()
        const cats = Array.isArray(data) ? data : data?.content || data?.data || []
        setCategories(cats.slice(0, 8))
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }
    loadCategories()
  }, [])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        {/* Mobile menu button */}
        <button
          className="navbar__mobile-toggle hide-desktop"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <Icons.Menu />
        </button>

        {/* Nav links */}
        <div className={`navbar__links ${isMobileMenuOpen ? 'navbar__links--open' : ''}`}>
          {navLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar__link ${isActive(link.to) ? 'navbar__link--active' : ''} ${link.highlight ? 'navbar__link--highlight' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon />
                <span>{link.label}</span>
                {link.highlight && <span className="navbar__link-badge">Mới</span>}
              </Link>
            )
          })}
        </div>

        {/* Hotline */}
        <div className="navbar__hotline">
          <Icons.Phone />
          <span>Hotline: <strong>024 3856 7890</strong></span>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
