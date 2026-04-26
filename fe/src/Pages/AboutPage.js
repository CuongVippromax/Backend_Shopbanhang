import React from 'react';
import { Link } from 'react-router-dom';
import './AboutPage.css';
import UserMenu from '../Components/UserMenu';
import { useCart } from '../context/CartContext';

export default function AboutPage() {
  const { cartCount } = useCart();
  return (
    <div className="about-page">
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
            <li className="active"><Link to="/gioi-thieu" style={{color: 'var(--primary-orange)', textDecoration: 'none'}}>Giới thiệu</Link></li>
            <li><Link to="/lien-he" style={{color: 'inherit', textDecoration: 'none'}}>Liên hệ</Link></li>
          </ul>
        </div>
      </nav>

      {/* About Content */}
      <main className="container about-content-area">
        <h1 className="about-title">Giới Thiệu Nhà Sách Hoàng Kim</h1>
        
        <div className="about-text">
          <p><strong>Nhasachhoangkim.com</strong> là trang thương mại điện tử của <strong>Nhà Sách Hoàng Kim</strong>, hệ thống nhà sách thân thuộc của nhiều gia đình Việt kể từ nhà sách đầu tiên ra đời năm 1995 đến nay. Đến với không gian mua sắm trực tuyến nhasachhoangkim.com, khách hàng sẽ dễ dàng tìm thấy những tựa sách hấp dẫn, phong phú về thể loại từ nhiều nhà xuất bản, công ty sách danh tiếng trong và ngoài nước. Bên cạnh đó là đa dạng các sản phẩm dụng cụ học tập, văn phòng phẩm, quà tặng, đồ chơi giáo dục chính hãng đến từ các thương hiệu đáng tin cậy. Với phương châm không ngừng cải tiến và nâng cao chất lượng sản phẩm cùng dịch vụ, Nhà Sách Hoàng Kim cam kết mang đến cho khách hàng trải nghiệm mua sắm trực tuyến hiện đại và an toàn, từ quy trình đặt hàng nhanh chóng, phương thức thanh toán linh hoạt đến dịch vụ hỗ trợ khách hàng chu đáo và chuyên nghiệp.</p>
          
          <p className="highlight-text"><strong>Danh mục sản phẩm đa dạng và đặc biệt, với những mặt hàng độc quyền được lựa chọn kỹ lưỡng, chính là yếu tố làm nên sự khác biệt của Nhà Sách Hoàng Kim. Chính nhờ đó, chúng tôi đã xây dựng được niềm tin vững chắc và sự yêu mến từ phía khách hàng.</strong></p>

          <p>📚 <strong>Sách quốc văn:</strong> Nhà Sách Hoàng Kim mang đến một kho tàng sách quốc văn phong phú từ các nhà xuất bản và công ty sách uy tín trên cả nước. Đặc biệt, Hoàng Kim còn hợp tác xuất bản nhiều đầu sách chất lượng, đáp ứng nhu cầu học tập và giải trí của độc giả với những tựa sách được đón nhận rộng rãi trên thị trường.</p>

          <p>🌍 <strong>Sách ngoại văn:</strong> Với danh mục sách ngoại văn đa dạng, Nhà Sách Hoàng Kim lựa chọn và cung cấp các tựa sách tiếng Anh chất lượng từ những nhà xuất bản hàng đầu thế giới như Penguin Random House, HarperCollins, và Macmillan Publishers. Nhiều cuốn sách được phân phối độc quyền tại Hoàng Kim, mang đến cơ hội tiếp cận nguồn tri thức quốc tế nhanh chóng và dễ dàng.</p>

          <p>✏️ <strong>Dụng cụ học tập, văn phòng phẩm, đồ chơi, quà tặng:</strong> Nhà Sách Hoàng Kim không chỉ có sách mà còn cung cấp nhiều sản phẩm chính hãng, đa dạng từ các thương hiệu nổi tiếng trong và ngoài nước. Các sản phẩm này luôn được cập nhật xu hướng để đáp ứng sở thích và nhu cầu ngày càng cao của khách hàng.</p>

          <p>🎶 <strong>Băng, đĩa:</strong> Với sự đầu tư vào các sản phẩm âm nhạc và phim ảnh, Nhà Sách Hoàng Kim giới thiệu đến khách hàng những album của nhiều nghệ sĩ nổi tiếng cùng các bộ phim được yêu thích. Đây là điểm đến lý tưởng cho những ai tìm kiếm các sản phẩm giải trí chất lượng.</p>

          <p>Hi vọng với trang thương mại điện tử nhasachhoangkim.com, Nhà Sách Hoàng Kim có thể gia tăng tiện ích cho khách hàng, đồng thời mang những sản phẩm của hệ thống nhà sách đến với mọi khách hàng trên cả nước.</p>
          
          <p>Quý khách hàng có nhu cầu liên lạc, đóng góp ý kiến, phản hồi về sản phẩm dịch vụ của Nhà sách Hoàng Kim, vui lòng liên hệ:</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="main-footer" style={{marginTop: '60px'}}>
        <div className="container footer-grid">
          <div className="footer-col">
            <h3 className="footer-logo">Nhà Sách Hoàng Kim</h3>
            <p>📧 nhasachhoangkim@gmail.com</p>
          </div>
          <div className="footer-col">
            <h4>Hỗ Trợ</h4>
            <ul>
              <li>Giới thiệu về chúng tôi</li>
              <li>Chính sách bảo mật</li>
              <li>Chính sách đổi trả và hoàn tiền</li>
              <li>Chính sách thanh toán</li>
              <li>Chính sách vận chuyển</li>
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
