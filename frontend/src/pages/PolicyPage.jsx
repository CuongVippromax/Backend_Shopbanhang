import { Link } from 'react-router-dom'

const policyHighlights = [
  {
    title: '100% chính hãng',
    description: 'Sản phẩm mới, có nguồn gốc rõ ràng và kiểm định chất lượng trước khi giao.'
  },
  {
    title: 'Đổi trả trong 7 ngày',
    description: 'Đổi trả nhanh chóng nếu sách bị lỗi in, hư hỏng hoặc không đúng mô tả.'
  },
  {
    title: 'Giao hàng 24h',
    description: 'Với đơn hàng nội thành, chúng tôi cam kết giao trong 24 giờ làm việc.'
  },
  {
    title: 'Tư vấn nhiệt tình',
    description: 'Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc về sản phẩm và đơn hàng.'
  }
]

export default function PolicyPage() {
  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb__sep">›</span>
        <span>Chính sách bán hàng</span>
      </div>

      <section className="page-hero policy-hero" aria-labelledby="policy-hero-title">
        <div className="page-hero__inner">
          <div className="policy-hero__art" aria-hidden>
            <img
              src="/images/6.jpg"
              alt=""
              className="policy-hero__img"
              decoding="async"
              fetchPriority="high"
            />
          </div>

          <div className="policy-hero__copy">
            <p className="policy-hero__eyebrow">CAM KẾT PHỤC VỤ</p>
            <h1 id="policy-hero-title" className="policy-hero__title">
              Chính sách bán hàng
            </h1>
            <p className="policy-hero__desc">
              Nhà sách Hoàng Kim luôn đặt quyền lợi của khách hàng lên hàng đầu. Mỗi chính sách đều
              được xây dựng để đảm bảo trải nghiệm mua sắm an tâm, nhanh chóng và minh bạch.
            </p>
          </div>
        </div>
      </section>

      <div className="main__content">
        <div className="policy-page">
          <div className="policy-highlights-grid">
            {policyHighlights.map((item) => (
              <article key={item.title} className="policy-highlight-card">
                <h3 className="policy-highlight-card__title">{item.title}</h3>
                <p className="policy-highlight-card__desc">{item.description}</p>
              </article>
            ))}
          </div>

          <h1 className="policy-page__title">Chính sách bán hàng</h1>

          <div className="policy-section">
            <h2>1. Chính sách giao hàng</h2>
            <p>Chúng tôi giao hàng toàn quốc với các phương thức:</p>
            <ul>
              <li>Giao hàng nhanh (2-4 giờ) cho nội thành</li>
              <li>Giao hàng tiêu chuẩn (3-5 ngày) cho các tỉnh thành</li>
              <li>Miễn phí giao hàng cho đơn hàng từ 300.000 VNĐ</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>2. Chính sách đổi trả</h2>
            <p>Hỗ trợ đổi trả trong vòng 7 ngày kể từ ngày nhận hàng với các điều kiện:</p>
            <ul>
              <li>Sản phẩm còn nguyên vẹn, chưa qua sử dụng</li>
              <li>Còn nguyên tem, nhãn mác</li>
              <li>Có hóa đơn mua hàng</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>3. Chính sách thanh toán</h2>
            <p>Chấp nhận các hình thức thanh toán:</p>
            <ul>
              <li>Tiền mặt khi nhận hàng (COD)</li>
              <li>Chuyển khoản ngân hàng</li>
              <li>Thanh toán qua QR Code</li>
              <li>Thanh toán online với cổng VNPay</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>4. Chương trình khách hàng thân thiết</h2>
            <p>Tích điểm đổi ưu đãi:</p>
            <ul>
              <li>Tích 1% giá trị đơn hàng vào tài khoản</li>
              <li>Đổi điểm lấy phiếu giảm giá</li>
              <li>Thành viên VIP được giảm giá 10% mãi mãi</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
