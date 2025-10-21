import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/AdminContext';

const AdminChatPanel = ({ backendUrl, aToken }) => {
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

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
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
          { role: 'assistant', content: data.response || 'Sorry, I encountered an error processing your request.' },
        ]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to get response');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered a connection error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
      // Focus back on input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const suggestedQuestions = [
    {
      icon: '📊',
      text: 'Show total statistics',
    },
    {
      icon: '👨‍⚕️',
      text: 'Which doctors have most patients?',
    },
    {
      icon: '💰',
      text: 'Show doctors with fees under 500',
    },
    {
      icon: '📅',
      text: 'Show recent appointments',
    },
    {
      icon: '❌',
      text: 'How many cancelled appointments?',
    },
    {
      icon: '✅',
      text: 'List available doctors',
    },
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
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>🤖</span>
                <span>Database Chat Assistant</span>
              </h2>
              <p className="text-blue-100 text-sm mt-1">Ask me anything about your data in natural language</p>
            </div>
            <button
              onClick={clearChat}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Clear Chat
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="h-[500px] overflow-y-auto p-6 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 text-blue-600">
                    <span className="text-xl">🤖</span>
                    <span className="font-semibold text-sm">Assistant</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm p-4 shadow-md">
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                  <span className="text-xl">🤖</span>
                  <span className="font-semibold text-sm">Assistant</span>
                </div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 2 && (
          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3 font-medium">💡 SUGGESTED QUESTIONS</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question.text)}
                  className="text-left bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-700 px-4 py-3 rounded-xl transition-all text-sm font-medium border border-blue-200 hover:border-blue-300 hover:shadow-md"
                >
                  <span className="mr-2">{question.icon}</span>
                  {question.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={sendMessage} className="p-6 bg-white border-t border-gray-200">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your data..."
              className="flex-1 border-2 border-gray-300 focus:border-blue-500 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-sm"
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg disabled:hover:shadow-none text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Send</span>
                  <span>→</span>
                </span>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            💬 Try asking about doctors, appointments, patients, or statistics
          </p>
        </form>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="text-2xl mb-2">🎯</div>
          <h3 className="font-bold text-gray-800 text-sm mb-1">Smart Queries</h3>
          <p className="text-xs text-gray-600">Ask questions in plain English and get instant insights</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="text-2xl mb-2">⚡</div>
          <h3 className="font-bold text-gray-800 text-sm mb-1">Real-time Data</h3>
          <p className="text-xs text-gray-600">Get live data directly from your MongoDB database</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="text-2xl mb-2">🔒</div>
          <h3 className="font-bold text-gray-800 text-sm mb-1">Secure & Safe</h3>
          <p className="text-xs text-gray-600">All queries are validated and executed securely</p>
        </div>
      </div>
    </div>
  );
};

export default AdminChatPanel;