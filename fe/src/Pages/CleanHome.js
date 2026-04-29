import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './CleanHome.css';
import ImgAsset from '../public';
import UserMenu from '../Components/UserMenu';
import CategoryDropdown from '../Components/CategoryDropdown';
import BannerSlider from '../Components/BannerSlider';
import Header from '../Components/Header';
import { useCart } from '../context/CartContext';
import { getBooks, getBooksByCategory, getCategories, getFeaturedArticles } from '../api';

// Component hiển thị icon danh mục
const CategoryIcon = ({ categoryName }) => {
  if (!categoryName) return null;
  const lowerName = categoryName.toLowerCase();

  // Tiểu thuyết - Cuốn sách 3D với bìa cứng
  if (lowerName.includes('tiểu thuyết') || lowerName.includes('tieu thuyet')) {
    return (
      <svg viewBox="0 0 70 70" style={{width: '100%', height: '100%'}}>
        <circle cx="35" cy="35" r="34" fill="url(#gradTT)" />
        <defs><linearGradient id="gradTT" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#e65100" /></linearGradient></defs>
        <rect x="22" y="16" width="26" height="38" rx="2" fill="white" />
        <rect x="22" y="16" width="4" height="38" fill="#e65100" />
        <rect x="28" y="22" width="16" height="4" rx="1" fill="#FF6B35" opacity="0.6" />
        <rect x="28" y="29" width="12" height="2" fill="#ccc" />
        <rect x="28" y="34" width="14" height="2" fill="#ccc" />
        <rect x="28" y="39" width="10" height="2" fill="#ccc" />
        <rect x="28" y="44" width="12" height="2" fill="#ccc" />
      </svg>
    );
  }

  // Khoa học - Nguyên tử
  if (lowerName.includes('khoa học') || lowerName.includes('khoa hoc')) {
    return (
      <svg viewBox="0 0 70 70" style={{width: '100%', height: '100%'}}>
        <circle cx="35" cy="35" r="34" fill="url(#gradKH)" />
        <defs><linearGradient id="gradKH" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#e65100" /></linearGradient></defs>
        <ellipse cx="35" cy="35" rx="20" ry="7" fill="none" stroke="white" strokeWidth="2" transform="rotate(-30, 35, 35)" />
        <ellipse cx="35" cy="35" rx="20" ry="7" fill="none" stroke="white" strokeWidth="2" transform="rotate(30, 35, 35)" />
        <ellipse cx="35" cy="35" rx="20" ry="7" fill="none" stroke="white" strokeWidth="2" transform="rotate(90, 35, 35)" />
        <circle cx="35" cy="35" r="6" fill="white" />
        <circle cx="35" cy="35" r="3" fill="#e65100" />
      </svg>
    );
  }

  // Kinh tế - Biểu đồ tăng trưởng
  if (lowerName.includes('kinh tế') || lowerName.includes('kinh te')) {
    return (
      <svg viewBox="0 0 70 70" style={{width: '100%', height: '100%'}}>
        <circle cx="35" cy="35" r="34" fill="url(#gradKT)" />
        <defs><linearGradient id="gradKT" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#e65100" /></linearGradient></defs>
        <rect x="16" y="42" width="8" height="12" rx="1" fill="white" />
        <rect x="28" y="34" width="8" height="20" rx="1" fill="white" />
        <rect x="40" y="26" width="8" height="28" rx="1" fill="white" />
        <path d="M20 40 L32 32 L44 22" fill="none" stroke="#e65100" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M44 22 L48 22 L44 18" fill="none" stroke="#e65100" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Tâm lý - Kỹ năng sống - Hai người kết nối
  if (lowerName.includes('tâm lý') || lowerName.includes('tam ly') || lowerName.includes('kỹ năng') || lowerName.includes('ky nang')) {
    return (
      <svg viewBox="0 0 70 70" style={{width: '100%', height: '100%'}}>
        <circle cx="35" cy="35" r="34" fill="url(#gradTL)" />
        <defs><linearGradient id="gradTL" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#e65100" /></linearGradient></defs>
        <circle cx="24" cy="28" r="8" fill="white" />
        <ellipse cx="24" cy="46" rx="10" ry="12" fill="white" />
        <circle cx="46" cy="28" r="8" fill="white" />
        <ellipse cx="46" cy="46" rx="10" ry="12" fill="white" />
        <path d="M35 32 C35 28 32 26 30 28 C28 30 28 33 35 38 C42 33 42 30 40 28 C38 26 35 28 35 32" fill="#e65100" />
      </svg>
    );
  }

  // Thiếu nhi - Gấu con dễ thương
  if (lowerName.includes('thiếu nhi') || lowerName.includes('thieu nhi')) {
    return (
      <svg viewBox="0 0 70 70" style={{width: '100%', height: '100%'}}>
        <circle cx="35" cy="35" r="34" fill="url(#gradSN)" />
        <defs><linearGradient id="gradSN" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#e65100" /></linearGradient></defs>
        <circle cx="35" cy="40" r="16" fill="white" />
        <circle cx="35" cy="26" r="12" fill="white" />
        <circle cx="25" cy="18" r="5" fill="white" />
        <circle cx="45" cy="18" r="5" fill="white" />
        <circle cx="30" cy="25" r="2.5" fill="#333" />
        <circle cx="40" cy="25" r="2.5" fill="#333" />
        <ellipse cx="35" cy="30" rx="3" ry="2" fill="#333" />
        <path d="M31 33 Q35 37 39 33" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M32 20 L35 24 L38 20 L35 16 Z" fill="#e65100" />
      </svg>
    );
  }

  // Lịch sử - Cuốn sách cổ với phong bì
  if (lowerName.includes('lịch sử') || lowerName.includes('lich su')) {
    return (
      <svg viewBox="0 0 70 70" style={{width: '100%', height: '100%'}}>
        <circle cx="35" cy="35" r="34" fill="url(#gradLS)" />
        <defs><linearGradient id="gradLS" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#e65100" /></linearGradient></defs>
        <rect x="18" y="20" width="34" height="32" rx="2" fill="white" />
        <rect x="18" y="20" width="5" height="32" fill="#e8d5b7" />
        <line x1="26" y1="28" x2="46" y2="28" stroke="#FF6B00" strokeWidth="1.5" />
        <line x1="26" y1="34" x2="44" y2="34" stroke="#FF6B00" strokeWidth="1.5" />
        <line x1="26" y1="40" x2="42" y2="40" stroke="#FF6B00" strokeWidth="1.5" />
        <rect x="38" y="42" width="14" height="10" fill="none" stroke="#e65100" strokeWidth="1.5" rx="1" />
        <line x1="38" y1="42" x2="45" y2="49" stroke="#e65100" strokeWidth="1.5" />
      </svg>
    );
  }

  // Công nghệ thông tin - Laptop với code
  if (lowerName.includes('công nghệ') || lowerName.includes('cntt')) {
    return (
      <svg viewBox="0 0 70 70" style={{width: '100%', height: '100%'}}>
        <circle cx="35" cy="35" r="34" fill="url(#gradCN)" />
        <defs><linearGradient id="gradCN" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#e65100" /></linearGradient></defs>
        <rect x="12" y="18" width="46" height="30" rx="3" fill="white" />
        <rect x="15" y="21" width="40" height="24" rx="1" fill="#1a1a2e" />
        <rect x="18" y="26" width="12" height="2" fill="#4ade80" />
        <rect x="18" y="31" width="20" height="2" fill="#60a5fa" />
        <rect x="18" y="36" width="8" height="2" fill="#f472b6" />
        <rect x="28" y="36" width="16" height="2" fill="#fbbf24" />
        <rect x="20" y="48" width="30" height="4" rx="1" fill="white" />
        <rect x="16" y="52" width="38" height="3" rx="1" fill="white" />
      </svg>
    );
  }

  // Văn học nước ngoài - Sách mở với quả địa cầu
  if (lowerName.includes('văn học') || lowerName.includes('van hoc')) {
    return (
      <svg viewBox="0 0 70 70" style={{width: '100%', height: '100%'}}>
        <circle cx="35" cy="35" r="34" fill="url(#gradVH)" />
        <defs><linearGradient id="gradVH" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#e65100" /></linearGradient></defs>
        <path d="M12 20 Q20 16 35 20 Q50 16 58 20 L58 52 Q50 48 35 52 Q20 48 12 52 Z" fill="white" />
        <line x1="35" y1="20" x2="35" y2="52" stroke="#e0e0e0" strokeWidth="1" />
        <line x1="16" y1="28" x2="32" y2="28" stroke="#FF6B00" strokeWidth="1.5" opacity="0.5" />
        <line x1="16" y1="34" x2="30" y2="34" stroke="#ccc" strokeWidth="1" />
        <line x1="16" y1="38" x2="28" y2="38" stroke="#ccc" strokeWidth="1" />
        <line x1="38" y1="28" x2="54" y2="28" stroke="#FF6B00" strokeWidth="1.5" opacity="0.5" />
        <line x1="40" y1="34" x2="54" y2="34" stroke="#ccc" strokeWidth="1" />
        <line x1="42" y1="38" x2="54" y2="38" stroke="#ccc" strokeWidth="1" />
        <circle cx="46" cy="22" r="6" fill="none" stroke="#e65100" strokeWidth="1.5" />
        <ellipse cx="46" cy="22" rx="6" ry="2" fill="none" stroke="#e65100" strokeWidth="1" />
        <line x1="46" y1="16" x2="46" y2="28" stroke="#e65100" strokeWidth="1" />
      </svg>
    );
  }

  // Mặc định - Sách cơ bản
  return (
    <svg viewBox="0 0 70 70" style={{width: '100%', height: '100%'}}>
      <circle cx="35" cy="35" r="34" fill="url(#gradDefault)" />
      <defs><linearGradient id="gradDefault" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#e65100" /></linearGradient></defs>
      <rect x="22" y="20" width="26" height="32" rx="3" fill="white" />
      <rect x="26" y="26" width="18" height="3" fill="#e65100" opacity="0.5" />
      <rect x="26" y="32" width="14" height="2" fill="#ccc" />
      <rect x="26" y="37" width="16" height="2" fill="#ccc" />
    </svg>
  );
};

// Toast Notification Component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 24px',
      borderRadius: '8px',
      background: type === 'success' ? '#22c55e' : '#ef4444',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-out'
    }}>
      {message}
    </div>
  );
};

// Component sách - Phong cách Ebook Store
const BookCard = ({ book, isFlashSale, onAddToCart }) => {
  const imgSrc = book.image || book.thumbnailUrl || ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentwoocommerce_thumbnailsizewoocommerce_thumbnail;

  const formatPrice = (price) => {
    if (!price) return '';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const originalPrice = book.originalPrice || (isFlashSale && book.price ? Math.round(book.price / 0.7) : null);
  const discountPercent = book.discountPercent || (originalPrice && book.price ? Math.round((1 - book.price / originalPrice) * 100) : null);
  const isOnSale = discountPercent && discountPercent > 0;
  const isOutOfStock = !book.quantity || book.quantity <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(book);
    }
  };

  return (
    <div className="ebook-card">
      <div className="ebook-image-wrapper">
        <a href={`/san-pham/${book.bookId}`}>
          <img src={imgSrc} alt={book.bookName} className="ebook-image" />
        </a>
        {/* Badge giảm giá tròn cam */}
        {isOnSale && (
          <div className="ebook-badge-sale">
            -{discountPercent}%
          </div>
        )}
        {isOutOfStock && (
          <div className="ebook-badge-outofstock">
            Hết hàng
          </div>
        )}
        {isFlashSale && !isOnSale && (
          <div className="ebook-badge-flash">
            Flash Sale
          </div>
        )}
      </div>

      <div className="ebook-content">
        <p className="ebook-category">{book.categoryName || book.category || 'SÁCH'}</p>
        <h3 className="ebook-title">
          <a href={`/san-pham/${book.bookId}`}>{book.bookName}</a>
        </h3>
        <p className="ebook-author">
          <span className="author-label">Tác giả:</span> {book.author || 'Nhiều tác giả'}
        </p>
        
        <div className="ebook-pricing">
          {isOnSale && (
            <span className="ebook-old-price">{formatPrice(originalPrice)}đ</span>
          )}
          <span className="ebook-current-price">{formatPrice(book.price)}đ</span>
        </div>

        <button className="ebook-buy-btn" onClick={handleAddToCart}>
          Mua ngay
        </button>
      </div>
    </div>
  );
};

const BookSection = ({ title, books, viewAllLink, onAddToCart }) => {
  const handleViewAll = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.href = viewAllLink || '/cua-hang';
  };

  return (
    <div className="book-section-wrapper">
      <section className="book-section container">
        <div className="section-header">
          <h2>{title}</h2>
          <a href={viewAllLink || '/cua-hang'} onClick={handleViewAll} className="view-more">Xem tất cả →</a>
        </div>
        <div className="book-grid">
          {books.map((book) => (
            <BookCard key={book.bookId} book={book} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default function CleanHome() {
  const { cartCount } = useCart();
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState(null);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [flashSaleBooks, setFlashSaleBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBooks, setCategoryBooks] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const categoryRef = useRef(null);

  // Handle add to cart - chuyển sang trang giỏ hàng
  const handleAddToCart = (book) => {
    window.location.href = '/gio-hang';
  };

  // Flash Sale countdown timer - đếm ngược đến 10h sáng mỗi ngày
  useEffect(() => {
    const calculateEndTime = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return endOfDay.getTime();
    };

    const updateCountdown = () => {
      const endTime = calculateEndTime();
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance < 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Newsletter subscription handler
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const emailInput = e.target.querySelector('input');
    const emailValue = emailInput?.value?.trim();
    
    if (emailValue) {
      setEmail(emailValue);
      setToast({ message: 'Đăng ký nhận thông tin thành công!', type: 'success' });
      emailInput.value = '';
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [featuredRes, categoriesRes] = await Promise.all([
        getBooks({ pageSize: 30 }),
        getCategories(),
      ]);

      // Fetch featured articles separately
      let featuredArticles = [];
      try {
        const articlesRes = await getFeaturedArticles();
        // Response interceptor returns data directly, so articlesRes is already the array
        featuredArticles = Array.isArray(articlesRes) ? articlesRes : [];
      } catch (e) {
        console.warn('Could not load featured articles', e);
      }

      let allBooks = Array.isArray(featuredRes?.data) ? featuredRes.data
             : Array.isArray(featuredRes) ? featuredRes : [];

      // Flash sale: lấy 5 sách đầu tiên (dùng getBooks thay vì endpoint riêng)
      const flashSaleData = allBooks.slice(0, 5);

      // Tách featured books và new books (đảm bảo không trùng nhau)
      const flashSaleIds = new Set(flashSaleData.map(b => b.bookId));

      // Sách mới = 5 sách đầu tiên không nằm trong flash sale
      const newBooksFiltered = allBooks.filter(b => !flashSaleIds.has(b.bookId)).slice(0, 5);

      // Sách nổi bật = 5 sách tiếp theo không trùng với sách mới và flash sale
      const usedIds = new Set([...flashSaleIds, ...newBooksFiltered.map(b => b.bookId)]);
      const featuredBooksFiltered = allBooks.filter(b => !usedIds.has(b.bookId)).slice(0, 5);

      setFeaturedBooks(featuredBooksFiltered);
      setNewBooks(newBooksFiltered);
      setFlashSaleBooks(flashSaleData);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);

      // Lấy bài viết nổi bật
      setArticles(featuredArticles.slice(0, 6));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '';
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const handleCategoryClick = (category) => {
    // Chuyển hướng sang trang cửa hàng với categoryId
    const categoryId = category.categoryId || category.id;
    window.location.href = `/cua-hang?categoryId=${categoryId}`;
  };

  return (
    <div className="clean-home">
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
      <nav className="main-nav">
        <div className="container nav-inner">
          <div 
            className="categories-menu"
            ref={categoryRef}
            onMouseEnter={() => setShowCategoryDropdown(true)}
            onMouseLeave={() => setShowCategoryDropdown(false)}
          >
            <div className="cat-title">
              ☰ Danh mục sản phẩm
            </div>
            {showCategoryDropdown && (
              <CategoryDropdown 
                categories={categories} 
                onClose={() => setShowCategoryDropdown(false)} 
              />
            )}
          </div>
          <ul className="nav-links">
            <li className="active"><Link to="/" style={{color: 'inherit', textDecoration: 'none'}}>Trang chủ</Link></li>
            <li><Link to="/cua-hang" style={{color: 'inherit', textDecoration: 'none'}}>Cửa hàng</Link></li>
            <li><Link to="/tin-tuc" style={{color: 'inherit', textDecoration: 'none'}}>Tin tức</Link></li>
            <li><Link to="/gioi-thieu" style={{color: 'inherit', textDecoration: 'none'}}>Giới thiệu</Link></li>
            <li><Link to="/lien-he" style={{color: 'inherit', textDecoration: 'none'}}>Liên hệ</Link></li>
          </ul>
        </div>
      </nav>

      {/* Hero Banners */}
      <section className="hero-section container">
        <div className="hero-grid">
          <div className="hero-main">
            <BannerSlider images={[
              { src: ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentlargesizelarge_1, alt: 'Banner 1' },
              { src: ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentlargesizelarge_2, alt: 'Banner 2' },
              { src: ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentlargesizelarge_3, alt: 'Banner 3' },
              { src: ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentlargesizelarge_4, alt: 'Banner 4' },
              { src: ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentlargesizelarge_5, alt: 'Banner 5' },
              { src: ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentlargesizelarge_6, alt: 'Banner 6' },
              { src: '/image/1.jpg', alt: 'Banner 7' },
            ]} />
          </div>
          <div className="hero-side">
            <img src={ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentlargesizelarge_4} alt="Side Banner" className="side-banner-img" />
            <img src={ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentlargesizelarge_6} alt="Side Banner" className="side-banner-img" />
          </div>
        </div>
      </section>

      {/* Circle Icons - Danh mục */}
      <section className="circle-icons container">
        {loading ? (
          <p>Đang tải danh mục...</p>
        ) : (
          categories.slice(0, 8).map((cat, idx) => (
            <div 
              className="icon-item" 
              key={cat.categoryId || cat.id || idx}
              onClick={() => handleCategoryClick(cat)}
              style={{ cursor: 'pointer' }}
            >
              <div className="icon-circle" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CategoryIcon categoryName={cat.categoryName} />
              </div>
              <span>{cat.categoryName}</span>
            </div>
          ))
        )}
      </section>

      {/* Flash Sale Section */}
      <section className="flash-sale-section container">
        <div className="flash-sale-header">
          <h2>FlashSale ⚡</h2>
          <div className="countdown">
            <div className="time-block">
              <span>{String(countdown.hours).padStart(2, '0')}</span> Giờ
            </div>
            <div className="time-block">
              <span>{String(countdown.minutes).padStart(2, '0')}</span> Phút
            </div>
            <div className="time-block">
              <span>{String(countdown.seconds).padStart(2, '0')}</span> Giây
            </div>
          </div>
        </div>
        <div className="flash-sale-grid">
          {loading ? (
            <p>Đang tải...</p>
          ) : flashSaleBooks.length > 0 ? (
            flashSaleBooks.slice(0, 5).map((book) => (
              <BookCard key={book.bookId} book={book} isFlashSale={true} onAddToCart={handleAddToCart} />
            ))
          ) : (
            <p>Không có sản phẩm giảm giá</p>
          )}
        </div>
        <div className="flash-sale-footer">
          <Link to="/cua-hang?flashSale=true" className="view-all-btn">
            Xem tất cả
          </Link>
        </div>
      </section>

      {/* Sách nổi bật */}
      {!loading && featuredBooks.length > 0 && (
        <BookSection title="Sách Nổi Bật" books={featuredBooks.slice(0, 5)} viewAllLink="/cua-hang" onAddToCart={handleAddToCart} />
      )}

      {/* Sách mới */}
      {!loading && newBooks.length > 0 && (
        <BookSection title="Sách Mới" books={newBooks.slice(0, 5)} viewAllLink="/cua-hang" onAddToCart={handleAddToCart} />
      )}

      {/* Tin Tức Nổi Bật */}
      <div className="news-section-wrapper">
        <section className="home-news-section container">
          <div className="section-header">
            <h2>Tin Tức Nổi Bật</h2>
            <Link to="/tin-tuc" className="view-more">Xem tất cả →</Link>
          </div>
          <div className="home-news-grid">
          {loading ? (
            <p>Đang tải tin tức...</p>
          ) : articles.length > 0 ? (
            articles.slice(0, 3).map((article) => (
              <Link to={`/bai-viet/${article.slug || article.articleId}`} key={article.articleId} className="home-news-card">
                <div className="home-news-img">
                  <img 
                    src={article.image || article.thumbnail || '/image/default-article.jpg'} 
                    alt={article.title}
                    onError={(e) => { e.target.src = '/image/default-article.jpg'; }}
                  />
                </div>
                <div className="home-news-content">
                  <span className="home-news-date">
                    {article.createdAt ? new Date(article.createdAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                  <h3 className="home-news-title">{article.title}</h3>
                  <p className="home-news-excerpt">
                    {article.excerpt || article.summary || (article.content?.substring(0, 80) + '...')}
                  </p>
                  <span className="home-news-readmore">Đọc tiếp →</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="no-news">Chưa có tin tức nào</p>
          )}
        </div>
      </section>
      </div>

      {/* Subscription */}
      <div className="newsletter-bar">
        <div className="container newsletter-inner">
          <form onSubmit={handleNewsletterSubmit} style={{display: 'contents'}}>
            <input type="email" placeholder="Nhập địa chỉ email..." required />
            <button type="submit">ĐĂNG KÝ NGAY</button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container footer-grid">
          <div className="footer-col">
            <h3 className="footer-logo">Nhà Sách Hoàng Kim</h3>
            <p>📍 Địa chỉ: 2b/23/154, đường Ngọc Hồi, phường Hoàng Liệt, quận Hoàng Mai, Hà Nội.</p>
            <p>☎️ Hotline: 098.246.8686</p>
          </div>
          <div className="footer-col">
            <h4>Hỗ Trợ</h4>
            <ul>
              <li><Link to="/chinh-sach-doi-tra" style={{color: 'inherit', textDecoration: 'none'}}>Chính sách đổi trả sản phẩm</Link></li>
              <li><Link to="/quy-dinh-bao-hanh" style={{color: 'inherit', textDecoration: 'none'}}>Quy định bảo hành</Link></li>
              <li><Link to="/giao-nhan-va-thanh-toan" style={{color: 'inherit', textDecoration: 'none'}}>Giao nhận và thanh toán</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Danh Mục</h4>
            <ul>
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.categoryId || cat.id}>
                  <Link to={`/cua-hang?categoryId=${cat.categoryId || cat.id}`} style={{color: 'inherit', textDecoration: 'none'}}>
                    {cat.categoryName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Hình Thức Hỗ Trợ</h4>
            <div className="payment-icons">
               💵 <img src="/image/vnpay.png" alt="VNPay" style={{width: '40px', height: 'auto'}} /> 🏦
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
