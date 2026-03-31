import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { sendChatMessage } from '../api/chatbot'

const Icons = {
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  /** Biểu tượng tư vấn / nhân viên hỗ trợ (headset) */
  SupportStaff: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Star: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  Book: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  ),
  Loader: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chatbot-loading">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
  ),
}

const SUGGESTED_QUESTIONS = [
  { text: 'Gợi ý sách hay cho tôi', icon: 'star' },
  { text: 'Tìm sách về lập trình', icon: 'book' },
  { text: 'Chính sách đổi trả', icon: 'info' },
  { text: 'Cách thanh toán', icon: 'info' },
]

function formatPrice(price) {
  if (!price) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const welcomeMsg = {
      id: Date.now(),
      type: 'bot',
      message:
        'Xin chào! 👋 Mình là nhân viên tư vấn của Nhà sách Hoàng Kim. Bạn cần gợi ý sách, hỏi về đơn hàng, thanh toán hay giao hàng cứ nhắn mình nhé!',
      timestamp: new Date(),
    }
    setMessages([welcomeMsg])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isVisible])

  const handleSend = async (messageText) => {
    const text = messageText || inputValue.trim()
    if (!text || isLoading) return

    const userMsg = {
      id: Date.now(),
      type: 'user',
      message: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await sendChatMessage(text)
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        message: response.message || 'Xin lỗi, mình chưa hiểu rõ ý bạn. Bạn diễn đạt thêm giúp mình nhé!',
        typeDetail: response.type || 'text',
        books: response.bookRecommendations || [],
        intent: response.intent || 'general',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMsg])
    } catch (error) {
      const errorMsg = {
        id: Date.now() + 1,
        type: 'bot',
        message: 'Xin lỗi, hiện mình chưa kết nối được. Bạn thử lại sau hoặc gọi hotline cửa hàng nhé!',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestedQuestion = (question) => {
    handleSend(question)
  }

  const renderStars = (rating) => {
    if (!rating) return null
    const stars = []
    const fullStars = Math.floor(rating)
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < fullStars ? 'star-filled' : 'star-empty'}>
          <Icons.Star />
        </span>
      )
    }
    return <div className="chatbot-stars">{stars}</div>
  }

  return createPortal(
    <div className={`chatbot-container ${isVisible ? 'chatbot-visible' : ''}`}>
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header-left">
          <div className="chatbot-avatar">
            <Icons.SupportStaff />
          </div>
          <div className="chatbot-header-info">
            <h3>Tư vấn nhà sách</h3>
            <span className="chatbot-status">
              <span className="status-dot"></span>
              Sẵn sàng hỗ trợ
            </span>
          </div>
        </div>
        <button className="chatbot-close-btn" onClick={onClose}>
          <Icons.Close />
        </button>
      </div>

      {/* Messages */}
      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chatbot-message ${msg.type === 'user' ? 'message-user' : 'message-bot'}`}>
            {msg.type === 'bot' && (
              <div className="message-avatar">
                <Icons.SupportStaff />
              </div>
            )}
            <div className="message-content">
              <div className="message-text">{msg.message}</div>

              {/* Book Recommendations */}
              {msg.books && msg.books.length > 0 && (
                <div className="chatbot-books">
                  {msg.books.map((book, idx) => (
                    <a
                      key={idx}
                      href={`/san-pham/${book.bookId}`}
                      className="chatbot-book-card"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {book.image && (
                        <div className="book-image">
                          <img src={book.image} alt={book.bookName} />
                        </div>
                      )}
                      <div className="book-info">
                        <h4>{book.bookName}</h4>
                        {book.author && <p className="book-author">{book.author}</p>}
                        <div className="book-meta">
                          {book.price && <span className="book-price">{formatPrice(book.price)}</span>}
                          {renderStars(book.averageRating)}
                        </div>
                        <span className="book-cta">
                          Xem chi tiết <Icons.ChevronRight />
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              <div className="message-time">
                {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {msg.type === 'user' && (
              <div className="message-avatar user-avatar">
                <Icons.User />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="chatbot-message message-bot">
            <div className="message-avatar">
              <Icons.SupportStaff />
            </div>
            <div className="message-content">
              <div className="message-loading">
                <Icons.Loader />
                <span>Đang soạn tin cho bạn...</span>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Questions */}
        {!isLoading && messages.length === 1 && (
          <div className="chatbot-suggestions">
            <p className="suggestions-title">Bạn có thể hỏi:</p>
            <div className="suggestions-list">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  className="suggestion-btn"
                  onClick={() => handleSuggestedQuestion(q.text)}
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chatbot-input-container">
        <input
          ref={inputRef}
          type="text"
          className="chatbot-input"
          placeholder="Nhập câu hỏi của bạn..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button
          className="chatbot-send-btn"
          onClick={() => handleSend()}
          disabled={!inputValue.trim() || isLoading}
        >
          <Icons.Send />
        </button>
      </div>
    </div>,
    document.body
  )
}

