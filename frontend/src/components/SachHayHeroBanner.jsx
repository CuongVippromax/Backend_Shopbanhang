import { Link } from 'react-router-dom'

/**
 * Banner Sách hay — ảnh nền gradient tím/cam, text nổi bật
 * Cấu trúc: .page-hero > .page-hero__inner (grid 2 cột) giống NewBooksHeroBanner
 */
export default function SachHayHeroBanner() {
  return (
    <section className="page-hero sach-hay-hero" aria-labelledby="sach-hay-hero-title">
      <div className="page-hero__inner">
        <div className="sach-hay-hero__art" aria-hidden>
          <div className="sach-hay-hero__gradient" />
          <div className="sach-hay-hero__shapes">
            <div className="sach-hay-hero__shape sach-hay-hero__shape--1" />
            <div className="sach-hay-hero__shape sach-hay-hero__shape--2" />
            <div className="sach-hay-hero__shape sach-hay-hero__shape--3" />
            <div className="sach-hay-hero__shape sach-hay-hero__shape--4" />
          </div>
          <svg
            className="sach-hay-hero__icon"
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="sach-hay-book-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff8a65" />
                <stop offset="100%" stopColor="#e64a19" />
              </linearGradient>
              <linearGradient id="sach-hay-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffd54f" />
                <stop offset="100%" stopColor="#ffb300" />
              </linearGradient>
            </defs>
            <rect x="20" y="35" width="55" height="70" rx="4" fill="url(#sach-hay-book-grad)" />
            <rect x="30" y="25" width="55" height="70" rx="4" fill="#fff3e0" stroke="#ffcc80" strokeWidth="2" />
            <rect x="36" y="38" width="40" height="4" rx="1" fill="#ffb74d" />
            <rect x="36" y="48" width="30" height="3" rx="1" fill="#bdbdbd" />
            <rect x="36" y="56" width="35" height="3" rx="1" fill="#bdbdbd" />
            <rect x="36" y="64" width="25" height="3" rx="1" fill="#bdbdbd" />
            <polygon points="85,20 88,30 98,30 90,37 93,47 85,41 77,47 80,37 72,30 82,30" fill="url(#sach-hay-star-grad)" />
            <polygon points="95,55 97,62 104,62 98,67 100,74 95,70 90,74 92,67 86,62 93,62" fill="#fff59d" opacity="0.8" />
          </svg>
        </div>

        <div className="sach-hay-hero__copy">
          <p className="sach-hay-hero__eyebrow">NHÀ SÁCH HOÀNG KIM</p>
          <h2 id="sach-hay-hero-title" className="sach-hay-hero__title">
            Sách hay
          </h2>
          <p className="sach-hay-hero__sub">KHUYÊN ĐỌC</p>
          <p className="sach-hay-hero__desc">Những tác phẩm best-seller được độc giả yêu thích nhất</p>
          <Link
            to="/sach-hay#sach-hay-danh-sach"
            className="sach-hay-hero__btn"
            aria-label="Xem danh sách sách hay"
          >
            Khám phá ngay
          </Link>
        </div>
      </div>
    </section>
  )
}
