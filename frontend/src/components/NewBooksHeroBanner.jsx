import { Link } from 'react-router-dom'

/**
 * Banner Sách mới — ảnh Tết, full ngang
 * Cấu trúc: .page-hero > .page-hero__inner (grid 2 cột) giống SachHayHeroBanner
 */
export default function NewBooksHeroBanner() {
  return (
    <section className="page-hero new-books-hero" aria-labelledby="new-books-hero-title">
      <div className="page-hero__inner">
        <div className="new-books-hero__art" aria-hidden>
          <img
            src="/images/sach-moi-tet-banner.png"
            alt=""
            className="new-books-hero__img"
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <div className="new-books-hero__copy">
          <img src="/images/hoang-kim-icon.png" alt="Nhà sách Hoàng Kim" className="new-books-hero__logo" />
          <h2 id="new-books-hero-title" className="new-books-hero__title">
            Sách mới
          </h2>
          <p className="new-books-hero__sub">PHÁT HÀNH</p>
          <Link
            to="/sach-moi#sach-moi-danh-sach"
            className="new-books-hero__btn"
            aria-label="Xem danh sách sách mới phát hành"
          >
            Xem ngay
          </Link>
        </div>
      </div>
    </section>
  )
}
