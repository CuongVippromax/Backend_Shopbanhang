import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

export const Breadcrumb = ({ items = [] }) => (
  <nav aria-label="breadcrumb" className="breadcrumb-bar">
    <div className="container">
      <ol className="breadcrumb-list">
        <li>
          <Link to="/">
            <Icon name="home" size={14} /> Trang chủ
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i}>
            <span className="breadcrumb-sep" aria-hidden="true">
              <Icon name="chevron" size={12} />
            </span>
            {item.to && i < items.length - 1 ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span className="breadcrumb-current">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </div>
    <style>{`
      .breadcrumb-bar {
        background: var(--color-bg-alt);
        border-bottom: 1px solid var(--color-border-soft);
        padding: 12px 0;
        font-size: 13px;
      }
      .breadcrumb-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }
      .breadcrumb-list li {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--color-text-soft);
      }
      .breadcrumb-list a {
        color: var(--color-text-soft);
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .breadcrumb-list a:hover { color: var(--color-primary); }
      .breadcrumb-sep { color: var(--color-text-mute); display: inline-flex; }
      .breadcrumb-current { color: var(--color-text); font-weight: 600; }
    `}</style>
  </nav>
);

export default Breadcrumb;
