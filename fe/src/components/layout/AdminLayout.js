import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Tổng quan', icon: 'home', exact: true },
  { to: '/admin/books', label: 'Sách', icon: 'book' },
  { to: '/admin/categories', label: 'Danh mục', icon: 'package' },
  { to: '/admin/orders', label: 'Đơn hàng', icon: 'truck' },
  { to: '/admin/articles', label: 'Bài viết', icon: 'edit' },
  { to: '/admin/reviews', label: 'Đánh giá', icon: 'star' },
  { to: '/admin/users', label: 'Người dùng', icon: 'user' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const onLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className={`admin-shell ${collapsed ? 'is-collapsed' : ''}`}>
      <aside className="admin-side">
        <div className="admin-brand">
          <span className="admin-brand-mark"><Icon name="book" size={20} /></span>
          {!collapsed && (
            <div>
              <strong>Hoàng Kim</strong>
              <small>Trang quản trị</small>
            </div>
          )}
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}
              title={item.label}
            >
              <Icon name={item.icon} size={18} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <button className="admin-collapse" onClick={() => setCollapsed(v => !v)}>
          <Icon name={collapsed ? 'arrow' : 'arrowLeft'} size={16} />
          {!collapsed && <span>Thu gọn</span>}
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <Link to="/" className="admin-link">
            <Icon name="arrowLeft" size={14} /> Về trang chính
          </Link>
          <div className="admin-user">
            <div className="admin-avatar">
              {(user?.fullName || user?.username || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-meta">
              <strong>{user?.fullName || user?.username}</strong>
              <small>Quản trị viên</small>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>
              Đăng xuất
            </button>
          </div>
        </header>
        <div className="admin-content page-enter">
          <Outlet />
        </div>
      </div>

      <style>{`
        .admin-shell {
          display: grid;
          grid-template-columns: 240px 1fr;
          min-height: 100vh;
          background: var(--color-bg);
        }
        .admin-shell.is-collapsed { grid-template-columns: 72px 1fr; }

        .admin-side {
          background: linear-gradient(180deg, #34504b 0%, #2c3a33 100%);
          color: rgba(255,255,255,0.85);
          display: flex;
          flex-direction: column;
          padding: 18px 12px;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .admin-brand {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 6px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 14px;
        }
        .admin-brand-mark {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: var(--color-accent);
          color: #2c2410;
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .admin-brand strong { display: block; color: #fff; font-size: 16px; font-family: var(--font-serif); }
        .admin-brand small { color: rgba(255,255,255,0.6); font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; }

        .admin-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .admin-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          color: rgba(255,255,255,0.7);
          font-size: 14px;
          font-weight: 500;
          transition: background var(--t-fast), color var(--t-fast);
        }
        .admin-nav-link:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .admin-nav-link.is-active {
          background: rgba(255,255,255,0.12);
          color: #fff;
        }

        .admin-collapse {
          margin-top: 12px;
          padding: 10px 12px;
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          font-weight: 500;
          border-radius: var(--radius-md);
          display: flex; align-items: center; gap: 8px;
          justify-content: center;
        }
        .admin-collapse:hover { background: rgba(255,255,255,0.08); color: #fff; }

        .admin-main { display: flex; flex-direction: column; min-width: 0; }
        .admin-topbar {
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border-soft);
          padding: 14px 28px;
          display: flex; justify-content: space-between; align-items: center;
          position: sticky; top: 0; z-index: 5;
        }
        .admin-link {
          font-size: 13px; font-weight: 600; color: var(--color-text-soft);
          display: inline-flex; align-items: center; gap: 6px;
        }
        .admin-link:hover { color: var(--color-primary); }
        .admin-user { display: flex; align-items: center; gap: 12px; }
        .admin-avatar {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: var(--color-primary);
          color: #fff;
          font-weight: 700;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .admin-user-meta { display: flex; flex-direction: column; line-height: 1.2; }
        .admin-user-meta strong { font-size: 14px; }
        .admin-user-meta small { color: var(--color-text-mute); font-size: 12px; }

        .admin-content { padding: 28px; max-width: 1400px; width: 100%; margin: 0 auto; }

        @media (max-width: 900px) {
          .admin-shell { grid-template-columns: 72px 1fr; }
          .admin-shell.is-collapsed { grid-template-columns: 72px 1fr; }
          .admin-brand strong, .admin-brand small, .admin-nav-link span, .admin-collapse span { display: none; }
          .admin-content { padding: 20px 16px; }
          .admin-user-meta { display: none; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
