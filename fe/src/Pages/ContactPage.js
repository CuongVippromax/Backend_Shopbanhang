import React from 'react';
import { Link } from 'react-router-dom';
import ImgAsset from '../public';
import './ContactPage.css';
import UserMenu from '../Components/UserMenu';
import { useCart } from '../context/CartContext';

export default function ContactPage() {
  const { cartCount } = useCart();
  return (
    <div className="contact-page">
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
      <nav className="main-nav" style={{marginBottom: '50px'}}>
        <div className="container nav-inner">
          <div className="categories-menu" style={{background: 'var(--primary-orange)', padding: '15px 20px', color: 'white', fontWeight: 'bold', width: '220px', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span>☰</span> Danh mục sản phẩm
          </div>
          <ul className="nav-links">
            <li><Link to="/" style={{color: 'inherit', textDecoration: 'none'}}>Trang chủ</Link></li>
            <li><Link to="/cua-hang" style={{color: 'inherit', textDecoration: 'none'}}>Cửa hàng</Link></li>
            <li><Link to="/tin-tuc" style={{color: 'inherit', textDecoration: 'none'}}>Tin tức</Link></li>
            <li><Link to="/gioi-thieu" style={{color: 'inherit', textDecoration: 'none'}}>Giới thiệu</Link></li>
            <li className="active"><Link to="/lien-he" style={{color: 'var(--primary-orange)', textDecoration: 'none'}}>Liên hệ</Link></li>
          </ul>
        </div>
      </nav>

      {/* Contact Content */}
      <main className="container contact-content-area">
        <div className="contact-layout">
          
          {/* Left Column: Banners */}
          <div className="contact-left">
            <img 
              src={ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentlargesizelarge_2 || ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentlargesizelarge} 
              alt="Banner Lãnh Đạo" 
              className="contact-banner"
            />
            <img 
              src={ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentlargesizelarge_3 || ImgAsset.TrangchNhSchHiAnimportedbyHTMLtoFigmahttpsreforeaiwith_Imageattachmentlargesizelarge_1} 
              alt="Banner Khuyến Mãi" 
              className="contact-banner"
            />
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-right">
            <form className="contact-form">
              <div className="form-group">
                <label>Tên của bạn (bắt buộc)</label>
                <input type="text" className="form-input" />
              </div>
              
              <div className="form-group">
                <label>Địa chỉ Email (bắt buộc)</label>
                <input type="email" className="form-input" />
              </div>
              
              <div className="form-group">
                <label>Tiêu đề:</label>
                <input type="text" className="form-input" />
              </div>
              
              <div className="form-group">
                <label>Thông điệp</label>
                <textarea className="form-textarea" rows="6"></textarea>
              </div>
              
              <button type="button" className="btn-submit-contact">GỬI ĐI</button>
            </form>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="main-footer" style={{marginTop: '60px'}}>
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
            <h4>Danh Mục</h4>
            <ul>
              <li>Sách thiếu nhi</li>
              <li>Sách kỹ năng</li>
              <li>Sách tiếng anh</li>
              <li>Sách khởi nghiệp</li>
              <li>Sách nuôi dạy con</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Hotline Hỗ Trợ</h4>
            <p style={{marginBottom: '5px', fontSize: '13px', color: '#000'}}>Phương thức thanh toán</p>
            <div className="payment-icons" style={{display: 'flex', gap: '10px', fontSize: '24px', letterSpacing: '0'}}>
               💳 🏦 💵
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
