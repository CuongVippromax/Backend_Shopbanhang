import { Link } from 'react-router-dom'

/**
 * Banner Sách hay — cùng layout/phong cách trang Sách mới: nền kem, ảnh trái, chữ đỏ + nút đỏ
 */
export default function SachHayHeroBanner() {
  return (
    <section className="page-hero sach-hay-hero" aria-labelledby="sach-hay-hero-title">
      <div className="page-hero__inner">
        <div className="sach-hay-hero__art" aria-hidden>
          <img
            src="/images/sach-hay-banner.png"
            alt=""
            className="sach-hay-hero__img"
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <div className="sach-hay-hero__copy">
          <p className="sach-hay-hero__eyebrow">NHÀ SÁCH HOÀNG KIM</p>
          <h2 id="sach-hay-hero-title" className="sach-hay-hero__title">
            Sách hay
          </h2>
          <p className="sach-hay-hero__sub">KHUYẾN ĐỌC</p>
          <Link
            to="/sach-hay#sach-hay-danh-sach"
            className="sach-hay-hero__btn"
            aria-label="Xem danh sách sách hay"
          >
            Xem ngay
          </Link>
        </div>
      </div>
    </section>
  )
}
