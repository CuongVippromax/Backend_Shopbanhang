import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import RouterDOM from './Router';
import { CartProvider } from './context/CartContext';
import ChatbotWrapper from './Components/ChatbotWrapper';

ReactDOM.render(
  <React.StrictMode>
    <CartProvider>
      <RouterDOM />
      <ChatbotWrapper />
    </CartProvider>
  </React.StrictMode>,
  document.getElementById('root')
);