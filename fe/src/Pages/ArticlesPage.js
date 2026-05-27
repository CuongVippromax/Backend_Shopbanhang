import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleApi, unwrapPage } from '../api/shopApi';
import Breadcrumb from '../components/common/Breadcrumb';
import Pagination from '../components/common/Pagination';
import Empty from '../components/common/Empty';
import { Icon } from '../components/common/Icon';
import { formatDate, truncate, safeImage } from '../utils/format';

const PAGE_SIZE = 9;

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    articleApi.featured()
      .then((data) => setFeatured(Array.isArray(data) ? data.slice(0, 1) : []))
      .catch(() => setFeatured([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    articleApi.list(page, PAGE_SIZE)
      .then((resp) => {
        const p = unwrapPage(resp);
        setArticles(p.items);
        setPageInfo({ pageNo: p.pageNo || page, totalPages: p.totalPages || 1 });
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <>
      <Breadcrumb items={[{ label: 'Bài viết' }]} />
      <section className="section">
        <div className="container">
          <div className="art-page-head">
            <h1>Cảm hứng đọc sách</h1>
            <p>Những bài viết, gợi ý sách và câu chuyện từ Hoàng Kim Books.</p>
          </div>

          {featured.map((a) => (
            <Link to={`/articles/${a.articleId}`} key={a.articleId} className="art-featured">
              <div className="art-featured-cover">
                <img src={safeImage(a.image, a.title)} alt={a.title}
                  onError={(e) => { e.currentTarget.src = safeImage(null, a.title); }}
                />
              </div>
              <div className="art-featured-body">
                <span className="badge badge-accent">Bài viết nổi bật</span>
                <h2>{a.title}</h2>
                <p>{truncate(a.summary, 200)}</p>
                <div className="art-meta">
                  <span>{a.authorName || 'Hoàng Kim'}</span>
                  <span>·</span>
                  <span>{formatDate(a.createdAt)}</span>
                </div>
                <span className="art-read">Đọc bài viết <Icon name="arrow" size={14} /></span>
              </div>
            </Link>
          ))}

          {loading && (
            <div className="art-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="skel" style={{ height: 320, borderRadius: 16 }} key={i} />
              ))}
            </div>
          )}

          {!loading && articles.length === 0 && (
            <Empty title="Chưa có bài viết nào" />
          )}

          <div className="art-grid">
            {!loading && articles.map((a) => (
              <Link to={`/articles/${a.articleId}`} key={a.articleId} className="art-card">
                <div className="art-cover">
                  <img src={safeImage(a.image, a.title)} alt={a.title}
                    onError={(e) => { e.currentTarget.src = safeImage(null, a.title); }}
                  />
                </div>
                <div className="art-body">
                  {a.category && <span className="badge">{a.category}</span>}
                  <h3>{a.title}</h3>
                  <p>{truncate(a.summary, 100)}</p>
                  <div className="art-meta">
                    <span>{a.authorName || 'Hoàng Kim'}</span>
                    <span>·</span>
                    <span>{formatDate(a.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination pageNo={(pageInfo.pageNo || 0) + 1} totalPages={pageInfo.totalPages}
            onChange={(p) => setPage(p - 1)}
          />
        </div>
      </section>

      <style>{`
        .art-page-head { text-align: center; margin-bottom: 36px; }
        .art-page-head h1 { font-family: var(--font-serif); font-size: 38px; margin-bottom: 6px; }
        .art-page-head p { color: var(--color-text-mute); }

        .art-featured {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 36px;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          overflow: hidden;
          color: inherit;
          border: 1px solid var(--color-border-soft);
          margin-bottom: 36px;
        }
        .art-featured-cover { aspect-ratio: 4/3; overflow: hidden; background: var(--color-bg-alt); }
        .art-featured-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .art-featured:hover .art-featured-cover img { transform: scale(1.04); }
        .art-featured-body { padding: 36px; display: flex; flex-direction: column; gap: 12px; justify-content: center; }
        .art-featured-body h2 { font-family: var(--font-serif); font-size: 28px; line-height: 1.25; margin: 4px 0 0; }
        .art-featured-body p { color: var(--color-text-soft); }
        .art-read { color: var(--color-primary); font-weight: 700; display: inline-flex; align-items: center; gap: 6px; margin-top: auto; }

        .art-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
        .art-card {
          display: flex; flex-direction: column;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          overflow: hidden;
          color: inherit;
          border: 1px solid var(--color-border-soft);
          transition: transform var(--t-base), box-shadow var(--t-base);
        }
        .art-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
        .art-cover { aspect-ratio: 16/10; overflow: hidden; background: var(--color-bg-alt); }
        .art-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .art-card:hover .art-cover img { transform: scale(1.05); }
        .art-body { padding: 18px 20px 20px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .art-body h3 {
          font-size: 17px; line-height: 1.3; margin: 0;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .art-body p { color: var(--color-text-soft); font-size: 13.5px; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .art-meta { display: flex; gap: 6px; font-size: 12px; color: var(--color-text-mute); margin-top: auto; }

        @media (max-width: 900px) {
          .art-featured { grid-template-columns: 1fr; }
          .art-featured-body { padding: 24px; }
          .art-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
};

export default ArticlesPage;
