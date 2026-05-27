import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ChatbotWidget from '../chatbot/ChatbotWidget';

const MainLayout = () => (
  <div className="app-shell">
    <Header />
    <main className="app-main page-enter">
      <Outlet />
    </main>
    <Footer />
    <ChatbotWidget />
    <style>{`
      .app-shell {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      .app-main { flex: 1; }
    `}</style>
  </div>
);

export default MainLayout;
