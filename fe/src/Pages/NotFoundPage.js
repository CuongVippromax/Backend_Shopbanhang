import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon';

const NotFoundPage = () => (
  <section className="section nf-section">
    <div className="container nf-inner">
      <div className="nf-art">404</div>
      <h1>Trang không tồn tại</h1>
      <p>Có thể đường dẫn đã thay đổi hoặc bạn đã nhập sai địa chỉ.</p>
      <div className="nf-actions">
        <Link to="/" className="btn btn-primary"><Icon name="home" size={14} /> Về trang chủ</Link>
        <Link to="/books" className="btn btn-secondary">Khám phá sách</Link>
      </div>
    </div>
    <style>{`
      .nf-section { display: flex; align-items: center; min-height: 60vh; }
      .nf-inner { text-align: center; max-width: 480px; margin: 0 auto; }
      .nf-art {
        font-family: var(--font-serif);
        font-size: 140px;
        font-weight: 700;
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
        -webkit-background-clip: text; background-clip: text; color: transparent;
        line-height: 1;
      }
      .nf-inner h1 { font-family: var(--font-serif); margin: 4px 0 10px; }
      .nf-inner p { color: var(--color-text-mute); margin: 0 0 22px; }
      .nf-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    `}</style>
  </section>
);

export default NotFoundPage;
