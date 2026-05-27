import React, { useEffect, useMemo, useState } from 'react';
import { faqApi } from '../api/shopApi';
import Breadcrumb from '../components/common/Breadcrumb';
import { Icon } from '../components/common/Icon';
import { Spinner } from '../components/common/Spinner';
import Empty from '../components/common/Empty';

const FaqPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('Tất cả');

  useEffect(() => {
    setLoading(true);
    faqApi.list()
      .then((data) => setFaqs(Array.isArray(data) ? data : []))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    faqs.forEach((f) => f.category && set.add(f.category));
    return ['Tất cả', ...Array.from(set)];
  }, [faqs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs
      .filter((f) => activeCat === 'Tất cả' || f.category === activeCat)
      .filter((f) =>
        !q ||
        f.question?.toLowerCase().includes(q) ||
        f.answer?.toLowerCase().includes(q) ||
        f.keywords?.toLowerCase().includes(q)
      )
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [faqs, query, activeCat]);

  return (
    <>
      <Breadcrumb items={[{ label: 'Câu hỏi thường gặp' }]} />
      <section className="section">
        <div className="container">
          <div className="faq-head">
            <span className="badge">Hỗ trợ</span>
            <h1>Câu hỏi thường gặp</h1>
            <p>Tổng hợp giải đáp nhanh cho các thắc mắc phổ biến từ khách hàng.</p>
            <div className="faq-search">
              <Icon name="search" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm câu hỏi… VD: đổi trả, vận chuyển"
              />
            </div>
          </div>

          {categories.length > 1 && (
            <div className="faq-tabs">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`faq-tab ${activeCat === c ? 'is-active' : ''}`}
                  onClick={() => setActiveCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {loading && <div className="text-center"><Spinner size={28} /></div>}
          {!loading && filtered.length === 0 && <Empty title="Không tìm thấy câu hỏi phù hợp" />}

          <div className="faq-list">
            {filtered.map((f) => {
              const open = openId === f.id;
              return (
                <div className={`faq-item ${open ? 'is-open' : ''}`} key={f.id}>
                  <button
                    type="button"
                    className="faq-q"
                    onClick={() => setOpenId(open ? null : f.id)}
                    aria-expanded={open}
                  >
                    <span>{f.question}</span>
                    <Icon name="down" size={16} />
                  </button>
                  {open && (
                    <div className="faq-a">
                      <p>{f.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <style>{`
        .faq-head { text-align: center; max-width: 720px; margin: 0 auto 32px; }
        .faq-head h1 { font-family: var(--font-serif); font-size: 38px; margin: 12px 0 8px; }
        .faq-head p { color: var(--color-text-mute); }
        .faq-search {
          display: flex; align-items: center; gap: 10px;
          margin-top: 24px;
          padding: 10px 16px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          box-shadow: var(--shadow-sm);
          transition: border-color var(--t-fast), box-shadow var(--t-fast);
        }
        .faq-search:focus-within {
          border-color: var(--color-primary-soft);
          box-shadow: 0 0 0 4px rgba(127, 181, 160, 0.18);
        }
        .faq-search input { flex: 1; border: 0; outline: none; background: transparent; font-size: 15px; padding: 6px 0; }
        .faq-search svg { color: var(--color-text-mute); }

        .faq-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 22px; justify-content: center; }
        .faq-tab {
          padding: 8px 16px;
          border-radius: 99px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-text-soft);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          transition: all var(--t-fast);
        }
        .faq-tab:hover { background: var(--color-bg-alt); }
        .faq-tab.is-active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

        .faq-list { display: flex; flex-direction: column; gap: 8px; max-width: 820px; margin: 0 auto; }
        .faq-item {
          background: var(--color-surface);
          border: 1px solid var(--color-border-soft);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: border-color var(--t-fast), box-shadow var(--t-fast);
        }
        .faq-item.is-open { border-color: var(--color-primary-soft); box-shadow: var(--shadow-sm); }
        .faq-q {
          width: 100%;
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 20px;
          text-align: left;
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text);
        }
        .faq-q svg { transition: transform var(--t-base); color: var(--color-primary); flex-shrink: 0; }
        .faq-item.is-open .faq-q svg { transform: rotate(180deg); }
        .faq-a {
          padding: 0 20px 18px;
          color: var(--color-text-soft);
          line-height: 1.7;
          animation: faIn 0.18s ease both;
        }
        @keyframes faIn { from { opacity: 0; } to { opacity: 1; } }
        .faq-a p { margin: 0; white-space: pre-line; }
      `}</style>
    </>
  );
};

export default FaqPage;
