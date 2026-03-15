import { Link } from 'react-router-dom'

export default function WarrantyPolicyPage() {
  return (
    <>
      <div className="breadcrumb">
        <Link to="/">TRANG CHỦ</Link>
        <span className="breadcrumb__sep">»</span>
        <span>CHÍNH SÁCH BẢO HÀNH</span>
      </div>

      <div className="main__content">
        <div className="policy-page">
          <h1 className="policy-page__title">Chính sách bảo hành - bồi hoàn</h1>

          <div className="policy-section">
            <h2>1. Phạm vi bảo hành</h2>
            <p>Tất cả sách do Nhà sách Hoàng Kim bán ra được bảo hành như sau:</p>
            <ul>
              <li>Bảo hành in ấn (sai sót in, rách trang, thiếu trang): 30 ngày kể từ ngày mua</li>
              <li>Bảo hành bìa cứng (gáy sách, bìa): 90 ngày</li>
              <li>Hỗ trợ đổi sách lỗi do nhà in trong thời gian sử dụng (có hóa đơn)</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>2. Điều kiện bảo hành / đổi trả</h2>
            <ul>
              <li>Sản phẩm còn nguyên vẹn, chưa qua sử dụng (chưa ghi chú, gấp trang)</li>
              <li>Còn nguyên tem, nhãn của nhà sách</li>
              <li>Có hóa đơn hoặc chứng từ mua hàng</li>
              <li>Trong thời hạn bảo hành quy định</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>3. Bồi hoàn</h2>
            <p>Trường hợp không thể đổi sách mới (hết hàng, ngừng phát hành), Nhà sách sẽ hoàn tiền hoặc chuyển sang sản phẩm khác tương đương theo giá trị đơn hàng.</p>
          </div>

          <div className="policy-section">
            <h2>4. Liên hệ</h2>
            <p>Hotline: <a href="tel:19001234">1900 1234</a> | Email: <a href="mailto:hotro@hoangkimbooks.vn">hotro@hoangkimbooks.vn</a></p>
          </div>
        </div>
      </div>
    </>
  )
}
