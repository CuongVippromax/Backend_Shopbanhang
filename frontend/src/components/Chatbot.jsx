import { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { getFaqs } from '../api/faq';

const CATEGORY_LABELS = {
  CHINH_SACH: 'Chính sách',
  TAI_KHOAN: 'Tài khoản',
  SAN_PHAM: 'Sản phẩm',
  DON_HANG: 'Đơn hàng',
  KHAC: 'Khác',
};

const FALLBACK_ANSWER =
  'Xin lỗi bạn, câu hỏi của bạn chưa có trong danh sách hỗ trợ. ' +
  'Bạn có thể liên hệ hotline <b>1900 1234</b> (8:00-21:00) hoặc ' +
  'gửi email về <b>cskh@hoangkimbook.vn</b> để được hỗ trợ nhanh nhất nhé!';

const INITIAL_GREETING = {
  text: 'Xin chào! Mình là trợ lý của Hoàng Kim Book. Bạn cần hỗ trợ gì hôm nay? Hãy chọn câu hỏi bên dưới hoặc gõ trực tiếp nhé!',
  sender: 'bot',
};

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return normalize(text).split(' ').filter((w) => w.length > 2);
}

function matchScore(faq, userWords, normalizedMsg) {
  let score = 0;

  if (faq.keywords) {
    const kwWords = tokenize(faq.keywords);
    for (const kw of kwWords) {
      if (normalizedMsg.includes(kw) || (kw.length > 3 && normalizedMsg.includes(kw))) {
        score += 3;
      }
    }
  }

  const qWords = tokenize(faq.question);
  for (const w of qWords) {
    if (w.length > 2 && normalizedMsg.includes(w)) {
      score += 2;
    }
  }

  for (const w of userWords) {
    if (w.length > 4 && normalize(faq.question).includes(w)) {
      score += 1;
    }
  }

  return score;
}

function findBestFaq(faqs, userMessage) {
  if (!userMessage.trim() || faqs.length === 0) return null;

  const normalizedMsg = normalize(userMessage);
  const userWords = tokenize(userMessage);

  let best = null;
  let bestScore = 0;

  for (const faq of faqs) {
    const score = matchScore(faq, userWords, normalizedMsg);
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }

  return bestScore >= 1 ? best : null;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [userInput, setUserInput] = useState('');
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    getFaqs()
      .then((res) => setFaqs(res.data || []))
      .catch(() => setFaqs([]));
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages]);

  const handleSend = (text) => {
    const trimmed = (text || userInput).trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { text: trimmed, sender: 'user' }]);
    setUserInput('');
    setLoading(true);

    setTimeout(() => {
      const matched = findBestFaq(faqs, trimmed);

      let answerText;
      if (matched) {
        answerText = matched.answer;
      } else {
        answerText = FALLBACK_ANSWER;
      }

      setMessages((prev) => [
        ...prev,
        { text: answerText, sender: 'bot', faq: matched || null },
      ]);
      setLoading(false);
    }, 400);
  };

  const handleQuickReply = (faq) => {
    setMessages((prev) => [...prev, { text: faq.question, sender: 'user' }]);
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: faq.answer, sender: 'bot', faq },
      ]);
      setLoading(false);
    }, 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickReplies = faqs.slice(0, 8);

  const categoryBadge = (cat) =>
    CATEGORY_LABELS[cat] || cat;

  return (
    <div className={`chatbot-container ${isOpen ? 'chatbot-open' : ''}`}>
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3c1.66 0 3 1.34 3 3 0 .35-.07.69-.18 1H9.18A3 3 0 0 1 9 8c0-1.66 1.34-3 3-3zm-5 8c0-2.76 2.24-5 5-5s5 2.24 5 5v1H7v-1z"/>
                </svg>
              </div>
              <div>
                <h3 className="chatbot-title">Hoàng Kim Book</h3>
                <span className="chatbot-status">Trợ lý ảo · Online</span>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="chatbot-body">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="chatbot-msg-avatar">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3c1.66 0 3 1.34 3 3 0 .35-.07.69-.18 1H9.18A3 3 0 0 1 9 8c0-1.66 1.34-3 3-3zm-5 8c0-2.76 2.24-5 5-5s5 2.24 5 5v1H7v-1z"/>
                    </svg>
                  </div>
                )}
                <div className={`chatbot-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                  <p dangerouslySetInnerHTML={{ __html: msg.text }} />
                  {msg.faq && (
                    <span className="chatbot-category-badge">
                      {categoryBadge(msg.faq.category)}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-message-row bot-row">
                <div className="chatbot-msg-avatar">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3c1.66 0 3 1.34 3 3 0 .35-.07.69-.18 1H9.18A3 3 0 0 1 9 8c0-1.66 1.34-3 3-3zm-5 8c0-2.76 2.24-5 5-5s5 2.24 5 5v1H7v-1z"/>
                  </svg>
                </div>
                <div className="chatbot-bubble bot-bubble chatbot-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}

            {!loading && messages.length === 1 && quickReplies.length > 0 && (
              <div className="chatbot-quick-replies">
                <p className="quick-replies-label">Câu hỏi phổ biến:</p>
                <div className="quick-replies-grid">
                  {quickReplies.map((faq) => (
                    <button
                      key={faq.id}
                      className="quick-reply-btn"
                      onClick={() => handleQuickReply(faq)}
                    >
                      {faq.question.length > 40 ? faq.question.slice(0, 40) + '…' : faq.question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-footer">
            <div className="chatbot-input-row">
              <input
                ref={inputRef}
                type="text"
                className="chatbot-input"
                placeholder="Nhập câu hỏi của bạn..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="chatbot-send-btn"
                onClick={() => handleSend()}
                disabled={!userInput.trim()}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
            <p className="chatbot-footer-note">
              Hoàng Kim Book · Hotline: 1900 1234
            </p>
          </div>
        </div>
      )}

      <button
        className={`chatbot-fab ${isOpen ? 'fab-hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Mở chat"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
          <path d="M7 9h10v2H7zm0-3h10v2H7z"/>
        </svg>
        <span className="chatbot-fab-badge">Hỗ trợ</span>
      </button>
    </div>
  );
}
