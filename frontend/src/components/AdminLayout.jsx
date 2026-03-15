import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getUser, isLoggedIn } from '../api/client'
import './AdminLayout.css'

const pathToBreadcrumb = {
  '/admin': [{ label: 'Dashboard', path: '/admin' }],
  '/admin/orders': [{ label: 'Đơn hàng', path: '/admin/orders' }],
  '/admin/products': [{ label: 'Sản phẩm', path: '/admin/products' }],
  '/admin/users': [{ label: 'Thành viên', path: '/admin/users' }],
  '/admin/categories': [{ label: 'Danh mục', path: '/admin/categories' }],
  '/admin/posts': [{ label: 'Bài viết', path: '/admin/posts' }],
  '/admin/statistics': [{ label: 'Thống kê', path: '/admin/statistics' }],
  '/admin/inventory': [{ label: 'Quản lý kho', path: '/admin/inventory' }],
  '/admin/comments': [{ label: 'Bình luận', path: '/admin/comments' }],
}

function AdminBreadcrumb({ pathname }) {
  const items = pathToBreadcrumb[pathname] || [{ label: 'Admin', path: '/admin' }]
  return (
    <nav className="admin-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item.path}>
          {i > 0 && ' / '}
          {i === items.length - 1 ? (
            <span>{item.label}</span>
          ) : (
            <Link to={item.path}>{item.label}</Link>
          )}
        </span>
      ))}
    </nav>
  )
}

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: '◉', exact: true },
  { path: '/admin/orders', label: 'Đơn hàng', icon: '🛒', hasDropdown: true },
  { path: '/admin/categories', label: 'Danh mục', icon: '⊞', hasDropdown: true },
  { path: '/admin/products', label: 'Sản phẩm', icon: '📦', hasDropdown: true },
  { path: '/admin/posts', label: 'Bài viết', icon: '📄', hasDropdown: true },
  { path: '/admin/statistics', label: 'Thống kê', icon: '📈', hasDropdown: true },
  { path: '/admin/inventory', label: 'Quản lý kho', icon: '🏭' },
  { path: '/admin/users', label: 'Thành viên', icon: '👥' },
  { path: '/admin/comments', label: 'Bình luận', icon: '💬' },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/admin/login')
      return
    }
    const user = getUser()
    if (!user || user.role !== 'ADMIN') {
      navigate('/admin/login')
    }
  }, [navigate])

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className="admin-layout admin-layout--new">
      <aside className={`admin-sidebar admin-sidebar--new ${sidebarOpen ? '' : 'admin-sidebar--collapsed'}`}>
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__brand-icon">👤</span>
          <span className="admin-sidebar__brand-text">Bookstore</span>
        </div>
        <nav className="admin-sidebar__nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar__link ${isActive(item.path, item.exact) ? 'admin-sidebar__link--active' : ''}`}
            >
              <span className="admin-sidebar__icon">{item.icon}</span>
              <span className="admin-sidebar__label">{item.label}</span>
              {item.hasDropdown && <span className="admin-sidebar__arrow">▼</span>}
            </Link>
          ))}
          <div className="admin-sidebar__footer">
            <Link to="/" className="admin-sidebar__link admin-sidebar__link--out">
              <span className="admin-sidebar__icon">🏠</span>
              <span className="admin-sidebar__label">Về shop</span>
            </Link>
          </div>
        </nav>
      </aside>

      <div className="admin-body">
        <header className="admin-header">
          <button
            type="button"
            className="admin-header__menu-btn"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Menu"
          >
            ☰
          </button>
          <div className="admin-header__search">
            <input
              type="text"
              placeholder="Tìm kiếm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-header__search-input"
            />
          </div>
          <div className="admin-header__right">
            <div className="admin-header__item">
              <span className="admin-header__item-icon">✉</span>
              <span className="admin-header__item-text">Tin nhắn</span>
              <span className="admin-header__item-arrow">▼</span>
            </div>
            <div className="admin-header__item">
              <span className="admin-header__item-icon">🔔</span>
              <span className="admin-header__item-text">Thông báo</span>
              <span className="admin-header__item-arrow">▼</span>
            </div>
            <div className="admin-header__item admin-header__item--user">
              <span className="admin-header__avatar">👤</span>
              <span className="admin-header__item-text">ADMIN</span>
              <span className="admin-header__item-arrow">▼</span>
            </div>
          </div>
        </header>

        <main className="admin-main admin-main--new">
          <AdminBreadcrumb pathname={location.pathname} />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
