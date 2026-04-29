import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import './VNPayCallbackPage.css';
import UserMenu from '../Components/UserMenu';
import { useCart } from '../context/CartContext';

export default function VNPayCallbackPage() {
  const { cartCount } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);

  const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
  const vnp_TxnRef = searchParams.get('vnp_TxnRef');
  const vnp_Amount = searchParams.get('vnp_Amount');
  const vnp_BankTranNo = searchParams.get('vnp_BankTranNo');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/v1/payment/vn-pay-callback?${searchParams.toString()}`
        );
        const data = await response.json();

        setPaymentResult({
          success: vnp_ResponseCode === '00',
          responseCode: vnp_ResponseCode,
          orderId: vnp_TxnRef,
          amount: vnp_Amount ? (parseInt(vnp_Amount) / 100).toLocaleString('vi-VN') + ' ₫' : null,
          bankTranNo: vnp_BankTranNo,
          message: data.message || (vnp_ResponseCode === '00' ? 'Thanh toán thành công!' : 'Thanh toán thất bại!')
        });
      } catch (error) {
        console.error('Error verifying payment:', error);
        setPaymentResult({
          success: vnp_ResponseCode === '00',
          responseCode: vnp_ResponseCode,
          orderId: vnp_TxnRef,
          message: vnp_ResponseCode === '00' ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const formatPrice = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  if (loading) {
    return (
      <div className="vnpay-callback-page">
        <div className="vnpay-callback-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang xử lý kết quả thanh toán...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vnpay-callback-page">
      {/* Main Header */}
      <header className="main-header">
        <div className="container header-inner">
          <div className="logo-area">
            <Link to="/" style={{display: 'flex', alignItems: 'center', textDecoration: 'none'}}>
              <img src="/image/logo-hoang-kim.jpg" alt="Logo Hoàng Kim" className="logo-img" style={{height: '70px', objectFit: 'contain'}} />
            </Link>
          </div>
          <div className="cart-area">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Callback Content */}
      <main className="vnpay-callback-container">
        <div className={`result-card ${paymentResult?.success ? 'success' : 'failed'}`}>
          <div className="result-icon">
            {paymentResult?.success ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
            )}
          </div>

          <h1>{paymentResult?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}</h1>

          <p className="result-message">
            {paymentResult?.success
              ? 'Cảm ơn bạn đã đặt hàng tại Nhà Sách Hoàng Kim. Đơn hàng của bạn đang được xử lý.'
              : 'Rất tiếc, thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.'}
          </p>

          <div className="payment-details">
            <div className="detail-row">
              <span className="detail-label">Mã đơn hàng</span>
              <span className="detail-value order-id">#{paymentResult?.orderId}</span>
            </div>
            {paymentResult?.amount && (
              <div className="detail-row">
                <span className="detail-label">Số tiền thanh toán</span>
                <span className="detail-value amount">{paymentResult.amount}</span>
              </div>
            )}
            {paymentResult?.bankTranNo && (
              <div className="detail-row">
                <span className="detail-label">Mã giao dịch ngân hàng</span>
                <span className="detail-value">{paymentResult.bankTranNo}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Mã phản hồi</span>
              <span className="detail-value response-code">{paymentResult?.responseCode}</span>
            </div>
          </div>

          <div className="result-actions">
            {paymentResult?.success ? (
              <>
                <Link to="/don-hang" className="btn btn-secondary">
                  Xem đơn hàng của tôi
                </Link>
                <Link to="/cua-hang" className="btn btn-secondary">
                  Tiếp tục mua sắm
                </Link>
              </>
            ) : (
              <>
                <Link to="/thanh-toan" className="btn btn-primary">
                  Thử lại thanh toán
                </Link>
                <Link to="/gio-hang" className="btn btn-secondary">
                  Quay lại giỏ hàng
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="notice-box">
          <h3>Lưu ý</h3>
          <ul>
            {paymentResult?.success ? (
              <>
                <li>Bạn sẽ nhận được email xác nhận đơn hàng trong vài phút.</li>
                <li>Đơn hàng sẽ được xử lý và giao hàng trong 2-5 ngày làm việc.</li>
                <li>Bạn có thể theo dõi trạng thái đơn hàng tại mục "Đơn hàng của tôi".</li>
              </>
            ) : (
              <>
                <li>Vui lòng kiểm tra số dư tài khoản trước khi thử lại.</li>
                <li>Nếu đã bị trừ tiền, vui lòng liên hệ hotline 1900 1234 để được hỗ trợ.</li>
                <li>Đơn hàng không thành công sẽ không được tạo.</li>
              </>
            )}
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container footer-grid">
          <div className="footer-col">
            <h3 className="footer-logo">Nhà Sách Hoàng Kim</h3>
            <p>📧 Nhà Sách Hoàng Kim</p>
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
