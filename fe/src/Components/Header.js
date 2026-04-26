import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';
import CategoryDropdown from './CategoryDropdown';
import { useCart } from '../context/CartContext';
import { getCategories } from '../api';

const Header = ({ showCategories = false, activeTab = 'home', showCategoryDropdown = false }) => {
  const { cartCount } = useCart();
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(showCategoryDropdown);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  return (
    <>
      {/* Main Header */}
      <header className="main-header">
        <div className="container header-inner">
          <div className="logo-area">
            <Link to="/" style={{display: 'flex', alignItems: 'center', textDecoration: 'none'}}>
              <img src="/image/logo-hoang-kim.jpg" alt="Logo Hoàng Kim" className="logo-img" style={{height: '70px', objectFit: 'contain'}} />
            </Link>
          </div>
          
          <div className="search-area">
            <input type="text" placeholder="Bạn muốn mua gì?" />
            <button className="search-btn">🔍</button>
          </div>

          <div className="cart-area">
            <Link to="/gio-hang" style={{display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', marginRight: '15px', paddingRight: '15px', borderRight: '1px solid #ddd'}}>
              <div className="cart-text">Giỏ hàng / <span className="cart-price">0 ₫</span></div>
              <div className="cart-icon">
                <span className="cart-count">{cartCount}</span>
                🛒
              </div>
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Navigation */}
      {showCategories && (
        <nav className="main-nav">
          <div className="container nav-inner">
            <div 
              className="categories-menu"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <div className="cat-title">
                ☰ Danh mục sản phẩm
              </div>
              {showDropdown && (
                <CategoryDropdown 
                  categories={categories} 
                  onClose={() => setShowDropdown(false)} 
                />
              )}
            </div>
            <ul className="nav-links">
              <li className={activeTab === 'home' ? 'active' : ''}>
                <Link to="/" style={{color: 'inherit', textDecoration: 'none'}}>Trang chủ</Link>
              </li>
              <li className={activeTab === 'shop' ? 'active' : ''}>
                <Link to="/cua-hang" style={{color: 'inherit', textDecoration: 'none'}}>Cửa hàng</Link>
              </li>
              <li className={activeTab === 'news' ? 'active' : ''}>
                <Link to="/tin-tuc" style={{color: 'inherit', textDecoration: 'none'}}>Tin tức</Link>
              </li>
              <li className={activeTab === 'about' ? 'active' : ''}>
                <Link to="/gioi-thieu" style={{color: 'inherit', textDecoration: 'none'}}>Giới thiệu</Link>
              </li>
              <li className={activeTab === 'contact' ? 'active' : ''}>
                <Link to="/lien-he" style={{color: 'inherit', textDecoration: 'none'}}>Liên hệ</Link>
              </li>
            </ul>
          </div>
        </nav>
      )}
    </>
  );
};

export default Header;
