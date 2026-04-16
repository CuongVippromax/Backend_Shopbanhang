/* ================================================================
   FOOTER COMPONENT - Redesigned Bold & Vibrant
   ================================================================ */

import { Link } from 'react-router-dom'

/* ================================================================
   ICONS
   ================================================================ */

const Icons = {
  Logo: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Phone: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Mail: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  MapPin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Truck: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  RefreshCw: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  Zalo: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="12" fill="#0068FF"/>
      <path d="M12 6C8.69 6 6 8.69 6 12c0 2.17 1.17 4.08 2.93 5.16-.08-.4-.14-.82-.14-1.26 0-3.31 2.69-6 6-6s6 2.69 6 6c0 1.5-.55 2.87-1.47 3.93.96-.7 1.72-1.6 2.2-2.63.08-.18.14-.38.14-.6 0-1.66-1.34-3-3-3-.55 0-1.07.16-1.51.43C14.29 9.89 13.18 9.5 12 9.5c-1.66 0-3 1.34-3 3 0 1.26.77 2.34 1.87 2.79C10.32 15.9 10 16.92 10 18c0 .55.45 1 1 1h6c.55 0 1-.45 1-1 0-1.16-.4-2.25-1.09-3.09C18.14 16.32 19 17.6 19 19c0 2.21-1.79 4-4 4h-6c-2.21 0-4-1.79-4-4 0-1.08.43-2.06 1.12-2.79C5.29 15.32 5 14.19 5 13c0-3.87 3.13-7 7-7z" fill="white"/>
    </svg>
  ),
}

/* ================================================================
   FOOTER COMPONENT
   ================================================================ */

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Brand Column */}
          <div className="footer__brand">
            <div className="footer__logo">
              <div className="footer__logo-icon">
                <Icons.Logo />
              </div>
              <span className="footer__logo-text">HOÀNG KIM</span>
            </div>
            <p className="footer__description">
              Nhà sách Hoàng Kim - Điểm đến của những người yêu sách. Hàng ngàn đầu sách chất lượng từ trong và ngoài nước.
            </p>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="Zalo">
                <Icons.Zalo />
              </a>
            </div>
          </div>

          {/* Services Column */}
          <div className="footer__column">
            <h4 className="footer__column-title">Dịch vụ</h4>
            <ul className="footer__list">
              <li><Link to="/trang/dieu-khoan-su-dung" className="footer__link"><Icons.ChevronRight /> Điều khoản sử dụng</Link></li>
              <li><Link to="/trang/chinh-sach-bao-mat" className="footer__link"><Icons.ChevronRight /> Chính sách bảo mật</Link></li>
              <li><Link to="/trang/chinh-sach-thanh-toan" className="footer__link"><Icons.ChevronRight /> Chính sách thanh toán</Link></li>
              <li><Link to="/trang/gioi-thieu" className="footer__link"><Icons.ChevronRight /> Giới thiệu Hoàng Kim</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="footer__column">
            <h4 className="footer__column-title">Hỗ trợ</h4>
            <ul className="footer__list">
              <li><Link to="/trang/chinh-sach-doi-tra" className="footer__link"><Icons.ChevronRight /> Đổi - trả - hoàn tiền</Link></li>
              <li><Link to="/chinh-sach-bao-hanh" className="footer__link"><Icons.ChevronRight /> Chính sách bảo hành</Link></li>
              <li><Link to="/lien-he" className="footer__link"><Icons.ChevronRight /> Liên hệ hỗ trợ</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="footer__column">
            <h4 className="footer__column-title">Liên hệ</h4>
            <ul className="footer__contact-list">
              <li className="footer__contact-item">
                <Icons.MapPin />
                <span>Số 123 Đường Quang Trung, Q. Hà Đông, Hà Nội</span>
              </li>
              <li className="footer__contact-item">
                <Icons.Phone />
                <a href="tel:02438567890">024 3856 7890</a>
              </li>
              <li className="footer__contact-item">
                <Icons.Mail />
                <a href="mailto:hotro@hoangkimbooks.vn">hotro@hoangkimbooks.vn</a>
              </li>
              <li className="footer__contact-item">
                <Icons.Clock />
                <span>8h00 - 22h00 (T2 - CN)</span>
              </li>
            </ul>

            {/* Payment & Shipping */}
            <div className="footer__trust">
              <div className="footer__trust-item">
                <Icons.Truck />
                <span>Miễn phí giao hàng</span>
              </div>
              <div className="footer__trust-item">
                <Icons.Shield />
                <span>Thanh toán an toàn</span>
              </div>
              <div className="footer__trust-item">
                <Icons.RefreshCw />
                <span>Đổi trả 7 ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <div className="footer__copyright">
            <p>© {currentYear} Nhà sách Hoàng Kim. Tất cả quyền được bảo lưu.</p>
          </div>
          <div className="footer__bottom-links">
            <Link to="/trang/dieu-khoan-su-dung">Điều khoản</Link>
            <Link to="/trang/chinh-sach-bao-mat">Bảo mật</Link>
            <Link to="/trang/faq">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
