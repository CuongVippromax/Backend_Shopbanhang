import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import './Toast.css';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const removeToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    // Xóa timeout cũ nếu có
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Xóa animation cũ ngay lập tức
    setToast(null);

    // Reset lại để animation chạy lại từ đầu
    setTimeout(() => {
      const id = Date.now();
      setToast({ id, message, type });

      // Đặt timeout để xóa toast sau duration
      timeoutRef.current = setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
      }, duration);
    }, 50); // Small delay để reset animation
  }, []);

  const success = useCallback((message, duration) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const loginSuccess = useCallback((message, duration) => {
    showToast(message, 'login-success', duration);
  }, [showToast]);

  const logoutSuccess = useCallback((message, duration) => {
    showToast(message, 'logout-success', duration);
  }, [showToast]);

  const updateSuccess = useCallback((message, duration) => {
    showToast(message, 'update-success', duration);
  }, [showToast]);

  // Cleanup timeout khi unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ success, error, loginSuccess, logoutSuccess, updateSuccess, showToast }}>
      {children}
      {toast && (
        <ToastContainer toast={toast} onClose={removeToast} />
      )}
    </ToastContext.Provider>
  );
}

function ToastContainer({ toast, onClose }) {
  return (
    <div className="toast-container-single">
      <div
        className={`toast-single toast-single--${toast.type}`}
        key={toast.id}
      >
        <div className={`toast-box-single toast-box-single--${toast.type}`}>
          <div className="toast-icon-wrapper-single">
            {(toast.type === 'login-success' || toast.type === 'logout-success' || toast.type === 'update-success') && (
              <svg viewBox="0 0 60 60" className="toast-icon-circle-single">
                <path
                  className="checkmark-path-single"
                  d="M15 32 L25 42 L45 18"
                  style={{
                    stroke: toast.type === 'login-success' ? '#22c55e' :
                           toast.type === 'logout-success' ? '#f59e0b' : '#3b82f6'
                  }}
                />
              </svg>
            )}
            {toast.type === 'success' && (
              <svg viewBox="0 0 60 60" className="toast-icon-circle-single">
                <path
                  className="checkmark-path-single"
                  d="M15 32 L25 42 L45 18"
                />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg viewBox="0 0 24 24" className="toast-icon-svg-single toast-icon-error-single">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            )}
          </div>
          <span className="toast-message-single">{toast.message}</span>
        </div>
      </div>
    </div>
  );
}
