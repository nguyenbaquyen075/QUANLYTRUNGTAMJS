import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'AI',
      text: 'Xin chào! Em là trợ lý AI. Em có thể tư vấn khóa học, giải đáp thắc mắc tuyển sinh hoặc gợi ý lộ trình học tập cho bạn. Bạn đang quan tâm môn nào?'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const text = messageText.trim();
    if (!text) return;

    // Add user message
    const newMsg = { id: Date.now(), sender: 'USER', text };
    setMessages((prev) => [...prev, newMsg]);
    setMessageText('');
    setIsTyping(true);

    try {
      const sessionToken = localStorage.getItem('ai_session_token') || '';
      const response = await api.post('/api/v1/ai/chat/message', {
        sessionToken,
        message: text
      });

      setIsTyping(false);

      if (response.data && response.data.success) {
        if (response.data.session_token) {
          localStorage.setItem('ai_session_token', response.data.session_token);
        }

        // Add AI message
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'AI',
          text: response.data.reply,
          suggestedCourses: response.data.suggested_courses || []
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      const errMsg = {
        id: Date.now() + 2,
        sender: 'AI',
        text: 'Rất tiếc, hệ thống AI đang bận. Vui lòng thử lại sau.'
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  return (
    <>
      {/* Chat bubble icon */}
      <div
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 cursor-pointer transition-all duration-300 z-[999] hover:bg-primary-hover"
        title="Trò chuyện với AI"
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-robot'} text-xl`}></i>
      </div>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform z-[999] ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-brain text-lg"></i>
            <h3 className="font-bold text-sm">Trợ lý AI Tư vấn</h3>
          </div>
          <button onClick={toggleChat} className="text-white/80 hover:text-white transition-all">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Messages list */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === 'USER' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div
                className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  msg.sender === 'USER'
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />

              {/* Suggested courses links */}
              {msg.suggestedCourses && msg.suggestedCourses.length > 0 && (
                <div className="flex flex-col gap-2 mt-2 w-full">
                  {msg.suggestedCourses.map((c, i) => (
                    <a
                      key={i}
                      href="/Auth/Login"
                      className="bg-white hover:bg-slate-50 text-primary border border-primary/20 hover:border-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-all"
                    >
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-circle-play text-primary"></i> {c.title}
                      </span>
                      <span className="text-emerald-600">{(c.price || 0).toLocaleString()}đ</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex flex-col max-w-[85%] mr-auto items-start">
              <div className="p-3 rounded-2xl text-[13px] bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-1">
                <i className="fa-solid fa-ellipsis fa-bounce"></i>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2 shrink-0 bg-white">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 px-4 py-2 border border-slate-200 rounded-full text-xs outline-none focus:border-primary transition-all bg-slate-50 focus:bg-white"
          />
          <button
            type="submit"
            className="bg-primary text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-hover active:scale-95 transition-all"
          >
            <i className="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </form>
      </div>
    </>
  );
}
