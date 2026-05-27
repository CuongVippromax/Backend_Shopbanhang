import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { Spinner } from '../common/Spinner';
import { chatbotApi } from '../../api/shopApi';
import { formatVnd, safeImage } from '../../utils/format';

const SESSION_KEY = 'hk_chat_session';

const generateSessionId = () => {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(SESSION_KEY, id);
  return id;
};

const initialMessages = [
  {
    role: 'bot',
    text: 'Xin chào! Mình là trợ lý Hoàng Kim. Mình có thể giúp bạn tìm sách, theo dõi đơn hàng hoặc giải đáp các thắc mắc khác. Bạn cần hỗ trợ gì hôm nay?',
  },
];

const QUICK_QUESTIONS = [
  'Sách văn học bán chạy',
  'Cách theo dõi đơn hàng',
  'Chính sách đổi trả',
  'Sách thiếu nhi hay',
];

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionId = useRef(generateSessionId());
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;
    setMessages((m) => [...m, { role: 'user', text: message }]);
    setInput('');
    setLoading(true);
    try {
      const res = await chatbotApi.send(message, sessionId.current);
      setMessages((m) => [...m, {
        role: 'bot',
        text: res?.message || 'Mình đang xử lý câu hỏi này, vui lòng thử lại sau.',
        recs: Array.isArray(res?.bookRecommendations) ? res.bookRecommendations : [],
      }]);
    } catch (err) {
      setMessages((m) => [...m, {
        role: 'bot',
        text: 'Xin lỗi, hệ thống đang gặp sự cố. Bạn có thể gọi 1900 1234 để được hỗ trợ nhé!',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`cb-fab ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Mở trợ lý chat"
      >
        <Icon name={open ? 'x' : 'chat'} size={22} />
      </button>

      {open && (
        <div className="cb-panel" role="dialog" aria-label="Trợ lý ảo">
          <div className="cb-head">
            <div className="cb-avatar"><Icon name="sparkle" size={18} /></div>
            <div>
              <strong>Trợ lý Hoàng Kim</strong>
              <span>Sẵn sàng hỗ trợ bạn</span>
            </div>
            <button className="cb-close" onClick={() => setOpen(false)} aria-label="Đóng"><Icon name="x" size={16} /></button>
          </div>

          <div className="cb-body" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`cb-msg cb-${m.role}`}>
                <div className="cb-bubble">
                  <p>{m.text}</p>
                  {m.recs?.length > 0 && (
                    <div className="cb-recs">
                      {m.recs.slice(0, 3).map((b) => (
                        <Link to={`/books/${b.bookId}`} key={b.bookId} className="cb-rec" onClick={() => setOpen(false)}>
                          <img src={safeImage(b.image, b.bookName)} alt={b.bookName}
                            onError={(e) => { e.currentTarget.src = safeImage(null, b.bookName); }}
                          />
                          <div>
                            <strong>{b.bookName}</strong>
                            <span>{formatVnd(b.price)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="cb-msg cb-bot">
                <div className="cb-bubble cb-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          {messages.length <= 2 && (
            <div className="cb-quick">
              {QUICK_QUESTIONS.map((q) => (
                <button type="button" key={q} className="cb-quick-pill" onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <form className="cb-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="cb-send" disabled={loading || !input.trim()} aria-label="Gửi">
              {loading ? <Spinner size={14} color="#fff" /> : <Icon name="send" size={16} color="#fff" />}
            </button>
          </form>
        </div>
      )}

      <style>{`
        .cb-fab {
          position: fixed;
          bottom: 24px; right: 24px;
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary) 0%, #34504b 100%);
          color: #fff;
          box-shadow: var(--shadow-lg);
          display: inline-flex; align-items: center; justify-content: center;
          z-index: 80;
          transition: transform var(--t-base);
        }
        .cb-fab:hover { transform: scale(1.05); }
        .cb-fab.is-open { background: var(--color-text); }
        @keyframes cbIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .cb-panel {
          position: fixed;
          bottom: 92px; right: 24px;
          width: 380px;
          max-width: calc(100vw - 24px);
          height: 540px;
          max-height: calc(100vh - 120px);
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          display: flex; flex-direction: column;
          z-index: 80;
          border: 1px solid var(--color-border-soft);
          animation: cbIn 0.22s ease both;
        }
        .cb-head {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px;
          background: linear-gradient(135deg, var(--color-primary), #34504b);
          color: #fff;
        }
        .cb-avatar {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.18);
          display: inline-flex; align-items: center; justify-content: center;
          color: var(--color-accent-soft);
        }
        .cb-head strong { display: block; font-size: 15px; }
        .cb-head span { font-size: 12px; color: rgba(255,255,255,0.7); }
        .cb-close {
          margin-left: auto;
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,0.1); color: #fff;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .cb-close:hover { background: rgba(255,255,255,0.2); }

        .cb-body {
          flex: 1; padding: 16px; overflow-y: auto;
          background: var(--color-bg);
          display: flex; flex-direction: column; gap: 10px;
        }
        .cb-msg { display: flex; }
        .cb-msg.cb-user { justify-content: flex-end; }
        .cb-bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
        }
        .cb-bot .cb-bubble {
          background: var(--color-surface);
          color: var(--color-text);
          border-bottom-left-radius: 4px;
          border: 1px solid var(--color-border-soft);
        }
        .cb-user .cb-bubble {
          background: var(--color-primary);
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .cb-bubble p { margin: 0; white-space: pre-line; }
        .cb-typing { display: inline-flex; gap: 4px; padding: 12px 14px; }
        .cb-typing span {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--color-text-mute);
          animation: typing 1s infinite ease-in-out;
        }
        .cb-typing span:nth-child(2) { animation-delay: 0.15s; }
        .cb-typing span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.4; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }

        .cb-recs { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
        .cb-rec {
          display: flex; align-items: center; gap: 10px;
          padding: 8px;
          background: var(--color-bg-alt);
          border-radius: var(--radius-md);
          color: inherit;
          transition: background var(--t-fast);
        }
        .cb-rec:hover { background: var(--color-primary-bg); }
        .cb-rec img { width: 42px; height: 56px; object-fit: cover; border-radius: 6px; background: var(--color-bg); }
        .cb-rec strong { display: block; font-size: 13px; color: var(--color-text); }
        .cb-rec span { font-size: 12px; color: var(--color-primary); font-weight: 600; }

        .cb-quick {
          padding: 8px 16px;
          display: flex; flex-wrap: wrap; gap: 6px;
          background: var(--color-bg);
          border-top: 1px solid var(--color-border-soft);
        }
        .cb-quick-pill {
          padding: 6px 12px;
          font-size: 12.5px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 99px;
          color: var(--color-text-soft);
          transition: all var(--t-fast);
        }
        .cb-quick-pill:hover { background: var(--color-primary-bg); color: var(--color-primary); border-color: var(--color-primary-soft); }

        .cb-input {
          display: flex; gap: 8px;
          padding: 12px;
          background: var(--color-surface);
          border-top: 1px solid var(--color-border-soft);
        }
        .cb-input input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 99px;
          background: var(--color-bg-alt);
          border: 1px solid transparent;
          outline: none;
          font-size: 14px;
          transition: border-color var(--t-fast), box-shadow var(--t-fast);
        }
        .cb-input input:focus {
          border-color: var(--color-primary-soft);
          background: var(--color-surface);
          box-shadow: 0 0 0 4px rgba(127,181,160,0.18);
        }
        .cb-send {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: var(--color-primary);
          color: #fff;
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background var(--t-fast);
        }
        .cb-send:hover:not(:disabled) { background: #406755; }
        .cb-send:disabled { background: var(--color-border); cursor: not-allowed; }

        @media (max-width: 540px) {
          .cb-panel {
            right: 12px; left: 12px;
            width: auto;
            bottom: 82px;
            height: calc(100vh - 110px);
          }
          .cb-fab { right: 16px; bottom: 16px; }
        }
      `}</style>
    </>
  );
};

export default ChatbotWidget;
