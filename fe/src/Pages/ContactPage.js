import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ContactPage.css';
import MainHeader from '../Components/MainHeader';
import { getCategories } from '../api';

export default function ContactPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(data => {
      if (data && data.content) {
        setCategories(data.content);
      } else if (Array.isArray(data)) {
        setCategories(data);
      }
    }).catch(err => console.error('Error fetching categories:', err));
  }, []);
  return (
    <div className="contact-page">
      <MainHeader activePage="contact" />

      {/* Contact Content */}
      <main className="container contact-content-area">
        <div className="contact-layout">
          
          {/* Left Column: Banners */}
          <div className="contact-left">
            <img 
              src="/image/2.png" 
              alt="Banner Lãnh Đạo" 
              className="contact-banner"
            />
            <img 
              src="/image/3.png" 
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
            <p>📧 nhasachhoangkim@gmail.com</p>
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
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.categoryId}><Link to={`/cua-hang?categoryId=${cat.categoryId}`} style={{color: 'inherit', textDecoration: 'none'}}>{cat.categoryName}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Hotline Hỗ Trợ</h4>
            <p style={{marginBottom: '5px', fontSize: '13px', color: '#000'}}>Phương thức thanh toán</p>
            <div className="payment-icons" style={{display: 'flex', gap: '10px', fontSize: '24px', letterSpacing: '0'}}>
               💵 <img src="/image/vnpay.png" alt="VNPay" style={{width: '40px', height: 'auto'}} /> 🏦
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
