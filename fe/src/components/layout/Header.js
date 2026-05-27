import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { categoryApi } from '../../api/shopApi';

const Header = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const userMenuRef = useRef(null);
  const catRef = useRef(null);
  const catCloseTimer = useRef(null);

  useEffect(() => {
    categoryApi.list().then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserOpen(false);
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const openCatMenu = () => {
    if (catCloseTimer.current) {
      clearTimeout(catCloseTimer.current);
      catCloseTimer.current = null;
    }
    setCatOpen(true);
  };
  const scheduleCloseCatMenu = () => {
    if (catCloseTimer.current) clearTimeout(catCloseTimer.current);
    catCloseTimer.current = setTimeout(() => setCatOpen(false), 160);
  };

  const onSubmitSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    navigate(`/books?search=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    setUserOpen(false);
    await logout();
    navigate('/');
  };

  const cartCount = cart?.totalItems || 0;

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <span><Icon name="phone" size={14} /> Hotline: 1900 1234</span>
          <span className="topbar-spacer">·</span>
          <span><Icon name="truck" size={14} /> Miễn phí vận chuyển cho đơn từ 300.000₫</span>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Mở menu"
          >
            <Icon name={mobileOpen ? 'x' : 'menu'} />
          </button>

          <Logo size="md" />

          <form className="header-search" onSubmit={onSubmitSearch} role="search">
            <Icon name="search" size={18} />
            <input
              type="search"
              placeholder="Tìm sách, tác giả, thể loại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tìm kiếm"
            />
            <button type="submit" className="btn btn-primary btn-sm">Tìm</button>
          </form>

          <div className="header-actions">
            <Link to="/cart" className="header-icon" aria-label="Giỏ hàng">
              <Icon name="cart" />
              {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
            </Link>

            {isAuthenticated ? (
              <div className="user-menu-wrap" ref={userMenuRef}>
                <button
                  className="user-button"
                  onClick={() => setUserOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={userOpen}
                >
                  <div className="user-avatar">
                    {user?.imageUrl
                      ? <img src={user.imageUrl} alt={user.fullName || user.username} />
                      : <span>{(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}</span>}
                  </div>
                  <span className="user-name">{user?.fullName || user?.username}</span>
                  <Icon name="down" size={14} />
                </button>
                {userOpen && (
                  <div className="user-dropdown" role="menu">
                    <div className="dd-head">
                      <strong>{user?.fullName || user?.username}</strong>
                      <span>{user?.email}</span>
                    </div>
                    <Link to="/account" onClick={() => setUserOpen(false)}>
                      <Icon name="user" size={16} /> Tài khoản của tôi
                    </Link>
                    <Link to="/account/orders" onClick={() => setUserOpen(false)}>
                      <Icon name="package" size={16} /> Đơn hàng
                    </Link>
                    <Link to="/account/addresses" onClick={() => setUserOpen(false)}>
                      <Icon name="location" size={16} /> Sổ địa chỉ
                    </Link>
                    <Link to="/account/reviews" onClick={() => setUserOpen(false)}>
                      <Icon name="star" size={16} /> Đánh giá của tôi
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserOpen(false)}>
                        <Icon name="shield" size={16} /> Quản trị
                      </Link>
                    )}
                    <div className="dd-divider" />
                    <button onClick={handleLogout}>
                      <Icon name="arrowLeft" size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="header-auth">
                <Link to="/auth/login" className="btn btn-secondary btn-sm">Đăng nhập</Link>
                <Link to="/auth/register" className="btn btn-primary btn-sm">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>

        <nav className={`primary-nav ${mobileOpen ? 'is-open' : ''}`}>
          <div className="container nav-inner">
            <div
              className="cat-menu"
              ref={catRef}
              onMouseEnter={openCatMenu}
              onMouseLeave={scheduleCloseCatMenu}
            >
              <button
                className={`cat-trigger ${catOpen ? 'is-open' : ''}`}
                onClick={() => setCatOpen((v) => !v)}
                onFocus={openCatMenu}
                onMouseEnter={openCatMenu}
                aria-haspopup="menu"
                aria-expanded={catOpen}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>
                <span>Danh mục sách</span>
                <svg className="cat-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {catOpen && (
                <div
                  className="cat-dropdown"
                  role="menu"
                  onMouseEnter={openCatMenu}
                  onMouseLeave={scheduleCloseCatMenu}
                >
                  {categories.length === 0 ? (
                    <div className="cat-loading">
                      <div className="cat-skel" />
                      <div className="cat-skel" />
                      <div className="cat-skel" />
                    </div>
                  ) : (
                    <>
                      <Link
                        to="/books"
                        className="cat-all"
                        onClick={() => setCatOpen(false)}
                      >
                        <span className="cat-all-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                        </span>
                        <span>Tất cả sách</span>
                        <small>{categories.reduce((sum, c) => sum + (c.bookCount || 0), 0)}</small>
                      </Link>
                      <div className="cat-divider" />
                      {categories.map((c) => (
                        <Link
                          key={c.categoryId}
                          to={`/books?category=${c.categoryId}`}
                          onClick={() => setCatOpen(false)}
                        >
                          <span>{c.categoryName}</span>
                          {c.bookCount != null && <small>{c.bookCount}</small>}
                          <svg className="cat-item-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <NavLink to="/" end onClick={() => setMobileOpen(false)}>Trang chủ</NavLink>
            <NavLink to="/books" onClick={() => setMobileOpen(false)}>Tất cả sách</NavLink>
            <NavLink to="/articles" onClick={() => setMobileOpen(false)}>Bài viết</NavLink>
            <NavLink to="/faq" onClick={() => setMobileOpen(false)}>Hỏi đáp</NavLink>
            <NavLink to="/about" onClick={() => setMobileOpen(false)}>Về chúng tôi</NavLink>
            <NavLink to="/contact" onClick={() => setMobileOpen(false)}>Liên hệ</NavLink>
          </div>
        </nav>
      </header>

      <style>{`
        .topbar {
          background: var(--color-primary);
          color: rgba(255,255,255,0.92);
          font-size: 13px;
        }
        .topbar-inner {
          display: flex; align-items: center; gap: 16px;
          padding: 8px 0;
          flex-wrap: wrap;
        }
        .topbar-inner span { display: inline-flex; align-items: center; gap: 6px; }
        .topbar-spacer { opacity: 0.5; }

        .site-header {
          background: var(--color-surface);
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid var(--color-border-soft);
          box-shadow: var(--shadow-xs);
        }
        .header-inner {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: var(--space-6);
          padding: 14px 0;
        }
        .mobile-toggle {
          display: none;
          width: 40px; height: 40px;
          border-radius: var(--radius-md);
          color: var(--color-text);
        }
        .mobile-toggle:hover { background: var(--color-bg-alt); }
        .header-search {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-bg-alt);
          padding: 6px 8px 6px 14px;
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border-soft);
          transition: border-color var(--t-fast), box-shadow var(--t-fast);
        }
        .header-search:focus-within {
          border-color: var(--color-primary-soft);
          box-shadow: 0 0 0 4px rgba(127, 181, 160, 0.18);
        }
        .header-search input {
          flex: 1;
          background: transparent;
          border: 0;
          outline: none;
          padding: 6px 0;
          font-size: 14px;
        }
        .header-search svg { color: var(--color-text-mute); }

        .header-actions {
          display: flex; align-items: center; gap: 14px;
        }
        .header-icon {
          position: relative;
          width: 44px; height: 44px;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 50%;
          background: var(--color-bg-alt);
          color: var(--color-text);
          transition: background var(--t-fast), color var(--t-fast);
        }
        .header-icon:hover { background: var(--color-primary-bg); color: var(--color-primary); }
        .cart-badge {
          position: absolute;
          top: -2px; right: -2px;
          background: var(--color-danger);
          color: #fff;
          min-width: 20px; height: 20px;
          padding: 0 6px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          display: inline-flex; align-items: center; justify-content: center;
          border: 2px solid var(--color-surface);
        }
        .header-auth { display: flex; gap: 8px; }

        .user-menu-wrap { position: relative; }
        .user-button {
          display: inline-flex;
          align-items: center; gap: 8px;
          padding: 6px 12px 6px 6px;
          border-radius: var(--radius-full);
          background: var(--color-bg-alt);
          transition: background var(--t-fast);
        }
        .user-button:hover { background: var(--color-primary-bg); }
        .user-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: var(--color-primary);
          color: #fff;
          font-weight: 700;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 14px;
          overflow: hidden;
        }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .user-name {
          max-width: 130px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text);
        }
        .user-dropdown {
          position: absolute; right: 0; top: calc(100% + 8px);
          width: 260px;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          padding: 4px;
          z-index: 60;
          border: 1px solid var(--color-border-soft);
          animation: ddIn 0.18s ease both;
        }
        @keyframes ddIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
        .user-dropdown .dd-head {
          padding: 12px 14px;
          display: flex; flex-direction: column;
          border-bottom: 1px solid var(--color-border-soft);
          margin-bottom: 4px;
        }
        .user-dropdown .dd-head strong { font-size: 15px; }
        .user-dropdown .dd-head span { font-size: 12px; color: var(--color-text-mute); }
        .user-dropdown a, .user-dropdown button {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          width: 100%;
          font-size: 14px;
          color: var(--color-text);
          text-align: left;
          border-radius: var(--radius-md);
          transition: background var(--t-fast);
        }
        .user-dropdown a:hover, .user-dropdown button:hover { background: var(--color-bg-alt); }
        .dd-divider { height: 1px; background: var(--color-border-soft); margin: 4px 0; }

        .primary-nav {
          background: var(--color-bg-alt);
          border-top: 1px solid var(--color-border-soft);
          position: relative;
          z-index: 60;
        }
        .nav-inner {
          display: flex;
          align-items: stretch;
          gap: 6px;
          overflow: visible;
        }
        .nav-inner > a {
          padding: 12px 16px;
          font-weight: 600;
          font-size: 14px;
          color: var(--color-text-soft);
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          transition: color var(--t-fast), border-color var(--t-fast);
        }
        .nav-inner > a:hover { color: var(--color-primary); }
        .nav-inner > a.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }

        .cat-menu { position: relative; }
        .cat-trigger {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 16px;
          background: var(--color-primary);
          color: #fff;
          font-weight: 600;
          font-size: 14px;
          height: 100%;
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          transition: background var(--t-fast);
          position: relative;
          z-index: 1;
        }
        .cat-trigger:hover, .cat-trigger.is-open { background: #406755; }
        .cat-trigger .cat-arrow {
          transition: transform var(--t-fast);
        }
        .cat-trigger.is-open .cat-arrow {
          transform: rotate(180deg);
        }
        .cat-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          width: 320px;
          background: var(--color-surface);
          box-shadow: var(--shadow-lg);
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
          padding: 6px;
          z-index: 1000;
          max-height: 70vh;
          overflow: auto;
          border: 1px solid var(--color-border-soft);
          border-top: 0;
          animation: ddIn 0.18s ease both;
        }
        .cat-loading {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cat-skel {
          height: 40px;
          border-radius: var(--radius-md);
          background: linear-gradient(90deg, var(--color-bg-alt) 25%, #f6f1e3 50%, var(--color-bg-alt) 75%);
          background-size: 200% 100%;
          animation: skel 1.4s ease infinite;
        }
        .cat-all {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          font-size: 14px;
          color: var(--color-text);
          font-weight: 600;
          background: var(--color-bg-alt);
          margin-bottom: 4px;
          transition: background var(--t-fast), color var(--t-fast);
        }
        .cat-all:hover { background: var(--color-primary-bg); color: var(--color-primary); }
        .cat-all-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
          background: var(--color-primary-soft);
          color: #fff;
          border-radius: var(--radius-sm);
        }
        .cat-all small {
          background: var(--color-surface);
          color: var(--color-text-mute);
          padding: 2px 8px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
        }
        .cat-all:hover small { background: var(--color-primary-soft); color: #fff; }
        .cat-divider { height: 1px; background: var(--color-border-soft); margin: 4px 0; }
        .cat-dropdown a {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          font-size: 14px;
          color: var(--color-text);
          transition: background var(--t-fast), color var(--t-fast), padding-left var(--t-fast);
        }
        .cat-dropdown a:hover {
          background: var(--color-primary-bg);
          color: var(--color-primary);
          padding-left: 16px;
        }
        .cat-dropdown a small {
          background: var(--color-bg-alt);
          color: var(--color-text-mute);
          padding: 2px 8px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          transition: background var(--t-fast), color var(--t-fast);
        }
        .cat-dropdown a:hover small { background: var(--color-primary-soft); color: #fff; }
        .cat-item-arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity var(--t-fast), transform var(--t-fast);
          color: var(--color-primary);
        }
        .cat-dropdown a:hover .cat-item-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        .cat-empty { padding: 12px; font-size: 13px; color: var(--color-text-mute); }

        @media (max-width: 960px) {
          .header-inner { grid-template-columns: auto auto 1fr; gap: 12px; }
          .header-search {
            grid-column: 1 / -1; order: 3;
            margin-top: 4px;
          }
          .mobile-toggle { display: inline-flex; align-items: center; justify-content: center; }
          .user-name { display: none; }
          .header-auth .btn { padding: 6px 10px; font-size: 12px; }
        }
        @media (max-width: 640px) {
          .topbar-inner span:nth-child(2), .topbar-spacer { display: none; }
          .nav-inner { gap: 0; overflow-x: auto; overflow-y: visible; }
          .nav-inner > a { padding: 10px 12px; font-size: 13px; }
          .cat-trigger { padding: 10px 12px; font-size: 13px; }
          .cat-dropdown {
            width: 100vw;
            left: 0;
            right: 0;
            border-radius: 0;
            max-height: 60vh;
            box-shadow: var(--shadow-lg);
          }
        }
      `}</style>
    </>
  );
};

export default Header;
