import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import { Icon } from '../components/common/Icon';

const values = [
  { icon: 'book', title: 'Tri thức trước tiên', desc: 'Chọn lọc sách chất lượng, đa dạng thể loại, phục vụ mọi lứa tuổi.' },
  { icon: 'shield', title: 'Uy tín & chính hãng', desc: 'Liên kết trực tiếp với NXB và đơn vị phát hành, cam kết hàng thật.' },
  { icon: 'medal', title: 'Khách hàng là trung tâm', desc: 'Hỗ trợ tận tâm, đổi trả nhanh chóng và chăm sóc dài hạn.' },
  { icon: 'truck', title: 'Giao hàng nhanh chóng', desc: 'Hệ thống vận chuyển toàn quốc, thời gian giao nhanh, đảm bảo an toàn.' },
];

const AboutPage = () => (
  <>
    <Breadcrumb items={[{ label: 'Về chúng tôi' }]} />
    <section className="about-hero">
      <div className="container about-hero-inner">
        <span className="badge">Câu chuyện của chúng tôi</span>
        <h1>Hành trình lan toả tri thức của <span className="hl">Hoàng Kim Books</span></h1>
        <p>
          Bắt đầu từ năm 2010, Hoàng Kim Books đặt sứ mệnh trở thành nơi mỗi cuốn sách tìm được người đọc tri kỷ —
          góp phần xây dựng một cộng đồng yêu sách, ham học hỏi và không ngừng phát triển bản thân.
        </p>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="about-grid">
          <div>
            <h2 className="section-title"><small>Giới thiệu</small>Về Hoàng Kim Books</h2>
            <p>
              Hoàng Kim Books là một nhà sách trực tuyến — nơi chúng tôi tuyển chọn kỹ lưỡng hàng nghìn đầu sách thuộc đủ thể loại:
              văn học kinh điển, kinh tế, kỹ năng sống, ngoại ngữ, sách thiếu nhi…
            </p>
            <p>
              Với đội ngũ giàu kinh nghiệm, chúng tôi tin rằng mỗi cuốn sách là một người bạn đồng hành. Vì thế, mục tiêu của chúng tôi
              không chỉ là bán sách — mà là <strong>kết nối người đọc với những giá trị bền vững</strong> mà mỗi tác phẩm mang lại.
            </p>
            <div className="about-actions">
              <Link to="/books" className="btn btn-primary">Khám phá sách</Link>
              <Link to="/contact" className="btn btn-secondary">Liên hệ chúng tôi</Link>
            </div>
          </div>
          <div className="about-stats">
            <div><strong>10,000+</strong><span>Đầu sách</span></div>
            <div><strong>15</strong><span>Năm phục vụ</span></div>
            <div><strong>100k+</strong><span>Khách hàng tin tưởng</span></div>
            <div><strong>50+</strong><span>NXB hợp tác</span></div>
          </div>
        </div>
      </div>
    </section>

    <section className="section about-values">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title"><small>Giá trị</small>Điều chúng tôi tin tưởng</h2>
        </div>
        <div className="values-grid">
          {values.map((v) => (
            <div className="value-card" key={v.title}>
              <div className="value-icon"><Icon name={v.icon} size={24} /></div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <style>{`
      .about-hero {
        background: linear-gradient(135deg, var(--color-primary-bg), var(--color-accent-bg));
        padding: 64px 0;
        text-align: center;
      }
      .about-hero-inner { max-width: 760px; margin: 0 auto; }
      .about-hero h1 {
        font-family: var(--font-serif);
        font-size: 44px;
        line-height: 1.2;
        margin: 14px 0 14px;
      }
      .about-hero .hl {
        background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      .about-hero p { color: var(--color-text-soft); font-size: 16.5px; }

      .about-grid {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 48px;
        align-items: center;
      }
      .about-grid p { color: var(--color-text-soft); line-height: 1.7; margin-bottom: 14px; }
      .about-actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
      .about-stats {
        display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
      }
      .about-stats > div {
        padding: 28px 22px;
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border-soft);
        text-align: center;
      }
      .about-stats strong {
        display: block;
        font-family: var(--font-serif);
        font-size: 28px;
        color: var(--color-primary);
      }
      .about-stats span { color: var(--color-text-mute); font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; }

      .about-values { background: var(--color-bg-alt); }
      .values-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
      .value-card {
        padding: 28px 22px;
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border-soft);
      }
      .value-icon {
        width: 52px; height: 52px;
        border-radius: 14px;
        background: var(--color-primary-bg);
        color: var(--color-primary);
        display: inline-flex; align-items: center; justify-content: center;
        margin-bottom: 14px;
      }
      .value-card h3 { font-size: 16px; margin: 0 0 6px; }
      .value-card p { color: var(--color-text-soft); margin: 0; font-size: 14px; }

      @media (max-width: 900px) {
        .about-hero h1 { font-size: 32px; }
        .about-grid { grid-template-columns: 1fr; gap: 28px; }
        .values-grid { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 540px) {
        .values-grid { grid-template-columns: 1fr; }
      }
    `}</style>
  </>
);

export default AboutPage;
