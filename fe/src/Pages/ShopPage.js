import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import ImgAsset from '../public';
import './ShopPage.css';
import './CleanHome.css';
import { getBooks, getCategories } from '../api';
import UserMenu from '../Components/UserMenu';
import CategoryDropdown from '../Components/CategoryDropdown';
import { useCart } from '../context/CartContext';

const BookCard = ({ book, isFlashSale }) => {
  const imgSrc = book.image || ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentwoocommerce_thumbnailsizewoocommerce_thumbnail;

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
    alert('Đã thêm vào giỏ hàng!');
  };

  return (
    <div className="ebook-card">
      <div className="ebook-image-wrapper">
        <a href={`/san-pham/${book.bookId}`}>
          <img src={imgSrc} alt={book.bookName} className="ebook-image" />
        </a>
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

const ITEMS_PER_PAGE = 15;

export default function ShopPage() {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(500000);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [searchParams] = useSearchParams();

  // Get categoryId from URL if exists
  useEffect(() => {
    const categoryId = searchParams.get('categoryId');
    if (categoryId) {
      setSelectedCategory(categoryId);
    } else {
      setSelectedCategory('');
    }
  }, [searchParams]);

  // Load all books once on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [booksRes, categoriesRes] = await Promise.all([
          getBooks({ size: 1000 }),
          getCategories()
        ]);
        
        let booksData = booksRes?.data || booksRes || [];
        let booksArray = Array.isArray(booksData) ? booksData : [];
        
        setAllBooks(booksArray);
        
        const categoriesData = categoriesRes?.data || categoriesRes || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Error loading data:', error);
        setAllBooks([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter and paginate when filters change
  useEffect(() => {
    const filterAndPaginateBooks = () => {
      let filtered = [...allBooks];
      
      // Filter by category
      if (selectedCategory) {
        filtered = filtered.filter(book => {
          const bookCategoryId = book.categoryId || book.category?.categoryId;
          return String(bookCategoryId) === String(selectedCategory);
        });
      }
      
      // Filter by price
      filtered = filtered.filter(book => book.price <= maxPrice);
      
      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(book => 
          book.bookName?.toLowerCase().includes(term) ||
          book.category?.toLowerCase().includes(term)
        );
      }
      
      // Calculate total pages
      const total = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
      setTotalPages(total);
      
      // Paginate
      const safePage = Math.min(page, Math.max(0, total - 1));
      const startIndex = safePage * ITEMS_PER_PAGE;
      const paginatedBooks = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
      
      setBooks(paginatedBooks);
    };

    if (!loading && allBooks.length > 0) {
      filterAndPaginateBooks();
    }
  }, [allBooks, selectedCategory, maxPrice, searchTerm, page, loading]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(0);
  };

  const handleFooterCategoryClick = (categoryId) => {
    navigate(`/cua-hang?categoryId=${categoryId}`);
  };
  return (
    <div className="shop-page">
      {/* Main Header (Tái sử dụng) */}
      <header className="main-header">
        <div className="container header-inner">
          <div className="logo-area">
            <Link to="/" style={{display: 'flex', alignItems: 'center', textDecoration: 'none'}}>
              <img src="/image/logo-hoang-kim.jpg" alt="Logo Hoàng Kim" className="logo-img" style={{height: '70px', objectFit: 'contain'}} />
            </Link>
          </div>
          
          <div className="search-area">
            <input 
              type="text" 
              placeholder="Bạn muốn mua gì?" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                }
              }}
            />
            <button className="search-btn" onClick={handleSearch}>🔍</button>
          </div>

          <div className="cart-area">
            <Link to="/gio-hang" style={{display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', color: 'inherit', marginRight: '15px', paddingRight: '15px', borderRight: '1px solid #ddd'}}>
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

      {/* Navigation (Tái sử dụng) */}
      <nav className="main-nav" style={{marginBottom: '30px'}}>
        <div className="container nav-inner">
          <div 
            className="categories-menu"
            onMouseEnter={() => setShowCategoryDropdown(true)}
            onMouseLeave={() => setShowCategoryDropdown(false)}
            style={{position: 'relative'}}
          >
            <div style={{background: 'var(--primary-orange)', padding: '15px 20px', color: 'white', fontWeight: 'bold', width: '220px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
              <span>☰</span> Danh mục sản phẩm
            </div>
            {showCategoryDropdown && (
              <CategoryDropdown 
                categories={categories} 
                onClose={() => setShowCategoryDropdown(false)} 
              />
            )}
          </div>
          <ul className="nav-links">
            <li><Link to="/" style={{color: 'inherit', textDecoration: 'none'}}>Trang chủ</Link></li>
            <li className="active"><Link to="/cua-hang" style={{color: 'var(--primary-orange)', textDecoration: 'none'}}>Cửa hàng</Link></li>
            <li><Link to="/tin-tuc" style={{color: 'inherit', textDecoration: 'none'}}>Tin tức</Link></li>
            <li><Link to="/gioi-thieu" style={{color: 'inherit', textDecoration: 'none'}}>Giới thiệu</Link></li>
            <li><Link to="/lien-he" style={{color: 'inherit', textDecoration: 'none'}}>Liên hệ</Link></li>
          </ul>
        </div>
      </nav>

      {/* Shop Content */}
      <div className="container shop-layout">
        {/* Sidebar */}
        <aside className="shop-sidebar">
          {/* Lọc theo giá */}
          <div className="sidebar-widget">
            <h4 className="widget-title">LỌC THEO GIÁ</h4>
            <div className="price-slider-container">
              <div className="price-inputs">
                <span>0 ₫</span>
                <span> - </span>
                <span>{maxPrice >= 500000 ? '500.000+ ₫' : new Intl.NumberFormat('vi-VN').format(maxPrice) + ' ₫'}</span>
              </div>
              <div className="range-slider">
                <div 
                  className="range-fill"
                  style={{ width: `${(maxPrice / 500000) * 100}%` }}
                />
                <input 
                  type="range" 
                  min="0" 
                  max="500000" 
                  step="10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Có thể bạn sẽ thích */}
          <div className="sidebar-widget">
            <h4 className="widget-title">CÓ THỂ BẠN SẼ THÍCH</h4>
            <ul className="liked-list">
              {books.slice(0, 5).map((book) => (
                <li key={book.bookId} className="liked-item">
                  <img src={book.image || ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentwoocommerce_thumbnailsizewoocommerce_thumbnail} alt={book.bookName} />
                  <div className="liked-info">
                    <h5>{book.bookName}</h5>
                    <div className="price-row">
                      <span className="current-price" style={{fontSize: '14px'}}>
                        {new Intl.NumberFormat('vi-VN').format(book.price)} ₫
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Grid */}
        <main className="shop-main">
          {loading ? (
            <div className="loading-state">Đang tải sản phẩm...</div>
          ) : books.length === 0 ? (
            <div className="empty-state">Không có sản phẩm nào</div>
          ) : (
            <>
              <div className="shop-grid">
                {books.map((book) => (
                  <BookCard key={book.bookId} book={book} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="page-nav-btn"
                    onClick={() => page > 0 && setPage(0)}
                    disabled={page === 0}
                    title="Trang đầu"
                  >
                    «
                  </button>
                  <button 
                    className="page-nav-btn"
                    onClick={() => page > 0 && setPage(page - 1)}
                    disabled={page === 0}
                  >
                    ‹ Trước
                  </button>
                  
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let startPage = Math.max(0, page - Math.floor(maxVisible / 2));
                    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
                    
                    if (endPage - startPage < maxVisible - 1) {
                      startPage = Math.max(0, endPage - maxVisible + 1);
                    }
                    
                    if (startPage > 0) {
                      pages.push(
                        <span key={0} className="page-num" onClick={() => setPage(0)}>1</span>
                      );
                      if (startPage > 1) {
                        pages.push(<span key="dots1" className="page-dots">...</span>);
                      }
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <span 
                          key={i} 
                          className={`page-num ${page === i ? 'active' : ''}`}
                          onClick={() => setPage(i)}
                        >
                          {i + 1}
                        </span>
                      );
                    }
                    
                    if (endPage < totalPages - 1) {
                      if (endPage < totalPages - 2) {
                        pages.push(<span key="dots2" className="page-dots">...</span>);
                      }
                      pages.push(
                        <span key={totalPages - 1} className="page-num" onClick={() => setPage(totalPages - 1)}>
                          {totalPages}
                        </span>
                      );
                    }
                    
                    return pages;
                  })()}
                  
                  <button 
                    className="page-nav-btn"
                    onClick={() => page < totalPages - 1 && setPage(page + 1)}
                    disabled={page === totalPages - 1}
                  >
                    Sau ›
                  </button>
                  <button 
                    className="page-nav-btn"
                    onClick={() => page < totalPages - 1 && setPage(totalPages - 1)}
                    disabled={page === totalPages - 1}
                    title="Trang cuối"
                  >
                    »
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Footer (Tái sử dụng) */}
      <footer className="main-footer" style={{marginTop: '50px'}}>
        <div className="container footer-grid">
          <div className="footer-col">
            <h3 className="footer-logo">Nhà Sách Hoàng Kim</h3>
            <p>📧 nhasachhoangkim@gmail.com</p>
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
            <h4>Hotline Hỗ Trợ</h4>
            <p style={{marginBottom: '5px', fontSize: '13px', color: '#000'}}>Phương thức thanh toán</p>
            <div className="payment-icons" style={{display: 'flex', gap: '10px', fontSize: '24px', letterSpacing: '0'}}>
               💵 <img src="/image/vnpay.png" alt="VNPay" style={{width: '40px', height: 'auto'}} /> 🏦
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
