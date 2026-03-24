import { Link, useParams, Navigate } from 'react-router-dom'

/** Nội dung các trang chính sách / giới thiệu — slug khớp với đường dẫn */
export const STATIC_PAGE_SLUGS = {
  'dieu-khoan-su-dung': {
    breadcrumb: 'Điều khoản sử dụng',
    title: 'Điều khoản sử dụng',
    sections: [
      {
        heading: '1. Chấp nhận điều khoản',
        body: 'Khi truy cập và sử dụng website Nhà sách Hoàng Kim, bạn đồng ý tuân thủ các điều khoản dưới đây. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.'
      },
      {
        heading: '2. Sử dụng dịch vụ',
        body: 'Bạn cam kết cung cấp thông tin chính xác khi đặt hàng, không sử dụng website cho mục đích vi phạm pháp luật hoặc gây ảnh hưởng đến người khác.'
      },
      {
        heading: '3. Quyền sở hữu trí tuệ',
        body: 'Toàn bộ nội dung, hình ảnh, logo trên website thuộc quyền sở hữu của Nhà sách Hoàng Kim hoặc đối tác được cấp phép.'
      },
      {
        heading: '4. Thay đổi điều khoản',
        body: 'Chúng tôi có quyền cập nhật điều khoản bất cứ lúc nào. Phiên bản mới có hiệu lực khi đăng tải trên website.'
      }
    ]
  },
  'chinh-sach-bao-mat': {
    breadcrumb: 'Chính sách bảo mật',
    title: 'Chính sách bảo mật thông tin',
    sections: [
      {
        heading: '1. Thu thập thông tin',
        body: 'Chúng tôi thu thập họ tên, email, số điện thoại, địa chỉ giao hàng khi bạn đăng ký hoặc đặt hàng để xử lý đơn hàng và hỗ trợ khách hàng.'
      },
      {
        heading: '2. Mục đích sử dụng',
        body: 'Thông tin chỉ dùng để giao hàng, xác nhận đơn, gửi thông báo liên quan đơn hàng và chăm sóc khách hàng theo yêu cầu pháp luật.'
      },
      {
        heading: '3. Bảo mật',
        body: 'Dữ liệu được lưu trữ an toàn, không bán hoặc chia sẻ cho bên thứ ba vì mục đích thương mại, trừ khi có yêu cầu của cơ quan có thẩm quyền.'
      },
      {
        heading: '4. Quyền của khách hàng',
        body: 'Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân bằng cách liên hệ hotline hoặc email hỗ trợ.'
      }
    ]
  },
  'chinh-sach-thanh-toan': {
    breadcrumb: 'Chính sách thanh toán',
    title: 'Chính sách thanh toán',
    sections: [
      {
        heading: '1. Phương thức thanh toán',
        body: 'Chúng tôi chấp nhận thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng, thanh toán qua VNPay và các cổng thanh toán được tích hợp trên website.'
      },
      {
        heading: '2. Xác nhận thanh toán',
        body: 'Đơn hàng thanh toán online được xác nhận sau khi giao dịch thành công. Trường hợp lỗi giao dịch, vui lòng liên hệ hotline để được hỗ trợ.'
      },
      {
        heading: '3. Hoàn tiền',
        body: 'Hoàn tiền (nếu có) thực hiện theo chính sách đổi trả và trong thời hạn quy định, chuyển về tài khoản hoặc phương thức bạn đã thanh toán.'
      }
    ]
  },
  'gioi-thieu': {
    breadcrumb: 'Giới thiệu',
    title: 'Giới thiệu Nhà sách Hoàng Kim',
    sections: [
      {
        heading: 'Về chúng tôi',
        body: 'Nhà sách Hoàng Kim là hệ thống sách trực tuyến với hàng ngàn đầu sách trong và ngoài nước. Chúng tôi hướng tới mang tri thức đến mọi độc giả với dịch vụ uy tín, giao hàng nhanh và đóng gói cẩn thận.'
      },
      {
        heading: 'Cam kết',
        body: 'Sách chính hãng, nguồn gốc rõ ràng; đội ngũ tư vấn nhiệt tình; hỗ trợ đổi trả theo chính sách công bố trên website.'
      }
    ]
  },
  'he-thong-nha-sach': {
    breadcrumb: 'Hệ thống nhà sách',
    title: 'Hệ thống nhà sách',
    sections: [
      {
        heading: 'Trụ sở & giao hàng',
        body: 'Hiện tại Nhà sách Hoàng Kim hoạt động chủ yếu qua kênh online, giao hàng toàn quốc. Địa chỉ liên hệ: Số 123 Đường Quang Trung, Quận Hà Đông, Hà Nội.'
      },
      {
        heading: 'Mở rộng',
        body: 'Thông tin chi nhánh hoặc điểm nhận sách (nếu có) sẽ được cập nhật trên trang Liên hệ và fanpage chính thức.'
      }
    ]
  },
  'chinh-sach-doi-tra-hoan-tien': {
    breadcrumb: 'Đổi - trả - hoàn tiền',
    title: 'Chính sách đổi - trả - hoàn tiền',
    sections: [
      {
        heading: '1. Điều kiện đổi trả',
        body: 'Sản phẩm còn nguyên vẹn, chưa qua sử dụng, còn tem nhãn và hóa đơn mua hàng. Thời hạn đổi trả trong vòng 7 ngày kể từ ngày nhận hàng (trừ lỗi do nhà sách hoặc vận chuyển — xử lý theo từng trường hợp).'
      },
      {
        heading: '2. Quy trình',
        body: 'Liên hệ hotline hoặc email hỗ trợ kèm mã đơn hàng. Sau khi xác nhận, bạn gửi lại sản phẩm theo hướng dẫn. Đổi sách tương đương hoặc hoàn tiền theo chính sách đã thông báo.'
      },
      {
        heading: '3. Hoàn tiền',
        body: 'Thời gian hoàn tiền từ 5–15 ngày làm việc tùy phương thức thanh toán ban đầu.'
      }
    ]
  },
  'chinh-sach-van-chuyen': {
    breadcrumb: 'Chính sách vận chuyển',
    title: 'Chính sách vận chuyển',
    sections: [
      {
        heading: '1. Phạm vi giao hàng',
        body: 'Giao hàng trên toàn lãnh thổ Việt Nam nơi có đơn vị vận chuyển hỗ trợ.'
      },
      {
        heading: '2. Thời gian giao hàng',
        body: 'Nội thành: 2–4 giờ hoặc trong ngày tùy khu vực. Liên tỉnh: 3–5 ngày làm việc. Thời gian có thể thay đổi do thời tiết hoặc lễ Tết.'
      },
      {
        heading: '3. Phí vận chuyển',
        body: 'Miễn phí giao hàng cho đơn từ mức tối thiểu theo chương trình khuyến mãi từng thời kỳ (ví dụ từ 300.000đ). Chi tiết hiển thị tại bước thanh toán.'
      }
    ]
  },
  'mua-si': {
    breadcrumb: 'Mua sỉ',
    title: 'Mua sỉ / Bán buôn',
    sections: [
      {
        heading: 'Liên hệ mua sỉ',
        body: 'Quý khách có nhu cầu mua số lượng lớn cho thư viện, trường học hoặc kinh doanh, vui lòng gửi email tới hotro@hoangkimbooks.vn hoặc gọi hotline 024 3856 7890 (máy lẻ hỗ trợ B2B nếu có).'
      },
      {
        heading: 'Báo giá',
        body: 'Bộ phận kinh doanh sẽ phản hồi trong 1–2 ngày làm việc với báo giá và điều kiện giao hàng riêng.'
      }
    ]
  },
  faq: {
    breadcrumb: 'Câu hỏi thường gặp',
    title: 'Câu hỏi thường gặp (FAQ)',
    sections: [
      {
        heading: 'Làm sao để đặt hàng?',
        body: 'Chọn sản phẩm, thêm vào giỏ, điền thông tin giao hàng và chọn phương thức thanh toán. Bạn cũng có thể mua nhanh không cần tài khoản tùy cấu hình website.'
      },
      {
        heading: 'Tôi có thể hủy đơn không?',
        body: 'Đơn chưa giao cho đơn vị vận chuyển có thể hủy qua hotline hoặc tài khoản. Đơn đang giao vui lòng liên hệ để được hướng dẫn.'
      },
      {
        heading: 'Sách lỗi in thì sao?',
        body: 'Vui lòng chụp ảnh và gửi cho bộ phận hỗ trợ trong 48 giờ sau khi nhận hàng. Chúng tôi hỗ trợ đổi mới hoặc hoàn tiền theo chính sách bảo hành.'
      },
      {
        heading: 'Liên hệ thêm?',
        body: 'Email: hotro@hoangkimbooks.vn — Hotline: 024 3856 7890 — Hoặc trang Liên hệ trên website.'
      }
    ]
  }
}

export default function StaticInfoPage() {
  const { slug } = useParams()
  const data = STATIC_PAGE_SLUGS[slug]

  if (!data) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb__sep">›</span>
        <span>{data.breadcrumb}</span>
      </div>

      <div className="main__content">
        <div className="policy-page">
          <h1 className="policy-page__title">{data.title}</h1>

          {data.sections.map((section, idx) => (
            <div key={idx} className="policy-section">
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </div>
          ))}

          <p className="policy-static-back">
            <Link to="/">← Về trang chủ</Link>
            {' · '}
            <Link to="/lien-he">Liên hệ hỗ trợ</Link>
          </p>
        </div>
      </div>
    </>
  )
}
