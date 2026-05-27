import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';
import Breadcrumb from '../../components/common/Breadcrumb';
import { useAuth } from '../../context/AuthContext';

const items = [
  { to: '/account', label: 'Tài khoản', icon: 'user', exact: true },
  { to: '/account/orders', label: 'Đơn hàng của tôi', icon: 'package' },
  { to: '/account/addresses', label: 'Sổ địa chỉ', icon: 'location' },
  { to: '/account/reviews', label: 'Đánh giá', icon: 'star' },
  { to: '/account/change-password', label: 'Đổi mật khẩu', icon: 'shield' },
];

const AccountPage = () => {
  const { user, logout } = useAuth();
  return (
    <>
      <Breadcrumb items={[{ label: 'Tài khoản' }]} />
      <section className="section">
        <div className="container account-grid">
          <aside className="account-side">
            <div className="account-card">
              <div className="account-avatar">
                {user?.imageUrl
                  ? <img src={user.imageUrl} alt={user.fullName || user.username} />
                  : <span>{(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}</span>}
              </div>
              <strong>{user?.fullName || user?.username}</strong>
              <span>{user?.email}</span>
            </div>
            <nav className="account-nav">
              {items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.exact}
                  className={({ isActive }) => `account-link${isActive ? ' is-active' : ''}`}
                >
                  <Icon name={it.icon} size={16} />
                  <span>{it.label}</span>
                </NavLink>
              ))}
              <button onClick={logout} className="account-link account-logout">
                <Icon name="arrowLeft" size={16} />
                <span>Đăng xuất</span>
              </button>
            </nav>
          </aside>
          <div className="account-main">
            <Outlet />
          </div>
        </div>
      </section>

      <style>{`
        .account-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          align-items: start;
        }
        .account-side {
          position: sticky;
          top: calc(var(--header-h) + 24px);
          display: flex; flex-direction: column;
          gap: 14px;
        }
        .account-card {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: 22px 18px;
          text-align: center;
          border: 1px solid var(--color-border-soft);
        }
        .account-avatar {
          width: 78px; height: 78px;
          border-radius: 50%;
          margin: 0 auto 12px;
          background: var(--color-primary);
          color: #fff;
          font-weight: 700;
          font-size: 28px;
          display: inline-flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .account-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .account-card strong { display: block; font-size: 16px; }
        .account-card span { font-size: 13px; color: var(--color-text-mute); }
        .account-nav {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: 8px;
          border: 1px solid var(--color-border-soft);
          display: flex; flex-direction: column; gap: 2px;
        }
        .account-link {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px;
          border-radius: var(--radius-md);
          color: var(--color-text-soft);
          font-weight: 500;
          font-size: 14px;
          text-align: left;
          transition: background var(--t-fast), color var(--t-fast);
        }
        .account-link:hover { background: var(--color-bg-alt); color: var(--color-text); }
        .account-link.is-active {
          background: var(--color-primary-bg);
          color: var(--color-primary);
          font-weight: 600;
        }
        .account-logout { color: var(--color-danger); }
        .account-logout:hover { background: var(--color-danger-soft); color: var(--color-danger); }

        .account-main { min-width: 0; }

        @media (max-width: 900px) {
          .account-grid { grid-template-columns: 1fr; }
          .account-side { position: static; }
        }
      `}</style>
    </>
  );
};

export default AccountPage;
