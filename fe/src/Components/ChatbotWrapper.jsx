import React, { useState } from 'react';
import Chatbot from './Chatbot';
import { ChatbotToggle } from './Chatbot';

const ChatbotWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <ChatbotToggle onClick={handleToggle} isOpen={isOpen} />
      {isOpen && <Chatbot onClose={handleClose} />}
    </>
  );
};

export default ChatbotWrapper;
