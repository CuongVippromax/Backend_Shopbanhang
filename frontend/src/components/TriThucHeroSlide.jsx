/**
 * Banner NXB Tri Thức — dựng bằng CSS + SVG (vector), không dùng ảnh raster → không bị mờ khi phóng to.
 */
function GoldCoin({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" width="48" height="48" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#ffc107" stroke="#c79100" strokeWidth="1.5" />
      <rect x="18" y="18" width="12" height="12" rx="1" fill="#4e342e" opacity="0.4" />
    </svg>
  )
}

function Sparkle({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="#ff5252"
        d="M12 2l1.2 4.2L17 8l-3.8 1.8L12 14l-1.2-4.2L7 8l3.8-1.8L12 2z"
      />
    </svg>
  )
}

function FlameLogo() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden>
      <circle cx="16" cy="16" r="15" fill="#d32f2f" />
      <path
        fill="#fff"
        d="M16 8c-2 4-4 6-4 9a4 4 0 108 0c0-3-2-5-4-9z"
      />
    </svg>
  )
}

export default function TriThucHeroSlide() {
  return (
    <div className="tri-thuc-slide" role="img" aria-label="Nhà xuất bản Tri Thức — Mở trang sách, mở vận may">
      <div className="tri-thuc-slide__bg" aria-hidden />
      <div className="tri-thuc-slide__glow" aria-hidden />

      <GoldCoin className="tri-thuc-slide__coin tri-thuc-slide__coin--1" />
      <GoldCoin className="tri-thuc-slide__coin tri-thuc-slide__coin--2" />
      <GoldCoin className="tri-thuc-slide__coin tri-thuc-slide__coin--3" />
      <GoldCoin className="tri-thuc-slide__coin tri-thuc-slide__coin--4" />
      <GoldCoin className="tri-thuc-slide__coin tri-thuc-slide__coin--5" />
      <GoldCoin className="tri-thuc-slide__coin tri-thuc-slide__coin--6" />

      <div className="tri-thuc-slide__inner">
        <div className="tri-thuc-slide__brand">
          <FlameLogo />
          <span>NHÀ XUẤT BẢN TRI THỨC</span>
        </div>

        <div className="tri-thuc-slide__headline-wrap">
          <Sparkle className="tri-thuc-slide__sparkle tri-thuc-slide__sparkle--l" />
          <div className="tri-thuc-slide__headline">
            <span className="tri-thuc-slide__line">MỞ TRANG SÁCH</span>
            <span className="tri-thuc-slide__line">MỞ VẬN MAY</span>
          </div>
          <Sparkle className="tri-thuc-slide__sparkle tri-thuc-slide__sparkle--r" />
        </div>

        <div className="tri-thuc-slide__books" aria-hidden>
          <div className="tri-thuc-slide__spine tri-thuc-slide__spine--g" />
          <div className="tri-thuc-slide__spine tri-thuc-slide__spine--p" />
          <div className="tri-thuc-slide__featured">
            <div className="tri-thuc-slide__featured-cover">
              <span className="tri-thuc-slide__featured-title">Cơ cấu trí khôn</span>
            </div>
          </div>
          <div className="tri-thuc-slide__spine tri-thuc-slide__spine--y" />
          <div className="tri-thuc-slide__spine tri-thuc-slide__spine--r" />
          <div className="tri-thuc-slide__spine tri-thuc-slide__spine--db" />
        </div>
      </div>
    </div>
  )
}
