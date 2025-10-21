import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminChatPanel = ({ backendUrl, aToken }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hello! I\'m your database assistant. Ask me anything about your medical appointment system!\n\n💡 Try asking:\n• "Show me total statistics"\n• "Which doctors have the most patients?"\n• "List doctors with fees under 500"\n• "How many appointments were cancelled?"\n• "Show me all cardiologists"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/chat`,
        { message: userMessage },
        { headers: { aToken } }
      );

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response },
        ]);
      } else {
        toast.error(data.message);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response || 'Sorry, I encountered an error.' },
        ]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to get response');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, connection error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const suggestedQuestions = [
    { icon: '📊', text: 'Show total statistics' },
    { icon: '👨‍⚕️', text: 'Which doctors have most patients?' },
    { icon: '💰', text: 'Show doctors with fees under 500' },
    { icon: '📅', text: 'Show recent appointments' },
    { icon: '❌', text: 'How many cancelled appointments?' },
    { icon: '✅', text: 'List available doctors' },
  ];

  const handleSuggestedQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: '👋 Chat cleared! What would you like to know?',
      },
    ]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary rounded-circle position-fixed shadow-lg"
        style={{
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          zIndex: 1040,
          transition: 'all 0.3s ease',
        }}
        title="Open Chat Assistant"
      >
        {isOpen ? (
          <i className="bi bi-x-lg fs-4"></i>
        ) : (
          <i className="bi bi-chat-dots-fill fs-4"></i>
        )}
      </button>

      {/* Chat Sidebar */}
      <div
        className={`position-fixed top-0 end-0 h-100 bg-white shadow-lg ${isOpen ? 'translate-x-0' : 'translate-x-100'}`}
        style={{
          width: '450px',
          maxWidth: '90vw',
          zIndex: 1050,
          transition: 'transform 0.3s ease-in-out',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-robot me-2"></i>
              Chat Assistant
            </h5>
            <small className="text-white-50">Ask anything about your data</small>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={clearChat}
              className="btn btn-sm btn-light"
              title="Clear chat"
            >
              <i className="bi bi-trash"></i>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-sm btn-light"
              title="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div
          className="overflow-auto p-3 bg-light"
          style={{ height: 'calc(100vh - 200px)' }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-3 d-flex ${
                message.role === 'user' ? 'justify-content-end' : 'justify-content-start'
              }`}
            >
              <div
                className={`rounded-3 p-3 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-white border'
                }`}
                style={{ maxWidth: '85%' }}
              >
                {message.role === 'assistant' && (
                  <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                    <i className="bi bi-robot"></i>
                    <small className="fw-bold">Assistant</small>
                  </div>
                )}
                <small style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                  {message.content}
                </small>
              </div>
            </div>
          ))}

          {loading && (
            <div className="mb-3 d-flex justify-content-start">
              <div className="bg-white border rounded-3 p-3 shadow-sm">
                <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                  <i className="bi bi-robot"></i>
                  <small className="fw-bold">Assistant</small>
                </div>
                <div className="d-flex gap-2">
                  <div className="spinner-grow spinner-grow-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-grow spinner-grow-sm text-primary" role="status" style={{ animationDelay: '0.2s' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-grow spinner-grow-sm text-primary" role="status" style={{ animationDelay: '0.4s' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 2 && (
          <div className="border-top p-3 bg-white">
            <small className="text-muted fw-bold d-block mb-2">💡 SUGGESTED QUESTIONS</small>
            <div className="d-flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question.text)}
                  className="btn btn-sm btn-outline-primary"
                  style={{ fontSize: '0.75rem' }}
                >
                  <span className="me-1">{question.icon}</span>
                  {question.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="border-top p-3 bg-white position-absolute bottom-0 w-100">
          <form onSubmit={sendMessage}>
            <div className="input-group">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="form-control"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn btn-primary"
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Sending...</span>
                  </span>
                ) : (
                  <i className="bi bi-send-fill"></i>
                )}
              </button>
            </div>
            <small className="text-muted d-block mt-2 text-center">
              💬 Ask about doctors, appointments, or statistics
            </small>
          </form>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
          style={{ 
            opacity: 0.5, 
            zIndex: 1049,
            transition: 'opacity 0.3s ease' 
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .translate-x-0 {
          transform: translateX(0) !important;
        }
        .translate-x-100 {
          transform: translateX(100%) !important;
        }
        
        /* Scrollbar styling */
        .overflow-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .overflow-auto::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </>
  );
};

export default AdminChatPanel;