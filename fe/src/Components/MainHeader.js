import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu';
import { useCart } from '../context/CartContext';
import { getCategories } from '../api';

export default function MainHeader({ activePage = '', searchTerm = '', onSearchChange = () => {} }) {
  const navigate = useNavigate();
  const { cartCount, cartTotal } = useCart();
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    getCategories().then(data => {
      if (data && data.content) {
        setCategories(data.content);
      } else if (Array.isArray(data)) {
        setCategories(data);
      }
    }).catch(err => console.error('Error fetching categories:', err));
  }, []);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setLocalSearchTerm(e.target.value);
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && localSearchTerm.trim()) {
      navigate(`/cua-hang?search=${encodeURIComponent(localSearchTerm.trim())}`);
    }
  };

  const handleSearchClick = () => {
    if (localSearchTerm.trim()) {
      navigate(`/cua-hang?search=${encodeURIComponent(localSearchTerm.trim())}`);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  return (
    <header className="main-header" style={{padding: '15px 0', boxShadow: 'none'}}>
      <div className="container header-inner">
        <div className="logo-area">
          <Link to="/" style={{display: 'flex', alignItems: 'center', textDecoration: 'none'}}>
            <img src="/image/logo-hoang-kim.jpg" alt="Logo Hoàng Kim" style={{height: '60px', objectFit: 'contain'}} />
          </Link>
        </div>
        <div className="search-area" style={{flex: '0 0 400px', maxWidth: '400px'}}>
          <input 
            type="text" 
            placeholder="Bạn muốn mua gì?" 
            style={{padding: '10px 15px', fontSize: '14px'}}
            value={localSearchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
          />
          <button 
            className="search-btn" 
            style={{padding: '10px 18px', fontSize: '16px'}}
            onClick={handleSearchClick}
          >🔍</button>
        </div>
        <div className="cart-area" style={{gap: '15px'}}>
          <Link to="/gio-hang" style={{display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit', marginRight: '10px', paddingRight: '10px', borderRight: '1px solid #ddd'}}>
            <div className="cart-text" style={{fontSize: '14px'}}>Giỏ hàng / <span className="cart-price">{formatPrice(cartTotal)}</span></div>
            <div className="cart-icon">
              <span className="cart-count" style={{fontSize: '13px'}}>{cartCount}</span>
              🛒
            </div>
          </Link>
          <UserMenu />
        </div>
      </div>

      {/* Navigation with Categories */}
      <nav className="main-nav" style={{marginTop: '15px', marginBottom: '0', background: '#fff', padding: '0', borderBottom: 'none'}}>
        <div className="container nav-inner">
          <div 
            className="categories-menu"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <div className="cat-title" style={{padding: '10px 18px', fontSize: '14px'}}>
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
          <ul className="nav-links" style={{fontSize: '14px'}}>
            <li className={activePage === 'home' ? 'active' : ''}>
              <Link to="/" style={{color: 'inherit', textDecoration: 'none', padding: '10px 15px'}}>Trang chủ</Link>
            </li>
            <li className={activePage === 'shop' ? 'active' : ''}>
              <Link to="/cua-hang" style={{color: 'inherit', textDecoration: 'none', padding: '10px 15px'}}>Cửa hàng</Link>
            </li>
            <li className={activePage === 'news' ? 'active' : ''}>
              <Link to="/tin-tuc" style={{color: 'inherit', textDecoration: 'none', padding: '10px 15px'}}>Tin tức</Link>
            </li>
            <li className={activePage === 'about' ? 'active' : ''}>
              <Link to="/gioi-thieu" style={{color: 'inherit', textDecoration: 'none', padding: '10px 15px'}}>Giới thiệu</Link>
            </li>
            <li className={activePage === 'contact' ? 'active' : ''}>
              <Link to="/lien-he" style={{color: 'inherit', textDecoration: 'none', padding: '10px 15px'}}>Liên hệ</Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
