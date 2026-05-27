import React, { useState } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import { Icon } from '../components/common/Icon';
import { Spinner } from '../components/common/Spinner';
import { useToast } from '../context/ToastContext';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.show('Cảm ơn bạn! Chúng tôi sẽ phản hồi qua email sớm nhất.', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 800);
  };

  return (
    <>
      <Breadcrumb items={[{ label: 'Liên hệ' }]} />
      <section className="section">
        <div className="container">
          <div className="contact-head">
            <span className="badge">Liên hệ</span>
            <h1>Chúng tôi luôn sẵn sàng lắng nghe bạn</h1>
            <p>Có câu hỏi, đóng góp hay đơn giản chỉ muốn nói lời chào — đừng ngần ngại liên hệ với Hoàng Kim Books.</p>
          </div>

          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-card">
                <div className="ci-icon"><Icon name="location" /></div>
                <div>
                  <strong>Địa chỉ</strong>
                  <span>Số 262, Đường Phùng Hưng, Phường Phúc La, Quận Hà Đông, Hà Nội</span>
                </div>
              </div>
              <div className="contact-card">
                <div className="ci-icon"><Icon name="phone" /></div>
                <div>
                  <strong>Hotline</strong>
                  <span>1900 1234 (8:00 - 21:00, cả tuần)</span>
                </div>
              </div>
              <div className="contact-card">
                <div className="ci-icon"><Icon name="mail" /></div>
                <div>
                  <strong>Email</strong>
                  <span>hello@hoangkim.vn</span>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={submit}>
              <h3>Gửi tin nhắn cho chúng tôi</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Họ tên *</label>
                  <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Chủ đề *</label>
                <input className="form-control" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nội dung *</label>
                <textarea className="form-control" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <><Spinner size={14} /> Đang gửi…</> : <><Icon name="send" size={14} /> Gửi tin nhắn</>}
              </button>
            </form>
          </div>
        </div>
      </section>

      <style>{`
        .contact-head { text-align: center; max-width: 640px; margin: 0 auto 36px; }
        .contact-head h1 { font-family: var(--font-serif); font-size: 36px; margin: 12px 0 8px; }
        .contact-head p { color: var(--color-text-mute); }

        .contact-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 32px;
          align-items: stretch;
        }
        .contact-info { display: flex; flex-direction: column; gap: 14px; }
        .contact-card {
          display: flex; align-items: center; gap: 14px;
          padding: 20px;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-soft);
        }
        .ci-icon {
          width: 46px; height: 46px;
          border-radius: 12px;
          background: var(--color-primary-bg);
          color: var(--color-primary);
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .contact-card strong { display: block; }
        .contact-card span { font-size: 13.5px; color: var(--color-text-mute); }

        .contact-form {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-soft);
          padding: 28px;
        }
        .contact-form h3 { font-family: var(--font-serif); margin: 0 0 18px; font-size: 22px; }

        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
};

export default ContactPage;
