import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import { Icon } from '../components/common/Icon';

const methods = [
  {
    key: 'cod',
    icon: <Icon name="truck" size={26} />,
    title: 'Thanh toán khi nhận hàng (COD)',
    tagline: 'Nhận sách – Kiểm tra – Thanh toán bằng tiền mặt cho shipper.',
    steps: [
      'Đặt hàng và chọn phương thức "Thanh toán khi nhận hàng" tại bước Thanh toán.',
      'Nhân viên vận chuyển liên hệ trước khi giao trong khoảng 1–3 ngày làm việc.',
      'Bạn kiểm tra thông tin đơn hàng, tình trạng đóng gói trước khi thanh toán bằng tiền mặt.',
    ],
    notes: [
      'Áp dụng cho đơn hàng tối đa 5.000.000đ.',
      'Vui lòng giữ máy điện thoại để shipper liên hệ thuận tiện.',
      'Không hỗ trợ kiểm tra nội dung bên trong sách trước khi thanh toán (chỉ kiểm tra ngoại quan).',
    ],
  },
  {
    key: 'vnpay',
    image: '/image/vnpay.png',
    title: 'Thanh toán qua VNPay',
    tagline: 'Thẻ ATM nội địa · Visa / Master / JCB · QR Code · Ví VNPay-QR.',
    steps: [
      'Tại bước Thanh toán, chọn "Thanh toán VNPay" rồi nhấn Đặt hàng ngay.',
      'Hệ thống chuyển bạn đến cổng VNPay an toàn để chọn ngân hàng / phương thức.',
      'Sau khi giao dịch thành công, bạn được điều hướng về trang xác nhận của Hoàng Kim Books.',
    ],
    notes: [
      'Giao dịch được mã hoá theo chuẩn PCI DSS – Hoàng Kim không lưu trữ thông tin thẻ.',
      'Nếu giao dịch bị gián đoạn, bạn có thể quay lại đơn hàng để thanh toán lại.',
      'Hoàn tiền tự động về tài khoản gốc trong 3–7 ngày làm việc cho đơn được huỷ.',
    ],
  },
];

const faqs = [
  {
    q: 'Tôi có thể đổi phương thức thanh toán sau khi đặt hàng không?',
    a: 'Trong vòng 30 phút sau khi đặt và đơn chưa được xử lý, bạn vui lòng liên hệ hotline 1900 1234 để được hỗ trợ chuyển sang phương thức khác.',
  },
  {
    q: 'Thanh toán VNPay không thành công thì đơn hàng có bị huỷ không?',
    a: 'Đơn hàng vẫn được lưu ở trạng thái "Chưa thanh toán". Bạn có thể vào mục "Đơn hàng của tôi" để thanh toán lại trong vòng 24 giờ trước khi đơn tự huỷ.',
  },
  {
    q: 'Hoá đơn VAT được cấp như thế nào?',
    a: 'Hoá đơn điện tử được gửi vào email đặt hàng trong 1–2 ngày làm việc sau khi đơn hàng chuyển sang trạng thái "Đã thanh toán".',
  },
];

const PaymentMethodsPage = () => (
  <>
    <Breadcrumb items={[{ label: 'Phương thức thanh toán' }]} />

    <section className="pm-hero">
      <div className="container pm-hero-inner">
        <span className="badge">Hỗ trợ khách hàng</span>
        <h1>Phương thức thanh toán</h1>
        <p>
          Hoàng Kim Books hỗ trợ thanh toán linh hoạt, an toàn và minh bạch.
          Chọn phương thức phù hợp nhất với bạn ngay tại bước Thanh toán.
        </p>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="pm-grid">
          {methods.map((m) => (
            <article className="pm-card" key={m.key}>
              <div className="pm-card-head">
                <div className={`pm-icon pm-icon-${m.key}`}>
                  {m.image
                    ? <img src={m.image} alt={m.title} />
                    : m.icon}
                </div>
                <div>
                  <h2>{m.title}</h2>
                  <p className="pm-tagline">{m.tagline}</p>
                </div>
              </div>

              <div className="pm-section">
                <h4>Quy trình</h4>
                <ol className="pm-steps">
                  {m.steps.map((s, i) => (
                    <li key={i}><span className="pm-step-no">{i + 1}</span>{s}</li>
                  ))}
                </ol>
              </div>

              <div className="pm-section">
                <h4>Lưu ý</h4>
                <ul className="pm-notes">
                  {m.notes.map((n, i) => (
                    <li key={i}><Icon name="check" size={14} /><span>{n}</span></li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="section pm-safety">
      <div className="container">
        <div className="section-head text-center">
          <h2 className="section-title"><small>An toàn giao dịch</small>Cam kết của Hoàng Kim Books</h2>
        </div>
        <div className="safety-grid">
          <div className="safety-card">
            <div className="safety-icon"><Icon name="shield" size={22} /></div>
            <h3>Bảo mật chuẩn quốc tế</h3>
            <p>Mọi giao dịch trực tuyến đều được mã hoá SSL và tuân thủ tiêu chuẩn PCI DSS.</p>
          </div>
          <div className="safety-card">
            <div className="safety-icon"><Icon name="refresh" size={22} /></div>
            <h3>Hoàn tiền linh hoạt</h3>
            <p>Đơn hàng huỷ hợp lệ được hoàn lại 100% trong vòng 3–7 ngày làm việc.</p>
          </div>
          <div className="safety-card">
            <div className="safety-icon"><Icon name="phone" size={22} /></div>
            <h3>Hỗ trợ 7 ngày/tuần</h3>
            <p>Hotline 1900 1234 (8:00 – 21:00) và email hello@hoangkim.vn luôn sẵn sàng.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container pm-faq-wrap">
        <div className="section-head text-center">
          <h2 className="section-title"><small>Câu hỏi thường gặp</small>Về thanh toán</h2>
        </div>
        <div className="pm-faq">
          {faqs.map((f, i) => (
            <div className="pm-faq-item" key={i}>
              <h4>{f.q}</h4>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
        <div className="pm-cta">
          <p>Bạn cần thêm hỗ trợ về thanh toán?</p>
          <div className="pm-cta-actions">
            <Link to="/contact" className="btn btn-primary">Liên hệ Hoàng Kim</Link>
            <Link to="/faq" className="btn btn-secondary">Xem thêm câu hỏi</Link>
          </div>
        </div>
      </div>
    </section>

    <style>{`
      .pm-hero {
        background: linear-gradient(135deg, var(--color-primary-bg), var(--color-accent-bg));
        padding: 56px 0 48px;
        text-align: center;
      }
      .pm-hero-inner { max-width: 720px; margin: 0 auto; }
      .pm-hero h1 { font-family: var(--font-serif); font-size: 36px; margin: 12px 0 10px; }
      .pm-hero p { color: var(--color-text-soft); line-height: 1.7; }

      .pm-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
      }
      .pm-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border-soft);
        border-radius: var(--radius-lg);
        padding: 28px;
        box-shadow: var(--shadow-sm);
        display: flex; flex-direction: column; gap: 18px;
      }
      .pm-card-head { display: flex; align-items: flex-start; gap: 16px; }
      .pm-card-head h2 { font-family: var(--font-serif); font-size: 22px; margin: 0 0 4px; }
      .pm-tagline { color: var(--color-text-mute); font-size: 13.5px; margin: 0; }
      .pm-icon {
        width: 64px; height: 64px;
        border-radius: var(--radius-md);
        display: inline-flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .pm-icon-cod { background: var(--color-primary-bg); color: var(--color-primary); }
      .pm-icon-vnpay { background: #fff; border: 1px solid var(--color-border-soft); }
      .pm-icon img { width: 48px; height: 48px; object-fit: contain; }

      .pm-section h4 {
        font-size: 13px; text-transform: uppercase; letter-spacing: 1px;
        color: var(--color-text-mute); margin: 0 0 10px;
      }
      .pm-steps { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
      .pm-steps li { display: flex; gap: 10px; align-items: flex-start; color: var(--color-text-soft); line-height: 1.6; font-size: 14px; }
      .pm-step-no {
        flex-shrink: 0;
        width: 24px; height: 24px;
        border-radius: 50%;
        background: var(--color-primary);
        color: #fff;
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 700;
        margin-top: 1px;
      }
      .pm-notes { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
      .pm-notes li { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; color: var(--color-text-soft); }
      .pm-notes svg { color: var(--color-primary); margin-top: 4px; flex-shrink: 0; }

      .pm-safety { background: var(--color-bg-alt); }
      .safety-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
      .safety-card {
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        padding: 24px;
        text-align: center;
        border: 1px solid var(--color-border-soft);
      }
      .safety-icon {
        width: 52px; height: 52px;
        border-radius: 50%;
        background: var(--color-primary-bg);
        color: var(--color-primary);
        display: inline-flex; align-items: center; justify-content: center;
        margin-bottom: 12px;
      }
      .safety-card h3 { font-family: var(--font-serif); font-size: 17px; margin: 0 0 6px; }
      .safety-card p { color: var(--color-text-soft); font-size: 13.5px; margin: 0; line-height: 1.6; }

      .pm-faq-wrap { max-width: 820px; }
      .pm-faq { display: flex; flex-direction: column; gap: 14px; }
      .pm-faq-item {
        background: var(--color-surface);
        border: 1px solid var(--color-border-soft);
        border-radius: var(--radius-md);
        padding: 18px 22px;
      }
      .pm-faq-item h4 { font-size: 15px; margin: 0 0 6px; }
      .pm-faq-item p { color: var(--color-text-soft); margin: 0; line-height: 1.65; font-size: 14px; }

      .pm-cta {
        margin-top: 32px;
        text-align: center;
        padding: 24px;
        border-radius: var(--radius-lg);
        background: var(--color-primary-bg);
      }
      .pm-cta p { font-weight: 600; margin: 0 0 14px; }
      .pm-cta-actions { display: inline-flex; gap: 10px; flex-wrap: wrap; justify-content: center; }

      @media (max-width: 900px) {
        .pm-grid { grid-template-columns: 1fr; }
        .safety-grid { grid-template-columns: 1fr; }
      }
    `}</style>
  </>
);

export default PaymentMethodsPage;
