/* ================================================================
   LAYOUT COMPONENT - Redesigned Bold & Vibrant
   ================================================================ */

import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import Header from './Header'
import Navbar from './Navbar'
import Footer from './Footer'
import Chatbot from '../Chatbot'

/* ================================================================
   SCROLL TO TOP
   ================================================================ */

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

/* ================================================================
   MAIN LAYOUT
   ================================================================ */

export default function Layout() {
  const [showChatbot, setShowChatbot] = useState(false)

  return (
    <div className="layout">
      <ScrollToTop />
      <Header />
      <Navbar />
      
      <main className="main">
        <Outlet />
      </main>
      
      <Footer />

      {/* Chatbot Toggle */}
      {createPortal(
        <div className="chatbot-wrapper">
          <button
            type="button"
            className="chatbot-toggle-btn"
            onClick={() => setShowChatbot(!showChatbot)}
            aria-label={showChatbot ? 'Đóng chat tư vấn' : 'Mở chat tư vấn'}
          >
            {showChatbot ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            )}
          </button>
        </div>,
        document.body
      )}

      {/* Chatbot Modal */}
      {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
    </div>
  )
}

// Export individual components
export { Header, Navbar, Footer }
