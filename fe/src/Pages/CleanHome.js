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

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setCategoryLoading(true);
    try {
      const response = await getBooksByCategory(category.categoryId || category.id, { pageSize: 20 });
      setCategoryBooks(response?.data || []);
    } catch (error) {
      console.error('Error loading category books:', error);
      setCategoryBooks([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleCloseCategoryBooks = () => {
    setSelectedCategory(null);
    setCategoryBooks([]);
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
              <div className="icon-circle">
                <img src={cat.image || ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageimgfluidmautoobjectcontainmh100} alt={cat.categoryName} />
              </div>
              <span>{cat.categoryName}</span>
            </div>
          ))
        )}
      </section>

      {/* Category Books Section */}
      {selectedCategory && (
        <section className="category-books-section container">
          <div className="category-books-header">
            <h2>{selectedCategory.categoryName}</h2>
            <button className="close-btn" onClick={handleCloseCategoryBooks}>×</button>
          </div>
          {categoryLoading ? (
            <p>Đang tải sách...</p>
          ) : categoryBooks.length > 0 ? (
            <div className="book-grid">
              {categoryBooks.map((book) => (
                <BookCard key={book.bookId} book={book} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
            <p>Không có sách trong danh mục này</p>
          )}
        </section>
      )}

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
                <li 
                  key={cat.categoryId || cat.id}
                  onClick={() => window.location.href = `/cua-hang?categoryId=${cat.categoryId || cat.id}`}
                  style={{cursor: 'pointer'}}
                >
                  {cat.categoryName}
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Hình Thức Hỗ Trợ</h4>
            <div className="payment-icons">
               💳 🏦 💵
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
