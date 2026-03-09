import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'

function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar__left">
        Chào mừng bạn đã đến với Nhà sách Hoàng Kim!
      </div>
      <div className="top-bar__right">
        <Link to="/dang-nhap">Đăng nhập</Link>
        <span className="divider">/</span>
        <Link to="/dang-ky">Đăng ký</Link>
      </div>
    </div>
  )
}

function Header() {
  const navigate = useNavigate()
  return (
    <header className="header">
      <Link to="/" className="header__logo">
        <div className="logo-circle">HK</div>
        <div className="logo-text">
          <span className="logo-title">NHÀ SÁCH HOÀNG KIM</span>
          <span className="logo-subtitle">Nơi tri thức gặp gỡ</span>
        </div>
      </Link>

      <form className="header__search" onSubmit={(e) => {
        e.preventDefault()
        const q = e.currentTarget.querySelector('input[name="q"]').value
        if (q && q.trim()) navigate(`/san-pham?search=${encodeURIComponent(q.trim())}`)
        else navigate('/san-pham')
      }}>
        <select className="search__category" name="cat" aria-label="Danh mục">
          <option>Danh mục</option>
        </select>
        <input name="q" className="search__input" placeholder="Bạn muốn tìm gì..." />
        <button type="submit" className="search__button">Tìm kiếm</button>
      </form>

      <div className="header__hotline">
        <div className="hotline-icon">24H</div>
        <div className="hotline-text">
          <span>Hotline Hà Nội: 1900 1234</span>
          <span>Hotline HCM: 1900 5678</span>
        </div>
      </div>

      <Link to="/gio-hang" className="header__cart" aria-label="Giỏ hàng">
        <span className="cart-icon">🛒</span>
        <span className="cart-count">0</span>
      </Link>
    </header>
  )
}

function NavBar() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  return (
    <nav className="nav">
      <Link to="/san-pham" className="nav__catalog">
        <span className="hamburger" />
        <span>CHỌN TỦ SÁCH</span>
      </Link>

      <div className="nav__links">
        <Link to="/" className={isActive('/') && location.pathname === '/' ? 'active' : ''}>
          TRANG CHỦ
        </Link>
        <Link to="/san-pham" className={isActive('/san-pham') ? 'active' : ''}>
          SẢN PHẨM
          <span className="badge-hot">Hot</span>
        </Link>
        <Link to="/san-pham?sort=newest">SÁCH MỚI</Link>
        <Link to="/san-pham?featured=true">SÁCH HAY</Link>
        <Link to="/tin-tuc">TIN TỨC</Link>
        <Link to="/lien-he" className={isActive('/lien-he') ? 'active' : ''}>LIÊN HỆ</Link>
      </div>
    </nav>
  )
}

export default function Layout() {
  return (
    <div className="app">
      <TopBar />
      <Header />
      <NavBar />
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-col footer-col--brand">
            <div className="footer-logo">HKBOOKS</div>
            <p className="footer-text">
              Nhà sách Hoàng Kim là hệ thống sách online với hàng ngàn đầu sách trong và ngoài nước.
            </p>
            <p className="footer-text">
              Chúng tôi cam kết mang đến những cuốn sách chất lượng, đóng gói cẩn thận và giao hàng nhanh chóng.
            </p>
            <div className="footer-badges">
              <span className="footer-badge">Đã đăng ký Bộ Công Thương</span>
            </div>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">Fb</a>
              <a href="#" aria-label="Instagram">Ig</a>
              <a href="#" aria-label="YouTube">Yt</a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Dịch vụ</h4>
            <ul className="footer-list">
              <li><Link to="#">Điều khoản sử dụng</Link></li>
              <li><Link to="#">Chính sách bảo mật thông tin cá nhân</Link></li>
              <li><Link to="#">Chính sách bảo mật thanh toán</Link></li>
              <li><Link to="#">Giới thiệu Hoàng Kim</Link></li>
              <li><Link to="#">Hệ thống nhà sách</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Hỗ trợ</h4>
            <ul className="footer-list">
              <li><Link to="#">Chính sách đổi - trả - hoàn tiền</Link></li>
              <li><Link to="#">Chính sách bảo hành - bồi hoàn</Link></li>
              <li><Link to="#">Chính sách vận chuyển</Link></li>
              <li><Link to="#">Chính sách khách sỉ</Link></li>
              <li><Link to="#">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Tài khoản của tôi</h4>
            <ul className="footer-list">
              <li><Link to="/dang-nhap">Đăng nhập / Tạo tài khoản</Link></li>
              <li><Link to="#">Thay đổi địa chỉ khách hàng</Link></li>
              <li><Link to="#">Chi tiết tài khoản</Link></li>
              <li><Link to="#">Lịch sử mua hàng</Link></li>
            </ul>
          </div>

          <div className="footer-col footer-col--contact">
            <h4 className="footer-title">Liên hệ</h4>
            <p className="footer-text">
              Nhà sách Hoàng Kim - Trụ sở chính<br />
              123 Đường Sách, Quận 1, TP. HCM
            </p>
            <p className="footer-text">
              Email: <a href="mailto:hotro@hoangkimbooks.vn">hotro@hoangkimbooks.vn</a><br />
              Hotline: <a href="tel:19001234">1900 1234</a>
            </p>
            <div className="footer-partners">
              <span className="footer-partner">VNPay</span>
              <span className="footer-partner">Momo</span>
              <span className="footer-partner">ZaloPay</span>
              <span className="footer-partner">ShopeePay</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Nhà sách Hoàng Kim. All rights reserved.</span>
          <div className="footer-bottom-links">
            <Link to="#">Điều khoản sử dụng</Link>
            <Link to="#">Chính sách bảo mật</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export { TopBar, Header, NavBar }
