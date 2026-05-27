import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { articleApi } from '../api/shopApi';
import Breadcrumb from '../components/common/Breadcrumb';
import { FullPageLoader } from '../components/common/Spinner';
import { Icon } from '../components/common/Icon';
import { formatDate, safeImage } from '../utils/format';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setLoading(true);
    articleApi.getById(id)
      .then((a) => setArticle(a))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
    articleApi.featured()
      .then((list) => setRelated((Array.isArray(list) ? list : []).filter((a) => String(a.articleId) !== String(id)).slice(0, 3)))
      .catch(() => setRelated([]));
  }, [id]);

  if (loading) return <FullPageLoader />;
  if (!article) {
    return (
      <div className="container section text-center">
        <h2>Không tìm thấy bài viết</h2>
        <Link to="/articles" className="btn btn-primary mt-3">Về trang bài viết</Link>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Bài viết', to: '/articles' }, { label: article.title }]} />

      <article className="article-page">
        <div className="container article-inner">
          <header className="article-header">
            {article.category && <span className="badge">{article.category}</span>}
            <h1>{article.title}</h1>
            <div className="article-meta">
              <span>{article.authorName || 'Hoàng Kim'}</span>
              <span>·</span>
              <span>{formatDate(article.createdAt)}</span>
              {article.featured && (
                <>
                  <span>·</span>
                  <span className="badge badge-accent">Nổi bật</span>
                </>
              )}
            </div>
          </header>

          {article.image && (
            <div className="article-image">
              <img src={safeImage(article.image, article.title)} alt={article.title}
                onError={(e) => { e.currentTarget.src = safeImage(null, article.title); }}
              />
            </div>
          )}

          {article.summary && <p className="article-summary">{article.summary}</p>}
          <div className="article-content">
            {article.content?.split('\n').map((p, i) => p.trim() ? <p key={i}>{p}</p> : null)}
          </div>

          <Link to="/articles" className="btn btn-secondary mt-6">
            <Icon name="arrowLeft" size={14} /> Quay lại danh sách
          </Link>
        </div>

        {related.length > 0 && (
          <div className="container section">
            <div className="section-head">
              <h2 className="section-title"><small>Đọc thêm</small>Bài viết liên quan</h2>
            </div>
            <div className="rel-grid">
              {related.map((a) => (
                <Link to={`/articles/${a.articleId}`} key={a.articleId} className="rel-card">
                  <img src={safeImage(a.image, a.title)} alt={a.title}
                    onError={(e) => { e.currentTarget.src = safeImage(null, a.title); }}
                  />
                  <div>
                    <h3>{a.title}</h3>
                    <span>{formatDate(a.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <style>{`
        .article-page { padding: 48px 0 32px; }
        .article-inner { max-width: 760px; }
        .article-header { text-align: center; margin-bottom: 32px; }
        .article-header h1 { font-family: var(--font-serif); font-size: 38px; line-height: 1.2; margin: 14px 0 12px; }
        .article-meta { display: flex; justify-content: center; gap: 6px; color: var(--color-text-mute); font-size: 13.5px; }
        .article-image { margin-bottom: 32px; border-radius: var(--radius-lg); overflow: hidden; }
        .article-image img { width: 100%; max-height: 500px; object-fit: cover; }
        .article-summary {
          font-size: 18px;
          color: var(--color-text-soft);
          font-style: italic;
          padding-left: 20px;
          border-left: 3px solid var(--color-primary);
          margin: 0 0 24px;
        }
        .article-content { font-size: 16.5px; line-height: 1.85; color: var(--color-text); }
        .article-content p { margin-bottom: 18px; }

        .rel-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .rel-card {
          display: flex; gap: 14px;
          padding: 14px;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-soft);
          color: inherit;
          transition: transform var(--t-base);
        }
        .rel-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .rel-card img { width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-md); flex-shrink: 0; background: var(--color-bg-alt); }
        .rel-card h3 { font-size: 14.5px; margin: 0 0 6px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .rel-card span { font-size: 12px; color: var(--color-text-mute); }
        @media (max-width: 900px) {
          .article-header h1 { font-size: 28px; }
          .article-content { font-size: 15.5px; }
          .rel-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
};

export default ArticleDetailPage;
