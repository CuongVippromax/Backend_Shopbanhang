import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';
import { useCart } from '../context/CartContext';
import { getCategories } from '../api';

export default function MainHeader({ activePage = '' }) {
  const { cartCount } = useCart();
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    getCategories().then(data => {
      if (data && data.content) {
        setCategories(data.content);
      } else if (Array.isArray(data)) {
        setCategories(data);
      }
    }).catch(err => console.error('Error fetching categories:', err));
  }, []);

  return (
    <header className="main-header" style={{padding: '30px 0', boxShadow: 'none'}}>
      <div className="container header-inner">
        <div className="logo-area">
          <Link to="/" style={{display: 'flex', alignItems: 'center', textDecoration: 'none'}}>
            <img src="/image/logo-hoang-kim.jpg" alt="Logo Hoàng Kim" style={{height: '100px', objectFit: 'contain'}} />
          </Link>
        </div>
        <div className="search-area" style={{flex: '0 0 500px', maxWidth: '500px'}}>
          <input type="text" placeholder="Bạn muốn mua gì?" style={{padding: '15px 20px', fontSize: '16px'}} />
          <button className="search-btn" style={{padding: '15px 25px', fontSize: '18px'}}>🔍</button>
        </div>
        <div className="cart-area" style={{gap: '20px'}}>
          <Link to="/gio-hang" style={{display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', color: 'inherit', marginRight: '15px', paddingRight: '15px', borderRight: '1px solid #ddd'}}>
            <div className="cart-text" style={{fontSize: '15px'}}>Giỏ hàng / <span className="cart-price">0 ₫</span></div>
            <div className="cart-icon">
              <span className="cart-count" style={{fontSize: '14px'}}>{cartCount}</span>
              🛒
            </div>
          </Link>
          <UserMenu />
        </div>
      </div>

      {/* Navigation with Categories */}
      <nav className="main-nav" style={{marginTop: '25px', marginBottom: '0', background: '#fff', padding: '0', borderBottom: 'none'}}>
        <div className="container nav-inner">
          <div 
            className="categories-menu"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <div className="cat-title" style={{padding: '12px 20px', fontSize: '15px'}}>
              ☰ Danh mục sản phẩm
            </div>
            {showDropdown && (
              <div className="categories-dropdown">
                {categories.map((cat) => (
                  <Link 
                    key={cat.categoryId} 
                    to={`/cua-hang?categoryId=${cat.categoryId}`}
                    className="dropdown-item"
                  >
                    {cat.categoryName}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <ul className="nav-links" style={{fontSize: '15px'}}>
            <li className={activePage === 'home' ? 'active' : ''}>
              <Link to="/" style={{color: 'inherit', textDecoration: 'none', padding: '12px 18px'}}>Trang chủ</Link>
            </li>
            <li className={activePage === 'shop' ? 'active' : ''}>
              <Link to="/cua-hang" style={{color: 'inherit', textDecoration: 'none', padding: '12px 18px'}}>Cửa hàng</Link>
            </li>
            <li className={activePage === 'news' ? 'active' : ''}>
              <Link to="/tin-tuc" style={{color: 'inherit', textDecoration: 'none', padding: '12px 18px'}}>Tin tức</Link>
            </li>
            <li className={activePage === 'about' ? 'active' : ''}>
              <Link to="/gioi-thieu" style={{color: 'inherit', textDecoration: 'none', padding: '12px 18px'}}>Giới thiệu</Link>
            </li>
            <li className={activePage === 'contact' ? 'active' : ''}>
              <Link to="/lien-he" style={{color: 'inherit', textDecoration: 'none', padding: '12px 18px'}}>Liên hệ</Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
