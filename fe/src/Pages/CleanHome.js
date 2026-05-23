import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CleanHome.css';
import UserMenu from '../Components/UserMenu';
import BannerSlider from '../Components/BannerSlider';
import MainHeader from '../Components/MainHeader';
import { getBooks, getCategories, getFeaturedArticles } from '../api';
import { useCart } from '../context/CartContext';
import { addToCart } from '../api';
import { useToast } from '../Components/Toast';

// Flash Sale Timer Component
const FlashSaleTimer = ({ hoursLeft = 8 }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date();
      end.setHours(end.getHours() + hoursLeft);
      end.setMinutes(59);
      end.setSeconds(59);
      
      const now = new Date();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [hoursLeft]);

  return (
    <div className="ux-timer dark">
      <span>{String(timeLeft.hours).padStart(2, '0')}<strong>Giờ</strong></span>
      <span>{String(timeLeft.minutes).padStart(2, '0')}<strong>Phút</strong></span>
      <span>{String(timeLeft.seconds).padStart(2, '0')}<strong>Giây</strong></span>
    </div>
  );
};

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

// Component Thẻ sách (BookCard) tái sử dụng
const BookCard = ({ book, onAddToCart }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(book);
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.userId) {
      window.location.href = '/dang-nhap';
      return;
    }
    try {
      await addToCart({ bookId: book.bookId, quantity: 1 });
      window.dispatchEvent(new Event('cartUpdated'));
      window.location.href = '/thanh-toan';
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div className="book-card">
      <Link to={`/san-pham/${book.bookId}`} style={{textDecoration: 'none', color: 'inherit', display: 'block'}}>
        {book.discount && <div className="discount-badge">-{book.discount}%</div>}
        <div className="book-img">
          <img src={book.image || 'https://via.placeholder.com/150'} alt={book.bookName} />
        </div>
        <div className="book-info">
          <h3 className="book-title">{book.bookName}</h3>
          <p className="book-category">{book.category?.categoryName || 'Sách'}</p>
          <div className="price-row">
            <span className="current-price">{formatPrice(book.price)}</span>
            {book.originalPrice && <span className="old-price">{formatPrice(book.originalPrice)}</span>}
          </div>
        </div>
      </Link>
      <div className="card-actions">
        <button className="btn-quick-add" onClick={handleAddToCart}>Thêm vào giỏ</button>
        <button className="btn-quick-buy" onClick={handleBuyNow}>Mua ngay</button>
      </div>
    </div>
  );
};

// Component Dãy sách (BookGrid) tái sử dụng
const BookSection = ({ title, books, loading, onAddToCart }) => {
  if (loading) {
    return (
      <section className="book-section container">
        <div className="section-header">
          <h2>{title}</h2>
        </div>
        <div className="book-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="book-card loading">
              <div className="skeleton-img"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!books || books.length === 0) {
    return null;
  }

  return (
    <section className="book-section container">
      <div className="section-header">
        <h2>{title}</h2>
        <Link to="/cua-hang" className="view-more">Xem tất cả →</Link>
      </div>
      <div className="book-grid">
        {books.slice(0, 5).map((book) => (
          <BookCard 
            key={book.bookId}
            book={book}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
};

export default function CleanHome() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booksByCategory, setBooksByCategory] = useState({});
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const { refresh, cartCount } = useCart();
  const { success, error: showError } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load categories first
      const cats = await getCategories();
      const catsData = cats?.data || cats || [];
      setCategories(catsData);

      // Load all books
      const booksResponse = await getBooks({ pageSize: 100 });
      const allBooks = booksResponse?.data?.data || booksResponse?.data || [];
      setBooks(allBooks);

      // Load books by each category
      const booksByCat = {};
      for (const cat of catsData.slice(0, 7)) {
        try {
          const catBooks = await getBooks({ categoryId: cat.categoryId, pageSize: 6 });
          const catBooksData = catBooks?.data?.data || catBooks?.data || catBooks || [];
          booksByCat[cat.categoryId] = catBooksData;
        } catch (err) {
          console.error('Error loading books for category', cat.categoryId, err);
        }
      }
      setBooksByCategory(booksByCat);

      // Load featured articles
      try {
        const articlesResponse = await getFeaturedArticles();
        const articlesData = articlesResponse?.data?.data || articlesResponse?.data || articlesResponse || [];
        setArticles(articlesData);
      } catch (err) {
        console.error('Error loading articles:', err);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setArticlesLoading(false);
    }
  };

  const handleAddToCart = async (book) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.userId) {
      window.location.href = '/dang-nhap';
      return;
    }
    try {
      await addToCart({ bookId: book.bookId, quantity: 1 });
      await refresh();
      window.dispatchEvent(new Event('cartUpdated'));
      success('Đã thêm vào giỏ hàng!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      showError('Thêm vào giỏ hàng thất bại!');
    }
  };

  const flashSaleBooks = books.slice(0, 10);
  return (
    <div className="clean-home">
      <MainHeader activePage="home" />

      {/* Hero Banners */}
      <section className="hero-section container">
        <div className="hero-grid">
          <div className="hero-main">
            <BannerSlider images={[
              { src: '/image/1.png', alt: 'Banner 1', link: '/cua-hang' },
              { src: '/image/2.png', alt: 'Banner 2', link: '/cua-hang' },
              { src: '/image/3.png', alt: 'Banner 3', link: '/cua-hang' },
              { src: '/image/4.png', alt: 'Banner 4', link: '/cua-hang' },
              { src: '/image/5.png', alt: 'Banner 5', link: '/cua-hang' },
              { src: '/image/6.png', alt: 'Banner 6', link: '/cua-hang' },
            ]} />
          </div>
          <div className="hero-side">
            <a href="/cua-hang">
              <img src="/image/2.png" alt="Side Banner" className="side-banner-img" />
            </a>
            <a href="/cua-hang">
              <img src="/image/3.png" alt="Side Banner" className="side-banner-img" />
            </a>
          </div>
        </div>
      </section>

      {/* Circle Icons - Danh mục */}
      <section className="circle-icons container">
        {loading ? (
          <p>Đang tải danh mục...</p>
        ) : (
          categories.slice(0, 8).map((cat, idx) => (
            <Link 
              to={`/cua-hang?categoryId=${cat.categoryId}`}
              className="icon-item" 
              key={cat.categoryId || cat.id || idx}
              style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
            >
              <div className="icon-circle" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CategoryIcon categoryName={cat.categoryName} />
              </div>
              <span>{cat.categoryName}</span>
            </Link>
          ))
        )}
      </section>

      {/* Flash Sale Section */}
      <section className="flash-sale-section container">
        <div className="flash-sale-banner">
          <div className="flash-sale-title-area">
            <span className="flash-sale-title">
              <span style={{position: 'relative', fontSize: '26px', fontWeight: '700', color: '#fff'}}>FlashSale</span>
              <img 
                decoding="async" 
                src="https://nhasachhaian.com/wp-content/uploads/2025/09/flash-Photoroom-400x400-Photoroom.png" 
                alt="flash" 
                className="flash-icon" 
              />
            </span>
          </div>
          <FlashSaleTimer hoursLeft={8} />
        </div>
        
        <div className="row-sale-inner">
          {loading ? (
            <div className="flash-sale-grid">
              {[1,2,3,4,5,6,7,8,9,10].map(i => (
                <div key={i} className="book-card loading">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flash-sale-grid">
                {flashSaleBooks.map((book) => (
                  <BookCard
                    key={book.bookId}
                    book={book}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
              <div className="flash-sale-footer">
                <a href="/cua-hang" className="btn-view-all-flash">
                  Xem tất cả
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Book Sections by Category */}
      {categories.slice(0, 7).map((category) => (
        <BookSection 
          key={category.categoryId}
          title={category.categoryName}
          books={booksByCategory[category.categoryId]}
          loading={!booksByCategory[category.categoryId] && loading}
          onAddToCart={handleAddToCart}
        />
      ))}

      {/* Tin Tức */}
      <section className="news-section container">
        <div className="section-header">
          <h2>Tin Tức</h2>
        </div>
        {articlesLoading ? (
          <div className="news-grid">
            {[1, 2, 3, 4].map(i => (
              <div className="news-side-item loading" key={i}>
                <div className="skeleton-img"></div>
                <div className="skeleton-text"></div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="news-grid">
            {articles.slice(0, 4).map((article, idx) => (
              <div className="news-side-item" key={article.articleId || article.id || idx}>
                <img src={article.image || '/image/placeholder.jpg'} alt={article.title} />
                <div className="news-side-content">
                  <h5>{article.title}</h5>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{textAlign: 'center', padding: '20px'}}>Không có tin tức nào.</p>
        )}
      </section>

      {/* Subscription */}
      <div className="newsletter-bar">
        <div className="container newsletter-inner">
          <input type="text" placeholder="Nhập địa chỉ email..." />
          <button>ĐĂNG KÝ NGAY</button>
        </div>
      </div>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container footer-grid">
          <div className="footer-col">
            <h3 className="footer-logo">Nhà Sách Hải An</h3>
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
              <li><Link to="/" style={{color: 'inherit', textDecoration: 'none'}}>Trang chủ</Link></li>
              <li><Link to="/cua-hang" style={{color: 'inherit', textDecoration: 'none'}}>Cửa hàng</Link></li>
              <li><Link to="/tin-tuc" style={{color: 'inherit', textDecoration: 'none'}}>Tin tức</Link></li>
              <li><Link to="/gioi-thieu" style={{color: 'inherit', textDecoration: 'none'}}>Giới thiệu</Link></li>
              <li><Link to="/lien-he" style={{color: 'inherit', textDecoration: 'none'}}>Liên hệ</Link></li>
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
    </div>
  );
}
