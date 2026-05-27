import React from 'react';

export const Rating = ({ value = 0, count, size = 16, showValue = false }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-flex', gap: 2 }}>
        {[0, 1, 2, 3, 4].map((i) => {
          let fill = 'none';
          if (i < full) fill = 'var(--color-accent)';
          else if (i === full && half) fill = 'url(#half-grad)';
          return (
            <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="var(--color-accent)" strokeWidth="1.6" strokeLinejoin="round">
              {i === full && half && (
                <defs>
                  <linearGradient id="half-grad">
                    <stop offset="50%" stopColor="var(--color-accent)" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
              <path d="M12 3l2.7 5.5L20.5 9l-4.2 4.1 1 5.9L12 16.8 6.7 19l1-5.9L3.5 9l5.8-.5L12 3z" />
            </svg>
          );
        })}
      </span>
      {showValue && (
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-soft)' }}>
          {Number(value || 0).toFixed(1)}
        </span>
      )}
      {count != null && (
        <span style={{ fontSize: 12, color: 'var(--color-text-mute)' }}>
          ({count} đánh giá)
        </span>
      )}
    </span>
  );
};

export default Rating;
