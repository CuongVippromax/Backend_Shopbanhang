import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NewsPage.css';
import UserMenu from '../Components/UserMenu';
import { useCart } from '../context/CartContext';
import { getArticles, getBooks } from '../api';

export default function NewsPage() {
  const { cartCount } = useCart();
  const [articles, setArticles] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 6;

  useEffect(() => {
    loadData();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [articlesRes, booksRes] = await Promise.all([
        getArticles({ page, size: pageSize }),
        getBooks({ size: 5 })
      ]);
      
      let articlesData = articlesRes?.data || articlesRes || [];
      if (articlesData.data) {
        // Backend returns { pageNo, pageSize, totalElements, totalPages, data }
        setTotalPages(articlesData.totalPages || 0);
        articlesData = articlesData.data;
      } else if (Array.isArray(articlesData)) {
        setTotalPages(Math.ceil(articlesData.length / pageSize));
      }
      setArticles(Array.isArray(articlesData) ? articlesData : []);
      
      const booksData = booksRes?.data || booksRes || [];
      setRelatedBooks(Array.isArray(booksData) ? booksData : []);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="news-page">

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

      {/* Navigation */}
      <nav className="main-nav">
        <div className="container nav-inner">
          <div className="categories-menu" style={{background: 'var(--primary-orange)', padding: '15px 20px', color: 'white', fontWeight: 'bold', width: '220px', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span>☰</span> Danh mục sản phẩm
          </div>
          <ul className="nav-links">
            <li><Link to="/" style={{color: 'inherit', textDecoration: 'none'}}>Trang chủ</Link></li>
            <li><Link to="/cua-hang" style={{color: 'inherit', textDecoration: 'none'}}>Cửa hàng</Link></li>
            <li className="active"><Link to="/tin-tuc" style={{color: 'var(--primary-orange)', textDecoration: 'none'}}>Tin tức</Link></li>
            <li><Link to="/gioi-thieu" style={{color: 'inherit', textDecoration: 'none'}}>Giới thiệu</Link></li>
            <li><Link to="/lien-he" style={{color: 'inherit', textDecoration: 'none'}}>Liên hệ</Link></li>
          </ul>
        </div>
      </nav>

      {/* News Content */}
      <main className="container news-content-area">
        <div className="news-layout">
          
          {/* Left Column: Articles */}
          <div className="news-main-col">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải tin tức...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="empty-state">
                <p>Chưa có bài viết nào</p>
              </div>
            ) : (
              <>
                <div className="articles-grid">
                  {articles.map((article, idx) => (
                    <article className="article-card-large" key={article.articleId || article.id || idx}>
                      <Link to={`/bai-viet/${article.slug || article.articleId}`} className="article-image-link">
                        <div className="article-image">
                          <img 
                            src={article.image || article.thumbnail || '/image/default-article.jpg'} 
                            alt={article.title}
                            onError={(e) => { e.target.src = '/image/default-article.jpg'; }}
                          />
                        </div>
                      </Link>
                      <div className="article-details">
                        <div className="article-meta">
                          <span className="article-date">
                            📅 {formatDate(article.createdAt)}
                          </span>
                          {article.category && (
                            <span className="article-category-tag">{article.category}</span>
                          )}
                        </div>
                        <h2 className="article-title">
                          <Link to={`/bai-viet/${article.slug || article.articleId}`}>{article.title}</Link>
                        </h2>
                        <p className="article-excerpt">
                          {article.excerpt || article.summary || (article.content?.substring(0, 150) + '...')}
                        </p>
                        <Link to={`/bai-viet/${article.slug || article.articleId}`} className="btn-read-more">
                          Đọc tiếp →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className="page-nav-btn"
                      onClick={() => setPage(0)}
                      disabled={page === 0}
                      title="Trang đầu"
                    >
                      «
                    </button>
                    <button 
                      className="page-nav-btn"
                      onClick={() => setPage(page - 1)}
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
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages - 1}
                    >
                      Sau ›
                    </button>
                    <button 
                      className="page-nav-btn"
                      onClick={() => setPage(totalPages - 1)}
                      disabled={page >= totalPages - 1}
                      title="Trang cuối"
                    >
                      »
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <aside className="news-sidebar">
            <div className="sidebar-widget">
              <h4 className="widget-title">📝 BÀI VIẾT MỚI NHẤT</h4>
              <ul className="recent-posts-list">
                {articles.slice(0, 5).map((article, idx) => (
                  <li key={article.articleId || article.id || idx} className="recent-post-item">
                    <Link to={`/bai-viet/${article.slug || article.articleId}`} className="recent-post-link">
                      <img 
                        src={article.image || article.thumbnail || '/image/default-article.jpg'} 
                        alt={article.title}
                        className="recent-post-thumb"
                        onError={(e) => { e.target.src = '/image/default-article.jpg'; }}
                      />
                      <div className="recent-post-info">
                        <span className="recent-post-title">{article.title}</span>
                        <span className="recent-post-date">{formatDate(article.createdAt)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sidebar-widget">
              <h4 className="widget-title">📚 CÓ THỂ BẠN QUAN TÂM</h4>
              <ul className="liked-list">
                {relatedBooks.map((book, idx) => (
                  <li className="liked-item" key={book.bookId || idx}>
                    <Link to={`/san-pham/${book.bookId}`}>
                      <img 
                        src={book.image || '/image/default-book.jpg'} 
                        alt={book.bookName}
                        onError={(e) => { e.target.src = '/image/default-book.jpg'; }}
                      />
                    </Link>
                    <div className="liked-info">
                      <h5>
                        <Link to={`/san-pham/${book.bookId}`}>{book.bookName}</Link>
                      </h5>
                      <div className="price-row">
                        <span className="current-price">{formatPrice(book.price)}</span>
                        {book.originalPrice && (
                          <span className="old-price">{formatPrice(book.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sidebar-widget contact-widget">
              <h4 className="widget-title">📞 LIÊN HỆ</h4>
              <p>Bạn cần hỗ trợ?</p>
              <p className="contact-hotline">1900 1234</p>
              <Link to="/lien-he" className="btn-contact">Liên hệ ngay</Link>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
