import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ size = 'md', white = false }) => {
  const sizes = {
    sm: { box: 36, font: 16, sub: 10 },
    md: { box: 44, font: 19, sub: 11 },
    lg: { box: 54, font: 22, sub: 12 },
  };
  const s = sizes[size] || sizes.md;
  return (
    <Link to="/" className="logo" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
      <span
        className="logo-mark"
        style={{
          width: s.box,
          height: s.box,
          borderRadius: 12,
          background: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
          border: '1px solid var(--color-border-soft)',
        }}
      >
        <img
          src="/image/logo-hoang-kim.jpg"
          alt="Hoàng Kim Books"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </span>
      <span className="logo-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          fontSize: s.font,
          color: white ? '#fff' : 'var(--color-text)',
          letterSpacing: 0.3,
        }}>
          Hoàng Kim
        </span>
        <span style={{
          fontSize: s.sub,
          fontWeight: 600,
          color: white ? 'rgba(255,255,255,0.85)' : 'var(--color-text-mute)',
          textTransform: 'uppercase',
          letterSpacing: 2.4,
        }}>
          Books
        </span>
      </span>
    </Link>
  );
};

export default Logo;
