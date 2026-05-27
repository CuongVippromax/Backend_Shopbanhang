import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/common/Icon';

const PaymentResultPage = () => {
  const [params] = useSearchParams();

  // VNPay callback params
  const vnpAmount = params.get('vnp_Amount');
  const vnpBankCode = params.get('vnp_BankCode');
  const vnpBankTranNo = params.get('vnp_BankTranNo');
  const vnpCardType = params.get('vnp_CardType');
  const vnpOrderInfo = params.get('vnp_OrderInfo');
  const vnpPayDate = params.get('vnp_PayDate');
  const vnpResponseCode = params.get('vnp_ResponseCode');
  const vnpTmnCode = params.get('vnp_TmnCode');
  const vnpTransactionNo = params.get('vnp_TransactionNo');
  const vnpTransactionStatus = params.get('vnp_TransactionStatus');
  const vnpTxnRef = params.get('vnp_TxnRef');

  // Generic params fallback
  const responseCode = params.get('code') || vnpResponseCode;
  const orderId = vnpTxnRef || params.get('orderId');

  const isSuccess = useMemo(() => {
    return vnpResponseCode === '00' || vnpTransactionStatus === '00' ||
           responseCode === '00' || responseCode === 'PAID' || responseCode === 'SUCCESS';
  }, [vnpResponseCode, vnpTransactionStatus, responseCode]);

  // Format amount from VNP (divide by 100 since VNP sends amount in cents)
  const formattedAmount = useMemo(() => {
    if (vnpAmount) {
      const amount = parseInt(vnpAmount) / 100;
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
    return null;
  }, [vnpAmount]);

  // Format VNPay date (YYYYMMDDHHmmss -> readable format)
  const formattedDate = useMemo(() => {
    if (vnpPayDate) {
      const year = vnpPayDate.substring(0, 4);
      const month = vnpPayDate.substring(4, 6);
      const day = vnpPayDate.substring(6, 8);
      const hour = vnpPayDate.substring(8, 10);
      const minute = vnpPayDate.substring(10, 12);
      const second = vnpPayDate.substring(12, 14);
      return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
    }
    return null;
  }, [vnpPayDate]);

  // Get response message from VNPay code
  const getResponseMessage = (code) => {
    const messages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, gian lận)',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ',
      '10': 'Giao dịch không thành công do: Thẻ/Tài khoản khách hàng chưa có giao dịch nào',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản bị khóa',
      '13': 'Giao dịch không thành công do: Nhập sai mật khẩu xác thực giao dịch',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản không đủ số dư',
      '65': 'Giao dịch không thành công do: Tài khoản đã vượt quá hạn mức',
      '75': 'Ngân hàng đang bảo trì',
      '79': 'Giao dịch không thành công do: Nhập sai mật khẩu thanh toán',
      '99': 'Lỗi không xác định',
    };
    return messages[code] || `Mã lỗi: ${code}`;
  };

  return (
    <section className="section">
      <div className="container">
        <div className={`pay-result page-enter ${isSuccess ? 'is-success' : 'is-fail'}`}>
          <div className="pay-icon">
            <Icon name={isSuccess ? 'check' : 'x'} size={40} />
          </div>

          <h1>
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán không thành công'}
          </h1>

          <p className="pay-message">
            {isSuccess
              ? 'Cảm ơn bạn đã đặt hàng tại Hoàng Kim Books. Chúng tôi sẽ liên hệ và giao hàng trong thời gian sớm nhất.'
              : getResponseMessage(vnpResponseCode || responseCode)}
          </p>

          {vnpTxnRef && (
            <div className="pay-info">
              <div className="pay-info-header">
                <span>Thông tin giao dịch</span>
              </div>
              <div className="pay-info-grid">
                {formattedAmount && (
                  <div className="pay-info-item">
                    <span className="pay-info-label">Số tiền</span>
                    <span className="pay-info-value pay-amount">{formattedAmount}</span>
                  </div>
                )}
                {vnpBankCode && (
                  <div className="pay-info-item">
                    <span className="pay-info-label">Ngân hàng</span>
                    <span className="pay-info-value">{vnpBankCode}</span>
                  </div>
                )}
                {vnpCardType && (
                  <div className="pay-info-item">
                    <span className="pay-info-label">Loại thẻ</span>
                    <span className="pay-info-value">{vnpCardType}</span>
                  </div>
                )}
                {vnpTransactionNo && (
                  <div className="pay-info-item">
                    <span className="pay-info-label">Mã giao dịch</span>
                    <span className="pay-info-value pay-code">{vnpTransactionNo}</span>
                  </div>
                )}
                {formattedDate && (
                  <div className="pay-info-item">
                    <span className="pay-info-label">Thời gian</span>
                    <span className="pay-info-value">{formattedDate}</span>
                  </div>
                )}
                <div className="pay-info-item">
                  <span className="pay-info-label">Mã đơn hàng</span>
                  <span className="pay-info-value pay-code">#{vnpTxnRef}</span>
                </div>
              </div>
            </div>
          )}

          <div className="pay-actions">
            {orderId && (
              <Link to={`/account/orders/${orderId}`} className="btn btn-primary">
                <Icon name="receipt" size={18} />
                Xem đơn hàng
              </Link>
            )}
            <Link to="/books" className="btn btn-secondary">
              <Icon name="book" size={18} />
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .pay-result {
          max-width: 540px;
          margin: 32px auto;
          padding: 48px 36px;
          text-align: center;
          background: var(--color-surface);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
        }
        .pay-icon {
          width: 96px; height: 96px;
          border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          color: #fff;
          margin-bottom: 24px;
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .is-success .pay-icon { background: linear-gradient(135deg, #4d7866 0%, #7fb5a0 100%); }
        .is-fail .pay-icon { background: linear-gradient(135deg, #b3563b 0%, #d4785f 100%); }
        .pay-result h1 {
          font-family: var(--font-serif);
          font-size: 28px;
          margin: 0 0 12px;
        }
        .pay-message {
          color: var(--color-text-soft);
          font-size: 15px;
          max-width: 400px;
          margin: 0 auto 28px;
          line-height: 1.6;
        }

        /* Info box */
        .pay-info {
          background: var(--color-bg);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
          margin-bottom: 28px;
          text-align: left;
        }
        .pay-info-header {
          padding-bottom: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid var(--color-border-soft);
        }
        .pay-info-header span {
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-soft);
        }
        .pay-info-grid {
          display: grid;
          gap: 12px;
        }
        .pay-info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pay-info-label {
          color: var(--color-text-mute);
          font-size: 13px;
        }
        .pay-info-value {
          font-weight: 600;
          font-size: 14px;
        }
        .pay-amount {
          color: var(--color-primary);
          font-size: 16px;
        }
        .pay-code {
          font-family: monospace;
          background: var(--color-bg-alt);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .pay-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .pay-actions .btn {
          min-width: 160px;
        }

        @media (max-width: 560px) {
          .pay-result { padding: 32px 20px; margin: 16px; }
          .pay-actions { flex-direction: column; }
          .pay-actions .btn { width: 100%; }
        }
      `}</style>
    </section>
  );
};

export default PaymentResultPage;
