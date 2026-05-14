import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import RouterDOM from './Router';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './Components/Toast';
import LoginSuccessHandler from './Components/LoginSuccessHandler';
import ChatbotWrapper from './Components/ChatbotWrapper';

ReactDOM.render(
  <React.StrictMode>
    <CartProvider>
      <ToastProvider>
        <LoginSuccessHandler>
          <RouterDOM />
          <ChatbotWrapper />
        </LoginSuccessHandler>
      </ToastProvider>
    </CartProvider>
  </React.StrictMode>,
  document.getElementById('root')
);