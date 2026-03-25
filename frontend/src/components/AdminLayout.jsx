import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getUser, isLoggedIn, logout } from '../api/client'
import './AdminLayout.css'

const pathToBreadcrumb = {
  '/admin': [{ label: 'Dashboard', path: '/admin' }],
  '/admin/orders': [{ label: 'Đơn hàng', path: '/admin/orders' }],
  '/admin/products': [{ label: 'Sản phẩm', path: '/admin/products' }],
  '/admin/users': [{ label: 'Thành viên', path: '/admin/users' }],
  '/admin/categories': [{ label: 'Danh mục', path: '/admin/categories' }],
  '/admin/statistics': [{ label: 'Thống kê', path: '/admin/statistics' }],
  '/admin/inventory': [{ label: 'Quản lý kho', path: '/admin/inventory' }],
  '/admin/comments': [{ label: 'Bình luận', path: '/admin/comments' }],
  '/admin/faq': [{ label: 'FAQ', path: '/admin/faq' }],
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
  { path: '/admin', label: 'Dashboard', exact: true },
  { path: '/admin/orders', label: 'Đơn hàng', hasDropdown: true },
  { path: '/admin/categories', label: 'Danh mục', hasDropdown: true },
  { path: '/admin/products', label: 'Sản phẩm', hasDropdown: true },
  { path: '/admin/statistics', label: 'Thống kê', hasDropdown: true },
  { path: '/admin/inventory', label: 'Quản lý kho' },
  { path: '/admin/users', label: 'Thành viên' },
  { path: '/admin/comments', label: 'Bình luận' },
  { path: '/admin/faq', label: 'FAQ' },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    document.body.classList.add('admin-page-active')
    return () => document.body.classList.remove('admin-page-active')
  }, [])

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    if (!isLoggedIn()) {
      navigate('/dang-nhap')
      return
    }
    if (!currentUser || currentUser.role !== 'ADMIN') {
      navigate('/')
    }
  }, [navigate])

  const handleLogout = () => {
    logout()
    navigate('/dang-nhap')
  }

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className={`admin-layout admin-layout--new ${!sidebarOpen ? 'admin-layout--sidebar-collapsed' : ''}`}>
      <aside className={`admin-sidebar admin-sidebar--new ${sidebarOpen ? '' : 'admin-sidebar--collapsed'}`}>
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__brand-text">Hoàng Kim Book</span>
        </div>
        <nav className="admin-sidebar__nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar__link ${isActive(item.path, item.exact) ? 'admin-sidebar__link--active' : ''}`}
            >
              <span className="admin-sidebar__label">{item.label}</span>
              {item.hasDropdown && <span className="admin-sidebar__arrow">▼</span>}
            </Link>
          ))}
          <div className="admin-sidebar__footer">
            <Link to="/" className="admin-sidebar__link admin-sidebar__link--out">
              <span className="admin-sidebar__label">Về shop</span>
            </Link>
            <button type="button" onClick={handleLogout} className="admin-sidebar__link admin-sidebar__link--out">
              <span className="admin-sidebar__label">Đăng xuất</span>
            </button>
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
            <div className="admin-header__item admin-header__item--user">
              <span className="admin-header__avatar">👤</span>
              <span className="admin-header__item-text">
                {user?.fullName || user?.username || 'Admin'}
              </span>
              <span className="admin-header__item-arrow">▼</span>
            </div>
            <button onClick={handleLogout} className="admin-logout-btn">
              🚪 Đăng xuất
            </button>
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
