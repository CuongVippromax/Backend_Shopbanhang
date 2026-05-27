import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { Logo } from '../common/Logo';

const Footer = () => (
  <footer className="site-footer">
    <div className="container footer-grid">
      <div>
        <Logo size="md" white />
        <p className="footer-desc">
          Nhà sách Hoàng Kim — Nơi gửi gắm tri thức và cảm hứng đọc sách cho mọi người Việt Nam.
        </p>
        <div className="socials">
          <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer"><Icon name="facebook" /></a>
          <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noreferrer"><Icon name="youtube" /></a>
          <a href="mailto:hello@hoangkim.vn" aria-label="Email"><Icon name="mail" /></a>
        </div>
      </div>

      <div>
        <h4>Khám phá</h4>
        <ul className="footer-list">
          <li><Link to="/books">Tất cả sách</Link></li>
          <li><Link to="/articles">Bài viết</Link></li>
          <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
          <li><Link to="/about">Về chúng tôi</Link></li>
        </ul>
      </div>

      <div>
        <h4>Hỗ trợ</h4>
        <ul className="footer-list">
          <li><Link to="/contact">Liên hệ</Link></li>
          <li><Link to="/faq">Chính sách đổi trả</Link></li>
          <li><Link to="/payment-methods">Phương thức thanh toán</Link></li>
          <li><Link to="/shipping">Vận chuyển & giao hàng</Link></li>
        </ul>
      </div>

      <div>
        <h4>Liên hệ</h4>
        <ul className="footer-contact">
          <li><Icon name="location" size={16} /> Số 262, Đường Phùng Hưng, P. Phúc La, Q. Hà Đông, Hà Nội</li>
          <li><Icon name="phone" size={16} /> 1900 1234 (8:00 - 21:00)</li>
          <li><Icon name="mail" size={16} /> hello@hoangkim.vn</li>
        </ul>
      </div>
    </div>

    <div className="footer-bottom">
      <div className="container fb-inner">
        <span>© {new Date().getFullYear()} Hoàng Kim Books. Bảo lưu mọi quyền.</span>
        <span>Thiết kế bởi đội ngũ Hoàng Kim · Made with ♥ in Việt Nam</span>
      </div>
    </div>

    <style>{`
      .site-footer {
        background: linear-gradient(180deg, #34504b 0%, #2c3a33 100%);
        color: rgba(255,255,255,0.85);
        margin-top: 64px;
      }
      .footer-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
        gap: 40px;
        padding: 56px 0 32px;
      }
      .footer-desc {
        margin-top: 16px;
        font-size: 14px;
        color: rgba(255,255,255,0.7);
        max-width: 320px;
        line-height: 1.65;
      }
      .socials { display: flex; gap: 10px; margin-top: 18px; }
      .socials a {
        width: 38px; height: 38px;
        border-radius: 50%;
        display: inline-flex; align-items: center; justify-content: center;
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.9);
        transition: background var(--t-fast), transform var(--t-fast);
      }
      .socials a:hover {
        background: var(--color-accent);
        color: #2c2410;
        transform: translateY(-2px);
      }
      .site-footer h4 {
        color: #fff;
        font-size: 15px;
        margin-bottom: 18px;
        letter-spacing: 0.5px;
      }
      .footer-list, .footer-contact { list-style: none; margin: 0; padding: 0; }
      .footer-list li, .footer-contact li {
        margin-bottom: 10px;
        font-size: 14px;
      }
      .footer-list a {
        color: rgba(255,255,255,0.7);
        transition: color var(--t-fast);
      }
      .footer-list a:hover { color: var(--color-accent-soft); }
      .footer-contact li {
        display: flex; align-items: flex-start; gap: 8px;
        color: rgba(255,255,255,0.78);
      }
      .footer-contact svg { color: var(--color-accent-soft); flex-shrink: 0; margin-top: 2px; }

      .footer-bottom {
        border-top: 1px solid rgba(255,255,255,0.08);
        padding: 18px 0;
        font-size: 13px;
        color: rgba(255,255,255,0.55);
      }
      .fb-inner { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }

      @media (max-width: 900px) {
        .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; padding: 44px 0 24px; }
      }
      @media (max-width: 540px) {
        .footer-grid { grid-template-columns: 1fr; }
        .fb-inner { justify-content: center; text-align: center; }
      }
    `}</style>
  </footer>
);

export default Footer;
