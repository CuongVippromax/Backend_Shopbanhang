import React, { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info', duration = 1800) => {
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
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {t.type === 'error' && (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
              {t.type === 'warning' && (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
              {t.type === 'info' && (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
          gap: 12px;
          z-index: 9999;
          pointer-events: none;
        }
        .toast {
          background: var(--color-surface);
          color: var(--color-text);
          width: 150px;
          min-height: 150px;
          padding: 18px 14px;
          border-radius: 16px;
          box-shadow: 0 8px 28px rgba(44, 58, 51, 0.18), 0 2px 6px rgba(44, 58, 51, 0.08);
          font-weight: 600;
          font-size: 13px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: 1px solid var(--color-border-soft);
          animation: toast-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          text-align: center;
          line-height: 1.35;
          box-sizing: border-box;
        }
        @keyframes toast-in {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        .toast-icon-wrap {
          width: 48px;
          height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
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
          word-break: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (max-width: 480px) {
          .toast {
            width: 140px;
            min-height: 140px;
            padding: 16px 12px;
            font-size: 12.5px;
            border-radius: 14px;
          }
          .toast-icon-wrap {
            width: 42px;
            height: 42px;
          }
          .toast-icon-wrap svg { width: 22px; height: 22px; }
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
