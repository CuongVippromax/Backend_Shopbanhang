import { Link } from 'react-router-dom'

/**
 * Banner Truyện tranh & Thiếu nhi — form: nền gradient + lưới, badge MUA SÁCH ONLINE,
 * tiêu đề trắng in đậm, hàng bìa sách xếp quạt 3D
 * @param {Array}  books  — danh sách sách (có .imageUrl)
 */
export default function ComicKidsHeroBanner({ books = [] }) {
  const coverBooks = books.slice(0, 8)

  return (
    <section
      className="page-hero comic-kids-hero comic-kids-hero--promo"
      aria-labelledby="comic-kids-hero-title"
    >
      <div className="comic-kids-hero__bg" aria-hidden />
      <svg
        className="comic-kids-hero__mesh"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <pattern id="comicKidsMesh" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M0 28h56M28 0v56" stroke="#fff" strokeWidth="0.6" opacity="0.11" />
            <path d="M0 0l56 56M56 0L0 56" stroke="#fff" strokeWidth="0.35" opacity="0.06" />
            <circle cx="28" cy="28" r="1.2" fill="#fff" opacity="0.18" />
          </pattern>
          <radialGradient id="comicKidsGlow" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.14" />
            <stop offset="55%" stopColor="#fff" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#comicKidsMesh)" />
        <rect width="100%" height="100%" fill="url(#comicKidsGlow)" />
      </svg>
      <div className="comic-kids-hero__bokeh" aria-hidden>
        <span className="comic-kids-hero__bokeh-dot comic-kids-hero__bokeh-dot--1" />
        <span className="comic-kids-hero__bokeh-dot comic-kids-hero__bokeh-dot--2" />
        <span className="comic-kids-hero__bokeh-dot comic-kids-hero__bokeh-dot--3" />
        <span className="comic-kids-hero__bokeh-dot comic-kids-hero__bokeh-dot--4" />
      </div>

      <div className="comic-kids-hero__shell">
        <Link
          to="/truyen-tranh-thieu-nhi#truyen-danh-sach"
          className="comic-kids-hero__badge"
        >
          Mua sách online
        </Link>

        <h2 id="comic-kids-hero-title" className="comic-kids-hero__headline">
          Những cuốn truyện tranh hữu ích dành cho các bé thơ
        </h2>

        {coverBooks.length > 0 ? (
          <div className="comic-kids-hero__covers" aria-label="Bìa sách tiêu biểu">
            {coverBooks.map((book, index) => (
              <div
                key={book.bookId ?? index}
                className="comic-kids-hero__cover-wrap"
              >
                <div className="comic-kids-hero__cover">
                  {book.image ? (
                    <img
                      src={book.image}
                      alt={book.bookName ?? book.title ?? ''}
                      className="comic-kids-hero__cover-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="comic-kids-hero__cover-placeholder" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="comic-kids-hero__covers comic-kids-hero__covers--empty" aria-hidden>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="comic-kids-hero__cover-wrap">
                <div className="comic-kids-hero__cover">
                  <div className="comic-kids-hero__cover-placeholder" />
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/truyen-tranh-thieu-nhi#truyen-danh-sach"
          className="comic-kids-hero__cta"
        >
          Xem danh sách sách
        </Link>
      </div>
    </section>
  )
}
