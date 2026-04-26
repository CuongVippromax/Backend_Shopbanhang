import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ImgAsset from '../public';
import './ArticleDetailPage.css';
import UserMenu from '../Components/UserMenu';
import { useCart } from '../context/CartContext';
import { getArticleBySlug, getArticleById } from '../api';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const { cartCount } = useCart();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadArticle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      // Thử lấy bằng slug trước, nếu slug là số thì lấy bằng ID
      let data;
      if (/^\d+$/.test(slug)) {
        data = await getArticleById(slug);
      } else {
        data = await getArticleBySlug(slug);
      }
      setArticle(data?.data || data);
    } catch (err) {
      console.error('Error loading article:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="article-detail-page">
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
      <nav className="main-nav" style={{marginBottom: '30px'}}>
        <div className="container nav-inner">
          <div className="categories-menu" style={{background: 'var(--primary-orange)', padding: '15px 20px', color: 'white', fontWeight: 'bold', width: '220px', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span>☰</span> Danh mục sản phẩm
          </div>
          <ul className="nav-links">
            <li><Link to="/" style={{color: 'inherit', textDecoration: 'none'}}>Trang chủ</Link></li>
            <li><Link to="/cua-hang" style={{color: 'inherit', textDecoration: 'none'}}>Cửa hàng</Link></li>
            <li><Link to="/tin-tuc" style={{color: 'var(--primary-orange)', textDecoration: 'none'}}>Tin tức</Link></li>
            <li><Link to="/gioi-thieu" style={{color: 'inherit', textDecoration: 'none'}}>Giới thiệu</Link></li>
            <li><Link to="/lien-he" style={{color: 'inherit', textDecoration: 'none'}}>Liên hệ</Link></li>
          </ul>
        </div>
      </nav>

      {/* Article Content */}
      <main className="container article-content-area">
        {loading ? (
          <div className="loading-state">Đang tải bài viết...</div>
        ) : !article ? (
          <div className="error-state">
            <p>Không tìm thấy bài viết</p>
            <Link to="/tin-tuc" className="btn-back">← Quay lại trang tin tức</Link>
          </div>
        ) : (
          <>
            <Link to="/tin-tuc" className="btn-back">← Quay lại trang tin tức</Link>

            {article.category && (
              <span className="article-category-tag">{article.category}</span>
            )}

            <h1>{article.title}</h1>

            <div className="article-meta">
              <span>📅 {article.createdAt ? new Date(article.createdAt).toLocaleDateString('vi-VN') : ''}</span>
              <span>✍️ {article.authorName || 'Admin'}</span>
            </div>

            {article.image && (
              <img src={article.image} alt={article.title} className="article-featured-img" />
            )}

            <div className="article-body"
              dangerouslySetInnerHTML={{
                __html: article.content
                  ? article.content.replace(/\n/g, '<br>')
                  : ''
              }}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="main-footer" style={{marginTop: '50px'}}>
        <div className="container footer-grid">
          <div className="footer-col">
            <h3 className="footer-logo">Nhà Sách Hoàng Kim</h3>
            <p>📧 nhasachhaian@gmail.com</p>
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
            <h4>Hotline Hỗ Trợ</h4>
            <p>1900 1234</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
