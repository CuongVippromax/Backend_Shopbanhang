import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: gửi lên API khi backend có endpoint liên hệ
    setSent(true)
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">TRANG CHỦ</Link>
        <span className="breadcrumb__sep">»</span>
        <span>LIÊN HỆ</span>
      </div>

      <div className="contact-page">
        {/* Bản đồ: thay src bằng link embed Google Map của địa chỉ cửa hàng */}
        <div className="contact-map-wrap">
          <iframe
            title="Bản đồ cửa hàng"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.424281601071!2d106.701755!3d10.776889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f46a7e51f2f%3A0x2e2c348a2e2c348a!2sHo%20Chi%20Minh%20City!5e0!3m2!1svi!2s!4v1640000000000!5m2!1svi!2s"
            className="contact-map-iframe"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="contact-content">
          <section className="contact-info">
            <h2 className="contact-heading">LIÊN HỆ</h2>
            <p className="contact-text">
              Nhà sách Hoàng Kim là cửa hàng chuyên bán những sản phẩm sách chất lượng.
              Với những dòng sản phẩm sách Kinh Tế, sách dạy con, sách kỹ năng, sách Phật pháp ứng dụng…
              sẽ giúp bạn đọc tiếp cận với nguồn tri thức chất lượng.
            </p>
          </section>

          <section className="contact-form-section">
            <h2 className="contact-heading">GỬI Ý KIẾN CỦA BẠN</h2>
            {sent ? (
              <p className="contact-success">Cảm ơn bạn đã gửi ý kiến. Chúng tôi sẽ phản hồi sớm.</p>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Họ và tên"
                  value={form.name}
                  onChange={handleChange}
                  className="contact-input"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="contact-input"
                />
                <input
                  type="text"
                  name="subject"
                  placeholder="Tiêu đề"
                  value={form.subject}
                  onChange={handleChange}
                  className="contact-input"
                />
                <textarea
                  name="message"
                  placeholder="Nội dung"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className="contact-input contact-textarea"
                />
                <button type="submit" className="contact-submit">Gửi ý kiến</button>
              </form>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
