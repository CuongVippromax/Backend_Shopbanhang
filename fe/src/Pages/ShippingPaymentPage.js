import React from 'react';
import { Link } from 'react-router-dom';
import './ShippingPaymentPage.css';
import UserMenu from '../Components/UserMenu';
import { useCart } from '../context/CartContext';

export default function ShippingPaymentPage() {
  const { cartCount } = useCart();
  
  return (
    <div className="shipping-payment-page">
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
        <h1>Giao Nhận & Thanh Toán</h1>
        <p>Thông tin vận chuyển và hình thức thanh toán tại Nhà Sách Hoàng Kim</p>
      </div>

      <div className="shipping-content">
        <div className="shipping-section">
          <h2><span className="icon">🚚</span> Phương Thức Giao Hàng</h2>
          <p>
            Nhà Sách Hoàng Kim hợp tác với các đơn vị vận chuyển uy tín để đảm bảo 
            sách được giao đến tay khách hàng nhanh chóng và an toàn nhất.
          </p>
          
          <div className="shipping-methods">
            <div className="shipping-card recommended">
              <div className="icon">📦</div>
              <h4>Giao Hàng Tiêu Chuẩn</h4>
              <p className="time">Nhận hàng trong 2-4 ngày</p>
              <p className="price">
                <span className="free">Miễn phí</span> cho đơn từ 150.000₫
              </p>
              <p style={{fontSize: '13px', color: '#666', marginTop: '10px'}}>
                Phí 25.000₫ cho đơn dưới 150.000₫
              </p>
            </div>
            
            <div className="shipping-card">
              <div className="icon">⚡</div>
              <h4>Giao Hàng Nhanh</h4>
              <p className="time">Nhận hàng trong 1-2 ngày</p>
              <p className="price">35.000₫</p>
              <p style={{fontSize: '13px', color: '#666', marginTop: '10px'}}>
                Áp dụng cho các đơn hàng nội thành Hà Nội
              </p>
            </div>
            
            <div className="shipping-card">
              <div className="icon">🏃</div>
              <h4>Giao Hàng Hỏa Tốc</h4>
              <p className="time">Nhận hàng trong 4-6 giờ</p>
              <p className="price">50.000₫ - 70.000₫</p>
              <p style={{fontSize: '13px', color: '#666', marginTop: '10px'}}>
                Chỉ áp dụng khu vực nội thành Hà Nội
              </p>
            </div>
          </div>
        </div>

        <div className="shipping-section">
          <h2><span className="icon">💳</span> Hình Thức Thanh Toán</h2>
          <p>Chúng tôi cung cấp nhiều hình thức thanh toán linh hoạt cho khách hàng:</p>
          
          <div className="payment-methods">
            <div className="payment-card">
              <div className="icon">💵</div>
              <h4>Thanh Toán Khi Nhận Hàng (COD)</h4>
              <p>Trả tiền mặt khi nhận được sản phẩm</p>
              <span className="fee">Miễn phí</span>
            </div>
            
            <div className="payment-card">
              <div className="icon">🏦</div>
              <h4>Chuyển Khoản Ngân Hàng</h4>
              <p>Chuyển khoản trực tiếp qua internet banking</p>
              <span className="fee">Miễn phí</span>
            </div>
            
            <div className="payment-card">
              <div className="icon">💳</div>
              <h4>Thanh Toán VNPay</h4>
              <p>Thanh toán qua cổng VNPay với thẻ ATM/Visa/MasterCard</p>
              <span className="fee">Miễn phí</span>
            </div>
            
            <div className="payment-card">
              <div className="icon">📱</div>
              <h4>Ví Điện Tử</h4>
              <p>ZaloPay, Momo, VNPay Wallet</p>
              <span className="fee">Miễn phí</span>
            </div>
          </div>
        </div>

        <div className="shipping-section">
          <h2><span className="icon">📍</span> Khu Vực Giao Hàng</h2>
          <table className="shipping-table">
            <thead>
              <tr>
                <th>Khu Vực</th>
                <th>Phí Giao Hàng</th>
                <th>Thời Gian</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Nội thành Hà Nội</td>
                <td>Miễn phí (đơn ≥150k) / 25.000₫</td>
                <td>1-2 ngày</td>
              </tr>
              <tr>
                <td>Ngoại thành Hà Nội</td>
                <td>25.000₫ - 35.000₫</td>
                <td>2-3 ngày</td>
              </tr>
              <tr>
                <td>Các tỉnh phía Bắc</td>
                <td>30.000₫ - 40.000₫</td>
                <td>2-4 ngày</td>
              </tr>
              <tr>
                <td>Các tỉnh miền Trung</td>
                <td>35.000₫ - 45.000₫</td>
                <td>3-5 ngày</td>
              </tr>
              <tr>
                <td>Các tỉnh miền Nam</td>
                <td>40.000₫ - 50.000₫</td>
                <td>4-6 ngày</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="shipping-section">
          <h2><span className="icon">📋</span> Quy Trình Đặt Hàng</h2>
          <div className="shipping-timeline">
            <div className="timeline-item">
              <div className="dot">1</div>
              <div className="info">
                <h4>Chọn sản phẩm</h4>
                <p>Thêm sách vào giỏ hàng và kiểm tra thông tin</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="dot">2</div>
              <div className="info">
                <h4>Điền thông tin giao hàng</h4>
                <p>Nhập địa chỉ, số điện thoại và thông tin người nhận</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="dot">3</div>
              <div className="info">
                <h4>Chọn phương thức thanh toán</h4>
                <p> COD, chuyển khoản hoặc thanh toán online</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="dot">4</div>
              <div className="info">
                <h4>Xác nhận đơn hàng</h4>
                <p>Nhấn đặt hàng và chờ xác nhận từ cửa hàng</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="dot">5</div>
              <div className="info">
                <h4>Nhận hàng</h4>
                <p>Kiểm tra sản phẩm và thanh toán (nếu COD)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="shipping-section">
          <h2><span className="icon">⚠️</span> Lưu Ý Quan Trọng</h2>
          <ul>
            <li>Đơn hàng từ 150.000₫ trở lên sẽ được <strong>miễn phí giao hàng</strong> trên toàn quốc</li>
            <li>Thời gian giao hàng tính từ khi đơn được xác nhận thành công</li>
            <li>Khi nhận hàng, vui lòng <strong>kiểm tra kỹ</strong> sản phẩm trước khi ký xác nhận</li>
            <li>Nếu phát hiện hàng hóa bị hư hỏng, vui lòng <strong>liên hệ ngay</strong> với chúng tôi</li>
            <li>Đơn hàng được xử lý từ <strong>8:00 - 21:00</strong> hàng ngày</li>
            <li>Đơn hàng đặt sau 17:00 sẽ được xử lý vào ngày làm việc tiếp theo</li>
          </ul>
        </div>

        <div className="shipping-contact">
          <h3>Hỗ Trợ Vận Chuyển</h3>
          <p>Hotline: <strong>098.246.8686</strong></p>
          <p>Email: hoangkimbookstore@gmail.com</p>
          <p>Zalo: 098.246.8686</p>
          <p style={{marginTop: '15px'}}>
            <Link to="/lien-he" style={{color: 'white', textDecoration: 'underline'}}>
              Liên hệ để được hỗ trợ thêm
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
