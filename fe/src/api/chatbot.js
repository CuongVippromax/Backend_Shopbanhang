import apiClient from './client';

export const sendChatMessage = (message, sessionId = null) => {
  return apiClient.post('/chatbot', {
    message,
    sessionId: sessionId || generateSessionId()
  });
};

export const checkChatbotHealth = async () => {
  try {
    const res = await fetch('/api/v1/chatbot/health');
    return res.json();
  } catch (error) {
    console.error('Chatbot health check failed:', error);
    return { status: 'error', message: 'Service unavailable' };
  }
};

function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}
