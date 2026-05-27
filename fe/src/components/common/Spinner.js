import React from 'react';

export const Spinner = ({ size = 28, color, label }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3px solid var(--color-primary-lighter)`,
        borderTopColor: color || 'var(--color-primary)',
        display: 'inline-block',
        animation: 'spin 0.85s linear infinite',
      }}
    />
    {label && <span style={{ color: 'var(--color-text-soft)' }}>{label}</span>}
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const FullPageLoader = ({ label = 'Đang tải...' }) => (
  <div style={{
    minHeight: '50vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  }}>
    <Spinner size={42} />
    <span style={{ color: 'var(--color-text-mute)' }}>{label}</span>
  </div>
);

export default Spinner;
