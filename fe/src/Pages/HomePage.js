import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookApi, articleApi, unwrapPage } from '../api/shopApi';
import { Icon } from '../components/common/Icon';
import BookGrid from '../components/book/BookGrid';
import { formatDate, truncate, safeImage } from '../utils/format';

const benefits = [
  { icon: 'truck', title: 'Giao hàng tận nơi', sub: 'Toàn quốc — phí vận chuyển ưu đãi' },
  { icon: 'refresh', title: 'Đổi trả linh hoạt', sub: 'Trong vòng 7 ngày kể từ khi nhận' },
  { icon: 'shield', title: 'Sách chính hãng', sub: 'Cam kết nguồn gốc & chất lượng' },
  { icon: 'medal', title: 'Tích điểm thành viên', sub: 'Ưu đãi đặc biệt cho khách thân thiết' },
];

const heroBookFallback = [
  { bookName: 'Cảm hứng — Sống tích cực' },
  { bookName: 'Tri thức thời đại' },
  { bookName: 'Khám phá khoa học' },
];

const Hero = ({ heroBooks = [] }) => {
  const slots = [0, 1, 2].map((i) => heroBooks[i] || heroBookFallback[i]);
  return (
  <section className="hero">
    <div className="container hero-inner">
      <div className="hero-text">
        <span className="hero-eyebrow">
          <Icon name="sparkle" size={14} /> Tri thức mở cánh cửa tương lai
        </span>
        <h1 className="hero-title">
          Mỗi cuốn sách là một <span className="hero-accent">chuyến phiêu lưu</span> đang chờ bạn khám phá.
        </h1>
        <p className="hero-sub">
          Khám phá hàng ngàn đầu sách thuộc đủ thể loại — văn học, kinh tế, kỹ năng, thiếu nhi, ngoại ngữ — tại Hoàng Kim Books.
        </p>
        <div className="hero-actions">
          <Link to="/books" className="btn btn-primary btn-lg">
            Khám phá ngay <Icon name="arrow" size={16} />
          </Link>
          <Link to="/articles" className="btn btn-secondary btn-lg">
            Xem bài viết
          </Link>
        </div>
        <div className="hero-stats">
          <div><strong>10.000+</strong><span>Đầu sách</span></div>
          <div><strong>50+</strong><span>Nhà xuất bản</span></div>
          <div><strong>100k+</strong><span>Khách hàng</span></div>
        </div>
      </div>
      <div className="hero-art">
        <div className="hero-disc" />
        {slots.map((book, idx) => {
          const cls = ['hb-1', 'hb-2', 'hb-3'][idx];
          const linkTo = book?.bookId ? `/books/${book.bookId}` : '/books';
          return (
            <Link to={linkTo} key={book?.bookId || idx} className={`hero-book ${cls}`} title={book?.bookName}>
              <img
                className="hero-book-img"
                src={safeImage(book?.image, book?.bookName)}
                alt={book?.bookName || 'Hoàng Kim Books'}
                loading="lazy"
                onError={(e) => { e.currentTarget.src = safeImage(null, book?.bookName); }}
              />
            </Link>
          );
        })}
      </div>
    </div>
    <style>{`
      .hero {
        background: radial-gradient(circle at 20% 10%, #ecf3ef 0%, transparent 55%),
                    radial-gradient(circle at 90% 80%, #faf2dc 0%, transparent 60%),
                    var(--color-bg);
        padding: 56px 0 72px;
        position: relative;
        overflow: hidden;
      }
      .hero-inner {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 48px;
        align-items: center;
      }
      .hero-eyebrow {
        display: inline-flex; align-items: center; gap: 6px;
        background: var(--color-surface);
        color: var(--color-primary);
        padding: 6px 14px;
        border-radius: var(--radius-full);
        font-size: 12px;
        font-weight: 600;
        box-shadow: var(--shadow-xs);
        margin-bottom: 18px;
      }
      .hero-title {
        font-family: var(--font-serif);
        font-size: 48px;
        line-height: 1.1;
        margin: 0 0 20px;
        letter-spacing: -0.5px;
      }
      .hero-accent {
        background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .hero-sub {
        font-size: 17px;
        color: var(--color-text-soft);
        max-width: 540px;
        margin-bottom: 28px;
      }
      .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
      .hero-stats {
        display: flex; gap: 36px;
        margin-top: 36px;
        padding-top: 28px;
        border-top: 1px solid var(--color-border-soft);
      }
      .hero-stats > div { display: flex; flex-direction: column; }
      .hero-stats strong {
        font-family: var(--font-serif);
        font-size: 26px;
        color: var(--color-primary);
      }
      .hero-stats span { font-size: 12px; color: var(--color-text-mute); text-transform: uppercase; letter-spacing: 1.5px; }

      .hero-art {
        position: relative;
        height: 480px;
      }
      .hero-disc {
        position: absolute;
        top: 50%; left: 50%;
        width: 360px; height: 360px;
        margin: -180px 0 0 -180px;
        border-radius: 50%;
        background: linear-gradient(135deg, #d8e7df 0%, #faf2dc 100%);
        z-index: 0;
      }
      .hero-book {
        position: absolute;
        width: 160px; height: 220px;
        border-radius: 6px 14px 14px 6px;
        box-shadow: var(--shadow-lg);
        overflow: hidden;
        z-index: 2;
        background: var(--color-bg-alt);
        transition: transform var(--t-base), box-shadow var(--t-base);
      }
      .hero-book:hover {
        box-shadow: var(--shadow-lg), 0 12px 24px rgba(0,0,0,0.12);
      }
      .hero-book-img {
        width: 100%; height: 100%;
        object-fit: cover;
        display: block;
      }
      .hero-book::before {
        content: '';
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: 8px;
        background: rgba(0,0,0,0.18);
        z-index: 1;
      }
      .hb-1 { top: 30px; left: 60px; transform: rotate(-8deg); z-index: 3; }
      .hb-2 { top: 90px; left: 200px; transform: rotate(2deg); }
      .hb-3 { bottom: 30px; left: 110px; transform: rotate(7deg); }

      @media (max-width: 900px) {
        .hero { padding: 32px 0 44px; }
        .hero-inner { grid-template-columns: 1fr; gap: 28px; }
        .hero-title { font-size: 34px; }
        .hero-sub { font-size: 15px; }
        .hero-art { height: 320px; }
        .hero-disc { width: 260px; height: 260px; margin: -130px 0 0 -130px; }
        .hero-book { width: 120px; height: 170px; }
        .hb-1 { top: 20px; left: calc(50% - 130px); }
        .hb-2 { top: 60px; left: calc(50% - 20px); }
        .hb-3 { bottom: 10px; left: calc(50% - 90px); }
        .hero-stats { gap: 22px; margin-top: 24px; padding-top: 20px; }
        .hero-stats strong { font-size: 22px; }
      }
    `}</style>
  </section>
  );
};

const bannerImages = [
  '/image/1.png',
  '/image/2.png',
  '/image/3.png',
  '/image/4.png',
  '/image/5.png',
  '/image/6.png',
  '/image/7.jpg',
];

const BannerSlider = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = bannerImages.length;

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 3500);
    return () => clearInterval(timer);
  }, [paused, total]);

  const goTo = (idx) => setActive(((idx % total) + total) % total);

  return (
    <section className="banner-section">
      <div className="container">
        <div
          className="banner-slider"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="banner-track"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {bannerImages.map((src, idx) => (
              <div className="banner-slide" key={src} aria-hidden={idx !== active}>
                <img src={src} alt={`Banner ${idx + 1}`} loading={idx === 0 ? 'eager' : 'lazy'} />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="banner-nav banner-nav-prev"
            onClick={() => goTo(active - 1)}
            aria-label="Slide trước"
          >
            ‹
          </button>
          <button
            type="button"
            className="banner-nav banner-nav-next"
            onClick={() => goTo(active + 1)}
            aria-label="Slide tiếp theo"
          >
            ›
          </button>
          <div className="banner-dots">
            {bannerImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`banner-dot ${idx === active ? 'is-active' : ''}`}
                onClick={() => goTo(idx)}
                aria-label={`Đi đến slide ${idx + 1}`}
              />
            ))}
          </div>
          <div className="banner-progress" aria-hidden="true">
            <span
              className="banner-progress-bar"
              key={paused ? 'p' : active}
              style={{ animationPlayState: paused ? 'paused' : 'running' }}
            />
          </div>
        </div>
      </div>
      <style>{`
        .banner-section {
          padding: 28px 0 8px;
        }
        .banner-slider {
          position: relative;
          width: 100%;
          aspect-ratio: 21 / 9;
          max-height: 520px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          background: var(--color-bg-alt);
        }
        .banner-track {
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1);
          will-change: transform;
        }
        .banner-slide {
          flex: 0 0 100%;
          width: 100%;
          height: 100%;
          position: relative;
        }
        .banner-slide img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
          background: var(--color-bg-alt);
        }
        .banner-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px; height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.6);
          color: var(--color-text);
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          z-index: 5;
          transition: background var(--t-base), transform var(--t-base);
          display: flex; align-items: center; justify-content: center;
        }
        .banner-nav:hover { background: #fff; transform: translateY(-50%) scale(1.08); }
        .banner-nav-prev { left: 14px; }
        .banner-nav-next { right: 14px; }
        .banner-dots {
          position: absolute;
          left: 50%;
          bottom: 18px;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 5;
        }
        .banner-dot {
          width: 26px; height: 4px;
          border-radius: 4px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(0,0,0,0.08);
          padding: 0;
          cursor: pointer;
          transition: background var(--t-base), width var(--t-base);
        }
        .banner-dot.is-active { background: var(--color-primary); width: 38px; }

        .banner-progress {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 3px;
          background: rgba(0,0,0,0.08);
          z-index: 4;
          overflow: hidden;
        }
        .banner-progress-bar {
          display: block;
          height: 100%;
          width: 0;
          background: var(--color-primary);
          animation: bannerProgress 3500ms linear forwards;
        }
        @keyframes bannerProgress {
          from { width: 0; }
          to   { width: 100%; }
        }

        @media (max-width: 900px) {
          .banner-slider { aspect-ratio: 16 / 9; }
          .banner-nav { width: 34px; height: 34px; font-size: 20px; }
        }
      `}</style>
    </section>
  );
};

const Benefits = () => (
  <section className="benefits">
    <div className="container benefits-grid">
      {benefits.map((b) => (
        <div className="benefit-card" key={b.title}>
          <div className="benefit-icon"><Icon name={b.icon} size={24} /></div>
          <div>
            <strong>{b.title}</strong>
            <span>{b.sub}</span>
          </div>
        </div>
      ))}
    </div>
    <style>{`
      .benefits { padding: 40px 0 0; }
      .benefits-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }
      .benefit-card {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 18px 20px;
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border-soft);
      }
      .benefit-icon {
        width: 46px; height: 46px;
        border-radius: 12px;
        background: var(--color-primary-bg);
        color: var(--color-primary);
        display: inline-flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .benefit-card strong { display: block; font-size: 14px; color: var(--color-text); margin-bottom: 2px; }
      .benefit-card span { font-size: 12.5px; color: var(--color-text-mute); }
      @media (max-width: 900px) { .benefits-grid { grid-template-columns: repeat(2, 1fr); } }
    `}</style>
  </section>
);

const FlashSale = ({ books, loading }) => (
  <section className="section flash-section">
    <div className="container">
      <div className="section-head">
        <h2 className="section-title">
          <small>Ưu đãi hôm nay</small>
          Sách nổi bật & giảm giá
        </h2>
        <Link to="/books" className="section-link">Xem tất cả <Icon name="arrow" size={14} /></Link>
      </div>
      <BookGrid books={books} loading={loading} skeletonCount={10} />
    </div>
    <style>{`
      .flash-section {
        background: linear-gradient(180deg, transparent 0%, var(--color-bg-alt) 60%, transparent 100%);
      }
    `}</style>
  </section>
);

const FeaturedBooks = ({ books, loading }) => (
  <section className="section">
    <div className="container">
      <div className="section-head">
        <h2 className="section-title">
          <small>Bán chạy</small>
          Sách được yêu thích nhất
        </h2>
        <Link to="/books" className="section-link">Xem tất cả <Icon name="arrow" size={14} /></Link>
      </div>
      <BookGrid books={books} loading={loading} skeletonCount={10} />
    </div>
  </section>
);

const FeaturedArticles = ({ articles }) => {
  if (!articles || articles.length === 0) return null;
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">
            <small>Bài viết</small>
            Cảm hứng từ Hoàng Kim
          </h2>
          <Link to="/articles" className="section-link">Xem tất cả <Icon name="arrow" size={14} /></Link>
        </div>
        <div className="article-grid">
          {articles.slice(0, 3).map((a) => (
            <Link to={`/articles/${a.articleId}`} key={a.articleId} className="article-card">
              <div className="article-cover">
                <img
                  src={safeImage(a.image, a.title)}
                  alt={a.title}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = safeImage(null, a.title); }}
                />
              </div>
              <div className="article-body">
                {a.category && <span className="badge">{a.category}</span>}
                <h3>{a.title}</h3>
                <p>{truncate(a.summary || '', 120)}</p>
                <div className="article-meta">
                  <span>{a.authorName || 'Hoàng Kim'}</span>
                  <span>·</span>
                  <span>{formatDate(a.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        .article-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }
        .article-card {
          display: flex;
          flex-direction: column;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-soft);
          overflow: hidden;
          color: inherit;
          transition: transform var(--t-base), box-shadow var(--t-base);
        }
        .article-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
        .article-cover { aspect-ratio: 16/9; overflow: hidden; background: var(--color-bg-alt); }
        .article-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .article-card:hover .article-cover img { transform: scale(1.05); }
        .article-body { padding: 18px 20px 20px; }
        .article-body h3 {
          font-size: 17px;
          margin: 10px 0 8px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .article-body p {
          color: var(--color-text-soft);
          font-size: 13.5px;
          margin: 0 0 12px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .article-meta { font-size: 12px; color: var(--color-text-mute); display: flex; gap: 6px; }
        @media (max-width: 900px) { .article-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
};

const CTA = () => (
  <section className="cta-section">
    <div className="container cta-inner">
      <div>
        <h2>Đăng ký nhận thông tin sách mới</h2>
        <p>Khám phá những tựa sách mới nhất, ưu đãi đặc biệt và lời khuyên đọc sách hàng tuần.</p>
      </div>
      <form className="cta-form" onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="Nhập email của bạn..." required />
        <button type="submit" className="btn btn-accent">Đăng ký</button>
      </form>
    </div>
    <style>{`
      .cta-section {
        background: linear-gradient(135deg, #4d7866 0%, #2c3a33 100%);
        color: #fff;
        padding: 56px 0;
        margin-top: 32px;
      }
      .cta-inner {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 32px;
        align-items: center;
      }
      .cta-section h2 {
        color: #fff;
        font-family: var(--font-serif);
        font-size: 30px;
        margin-bottom: 8px;
      }
      .cta-section p { color: rgba(255,255,255,0.78); margin: 0; max-width: 480px; }
      .cta-form {
        display: flex;
        gap: 8px;
        background: rgba(255,255,255,0.1);
        padding: 6px;
        border-radius: var(--radius-full);
        min-width: 360px;
      }
      .cta-form input {
        flex: 1;
        background: transparent;
        border: 0;
        color: #fff;
        padding: 10px 18px;
        outline: none;
        font-size: 14px;
      }
      .cta-form input::placeholder { color: rgba(255,255,255,0.6); }
      @media (max-width: 700px) {
        .cta-inner { grid-template-columns: 1fr; text-align: center; }
        .cta-form { min-width: 0; width: 100%; }
      }
    `}</style>
  </section>
);

const HomePage = () => {
  const [flash, setFlash] = useState({ list: [], loading: true });
  const [featured, setFeatured] = useState({ list: [], loading: true });
  const [articles, setArticles] = useState([]);
  const [heroBooks, setHeroBooks] = useState([]);

  useEffect(() => {
    bookApi.getFlashSale(10)
      .then((resp) => setFlash({ list: unwrapPage(resp).items, loading: false }))
      .catch(() => setFlash({ list: [], loading: false }));

    bookApi.getRandom(10)
      .then((data) => setFeatured({ list: data || [], loading: false }))
      .catch(() => setFeatured({ list: [], loading: false }));

    bookApi.getRandom(3)
      .then((data) => setHeroBooks(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => setHeroBooks([]));

    articleApi.featured()
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]));
  }, []);

  return (
    <>
      <Hero heroBooks={heroBooks} />
      <BannerSlider />
      <Benefits />
      <FlashSale books={flash.list} loading={flash.loading} />
      <FeaturedBooks books={featured.list} loading={featured.loading} />
      <FeaturedArticles articles={articles} />
      <CTA />
    </>
  );
};

export default HomePage;
