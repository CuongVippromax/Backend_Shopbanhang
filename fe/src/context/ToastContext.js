import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info', duration = 2000) => {
    const id = ++idCounter;
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const value = { show };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && <div className="toast-backdrop" />}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon-wrap" aria-hidden="true">
              {t.type === 'success' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {t.type === 'error' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
              {t.type === 'warning' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
              {t.type === 'info' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </span>
            <span className="toast-message">{t.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        .toast-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(44, 58, 51, 0.12);
          z-index: 9998;
          animation: backdropIn 0.2s ease both;
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .toast-stack {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          z-index: 9999;
          pointer-events: none;
          width: 100%;
          max-width: 280px;
          padding: 0 16px;
        }
        .toast {
          background: var(--color-surface);
          color: var(--color-text);
          padding: 14px 18px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(44, 58, 51, 0.15), 0 1px 4px rgba(44, 58, 51, 0.08);
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          border: 1px solid var(--color-border-soft);
          animation: toast-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          text-align: center;
          line-height: 1.4;
        }
        @keyframes toast-in {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        .toast-icon-wrap {
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #fff;
          flex-shrink: 0;
        }
        .toast-success .toast-icon-wrap { background: var(--color-primary); }
        .toast-error .toast-icon-wrap { background: var(--color-danger); }
        .toast-warning .toast-icon-wrap { background: var(--color-accent); }
        .toast-warning .toast-icon-wrap svg { color: #2c2410; }
        .toast-info .toast-icon-wrap { background: var(--color-primary-soft); }
        .toast-message {
          color: var(--color-text);
        }
        @media (max-width: 480px) {
          .toast {
            padding: 12px 16px;
            font-size: 13px;
            max-width: 240px;
          }
          .toast-icon-wrap {
            width: 24px;
            height: 24px;
            border-radius: 6px;
          }
          .toast-icon-wrap svg { width: 14px; height: 14px; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
