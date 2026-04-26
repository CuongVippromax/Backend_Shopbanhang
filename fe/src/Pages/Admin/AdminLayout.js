import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/products', label: 'Quản lý Sản phẩm' },
    { path: '/admin/categories', label: 'Quản lý Danh mục' },
    { path: '/admin/orders', label: 'Quản lý Đơn hàng' },
    { path: '/admin/users', label: 'Quản lý Người dùng' },
    { path: '/admin/reviews', label: 'Quản lý Đánh giá' },
    { path: '/admin/articles', label: 'Quản lý Bài viết' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Nhà sách Hoàng Kim</h2>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="nav-item">
            <span className="nav-label">Xem Website</span>
          </Link>
          <button onClick={handleLogout} className="nav-item logout-btn">
            <span className="nav-label">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-title">
            <h1>{menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}</h1>
          </div>
          <div className="header-actions">
            <span className="admin-name">Admin</span>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
