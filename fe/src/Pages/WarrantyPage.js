import React from 'react';
import { Link } from 'react-router-dom';
import './WarrantyPage.css';
import UserMenu from '../Components/UserMenu';
import { useCart } from '../context/CartContext';

export default function WarrantyPage() {
  const { cartCount } = useCart();
  
  return (
    <div className="warranty-page">
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
        <h1>Quy Định Bảo Hành</h1>
        <p>Cam kết chất lượng sản phẩm từ Nhà Sách Hoàng Kim</p>
      </div>

      <div className="warranty-content">
        <div className="warranty-section">
          <h2><span className="icon">🛡️</span> Chính Sách Bảo Hành</h2>
          <p>
            Nhà Sách Hoàng Kim cam kết cung cấp sản phẩm chất lượng tốt nhất cho khách hàng.
            Tất cả các sản phẩm đều được kiểm tra kỹ lưỡng trước khi giao hàng. Chúng tôi
            áp dụng chính sách bảo hành để đảm bảo quyền lợi của khách hàng.
          </p>
          
          <h3>1. Thời Gian Bảo Hành</h3>
          <table className="warranty-table">
            <thead>
              <tr>
                <th>Loại Sản Phẩm</th>
                <th>Thời Gian Bảo Hành</th>
                <th>Phạm Vi Bảo Hành</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sách bìa cứng cao cấp</td>
                <td>12 tháng</td>
                <td>Lỗi in ấn, rơi rụng trang</td>
              </tr>
              <tr>
                <td>Sách bìa mềm</td>
                <td>7 ngày</td>
                <td>Lỗi từ nhà sản xuất</td>
              </tr>
              <tr>
                <td>Sách đặc biệt (sưu tầm)</td>
                <td>6 tháng</td>
                <td>Bảo quản đặc biệt</td>
              </tr>
              <tr>
                <td>Dụng cụ học tập</td>
                <td>3 tháng</td>
                <td>Lỗi kỹ thuật</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="warranty-section">
          <h2><span className="icon">✅</span> Điều Kiện Bảo Hành</h2>
          <p>Để được bảo hành, sản phẩm cần đáp ứng các điều kiện sau:</p>
          <ul className="shield-list">
            <li>
              <span className="icon">📦</span>
              <div>
                <strong>Còn trong thời gian bảo hành</strong>
                <span>Theo bảng thời gian quy định</span>
              </div>
            </li>
            <li>
              <span className="icon">🧾</span>
              <div>
                <strong>Có hóa đơn mua hàng</strong>
                <span>Hoặc xác nhận đơn hàng hợp lệ</span>
              </div>
            </li>
            <li>
              <span className="icon">📷</span>
              <div>
                <strong>Lỗi từ nhà sản xuất</strong>
                <span>Không áp dụng với lỗi do người dùng</span>
              </div>
            </li>
            <li>
              <span className="icon">🏷️</span>
              <div>
                <strong>Còn nguyên nhãn mác</strong>
                <span>Bao bì sản phẩm còn đầy đủ</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="warranty-section">
          <h2><span className="icon">❌</span> Trường Hợp Không Được Bảo Hành</h2>
          <ul>
            <li>Sản phẩm bị hư hỏng do sử dụng không đúng cách hoặc bảo quản không đúng</li>
            <li>Sản phẩm bị rách, ướt, mốc do tác động của môi trường bên ngoài</li>
            <li>Sản phẩm đã qua sửa chữa hoặc can thiệp bởi bên thứ ba</li>
            <li>Sản phẩm bị trầy xước, gãy, biến dạng do va đập</li>
            <li>Sản phẩm trong chương trình khuyến mãi đặc biệt có ghi chú riêng</li>
            <li>Hết thời hạn bảo hành ghi trên phiếu</li>
          </ul>
        </div>

        <div className="warranty-section">
          <h2><span className="icon">🔧</span> Quy Trình Bảo Hành</h2>
          <ul className="step-list">
            <li>
              <strong>Liên hệ hỗ trợ:</strong> Gọi hotline 098.246.8686 hoặc nhắn tin qua Zalo
            </li>
            <li>
              <strong>Cung cấp thông tin:</strong> Mã đơn hàng, hình ảnh sản phẩm, mô tả lỗi
            </li>
            <li>
              <strong>Kiểm tra và xác nhận:</strong> Nhân viên kiểm tra và xác nhận điều kiện bảo hành
            </li>
            <li>
              <strong>Xử lý bảo hành:</strong> Đổi sản phẩm mới hoặc hoàn tiền theo yêu cầu
            </li>
          </ul>
        </div>

        <div className="warranty-section">
          <h2><span className="icon">📝</span> Lưu Ý Khi Sử Dụng</h2>
          <ul>
            <li>Bảo quản sách nơi khô ráo, tránh ánh nắng trực tiếp và độ ẩm cao</li>
            <li>Không để sách tiếp xúc với nước, hóa chất hoặc nhiệt độ cao</li>
            <li>Sử dụng bookmark thay vì gấp trang sách</li>
            <li>Đọc sách với tay sạch, tránh dầu mỡ và thực phẩm</li>
            <li>Giữ nguyên bao bì và nhãn mác trong thời gian bảo hành</li>
          </ul>
        </div>

        <div className="warranty-contact">
          <h3>Liên Hệ Bảo Hành</h3>
          <p>Hotline: <strong>098.246.8686</strong></p>
          <p>Email: hoangkim.bookstore@gmail.com</p>
          <p>Giờ làm việc: 8:00 - 21:00 (Thứ 2 - Chủ nhật)</p>
          <p style={{marginTop: '15px'}}>
            <Link to="/lien-he" style={{color: 'white', textDecoration: 'underline'}}>
              Liên hệ ngay để được hỗ trợ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
