import React, { useEffect, useRef } from 'react';
import { Icon } from '../common/Icon';

const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open && overlayRef.current) {
      overlayRef.current.scrollTop = 0;
    }
  }, [open]);

  if (!open) return null;

  const maxWidths = { sm: '420px', md: '620px', lg: '900px' };

  return (
    <>
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(44, 58, 51, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '10px 20px 40px',
          zIndex: 9999,
          overflowY: 'auto',
          animation: 'modalOverlayIn 0.15s ease-out',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          style={{
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 25px 80px rgba(44, 58, 51, 0.25)',
            width: '100%',
            maxWidth: maxWidths[size] || maxWidths.md,
            margin: '0 0 40px',
            animation: 'modalBoxIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 24px',
              borderBottom: '1px solid #e3dfd2',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}>{title}</h3>
            <button
              onClick={onClose}
              aria-label="Đóng"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-mute)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-alt)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          <div style={{ padding: '24px', maxHeight: 'calc(90vh - 150px)', overflowY: 'auto' }}>
            {children}
          </div>

          {footer && (
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e3dfd2',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                background: 'var(--color-bg)',
                borderRadius: '0 0 16px 16px',
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalBoxIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.96); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </>
  );
};

export default Modal;
