import React from 'react';
import { Icon } from './Icon';

export const Empty = ({ title = 'Không có dữ liệu', subtitle, action }) => (
  <div className="empty-state">
    <div className="empty-icon">
      <Icon name="package" size={32} />
    </div>
    <h3 className="empty-title">{title}</h3>
    {subtitle && <p className="empty-sub">{subtitle}</p>}
    {action}
    <style>{`
      .empty-state {
        text-align: center;
        padding: 48px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .empty-icon {
        width: 76px; height: 76px;
        border-radius: 50%;
        background: var(--color-primary-bg);
        color: var(--color-primary);
        display: inline-flex;
        align-items: center; justify-content: center;
        margin-bottom: 6px;
      }
      .empty-title { margin: 0; font-size: 18px; }
      .empty-sub { color: var(--color-text-mute); max-width: 420px; margin: 0 0 12px; }
    `}</style>
  </div>
);

export default Empty;
