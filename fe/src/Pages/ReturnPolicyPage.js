import React from 'react';
import { Link } from 'react-router-dom';
import './ReturnPolicyPage.css';
import UserMenu from '../Components/UserMenu';
import { useCart } from '../context/CartContext';

export default function ReturnPolicyPage() {
  const { cartCount } = useCart();
  
  return (
    <div className="return-policy-page">
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
      <nav className="main-nav" style={{marginBottom: '30px', background: '#f5f5f5'}}>
        <div className="container nav-inner">
          <ul className="nav-links">
            <li><Link to="/" style={{color: 'inherit', textDecoration: 'none'}}>Trang chủ</Link></li>
            <li><Link to="/cua-hang" style={{color: 'inherit', textDecoration: 'none'}}>Cửa hàng</Link></li>
            <li><Link to="/tin-tuc" style={{color: 'inherit', textDecoration: 'none'}}>Tin tức</Link></li>
            <li><Link to="/gioi-thieu" style={{color: 'inherit', textDecoration: 'none'}}>Giới thiệu</Link></li>
            <li><Link to="/lien-he" style={{color: 'inherit', textDecoration: 'none'}}>Liên hệ</Link></li>
          </ul>
        </div>
      </nav>
      <div className="page-header">
        <h1>Chính Sách Đổi Trả Sản Phẩm</h1>
        <p>Nhà Sách Hoàng Kim - Cam kết chất lượng dịch vụ</p>
      </div>

      <div className="policy-content">
        <div className="policy-section">
          <h2><span className="icon">🔄</span> Chính Sách Đổi Trả</h2>
          <p>
            Nhằm đảm bảo quyền lợi tối đa cho khách hàng, Nhà Sách Hoàng Kim áp dụng 
            chính sách đổi trả linh hoạt và thuận tiện cho tất cả các đơn hàng.
          </p>
          
          <h3>1. Điều Kiện Đổi Trả</h3>
          <ul>
            <li>Sản phẩm còn nguyên vẹn, chưa qua sử dụng, không bị rách, bẩn hoặc hư hỏng</li>
            <li>Sản phẩm còn đầy đủ bao bì, nhãn mác và phiếu bảo hành (nếu có)</li>
            <li>Khách hàng còn giữ hóa đơn mua hàng hoặc xác nhận đơn hàng</li>
            <li>Yêu cầu đổi trả được thực hiện trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng</li>
          </ul>

          <h3>2. Các Trường Hợp Được Đổi Trả</h3>
          <ul>
            <li>Sản phẩm bị lỗi in ấn, trang bị hỏng, thiếu trang</li>
            <li>Giao sai sản phẩm so với đơn đặt hàng</li>
            <li>Sản phẩm bị hư hỏng trong quá trình vận chuyển</li>
            <li>Sách bị ướt, mốc, hoặc có khuyết tật từ nhà sản xuất</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2><span className="icon">📋</span> Quy Trình Đổi Trả</h2>
          <ul className="step-list">
            <li>
              <strong>Liên hệ hotline:</strong> Gọi 098.246.8686 hoặc nhắn tin qua Zalo để thông báo yêu cầu đổi trả
            </li>
            <li>
              <strong>Cung cấp thông tin:</strong> Mã đơn hàng, hình ảnh sản phẩm lỗi và mô tả tình trạng
            </li>
            <li>
              <strong>Gửi sản phẩm:</strong> Đóng gói sản phẩm và gửi về địa chỉ cửa hàng hoặc chờ nhân viên hỗ trợ lấy tại nhà
            </li>
            <li>
              <strong>Xác nhận và xử lý:</strong> Sau khi kiểm tra sản phẩm, chúng tôi sẽ liên hệ để tiến hành đổi/trả tiền
            </li>
          </ul>
        </div>

        <div className="policy-section">
          <h2><span className="icon">💰</span> Chính Sách Hoàn Tiền</h2>
          <p>Sau khi sản phẩm được xác nhận đủ điều kiện đổi trả, quý khách sẽ được hoàn tiền theo các hình thức:</p>
          <ul>
            <li><strong>Hoàn tiền qua tài khoản ngân hàng:</strong> Trong vòng 5-7 ngày làm việc</li>
            <li><strong>Hoàn tiền qua ví điện tử:</strong> Trong vòng 24-48 giờ</li>
            <li><strong>Đổi sang sản phẩm khác:</strong> Có giá trị tương đương hoặc cao hơn (bù thêm nếu cần)</li>
            <li><strong>Tích lũy thành điểm thưởng:</strong> Sử dụng cho các đơn hàng tiếp theo</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2><span className="icon">⚠️</span> Lưu Ý Quan Trọng</h2>
          <div className="condition-grid">
            <div className="condition-card">
              <div className="icon">📚</div>
              <h4>Sách Bìa Cứng</h4>
              <p>Chỉ đổi trả nếu có lỗi từ nhà sản xuất</p>
            </div>
            <div className="condition-card">
              <div className="icon">📖</div>
              <h4>Sách Đã Đọc</h4>
              <p>Không áp dụng đổi trả nếu đã có dấu hiệu sử dụng</p>
            </div>
            <div className="condition-card">
              <div className="icon">🎁</div>
              <h4>Sản Phẩm Khuyến Mãi</h4>
              <p>Áp dụng theo điều kiện riêng của từng chương trình</p>
            </div>
          </div>
        </div>

        <div className="policy-note">
          <p>
            <strong>📞 Liên hệ hỗ trợ:</strong> Nếu có bất kỳ thắc mắc nào về chính sách đổi trả, 
            vui lòng liên hệ hotline <strong>098.246.8686</strong> hoặc <Link to="/lien-he" style={{color: '#e65100'}}>liên hệ qua website</Link>.
          </p>
        </div>

        <div className="contact-box">
          <h3>Đội Ngũ Hỗ Trợ Khách Hàng</h3>
          <p>Hotline: <strong>098.246.8686</strong></p>
          <p>Email: hoangkim.bookstore@gmail.com</p>
          <p>Địa chỉ: 2b/23/154, đường Ngọc Hồi, phường Hoàng Liệt, quận Hoàng Mai, Hà Nội</p>
        </div>
      </div>
    </div>
  );
}
