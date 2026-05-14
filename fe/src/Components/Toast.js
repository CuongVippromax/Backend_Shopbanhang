import React, { createContext, useContext, useState, useCallback } from 'react';
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
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  const success = useCallback((message, duration) => {
    addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message, duration) => {
    addToast(message, 'error', duration);
  }, [addToast]);

  const loginSuccess = useCallback((message, duration) => {
    addToast(message, 'login-success', duration);
  }, [addToast]);

  const logoutSuccess = useCallback((message, duration) => {
    addToast(message, 'logout-success', duration);
  }, [addToast]);

  const updateSuccess = useCallback((message, duration) => {
    addToast(message, 'update-success', duration);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, loginSuccess, logoutSuccess, updateSuccess, addToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`toast toast--${toast.type}`}
        >
          <div className={`toast-box toast-box--${toast.type}`}>
            <div className="toast-icon-wrapper">
              {(toast.type === 'login-success' || toast.type === 'logout-success' || toast.type === 'update-success') && (
                <svg viewBox="0 0 60 60" className="toast-icon-circle">
                  <path 
                    className="checkmark-path"
                    d="M15 32 L25 42 L45 18"
                    style={{
                      stroke: toast.type === 'login-success' ? '#22c55e' : 
                             toast.type === 'logout-success' ? '#f59e0b' : '#3b82f6'
                    }}
                  />
                </svg>
              )}
              {toast.type === 'success' && (
                <svg viewBox="0 0 60 60" className="toast-icon-circle">
                  <path 
                    className="checkmark-path"
                    d="M15 32 L25 42 L45 18"
                  />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg viewBox="0 0 24 24" className="toast-icon-svg toast-icon-error">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              )}
            </div>
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
