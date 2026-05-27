import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import { Icon } from '../components/common/Icon';

const zones = [
  {
    area: 'Nội thành Hà Nội & TP. Hồ Chí Minh',
    time: '1 – 2 ngày làm việc',
    fee: '20.000đ',
    free: 'Miễn phí cho đơn từ 250.000đ',
  },
  {
    area: 'Các tỉnh, thành phố khác',
    time: '2 – 4 ngày làm việc',
    fee: '25.000đ',
    free: 'Miễn phí cho đơn từ 300.000đ',
  },
  {
    area: 'Khu vực xa, hải đảo',
    time: '4 – 7 ngày làm việc',
    fee: '35.000đ',
    free: 'Áp dụng phụ phí vận chuyển theo từng đơn',
  },
];

const steps = [
  { icon: 'package', title: 'Tiếp nhận đơn', desc: 'Đơn hàng được xác nhận và đóng gói trong vòng 24 giờ làm việc.' },
  { icon: 'truck', title: 'Bàn giao vận chuyển', desc: 'Đơn được bàn giao cho đối tác vận chuyển uy tín như GHN, GHTK, Viettel Post.' },
  { icon: 'location', title: 'Giao đến tận tay', desc: 'Shipper liên hệ trước khi giao và bạn có thể kiểm tra hàng ngoại quan trước khi nhận.' },
  { icon: 'check', title: 'Hoàn tất', desc: 'Đơn hàng được cập nhật trạng thái "Đã giao" trong tài khoản của bạn.' },
];

const faqs = [
  {
    q: 'Tôi có thể thay đổi địa chỉ giao hàng sau khi đặt không?',
    a: 'Nếu đơn chưa chuyển sang trạng thái "Đang giao", bạn vui lòng liên hệ hotline 1900 1234 trong vòng 2 giờ sau khi đặt để được hỗ trợ đổi địa chỉ.',
  },
  {
    q: 'Phí vận chuyển được tính như thế nào?',
    a: 'Phí ship được tính dựa trên khu vực giao hàng và tổng giá trị đơn. Hoàng Kim Books miễn phí giao hàng cho đơn hàng từ 300.000đ trên toàn quốc.',
  },
  {
    q: 'Nếu tôi không có ở nhà khi shipper đến thì sao?',
    a: 'Shipper sẽ liên hệ qua điện thoại đặt hàng và hẹn lại tối đa 2 lần. Nếu không liên lạc được, đơn sẽ được trả về kho và chúng tôi sẽ liên hệ để hỗ trợ giao lại.',
  },
  {
    q: 'Tôi có được kiểm tra hàng trước khi nhận không?',
    a: 'Bạn được kiểm tra ngoại quan (số lượng sách, tên sách, bao bì) trước khi thanh toán cho shipper. Việc bóc niêm phong/đọc nội dung được xem là đã đồng ý nhận hàng.',
  },
];

const ShippingPage = () => (
  <>
    <Breadcrumb items={[{ label: 'Vận chuyển & giao hàng' }]} />

    <section className="sp-hero">
      <div className="container sp-hero-inner">
        <span className="badge">Hỗ trợ khách hàng</span>
        <h1>Vận chuyển &amp; giao hàng</h1>
        <p>
          Hoàng Kim Books cam kết giao sách nhanh chóng, đóng gói cẩn thận và minh bạch về thời gian — chi phí trên toàn quốc.
        </p>
        <div className="sp-hero-stats">
          <div><strong>24h</strong><span>Xử lý đơn</span></div>
          <div><strong>1–4</strong><span>Ngày giao toàn quốc</span></div>
          <div><strong>≥ 300k</strong><span>Miễn phí ship</span></div>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-head text-center">
          <h2 className="section-title"><small>Bảng phí &amp; thời gian</small>Giao hàng theo khu vực</h2>
        </div>
        <div className="sp-table">
          <div className="sp-table-head">
            <span>Khu vực</span>
            <span>Thời gian dự kiến</span>
            <span>Phí ship</span>
            <span>Ưu đãi</span>
          </div>
          {zones.map((z) => (
            <div className="sp-table-row" key={z.area}>
              <span data-label="Khu vực"><strong>{z.area}</strong></span>
              <span data-label="Thời gian">{z.time}</span>
              <span data-label="Phí ship" className="sp-fee">{z.fee}</span>
              <span data-label="Ưu đãi" className="sp-free">{z.free}</span>
            </div>
          ))}
        </div>
        <p className="sp-note">
          <Icon name="shield" size={16} /> Thời gian giao có thể thay đổi vào các đợt khuyến mãi lớn (Tết, Black Friday). Chúng tôi sẽ chủ động thông báo nếu có chậm trễ.
        </p>
      </div>
    </section>

    <section className="section sp-process">
      <div className="container">
        <div className="section-head text-center">
          <h2 className="section-title"><small>Quy trình</small>Hành trình của một đơn hàng</h2>
        </div>
        <div className="sp-steps">
          {steps.map((s, i) => (
            <div className="sp-step" key={s.title}>
              <div className="sp-step-icon"><Icon name={s.icon} size={22} /></div>
              <span className="sp-step-no">Bước {i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="sp-policy-grid">
          <div className="sp-policy">
            <div className="sp-policy-icon"><Icon name="package" size={22} /></div>
            <h3>Đóng gói bảo vệ sách</h3>
            <p>Sách được bọc màng bóng kính, lót giấy chống ẩm và đóng hộp carton 3 lớp đối với đơn nhiều cuốn.</p>
          </div>
          <div className="sp-policy">
            <div className="sp-policy-icon"><Icon name="refresh" size={22} /></div>
            <h3>Đổi trả 7 ngày</h3>
            <p>Đổi miễn phí trong 7 ngày kể từ khi nhận với các lỗi do nhà phát hành / vận chuyển gây ra.</p>
          </div>
          <div className="sp-policy">
            <div className="sp-policy-icon"><Icon name="chat" size={22} /></div>
            <h3>Theo dõi đơn theo thời gian thực</h3>
            <p>Bạn có thể tra cứu trạng thái đơn ngay trong mục <Link to="/account/orders">"Đơn hàng của tôi"</Link>.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="section sp-faq-wrap">
      <div className="container">
        <div className="section-head text-center">
          <h2 className="section-title"><small>Câu hỏi thường gặp</small>Về vận chuyển</h2>
        </div>
        <div className="sp-faq">
          {faqs.map((f, i) => (
            <div className="sp-faq-item" key={i}>
              <h4>{f.q}</h4>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
        <div className="sp-cta">
          <p>Cần kiểm tra trạng thái đơn hoặc hỗ trợ giao hàng?</p>
          <div className="sp-cta-actions">
            <Link to="/account/orders" className="btn btn-primary">Đơn hàng của tôi</Link>
            <Link to="/contact" className="btn btn-secondary">Liên hệ Hoàng Kim</Link>
          </div>
        </div>
      </div>
    </section>

    <style>{`
      .sp-hero {
        background: linear-gradient(135deg, var(--color-primary-bg), var(--color-accent-bg));
        padding: 56px 0 48px;
        text-align: center;
      }
      .sp-hero-inner { max-width: 760px; margin: 0 auto; }
      .sp-hero h1 { font-family: var(--font-serif); font-size: 36px; margin: 12px 0 10px; }
      .sp-hero p { color: var(--color-text-soft); line-height: 1.7; }
      .sp-hero-stats {
        margin-top: 26px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
      .sp-hero-stats > div {
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        padding: 14px 12px;
      }
      .sp-hero-stats strong {
        display: block;
        font-family: var(--font-serif);
        font-size: 24px;
        color: var(--color-primary);
      }
      .sp-hero-stats span { font-size: 13px; color: var(--color-text-mute); }

      .sp-table {
        background: var(--color-surface);
        border: 1px solid var(--color-border-soft);
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
      }
      .sp-table-head, .sp-table-row {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
        gap: 16px;
        padding: 14px 22px;
      }
      .sp-table-head {
        background: var(--color-bg-alt);
        font-size: 12.5px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--color-text-mute);
        font-weight: 700;
      }
      .sp-table-row {
        border-top: 1px solid var(--color-border-soft);
        font-size: 14px;
        color: var(--color-text-soft);
      }
      .sp-table-row strong { color: var(--color-text); }
      .sp-fee { color: var(--color-primary); font-weight: 700; }
      .sp-free { color: var(--color-text-soft); font-style: italic; }
      .sp-note {
        margin-top: 18px;
        display: flex; align-items: center; gap: 8px;
        font-size: 13px;
        color: var(--color-text-mute);
      }
      .sp-note svg { color: var(--color-primary); }

      .sp-process { background: var(--color-bg-alt); }
      .sp-steps {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
      }
      .sp-step {
        background: var(--color-surface);
        padding: 22px 20px;
        border-radius: var(--radius-lg);
        text-align: left;
        border: 1px solid var(--color-border-soft);
      }
      .sp-step-icon {
        width: 46px; height: 46px;
        border-radius: 12px;
        background: var(--color-primary-bg);
        color: var(--color-primary);
        display: inline-flex; align-items: center; justify-content: center;
        margin-bottom: 12px;
      }
      .sp-step-no {
        display: inline-block;
        font-size: 11.5px;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 700;
        color: var(--color-text-mute);
        margin-bottom: 4px;
      }
      .sp-step h3 { font-family: var(--font-serif); font-size: 17px; margin: 0 0 6px; }
      .sp-step p { color: var(--color-text-soft); font-size: 13.5px; margin: 0; line-height: 1.6; }

      .sp-policy-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 18px;
      }
      .sp-policy {
        background: var(--color-surface);
        border: 1px solid var(--color-border-soft);
        border-radius: var(--radius-lg);
        padding: 24px;
      }
      .sp-policy-icon {
        width: 48px; height: 48px;
        border-radius: 12px;
        background: var(--color-accent-bg);
        color: var(--color-primary);
        display: inline-flex; align-items: center; justify-content: center;
        margin-bottom: 12px;
      }
      .sp-policy h3 { font-family: var(--font-serif); font-size: 18px; margin: 0 0 6px; }
      .sp-policy p { color: var(--color-text-soft); font-size: 14px; margin: 0; line-height: 1.65; }

      .sp-faq-wrap .container { max-width: 820px; }
      .sp-faq { display: flex; flex-direction: column; gap: 14px; }
      .sp-faq-item {
        background: var(--color-surface);
        border: 1px solid var(--color-border-soft);
        border-radius: var(--radius-md);
        padding: 18px 22px;
      }
      .sp-faq-item h4 { font-size: 15px; margin: 0 0 6px; }
      .sp-faq-item p { color: var(--color-text-soft); margin: 0; line-height: 1.65; font-size: 14px; }

      .sp-cta {
        margin-top: 32px;
        text-align: center;
        padding: 24px;
        border-radius: var(--radius-lg);
        background: var(--color-primary-bg);
      }
      .sp-cta p { font-weight: 600; margin: 0 0 14px; }
      .sp-cta-actions { display: inline-flex; gap: 10px; flex-wrap: wrap; justify-content: center; }

      @media (max-width: 900px) {
        .sp-hero-stats { grid-template-columns: 1fr; }
        .sp-table-head { display: none; }
        .sp-table-row {
          grid-template-columns: 1fr;
          gap: 6px;
          padding: 16px 18px;
        }
        .sp-table-row span::before {
          content: attr(data-label) ': ';
          font-weight: 700;
          color: var(--color-text-mute);
          margin-right: 4px;
        }
        .sp-steps, .sp-policy-grid { grid-template-columns: 1fr; }
      }
    `}</style>
  </>
);

export default ShippingPage;
