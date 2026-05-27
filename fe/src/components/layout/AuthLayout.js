import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { Icon } from '../common/Icon';

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="auth-shell">
    <div className="auth-aside">
      <div className="auth-aside-inner">
        <Logo size="lg" white />
        <div className="auth-aside-content">
          <h2>“Sách là người bạn không bao giờ phản bội ta.”</h2>
          <p>— Pierre Charron</p>
        </div>
        <ul className="auth-perks">
          <li><Icon name="check" size={16} /> Hàng nghìn tựa sách được tuyển chọn</li>
          <li><Icon name="check" size={16} /> Ưu đãi và quà tặng cho thành viên</li>
          <li><Icon name="check" size={16} /> Giao hàng nhanh, đổi trả linh hoạt</li>
        </ul>
      </div>
    </div>

    <div className="auth-main">
      <div className="auth-top">
        <Link to="/" className="auth-home"><Icon name="arrowLeft" size={14} /> Về trang chủ</Link>
      </div>
      <div className="auth-card">
        <h1>{title}</h1>
        {subtitle && <p className="auth-sub">{subtitle}</p>}
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>

    <style>{`
      .auth-shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1fr 1fr;
        background: var(--color-bg);
      }
      .auth-aside {
        background: linear-gradient(180deg, #34504b 0%, #2c3a33 100%);
        color: #fff;
        position: relative;
        overflow: hidden;
      }
      .auth-aside::before, .auth-aside::after {
        content: '';
        position: absolute;
        border-radius: 50%;
        opacity: 0.12;
      }
      .auth-aside::before {
        width: 360px; height: 360px;
        background: var(--color-accent);
        top: -120px; right: -120px;
      }
      .auth-aside::after {
        width: 280px; height: 280px;
        background: var(--color-primary-soft);
        bottom: -100px; left: -80px;
      }
      .auth-aside-inner {
        position: relative;
        z-index: 1;
        padding: 56px 48px;
        height: 100%;
        display: flex; flex-direction: column;
      }
      .auth-aside-content { margin: auto 0; }
      .auth-aside-content h2 {
        font-family: var(--font-serif);
        color: #fff;
        font-size: 38px;
        line-height: 1.25;
        max-width: 440px;
      }
      .auth-aside-content p { color: rgba(255,255,255,0.75); margin-top: 12px; }
      .auth-perks { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 12px; }
      .auth-perks li { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.82); font-size: 14px; }
      .auth-perks svg { color: var(--color-accent-soft); }

      .auth-main {
        display: flex; flex-direction: column;
        padding: 32px 40px;
      }
      .auth-top { display: flex; justify-content: flex-end; }
      .auth-home { font-size: 13px; font-weight: 600; color: var(--color-text-soft); display: inline-flex; gap: 6px; align-items: center; }
      .auth-home:hover { color: var(--color-primary); }

      .auth-card {
        width: 100%;
        max-width: 440px;
        margin: auto;
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        padding: 40px 36px;
      }
      .auth-card h1 { font-family: var(--font-serif); font-size: 28px; margin: 0 0 6px; }
      .auth-sub { color: var(--color-text-mute); margin: 0 0 24px; font-size: 14px; }
      .auth-footer { margin-top: 18px; text-align: center; font-size: 14px; color: var(--color-text-soft); }
      .auth-footer a { font-weight: 700; }

      @media (max-width: 900px) {
        .auth-shell { grid-template-columns: 1fr; }
        .auth-aside { display: none; }
        .auth-main { padding: 20px; }
        .auth-card { padding: 32px 22px; }
      }
    `}</style>
  </div>
);

export default AuthLayout;
