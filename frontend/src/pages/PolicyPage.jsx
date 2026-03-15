import { Link } from 'react-router-dom'

export default function PolicyPage() {
  return (
    <>
      <div className="breadcrumb">
        <Link to="/">TRANG CHỦ</Link>
        <span className="breadcrumb__sep">»</span>
        <span>CHÍNH SÁCH BÁN HÀNG</span>
      </div>

      <div className="new-books-banner new-books-banner--image">
        <img src="/images/6.jpg" alt="Chính sách bán hàng" className="new-books-banner__img" />
      </div>

      <div className="main__content">
        <div className="policy-page">
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
